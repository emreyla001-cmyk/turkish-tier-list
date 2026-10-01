// Modern, Katmanlı ve Sinematik Web Audio API Ses Motoru
// Hearthstone, Marvel Snap & Genshin Impact standartlarında tok, dolgun ve zengin harmonikli sesler.

class UltraCardAudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.85; // Master ses seviyesi
        this.masterGain.connect(this.ctx.destination);

        // Kullanıcı herhangi bir yere tıkladığı an AudioContext'i derhal uyandır
        const resumeAudio = () => {
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
          window.removeEventListener('click', resumeAudio);
          window.removeEventListener('touchstart', resumeAudio);
          window.removeEventListener('keydown', resumeAudio);
        };
        window.addEventListener('click', resumeAudio, { once: true });
        window.addEventListener('touchstart', resumeAudio, { once: true });
        window.addEventListener('keydown', resumeAudio, { once: true });
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // 1. PAKET YIRTILMA & FOLYO HIŞIRTISI (Pack Tear / Foil Rip)
  playPackTear() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Katman A: Yırtılma Hışırtısı (Filtered White/Pink Noise)
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(4500, now + 0.15);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.6, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.35);

      // Katman B: Derin Bas Darbesi
      this.playSubBass(60, 180, 0.4, 0.3);
    } catch {}
  }

  // 2. KART FIRLATMA & RÜZGAR EF EKTİ (Heavy Card Whoosh)
  playWhoosh() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.22;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.35;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(250, now);
      filter.frequency.exponentialRampToValueAtTime(1800, now + 0.1);
      filter.frequency.exponentialRampToValueAtTime(180, now + 0.22);
      filter.Q.setValueAtTime(3.0, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.45, now + 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.22);
    } catch {}
  }

  // 3. TOK 3D KART ÇEVRİLME EF EKTİ (Heavy Card Snap / Flip)
  playCardFlip() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      
      // Çıt çıt kütle sesi (Wood/Leather Transient)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.06);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.07);

      // Gövde darbesi
      this.playSubBass(120, 40, 0.25, 0.08);
    } catch {}
  }

  // 4. NADİRLİĞE ÖZEL SİNEMATİK AÇILIŞ SESLERİ (R, SR, SSR, UR)
  playRarityReveal(code = 'R') {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (code === 'UR') {
        // UR: KIZIL ZİRVE WALKOUT — Sub-bass gürlemesi, şimşek çınlaması ve 4-akort zafer darbesi
        this.playSubBass(40, 18, 0.9, 1.2);

        // Sinematik Şimşek Çınlaması (Crimson Lightning Ring)
        [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((f, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const start = now + idx * 0.05;

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, start);
          osc.frequency.exponentialRampToValueAtTime(f * 0.5, start + 0.6);

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(3000, start);

          gain.gain.setValueAtTime(0.25 - idx * 0.03, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain);

          osc.start(start);
          osc.stop(start + 0.85);
        });
      } else if (code === 'SSR') {
        // SSR: ALTIN EFSANEVİ AURA — Maj9 Kristal Arpej
        const freqs = [329.63, 415.30, 493.88, 659.25, 830.61]; // E Maj9
        freqs.forEach((f, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const start = now + idx * 0.06;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, start);

          gain.gain.setValueAtTime(0.3 - idx * 0.04, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.7);

          osc.connect(gain);
          gain.connect(this.masterGain);

          osc.start(start);
          osc.stop(start + 0.75);
        });
        this.playSubBass(90, 35, 0.5, 0.5);
      } else if (code === 'SR') {
        // SR: MOR YÜKSEK NADİRLİK — Enerji Uğultusu
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.45);
      } else {
        // R: SIRADAN AÇILIŞ — Yumuşak Tok Vuruş
        this.playCardFlip();
      }
    } catch {}
  }

  // 5. PAKET AÇILIM PATLAMASI & HOLOGRAFİK SHIMMER (Pack Explosion)
  playPackOpening() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Sub-Bass Gürlemesi
      this.playSubBass(80, 25, 0.8, 0.9);

      // Kristal Parıltı (Foil Shimmer Chime)
      [880, 1174.66, 1396.91, 1760, 2093.00].forEach((f, idx) => {
        const chime = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        const start = now + 0.2 + idx * 0.07;

        chime.type = 'sine';
        chime.frequency.setValueAtTime(f, start);

        chimeGain.gain.setValueAtTime(0.22, start);
        chimeGain.gain.exponentialRampToValueAtTime(0.001, start + 0.65);

        chime.connect(chimeGain);
        chimeGain.connect(this.masterGain);

        chime.start(start);
        chime.stop(start + 0.7);
      });
    } catch {}
  }

  // 6. ZAFER FANFARI (Hearthstone / Marvel Snap Victory Tone)
  playVictoryFanfare() {
    try {
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C Maj Arpej

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const delay = idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.setValueAtTime(0.25 - idx * 0.02, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 1.4);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now + delay);
        osc.stop(now + delay + 1.45);
      });

      this.playSubBass(130, 40, 0.5, 0.6);
    } catch {}
  }

  // Helper: Derin Sub-Bass Vuruş Motoru
  playSubBass(startFreq = 100, endFreq = 30, initialGain = 0.5, duration = 0.4) {
    try {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(startFreq, now);
      subOsc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

      subGain.gain.setValueAtTime(initialGain, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);

      subOsc.start(now);
      subOsc.stop(now + duration + 0.05);
    } catch {}
  }

  // Aliases (Geriye Dönük Uyumluluk)
  playVictory() { this.playVictoryFanfare(); }
  playClash(isSuper = false) { this.playRarityReveal(isSuper ? 'UR' : 'SR'); }
  playDefeat() { this.playSubBass(100, 20, 0.6, 0.8); }
}

export const cardAudio = new UltraCardAudioManager();
