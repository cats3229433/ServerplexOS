// ══════════════════════════════════════════════
//  OS-WINDOWS.JS
//  + calls addRecent(appId) on open
// ══════════════════════════════════════════════

function getWindowWorkArea() {
  var taskbarHeight = typeof OS_TASKBAR_HEIGHT === 'number' ? OS_TASKBAR_HEIGHT : 48;
  return {
    width: Math.max(1, window.innerWidth),
    height: Math.max(1, window.innerHeight - taskbarHeight)
  };
}

function clampWindowValue(value, min, max) {
  return Math.max(min, Math.min(value, Math.max(min, max)));
}

function getSnapDimensions(zone) {
  var area = getWindowWorkArea();
  var halfW = area.width / 2, halfH = area.height / 2;
  if (zone === 'maximize') return { width: area.width, height: area.height };
  if (zone === 'snap-left' || zone === 'snap-right') return { width: halfW, height: area.height };
  return { width: halfW, height: halfH };
}

function setWindowConstraints(el, zone) {
  var area = getWindowWorkArea();
  var bounds = zone ? getSnapDimensions(zone) : area;
  el.style.minWidth = Math.min(360, bounds.width) + 'px';
  el.style.minHeight = Math.min(260, bounds.height) + 'px';
  el.style.maxWidth = bounds.width + 'px';
  el.style.maxHeight = bounds.height + 'px';
}

function getWindowGridPosition(x, y, el) {
  var area = getWindowWorkArea();
  var gridSize = typeof GRID_SIZE === 'number' ? GRID_SIZE : 100;
  var gridPad = typeof GRID_PAD === 'number' ? GRID_PAD : 20;
  var maxX = Math.max(0, area.width - el.offsetWidth);
  var maxY = Math.max(0, area.height - el.offsetHeight);
  return {
    x: clampWindowValue(gridPad + Math.round((x - gridPad) / gridSize) * gridSize, 0, maxX),
    y: clampWindowValue(gridPad + Math.round((y - gridPad) / gridSize) * gridSize, 0, maxY)
  };
}

function openApp(appId) {
  var existing = windows[appId];
  if (existing) {
    bringToFront(appId);
    if (existing.minimized) {
      existing.element.classList.remove('minimized');
      existing.element.classList.add('restoring');
      existing.minimized = false;
      existing.element.style.display = '';
      constrainWindow(existing.element);
      setTimeout(function(){ existing.element.classList.remove('restoring'); }, 300);
    }
    addRecent(appId);
    return;
  }
  var a = apps[appId];
  if (!a || !a.file) {
    console.warn('Attempted to launch an unavailable app:', appId);
    if (typeof showToast === 'function') showToast('This app is unavailable');
    return;
  }
  var el = document.createElement('div');
  el.className = 'window';
  el.dataset.appId = appId;
  el.style.zIndex = ++zIdx;

  var area = getWindowWorkArea();
  var marginX = area.width >= 80 ? Math.min(20, (area.width - 1) / 2) : 0;
  var marginY = area.height >= 80 ? Math.min(20, (area.height - 1) / 2) : 0;
  var maxW = Math.max(1, area.width - marginX * 2);
  var maxH = Math.max(1, area.height - marginY * 2);
  var minW = Math.min(360, maxW), minH = Math.min(260, maxH);
  var dw = Math.min(maxW, Math.max(minW, Number(a.width) || 820));
  var dh = Math.min(maxH, Math.max(minH, Number(a.height) || 620));
  var left = Math.max(0, (area.width - dw) / 2);
  var top  = Math.max(0, (area.height - dh) / 2);
  setWindowConstraints(el, null);
  el.style.width  = dw + 'px';
  el.style.height = dh + 'px';
  el.style.left   = left + 'px';
  el.style.top    = top  + 'px';

  var tbColor = APP_COLORS[appId] || 'var(--accent)';
  el.innerHTML =
    '<div class="window-titlebar" style="background:' + tbColor + '">' +
      '<span class="window-icon">'  + getIconHtml(a, 16) + '</span>' +
      '<span class="window-title">' + a.name + '</span>' +
      '<div class="window-controls">' +
        '<div class="wcb min" title="Minimize">−</div>' +
        '<div class="wcb max" title="Maximize">□</div>' +
        '<div class="wcb cls" title="Close">×</div>' +
      '</div>' +
    '</div>' +
    '<div class="window-content"><iframe src="' + a.file + '" allow="autoplay; clipboard-read; clipboard-write; fullscreen"></iframe></div>' +
    '<div class="resize-handle right"></div>' +
    '<div class="resize-handle bottom"></div>' +
    '<div class="resize-handle bottom-right"></div>';

  document.body.appendChild(el);
  windows[appId] = { element: el, minimized: false, maximized: false, vd: currentVd };
  constrainWindow(el);

  // ── Add iframe overlay if custom cursor is active ──
  var iframe = el.querySelector('iframe');
  if (iframe && typeof _cursorPack !== 'undefined' && _cursorPack !== 'default') {
    iframe.addEventListener('load', function() {
      if (typeof syncCursorToAllFrames === 'function') syncCursorToAllFrames();
    });
  }

  el.querySelector('.min').addEventListener('click', function(){ minimizeWindow(appId); });
  el.querySelector('.max').addEventListener('click', function(){ toggleMaximize(appId); });
  el.querySelector('.cls').addEventListener('click', function(){ closeWindow(appId); });
  el.addEventListener('mousedown', function(){ bringToFront(appId); });
  makeWindowDraggable(el);
  makeWindowResizable(el);
  updateTaskbar();
  renderPinnedApps();
  addRecent(appId);
  pushNotif(a.icon, a.name, a.name + ' opened', '');
}

