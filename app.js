/**
 * The Correlated Dossiers: Main Application Engine
 * Handles Sanity mechanics, Aklo decipherer, Non-Euclidean 3D canvas,
 * Celestial Astrolabe alignment, and ambient visual simulation.
 */

class MythosEngine {
  constructor() {
    this.sanity = 100;
    this.audioEnabled = false;
    this.isStarsAligned = false;
    this.eldritchChars = ['ψ', 'ϗ', 'Ϙ', 'Ϛ', 'Ӂ', 'Ҩ', 'Ѭ', 'ꙮ', '☿', '♆', '𐍈', '𐍉', '𐍊', '⍼', '⏣'];
    this.originalTexts = new Map();
    
    this.initHUD();
    this.initDossierTabs();
    this.initAkloDecipherer();
    this.initAstrolabe();
    this.initNonEuclideanCanvas();
    this.initAbyssalBackground();
    this.initArtifactCanvas();
    this.initSanityTriggers();
    this.initScrollDepth();
  }

  // --- Sanity & Coherence System ---
  initHUD() {
    this.sanityFill = document.getElementById('sanity-fill');
    this.sanityPercentText = document.getElementById('sanity-percent');
    this.btnLaudanum = document.getElementById('btn-laudanum');
    this.btnAudio = document.getElementById('btn-audio');
    this.btnTestSound = document.getElementById('btn-test-sound');
    this.volumeSlider = document.getElementById('volume-slider');
    this.btnCalloutEnable = document.getElementById('btn-callout-enable');
    this.hallucinationModal = document.getElementById('hallucination-modal');
    this.btnAwaken = document.getElementById('btn-awaken');
    this.btnRecover = document.getElementById('btn-recover');

    // First user gesture globally prepares the AudioContext
    const unlockAudio = async () => {
      if (window.eldritchAudio) {
        await window.eldritchAudio.init();
      }
    };
    document.addEventListener('pointerdown', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });

    if (this.btnLaudanum) {
      this.btnLaudanum.addEventListener('click', () => this.doseLaudanum());
    }

