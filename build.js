#!/usr/bin/env node
/*
 * Silk Route Mobility – build bez závislostí.
 *
 *   node build.js          vygeneruje dist/
 *   node build.js --serve  vygeneruje dist/ a spustí náhled na http://localhost:8080
 *
 * Šablony (src/templates) jsou HTML soubory, ve kterých fungují výrazy ${...}
 * (JavaScript template literal). K dispozici je kontext z funkce makeContext().
 */
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const ARGS = new Set(process.argv.slice(2));
// --base=/Cesta: web poběží v podsložce (např. GitHub Pages: /Silkroutemobility). Ostrý web bez --base.
const BASE = (process.argv.find((a) => a.startsWith('--base=')) || '').slice(7).replace(/\/$/, '');
// --staging: testovací nasazení (noindex, robots zakáže vše); --keep-comments: ponechat HTML komentáře
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(SRC, p), 'utf8'));
const site = readJSON('data/site.json');
const images = Object.fromEntries(readJSON('data/images.json').images.map((i) => [i.id, i]));
const LANGS = site.site.langs;
const DEFAULT_LANG = site.site.defaultLang;
const i18n = Object.fromEntries(LANGS.map((l) => [l, readJSON(`i18n/${l}.json`)]));

/* ------------------------------------------------------------------ pages */

// key = klíč v i18n.pages, file = výstupní soubor, tpl = šablona
const PAGES = [
  { key: 'index',   file: 'index.html',                   tpl: 'index.html',   sitemap: 1.0 },
  { key: 'aito',     file: 'aito.html',                     tpl: 'brand.html',   sitemap: 0.9, brand: 'aito' },
  { key: 'dfsk',    file: 'dfsk.html',                    tpl: 'brand.html',   sitemap: 0.9, brand: 'dfsk' },
  { key: 'kontakt', file: 'kontakt.html',                 tpl: 'kontakt.html', sitemap: 0.8 },
  { key: 'privacy', file: 'ochrana-osobnich-udaju.html',  tpl: 'privacy.html', sitemap: 0.2 },
  { key: '404',     file: '404.html',                     tpl: '404.html',     sitemap: 0, noindex: true },
];
const pageByKey = Object.fromEntries(PAGES.map((p) => [p.key, p]));

/* ---------------------------------------------------------------- helpers */

const hash = (buf) => crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);

