/**
 * ApexCare International Healthcare Booking System
 * Client Showcase & Turnkey Clinical Portal Engine
 * Engineered by Philip Maina (@Kivice)
 */

document.addEventListener('DOMContentLoaded', () => {
  initClientThemeSwitcher();
  initNavigation();
  initQuickBooking();
  initAppointmentEngine();
  initServicesFilter();
  initDoctorsFilter();
  initContactForm();
  initTestimonialsEngine();
  highlightActiveNav();
});

/* ==========================================================================
   Shared Helpers: Escaping & Inline Vector Icons
   ========================================================================== */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getSvgIcon(name, className = 'icon icon-sm') {
  const paths = {
    check: '<path d="M20 6 9 17l-5-5"></path>',
    alert: '<circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path>',
    menu: '<path d="M4 6h16"></path><path d="M4 12h16"></path><path d="M4 18h16"></path>',
    close: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
    printer: '<path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>'
  };
  const body = paths[name] || '';
  const extraAttrs = name === 'star' ? 'viewBox="0 0 24 24"' : 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  return `<svg class="${escapeHtml(className)}" aria-hidden="true" ${extraAttrs}>${body}</svg>`;
}

function renderStarsHtml(rating) {
  const count = Math.max(1, Math.min(5, Number(rating) || 5));
  let html = '';
  for (let i = 1; i <= 5; i += 1) {
    html += getSvgIcon('star', i <= count ? 'icon star-icon' : 'icon star-icon star-icon--muted');
  }
  return html;
}

/* ==========================================================================
   Multi-Theme Switcher (White-Label Client Preview)
   ========================================================================== */
function initClientThemeSwitcher() {
  const savedTheme = localStorage.getItem('apex_client_theme') || 'blue';
  document.documentElement.setAttribute('data-client-theme', savedTheme);

  const themeNames = {
    blue: 'Clinical Sky (Default)',
    emerald: 'Medical Emerald',
    indigo: 'Healthtech Indigo',
    rose: 'Care Crimson'
  };

  const swatches = document.querySelectorAll('.theme-swatch');
  swatches.forEach((swatch) => {
    const theme = swatch.getAttribute('data-theme');
    const isSelected = theme === savedTheme;
    swatch.classList.toggle('active', isSelected);
    swatch.setAttribute('aria-pressed', String(isSelected));

    swatch.addEventListener('click', () => {
      swatches.forEach((s) => {
        s.classList.remove('active');
        s.setAttribute('aria-pressed', 'false');
      });
      swatch.classList.add('active');
      swatch.setAttribute('aria-pressed', 'true');
      document.documentElement.setAttribute('data-client-theme', theme);
      localStorage.setItem('apex_client_theme', theme);
      showToast(`Theme applied: ${themeNames[theme] || theme}`);
    });
  });
}

/* ==========================================================================
   Navigation & Responsive Mobile Menu
   ========================================================================== */
function initNavigation() {
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggle || !navLinks) return;

  const setMenuState = (open) => {
    navLinks.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.innerHTML = getSvgIcon(open ? 'close' : 'menu', 'icon icon-md');
  };

  setMenuState(false);

  toggle.addEventListener('click', () => {
    setMenuState(!navLinks.classList.contains('open'));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        setMenuState(false);
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('open')) {
      setMenuState(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      setMenuState(false);
    }
  });
}

function highlightActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.nav-link');
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/* ==========================================================================
   Toast Notification System
   ========================================================================== */
let toastTimer = null;

function showToast(message, options = {}) {
  const opts = typeof options === 'number' ? { duration: options } : options;
  const duration = opts.duration || 4000;
  const isError = opts.type === 'error';

  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.classList.toggle('toast--error', isError);
  toast.innerHTML = `
    <span class="toast__icon">${getSvgIcon(isError ? 'alert' : 'check', 'icon icon-md')}</span>
    <span>${escapeHtml(message)}</span>
  `;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/* ==========================================================================
   Quick Booking Bar (index.html)
   ========================================================================== */
function initQuickBooking() {
  const quickForm = document.getElementById('quickBookingForm');
  if (!quickForm) return;

  const quickDate = document.getElementById('quickDate');
  if (quickDate) {
    const today = new Date().toISOString().split('T')[0];
    quickDate.min = today;
    if (!quickDate.value) quickDate.value = today;
  }

  quickForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const dept = document.getElementById('quickDept')?.value || 'general';
    const doctor = document.getElementById('quickDoctor')?.value || 'Dr. John Doe';
    const date = quickDate?.value || '';
    const mode = document.getElementById('quickMode')?.value || '';

    sessionStorage.setItem('apex_prefill_dept', dept);
    sessionStorage.setItem('apex_prefill_doctor', doctor);
    if (date) sessionStorage.setItem('apex_prefill_date', date);
    if (mode) sessionStorage.setItem('apex_prefill_mode', mode);

    window.location.href = 'appointment.html';
  });
}

