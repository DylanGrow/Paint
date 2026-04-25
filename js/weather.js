document.addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('weatherBox');
  const loadEl = box.querySelector('.w-loading');
  const errEl = box.querySelector('.w-error');
  const dataEl = box.querySelector('.w-data');
  const CACHE = 'wttr_cache_v2';
  const CACHE_MS = 2 * 3600000; // 2 hours

  function checkCache() {
    try {
      const c = JSON.parse(localStorage.getItem(CACHE));
      if (c && (Date.now() - c.ts < CACHE_MS)) {
        updateUI(c); return true;
      }
    } catch {}
    return false;
  }

  async function fetchWeather() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    
    try {
      // IP-based location detection (no browser prompts)
      const res = await fetch('https://wttr.in/?format=j1&lang=en', { cache: 'no-store', signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error('Network response not ok');
      const data = await res.json();
      const curr = data.current_condition[0];
      const payload = {
        ts: Date.now(),
        loc: data.nearest_area[0].areaName[0].value || 'North Carolina',
        temp: curr.temp_F, 
        feel: curr.FeelsLikeF,
        desc: curr.weatherDesc[0].value.replace(/\s\(.*?\)/g, ''),
        forecast: data.weather.map(d => ({
          day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
          max: d.maxtempF, min: d.mintempF,
          icon: getIcon(d.hourly[4].weatherCode)
        }))
      };
      localStorage.setItem(CACHE, JSON.stringify(payload));
      updateUI(payload);
    } catch {
      loadEl.classList.add('hidden');
      errEl.classList.remove('hidden');
    } finally {
      clearTimeout(timeout);
    }
  }

  function updateUI(p) {
    loadEl.classList.add('hidden'); errEl.classList.add('hidden'); dataEl.classList.remove('hidden');
    document.getElementById('wLoc').textContent = p.loc; 
    document.getElementById('wTemp').textContent = `${p.temp}°F`;
    document.getElementById('wCond').textContent = p.desc; 
    document.getElementById('wFeel').textContent = `Feels like ${p.feel}°F`;
    document.getElementById('wForecast').innerHTML = p.forecast.map(f => `
      <div class="fc-day"><strong>${f.day}</strong><span style="font-size:1.6rem;display:block;margin:0.2rem 0">${f.icon}</span><div>${Math.round(f.max)}° / ${Math.round(f.min)}°</div></div>
    `).join('');
  }

  function getIcon(c) { 
    const m={'113':'☀️','116':'⛅','119':'☁️','143':'🌫️','176':'🌦️','296':'🌧️','353':'🌧️','386':'⛈️','323':'❄️'}; 
    return m[c]||'🌤️'; 
  }

  if (box && !checkCache()) fetchWeather();
});
