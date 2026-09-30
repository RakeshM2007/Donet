/**
 * DONATION MANAGEMENT SYSTEM - CORE SCRIPT
 * Complete Frontend Logic using localStorage and Cloud Firestore dual-sync
 */

// =============================================================================
// 1. CONSTANTS & STORAGE KEYS
// =============================================================================
const STORAGE_KEYS = {
  USERS: 'dms_users',
  CURRENT_USER: 'dms_current_user',
  DONATIONS: 'dms_donations',
  REQUESTS: 'dms_requests',
  CHATS: 'dms_chats',
  NOTIFICATIONS: 'dms_notifications',
  SEARCH_HISTORY: 'dms_search_history',
  SETTINGS: 'dms_settings',
  THEME: 'dms_theme'
};

const CATEGORIES = [
  { id: 'clothes', name: 'Clothes', icon: '👕', desc: 'Shirts, pants, jackets, kids wear' },
  { id: 'food', name: 'Food', icon: '🍚', desc: 'Cooked meals, raw groceries, packaged food' },
  { id: 'money', name: 'Money', icon: '💰', desc: 'Direct financial aid for urgent causes' },
  { id: 'medicine', name: 'Medicine', icon: '💊', desc: 'Essential unopened medicines & first aid' },
  { id: 'books', name: 'Books', icon: '📚', desc: 'School textbooks, novels, study materials' },
  { id: 'toys', name: 'Toys', icon: '🧸', desc: 'Children toys, puzzles, games' },
  { id: 'shoes', name: 'Shoes', icon: '👟', desc: 'Footwear for adults and children' },
  { id: 'household', name: 'Household Items', icon: '🏠', desc: 'Kitchenware, appliances, utensils' },
  { id: 'blankets', name: 'Blankets', icon: '🛏️', desc: 'Bedding, winter blankets, mats' },
  { id: 'other', name: 'Other Items', icon: '📦', desc: 'Miscellaneous emergency & utility items' }
];

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
];

// =============================================================================
// 2. REUSABLE LOCALSTORAGE HELPER FUNCTIONS
// =============================================================================
function getData(key, defaultValue = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err);
    return false;
  }
}

function updateData(key, id, updateObj) {
  const items = getData(key, []);
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updateObj, updatedAt: new Date().toISOString() };
    saveData(key, items);
    return items[index];
  }
  return null;
}

function deleteData(key, id) {
  const items = getData(key, []);
  const filtered = items.filter(item => item.id !== id);
  saveData(key, filtered);
  if (key === STORAGE_KEYS.DONATIONS) syncFirebase('donations', 'delete', id);
  if (key === STORAGE_KEYS.REQUESTS) syncFirebase('requests', 'delete', id);
  return filtered;
}

function getCurrentUser() {
  return getData(STORAGE_KEYS.CURRENT_USER, null);
}
window.getCurrentUser = getCurrentUser;

function setCurrentUser(user) {
  saveData(STORAGE_KEYS.CURRENT_USER, user);
}

function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

