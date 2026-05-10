// ══════════════════════════════════════════════
//  OS-NOTIFICATIONS.JS
//  + toast popup on every new notification
// ══════════════════════════════════════════════

var _toastTimer = null;

function pushNotif(icon, app, title, body) {
  if (dndMode) return;
  var n = {
    id: Date.now(), icon, app, title, body,
    time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
  };
  notifications.unshift(n);
  if (notifications.length > 50) notifications.pop();
  localStorage.setItem('serverplex_notifs', JSON.stringify(notifications));
  renderNotifList();

  // Badge count
  var badge = document.getElementById('notifIcon');
  if (badge) badge.textContent = '🔔' + (notifications.length > 0 ? ' ' + notifications.length : '');

  // Toast popup
  showToast(icon || '💬', title || app || '', body || '');
}

function showToast(icon, title, msg) {
  var toast = document.getElementById('notifToast');
  if (!toast) return;
  document.getElementById('toastIcon').textContent  = icon;
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastMsg').textContent   = msg;
  toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function(){ dismissToast(); }, 4000);
}

function dismissToast() {
  var toast = document.getElementById('notifToast');
  if (toast) toast.classList.remove('show');
  clearTimeout(_toastTimer);
}

function renderNotifList() {
  var c = document.getElementById('notifList');
  if (!c) return;
  if (!notifications.length) {
    c.innerHTML = '<div class="notif-empty">No notifications</div>';
    return;
  }
  c.innerHTML = notifications.map(function(n) {
    return '<div class="notif-item" id="notif-' + n.id + '">' +
      '<div class="notif-item-header">' +
        '<span class="notif-item-icon">' + (n.icon||'💬') + '</span>' +
        '<span class="notif-item-app">'  + (n.app||'')   + '</span>' +
        '<span class="notif-item-time">' + (n.time||'')  + '</span>' +
        '<button class="notif-dismiss" onclick="dismissNotif(' + n.id + ')">✕</button>' +
      '</div>' +
      '<div class="notif-item-title">' + (n.title||'') + '</div>' +
      (n.body ? '<div class="notif-item-body">' + n.body + '</div>' : '') +
    '</div>';
  }).join('');
}

function dismissNotif(id) {
  notifications = notifications.filter(function(n){ return n.id !== id; });
  localStorage.setItem('serverplex_notifs', JSON.stringify(notifications));
  renderNotifList();
}

function clearNotifs() {
  notifications = [];
  localStorage.setItem('serverplex_notifs', '[]');
  renderNotifList();
  var badge = document.getElementById('notifIcon');
  if (badge) badge.textContent = '🔔';
}

function toggleNotifPanel() {
  document.getElementById('notifPanel').classList.toggle('open');
}