    if (this.btnTestSound) {
      this.btnTestSound.addEventListener('click', async () => {
        if (window.eldritchAudio) {
          await window.eldritchAudio.playEldritchToll(196);
        }
      });
    }

    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        if (window.eldritchAudio) {
          window.eldritchAudio.setVolume(parseFloat(e.target.value) / 100);
        }
      });
    }

    if (this.btnCalloutEnable) {
      this.btnCalloutEnable.addEventListener('click', () => this.toggleAudio());
    }

    if (this.btnRecover) {
      this.btnRecover.addEventListener('click', () => {
        this.doseLaudanum();
        this.hallucinationModal.classList.remove('active');
      });
    }

    if (this.btnAwaken) {
      this.btnAwaken.addEventListener('click', () => {
        this.hallucinationModal.classList.remove('active');
        document.body.classList.add('sanity-depleted');
        if (window.eldritchAudio) window.eldritchAudio.playPsychicHorrorSting();
      });
    }

    if (this.btnAudio) {
      this.btnAudio.addEventListener('click', () => this.toggleAudio());
    }
  }

  async toggleAudio() {
    if (!window.eldritchAudio) return;
    if (!this.audioEnabled) {
      await window.eldritchAudio.start();
      this.audioEnabled = true;
      if (this.btnAudio) {
        this.btnAudio.classList.add('active');
        this.btnAudio.innerHTML = '<span>🔊</span> Hydrophone: Listening';
      }
      if (this.btnCalloutEnable) {
        this.btnCalloutEnable.textContent = '🔊 Soundscape Active';
        this.btnCalloutEnable.style.background = 'var(--accent-biolum)';
        this.btnCalloutEnable.style.color = '#040b0d';
      }
    } else {
      window.eldritchAudio.stop();
      this.audioEnabled = false;
      if (this.btnAudio) {
        this.btnAudio.classList.remove('active');
        this.btnAudio.innerHTML = '<span>🔇</span> Hydrophone: Muted';
      }
      if (this.btnCalloutEnable) {
        this.btnCalloutEnable.textContent = '🔊 Enable Soundscape';
        this.btnCalloutEnable.style.background = '';
        this.btnCalloutEnable.style.color = '';
      }
    }
  }

  alterSanity(delta) {
    const prev = this.sanity;
    this.sanity = Math.max(0, Math.min(100, this.sanity + delta));
    const ratio = this.sanity / 100;
    
    document.documentElement.style.setProperty('--sanity-ratio', ratio);
    if (this.sanityFill) this.sanityFill.style.width = `${this.sanity}%`;
    if (this.sanityPercentText) this.sanityPercentText.textContent = `${Math.round(this.sanity)}%`;

    if (delta < 0 && window.eldritchAudio && this.audioEnabled) {
      if (Math.abs(delta) >= 15) {
        window.eldritchAudio.playPsychicHorrorSting();
      } else {
        window.eldritchAudio.playHydrophoneClick();
      }
    }

    if (this.sanity < 40) {
      document.body.classList.add('sanity-depleted');
      this.corruptRandomText();
    } else {
      document.body.classList.remove('sanity-depleted');
      this.restoreCorruptedText();
    }

    if (this.sanity === 0 && prev > 0) {
      this.triggerAwakeningModal();
    }
  }

  doseLaudanum() {
    this.alterSanity(45);
    this.restoreCorruptedText();
    if (window.eldritchAudio && this.audioEnabled) {
      window.eldritchAudio.playEldritchToll(130);
    }
  }

  triggerAwakeningModal() {
    if (this.hallucinationModal) {
      this.hallucinationModal.classList.add('active');
    }
    if (window.eldritchAudio) {
      window.eldritchAudio.playEldritchToll(55);
      window.eldritchAudio.playPsychicHorrorSting();
    }
  }

  corruptRandomText() {
    const paragraphs = document.querySelectorAll('.dossier-text p, .insight-card p');
    if (!paragraphs.length) return;
    const target = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    if (!this.originalTexts.has(target)) {
      this.originalTexts.set(target, target.innerHTML);
    }
    const words = target.textContent.split(' ');
    if (words.length > 5) {
      const idx = Math.floor(Math.random() * words.length);
      const corruptChar = this.eldritchChars[Math.floor(Math.random() * this.eldritchChars.length)];
      words[idx] = `<span style="color:var(--accent-blood-glow); text-shadow:0 0 8px red;">${corruptChar}${words[idx].slice(1)}</span>`;
      target.innerHTML = words.join(' ');
    }
  }

  restoreCorruptedText() {
    this.originalTexts.forEach((originalHtml, element) => {
      element.innerHTML = originalHtml;
    });
    this.originalTexts.clear();
  }

  initSanityTriggers() {
    document.querySelectorAll('[data-sanity-drain]').forEach(el => {
      el.addEventListener('click', () => {
        const cost = parseInt(el.getAttribute('data-sanity-drain') || '5', 10);
        this.alterSanity(-cost);
      });
    });
  }

  // --- Scroll Depth Dynamics ---
  initScrollDepth() {
    this.depthReadout = document.getElementById('depth-readout');

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const scrollFrac = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
          this.updateScrollDepth(scrollFrac);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    this.updateScrollDepth(0);
  }

  updateScrollDepth(scrollFrac) {
    const meters = Math.round(scrollFrac * 4790);

    let zone = "Surface";
    let acousticState = "Airy Wind & Sea Spray";

    if (meters < 400) {
      zone = "Surface";
      acousticState = "Airy Wind & Spray";
    } else if (meters < 1400) {
      zone = "Mesopelagic";
      acousticState = "Submersion Cutoff";
    } else if (meters < 2800) {
      zone = "Bathypelagic";
      acousticState = "Hydrophone Cavity Drone";
    } else if (meters < 4100) {
      zone = "Abyssopelagic";
      acousticState = "Doppler Pitch Glide";
    } else {
      zone = "R'lyeh Trench";
      acousticState = "Hadal Tritone Tension";
    }

    if (this.depthReadout) {
      this.depthReadout.textContent = `DEPTH: ${meters.toLocaleString()}m [${zone} • ${acousticState}]`;
    }

    if (window.eldritchAudio) {
      window.eldritchAudio.setDepth(scrollFrac);
    }
  }

  // --- Dossier Tabs ---
  initDossierTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        tab.classList.add('active');
        const targetId = tab.getAttribute('data-tab');
        const targetContent = document.getElementById(targetId);
        if (targetContent) targetContent.classList.add('active');

        // Reading forbidden files slightly drains composure
        this.alterSanity(-3);
      });
    });
  }

  // --- Aklo Linguistic Decipherer ---
  initAkloDecipherer() {
    const words = document.querySelectorAll('.aklo-word');
    const translationBox = document.getElementById('translation-result');

    const dictionary = {
      "Ph'nglui": {
        literal: "Ph'nglui — Prepositional state: 'In his dwelling' / 'Entombed within'",
        implication: "Denotes a condition of involuntary sanctuary; suspended between architectural enclosure and non-corporeal dormancy."
      },
      "mglw'nafh": {
        literal: "mglw'nafh — Stative verb: 'Yet dreaming' / 'Dead-throttled vigil'",
        implication: "Refutes biological mortality; indicates an active psychic broadcast while somatic animation is arrested."
      },
      "Cthulhu": {
        literal: "Cthulhu — Proper Noun: The High Priest of the Great Old Ones",
        implication: "Phonetic human approximation (pronounced approximately 'Khlûl′-hloo'). Lovecraft noted human vocal cords cannot faithfully utter the guttural click-glottal syllables."
      },
      "R'lyeh": {
        literal: "R'lyeh — Locative: Cyclopean Basalt Citadel / Oceanic Grave",
        implication: "Constructed hundreds of millions of years ago of slimy, non-Euclidean green stone; coordinates 47° 9′ S, 126° 43′ W."
      },
      "wgah'nagl": {
        literal: "wgah'nagl — Verb / Expectancy Aspect: 'Waits expectant' / 'Shall inexorably rise'",
        implication: "Time as a cyclical trap; the eventuality is astronomically predetermined rather than contingent."
      },
      "fhtagn": {
        literal: "fhtagn — Concluding Stasis: 'Resting / Dreaming / Slumbering'",
        implication: "A closing formula equivalent to an eldritch 'Amen', sealing the prayer of cosmic resurgence."
      }
    };

    words.forEach(btn => {
      btn.addEventListener('click', () => {
        words.forEach(w => w.classList.remove('active-word'));
        btn.classList.add('active-word');

        const key = btn.getAttribute('data-word');
        const entry = dictionary[key];

        if (entry && translationBox) {
          translationBox.innerHTML = `
            <div class="word-literal">${entry.literal}</div>
            <div class="word-implication">Cosmic Implication: ${entry.implication}</div>
          `;
        }

        if (window.eldritchAudio) {
          window.eldritchAudio.playChantResonance(key);
        }
        this.alterSanity(-2);
      });
    });

    // Full Liturgy Sequencer
    const btnReciteAll = document.getElementById('btn-recite-all');
    if (btnReciteAll) {
      let isReciting = false;
      btnReciteAll.addEventListener('click', async () => {
        if (isReciting) return;
        isReciting = true;
        btnReciteAll.innerHTML = '<span>🕯️</span> Reciting Liturgy...';
        btnReciteAll.style.opacity = '0.7';

        const wordElements = Array.from(words);
        for (let i = 0; i < wordElements.length; i++) {
          const el = wordElements[i];
          el.click();
          await new Promise(r => setTimeout(r, 1350));
        }

        btnReciteAll.innerHTML = '<span>🕯️</span> Chant Full Liturgy';
        btnReciteAll.style.opacity = '1';
        isReciting = false;
      });
    }
  }

  // --- Astrolabe / Celestial Alignment ---
  initAstrolabe() {
    const canvas = document.getElementById('astrolabe-canvas');
    const slider = document.getElementById('astrolabe-slider');
    const statusText = document.getElementById('alignment-status');
    const banner = document.getElementById('rlyeh-status-banner');
    if (!canvas || !slider) return;

    const ctx = canvas.getContext('2d');
    let angle = 0;

    const draw = (curAngle) => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const r = w * 0.44;

      ctx.clearRect(0, 0, w, h);

      // Outer bronze ring
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#736340';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Inner glowing ring
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
      ctx.strokeStyle = '#183830';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Radial ticks
      const ticks = 36;
      for (let i = 0; i < ticks; i++) {
        const a = (i * Math.PI * 2) / ticks;
        const x1 = cx + Math.cos(a) * (r - 2);
        const y1 = cy + Math.sin(a) * (r - 2);
        const x2 = cx + Math.cos(a) * (r - (i % 3 === 0 ? 14 : 7));
        const y2 = cy + Math.sin(a) * (r - (i % 3 === 0 ? 14 : 7));
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = i % 3 === 0 ? '#bfa369' : '#32574e';
        ctx.lineWidth = i % 3 === 0 ? 2 : 1;
        ctx.stroke();
      }

      // Constellation stars inside rotating sphere
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(curAngle);

      // Star coordinates
      const stars = [
        { x: -50, y: -60, size: 3.5, label: 'Aldebaran' },
        { x: -75, y: -40, size: 2, label: 'Hyades' },
        { x: 30, y: 70, size: 3, label: 'Fomalhaut' },
        { x: 80, y: -20, size: 2.5, label: 'Betelgeuse' },
        { x: -10, y: 25, size: 4, label: "R'lyeh Meridian" },
        { x: 45, y: -80, size: 2, label: 'Algol' }
      ];

      // Draw constellation lines
      ctx.beginPath();
      ctx.moveTo(stars[0].x, stars[0].y);
      ctx.lineTo(stars[1].x, stars[1].y);
      ctx.lineTo(stars[4].x, stars[4].y);
      ctx.lineTo(stars[2].x, stars[2].y);
      ctx.strokeStyle = 'rgba(0, 255, 170, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.label.includes('R\'lyeh') ? '#ff3344' : '#00ffaa';
        ctx.shadowColor = s.fillStyle;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#9cb8ad';
        ctx.fillText(s.label, s.x + 6, s.y + 3);
      });

      ctx.restore();

      // Fixed reticle / alignment needle
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx, cy + r);
      ctx.moveTo(cx - r, cy);
      ctx.lineTo(cx + r, cy);
      ctx.strokeStyle = 'rgba(230, 57, 70, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const updateAlignment = (val) => {
      const normalized = val / 100;
      angle = normalized * Math.PI * 2;
      draw(angle);

      // Target alignment is at ~84% to 88%
      const diff = Math.abs(val - 86);
      if (diff <= 2) {
        if (!this.isStarsAligned) {
          this.isStarsAligned = true;
          if (banner) {
            banner.textContent = "THE STARS ARE RIGHT: R'LYEH COMMENCES ASCENSION!";
            banner.classList.add('stars-right');
          }
          if (statusText) statusText.textContent = "Alignment: 100% (CRITICAL COHERENCE COLLAPSE)";
          this.alterSanity(-20);
          if (window.eldritchAudio) window.eldritchAudio.playEldritchToll(50);
        }
      } else {
        if (this.isStarsAligned) {
          this.isStarsAligned = false;
          if (banner) {
            banner.textContent = "Status: Submerged beneath 3,000 fathoms of pelagic pressure.";
            banner.classList.remove('stars-right');
          }
        }
        const pct = Math.max(0, Math.round(100 - (diff * 1.5)));
        if (statusText) statusText.textContent = `Alignment with Dread Meridian: ${pct}%`;
      }
    };

    slider.addEventListener('input', (e) => {
      updateAlignment(parseFloat(e.target.value));
    });

    updateAlignment(15);
  }

  // --- Non-Euclidean Archway 3D/4D Canvas ---
  initNonEuclideanCanvas() {
    const canvas = document.getElementById('geometry-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let rotX = 0.3;
    let rotY = 0.4;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let warpTime = 0;

    // Define 4D hypercube / impossible portal vertices (x, y, z, w)
    const vertices = [
      [-1, -1, -1, 1], [1, -1, -1, 1], [1, 1, -1, 1], [-1, 1, -1, 1],
      [-1, -1, 1, 1], [1, -1, 1, 1], [1, 1, 1, 1], [-1, 1, 1, 1],
      [-0.6, -0.6, -0.6, -1], [0.6, -0.6, -0.6, -1], [0.6, 0.6, -0.6, -1], [-0.6, 0.6, -0.6, -1],
      [-0.6, -0.6, 0.6, -1], [0.6, -0.6, 0.6, -1], [0.6, 0.6, 0.6, -1], [-0.6, 0.6, 0.6, -1]
    ];

    const edges = [
      [0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],
      [0,4],[1,5],[2,6],[3,7],
      [8,9],[9,10],[10,11],[11,8],[12,13],[13,14],[14,15],[15,12],
      [8,12],[9,13],[10,14],[11,15],
      [0,8],[1,9],[2,10],[3,11],[4,12],[5,13],[6,14],[7,15]
    ];

    const project = (v) => {
      // 4D rotation and non-Euclidean warp
      const wRot = warpTime;
      const cosW = Math.cos(wRot);
      const sinW = Math.sin(wRot);
      const x = v[0] * cosW - v[3] * sinW;
      const w = v[0] * sinW + v[3] * cosW;
      const y = v[1];
      const z = v[2];

      // 3D rotation
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      // Perspective projection with 4D distance
      const distance = 3.2 + (w * 0.35);
      const fov = 260;
      return {
        x: canvas.width / 2 + (x1 * fov) / distance,
        y: canvas.height / 2 + (y2 * fov) / distance,
        z: z2
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      warpTime += 0.012;

      const projected = vertices.map(project);

      // Render non-Euclidean edges with depth and bioluminescence
      edges.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        const avgZ = (p1.z + p2.z) / 2;
        const alpha = Math.max(0.15, Math.min(0.9, 0.6 + avgZ * 0.25));

        ctx.strokeStyle = i < 8 && j < 8 
          ? `rgba(0, 255, 170, ${alpha})` 
          : `rgba(204, 164, 80, ${alpha * 0.8})`;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      });

      // Draw pulsating impossible corner nodes
      projected.forEach((p, idx) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, idx < 8 ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = idx === 2 || idx === 6 ? '#ff4455' : '#00ffaa';
        ctx.fill();
      });

      requestAnimationFrame(render);
    };

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      rotY += dx * 0.008;
      rotX += dy * 0.008;
      lastX = e.clientX;
      lastY = e.clientY;
    });

    // Touch support for mobile
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
      }
    });

    canvas.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - lastX;
      const dy = e.touches[0].clientY - lastY;
      rotY += dx * 0.008;
      rotX += dy * 0.008;
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    });

    window.addEventListener('touchend', () => { isDragging = false; });

    render();
  }

  // --- Archival Bas-Relief Artifact Canvas ---
  initArtifactCanvas() {
    const canvas = document.getElementById('artifact-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let t = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.02;

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw ancient basalt slab texture
      ctx.fillStyle = '#081416';
      ctx.fillRect(20, 15, canvas.width - 40, canvas.height - 30);
      ctx.strokeStyle = '#223832';
      ctx.strokeRect(20, 15, canvas.width - 40, canvas.height - 30);

      // Silhouette of the Cthulhu Idol
      ctx.save();
      ctx.translate(cx, cy);

      // Squatting monstrous form
      ctx.fillStyle = '#0f2420';
      ctx.beginPath();
      // Body & wings outline
      ctx.ellipse(0, 20, 45, 55, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rudimentary wings
      ctx.beginPath();
      ctx.moveTo(-35, 10);
      ctx.lineTo(-75, -25 + Math.sin(t) * 3);
      ctx.lineTo(-30, 30);
      ctx.moveTo(35, 10);
      ctx.lineTo(75, -25 + Math.sin(t) * 3);
      ctx.lineTo(30, 30);
      ctx.strokeStyle = '#2e594f';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Cephalopod Head
      ctx.beginPath();
      ctx.arc(0, -25, 28, 0, Math.PI * 2);
      ctx.fillStyle = '#14302b';
      ctx.fill();

      // Undulating Facial Tentacles
      ctx.strokeStyle = '#1df29a';
      ctx.lineWidth = 2;
      for (let i = -3; i <= 3; i++) {
        const offset = i * 6;
        ctx.beginPath();
        ctx.moveTo(offset, -10);
        ctx.quadraticCurveTo(
          offset + Math.sin(t + i) * 12,
          15 + Math.cos(t * 0.8 + i) * 6,
          offset + Math.sin(t * 1.5 + i) * 18,
          35
        );
        ctx.stroke();
      }

      // Three malevolent gleaming eyes
      ctx.fillStyle = '#e63946';
      ctx.shadowColor = '#e63946';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(-10, -32, 2.5, 0, Math.PI * 2);
      ctx.arc(0, -38, 2.5, 0, Math.PI * 2);
      ctx.arc(10, -32, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      requestAnimationFrame(render);
    };

    render();
  }

  // --- Background Ocean / Abyssal Fog Canvas ---
  initAbyssalBackground() {
    const canvas = document.getElementById('abyssal-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Floating benthic marine snow
    const particles = Array.from({ length: 65 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 0.5,
      vy: Math.random() * 0.4 + 0.15,
      vx: (Math.random() - 0.5) * 0.2,
      alpha: Math.random() * 0.5 + 0.1
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep abyssal gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, '#020507');
      grad.addColorStop(0.5, '#040b0d');
      grad.addColorStop(1, '#010304');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Particles
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        if (p.y > canvas.height) { p.y = -5; p.x = Math.random() * canvas.width; }
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 170, ${p.alpha})`;
        ctx.fill();
      });

      requestAnimationFrame(render);
    };

    render();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.mythosApp = new MythosEngine();
});
