# silkroutemobility.com – statický web

Prezentační web Silk Route Mobility, oficiálního importéra ROX a DFSK pro ČR a SK.
Čisté HTML, CSS a JavaScript. Žádný framework, databáze ani WordPress. Na serveru nic neběží.

---

## 1. Build a nahrání na hosting

Potřebujete jen **Node.js** (verze 18 a novější). Žádné `npm install` není potřeba, build nemá závislosti.

```bash
node build.js                    # vygeneruje složku dist/ (a vypíše, co ještě chybí od klienta)
node build.js --serve            # build + náhled na http://localhost:8080
node build.js --serve --watch    # náhled, který se sám přegeneruje při změně v src/
node build.js --check            # kontrola připravenosti: skončí chybou, dokud chybí údaje od klienta
node build.js --staging          # build pro testovací doménu: noindex + robots.txt zakáže vše
```
Totéž přes npm: `npm run build`, `npm run serve`, `npm run check`, `npm run staging`.

**Na hosting přes FTP nahrajte celý obsah složky `dist/`** do kořene webu (tam, kde byl WordPress):

- `dist/index.html`, `rox.html`, `dfsk.html`, `kontakt.html`, `404.html`, `ochrana-osobnich-udaju.html`
- složky `sk/`, `en/`, `assets/`
- `sitemap.xml`, `robots.txt`, `llms.txt` (+ `sk/llms.txt`, `en/llms.txt`), `site.webmanifest`, `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `og-image.jpg`
- **skrytý soubor `.htaccess`**. Ve FTP klientovi zapněte zobrazení skrytých souborů (FileZilla: Server → Vynutit zobrazení skrytých souborů).

Při každé změně: upravit soubory v `src/`, spustit `node build.js` a znovu nahrát `dist/`.
Soubory CSS a JS mají v názvu otisk (např. `main.644d1272.css`), takže staré verze na serveru můžete smazat. Nikomu nevadí, když tam zůstanou.

---

## 2. Kde co změnit

| Co | Kde |
|---|---|
| Telefon, e-mail, adresa, IČO, GPS, otevírací doba, sociální sítě | `src/data/site.json` → `company` |
| Modely, ceny, technické údaje | `src/data/site.json` → `models` |
| Texty webu (CZ / SK / EN) | `src/i18n/cs.json`, `sk.json`, `en.json` |
| Seznam obrázků a jejich rozměry | `src/data/images.json` |
| Barvy, písma, rozměry | `src/css/base.css` (proměnné v `:root`) |

**Ceny:**
- `priceFrom` je cena v Kč pro českou verzi, `priceFromEur` je cena v € pro slovenskou verzi.
- Anglická verze ukazuje obě ceny: „from CZK 550,000 / EUR 22,990“.
- Hodnota `0` znamená, že cena zatím není známá. Web pak napíše „Cena brzy“ / „Cena čoskoro“ / „Price coming soon“.
- Ceny se mezi měnami **nepřepočítávají**.
- Formát se řeší automaticky: „od 550 000 Kč“, „od 22 990 €“.

**Technické údaje:** hodnota `"TODO"` se na webu zobrazí jako „upřesníme“. Záruku pište jako číslo let (`5`), web doplní „5 let“ / „5 rokov“ / „5 years“.

**Otevírací doba** se zadává strukturovaně (dny `Mo Tu We Th Fr Sa Su`, čas `HH:MM`). Z toho se vygeneruje text ve všech jazycích („Po–Pá 9:00–18:00“) i strojová data pro Google (Schema.org).

---

## 3. Výměna zástupných obrázků

Dokud obrázek chybí, web zobrazí tmavou zástupnou plochu se správným poměrem stran a popiskem. **Stačí nahrát soubor se správným názvem do `src/assets/img/` a spustit `node build.js`.** Build ho sám najde a vloží.

Formáty:
- Minimum je `<název>.jpg`. Výřezy aut dejte jako `<název>.png` s průhledným pozadím.
- Doporučeně přidejte i `<název>.webp` a `<název>.avif` a menší varianty se šířkou v názvu, např. `home-hero-800.webp`, `home-hero-1600.webp`. Build z nich sestaví `srcset`, takže telefon stáhne menší soubor (důležité pro rychlost na mobilu).
- Převod a zmenšení zvládne zdarma např. [squoosh.app](https://squoosh.app).

| Soubor | Rozměr (px) | Použití |
|---|---|---|
| `home-hero.jpg` | 2560 × 1440 | Hero úvodní stránky – auto v krajině 16:9 |
| `brand-rox.jpg` | 1600 × 2000 | Blok ROX v sekci Značky, 4:5 |
| `brand-dfsk.jpg` | 1600 × 2000 | Blok DFSK v sekci Značky, 4:5 |
| `model-rox-adamas.png` | 2000 × 1000 | Výřez auta (průhledné pozadí), 2:1 |
| `model-rox-01.png` | 2000 × 1000 | Výřez auta, 2:1 |
| `model-dfsk-500.png` | 2000 × 1000 | Výřez auta, 2:1 |
| `model-dfsk-600.png` | 2000 × 1000 | Výřez auta, 2:1 |
| `model-dfsk-e5.png` | 2000 × 1000 | Výřez auta, 2:1 |
| `showroom.jpg` | 1600 × 2000 | Sekce Showroom, 4:5 – **teď dočasná ilustrační fotka** (servisní centrum ROX) s popiskem „Ilustrační foto“ |
| `rox-hero.jpg` | 2560 × 1440 | Hero stránky ROX, 16:9 |
| `dfsk-hero.jpg` | 2560 × 1440 | Hero stránky DFSK, 16:9 |
| `gallery-rox-adamas-1.jpg` … `-4.jpg` | 1920 × 1080 | Galerie ROX ADAMAS (4 ks) |
| `gallery-rox-01-1.jpg` … `-4.jpg` | 1920 × 1080 | Galerie ROX 01 (4 ks) |
| `gallery-dfsk-500-1.jpg` … `-3.jpg` | 1920 × 1080 | Galerie DFSK 500 (3 ks) |
| `gallery-dfsk-600-1.jpg` … `-3.jpg` | 1920 × 1080 | Galerie DFSK 600 (3 ks) |
| `gallery-dfsk-e5-1.jpg` … `-3.jpg` | 1920 × 1080 | Galerie DFSK E5 (3 ks) |

Počet fotek v galerii se mění v `src/data/images.json`. Přidejte řádek `gallery-<model>-5` a soubor.

**Hero video** (volitelné): `src/assets/video/home-hero.webm` + `home-hero.mp4`, smyčka 10–20 s, bez zvuku, do ~3 MB, 1920 × 1080. Přehrává se jen na počítači. Na mobilu a v úsporném režimu zůstane fotka `home-hero.jpg`, ta slouží i jako poster.

**Loga:** logo Silk Route Mobility je **dočasné** (typografický logotyp v `src/templates/partials/logo.html`, favicon v `src/root/favicon.svg`). Ikony a `og-image.jpg` v `src/root/` po dodání finálního loga vyměňte.
- **ROX:** oficiální SVG z roxmotor.com, vložené přímo do stránky v `src/templates/partials/brand-logo.html`. Barvu přebírá z okolního textu.
- **DFSK:** bílé PNG z dfskcars.cz (`src/assets/img/logo-dfsk.png`, 304 × 55 px). Je malé, takže na displejích s vysokým rozlišením je trochu měkké. Doporučujeme vyžádat si od výrobce vektorové logo (SVG) a vyměnit ho.

### Aktuální fotky a jejich zdroj (listopad 2026)
Fotky, výřezy aut a loga jsou převzaté z oficiálních webů výrobců (roxmotor.com a dfskcars.cz) se svolením Silk Route Mobility jako importéra. Zdroj každého obrázku je v `src/data/images.json` u položky `source`. Obrázky jsou ořezané na poměr stran webu a uložené ve formátu JPG/PNG a WebP s menšími variantami pro mobil.

- **ROX:** zdroje ve vysokém rozlišení (2560–3840 px), kvalita výborná.
- **DFSK:** zdroje jsou malé (max. 1605 px, výřezy aut 667–1013 px). Nic se nezvětšovalo, takže velké plochy (hero stránky DFSK, panel DFSK v sekci Značky, výřez DFSK 500) jsou na velkých monitorech měkčí. **Doporučení:** vyžádat si od DFSK tiskové fotky ve vysokém rozlišení a vyměnit je.
- **Showroom** (`showroom.jpg`) má zatím **dočasnou ilustrační fotku** servisního centra ROX z roxmotor.com s viditelným popiskem „Ilustrační foto“. Co nejdřív ji nahraďte fotkou vlastního showroomu a popisek pak smažte (`photo-note` v `src/templates/pages/index.html`).
- Hero úvodní stránky je fotka ROX. Pokud chcete úvod neutrální vůči značkám, vyměňte `home-hero.jpg` za vlastní snímek.

---

## 4. Co je potřeba doplnit (TODO a mock)

### Smyšlené údaje (mock), v HTML označené `<!-- TODO: mock -->`
Vše v `src/data/site.json` → `company`:
- [ ] `ico`: `00000000`
- [ ] `phone`: `+420 000 000 000` (prodej / showroom)
- [ ] `phoneService`: `+420 000 000 001` (servis a pneuservis)
- [ ] `email`: `info@silkroutemobility.com` (ověřit, že schránka existuje)
- [ ] `emailService`: `servis@silkroutemobility.com`
- [ ] `address`: `Ulice 000, 000 00 Praha`
- [ ] `geo`: souřadnice provozovny (teď střed Prahy). Podle nich se otevírá Google Maps / Mapy.cz.
- [ ] `hours`: otevírací doba showroomu a servisu
- [ ] `social`: odkazy na Instagram, Facebook, YouTube (teď `#`). Nepoužívané sítě smažte i z `src/templates/partials/footer.html`.