function makeWindowDraggable(el) {
  var tb = el.querySelector('.window-titlebar');
  var isDrag = false, sx, sy, ix, iy;
  var snap = null;
  var preview = document.getElementById('snapPreview');
  var gridPreview = document.getElementById('windowGridPreview');

  tb.addEventListener('mousedown', function(e) {
    if (e.target.closest('.window-controls') || el.classList.contains('maximized')) return;
    isDrag = true; sx = e.clientX; sy = e.clientY;
    ix = el.offsetLeft; iy = el.offsetTop;
    // Remove any snap class when dragging starts
    ['snap-left','snap-right','snap-tl','snap-tr','snap-bl','snap-br'].forEach(function(c){ el.classList.remove(c); });
    setWindowConstraints(el, null);
  });
  document.addEventListener('mousemove', function(e) {
    if (!isDrag) return; e.preventDefault();
    var area = getWindowWorkArea();
    var nx = clampWindowValue(ix + (e.clientX - sx), 0, area.width - el.offsetWidth);
    var ny = clampWindowValue(iy + (e.clientY - sy), 0, area.height - el.offsetHeight);
    el.style.left = nx + 'px'; el.style.top = ny + 'px';
    snap = getSnapZone(e.clientX, e.clientY);
    if (snap) {
      showSnapPreview(snap);
      if (gridPreview) gridPreview.style.display = 'none';
    } else {
      showSnapPreview(null);
      if (gridPreview) {
        var gridPos = getWindowGridPosition(nx, ny, el);
        gridPreview.style.cssText = 'display:block;left:' + gridPos.x + 'px;top:' + gridPos.y +
          'px;width:' + el.offsetWidth + 'px;height:' + el.offsetHeight + 'px';
      }
    }
  });
  document.addEventListener('mouseup', function() {
    if (!isDrag) return; isDrag = false;
    if (preview) preview.style.display = 'none';
    if (gridPreview) gridPreview.style.display = 'none';
    if (snap) {
      applySnap(el, snap);
      snap = null;
    } else {
      var gridPos = getWindowGridPosition(el.offsetLeft, el.offsetTop, el);
      el.style.left = gridPos.x + 'px';
      el.style.top = gridPos.y + 'px';
      constrainWindow(el);
    }
  });
}

function getSnapZone(x, y) {
  var area = getWindowWorkArea();
  var h = area.height, w = area.width;
  if (y < 6)              return 'maximize';
  if (x < 16 && y < h*.5) return 'snap-tl';
  if (x < 16 && y >= h*.5) return 'snap-bl';
  if (x > w-16 && y < h*.5) return 'snap-tr';
  if (x > w-16 && y >= h*.5) return 'snap-br';
  if (x < 16)   return 'snap-left';
  if (x > w-16) return 'snap-right';
  return null;
}

