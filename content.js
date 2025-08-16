chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'SHOW_TOOLTIP') {
      showTooltip(request.text);
    }
  });
  
  function showTooltip(message) {
    const oldTooltip = document.getElementById('cesky-akcent-tooltip');
    if (oldTooltip) {
      oldTooltip.remove();
    }
  
    const tooltip = document.createElement('div');
    tooltip.id = 'cesky-akcent-tooltip';
    tooltip.textContent = message;
    document.body.appendChild(tooltip);
  
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
  
      tooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (tooltipRect.width / 2)}px`;
      tooltip.style.top = `${rect.top + window.scrollY - tooltipRect.height - 8}px`;
    }
  
    setTimeout(() => {
      tooltip.classList.add('visible');
    }, 10);
  
    setTimeout(() => {
      tooltip.classList.remove('visible');
      setTimeout(() => {
        tooltip.remove();
      }, 300);
    }, 2000);
  }