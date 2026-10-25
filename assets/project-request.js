(() => {
  const select = document.getElementById('request-service');
  if (!select || select.value) return;
  const key = new URLSearchParams(window.location.search).get('service');
  if (!key) return;
  const option = Array.from(select.options).find(item => item.dataset.service === key);
  if (!option) return;
  select.value = option.value;
  const note = document.getElementById('request-service-context');
  if (note) note.hidden = false;
})();