/* ==========================================================================
   Interactive Appointment Scheduler (appointment.html)
   ========================================================================== */
function initAppointmentEngine() {
  const form = document.getElementById('appointmentForm');
  if (!form) return;

  const deptSelect = document.getElementById('deptSelect');
  const doctorSelect = document.getElementById('doctorSelect');
  const dateInput = document.getElementById('dateInput');
  const timeInput = document.getElementById('selectedTime');
  const slotButtons = document.querySelectorAll('.slot-btn');
  const modeRadios = document.querySelectorAll('input[name="consultationMode"]');
  const autoFillBtn = document.getElementById('autoFillDemoBtn');
  const clearFormBtn = document.getElementById('clearDemoBtn');
  const summaryCard = document.querySelector('.summary-card');

  const sumDept = document.getElementById('sumDept');
  const sumDoctor = document.getElementById('sumDoctor');
  const sumDate = document.getElementById('sumDate');
  const sumTime = document.getElementById('sumTime');
  const sumMode = document.getElementById('sumMode');

  const doctorsData = {
    general: [
      { id: 'doe', name: 'Dr. John Doe', title: 'Chief Medical Officer - Internal Medicine', fee: '$120' }
    ],
    cardiology: [
      { id: 'brown', name: 'Dr. Michael Brown', title: 'Senior Cardiologist - Interventional Cardiology', fee: '$160' }
    ],
    pediatrics: [
      { id: 'johnson', name: 'Dr. Emily Johnson', title: 'Pediatric Specialist & Child Health', fee: '$110' }
    ],
    surgery: [
      { id: 'smith', name: 'Dr. Jane Smith', title: 'Senior Orthopedic & Trauma Surgeon', fee: '$180' }
    ],
    diagnostics: [
      { id: 'doe', name: 'Dr. John Doe', title: 'Clinical Diagnostics Lead', fee: '$95' }
    ],
    emergency: [
      { id: 'smith', name: 'Dr. Jane Smith', title: 'Emergency Triage & Trauma Lead', fee: '$150' }
    ]
  };

  const prefillDept = sessionStorage.getItem('apex_prefill_dept');
  let pendingPrefillDoctor = sessionStorage.getItem('apex_prefill_doctor');
  const prefillDate = sessionStorage.getItem('apex_prefill_date');
  const prefillMode = sessionStorage.getItem('apex_prefill_mode');

  if (prefillDept && deptSelect) {
    const target = prefillDept.toLowerCase();
    for (const opt of deptSelect.options) {
      if (opt.value.toLowerCase() === target || opt.text.toLowerCase().includes(target)) {
        deptSelect.value = opt.value;
        break;
      }
    }
  }

  const today = new Date().toISOString().split('T')[0];
  if (dateInput) {
    dateInput.min = today;
    dateInput.value = prefillDate || today;
  }

  function syncModeSelection() {
    let activeVal = 'In-Person Hospital Visit';
    modeRadios.forEach((radio) => {
      const label = radio.closest('.mode-option');
      if (label) label.classList.toggle('is-selected', radio.checked);
      if (radio.checked) activeVal = radio.value;
    });
    if (sumMode) sumMode.textContent = activeVal;
  }

  if (prefillMode && modeRadios.length) {
    const modeNeedle = prefillMode.toLowerCase();
    modeRadios.forEach((radio) => {
      if (radio.value.toLowerCase().includes(modeNeedle)) {
        radio.checked = true;
      }
    });
  }
  syncModeSelection();

  function selectSlot(timeVal) {
    slotButtons.forEach((b) => {
      const btnTime = b.getAttribute('data-time') || b.textContent.trim();
      b.classList.toggle('selected', btnTime === timeVal);
    });
    if (timeInput) timeInput.value = timeVal;
    if (sumTime) sumTime.textContent = timeVal;
  }

  function updateSummary() {
    if (sumDept && deptSelect) {
      sumDept.textContent = deptSelect.options[deptSelect.selectedIndex]?.text.split('(')[0].trim() || 'Selected Department';
    }
    if (sumDoctor && doctorSelect) {
      const selectedOpt = doctorSelect.options[doctorSelect.selectedIndex];
      const fee = selectedOpt?.getAttribute('data-fee');
      sumDoctor.textContent = fee ? `${doctorSelect.value} (${fee})` : (doctorSelect.value || 'Dr. John Doe');
    }
    if (sumDate && dateInput) {
      sumDate.textContent = dateInput.value || today;
    }
  }

  function updateDoctors() {
    if (!deptSelect || !doctorSelect) return;
    const doctors = doctorsData[deptSelect.value] || doctorsData.general;

    doctorSelect.innerHTML = '';
    doctors.forEach((doc) => {
      const opt = document.createElement('option');
      opt.value = doc.name;
      opt.textContent = `${doc.name} (${doc.fee})`;
      opt.setAttribute('data-fee', doc.fee);
      doctorSelect.appendChild(opt);
    });

    if (doctors.length > 0) {
      doctorSelect.value = doctors[0].name;
    }

    if (pendingPrefillDoctor) {
      for (const opt of doctorSelect.options) {
        if (opt.value.includes(pendingPrefillDoctor)) {
          doctorSelect.value = opt.value;
          break;
        }
      }
      pendingPrefillDoctor = null;
    }

    updateSummary();
  }

  slotButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const timeVal = btn.getAttribute('data-time') || btn.textContent.trim();
      selectSlot(timeVal);
    });
  });

  modeRadios.forEach((radio) => {
    radio.addEventListener('change', syncModeSelection);
  });

  if (deptSelect) deptSelect.addEventListener('change', updateDoctors);
  if (doctorSelect) doctorSelect.addEventListener('change', updateSummary);
  if (dateInput) dateInput.addEventListener('change', updateSummary);

  updateDoctors();
  updateSummary();
  renderLocalBookings();

  sessionStorage.removeItem('apex_prefill_dept');
  sessionStorage.removeItem('apex_prefill_doctor');
  sessionStorage.removeItem('apex_prefill_date');
  sessionStorage.removeItem('apex_prefill_mode');

  if (autoFillBtn) {
    autoFillBtn.addEventListener('click', () => {
      if (deptSelect) deptSelect.value = 'cardiology';
      updateDoctors();
      if (doctorSelect) doctorSelect.value = 'Dr. Michael Brown';

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (dateInput) dateInput.value = tomorrow.toISOString().split('T')[0];

      selectSlot('10:30 AM');

      const nameInput = document.getElementById('patientName');
      const phoneInput = document.getElementById('patientPhone');
      const emailInput = document.getElementById('patientEmail');
      const notesInput = document.getElementById('patientNotes');

      if (nameInput) nameInput.value = 'Sarah Mwangi';
      if (phoneInput) phoneInput.value = '+254 712 345 678';
      if (emailInput) emailInput.value = 'sarah.mwangi@example.com';
      if (notesInput) notesInput.value = 'Annual cardiovascular wellness checkup and ECG diagnostic review.';

      updateSummary();

      if (summaryCard) {
        summaryCard.classList.add('pulse-highlight');
        setTimeout(() => summaryCard.classList.remove('pulse-highlight'), 1800);
      }

      showToast('Sample patient profile populated. Review the voucher preview and confirm below.');
    });
  }

  if (clearFormBtn) {
    clearFormBtn.addEventListener('click', () => {
      form.reset();
      if (dateInput) dateInput.value = today;
      selectSlot('09:00 AM');
      syncModeSelection();
      updateDoctors();
      updateSummary();
      showToast('Scheduler form reset.');
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameEl = document.getElementById('patientName');
    const emailEl = document.getElementById('patientEmail');
    const phoneEl = document.getElementById('patientPhone');

    const name = nameEl?.value.trim();
    const email = emailEl?.value.trim();
    const phone = phoneEl?.value.trim();
    const dept = deptSelect?.options[deptSelect.selectedIndex]?.text.split('(')[0].trim() || 'General Medicine';
    const doctor = doctorSelect?.value || 'Dr. John Doe';
    const date = dateInput?.value || today;
    const time = timeInput?.value || '09:00 AM';
    const mode = document.querySelector('input[name="consultationMode"]:checked')?.value || 'In-Person Hospital Visit';
    const notes = document.getElementById('patientNotes')?.value.trim() || 'No additional notes provided.';

    if (!name || !email || !phone) {
      showToast('Please enter patient full name, phone number, and email address.', { type: 'error' });
      (!name ? nameEl : !phone ? phoneEl : emailEl)?.focus();
      return;
    }

    const ticketId = 'APX-' + Math.floor(10000 + Math.random() * 90000);
    const appointmentData = {
      id: ticketId,
      name,
      email,
      phone,
      dept,
      doctor,
      date,
      time,
      mode,
      notes,
      createdAt: new Date().toISOString()
    };

    const saved = JSON.parse(localStorage.getItem('apex_appointments') || '[]');
    saved.unshift(appointmentData);
    localStorage.setItem('apex_appointments', JSON.stringify(saved));

    renderLocalBookings();
    showConfirmationModal(appointmentData);
    showToast(`Appointment confirmed: ${ticketId}`);
  });
}