function generateId(prefix = 'ITEM') {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// Global Firebase dual-sync helper
function syncFirebase(collectionName, action, docData, fields = {}) {
  if (window.DMS_FIREBASE && typeof window.DMS_FIREBASE.isAvailable === 'function' && window.DMS_FIREBASE.isAvailable()) {
    try {
      if (collectionName === 'users') {
        if (action === 'save') window.DMS_FIREBASE.saveUser(docData);
      } else if (collectionName === 'donations') {
        if (action === 'save') window.DMS_FIREBASE.saveDonation(docData);
        else if (action === 'update') window.DMS_FIREBASE.updateDonation(docData, fields);
        else if (action === 'delete') window.DMS_FIREBASE.deleteDonation(docData);
      } else if (collectionName === 'requests') {
        if (action === 'save') window.DMS_FIREBASE.saveRequest(docData);
        else if (action === 'update') window.DMS_FIREBASE.updateRequest(docData, fields);
        else if (action === 'delete') window.DMS_FIREBASE.deleteRequest(docData);
      } else if (collectionName === 'chats') {
        if (action === 'save') window.DMS_FIREBASE.saveChat(docData);
      } else if (collectionName === 'notifications') {
        if (action === 'save') window.DMS_FIREBASE.saveNotification(docData);
      }
    } catch (e) {
      console.warn('Firebase dual-sync error:', e);
    }
  }
}

// =============================================================================
// 3. UI HELPERS & NOTIFICATIONS (TOASTS, BADGES, AUDIO)
// =============================================================================
function showToast(message, type = 'info', title = '') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const iconMap = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  toast.innerHTML = `
    <span style="font-size: 1.25rem;">${iconMap[type] || '🔔'}</span>
    <div style="flex: 1;">
      ${title ? `<div style="font-weight: 700; font-size: 0.85rem; margin-bottom: 2px;">${title}</div>` : ''}
      <div style="font-size: 0.85rem;">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function playNotificationSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Audio context may be restricted before user interaction
  }
}

function getStatusBadge(status) {
  const s = (status || 'pending').toLowerCase();
  let badgeClass = 'badge-pending';
  let icon = '⏳';

  if (s === 'requested') {
    badgeClass = 'badge-requested';
    icon = '📩';
  } else if (s === 'accepted') {
    badgeClass = 'badge-accepted';
    icon = '🤝';
  } else if (s === 'completed') {
    badgeClass = 'badge-completed';
    icon = '✅';
  } else if (s === 'rejected') {
    badgeClass = 'badge-rejected';
    icon = '⛔';
  } else if (s === 'cancelled') {
    badgeClass = 'badge-cancelled';
    icon = '🚫';
  }

  return `<span class="badge ${badgeClass}">${icon} ${status}</span>`;
}

function getCategoryIcon(catId) {
  const cat = CATEGORIES.find(c => c.id.toLowerCase() === (catId || '').toLowerCase() || c.name.toLowerCase() === (catId || '').toLowerCase());
  return cat ? cat.icon : '📦';
}

function formatDate(isoStr) {
  if (!isoStr) return 'N/A';
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// =============================================================================
// 4. THEME & INITIALIZATION
// =============================================================================
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  themeToggleBtns.forEach(btn => {
    btn.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
    btn.setAttribute('title', savedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    btn.onclick = () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEYS.THEME, next);
      btn.innerHTML = next === 'dark' ? '☀️' : '🌙';
      showToast(`Switched to ${next} mode`, 'info');
    };
  });
}

// =============================================================================
// 5. AUTHENTICATION & ACCESS CONTROL
// =============================================================================
const ADMIN_PASSKEY = 'RK2007';

function verifyAdminPasskey(key) {
  return key === ADMIN_PASSKEY;
}

function registerUser(userData) {
  const users = getData(STORAGE_KEYS.USERS, []);
  
  // Validation
  if (!userData.name || !userData.email || !userData.phone || !userData.password || !userData.role) {
    return { success: false, message: 'All required fields must be filled.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userData.email)) {
    return { success: false, message: 'Please enter a valid email address.' };
  }

  if (userData.phone.replace(/\D/g, '').length < 8) {
    return { success: false, message: 'Please enter a valid phone number (at least 8 digits).' };
  }

  if (userData.password.length < 6) {
    return { success: false, message: 'Password must be at least 6 characters long.' };
  }

  if (userData.password !== userData.confirmPassword) {
    return { success: false, message: 'Password and Confirm Password do not match.' };
  }

  if (userData.role === 'admin') {
    if (!userData.adminKey || !verifyAdminPasskey(userData.adminKey)) {
      return { success: false, message: 'Invalid Admin Passkey. Access denied.' };
    }
  }

  const existing = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
  if (existing) {
    return { success: false, message: 'An account with this email already exists. Please login.' };
  }

  const newUser = {
    id: generateId('USR'),
    name: userData.name.trim(),
    email: userData.email.trim().toLowerCase(),
    phone: userData.phone.trim(),
    password: userData.password,
    address: userData.address || '',
    city: userData.city || 'Chennai',
    role: userData.role, // 'donor' | 'donee' | 'admin'
    avatar: userData.avatar || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
    status: 'active',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveData(STORAGE_KEYS.USERS, users);
  syncFirebase('users', 'save', newUser);

  return { success: true, message: 'Registration successful! Please login to continue.', user: newUser };
}

function loginUser(email, password, adminPasskey = null) {
  const users = getData(STORAGE_KEYS.USERS, []);
  const cleanEmail = (email || '').trim().toLowerCase();
  
  const user = users.find(u => (u.email.toLowerCase() === cleanEmail || u.name.toLowerCase() === cleanEmail) && u.password === password);
  
  if (!user) {
    return { success: false, message: 'Invalid email or password. Please verify your credentials.' };
  }

  if (user.status === 'inactive') {
    return { success: false, message: 'This account has been deactivated by the administrator.' };
  }

  if (user.role === 'admin') {
    if (!adminPasskey) {
      return { success: false, requireAdminPasskey: true, user, message: 'Admin Passkey required.' };
    }
    if (!verifyAdminPasskey(adminPasskey)) {
      return { success: false, message: 'Invalid Admin Passkey. Access denied.' };
    }
  }

  // Create session
  setCurrentUser({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    city: user.city,
    address: user.address,
    avatar: user.avatar
  });

  return { success: true, user };
}

function logoutUser() {
  clearCurrentUser();
  showToast('Logged out successfully', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 400);
}

function checkAuth(allowedRoles = []) {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'index.html';
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role.toLowerCase())) {
    showToast(`Access restricted for ${user.role} role.`, 'error');
    if (user.role === 'donor') window.location.href = 'donor-dashboard.html';
    else if (user.role === 'donee') window.location.href = 'donee-dashboard.html';
    else if (user.role === 'admin') window.location.href = 'admin-dashboard.html';
    return null;
  }

  return user;
}

// =============================================================================
// 6. DYNAMIC SIDEBAR & HEADER RENDERER
// =============================================================================
function renderAppChrome(activeNavId = '') {
  const user = getCurrentUser();
  if (!user) return;

  // Update user badge in topbar & sidebar
  const userAvatars = document.querySelectorAll('.current-user-avatar');
  userAvatars.forEach(img => {
    img.src = user.avatar || DEFAULT_AVATARS[0];
    img.alt = user.name;
  });

  const userNames = document.querySelectorAll('.current-user-name');
  userNames.forEach(el => el.textContent = user.name);

  const userRoles = document.querySelectorAll('.current-user-role');
  userRoles.forEach(el => {
    el.textContent = user.role.toUpperCase();
    el.className = `current-user-role badge badge-role-${user.role.toLowerCase()}`;
  });

  // Render navigation links based on role
  const sidebarNav = document.getElementById('sidebar-nav');
  if (sidebarNav) {
    let navLinks = [];

    if (user.role === 'donor') {
      navLinks = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', href: 'donor-dashboard.html' },
        { id: 'profile', label: 'My Profile', icon: '👤', href: 'profile.html' },
        { id: 'donate', label: 'Donate Now', icon: '🎁', href: 'donate.html' },
        { id: 'donations', label: 'My Donations', icon: '📦', href: 'donations.html' },
        { id: 'requests', label: 'Donation Requests', icon: '📩', href: 'requests.html' },
        { id: 'available-requests', label: 'Available Requests', icon: '📍', href: 'requests.html?tab=available' },
        { id: 'chat', label: 'Chat', icon: '💬', href: 'chat.html' },
        { id: 'history', label: 'Donation History', icon: '📜', href: 'donation-history.html' },
        { id: 'notifications', label: 'Notifications', icon: '🔔', href: 'notifications.html' },
        { id: 'reports', label: 'Reports', icon: '📈', href: 'reports.html' },
        { id: 'settings', label: 'Settings', icon: '⚙️', href: 'settings.html' }
      ];
    } else if (user.role === 'donee') {
      navLinks = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', href: 'donee-dashboard.html' },
        { id: 'profile', label: 'My Profile', icon: '👤', href: 'profile.html' },
        { id: 'search', label: 'Search Items', icon: '🔍', href: 'search-items.html' },
        { id: 'available-donations', label: 'Available Donations', icon: '🎁', href: 'available-donations.html' },
        { id: 'request-donation', label: 'Request Donation', icon: '✍️', href: 'request-donation.html' },
        { id: 'requests', label: 'My Requests', icon: '📋', href: 'requests.html' },
        { id: 'received', label: 'Received Donations', icon: '📦', href: 'donation-history.html?filter=completed' },
        { id: 'chat', label: 'Chat', icon: '💬', href: 'chat.html' },
        { id: 'notifications', label: 'Notifications', icon: '🔔', href: 'notifications.html' },
        { id: 'reports', label: 'Reports', icon: '📈', href: 'reports.html' },
        { id: 'settings', label: 'Settings', icon: '⚙️', href: 'settings.html' }
      ];
    } else if (user.role === 'admin') {
      navLinks = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', href: 'admin-dashboard.html' },
        { id: 'users', label: 'User Management', icon: '👥', href: 'admin-dashboard.html#users-section' },
        { id: 'donations', label: 'Donation Records', icon: '🎁', href: 'admin-dashboard.html#donations-section' },
        { id: 'requests', label: 'Request Records', icon: '📋', href: 'admin-dashboard.html#requests-section' },
        { id: 'chat', label: 'Chat System', icon: '💬', href: 'chat.html' },
        { id: 'history', label: 'All History', icon: '📜', href: 'donation-history.html' },
        { id: 'reports', label: 'Reports & Analytics', icon: '📈', href: 'reports.html' },
        { id: 'settings', label: 'Settings', icon: '⚙️', href: 'settings.html' }
      ];
    }

    sidebarNav.innerHTML = navLinks.map(link => `
      <a href="${link.href}" class="nav-item ${activeNavId === link.id ? 'active' : ''}">
        <span class="nav-item-icon">${link.icon}</span>
        <span>${link.label}</span>
      </a>
    `).join('');
  }

  // Mobile sidebar toggle
  const toggleBtn = document.querySelector('.sidebar-toggle-btn');
  const sidebar = document.querySelector('.app-sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.onclick = () => sidebar.classList.toggle('open');
  }

  // Update notification badge count in topbar
  updateNotificationBadge();
}

// =============================================================================
// 7. NOTIFICATION SYSTEM
// =============================================================================
function addNotification(recipientId, title, message, link = '#', type = 'info') {
  const notifications = getData(STORAGE_KEYS.NOTIFICATIONS, []);
  const newNotif = {
    id: generateId('NOTIF'),
    recipientId,
    title,
    message,
    link,
    type,
    read: false,
    createdAt: new Date().toISOString()
  };
  notifications.unshift(newNotif);
  saveData(STORAGE_KEYS.NOTIFICATIONS, notifications);
  syncFirebase('notifications', 'save', newNotif);
  
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === recipientId) {
    playNotificationSound();
    showToast(message, type, title);
    updateNotificationBadge();
  }
}

function updateNotificationBadge() {
  const user = getCurrentUser();
  if (!user) return;
  
  const notifications = getData(STORAGE_KEYS.NOTIFICATIONS, []);
  const unreadCount = notifications.filter(n => n.recipientId === user.id && !n.read).length;

  const badges = document.querySelectorAll('.notification-count');
  badges.forEach(b => {
    if (unreadCount > 0) {
      b.textContent = unreadCount > 9 ? '9+' : unreadCount;
      b.classList.remove('hidden');
    } else {
      b.classList.add('hidden');
    }
  });

  // Also render topbar notification dropdown if it exists
  const dropdownList = document.getElementById('notif-dropdown-list');
  if (dropdownList) {
    const userNotifs = notifications.filter(n => n.recipientId === user.id).slice(0, 5);
    if (userNotifs.length === 0) {
      dropdownList.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No notifications yet.</div>`;
    } else {
      dropdownList.innerHTML = userNotifs.map(n => `
        <div class="dropdown-item ${n.read ? '' : 'unread'}" onclick="handleNotifClick('${n.id}', '${n.link}')">
          <div style="font-size: 1.25rem;">${n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : '🔔'}</div>
          <div>
            <div style="font-weight: 600; color: var(--text-main); font-size: 0.825rem;">${n.title}</div>
            <div style="color: var(--text-muted); font-size: 0.775rem;">${n.message}</div>
            <div style="font-size: 0.7rem; color: var(--text-light); margin-top: 2px;">${formatDate(n.createdAt)}</div>
          </div>
        </div>
      `).join('');
    }
  }
}

