/**
 * ==============================================================================
 * CAMPUS LOST AND FOUND PORTAL - CLIENT APPLICATION JAVASCRIPT
 * Full-featured async REST client with filtering, live stats, and modal workflows
 * ==============================================================================
 */

// Application State
const state = {
  items: [],
  stats: { total: 0, lost: 0, found: 0, resolved: 0, active: 0 },
  filters: {
    search: '',
    type: 'All',
    category: 'All',
    status: 'All',
    sortBy: 'newest'
  },
  activeModal: null,
  activeItemDetails: null,
  itemToDeleteId: null,
  isSubmitting: false,
  searchDebounceTimer: null
};

// DOM Element References
const elements = {
  // Navigation & Status
  apiStatusBadge: document.getElementById('api-status-badge'),
  apiStatusText: document.getElementById('api-status-text'),
  btnQuickSeed: document.getElementById('btn-quick-seed'),
  btnOpenReportModal: document.getElementById('btn-open-report-modal'),
  currentYear: document.getElementById('current-year'),

  // Hero Section
  btnHeroLost: document.getElementById('btn-hero-lost'),
  btnHeroFound: document.getElementById('btn-hero-found'),
  heroSearchInput: document.getElementById('hero-search-input'),
  btnHeroSearchSubmit: document.getElementById('btn-hero-search-submit'),
  quickPills: document.querySelectorAll('.quick-pill'),

  // Statistics Dashboard
  btnRefreshStats: document.getElementById('btn-refresh-stats'),
  statTotal: document.getElementById('stat-total'),
  statLost: document.getElementById('stat-lost'),
  statFound: document.getElementById('stat-found'),
  statResolved: document.getElementById('stat-resolved'),

  // Items Feed & Filters
  itemsSection: document.getElementById('items-section'),
  itemsGrid: document.getElementById('items-grid'),
  itemsCountBadge: document.getElementById('items-count-badge'),
  emptyState: document.getElementById('empty-state'),
  btnEmptyReset: document.getElementById('btn-empty-reset'),
  btnEmptyReport: document.getElementById('btn-empty-report'),

  // Filter Bar Controls
  typePills: document.querySelectorAll('.type-pill'),
  filterSearchInput: document.getElementById('filter-search-input'),
  btnClearSearch: document.getElementById('btn-clear-search'),
  filterCategory: document.getElementById('filter-category'),
  filterStatus: document.getElementById('filter-status'),
  filterSort: document.getElementById('filter-sort'),
  btnResetFilters: document.getElementById('btn-reset-filters'),

  // Report Modal
  reportModal: document.getElementById('report-modal'),
  reportForm: document.getElementById('report-item-form'),
  btnCloseReportModal: document.getElementById('btn-close-report-modal'),
  btnCancelReport: document.getElementById('btn-cancel-report'),
  btnSubmitReport: document.getElementById('btn-submit-report'),
  submitSpinner: document.getElementById('submit-spinner'),
  submitBtnText: document.getElementById('submit-btn-text'),
  descCharCounter: document.getElementById('desc-char-counter'),
  formDescription: document.getElementById('form-description'),
  formDate: document.getElementById('form-date'),

  // Details Modal
  detailsModal: document.getElementById('details-modal'),
  btnCloseDetailsModal: document.getElementById('btn-close-details-modal'),
  detailsBadgesContainer: document.getElementById('details-badges-container'),
  detailsModalBody: document.getElementById('details-modal-body'),
  detailsModalFooter: document.getElementById('details-modal-footer'),

  // Delete Modal
  deleteModal: document.getElementById('delete-modal'),
  btnCancelDelete: document.getElementById('btn-cancel-delete'),
  btnConfirmDelete: document.getElementById('btn-confirm-delete'),

  // Toast Container
  toastContainer: document.getElementById('toast-container')
};

// ==============================================================================
// 1. Initialization
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  if (elements.currentYear) {
    elements.currentYear.textContent = new Date().getFullYear();
  }

  // Set default form date to today
  if (elements.formDate) {
    elements.formDate.value = new Date().toISOString().split('T')[0];
  }

  setupEventListeners();
  checkBackendHealth();
  fetchStatistics();
  fetchItems();
});