function renderLocalBookings() {
  const list = document.getElementById('localBookingsList');
  if (!list) return;

  const saved = JSON.parse(localStorage.getItem('apex_appointments') || '[]');
  if (saved.length === 0) {
    list.innerHTML = '<div class="booking-history-empty">No appointments generated in this browser session yet.</div>';
    return;
  }

  list.innerHTML = saved.slice(0, 3).map((a) => `
    <div class="booking-history-item">
      <span class="booking-history-id">${escapeHtml(a.id)}</span> — ${escapeHtml(a.doctor)}
      <span class="booking-history-meta">${escapeHtml(a.date)} at ${escapeHtml(a.time)} · ${escapeHtml(a.dept)}</span>
    </div>
  `).join('');
}

function showConfirmationModal(app) {
  let modalBackdrop = document.getElementById('confirmationModal');
  if (!modalBackdrop) {
    modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'confirmationModal';
    modalBackdrop.className = 'modal-backdrop';
    modalBackdrop.setAttribute('role', 'dialog');
    modalBackdrop.setAttribute('aria-modal', 'true');
    modalBackdrop.setAttribute('aria-labelledby', 'confirmationModalTitle');
    document.body.appendChild(modalBackdrop);

    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeConfirmationModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) {
        closeConfirmationModal();
      }
    });
  }

  modalBackdrop.innerHTML = `
    <div class="modal-box">
      <button type="button" class="modal-close" aria-label="Close confirmation dialog" onclick="closeConfirmationModal()">
        ${getSvgIcon('close', 'icon icon-md')}
      </button>

      <div class="modal-confirm-header">
        <div class="modal-confirm-icon">
          ${getSvgIcon('check', 'icon icon-lg')}
        </div>
        <h3 id="confirmationModalTitle" class="modal-confirm-title">Appointment Voucher Issued</h3>
        <p class="modal-confirm-sub">Template Client Demonstration Slip</p>
      </div>

      <div class="ticket-container">
        <div class="ticket-label">Verification Reference</div>
        <div class="ticket-code">${escapeHtml(app.id)}</div>
        <div class="ticket-grid">
          <div>
            <span class="ticket-field-label">Patient</span>
            <strong>${escapeHtml(app.name)}</strong>
          </div>
          <div>
            <span class="ticket-field-label">Practitioner</span>
            <strong>${escapeHtml(app.doctor)}</strong>
          </div>
          <div>
            <span class="ticket-field-label">Department</span>
            <strong>${escapeHtml(app.dept)}</strong>
          </div>
          <div>
            <span class="ticket-field-label">Schedule</span>
            <strong>${escapeHtml(app.date)} @ ${escapeHtml(app.time)}</strong>
          </div>
        </div>
        <div class="ticket-footer">
          <span>Mode: ${escapeHtml(app.mode)}</span>
          <span class="ticket-verified">Verified Template Demo</span>
        </div>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn btn-primary" onclick="window.print()">
          ${getSvgIcon('printer', 'icon icon-sm')} Print Slip
        </button>
        <button type="button" class="btn btn-secondary" onclick="closeConfirmationModal()">Done</button>
      </div>
    </div>
  `;

  modalBackdrop.classList.add('open');
}

