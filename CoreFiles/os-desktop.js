// ══════════════════════════════════════════════
//  OS-DESKTOP.JS
//  Grid helpers, desktop icons, rubber-band
//  multi-select, desktop context menu.
//
//  Depends on: apps, desktopLayout, selectedIcons,
//  GRID_SIZE, GRID_PAD → globals in desktop.html
//  Calls: openApp(), constrainWindow() → os-windows.js
//  Calls: pinToggle(), renderPinnedApps(), renderStartMenuApps() → os-startmenu.js
// ══════════════════════════════════════════════

// ── Grid Helpers ─────────────────────────────────
function getGridPos(x, y) {
  var col = Math.round((x - GRID_PAD) / GRID_SIZE), row = Math.round((y - GRID_PAD) / GRID_SIZE);
  return { x: GRID_PAD + col * GRID_SIZE, y: GRID_PAD + row * GRID_SIZE, col, row };
}
function gridOccupied(col, row, exclude) {
  return Object.keys(desktopLayout).some(id => {
    if (id === exclude) return false;
    var g = getGridPos(desktopLayout[id].x, desktopLayout[id].y);
    return g.col === col && g.row === row;
  });
}
function nextFreeGrid(start) {
  start = start || 0;
  var maxCols = Math.floor((window.innerWidth - GRID_PAD * 2) / GRID_SIZE);
  for (var i = start; i < 1000; i++) {
    var col = i % maxCols, row = Math.floor(i / maxCols);
    if (!gridOccupied(col, row)) return { x: GRID_PAD + col * GRID_SIZE, y: GRID_PAD + row * GRID_SIZE, col, row };
  }
  return { x: GRID_PAD, y: GRID_PAD, col: 0, row: 0 };
}

// ── Desktop Icons ────────────────────────────────
function renderDesktopIcons() {
  var container = document.getElementById('desktopIcons');
  container.innerHTML = '';
  var gridIdx = 0;
  Object.keys(apps).forEach((appId, idx) => {
    var app = apps[appId];
    var icon = document.createElement('div');
    icon.className = 'desktop-icon';
    icon.dataset.appId = appId;
    icon.style.opacity = '0';
    icon.style.animation = 'fadeIn .45s ease forwards';
    icon.style.animationDelay = (idx * .04) + 's';

    var saved = desktopLayout[appId];
    var pos;
    if (saved) {
      pos = getGridPos(saved.x, saved.y);
      if (gridOccupied(pos.col, pos.row, appId)) { pos = nextFreeGrid(gridIdx); gridIdx++; }
    } else { pos = nextFreeGrid(gridIdx); gridIdx++; }
    icon.style.left = pos.x + 'px'; icon.style.top = pos.y + 'px';
    desktopLayout[appId] = { x: pos.x, y: pos.y };

    icon.innerHTML = '<div class="icon-image">' + getIconHtml(app, 46) + '</div><div class="icon-label" id="lbl-'+appId+'">' + app.name + '</div>';
    icon.addEventListener('click', e => { e.stopPropagation(); selectIcon(icon, e.ctrlKey || e.metaKey); });
    icon.addEventListener('dblclick', () => openApp(appId));
    icon.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); showIconCtx(e, appId, icon); });
    makeIconDraggable(icon);
    container.appendChild(icon);
  });
  localStorage.setItem('serverplex_desktop_layout', JSON.stringify(desktopLayout));
}

function selectIcon(icon, multi) {
  if (!multi) deselectAllIcons();
  icon.classList.add('selected');
  selectedIcons.add(icon.dataset.appId);
}
function deselectAllIcons() {
  document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
  selectedIcons.clear();
}

function showIconCtx(e, appId, icon) {
  var menu = document.getElementById('deskCtx');
  menu.innerHTML = `
    <div class="ctx-item" onclick="openApp('${appId}');closeCtxMenu()">▶ Open</div>
    <div class="ctx-sep"></div>
    <div class="ctx-item" onclick="startRename('${appId}');closeCtxMenu()">✏️ Rename</div>
    <div class="ctx-item" onclick="pinToggle('${appId}');closeCtxMenu()">📌 ${pinnedAppIds.includes(appId)?'Unpin from':'Pin to'} Taskbar</div>`;
  var x = Math.min(e.clientX, window.innerWidth - 200), y = Math.min(e.clientY, window.innerHeight - 150);
  menu.style.left = x + 'px'; menu.style.top = y + 'px';
  menu.classList.add('open');
}

function startRename(appId) {
  var lbl = document.getElementById('lbl-' + appId);
  if (!lbl) return;
  var cur = apps[appId].name;
  lbl.innerHTML = '<input class="icon-label-edit" value="' + cur + '" id="ren-' + appId + '">';
  var inp = document.getElementById('ren-' + appId);
  inp.focus(); inp.select();
  function done() {
    var val = inp.value.trim() || cur;
    apps[appId].name = val;
    lbl.textContent = val;
    renderStartMenuApps();
    renderPinnedApps();
  }
  inp.addEventListener('blur', done);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { inp.blur(); } if (e.key === 'Escape') { inp.value = cur; inp.blur(); } });
}

