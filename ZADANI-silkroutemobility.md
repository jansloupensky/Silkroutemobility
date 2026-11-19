# Zadání: web silkroutemobility.com

> Pozn. (19. 11. 2026): první značka byla na přání klienta změněna na AITO (aitoauto.com). Zadání je tomu přizpůsobené.

> Tento dokument je kompletní zadání pro Claude Code. Před psaním kódu si ho přečti celý, sepiš krátký plán (struktura souborů, sekce, animace) a pak stav po fázích podle oddílu 12.

---

## 1. O projektu

**Silk Route Mobility** je oficiální importér a distributor dvou automobilových značek pro Českou republiku (a Slovensko):

- **AITO**: prémiová SUV s range extenderem. Modely **AITO 9**, **AITO 7** a **AITO 5**. Reference: https://aitoauto.com/en/
- **DFSK**: dostupná SUV s pětiletou zárukou. Modely **DFSK 500**, **DFSK 600** a **DFSK E5** (plug-in hybrid). Reference: https://dfskcars.cz

Firma provozuje **showroom**, **servis** a **pneuservis**.

**Účel webu (fáze 1):** prezentace firmy. Návštěvník má pochopit, že Silk Route Mobility tyto značky v ČR zastupuje, uvidí modely s cenou „od“, zjistí, co nabízí showroom, servis a pneuservis, a najde telefon, e-mail a adresu. **Žádné formuláře.**

**Cílová skupina:** koncoví zákazníci (B2C) v ČR a SK.

**Doména:** https://silkroutemobility.com. Teď na ní běží výchozí instalace WordPressu, kterou nahradí tento statický web.

---

## 2. Technické mantinely (závazné)

- **Čisté HTML, CSS a JavaScript.** Žádný React, Vue, Next, Astro, Tailwind ani WordPress.
- Výsledek je **statická složka**, kterou majitel nahraje přes **FTP** na běžný hosting (počítej s Apache). Nasazení neřeš.
- Povolený je **jednoduchý build skript v Node.js** (bez frameworku), který z šablon a JSON dat vygeneruje tři jazykové verze do složky `dist/`. Na hosting se nahrává jen `dist/`. Hotový web nesmí na serveru nic potřebovat.
- Knihovny pro animace jsou povolené, ale **uložené lokálně** ve `vendor/`, ne z CDN:
  - **GSAP** + ScrollTrigger (+ SplitText, pokud dává smysl). GSAP je zdarma včetně pluginů.
  - **Lenis** pro plynulé scrollování. Na dotykových zařízeních ho vypni nebo nech nativní scroll.
- Žádné jiné závislosti bez dobrého důvodu.
- **Bez cookies a bez cookie lišty:** žádná analytika, Google Fonts ani vložená Google mapa. Písma hostuj lokálně, mapu řeš statickým obrázkem a odkazem (viz 7.8).

---

## 3. Jazyky a URL

| Jazyk | URL | Poznámka |
|---|---|---|
| Čeština (hlavní) | `/` | výchozí |
| Slovenština | `/sk/` | |
| Angličtina | `/en/` | |

- Texty jsou v `src/i18n/cs.json`, `sk.json` a `en.json`. Build z nich generuje statické HTML. **Žádné překládání za běhu přes JS** (kvůli SEO).
- Přepínač jazyků v hlavičce vede na stejnou stránku v jiném jazyce.
- Do `<head>` dej `hreflang` pro všechny tři verze a `x-default` na češtinu.
- Texty pište jako rodilý mluvčí, ne doslovný překlad. Slovenská verze musí být opravdu slovenská, ne „počeštěná“.

---

## 4. Struktura stránek

**Fáze 1:**

1. `index.html`: hlavní dlouhá stránka (viz oddíl 7)
2. `aito.html`: stránka značky AITO se všemi třemi modely
3. `dfsk.html`: stránka značky DFSK se třemi modely
4. `kontakt.html`: kontakty, adresa, otevírací doba, mapa
5. `404.html`
6. `ochrana-osobnich-udaju.html`: krátký text (bez formulářů a cookies stačí základ)

Detaily jednotlivých modelů jsou v této fázi sekce na stránce značky, ne samostatné stránky. Kód ale připrav tak, aby šly později snadno vyčlenit.

