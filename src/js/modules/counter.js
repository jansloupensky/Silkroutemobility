// Ceny: animované načítání čísla (0 → cena), formát podle jazyka stránky.
SRM.counter = function () {
  var gsap = window.gsap;
  var lang = document.documentElement.lang;
  var sep = lang === 'en' ? ',' : ' ';
  var fmt = function (v) { return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, sep); };
  document.querySelectorAll('[data-count] .num').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-num')) || 0;
    if (!target) return;
    // pevná šířka, aby text při počítání neskákal
    el.style.display = 'inline-block';
    el.style.minWidth = el.getBoundingClientRect().width + 'px';
    el.style.textAlign = 'right';
    var o = { v: 0 };
    el.textContent = fmt(0);
    var trigger = el.closest('[data-count-group]') || el;
    gsap.to(o, {
      v: target, duration: 1.4, ease: 'expo.out',
      onUpdate: function () { el.textContent = fmt(o.v); },
      scrollTrigger: {
        trigger: trigger,
        start: 'top 80%',
        once: true
      }
    });
  });
};
