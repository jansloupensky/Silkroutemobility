// Celoobrazovkové menu na mobilu: Esc zavírá, focus trap, zamčený scroll.
// Bez JS funguje přes :target (odkaz #menu).
SRM.menu = function () {
  var menu = document.querySelector('[data-menu]');
  var opener = document.querySelector('[data-menu-open]');
  if (!menu || !opener) return;
  var closer = menu.querySelector('[data-menu-close]');
  var root = document.documentElement;
  var lastFocus = null;

  opener.setAttribute('role', 'button');
  closer.setAttribute('role', 'button');
  menu.setAttribute('role', 'dialog');
  menu.setAttribute('aria-modal', 'true');
  menu.setAttribute('aria-hidden', 'true');
  menu.inert = true;

  function focusables() {
    return Array.prototype.filter.call(
      menu.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      function (el) { return el.offsetParent !== null || el === document.activeElement; }
    );
  }

  function open() {
    lastFocus = document.activeElement;
    menu.inert = false;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    opener.setAttribute('aria-expanded', 'true');
    root.classList.add('menu-open');
    if (SRM.lenis) SRM.lenis.stop();
    if (SRM.onMenu) SRM.onMenu(true, menu);
    window.setTimeout(function () { closer.focus(); }, 50);
    document.addEventListener('keydown', onKey);
  }

  function close(restoreFocus) {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    opener.setAttribute('aria-expanded', 'false');
    root.classList.remove('menu-open');
    menu.inert = true;
    if (SRM.lenis) SRM.lenis.start();
    if (SRM.onMenu) SRM.onMenu(false, menu);
    document.removeEventListener('keydown', onKey);
    if (restoreFocus !== false && lastFocus) lastFocus.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    var items = focusables();
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  opener.addEventListener('click', function (e) { e.preventDefault(); open(); });
  opener.addEventListener('keydown', function (e) { if (e.key === ' ') { e.preventDefault(); open(); } });
  closer.addEventListener('click', function (e) { e.preventDefault(); close(); });
  closer.addEventListener('keydown', function (e) { if (e.key === ' ') { e.preventDefault(); close(); } });

  // Klik na položku menu zavře menu (kotvy na stejné stránce).
  menu.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (a && a !== closer) close(false);
  });

  // Zvětšení okna na desktop menu zavře.
  window.matchMedia('(min-width: 1024px)').addEventListener('change', function (m) {
    if (m.matches && menu.classList.contains('is-open')) close(false);
  });

  // Pokud stránka přišla s #menu (no-JS odkaz), vyčistit.
  if (window.location.hash === '#menu') history.replaceState(null, '', window.location.pathname);
};
