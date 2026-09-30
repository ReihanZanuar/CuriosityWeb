// Web Speech API for voice dictation (STT) and voice speech response (TTS)

export class SpeechEngine {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.initRecognition();
  }

  initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'id-ID'; // Default to Indonesian
    }
  }

  startListening({ onResult, onEnd, onError }) {
    if (!this.recognition) {
      if (onError) onError('Browser tidak mendukung Web Speech Recognition. Coba gunakan Chrome atau Edge.');
      return;
    }

    try {
      this.isListening = true;
      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (onResult) onResult(transcript, event.results[event.results.length - 1].isFinal);
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        if (onError) onError(event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
    } catch (err) {
      this.isListening = false;
      if (onError) onError(err.message);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text, { onStart, onEnd, lang = 'id-ID' } = {}) {
    if (!this.synth) return;
    this.stopSpeaking();

    // Clean markdown symbols for cleaner speech
    const cleanText = text
      .replace(/[#*`_~$$]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/```[\s\S]*?```/g, 'Bagian kode terlampir.')
      .slice(0, 800); // Limit length for snappy response

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = 1.05;
    utterance.pitch = 1.05;

    // Pick Indonesian or natural voice if available
    const voices = this.synth.getVoices();
    const idVoice = voices.find((v) => v.lang.includes('id') || v.lang.includes('ID'));
    if (idVoice) utterance.voice = idVoice;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
    }
  }
}

export const speech = new SpeechEngine();
