// ══════════════════════════════════════════════
//  OS-WIDGETS.JS
//  Desktop widgets: clock, stats, weather, sticky.
//  Draggable, persistent via localStorage.
//
//  Depends on globals: (none extra beyond window/document)
// ══════════════════════════════════════════════

var widgets = [];
try {
  var savedWidgets = JSON.parse(localStorage.getItem('serverplex_widgets') || '[]');
  if (Array.isArray(savedWidgets)) widgets = savedWidgets;
} catch (e) {
  console.warn('Could not load desktop widgets:', e);
}

function saveWidgets() { localStorage.setItem('serverplex_widgets', JSON.stringify(widgets)); }

function addWidget(type) {
  var w = { id: Date.now(), type, x: 100 + Math.random()*200, y: 80 + Math.random()*100, text:'', classes:[] };
  if (type === 'weather' || type === 'forecast') w.unit = /^en-US/i.test(navigator.language || '') ? 'fahrenheit' : 'celsius';
  widgets.push(w); renderWidget(w); saveWidgets();
}

function removeWidget(id) {
  widgets = widgets.filter(w => w.id !== id); saveWidgets();
  var el = document.getElementById('widget-' + id); if (el) el.remove();
}

function renderWidget(w) {
  var container = document.getElementById('widgetContainer');
  if (!container) return;
  var div = document.createElement('div');
  div.className = 'desktop-widget'; div.id = 'widget-' + w.id;
  div.style.left = w.x + 'px'; div.style.top = w.y + 'px'; div.style.position = 'absolute';

  if (w.type === 'clock') {
    div.innerHTML = `<div class="widget-clock"><div class="wc-time" id="wt-${w.id}">--:--</div><div class="wc-date" id="wd-${w.id}"></div></div><button class="widget-close" onclick="removeWidget(${w.id})">×</button>`;
    var tick = setInterval(() => {
      var now = new Date(), t = document.getElementById('wt-'+w.id), d = document.getElementById('wd-'+w.id);
      if (!t) { clearInterval(tick); return; }
      t.textContent = now.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});
      d.textContent = now.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
    }, 1000);

  } else if (w.type === 'stats') {
    div.innerHTML = `<div class="widget-stats">
      <div style="font-size:10px;font-weight:800;letter-spacing:2px;opacity:.55;margin-bottom:8px;text-transform:uppercase">Device</div>
      <div class="ws-row"><span class="ws-label">CPU cores</span><span class="ws-val" id="wcpu-${w.id}">Checking…</span></div>
      <div class="ws-bar"><div class="ws-fill" id="wcpub-${w.id}" style="background:#0078d4;width:0%"></div></div>
      <div class="ws-row"><span class="ws-label">Memory estimate</span><span class="ws-val" id="wram-${w.id}">Checking…</span></div>
      <div class="ws-bar"><div class="ws-fill" id="wramb-${w.id}" style="background:#34c759;width:0%"></div></div>
      <div class="ws-row"><span class="ws-label">Browser data</span><span class="ws-val" id="wdisk-${w.id}">Checking…</span></div>
      <div class="ws-bar"><div class="ws-fill" id="wdiskb-${w.id}" style="background:#ff9500;width:0%"></div></div>
    </div><button class="widget-close" onclick="removeWidget(${w.id})">×</button>`;

  } else if (w.type === 'weather' || w.type === 'forecast') {
    var forecastWidget = w.type === 'forecast';
    div.innerHTML = `<div class="widget-${forecastWidget ? 'forecast' : 'weather'}">
      <div class="widget-card-heading">
        <span>${forecastWidget ? '5-Day Forecast' : 'Weather'}</span>
        <span>
          <button type="button" title="Toggle temperature units" onclick="toggleWidgetWeatherUnit(${w.id})">${w.unit === 'celsius' ? '°C' : '°F'}</button>
          <button type="button" title="Refresh weather" onclick="refreshWidgetWeather(${w.id})">↻</button>
        </span>
      </div>
      <div id="wweath-${w.id}" aria-live="polite">${w.city || w.lat != null ? 'Loading weather…' : 'Enter a city or choose your location.'}</div>
      <form class="widget-weather-entry" onsubmit="fetchWidgetWeather(${w.id});return false">
        <input id="wcity-${w.id}" name="city" type="text" maxlength="80" placeholder="City, region" autocomplete="off" aria-label="Weather city">
        <button type="submit">Set</button>
      </form>
      <button type="button" class="widget-use-location" onclick="requestWidgetLocation(${w.id})">Use my location</button>
      <div class="widget-attribution">Weather by <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a></div>
    </div><button class="widget-close" title="Remove widget" aria-label="Remove widget" onclick="removeWidget(${w.id})">×</button>`;
    var cityInput = div.querySelector('#wcity-' + w.id);
    if (cityInput) cityInput.value = w.city || '';

  } else if (w.type === 'schedule') {
    div.innerHTML = `<div class="widget-schedule">
      <div class="widget-card-heading"><span>Class Schedule</span></div>
      <div class="widget-schedule-next" id="ws-next-${w.id}" aria-live="polite"></div>
      <div class="widget-schedule-list" id="ws-list-${w.id}"></div>
      <form class="widget-schedule-form" id="ws-form-${w.id}" onsubmit="addScheduleEntry(${w.id},event)">
        <input name="title" type="text" maxlength="60" required placeholder="Class name" aria-label="Class name">
        <select name="day" aria-label="Class day">
          <option value="1">Monday</option><option value="2">Tuesday</option><option value="3">Wednesday</option>
          <option value="4">Thursday</option><option value="5">Friday</option><option value="6">Saturday</option><option value="0">Sunday</option>
        </select>
        <input name="time" type="time" required aria-label="Class time">
        <input name="location" type="text" maxlength="40" placeholder="Room (optional)" aria-label="Room (optional)">
        <button type="submit">Add class</button>
      </form>
    </div><button class="widget-close" title="Remove widget" aria-label="Remove widget" onclick="removeWidget(${w.id})">×</button>`;

  } else if (w.type === 'sticky') {
    div.innerHTML = `<div class="widget-sticky"><textarea placeholder="Widget note…" oninput="updateWidgetText(${w.id},this.value)"></textarea></div><button class="widget-close" title="Remove widget" aria-label="Remove widget" onclick="removeWidget(${w.id})">×</button>`;
    var stickyInput = div.querySelector('textarea');
    if (stickyInput) stickyInput.value = w.text || '';
  }

  makeDraggableWidget(div, w);
  container.appendChild(div);
  constrainWidget(w, div);
  if (w.type === 'stats') renderWidgetDeviceStats(w.id);
  if ((w.type === 'weather' || w.type === 'forecast') && (w.city || (w.lat != null && w.lon != null)))
    fetchWidgetWeather(w.id);
  if (w.type === 'schedule') {
    renderScheduleList(w);
    var scheduleTimer = setInterval(function() {
      if (!document.getElementById('widget-' + w.id)) clearInterval(scheduleTimer);
      else renderScheduleList(w);
    }, 60000);
  }
}