function handleNotifClick(notifId, link) {
  const notifications = getData(STORAGE_KEYS.NOTIFICATIONS, []);
  const target = notifications.find(n => n.id === notifId);
  if (target) {
    target.read = true;
    saveData(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
  if (link && link !== '#') {
    window.location.href = link;
  } else {
    updateNotificationBadge();
  }
}

function markAllNotificationsAsRead() {
  const user = getCurrentUser();
  if (!user) return;
  const notifications = getData(STORAGE_KEYS.NOTIFICATIONS, []);
  notifications.forEach(n => {
    if (n.recipientId === user.id) n.read = true;
  });
  saveData(STORAGE_KEYS.NOTIFICATIONS, notifications);
  updateNotificationBadge();
  showToast('All notifications marked as read', 'success');
}

// =============================================================================
// 8. DONATION CREATION & MANAGEMENT
// =============================================================================
function createDonation(donationData) {
  const user = getCurrentUser();
  if (!user || user.role !== 'donor') {
    return { success: false, message: 'Only registered donors can post donations.' };
  }

  // Category specific validation
  if (donationData.category === 'food') {
    const expiry = new Date(donationData.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expiry < today) {
      return { success: false, message: 'Expired food items cannot be accepted. Please enter a valid expiry date.' };
    }
  }

  if (donationData.category === 'medicine') {
    const expiry = new Date(donationData.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expiry < today) {
      return { success: false, message: 'Expired medicines cannot be donated. Please enter a valid future expiry date.' };
    }
  }

  if (donationData.category === 'money') {
    if (!donationData.amount || Number(donationData.amount) <= 0) {
      return { success: false, message: 'Please enter a valid donation amount.' };
    }
  }

  const donations = getData(STORAGE_KEYS.DONATIONS, []);
  const newDonation = {
    id: generateId('DON'),
    donorId: user.id,
    donorName: user.name,
    donorAvatar: user.avatar,
    donorCity: user.city || donationData.location || 'Chennai',
    donorPhone: user.phone,
    category: donationData.category,
    itemName: donationData.itemName || (donationData.category === 'money' ? `Financial Aid (${donationData.currency} ${donationData.amount})` : 'Item Donation'),
    quantity: donationData.quantity || (donationData.category === 'money' ? `${donationData.currency} ${donationData.amount}` : '1 unit'),
    amount: donationData.amount || null,
    currency: donationData.currency || 'USD',
    purpose: donationData.purpose || '',
    condition: donationData.condition || 'New',
    description: donationData.description || '',
    location: donationData.location || user.city || 'Chennai',
    pickupOption: donationData.pickupOption || 'Pickup Available',
    preferredDate: donationData.preferredDate || new Date().toISOString().split('T')[0],
    expiryDate: donationData.expiryDate || null,
    preparationDate: donationData.preparationDate || null,
    isVeg: donationData.isVeg || false,
    size: donationData.size || '',
    ageGroup: donationData.ageGroup || '',
    medicineType: donationData.medicineType || '',
    paymentStatus: donationData.category === 'money' ? 'Simulated / Pending' : null,
    status: 'Pending', // Pending -> Requested -> Accepted -> Completed, Cancelled, Rejected
    doneeId: null,
    doneeName: null,
    createdAt: new Date().toISOString()
  };

  donations.unshift(newDonation);
  saveData(STORAGE_KEYS.DONATIONS, donations);
  syncFirebase('donations', 'save', newDonation);

  // Notify donor
  addNotification(user.id, 'Donation Created', `Your donation for "${newDonation.itemName}" is live and ready to help!`, 'donations.html', 'success');

  // Check smart match: Does any existing Donee request match this item?
  const requests = getData(STORAGE_KEYS.REQUESTS, []);
  const matches = requests.filter(r => r.status === 'Pending' && 
    (r.itemType.toLowerCase() === newDonation.category.toLowerCase() ||
     newDonation.itemName.toLowerCase().includes(r.itemName.toLowerCase()) ||
     r.itemName.toLowerCase().includes(newDonation.itemName.toLowerCase()))
  );

  matches.forEach(m => {
    addNotification(m.doneeId, 'Matching Donation Available!', `A donor just posted "${newDonation.itemName}" in ${newDonation.location} which matches your request!`, `search-items.html?q=${encodeURIComponent(newDonation.itemName)}`, 'info');
  });

  return { success: true, message: 'Donation successfully published!', donation: newDonation };
}

function updateDonation(donationId, updatedFields) {
  const donations = getData(STORAGE_KEYS.DONATIONS, []);
  const item = donations.find(d => d.id === donationId);
  if (!item) return { success: false, message: 'Donation not found' };

  if (item.status !== 'Pending') {
    return { success: false, message: 'Only Pending donations can be edited.' };
  }

  Object.assign(item, updatedFields);
  saveData(STORAGE_KEYS.DONATIONS, donations);
  syncFirebase('donations', 'update', donationId, updatedFields);
  return { success: true, message: 'Donation updated successfully.', donation: item };
}

function cancelDonation(donationId) {
  const donations = getData(STORAGE_KEYS.DONATIONS, []);
  const item = donations.find(d => d.id === donationId);
  if (!item) return { success: false, message: 'Donation not found' };

  item.status = 'Cancelled';
  saveData(STORAGE_KEYS.DONATIONS, donations);
  syncFirebase('donations', 'update', donationId, { status: 'Cancelled' });

  if (item.doneeId) {
    addNotification(item.doneeId, 'Donation Cancelled', `The donation for "${item.itemName}" was cancelled by the donor.`, 'requests.html', 'warning');
  }

  return { success: true, message: 'Donation has been cancelled.' };
}

// =============================================================================
// 9. DONEE REQUESTS & REQUEST MATCHING
// =============================================================================
function createDonationRequest(reqData) {
  const user = getCurrentUser();
  if (!user || user.role !== 'donee') {
    return { success: false, message: 'Only registered donees can create donation requests.' };
  }

  if (!reqData.itemName || !reqData.quantityRequired) {
    return { success: false, message: 'Please provide item name and quantity needed.' };
  }

  const requests = getData(STORAGE_KEYS.REQUESTS, []);
  const newReq = {
    id: generateId('REQ'),
    doneeId: user.id,
    doneeName: user.name,
    doneeAvatar: user.avatar,
    doneeCity: user.city || reqData.location || 'Chennai',
    doneePhone: user.phone,
    itemType: reqData.itemType || 'other',
    itemName: reqData.itemName.trim(),
    quantityRequired: reqData.quantityRequired,
    description: reqData.description || '',
    reason: reqData.reason || '',
    urgency: reqData.urgency || 'Medium',
    location: reqData.location || user.city || 'Chennai',
    requiredDate: reqData.requiredDate || new Date().toISOString().split('T')[0],
    status: 'Pending', // Pending -> Accepted -> Rejected -> Completed
    matchedDonationId: null,
    donorId: null,
    donorName: null,
    createdAt: new Date().toISOString()
  };

  requests.unshift(newReq);
  saveData(STORAGE_KEYS.REQUESTS, requests);
  syncFirebase('requests', 'save', newReq);

  // Notify donee
  addNotification(user.id, 'Request Created', `Your request for "${newReq.itemName}" has been registered.`, 'requests.html', 'success');

  // Notify donors in vicinity / category
  const users = getData(STORAGE_KEYS.USERS, []);
  const donors = users.filter(u => u.role === 'donor');
  donors.forEach(d => {
    addNotification(d.id, 'New Request Nearby', `A donee in ${newReq.location} urgently needs "${newReq.itemName}" (${newReq.urgency} urgency).`, 'requests.html?tab=available', 'info');
  });

  return { success: true, message: 'Donation request successfully created!', request: newReq };
}

function requestAvailableItem(donationId, details = {}) {
  const user = getCurrentUser();
  if (!user || user.role !== 'donee') {
    return { success: false, message: 'Please login as a Donee to request this item.' };
  }

  const donations = getData(STORAGE_KEYS.DONATIONS, []);
  const donation = donations.find(d => d.id === donationId);
  if (!donation) return { success: false, message: 'Donation item not found.' };

  if (donation.status !== 'Pending') {
    return { success: false, message: `This item is already ${donation.status}.` };
  }

  // Update donation status to Requested
  donation.status = 'Requested';
  donation.doneeId = user.id;
  donation.doneeName = user.name;
  donation.requestDetails = {
    message: details.message || 'I would like to request this item.',
    quantityRequested: details.quantity || donation.quantity,
    preferredDate: details.preferredDate || new Date().toISOString().split('T')[0],
    location: details.location || user.city || 'Chennai',
    requestedAt: new Date().toISOString()
  };

  saveData(STORAGE_KEYS.DONATIONS, donations);
  syncFirebase('donations', 'update', donation.id, donation);

  // Also create a linked request record
  const requests = getData(STORAGE_KEYS.REQUESTS, []);
  const newReq = {
    id: generateId('REQ'),
    doneeId: user.id,
    doneeName: user.name,
    doneeAvatar: user.avatar,
    doneeCity: user.city || 'Chennai',
    doneePhone: user.phone,
    itemType: donation.category,
    itemName: donation.itemName,
    quantityRequired: details.quantity || donation.quantity,
    description: details.message || 'Direct item request',
    reason: 'Direct item request from catalog',
    urgency: 'Medium',
    location: details.location || user.city || 'Chennai',
    requiredDate: details.preferredDate || new Date().toISOString().split('T')[0],
    status: 'Pending',
    matchedDonationId: donation.id,
    donorId: donation.donorId,
    donorName: donation.donorName,
    createdAt: new Date().toISOString()
  };
  requests.unshift(newReq);
  saveData(STORAGE_KEYS.REQUESTS, requests);
  syncFirebase('requests', 'save', newReq);

  // Send notification to donor
  addNotification(
    donation.donorId,
    'Item Requested!',
    `${user.name} has requested your item: "${donation.itemName}".`,
    'requests.html',
    'info'
  );

  // Send initial chat message directly between them
  sendChatMessage(
    user.id,
    donation.donorId,
    `Hello ${donation.donorName}! I have requested your donation "${donation.itemName}" (Qty: ${details.quantity || donation.quantity}). Note: "${details.message || 'Please let me know if it is available!'}"`
  );

  return { success: true, message: 'Request submitted! The donor has been notified.', donation };
}

function acceptIncomingRequest(donationId) {
  const user = getCurrentUser();
  const donations = getData(STORAGE_KEYS.DONATIONS, []);
  const item = donations.find(d => d.id === donationId);
  if (!item) return { success: false, message: 'Donation not found' };

  item.status = 'Accepted';
  saveData(STORAGE_KEYS.DONATIONS, donations);
  syncFirebase('donations', 'update', donationId, { status: 'Accepted' });

  // Update request item if exists
  const requests = getData(STORAGE_KEYS.REQUESTS, []);
  const req = requests.find(r => r.matchedDonationId === donationId || (r.doneeId === item.doneeId && r.itemName === item.itemName));
  if (req) {
    req.status = 'Accepted';
    req.donorId = user.id;
    req.donorName = user.name;
    saveData(STORAGE_KEYS.REQUESTS, requests);
    syncFirebase('requests', 'update', req.id, { status: 'Accepted', donorId: user.id, donorName: user.name });
  }

  // Notify Donee
  if (item.doneeId) {
    addNotification(
      item.doneeId,
      'Request Accepted!',
      `Good news! Donor ${user.name} accepted your request for "${item.itemName}". Connect on chat to arrange handover.`,
      'chat.html',
      'success'
    );

    sendChatMessage(
      user.id,
      item.doneeId,
      `Hello ${item.doneeName}! I have accepted your request for "${item.itemName}". We can coordinate pickup/handover details here!`
    );
  }

  return { success: true, message: 'Request accepted! You can now coordinate handover via Chat.' };
}

function rejectIncomingRequest(donationId, reason = '') {
  const user = getCurrentUser();
  const donations = getData(STORAGE_KEYS.DONATIONS, []);
  const item = donations.find(d => d.id === donationId);
  if (!item) return { success: false, message: 'Donation not found' };

  const prevDoneeId = item.doneeId;
  const itemName = item.itemName;

  // Restore donation back to Pending so others can request it
  item.status = 'Pending';
  item.doneeId = null;
  item.doneeName = null;
  item.requestDetails = null;
  saveData(STORAGE_KEYS.DONATIONS, donations);
  syncFirebase('donations', 'update', donationId, { status: 'Pending', doneeId: null, doneeName: null, requestDetails: null });

  // Update request record
  const requests = getData(STORAGE_KEYS.REQUESTS, []);
  const req = requests.find(r => r.matchedDonationId === donationId);
  if (req) {
    req.status = 'Rejected';
    saveData(STORAGE_KEYS.REQUESTS, requests);
    syncFirebase('requests', 'update', req.id, { status: 'Rejected' });
  }

  if (prevDoneeId) {
    addNotification(
      prevDoneeId,
      'Request Declined',
      `Your request for "${itemName}" was declined by the donor. Reason: ${reason || 'Item unavailable'}.`,
      'requests.html',
      'warning'
    );
  }

  return { success: true, message: 'Request rejected. The donation has been reset to Available.' };
}

function completeDonation(donationId) {
  const user = getCurrentUser();
  const donations = getData(STORAGE_KEYS.DONATIONS, []);
  const item = donations.find(d => d.id === donationId);
  if (!item) return { success: false, message: 'Donation not found' };

  item.status = 'Completed';
  item.completedAt = new Date().toISOString();
  saveData(STORAGE_KEYS.DONATIONS, donations);
  syncFirebase('donations', 'update', donationId, { status: 'Completed', completedAt: item.completedAt });

  // Update request record if matched
  const requests = getData(STORAGE_KEYS.REQUESTS, []);
  const req = requests.find(r => r.matchedDonationId === donationId);
  if (req) {
    req.status = 'Completed';
    saveData(STORAGE_KEYS.REQUESTS, requests);
    syncFirebase('requests', 'update', req.id, { status: 'Completed' });
  }

  // Notify both parties
  if (item.doneeId) {
    addNotification(
      item.doneeId,
      'Donation Handover Completed!',
      `The donation for "${item.itemName}" is marked as completed. Thank you for using our platform!`,
      'donation-history.html',
      'success'
    );
  }

  addNotification(
    item.donorId,
    'Donation Completed!',
    `Thank you for making a difference! Your donation "${item.itemName}" was marked completed.`,
    'donations.html',
    'success'
  );

  return { success: true, message: 'Donation marked as completed!' };
}

// =============================================================================
// 10. SEARCH, FILTERING & SMART ITEM MATCHING
// =============================================================================
function searchAvailableDonations(query = '', filters = {}) {
  const donations = getData(STORAGE_KEYS.DONATIONS, []);
  const q = (query || '').trim().toLowerCase();

  return donations.filter(d => {
    // Only available or requested donations for catalog search
    if (filters.status && filters.status !== 'all') {
      if (d.status.toLowerCase() !== filters.status.toLowerCase()) return false;
    }

    // Keyword match
    if (q) {
      const matchName = d.itemName.toLowerCase().includes(q);
      const matchCat = d.category.toLowerCase().includes(q);
      const matchDesc = (d.description || '').toLowerCase().includes(q);
      const matchLoc = (d.location || '').toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchDesc && !matchLoc) return false;
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      if (d.category.toLowerCase() !== filters.category.toLowerCase()) return false;
    }

    // Location filter
    if (filters.location && filters.location !== 'all') {
      if (!d.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    }

    // Condition filter
    if (filters.condition && filters.condition !== 'all') {
      if ((d.condition || '').toLowerCase() !== filters.condition.toLowerCase()) return false;
    }

    return true;
  });
}

function getSearchSuggestions(input = '') {
  const q = input.trim().toLowerCase();
  if (!q) return [];

  const donations = getData(STORAGE_KEYS.DONATIONS, []);
  const set = new Set();

  CATEGORIES.forEach(c => {
    if (c.name.toLowerCase().includes(q)) set.add(c.name);
  });

  donations.forEach(d => {
    if (d.itemName.toLowerCase().includes(q)) set.add(d.itemName);
    if (d.location.toLowerCase().includes(q)) set.add(d.location);
  });

  return Array.from(set).slice(0, 6);
}

function saveSearchHistory(query) {
  if (!query || !query.trim()) return;
  const history = getData(STORAGE_KEYS.SEARCH_HISTORY, []);
  const clean = query.trim();
  const filtered = history.filter(item => item.toLowerCase() !== clean.toLowerCase());
  filtered.unshift(clean);
  saveData(STORAGE_KEYS.SEARCH_HISTORY, filtered.slice(0, 8));
}

function removeSearchHistoryItem(query) {
  const history = getData(STORAGE_KEYS.SEARCH_HISTORY, []);
  const filtered = history.filter(item => item !== query);
  saveData(STORAGE_KEYS.SEARCH_HISTORY, filtered);
}

function clearSearchHistory() {
  saveData(STORAGE_KEYS.SEARCH_HISTORY, []);
}

function findSmartMatches(queryStr, category = '') {
  const donations = getData(STORAGE_KEYS.DONATIONS, []);
  const tokens = queryStr.toLowerCase().split(/\s+/).filter(t => t.length > 2);

  return donations.filter(d => {
    if (d.status !== 'Pending') return false;

    // Check category match
    if (category && d.category.toLowerCase() === category.toLowerCase()) return true;

    // Check tokens in item name or description
    const itemName = d.itemName.toLowerCase();
    const hasToken = tokens.some(t => itemName.includes(t));
    if (hasToken) return true;

    return false;
  }).slice(0, 4);
}

// =============================================================================
// 11. CHAT ENGINE & SIMULATED REALISTIC REPLIES
// =============================================================================
function getOrCreateConversation(user1Id, user2Id) {
  const chats = getData(STORAGE_KEYS.CHATS, []);
  let conv = chats.find(c => (c.user1Id === user1Id && c.user2Id === user2Id) || (c.user1Id === user2Id && c.user2Id === user1Id));
  
  if (!conv) {
    conv = {
      id: generateId('CONV'),
      user1Id,
      user2Id,
      messages: [],
      lastUpdated: new Date().toISOString()
    };
    chats.unshift(conv);
    saveData(STORAGE_KEYS.CHATS, chats);
  }
  return conv;
}

function sendChatMessage(senderId, recipientId, text) {
  if (!text || !text.trim()) return null;

  const chats = getData(STORAGE_KEYS.CHATS, []);
  let conv = chats.find(c => (c.user1Id === senderId && c.user2Id === recipientId) || (c.user1Id === recipientId && c.user2Id === senderId));
  
  if (!conv) {
    conv = {
      id: generateId('CONV'),
      user1Id: senderId,
      user2Id: recipientId,
      messages: [],
      lastUpdated: new Date().toISOString()
    };
    chats.unshift(conv);
  }

  const senderUser = getData(STORAGE_KEYS.USERS, []).find(u => u.id === senderId) || getCurrentUser();
  const newMsg = {
    id: generateId('MSG'),
    senderId,
    senderName: senderUser ? senderUser.name : 'User',
    text: text.trim(),
    timestamp: new Date().toISOString(),
    status: 'delivered'
  };

  conv.messages.push(newMsg);
  conv.lastUpdated = new Date().toISOString();
  saveData(STORAGE_KEYS.CHATS, chats);
  syncFirebase('chats', 'save', conv);

  // Play audio chime
  playNotificationSound();

  // Create notification for recipient
  addNotification(
    recipientId,
    `New message from ${senderUser ? senderUser.name : 'Someone'}`,
    text.length > 50 ? text.substring(0, 47) + '...' : text,
    'chat.html',
    'info'
  );

  // Simulation: Trigger automatic polite reply after 1.5 seconds if sending as donor or donee
  setTimeout(() => {
    simulateAutoReply(recipientId, senderId, text);
  }, 1600);

  return newMsg;
}

function simulateAutoReply(botSenderId, humanRecipientId, userMessageText) {
  const users = getData(STORAGE_KEYS.USERS, []);
  const botUser = users.find(u => u.id === botSenderId);
  if (!botUser) return;

  const chats = getData(STORAGE_KEYS.CHATS, []);
  const conv = chats.find(c => (c.user1Id === botSenderId && c.user2Id === humanRecipientId) || (c.user1Id === humanRecipientId && c.user2Id === botSenderId));
  if (!conv) return;

  const responses = [
    `Hello! Thank you for your message. Everything is in order and I'm happy to coordinate this donation with you.`,
    `Hi there! Got your details. When would be a convenient time for the pickup or handover?`,
    `Great! Thank you so much for reaching out. Please let me know your preferred address or location point.`,
    `Thank you! I will prepare everything accordingly. Looking forward to completing this smoothly.`
  ];

  const replyText = responses[Math.floor(Math.random() * responses.length)];

  const replyMsg = {
    id: generateId('MSG'),
    senderId: botSenderId,
    senderName: botUser.name,
    text: replyText,
    timestamp: new Date().toISOString(),
    status: 'delivered'
  };

  conv.messages.push(replyMsg);
  conv.lastUpdated = new Date().toISOString();
  saveData(STORAGE_KEYS.CHATS, chats);
  syncFirebase('chats', 'save', conv);

  // Trigger UI update if on chat page
  if (typeof renderChatMessages === 'function') {
    renderChatMessages();
    renderConversationList();
  }

  playNotificationSound();
  addNotification(
    humanRecipientId,
    `Reply from ${botUser.name}`,
    replyText,
    'chat.html',
    'info'
  );
}

function deleteChatMessage(convId, messageId) {
  const chats = getData(STORAGE_KEYS.CHATS, []);
  const conv = chats.find(c => c.id === convId);
  if (conv) {
    conv.messages = conv.messages.filter(m => m.id !== messageId);
    saveData(STORAGE_KEYS.CHATS, chats);
    return true;
  }
  return false;
}

function clearChatConversation(convId) {
  const chats = getData(STORAGE_KEYS.CHATS, []);
  const conv = chats.find(c => c.id === convId);
  if (conv) {
    conv.messages = [];
    saveData(STORAGE_KEYS.CHATS, chats);
    return true;
  }
  return false;
}

// =============================================================================
// 12. RUN INITIAL CHECKS & REAL-TIME FIRESTORE EVENT LISTENERS
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
});

// Real-time Firestore sync listeners
window.addEventListener('dms:donations-updated', () => {
  if (typeof renderDonationsTable === 'function') renderDonationsTable();
  if (typeof renderCatalog === 'function') renderCatalog();
  if (typeof performSearch === 'function') performSearch();
  if (typeof loadAdminDonations === 'function') loadAdminDonations();
  if (typeof loadAdminStatistics === 'function') loadAdminStatistics();
});

window.addEventListener('dms:requests-updated', () => {
  if (typeof renderIncomingRequests === 'function') renderIncomingRequests();
  if (typeof renderAvailableRequests === 'function') renderAvailableRequests();
  if (typeof renderDoneeRequests === 'function') renderDoneeRequests();
  if (typeof loadAdminRequests === 'function') loadAdminRequests();
  if (typeof loadAdminStatistics === 'function') loadAdminStatistics();
});

window.addEventListener('dms:chats-updated', () => {
  if (typeof renderChatMessages === 'function') renderChatMessages();
  if (typeof renderConversationList === 'function') renderConversationList();
});

window.addEventListener('dms:notifications-updated', () => {
  if (typeof updateNotificationBadge === 'function') updateNotificationBadge();
  if (typeof renderNotifications === 'function') renderNotifications();
});