### Ceny
- [ ] ROX ADAMAS a ROX 01: `priceFrom` (Kč) – zatím `0` → „Cena brzy“
- [ ] Všechny modely: `priceFromEur` (€ pro SK) – zatím `0`
- [ ] DFSK 500 / 600 / E5: ceny 550 000 / 699 000 / 879 000 Kč jsou **předběžné** (převzaté z dfskcars.cz, listopad 2026). Ověřit.

### Technické údaje
Údaje jsou převzaté z webů výrobců (zdroj je u každého modelu v `site.json`, pole `_source`). Pořád chybí (`"TODO"`, na webu „upřesníme“):
- [ ] **spotřeba** u všech modelů (weby výrobců ji neuvádějí)
- [ ] **záruka ROX** (web výrobce ji neuvádí). U DFSK je 5 let podle zadání. Na dfskcars.cz jsou odkazy na záruční dokumenty, ale nefungují, takže to nešlo ověřit.

K ověření:
- [ ] **ROX:** údaje jsou z globálního webu roxmotor.com/en (emisní norma Euro V, verze pro globální trh). Pro evropskou homologaci se mohou lišit, ověřit u výrobce.
- [ ] **DFSK – nesrovnalosti přímo na dfskcars.cz.** Použili jsme hodnoty z tabulky parametrů:
  - DFSK 500: v záhlaví stránky je „114 HP“, v tabulce 85 kW / 115 hp
  - DFSK 600: v textu je „135 kW“, v tabulce 130 kW / 177 hp
  - DFSK 600: v textu je „interiér pro šest osob“, v tabulce 7 míst