window.closeConfirmationModal = function closeConfirmationModal() {
  const modal = document.getElementById('confirmationModal');
  if (modal) modal.classList.remove('open');
};

/* ==========================================================================
   Services Filter (services.html)
   ========================================================================== */
function initServicesFilter() {
  const tabs = document.querySelectorAll('.service-tab');
  const cards = document.querySelectorAll('.service-card');

  if (!tabs.length || !cards.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      cards.forEach((card) => {
        const category = card.getAttribute('data-category');
        card.style.display = (filter === 'all' || category === filter) ? '' : 'none';
      });
    });
  });
}

/* ==========================================================================
   Doctors Filter (meet.html)
   ========================================================================== */
function initDoctorsFilter() {
  const tabs = document.querySelectorAll('.doctor-tab');
  const cards = document.querySelectorAll('.doctor-card');

  if (!tabs.length || !cards.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-specialty');
      cards.forEach((card) => {
        const spec = card.getAttribute('data-specialty');
        card.style.display = (filter === 'all' || spec === filter) ? '' : 'none';
      });
    });
  });
}

/* ==========================================================================
   Contact Form (contact.html)
   ========================================================================== */
function initContactForm() {
  const contactForm = document.getElementById('directContactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameEl = document.getElementById('cName');
    const emailEl = document.getElementById('cEmail');
    const messageEl = document.getElementById('cMessage');

    const name = nameEl?.value.trim();
    const email = emailEl?.value.trim();
    const message = messageEl?.value.trim();

    if (!name || !email || !message) {
      showToast('Please fill out name, email, and message details.', { type: 'error' });
      (!name ? nameEl : !email ? emailEl : messageEl)?.focus();
      return;
    }

    showToast(`Inquiry dispatched! In production, this triggers a webhook or confirmation to ${email}.`);
    contactForm.reset();
  });
}

