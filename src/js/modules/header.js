// Fixní hlavička: schová se při scrollu dolů, ukáže při scrollu nahoru.
SRM.header = function () {
  var header = document.querySelector('[data-header]');
  if (!header) return;
  var lastY = window.scrollY;
  var ticking = false;
  var THRESHOLD = 8;

  function update() {
    var y = window.scrollY;
    var delta = y - lastY;
    header.classList.toggle('is-scrolled', y > 40);
    if (document.documentElement.classList.contains('menu-open')) { ticking = false; return; }
    if (y < 120 || delta < -THRESHOLD) header.classList.remove('is-hidden');
    else if (delta > THRESHOLD) header.classList.add('is-hidden');
    if (Math.abs(delta) > THRESHOLD) lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
};
