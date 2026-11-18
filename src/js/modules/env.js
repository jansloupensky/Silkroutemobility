// Prostředí: podle něj se zapínají/zjednodušují animace.
SRM.env = (function () {
  var mq = function (q) { return window.matchMedia ? window.matchMedia(q).matches : false; };
  var conn = navigator.connection || {};
  var env = {
    reducedMotion: mq('(prefers-reduced-motion: reduce)'),
    touch: mq('(hover: none), (pointer: coarse)'),
    mobile: mq('(max-width: 767px)'),
    saveData: !!conn.saveData,
    lowEnd: (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 2
  };
  // „Plné“ animace jen na desktopu bez úsporného režimu a bez omezeného pohybu.
  env.rich = !env.reducedMotion && !env.touch && !env.mobile && !env.saveData;
  return env;
})();

SRM.storage = {
  get: function (k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } },
  set: function (k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { /* private mode */ } }
};