---

## 5. Data na jednom místě

Všechny údaje, které se budou měnit, patří do `src/data/site.json`. Nesmí být nikde natvrdo v HTML:

```json
{
  "company": {
    "name": "Silk Route Mobility s.r.o.",
    "ico": "00000000",
    "phone": "+420 000 000 000",
    "phoneService": "+420 000 000 001",
    "email": "info@silkroutemobility.com",
    "emailService": "servis@silkroutemobility.com",
    "address": { "street": "Ulice 000", "city": "Praha", "zip": "000 00", "country": "CZ" },
    "geo": { "lat": 50.0755, "lng": 14.4378 },
    "hours": {
      "showroom": "Po–Pá 9:00–18:00, So 9:00–12:00",
      "service": "Po–Pá 7:30–17:00"
    },
    "social": { "instagram": "#", "facebook": "#", "youtube": "#" }
  },
  "models": [
    { "brand": "aito", "slug": "9", "name": "AITO 9", "powertrain": "TODO", "priceFrom": 0 },
    { "brand": "aito", "slug": "7", "name": "AITO 7", "powertrain": "TODO", "priceFrom": 0 },
    { "brand": "aito", "slug": "5", "name": "AITO 5", "powertrain": "TODO", "priceFrom": 0 },
    { "brand": "dfsk", "slug": "500",    "name": "DFSK 500",   "powertrain": "benzín",           "priceFrom": 550000 },
    { "brand": "dfsk", "slug": "600",    "name": "DFSK 600",   "powertrain": "benzín",           "priceFrom": 699000 },
    { "brand": "dfsk", "slug": "e5",     "name": "DFSK E5",    "powertrain": "plug-in hybrid",   "priceFrom": 879000 }
  ]
}
```

- **Všechny kontakty jsou zatím smyšlené (mock).** Majitel je doplní později. Pro jistotu je v kódu označ komentářem `<!-- TODO: mock -->` a vypiš je v README.
- Ceny DFSK jsou převzaté z dfskcars.cz (stav listopad 2026) a jsou **předběžné**. Ceny AITO zatím nejsou známé. Dokud je `priceFrom` rovno 0, zobraz „Cena brzy“ (SK „Cena čoskoro“, EN „Price coming soon“).
- Cenu formátuj podle jazyka: `od 550 000 Kč` / `od 550 000 Kč` / `from CZK 550,000`. Pod ceník přidej malou poznámku „Ceny jsou orientační, včetně DPH.“

---

## 6. Vizuální směr: aby web nevypadal jako od AI

To je nejdůležitější část zadání. Web má působit jako práce dobrého designového studia pro automobilku, ne jako vygenerovaná šablona.

### 6.1 Koncept: „Hedvábná stezka“

Název firmy odkazuje na historickou obchodní cestu z Číny do Evropy. Tou cestou dnes jezdí i tato auta. Celý web je **cesta**:

- Signaturní prvek: **tenká linka trasy**, která se při scrollu postupně kreslí přes stránku (SVG `stroke-dashoffset` + ScrollTrigger). Vede od východu k Praze a u jednotlivých sekcí má „zastávky“ s malým popiskem souřadnic nebo místa (monospace písmem, decentně).
- Sekce jsou číslované jako etapy cesty (`01 / Značky`, `02 / AITO`…), ne obecnými nadpisy.
- Tón textů: věcný, sebevědomý, krátké věty. Žádný marketingový patos.

### 6.2 Barvy

Tmavý, teplý, prémiový základ. **Žádná fialová, žádné neonové gradienty, žádná sytě modrá.**

```css
--ink:      #0E0D0B;  /* téměř černá, teplá – hlavní pozadí */
--ink-2:    #1A1815;  /* plochy */
--silk:     #EDE6DA;  /* teplá bílá – text, světlé sekce */
--sand:     #B9A88C;  /* sekundární text, linky */
--copper:   #C26A2E;  /* akcent – trasa, aktivní stavy, max. 5 % plochy */
--line:     rgba(237,230,218,.14);
```

