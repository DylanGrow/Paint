document.addEventListener('DOMContentLoaded', () => {
  const panel = document.getElementById('voicePanel');
  const expandBtn = document.getElementById('voiceExpand');
  const micBtn = document.getElementById('micBtn');
  const status = document.getElementById('micStatus');
  const offlineTag = document.getElementById('micOffline');
  const msgBox = document.getElementById('voiceMsgs');
  
  let isExpanded = false, isRecording = false, recognition = null, siteLang = localStorage.getItem('lang') || 'en';

  function expandPanel() {
    isExpanded = !isExpanded;
    panel.classList.toggle('hidden', !isExpanded);
    expandBtn.classList.toggle('open', isExpanded);
    expandBtn.querySelector('span').textContent = isExpanded ? (siteLang === 'en' ? 'Voice Assistant' : 'Asistente de Voz') : (siteLang === 'en' ? 'Tap to open voice assistant' : 'Toca para abrir asistente de voz');
    if(isExpanded && recognition) recognition.lang = siteLang === 'en' ? 'en-US' : 'es-ES';
  }

  expandBtn.addEventListener('click', expandPanel);

  // Auto Language Detection (Lightweight Heuristic)
  function detectLang(text) {
    const esRegex = /([áéíóúüñ¿¡]|el\b|la\b|los\b|las\b|un\b|una\b|de\b|en\b|que\b|es\b|por\b|con\b|se\b|su\b|como\b|hoy\b|cuesta\b|estás\b|gracias\b|excelente\b|mañana\b|hora\b|puedes\b|necesitas\b|materiales\b|perfecto\b|comencemos\b|tiempo\b|tomará\b|traer\b|algo\b)/i;
    return esRegex.test(text) ? 'es' : 'en';
  }

  function initSpeech() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { status.textContent = "Voice not supported"; micBtn.disabled = true; return; }
    recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 2;
    recognition.lang = siteLang === 'en' ? 'en-US' : 'es-ES';

    recognition.onstart = () => { isRecording = true; micBtn.classList.add('listening'); status.textContent = 'Listening...'; };
    recognition.onend = () => { isRecording = false; micBtn.classList.remove('listening'); status.textContent = 'Ready'; };
    recognition.onresult = e => {
      const res = e.results[0];
      const text = res[0].transcript;
      const detected = detectLang(text);
      const target = detected === 'en' ? 'es' : 'en';
      addMsg(`${text} [Detected: ${detected.toUpperCase()}]`, 'user');
      translateText(text, target);
    };
    recognition.onerror = ev => { 
      if(ev.error !== 'no-speech') status.textContent = ev.error === 'not-allowed' ? 'Allow mic' : 'Try again'; 
      isRecording = false; micBtn.classList.remove('listening'); 
    };
  }

  micBtn.addEventListener('click', () => {
    if (!recognition) initSpeech();
    if (isRecording) { recognition.stop(); return; }
    speechSynthesis.cancel();
    try { recognition.start(); } catch { status.textContent = "Mic error"; }
  });

  async function translateText(text, targetLang) {
    status.textContent = 'Translating...';
    const pair = `${targetLang === 'en' ? 'es' : 'en'}|${targetLang}`;

    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`);
      const d = await res.json();
      if (d.responseStatus === 200 && d.responseData.translatedText && d.responseData.translatedText !== text) {
        const translated = d.responseData.translatedText;
        addMsg(`${translated} [${targetLang.toUpperCase()}]`, 'bot');
        speakText(translated, targetLang === 'es' ? 'es-ES' : 'en-US');
        return;
      }
    } catch {}
    // Fallback
    addMsg(text + ' [Translation offline]', 'bot');
  }

  function addMsg(txt, type) {
    const d = document.createElement('div');
    d.className = `msg ${type}`;
    d.textContent = txt;
    msgBox.appendChild(d);
    msgBox.scrollTop = msgBox.scrollHeight;
  }

  function speakText(txt, code) {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = code; u.rate = 0.95; u.pitch = 1;
    speechSynthesis.speak(u);
  }

  if (!navigator.onLine) offlineTag.classList.remove('hidden');
  window.addEventListener('online', () => offlineTag.classList.add('hidden'));
  window.addEventListener('offline', () => offlineTag.classList.remove('hidden'));

  document.addEventListener('langchange', e => { siteLang = e.detail.lang; });
});
