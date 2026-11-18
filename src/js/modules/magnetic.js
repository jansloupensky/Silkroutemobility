// „Magnetická“ tlačítka – prvek se mírně přitahuje ke kurzoru (jen desktop s myší).
SRM.magnetic = function () {
  if (!SRM.env.rich || !window.gsap) return;
  var gsap = window.gsap;
  document.querySelectorAll('[data-magnetic]').forEach(function (el) {
    var xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    var yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.18);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
    });
    el.addEventListener('pointerleave', function () {
      gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.4)' });
    });
  });
};
