// ══════════════════════════════════════════════
//  OS-INIT.JS — load LAST
//
//  Key fixes vs original:
//    1. Stale layout purge moved HERE from desktop.html
//       inline script — runs after os-apps.js loads.
//    2. init() is now CALLED at the bottom of this file.
//    3. Custom theme vars loaded on boot.
//    4. Animated base-theme CSS injected on boot.
// ══════════════════════════════════════════════

function softReload() {
  sessionStorage.setItem('serverplex_authed', 'true');
  document.body.style.transition = 'opacity .3s';
  document.body.style.opacity = '0';
  setTimeout(function() { location.reload(); }, 320);
}

function playStartupChime() {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[261.63,0],[329.63,.13],[392,.26],[523.25,.4]].forEach(([freq, t]) => {
      var osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = 'sine';
      gain.gain.setValueAtTime(0, ctx.currentTime + t);
      gain.gain.linearRampToValueAtTime(.12, ctx.currentTime + t + .06);
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + t + .5);
      osc.start(ctx.currentTime + t); osc.stop(ctx.currentTime + t + .5);
    });
  } catch(e) {}
}

function injectBaseThemeAnimations() {
  if (document.getElementById('baseThemeAnimStyle')) return;
  var style = document.createElement('style');
  style.id = 'baseThemeAnimStyle';
  style.textContent = `
    body.theme-white .desktop::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
      background:radial-gradient(ellipse 55% 35% at 15% 25%,rgba(0,120,212,.07) 0%,transparent 65%),
        radial-gradient(ellipse 45% 30% at 85% 75%,rgba(100,180,255,.05) 0%,transparent 60%);
      animation:whiteOrbs 12s ease-in-out infinite alternate}
    @keyframes whiteOrbs{0%{opacity:.4;transform:scale(1) translateX(0)}100%{opacity:.8;transform:scale(1.06) translateX(12px)}}
    body.theme-white .desktop::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
      background-image:radial-gradient(circle,rgba(0,120,212,.1) 1px,transparent 1px);
      background-size:80px 80px;opacity:.3;animation:whiteDots 20s linear infinite}
    @keyframes whiteDots{from{background-position:0 0}to{background-position:80px 80px}}

    body.theme-black .desktop::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
      background-image:radial-gradient(circle,rgba(255,255,255,.85) 1px,transparent 1px),
        radial-gradient(circle,rgba(255,255,255,.4) 1px,transparent 1px);
      background-size:180px 180px,300px 300px;background-position:0 0,90px 60px;
      animation:blackStars 10s ease-in-out infinite alternate;opacity:.6}
    @keyframes blackStars{0%{opacity:.35}100%{opacity:.75}}
    body.theme-black .desktop::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
      background:radial-gradient(ellipse 60% 30% at 30% 40%,rgba(0,120,212,.04) 0%,transparent 60%),
        radial-gradient(ellipse 40% 20% at 80% 70%,rgba(80,0,160,.04) 0%,transparent 55%);
      animation:blackNebula 16s ease-in-out infinite alternate}
    @keyframes blackNebula{0%{opacity:.3;transform:scale(1)}100%{opacity:.8;transform:scale(1.08)}}

    body.theme-grey .desktop::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
      background-image:linear-gradient(rgba(255,255,255,.07) 1px,transparent 1px),
        linear-gradient(90deg,rgba(255,255,255,.07) 1px,transparent 1px);
      background-size:44px 44px;animation:greyGrid 18s linear infinite}
    @keyframes greyGrid{0%{background-position:0 0;opacity:.4}50%{opacity:.8}100%{background-position:44px 44px;opacity:.4}}
    body.theme-grey .desktop::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
      background:radial-gradient(ellipse 50% 40% at 50% 50%,rgba(255,255,255,.06) 0%,transparent 65%);
      animation:greyPulse 8s ease-in-out infinite alternate}
    @keyframes greyPulse{0%{opacity:.2}100%{opacity:.7}}
  `;
  document.head.appendChild(style);
  injectNewThemeAnimations();
}

