// Modern, sinematik ve katmanlı Web Audio API ses motoru
// Atari/8-bit retro sesler yerine Hearthstone & Marvel Snap tarzı tok ve modern efektler

class CardAudioManager {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // 1. Kartı Masaya Sürme / Fırlatma Rüzgarı (Card Whoosh)
  playWhoosh() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pembe/kahverengi tonlu gürültü oluştur (yumuşak hava sesi)
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.4;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(350, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.12);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.24);
      filter.Q.setValueAtTime(2.5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.25);
    } catch {}
  }

  // 2. Kart Çarpışması / Tok ve Sinematik Darbe (Punchy Heavy Impact)
  playClashImpact(isSuperImpact = false) {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Katman A: Derin Sub-Bass Vuruşu (Gövde & Titreşim)
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(isSuperImpact ? 180 : 140, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + (isSuperImpact ? 0.45 : 0.3));

      subGain.gain.setValueAtTime(0.6, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + (isSuperImpact ? 0.45 : 0.3));

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + (isSuperImpact ? 0.45 : 0.3));

      // Katman B: Tok Kıran Vuruş (Noise Transient / Çarpışma Şapırtısı)
      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.04));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.12);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.15);

      // Katman C: Metalik Çınlama (Yüksek Tier Vuruşlarında Parlama)
      if (isSuperImpact) {
        const ringOsc = this.ctx.createOscillator();
        const ringGain = this.ctx.createGain();
        ringOsc.type = 'triangle';
        ringOsc.frequency.setValueAtTime(840, now);
        ringOsc.frequency.exponentialRampToValueAtTime(420, now + 0.25);

        ringGain.gain.setValueAtTime(0.2, now);
        ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        ringOsc.connect(ringGain);
        ringGain.connect(this.ctx.destination);
        ringOsc.start(now);
        ringOsc.stop(now + 0.25);
      }
    } catch {}
  }

  // 3. Kart Çevrilme / Dokunma Sesi (Card Flip / Snap)
  playCardFlip() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  // 4. Zafer Fanfarı (Epik Akor & Kristal Işıltı - Hearthstone Victory Style)
  playVictoryFanfare() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Do - Mi - Sol - Si (C Maj9 zafer arpej akoru)
      const freqs = [261.63, 329.63, 392.00, 523.25, 659.25];

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const delay = idx * 0.07;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.setValueAtTime(0.22 - idx * 0.02, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 1.25);
      });
    } catch {}
  }

  // 5. Mağlubiyet Sesi (Ağır Sinematik Bas Düşüşü - Dark Drone)
  playDefeatTone() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.8);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.8);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.95);
    } catch {}
  }

  // 6. FUT Paket Açılım Patlaması (Pack Opening Explosion & Shimmer)
  playPackOpening() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Bas Gürlemesi
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(90, now);
      subOsc.frequency.linearRampToValueAtTime(220, now + 0.3);
      subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.8);

      subGain.gain.setValueAtTime(0.1, now);
      subGain.gain.linearRampToValueAtTime(0.5, now + 0.3);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 0.9);

      // Kristal Parıltı (Foil Shimmer)
      [880, 1174, 1318, 1760].forEach((f, idx) => {
        const chime = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        const start = now + 0.3 + idx * 0.08;

        chime.type = 'sine';
        chime.frequency.setValueAtTime(f, start);

        chimeGain.gain.setValueAtTime(0.18, start);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

        chime.connect(chimeGain);
        chimeGain.connect(this.ctx.destination);
        chime.start(start);
        chime.stop(start + 0.65);
      });
    } catch {}
  }
}

export const cardAudio = new CardAudioManager();