function updateWidgetText(id, text) { var w = widgets.find(x => x.id === id); if (w) { w.text = text; saveWidgets(); } }

function makeDraggableWidget(el, w) {
  var dragging = false, sx, sy, ix, iy;
  el.addEventListener('mousedown', e => {
    if (e.button !== 0 || e.target.closest('button,input,textarea,select,a')) return;
    dragging = true; sx = e.clientX; sy = e.clientY; ix = el.offsetLeft; iy = el.offsetTop; el.style.zIndex = 999;
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    constrainWidget(w, el, ix + e.clientX - sx, iy + e.clientY - sy);
  });
  document.addEventListener('mouseup', () => {
    if (dragging) { dragging = false; el.style.zIndex = ''; saveWidgets(); }
  });
}

function constrainWidget(w, el, requestedX, requestedY) {
  var desktop = document.getElementById('desktop');
  var width = Math.max(1, desktop ? desktop.clientWidth : window.innerWidth);
  var height = Math.max(1, desktop ? desktop.clientHeight : window.innerHeight - 48);
  var maxWidth = Math.max(1, width - 16);
  var baseMin = w.type === 'clock' ? 140 : w.type === 'stats' || w.type === 'sticky' ? 160 : 190;
  el.style.maxWidth = maxWidth + 'px';
  el.style.maxHeight = height + 'px';
  el.style.overflowY = 'auto';
  el.style.minWidth = Math.min(baseMin, maxWidth) + 'px';
  var x = requestedX == null ? Number(w.x) || 0 : requestedX;
  var y = requestedY == null ? Number(w.y) || 0 : requestedY;
  var maxX = Math.max(0, width - el.offsetWidth);
  var maxY = Math.max(0, height - el.offsetHeight);
  w.x = Math.max(0, Math.min(x, maxX));
  w.y = Math.max(0, Math.min(y, maxY));
  el.style.left = w.x + 'px';
  el.style.top = w.y + 'px';
}

