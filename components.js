/**
 * ApexCare International Healthcare Booking System
 * Interactive Client Engine & Appointment Scheduler
 * Built with vanilla ES6+ for performance and reliability
 * Engineered by Philip Maina (@Kivice)
 */

document.addEventListener('DOMContentLoaded', () => {
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
   Navigation & Mobile Menu
   ========================================================================== */
function initNavigation() {
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
      toggle.textContent = isOpen ? '✕' : '☰';
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        toggle.textContent = '☰';
      }
    });
  }
}

function highlightActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
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
function showToast(message, duration = 4000) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<span>✓</span><span>${message}</span>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/* ==========================================================================
   Quick Booking on Homepage
   ========================================================================== */
function initQuickBooking() {
  const quickForm = document.getElementById('quickBookingForm');
  if (!quickForm) return;

  quickForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const dept = document.getElementById('quickDept')?.value || 'General Consultation';
    const doctor = document.getElementById('quickDoctor')?.value || 'Dr. John Doe';
    const date = document.getElementById('quickDate')?.value || '';

    // Store in sessionStorage to pre-populate appointment.html
    sessionStorage.setItem('apex_prefill_dept', dept);
    sessionStorage.setItem('apex_prefill_doctor', doctor);
    if (date) sessionStorage.setItem('apex_prefill_date', date);

    window.location.href = 'appointment.html';
  });
}

/* ==========================================================================
   Full Interactive Appointment Scheduler (appointment.html)
   ========================================================================== */
function initAppointmentEngine() {
  const form = document.getElementById('appointmentForm');
  if (!form) return;

  const deptSelect = document.getElementById('deptSelect');
  const doctorSelect = document.getElementById('doctorSelect');
  const dateInput = document.getElementById('dateInput');
  const timeInput = document.getElementById('selectedTime');
  const slotButtons = document.querySelectorAll('.slot-btn');

  // Summary Elements
  const sumDept = document.getElementById('sumDept');
  const sumDoctor = document.getElementById('sumDoctor');
  const sumDate = document.getElementById('sumDate');
  const sumTime = document.getElementById('sumTime');
  const sumMode = document.getElementById('sumMode');

  // Doctor database mapping
  const doctorsData = {
    'general': [
      { id: 'doe', name: 'Dr. John Doe', title: 'Chief Medical Officer - Internal Medicine', fee: '$120' }
    ],
    'cardiology': [
      { id: 'brown', name: 'Dr. Michael Brown', title: 'Senior Cardiologist - Interventional Cardiology', fee: '$160' }
    ],
    'pediatrics': [
      { id: 'johnson', name: 'Dr. Emily Johnson', title: 'Pediatric Specialist & Child Health', fee: '$110' }
    ],
    'surgery': [
      { id: 'smith', name: 'Dr. Jane Smith', title: 'Senior Orthopedic & Trauma Surgeon', fee: '$180' }
    ],
    'diagnostics': [
      { id: 'doe', name: 'Dr. John Doe', title: 'Clinical Diagnostics Lead', fee: '$95' }
    ],
    'emergency': [
      { id: 'smith', name: 'Dr. Jane Smith', title: 'Emergency Triage & Trauma Lead', fee: '$150' }
    ]
  };

  // Pre-fill from sessionStorage if arriving from another page
  const prefillDept = sessionStorage.getItem('apex_prefill_dept');
  const prefillDoctor = sessionStorage.getItem('apex_prefill_doctor');
  const prefillDate = sessionStorage.getItem('apex_prefill_date');

  if (prefillDept && deptSelect) {
    for (let opt of deptSelect.options) {
      if (opt.text.toLowerCase().includes(prefillDept.toLowerCase())) {
        deptSelect.value = opt.value;
        break;
      }
    }
  }

  // Set minimum date to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    if (prefillDate) {
      dateInput.value = prefillDate;
    } else {
      dateInput.value = today;
    }
  }

  // Function to update doctor options based on department
  function updateDoctors() {
    if (!deptSelect || !doctorSelect) return;
    const selectedDept = deptSelect.value;
    const doctors = doctorsData[selectedDept] || doctorsData['general'];

    doctorSelect.innerHTML = '';
    doctors.forEach(doc => {
      const opt = document.createElement('option');
      opt.value = doc.name;
      opt.textContent = `${doc.name} (${doc.fee})`;
      opt.setAttribute('data-fee', doc.fee);
      doctorSelect.appendChild(opt);
    });

    if (prefillDoctor) {
      for (let opt of doctorSelect.options) {
        if (opt.value.includes(prefillDoctor)) {
          doctorSelect.value = opt.value;
          break;
        }
      }
    }

    updateSummary();
  }

  // Slot buttons selection
  slotButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      slotButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const timeVal = btn.getAttribute('data-time') || btn.textContent.trim();
      if (timeInput) timeInput.value = timeVal;
      if (sumTime) sumTime.textContent = timeVal;
    });
  });

  // Mode radio buttons
  const modeRadios = document.querySelectorAll('input[name="consultationMode"]');
  modeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (sumMode) sumMode.textContent = radio.value;
    });
  });

  function updateSummary() {
    if (sumDept && deptSelect) {
      sumDept.textContent = deptSelect.options[deptSelect.selectedIndex]?.text.split('(')[0] || 'Selected Department';
    }
    if (sumDoctor && doctorSelect) {
      sumDoctor.textContent = doctorSelect.value || 'Dr. John Doe';
    }
    if (sumDate && dateInput) {
      sumDate.textContent = dateInput.value || 'Select Date';
    }
  }

  if (deptSelect) deptSelect.addEventListener('change', updateDoctors);
  if (doctorSelect) doctorSelect.addEventListener('change', updateSummary);
  if (dateInput) dateInput.addEventListener('change', updateSummary);

  // Initialize once
  updateDoctors();
  updateSummary();

  // Clear session storage prefill
  sessionStorage.removeItem('apex_prefill_dept');
  sessionStorage.removeItem('apex_prefill_doctor');
  sessionStorage.removeItem('apex_prefill_date');

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('patientName')?.value.trim();
    const email = document.getElementById('patientEmail')?.value.trim();
    const phone = document.getElementById('patientPhone')?.value.trim();
    const dept = deptSelect?.options[deptSelect.selectedIndex]?.text.split('(')[0].trim() || 'General';
    const doctor = doctorSelect?.value || 'Dr. John Doe';
    const date = dateInput?.value || new Date().toISOString().split('T')[0];
    const time = timeInput?.value || '09:00 AM';
    const mode = document.querySelector('input[name="consultationMode"]:checked')?.value || 'In-Person Consultation';
    const notes = document.getElementById('patientNotes')?.value.trim() || 'No additional notes provided.';

    if (!name || !email || !phone) {
      alert('Please fill out all required contact fields.');
      return;
    }

    // Generate unique clinical appointment ticket
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

    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem('apex_appointments') || '[]');
    saved.unshift(appointmentData);
    localStorage.setItem('apex_appointments', JSON.stringify(saved));

    // Show Confirmation Modal
    showConfirmationModal(appointmentData);
    showToast(`Appointment confirmed: ${ticketId}`);
  });
}