// ==============================================================================
// 2. Event Listeners Setup
// ==============================================================================
function setupEventListeners() {
  // Navigation & Quick Actions
  elements.btnOpenReportModal.addEventListener('click', () => openReportModal());
  elements.btnQuickSeed.addEventListener('click', handleSeedData);
  elements.btnRefreshStats.addEventListener('click', () => {
    fetchStatistics();
    fetchItems();
    showToast('Dashboard refreshed!', 'info');
  });

  // Hero Section Buttons
  elements.btnHeroLost.addEventListener('click', () => openReportModal('Lost'));
  elements.btnHeroFound.addEventListener('click', () => openReportModal('Found'));

  // Hero Quick Search
  elements.btnHeroSearchSubmit.addEventListener('click', handleHeroSearch);
  elements.heroSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleHeroSearch();
  });

  // Hero Quick Category Pills
  elements.quickPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const category = pill.getAttribute('data-category');
      elements.filterCategory.value = category;
      state.filters.category = category;
      fetchItems();
      elements.itemsSection.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Filter Bar: Segmented Type Pills (All / Lost / Found)
  elements.typePills.forEach((pill) => {
    pill.addEventListener('click', () => {
      elements.typePills.forEach((p) => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');

      state.filters.type = pill.getAttribute('data-type');
      fetchItems();
    });
  });

  // Filter Bar: Live Search
  elements.filterSearchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    if (val) {
      elements.btnClearSearch.classList.remove('hidden');
    } else {
      elements.btnClearSearch.classList.add('hidden');
    }

    clearTimeout(state.searchDebounceTimer);
    state.searchDebounceTimer = setTimeout(() => {
      state.filters.search = val;
      fetchItems();
    }, 300);
  });

  elements.btnClearSearch.addEventListener('click', () => {
    elements.filterSearchInput.value = '';
    elements.btnClearSearch.classList.add('hidden');
    state.filters.search = '';
    fetchItems();
  });

  // Filter Bar: Dropdowns
  elements.filterCategory.addEventListener('change', (e) => {
    state.filters.category = e.target.value;
    fetchItems();
  });

  elements.filterStatus.addEventListener('change', (e) => {
    state.filters.status = e.target.value;
    fetchItems();
  });

  elements.filterSort.addEventListener('change', (e) => {
    state.filters.sortBy = e.target.value;
    fetchItems();
  });

  // Reset Filters
  elements.btnResetFilters.addEventListener('click', resetAllFilters);
  elements.btnEmptyReset.addEventListener('click', resetAllFilters);
  elements.btnEmptyReport.addEventListener('click', () => openReportModal());

  // Report Modal Interactions
  elements.btnCloseReportModal.addEventListener('click', closeReportModal);
  elements.btnCancelReport.addEventListener('click', closeReportModal);
  elements.reportForm.addEventListener('submit', handleReportFormSubmit);

  // Character Counter on Textarea
  elements.formDescription.addEventListener('input', (e) => {
    const len = e.target.value.length;
    elements.descCharCounter.textContent = `${len} / 1000 characters`;
  });

  // Details Modal
  elements.btnCloseDetailsModal.addEventListener('click', closeDetailsModal);

  // Delete Modal
  elements.btnCancelDelete.addEventListener('click', closeDeleteModal);
  elements.btnConfirmDelete.addEventListener('click', handleConfirmDelete);

  // Close Modals on Backdrop Click or Escape Key
  window.addEventListener('click', (e) => {
    if (e.target === elements.reportModal) closeReportModal();
    if (e.target === elements.detailsModal) closeDetailsModal();
    if (e.target === elements.deleteModal) closeDeleteModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeReportModal();
      closeDetailsModal();
      closeDeleteModal();
    }
  });
}

// ==============================================================================
// 3. API Communication & Data Fetching
// ==============================================================================

/**
 * Check backend API health and MongoDB connection
 */
async function checkBackendHealth() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    if (res.ok && data.status === 'online') {
      elements.apiStatusBadge.classList.remove('error');
      elements.apiStatusBadge.classList.add('connected');
      elements.apiStatusText.textContent = `Online (${data.database})`;
    } else {
      setApiOffline();
    }
  } catch (err) {
    setApiOffline();
  }
}

function setApiOffline() {
  elements.apiStatusBadge.classList.remove('connected');
  elements.apiStatusBadge.classList.add('error');
  elements.apiStatusText.textContent = 'Server Offline';
}

/**
 * Fetch portal statistics for the dashboard cards
 */
async function fetchStatistics() {
  try {
    const res = await fetch('/api/items/stats');
    if (!res.ok) throw new Error('Failed to load stats');

    const result = await res.json();
    if (result.success && result.data) {
      state.stats = result.data;
      updateStatsUI();
    }
  } catch (err) {
    console.warn('Stats fetch warning:', err.message);
  }
}