function constrainWidgetsToDesktop() {
  widgets.forEach(function(w) {
    var el = document.getElementById('widget-' + w.id);
    if (el) constrainWidget(w, el);
  });
  saveWidgets();
}

function escapeWidgetHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function(char) {
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char];
  });
}

function getWeatherCode(code) {
  var descriptions = {
    0:['☀️','Clear'],1:['🌤️','Mostly clear'],2:['⛅','Partly cloudy'],3:['☁️','Cloudy'],
    45:['🌫️','Fog'],48:['🌫️','Freezing fog'],51:['🌦️','Light drizzle'],53:['🌦️','Drizzle'],55:['🌧️','Heavy drizzle'],
    56:['🌧️','Freezing drizzle'],57:['🌧️','Freezing drizzle'],61:['🌧️','Light rain'],63:['🌧️','Rain'],65:['🌧️','Heavy rain'],
    66:['🌧️','Freezing rain'],67:['🌧️','Heavy freezing rain'],71:['❄️','Light snow'],73:['❄️','Snow'],75:['❄️','Heavy snow'],
    77:['❄️','Snow grains'],80:['🌦️','Rain showers'],81:['🌧️','Showers'],82:['🌧️','Heavy showers'],
    85:['🌨️','Snow showers'],86:['🌨️','Heavy snow showers'],95:['⛈️','Thunderstorm'],96:['⛈️','Thunderstorm with hail'],99:['⛈️','Severe thunderstorm']
  };
  return descriptions[Number(code)] || ['🌡️','Conditions unavailable'];
}

function fetchWeatherJson(url) {
  var controller = new AbortController();
  var timeout = setTimeout(function(){ controller.abort(); }, 12000);
  return fetch(url, { signal: controller.signal })
    .then(function(response) {
      if (!response.ok) throw new Error('Weather service returned ' + response.status);
      return response.json();
    })
    .then(function(data) {
      if (data && data.error) throw new Error(data.reason || 'Weather data unavailable');
      return data;
    })
    .finally(function(){ clearTimeout(timeout); });
}

function getWidgetWeatherUnit(w) {
  if (!w.unit) w.unit = /^en-US/i.test(navigator.language || '') ? 'fahrenheit' : 'celsius';
  return w.unit;
}

function toggleWidgetWeatherUnit(id) {
  var w = widgets.find(function(item){ return item.id === id; });
  if (!w) return;
  w.unit = getWidgetWeatherUnit(w) === 'fahrenheit' ? 'celsius' : 'fahrenheit';
  var widgetEl = document.getElementById('widget-' + id);
  var buttons = widgetEl ? widgetEl.querySelectorAll('.widget-card-heading button') : [];
  if (buttons[0]) buttons[0].textContent = w.unit === 'celsius' ? '°C' : '°F';
  saveWidgets();
  refreshWidgetWeather(id);
}

