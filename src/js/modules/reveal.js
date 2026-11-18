// 01 / O nás: text se při scrollu „rozsvěcuje“ slovo po slově (opacity 0,15 → 1, vázáno na scroll).
SRM.splitWords = function (el) {
  var words = [];
  var walk = function (node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var s = document.createElement('span');
          s.className = 'w';
          s.textContent = part;
          frag.appendChild(s);
          words.push(s);
        });
        node.replaceChild(frag, n);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(el);
  return words;
};

SRM.reveal = function () {
  var gsap = window.gsap;

  document.querySelectorAll('[data-reveal-words]').forEach(function (el) {
    var words = SRM.splitWords(el);
    gsap.fromTo(words, { opacity: 0.15 }, {
      opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 55%', scrub: 0.6 }
    });
  });

};