function updateStatsUI() {
  animateValue(elements.statTotal, state.stats.total);
  animateValue(elements.statLost, state.stats.lost);
  animateValue(elements.statFound, state.stats.found);
  animateValue(elements.statResolved, state.stats.resolved);
}

function animateValue(element, target) {
  if (!element) return;
  element.textContent = target;
}

/**
 * Fetch items list with query filters
 */
async function fetchItems() {
  try {
    renderSkeletonLoading();

    const queryParams = new URLSearchParams();
    if (state.filters.type && state.filters.type !== 'All') {
      queryParams.append('type', state.filters.type);
    }
    if (state.filters.category && state.filters.category !== 'All') {
      queryParams.append('category', state.filters.category);
    }
    if (state.filters.status && state.filters.status !== 'All') {
      queryParams.append('status', state.filters.status);
    }
    if (state.filters.search) {
      queryParams.append('search', state.filters.search);
    }
    if (state.filters.sortBy) {
      queryParams.append('sortBy', state.filters.sortBy);
    }

    const url = `/api/items?${queryParams.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch items`);

    const result = await res.json();
    if (result.success) {
      state.items = result.data || [];
      renderItemsGrid(state.items);
      updateItemsCounter(state.items.length);
    }
  } catch (err) {
    console.error('Error fetching items:', err);
    elements.itemsGrid.innerHTML = `
      <div class="empty-state">
        <h3 class="empty-title">Unable to connect to database</h3>
        <p class="empty-desc">Please ensure the Node.js server and MongoDB connection are running properly.</p>
      </div>
    `;
    elements.itemsCountBadge.textContent = 'Connection error';
  }
}

function updateItemsCounter(count) {
  if (count === 1) {
    elements.itemsCountBadge.textContent = '1 item found';
  } else {
    elements.itemsCountBadge.textContent = `${count} items found`;
  }
}

// ==============================================================================
// 4. UI Rendering: Items Grid & Cards
// ==============================================================================

function renderSkeletonLoading() {
  elements.itemsGrid.innerHTML = `
    <div class="grid-skeleton">
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    </div>
  `;
  elements.emptyState.classList.add('hidden');
}

function renderItemsGrid(items) {
  if (!items || items.length === 0) {
    elements.itemsGrid.innerHTML = '';
    elements.emptyState.classList.remove('hidden');
    return;
  }

  elements.emptyState.classList.add('hidden');

  const cardsHtml = items.map((item) => createItemCardHtml(item)).join('');
  elements.itemsGrid.innerHTML = cardsHtml;

  // Attach card event listeners
  items.forEach((item) => {
    // Details button
    const btnDetails = document.getElementById(`btn-details-${item._id}`);
    if (btnDetails) {
      btnDetails.addEventListener('click', () => openDetailsModal(item));
    }

    // Toggle status button
    const btnToggle = document.getElementById(`btn-toggle-${item._id}`);
    if (btnToggle) {
      btnToggle.addEventListener('click', () => handleToggleStatus(item));
    }

    // Delete button
    const btnDelete = document.getElementById(`btn-delete-${item._id}`);
    if (btnDelete) {
      btnDelete.addEventListener('click', () => openDeleteModal(item._id));
    }
  });
}

function createItemCardHtml(item) {
  const isLost = item.itemType === 'Lost';
  const isResolved = item.status === 'Resolved';
  const categoryIcon = getCategoryIcon(item.category);
  const formattedDate = formatDate(item.date);

  return `
    <article class="item-card ${isResolved ? 'is-resolved' : ''}" id="card-${item._id}">
      <div>
        <!-- Top Bar with Badges -->
        <div class="card-top-bar">
          <div class="card-badges-left">
            <span class="badge ${isLost ? 'badge-lost' : 'badge-found'}">
              ${isLost ? '🔴 LOST' : '🟢 FOUND'}
            </span>
            <span class="badge badge-category">
              ${categoryIcon} ${escapeHtml(item.category)}
            </span>
          </div>
          <span class="badge ${isResolved ? 'badge-status-resolved' : 'badge-status-active'}">
            ${isResolved ? '✓ Resolved' : '● Active'}
          </span>
        </div>

        <!-- Title -->
        <h3 class="card-title">${escapeHtml(item.itemName)}</h3>

        <!-- Description Preview -->
        <p class="card-desc">${escapeHtml(item.description)}</p>

        <!-- Metadata -->
        <div class="card-meta-list">
          <div class="card-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span class="meta-val">${escapeHtml(item.location)}</span>
          </div>

          <div class="card-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span class="meta-val">${formattedDate}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="card-actions">
        <button class="btn-card-details" id="btn-details-${item._id}" title="View full details and contact information">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span>View Details</span>
        </button>

        <button class="btn-card-toggle" id="btn-toggle-${item._id}" title="${isResolved ? 'Mark as Active' : 'Mark as Resolved'}">
          ${isResolved ? 'Reopen' : '✓ Resolve'}
        </button>

        <button class="btn-card-delete" id="btn-delete-${item._id}" title="Delete report" aria-label="Delete">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </article>
  `;
}

