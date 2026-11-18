// Přechody mezi stránkami.
// 1) Prohlížeče s View Transitions pro dokumenty (CSS @view-transition) – řeší CSS, JS nic nedělá.
// 2) Ostatní: krátké zatmavení (opona) při kliknutí na interní odkaz.
SRM.transitions = function () {
  var root = document.documentElement;
  var curtain = document.querySelector('[data-curtain]');
  if (!curtain || SRM.env.reducedMotion) return;

  var supportsVT = 'CSSViewTransitionRule' in window || 'onpagereveal' in window;
  if (supportsVT) return;

  // příchod: pokud jsme odcházeli oponou, začni zatmavený a odkryj
  if (SRM.storage.get('srm-curtain') === '1') {
    root.classList.add('is-arriving');
    SRM.storage.set('srm-curtain', '0');
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { root.classList.remove('is-arriving'); });
    });
  }
  // návrat tlačítkem zpět (bfcache)
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) { curtain.classList.remove('is-on'); root.classList.remove('is-arriving'); }
  });

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var url;
    try { url = new URL(a.href, window.location.href); } catch (err) { return; }
    if (url.origin !== window.location.origin) return;
    if (!/^https?:$/.test(url.protocol)) return;
    // kotva na stejné stránce
    if (url.pathname === window.location.pathname && url.search === window.location.search) return;
    e.preventDefault();
    SRM.storage.set('srm-curtain', '1');
    curtain.classList.add('is-on');
    window.setTimeout(function () { window.location.href = url.href; }, 420);
  });
};
