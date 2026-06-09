// ══════════════════════════════════════════════
//  OS-STARTMENU.JS
//  + Recent apps row (last 5 opened, persisted)
// ══════════════════════════════════════════════

const MAX_RECENTS = 5;

function getRecents() {
  try { return JSON.parse(localStorage.getItem('serverplex_recents') || '[]'); } catch(e) { return []; }
}
function addRecent(id) {
  var list = getRecents().filter(function(x){ return x !== id; });
  list.unshift(id);
  if (list.length > MAX_RECENTS) list = list.slice(0, MAX_RECENTS);
  localStorage.setItem('serverplex_recents', JSON.stringify(list));
  renderRecentApps();
}

function renderRecentApps() {
  var list = getRecents().filter(function(id){ return !!apps[id]; });
  var section = document.getElementById('smRecents');
  var row     = document.getElementById('smRecentsRow');
  if (!section || !row) return;
  if (!list.length) { section.style.display = 'none'; return; }
  section.style.display = '';
  row.innerHTML = list.map(function(id) {
    var a = apps[id];
    return '<div class="sm-recent-item" onclick="openApp(\'' + id + '\');closeStartMenu()" title="' + a.name + '">' +
      '<span class="sm-recent-icon">' + getIconHtml(a, 22) + '</span>' +
      '<span class="sm-recent-label">' + a.name + '</span>' +
    '</div>';
  }).join('');
}

// ── Start Menu search/filter ──────────────────
function filterStartMenu(q) {
  var g = document.getElementById('smGrid');
  if (!g) return;
  var recents = document.getElementById('smRecents');
  q = (q || '').toLowerCase().trim();
  if (!q) {
    // Show everything normally
    Array.from(g.children).forEach(function(item) { item.style.display = ''; });
    if (recents) recents.style.display = '';
    var noRes = document.getElementById('smNoResults');
    if (noRes) noRes.remove();
    return;
  }
  // Hide recents while searching
  if (recents) recents.style.display = 'none';
  var anyMatch = false;
  Array.from(g.children).forEach(function(item) {
    var label = item.querySelector('.sm-label');
    var name = label ? label.textContent.toLowerCase() : '';
    var appId = item.dataset.appId || '';
    var app = apps[appId];
    var cat = app && app.category ? app.category.toLowerCase() : '';
    var match = name.includes(q) || cat.includes(q) || appId.includes(q);
    item.style.display = match ? '' : 'none';
    if (match) anyMatch = true;
  });
  // No results message
  var existing = document.getElementById('smNoResults');
  if (!anyMatch) {
    if (!existing) {
      var msg = document.createElement('div');
      msg.id = 'smNoResults';
      msg.className = 'sm-no-results';
      msg.textContent = 'No apps found for "' + q + '"';
      g.appendChild(msg);
    }
  } else {
    if (existing) existing.remove();
  }
}


function renderStartMenuApps() {
  var g = document.getElementById('smGrid');
  if (!g) return;
  g.innerHTML = '';
  Object.keys(apps).forEach(function(id, i) {
    var a = apps[id], item = document.createElement('div');
    item.className = 'sm-item';
    item.dataset.appId = id;
    item.style.animation = 'slideUp .35s ease forwards';
    item.style.animationDelay = (i * .025) + 's';
    item.style.opacity = '0';
    item.innerHTML = '<div class="sm-icon">' + getIconHtml(a, 28) + '</div>' +
                     '<div class="sm-label">' + a.name + '</div>';
    item.addEventListener('click', function() { openApp(id); closeStartMenu(); });
    g.appendChild(item);
  });
  renderRecentApps();
}

function toggleStartMenu() {
  document.getElementById('startMenu').classList.toggle('active');
  // Clear search when opening
  var s = document.getElementById('smSearch');
  if (s) { s.value = ''; filterStartMenu(''); }
  if (document.getElementById('startMenu').classList.contains('active')) {
    setTimeout(function() { if (s) s.focus(); }, 80);
  }
}
function closeStartMenu() {
  document.getElementById('startMenu').classList.remove('active');
  var s = document.getElementById('smSearch');
  if (s) { s.value = ''; filterStartMenu(''); }
}

// ── Pinned Apps ──────────────────────────────
function renderPinnedApps() {
  var c = document.getElementById('pinnedApps');
  if (!c) return;
  c.innerHTML = '';
  pinnedAppIds.forEach(function(id) {
    var a = apps[id]; if (!a) return;
    var btn = document.createElement('div');
    btn.className = 'pinned-app';
    btn.title = a.name;
    btn.dataset.appId = id;
    btn.innerHTML = getIconHtml(a, 20) || a.icon;
    btn.addEventListener('click', function() { openApp(id); });
    btn.addEventListener('contextmenu', function(e) { e.preventDefault(); showTbCtx(e, id, true); });
    if (windows[id]) btn.classList.add('running');
    c.appendChild(btn);
  });
  localStorage.setItem('serverplex_pinned', JSON.stringify(pinnedAppIds));
}