/* ==========================================================================
   Testimonials Engine (testimonials.html)
   ========================================================================== */
function initTestimonialsEngine() {
  const form = document.getElementById('addTestimonialForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameEl = document.getElementById('tName');
    const countryEl = document.getElementById('tCountry');
    const deptEl = document.getElementById('tDept');
    const ratingEl = document.getElementById('tRating');
    const messageEl = document.getElementById('tMessage');

    const name = nameEl?.value.trim();
    const country = countryEl?.value.trim();
    const dept = deptEl?.value.trim();
    const rating = ratingEl?.value || '5';
    const message = messageEl?.value.trim();

    if (!name || !country || !message) {
      showToast('Please fill out name, location, and review experience.', { type: 'error' });
      (!name ? nameEl : !country ? countryEl : messageEl)?.focus();
      return;
    }

    const newTestimonial = {
      name,
      country,
      dept,
      rating: parseInt(rating, 10) || 5,
      message,
      date: 'Demo Submission'
    };

    const saved = JSON.parse(localStorage.getItem('apex_user_testimonials') || '[]');
    saved.unshift(newTestimonial);
    localStorage.setItem('apex_user_testimonials', JSON.stringify(saved));

    showToast('Patient review added to this demo session.');
    form.reset();
    renderCustomTestimonials();
  });

  renderCustomTestimonials();
}

function renderCustomTestimonials() {
  const container = document.getElementById('customTestimonialsContainer');
  if (!container) return;

  const saved = JSON.parse(localStorage.getItem('apex_user_testimonials') || '[]');
  if (saved.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = saved.map((t) => `
    <article class="testimonial-card">
      <div class="testimonial-top-row">
        <div class="testimonial-stars" aria-label="${escapeHtml(t.rating)} out of 5 stars">
          ${renderStarsHtml(t.rating)}
        </div>
        <span class="testimonial-dept-tag">Verified · ${escapeHtml(t.dept || 'Clinical Care')}</span>
      </div>
      <p class="testimonial-quote">"${escapeHtml(t.message)}"</p>
      <div class="testimonial-author">
        <div class="author-avatar-fallback" aria-hidden="true">${escapeHtml(t.name.charAt(0).toUpperCase())}</div>
        <div>
          <div class="author-name">${escapeHtml(t.name)}</div>
          <div class="author-location">${escapeHtml(t.country)} · ${escapeHtml(t.date)}</div>
        </div>
      </div>
    </article>
  `).join('');
}
