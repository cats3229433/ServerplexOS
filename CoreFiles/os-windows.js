// ══════════════════════════════════════════════
//  OS-WINDOWS.JS
//  + calls addRecent(appId) on open
// ══════════════════════════════════════════════

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
  var el = document.createElement('div');
  el.className = 'window';
  el.dataset.appId = appId;
  el.style.zIndex = ++zIdx;

  var mw = window.innerWidth - 40, mh = window.innerHeight - 88;
  var dw = Math.min(a.width || 820, mw), dh = Math.min(a.height || 620, mh);
  var left = Math.max(20, (window.innerWidth - dw) / 2);
  var top  = Math.max(20, (window.innerHeight - dh - 68) / 2);
  left = Math.min(left, window.innerWidth  - dw - 20);
  top  = Math.min(top,  window.innerHeight - dh - 88);
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
    '<div class="window-content"><iframe src="' + a.file + '" allow="autoplay; clipboard-read; clipboard-write"></iframe></div>' +
    '<div class="resize-handle right"></div>' +
    '<div class="resize-handle bottom"></div>' +
    '<div class="resize-handle bottom-right"></div>';

  document.body.appendChild(el);
  windows[appId] = { element: el, minimized: false, maximized: false, vd: currentVd };
  constrainWindow(el);

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

  tb.addEventListener('mousedown', function(e) {
    if (e.target.closest('.window-controls') || el.classList.contains('maximized')) return;
    isDrag = true; sx = e.clientX; sy = e.clientY;
    ix = el.offsetLeft; iy = el.offsetTop;
    // Remove any snap class when dragging starts
    ['snap-left','snap-right','snap-tl','snap-tr','snap-bl','snap-br'].forEach(function(c){ el.classList.remove(c); });
  });
  document.addEventListener('mousemove', function(e) {
    if (!isDrag) return; e.preventDefault();
    var nx = Math.max(0, Math.min(ix + (e.clientX - sx), window.innerWidth  - el.offsetWidth));
    var ny = Math.max(0, Math.min(iy + (e.clientY - sy), window.innerHeight - 68 - el.offsetHeight));
    el.style.left = nx + 'px'; el.style.top = ny + 'px';
    snap = getSnapZone(e.clientX, e.clientY);
    showSnapPreview(snap);
  });
  document.addEventListener('mouseup', function() {
    if (!isDrag) return; isDrag = false;
    if (preview) preview.style.display = 'none';
    if (snap) { applySnap(el, snap); snap = null; }
  });
}

function getSnapZone(x, y) {
  var h = window.innerHeight - 68, w = window.innerWidth;
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
  var h = window.innerHeight - 68, w = window.innerWidth;
  if (!zone) { p.style.display = 'none'; return; }
  var styles = {
    'maximize':  'top:0;left:0;width:'+w+'px;height:'+h+'px',
    'snap-left': 'top:0;left:0;width:'+(w*.5)+'px;height:'+h+'px',
    'snap-right':'top:0;left:'+(w*.5)+'px;width:'+(w*.5)+'px;height:'+h+'px',
    'snap-tl':   'top:0;left:0;width:'+(w*.5)+'px;height:'+(h*.5)+'px',
    'snap-tr':   'top:0;left:'+(w*.5)+'px;width:'+(w*.5)+'px;height:'+(h*.5)+'px',
    'snap-bl':   'top:'+(h*.5)+'px;left:0;width:'+(w*.5)+'px;height:'+(h*.5)+'px',
    'snap-br':   'top:'+(h*.5)+'px;left:'+(w*.5)+'px;width:'+(w*.5)+'px;height:'+(h*.5)+'px',
  };
  p.style.cssText = 'display:block;position:fixed;background:rgba(0,120,212,.18);border:2px solid rgba(0,120,212,.55);border-radius:6px;pointer-events:none;z-index:99999;transition:all .1s;' + styles[zone];
}

function applySnap(el, zone) {
  el.className = el.className.replace(/snap-\w+/g,'').replace(/maximized/g,'').trim();
  if (zone === 'maximize') { el.classList.add('maximized'); return; }
  el.classList.add(zone);
}

function makeWindowResizable(el) {
  var tip = document.getElementById('resizeTooltip');
  el.querySelectorAll('.resize-handle').forEach(function(handle) {
    var isRes = false, sx, sy, sw, sh;
    handle.addEventListener('mousedown', function(e) {
      if (el.classList.contains('maximized')) return;
      e.stopPropagation(); isRes = true;
      sx = e.clientX; sy = e.clientY;
      sw = el.offsetWidth; sh = el.offsetHeight;
    });
    document.addEventListener('mousemove', function(e) {
      if (!isRes) return; e.preventDefault();
      var dx = e.clientX - sx, dy = e.clientY - sy;
      var maxW = Math.max(360, window.innerWidth  - el.offsetLeft);
      var maxH = Math.max(260, window.innerHeight - 68 - el.offsetTop);
      if (handle.classList.contains('right')  || handle.classList.contains('bottom-right'))
        el.style.width  = Math.min(Math.max(360, sw + dx), maxW) + 'px';
      if (handle.classList.contains('bottom') || handle.classList.contains('bottom-right'))
        el.style.height = Math.min(Math.max(260, sh + dy), maxH) + 'px';
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
  if (el.classList.contains('maximized')) return;
  var w = el.offsetWidth, h = el.offsetHeight;
  var l = Math.max(0, Math.min(el.offsetLeft, window.innerWidth  - w));
  var t = Math.max(0, Math.min(el.offsetTop,  window.innerHeight - 68 - h));
  el.style.left = l + 'px';
  el.style.top  = t + 'px';
}

function minimizeWindow(appId) {
  var w = windows[appId]; if (!w) return;
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
  w.element.className = w.element.className.replace(/snap-\w+/g,'').trim();
  w.element.classList.toggle('maximized');
  w.maximized = !w.maximized;
}

function closeWindow(appId) {
  var w = windows[appId]; if (!w) return;
  w.element.classList.add('closing');
  setTimeout(function() {
    w.element.remove();
    delete windows[appId];
    updateTaskbar();
    renderPinnedApps();
  }, 200);
}