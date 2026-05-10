// ══════════════════════════════════════════════
//  OS-WIDGETS.JS
//  Desktop widgets: clock, stats, weather, sticky.
//  Draggable, persistent via localStorage.
//
//  Depends on globals: (none extra beyond window/document)
// ══════════════════════════════════════════════

var widgets = JSON.parse(localStorage.getItem('serverplex_widgets') || '[]');

function saveWidgets() { localStorage.setItem('serverplex_widgets', JSON.stringify(widgets)); }

function addWidget(type) {
  var w = { id: Date.now(), type, x: 100 + Math.random()*200, y: 80 + Math.random()*100, text:'' };
  widgets.push(w); saveWidgets(); renderWidget(w);
}

function removeWidget(id) {
  widgets = widgets.filter(w => w.id !== id); saveWidgets();
  var el = document.getElementById('widget-' + id); if (el) el.remove();
}

function renderWidget(w) {
  var container = document.getElementById('widgetContainer');
  var div = document.createElement('div');
  div.className = 'desktop-widget'; div.id = 'widget-' + w.id;
  div.style.left = w.x + 'px'; div.style.top = w.y + 'px'; div.style.position = 'absolute';

  if (w.type === 'clock') {
    div.innerHTML = `<div class="widget-clock"><div class="wc-time" id="wt-${w.id}">--:--</div><div class="wc-date" id="wd-${w.id}"></div></div><button class="widget-close" onclick="removeWidget(${w.id})">×</button>`;
    var tick = setInterval(() => {
      var now = new Date(), t = document.getElementById('wt-'+w.id), d = document.getElementById('wd-'+w.id);
      if (!t) { clearInterval(tick); return; }
      t.textContent = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
      d.textContent = now.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
    }, 1000);

  } else if (w.type === 'stats') {
    div.innerHTML = `<div class="widget-stats">
      <div style="font-size:10px;font-weight:800;letter-spacing:2px;opacity:.55;margin-bottom:8px;text-transform:uppercase">System</div>
      <div class="ws-row"><span class="ws-label">CPU</span><span class="ws-val" id="wcpu-${w.id}">--</span></div>
      <div class="ws-bar"><div class="ws-fill" id="wcpub-${w.id}" style="background:#0078d4;width:0%"></div></div>
      <div class="ws-row"><span class="ws-label">RAM</span><span class="ws-val" id="wram-${w.id}">--</span></div>
      <div class="ws-bar"><div class="ws-fill" id="wramb-${w.id}" style="background:#34c759;width:0%"></div></div>
      <div class="ws-row"><span class="ws-label">Disk</span><span class="ws-val" id="wdisk-${w.id}">--</span></div>
      <div class="ws-bar"><div class="ws-fill" id="wdiskb-${w.id}" style="background:#ff9500;width:0%"></div></div>
    </div><button class="widget-close" onclick="removeWidget(${w.id})">×</button>`;
    var cpuVal = 20 + Math.random() * 30;
    var ramVal = 40 + Math.random() * 20;
    var diskVal = 55 + Math.random() * 15;
    var statsInt = setInterval(() => {
      cpuVal = Math.max(5, Math.min(95, cpuVal + (Math.random()-0.5)*15));
      ramVal = Math.max(20, Math.min(90, ramVal + (Math.random()-0.5)*5));
      diskVal = Math.max(40, Math.min(95, diskVal + (Math.random()-0.5)*2));
      var c = document.getElementById('wcpu-'+w.id);
      if (!c) { clearInterval(statsInt); return; }
      c.textContent = Math.round(cpuVal) + '%'; document.getElementById('wcpub-'+w.id).style.width = cpuVal + '%';
      document.getElementById('wram-'+w.id).textContent = Math.round(ramVal) + '%'; document.getElementById('wramb-'+w.id).style.width = ramVal + '%';
      document.getElementById('wdisk-'+w.id).textContent = Math.round(diskVal) + '%'; document.getElementById('wdiskb-'+w.id).style.width = diskVal + '%';
    }, 1200);

  } else if (w.type === 'weather') {
    div.innerHTML = `<div class="widget-weather">
      <div style="font-size:10px;font-weight:800;letter-spacing:2px;opacity:.55;margin-bottom:8px;text-transform:uppercase">Weather</div>
      <div id="wweath-${w.id}" style="font-size:12px;opacity:.7">Fetching location…</div>
      <input id="wcity-${w.id}" placeholder="Or type a city…" style="margin-top:8px;width:100%;padding:5px 8px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:5px;color:#fff;font-family:Oxanium,sans-serif;font-size:11px;outline:none" onkeydown="if(event.key==='Enter')fetchWidgetWeather(${w.id},null)">
    </div><button class="widget-close" onclick="removeWidget(${w.id})">×</button>`;
    if (w.city) fetchWidgetWeather(w.id, w.city);
    else fetchWeatherByLocation(w.id);

  } else if (w.type === 'sticky') {
    div.innerHTML = `<div class="widget-sticky"><textarea placeholder="Widget note…" oninput="updateWidgetText(${w.id},this.value)">${w.text||''}</textarea></div><button class="widget-close" onclick="removeWidget(${w.id})">×</button>`;
  }

  makeDraggableWidget(div, w);
  container.appendChild(div);
}