function showConfirmationModal(app) {
  let modalBackdrop = document.getElementById('confirmationModal');
  if (!modalBackdrop) {
    modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'confirmationModal';
    modalBackdrop.className = 'modal-backdrop';
    document.body.appendChild(modalBackdrop);
  }

  modalBackdrop.innerHTML = `
    <div class="modal-box">
      <button class="modal-close" onclick="closeConfirmationModal()">&times;</button>
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="width: 56px; height: 56px; background: #ecfdf5; color: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 1.75rem; margin-bottom: 0.75rem;">✓</div>
        <h3 style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 0.25rem;">Appointment Confirmed!</h3>
        <p style="font-size: 0.875rem; color: #64748b;">A digital confirmation voucher has been generated.</p>
      </div>

      <div class="ticket-container" style="margin-bottom: 1.5rem;">
        <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8;">Official Verification Code</div>
        <div class="ticket-code">${app.id}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 1rem; font-size: 0.8125rem;">
          <div>
            <span style="color: #94a3b8; display: block;">Patient:</span>
            <strong>${app.name}</strong>
          </div>
          <div>
            <span style="color: #94a3b8; display: block;">Practitioner:</span>
            <strong>${app.doctor}</strong>
          </div>
          <div>
            <span style="color: #94a3b8; display: block;">Department:</span>
            <strong>${app.dept}</strong>
          </div>
          <div>
            <span style="color: #94a3b8; display: block;">Schedule:</span>
            <strong>${app.date} @ ${app.time}</strong>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 0.75rem;">
        <button class="btn btn-primary" style="flex: 1;" onclick="window.print()">🖨️ Print Slip</button>
        <button class="btn btn-secondary" style="flex: 1;" onclick="closeConfirmationModal()">Done</button>
      </div>
    </div>
  `;

  modalBackdrop.classList.add('open');
}

window.closeConfirmationModal = function() {
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

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
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

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-specialty');
      cards.forEach(card => {
        const spec = card.getAttribute('data-specialty');
        if (filter === 'all' || spec === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
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
    const name = document.getElementById('cName')?.value.trim();
    const email = document.getElementById('cEmail')?.value.trim();
    const subject = document.getElementById('cSubject')?.value.trim();
    const message = document.getElementById('cMessage')?.value.trim();

    if (!name || !email || !message) {
      alert('Please fill out all required fields.');
      return;
    }

    showToast(`Thank you, ${name}! Your inquiry has been dispatched to clinical triage.`);
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
    const name = document.getElementById('tName')?.value.trim();
    const country = document.getElementById('tCountry')?.value.trim();
    const dept = document.getElementById('tDept')?.value.trim();
    const rating = document.getElementById('tRating')?.value || '5';
    const message = document.getElementById('tMessage')?.value.trim();

    if (!name || !country || !message) {
      alert('Please fill out all fields.');
      return;
    }

    const newTestimonial = {
      name,
      country,
      dept,
      rating: parseInt(rating),
      message,
      date: 'Just now'
    };

    // Prepend to list in localStorage
    const saved = JSON.parse(localStorage.getItem('apex_user_testimonials') || '[]');
    saved.unshift(newTestimonial);
    localStorage.setItem('apex_user_testimonials', JSON.stringify(saved));

    showToast('Thank you! Your verified review has been submitted.');
    form.reset();
    renderCustomTestimonials();
  });

  renderCustomTestimonials();
}

function renderCustomTestimonials() {
  const container = document.getElementById('customTestimonialsContainer');
  if (!container) return;

  const saved = JSON.parse(localStorage.getItem('apex_user_testimonials') || '[]');
  if (saved.length === 0) return;

  container.innerHTML = saved.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-stars">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
      <div class="badge badge-success" style="align-self: flex-start; margin-bottom: 0.85rem;">Verified Patient · ${t.dept || 'Clinical Care'}</div>
      <p class="testimonial-quote">"${t.message}"</p>
      <div class="testimonial-author">
        <div style="width: 44px; height: 44px; border-radius: 50%; background: #0284c7; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem;">
          ${t.name.charAt(0)}
        </div>
        <div>
          <div class="author-name">${t.name}</div>
          <div class="author-location">${t.country} · ${t.date}</div>
        </div>
      </div>
    </div>
  `).join('');
}
