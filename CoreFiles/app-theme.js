// ══════════════════════════════════════════════
//  APP-THEME.JS — CoreFiles/app-theme.js
//  Load as FIRST script in every app.
//  Provides: theme vars, base styles, utilities.
// ══════════════════════════════════════════════

(function() {

  // ── Theme definitions ─────────────────────
  var THEMES = {
    white:     { bg:'#f0f0f0', surface:'#ffffff', surface2:'#e8e8e8', text:'#111111', text2:'#4a4a4a', border:'#d0d0d0', accent:'#0078d4', radius:'8px', shadow:'0 2px 12px rgba(0,0,0,0.1)' },
    black:     { bg:'#0a0a0a', surface:'#1e1e1e', surface2:'#2a2a2a', text:'#f0f0f0', text2:'#b8b8b8', border:'#444444', accent:'#0078d4', radius:'8px', shadow:'0 2px 12px rgba(0,0,0,0.5)' },
    grey:      { bg:'#6a6a6a', surface:'#707070', surface2:'#7a7a7a', text:'#ffffff', text2:'#eeeeee', border:'#999999', accent:'#4a9eff', radius:'8px', shadow:'0 2px 12px rgba(0,0,0,0.3)' },
    aurora:    { bg:'#0a0e1a', surface:'#0d1220', surface2:'#111830', text:'#e8f4f8', text2:'#9cbdd8', border:'#1e2d45', accent:'#00d4aa', radius:'8px', shadow:'0 2px 12px rgba(0,0,0,0.6)' },
    tokyo:     { bg:'#1a1b2e', surface:'#1f2040', surface2:'#16213e', text:'#eef2ff', text2:'#b8c0d8', border:'#2d3561', accent:'#ff2d55', radius:'8px', shadow:'0 2px 12px rgba(0,0,0,0.6)' },
    forest:    { bg:'#0d1f0e', surface:'#0f2210', surface2:'#1a321b', text:'#d4edda', text2:'#96c89e', border:'#1e3d20', accent:'#34c759', radius:'8px', shadow:'0 2px 12px rgba(0,0,0,0.6)' },
    space:     { bg:'#020408', surface:'#03060e', surface2:'#080d1a', text:'#c8d8f0', text2:'#8899bb', border:'#0e1728', accent:'#7c83fd', radius:'8px', shadow:'0 2px 12px rgba(0,0,0,0.7)' },
    sunset:    { bg:'#1a0a0a', surface:'#1e0c0c', surface2:'#2e1515', text:'#fde8d8', text2:'#d4a080', border:'#3d1e1e', accent:'#ff6b35', radius:'8px', shadow:'0 2px 12px rgba(0,0,0,0.6)' },
    arctic:    { bg:'#e8f4fd', surface:'#f0f8ff', surface2:'#d0e8f8', text:'#0a2038', text2:'#2a5070', border:'#90b8d8', accent:'#0096d6', radius:'8px', shadow:'0 2px 12px rgba(0,0,0,0.1)' },
    synth:     { bg:'#0d0015', surface:'#100018', surface2:'#1e0030', text:'#f0e0ff', text2:'#c090e0', border:'#2d0050', accent:'#e040fb', radius:'8px', shadow:'0 2px 12px rgba(0,0,0,0.7)' },
    desert:    { bg:'#1a0f05', surface:'#1e1208', surface2:'#2e1c0a', text:'#f5e6d0', text2:'#d4a878', border:'#3d2510', accent:'#e8913a', radius:'8px', shadow:'0 2px 12px rgba(0,0,0,0.5)' },
    ocean:     { bg:'#020d1a', surface:'#03101e', surface2:'#081e30', text:'#d0eaf8', text2:'#78b8d8', border:'#0e2840', accent:'#00b4d8', radius:'8px', shadow:'0 2px 12px rgba(0,0,0,0.6)' },
    jungle:    { bg:'#050f08', surface:'#060f09', surface2:'#0c1c14', text:'#d4f0da', text2:'#78bb88', border:'#102818', accent:'#2dc653', radius:'8px', shadow:'0 2px 12px rgba(0,0,0,0.6)' },
    blizzard:  { bg:'#0a1520', surface:'#0c1825', surface2:'#162840', text:'#e8f4ff', text2:'#9ec4e0', border:'#1e3048', accent:'#90c8f0', radius:'8px', shadow:'0 2px 12px rgba(0,0,0,0.5)' },
    matrix:    { bg:'#000000', surface:'#001000', surface2:'#002000', text:'#00ff41', text2:'#00c030', border:'#003300', accent:'#00ff41', radius:'4px',  shadow:'0 2px 12px rgba(0,255,65,0.2)' },
    cyberpunk: { bg:'#0a0010', surface:'#0d0018', surface2:'#1a0030', text:'#f0e0ff', text2:'#c080e0', border:'#280040', accent:'#f637ec', radius:'4px',  shadow:'0 2px 12px rgba(246,55,236,0.2)' },
    retro:     { bg:'#000000', surface:'#050f05', surface2:'#0f1f0f', text:'#33ff33', text2:'#22cc22', border:'#0f2a0f', accent:'#33ff33', radius:'2px',  shadow:'0 0 8px rgba(51,255,51,0.3)' },
    coffee:    { bg:'#120a02', surface:'#160c04', surface2:'#28160a', text:'#f5e6d0', text2:'#c09060', border:'#352010', accent:'#c9813a', radius:'8px', shadow:'0 2px 12px rgba(0,0,0,0.5)' },
    autumn:    { bg:'#120802', surface:'#160a03', surface2:'#261508', text:'#fde8d0', text2:'#d49060', border:'#381808', accent:'#e2693a', radius:'8px', shadow:'0 2px 12px rgba(0,0,0,0.5)' },
    candle:    { bg:'#0f0800', surface:'#130a01', surface2:'#201405', text:'#fdecd0', text2:'#d0a870', border:'#301a05', accent:'#f5a623', radius:'8px', shadow:'0 2px 12px rgba(0,0,0,0.6)' },
  };

  var _theme  = localStorage.getItem('serverplex_theme')  || 'black';
  var _accent = localStorage.getItem('serverplex_accent') || '#0078d4';

  // ── Apply theme ───────────────────────────
  function applyTheme(themeId) {
    _theme = themeId;
    var savedAcc = localStorage.getItem('serverplex_accent');
    if (savedAcc) _accent = savedAcc;
    var t = Object.assign({}, THEMES[themeId] || THEMES['black'], { accent: _accent });

    var existing = document.getElementById('_appThemeStyle');
    if (existing) existing.remove();

    var style = document.createElement('style');
    style.id = '_appThemeStyle';
    style.textContent =
      // ── CSS variables ──
      ':root{' +
        '--app-bg:'       + t.bg       + ';' +
        '--app-surface:'  + t.surface  + ';' +
        '--app-surface2:' + t.surface2 + ';' +
        '--app-text:'     + t.text     + ';' +
        '--app-text2:'    + t.text2    + ';' +
        '--app-border:'   + t.border   + ';' +
        '--app-accent:'   + t.accent   + ';' +
        '--app-radius:'   + t.radius   + ';' +
        '--app-shadow:'   + t.shadow   + ';' +
        '--app-font:"Oxanium",sans-serif;' +
      '}' +

      // ── Base body ──
      'body{' +
        'background:var(--app-bg);' +
        'color:var(--app-text);' +
        'font-family:var(--app-font);' +
        'font-size:13px;' +
        'line-height:1.5;' +
        '-webkit-font-smoothing:antialiased;' +
        '-moz-osx-font-smoothing:grayscale;' +
        'transition:background .35s,color .35s;' +
      '}' +

      // ── Scrollbar ──
      '::-webkit-scrollbar{width:6px;height:6px}' +
      '::-webkit-scrollbar-track{background:var(--app-bg)}' +
      '::-webkit-scrollbar-thumb{background:var(--app-border);border-radius:3px}' +
      '::-webkit-scrollbar-thumb:hover{background:var(--app-text2)}' +

      // ── Inputs ──
      'input:not([type=range]):not([type=checkbox]):not([type=radio]):not([type=file]),' +
      'textarea,select{' +
        'background:var(--app-surface2);' +
        'color:var(--app-text);' +
        'border:1px solid var(--app-border);' +
        'border-radius:var(--app-radius);' +
        'font-family:var(--app-font);' +
        'font-size:13px;' +
        'padding:7px 10px;' +
        'outline:none;' +
        'transition:border-color .15s,box-shadow .15s;' +
      '}' +
      'input:not([type=range]):not([type=checkbox]):not([type=radio]):focus,' +
      'textarea:focus,select:focus{' +
        'border-color:var(--app-accent);' +
        'box-shadow:0 0 0 3px color-mix(in srgb,var(--app-accent) 20%,transparent);' +
      '}' +
      'input::placeholder,textarea::placeholder{color:var(--app-text2);opacity:.8}' +

      // ── Range slider ──
      'input[type=range]{' +
        '-webkit-appearance:none;appearance:none;height:4px;' +
        'background:var(--app-border);border-radius:2px;outline:none;cursor:pointer;' +
      '}' +
      'input[type=range]::-webkit-slider-thumb{' +
        '-webkit-appearance:none;appearance:none;width:14px;height:14px;border-radius:50%;' +
        'background:var(--app-accent);cursor:pointer;' +
      '}' +

      // ── Checkbox / radio ──
      'input[type=checkbox],input[type=radio]{accent-color:var(--app-accent)}' +

      // ── Buttons ──
      'button{' +
        'font-family:var(--app-font);' +
        'font-size:12px;' +
        'font-weight:700;' +
        'border-radius:var(--app-radius);' +
        'border:none;' +
        'cursor:pointer;' +
        'transition:opacity .15s,transform .15s,background .15s;' +
      '}' +
      'button:hover{opacity:.88}' +
      'button:active{transform:scale(.97)}'
      ':focus-visible{outline:2px solid var(--app-accent);outline-offset:2px;}' + +

      // ── Utility classes every app can use ──
      // Selection
      '::selection{background:color-mix(in srgb,var(--app-accent) 35%,transparent);color:var(--app-text)}' +
      // Cards
      '.at-card{background:var(--app-surface);border:1px solid var(--app-border);border-radius:var(--app-radius);overflow:hidden}' +
      '.at-card-row{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid var(--app-border);gap:12px}' +
      '.at-card-row:last-child{border-bottom:none}' +
      // Buttons
      '.at-btn{padding:8px 16px;background:var(--app-surface2);color:var(--app-text);border:1px solid var(--app-border)}' +
      '.at-btn-primary{background:var(--app-accent);color:#fff;border:none}' +
      '.at-btn-danger{background:rgba(255,59,48,.1);color:#ff3b30;border:1px solid rgba(255,59,48,.3)}' +
      // Labels
      '.at-label{font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:var(--app-text);opacity:.65}' +
      '.at-muted{color:var(--app-text);opacity:.6;font-size:12px}' +
      // Toggle switch
      '.at-toggle{position:relative;width:40px;height:22px;flex-shrink:0;cursor:pointer}' +
      '.at-toggle input{opacity:0;width:0;height:0}' +
      '.at-toggle-track{position:absolute;inset:0;border-radius:11px;background:var(--app-border);transition:background .2s}' +
      '.at-toggle input:checked+.at-toggle-track{background:var(--app-accent)}' +
      '.at-toggle-thumb{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left .2s;box-shadow:0 1px 4px rgba(0,0,0,.2)}' +
      '.at-toggle input:checked~.at-toggle-thumb{left:21px}' +
      // Badge
      '.at-badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:700;background:var(--app-surface2);color:var(--app-text);opacity:.8;border:1px solid var(--app-border)}' +
      '.at-badge-accent{background:color-mix(in srgb,var(--app-accent) 15%,transparent);color:var(--app-accent);border-color:color-mix(in srgb,var(--app-accent) 30%,transparent)}' +
      // Empty state
      '.at-empty{text-align:center;padding:48px 20px;color:var(--app-text);opacity:.55;font-size:13px}' +
      '.at-empty-icon{font-size:40px;margin-bottom:12px;display:block}' +

      // ── Special theme effects ──
      (themeId === 'retro'  ?
        'body::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:9998;' +
        'background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.18) 3px,rgba(0,0,0,0.18) 4px)}' : '') +
      (themeId === 'matrix' ?
        '@keyframes _mf{0%{opacity:.97}50%{opacity:1}100%{opacity:.96}}body{animation:_mf .15s infinite}' : '');

    (document.head || document.documentElement).appendChild(style);
  }

  // ── Boot ──────────────────────────────────
  function boot() { applyTheme(_theme); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // ── Live messages from OS ─────────────────
  window.addEventListener('message', function(e) {
    if (!e.data) return;
    if (e.data.type === 'theme-change'  && e.data.theme)  applyTheme(e.data.theme);
    if (e.data.type === 'accent-change' && e.data.accent) { _accent = e.data.accent; applyTheme(_theme); }
  });

  // ── Public API ────────────────────────────
  window.AppTheme = { applyTheme: applyTheme };

})();