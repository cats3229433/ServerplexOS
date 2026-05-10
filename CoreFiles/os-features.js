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
  ['white','black','grey','aurora','tokyo','forest','space','sunset','arctic','synth'].forEach(function(t) {
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