### Obsah
- [ ] všechny fotky ze seznamu výše + případně hero video
- [ ] oficiální logo Silk Route Mobility a loga ROX / DFSK
- [ ] přečíst a schválit texty ve všech třech jazycích. Hlavně tvrzení, která jsme odhadli: asistence 24/7, originální díly přímo od výrobce, servis i pneuservis na stejné adrese jako showroom.
- [ ] ochrana osobních údajů: nechat zkontrolovat právníkem (teď základní text pro web bez cookies a formulářů)

### Předpoklady, které jsme udělali (změňte, pokud neplatí)
- Showroom, servis i pneuservis jsou na **jedné adrese** (web má jedno `address`).
- Slovenská verze ukazuje ceny v €, anglická v Kč i €. Když EN cena v jedné měně chybí, ukáže se jen ta známá. Když chybí obě, ukáže se „Price coming soon“.
- Názvy souborů jsou ve všech jazycích stejné (`/sk/kontakt.html`, `/en/rox.html`).
- Pohon modelu je v `site.json` uložený jako kód (`petrol`, `phev`), aby šel přeložit. Hodnoty a překlady jsou v `i18n/*.json` → `powertrain`.
- Schema.org: `AutoDealer` + `Organization` s českou adresou a `areaServed` CZ a SK. Je na úvodní a kontaktní stránce.
- Akcenty značek: ROX jemná olivová (outdoor), DFSK ocelově šedá. Obojí jen v drobných detailech.
- Pro text na světlém pozadí jsou tmavší odstíny `--sand-deep` a `--copper-deep`. Původní `--sand` a `--copper` by na světlé ploše nesplnily kontrast WCAG AA.

---

## 5. Po WordPressu – co smazat ze serveru

> ⚠️ **Nejdřív si udělejte zálohu** celého webu (FTP stáhnout vše) i databáze (export v administraci hostingu, např. přes phpMyAdmin). Teprve potom mažte.

