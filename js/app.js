document.addEventListener('DOMContentLoaded', () => {
  const i18n = {
    en: { logoSub:"Painting & Construction", heroTitle:"Professional Painting & Deck Services", heroSub:"Quality work. Fair pricing. Trusted locally.", call:"Call Now", text:"Text Me", servicesTitle:"Our Services", s1t:"Interior Painting", s1d:"Clean, durable finishes with premium paint.", s2t:"Exterior Painting", s2d:"Weather-proof protection & curb appeal.", s3t:"Pressure Washing", s3d:"Deep clean driveways, decks & siding.", s4t:"Metal Roof Painting", s4d:"Rust prevention & long-lasting coating.", s5t:"Drywall & Repair", s5d:"Seamless patches & professional finishing.", s6t:"Decking & Flooring", s6d:"Custom builds, staining & laminate floors.", voiceTitle:"Voice Assistant", voiceToggle:"Tap to open voice assistant", voiceIntro:"Tap the mic to speak. I'll detect your language and translate it to the opposite.", micReady:"Ready", micOffline:"Offline mode", phraseTitle:"Quick Phrases", weatherTitle:"Local Weather", wLoad:"Loading...", wErr:"Weather unavailable", galleryTitle:"Recent Projects", g1:"Interior", g2:"Exterior", g3:"Decking", g4:"Washing", g5:"Renovation", g6:"Finished Deck" },
    es: { logoSub:"Pintura y Construcción", heroTitle:"Pintura Profesional y Servicios de Deck", heroSub:"Trabajo de calidad. Precio justo. Confianza local.", call:"Llamar Ahora", text:"Enviar Texto", servicesTitle:"Nuestros Servicios", s1t:"Pintura Interior", s1d:"Acabados duraderos con pintura premium.", s2t:"Pintura Exterior", s2d:"Protección contra el clima y buena imagen.", s3t:"Lavado a Presión", s3d:"Limpieza profunda de entradas, decks y paredes.", s4t:"Pintura de Techos", s4d:"Prevención de óxido y recubrimiento duradero.", s5t:"Drywall y Reparación", s5d:"Parches perfectos y acabado profesional.", s6t:"Decking y Pisos", s6d:"Construcciones a medida, teñido y pisos laminados.", voiceTitle:"Asistente de Voz", voiceToggle:"Toca para abrir asistente de voz", voiceIntro:"Toca el micrófono. Detectaré el idioma y traduciré al opuesto.", micReady:"Listo", micOffline:"Modo sin conexión", phraseTitle:"Frases Rápidas", weatherTitle:"Clima Local", wLoad:"Cargando...", wErr:"Clima no disponible", galleryTitle:"Proyectos Recientes", g1:"Interior", g2:"Exterior", g3:"Decking", g4:"Lavado", g5:"Renovación", g6:"Deck Terminado" }
  };
  
  const phrases = [
    {en:"What day is today?",es:"¿Qué día es hoy?"},{en:"How much does it cost?",es:"¿Cuánto cuesta?"},{en:"How are you today?",es:"¿Cómo estás hoy?"},{en:"Thank you, great job!",es:"¡Gracias, excelente trabajo!"},{en:"See you tomorrow",es:"Nos vemos mañana"},{en:"What time can you start?",es:"¿A qué hora puedes empezar?"},{en:"Do you need materials?",es:"¿Necesitas materiales?"},{en:"Perfect, let's begin",es:"Perfecto, comencemos"},{en:"How long will it take?",es:"¿Cuánto tiempo tomará?"},{en:"Can I get you anything?",es:"¿Puedo traerte algo?"}
  ];

  const heroImages = [
    'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1920&h=1080&fit=crop&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&h=1080&fit=crop&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&h=1080&fit=crop&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&h=1080&fit=crop&q=80'
  ];

  let lang = localStorage.getItem('lang') || 'en';
  const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);

  function setLang(l) {
    lang = l; localStorage.setItem('lang', l);
    document.documentElement.lang = l === 'en' ? 'en' : 'es';
    $$('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n;
      if (i18n[l][k]) el.textContent = i18n[l][k];
    });
    $('.lang-btn .flag.active')?.classList.remove('active');
    $(`.lang-btn .flag.${l === 'en' ? 'us' : 'es'}`).classList.add('active');
    renderPhrases();
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: l } }));
  }

  function renderPhrases() {
    const grid = $('#phraseGrid');
    grid.innerHTML = '';
    phrases.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'phrase-btn';
      btn.setAttribute('data-en', p.en);
      btn.setAttribute('data-es', p.es);
      btn.innerHTML = `<span class="p-en">${lang === 'en' ? p.en : p.es}</span><span class="p-es">${lang === 'es' ? p.en : p.es}</span>`;
      grid.appendChild(btn);
    });
  }

  // Event delegation (mobile reliable)
  $('#phraseGrid').addEventListener('click', e => {
    const btn = e.target.closest('.phrase-btn');
    if (!btn) return;
    const txt = lang === 'en' ? btn.dataset.en : btn.dataset.es;
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = lang === 'en' ? 'en-US' : 'es-ES';
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  });

  $('#langToggle').addEventListener('click', () => setLang(lang === 'en' ? 'es' : 'en'));
  document.getElementById('yr').textContent = new Date().getFullYear();

  // Hero Carousel
  const bg = $('#heroBg'), dots = $('#indicators');
  let curr = 0, iv;
  function updateSlide() {
    bg.style.backgroundImage = `url('${heroImages[curr]}')`;
    dots.innerHTML = heroImages.map((_,i) => `<button class="dot ${i===curr?'active':''}" data-slide="${i}" type="button"></button>`).join('');
  }
  dots.addEventListener('click', e => {
    const d = e.target.closest('.dot');
    if (!d) return;
    curr = parseInt(d.dataset.slide);
    clearInterval(iv); iv = setInterval(next, 5000);
    updateSlide();
  });
  const next = () => { curr = (curr+1)%heroImages.length; updateSlide(); };
  updateSlide(); iv = setInterval(next, 5000);

  // iOS Voice Preload
  if ('speechSynthesis' in window) { speechSynthesis.getVoices(); }
  setLang(lang);
});