function pinToggle(id) {
  if (pinnedAppIds.includes(id)) pinnedAppIds = pinnedAppIds.filter(function(x){ return x !== id; });
  else pinnedAppIds.push(id);
  renderPinnedApps();
}

// ── Virtual Desktops ─────────────────────────
function renderVdSwitcher() {
  var c = document.getElementById('vdSwitcher');
  if (!c) return;
  c.innerHTML = '';
  for (var i = 0; i < 4; i++) {
    var btn = document.createElement('div');
    btn.className = 'vd-btn' + (i === currentVd ? ' active' : '');
    btn.textContent = i + 1;
    btn.dataset.vd = i;
    btn.title = 'Desktop ' + (i + 1);
    btn.addEventListener('click', (function(idx){ return function(){ switchVd(idx); }; })(i));
    btn.addEventListener('contextmenu', function(e){ e.preventDefault(); showVdPreview(); });
    c.appendChild(btn);
  }
}

function switchVd(idx) {
  if (idx === currentVd) return;
  Object.values(windows).forEach(function(w) {
    w.element.style.display = (w.vd === idx && !w.minimized) ? '' : 'none';
  });
  currentVd = idx;
  renderVdSwitcher();
  updateTaskbar();
}

function showVdPreview() {
  var ov = document.getElementById('vdPreview');
  ov.innerHTML = '';
  for (var i = 0; i < 4; i++) {
    var thumb = document.createElement('div');
    thumb.className = 'vd-thumb' + (i === currentVd ? ' active' : '');
    var count = Object.values(windows).filter(function(w){ return w.vd === i; }).length;
    thumb.innerHTML = '<div class="vd-thumb-label">Desktop ' + (i+1) + '</div>' +
                      '<div class="vd-thumb-count">' + count + ' window' + (count !== 1 ? 's' : '') + '</div>';
    thumb.addEventListener('click', (function(idx){ return function(){ switchVd(idx); closeVdPreview(); }; })(i));
    ov.appendChild(thumb);
  }
  ov.classList.add('open');
}

function closeVdPreview() { document.getElementById('vdPreview').classList.remove('open'); }

// ── Taskbar ──────────────────────────────────
function showTbCtx(e, appId, isPinned) {
  var menu = document.getElementById('tbCtx');
  menu.innerHTML =
    '<div class="ctx-item" onclick="openApp(\'' + appId + '\');document.getElementById(\'tbCtx\').classList.remove(\'open\')">▶ Open</div>' +
    '<div class="ctx-item" onclick="pinToggle(\'' + appId + '\');document.getElementById(\'tbCtx\').classList.remove(\'open\')">📌 ' + (pinnedAppIds.includes(appId) ? 'Unpin' : 'Pin to Taskbar') + '</div>' +
    (windows[appId] ?
      '<div class="ctx-sep"></div>' +
      '<div class="ctx-item" onclick="minimizeWindow(\'' + appId + '\');document.getElementById(\'tbCtx\').classList.remove(\'open\')">− Minimize</div>' +
      '<div class="ctx-item" onclick="toggleMaximize(\'' + appId + '\');document.getElementById(\'tbCtx\').classList.remove(\'open\')">□ Maximize</div>' +
      '<div class="ctx-item" onclick="closeWindow(\'' + appId + '\');document.getElementById(\'tbCtx\').classList.remove(\'open\')">✕ Close</div>'
    : '');
  var x = Math.min(e.clientX, window.innerWidth - 190);
  menu.style.left = x + 'px';
  menu.style.top  = (e.clientY - 120) + 'px';
  menu.classList.add('open');
}

function updateTaskbar() {
  var c = document.getElementById('taskbarApps');
  if (!c) return;
  c.innerHTML = '';
  Object.keys(windows).filter(function(id){ return windows[id].vd === currentVd; }).forEach(function(id) {
    var a = apps[id], w = windows[id];
    var btn = document.createElement('button');
    btn.className = 'taskbar-app';
    if (parseInt(w.element.style.zIndex) === zIdx) btn.classList.add('active');
    btn.innerHTML =
      '<span>' + getIconHtml(a, 16) + '</span>' +
      '<span class="taskbar-app-text">' + a.name + '</span>' +
      '<span class="tb-cls" onclick="event.stopPropagation();closeWindow(\'' + id + '\')">✕</span>';
    btn.addEventListener('click', function() {
      if (w.minimized) {
        w.element.style.display = '';
        w.element.classList.add('restoring');
        w.minimized = false;
        constrainWindow(w.element);
        setTimeout(function(){ w.element.classList.remove('restoring'); }, 280);
      }
      bringToFront(id);
    });
    btn.addEventListener('contextmenu', function(e){ e.preventDefault(); showTbCtx(e, id, false); });
    c.appendChild(btn);
  });
  document.querySelectorAll('.pinned-app').forEach(function(p) {
    p.classList.toggle('running', !!windows[p.dataset.appId]);
  });
}