// ==============================================================================
// 5. Item Reporting (POST /api/items)
// ==============================================================================

function openReportModal(preselectedType = 'Lost') {
  elements.reportForm.reset();
  clearValidationErrors();

  // Preselect Radio
  const radio = elements.reportForm.querySelector(`input[name="itemType"][value="${preselectedType}"]`);
  if (radio) radio.checked = true;

  // Set today's date
  if (elements.formDate) {
    elements.formDate.value = new Date().toISOString().split('T')[0];
  }

  elements.descCharCounter.textContent = '0 / 1000 characters';
  elements.reportModal.classList.remove('hidden');
  state.activeModal = 'report';

  // Focus on item name input
  setTimeout(() => {
    document.getElementById('form-item-name').focus();
  }, 100);
}

function closeReportModal() {
  elements.reportModal.classList.add('hidden');
  state.activeModal = null;
  clearValidationErrors();
}

async function handleReportFormSubmit(e) {
  e.preventDefault();
  if (state.isSubmitting) return;

  clearValidationErrors();

  const formData = new FormData(elements.reportForm);
  const payload = {
    itemType: formData.get('itemType'),
    itemName: (formData.get('itemName') || '').trim(),
    category: formData.get('category'),
    location: (formData.get('location') || '').trim(),
    date: formData.get('date'),
    description: (formData.get('description') || '').trim(),
    contactName: (formData.get('contactName') || '').trim(),
    contactDetails: (formData.get('contactDetails') || '').trim()
  };

  // Client Validation
  let hasError = false;
  if (!payload.itemName) {
    setFieldError('itemName', 'Item name is required');
    hasError = true;
  }
  if (!payload.category) {
    setFieldError('category', 'Please select a category');
    hasError = true;
  }
  if (!payload.location) {
    setFieldError('location', 'Campus location is required');
    hasError = true;
  }
  if (!payload.date) {
    setFieldError('date', 'Date is required');
    hasError = true;
  }
  if (!payload.description) {
    setFieldError('description', 'Description is required');
    hasError = true;
  }
  if (!payload.contactName) {
    setFieldError('contactName', 'Contact person name is required');
    hasError = true;
  }
  if (!payload.contactDetails) {
    setFieldError('contactDetails', 'Contact details (phone or email) are required');
    hasError = true;
  }

  if (hasError) return;

  // Submit via API
  try {
    setSubmittingState(true);
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.message || 'Failed to submit report');
    }

    showToast(result.message || 'Item reported successfully!', 'success');
    closeReportModal();
    fetchStatistics();
    fetchItems();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    setSubmittingState(false);
  }
}

function setSubmittingState(isSubmitting) {
  state.isSubmitting = isSubmitting;
  if (isSubmitting) {
    elements.btnSubmitReport.disabled = true;
    elements.submitSpinner.classList.remove('hidden');
    elements.submitBtnText.textContent = 'Submitting...';
  } else {
    elements.btnSubmitReport.disabled = false;
    elements.submitSpinner.classList.add('hidden');
    elements.submitBtnText.textContent = 'Submit Report';
  }
}

function setFieldError(fieldId, message) {
  const input = document.getElementById(`form-${fieldId}`) || document.getElementById(`form-item-name`);
  const errSpan = document.getElementById(`err-${fieldId}`);
  if (input) input.classList.add('is-invalid');
  if (errSpan) errSpan.textContent = message;
}

function clearValidationErrors() {
  document.querySelectorAll('.form-control').forEach((ctrl) => ctrl.classList.remove('is-invalid'));
  document.querySelectorAll('.error-msg').forEach((span) => (span.textContent = ''));
}