function updateWidgetText(id, text) { var w = widgets.find(x => x.id === id); if (w) { w.text = text; saveWidgets(); } }

function makeDraggableWidget(el, w) {
  var dragging = false, sx, sy, ix, iy;
  el.addEventListener('mousedown', e => {
    if (e.target.tagName === 'TEXTAREA' || e.target.classList.contains('widget-close') || e.target.tagName === 'INPUT') return;
    dragging = true; sx = e.clientX; sy = e.clientY; ix = el.offsetLeft; iy = el.offsetTop; el.style.zIndex = 999;
  });
  document.addEventListener('mousemove', e => { if (!dragging) return; el.style.left = (ix + e.clientX - sx) + 'px'; el.style.top = (iy + e.clientY - sy) + 'px'; w.x = ix + e.clientX - sx; w.y = iy + e.clientY - sy; });
  document.addEventListener('mouseup', () => { if (dragging) { dragging = false; el.style.zIndex = ''; saveWidgets(); } });
}

// ── Weather via Open-Meteo (no API key required) ──
function fetchWeatherByLocation(wid) {
  if (!navigator.geolocation) { fetchWidgetWeather(wid, null); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    var lat = pos.coords.latitude.toFixed(4), lon = pos.coords.longitude.toFixed(4);
    fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current_weather=true&temperature_unit=celsius')
      .then(r => r.json()).then(d => {
        var el = document.getElementById('wweath-'+wid); if (!el) return;
        var cw = d.current_weather;
        var codes = {0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',61:'🌧️',71:'❄️',80:'🌦️',95:'⛈️'};
        var icon = codes[Math.floor(cw.weathercode/10)*10] || codes[cw.weathercode] || '🌡️';
        el.innerHTML = '<div style="font-size:26px;margin-bottom:2px">'+icon+' '+Math.round(cw.temperature)+'°C</div><div style="font-size:10px;opacity:.6">Wind: '+cw.windspeed+' km/h</div>';
        var w = widgets.find(x => x.id === wid); if (w) { w.lat = lat; w.lon = lon; saveWidgets(); }
        var inp = document.getElementById('wcity-'+wid); if (inp) inp.style.display = 'none';
      }).catch(() => { fetchWidgetWeather(wid, null); });
  }, () => { fetchWidgetWeather(wid, null); });
}

function fetchWidgetWeather(id, city) {
  var cityEl = document.getElementById('wcity-'+id);
  var c = city || (cityEl && cityEl.value.trim());
  var el = document.getElementById('wweath-'+id);
  if (!c) return;
  var w = widgets.find(x => x.id === id); if (w) { w.city = c; saveWidgets(); }
  if (el) el.textContent = 'Loading…';
  fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(c)+'&count=1')
    .then(r => r.json()).then(geo => {
      if (!geo.results || !geo.results.length) { if(el) el.textContent = '❌ City not found'; return; }
      var loc = geo.results[0];
      return fetch('https://api.open-meteo.com/v1/forecast?latitude='+loc.latitude+'&longitude='+loc.longitude+'&current_weather=true').then(r => r.json()).then(d => {
        if (!el) return;
        var cw = d.current_weather;
        var codes = {0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',51:'🌦️',61:'🌧️',71:'❄️',80:'🌦️',95:'⛈️'};
        var icon = codes[Math.floor(cw.weathercode/10)*10] || codes[cw.weathercode] || '🌡️';
        el.innerHTML = '<div style="font-size:24px;margin-bottom:2px">'+icon+' '+Math.round(cw.temperature)+'°C</div><div style="font-size:10px;opacity:.55">'+loc.name+', '+loc.country+'</div>';
        if (cityEl) cityEl.style.display = 'none';
      });
    }).catch(() => { if(el) el.textContent = '⚠️ Weather unavailable'; });
}

function initWidgets() { widgets.forEach(w => renderWidget(w)); }
