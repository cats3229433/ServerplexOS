// ══════════════════════════════════════════════
//  OS-FEATURES.JS
//  + applyCustomThemeVars() for custom theme builder
//  + changeTheme() handles 'custom' ID
//  + scheduled theme skips custom
// ══════════════════════════════════════════════

// ── Spotlight ────────────────────────────────
var spotlightIdx = -1;
function toggleSpotlight() {
  var ov = document.getElementById('spotlightOverlay');
  if (ov.classList.contains('open')) { closeSpotlight(); return; }
  ov.classList.add('open');
  document.getElementById('spotlightInput').value = '';
  spotlightSearch();
  setTimeout(function(){ document.getElementById('spotlightInput').focus(); }, 50);
}
function closeSpotlight() {
  document.getElementById('spotlightOverlay').classList.remove('open');
}
function spotlightSearch() {
  var q = document.getElementById('spotlightInput').value.toLowerCase();
  var res = document.getElementById('spotlightResults');
  var matches = Object.keys(apps).filter(function(id){
    return !q || apps[id].name.toLowerCase().includes(q) || apps[id].category.toLowerCase().includes(q);
  });
  if (!matches.length) { res.innerHTML = '<div class="spotlight-empty">No results for "' + q + '"</div>'; return; }
  spotlightIdx = -1;
  res.innerHTML = matches.map(function(id) {
    return '<div class="spotlight-result" data-id="' + id + '" onclick="openApp(\'' + id + '\');closeSpotlight()">' +
      '<div class="spotlight-result-icon">' + getIconHtml(apps[id], 24) + '</div>' +
      '<div><div class="spotlight-result-name">' + apps[id].name + '</div>' +
      '<div class="spotlight-result-cat">' + apps[id].category + '</div></div>' +
    '</div>';
  }).join('');
}
function spotlightKey(e) {
  var items = document.querySelectorAll('.spotlight-result');
  if (e.key === 'ArrowDown') { spotlightIdx = Math.min(spotlightIdx+1, items.length-1); highlightSpotlight(items); }
  else if (e.key === 'ArrowUp') { spotlightIdx = Math.max(spotlightIdx-1, 0); highlightSpotlight(items); }
  else if (e.key === 'Enter') {
    var sel = document.querySelector('.spotlight-result.highlighted');
    if (sel) { openApp(sel.dataset.id); closeSpotlight(); }
  } else if (e.key === 'Escape') closeSpotlight();
}
function highlightSpotlight(items) {
  items.forEach(function(el, i){ el.classList.toggle('highlighted', i === spotlightIdx); });
  if (items[spotlightIdx]) items[spotlightIdx].scrollIntoView({ block: 'nearest' });
}

// ── Quick Settings ────────────────────────────
function toggleQs() { document.getElementById('qsPanel').classList.toggle('open'); }
function toggleDnd() {
  dndMode = !dndMode;
  localStorage.setItem('serverplex_dnd', dndMode);
  document.getElementById('dndDot').classList.toggle('on', dndMode);
  document.getElementById('qsDnd').classList.toggle('on', dndMode);
}
function toggleNightMode() {
  var btn = document.getElementById('qsNight');
  var on = btn.classList.toggle('on');
  document.body.style.filter = on ? 'sepia(20%) brightness(85%)' : '';
  localStorage.setItem('serverplex_nightmode', on);
}
function onBrightness(v) {
  var pct = Math.max(20, v);
  document.body.style.filter = (localStorage.getItem('serverplex_nightmode')==='true' ? 'sepia(20%) ' : '') + 'brightness(' + pct + '%)';
  document.getElementById('qsBrightVal').textContent = pct + '%';
}
function updateQsTheme() {
  ['white','black','grey','aurora','tokyo','forest','space','sunset','arctic','synth',
   'desert','ocean','jungle','blizzard','matrix','cyberpunk','retro','coffee','autumn','candle'].forEach(function(t) {
    var el = document.getElementById('qt-' + t);
    if (el) el.classList.toggle('active', t === currentTheme);
  });
}

