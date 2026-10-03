/* ==========================================================================
   Navodya De Silva — Main JavaScript File
   Typewriter, Filter, Stats Counter, Theme Switcher, Contact Form & Admin Inbox
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTypewriter();
  initStatsCounter();
  initProjectFilters();
  initContactForm();
  initAdminPanel();
});

/* ===== 1. THEME SWITCHER (Cute Lamp) ===== */
function initTheme() {
  const themeBtn = document.getElementById('themeToggleBtn');
  if (!themeBtn) return;

  const savedTheme = localStorage.getItem('navodya_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateLampFace(savedTheme);

  themeBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('navodya_theme', newTheme);
    updateLampFace(newTheme);
  });
}

function updateLampFace(theme) {
  const eyesClosed = document.getElementById('eyesClosed');
  const eyesOpen   = document.getElementById('eyesOpen');
  const lampLabel  = document.getElementById('lampLabel');

  if (theme === 'light') {
    // Lamp ON — eyes open, label "Bright"
    if (eyesClosed) eyesClosed.style.opacity = '0';
    if (eyesOpen)   eyesOpen.style.opacity   = '1';
    if (lampLabel)  lampLabel.textContent     = 'Bright';
  } else {
    // Lamp OFF — eyes closed (sleeping), label "Dark"
    if (eyesClosed) eyesClosed.style.opacity = '1';
    if (eyesOpen)   eyesOpen.style.opacity   = '0';
    if (lampLabel)  lampLabel.textContent     = 'Dark';
  }
}

/* ===== 2. TYPEWRITER EFFECT ===== */
function initTypewriter() {
  const el = document.getElementById('typewriterText');
  if (!el) return;

  const phrases = [
    "UI/UX Designer",
    "Full-Stack Developer"
  ];
  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  function type() {
    const currentPhrase = phrases[phraseIdx];
    if (isDeleting) {
      el.textContent = currentPhrase.substring(0, charIdx - 1);
      charIdx--;
    } else {
      el.textContent = currentPhrase.substring(0, charIdx + 1);
      charIdx++;
    }

    let delay = isDeleting ? 40 : 90;

    if (!isDeleting && charIdx === currentPhrase.length) {
      delay = 2000;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      delay = 500;
    }

    setTimeout(type, delay);
  }

  type();
}

/* ===== 3. ANIMATED STATS COUNTER ===== */
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  if (!statNumbers.length) return;

  let animated = false;

  function startCount() {
    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target')) || 0;
      const suffix = stat.getAttribute('data-suffix') || '';
      let count = 0;
      const speed = Math.ceil(target / 40);

      const timer = setInterval(() => {
        count += speed;
        if (count >= target) {
          count = target;
          clearInterval(timer);
        }
        stat.innerHTML = count + `<span>${suffix}</span>`;
      }, 35);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        startCount();
      }
    });
  }, { threshold: 0.5 });

  const statsSection = document.getElementById('statsSection');
  if (statsSection) observer.observe(statsSection);
}

/* ===== 4. PROJECT FILTERS ===== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectItems = document.querySelectorAll('.project-item');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');

      projectItems.forEach(item => {
        const itemCat = item.getAttribute('data-category');
        if (category === 'all' || itemCat === category) {
          item.style.display = 'block';
          item.style.animation = 'fadeIn 0.4s ease';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/* ===== 5. CONTACT FORM & LOCAL STORAGE INBOX ===== */
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('senderName').value.trim();
    const email = document.getElementById('senderEmail').value.trim();
    const subject = document.getElementById('senderSubject').value.trim();
    const message = document.getElementById('senderMessage').value.trim();

    if (!name || !email || !message) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    const newMessage = {
      id: Date.now(),
      name: name,
      email: email,
      subject: subject || 'No Subject',
      message: message,
      timestamp: new Date().toLocaleString(),
      status: 'unread'
    };

    // Save to localStorage inbox
    const existingMessages = JSON.parse(localStorage.getItem('navodya_inbox') || '[]');
    existingMessages.unshift(newMessage);
    localStorage.setItem('navodya_inbox', JSON.stringify(existingMessages));

    showToast('Message sent successfully! Navodya will respond soon.', 'success');
    contactForm.reset();

    // Refresh inbox list if admin portal is currently visible
    if (typeof loadAdminInbox === 'function') {
      loadAdminInbox();
    }
  });
}