function rmrf(p) { fs.rmSync(p, { recursive: true, force: true }); }
function mkdirp(p) { fs.mkdirSync(p, { recursive: true }); }
// Soubory vytvořené tímto buildem. Na konci se z dist/ smaže vše ostatní
// (staré verze s hashem, konfliktní kopie z iCloudu typu „index 2.html“ apod.).
const produced = new Set();
// Při --base přepíše kořenové cesty (/assets/…, /sk/, /) na /<base>/…
function withBase(rel, content) {
  if (!BASE || typeof content !== 'string') return content;
  const ext = path.extname(rel);
  if (ext === '.html') {
    content = content
      .replace(/(\s(?:href|src|poster|action|data-[a-z-]+))="\/(?!\/)/g, `$1="${BASE}/`)
      .replace(/(srcset="[^"]*)/g, (m) => m.replace(/(^srcset="|,\s*)\/(?!\/)/g, `$1${BASE}/`));
  } else if (ext === '.css') {
    content = content.replace(/url\(\/(?!\/)/g, `url(${BASE}/`);
  } else if (ext === '.webmanifest') {
    content = content.replace(/("(?:src|start_url)":\s*")\/(?!\/)/g, `$1${BASE}/`);
  }
  return content;
}
function write(rel, content) {
  content = withBase(rel, Buffer.isBuffer(content) && /\.(html|css|webmanifest)$/.test(rel) ? content.toString() : content);
  const out = path.join(DIST, rel);
  mkdirp(path.dirname(out));
  // nepřepisovat beze změny – méně zápisů = méně konfliktů při synchronizaci (iCloud, Dropbox)
  if (fs.existsSync(out)) {
    const old = fs.readFileSync(out);
    if (Buffer.isBuffer(content) ? old.equals(content) : old.toString() === content) { produced.add(out); return; }
  }
  fs.writeFileSync(out, content);
  produced.add(out);
}
function cleanStale(dir = DIST) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      cleanStale(p);
      if (!fs.readdirSync(p).length) fs.rmdirSync(p);
    } else if (!produced.has(p)) {
      fs.unlinkSync(p);
    }
  }
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const e = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

// Pevná mezera po jednopísmenných předložkách a spojkách (cs, sk).
function typo(str, lang) {
  if (lang === 'en' || typeof str !== 'string') return str;
  return str.replace(/(^|[\s(„])([vkszouaiVKSZOUAI])\s+/g, '$1$2 ');
}
function deepTypo(obj, lang) {
  if (Array.isArray(obj)) return obj.map((v) => deepTypo(v, lang));
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, deepTypo(v, lang)]));
  }
  return typo(obj, lang);
}

/* -------------------------------------------------------------- templates */

const tplCache = new Map();
function compile(file) {
  if (tplCache.has(file)) return tplCache.get(file);
  const src = fs.readFileSync(path.join(SRC, 'templates', file), 'utf8');
  // eslint-disable-next-line no-new-func
  const fn = new Function('ctx', `with (ctx) { return \`${src}\`; }`);
  tplCache.set(file, fn);
  return fn;
}
function render(file, ctx) {
  try { return compile(file)(ctx); }
  catch (err) { err.message = `[${file}] ${err.message}`; throw err; }
}

/* ------------------------------------------------------------------ assets */

const manifest = {}; // 'css/main.css' -> '/assets/css/main.1a2b3c4d.css'

function emitHashed(logical, content, ext) {
  const base = path.basename(logical, ext);
  const dir = path.dirname(logical);
  const name = `${base}.${hash(content)}${ext}`;
  const rel = path.posix.join('assets', dir, name);
  write(rel, content);
  manifest[logical] = '/' + rel;
  return manifest[logical];
}

function buildFonts() {
  const dir = path.join(SRC, 'assets/fonts');
  for (const f of fs.readdirSync(dir)) {
    const buf = fs.readFileSync(path.join(dir, f));
    if (f.endsWith('.woff2')) emitHashed(`fonts/${f}`, buf, '.woff2');
    else write(`assets/fonts/${f}`, buf); // licence
  }
}

function buildVendor() {
  const files = {
    'vendor/gsap.min.js': 'vendor/gsap/gsap.min.js',
    'vendor/ScrollTrigger.min.js': 'vendor/gsap/ScrollTrigger.min.js',
    'vendor/SplitText.min.js': 'vendor/gsap/SplitText.min.js',
    'vendor/lenis.min.js': 'vendor/lenis/lenis.min.js',
  };
  for (const [logical, src] of Object.entries(files)) {
    const p = path.join(SRC, src);
    if (fs.existsSync(p)) emitHashed(logical, fs.readFileSync(p), '.js');
  }
}

const CSS_ORDER = ['fonts.css', 'base.css', 'layout.css', 'components.css', 'sections.css', 'animations.css'];

function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\s*([{};,>])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/\n+/g, ' ')
    .trim();
}

function buildCSS() {
  let css = CSS_ORDER
    .map((f) => path.join(SRC, 'css', f))
    .filter((p) => fs.existsSync(p))
    .map((p) => fs.readFileSync(p, 'utf8'))
    .join('\n');
  // url(../assets/fonts/x.woff2) -> hashovaná cesta
  css = css.replace(/url\((['"]?)(?:\.\.\/)?(?:assets\/)?fonts\/([^'")]+)\1\)/g, (m, q, f) => {
    const target = manifest[`fonts/${f}`];
    if (!target) throw new Error(`CSS odkazuje na neexistující font ${f}`);
    return `url(${target})`;
  });
  emitHashed('css/main.css', minifyCSS(css), '.css');
}

// JS: moduly se spojí do jednoho souboru v daném pořadí (bez bundleru).
const JS_ORDER = [
  'modules/env.js', 'modules/header.js', 'modules/menu.js', 'modules/transitions.js',
  'modules/lenis.js', 'modules/preloader.js', 'modules/magnetic.js',
  'modules/hero.js', 'modules/reveal.js',
  'modules/sections.js', 'modules/gallery.js', 'modules/counter.js', 'modules/footer.js',
  'main.js',
];

function buildJS() {
  const parts = JS_ORDER
    .map((f) => path.join(SRC, 'js', f))
    .filter((p) => fs.existsSync(p))
    .map((p) => `/* ${path.relative(SRC, p)} */\n${fs.readFileSync(p, 'utf8')}`);
  let js = `(function(){'use strict';\nvar SRM = window.SRM = window.SRM || {};\n${parts.join('\n')}\n})();\n`;
  // lehká minifikace: celořádkové komentáře a odsazení (řetězce ani kód se nemění)
  js = js.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('//') && !/^\/\*.*\*\/$/.test(l)).join('\n');
  emitHashed('js/main.js', js, '.js');
}

function copyDir(from, to, filter = () => true) {
  if (!fs.existsSync(from)) return;
  for (const ent of fs.readdirSync(from, { withFileTypes: true })) {
    if (ent.name.startsWith('.') || / \d+(\.[a-z0-9]+)?$/i.test(ent.name)) continue; // skryté soubory a konfliktní kopie „x 2.jpg“
    const a = path.join(from, ent.name);
    const b = path.join(to, ent.name);
    if (ent.isDirectory()) copyDir(a, b, filter);
    else if (filter(ent.name)) write(path.relative(DIST, b), fs.readFileSync(a));
  }
}

function buildStatic() {
  // obrázky, videa a SVG se nehashují – majitel je vyměňuje pod stejným názvem
  copyDir(path.join(SRC, 'assets/img'), path.join(DIST, 'assets/img'));
  copyDir(path.join(SRC, 'assets/video'), path.join(DIST, 'assets/video'));
  copyDir(path.join(SRC, 'assets/svg'), path.join(DIST, 'assets/svg'));
  // loga a 3D symbol Silkroute Mobility z brand balíčku (SVG se nemění, jen vkládají)
  copyDir(path.join(SRC, 'assets/brand'), path.join(DIST, 'assets/brand'));
  // soubory pro kořen webu (favicony, manifest, .htaccess)
  copyDir(path.join(SRC, 'root'), DIST);
  const ht = path.join(SRC, 'root/.htaccess');
  // .htaccess se zapisuje až po stránkách (potřebuje hashe inline skriptů pro CSP) – viz buildHtaccess()
}

/* ------------------------------------------------------------- formatting */

const NBSP = ' ';
const NNBSP = ' '; // oddělovač tisíců (cs/sk)

function formatNumber(n, lang) {
  const s = String(Math.round(n));
  const sep = lang === 'en' ? ',' : NNBSP;
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

// Ceny: CZ = Kč, SK = €, EN = obojí. Hodnota 0 = cena zatím není známá. Nic se nepřepočítává.
// Čísla jsou ve <span data-num>, aby je šlo animovat (načítání čísla).
function priceParts(model, lang) {
  const t = i18n[lang].common;
  const czk = model.priceFrom || 0;
  const eur = model.priceFromEur || 0;
  const n = (v) => `<span class="num" data-num="${v}">${formatNumber(v, lang)}</span>`;
  if (lang === 'cs') return czk ? [`${n(czk)}${NBSP}Kč`] : [];
  if (lang === 'sk') return eur ? [`${n(eur)}${NBSP}€`] : [];
  const parts = [];
  if (czk) parts.push(`CZK${NBSP}${n(czk)}`);
  if (eur) parts.push(`EUR${NBSP}${n(eur)}`);
  return parts;
}
function formatPrice(model, lang) {
  const t = i18n[lang].common;
  const parts = priceParts(model, lang);
  if (!parts.length) return `<span class="price__soon">${t.priceSoon}</span>`;
  return `${t.priceFrom} ${parts.join(' / ')}`;
}
function hasPrice(model, lang) { return priceParts(model, lang).length > 0; }

function plural(n, forms, lang) {
  if (lang === 'en') return n === 1 ? forms.one : forms.many;
  if (n === 1) return forms.one;
  if (n >= 2 && n <= 4) return forms.few;
  return forms.many;
}

const DAY_ORDER = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const SCHEMA_DAYS = { Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday', Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday' };

function formatTime(t, lang) {
  const [h, m] = t.split(':');
  return lang === 'en' ? `${h}:${m}` : `${Number(h)}:${m}`;
}

// [{days:[Mo..Fr], opens, closes}] -> [{days:'Po–Pá', time:'9:00–18:00'}]
function formatHours(key, lang) {
  const t = i18n[lang].common;
  return site.company.hours[key].map((row) => {
    const idx = row.days.map((d) => DAY_ORDER.indexOf(d)).sort((a, b) => a - b);
    const contiguous = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
    const days = idx.length > 1 && contiguous
      ? `${t.days[DAY_ORDER[idx[0]]]}–${t.days[DAY_ORDER[idx[idx.length - 1]]]}`
      : idx.map((i) => t.days[DAY_ORDER[i]]).join(', ');
    return { days, time: `${formatTime(row.opens, lang)}–${formatTime(row.closes, lang)}` };
  });
}

function telHref(phone) { return 'tel:' + phone.replace(/[^\d+]/g, ''); }

function formatCoord(lat, lng) {
  const la = `${Math.abs(lat).toFixed(2)}°${NBSP}${lat >= 0 ? 'N' : 'S'}`;
  const lo = `${Math.abs(lng).toFixed(2)}°${NBSP}${lng >= 0 ? 'E' : 'W'}`;
  return `${la} ${lo}`;
}

function specValue(model, key, lang) {
  const t = i18n[lang];
  if (key === 'powertrain') return t.powertrain[model.powertrain] ?? model.powertrain;
  let v = model.specs?.[key];
  if (v && typeof v === 'object') v = v[lang] ?? v.cs;
  if (v === undefined || v === null || v === '' || v === 'TODO') return null;
  if (key === 'warranty' && typeof v === 'number') return `${v}${NBSP}${plural(v, t.common.years, lang)}`;
  return String(v);
}

/* ------------------------------------------------------------------ images */

const IMG_EXT = ['avif', 'webp', 'jpg', 'jpeg', 'png'];
const MIME = { avif: 'image/avif', webp: 'image/webp', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };

function findImageFiles(file) {
  const dir = path.join(SRC, 'assets/img');
  if (!fs.existsSync(dir)) return [];
  const safe = file.replace(/[^a-z0-9_-]/gi, '');
  const re = new RegExp('^' + safe + '(?:-(\\d+))?\\.(' + IMG_EXT.join('|') + ')$', 'i');
  return fs.readdirSync(dir)
    .map((f) => { const m = f.match(re); return m && { f, w: m[1] ? Number(m[1]) : null, ext: m[2].toLowerCase() }; })
    .filter(Boolean);
}

/**
 * Vrátí <picture>, pokud obrázek existuje, jinak zástupnou plochu se stejným poměrem stran.
 * opts: { alt, sizes, eager, cls, label }
 */
function img(id, opts = {}) {
  const meta = images[id];
  if (!meta) throw new Error(`Neznámý obrázek: ${id}`);
  const { alt = '', sizes = '100vw', eager = false, cls = '' } = opts;
  const files = findImageFiles(meta.file);
  const ratio = `${meta.w} / ${meta.h}`;

  if (!files.length) {
    const label = opts.label ?? meta.label;
    const a11y = alt ? `role="img" aria-label="${e(alt)}"` : 'aria-hidden="true"';
    return `<div class="ph${meta.cutout ? ' ph--cutout' : ''}${cls ? ' ' + cls : ''}" style="aspect-ratio:${ratio}" ${a11y} data-img="${e(meta.file)}">` +
      `<span class="ph__label" aria-hidden="true">${e(label)}</span></div>`;
  }

  const byExt = {};
  for (const f of files) (byExt[f.ext] ||= []).push(f);
  const srcset = (list) => list
    .map((f) => `/assets/img/${f.f} ${f.w || meta.w}w`)
    .join(', ');
  const fallbackExt = byExt.jpg ? 'jpg' : byExt.jpeg ? 'jpeg' : byExt.png ? 'png' : (byExt.webp ? 'webp' : 'avif');
  const fallback = byExt[fallbackExt].find((f) => !f.w) || byExt[fallbackExt][0];
  const sources = ['avif', 'webp']
    .filter((x) => byExt[x] && x !== fallbackExt)
    .map((x) => `<source type="${MIME[x]}" srcset="${srcset(byExt[x])}" sizes="${sizes}">`)
    .join('');
  const loading = eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
  return `<picture class="pic${cls ? ' ' + cls : ''}">${sources}` +
    `<img src="/assets/img/${fallback.f}" srcset="${srcset(byExt[fallbackExt])}" sizes="${sizes}" width="${meta.w}" height="${meta.h}" alt="${e(alt)}" ${loading}></picture>`;
}

/* ------------------------------------------------------------------- video */

// Vrátí { webm, mp4 } podle souborů v src/assets/video (nebo null).
function findVideo(name) {
  const dir = path.join(SRC, 'assets/video');
  const out = {};
  for (const ext of ['webm', 'mp4']) {
    if (fs.existsSync(path.join(dir, `${name}.${ext}`))) out[ext] = `/assets/video/${name}.${ext}`;
  }
  return Object.keys(out).length ? out : null;
}

/* ------------------------------------------------------------------ schema */

function schemaJSON(lang, page) {
  const c = site.company;
  const t = i18n[lang];
  const base = site.site.url;
  const spec = (key) => c.hours[key].map((h) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.days.map((d) => SCHEMA_DAYS[d]),
    opens: h.opens,
    closes: h.closes,
  }));
  const sameAs = Object.values(c.social).filter((u) => /^https?:/.test(u));
  const address = {
    '@type': 'PostalAddress',
    streetAddress: c.address.street,
    addressLocality: c.address.city,
    postalCode: c.address.zip,
    addressCountry: c.address.country,
  };
  const areaServed = site.site.areaServed.map((code) => ({ '@type': 'Country', name: code }));
  const graph = [
    {
      '@type': 'Organization',
      '@id': `${base}/#organization`,
      name: c.name,
      legalName: c.name,
      url: base + '/',
      logo: `${base}/android-chrome-512x512.png`,
      email: c.email,
      telephone: c.phone,
      address,
      areaServed,
      identifier: { '@type': 'PropertyValue', propertyID: 'IČO', value: c.ico },
      ...(sameAs.length ? { sameAs } : {}),
    },
    {
      '@type': 'AutoDealer',
      '@id': `${base}/#dealer`,
      name: t.meta.siteName,
      description: t.schema.description,
      url: base + urlFor('index', lang),
      image: `${base}/og-image.png`,
      telephone: c.phone,
      email: c.email,
      address,
      geo: { '@type': 'GeoCoordinates', latitude: c.geo.lat, longitude: c.geo.lng },
      openingHoursSpecification: spec('showroom'),
      areaServed,
      brand: [{ '@type': 'Brand', name: 'AITO' }, { '@type': 'Brand', name: 'DFSK' }],
      parentOrganization: { '@id': `${base}/#organization` },
      department: [{
        '@type': 'AutoRepair',
        name: `${t.meta.siteName} – ${t.common.hoursService}`,
        telephone: c.phoneService,
        email: c.emailService,
        address,
        openingHoursSpecification: spec('service'),
      }],
    },
  ];
  if (page && page.brand) {
    for (const m of site.models.filter((x) => x.brand === page.brand)) graph.push(carSchema(m, lang));
  }
  if (page && page.key === 'index') {
    graph.push({
      '@type': 'ItemList',
      name: t.meta.siteName + ' – AITO, DFSK',
      itemListElement: site.models.map((m, i) => ({
        '@type': 'ListItem', position: i + 1, name: m.name, url: base + urlFor(m.brand, lang, m.slug),
      })),
    });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

// Schema.org Car pro model. Číselné hodnoty se čtou z textových údajů (anglická verze), co nejde přečíst, vynechá se.
const FUEL = { petrol: 'Gasoline', phev: 'Plug-in hybrid (gasoline/electric)', erev: 'Electric (range extender)' };
function carSchema(m, lang) {
  const base = site.site.url;
  const t = i18n[lang];
  const en = (key) => specValue(m, key, 'en');
  const loc = (key) => specValue(m, key, lang);
  const kw = (en('power') || '').match(/(\d+(?:\.\d+)?)\s*kW/);
  const seats = (en('seats') || '').match(/\d+/g);
  const imgMeta = images['model-' + m.slug];
  const car = {
    '@type': 'Car',
    '@id': `${base}${urlFor(m.brand, lang, m.slug)}`,
    name: m.name,
    brand: { '@type': 'Brand', name: m.brand.toUpperCase() },
    model: m.name.replace(/^(AITO|DFSK)\s+/, ''),
    url: base + urlFor(m.brand, lang, m.slug),
    description: t.brand[m.brand].models[m.slug],
    itemCondition: 'https://schema.org/NewCondition',
    ...(imgMeta ? { image: `${base}/assets/img/${imgMeta.file}.${imgMeta.cutout ? 'png' : 'jpg'}` } : {}),
    ...(FUEL[m.powertrain] ? { fuelType: FUEL[m.powertrain] } : {}),
    ...(kw ? { vehicleEngine: { '@type': 'EngineSpecification', enginePower: { '@type': 'QuantitativeValue', value: Number(kw[1]), unitCode: 'KWT' } } } : {}),
    ...(loc('transmission') ? { vehicleTransmission: loc('transmission') } : {}),
    ...(loc('drive') ? { driveWheelConfiguration: loc('drive') } : {}),
    ...(seats ? { seatingCapacity: seats.length > 1
      ? { '@type': 'QuantitativeValue', minValue: Number(seats[0]), maxValue: Number(seats[seats.length - 1]) }
      : Number(seats[0]) } : {}),
  };
  const offers = [];
  const seller = { '@id': `${base}/#dealer` };
  if (m.priceFrom && (lang === 'cs' || lang === 'en')) offers.push({ '@type': 'Offer', price: m.priceFrom, priceCurrency: 'CZK', eligibleRegion: { '@type': 'Country', name: 'CZ' }, seller, itemCondition: 'https://schema.org/NewCondition' });
  if (m.priceFromEur && (lang === 'sk' || lang === 'en')) offers.push({ '@type': 'Offer', price: m.priceFromEur, priceCurrency: 'EUR', eligibleRegion: { '@type': 'Country', name: 'SK' }, seller, itemCondition: 'https://schema.org/NewCondition' });
  if (offers.length) car.offers = offers.length === 1 ? offers[0] : offers;
  return car;
}

/* ----------------------------------------------------------------- context */

function urlFor(pageKey, lang, hashPart = '') {
  const page = pageByKey[pageKey];
  const prefix = lang === DEFAULT_LANG ? '/' : `/${lang}/`;
  const file = page.file === 'index.html' ? '' : page.file;
  return prefix + file + (hashPart ? '#' + hashPart : '');
}

function makeContext(page, lang) {
  const t = deepTypo(i18n[lang], lang);
  const c = site.company;
  const models = site.models;
  const addressLine = `${c.address.street}, ${c.address.zip} ${c.address.city}`;
  const geo = c.geo;

  const ctx = {
    site, company: c, models, images,
    t, lang, page, LANGS, i18n,
    year: new Date().getFullYear(),
    e,
    addressLine,
    asset: (logical) => {
      if (!manifest[logical]) throw new Error(`Asset ${logical} neexistuje`);
      return manifest[logical];
    },
    url: (key, hashPart, l = lang) => urlFor(key, l, hashPart),
    absUrl: (key, l = lang) => site.site.url + urlFor(key, l),
    price: (m) => formatPrice(m, lang),
    hasPrice: (m) => hasPrice(m, lang),
    video: findVideo,
    schema: () => schemaJSON(lang, page),
    spec: (m, key) => specValue(m, key, lang),
    hasSpec: (m, key) => m.specs && key in m.specs,
    hours: (key) => formatHours(key, lang),
    tel: telHref,
    formatCoord,
    num: (n) => formatNumber(n, lang),
    img: (id, opts) => img(id, opts),
    imgMeta: (id) => images[id],
    mapsGoogle: `https://www.google.com/maps/search/?api=1&query=${geo.lat},${geo.lng}`,
    mapsMapy: `https://mapy.cz/fnc/v1/showmap?mapset=basic&center=${geo.lng},${geo.lat}&zoom=16&marker=true`,
    pad: (n) => String(n).padStart(2, '0'),
    fill: (str, vars) => String(str).replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m),
    include: (file, extra = {}) => render(`partials/${file}`, Object.assign(Object.create(ctx), extra)),
    modelsOf: (brand) => models.filter((m) => m.brand === brand),
  };
  return ctx;
}

/* ------------------------------------------------------------------- build */

const inlineHashes = new Set();
function csp() {
  return [
    "default-src 'self'",
    `script-src 'self' ${[...inlineHashes].join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "media-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "frame-ancestors 'self'",
    'upgrade-insecure-requests',
  ].join('; ');
}

function buildPages() {
  const urls = [];
  for (const lang of LANGS) {
    for (const page of PAGES) {
      const ctx = makeContext(page, lang);
      ctx.staging = ARGS.has('--staging');
      ctx.body = render(`pages/${page.tpl}`, ctx);
      let html = render('layout.html', ctx);
      if (!ARGS.has('--keep-comments')) html = html.replace(/<!--[\s\S]*?-->/g, '');
      html = html.replace(/\n\s*\n+/g, '\n');
      for (const m of html.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
        inlineHashes.add(`'sha256-${crypto.createHash('sha256').update(m[1]).digest('base64')}'`);
      }
      const rel = lang === DEFAULT_LANG ? page.file : `${lang}/${page.file}`;
      write(rel, html);
      if (page.sitemap) urls.push({ page, lang });
    }
  }
  return urls;
}

function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const entries = [];
  for (const page of PAGES.filter((p) => p.sitemap)) {
    for (const lang of LANGS) {
      const alts = LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${site.site.url}${urlFor(page.key, l)}"/>`)
        .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${site.site.url}${urlFor(page.key, DEFAULT_LANG)}"/>`);
      entries.push(`  <url>\n    <loc>${site.site.url}${urlFor(page.key, lang)}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${page.sitemap.toFixed(1)}</priority>\n${alts.join('\n')}\n  </url>`);
    }
  }
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`);
  write('robots.txt', ARGS.has('--staging')
    ? 'User-agent: *\nDisallow: /\n'
    : `${fs.readFileSync(path.join(SRC, 'data/robots.txt'), 'utf8').trim()}\n\nSitemap: ${site.site.url}/sitemap.xml\n`);
}

function buildHtaccess() {
  const ht = path.join(SRC, 'root/.htaccess');
  if (!fs.existsSync(ht)) return;
  write('.htaccess', fs.readFileSync(ht, 'utf8').replace('{{CSP}}', csp()));
}

/* -------------------------------------------------------------- llms.txt */

// Souhrn webu v Markdownu pro jazykové modely a AI agenty (návrh standardu llmstxt.org).
// /llms.txt = čeština, /sk/llms.txt, /en/llms.txt. Generuje se ze site.json a i18n.
const strip = (h) => String(h).replace(/<[^>]+>/g, '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
function buildLlms() {
  const L = {
    cs: { langs: 'Jazykové verze', contact: 'Kontakt', phone: 'Telefon – prodej', phoneS: 'Telefon – servis a pneuservis', email: 'E-mail', emailS: 'E-mail – servis', addr: 'Adresa', ico: 'IČO', hours: 'Otevírací doba', models: 'Modely a ceny', services: 'Služby', pages: 'Stránky', priceCz: 'Cena od (Česko)', priceSk: 'Cena od (Slovensko)', soon: 'zatím neuvedena', note: 'Ceny jsou orientační, včetně DPH.', specs: 'Údaje' },
    sk: { langs: 'Jazykové verzie', contact: 'Kontakt', phone: 'Telefón – predaj', phoneS: 'Telefón – servis a pneuservis', email: 'E-mail', emailS: 'E-mail – servis', addr: 'Adresa', ico: 'IČO', hours: 'Otváracie hodiny', models: 'Modely a ceny', services: 'Služby', pages: 'Stránky', priceCz: 'Cena od (Česko)', priceSk: 'Cena od (Slovensko)', soon: 'zatiaľ neuvedená', note: 'Ceny sú orientačné, vrátane DPH.', specs: 'Údaje' },
    en: { langs: 'Languages', contact: 'Contact', phone: 'Phone – sales', phoneS: 'Phone – service and tyres', email: 'Email', emailS: 'Email – service', addr: 'Address', ico: 'Company ID', hours: 'Opening hours', models: 'Models and prices', services: 'Services', pages: 'Pages', priceCz: 'Price from (Czech Republic)', priceSk: 'Price from (Slovakia)', soon: 'not yet published', note: 'Prices are indicative and include VAT.', specs: 'Specs' },
  };
  const c = site.company;
  const abs = (key, lang, h) => site.site.url + urlFor(key, lang, h);
  for (const lang of LANGS) {
    const t = i18n[lang];
    const l = L[lang];
    const hrs = (k) => formatHours(k, lang).map((h) => `${h.days} ${h.time}`).join(', ');
    const czk = (n) => n ? (lang === 'en' ? `CZK ${formatNumber(n, 'en')}` : `${formatNumber(n, lang).replace(/\u00A0/g, ' ')} Kč`) : l.soon;
    const eur = (n) => n ? (lang === 'en' ? `EUR ${formatNumber(n, 'en')}` : `${formatNumber(n, lang).replace(/\u00A0/g, ' ')} €`) : l.soon;
    const out = [];
    out.push(`# ${t.meta.siteName}`, '');
    out.push(`> ${strip(t.pages.index.description)}`, '');
    out.push(`${l.langs}: ` + LANGS.map((x) => `[${i18n[x].meta.name}](${site.site.url}${x === DEFAULT_LANG ? '' : '/' + x}/llms.txt)`).join(', '), '');
    out.push(`## ${l.contact}`, '');
    out.push(`- ${l.phone}: ${c.phone}`, `- ${l.phoneS}: ${c.phoneService}`, `- ${l.email}: ${c.email}`, `- ${l.emailS}: ${c.emailService}`);
    out.push(`- ${l.addr}: ${c.name}, ${c.address.street}, ${c.address.zip} ${c.address.city}, ${c.address.country}`);
    out.push(`- ${l.ico}: ${c.ico}`);
    out.push(`- ${l.hours} – ${strip(t.common.hoursShowroom)}: ${hrs('showroom')}`, `- ${l.hours} – ${strip(t.common.hoursService)}: ${hrs('service')}`, '');
    out.push(`## ${l.models}`, '', l.note, '');
    for (const b of ['aito', 'dfsk']) {
      out.push(`### ${b.toUpperCase()}`, '', strip(t.brand[b].story[0]), '');
      for (const m of site.models.filter((x) => x.brand === b)) {
        const specs = ['powertrain', 'engine', 'power', 'torque', 'transmission', 'drive', 'battery', 'range', 'consumption', 'acceleration', 'dimensions', 'seats', 'warranty']
          .map((k) => [k, specValue(m, k, lang)]).filter(([, v]) => v).map(([k, v]) => `${strip(t.specs[k])}: ${strip(v)}`);
        out.push(`- [${m.name}](${abs(m.brand, lang, m.slug)}): ${strip(t.brand[b].models[m.slug])}`);
        out.push(`  - ${l.priceCz}: ${czk(m.priceFrom)}; ${l.priceSk}: ${eur(m.priceFromEur)}`);
        if (specs.length) out.push(`  - ${l.specs}: ${specs.join('; ')}`);
      }
      out.push('');
    }
    out.push(`## ${l.services}`, '');
    out.push(`- ${strip(t.home.showroom.label)}: ${strip(t.home.showroom.text)}`);
    out.push(`- ${strip(t.home.service.title)}: ${strip(t.home.service.intro)}`);
    for (const r of t.home.service.rows) out.push(`  - ${strip(r.name)}: ${strip(r.text)}`);
    out.push(`- ${strip(t.home.tyres.label)}: ${strip(t.home.tyres.intro)}`);
    for (const r of t.home.tyres.rows) out.push(`  - ${strip(r.name)}: ${strip(r.text)}`);
    out.push('');
    out.push(`## ${l.pages}`, '');
    out.push(`- [${strip(t.pages.index.title)}](${abs('index', lang)})`);
    out.push(`- [AITO](${abs('aito', lang)}): ${strip(t.pages.aito.description)}`);
    out.push(`- [DFSK](${abs('dfsk', lang)}): ${strip(t.pages.dfsk.description)}`);
    out.push(`- [${strip(t.contactPage.title)}](${abs('kontakt', lang)}): ${strip(t.pages.kontakt.description)}`);
    out.push(`- [${strip(t.privacy.title)}](${abs('privacy', lang)})`, '');
    write((lang === DEFAULT_LANG ? '' : lang + '/') + 'llms.txt', out.join('\n'));
  }
}