// ── Volume ────────────────────────────────────
function onVolumeChange(v) {
  volLevel = parseInt(v); isMuted = false;
  var icon = volLevel === 0 ? '🔇' : volLevel < 40 ? '🔉' : '🔊';
  ['volEmoji','volumeIcon'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.textContent = icon;
  });
  document.getElementById('volValue').textContent = v + '%';
  var qvv = document.getElementById('qsVolVal');   if(qvv) qvv.textContent = v + '%';
  var qvi = document.getElementById('qsVolIcon');  if(qvi) qvi.textContent = icon;
}
function toggleMute() {
  isMuted = !isMuted;
  var icon = isMuted ? '🔇' : volLevel < 40 ? '🔉' : '🔊';
  ['volEmoji','volumeIcon'].forEach(function(id){
    var el = document.getElementById(id); if(el) el.textContent = icon;
  });
}

// ── Tray Popups ───────────────────────────────
function toggleTray(name) {
  document.querySelectorAll('.tray-popup').forEach(function(p){
    if (p.id !== name + 'Popup') p.classList.remove('active');
  });
  var p = document.getElementById(name + 'Popup'); if (!p) return;
  p.classList.toggle('active');
  if (name === 'network') updateNetworkStatus();
}
function updateNetworkStatus() {
  var dot = document.getElementById('netDot');
  var lbl = document.getElementById('netLabel');
  var sub = document.getElementById('netSub');
  if (!dot) return;
  var online = navigator.onLine;
  dot.className = 'net-dot ' + (online ? 'online' : 'offline');
  lbl.textContent = online ? 'Connected' : 'No Connection';
  sub.textContent = online ? 'Internet available' : 'Check your network';
  var ni = document.getElementById('networkIcon');
  if (ni) ni.textContent = online ? '📶' : '❌';
}
window.addEventListener('online',  updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

// ── Calendar ──────────────────────────────────
function toggleCal() {
  var c = document.getElementById('calPopup');
  c.classList.toggle('open');
  if (c.classList.contains('open')) renderCal();
}
function calNav(dir) { calDate.setMonth(calDate.getMonth() + dir); renderCal(); }
function renderCal() {
  var now = new Date(), y = calDate.getFullYear(), m = calDate.getMonth();
  document.getElementById('calMonth').textContent = calDate.toLocaleString('default', {month:'long', year:'numeric'});
  var g = document.getElementById('calGrid');
  var days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  g.innerHTML = days.map(function(d){ return '<div class="cal-dow">'+d+'</div>'; }).join('');
  var first = new Date(y, m, 1).getDay(), last = new Date(y, m+1, 0).getDate();
  for (var i = 0; i < first; i++) g.innerHTML += '<div class="cal-day other-month"></div>';
  for (var d = 1; d <= last; d++) {
    var isToday = d === now.getDate() && m === now.getMonth() && y === now.getFullYear();
    g.innerHTML += '<div class="cal-day' + (isToday ? ' today' : '') + '">' + d + '</div>';
  }
}

// ── Clock ─────────────────────────────────────
function updateClock() {
  var now = new Date();
  var fmt = localStorage.getItem('serverplex_clock_format') || '12';
  var h = now.getHours(), m = now.getMinutes().toString().padStart(2,'0');
  var timeStr = fmt === '24'
    ? h.toString().padStart(2,'0') + ':' + m
    : ((h%12||12) + ':' + m + ' ' + (h>=12?'PM':'AM'));
  document.getElementById('clockTime').textContent = timeStr;
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('clockDate').textContent = months[now.getMonth()] + ' ' + now.getDate();
}

// ── Theme ─────────────────────────────────────
var THEME_ACCENTS = {
  white:'#0078d4', black:'#0078d4', grey:'#4a9eff',
  aurora:'#00d4aa', tokyo:'#ff2d55', forest:'#34c759',
  space:'#7c83fd', sunset:'#ff6b35', arctic:'#0096d6', synth:'#e040fb',
  desert:'#e8913a', ocean:'#00b4d8', jungle:'#2dc653', blizzard:'#90c8f0',
  matrix:'#00ff41', cyberpunk:'#f637ec', retro:'#33ff33',
  coffee:'#c9813a', autumn:'#e2693a', candle:'#f5a623',
  custom: null
};

function changeTheme(theme) {
  if (theme === 'custom') {
    var saved = JSON.parse(localStorage.getItem('serverplex_custom_theme') || 'null');
    if (saved) { applyCustomThemeVars(saved); return; }
    theme = 'black'; // fallback
  }
  currentTheme = theme;
  // Remove all theme- classes, keep others (tb-*, etc.)
  var keep = document.body.className.split(' ').filter(function(c){ return !/^theme-/.test(c); });
  document.body.className = keep.join(' ').trim();
  document.body.classList.add('theme-' + theme);
  var acc = localStorage.getItem('serverplex_accent_override') || THEME_ACCENTS[theme] || '#0078d4';
  document.documentElement.style.setProperty('--accent', acc);
  localStorage.setItem('serverplex_theme', theme);
  localStorage.setItem('serverplex_accent', acc);
  updateQsTheme();
  if (typeof applyThemeCursor === 'function') applyThemeCursor(theme);
  if (typeof applyCursorTrail === 'function' && typeof _cursorTrail !== 'undefined') {
    applyCursorTrail(_cursorTrail);
  }
  // Broadcast to all open app iframes
  document.querySelectorAll('.window-content iframe').forEach(function(iframe) {
    try { iframe.contentWindow.postMessage({ type:'theme-change', theme:theme }, '*'); } catch(e) {}
  });
  // Per-theme wallpaper
  var themeWp = localStorage.getItem('serverplex_wallpaper_' + theme);
  if (themeWp) {
    setWallpaper(themeWp.startsWith('data:') || themeWp.startsWith('http')
      ? "url('" + themeWp + "') center/cover no-repeat"
      : themeWp);
  } else {
    // Revert to global wallpaper or none
    var globalWp = localStorage.getItem('serverplex_wallpaper');
    setWallpaper(globalWp || 'none');
  }
}

function applyCustomThemeVars(v) {
  // Inject/replace <style id="customThemeStyle">
  var existing = document.getElementById('customThemeStyle');
  if (existing) existing.remove();
  var style = document.createElement('style');
  style.id = 'customThemeStyle';
  style.textContent =
    'body.theme-custom{' +
      '--bg:'     + v.bg     + ';' +
      '--bg2:'    + v.bg2    + ';' +
      '--bg3:'    + v.bg2    + ';' +
      '--text:'   + v.text   + ';' +
      '--text2:'  + v.text2  + ';' +
      '--border:' + v.border + ';' +
      '--win-bg:' + v.bg2    + ';' +
      '--tb-bg:'  + v.bg2    + 'cc;' +
      '--glass:'  + v.bg2    + 'aa;' +
      '--accent:' + v.accent + ';' +
      '--icon-glow:' + v.accent + '33;' +
    '}';
  document.head.appendChild(style);
  var keep = document.body.className.split(' ').filter(function(c){ return !/^theme-/.test(c); });
  document.body.className = keep.join(' ').trim();
  document.body.classList.add('theme-custom');
  document.documentElement.style.setProperty('--accent', v.accent);
  localStorage.setItem('serverplex_theme', 'custom');
  localStorage.setItem('serverplex_accent', v.accent);
  currentTheme = 'custom';
  updateQsTheme();
  // Broadcast to open iframes
  document.querySelectorAll('.window-content iframe').forEach(function(iframe) {
    try { iframe.contentWindow.postMessage({ type:'theme-change', theme:'custom' }, '*'); } catch(e) {}
    try { iframe.contentWindow.postMessage({ type:'accent-change', accent:v.accent }, '*'); } catch(e) {}
  });
}

function setTaskbarMode(mode) {
  ['tb-solid','tb-blur','tb-glass','tb-hidden'].forEach(function(c){ document.body.classList.remove(c); });
  document.body.classList.add('tb-' + mode);
  localStorage.setItem('serverplex_tb_mode', mode);
}

function checkScheduledTheme() {
  if (localStorage.getItem('serverplex_scheduled_themes') !== 'true') return;
  if (currentTheme === 'custom') return; // never override custom with schedule
  var h = new Date().getHours(), scheduled;
  if      (h >= 6  && h < 9)  scheduled = localStorage.getItem('serverplex_theme_morning')  || 'arctic';
  else if (h >= 9  && h < 17) scheduled = localStorage.getItem('serverplex_theme_day')      || 'white';
  else if (h >= 17 && h < 20) scheduled = localStorage.getItem('serverplex_theme_evening')  || 'sunset';
  else                         scheduled = localStorage.getItem('serverplex_theme_night')    || 'aurora';
  if (scheduled && scheduled !== currentTheme) changeTheme(scheduled);
}
setInterval(checkScheduledTheme, 60000);

function setWallpaper(value) {
  var d = document.getElementById('desktop');
  if (value === 'none') {
    d.style.background = 'var(--bg)';
    localStorage.removeItem('serverplex_wallpaper');
  } else if (value.startsWith('http') || value.startsWith('data:')) {
    d.style.background = "url('" + value + "') center/cover no-repeat";
    localStorage.setItem('serverplex_wallpaper', value);
  } else {
    d.style.background = value;
    localStorage.setItem('serverplex_wallpaper', value);
  }
}

function resetDesktopLayout() {
  if (confirm('Reset all desktop icons to default positions?')) {
    desktopLayout = {};
    localStorage.removeItem('serverplex_desktop_layout');
    renderDesktopIcons();
  }
}

// ── Shutdown / Restart / Log Out ──────────────
function showShutdown(type) {
  closeStartMenu();
  document.getElementById('shutdownText').textContent = type === 'restart' ? 'Restarting…' : 'Shutting down…';
  document.getElementById('shutdownOverlay').classList.add('open');
  setTimeout(function() {
    if (type === 'restart') { sessionStorage.setItem('serverplex_authed','true'); location.reload(); }
    else { sessionStorage.removeItem('serverplex_authed'); window.location.replace('account.html'); }
  }, 2400);
}
function logOut() {
  closeStartMenu();
  document.getElementById('shutdownText').textContent = 'Signing out…';
  document.getElementById('shutdownOverlay').classList.add('open');
  setTimeout(function() {
    sessionStorage.removeItem('serverplex_authed');
    window.location.replace('account.html');
  }, 1600);
}
// ══════════════════════════════════════════════
//  OS STATE BACKUP / RESTORE
// ══════════════════════════════════════════════

function backupOS() {
  var data = { _version: 1, _exported: new Date().toISOString(), keys: {} };
  for (var i = 0; i < localStorage.length; i++) {
    var k = localStorage.key(i);
    if (k && k.startsWith('serverplex_')) {
      data.keys[k] = localStorage.getItem(k);
    }
  }
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'serverplexOS-backup-' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
  pushNotif('💾', 'System', 'Backup saved', 'All OS settings exported successfully.');
}

function restoreOS() {
  var inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.json';
  inp.onchange = function(e) {
    var file = e.target.files[0]; if (!file) return;
    var fr = new FileReader();
    fr.onload = function(ev) {
      try {
        var data = JSON.parse(ev.target.result);
        if (!data.keys || !data._version) { alert('Invalid backup file.'); return; }
        var count = 0;
        Object.keys(data.keys).forEach(function(k) {
          if (k.startsWith('serverplex_')) { localStorage.setItem(k, data.keys[k]); count++; }
        });
        if (confirm('Restored ' + count + ' settings from backup dated ' + (data._exported || 'unknown') + '.\n\nRestart now to apply everything?')) {
          sessionStorage.setItem('serverplex_authed', 'true');
          location.reload();
        }
      } catch(err) { alert('Could not read backup file: ' + err.message); }
    };
    fr.readAsText(file);
  };
  inp.click();
}

// ══════════════════════════════════════════════
//  APP INSTALLER
// ══════════════════════════════════════════════

function loadCustomApps() {
  try {
    var custom = JSON.parse(localStorage.getItem('serverplex_custom_apps') || '[]');
    custom.forEach(function(a) {
      if (a.id && a.name && a.file) {
        apps[a.id] = { name: a.name, icon: a.icon || '🧩', file: a.file, category: a.category || 'Custom', width: a.width || 820, height: a.height || 620, _custom: true };
      }
    });
  } catch(e) {}
}

function saveCustomApps() {
  var custom = Object.keys(apps).filter(function(id) { return apps[id]._custom; }).map(function(id) {
    return Object.assign({ id: id }, apps[id]);
  });
  localStorage.setItem('serverplex_custom_apps', JSON.stringify(custom));
}

function openAppInstaller() {
  var ov = document.getElementById('appInstallerOverlay');
  if (!ov) return;
  // Refresh installed list
  var list = document.getElementById('aiInstalledList');
  if (list) {
    var custom = Object.keys(apps).filter(function(id){ return apps[id]._custom; });
    if (!custom.length) {
      list.innerHTML = '<div style="font-size:12px;color:var(--text2);padding:8px 0">No custom apps installed yet.</div>';
    } else {
      list.innerHTML = custom.map(function(id){
        return '<div class="ai-installed-item">' +
          '<span class="ai-installed-icon">' + apps[id].icon + '</span>' +
          '<span class="ai-installed-name">' + apps[id].name + '</span>' +
          '<button class="ai-uninstall" onclick="uninstallApp(\'' + id + '\')">Uninstall</button>' +
        '</div>';
      }).join('');
    }
  }
  ov.classList.add('open');
}

function closeAppInstaller() {
  var ov = document.getElementById('appInstallerOverlay');
  if (ov) ov.classList.remove('open');
}

function installApp() {
  var nameEl = document.getElementById('aiName');
  var urlEl  = document.getElementById('aiUrl');
  var iconEl = document.getElementById('aiIcon');
  var catEl  = document.getElementById('aiCat');
  var errEl  = document.getElementById('aiErr');

  var name = nameEl.value.trim();
  var url  = urlEl.value.trim();
  var icon = iconEl.value.trim() || '🧩';
  var cat  = catEl.value.trim() || 'Custom';

  if (!name) { errEl.textContent = 'Name is required.'; return; }
  if (!url)  { errEl.textContent = 'URL is required.'; return; }
  if (!/^https?:\/\/|^\/|^\.\//i.test(url)) { url = './' + url; }

  // Generate a safe ID from the name
  var id = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now().toString(36);

  apps[id] = { name: name, icon: icon, file: url, category: cat, _custom: true };
  saveCustomApps();
  renderDesktopIcons();
  renderStartMenuApps();
  renderPinnedApps();

  nameEl.value = ''; urlEl.value = ''; iconEl.value = ''; catEl.value = '';
  errEl.textContent = '';
  closeAppInstaller();
  pushNotif(icon, name, name + ' installed', 'Find it on the desktop and Start Menu.');
}

function uninstallApp(id) {
  if (!apps[id] || !apps[id]._custom) return;
  if (!confirm('Uninstall "' + apps[id].name + '"?')) return;
  if (windows[id]) closeWindow(id);
  delete apps[id];
  saveCustomApps();
  renderDesktopIcons();
  renderStartMenuApps();
  renderPinnedApps();
}

// ── Settings broadcast receiver ─────────────────
window.addEventListener('message', function(e) {
  if (!e.data) return;
  var d = e.data;
  if (d.type === 'theme-change'  && d.theme)  changeTheme(d.theme);
  if (d.type === 'accent-change' && d.accent) {
    localStorage.setItem('serverplex_accent', d.accent);
    localStorage.setItem('serverplex_accent_override', d.accent);
    document.documentElement.style.setProperty('--accent', d.accent);
    // Propagate to all open app iframes
    document.querySelectorAll('.window-content iframe').forEach(function(iframe) {
      try { iframe.contentWindow.postMessage({ type:'accent-change', accent:d.accent }, '*'); } catch(err){}
    });
  }
  if (d.type === 'font-scale' && d.size) {
    document.body.style.fontSize = d.size + 'px';
    localStorage.setItem('serverplex_os_font_size', d.size);
  }
  if (d.type === 'tb-mode' && d.mode) {
    setTaskbarMode(d.mode);
  }
  if (d.type === 'cursor-change' && d.cursor) {
    localStorage.setItem('serverplex_cursor', d.cursor);
    if (typeof applyThemeCursor === 'function') applyThemeCursor(currentTheme, d.cursor);
  }
  if (d.type === 'clock-format' && d.format) {
    localStorage.setItem('serverplex_clock_format', d.format);
  }
});