Ze serveru po nahrání nového webu smažte:
- složky `wp-admin/`, `wp-content/`, `wp-includes/`
- soubory `wp-*.php` (`wp-config.php`, `wp-login.php`, `wp-cron.php`, `wp-load.php`, `wp-settings.php`, `wp-blog-header.php`, `wp-links-opml.php`, `wp-mail.php`, `wp-signup.php`, `wp-trackback.php`, `wp-activate.php`, `wp-comments-post.php`)
- `xmlrpc.php`, `index.php` (pozor: **`index.php` musí pryč**, jinak může mít přednost před `index.html`), `license.txt`, `readme.html`, `wp-config-sample.php`
- původní `.htaccess` z WordPressu nahraďte tím z `dist/`
- databázi WordPressu můžete v administraci hostingu smazat, až si budete jistí, že ji nepotřebujete

Staré adresy WordPressu (`/?p=…`, `/sample-page/`, `/wp-admin`, `/feed/`, `/category/…`, `/2026/…` atd.) přesměrovává `.htaccess` trvale (301) na úvodní stránku.

---

**Úpravy struktury (listopad 2026):**
- Hlavní nadpis je „Oficiální importér ROX a DFSK“, pod ním je napsáno, co firma dělá.
- ROX a DFSK mají na úvodní stránce každá vlastní sekci (02 / ROX, 03 / DFSK) se svými modely. V menu jsou zvlášť odkazy ROX a DFSK.
- Servis a pneuservis jsou prezentované pro auta všech značek. Záruční servis, originální díly a asistence 24/7 platí jen pro ROX a DFSK.
- Web nezmiňuje původ značek ani Hedvábnou stezku.

**Zjednodušení (listopad 2026):** na přání jsme z webu odstranili linku trasy přes stránku, souřadnice u sekcí, mapu Eurasie se zastávkami, vlastní kurzor a plovoucí náhledy fotek v sekci Servis. Fotky `service-*.jpg` už web nepotřebuje.

## 6. Technické poznámky

**iCloud / Dropbox:** projekt je na Ploše, která se synchronizuje s iCloudem. Ten při opakovaném buildu vytvářel konfliktní kopie typu `index 2.html`. Build proto složku `dist/` nemaže celou, přepisuje jen změněné soubory a na konci z `dist/` smaže všechno, co sám nevytvořil (včetně těchto kopií). Pro jistotu doporučujeme mít projekt mimo synchronizovanou složku.

**Struktura projektu:**
```
build.js               build bez závislostí (šablony → dist/)
src/templates/         layout.html, pages/*.html, partials/*.html (HTML s výrazy ${…})
src/i18n/              cs.json, sk.json, en.json
src/data/              site.json, images.json
src/css/               fonts, base, layout, components, sections, animations
src/js/                main.js + modules/ (build je spojí do jednoho souboru)
src/assets/            img/, video/, fonts/ (WOFF2, OFL licence)
src/vendor/            GSAP 3.15 (+ ScrollTrigger, SplitText), Lenis 1.3 – lokálně, žádné CDN
src/root/              soubory do kořene webu (.htaccess, ikony, manifest, og-image)
```

**`.htaccess`:**
- HTTPS a doména bez `www`, přesměrování 301 starých WP adres a 404 stránky po jazycích
- komprese brotli / gzip, cache (soubory s otiskem 1 rok, obrázky 1 týden, HTML 5 minut) a bezpečnostní hlavičky
- vše je obalené v `<IfModule>`
- HSTS je připravené v komentáři. Zapněte ho až po ověření, že HTTPS funguje.

**Bez cookies a externích požadavků:**
- písma, knihovny i mapa jsou lokální, nic se nestahuje z cizích serverů
- `sessionStorage` (ne cookie) si pamatuje jen to, že preloader už proběhl. Zápis je obalený `try/catch`.

**Animace a jejich fallbacky:**
- **Bez JavaScriptu** je vše vidět. Modely i galerie se posouvají prstem nebo kolečkem, menu funguje přes kotvu.
- **`prefers-reduced-motion`**: žádný preloader, parallax, pin ani rozsvěcování textu.
- **Mobil a dotyk**: bez Lenis, pinu a videa. Modely se posouvají nativně se `scroll-snap` a ukazatelem pozice.
- **Přechody stránek**: View Transitions API (Chrome, Edge, Safari 18.2+), v ostatních prohlížečích krátké zatmavení.

**Kontrola před předáním (18. 11. 2026):**
- **Přetečení a lámání slov:** žádné vodorovné přetečení ani lámání slov v nadpisech na šířkách 360, 390, 430, 768, 1024, 1280, 1440, 1920 a 2560 px. Mobily a tablety byly testované i na šířku. Prošly všechny jazyky a stránky, v režimu s animacemi, s omezeným pohybem i bez JavaScriptu.
- **Lighthouse (mobil, s reálnými fotkami):** výkon 96–100, přístupnost 100, best practices 100, SEO 100. Desktop má 100 ve všech kategoriích.
  - Stránky 404 mají SEO 63, protože jsou záměrně `noindex` a vrací stav 404. Tak to má být.
