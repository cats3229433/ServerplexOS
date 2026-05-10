// ══════════════════════════════════════════════
//  OS-APPS.JS
//  App registry, per-app titlebar colours, icon helper.
//  Must be loaded FIRST — all other modules depend on
//  APP_COLORS, apps, CUSTOM_ICONS, and getIconHtml().
// ══════════════════════════════════════════════

const APP_COLORS = {
  browser:'#0078d4', notepad:'#ff9500', calculator:'#5856d6', calendar:'#34c759',
  terminal:'#1c1c1e', code:'#007acc', paint:'#ff2d55', todolist:'#ff9500',
  stickynotes:'#ffcc00', imageviewer:'#af52de', clock:'#5ac8fa', recyclebin:'#8e8e93',
  search:'#0078d4', musicplayer:'#fc3158', markdowneditor:'#34c759',
  settings:'#636366', filemanager:'#0078d4', games:'#ff375f',
  voicerecorder:'#ff3b30', screenrecorder:'#ff3b30', appstore:'#0078d4',
};

const apps = {
  browser:        { name:'Browser',         icon:'🌐', file:'os-apps/browser.html',        category:'Internet' },
  notepad:        { name:'Notepad',          icon:'📝', file:'os-apps/notepad.html',         category:'Productivity' },
  calculator:     { name:'Calculator',       icon:'🧮', file:'os-apps/calculator.html',      category:'Utilities', width:360, height:520 },
  calendar:       { name:'Calendar',         icon:'📅', file:'os-apps/calendar.html',        category:'Productivity' },
  terminal:       { name:'Terminal',         icon:'💻', file:'os-apps/terminal.html',        category:'System' },
  code:           { name:'Code Editor',      icon:'👨‍💻', file:'os-apps/code.html',            category:'Development', width:1200, height:700 },
  paint:          { name:'Paint',            icon:'🎨', file:'os-apps/paint.html',           category:'Creative' },
  todolist:       { name:'To-Do List',       icon:'📋', file:'os-apps/todolist.html',        category:'Productivity' },
  stickynotes:    { name:'Sticky Notes',     icon:'📌', file:'os-apps/stickynotes.html',     category:'Productivity' },
  imageviewer:    { name:'Image Viewer',     icon:'🖼️', file:'os-apps/imageviewer.html',     category:'Media' },
  clock:          { name:'Clock',            icon:'⏰', file:'os-apps/clock.html',           category:'Utilities' },
  recyclebin:     { name:'Recycle Bin',      icon:'🗑️', file:'os-apps/recyclebin.html',      category:'System' },
  search:         { name:'Search',           icon:'🔍', file:'os-apps/search.html',          category:'System' },
  musicplayer:    { name:'Music Player',     icon:'🎵', file:'os-apps/musicplayer.html',     category:'Media' },
  markdowneditor: { name:'Markdown Editor',  icon:'📄', file:'os-apps/markdowneditor.html',  category:'Productivity' },
  settings:       { name:'Settings',         icon:'⚙️', file:'settings/settings-main.html', category:'System' },
  filemanager:    { name:'File Manager',     icon:'📁', file:'os-apps/filemanager.html',     category:'System' },
  games:          { name:'Games',            icon:'🎮', file:'os-apps/games.html',           category:'Entertainment' },
  voicerecorder:  { name:'Voice Recorder',   icon:'🎙️', file:'os-apps/voicerecorder.html',  category:'Media' },
  screenrecorder: { name:'Screen Recorder',  icon:'📹', file:'os-apps/screenrecorder.html', category:'Media' },
  appstore:       { name:'App Store',        icon:'🏪', file:'os-apps/appstore.html',        category:'System' },
  mediastream:    { name:'Media',            icon:'🎶', file:'os-apps/mediastream.html',     category:'Media' },
};

// Custom icons map — add image URLs here per app ID e.g. browser:'https://...'
const CUSTOM_ICONS = {};

function getIconHtml(app, size) {
  size = size || 48;
  if (app && app.customIcon) return '<img src="'+app.customIcon+'" width="'+size+'" height="'+size+'" style="object-fit:contain;border-radius:'+Math.round(size*.18)+'px" alt="">';
  return (app && app.icon) ? app.icon : '';
}

// Apply any custom icons from the map
Object.keys(CUSTOM_ICONS).forEach(id => { if (apps[id]) apps[id].customIcon = CUSTOM_ICONS[id]; });
