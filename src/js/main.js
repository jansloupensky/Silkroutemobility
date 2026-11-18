// Vstupní bod. Moduly se registrují do objektu SRM (pořadí viz build.js – JS_ORDER).
//
// Režimy:
//  - bez JS: vše je vidět, galerie se posouvá nativně, menu přes :target
//  - prefers-reduced-motion: žádný parallax ani rozsvěcování textu; menu a galerie fungují
//  - mobil / dotyk / úsporný režim: bez Lenis a videa
//  - desktop (SRM.env.rich): vše
function init() {
  var root = document.documentElement;
  var env = SRM.env;
  if (env.reducedMotion) root.classList.add('reduced-motion');
  if (env.touch) root.classList.add('touch');

  SRM.header();
  SRM.menu();
  SRM.gallery();

  var gsap = window.gsap;
  var animated = !env.reducedMotion && !!gsap && !!window.ScrollTrigger;

  if (!animated) {
    // statický režim: vše viditelné
    document.querySelectorAll('[data-hero-title], [data-hero-sub], .hero__kicker, .brand-hero__kicker, .brand-hero__sub')
      .forEach(function (el) { el.classList.add('is-ready'); });
    var pre = document.querySelector('[data-preloader]');
    if (pre) pre.style.display = 'none';
    SRM.storage.set('srm-visited', '1');
    return;
  }

  gsap.registerPlugin(window.ScrollTrigger);
  gsap.defaults({ ease: 'power3.out', duration: 1 });
  SRM.transitions();

  SRM.lenisInit(function () {
    SRM.magnetic();
    SRM.preloader(function (delay) {
      SRM.hero(delay);
    });
    SRM.reveal();
    SRM.sections();
    SRM.counter();
    SRM.footer();

    // po načtení písem a obrázků přepočítat pozice
    var refresh = function () { window.ScrollTrigger.refresh(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