function makeIconDraggable(element) {
  var isDragging = false, startX, startY, initialX, initialY;
  var gp = document.getElementById('gridPreview');
  element.addEventListener('mousedown', e => {
    if (e.detail === 2 || e.button !== 0) return;
    isDragging = true; startX = e.clientX; startY = e.clientY;
    initialX = element.offsetLeft; initialY = element.offsetTop;
    element.style.zIndex = 1000; element.classList.add('dragging');
  });
  document.addEventListener('mousemove', e => {
    if (!isDragging) return; e.preventDefault();
    var nx = initialX + (e.clientX - startX), ny = initialY + (e.clientY - startY);
    element.style.left = nx + 'px'; element.style.top = ny + 'px';
    var gPos = getGridPos(nx, ny), occ = gridOccupied(gPos.col, gPos.row, element.dataset.appId);
    gp.style.display = 'block'; gp.style.left = gPos.x + 'px'; gp.style.top = gPos.y + 'px';
    gp.className = 'grid-preview' + (occ ? ' occupied' : '');
  });
  document.addEventListener('mouseup', () => {
    if (!isDragging) return; isDragging = false;
    element.style.zIndex = ''; element.classList.remove('dragging'); gp.style.display = 'none';
    var cx = parseInt(element.style.left), cy = parseInt(element.style.top);
    var gPos = getGridPos(cx, cy), appId = element.dataset.appId;
    if (gridOccupied(gPos.col, gPos.row, appId)) {
      var s = desktopLayout[appId];
      if (s) { element.style.left = s.x + 'px'; element.style.top = s.y + 'px'; }
    } else {
      element.style.left = gPos.x + 'px'; element.style.top = gPos.y + 'px';
      desktopLayout[appId] = { x: gPos.x, y: gPos.y };
      localStorage.setItem('serverplex_desktop_layout', JSON.stringify(desktopLayout));
    }
  });
}

// ── Rubber-band Multi-select ─────────────────────
function initRubberBand() {
  var rb = document.getElementById('rubberBand');
  var startX, startY, dragging = false;
  document.getElementById('desktopIcons').addEventListener('mousedown', e => {
    if (e.target !== e.currentTarget && !e.target.classList.contains('desktop-icons')) return;
    if (e.button !== 0) return;
    startX = e.clientX; startY = e.clientY; dragging = true;
    rb.style.display = 'block'; rb.style.left = startX + 'px'; rb.style.top = startY + 'px';
    rb.style.width = '0'; rb.style.height = '0';
    if (!e.ctrlKey && !e.metaKey) deselectAllIcons();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    var x = Math.min(e.clientX, startX), y = Math.min(e.clientY, startY);
    var w = Math.abs(e.clientX - startX), h = Math.abs(e.clientY - startY);
    rb.style.left = x + 'px'; rb.style.top = y + 'px'; rb.style.width = w + 'px'; rb.style.height = h + 'px';
    var r1 = { x, y, x2: x + w, y2: y + h };
    document.querySelectorAll('.desktop-icon').forEach(icon => {
      var r = icon.getBoundingClientRect();
      var r2 = { x: r.left, y: r.top, x2: r.right, y2: r.bottom };
      var overlaps = r1.x < r2.x2 && r1.x2 > r2.x && r1.y < r2.y2 && r1.y2 > r2.y;
      if (overlaps) { icon.classList.add('selected'); selectedIcons.add(icon.dataset.appId); }
      else if (!e.ctrlKey && !e.metaKey) { icon.classList.remove('selected'); selectedIcons.delete(icon.dataset.appId); }
    });
  });
  document.addEventListener('mouseup', () => { if (!dragging) return; dragging = false; rb.style.display = 'none'; });
}

// ── Desktop Context Menu ─────────────────────────
function initContextMenu() {
  var menu = document.getElementById('deskCtx');
  document.getElementById('desktop').addEventListener('contextmenu', e => {
    if (e.target.closest('.desktop-icon') || e.target.closest('.desktop-widget')) return;
    e.preventDefault();
    menu.innerHTML = `
      <div class="ctx-item" onclick="openApp('notepad');closeCtxMenu()">📝 New Note</div>
      <div class="ctx-item" onclick="openApp('stickynotes');closeCtxMenu()">📌 New Sticky Note</div>
      <div class="ctx-sep"></div>
      <div class="ctx-item" onclick="addWidget('clock');closeCtxMenu()">🕐 Add Clock Widget</div>
      <div class="ctx-item" onclick="addWidget('stats');closeCtxMenu()">📊 Add Stats Widget</div>
      <div class="ctx-item" onclick="addWidget('weather');closeCtxMenu()">🌤️ Add Weather Widget</div>
      <div class="ctx-item" onclick="addWidget('sticky');closeCtxMenu()">📌 Add Sticky Widget</div>
      <div class="ctx-sep"></div>
      <div class="ctx-item" onclick="toggleSpotlight();closeCtxMenu()">🔍 Spotlight Search</div>
      <div class="ctx-item" onclick="openApp('settings');closeCtxMenu()">⚙️ Settings</div>
      <div class="ctx-item" onclick="resetDesktopLayout();closeCtxMenu()">↺ Reset Icon Layout</div>
      <div class="ctx-sep"></div>
      <div class="ctx-item" onclick="changeTheme(currentTheme==='white'?'black':'white');closeCtxMenu()">🎨 Toggle Theme</div>`;
    var x = Math.min(e.clientX, window.innerWidth - 220), y = Math.min(e.clientY, window.innerHeight - 320);
    menu.style.left = x + 'px'; menu.style.top = y + 'px';
    menu.classList.add('open');
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCtxMenu(); });
}
function closeCtxMenu() { document.getElementById('deskCtx').classList.remove('open'); }
