(function () {
  'use strict';

  const namespace = window.CumpleSuegra = window.CumpleSuegra || {};
  if (!namespace.utils || !namespace.CONFIG) {
    console.error('CumpleSuegra: faltan dependencias base (utils/config).');
    return;
  }
  const { qs, wait, typeText, typeRichText, preloadImage, shouldReduceMotion } = namespace.utils;
  const CONFIG = namespace.CONFIG || {};

  class App {
    constructor() {
      this.background = new namespace.BackgroundParticles(qs('#background-canvas'));
      this.soundManager = new namespace.SoundManager();
      this.fireworks = new namespace.Fireworks(this.soundManager);
      this.cake = null;
      this.gallery = null;
      this.letterOpened = false;
      this.sequenceToken = 0;
      this.reduceMotion = shouldReduceMotion();
      this.messages = [
        'Querida Suegra...\n\nHoy no queríamos darte simplemente un "Feliz Cumpleaños".\n\nQueríamos regalarte un pequeño momento.',
        'Porque las personas especiales...\n\nmerecen recuerdos especiales.',
        'Gracias por recibirnos siempre con cariño.\n\nGracias por cada consejo.\n\nGracias por cada sonrisa.\n\nGracias por formar parte de nuestra familia.',
        'Esperamos que este pequeño detalle...\n\nte saque una gran sonrisa.\n\n♡'
      ];
      this.letter = 'Querida Suegra ♡\n\nHoy queremos regalarle algo más que unas simples palabras.\n\nQueremos regalarle un pequeño recuerdo lleno de cariño.\n\nGracias por abrirnos las puertas de su hogar.\n\nGracias por su paciencia.\n\nGracias por cada consejo.\n\nGracias por cada sonrisa.\n\nGracias por hacernos sentir parte de la familia.\n\nEsperamos que este nuevo año de vida esté lleno de salud.\n\nFelicidad.\n\nSueños cumplidos.\n\nY muchísimos momentos hermosos.\n\nNunca deje de sonreír.\n\nPorque esa sonrisa ilumina a quienes la rodean.\n\nCon muchísimo cariño.\n\nCon cariño, su yerno';
    }

    async init() {
      document.documentElement.classList.toggle('reduced-motion', this.reduceMotion);
      this.soundManager.init();
      this.background.start();
      this.createSceneController();
      this.bindEvents();
      this.loadFinalPhoto();
      this.preloadAssets();
      this.sceneController.playIntro();
    }

    createSceneController() {
      this.sceneController = new namespace.SceneController({
        background: this.background,
        soundManager: this.soundManager,
        reduceMotion: this.reduceMotion,
        onEnter: {
          cake: () => this.enterCake(),
          gallery: () => this.enterGallery(),
          letter: () => this.enterLetter(),
          final: () => this.enterFinal()
        }
      });
    }

    bindEvents() {
      qs('#start-button').addEventListener('click', () => this.startExperience());
      qs('#seal-button').addEventListener('click', () => this.openLetter());
      qs('#letter-continue').addEventListener('click', () => this.closeLetterAndFinish());
      qs('#replay-button').addEventListener('click', () => this.restart());
      qs('#heart-button').addEventListener('click', () => this.fireworks.heartBurst());
    }

    preloadAssets() {
      ['assets/fotos/foto1.jpg', 'assets/fotos/foto2.jpg', 'assets/fotos/final.jpg'].forEach((src) => preloadImage(src));
    }

    loadFinalPhoto() {
      qs('#final-photo').innerHTML = '<img src="assets/fotos/final.jpg" alt="Fotografia final de cumpleanos" />';
    }

    async startExperience() {
      this.sequenceToken += 1;
      const token = this.sequenceToken;
      this.soundManager.unlock();
      this.soundManager.playOnce('buttonClick');
      this.soundManager.playOnce('whoosh');
      this.soundManager.playOnce('bells');
      this.soundManager.playMusic('intro', CONFIG.MUSIC_VOLUME || 0.2);
      this.background.pulse(window.innerWidth / 2, window.innerHeight / 2, '#ffffff');
      await this.sceneController.show('messages', { flash: true, style: 'bloomZoom' });
      if (this.isStale(token)) return;
      await this.playMessages(token);
    }

    async playMessages(token) {
      const line = qs('#message-line');
      for (const message of this.messages) {
        if (this.isStale(token)) return;
        await typeRichText({
          element: line,
          text: message,
          highlights: CONFIG.HIGHLIGHT_WORDS || [],
          minDelay: CONFIG.MESSAGE_SPEED?.min || 26,
          maxDelay: CONFIG.MESSAGE_SPEED?.max || 62,
          pauseDelay: CONFIG.MESSAGE_SPEED?.pause || 240,
          onLetter: (_, index) => {
            if (index % 3 === 0) this.soundManager.playOnce('penWrite');
            if (index % 31 === 0) this.soundManager.playOnce('sparkle');
          }
        });
        await wait(1450);
        if (message !== this.messages[this.messages.length - 1]) {
          window.gsap.to(line, { opacity: 0, y: -12, duration: 0.35, onComplete: () => window.gsap.set(line, { opacity: 1, y: 0 }) });
          await wait(380);
        }
      }

      this.soundManager.playOnce('magic');
      this.background.pulse(window.innerWidth / 2, window.innerHeight / 2, '#ffd7e9');
      await this.sceneController.show('countdown', { flash: true, flashColor: '#fff1b8', style: 'flashDrift' });
      if (this.isStale(token)) return;
      await this.runCountdown(token);
    }

    async runCountdown(token) {
      const number = qs('#countdown-number');
      for (const value of ['3', '2', '1']) {
        if (this.isStale(token)) return;
        number.textContent = value;
        this.soundManager.playOnce('countdown', { duration: 3000 });
        this.soundManager.playOnce('crystals');
        this.sceneController.shake((CONFIG.SHAKE_INTENSITY || 7) + Number(value) * 1.5);
        this.background.pulse(window.innerWidth / 2, window.innerHeight / 2, '#fff1b8');
        await window.gsap.timeline()
          .fromTo('.countdown-ring', { scale: 0.7, opacity: 0.28 }, { scale: 1.22, opacity: 0.85, duration: 0.42, ease: 'power2.out' })
          .fromTo(number, { opacity: 0, scale: 0.35, rotation: -10, filter: 'blur(10px)' }, { opacity: 1, scale: 1.12, rotation: 0, filter: 'blur(0px)', duration: 0.52, ease: 'back.out(1.7)' }, '<')
          .to(number, { scale: 1, duration: 0.3, ease: 'sine.inOut' })
          .to('.countdown-ring', { scale: 1.75, opacity: 0, duration: 0.42, ease: 'power3.out' })
          .to(number, { opacity: 0, scale: 1.9, filter: 'blur(14px) brightness(1.6)', duration: 0.45, ease: 'power3.in' }, '<');
      }
      window.gsap.set(number, { opacity: 1, scale: 1, filter: 'blur(0px)' });
      await this.sceneController.show('cake', { flash: true, flashColor: '#fff7e6', style: 'softDepth' });
    }

    enterCake() {
      if (this.cake) this.cake.destroy();
      this.cake = new namespace.CakeScene(qs('#cake-stage'), this.soundManager, {
        background: this.background,
        onComplete: () => this.afterCandles()
      });
      window.gsap.fromTo('#cake-hint', { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: 'power2.out' });
    }

    async afterCandles() {
      this.soundManager.playMusic('birthday', 0.24);
      this.fireworks.sideCannons();
      this.fireworks.heartBurst();
      await wait(2800);
      await this.sceneController.show('gallery', { flash: true, flashColor: '#ffd7e9', style: 'dreamBlur' });
    }

    enterGallery() {
      if (this.gallery) this.gallery.destroy();
      this.gallery = new namespace.GalleryScene(qs('#gallery-scene'), this.soundManager, { background: this.background });
      this.gallery.play();
      window.gsap.fromTo(['#gallery-title', '#gallery-subtitle'], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.16, ease: 'power2.out' });
      window.setTimeout(async () => {
        if (this.sceneController.current !== 'gallery') return;
        await this.gallery.exit();
        await this.sceneController.show('letter', { flash: true, flashColor: '#fff1b8', style: 'bloomZoom' });
      }, CONFIG.GALLERY_TIME || 21000);
    }

    enterLetter() {
      this.letterOpened = false;
      this.soundManager.crossFade('letter', CONFIG.LETTER_VOLUME || 0.18, 1800);
      const envelope = qs('#envelope');
      const paper = qs('.letter-paper');
      const continueButton = qs('#letter-continue');
      qs('#letter-text').textContent = '';
      continueButton.style.display = 'none';
      paper.style.zIndex = '1';
      paper.style.pointerEvents = 'none';
      window.gsap.set('#seal-button', { opacity: 1, scale: 1, rotation: 0 });
      window.gsap.set(paper, { opacity: 0, y: 160, scaleY: 0.25 });
      window.gsap.set('.envelope__flap--top', { rotateX: 0 });
      window.gsap.fromTo(envelope, { opacity: 0, y: -160, rotateX: 12 }, { opacity: 1, y: 0, rotateX: 0, duration: 1.1, ease: 'bounce.out' });
      window.gsap.to(envelope, { x: 1.5, rotation: -1.4, duration: 1.25, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }

    async openLetter() {
      if (this.letterOpened || this.sceneController.current !== 'letter') return;
      this.letterOpened = true;
      const text = qs('#letter-text');
      const continueButton = qs('#letter-continue');
      const paper = qs('.letter-paper');
      this.soundManager.playOnce('sealBreak');
      this.breakSeal();
      this.background.pulse(window.innerWidth / 2, window.innerHeight / 2, '#fff1b8');
      paper.style.zIndex = '9';
      paper.style.pointerEvents = 'auto';

      await window.gsap.timeline()
        .to('#seal-button', { scale: 1.35, opacity: 0, rotation: 26, duration: 0.38, ease: 'power2.in' })
        .to('.envelope__flap--top', { rotateX: -172, duration: 0.9, ease: 'power3.inOut' }, '-=0.1')
        .to('.letter-paper', { opacity: 1, y: -116, scaleY: 1, duration: 1.15, ease: 'power3.out' }, '-=0.35');

      await typeText({
        element: text,
        text: this.letter,
        minDelay: CONFIG.LETTER_SPEED?.min || 18,
        maxDelay: CONFIG.LETTER_SPEED?.max || 50,
        pauseDelay: CONFIG.LETTER_SPEED?.pause || 185,
        onLetter: (_, index) => {
          paper.scrollTop = paper.scrollHeight;
          if (index % 4 === 0) this.soundManager.playOnce('penWrite');
          if (index % 22 === 0) window.gsap.to('.letter-paper', { y: '+=2', duration: 0.12, yoyo: true, repeat: 1, ease: 'sine.inOut' });
          if (index % 36 === 0) this.background.pulse(window.innerWidth * 0.52, window.innerHeight * 0.46, '#f3d37b');
        }
      });

      await wait(1200);
      continueButton.style.display = 'inline-flex';
      continueButton.style.opacity = '1';
      continueButton.style.transform = 'translateY(0) scale(1)';
      continueButton.style.visibility = 'visible';
      continueButton.style.pointerEvents = 'auto';
      paper.scrollTop = paper.scrollHeight;
      window.gsap.fromTo(continueButton, { opacity: 0, y: 20, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.75, ease: 'back.out(1.4)' });
    }

    breakSeal() {
      const seal = qs('#seal-button');
      const rect = seal.getBoundingClientRect();
      const host = qs('#envelope');
      const hostRect = host.getBoundingClientRect();
      for (let index = 0; index < 8; index += 1) {
        const piece = document.createElement('span');
        piece.className = 'seal-piece';
        piece.style.left = `${rect.left - hostRect.left + rect.width / 2}px`;
        piece.style.top = `${rect.top - hostRect.top + rect.height / 2}px`;
        host.appendChild(piece);
        window.gsap.to(piece, { x: Math.cos(index) * 80, y: Math.sin(index) * 60, rotation: index * 45, opacity: 0, duration: 0.85, ease: 'power2.out', onComplete: () => piece.remove() });
      }
    }

    async closeLetterAndFinish() {
      if (this.sceneController.current !== 'letter') return;
      this.soundManager.playOnce('paperClose');
      await window.gsap.timeline()
        .to('.letter-paper', { y: 120, scaleY: 0.35, opacity: 0, duration: 0.75, ease: 'power3.in' })
        .to('.envelope__flap--top', { rotateX: 0, duration: 0.55, ease: 'power3.inOut' }, '-=0.2')
        .to('#envelope', { scale: 0.55, opacity: 0, rotation: 18, duration: 0.65, ease: 'power3.in' });
      this.background.pulse(window.innerWidth / 2, window.innerHeight / 2, '#ffd7e9');
      await this.sceneController.show('final', { flash: true, flashColor: '#ffd7e9', style: 'softDepth' });
    }

    enterFinal() {
      this.soundManager.fadeMusic(0.2, 900);
      this.fireworks.startFinale();
      this.buildHeartConstellation();
      window.gsap.set('#outro-panel', { display: 'none', opacity: 0 });
      window.gsap.set('.final-actions', { opacity: 1 });
      window.gsap.set('#heart-button', { display: 'inline-flex', opacity: 1 });
      window.gsap.set('#replay-button', { display: 'none', opacity: 0, scale: 0.95 });
      window.gsap.fromTo('#final-photo', { opacity: 0, y: 34, scale: 0.86, filter: 'blur(12px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.2, delay: 0.8, ease: 'power3.out' });
      window.gsap.fromTo(['.final-title', '.final-copy', '.final-actions'], { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.24, delay: 1.25, ease: 'power2.out' });
      this.renderMiniCake();
      this.scheduleMovieEnding();
    }

    buildHeartConstellation() {
      const heart = qs('#heart-constellation');
      const lines = qs('#heart-lines');
      heart.querySelectorAll('span').forEach((dot) => dot.remove());
      lines.innerHTML = '';
      const points = 95;
      for (let index = 0; index < points; index += 1) {
        const t = (Math.PI * 2 * index) / points;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const left = 50 + x * 2.1;
        const top = 48 + y * 2.15;
        const dot = document.createElement('span');
        dot.style.cssText = `position:absolute;left:${left}%;top:${top}%;width:4px;height:4px;border-radius:50%;background:#fff1b8;box-shadow:0 0 16px #ffd7e9;opacity:0;`;
        heart.appendChild(dot);
        if (index % 3 === 0) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', left);
          line.setAttribute('y1', top);
          line.setAttribute('x2', left + Math.sin(t) * 5);
          line.setAttribute('y2', top + Math.cos(t) * 5);
          lines.appendChild(line);
        }
      }
      window.gsap.to(heart, { opacity: 1, duration: 0.5 });
      window.gsap.to(heart.querySelectorAll('span'), { opacity: 1, scale: 1.8, duration: 0.6, stagger: 0.018, ease: 'power2.out' });
      window.gsap.fromTo(lines.querySelectorAll('line'), { opacity: 0 }, { opacity: 0.58, duration: 1.2, stagger: 0.02, ease: 'power2.out' });
    }

    renderMiniCake() {
      const stage = qs('#mini-cake-stage');
      const mini = new namespace.CakeScene(stage, this.soundManager, { background: this.background });
      mini.candles.forEach((candle) => candle.classList.add('is-lit'));
      window.gsap.fromTo(stage, { opacity: 0, y: 80, scale: 0.35 }, { opacity: 1, y: 0, scale: 0.55, duration: 1.1, delay: 2.1, ease: 'back.out(1.4)' });
      window.gsap.to(stage, { rotation: -10, y: '-=12', duration: 0.28, yoyo: true, repeat: 15, delay: 3.3, ease: 'sine.inOut' });
    }

    async scheduleMovieEnding() {
      await wait(9000);
      if (this.sceneController.current !== 'final') return;
      this.soundManager.fadeMusic(0.05, 6500);
      window.gsap.to('#final-photo', { y: -18, scale: 1.045, duration: 12, ease: 'sine.inOut' });
      window.gsap.to(['.final-title', '.final-copy', '#heart-button', '#mini-cake-stage'], { opacity: 0, y: -18, duration: 2.2, stagger: 0.12, ease: 'power2.inOut' });
      window.gsap.to('#background-canvas', { opacity: 0.42, duration: 9, ease: 'sine.inOut' });
      this.background.stop();
      const panel = qs('#outro-panel');
      const line = qs('#outro-line');
      window.gsap.set(panel, { display: 'grid', opacity: 1 });
      for (const phrase of CONFIG.OUTRO_LINES || []) {
        line.textContent = phrase;
        await window.gsap.fromTo(line, { opacity: 0, y: 16, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power2.out' });
        await wait(3000);
        await window.gsap.to(line, { opacity: 0, y: -12, filter: 'blur(10px)', duration: 0.8, ease: 'power2.in' });
      }
      await wait(1800);
      window.gsap.set('#heart-button', { display: 'none' });
      window.gsap.to('#replay-button', { opacity: 1, display: 'inline-flex', duration: 0.8, ease: 'power2.out' });
    }

    async restart() {
      this.sequenceToken += 1;
      this.fireworks.stop();
      this.soundManager.stopMusic();
      this.cake?.destroy();
      this.gallery?.destroy();
      qs('#mini-cake-stage').innerHTML = '';
      qs('#message-line').textContent = '';
      qs('#letter-text').textContent = '';
      qs('#seal-button').style.opacity = '';
      qs('#seal-button').style.transform = '';
      this.letterOpened = false;
      window.gsap.set('#background-canvas', { opacity: 1 });
      this.background.start();
      await this.sceneController.show('intro', { flash: true, style: 'dreamBlur' });
      this.sceneController.playIntro();
    }

    isStale(token) {
      return token !== this.sequenceToken;
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
    window.CumpleSuegra.app = app;
  });
})();
