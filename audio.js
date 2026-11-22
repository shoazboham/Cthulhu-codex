/**
 * Web Audio API Eldritch Soundscape Synthesizer (V5 - Dramatic Scroll-Reactive Hydrophone)
 * 
 * Major Scroll-Reactive Transformations (Instantly Audible):
 * 1. PITCH GLIDE (Doppler Descent): Chord pitches physically bend down by 500 cents (a full 4th) as you scroll down.
 * 2. TRITONE MORPH: The top voice splits into a 600-cent dissonant Devil's Tritone in the deep trench.
 * 3. SUBMERSION FILTER: Surface wind completely cuts out below depth 0.3 (30% down the page).
 * 4. CAVITY RESONANCE: Submerged hydrophone acoustic chamber awakens as you dive past 1,000m.
 * 5. BENTHIC SONAR: Accelerates in frequency and drops into a cavernous echo near R'lyeh.
 */

class EldritchAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.volume = 0.85;
    this.currentDepth = 0; // 0.0 (surface) to 1.0 (abyssal trench)
    this.lastSonarTime = 0;

    // Master nodes
    this.masterGain = null;
    this.compressor = null;

    // Layer 1: Surface Wind & Spray (Cuts off as you submerge)
    this.windNode = null;
    this.windGain = null;
    this.windFilter = null;
    this.windLFO = null;

    // Layer 2: Evolving Chord Pad (D minor -> Dark Diminished Tritone + Pitch Bend)
    this.padOscillators = [];
    this.padFilter = null;
    this.padGain = null;
    this.padLfo = null;
    this.padBaseFreqs = [293.66, 349.23, 440.0, 523.25]; // D4, F4, A4, C5

    // Layer 3: Deep Submerged Hydrophone Cavity Drone (Awakens only at depth!)
    this.hydroOsc = null;
    this.hydroFilter = null;
    this.hydroGain = null;

    // Layer 4: Benthic Sonar & Leviathan Pings
    this.sonarInterval = null;
    this.sonarGain = null;

    this.activeNodes = [];

    // Phonetic dictionary for cultist vocal pronunciation
    this.phoneticMap = {
      "Ph'nglui": { text: "F'n-gloo-ee", pitch: 0.42, rate: 0.70 },
      "mglw'nafh": { text: "Mm-glw-nahf", pitch: 0.38, rate: 0.65 },
      "Cthulhu": { text: "Khlûl-hloo", pitch: 0.35, rate: 0.68 },
      "R'lyeh": { text: "Rrr-lee-yeh", pitch: 0.40, rate: 0.65 },
      "wgah'nagl": { text: "W'gah-nah-gull", pitch: 0.38, rate: 0.70 },
      "fhtagn": { text: "F'h-tahn", pitch: 0.32, rate: 0.60 }
    };
  }

  async init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (err) {
        console.warn('AudioContext awaiting interaction:', err);
      }
    }

    if (!this.masterGain) {
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-12, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(6, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(2.5, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

      this.compressor.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  async start() {
    await this.init();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    if (this.isPlaying) return;
    this.isPlaying = true;

    const t = this.ctx.currentTime;
    this.initWindLayer(t);
    this.initSpectralPad(t);
    this.initHydrophoneCavityLayer(t);
    this.initSonarLayer(t);
    this.applyDepth(this.currentDepth, 0.4);

    // Initial soft confirmation bell
    this.playEldritchToll(261.63);
  }

  initWindLayer(t) {
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = (Math.random() * 2 - 1) * 0.4;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.96 * b1 + white * 0.11;
      b2 = 0.86 * b2 + white * 0.25;
      data[i] = (b0 + b1 + b2);
    }

    this.windNode = this.ctx.createBufferSource();
    this.windNode.buffer = noiseBuffer;
    this.windNode.loop = true;

    const windHighpass = this.ctx.createBiquadFilter();
    windHighpass.type = 'highpass';
    windHighpass.frequency.setValueAtTime(260, t);

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.setValueAtTime(1200, t);
    this.windFilter.Q.setValueAtTime(1.8, t);

    this.windLFO = this.ctx.createOscillator();
    const windLFOGain = this.ctx.createGain();
    this.windLFO.type = 'sine';
    this.windLFO.frequency.setValueAtTime(0.18, t);
    windLFOGain.gain.setValueAtTime(320, t);
    this.windLFO.connect(windLFOGain);
    windLFOGain.connect(this.windFilter.frequency);
    this.windLFO.start(t);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.001, t);
    this.windGain.gain.linearRampToValueAtTime(0.26, t + 1);

    this.windNode.connect(windHighpass);
    windHighpass.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.compressor);

    this.windNode.start(t);
    this.activeNodes.push(this.windNode, this.windLFO, windHighpass, this.windFilter, this.windGain);
  }

  initSpectralPad(t) {
    this.padOscillators = [];
    const padMixer = this.ctx.createGain();
    padMixer.gain.setValueAtTime(0.2, t);

    const padHighpass = this.ctx.createBiquadFilter();
    padHighpass.type = 'highpass';
    padHighpass.frequency.setValueAtTime(180, t);

    this.padFilter = this.ctx.createBiquadFilter();
    this.padFilter.type = 'lowpass';
    this.padFilter.frequency.setValueAtTime(1600, t);
    this.padFilter.Q.setValueAtTime(2.5, t);

    this.padLfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    this.padLfo.type = 'sine';
    this.padLfo.frequency.setValueAtTime(0.2, t);
    lfoGain.gain.setValueAtTime(2.8, t);
    this.padLfo.connect(lfoGain);

    this.padBaseFreqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      lfoGain.connect(osc.frequency);
      osc.connect(padMixer);
      osc.start(t);
      this.padOscillators.push(osc);
      this.activeNodes.push(osc);
    });

    this.padLfo.start(t);
    this.activeNodes.push(this.padLfo);

    this.padGain = this.ctx.createGain();
    this.padGain.gain.setValueAtTime(0.001, t);
    this.padGain.gain.linearRampToValueAtTime(0.24, t + 1.2);

    padMixer.connect(padHighpass);
    padHighpass.connect(this.padFilter);
    this.padFilter.connect(this.padGain);
    this.padGain.connect(this.compressor);

    this.activeNodes.push(padMixer, padHighpass, this.padFilter, this.padGain);
  }

  // Submerged Hydrophone Cavity Drone (Silent at surface, swells in the deep abyss)
  initHydrophoneCavityLayer(t) {
    this.hydroOsc = this.ctx.createOscillator();
    this.hydroOsc.type = 'sawtooth';
    this.hydroOsc.frequency.setValueAtTime(220, t); // A3 hollow resonance

    this.hydroFilter = this.ctx.createBiquadFilter();
    this.hydroFilter.type = 'bandpass';
    this.hydroFilter.frequency.setValueAtTime(320, t);
    this.hydroFilter.Q.setValueAtTime(4.5, t);

    this.hydroGain = this.ctx.createGain();
    this.hydroGain.gain.setValueAtTime(0.0001, t); // Starts silent

    this.hydroOsc.connect(this.hydroFilter);
    this.hydroFilter.connect(this.hydroGain);
    this.hydroGain.connect(this.compressor);

    this.hydroOsc.start(t);
    this.activeNodes.push(this.hydroOsc, this.hydroFilter, this.hydroGain);
  }

  initSonarLayer(t) {
    this.sonarGain = this.ctx.createGain();
    this.sonarGain.gain.setValueAtTime(0.18, t);
    this.sonarGain.connect(this.compressor);

    this.sonarInterval = setInterval(() => {
      if (!this.isPlaying) return;
      // High depth increases ping frequency drastically
      const intervalDelay = Math.max(700, 2200 - (this.currentDepth * 1400));
      const now = Date.now();
      if (now - this.lastSonarTime >= intervalDelay) {
        this.lastSonarTime = now;
        this.triggerBenthicAcousticEvent();
      }
    }, 400);
  }

  triggerBenthicAcousticEvent() {
    if (!this.ctx || !this.isPlaying) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // At surface: high airy droplet (1,200Hz - 1,600Hz)
    // In deep abyss: low metallic sonar chime (380Hz - 680Hz)
    const baseFreq = (1 - this.currentDepth) * 1000 + 420;

    osc.type = this.currentDepth > 0.5 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, t + 0.4);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq, t);
    filter.Q.setValueAtTime(6.0, t);

    // Sonar amplitude gets much louder and punchier in the deep trench
    const amp = 0.08 + (this.currentDepth * 0.16);
    gain.gain.setValueAtTime(amp, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sonarGain);

    osc.start(t);
    osc.stop(t + 0.5);
  }

  /**
   * Set Scroll Depth (0.0 = Surface -> 1.0 = Abyssal Trench)
   * Viscerally transforms the entire soundscape in real-time!
   */
  setDepth(ratio) {
    this.currentDepth = Math.max(0, Math.min(1, ratio));
    if (!this.isPlaying || !this.ctx) return;
    this.applyDepth(this.currentDepth, 0.12);
  }

  applyDepth(depth, rampTime = 0.15) {
    const t = this.ctx.currentTime;

    // 1. PITCH GLIDE (The Doppler Descent):
    // Entire chord pitches down smoothly by up to -500 cents (a fourth) as you scroll down!
    const pitchGlideCents = -depth * 500;
    if (this.padOscillators && this.padOscillators.length === 4) {
      this.padOscillators[0].detune.setTargetAtTime(pitchGlideCents, t, rampTime);
      this.padOscillators[1].detune.setTargetAtTime(pitchGlideCents, t, rampTime);
      this.padOscillators[2].detune.setTargetAtTime(pitchGlideCents, t, rampTime);

      // 2. TRITONE MORPH: Voice 4 detunes an EXTRA -600 cents (Devil's Tritone) in the deep abyss!
      const tritoneCents = pitchGlideCents - (depth * 600);
      this.padOscillators[3].detune.setTargetAtTime(tritoneCents, t, rampTime);
    }

    // 3. SUBMERSION FILTER: Surface wind completely cuts out below depth 0.35!
    if (this.windGain) {
      const windTarget = Math.max(0, (1 - depth * 2.8)) * 0.26;
      this.windGain.gain.setTargetAtTime(windTarget, t, rampTime);
    }

    // Pad lowpass filter closes down to muffle high register into watery deep
    if (this.padFilter) {
      const padCutoff = 1600 - (depth * 950);
      this.padFilter.frequency.setTargetAtTime(padCutoff, t, rampTime);
    }

    // 4. CAVITY RESONANCE: Submerged hydrophone awakens and drops pitch as you descend
    if (this.hydroGain && this.hydroFilter && this.hydroOsc) {
      // Swells in between depth 0.2 and 1.0
      const hydroVol = Math.max(0, (depth - 0.15) * 0.32);
      this.hydroGain.gain.setTargetAtTime(hydroVol, t, rampTime);

      const hydroFreq = 260 - (depth * 100); // Glides from 260Hz down to 160Hz
      this.hydroOsc.frequency.setTargetAtTime(hydroFreq, t, rampTime);
      this.hydroFilter.frequency.setTargetAtTime(hydroFreq * 1.5, t, rampTime);
    }

    // 5. BENTHIC SONAR: Gets noticeably louder and deeper
    if (this.sonarGain) {
      const sonarVol = 0.12 + (depth * 0.22);
      this.sonarGain.gain.setTargetAtTime(sonarVol, t, rampTime);
    }
  }

  // --- LITURGY VOCALIZATION & CHANT ENGINE ---
  async playChantResonance(word) {
    await this.init();
    if (this.ctx.state === 'suspended') await this.ctx.resume();

    this.speakCultistWord(word);
    this.synthesizeThroatChant(word);
  }

  speakCultistWord(word) {
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const cleanWord = word.replace(/[^a-zA-Z']/g, '');
      const config = this.phoneticMap[cleanWord] || { text: cleanWord, pitch: 0.4, rate: 0.7 };

      const utterance = new SpeechSynthesisUtterance(config.text);
      utterance.pitch = config.pitch;
      utterance.rate = config.rate;
      utterance.volume = 0.42; // Soft, eerie cultist murmur instead of blaring volume

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const deepVoice = voices.find(v => 
          v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('George') || v.name.includes('Natural'))
        );
        if (deepVoice) utterance.voice = deepVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis invocation error:', e);
    }
  }

  synthesizeThroatChant(word) {
    const t = this.ctx.currentTime;
    const cleanWord = word.replace(/[^a-zA-Z']/g, '');

    const wordPitches = {
      "Ph'nglui": 146.83,   // D3
      "mglw'nafh": 164.81,  // E3
      "Cthulhu": 130.81,    // C3
      "R'lyeh": 174.61,     // F3
      "wgah'nagl": 196.00,  // G3
      "fhtagn": 110.00      // A2
    };

    const fundamental = wordPitches[cleanWord] || 150.0;

    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(fundamental, t);
    osc1.frequency.linearRampToValueAtTime(fundamental * 0.98, t + 1.4);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(fundamental * 2, t);

    const oscSub = this.ctx.createOscillator();
    oscSub.type = 'sine';
    oscSub.frequency.setValueAtTime(fundamental * 0.5, t);

    const fChest = this.ctx.createBiquadFilter();
    fChest.type = 'peaking';
    fChest.frequency.setValueAtTime(550, t);
    fChest.Q.setValueAtTime(1.8, t);
    fChest.gain.setValueAtTime(3, t); // Gentle warm resonance

    const fThroat = this.ctx.createBiquadFilter();
    fThroat.type = 'peaking';
    fThroat.frequency.setValueAtTime(1300, t);
    fThroat.Q.setValueAtTime(1.8, t);
    fThroat.gain.setValueAtTime(4, t); // Clear intelligibility without harsh spike

    const chantGain = this.ctx.createGain();
    chantGain.gain.setValueAtTime(0.005, t);
    chantGain.gain.linearRampToValueAtTime(0.24, t + 0.1); // Balanced, smooth level
    chantGain.gain.setValueAtTime(0.18, t + 0.6);
    chantGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    osc1.connect(fChest);
    osc2.connect(fChest);
    oscSub.connect(fChest);
    fChest.connect(fThroat);
    fThroat.connect(chantGain);
    chantGain.connect(this.compressor); // Route through compressor for smooth limiter

    osc1.start(t);
    osc2.start(t);
    oscSub.start(t);
    osc1.stop(t + 1.55);
    osc2.stop(t + 1.55);
    oscSub.stop(t + 1.55);

    // Accompany with soft, distant bell chime
    this.playEldritchToll(fundamental * 2, 0.35);
  }

  async playEldritchToll(pitch = 261.63, volumeScale = 1.0) {
    await this.init();
    if (this.ctx.state === 'suspended') await this.ctx.resume();

    const t = this.ctx.currentTime;
    const harmonics = [1, 1.498, 2.0, 2.828, 3.5];

    harmonics.forEach((ratio, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(pitch * ratio, t);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(180, t);

      const amp = (0.16 * volumeScale) / (idx + 1);
      const decay = 2.0 + (idx * 0.25);

      gain.gain.setValueAtTime(amp, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor);

      osc.start(t);
      osc.stop(t + decay + 0.1);
    });
  }

  async playPsychicHorrorSting() {
    await this.init();
    if (this.ctx.state === 'suspended') await this.ctx.resume();

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(587.33, t);
    osc1.frequency.exponentialRampToValueAtTime(220, t + 0.65);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(622.25, t);
    osc2.frequency.exponentialRampToValueAtTime(233.08, t + 0.65);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.compressor);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.75);
    osc2.stop(t + 0.75);
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    const t = this.ctx.currentTime;

    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(0.0001, t, 0.4);
    }

    clearInterval(this.sonarInterval);

    setTimeout(() => {
      this.activeNodes.forEach(node => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch (e) {}
      });
      this.activeNodes = [];
      this.padOscillators = [];
      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      }
    }, 700);
  }
}

window.eldritchAudio = new EldritchAudioEngine();