function showSnapPreview(zone) {
  var p = document.getElementById('snapPreview');
  if (!p) return;
  var area = getWindowWorkArea();
  var h = area.height, w = area.width;
  if (!zone) { p.style.display = 'none'; return; }
  var halfW = w * .5, halfH = h * .5;
  var styles = {
    'maximize':  'top:0;left:0;width:'+w+'px;height:'+h+'px',
    'snap-left': 'top:0;left:0;width:'+halfW+'px;height:'+h+'px',
    'snap-right':'top:0;left:'+halfW+'px;width:'+halfW+'px;height:'+h+'px',
    'snap-tl':   'top:0;left:0;width:'+halfW+'px;height:'+halfH+'px',
    'snap-tr':   'top:0;left:'+halfW+'px;width:'+halfW+'px;height:'+halfH+'px',
    'snap-bl':   'top:'+halfH+'px;left:0;width:'+halfW+'px;height:'+halfH+'px',
    'snap-br':   'top:'+halfH+'px;left:'+halfW+'px;width:'+halfW+'px;height:'+halfH+'px',
  };
  p.style.cssText = 'display:block;position:fixed;background:rgba(0,120,212,.18);border:2px solid rgba(0,120,212,.55);border-radius:6px;pointer-events:none;z-index:99999;transition:all .1s;' + styles[zone];
}

function applySnap(el, zone) {
  el.className = el.className.replace(/snap-\w+/g,'').replace(/maximized/g,'').trim();
  if (zone === 'maximize') el.classList.add('maximized');
  else el.classList.add(zone);
  setWindowConstraints(el, zone);
  var state = windows[el.dataset.appId];
  if (state) state.maximized = zone === 'maximize';
}

function makeWindowResizable(el) {
  var tip = document.getElementById('resizeTooltip');
  el.querySelectorAll('.resize-handle').forEach(function(handle) {
    var isRes = false, sx, sy, sw, sh;
    handle.addEventListener('mousedown', function(e) {
      if (el.classList.contains('maximized') || /\bsnap-(left|right|tl|tr|bl|br)\b/.test(el.className)) return;
      e.stopPropagation(); isRes = true;
      sx = e.clientX; sy = e.clientY;
      sw = el.offsetWidth; sh = el.offsetHeight;
    });
    document.addEventListener('mousemove', function(e) {
      if (!isRes) return; e.preventDefault();
      var dx = e.clientX - sx, dy = e.clientY - sy;
      var area = getWindowWorkArea();
      var maxW = Math.max(1, area.width - el.offsetLeft);
      var maxH = Math.max(1, area.height - el.offsetTop);
      var minW = Math.min(360, maxW);
      var minH = Math.min(260, maxH);
      if (handle.classList.contains('right')  || handle.classList.contains('bottom-right'))
        el.style.width  = clampWindowValue(sw + dx, minW, maxW) + 'px';
      if (handle.classList.contains('bottom') || handle.classList.contains('bottom-right'))
        el.style.height = clampWindowValue(sh + dy, minH, maxH) + 'px';
      if (tip) {
        tip.style.display = 'block';
        tip.style.left = (e.clientX + 14) + 'px';
        tip.style.top  = (e.clientY + 14) + 'px';
        tip.textContent = Math.round(el.offsetWidth) + ' × ' + Math.round(el.offsetHeight);
      }
    });
    document.addEventListener('mouseup', function() {
      if (isRes) { isRes = false; if (tip) tip.style.display = 'none'; }
    });
  });
}

function bringToFront(appId) {
  if (windows[appId]) {
    windows[appId].element.style.zIndex = ++zIdx;
    updateTaskbar();
  }
}

