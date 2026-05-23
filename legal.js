/* ChroFlow legal pages — load authored .txt policy content. */
'use strict';

(function initLegalPage() {
  const body = document.querySelector('[data-legal-src]');
  const title = document.querySelector('[data-legal-title]');
  const updated = document.querySelector('[data-legal-updated]');
  if (!body) return;

  const source = body.dataset.legalSrc;
  if (!source) return;

  function renderLegalText(text) {
    const lines = text.replace(/\r\n?/g, '\n').split('\n');
    const heading = lines.find(line => line.trim());
    const lastUpdated = lines.find(line => /^Last updated:/i.test(line.trim()));

    if (title && heading) title.textContent = heading.trim();
    if (updated && lastUpdated) updated.textContent = lastUpdated.trim();

    const contentLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed && trimmed !== heading && trimmed !== lastUpdated;
    });

    const fragment = document.createDocumentFragment();
    let list = null;

    contentLines.forEach(line => {
      const trimmed = line.trim();
      const isNumberedHeading = /^\d+\.\s+\S/.test(trimmed);
      const isListItem = /;$|,$/.test(trimmed) || /^[a-z].*[.;]$/.test(trimmed);

      if (isNumberedHeading) {
        list = null;
        const h2 = document.createElement('h2');
        h2.textContent = trimmed;
        fragment.appendChild(h2);
        return;
      }

      if (isListItem && trimmed.length < 160) {
        if (!list) {
          list = document.createElement('ul');
          fragment.appendChild(list);
        }
        const item = document.createElement('li');
        item.textContent = trimmed.replace(/[;,]$/, '');
        list.appendChild(item);
        return;
      }

      list = null;
      const paragraph = document.createElement('p');
      paragraph.textContent = trimmed;
      fragment.appendChild(paragraph);
    });

    body.replaceChildren(fragment);
  }

  fetch(source)
    .then(response => {
      if (!response.ok) throw new Error(`Unable to load ${source}`);
      return response.text();
    })
    .then(renderLegalText)
    .catch(() => {
      const fallback = document.createElement('p');
      fallback.className = 'legal-doc__error';
      fallback.innerHTML = `We could not load this policy automatically. <a href="${source}">Open the plain text version</a>.`;
      body.replaceChildren(fallback);
    });
})();