// ==============================================================================
// 6. Item Details Modal (GET & Display)
// ==============================================================================

async function openDetailsModal(item) {
  state.activeItemDetails = item;
  const isLost = item.itemType === 'Lost';
  const isResolved = item.status === 'Resolved';
  const categoryIcon = getCategoryIcon(item.category);

  // Badges
  elements.detailsBadgesContainer.innerHTML = `
    <span class="badge ${isLost ? 'badge-lost' : 'badge-found'}">
      ${isLost ? '🔴 LOST' : '🟢 FOUND'}
    </span>
    <span class="badge badge-category">
      ${categoryIcon} ${escapeHtml(item.category)}
    </span>
    <span class="badge ${isResolved ? 'badge-status-resolved' : 'badge-status-active'}" id="modal-status-badge">
      ${isResolved ? '✓ Resolved' : '● Active'}
    </span>
  `;

  // Body
  elements.detailsModalBody.innerHTML = `
    <h2 class="details-modal-title" id="modal-details-title">${escapeHtml(item.itemName)}</h2>
    <div class="details-modal-desc">${escapeHtml(item.description)}</div>

    <div class="details-info-grid">
      <div class="info-pill-item">
        <div class="info-pill-icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
        <div class="info-pill-text">
          <span class="info-pill-label">Campus Location</span>
          <span class="info-pill-value">${escapeHtml(item.location)}</span>
        </div>
      </div>

      <div class="info-pill-item">
        <div class="info-pill-icon">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="info-pill-text">
          <span class="info-pill-label">Date Reported</span>
          <span class="info-pill-value">${formatDate(item.date)}</span>
        </div>
      </div>
    </div>

    <!-- Contact Person Card -->
    <div class="contact-highlight-card">
      <div class="contact-card-header">
        <span class="contact-role-tag">
          ${isLost ? 'Person Who Lost This Item' : 'Finder / Custodian Contact'}
        </span>
      </div>

      <div class="contact-name-row">
        <div class="contact-avatar">
          ${escapeHtml(item.contactName.charAt(0).toUpperCase())}
        </div>
        <span class="contact-name-val">${escapeHtml(item.contactName)}</span>
      </div>

      <div class="contact-detail-row">
        <span class="contact-detail-text" id="contact-text-val">${escapeHtml(item.contactDetails)}</span>
        <button class="btn-copy-contact" id="btn-copy-contact" title="Copy to clipboard">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span id="copy-btn-text">Copy</span>
        </button>
      </div>
    </div>
  `;

  // Footer Buttons
  elements.detailsModalFooter.innerHTML = `
    <button class="btn btn-outline" id="btn-details-toggle">
      ${isResolved ? 'Reopen Report' : 'Mark As Resolved'}
    </button>
    <button class="btn btn-danger" id="btn-details-delete">
      Delete Report
    </button>
  `;

  // Attach event handlers inside details modal
  const btnCopy = document.getElementById('btn-copy-contact');
  btnCopy.addEventListener('click', () => copyToClipboard(item.contactDetails));

  const btnDetailsToggle = document.getElementById('btn-details-toggle');
  btnDetailsToggle.addEventListener('click', async () => {
    await handleToggleStatus(item);
    closeDetailsModal();
  });

  const btnDetailsDelete = document.getElementById('btn-details-delete');
  btnDetailsDelete.addEventListener('click', () => {
    closeDetailsModal();
    openDeleteModal(item._id);
  });

  elements.detailsModal.classList.remove('hidden');
  state.activeModal = 'details';
}

function closeDetailsModal() {
  elements.detailsModal.classList.add('hidden');
  state.activeModal = null;
  state.activeItemDetails = null;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(
    () => {
      const copyTextSpan = document.getElementById('copy-btn-text');
      if (copyTextSpan) {
        copyTextSpan.textContent = 'Copied!';
        setTimeout(() => {
          if (copyTextSpan) copyTextSpan.textContent = 'Copy';
        }, 2000);
      }
      showToast('Contact info copied to clipboard!', 'info');
    },
    () => {
      showToast('Could not copy contact info', 'error');
    }
  );
}

// ==============================================================================
// 7. Toggle Status (Active <-> Resolved) (PUT /api/items/:id)
// ==============================================================================