function constrainWindow(el) {
  var snapClass = ['snap-left','snap-right','snap-tl','snap-tr','snap-bl','snap-br'].find(function(c) {
    return el.classList.contains(c);
  });
  if (el.classList.contains('maximized')) {
    setWindowConstraints(el, 'maximize');
    return;
  }
  if (snapClass) {
    setWindowConstraints(el, snapClass);
    return;
  }
  var area = getWindowWorkArea();
  setWindowConstraints(el, null);
  var minW = Math.min(360, area.width);
  var minH = Math.min(260, area.height);
  var w = clampWindowValue(el.offsetWidth, minW, area.width);
  var h = clampWindowValue(el.offsetHeight, minH, area.height);
  el.style.width = w + 'px';
  el.style.height = h + 'px';
  el.style.left = clampWindowValue(el.offsetLeft, 0, area.width - w) + 'px';
  el.style.top = clampWindowValue(el.offsetTop, 0, area.height - h) + 'px';
}

function minimizeWindow(appId) {
  var w = windows[appId]; if (!w) return;
  setGameFocusMode(w, false);
  w.element.classList.add('minimizing');
  setTimeout(function() {
    w.element.classList.remove('minimizing');
    w.element.style.display = 'none';
    w.minimized = true;
    updateTaskbar();
  }, 280);
}

function toggleMaximize(appId) {
  var w = windows[appId]; if (!w) return;
  var el = w.element;
  ['snap-left','snap-right','snap-tl','snap-tr','snap-bl','snap-br'].forEach(function(c){ el.classList.remove(c); });
  if (el.classList.contains('maximized')) {
    el.classList.remove('maximized');
    w.maximized = false;
    setWindowConstraints(el, null);
    constrainWindow(el);
  } else {
    el.classList.add('maximized');
    w.maximized = true;
    setWindowConstraints(el, 'maximize');
  }
}

function closeWindow(appId) {
  var w = windows[appId]; if (!w) return;
  setGameFocusMode(w, false);
  w.element.classList.add('closing');
  setTimeout(function() {
    w.element.remove();
    delete windows[appId];
    updateTaskbar();
    renderPinnedApps();
  }, 200);
}

function setGameFocusMode(windowState, enabled, animate) {
  if (!windowState || !windowState.element) return;
  if (windowState.gameFocusTimer) {
    clearTimeout(windowState.gameFocusTimer);
    windowState.gameFocusTimer = null;
  }
  windowState.element.classList.remove('game-focus-entering', 'game-focus-exiting');
  var el = windowState.element;
  if (!enabled && windowState.gameFocusMode && animate) {
    el.classList.add('game-focus-exiting');
    windowState.gameFocusTimer = setTimeout(function() {
      el.classList.remove('game-focus-mode', 'game-focus-exiting');
      el.style.removeProperty('--game-focus-x');
      el.style.removeProperty('--game-focus-y');
      el.style.removeProperty('--game-focus-sx');
      el.style.removeProperty('--game-focus-sy');
      windowState.gameFocusMode = false;
      windowState.gameFocusRect = null;
      windowState.gameFocusTimer = null;
    }, 240);
    return;
  }
  if (enabled && !windowState.gameFocusMode) {
    var rect = el.getBoundingClientRect();
    windowState.gameFocusRect = rect;
    el.style.setProperty('--game-focus-x', rect.left + 'px');
    el.style.setProperty('--game-focus-y', rect.top + 'px');
    el.style.setProperty('--game-focus-sx', rect.width / window.innerWidth);
    el.style.setProperty('--game-focus-sy', rect.height / window.innerHeight);
  }
  windowState.gameFocusMode = enabled;
  el.classList.toggle('game-focus-mode', enabled);
  if (enabled && animate) el.classList.add('game-focus-entering');
  if (!enabled) {
    el.style.removeProperty('--game-focus-x');
    el.style.removeProperty('--game-focus-y');
    el.style.removeProperty('--game-focus-sx');
    el.style.removeProperty('--game-focus-sy');
    windowState.gameFocusRect = null;
  }
}

window.addEventListener('message', function(event) {
  var data = event.data;
  if (event.origin !== location.origin || !data || data.type !== 'serverplex-game-focus' || typeof data.enabled !== 'boolean') return;
  var gameWindow = windows.games;
  if (!gameWindow) return;
  var frame = gameWindow.element.querySelector('.window-content iframe');
  if (!frame || event.source !== frame.contentWindow) return;
  setGameFocusMode(gameWindow, data.enabled, true);
  if (data.enabled) bringToFront('games');
});