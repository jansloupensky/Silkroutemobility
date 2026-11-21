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
| `src/assets/brand/` (nové) | SVG loga z balíčku beze změny: oneline-by, oneline, horizontal a mark, každé ve variantě color-on-dark a color-on-light (on-light pro budoucí světlé plochy). Vertikální a jednobarevné verze web nepotřebuje, zůstávají v balíčku. + 3D chromové S (PNG + WebP převody) |
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
11. **3D chromové S je v hero úvodní stránky** nad nadpisem vpravo (dekorace, `aria-hidden`). Na dočasné ilustrační fotce působí dobře, ale až dodáte vlastní fotku showroomu, posuďte, jestli se k ní hodí. Odstranění = smazat blok `<picture class="hero__mark">` v `src/templates/pages/index.html`. Pro web je převedené do WebP (640/1120/1682 px, 47–187 kB místo 1,6 MB PNG), původní PNG zůstává jako záloha pro starší prohlížeče.
12. Barvy mapy (ilustrace v kontaktu) jsou ocelová a asfaltová s průhledností, pin zlatý. Mimo paletu nejsou žádné barevné kódy (kromě stopů chromového/ocelového přechodu z `brand-tokens.css`).
13. E-mail a telefon v patičce zůstaly verzálkami ve stylu štítku (tak to bylo i dřív). Pokud chcete e-mail malými písmeny, je to jeden řádek CSS.

---

## Závěrečné shrnutí

### Co se změnilo
- **Loga:** všude nová loga Silkroute Mobility by MIEX ze SVG souborů balíčku (beze změny, jako `<img>`), varianty on-dark (hlavička i patička jsou vždy na tmavém).
  - hlavička: jednořádkové s podpisem (desktop od 768 px, 199–223 px šířky), bez podpisu na mobilu (176 px)
  - mobilní menu: jednořádkové bez podpisu (176 px)
  - patička: horizontální (200–460 px) místo starého velkého typografického nápisu
  - preloader: horizontální logo (200–300 px), odkrývá se maskou
- **Favicony a sdílení:** `favicon.ico`, `favicon.svg`, PNG ikony 16/32/48, `apple-touch-icon`, Android a maskovatelné ikony, `site.webmanifest`, `theme-color #1E1F22`, `og:image` + `twitter:image` (`og-image.png` 1200 × 630), Schema.org logo. Logo pro e-mailový podpis je na `/email/silkroute-podpis-logo.png`.
- **Barvy:** paleta značky jako CSS proměnné `--sr-*` v `src/css/base.css`, všechny staré barvy nahrazené (viz mapování výše).
- **Písmo:** Inter 400–700 (lokálně). Nadpisy Bold s prostrkáním −0,02 em (h3 −0,01 em), text Regular s řádkováním 1,5, štítky SemiBold/Medium verzálkami.
- **Ladění:** zlatá hlavní tlačítka s grafitovým textem (hover chrom), ocelové linky (24 % / 42 % průhlednosti), chromové neaktivní jazyky v hlavičce, 3D chromové S v hero. Struktura stránek, texty, URL i funkce zůstaly beze změny.

### Upravené soubory
`.gitignore`, `BRAND-UPDATE.md`, `README.md`, `build.js`,
`src/assets/brand/*` (nové), `src/assets/fonts/*` (Inter místo Archivo/IBM Plex),
`src/css/fonts.css`, `base.css`, `layout.css`, `components.css`, `sections.css`, `animations.css`,
`src/js/modules/preloader.js`, `footer.js`, `hero.js`,
`src/root/*` (favicony, ikony, manifest, og-image, `email/`, `.htaccess`),
`src/templates/partials/head.html`, `logo.html`, `header.html`, `footer.html`, `preloader.html`,
`src/templates/pages/index.html`, `docs/brand-update/*.jpg` (screenshoty pro PR).

### Co jsem zkontroloval (automaticky i vizuálně, tři kola)
- `node build.js` bez chyb (všech 18 stránek), `node --check` na všechny JS moduly. Lint ani testy projekt nemá.
- Build pro GitHub Pages (`--staging --base=/Silkroutemobility`): cesty k logům, WebP, faviconám i ikonám v manifestu dostávají prefix správně.
- Lokální server a headless Chrome: **všech 18 stránek (CZ/SK/EN) na 1440 a 390 px**, hlavní stránky navíc na 360, 768, 1024, 1280, 1920 a 2560 px a na nízkých displejích (1366 × 640, 1440 × 700, 1280 × 720):
  - žádné vodorovné přetečení, žádné chyby v konzoli, žádné porušení CSP, žádné chybějící soubory
  - **kontrast** všech textů na plných plochách ≥ 4,5 : 1 (velký text ≥ 3 : 1), automatický audit bez nálezu
  - loga: viditelná, správná varianta, poměr stran 1,000 (nedeformovaná), šířky nad minimem (jednořádkové ≥ 176 px, horizontální ≥ 200 px)
  - Inter se načítá na všech stránkách
  - favicony, manifest, og-image a logo podpisu vrací 200 se správným MIME typem
- Režim s animacemi: preloader s novým logem, intro hero, logo v patičce po doscrollování (konečný stav plně viditelný, bez deformace). Režim s omezeným pohybem: vše viditelné hned.
- Mobilní menu otevřené (logo, odkazy, jazyky). Fokus klávesnicí (Tab): zlatý obrys na tmavém, grafitový na světlém i na zlatém tlačítku.
- Prohledání codebase: žádné staré barevné kódy, staré názvy proměnných, stará písma ani staré logo/ikony.
- Světlý/tmavý režim systému: web nemá samostatný světlý motiv (střídá tmavé a světlé sekce), v obou režimech vypadá stejně.

### Co prosím zkontrolujte ručně
1. Otevřené otázky 1–13 výše, hlavně **název „Silk Route Mobility“ vs. „Silkroute Mobility“ v textech** (3) a **3D S v hero** (11).
2. Favicon v reálném prohlížeči (Safari, Chrome, Firefox) a ikonu po „Přidat na plochu“ na iPhonu/Androidu.
3. Náhled odkazu po nasazení (Facebook Sharing Debugger, LinkedIn Post Inspector): `og:image` míří na ostrou doménu `https://silkroutemobility.com/og-image.png`, takže na GitHub Pages náhled nepůjde ověřit.
4. Vzhled na skutečném telefonu (hlavně podpis „by MIEX“ v logu na tabletu, kde je logo s podpisem nejmenší, 199 px).
5. Při nasazení na FTP nahrát i nové soubory v kořeni (seznam v README, oddíl 1) a smazat staré `favicon-32.png`, `icon-192.png`, `icon-512.png`, `og-image.jpg`.
6. Screenshoty v `docs/brand-update/` slouží jen pro PR. Po schválení je můžete smazat.

### ⚠️ Připomínka
**Smažte dočasnou složku `_brand-silkroute/`** z kořene projektu, pokud ji tam máte (je v `.gitignore`, do gitu se nedostala). Při mé práci v kořeni nebyla; podklady jsem četl z `../Silkroute-Mobility-brand-balicek/`, tu si ponechte jako archiv značky. Web na žádnou z těchto složek neodkazuje, vše potřebné je zkopírované v `src/`.
