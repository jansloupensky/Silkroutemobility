// Galerie na stránkách značek: nativní horizontální posuv (prst), tažení myší, tlačítka a počítadlo.
SRM.gallery = function () {
  document.querySelectorAll('[data-gallery]').forEach(function (g) {
    var track = g.querySelector('[data-gallery-track]');
    var slides = track.children;
    var count = g.querySelector('[data-gallery-count]');
    var prev = g.querySelector('[data-gallery-prev]');
    var next = g.querySelector('[data-gallery-next]');
    var n = slides.length;

    function index() {
      var x = track.scrollLeft;
      var best = 0, dist = Infinity;
      for (var i = 0; i < n; i++) {
        var d = Math.abs(slides[i].offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft) - x);
        if (d < dist) { dist = d; best = i; }
      }
      return best;
    }
    function go(i) {
      i = Math.max(0, Math.min(n - 1, i));
      var left = slides[i].offsetLeft - slides[0].offsetLeft;
      track.scrollTo({ left: left, behavior: SRM.env.reducedMotion ? 'auto' : 'smooth' });
    }
    function update() {
      var i = index();
      var max = track.scrollWidth - track.clientWidth;
      if (count) count.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
    }
    var raf = 0;
    track.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    if (prev) prev.addEventListener('click', function () { go(index() - 1); });
    if (next) next.addEventListener('click', function () { go(index() + 1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index() - 1); }
    });

    // tažení myší (dotyk používá nativní scroll)
    var down = false, startX = 0, startLeft = 0, startIdx = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft; startIdx = index();
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add('is-dragging'); }
      track.scrollLeft = startLeft - dx;
    });
    function end(e) {
      if (!down) return;
      down = false;
      track.classList.remove('is-dragging');
      if (moved) {
        var dx = e.clientX - startX;
        var i = index();
        if (dx < -60 && i <= startIdx) i = startIdx + 1;
        if (dx > 60 && i >= startIdx) i = startIdx - 1;
        go(i);
      }
    }
    track.addEventListener('pointerup', end);
    track.addEventListener('pointercancel', end);
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    update();
  });
};
