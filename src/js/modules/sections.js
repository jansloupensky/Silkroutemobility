// Animace jednotlivých sekcí – každá sekce má jiný typ pohybu.
SRM.sections = function () {
  var gsap = window.gsap;
  var rich = SRM.env.rich;

  // 04 / Showroom – fotka se odkrývá maskou (clip-path) a má jemný parallax
  document.querySelectorAll('[data-clip-reveal]').forEach(function (el) {
    gsap.fromTo(el, { clipPath: 'inset(0% 100% 0% 0%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut',
      scrollTrigger: { trigger: el, start: 'top 75%', once: true }
    });
  });
  document.querySelectorAll('[data-parallax]').forEach(function (el) {
    gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // 05 / Servis – řádky se postupně vysouvají zleva
  var svc = document.querySelector('[data-svc]');
  if (svc) {
    var rows = svc.querySelectorAll('.svc-table__row');
    gsap.from(rows, {
      x: -60, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.11,
      scrollTrigger: { trigger: svc, start: 'top 80%', once: true }
    });
  }

  // 06 / Pneuservis – kolo se otáčí podle scrollu
  var wheel = document.querySelector('[data-wheel] .wheel__spin');
  if (wheel) {
    gsap.to(wheel, {
      rotation: 300, svgOrigin: '200 200', ease: 'none',
      scrollTrigger: { trigger: wheel.closest('section'), start: 'top bottom', end: 'bottom top', scrub: 0.4 }
    });
  }

  // 07 / Kontakt – velké číslo a e-mail vyjedou z masky
  document.querySelectorAll('.contact-block__big .contact-big__value, .contact-page .contact-big__value').forEach(function (v) {
    var mask = document.createElement('span');
    mask.className = 'split-mask';
    mask.style.display = 'block';
    v.parentNode.insertBefore(mask, v);
    mask.appendChild(v);
    gsap.from(v, { yPercent: 110, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: mask, start: 'top 90%', once: true } });
  });

  // Stránky značek – názvy modelů najedou z boku, galerie se odkryje
  document.querySelectorAll('.model-detail').forEach(function (sec) {
    var title = sec.querySelector('.model-detail__title');
    if (title) {
      var chars = SRM.splitChars(title);
      gsap.from(chars, { xPercent: -40, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.03, scrollTrigger: { trigger: title, start: 'top 85%', once: true } });
    }
    var slides = sec.querySelectorAll('.gallery__slide');
    gsap.fromTo(slides, { clipPath: 'inset(0% 0% 0% 100%)' }, {
      clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut', stagger: 0.1,
      scrollTrigger: { trigger: sec.querySelector('.gallery'), start: 'top 80%', once: true }
    });
    var rowsT = sec.querySelectorAll('.spec-table tr');
    gsap.from(rowsT, { opacity: 0, y: 12, duration: 0.8, ease: 'power3.out', stagger: 0.05, scrollTrigger: { trigger: sec.querySelector('.spec-table'), start: 'top 85%', once: true } });
  });

  // Mobilní menu – položky velkým písmem se vysouvají postupně
  SRM.onMenu = function (open, menu) {
    if (!open) return;
    gsap.fromTo(menu.querySelectorAll('.menu__list a'), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06, delay: 0.1 });
  };
};
