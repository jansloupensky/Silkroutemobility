// Patička: velký nápis se při doscrollování „usadí“ – písmena dosednou z výšky na své místo.
SRM.footer = function () {
  var el = document.querySelector('[data-wordmark]');
  if (!el) return;
  var gsap = window.gsap;
  var lines = el.querySelectorAll('span');
  var chars = [];
  lines.forEach(function (l) { chars = chars.concat(SRM.splitChars(l)); });
  gsap.fromTo(chars, { yPercent: -60, opacity: 0 }, {
    yPercent: 0, opacity: 1, ease: 'power3.out', stagger: 0.04,
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: 0.8 }
  });
};