function refreshWidgetWeather(id) { fetchWidgetWeather(id); }

function showWidgetWeatherMessage(id, message) {
  var target = document.getElementById('wweath-' + id);
  if (target) target.textContent = message;
}

function fetchWidgetWeather(id) {
  var w = widgets.find(function(item){ return item.id === id; });
  var cityInput = document.getElementById('wcity-' + id);
  var target = document.getElementById('wweath-' + id);
  if (!w || !target) return;
  var city = cityInput && cityInput.value.trim();
  if (!city && w.city) city = w.city;
  if (city) {
    w.city = city;
    w.locationName = '';
    saveWidgets();
    showWidgetWeatherMessage(id, 'Looking up ' + city + '…');
    var geoUrl = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(city) + '&count=1&language=en&format=json';
    fetchWeatherJson(geoUrl).then(function(geo) {
      if (!geo.results || !geo.results.length) throw new Error('No matching city found. Try city and state.');
      var location = geo.results[0];
      w.lat = Number(location.latitude);
      w.lon = Number(location.longitude);
      w.locationName = [location.name, location.admin1, location.country].filter(Boolean).join(', ');
      saveWidgets();
      fetchWidgetWeatherAt(id, w.lat, w.lon, w.locationName);
    }).catch(function(error) {
      showWidgetWeatherMessage(id, error.name === 'AbortError' ? 'Weather request timed out. Try again.' : error.message || 'Weather is unavailable. Try again.');
    });
    return;
  }
  if (w.lat != null && w.lon != null) {
    fetchWidgetWeatherAt(id, Number(w.lat), Number(w.lon), w.locationName || 'Your location');
    return;
  }
  showWidgetWeatherMessage(id, 'Enter a city or choose your location.');
}

function fetchWidgetWeatherAt(id, latitude, longitude, place) {
  var w = widgets.find(function(item){ return item.id === id; });
  if (!w) return;
  var unit = getWidgetWeatherUnit(w);
  var params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: '5',
    timezone: 'auto',
    temperature_unit: unit,
    wind_speed_unit: unit === 'fahrenheit' ? 'mph' : 'kmh'
  });
  showWidgetWeatherMessage(id, 'Loading weather…');
  fetchWeatherJson('https://api.open-meteo.com/v1/forecast?' + params.toString())
    .then(function(data) {
      var current = data.current, daily = data.daily;
      if (!current || !daily || !Array.isArray(daily.time)) throw new Error('Weather data is incomplete.');
      var unitSymbol = unit === 'fahrenheit' ? 'F' : 'C';
      var windSymbol = unit === 'fahrenheit' ? 'mph' : 'km/h';
      var target = document.getElementById('wweath-' + id);
      if (!target) return;
      w.lat = latitude;
      w.lon = longitude;
      w.locationName = place || 'Your location';
      saveWidgets();
      if (w.type === 'forecast') {
        target.innerHTML = '<div class="widget-forecast-list">' + daily.time.slice(0, 5).map(function(date, index) {
          var dayLabel = new Date(date + 'T12:00:00').toLocaleDateString(undefined,{weekday:'short'});
          var weather = getWeatherCode(daily.weather_code[index]);
          var low = Math.round(daily.temperature_2m_min[index]);
          var high = Math.round(daily.temperature_2m_max[index]);
          var rain = daily.precipitation_probability_max && daily.precipitation_probability_max[index];
          return '<div class="widget-forecast-day"><span>' + escapeWidgetHtml(dayLabel) + '</span>' +
            '<span aria-label="' + escapeWidgetHtml(weather[1]) + '">' + weather[0] + '</span>' +
            '<span>' + escapeWidgetHtml(weather[1]) + '</span><span>' + low + '° / ' + high + '°' +
            (rain == null ? '' : ' · ' + Math.round(rain) + '%') + '</span></div>';
        }).join('') + '</div>';
        target.setAttribute('aria-label', 'Five-day forecast for ' + w.locationName);
      } else {
        var currentWeather = getWeatherCode(current.weather_code);
        var high = daily.temperature_2m_max && Math.round(daily.temperature_2m_max[0]);
        var low = daily.temperature_2m_min && Math.round(daily.temperature_2m_min[0]);
        target.innerHTML = '<div class="widget-weather-current">' + currentWeather[0] + ' ' +
          Math.round(current.temperature_2m) + '°' + unitSymbol + '</div>' +
          '<div class="widget-weather-summary">' + escapeWidgetHtml(currentWeather[1]) + ' · ' +
          escapeWidgetHtml(w.locationName) + '</div>' +
          '<div class="widget-weather-details"><span>Wind ' + Math.round(current.wind_speed_10m) + ' ' + windSymbol + '</span>' +
          '<span>Humidity ' + Math.round(current.relative_humidity_2m) + '%</span>' +
          (high == null || low == null ? '' : '<span>H ' + high + '° / L ' + low + '°</span>') + '</div>';
      }
    })
    .catch(function(error) {
      showWidgetWeatherMessage(id, error.name === 'AbortError' ? 'Weather request timed out. Try again.' : error.message || 'Weather is unavailable. Try again.');
    });
}

