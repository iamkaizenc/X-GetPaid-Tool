import './style.css';

// ============================================
// X GetPaid Tool - Main Application
// ============================================

// ---- Data Store ----
const store = {
  revenue: JSON.parse(localStorage.getItem('xgp_revenue') || '[]'),
  affiliateLinks: JSON.parse(localStorage.getItem('xgp_affiliates') || '[]'),
  contentQueue: JSON.parse(localStorage.getItem('xgp_content') || '[]'),
  settings: JSON.parse(localStorage.getItem('xgp_settings') || '{}'),
  accountInfo: JSON.parse(localStorage.getItem('xgp_account') || '{}'),
  actionPlan: JSON.parse(localStorage.getItem('xgp_actionplan') || 'null'),
  goals: JSON.parse(localStorage.getItem('xgp_goals') || 'null'),
};

function saveStore() {
  localStorage.setItem('xgp_revenue', JSON.stringify(store.revenue));
  localStorage.setItem('xgp_affiliates', JSON.stringify(store.affiliateLinks));
  localStorage.setItem('xgp_content', JSON.stringify(store.contentQueue));
  localStorage.setItem('xgp_settings', JSON.stringify(store.settings));
  localStorage.setItem('xgp_account', JSON.stringify(store.accountInfo));
  localStorage.setItem('xgp_actionplan', JSON.stringify(store.actionPlan));
  localStorage.setItem('xgp_goals', JSON.stringify(store.goals));
}

// ---- Navigation ----
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

function navigateTo(pageName) {
  navItems.forEach(item => item.classList.remove('active'));
  pages.forEach(page => page.classList.remove('active'));

  const activeNav = document.querySelector(`[data-page="${pageName}"]`);
  const activePage = document.getElementById(`page-${pageName}`);

  if (activeNav) activeNav.classList.add('active');
  if (activePage) activePage.classList.add('active');

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');
}

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(item.dataset.page);
  });
});

// Mobile toggle
document.getElementById('mobileToggle')?.addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ---- Date Display ----
function updateDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateEl = document.getElementById('dateDisplay');
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('tr-TR', options);
  }
}
updateDate();

// ---- Toast Notifications ----
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ---- Modal ----
const modalOverlay = document.getElementById('modalOverlay');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

function openModal(title, content) {
  modalTitle.textContent = title;
  modalBody.innerHTML = content;
  modalOverlay.classList.add('active');
}

function closeModal() {
  modalOverlay.classList.remove('active');
}

modalClose?.addEventListener('click', closeModal);
modalOverlay?.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// ---- Animated Counter ----
function animateCounter(element, target, prefix = '', suffix = '', duration = 1500) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (target - start) * eased);

    if (target >= 1000000) {
      element.textContent = prefix + (current / 1000000).toFixed(1) + 'M' + suffix;
    } else if (target >= 1000) {
      element.textContent = prefix + (current / 1000).toFixed(1) + 'K' + suffix;
    } else {
      element.textContent = prefix + current + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// ---- Dashboard Stats ----
function updateDashboardStats() {
  const totalRev = store.revenue.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  const followers = store.accountInfo.followers || 2847;
  const impressions = store.accountInfo.impressions || 3420000;
  const engagement = store.accountInfo.engagement || 4.7;

  animateCounter(document.getElementById('totalRevenue'), totalRev, '$');
  animateCounter(document.getElementById('totalFollowers'), followers);
  animateCounter(document.getElementById('totalImpressions'), impressions);

  const engEl = document.getElementById('engagementRate');
  if (engEl) engEl.textContent = engagement + '%';
}

// ---- Revenue Chart (Canvas) ----
function drawRevenueChart(period = 'week') {
  const canvas = document.getElementById('revenueCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;

  canvas.width = container.clientWidth * 2;
  canvas.height = container.clientHeight * 2;
  ctx.scale(2, 2);

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Data
  const labels = {
    week: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
    month: ['1. Hafta', '2. Hafta', '3. Hafta', '4. Hafta'],
    year: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  };

  const datasets = {
    week: [45, 72, 58, 95, 110, 82, 63],
    month: [280, 420, 350, 510],
    year: [320, 450, 380, 520, 680, 750, 820, 950, 1100, 1250, 1400, 1580],
  };

  const data = datasets[period] || datasets.week;
  const labelData = labels[period] || labels.week;

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data) * 1.15;
  const minVal = 0;

  ctx.clearRect(0, 0, width, height);

  // Grid lines
  ctx.strokeStyle = 'rgba(30, 42, 66, 0.6)';
  ctx.lineWidth = 0.5;
  const gridLines = 5;

  for (let i = 0; i <= gridLines; i++) {
    const y = padding.top + (chartHeight / gridLines) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    // Y-axis labels
    const val = Math.round(maxVal - (maxVal / gridLines) * i);
    ctx.fillStyle = '#5a6580';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('$' + val, padding.left - 8, y + 4);
  }

  // X-axis labels
  const stepX = chartWidth / (data.length - 1 || 1);
  ctx.textAlign = 'center';
  labelData.forEach((label, i) => {
    const x = padding.left + stepX * i;
    ctx.fillStyle = '#5a6580';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText(label, x, height - 10);
  });

  // Calculate points
  const points = data.map((val, i) => ({
    x: padding.left + stepX * i,
    y: padding.top + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight,
  }));

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
  gradient.addColorStop(0, 'rgba(29, 161, 242, 0.3)');
  gradient.addColorStop(1, 'rgba(29, 161, 242, 0.02)');

  ctx.beginPath();
  ctx.moveTo(points[0].x, height - padding.bottom);
  points.forEach((p, i) => {
    if (i === 0) {
      ctx.lineTo(p.x, p.y);
    } else {
      // Smooth curve
      const prev = points[i - 1];
      const cpx = (prev.x + p.x) / 2;
      ctx.bezierCurveTo(cpx, prev.y, cpx, p.y, p.x, p.y);
    }
  });
  ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) {
      ctx.moveTo(p.x, p.y);
    } else {
      const prev = points[i - 1];
      const cpx = (prev.x + p.x) / 2;
      ctx.bezierCurveTo(cpx, prev.y, cpx, p.y, p.x, p.y);
    }
  });
  ctx.strokeStyle = '#1DA1F2';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Dots
  points.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#1DA1F2';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0e1a';
    ctx.fill();
  });
}

// Chart period controls
document.querySelectorAll('.chart-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    drawRevenueChart(btn.dataset.period);
  });
});

