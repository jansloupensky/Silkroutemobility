// Patička: logo se při doscrollování jemně „usadí“ – vyjede zdola a zprůhlední se do plné viditelnosti.
// Logo se nijak nedeformuje (jen posun a průhlednost).
SRM.footer = function () {
  var el = document.querySelector('[data-footer-logo] img');
  if (!el) return;
  var gsap = window.gsap;
  gsap.fromTo(el, { yPercent: 35, opacity: 0 }, {
    yPercent: 0, opacity: 1, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: 0.8 }
  });
};