function requestWidgetLocation(id) {
  var w = widgets.find(function(item){ return item.id === id; });
  if (!w) return;
  if (!navigator.geolocation) {
    showWidgetWeatherMessage(id, 'Location is not available here. Enter a city instead.');
    return;
  }
  showWidgetWeatherMessage(id, 'Waiting for location permission…');
  navigator.geolocation.getCurrentPosition(function(position) {
    w.city = '';
    w.locationName = 'Your location';
    w.lat = position.coords.latitude;
    w.lon = position.coords.longitude;
    var cityInput = document.getElementById('wcity-' + id);
    if (cityInput) cityInput.value = '';
    saveWidgets();
    fetchWidgetWeatherAt(id, w.lat, w.lon, w.locationName);
  }, function() {
    showWidgetWeatherMessage(id, 'Location was not available. Enter a city instead.');
  }, { enableHighAccuracy:false, timeout:12000, maximumAge:600000 });
}

function renderScheduleList(w) {
  var listEl = document.getElementById('ws-list-' + w.id);
  var nextEl = document.getElementById('ws-next-' + w.id);
  if (!listEl || !nextEl) return;
  var dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var entries = Array.isArray(w.classes) ? w.classes.slice() : [];
  var now = new Date();
  var currentMinutes = now.getHours() * 60 + now.getMinutes();
  function dayDistance(entry) {
    var day = Number(entry.day);
    if (!Number.isInteger(day) || day < 0 || day > 6) return 7 * 1440;
    var distance = (day - now.getDay() + 7) % 7;
    var timeParts = String(entry.time || '00:00').split(':');
    var timeMinutes = Number(timeParts[0]) * 60 + Number(timeParts[1]);
    if (distance === 0 && timeMinutes <= currentMinutes) distance = 7;
    return distance * 1440 + timeMinutes;
  }
  entries.sort(function(a,b){ return dayDistance(a) - dayDistance(b); });
  if (!entries.length) {
    nextEl.textContent = 'No classes added yet.';
    listEl.innerHTML = '<div class="widget-schedule-empty">Add your weekly classes below.</div>';
    return;
  }
  var first = entries[0];
  var distance = dayDistance(first);
  var firstDay = Number(first.day);
  var firstTime = String(first.time || '');
  var firstDayLabel = distance < 1440 ? 'Today' : distance < 2880 ? 'Tomorrow' : dayNames[firstDay];
  if (distance >= 7 * 1440) firstDayLabel = 'Next week · ' + dayNames[firstDay];
  nextEl.textContent = 'Next: ' + first.title + ' · ' + firstDayLabel + ' at ' + firstTime;
  listEl.innerHTML = entries.map(function(entry) {
    var day = Number(entry.day);
    var distanceForEntry = dayDistance(entry);
    var label = distanceForEntry < 1440 ? 'Today' : distanceForEntry < 2880 ? 'Tomorrow' : dayNames[day] || 'Day';
    var room = entry.location ? '<small>' + escapeWidgetHtml(entry.location) + '</small>' : '';
    return '<div class="widget-schedule-entry"><span>' + escapeWidgetHtml(label) + '</span>' +
      '<span class="widget-schedule-time">' + escapeWidgetHtml(entry.time) + '</span>' +
      '<span title="' + escapeWidgetHtml(entry.title) + '">' + escapeWidgetHtml(entry.title) + room + '</span>' +
      '<button type="button" class="widget-schedule-remove" data-entry-id="' + escapeWidgetHtml(entry.id) +
      '" aria-label="Remove ' + escapeWidgetHtml(entry.title) + '">×</button></div>';
  }).join('');
  listEl.onclick = function(event) {
    var button = event.target.closest('.widget-schedule-remove[data-entry-id]');
    if (button) removeScheduleEntry(w.id, button.dataset.entryId);
  };
}

