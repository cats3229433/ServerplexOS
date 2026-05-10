// ══════════════════════════════════════════════
//  OS-MINIMUSIC.JS
//  Extracted from desktop.html (formerly eclipseos.html)
//
//  Covers:
//    · toggleMiniPlayer — open/close the mini player popup
//    · mpCmd            — send commands to the music player iframe
//    · mpSeek           — seek via progress bar click
//    · window message listener for mp-state broadcasts
//
//  Depends on globals in desktop.html:
//    windows
// ══════════════════════════════════════════════

function toggleMiniPlayer() {
  var mp = document.getElementById('miniPlayer');
  mp.classList.toggle('open');
  document.querySelectorAll('.tray-popup').forEach(p => p.classList.remove('active'));
  document.getElementById('qsPanel').classList.remove('open');
  document.getElementById('calPopup').classList.remove('open');
}

function mpCmd(cmd, pct) {
  var win = windows['musicplayer'];
  if (win && win.element) {
    var iframe = win.element.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'mp-cmd', cmd: cmd, pct: pct }, '*');
    }
  }
}

function mpSeek(e) {
  var rect = e.currentTarget.getBoundingClientRect();
  mpCmd('seek', (e.clientX - rect.left) / rect.width);
}

window.addEventListener('message', function(e) {
  if (!e.data || e.data.type !== 'mp-state') return;
  var s = e.data;
  var trayIcon = document.getElementById('musicTrayIcon');
  if (s.hasTrack) trayIcon.classList.add('active');
  document.getElementById('mpTitle').textContent   = s.title || 'Nothing playing';
  document.getElementById('mpSub').textContent     = s.playing ? '▶ Now Playing' : '⏸ Paused';
  document.getElementById('mpFill').style.width    = (s.progress || 0) + '%';
  document.getElementById('mpPlayBtn').textContent = s.playing ? '⏸' : '▶';
  document.getElementById('mpArt').classList.toggle('spinning', !!s.playing);
  trayIcon.style.color = s.playing ? 'var(--accent)' : '';
});
