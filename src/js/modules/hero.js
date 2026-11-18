// Hero: nadpis se po písmenech vysune z masky (SplitText), při scrollu se obraz přibližuje
// a ztmavuje a text odjíždí rychleji než pozadí. Video jen na desktopu bez úsporného režimu.
SRM.splitChars = function (el) {
  var gsap = window.gsap;
  if (window.SplitText) {
    try {
      gsap.registerPlugin(window.SplitText);
      var split = window.SplitText.create(el, { type: 'words,chars', mask: 'words', wordsClass: 'split-word', charsClass: 'split-char' });
      return split.chars;
    } catch (e) { /* fallback níže */ }
  }
  return [el];
};

SRM.hero = function (delay) {
  var hero = document.querySelector('[data-hero]');
  if (!hero) return;
  var gsap = window.gsap;
  var title = hero.querySelector('[data-hero-title]');
  var reveal = hero.querySelectorAll('.hero__kicker, .brand-hero__kicker, [data-hero-sub], .brand-hero__models');
  var media = hero.querySelector('[data-hero-media]');
  var shade = hero.querySelector('[data-hero-shade]');
  var content = hero.querySelector('[data-hero-content]');

  // video
  var vbox = hero.querySelector('[data-hero-video]');
  if (vbox && SRM.env.rich && !SRM.env.lowEnd) {
    var v = document.createElement('video');
    v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', ''); v.setAttribute('aria-hidden', 'true');
    var poster = hero.querySelector('img');
    if (poster) v.poster = poster.currentSrc || poster.src;
    ['webm', 'mp4'].forEach(function (t) {
      var src = vbox.getAttribute('data-' + t);
      if (src) { var s = document.createElement('source'); s.src = src; s.type = 'video/' + t; v.appendChild(s); }
    });
    vbox.appendChild(v);
    v.play && v.play().catch(function () {});
  }

  // intro
  if (title) {
    var chars = SRM.splitChars(title);
    title.classList.add('is-ready');
    gsap.from(chars, { yPercent: 115, duration: 1.2, ease: 'expo.out', stagger: 0.022, delay: delay });
  }
  reveal.forEach(function (el) { el.classList.add('is-ready'); });
  if (reveal.length) gsap.from(reveal, { y: 24, autoAlpha: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: delay + 0.55 });
  if (media) gsap.from(media, { scale: 1.08, duration: 1.8, ease: 'expo.out', delay: Math.max(0, delay - 0.2) });

  // scroll: přiblížení, ztmavení, parallax textu
  if (!window.ScrollTrigger) return;
  var tl = gsap.timeline({
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
  });
  if (media) tl.fromTo(media, { scale: 1 }, { scale: 1.1, ease: 'none', immediateRender: false }, 0);
  if (content) tl.to(content, { yPercent: -45, ease: 'none' }, 0);
  var dim = document.createElement('div');
  dim.className = 'hero__dim';
  dim.style.cssText = 'position:absolute;inset:0;background:#0E0D0B;opacity:0;pointer-events:none;z-index:-1';
  hero.appendChild(dim);
  tl.to(dim, { opacity: 0.7, ease: 'none' }, 0);
};