// ---- Growth Chart ----
function drawGrowthChart() {
  const canvas = document.getElementById('growthCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const container = canvas.parentElement;

  canvas.width = container.clientWidth * 2;
  canvas.height = container.clientHeight * 2;
  ctx.scale(2, 2);

  const width = container.clientWidth;
  const height = container.clientHeight;

  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const followers = [500, 650, 820, 1050, 1320, 1580, 1900, 2200, 2450, 2700, 2847, 3100];
  const impressions = [200, 350, 500, 780, 1200, 1600, 2100, 2500, 2800, 3100, 3420, 3800]; // in thousands

  const padding = { top: 20, right: 60, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  ctx.clearRect(0, 0, width, height);

  const maxFollowers = Math.max(...followers) * 1.15;
  const maxImpressions = Math.max(...impressions) * 1.15;
  const stepX = chartWidth / (months.length - 1);

  // Grid
  ctx.strokeStyle = 'rgba(30, 42, 66, 0.6)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  // X labels
  months.forEach((m, i) => {
    const x = padding.left + stepX * i;
    ctx.fillStyle = '#5a6580';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(m, x, height - 10);
  });

  // Draw line function
  function drawLine(data, maxVal, color, alpha) {
    const points = data.map((val, i) => ({
      x: padding.left + stepX * i,
      y: padding.top + chartHeight - (val / maxVal) * chartHeight,
    }));

    // Fill
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, color.replace('1)', `${alpha})`));
    gradient.addColorStop(1, color.replace('1)', '0.02)'));

    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding.bottom);
    points.forEach((p, i) => {
      if (i === 0) ctx.lineTo(p.x, p.y);
      else {
        const prev = points[i - 1];
        const cpx = (prev.x + p.x) / 2;
        ctx.bezierCurveTo(cpx, prev.y, cpx, p.y, p.x, p.y);
      }
    });
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else {
        const prev = points[i - 1];
        const cpx = (prev.x + p.x) / 2;
        ctx.bezierCurveTo(cpx, prev.y, cpx, p.y, p.x, p.y);
      }
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
  }

  drawLine(followers, maxFollowers, 'rgba(121, 75, 196, 1)', 0.15);
  drawLine(impressions, maxImpressions, 'rgba(29, 161, 242, 1)', 0.15);

  // Legend
  ctx.font = '11px Inter, sans-serif';
  ctx.fillStyle = 'rgba(121, 75, 196, 1)';
  ctx.fillRect(width - 140, 10, 12, 12);
  ctx.fillStyle = '#8b95b0';
  ctx.textAlign = 'left';
  ctx.fillText('Takipçi', width - 122, 20);

  ctx.fillStyle = 'rgba(29, 161, 242, 1)';
  ctx.fillRect(width - 140, 28, 12, 12);
  ctx.fillStyle = '#8b95b0';
  ctx.fillText('Gösterim (K)', width - 122, 38);
}

// ---- Activity Feed ----
function renderActivities() {
  const container = document.getElementById('activityList');
  if (!container) return;

  const activities = [
    { icon: '💰', title: 'Reklam gelir payı ödendi', time: '2 saat önce', amount: '+$127.50', type: 'positive' },
    { icon: '🔗', title: 'Affiliate link tıklaması (x42)', time: '5 saat önce', amount: '+$18.90', type: 'positive' },
    { icon: '👥', title: '127 yeni takipçi kazandınız', time: '1 gün önce', amount: '', type: '' },
    { icon: '📊', title: 'Thread 50K gösterime ulaştı', time: '2 gün önce', amount: '', type: '' },
    { icon: '💎', title: 'Bahşiş alındı', time: '3 gün önce', amount: '+$5.00', type: 'positive' },
  ];

  // Combine with stored revenue
  const recentRevenue = store.revenue.slice(-3).reverse().map(r => ({
    icon: '💵',
    title: `${r.source} - ${r.description}`,
    time: new Date(r.date).toLocaleDateString('tr-TR'),
    amount: `+$${parseFloat(r.amount).toFixed(2)}`,
    type: 'positive',
  }));

  const allActivities = [...recentRevenue, ...activities].slice(0, 5);

  container.innerHTML = allActivities.map(a => `
    <div class="activity-item">
      <div class="activity-icon">${a.icon}</div>
      <div class="activity-info">
        <div class="activity-title">${a.title}</div>
        <div class="activity-time">${a.time}</div>
      </div>
      ${a.amount ? `<div class="activity-amount ${a.type}">${a.amount}</div>` : ''}
    </div>
  `).join('');
}