async function handleToggleStatus(item) {
  const newStatus = item.status === 'Resolved' ? 'Active' : 'Resolved';

  try {
    const res = await fetch(`/api/items/${item._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.message || 'Failed to update status');
    }

    showToast(
      `Item marked as ${newStatus.toLowerCase()}!`,
      newStatus === 'Resolved' ? 'success' : 'info'
    );

    // Refresh data
    fetchStatistics();
    fetchItems();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ==============================================================================
// 8. Delete Report Flow (DELETE /api/items/:id)
// ==============================================================================

function openDeleteModal(itemId) {
  state.itemToDeleteId = itemId;
  elements.deleteModal.classList.remove('hidden');
  state.activeModal = 'delete';
}

function closeDeleteModal() {
  elements.deleteModal.classList.add('hidden');
  state.activeModal = null;
  state.itemToDeleteId = null;
}

async function handleConfirmDelete() {
  if (!state.itemToDeleteId) return;

  try {
    elements.btnConfirmDelete.disabled = true;
    elements.btnConfirmDelete.textContent = 'Deleting...';

    const res = await fetch(`/api/items/${state.itemToDeleteId}`, {
      method: 'DELETE'
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.message || 'Failed to delete report');
    }

    showToast('Report deleted successfully', 'info');
    closeDeleteModal();
    fetchStatistics();
    fetchItems();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    elements.btnConfirmDelete.disabled = false;
    elements.btnConfirmDelete.textContent = 'Delete Report';
  }
}

// ==============================================================================
// 9. Demo Data Seeder (POST /api/items/seed)
// ==============================================================================

async function handleSeedData() {
  try {
    elements.btnQuickSeed.disabled = true;
    showToast('Loading demo college data...', 'info');

    const res = await fetch('/api/items/seed?force=true', {
      method: 'POST'
    });

    const result = await res.json();
    if (res.ok && result.success) {
      showToast(result.message || 'Demo college items loaded!', 'success');
      fetchStatistics();
      fetchItems();
    } else {
      showToast(result.message || 'Could not seed data', 'error');
    }
  } catch (err) {
    showToast('Error connecting to database to seed data', 'error');
  } finally {
    elements.btnQuickSeed.disabled = false;
  }
}

// ==============================================================================
// 10. Filter Helpers & Reset
// ==============================================================================

function handleHeroSearch() {
  const val = elements.heroSearchInput.value.trim();
  elements.filterSearchInput.value = val;
  state.filters.search = val;

  if (val) {
    elements.btnClearSearch.classList.remove('hidden');
  }

  fetchItems();
  elements.itemsSection.scrollIntoView({ behavior: 'smooth' });
}

function resetAllFilters() {
  state.filters = {
    search: '',
    type: 'All',
    category: 'All',
    status: 'All',
    sortBy: 'newest'
  };

  // Reset inputs
  elements.filterSearchInput.value = '';
  elements.heroSearchInput.value = '';
  elements.btnClearSearch.classList.add('hidden');
  elements.filterCategory.value = 'All';
  elements.filterStatus.value = 'All';
  elements.filterSort.value = 'newest';

  elements.typePills.forEach((pill) => {
    if (pill.getAttribute('data-type') === 'All') {
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
    } else {
      pill.classList.remove('active');
      pill.setAttribute('aria-selected', 'false');
    }
  });

  fetchItems();
  showToast('Filters reset to default', 'info');
}

// ==============================================================================
// 11. Toast Notification System
// ==============================================================================

function showToast(message, type = 'info', duration = 3800) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg = getToastIconSvg(type);

  toast.innerHTML = `
    <span class="toast-icon">${iconSvg}</span>
    <div class="toast-body">${escapeHtml(message)}</div>
    <button class="toast-close" aria-label="Close notification">&times;</button>
  `;

  elements.toastContainer.appendChild(toast);

  // Click to close
  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => removeToast(toast));

  // Auto dismiss
  setTimeout(() => removeToast(toast), duration);
}

function removeToast(toast) {
  toast.classList.add('toast-leave');
  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 250);
}

function getToastIconSvg(type) {
  switch (type) {
    case 'success':
      return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    case 'error':
      return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }
}

// ==============================================================================
// 12. Helper Utilities
// ==============================================================================

function getCategoryIcon(cat) {
  switch (cat) {
    case 'Electronics': return '⚡';
    case 'Documents & IDs': return '🪪';
    case 'Wallets & Bags': return '👛';
    case 'Keys': return '🔑';
    case 'Books & Stationery': return '📚';
    case 'Clothing & Accessories': return '👕';
    default: return '📦';
  }
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown date';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'Unknown date';

  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  if (isToday) return 'Reported Today';

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
