(() => {
  const controls = document.querySelector('.zn-step-tabs');
  if (!controls) return;
  const buttons = [...controls.querySelectorAll('[data-zn-step]')];
  const panels = [...document.querySelectorAll('[data-step-panel]')];
  function selectStep(step) {
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.znStep === step)));
    panels.forEach(panel => { panel.hidden = panel.dataset.stepPanel !== step; });
  }
  buttons.forEach(button => button.addEventListener('click', () => selectStep(button.dataset.znStep)));
  selectStep('0');
  controls.hidden = false;
})();