Světlé sekce (pozadí `--silk`, text `--ink`) střídej s tmavými, aby měla stránka rytmus. Každá značka smí mít v rámci své sekce jemný vlastní akcent, ale celkový styl patří Silk Route Mobility, ne výrobcům.

### 6.3 Typografie

Písma hostuj lokálně (WOFF2, subset latin + latin-ext). **Musí obsahovat českou a slovenskou diakritiku** (ě š č ř ž ý á í é ů ú ň ť ď ľ ĺ ŕ ô ä). Ověř to.

- **Nadpisy:** *Archivo* v širokém řezu (Expanded / SemiExpanded, osa `wdth`), velká písmena, těsný řádkový proklad. Velké nadpisy klidně 12–18 vw na desktopu.
- **Text:** *IBM Plex Sans*, 16–18 px, řádkový proklad 1,6.
- **Data a popisky:** *IBM Plex Mono*: technické údaje, souřadnice, čísla etap, ceny.
- **Nepoužívej:** Inter, Poppins, Montserrat ani systémová písma jako hlavní volbu.
- Pro nadpisy používej fluidní velikosti přes `clamp()`.

### 6.4 Čeho se vyvarovat (typické znaky AI webů)

- ❌ Mřížka tří stejných karet s ikonou nahoře a třemi řádky textu
- ❌ Emoji jako ikony, obecné ikony z knihoven (rakety, žárovky, štíty)
- ❌ Glassmorphismus, rozmazané barevné „blob“ skvrny na pozadí
- ❌ Fialovo-modré gradienty, gradientový text
- ❌ Všechny sekce vycentrované a stejně široké
- ❌ Fráze typu „Odemkněte budoucnost mobility“, „Revoluce na kolech“, „Zažijte rozdíl“
- ❌ Zaoblené rohy 16–24 px úplně všude, stíny pod každou kartou
- ❌ Stejné „fade-up“ u každého prvku
- ❌ Smyšlené statistiky a smyšlené recenze

### 6.5 Co místo toho

- ✅ **Asymetrická redakční mřížka** (12 sloupců), text odsazený do strany, prvky přesahující mřížku
- ✅ Obrovská typografie v kontrastu s malými popisky v monospace
- ✅ Tenké linky (1 px) jako strukturální prvky: oddělovače, rámečky, trasa
- ✅ Ostré nebo jen minimálně zaoblené rohy (0–4 px)
- ✅ Fotografie aut **přes celou šířku**, výřezy přes okraj obrazovky
- ✅ Vlastní jednoduché SVG ikony nakreslené tahem 1,5 px ve stejném stylu (jen tam, kde opravdu pomáhají: showroom, servis, pneuservis)
- ✅ Jemná filmová zrnitost přes tmavé sekce (SVG noise, nízká opacita)
- ✅ Kurzor: na desktopu jemný vlastní kurzor, který se u odkazů a aut zvětší a ukáže text („Prohlédnout“). Na dotykových zařízeních vypnout.

---

## 7. Hlavní stránka: sekce a animace

Animace mají být **pomalé, plynulé a záměrné** (easing `power3.out` / `expo.out`, délky 0,8–1,4 s). Každá sekce má jiný typ animace, žádné opakování stejného efektu.

### 7.1 Úvodní preloader (max. 1,5 s)
Logo Silk Route Mobility se vykreslí tahem, pod ním běží počítadlo 0–100 v monospace. Pak se obrazovka rozdělí a odjede nahoru. Při další návštěvě v té samé relaci (sessionStorage, obalené try/catch) se preloader přeskočí.

### 7.2 Hero
- Celoobrazovkové video nebo fotka auta v krajině (`100svh`). Video: smyčka, ztlumené, `playsinline`, WebM + MP4, s posterem. Na mobilu a při úsporném režimu jen fotka.
- Velký nadpis se po písmenech nebo slovech vysune z masky (SplitText).
- Nadpis (návrh): **„Z Východu. Na vaše cesty.“** / SK „Z Východu. Na vaše cesty.“ / EN „From the East. For your journeys.“
- Podtitulek: „Oficiální importér AITO a DFSK pro Českou republiku a Slovensko.“
- Při scrollu se obraz mírně přibližuje (scale 1 → 1,1) a ztmavuje. Text odjíždí rychleji než pozadí (parallax).
- Dole indikátor scrollu: tenká linka, po které jede tečka. Tady začíná trasa z 6.1.

