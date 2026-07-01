(function () {
  'use strict';

  const namespace = (window.CumpleSuegra = window.CumpleSuegra || {});
  const { qsa, randomRange } = namespace.utils;

  class CakeScene {
    constructor(root, soundManager, options = {}) {
      this.root = root;
      this.soundManager = soundManager;
      this.options = options;
      this.candlesLit = 0;
      this.completed = false;
      this.timeline = null;
      this.blinkTimer = null;
      this.lookTimer = null;
      this.render();
      this.bindEvents();
      this.animateAlive();
      this.scheduleBlink();
      this.scheduleLook();
    }

    render() {
      this.root.innerHTML = `
        <div class="cake-figure">
          <div class="cake-glow"></div><div class="cake-light"></div>
          <div class="candle" data-candle="0"><span class="flame"></span></div>
          <div class="candle" data-candle="1"><span class="flame"></span></div>
          <div class="candle" data-candle="2"><span class="flame"></span></div>
          <div class="cake-layer cake-layer--top"><span class="cake-ribbon"></span></div>
          <div class="cake-layer cake-layer--middle"><span class="cake-ribbon"></span></div>
          <div class="cake-layer cake-layer--base"><span class="cake-ribbon"></span></div>
          <div class="cake-face">
            <div class="cake-eyes">
              <div class="cake-eye"><span class="cake-pupil"></span></div>
              <div class="cake-eye"><span class="cake-pupil"></span></div>
            </div>
            <div class="cake-cheeks"><span class="cake-cheek"></span><span class="cake-cheek"></span></div>
            <div class="cake-smile"><span class="cake-tooth"></span><span class="cake-tooth"></span></div>
          </div>
        </div>`;

      this.figure = this.root.querySelector('.cake-figure');
      this.glow = this.root.querySelector('.cake-glow');
      this.candles = qsa('.candle', this.root);
      this.pupils = qsa('.cake-pupil', this.root);
      this.eyes = qsa('.cake-eye', this.root);
      this.smile = this.root.querySelector('.cake-smile');
      this.cheeks = qsa('.cake-cheek', this.root);
      this.light = this.root.querySelector('.cake-light');
    }

    bindEvents() {
      this.candles.forEach((candle) => {
        candle.setAttribute('tabindex', '0');
        candle.addEventListener('pointerdown', (event) => {
          event.preventDefault();
          this.lightCandle(candle);
        });
        candle.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          this.lightCandle(candle);
        });
        candle.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.lightCandle(candle);
          }
        });
      });
      this.root.addEventListener('pointermove', (event) => this.followPointer(event), { passive: true });
      this.root.addEventListener('pointerleave', () => this.resetEyes(), { passive: true });
    }

    animateAlive() {
      this.timeline = window.gsap.timeline({ repeat: -1, yoyo: true });
      this.timeline.to(this.figure, { y: -8, scale: 1.012, duration: 2.4, ease: 'sine.inOut' });
      window.gsap.to(this.glow, { opacity: 0.65, scaleX: 1.08, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }

    scheduleBlink() {
      this.blinkTimer = window.setTimeout(() => {
        window.gsap.to(this.eyes, { scaleY: 0.08, duration: 0.08, yoyo: true, repeat: 1, transformOrigin: '50% 50%', ease: 'power2.inOut' });
        this.scheduleBlink();
      }, randomRange(2600, 5600));
    }

    followPointer(event) {
      const rect = this.root.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      this.pupils.forEach((pupil) => {
        window.gsap.to(pupil, { x: x * 5, y: y * 4, duration: 0.18, ease: 'power2.out' });
      });
    }

    resetEyes() {
      window.gsap.to(this.pupils, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
    }

    scheduleLook() {
      this.lookTimer = window.setTimeout(() => {
        const x = randomRange(-5, 5);
        const y = randomRange(-5, 5);
        window.gsap.to(this.pupils, { x, y, duration: 0.45, ease: 'power2.out' });
        if (Math.random() > 0.62) this.surprise();
        this.scheduleLook();
      }, randomRange(1800, 4300));
    }

    surprise() {
      window.gsap.timeline()
        .to(this.eyes, { scaleY: 1.18, scaleX: 1.08, duration: 0.16, ease: 'power2.out' })
        .to(this.eyes, { scaleY: 1, scaleX: 1, duration: 0.32, ease: 'power2.out' });
    }

    createCandleMagic(candle) {
      const rect = candle.getBoundingClientRect();
      const rootRect = this.root.getBoundingClientRect();
      const x = rect.left - rootRect.left + rect.width / 2;
      const y = rect.top - rootRect.top;
      for (let index = 0; index < 10; index += 1) {
        const sparkle = document.createElement('span');
        sparkle.className = index % 3 === 0 ? 'candle-smoke' : 'candle-spark';
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;
        this.root.appendChild(sparkle);
        window.gsap.to(sparkle, {
          x: randomRange(-28, 28),
          y: randomRange(-58, -18),
          opacity: 0,
          scale: randomRange(0.6, 1.8),
          duration: randomRange(0.7, 1.35),
          ease: 'power2.out',
          onComplete: () => sparkle.remove()
        });
      }
    }

    lightCandle(candle) {
      if (this.completed || candle.classList.contains('is-lit')) return;
      candle.classList.add('is-lit');
      this.candlesLit += 1;
      this.soundManager.play('candleLight');
      this.soundManager.play('sparkle');
      this.createCandleMagic(candle);
      window.gsap.to(this.cheeks, { opacity: 1, scale: 1.25, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' });
      window.gsap.to(this.light, { opacity: 0.72, scale: 1.08, duration: 0.35, yoyo: true, repeat: 1, ease: 'sine.inOut' });
      this.options.background?.pulse(window.innerWidth / 2, window.innerHeight * 0.42, '#fff1b8');
      window.gsap.fromTo(candle.querySelector('.flame'), { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.32, ease: 'back.out(2.2)' });
      window.gsap.to(this.figure, { y: '-=10', duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' });

      if (this.candlesLit === this.candles.length) this.complete();
    }

    complete() {
      this.completed = true;
      this.smile.classList.add('is-happy');
      this.figure.classList.add('cake-celebrating');
      this.soundManager.play('success');
      window.gsap.timeline()
        .to(this.figure, { scale: 1.06, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' })
        .to(this.figure, { rotation: -2, duration: 0.18, yoyo: true, repeat: 5, ease: 'sine.inOut' }, '-=0.1');
      this.options.onComplete?.();
    }

    reset() {
      this.candlesLit = 0;
      this.completed = false;
      this.candles.forEach((candle) => candle.classList.remove('is-lit'));
      this.smile.classList.remove('is-happy');
    }

    destroy() {
      this.timeline?.kill();
      window.gsap.killTweensOf(this.figure);
      if (this.blinkTimer) window.clearTimeout(this.blinkTimer);
      if (this.lookTimer) window.clearTimeout(this.lookTimer);
      this.root.innerHTML = '';
    }
  }

  namespace.CakeScene = CakeScene;
})();