function injectNewThemeAnimations() {
  if (document.getElementById('newThemeAnimStyle')) return;
  var style = document.createElement('style');
  style.id = 'newThemeAnimStyle';
  style.textContent = `
    /* Desert */
    body.theme-desert .desktop::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
      background:radial-gradient(ellipse 70% 30% at 50% 90%,rgba(232,145,58,.12) 0%,transparent 60%),
        radial-gradient(ellipse 40% 20% at 80% 20%,rgba(255,200,100,.06) 0%,transparent 50%);
      animation:desertShimmer 12s ease-in-out infinite alternate}
    @keyframes desertShimmer{0%{opacity:.4;transform:scaleX(1)}100%{opacity:.9;transform:scaleX(1.05)}}

    /* Ocean */
    body.theme-ocean .desktop::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
      background:repeating-linear-gradient(180deg,transparent,transparent 60px,rgba(0,180,216,.03) 60px,rgba(0,180,216,.03) 61px);
      animation:oceanRipple 8s ease-in-out infinite alternate}
    @keyframes oceanRipple{0%{transform:translateY(0);opacity:.5}100%{transform:translateY(-20px);opacity:1}}

    /* Jungle */
    body.theme-jungle .desktop::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
      background:radial-gradient(ellipse 40% 60% at 10% 50%,rgba(45,198,83,.08) 0%,transparent 60%),
        radial-gradient(ellipse 30% 50% at 90% 40%,rgba(45,198,83,.06) 0%,transparent 60%);
      animation:jungleLight 14s ease-in-out infinite alternate}
    @keyframes jungleLight{0%{opacity:.3;transform:translateY(-10px)}100%{opacity:.8;transform:translateY(10px)}}

    /* Blizzard */
    body.theme-blizzard .desktop::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
      background-image:radial-gradient(circle,rgba(255,255,255,.7) 1px,transparent 1px),
        radial-gradient(circle,rgba(255,255,255,.4) 1px,transparent 1px);
      background-size:120px 120px,200px 200px;
      animation:snowDrift 10s linear infinite}
    @keyframes snowDrift{from{background-position:0 0,0 0}to{background-position:30px 120px,50px 200px}}

    /* Matrix */
    body.theme-matrix .desktop::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:1;
      background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.15) 2px,rgba(0,0,0,.15) 4px)}
    body.theme-matrix .desktop::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
      background:radial-gradient(ellipse 80% 80% at 50% 50%,rgba(0,255,65,.04) 0%,transparent 70%);
      animation:matrixPulse 4s ease-in-out infinite alternate}
    @keyframes matrixPulse{0%{opacity:.3}100%{opacity:1}}

    /* Cyberpunk */
    body.theme-cyberpunk .desktop::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
      background:repeating-linear-gradient(90deg,transparent,transparent 80px,rgba(246,55,236,.03) 80px,rgba(246,55,236,.03) 81px),
        repeating-linear-gradient(0deg,transparent,transparent 80px,rgba(0,200,255,.02) 80px,rgba(0,200,255,.02) 81px);
      animation:cpGrid 6s linear infinite}
    @keyframes cpGrid{from{background-position:0 0}to{background-position:80px 80px}}

    /* Retro */
    body.theme-retro .desktop::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:1;
      background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.2) 3px,rgba(0,0,0,.2) 4px)}
    body.theme-retro .desktop::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
      background:radial-gradient(ellipse 70% 70% at 50% 50%,rgba(51,255,51,.05) 0%,transparent 65%),
        radial-gradient(ellipse 100% 100% at 50% 50%,transparent 55%,rgba(0,0,0,.5) 100%);
      animation:retroFlicker .15s infinite}
    @keyframes retroFlicker{0%{opacity:.97}50%{opacity:1}100%{opacity:.96}}

    /* Coffee */
    body.theme-coffee .desktop::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
      background:radial-gradient(ellipse 60% 50% at 40% 60%,rgba(201,129,58,.1) 0%,transparent 60%),
        radial-gradient(ellipse 40% 30% at 80% 30%,rgba(160,80,20,.07) 0%,transparent 50%);
      animation:coffeeWarm 10s ease-in-out infinite alternate}
    @keyframes coffeeWarm{0%{opacity:.4}100%{opacity:.9}}

    /* Autumn */
    body.theme-autumn .desktop::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
      background:radial-gradient(ellipse 70% 40% at 50% 80%,rgba(226,105,58,.14) 0%,transparent 60%),
        radial-gradient(ellipse 50% 30% at 20% 30%,rgba(200,80,30,.08) 0%,transparent 55%);
      animation:autumnGlow 9s ease-in-out infinite alternate}
    @keyframes autumnGlow{0%{opacity:.5;transform:translateX(-5px)}100%{opacity:1;transform:translateX(5px)}}

    /* Candle */
    body.theme-candle .desktop::after{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;
      background:radial-gradient(ellipse 40% 60% at 50% 75%,rgba(245,166,35,.15) 0%,transparent 55%),
        radial-gradient(ellipse 20% 20% at 50% 50%,rgba(255,200,80,.04) 0%,transparent 60%);
      animation:candleFlame 2.5s ease-in-out infinite alternate}
    @keyframes candleFlame{0%{opacity:.55;transform:scale(1) translateX(-2px)}50%{opacity:.8;transform:scale(1.03) translateX(1px)}100%{opacity:.65;transform:scale(.98) translateX(-1px)}}
  `;
  document.head.appendChild(style);
}

