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

(() => {
  const form = document.getElementById('project-request-form');
  const status = document.getElementById('request-submit-status');
  if (!form || !status || form.dataset.deliveryStatus !== 'connected' ||
      !window.fetch || !window.FormData || !window.AbortController) return;
  const button = form.querySelector('button[type="submit"]');
  if (!button) return;
  const buttonLabel = button.textContent;
  let sending = false;
  let accepted = false;

  function showStatus(message, focus = false) {
    status.textContent = message;
    status.hidden = false;
    if (focus) status.focus();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (sending || accepted) return;
    if (!form.reportValidity()) return;
    sending = true;
    button.disabled = true;
    button.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    showStatus('Sending your project request…');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
        credentials: 'omit',
        signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || result.ok === false || result.errors) {
        const details = Array.isArray(result.errors)
          ? result.errors.map(error => error.message).filter(message => typeof message === 'string').join(' ')
          : '';
        showStatus('Your request could not be submitted. ' + (details || 'Please try again, or email orders@zornnovum.com.') + ' Your entries are still here.', true);
        return;
      }
      accepted = true;
      form.reset();
      button.textContent = 'Request sent';
      showStatus('Your request was submitted. Opening your confirmation…');
      window.location.assign('/project-request-confirmation.html');
    } catch (error) {
      if (!accepted) showStatus('We could not confirm whether your request was received. Your entries are still here. Please email orders@zornnovum.com before resending to avoid a duplicate request.', true);
    } finally {
      clearTimeout(timeout);
      sending = false;
      form.removeAttribute('aria-busy');
      if (!accepted) {
        button.disabled = false;
        button.textContent = buttonLabel;
      }
    }
  });

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    sending = false;
    accepted = false;
    button.disabled = false;
    button.textContent = buttonLabel;
    form.removeAttribute('aria-busy');
    status.hidden = true;
    status.textContent = '';
  });
})();
