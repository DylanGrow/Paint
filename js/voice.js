document.addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('voiceBox'), panel = document.getElementById('voicePanel');
  const expandBtn = document.getElementById('voiceExpand'), micBtn = document.getElementById('micBtn');
  const status = document.getElementById('micStatus'), offlineTag = document.getElementById('micOffline');
  const msgBox = document.getElementById('voiceMsgs');
  let isExpanded = false, isRecording = false, recognition = null, lang = localStorage.getItem('lang') || 'en';

  expandBtn.addEventListener('click', () => {
    isExpanded = !isExpanded;
    panel.classList.toggle('hidden', !isExpanded);
    expandBtn.classList.toggle('open', isExpanded);
    expandBtn.querySelector('span').textContent = isExpanded ? (lang === 'en' ? 'Voice Assistant' : 'Asistente de Voz') : (lang === 'en' ? 'Tap to open voice assistant' : 'Toca para abrir asistente de voz');
  });

  function initSpeech() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { status.textContent = "Not supported"; micBtn.disabled = true; return; }
    recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang === 'en' ? 'en-US' : 'es-ES';

    recognition.onstart = () => { isRecording = true; micBtn.classList.add('listening'); status.textContent = lang === 'en' ? 'Listening...' : 'Escuchando...'; };
    recognition.onend = () => { isRecording = false; micBtn.classList.remove('listening'); status.textContent = lang === 'en' ? 'Ready' : 'Listo'; };
    recognition.onresult = e => {
      const text = e.results[0][0].transcript;
      addMsg(text, 'user');
      translateText(text);
    };
    recognition.onerror = () => { status.textContent = lang === 'en' ? 'Try again' : 'Intenta otra vez'; isRecording = false; micBtn.classList.remove('listening'); };
  }

  micBtn.addEventListener('click', () => {
    if (!recognition) initSpeech();
    if (isRecording) { recognition.stop(); return; }
    window.speechSynthesis.cancel();
    try { recognition.start(); } catch { status.textContent = "Error starting mic"; }
  });

  async function translateText(text) {
    status.textContent = lang === 'en' ? 'Translating...' : 'Traduciendo...';
    const target = lang === 'en' ? 'es' : 'en';
    const pair = lang === 'en' ? 'en|es' : 'es|en';

    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`);
      const d = await res.json();
      if (d.responseStatus === 200 && d.responseData.translatedText) {
        addMsg(d.responseData.translatedText, 'bot');
        speakText(d.responseData.translatedText, target === 'es' ? 'es-ES' : 'en-US');
        return;
      }
    } catch {}

    try {
      const res = await fetch('https://libretranslate.com/translate', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ q: text, source: lang==='en'?'en':'es', target, format:'text' }) });
      const d = await res.json();
      if (d.translatedText) { addMsg(d.translatedText, 'bot'); speakText(d.translatedText, target==='es'?'es-ES':'en-US'); return; }
    } catch {}

    addMsg(text + (lang === 'en' ? ' [Translation offline]' : ' [Traducción offline]'), 'bot');
  }

  function addMsg(txt, type) {
    const d = document.createElement('div');
    d.className = `msg ${type}`;
    d.textContent = txt;
    msgBox.appendChild(d);
    msgBox.scrollTop = msgBox.scrollHeight;
  }

  function speakText(txt, langCode) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = langCode;
    window.speechSynthesis.speak(u);
  }

  if (!navigator.onLine) offlineTag.classList.remove('hidden');
  window.addEventListener('online', () => offlineTag.classList.add('hidden'));
  window.addEventListener('offline', () => offlineTag.classList.remove('hidden'));

  window.addEventListener('storage', e => {
    if (e.key === 'lang') lang = localStorage.getItem('lang') || 'en';
    if (recognition) recognition.lang = lang === 'en' ? 'en-US' : 'es-ES';
  });
});