### 7.3 `01 / O nás`
Krátký odstavec o firmě. Text se při scrollu „rozsvěcuje“ slovo po slově (z opacity 0,15 na 1, vázáno na scroll). Vedle je tenká mapa Eurasie z teček nebo linek, po které se vykreslí trasa z Číny do Prahy.

### 7.4 `02 / Značky`
Dva velké bloky vedle sebe (na mobilu pod sebou): AITO a DFSK. Na desktopu se blok po najetí myší rozšíří (flex-grow) a druhý zúží. Na pozadí je fotka auta, logo značky a jedna věta o značce. Odkaz vede na stránku značky.

### 7.5 `03 / Modely`
**Horizontální scroll** připnutý přes ScrollTrigger (pin): při svislém scrollu jedou modely do strany. Každý model má:
- velkou fotku auta (výřez, PNG/WebP s průhledností, pokud bude),
- název obrovským písmem v pozadí (obrysový text),
- 3–4 klíčové údaje v monospace (pohon, výkon, dojezd/spotřeba, záruka),
- cenu „od X Kč“ s animovaným načítáním čísla,
- odkaz „Detail modelu“ na kotvu na stránce značky.

Na mobilu (< 768 px) **bez pinu**: nativní horizontální posouvání se `scroll-snap` a ukazatelem pozice (1/5).

### 7.6 `04 / Showroom`
Rozdělená obrazovka: fotka showroomu se odkrývá maskou (clip-path) a vedle je text, otevírací doba a adresa. Fotka má jemný parallax.

### 7.7 `05 / Servis` a `06 / Pneuservis`
Dvě sekce, každá s jiným layoutem:
- **Servis:** seznam služeb jako tabulka s tenkými linkami (záruční a pozáruční servis, diagnostika, originální díly, asistence 24/7). Řádky se při scrollu postupně vysouvají. Po najetí na řádek se ukáže malý náhled fotky u kurzoru.
- **Pneuservis:** přezutí, uskladnění pneu, vyvážení, geometrie. Jako vizuál se při scrollu otáčí stylizované SVG kolo / dezén pneumatiky (rotace navázaná na scroll).
- U obou je výrazné telefonní číslo na servis (`tel:` odkaz).

### 7.8 `07 / Kontakt`
- Obrovské klikací telefonní číslo a e-mail (`tel:` / `mailto:`) s efektem „magnetického“ tlačítka na desktopu.
- Adresa, IČO a otevírací doba.
- **Mapa:** stylizovaný statický obrázek (SVG nebo tmavá upravená mapa jako obrázek) s pinem a tlačítky „Otevřít v Google Maps“ / „Otevřít v Mapy.cz“. Žádný iframe.

### 7.9 Patička
Velké logo nebo nápis přes celou šířku, který se při doscrollování „usadí“. Pod ním odkazy, jazyky, sociální sítě, IČO, © rok (generovat buildem) a odkaz na ochranu osobních údajů. Poznámka: „AITO a DFSK jsou ochranné známky svých vlastníků.“

### 7.10 Navigace
- Fixní hlavička, při scrollu dolů se schová a při scrollu nahoru se ukáže.
- Menu: Značky, Modely, Showroom, Servis, Kontakt, přepínač CZ / SK / EN a telefon.
- Na mobilu celoobrazovkové menu: položky velkým písmem se vysouvají postupně, zavírá se klávesou Esc, s focus trapem a zamčeným scrollem pod menu.
- Přechody mezi stránkami: krátký přechod (zatmavení nebo opona), bez frameworku, jen přes JS při kliknutí na interní odkaz. Pokud to prohlížeč podporuje, použij View Transitions API.

---

## 8. Stránky značek (`aito.html`, `dfsk.html`)