- **Odkazy:** interní odkazy a kotvy fungují. Přepínač jazyků vede vždy na stejnou stránku v jiném jazyce. `tel:` a `mailto:` odpovídají `site.json`. Web nedělá žádné externí požadavky.

**Ověřené písmo:** Archivo (variabilní, osy wght a wdth), IBM Plex Sans a IBM Plex Mono v subsetech latin + latin-ext. Obsahují všechny znaky české a slovenské diakritiky (ě š č ř ž ý á í é ů ú ň ť ď ľ ĺ ŕ ô ä).

---

## 7. Nasazení na produkci

### Před nasazením
1. Doplňte údaje od klienta (oddíl 4) a spusťte `node build.js --check`. Musí skončit hláškou **„✓ Vše vyplněno – připraveno k nasazení.“** Co chybí, vypíše build při každém spuštění.
2. *(Volitelně)* Testovací nasazení: `node build.js --staging` a nahrát na testovací subdoménu (např. `test.silkroutemobility.com`). Web se tam nebude indexovat.
   **Pozor:** na produkci pak vždy nahrajte běžný build (`node build.js`), ne staging.
3. Zálohujte stávající WordPress: soubory přes FTP i databázi (oddíl 5).

### Nasazení
4. `node build.js` a nahrát **celý obsah** `dist/` do kořene webu, včetně skrytého `.htaccess`.
5. Smazat soubory WordPressu (oddíl 5), hlavně `index.php`.

### Kontrola po nasazení (10 minut)
- [ ] `http://silkroutemobility.com` i `https://www.silkroutemobility.com` přesměrují na `https://silkroutemobility.com/`
- [ ] `/wp-admin`, `/sample-page/`, `/?p=1` přesměrují (301) na úvod
- [ ] `/neexistuje` ukáže českou 404, `/sk/neexistuje` slovenskou
- [ ] přepínač CZ / SK / EN, tlačítka „Otevřít v Google Maps / Mapy.cz“, `tel:` a `mailto:` odkazy na mobilu
- [ ] bezpečnostní hlavičky: [securityheaders.com](https://securityheaders.com) (očekávané hodnocení A)
- [ ] strukturovaná data: [Rich Results Test](https://search.google.com/test/rich-results) pro úvod a stránky ROX / DFSK
- [ ] `https://silkroutemobility.com/llms.txt` se otevře jako text s aktuálními údaji

### Po ověření HTTPS
- [ ] V `src/root/.htaccess` odkomentujte řádek `Strict-Transport-Security` (HSTS), přebuildujte a nahrajte `.htaccess` znovu.
- [ ] Přidejte web do [Google Search Console](https://search.google.com/search-console) a [Bing Webmaster Tools](https://www.bing.com/webmasters) a odešlete `https://silkroutemobility.com/sitemap.xml`.

### Pro AI asistenty a agenty
- **`llms.txt`** (CZ, `/sk/`, `/en/`): souhrn firmy, kontaktů, modelů s cenami a údaji, služeb a stránek v Markdownu. Generuje se ze `site.json` a `i18n`, po změně ceny se aktualizuje sám.
- **Schema.org:**
  - úvod: `Organization`, `AutoDealer` (s oddělením `AutoRepair`) a `ItemList` modelů
  - stránky ROX / DFSK: `Car` pro každý model, s `Offer` (cena od v CZK / EUR), jakmile je cena vyplněná
  - kontakt: firma a provozovna
- **`robots.txt`:** web je otevřený vyhledávačům i AI asistentům. Pokud nechcete, aby se obsah používal k **trénování** AI modelů, odkomentujte připravené bloky v `src/data/robots.txt` (GPTBot, ClaudeBot, Google-Extended …). Je to obchodní rozhodnutí klienta.
- Veškerý obsah je ve statickém HTML, takže ho přečte i agent, který nespouští JavaScript.

### Content Security Policy
Web smí načítat jen soubory z vlastní domény (CSP v `.htaccess`, hash inline skriptu doplní build sám).
Pokud později přidáte cokoli cizího (analytiku, vloženou mapu, YouTube video, chat), je potřeba upravit funkci `csp()` v `build.js`. Jinak to prohlížeč zablokuje.
Pozor: analytika a cizí vložený obsah obvykle znamenají cookies, a tedy i cookie lištu.
