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
}

function init() {
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
  var wp = localStorage.getItem('serverplex_wallpaper');
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
    if ((e.metaKey || e.ctrlKey) && e.key === ' ') { e.preventDefault(); toggleSpotlight(); }
    if (e.key === 'Escape') {
      closeSpotlight();
      closeVdPreview();
      document.getElementById('notifPanel').classList.remove('open');
    }
    if (e.ctrlKey && e.key >= '1' && e.key <= '4') switchVd(parseInt(e.key) - 1);
    if (e.ctrlKey && e.shiftKey && e.key === 'D') showVdPreview();
  });

  // ── 14. Startup chime ──
  if (localStorage.getItem('serverplex_startup_chime') !== 'false') {
    setTimeout(playStartupChime, 400);
  }

  // ── 15. Startup apps ──
  setTimeout(function() {
    var startupApps = JSON.parse(localStorage.getItem('serverplex_startup_apps') || '[]');
    startupApps.forEach(function(id){ if (apps[id]) openApp(id); });
  }, 800);
}

// ── AUTO-CALL — this is what was missing ─────────
init();