function init() {
  // ── 0. Load custom installed apps ──
  loadCustomApps();

  // ── 0b. Apply saved icon pack ──
  (function applyIconPack() {
    var raw = localStorage.getItem('serverplex_icon_pack');
    if (!raw) return;
    try {
      var pack = JSON.parse(raw);
      Object.keys(pack).forEach(function(id) {
        if (!apps[id]) return;
        var val = pack[id];
        var isUrl = typeof val === 'string' && (val.startsWith('http') || val.startsWith('data:'));
        if (isUrl) { apps[id].customIcon = val; }
        else { apps[id].icon = val; delete apps[id].customIcon; }
      });
    } catch(e) { console.warn('serverplex_icon_pack parse error:', e); }
  })();

  // ── 1. Purge stale layout keys (now safe — apps is defined) ──
  Object.keys(desktopLayout).forEach(function(id) {
    if (!apps[id]) delete desktopLayout[id];
  });

  // ── 2. Custom theme ──
  if (currentTheme === 'custom') {
    var customVars = JSON.parse(localStorage.getItem('serverplex_custom_theme') || 'null');
    if (customVars) {
      applyCustomThemeVars(customVars);
    } else {
      currentTheme = 'black';
      localStorage.setItem('serverplex_theme', 'black');
    }
  }

  // ── 3. Apply theme class (skip if custom already handled) ──
  if (currentTheme !== 'custom') {
    document.body.className = 'theme-' + currentTheme;
  }

  injectBaseThemeAnimations();

  // ── 4. Taskbar mode ──
  var tbm = localStorage.getItem('serverplex_tb_mode') || 'blur';
  document.body.classList.add('tb-' + tbm);

  // ── 5. Font size ──
  var fs = localStorage.getItem('serverplex_os_font_size');
  if (fs) document.body.style.fontSize = fs + 'px';

  // ── 6. Accent ──
  var acc = localStorage.getItem('serverplex_accent');
  if (acc) document.documentElement.style.setProperty('--accent', acc);

  // ── 7. Wallpaper ──
  var themeWp = localStorage.getItem('serverplex_wallpaper_' + currentTheme);
  var wp = themeWp || localStorage.getItem('serverplex_wallpaper');
  if (wp && wp !== 'none') {
    var d = document.getElementById('desktop');
    d.style.background = (wp.startsWith('http') || wp.startsWith('data:'))
      ? "url('" + wp + "') center/cover no-repeat"
      : wp;
  }

  // ── 8. Night mode ──
  if (localStorage.getItem('serverplex_nightmode') === 'true') {
    document.body.style.filter = 'sepia(20%) brightness(85%)';
  }

  // ── 9. User profile ──
  document.getElementById('smUsername').textContent = localStorage.getItem('serverplex_username') || 'User';
  document.getElementById('smAvatar').textContent   = localStorage.getItem('serverplex_avatar')   || '👤';

  // ── 10. DnD ──
  if (dndMode) {
    document.getElementById('dndDot').classList.add('on');
    document.getElementById('qsDnd').classList.add('on');
  }

  // ── 11. Render all UI ──
  renderDesktopIcons();
  renderPinnedApps();
  renderStartMenuApps();
  renderVdSwitcher();
  updateClock();
  setInterval(updateClock, 1000);
  initContextMenu();
  initWidgets();
  initRubberBand();
  updateQsTheme();
  updateNetworkStatus();
  renderNotifList();
  updateNotifBadge();

  // ── 12. Event wiring ──
  document.getElementById('startButton').addEventListener('click', toggleStartMenu);

  document.addEventListener('click', function(e) {
    if (!e.target.closest('.start-menu')  && !e.target.closest('.start-button'))  closeStartMenu();
    if (!e.target.closest('.qs-panel')    && !e.target.closest('[onclick*="toggleQs"]'))
      document.getElementById('qsPanel').classList.remove('open');
    if (!e.target.closest('.cal-popup')   && !e.target.closest('.tray-clock'))
      document.getElementById('calPopup').classList.remove('open');
    if (!e.target.closest('.tray-popup')  && !e.target.closest('[onclick*="toggleTray"]'))
      document.querySelectorAll('.tray-popup').forEach(function(p){ p.classList.remove('active'); });
    if (!e.target.closest('.tb-ctx'))  document.getElementById('tbCtx').classList.remove('open');
    if (!e.target.closest('.desk-ctx')) document.getElementById('deskCtx').classList.remove('open');
  });

  document.getElementById('desktop').addEventListener('click', function(e) {
    if (e.target.id === 'desktop' || e.target.id === 'desktopIcons') deselectAllIcons();
  });

  window.addEventListener('resize', function() {
    Object.values(windows).forEach(function(w){ constrainWindow(w.element); });
  });

  // ── 13. Keyboard shortcuts ──
  document.addEventListener('keydown', function(e) {
    var ctrl  = e.ctrlKey || e.metaKey;
    var shift = e.shiftKey;
    var tag   = (document.activeElement && document.activeElement.tagName) || '';
    var inInput = ['INPUT','TEXTAREA','SELECT'].includes(tag);

    // Always-active shortcuts (work even in inputs)
    if (ctrl && e.key === ' ') { e.preventDefault(); toggleSpotlight(); return; }
    if (e.key === 'Escape') {
      closeSpotlight();
      closeVdPreview();
      closeShortcuts();
      document.getElementById('notifPanel').classList.remove('open');
      document.getElementById('qsPanel').classList.remove('open');
      document.getElementById('calPopup').classList.remove('open');
      return;
    }

    // Ctrl+? or Ctrl+Shift+/  → shortcuts overlay
    if (ctrl && (e.key === '?' || (shift && e.key === '/'))) {
      e.preventDefault(); toggleShortcuts(); return;
    }

    // Skip app-launching shortcuts if typing in an input
    if (inInput) return;

    // Virtual desktops
    if (ctrl && e.key >= '1' && e.key <= '4') { e.preventDefault(); switchVd(parseInt(e.key) - 1); return; }
    if (ctrl && shift && e.key === 'D') { e.preventDefault(); showVdPreview(); return; }

    // App shortcuts
    if (ctrl && !shift && e.key === 'b') { e.preventDefault(); openApp('browser');     return; }
    if (ctrl && !shift && e.key === 't') { e.preventDefault(); openApp('terminal');    return; }
    if (ctrl && !shift && e.key === 'n') { e.preventDefault(); openApp('notepad');     return; }
    if (ctrl && !shift && e.key === 'e') { e.preventDefault(); openApp('filemanager'); return; }
    if (ctrl && !shift && e.key === ',') { e.preventDefault(); openApp('settings');    return; }
    if (ctrl && shift && e.key === 'C')  { e.preventDefault(); openApp('calculator');  return; }
    if (ctrl && shift && e.key === 'K')  { e.preventDefault(); openApp('clock');       return; }
    if (ctrl && shift && e.key === 'S')  { e.preventDefault(); openApp('screenrecorder'); return; }

    // Theme toggle
    if (ctrl && shift && e.key === 'T') {
      e.preventDefault();
      changeTheme(currentTheme === 'white' ? 'black' : 'white');
      return;
    }

    // Do Not Disturb
    if (ctrl && shift && e.key === 'Q') { e.preventDefault(); toggleDnd(); return; }

    // App installer
    if (ctrl && shift && e.key === 'I') { e.preventDefault(); openAppInstaller(); return; }

    // Backup OS
    if (ctrl && shift && e.key === 'B') { e.preventDefault(); backupOS(); return; }

    // Lock (log out)
    if (ctrl && e.key === 'l') { e.preventDefault(); logOut(); return; }

    // Window controls for the topmost window
    var topId = Object.keys(windows).reduce(function(top, id) {
      var z = parseInt(windows[id].element.style.zIndex || 0);
      return (!top || z > parseInt(windows[top].element.style.zIndex || 0)) ? id : top;
    }, null);
    if (topId) {
      if (e.altKey && e.key === 'F4') { e.preventDefault(); closeWindow(topId); return; }
      if (e.altKey && e.key === '-')  { e.preventDefault(); minimizeWindow(topId); return; }
      if (e.altKey && e.key === 'ArrowUp') { e.preventDefault(); toggleMaximize(topId); return; }
    }
  });

  // ── 14. Startup chime ──
  if (localStorage.getItem('serverplex_startup_chime') !== 'false') {
    setTimeout(playStartupChime, 400);
  }

  // ── 15. Cursor system ──
  if (typeof initCursorSystem === 'function') initCursorSystem();

  // ── 16. Startup apps ──
  setTimeout(function() {
    var startupApps = JSON.parse(localStorage.getItem('serverplex_startup_apps') || '[]');
    startupApps.forEach(function(id){ if (apps[id]) openApp(id); });
  }, 800);
}

function toggleShortcuts() {
  var ov = document.getElementById('shortcutsOverlay');
  if (!ov) return;
  ov.classList.toggle('open');
}
function closeShortcuts() {
  var ov = document.getElementById('shortcutsOverlay');
  if (ov) ov.classList.remove('open');
}

// ── AUTO-CALL — this is what was missing ─────────
init();