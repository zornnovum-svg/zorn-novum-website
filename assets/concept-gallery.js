(() => {
  'use strict';
  const root = document.getElementById('service-concepts');
  if (!root) return;
  const cards = [...root.querySelectorAll('.zn-concept-card')];
  const type = document.getElementById('concept-type');
  const direction = document.getElementById('concept-direction');
  const count = document.getElementById('concept-count');
  const dialog = document.getElementById('concept-viewer');
  const image = document.getElementById('concept-image');
  const stage = document.getElementById('concept-stage');
  const title = document.getElementById('concept-title');
  const caption = document.getElementById('concept-caption');
  const full = document.getElementById('concept-full');
  const quote = document.getElementById('concept-quote');
  const zoom = document.getElementById('concept-zoom');
  const close = document.getElementById('concept-close');
  let active = null;
  let opener = null;
  function filter() {
    cards.forEach(card => {
      card.hidden = (type.value !== 'all' && card.dataset.type !== type.value) || (direction.value !== 'all' && card.dataset.direction !== direction.value);
    });
    const n = cards.filter(card => !card.hidden).length;
    count.textContent = `${n} of ${cards.length} concepts shown`;
  }
  type.addEventListener('change', filter);
  direction.addEventListener('change', filter);
  document.getElementById('concept-controls').hidden = false;
  filter();
  if (!dialog || typeof dialog.showModal !== 'function') return;
  function resetZoom() {
    stage.dataset.zoom = 'false';
    stage.scrollTop = stage.scrollLeft = 0;
    zoom.setAttribute('aria-pressed', 'false');
    zoom.textContent = 'Enlarge details';
  }
  function show(link) {
    active = link;
    title.textContent = link.dataset.title;
    caption.textContent = link.dataset.caption;
    image.alt = link.dataset.alt;
    stage.style.setProperty('--concept-max', link.dataset.max + 'px');
    image.src = link.href;
    full.href = link.href;
    quote.href = '/project-request.html?service=' + link.dataset.service;
    resetZoom();
  }
  root.addEventListener('click', event => {
    const link = event.target.closest('[data-concept]');
    if (!link || !root.contains(link) || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    opener = link;
    show(link);
    document.body.classList.add('zn-viewer-open');
    dialog.showModal();
    close.focus();
  });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    document.body.classList.remove('zn-viewer-open');
    resetZoom();
    image.removeAttribute('src');
    if (opener && opener.isConnected) opener.focus();
  });
  zoom.addEventListener('click', () => {
    const on = stage.dataset.zoom !== 'true';
    stage.dataset.zoom = String(on);
    zoom.setAttribute('aria-pressed', String(on));
    zoom.textContent = on ? 'Fit image' : 'Enlarge details';
    if (on) stage.focus();
  });
  function step(delta) {
    const visible = cards.filter(card => !card.hidden).map(card => card.querySelector('.zn-concept-open'));
    if (!visible.length) return;
    const parentLink = active.closest('.zn-concept-card').querySelector('.zn-concept-open');
    const i = visible.indexOf(parentLink);
    show(visible[(i + delta + visible.length) % visible.length]);
  }
  document.getElementById('concept-prev').addEventListener('click', () => step(-1));
  document.getElementById('concept-next').addEventListener('click', () => step(1));
})();