/* ===== 6. ADMIN PANEL & VIEWER MESSAGE INBOX ===== */
function initAdminPanel() {
  loadAdminInbox();
}

function loadAdminInbox() {
  const inboxList = document.getElementById('adminInboxList');
  const unreadCountBadge = document.getElementById('adminUnreadBadge');
  const totalCountBadge = document.getElementById('adminTotalBadge');

  if (!inboxList) return;

  const messages = JSON.parse(localStorage.getItem('navodya_inbox') || '[]');
  const unreadCount = messages.filter(m => m.status === 'unread').length;

  if (unreadCountBadge) unreadCountBadge.textContent = unreadCount;
  if (totalCountBadge) totalCountBadge.textContent = messages.length;

  if (messages.length === 0) {
    inboxList.innerHTML = `
      <div class="text-center py-5 text-secondary">
        <i class="fa-solid fa-inbox fa-3x mb-3 text-muted"></i>
        <p>No messages received yet. Messages sent via the contact form will appear here!</p>
      </div>
    `;
    return;
  }

  inboxList.innerHTML = messages.map(msg => `
    <div class="glass-card p-3 mb-3 message-card ${msg.status === 'unread' ? 'unread' : ''}">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h6 class="fw-bold mb-0 text-light">${escapeHtml(msg.name)} <span class="small text-secondary">(${escapeHtml(msg.email)})</span></h6>
          <small class="text-primary fw-semibold">${escapeHtml(msg.subject)}</small>
        </div>
        <div class="d-flex align-items-center gap-2">
          <small class="text-secondary" style="font-size:0.75rem;">${msg.timestamp}</small>
          ${msg.status === 'unread' 
            ? `<button onclick="markAsRead(${msg.id})" class="btn btn-sm btn-outline-warning py-0 px-2" title="Mark as Read"><i class="fa-solid fa-envelope"></i></button>`
            : `<span class="badge bg-secondary bg-opacity-25 text-secondary">Read</span>`
          }
          <a href="mailto:${escapeHtml(msg.email)}?subject=Re: ${encodeURIComponent(msg.subject)}" class="btn btn-sm btn-outline-info py-0 px-2" title="Reply Email"><i class="fa-solid fa-reply"></i></a>
          <button onclick="deleteMessage(${msg.id})" class="btn btn-sm btn-outline-danger py-0 px-2" title="Delete Message"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
      <p class="text-secondary small mb-0 style="white-space: pre-wrap;">${escapeHtml(msg.message)}</p>
    </div>
  `).join('');
}

function markAsRead(id) {
  let messages = JSON.parse(localStorage.getItem('navodya_inbox') || '[]');
  messages = messages.map(m => m.id === id ? { ...m, status: 'read' } : m);
  localStorage.setItem('navodya_inbox', JSON.stringify(messages));
  loadAdminInbox();
  showToast('Marked message as read.', 'info');
}

function deleteMessage(id) {
  if (!confirm('Are you sure you want to delete this message?')) return;
  let messages = JSON.parse(localStorage.getItem('navodya_inbox') || '[]');
  messages = messages.filter(m => m.id !== id);
  localStorage.setItem('navodya_inbox', JSON.stringify(messages));
  loadAdminInbox();
  showToast('Message deleted.', 'danger');
}

/* ===== UTILITIES ===== */
function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(`${label} copied to clipboard!`, 'success');
  }).catch(() => {
    showToast(`Failed to copy ${label}`, 'danger');
  });
}

function showToast(message, type = 'info') {
  const container = document.body;
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  
  let icon = 'fa-info-circle text-info';
  if (type === 'success') icon = 'fa-check-circle text-success';
  if (type === 'warning') icon = 'fa-exclamation-triangle text-warning';
  if (type === 'danger') icon = 'fa-times-circle text-danger';

  toast.innerHTML = `
    <i class="fa-solid ${icon} fa-lg"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.4s ease';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}
