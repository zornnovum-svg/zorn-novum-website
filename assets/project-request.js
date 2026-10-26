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
  const summary = document.getElementById('request-validation-summary');
  if (!form || !summary) return;
  const fields = [
    { id: 'request-name', label: 'Your name', missing: 'Please enter your name.' },
    { id: 'request-email', label: 'Email address', missing: 'Please enter your email address.' },
    { id: 'request-goal', label: 'Project description', missing: 'Please describe what you would like to improve or create.' }
  ].map(item => ({ ...item, input: document.getElementById(item.id), error: document.getElementById(item.id + '-error') }));
  if (fields.some(item => !item.input || !item.error)) return;
  let attempted = false;

  function messageFor(item) {
    if (!item.input.value.trim()) return item.missing;
    if (item.input.validity.typeMismatch) return 'Enter an email address in the format name@example.com.';
    if (item.input.validity.tooLong) return 'Please shorten your answer to the allowed length.';
    return item.input.validity.valid ? '' : 'Please check this field.';
  }

  function validateField(item) {
    const message = messageFor(item);
    item.error.textContent = message;
    item.error.hidden = !message;
    if (message) item.input.setAttribute('aria-invalid', 'true');
    else item.input.removeAttribute('aria-invalid');
    return !message;
  }

  function updateSummary() {
    const invalid = fields.filter(item => messageFor(item));
    summary.hidden = !attempted || invalid.length === 0;
    summary.textContent = summary.hidden ? '' : 'Please check: ' + invalid.map(item => item.label).join(', ') + '.';
    return invalid;
  }

  for (const item of fields) {
    item.input.addEventListener('blur', () => {
      validateField(item);
      updateSummary();
    });
    item.input.addEventListener('input', () => {
      if (attempted || !item.error.hidden) validateField(item);
      updateSummary();
    });
  }

  form.addEventListener('submit', (event) => {
    attempted = true;
    fields.forEach(validateField);
    const invalid = updateSummary();
    if (!invalid.length) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    invalid[0].input.focus();
  });

  form.addEventListener('reset', () => {
    attempted = false;
    summary.hidden = true;
    summary.textContent = '';
    fields.forEach(item => {
      item.error.hidden = true;
      item.error.textContent = '';
      item.input.removeAttribute('aria-invalid');
    });
  });

  // Use inline errors only once validation is installed; HTML validation remains
  // available if JavaScript cannot load.
  form.noValidate = true;
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
