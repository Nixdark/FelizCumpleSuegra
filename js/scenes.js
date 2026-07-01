(function () {
  'use strict';

  const namespace = (window.CumpleSuegra = window.CumpleSuegra || {});
  const { qs, qsa, randomItem } = namespace.utils;
  const CONFIG = namespace.CONFIG || {};

  class SceneController {
    constructor({ onEnter = {}, background, soundManager, reduceMotion = false }) {
      this.onEnter = onEnter;
      this.background = background;
      this.soundManager = soundManager;
      this.reduceMotion = reduceMotion;
      this.current = null;
      this.isTransitioning = false;
      this.lightWash = qs('#light-wash');
      this.cameraTween = null;
      this.transitionStyles = ['bloomZoom', 'softDepth', 'flashDrift', 'dreamBlur'];
      this.bindParallax();
    }

    async show(name, options = {}) {
      if (this.isTransitioning || this.current === name) return;
      const nextScene = qs(`[data-scene="${name}"]`);
      if (!nextScene) return;
      this.isTransitioning = true;

      const previousScene = this.current ? qs(`[data-scene="${this.current}"]`) : null;
      const style = options.style || randomItem(this.transitionStyles);
      if (options.flash || style.includes('flash')) await this.flash(options.flashColor || '#ffffff');

      if (previousScene) await this.leave(previousScene, style);
      nextScene.classList.add('active');
      await this.enter(nextScene, style);

      this.current = name;
      this.startCamera(nextScene);
      this.isTransitioning = false;
      this.onEnter[name]?.();
    }

    leave(scene, style) {
      const presets = {
        bloomZoom: { opacity: 0, scale: 1.08, y: -18, filter: 'blur(18px) brightness(1.8)', duration: 0.9 },
        softDepth: { opacity: 0, scale: 0.94, z: -160, rotateX: 4, filter: 'blur(12px)', duration: 0.95 },
        flashDrift: { opacity: 0, scale: 1.02, x: -30, filter: 'blur(16px) brightness(1.4)', duration: 0.75 },
        dreamBlur: { opacity: 0, scale: 0.985, y: 28, filter: 'blur(22px) saturate(1.5)', duration: 1.05 }
      };
      const duration = this.reduceMotion ? Math.max(0.24, presets[style].duration * 0.55) : presets[style].duration;
      return window.gsap.to(scene, {
        ...presets[style],
        duration,
        ease: 'power3.inOut',
        onComplete: () => scene.classList.remove('active')
      });
    }

    enter(scene, style) {
      const presets = {
        bloomZoom: { from: { opacity: 0, scale: 0.9, y: 28, filter: 'blur(22px) brightness(1.8)' }, to: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px) brightness(1)' } },
        softDepth: { from: { opacity: 0, scale: 1.08, z: 180, rotateX: -5, filter: 'blur(14px)' }, to: { opacity: 1, scale: 1, z: 0, rotateX: 0, filter: 'blur(0px)' } },
        flashDrift: { from: { opacity: 0, scale: 1.05, x: 34, filter: 'blur(18px)' }, to: { opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' } },
        dreamBlur: { from: { opacity: 0, scale: 1.02, y: -24, filter: 'blur(24px) saturate(1.7)' }, to: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px) saturate(1)' } }
      };
      const preset = presets[style];
      const duration = this.reduceMotion ? 0.6 : 1.18;
      window.gsap.set(scene, preset.from);
      return window.gsap.to(scene, { ...preset.to, duration, ease: 'power3.out' });
    }

    async flash(color = '#ffffff') {
      window.gsap.set(this.lightWash, { background: `radial-gradient(circle, ${color}, rgba(255,255,255,0.72) 34%, transparent 72%)` });
      const duration = this.reduceMotion ? 0.18 : 0.28;
      await window.gsap.timeline()
        .set(this.lightWash, { opacity: 0, scale: 0.16 })
        .to(this.lightWash, { opacity: 1, scale: 1.45, duration, ease: 'power2.out' })
        .to(this.lightWash, { opacity: 0, scale: 2.5, duration: this.reduceMotion ? 0.24 : 0.58, ease: 'power2.in' });
    }

    shake(intensity = CONFIG.SHAKE_INTENSITY || 6) {
      const scene = qs('.scene.active .scene-core');
      if (!scene) return;
      window.gsap.fromTo(scene, { x: -intensity }, { x: intensity, duration: 0.05, repeat: 7, yoyo: true, ease: 'sine.inOut', onComplete: () => window.gsap.to(scene, { x: 0, duration: 0.12 }) });
    }

    playIntro() {
      this.current = 'intro';
      const intro = qs('[data-scene="intro"]');
      intro.classList.add('active');
      this.startCamera(intro);
      window.gsap.set(qsa('.heart-glow, .hero-title, .hero-subtitle, .planet-button', intro), { opacity: 0, y: 18, filter: 'blur(16px)' });
      this.buildIntroStars();
      window.gsap.timeline({ delay: 0.65 })
        .to('.intro-star', { opacity: 1, scale: 1, duration: 0.45, stagger: 0.12, ease: 'power2.out' })
        .to('.heart-glow', { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out' }, '-=0.1')
        .to('.hero-title', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.05, ease: 'power3.out' }, '+=0.15')
        .to('.hero-title', { opacity: 0, y: -12, filter: 'blur(8px)', duration: 0.55, ease: 'power2.in' }, '+=1.15')
        .set('.hero-title', { textContent: 'Porque hoy...' })
        .to('.hero-title', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.75, ease: 'power2.out' })
        .to('.hero-title', { opacity: 0, y: -12, filter: 'blur(8px)', duration: 0.55, ease: 'power2.in' }, '+=1')
        .set('.hero-title', { textContent: 'Es un día que merece ser recordado.' })
        .to('.hero-title', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power2.out' })
        .to('.hero-subtitle', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' }, '-=0.3')
        .to('.planet-button', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.0, ease: 'back.out(1.25)' }, '+=0.2');
    }

    buildIntroStars() {
      const root = qs('#intro-constellation');
      if (!root) return;
      root.innerHTML = '';
      for (let i = 0; i < 38; i += 1) {
        const t = (Math.PI * 2 * i) / 38;
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        const star = document.createElement('span');
        star.className = 'intro-star';
        star.style.left = `${50 + x * 2.2}%`;
        star.style.top = `${48 + y * 2.1}%`;
        root.appendChild(star);
      }
    }

    startCamera(scene) {
      this.cameraTween?.kill();
      const core = qs('.scene-core', scene);
      if (!core) return;
      const zoom = CONFIG.CAMERA?.idleZoom || 1.03;
      const duration = CONFIG.CAMERA?.idleDuration || 14;
      this.cameraTween = window.gsap.to(core, { scale: zoom, y: -8, duration: this.reduceMotion ? Math.max(3.2, duration * 0.55) : duration, repeat: this.reduceMotion ? 0 : -1, yoyo: true, ease: 'sine.inOut' });
    }

    bindParallax() {
      window.addEventListener('pointermove', (event) => {
        const x = (event.clientX / window.innerWidth - 0.5) * 2;
        const y = (event.clientY / window.innerHeight - 0.5) * 2;
        const strength = CONFIG.CAMERA?.parallaxStrength || 12;
        qsa('.scene.active [data-depth]').forEach((element) => {
          const depth = Number(element.dataset.depth || 0.5);
          window.gsap.to(element, { x: x * depth * strength, y: y * depth * strength * 0.7, rotationY: x * depth * 2.4, rotationX: -y * depth * 2, duration: 1.15, ease: 'power2.out' });
        });
      }, { passive: true });
    }
  }

  namespace.SceneController = SceneController;
})();
