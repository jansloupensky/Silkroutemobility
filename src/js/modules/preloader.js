// Preloader (max. 1,5 s): logo se vykreslí tahem, počítadlo 0–100, obrazovka se rozdělí a odjede nahoru.
// Při další návštěvě ve stejné relaci se přeskočí (třída is-returning nastavená v <head>).
SRM.preloader = function (onDone) {
  var el = document.querySelector('[data-preloader]');
  var root = document.documentElement;
  SRM.storage.set('srm-visited', '1');
  if (!el || root.classList.contains('is-returning') || SRM.env.reducedMotion || !window.gsap) {
    if (el) el.style.display = 'none';
    onDone(0);
    return;
  }
  var gsap = window.gsap;
  el.style.animation = 'none';
  var count = el.querySelector('[data-preloader-count]');
  var obj = { v: 0 };
  var tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: function () { el.style.display = 'none'; }
  });
  tl.to(el.querySelector('[data-preloader-path]'), { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 0)
    .to(el.querySelector('[data-preloader-start]'), { opacity: 1, duration: 0.2 }, 0)
    .to(el.querySelector('[data-preloader-end]'), { opacity: 1, duration: 0.2 }, 0.75)
    .to(obj, {
      v: 100, duration: 0.9, ease: 'power2.inOut',
      onUpdate: function () { count.textContent = String(Math.round(obj.v)).padStart(3, '0'); }
    }, 0)
    .to(el.querySelector('.preloader__inner'), { autoAlpha: 0, y: -20, duration: 0.3, ease: 'power2.in' }, 0.95)
    .to(el.querySelectorAll('.preloader__panel'), { yPercent: -100, duration: 0.55, ease: 'expo.inOut', stagger: 0.06 }, 0.95);
  // hero začne ještě během odjezdu panelů
  onDone(1.15);
};