function build() {
  const t0 = Date.now();
  mkdirp(DIST);
  produced.clear();
  tplCache.clear();
  buildFonts();
  buildVendor();
  buildCSS();
  buildJS();
  buildStatic();
  buildPages();
  buildHtaccess();
  buildSitemap();
  buildLlms();
  cleanStale();
  const issues = readiness();
  if (issues.length) {
    console.log(`\n⚠ Před spuštěním na produkci doplnit (${issues.length}):`);
    for (const i of issues) console.log('  · ' + i);
    console.log('  (podrobně: node build.js --check)');
  }
  console.log(`✓ dist/ hotovo za ${Date.now() - t0} ms (${LANGS.length} jazyky × ${PAGES.length} stránek)`);
}

/* ------------------------------------------------------------- readiness */

// Co ještě chybí od klienta. `node build.js --check` skončí chybou, dokud je seznam neprázdný.
function readiness() {
  const out = [];
  const c = site.company;
  const mock = (v) => /0{3}\s?0{3}|^0+$|Ulice 000|^#$/.test(String(v));
  for (const k of ['ico', 'phone', 'phoneService']) if (mock(c[k])) out.push(`site.json → company.${k} je smyšlený (${c[k]})`);
  if (mock(c.address.street) || mock(c.address.zip)) out.push(`site.json → company.address je smyšlená (${c.address.street}, ${c.address.zip})`);
  if (c.geo.lat === 50.0755 && c.geo.lng === 14.4378) out.push('site.json → company.geo ukazuje na střed Prahy, ne na provozovnu');
  for (const [k, v] of Object.entries(c.social)) if (mock(v)) out.push(`site.json → company.social.${k} chybí (odkaz „#“)`);
  for (const m of site.models) {
    if (!m.priceFrom) out.push(`${m.name}: chybí cena v Kč (priceFrom)`);
    if (!m.priceFromEur) out.push(`${m.name}: chybí cena v € (priceFromEur)`);
    const todo = Object.entries(m.specs || {}).filter(([, v]) => v === 'TODO').map(([k]) => k);
    if (m.powertrain === 'TODO') todo.unshift('powertrain');
    if (todo.length) out.push(`${m.name}: chybí údaje ${todo.join(', ')}`);
  }
  for (const im of Object.values(images)) {
    if (!findImageFiles(im.file).length) out.push(`obrázek ${im.file} chybí (zobrazuje se zástupná plocha)`);
    if (im.temporary) out.push(`obrázek ${im.file}: ${im.temporary}`);
  }
  return out;
}

