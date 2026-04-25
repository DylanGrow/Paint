document.addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('weatherBox');
  const loadEl = box.querySelector('.w-loading');
  const errEl = box.querySelector('.w-error');
  const dataEl = box.querySelector('.w-data');
  const CACHE = 'wttr_cache_v2', CACHE_HOURS = 2;

  function render() {
    const cached = JSON.parse(localStorage.getItem(CACHE));
    if (cached && (Date.now() - cached.ts < CACHE_HOURS * 3600000)) {
      updateUI(cached);
      return true;
    }
    return false;
  }

  async function fetchWeather() {
    try {
      const res = await fetch('https://wttr.in/?format=j1&lang=en', { cache: 'no-store' });
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      const curr = data.current_condition[0];
      const loc = data.nearest_area[0].areaName[0].value || data.nearest_area[0].region[0].value;
      
      const payload = {
        loc: loc,
        temp: curr.temp_F,
        feel: curr.FeelsLikeF,
        desc: curr.weatherDesc[0].value.replace(/\s\(.*?\)/g, ''),
        forecast: data.weather.map(d => ({
          day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
          max: d.maxtempF,
          min: d.mintempF,
          icon: getIcon(d.hourly[4].weatherCode)
        }))
      };
      localStorage.setItem(CACHE, JSON.stringify({ ts: Date.now(), ...payload }));
      updateUI(payload);
    } catch (e) {
      loadEl.classList.add('hidden');
      errEl.classList.remove('hidden');
    }
  }

  function updateUI(p) {
    loadEl.classList.add('hidden'); errEl.classList.add('hidden');
    dataEl.classList.remove('hidden');
    document.getElementById('wLoc').textContent = p.loc || 'North Carolina';
    document.getElementById('wTemp').textContent = `${p.temp}°F`;
    document.getElementById('wCond').textContent = p.desc;
    document.getElementById('wFeel').textContent = `Feels like ${p.feel}°F`;
    document.getElementById('wForecast').innerHTML = p.forecast.map(f => `
      <div class="fc-day"><strong>${f.day}</strong><span style="font-size:1.5rem">${f.icon}</span><div>${Math.round(f.max)}°/${Math.round(f.min)}°</div></div>
    `).join('');
  }

  function getIcon(code) {
    const map = {'113':'☀️','116':'⛅','119':'☁️','143':'🌫️','176':'🌦️','296':'🌧️','353':'🌦️','386':'⛈️','308':'🌧️','323':'❄️'};
    return map[code] || '🌤️';
  }

  if (box) {
    if (!render()) fetchWeather();
  }
});
