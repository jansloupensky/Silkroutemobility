# Úprava webu podle identity Silkroute Mobility by MIEX

Větev: `brand/silkroute-identity`. Zdroj podkladů: brand balíček (lookbook v1, listopad 2026).

## Zjištění z průzkumu codebase

- **Framework:** žádný. Vlastní build bez závislostí `build.js` (Node ≥ 18): šablony `src/templates/**` (HTML s `${…}`) → `dist/`.
  Příkazy: `node build.js`, `--serve --watch` (náhled na :8080), `--check`, `--staging`, `--base=/…` (GitHub Pages).
- **Lint / testy:** v projektu nejsou. Kontrola = úspěšný build + `node --check` na JS + vizuální kontrola + vlastní audit (přetečení, kontrast, chyby v konzoli, CSP).
- **Stránky:** `index`, `aito`/`dfsk` (šablona `brand.html`), `kontakt`, `ochrana-osobnich-udaju`, `404`, každá ve třech jazycích (cs, `/sk/`, `/en/`) = 18 stránek.
- **Barvy, písma, globální styly:** `src/css/base.css` (proměnné v `:root`), další barvy natvrdo v `components.css`, `sections.css`, `layout.css`, `animations.css` a v `src/js/modules/hero.js`.
- **Písma:** lokálně hostovaná WOFF2 v `src/assets/fonts/` (Archivo, IBM Plex Sans, IBM Plex Mono), `@font-face` v `src/css/fonts.css`, preload v `partials/head.html`.
- **Hlavička / patička / `<head>`:** `partials/header.html` (+ mobilní menu), `partials/footer.html`, `partials/head.html`; logo `partials/logo.html`; preloader `partials/preloader.html`.
- **Favicony, manifest, og:image:** `src/root/` (kopíruje se do kořene `dist/`), odkazy v `head.html`, Schema.org logo/obrázek v `build.js`.
- **CSP:** `font-src 'self'`, `img-src 'self' data:` (v `build.js` → `.htaccess` i náhledovém serveru). Web záměrně nedělá žádné externí požadavky (README, GDPR).

## Plán (soubory a proč)

| Soubor | Změna |
|---|---|
| `.gitignore` | `_brand-silkroute/` – podklady se nikdy necommitují |
| `src/assets/brand/` (nové) | SVG loga z balíčku beze změny (oneline-by on-dark, oneline on-dark, horizontal on-dark, stacked on-dark a světlé/jednobarevné varianty pro budoucí použití) + 3D chromové S |
| `src/root/` | favicony z `02_favicon/` (`favicon.ico`, `favicon.svg`, `favicon-16/32/48`, `apple-touch-icon.png`, `android-chrome-192/512`, `maskable-icon-512`), `og-image.png`, `site.webmanifest` dle balíčku; staré ikony a `og-image.jpg` pryč; `email/silkroute-podpis-logo.png` |
| `build.js` | kopírování `assets/brand/`, Schema.org logo → `android-chrome-512x512.png`, obrázek → `og-image.png`, odstranění hlášky „logo je dočasné“ |
| `src/root/.htaccess` | MIME typ pro `.ico` |
| `partials/head.html` | kód z `HEAD-snippet.html`, `theme-color #1E1F22`, `og:image` + `twitter:image` (absolutní URL), preload písma Inter |
| `partials/logo.html` | nové logo: jednořádkové s podpisem (desktop), jednořádkové bez podpisu (úzká hlavička) |
| `partials/header.html` | logo v mobilním menu (oneline on-dark) místo „SRM / Menu“ |
| `partials/footer.html` | horizontální logo on-dark místo velkého typografického nápisu „Silk Route Mobility“ (bylo to fakticky staré logo) |
| `partials/preloader.html`, `js/modules/preloader.js` | starý kreslený symbol trasy → nové horizontální logo (odkrytí maskou, logo se nemění) |
| `js/modules/footer.js`, `js/modules/hero.js` | animace patičky pro logo místo písmen; barva ztmavení hero → graphite |
| `src/css/fonts.css`, `src/assets/fonts/` | Inter (Google Fonts, OFL) hostovaný lokálně, latin + latin-ext, variabilní 400–700; Archivo a IBM Plex pryč |
| `src/css/base.css` | brand tokeny `--sr-*`, mapování starých proměnných na paletu, typografie (Inter, nadpisy Bold −0,01 až −0,02 em, řádkování 1,5) |
| `src/css/layout.css`, `components.css`, `sections.css`, `animations.css` | náhrada natvrdo zapsaných barev, zlatá hlavní tlačítka s grafitovým textem, ocelové linky, logo a jeho ochranná zóna, 3D S v hero |
| `templates/pages/index.html` | 3D chromové S v hero (dekorativní, `aria-hidden`) |
| `README.md` | aktualizace sekcí o logu, barvách, písmu a souborech k nahrání |

