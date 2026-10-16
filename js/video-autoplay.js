/* Avvio automatico dei video (sempre senza audio: i browser non permettono altro).
   - Pagina della foto: il video parte da solo (attributo autoplay, vedi _includes/video-embed.html).
   - Galleria: le anteprime dei file .mp4/.webm partono quando sono visibili e si fermano quando escono dallo schermo.
   - Rispetta "riduci animazioni" e il risparmio dati: in quel caso il video non parte da solo. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;

  var pageVideos = document.querySelectorAll('.fp-video video');
  if (reduce || saveData) {
    Array.prototype.forEach.call(pageVideos, function (v) { v.removeAttribute('autoplay'); v.pause(); });
    return;
  }

  var tiles = document.querySelectorAll('video[data-fp-tile]');
  if (!tiles.length || !('IntersectionObserver' in window)) return;

  function play(v) {
    if (!v.getAttribute('src') && v.getAttribute('data-src')) v.src = v.getAttribute('data-src');
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) play(e.target); else e.target.pause();
    });
  }, { threshold: 0.5 });

  Array.prototype.forEach.call(tiles, function (v) {
    v.addEventListener('playing', function () { v.classList.add('is-playing'); });
    io.observe(v);
  });
})();