/* ------------------------------------------------------------------- serve */

function serve(port = Number(process.env.PORT) || 8080) {
  const http = require('http');
  const types = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
    '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
    '.avif': 'image/avif', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
    '.json': 'application/json', '.md': 'text/markdown; charset=utf-8', '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4', '.webm': 'video/webm', '.ico': 'image/x-icon',
  };
  http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    let file = path.join(DIST, path.normalize(p));
    let status = 200;
    if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(DIST, '404.html');
      status = 404;
    }
    const type = types[path.extname(file)] || 'application/octet-stream';
    const gzipOk = /gzip/.test(req.headers['accept-encoding'] || '') && /text|javascript|json|xml|svg|manifest/.test(type);
    const headers = {
      'Content-Type': type, 'Cache-Control': 'no-cache',
      'Content-Security-Policy': csp(), 'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };
    if (gzipOk) {
      headers['Content-Encoding'] = 'gzip';
      res.writeHead(status, headers);
      fs.createReadStream(file).pipe(require('zlib').createGzip()).pipe(res);
    } else {
      res.writeHead(status, headers);
      fs.createReadStream(file).pipe(res);
    }
  }).listen(port, () => console.log(`→ náhled: http://localhost:${port}`));
}

build();
if (ARGS.has('--check')) {
  const issues = readiness();
  console.log(issues.length ? `\n✗ Web zatím není připravený na produkci (${issues.length} bodů výše).` : '\n✓ Vše vyplněno – připraveno k nasazení.');
  process.exit(issues.length ? 1 : 0);
}
if (process.argv.includes('--serve')) {
  serve();
  if (process.argv.includes('--watch')) {
    let timer;
    fs.watch(SRC, { recursive: true }, () => {
      clearTimeout(timer);
      timer = setTimeout(() => { try { build(); } catch (err) { console.error(err.message); } }, 150);
    });
  }
}