### Mapování barev (staré → nové)

| Staré | Role | Nové |
|---|---|---|
| `--ink #0E0D0B` | hlavní tmavá plocha | graphite `#1E1F22` |
| `--ink-2 #1A1815`, `--ink-3 #24211D` | tmavé plochy | asphalt `#2C2D31` |
| `--silk #EDE6DA`, `--silk-2 #E3DACB` | světlé pozadí / text na tmavé | silk `#F4F4F2` (plochy), chrome `#D6D9DE` (sekundární světlá) |
| `--sand #B9A88C` | sekundární text na tmavé | steel `#8E949C` (kontrast 5,4 : 1 na graphite) |
| `--sand-deep #6B5E49` | sekundární text na světlé | `#62676F` – tmavý stop ocelového přechodu ze `brand-tokens.css` (5,2 : 1 na silk); steel by na světlé nesplnil 4,5 : 1 |
| `--copper #C26A2E` | akcent | gold `#E9B46A` |
| `--copper-deep #9C4F1C` | akcent na světlé | graphite (text), gold-deep `#C08A3E` jen pro netextové linky |
| AITO `#8C9BB0` | akcent sekce AITO | steel `#8E949C` |

## Rozhodnutí a otevřené otázky

Rozhodnuto samostatně (přes noc), prosím o kontrolu:

1. **Složka `_brand-silkroute/` v kořeni projektu neexistovala.** Stejný balíček (stejná struktura `01_logo` … `06_sablony` + lookbook) je ve vedlejší složce `../Silkroute-Mobility-brand-balicek/`. Četl jsem odtud. `_brand-silkroute/` je i tak v `.gitignore`.
2. **Inter je hostovaný lokálně, ne načítaný z fonts.googleapis.com.** Soubory jsou stažené přímo z Google Fonts (verze v20, OFL). Důvod: web má CSP `font-src 'self'` a zásadu „žádné externí požadavky“ (načítání z Google serverů posílá IP návštěvníka do USA, v EU to soudy hodnotily jako porušení GDPR). Vzhled je identický.
3. **Název firmy v textech zůstal „Silk Route Mobility“** (titulky stránek, patička, Schema.org, llms.txt, popisek mapy). Zadání zakazuje měnit texty, ale identita používá „Silkroute Mobility“. **Otázka: přejmenovat všude na „Silkroute Mobility“?** Je to změna v `src/i18n/*.json` a `site.json` (`company.name` je obchodní firma, tu měnit jen podle obchodního rejstříku).
4. Manifest (`site.webmanifest`) jsem převzal z balíčku (`name: Silkroute Mobility`, `display: standalone`) a doplnil `description`, `lang`, `start_url` z původního.
5. **Nadpisy jsou nově v normálním písmu (ne verzálkami).** Původní web měl všechny nadpisy verzálkami v širokém Archivu. Lookbook všude sází nadpisy Inter Bold s malými písmeny, verzálky jen u drobných štítků. Štítky (`.mono`) jsou dál verzálkami s prostrkáním jako „štítek“ v lookbooku.
6. Velký typografický nápis „Silk Route / Mobility“ v patičce (fakticky staré logo) nahradilo horizontální logo. V mobilním menu nahradilo logo text „SRM / Menu“.
7. Hlavní tlačítka (`.btn`: „Otevřít v Google Maps / Mapy.cz“, „Zpět na úvod“) jsou zlatá s grafitovým textem. Obě mapová tlačítka jsou rovnocenná, nechtěl jsem jedno upřednostnit.
8. Na světlém pozadí není zlatá ani ocelová použitá pro text. Akcentem textu je tam graphite a sekundárním textem `#62676F`.
9. Hlavička je vždy na tmavém pozadí (průhledná nad tmavým hero, po scrollu grafitová), proto všude varianta **on-dark**. Varianty on-light jsou zkopírované do `src/assets/brand/` pro budoucí světlé plochy, ale web je zatím nikde nepotřebuje.
10. Lookbook uvádí pro jednořádkovou verzi minimum **140 px** (horizontální 120 px). Hlídal jsem přísnější 140 px.
