const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const resourceButtons = document.querySelectorAll('.resource-filter');
const resourceRows = document.querySelectorAll('.resource-row');

resourceButtons.forEach((button) => {
  button.addEventListener('click', () => {
    resourceButtons.forEach((btn) => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
    const target = button.dataset.target;
    resourceRows.forEach((row) => {
      row.style.display = target === 'all' || row.dataset.type === target ? '' : 'none';
    });
  });
});

const searchableContent = [
  { title: 'Chain Link System', type: 'Product', url: '/chain-link-fence', keywords: 'chain link system applications product information colors gates fabric fittings galvanized master halco wholesale gauge' },
  { title: 'Ornamental Steel', type: 'Product', url: '/products#ornamental-steel', keywords: 'ornamental steel family warranty drawings brochure specs powder coat panels' },
  { title: 'Ornamental Aluminum', type: 'Product', url: '/aluminum-fence', keywords: 'ornamental aluminum corrosion resistant finish residential commercial ultra aluminum pool code wholesale' },
  { title: 'Vinyl', type: 'Product', url: '/vinyl-fence', keywords: 'vinyl privacy fence posts rails caps residential royal catalyst veranda linden barrette ranch rail wholesale' },
  { title: 'Wood', type: 'Product', url: '/products#wood', keywords: 'wood privacy picket rail residential installation' },
  { title: 'Agricultural', type: 'Product', url: '/products#agricultural', keywords: 'agricultural cattle horse deer perimeter containment rural' },
  { title: 'Temporary Fencing', type: 'Product', url: '/products#temporary-fencing', keywords: 'temporary fencing portable panels barriers windscreen jobsite event' },
  { title: 'Access Control', type: 'Product', url: '/products#access-control', keywords: 'access control operators hardware gate integration commercial' },
  { title: 'Custom Fabricated Gates', type: 'Fabrication', url: '/custom-gates', keywords: 'custom gates fabrication ornamental metalwork swing gate metal works quote' },
  { title: 'Commercial Accounts', type: 'Company', url: '/commercial-accounts', keywords: 'commercial account application wholesale contractor business account net 30' },
  { title: 'Fence-U Product Catalog', type: 'Resource', url: '/resources#catalogs', keywords: 'catalog products multi-system pdf' },
  { title: 'Chain Link Specification Sheet', type: 'Resource', url: '/resources#specs', keywords: 'specification chain link pdf commercial' },
  { title: 'Gate Assembly Drawing Package', type: 'Resource', url: '/resources#drawings', keywords: 'drawings gate assembly zip commercial gates' },
  { title: 'Commercial Gate Solutions', type: 'Resource', url: '/resources#brochures', keywords: 'brochure access control commercial gates pdf' },
  { title: 'Ornamental Steel Finish Warranty', type: 'Resource', url: '/resources#warranties', keywords: 'warranty ornamental steel finish coverage' },
  { title: 'About Fence-U', type: 'Company', url: '/about', keywords: 'about wholesale contractor-first company' },
  { title: 'Contact', type: 'Company', url: '/contact', keywords: 'contact quote pricing phone email sales' }
];

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

if (searchInput && searchResults) {
  const renderResults = (value) => {
    const query = value.trim().toLowerCase();
    if (!query) {
      searchResults.innerHTML = '<div class="search-result"><strong>Start typing</strong><p>Search products, systems, and downloadable resources.</p></div>';
      return;
    }

    const matches = searchableContent.filter((item) => (`${item.title} ${item.keywords}`).toLowerCase().includes(query));

    if (!matches.length) {
      searchResults.innerHTML = '<div class="search-result"><strong>No matches found</strong><p>Try a broader term such as chain link, drawings, ornamental, or warranty.</p></div>';
      return;
    }

    searchResults.innerHTML = matches.map((item) => `
      <a class="search-result" href="${item.url}">
        <strong>${item.title}</strong>
        <p>${item.type}</p>
      </a>
    `).join('');
  };

  renderResults('');
  searchInput.addEventListener('input', (event) => renderResults(event.target.value));
}

const FORMS_WORKER_URL = 'https://fence-u-forms.justifiedtrust.workers.dev/submit';

document.querySelectorAll('form.quote-form').forEach((form) => {
  const statusEl = form.querySelector('.form-status');

  const showStatus = (message, kind) => {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = `form-status form-status-${kind}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = form.querySelector('[name="cf-turnstile-response"]')?.value;
    if (!token) {
      showStatus('Please complete the verification challenge before submitting.', 'error');
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    showStatus('Sending…', 'pending');

    const fields = Object.fromEntries(new FormData(form).entries());
    const formType = form.dataset.formType || 'unknown';

    let data;
    try {
      const result = await fetch(FORMS_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType, token, fields }),
      });
      data = await result.json();
    } catch (err) {
      if (submitButton) submitButton.disabled = false;
      showStatus('Something went wrong sending this. Check your connection and try again.', 'error');
      return;
    }

    if (!data.success) {
      if (submitButton) submitButton.disabled = false;
      showStatus('Verification failed. Please try again.', 'error');
      if (window.turnstile) window.turnstile.reset(form.querySelector('.cf-turnstile'));
      return;
    }

    showStatus('Sent — thanks. We’ll be in touch shortly.', 'success');
    form.reset();
    if (window.turnstile) window.turnstile.reset(form.querySelector('.cf-turnstile'));
    if (submitButton) submitButton.disabled = false;
  });
});