- Hero s autem značky a velkým názvem.
- Krátký příběh značky (2–3 odstavce, vlastními slovy, žádné kopírování z webů výrobců).
- Každý model jako samostatná sekce s kotvou (`#adamas`, `#01`, `#500`, `#600`, `#e5`): galerie (posuvník s tažením myší i prstem), tabulka technických údajů, cena od, záruka.
- Výrazná výzva na konci: „Přijďte se podívat do showroomu“ + telefon.
- AITO laď víc do outdooru a dobrodružství, DFSK víc do praktičnosti a hodnoty za peníze. Obě ale ve stejném designovém systému.

---

## 9. Responzivita a zařízení

Web musí bezchybně fungovat na telefonech, tabletech, noteboocích i velkých monitorech.

- **Mobile-first CSS.** Testované šířky: **360, 390, 430, 768, 1024, 1280, 1440, 1920 a 2560 px**, na výšku i na šířku.
- Prohlížeče: Chrome, Safari (macOS + iOS), Firefox, Edge, Samsung Internet. Poslední dvě verze.
- iOS Safari: používej `svh`/`dvh` místo `vh`, `playsinline` u videa a `env(safe-area-inset-*)` pro výřez displeje.
- Nic nesmí záviset jen na najetí myší (hover). Všechno musí jít i dotykem.
- Dotykové cíle mají aspoň 44×44 px.
- Žádné vodorovné přetečení stránky na žádné šířce (ověř).
- Na slabších zařízeních a mobilech animace zjednoduš: méně pinů, bez kurzoru, bez Lenis, bez videa.
- **`prefers-reduced-motion: reduce`**: vypni parallax, pin, horizontální scroll i rozsvěcování textu. Obsah se zobrazí rovnou a funkce zůstanou.
- Web musí být čitelný a ovladatelný i **bez JavaScriptu** (obsah nesmí být skrytý jen přes opacity 0 bez fallbacku: použij třídu `.js` na `<html>`).

---

## 10. Výkon, přístupnost, SEO

**Výkon (cíl Lighthouse ≥ 90 na mobilu ve všech kategoriích):**
- Obrázky ve formátech AVIF/WebP s fallbackem a `srcset`/`sizes`. Explicitní `width`/`height` kvůli CLS.
- Lazy loading pro vše pod první obrazovkou. Hero obrázek s `fetchpriority="high"`.
- Hero video do ~3 MB, na mobilu se nenačítá.
- Písma: `font-display: swap`, preload jen dvou hlavních řezů.
- JS s `defer`. GSAP pluginy registruj jen tam, kde jsou potřeba.
- Animuj jen `transform` a `opacity`.

**Přístupnost (WCAG 2.1 AA):**
- Sémantické HTML, jedno `h1` na stránku, logická hierarchie nadpisů.
- Kontrast textu min. 4,5 : 1 (pozor na `--sand` na tmavém pozadí: ověř).
- Viditelný focus, odkaz „Přeskočit na obsah“, `alt` texty a ovládání klávesnicí.
- `lang` atribut podle jazyka.

**SEO:**
- Unikátní `<title>` a `meta description` pro každou stránku a jazyk.
- Open Graph a Twitter karty s OG obrázkem 1200×630.
- Schema.org `AutoDealer` (+ `Organization`) s adresou, telefonem a otevírací dobou z `site.json`.
- `sitemap.xml` (se všemi jazyky) a `robots.txt` generované buildem.
- Favicony: SVG + PNG + `apple-touch-icon` + `site.webmanifest`.

---

## 11. Hosting: `.htaccess` (Apache)

