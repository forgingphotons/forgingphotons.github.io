/* Carosello della home (JavaScript puro, nessuna dipendenza).
   - dissolvenza tra le foto, scorrimento automatico ogni data-interval ms
   - frecce, puntini, tasti freccia della tastiera, swipe sul telefono
   - si ferma con il mouse sopra, con il focus dentro, a scheda nascosta
     e se il sistema chiede di ridurre le animazioni
   - carica le foto solo quando servono: quella visibile e le due vicine */
(function () {
  'use strict';

  var root = document.querySelector('[data-carousel]');
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll('.fp-slide'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('.fp-dot'));
  var n = slides.length;
  if (n < 2) return;

  var interval = parseInt(root.getAttribute('data-interval'), 10) || 6000;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var current = 0;
  var timer = null;

  function mod(i) { return (i % n + n) % n; }

  function load(i) {
    var img = slides[mod(i)].querySelector('img[data-src]');
    if (img) {
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
    }
  }

  function show(i) {
    i = mod(i);
    slides.forEach(function (slide, k) {
      var on = k === i;
      slide.classList.toggle('is-active', on);
      slide.setAttribute('aria-hidden', on ? 'false' : 'true');
      var link = slide.querySelector('a');
      if (link) link.tabIndex = on ? 0 : -1;
    });
    dots.forEach(function (dot, k) {
      dot.classList.toggle('is-active', k === i);
      if (k === i) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    current = i;
    load(i); load(i + 1); load(i - 1);
  }

  function next() { show(current + 1); }
  function prev() { show(current - 1); }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }
  function start() {
    if (reduceMotion || timer || document.hidden) return;
    timer = setInterval(next, interval);
  }
  function restart() { stop(); start(); }

  /* controlli */
  var btnPrev = root.querySelector('.fp-prev');
  var btnNext = root.querySelector('.fp-next');
  if (btnPrev) btnPrev.addEventListener('click', function () { prev(); restart(); });
  if (btnNext) btnNext.addEventListener('click', function () { next(); restart(); });
  dots.forEach(function (dot, k) {
    dot.addEventListener('click', function () { show(k); restart(); });
  });

  /* tastiera: frecce sinistra/destra quando il carosello ha il focus */
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { prev(); restart(); }
    else if (e.key === 'ArrowRight') { next(); restart(); }
  });

  /* swipe sul telefono */
  var startX = null, startY = null;
  root.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  root.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    startX = startY = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next(); else prev();
      restart();
    }
  }, { passive: true });

  /* pause */
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', start);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  show(0);
  start();
})();