// ---- Revenue Management ----
function renderRevenueTable() {
  const tbody = document.getElementById('revenueTableBody');
  const empty = document.getElementById('revenueEmpty');
  const table = document.getElementById('revenueTable');
  if (!tbody) return;

  const filter = document.getElementById('revenueFilter')?.value || 'all';

  let filtered = store.revenue;
  if (filter !== 'all') {
    filtered = filtered.filter(r => r.source === filter);
  }

  if (filtered.length === 0) {
    if (table) table.style.display = 'none';
    if (empty) empty.style.display = 'flex';
    return;
  }

  if (table) table.style.display = 'table';
  if (empty) empty.style.display = 'none';

  const sourceLabels = {
    ad_revenue: 'Reklam Gelir Payı',
    subscriptions: 'Abonelikler',
    affiliate: 'Affiliate',
    tips: 'Bahşişler',
    spaces: 'Ticketed Spaces',
    sponsored: 'Sponsorlu İçerik',
    digital_products: 'Dijital Ürünler',
  };

  const statusLabels = {
    paid: { text: 'Ödendi', class: 'status-paid' },
    pending: { text: 'Beklemede', class: 'status-pending' },
    processing: { text: 'İşleniyor', class: 'status-processing' },
  };

  tbody.innerHTML = filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).map((r, i) => {
    const status = statusLabels[r.status] || statusLabels.pending;
    return `
      <tr>
        <td>${new Date(r.date).toLocaleDateString('tr-TR')}</td>
        <td>${sourceLabels[r.source] || r.source}</td>
        <td>${r.description}</td>
        <td style="font-weight: 700; color: var(--accent-green);">$${parseFloat(r.amount).toFixed(2)}</td>
        <td><span class="status-badge ${status.class}">${status.text}</span></td>
        <td>
          <button class="btn-outline btn-sm btn-danger" onclick="deleteRevenue(${i})">Sil</button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteRevenue = function (index) {
  store.revenue.splice(index, 1);
  saveStore();
  renderRevenueTable();
  updateDashboardStats();
  renderActivities();
  showToast('Gelir kaydı silindi', 'info');
};

function showAddRevenueModal() {
  openModal('💰 Gelir Ekle', `
    <div class="form-group">
      <label for="revSource">Gelir Kaynağı</label>
      <select id="revSource" class="select-input" style="width:100%">
        <option value="ad_revenue">Reklam Gelir Payı</option>
        <option value="subscriptions">Abonelikler</option>
        <option value="affiliate">Affiliate Komisyon</option>
        <option value="tips">Bahşişler</option>
        <option value="spaces">Ticketed Spaces</option>
        <option value="sponsored">Sponsorlu İçerik</option>
        <option value="digital_products">Dijital Ürünler</option>
      </select>
    </div>
    <div class="form-group">
      <label for="revAmount">Tutar ($)</label>
      <input type="number" id="revAmount" class="form-input" placeholder="0.00" step="0.01" />
    </div>
    <div class="form-group">
      <label for="revDesc">Açıklama</label>
      <input type="text" id="revDesc" class="form-input" placeholder="Kısa bir açıklama..." />
    </div>
    <div class="form-group">
      <label for="revDate">Tarih</label>
      <input type="date" id="revDate" class="form-input" value="${new Date().toISOString().split('T')[0]}" />
    </div>
    <div class="form-group">
      <label for="revStatus">Durum</label>
      <select id="revStatus" class="select-input" style="width:100%">
        <option value="paid">Ödendi</option>
        <option value="pending">Beklemede</option>
        <option value="processing">İşleniyor</option>
      </select>
    </div>
    <div class="modal-actions">
      <button class="btn-outline" onclick="closeModal()">İptal</button>
      <button class="btn-primary" onclick="saveRevenue()">Kaydet</button>
    </div>
  `);
}

window.saveRevenue = function () {
  const source = document.getElementById('revSource').value;
  const amount = document.getElementById('revAmount').value;
  const description = document.getElementById('revDesc').value;
  const date = document.getElementById('revDate').value;
  const status = document.getElementById('revStatus').value;

  if (!amount || parseFloat(amount) <= 0) {
    showToast('Lütfen geçerli bir tutar girin', 'error');
    return;
  }

  store.revenue.push({ source, amount, description, date, status, id: Date.now() });
  saveStore();
  closeModal();
  renderRevenueTable();
  updateDashboardStats();
  renderActivities();
  updateBreakdownAmounts();
  showToast('Gelir başarıyla eklendi!', 'success');
};

window.closeModal = closeModal;

// Revenue filter
document.getElementById('revenueFilter')?.addEventListener('change', renderRevenueTable);
document.getElementById('revenuePeriod')?.addEventListener('change', renderRevenueTable);

// Add revenue button
document.getElementById('addRevenueBtn')?.addEventListener('click', showAddRevenueModal);

// ---- Revenue Breakdown ----
function updateBreakdownAmounts() {
  const sources = {
    ad_revenue: 0,
    subscriptions: 0,
    affiliate: 0,
    tips: 0,
  };

  store.revenue.forEach(r => {
    const key = r.source;
    if (sources[key] !== undefined) {
      sources[key] += parseFloat(r.amount || 0);
    }
  });

  const total = Object.values(sources).reduce((s, v) => s + v, 0) || 1;

  const breakdown = document.getElementById('revenueBreakdown');
  if (!breakdown) return;

  const items = breakdown.querySelectorAll('.breakdown-item');
  const keys = ['ad_revenue', 'subscriptions', 'affiliate', 'tips'];

  keys.forEach((key, i) => {
    if (items[i]) {
      const amountEl = items[i].querySelector('.breakdown-amount');
      const fillEl = items[i].querySelector('.breakdown-fill');
      if (amountEl) amountEl.textContent = `$${sources[key].toFixed(2)}`;
      if (fillEl) fillEl.style.width = `${(sources[key] / total) * 100}%`;
    }
  });
}

// ---- Content Planner ----
function showAddContentModal() {
  openModal('📝 İçerik Planla', `
    <div class="form-group">
      <label for="contentType">İçerik Tipi</label>
      <select id="contentType" class="select-input" style="width:100%">
        <option value="tweet">Tweet</option>
        <option value="thread">Thread</option>
        <option value="article">Makale</option>
        <option value="affiliate">Affiliate Post</option>
      </select>
    </div>
    <div class="form-group">
      <label for="contentText">İçerik</label>
      <textarea id="contentText" class="form-textarea" placeholder="Tweet içeriğinizi yazın..."></textarea>
    </div>
    <div class="form-group">
      <label for="contentDate">Planlanan Tarih & Saat</label>
      <input type="datetime-local" id="contentDate" class="form-input" />
    </div>
    <div class="modal-actions">
      <button class="btn-outline" onclick="closeModal()">İptal</button>
      <button class="btn-primary" onclick="saveContent()">Planla</button>
    </div>
  `);
}

window.saveContent = function () {
  const type = document.getElementById('contentType').value;
  const text = document.getElementById('contentText').value;
  const scheduledAt = document.getElementById('contentDate').value;

  if (!text) {
    showToast('Lütfen içerik yazın', 'error');
    return;
  }

  store.contentQueue.push({ type, text, scheduledAt, id: Date.now(), status: 'scheduled' });
  saveStore();
  closeModal();
  renderContentQueue();
  showToast('İçerik planlandı!', 'success');
};

function renderContentQueue() {
  const container = document.getElementById('contentQueue');
  const empty = document.getElementById('contentEmpty');
  if (!container) return;

  if (store.contentQueue.length === 0) {
    container.style.display = 'none';
    if (empty) empty.style.display = 'flex';
    return;
  }

  container.style.display = 'flex';
  if (empty) empty.style.display = 'none';

  const typeLabels = {
    tweet: { text: 'Tweet', class: 'type-tweet' },
    thread: { text: 'Thread', class: 'type-thread' },
    article: { text: 'Makale', class: 'type-article' },
    affiliate: { text: 'Affiliate', class: 'type-affiliate' },
  };

  container.innerHTML = store.contentQueue
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
    .map((c, i) => {
      const type = typeLabels[c.type] || typeLabels.tweet;
      const date = c.scheduledAt ? new Date(c.scheduledAt).toLocaleString('tr-TR') : 'Belirtilmemiş';
      return `
        <div class="content-item">
          <span class="content-type-badge ${type.class}">${type.text}</span>
          <span class="content-text">${c.text}</span>
          <span class="content-schedule">📅 ${date}</span>
          <button class="btn-outline btn-sm btn-danger" onclick="deleteContent(${i})">Sil</button>
        </div>
      `;
    }).join('');
}

window.deleteContent = function (index) {
  store.contentQueue.splice(index, 1);
  saveStore();
  renderContentQueue();
  showToast('İçerik silindi', 'info');
};

document.getElementById('addContentBtn')?.addEventListener('click', showAddContentModal);

// ---- Affiliate Links ----
function showAddAffiliateModal() {
  openModal('🔗 Affiliate Link Ekle', `
    <div class="form-group">
      <label for="affProduct">Ürün / Servis Adı</label>
      <input type="text" id="affProduct" class="form-input" placeholder="Örn: Hostinger" />
    </div>
    <div class="form-group">
      <label for="affCategory">Kategori</label>
      <select id="affCategory" class="select-input" style="width:100%">
        <option value="tech">Teknoloji & AI</option>
        <option value="hosting">Web Hosting</option>
        <option value="education">Online Eğitim</option>
        <option value="finance">Finans & Trading</option>
        <option value="saas">SaaS Araçları</option>
        <option value="other">Diğer</option>
      </select>
    </div>
    <div class="form-group">
      <label for="affLink">Affiliate Link</label>
      <input type="url" id="affLink" class="form-input" placeholder="https://..." />
    </div>
    <div class="form-group">
      <label for="affCommission">Komisyon Oranı (%)</label>
      <input type="number" id="affCommission" class="form-input" placeholder="Örn: 30" />
    </div>
    <div class="modal-actions">
      <button class="btn-outline" onclick="closeModal()">İptal</button>
      <button class="btn-primary" onclick="saveAffiliate()">Kaydet</button>
    </div>
  `);
}

window.saveAffiliate = function () {
  const product = document.getElementById('affProduct').value;
  const category = document.getElementById('affCategory').value;
  const link = document.getElementById('affLink').value;
  const commission = document.getElementById('affCommission').value;

  if (!product || !link) {
    showToast('Lütfen gerekli alanları doldurun', 'error');
    return;
  }

  store.affiliateLinks.push({
    product, category, link, commission,
    clicks: 0, conversions: 0, earnings: 0,
    id: Date.now(),
  });
  saveStore();
  closeModal();
  renderAffiliateTable();
  showToast('Affiliate link eklendi!', 'success');
};

function renderAffiliateTable() {
  const tbody = document.getElementById('affiliateTableBody');
  const empty = document.getElementById('affiliateEmpty');
  const table = document.getElementById('affiliateTable');
  if (!tbody) return;

  if (store.affiliateLinks.length === 0) {
    if (table) table.style.display = 'none';
    if (empty) empty.style.display = 'flex';
    return;
  }

  if (table) table.style.display = 'table';
  if (empty) empty.style.display = 'none';

  const catLabels = {
    tech: 'Teknoloji & AI',
    hosting: 'Web Hosting',
    education: 'Online Eğitim',
    finance: 'Finans & Trading',
    saas: 'SaaS Araçları',
    other: 'Diğer',
  };

  tbody.innerHTML = store.affiliateLinks.map((a, i) => `
    <tr>
      <td style="font-weight: 600;">${a.product}</td>
      <td>${catLabels[a.category] || a.category}</td>
      <td style="max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
        <a href="${a.link}" target="_blank" style="color: var(--accent-blue); text-decoration: none;">${a.link}</a>
      </td>
      <td>${a.clicks}</td>
      <td>${a.conversions}</td>
      <td style="font-weight: 700; color: var(--accent-green);">%${a.commission}</td>
      <td>
        <button class="btn-outline btn-sm btn-danger" onclick="deleteAffiliate(${i})">Sil</button>
      </td>
    </tr>
  `).join('');

  // Update stats
  const totalClicks = store.affiliateLinks.reduce((s, a) => s + (a.clicks || 0), 0);
  const totalConversions = store.affiliateLinks.reduce((s, a) => s + (a.conversions || 0), 0);
  const totalEarnings = store.affiliateLinks.reduce((s, a) => s + (a.earnings || 0), 0);
  const convRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : 0;

  const clicksEl = document.getElementById('totalClicks');
  const convEl = document.getElementById('conversionRate');
  const commEl = document.getElementById('totalCommission');

  if (clicksEl) clicksEl.textContent = totalClicks;
  if (convEl) convEl.textContent = convRate + '%';
  if (commEl) commEl.textContent = '$' + totalEarnings.toFixed(2);
}

window.deleteAffiliate = function (index) {
  store.affiliateLinks.splice(index, 1);
  saveStore();
  renderAffiliateTable();
  showToast('Affiliate link silindi', 'info');
};

document.getElementById('addAffiliateBtn')?.addEventListener('click', showAddAffiliateModal);

// ---- Eligibility Check ----
document.getElementById('checkEligibilityBtn')?.addEventListener('click', () => {
  const followers = parseInt(document.getElementById('followerCount').value) || 0;
  const impressions = parseInt(document.getElementById('impressionCount').value) || 0;
  const accountAge = parseInt(document.getElementById('accountAge').value) || 0;
  const monthlyTweets = parseInt(document.getElementById('monthlyTweets').value) || 0;
  const hasPremium = document.getElementById('hasPremium').checked;
  const hasStripe = document.getElementById('hasStripe').checked;
  const hasVerifiedEmail = document.getElementById('hasVerifiedEmail').checked;
  const has2FA = document.getElementById('has2FA').checked;

  // Store
  store.accountInfo = { followers, impressions, accountAge, monthlyTweets, hasPremium, hasStripe, hasVerifiedEmail, has2FA };
  saveStore();

  const programs = [
    {
      name: 'Reklam Gelir Paylaşımı',
      icon: '💰',
      description: 'Tweetlerinizin yanıtlarında gösterilen reklamlardan gelir payı alın.',
      requirements: [
        { label: 'X Premium', met: hasPremium },
        { label: '500+ Takipçi', met: followers >= 500 },
        { label: '5M+ Gösterim (90 gün)', met: impressions >= 5000000 },
        { label: '3+ Ay Hesap', met: accountAge >= 3 },
        { label: 'Stripe Bağlı', met: hasStripe },
        { label: 'Email Doğrulanmış', met: hasVerifiedEmail },
      ],
    },
    {
      name: 'X Abonelikler (Super Follows)',
      icon: '👥',
      description: 'Takipçilerinize özel içerik sunarak aylık abonelik ücreti alın.',
      requirements: [
        { label: 'X Premium', met: hasPremium },
        { label: '500+ Takipçi', met: followers >= 500 },
        { label: '25+ Tweet/Ay', met: monthlyTweets >= 25 },
        { label: '3+ Ay Hesap', met: accountAge >= 3 },
      ],
    },
    {
      name: 'Biletli Spaces',
      icon: '🎙️',
      description: 'Canlı sesli sohbetler düzenleyin ve bilet ücreti alın.',
      requirements: [
        { label: 'X Premium', met: hasPremium },
        { label: '500+ Takipçi', met: followers >= 500 },
        { label: '3+ Ay Hesap', met: accountAge >= 3 },
      ],
    },
    {
      name: 'Bahşiş (Tips)',
      icon: '💎',
      description: 'Profilinizden direkt bahşiş alın.',
      requirements: [
        { label: 'Email Doğrulanmış', met: hasVerifiedEmail },
        { label: '3+ Ay Hesap', met: accountAge >= 3 },
      ],
    },
    {
      name: '$1M Makale Ödülü',
      icon: '📰',
      description: 'En iyi uzun-form makaleler için büyük ödül havuzundan pay alın.',
      requirements: [
        { label: 'X Premium', met: hasPremium },
        { label: '1000+ Kelime Makale', met: true },
        { label: 'Orijinal İçerik', met: true },
      ],
    },
    {
      name: 'Affiliate Marketing',
      icon: '🔗',
      description: 'Ürün tanıtarak komisyon kazanın - herkes yapabilir!',
      requirements: [
        { label: 'Aktif Hesap', met: accountAge >= 1 },
        { label: 'Niş Oluşturulmuş', met: followers >= 100 },
      ],
    },
  ];

  const container = document.getElementById('programEligibility');
  const results = document.getElementById('eligibilityResults');

  if (container && results) {
    results.style.display = 'block';

    container.innerHTML = programs.map(p => {
      const allMet = p.requirements.every(r => r.met);
      const someMet = p.requirements.some(r => r.met);
      const statusClass = allMet ? 'eligible' : (someMet ? 'partial' : 'not-eligible');
      const statusIcon = allMet ? '✅' : (someMet ? '⚠️' : '❌');
      const statusText = allMet ? 'Uygun!' : (someMet ? 'Kısmen Uygun' : 'Uygun Değil');

      return `
        <div class="eligibility-card">
          <div class="eligibility-status ${statusClass}">${statusIcon}</div>
          <div class="eligibility-info">
            <h4>${p.icon} ${p.name}</h4>
            <p>${p.description}</p>
            <div class="eligibility-requirements">
              ${p.requirements.map(r => `
                <span class="req-badge ${r.met ? 'met' : 'unmet'}">
                  ${r.met ? '✓' : '✗'} ${r.label}
                </span>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');

    showToast('Uygunluk kontrolü tamamlandı!', 'success');
  }
});

// ---- Strategies ----
const strategies = [
  {
    level: 'beginner',
    emoji: '📝',
    title: 'İçerik Temelleri',
    description: 'Günde 2-5 kaliteli tweet paylaşın. Görsel içerik kullanın (resim, video, GIF). Thread formatında derinlemesine konular işleyin.',
    earning: '$0 - $100/ay',
    timeframe: '1-3 ay',
  },
  {
    level: 'beginner',
    emoji: '🤝',
    title: 'Reply-First Stratejisi',
    description: 'Zamanınızın %80\'ini büyük hesaplara değerli yanıtlar yazarak geçirin. Onların takipçilerine görünür olun ve profil ziyaretlerini artırın.',
    earning: 'Organik büyüme',
    timeframe: '1-2 ay',
  },
  {
    level: 'beginner',
    emoji: '⏰',
    title: 'Optimal Zamanlama',
    description: 'Hedef kitlenizin en aktif olduğu saatlerde paylaşım yapın. Salı-Perşembe, 08:00-10:00 ve 17:00-19:00 genelde en iyi saatler.',
    earning: '%30-50 etkileşim artışı',
    timeframe: 'Hemen',
  },
  {
    level: 'intermediate',
    emoji: '💰',
    title: 'Reklam Gelir Paylaşımı',
    description: 'X Premium alın, 500+ takipçi ve 5M gösterime ulaşın. Premium kullanıcılarla etkileşim gelir payınızı artırır.',
    earning: '$50 - $500/ay',
    timeframe: '3-6 ay',
  },
  {
    level: 'intermediate',
    emoji: '🔗',
    title: 'Affiliate Marketing',
    description: 'Niş alanınızda (AI araçları, hosting, SaaS) ürün tanıtımları yapın. Doğal içerik içinde affiliate linkler paylaşın.',
    earning: '$100 - $2,000/ay',
    timeframe: '2-4 ay',
  },
  {
    level: 'intermediate',
    emoji: '🧵',
    title: 'Viral Thread Stratejisi',
    description: 'Haftada 2-3 kaliteli thread paylaşın. Araştırma, analiz ve değerli bilgi veren 5-15 tweet\'lik threadler hazırlayın.',
    earning: 'Büyük erişim + takipçi',
    timeframe: '2-4 hafta',
  },
  {
    level: 'intermediate',
    emoji: '👥',
    title: 'Abonelik Sistemi',
    description: 'X Subscriptions ile özel içerik sunun. Derinlemesine analizler, erken erişim veya özel topluluk sunabilirsiniz.',
    earning: '$2.99-$9.99/abone/ay',
    timeframe: '1-3 ay',
  },
  {
    level: 'advanced',
    emoji: '📰',
    title: 'Uzun-Form Makale Yazarlığı',
    description: '1000+ kelime makaleler yazarak $1M ödül havuzundan pay alın. Orijinal, derinlemesine araştırma-bazlı makaleler ödüllendirilir.',
    earning: '$100 - $1M',
    timeframe: '1-3 ay',
  },
  {
    level: 'advanced',
    emoji: '🎯',
    title: 'Marka İşbirlikleri',
    description: '5,000+ takipçiyle sponsorlu içerik anlaşmaları yapın. CPM (bin gösterim başına) model ile markalara teklif verin.',
    earning: '$200 - $5,000/post',
    timeframe: '3-6 ay',
  },
  {
    level: 'advanced',
    emoji: '📚',
    title: 'Dijital Ürün Satışı',
    description: 'E-book, online kurs, template veya danışmanlık hizmeti satın. Thread\'lerinizi lead magnet olarak kullanın.',
    earning: '$500 - $10,000+/ay',
    timeframe: '3-6 ay',
  },
  {
    level: 'advanced',
    emoji: '🎙️',
    title: 'Biletli X Spaces',
    description: 'Uzman konularda ücretli canlı sesli etkinlikler düzenleyin. %97 pay alın (ilk $50K). Konuk konuşmacılar davet edin.',
    earning: '$1-$999/bilet',
    timeframe: '1-2 ay',
  },
  {
    level: 'advanced',
    emoji: '✍️',
    title: 'Twitter Ghostwriting',
    description: 'Büyük hesaplar veya markalar için içerik yazarlığı hizmeti sunun. Aylık paket olarak tweet + thread + strateji sunun.',
    earning: '$1,000 - $5,000/ay',
    timeframe: '2-4 ay',
  },
];

function renderStrategies(filter = 'all') {
  const container = document.getElementById('strategiesGrid');
  if (!container) return;

  const filtered = filter === 'all' ? strategies : strategies.filter(s => s.level === filter);

  const levelLabels = {
    beginner: { text: 'Başlangıç', class: 'level-beginner' },
    intermediate: { text: 'Orta', class: 'level-intermediate' },
    advanced: { text: 'İleri', class: 'level-advanced' },
  };

  container.innerHTML = filtered.map(s => {
    const level = levelLabels[s.level];
    return `
      <div class="strategy-card ${s.level}">
        <div class="strategy-card-header">
          <span class="strategy-emoji">${s.emoji}</span>
          <span class="strategy-level ${level.class}">${level.text}</span>
        </div>
        <h4>${s.title}</h4>
        <p>${s.description}</p>
        <div class="strategy-meta">
          <span>💵 ${s.earning}</span>
          <span>⏱️ ${s.timeframe}</span>
        </div>
      </div>
    `;
  }).join('');
}

document.querySelectorAll('.strategy-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.strategy-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderStrategies(tab.dataset.strategy);
  });
});

// ---- Quick Actions ----
document.getElementById('quickAddRevenue')?.addEventListener('click', () => {
  navigateTo('revenue');
  setTimeout(showAddRevenueModal, 300);
});

document.getElementById('quickSchedulePost')?.addEventListener('click', () => {
  navigateTo('content');
  setTimeout(showAddContentModal, 300);
});

document.getElementById('quickAddAffiliate')?.addEventListener('click', () => {
  navigateTo('affiliate');
  setTimeout(showAddAffiliateModal, 300);
});

document.getElementById('quickCheckEligibility')?.addEventListener('click', () => {
  navigateTo('eligibility');
});

// ---- Growth Stats ----
function updateGrowthStats() {
  const el = (id) => document.getElementById(id);
  if (el('dailyImpressions')) animateCounter(el('dailyImpressions'), 38200);
  if (el('weeklyFollowers')) animateCounter(el('weeklyFollowers'), 127);
  if (el('tweetPerformance')) animateCounter(el('tweetPerformance'), 4800);
  if (el('profileVisits')) animateCounter(el('profileVisits'), 892);
}

// ---- Resize Handler ----
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    drawRevenueChart(document.querySelector('.chart-btn.active')?.dataset.period || 'week');
    drawGrowthChart();
  }, 250);
});

// ============================================
// ACTION PLAN SYSTEM
// ============================================

const ACTION_PLAN_DATA = [
  // Phase 1: 0-30 Days
  { id: 'p1_1', phase: 1, priority: 'critical', title: 'Affiliate linkleri değiştir', desc: 'Hostinger (%60), NordVPN (%40), Notion (%50) referral linklerini kendi affiliate linklerine çevir. Sıfır maliyet, anında gelir potansiyeli.', emoji: '🔗' },
  { id: 'p1_2', phase: 1, priority: 'critical', title: 'X Premium + Monetizasyon başvurusu', desc: 'X Premium ($8/ay) satın al ve monetizasyon programına başvur. Reklam gelir payı için ön koşul.', emoji: '⭐', preCompleted: true, preCompletedDate: '2026-02-20' },
  { id: 'p1_3', phase: 1, priority: 'important', title: 'Landing page\'e email opt-in ekle', desc: 'Mailchimp veya Resend ile email yakalama formu ekle. İlk 1K email = değerli varlık.', emoji: '📧' },
  { id: 'p1_4', phase: 1, priority: 'important', title: 'Araç tanıtım thread\'i yayınla', desc: 'X hesabında GetPaid Tool tanıtım thread\'i yayınla. Screenshots + özellikler + link.', emoji: '🧵' },
  { id: 'p1_5', phase: 1, priority: 'normal', title: 'SEO: Blog bölümü + ilk 3 makale', desc: '"X\'te nasıl para kazanılır" gibi anahtar kelimelere odaklı blog aç ve ilk 3 makaleyi yaz.', emoji: '📝' },
  { id: 'p1_6', phase: 1, priority: 'normal', title: 'Reply-first strateji başlat', desc: 'Günde 50+ kaliteli reply yaz. Büyük hesapların takipçilerine ulaşmak için %80 zamanı reply\'a ayır.', emoji: '💬' },

  // Phase 2: 31-60 Days
  { id: 'p2_1', phase: 2, priority: 'critical', title: 'URL kısaltıcı entegre et', desc: 'Bit.ly veya kendi kısaltıcını entegre et. Tıklama ve dönüşüm takibine geç. Gerçek veriye dayalı karar al.', emoji: '🔗' },
  { id: 'p2_2', phase: 2, priority: 'critical', title: 'Product Hunt lansmanı', desc: 'Product Hunt\'a kaydol, lansman günü için hazırlık yap. Açıklama, görseller ve community desteği.', emoji: '🚀' },
  { id: 'p2_3', phase: 2, priority: 'important', title: 'OpenAI API entegrasyonu', desc: 'AI içerik önerisi için OpenAI API bağla. Temel tweet öneri motoru oluştur.', emoji: '🤖' },
  { id: 'p2_4', phase: 2, priority: 'important', title: '3 Creator ile partnership', desc: '3 Türk X creator ile araç tanıtım anlaşması yap. Karşılıklı büyüme ve güven oluştur.', emoji: '🤝' },
  { id: 'p2_5', phase: 2, priority: 'normal', title: 'E-book taslağı yaz', desc: '"X\'te $1K Kazanmak" e-book taslağını yaz. 5.000 kelime hedefi. Dashboard\'dan satış planı.', emoji: '📚' },
  { id: 'p2_6', phase: 2, priority: 'normal', title: 'X Analytics pattern analizi', desc: 'X Analytics verilerini düzenli gir, trend ve pattern ara. En iyi saat, gün ve içerik tiplerini belirle.', emoji: '📊' },

  // Phase 3: 61-90 Days
  { id: 'p3_1', phase: 3, priority: 'critical', title: 'Stripe entegrasyonu + Premium plan', desc: 'Premium plan ($9.99/ay) için Stripe entegre et. Beta listesi aç ve ilk abone hedefle.', emoji: '💳' },
  { id: 'p3_2', phase: 3, priority: 'critical', title: 'X API resmi başvurusu', desc: 'X API Basic plan ($100/ay) başvurusu yap. ROI hesapla ve otomatik gelir çekme özelliği planla.', emoji: '⚙️' },
  { id: 'p3_3', phase: 3, priority: 'important', title: 'Sponsorluk outreach başlat', desc: '3 SaaS markasına sponsorluk teklifi gönder. Dashboard\'da marka yerleşimi satışı.', emoji: '💼' },
  { id: 'p3_4', phase: 3, priority: 'important', title: 'E-book satışa çıkar', desc: 'E-book\'u Gumroad veya dashboard üzerinden satışa çıkar. Sosyal medyada tanıtım yap.', emoji: '📖' },
  { id: 'p3_5', phase: 3, priority: 'normal', title: 'MRR takibi başlat', desc: 'Aylık tekrarlayan gelir takibini başlat. Gelir dashboard\'ına MRR metrikleri ekle.', emoji: '📈' },
  { id: 'p3_6', phase: 3, priority: 'normal', title: '90. gün değerlendirmesi + Q2 planı', desc: '90 günlük süreyi değerlendir: ne işe yaradı, ne yaramadı. Q2 planını oluştur.', emoji: '🎯' },
];

const DEFAULT_GOALS = {
  followers: { current: 0, target: 500, label: 'Takipçi Hedefi', icon: '👥', barColor: 'green' },
  impressions: { current: 0, target: 5000000, label: '90 Günlük Gösterim', icon: '👁️', barColor: 'blue' },
  revenue: { current: 0, target: 200, label: 'Aylık Gelir ($)', icon: '💰', barColor: 'purple' },
  tweets: { current: 0, target: 150, label: 'Aylık Tweet', icon: '🐦', barColor: 'orange' },
};

function initActionPlan() {
  // Initialize action plan if not exists
  if (!store.actionPlan) {
    store.actionPlan = {
      startDate: new Date().toISOString().split('T')[0],
      actions: {},
      streakDates: [],
    };
    // Pre-complete X Premium
    ACTION_PLAN_DATA.forEach(a => {
      if (a.preCompleted) {
        store.actionPlan.actions[a.id] = {
          completed: true,
          completedDate: a.preCompletedDate || new Date().toISOString().split('T')[0],
        };
      }
    });
    saveStore();
  }

  if (!store.goals) {
    store.goals = JSON.parse(JSON.stringify(DEFAULT_GOALS));
    // Sync with account info if available
    if (store.accountInfo.followers) store.goals.followers.current = store.accountInfo.followers;
    if (store.accountInfo.impressions) store.goals.impressions.current = store.accountInfo.impressions;
    const totalRev = store.revenue.reduce((s, r) => s + parseFloat(r.amount || 0), 0);
    store.goals.revenue.current = Math.round(totalRev);
    saveStore();
  }

  renderActionPlan();
}

function renderActionPlan() {
  renderDailyAction();
  renderGoals();
  renderActionChecklist();
  updateActionStats();
  renderOverallProgress();
  renderMilestones();
}

function renderDailyAction() {
  const container = document.getElementById('dailyActionContent');
  const dateEl = document.getElementById('dailyDate');
  if (!container) return;

  const now = new Date();
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // Find next uncompleted critical action, then important, then normal
  const priorities = ['critical', 'important', 'normal'];
  let nextAction = null;

  for (const prio of priorities) {
    nextAction = ACTION_PLAN_DATA.find(a =>
      a.priority === prio &&
      !store.actionPlan.actions[a.id]?.completed
    );
    if (nextAction) break;
  }

  if (!nextAction) {
    container.innerHTML = `
      <div class="daily-action-emoji">🎉</div>
      <div class="daily-action-info">
        <h4>Tüm aksiyonlar tamamlandı!</h4>
        <p>Tebrikler! 90 günlük planını başarıyla tamamladın. Şimdi Q2 planını yapmaya geçebilirsin.</p>
      </div>
    `;
    return;
  }

  const prioColors = {
    critical: 'priority-critical',
    important: 'priority-important',
    normal: 'priority-normal',
  };
  const prioLabels = { critical: 'KRİTİK', important: 'ÖNEMLİ', normal: 'NORMAL' };

  container.innerHTML = `
    <div class="daily-action-emoji">${nextAction.emoji}</div>
    <div class="daily-action-info">
      <h4>${nextAction.title}</h4>
      <p>${nextAction.desc}</p>
      <span class="daily-action-priority ${prioColors[nextAction.priority]}">${prioLabels[nextAction.priority]}</span>
    </div>
    <button class="daily-action-btn" onclick="toggleActionItem('${nextAction.id}')">
      ✓ Tamamla
    </button>
  `;
}

function renderGoals() {
  const container = document.getElementById('goalsTracker');
  if (!container || !store.goals) return;

  container.innerHTML = Object.entries(store.goals).map(([key, goal]) => {
    const pct = Math.min((goal.current / goal.target) * 100, 100);
    const currentDisplay = goal.target >= 1000000
      ? (goal.current / 1000000).toFixed(1) + 'M'
      : goal.target >= 1000
        ? (goal.current / 1000).toFixed(1) + 'K'
        : goal.current;
    const targetDisplay = goal.target >= 1000000
      ? (goal.target / 1000000).toFixed(0) + 'M'
      : goal.target >= 1000
        ? (goal.target / 1000).toFixed(0) + 'K'
        : goal.target;

    return `
      <div class="goal-item">
        <div class="goal-icon">${goal.icon}</div>
        <div class="goal-info">
          <div class="goal-label-row">
            <span class="goal-label">${goal.label}</span>
            <span class="goal-values"><span>${currentDisplay}</span> / ${targetDisplay}</span>
          </div>
          <div class="goal-bar">
            <div class="goal-bar-fill goal-bar-${goal.barColor}" style="width: ${pct}%"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function showEditGoalsModal() {
  if (!store.goals) return;
  const g = store.goals;

  openModal('📊 Hedefleri Düzenle', `
    <div class="form-grid">
      <div class="form-group">
        <label>👥 Mevcut Takipçi</label>
        <input type="number" id="goalFollowersCurrent" class="form-input" value="${g.followers.current}" />
      </div>
      <div class="form-group">
        <label>👥 Takipçi Hedefi</label>
        <input type="number" id="goalFollowersTarget" class="form-input" value="${g.followers.target}" />
      </div>
      <div class="form-group">
        <label>👁️ Mevcut Gösterim (90g)</label>
        <input type="number" id="goalImpressionsCurrent" class="form-input" value="${g.impressions.current}" />
      </div>
      <div class="form-group">
        <label>👁️ Gösterim Hedefi</label>
        <input type="number" id="goalImpressionsTarget" class="form-input" value="${g.impressions.target}" />
      </div>
      <div class="form-group">
        <label>💰 Mevcut Gelir ($)</label>
        <input type="number" id="goalRevenueCurrent" class="form-input" value="${g.revenue.current}" step="0.01" />
      </div>
      <div class="form-group">
        <label>💰 Gelir Hedefi ($)</label>
        <input type="number" id="goalRevenueTarget" class="form-input" value="${g.revenue.target}" step="0.01" />
      </div>
      <div class="form-group">
        <label>🐦 Bu Ay Tweet Sayısı</label>
        <input type="number" id="goalTweetsCurrent" class="form-input" value="${g.tweets.current}" />
      </div>
      <div class="form-group">
        <label>🐦 Aylık Tweet Hedefi</label>
        <input type="number" id="goalTweetsTarget" class="form-input" value="${g.tweets.target}" />
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-outline" onclick="closeModal()">İptal</button>
      <button class="btn-primary" onclick="saveGoals()">Kaydet</button>
    </div>
  `);
}

window.saveGoals = function () {
  store.goals.followers.current = parseInt(document.getElementById('goalFollowersCurrent').value) || 0;
  store.goals.followers.target = parseInt(document.getElementById('goalFollowersTarget').value) || 500;
  store.goals.impressions.current = parseInt(document.getElementById('goalImpressionsCurrent').value) || 0;
  store.goals.impressions.target = parseInt(document.getElementById('goalImpressionsTarget').value) || 5000000;
  store.goals.revenue.current = parseFloat(document.getElementById('goalRevenueCurrent').value) || 0;
  store.goals.revenue.target = parseFloat(document.getElementById('goalRevenueTarget').value) || 200;
  store.goals.tweets.current = parseInt(document.getElementById('goalTweetsCurrent').value) || 0;
  store.goals.tweets.target = parseInt(document.getElementById('goalTweetsTarget').value) || 150;

  saveStore();
  closeModal();
  renderGoals();
  updateActionStats();
  showToast('Hedefler güncellendi!', 'success');
};

document.getElementById('editGoalsBtn')?.addEventListener('click', showEditGoalsModal);

function renderActionChecklist() {
  for (let phase = 1; phase <= 3; phase++) {
    const container = document.getElementById(`phase${phase}Checklist`);
    if (!container) continue;

    const phaseActions = ACTION_PLAN_DATA.filter(a => a.phase === phase);
    const prioLabels = { critical: 'KRİTİK', important: 'ÖNEMLİ', normal: 'NORMAL' };

    container.innerHTML = phaseActions.map(action => {
      const state = store.actionPlan.actions[action.id];
      const isCompleted = state?.completed;
      const completedDate = state?.completedDate;

      return `
        <div class="action-item ${isCompleted ? 'completed' : ''}" onclick="toggleActionItem('${action.id}')">
          <div class="action-checkbox ${isCompleted ? 'checked' : ''}" data-id="${action.id}"></div>
          <div class="action-item-content">
            <div class="action-item-title">${action.emoji} ${action.title}</div>
            <div class="action-item-desc">${action.desc}</div>
            <div class="action-item-meta">
              <span class="priority-badge priority-${action.priority}">${prioLabels[action.priority]}</span>
              ${isCompleted && completedDate ? `<span class="action-completed-date">✓ ${new Date(completedDate).toLocaleDateString('tr-TR')}</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Update phase progress
    const completed = phaseActions.filter(a => store.actionPlan.actions[a.id]?.completed).length;
    const total = phaseActions.length;
    const progressEl = document.getElementById(`phase${phase}Progress`);
    const barEl = document.getElementById(`phase${phase}Bar`);
    if (progressEl) progressEl.textContent = `${completed}/${total}`;
    if (barEl) barEl.style.width = `${(completed / total) * 100}%`;
  }
}

window.toggleActionItem = function (actionId) {
  const state = store.actionPlan.actions[actionId];

  if (state?.completed) {
    // Un-complete
    delete store.actionPlan.actions[actionId];
  } else {
    // Complete
    const today = new Date().toISOString().split('T')[0];
    store.actionPlan.actions[actionId] = {
      completed: true,
      completedDate: today,
    };

    // Track streak
    if (!store.actionPlan.streakDates.includes(today)) {
      store.actionPlan.streakDates.push(today);
    }

    // Animate checkbox
    setTimeout(() => {
      const cb = document.querySelector(`[data-id="${actionId}"]`);
      if (cb) cb.classList.add('just-checked');
      setTimeout(() => cb?.classList.remove('just-checked'), 300);
    }, 50);

    showToast('Aksiyon tamamlandı! 🎉', 'success');
  }

  saveStore();
  renderActionPlan();
};

function updateActionStats() {
  const totalActions = ACTION_PLAN_DATA.length;
  const completedActions = ACTION_PLAN_DATA.filter(a => store.actionPlan.actions[a.id]?.completed).length;

  // Completed count
  const completedEl = document.getElementById('actionCompleted');
  if (completedEl) completedEl.textContent = `${completedActions} / ${totalActions}`;

  // Days left
  const startDate = new Date(store.actionPlan.startDate);
  const now = new Date();
  const daysPassed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(90 - daysPassed, 0);
  const daysLeftEl = document.getElementById('actionDaysLeft');
  if (daysLeftEl) daysLeftEl.textContent = daysLeft;

  // Revenue goal
  const revenueEl = document.getElementById('actionRevenueGoal');
  if (revenueEl && store.goals) {
    revenueEl.textContent = `$${store.goals.revenue.current} / $${store.goals.revenue.target}`;
  }

  // Streak
  const streak = calculateStreak();
  const streakEl = document.getElementById('actionStreak');
  if (streakEl) streakEl.textContent = `🔥 ${streak} gün`;
}

function calculateStreak() {
  if (!store.actionPlan.streakDates || store.actionPlan.streakDates.length === 0) return 0;

  const dates = store.actionPlan.streakDates
    .map(d => new Date(d))
    .sort((a, b) => b - a);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if today or yesterday has activity
  const lastDate = new Date(dates[0]);
  lastDate.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
  if (diffDays > 1) return 0; // Streak broken

  let streak = 1;
  for (let i = 1; i < dates.length; i++) {
    const curr = new Date(dates[i - 1]);
    const prev = new Date(dates[i]);
    curr.setHours(0, 0, 0, 0);
    prev.setHours(0, 0, 0, 0);
    const diff = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      streak++;
    } else if (diff > 1) {
      break;
    }
  }

  return streak;
}

function renderOverallProgress() {
  const container = document.getElementById('overallProgressCircle');
  if (!container) return;

  const total = ACTION_PLAN_DATA.length;
  const completed = ACTION_PLAN_DATA.filter(a => store.actionPlan.actions[a.id]?.completed).length;
  const pct = Math.round((completed / total) * 100);

  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  container.innerHTML = `
    <svg viewBox="0 0 140 140">
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1DA1F2"/>
          <stop offset="100%" stop-color="#794BC4"/>
        </linearGradient>
      </defs>
      <circle class="progress-circle-bg" cx="70" cy="70" r="${radius}"/>
      <circle class="progress-circle-fill" cx="70" cy="70" r="${radius}"
        stroke-dasharray="${circumference}"
        stroke-dashoffset="${offset}"/>
      <text class="progress-circle-text" x="70" y="70">${pct}%</text>
    </svg>
    <div class="progress-circle-label">${completed} / ${total} aksiyon tamamlandı</div>
  `;
}

function renderMilestones() {
  const container = document.getElementById('milestoneList');
  if (!container) return;

  const completed = ACTION_PLAN_DATA.filter(a => store.actionPlan.actions[a.id]?.completed).length;
  const totalRevenue = store.goals ? store.goals.revenue.current : 0;

  const milestones = [
    { icon: '🚀', title: 'İlk Adım', desc: 'İlk aksiyonu tamamla', check: completed >= 1 },
    { icon: '🔥', title: 'Hızlı Başlangıç', desc: 'Phase 1\'den 3 aksiyon tamamla', check: ACTION_PLAN_DATA.filter(a => a.phase === 1 && store.actionPlan.actions[a.id]?.completed).length >= 3 },
    { icon: '💰', title: 'İlk Gelir', desc: 'İlk dolarını kazan', check: totalRevenue > 0 },
    { icon: '⚡', title: 'Phase 1 Tamam', desc: '0-30 gün planını tamamla', check: ACTION_PLAN_DATA.filter(a => a.phase === 1 && store.actionPlan.actions[a.id]?.completed).length === 6 },
    { icon: '📈', title: 'Momentum', desc: 'Phase 2\'den 3 aksiyon tamamla', check: ACTION_PLAN_DATA.filter(a => a.phase === 2 && store.actionPlan.actions[a.id]?.completed).length >= 3 },
    { icon: '🏆', title: 'Master', desc: 'Tüm 18 aksiyonu tamamla', check: completed === 18 },
  ];

  container.innerHTML = milestones.map(m => {
    const status = m.check ? 'milestone-done' : 'milestone-pending';
    const statusText = m.check ? '✓ Tamamlandı' : '○ Devam';
    return `
      <div class="milestone-item">
        <div class="milestone-icon">${m.icon}</div>
        <div class="milestone-info">
          <h5>${m.title}</h5>
          <p>${m.desc}</p>
        </div>
        <span class="milestone-status ${status}">${statusText}</span>
      </div>
    `;
  }).join('');
}

// ---- Initialize ----
function init() {
  updateDate();
  updateDashboardStats();
  drawRevenueChart('week');
  drawGrowthChart();
  renderActivities();
  renderRevenueTable();
  renderContentQueue();
  renderAffiliateTable();
  renderStrategies('all');
  updateGrowthStats();
  updateBreakdownAmounts();
  initActionPlan();

  // Load demo data if first visit
  if (!localStorage.getItem('xgp_initialized')) {
    loadDemoData();
    localStorage.setItem('xgp_initialized', 'true');
  }
}

function loadDemoData() {
  store.revenue = [
    { source: 'ad_revenue', amount: '127.50', description: 'Şubat 1-15 dönemi reklam geliri', date: '2026-02-15', status: 'paid', id: 1 },
    { source: 'ad_revenue', amount: '95.30', description: 'Ocak 16-31 dönemi reklam geliri', date: '2026-01-31', status: 'paid', id: 2 },
    { source: 'affiliate', amount: '45.00', description: 'Hostinger referral komisyonu', date: '2026-02-10', status: 'paid', id: 3 },
    { source: 'tips', amount: '15.00', description: 'Takipçi bahşişleri', date: '2026-02-12', status: 'paid', id: 4 },
    { source: 'affiliate', amount: '78.50', description: 'ChatGPT Plus referral', date: '2026-02-18', status: 'pending', id: 5 },
    { source: 'subscriptions', amount: '29.97', description: '3 abone x $9.99', date: '2026-02-01', status: 'paid', id: 6 },
    { source: 'sponsored', amount: '250.00', description: 'AI tool sponsorlu tweet', date: '2026-02-08', status: 'paid', id: 7 },
  ];

  store.affiliateLinks = [
    { product: 'Hostinger', category: 'hosting', link: 'https://hostinger.com/?ref=getpaid', commission: '60', clicks: 342, conversions: 12, earnings: 180, id: 1 },
    { product: 'ChatGPT Plus', category: 'tech', link: 'https://chat.openai.com/ref/getpaid', commission: '35', clicks: 528, conversions: 28, earnings: 392, id: 2 },
    { product: 'Udemy', category: 'education', link: 'https://udemy.com/ref/getpaid', commission: '20', clicks: 186, conversions: 8, earnings: 48, id: 3 },
  ];

  store.contentQueue = [
    { type: 'thread', text: '🧵 AI ile X\'te büyüme stratejileri: 10 adımlık rehber', scheduledAt: '2026-02-21T09:00', id: 1, status: 'scheduled' },
    { type: 'tweet', text: '💡 En büyük hata: X Premium almadan monetizasyon denemek. İşte nedeni...', scheduledAt: '2026-02-20T17:00', id: 2, status: 'scheduled' },
    { type: 'affiliate', text: '🔗 ChatGPT Plus denedim - 10 farklı kullanım senaryosu [thread]', scheduledAt: '2026-02-22T10:00', id: 3, status: 'scheduled' },
  ];

  store.accountInfo = {
    followers: 2847,
    impressions: 3420000,
    engagement: 4.7,
  };

  saveStore();

  // Re-render everything
  updateDashboardStats();
  renderActivities();
  renderRevenueTable();
  renderContentQueue();
  renderAffiliateTable();
  updateBreakdownAmounts();
}

// Run initialization
init();