Připrav do `dist/` soubor `.htaccess`:
- Vynucení HTTPS a domény bez `www` (přesměrování 301).
- **301 přesměrování starých WordPress URL** na úvod: `/?p=*`, `/sample-page/`, `/ukazkova-stranka/`, `/wp-admin`, `/wp-login.php`, `/feed/`, `/category/*`, `/2026/*`.
- `ErrorDocument 404 /404.html`.
- Komprese (gzip/brotli, pokud je k dispozici) a cache hlavičky: dlouhá cache pro `/assets/` s hashem v názvu souboru, krátká pro HTML.
- Základní bezpečnostní hlavičky (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
- Každé pravidlo zabal do `<IfModule>`, aby web nespadl na hostingu bez daného modulu.

---

## 12. Struktura projektu a postup

```
/
├─ src/
│  ├─ templates/        # HTML šablony + partials (head, header, footer)
│  ├─ i18n/             # cs.json, sk.json, en.json
│  ├─ data/site.json    # kontakty, modely, ceny
│  ├─ css/              # rozdělené: base, layout, components, sections, animations
│  ├─ js/               # main.js + moduly po sekcích
│  ├─ assets/           # img, video, fonts, svg
│  └─ vendor/           # gsap, lenis (lokálně)
├─ build.js             # vygeneruje dist/ (bez závislostí, nebo minimum)
├─ dist/                # ← tohle se nahrává přes FTP
└─ README.md
```

**Postup po fázích. Po každé fázi se zastav a ukaž výsledek:**

1. **Základ:** build skript, šablony, i18n, data, design tokeny, typografie, hlavička a patička. Výstup: stránka s texty bez animací ve všech třech jazycích.
2. **Layout všech sekcí** na hlavní stránce i stránkách značek. Plně responzivní, zatím bez animací.
3. **Animace:** preloader, hero, trasa, horizontální scroll, odkrývání, kurzor, přechody stránek. Včetně fallbacků pro mobil, reduced-motion a no-JS.
4. **Ladění:** výkon, přístupnost, SEO, `.htaccess`, 404.
5. **Kontrola:** pokud máš k dispozici Playwright nebo jiný prohlížeč, udělej screenshoty všech stránek na šířkách z oddílu 9 a projdi je. Spusť Lighthouse. Ověř, že nikde nepřetéká obsah a že funguje přepínání jazyků i odkazy `tel:`/`mailto:`. Opravené problémy vypiš.

---

## 13. Obsah a podklady

Majitel zatím **nedodal žádné podklady**. Proto:

- **Logo Silk Route Mobility:** zatím vytvoř jednoduchý typografický logotyp (název v Archivo Expanded + malý symbol trasy) v SVG, jasně jako dočasný.
- **Loga AITO a DFSK:** zástupný text s názvem značky v jednotném stylu. Oficiální loga dodá importér od výrobce. **Nestahuj** je z cizích webů.
- **Fotky a videa aut:** **nestahuj a nehotlinkuj** obrázky z webů výrobců a **negeneruj** AI obrázky aut. Použij elegantní zástupné plochy (tmavý gradient + jemná linka + popisek „AITO 9 – foto 16:9“) ve správném poměru stran, aby šly později jen vyměnit soubory se stejným názvem. Do README dej seznam všech potřebných obrázků s rozměry a názvy souborů.
- **Technické údaje modelů:** kde nejsou jisté, dej `TODO` a v README je vypiš. Nic si nevymýšlej.
- **Texty:** napiš je sám (CZ, SK, EN) podle tónu z oddílu 6.1. Krátké, konkrétní, bez klišé. Žádné smyšlené statistiky, roky na trhu ani počty zákazníků.

---

## 14. README pro majitele

V `README.md` (česky) popiš:
1. Jak spustit build (`node build.js`) a co nahrát přes FTP (obsah `dist/`, včetně skrytého `.htaccess`).
2. Kde změnit kontakty, ceny a texty (`site.json`, `i18n/*.json`).
3. Jak vyměnit zástupné obrázky (seznam souborů, rozměry, formáty).
4. Seznam všech `TODO` a mock údajů, které je potřeba doplnit.
5. Co smazat ze serveru po WordPressu (složky `wp-*`, `xmlrpc.php` atd.) a upozornění, ať si předtím udělá zálohu.

---

## 15. Kritéria hotového webu

- [ ] Funguje na všech šířkách z oddílu 9 bez vodorovného přetečení
- [ ] Tři jazykové verze, přepínač vede na odpovídající stránku
- [ ] Všechny animace mají fallback (mobil, reduced-motion, bez JS)
- [ ] Lighthouse mobil ≥ 90 ve všech kategoriích
- [ ] Žádné externí požadavky (CDN, fonty, mapy, analytika), žádné cookies
- [ ] Kontakty a ceny jen v `site.json`
- [ ] `.htaccess` s přesměrováním starých WP URL
- [ ] Nic z oddílu 6.4 se na webu neobjevuje
- [ ] README s návodem a seznamem TODO
