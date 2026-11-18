// Plynulé scrollování (Lenis) – jen na desktopu bez omezeného pohybu.
// Skript se načítá dynamicky, na mobilu se vůbec nestahuje.
SRM.lenisInit = function (done) {
  if (!SRM.env.rich || !window.gsap) { done(); return; }
  var me = document.querySelector('script[data-lenis]');
  var src = me && me.getAttribute('data-lenis');
  if (!src) { done(); return; }
  var s = document.createElement('script');
  s.src = src;
  s.onload = function () {
    try {
      var lenis = new window.Lenis({
        lerp: 0.09,
        smoothWheel: true,
        anchors: { offset: -80 }
      });
      SRM.lenis = lenis;
      document.documentElement.classList.add('lenis');
      if (window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } catch (e) { /* bez Lenis funguje nativní scroll */ }
    done();
  };
  s.onerror = function () { done(); };
  document.head.appendChild(s);
};