function addScheduleEntry(widgetId, event) {
  if (event) event.preventDefault();
  var w = widgets.find(function(item){ return item.id === widgetId; });
  var form = document.getElementById('ws-form-' + widgetId);
  if (!w || !form) return false;
  var title = form.querySelector('[name="title"]').value.trim();
  var time = form.querySelector('[name="time"]').value;
  if (!title || !time) return false;
  if (!Array.isArray(w.classes)) w.classes = [];
  w.classes.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: title,
    day: Number(form.querySelector('[name="day"]').value),
    time: time,
    location: form.querySelector('[name="location"]').value.trim()
  });
  form.reset();
  saveWidgets();
  renderScheduleList(w);
  return false;
}

function removeScheduleEntry(widgetId, entryId) {
  var w = widgets.find(function(item){ return item.id === widgetId; });
  if (!w || !Array.isArray(w.classes)) return;
  w.classes = w.classes.filter(function(entry){ return String(entry.id) !== String(entryId); });
  saveWidgets();
  renderScheduleList(w);
}

function renderWidgetDeviceStats(id) {
  var cores = Number(navigator.hardwareConcurrency) || 0;
  var memory = Number(navigator.deviceMemory) || 0;
  var cpuValue = document.getElementById('wcpu-' + id);
  var memoryValue = document.getElementById('wram-' + id);
  var storageValue = document.getElementById('wdisk-' + id);
  if (cpuValue) {
    cpuValue.textContent = cores ? cores + ' logical cores' : 'Not reported';
    var cpuBar = document.getElementById('wcpub-' + id);
    if (cpuBar) cpuBar.style.width = Math.min(100, cores / 16 * 100) + '%';
  }
  if (memoryValue) {
    memoryValue.textContent = memory ? 'About ' + memory + ' GB' : 'Not reported';
    var memoryBar = document.getElementById('wramb-' + id);
    if (memoryBar) memoryBar.style.width = memory ? Math.min(100, memory / 32 * 100) + '%' : '0%';
  }
  if (!navigator.storage || !navigator.storage.estimate) {
    if (storageValue) storageValue.textContent = 'Not reported';
    return;
  }
  navigator.storage.estimate().then(function(estimate) {
    if (!document.getElementById('wdisk-' + id)) return;
    var usage = Number(estimate.usage) || 0;
    var quota = Number(estimate.quota) || 0;
    var percent = quota ? Math.min(100, usage / quota * 100) : 0;
    storageValue.textContent = quota ? Math.round(percent) + '% used' : 'Not reported';
    var storageBar = document.getElementById('wdiskb-' + id);
    if (storageBar) storageBar.style.width = percent + '%';
  }).catch(function() {
    if (storageValue) storageValue.textContent = 'Not reported';
  });
}

function initWidgets() {
  widgets.forEach(w => renderWidget(w));
  constrainWidgetsToDesktop();
  window.addEventListener('resize', constrainWidgetsToDesktop);
}
