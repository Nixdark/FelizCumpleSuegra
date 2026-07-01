(function () {
  'use strict';

  const namespace = (window.CumpleSuegra = window.CumpleSuegra || {});
  const { randomRange, qsa } = namespace.utils;

  class GalleryScene {
    constructor(root, soundManager, options = {}) {
      this.root = root;
      this.soundManager = soundManager;
      this.options = options;
      this.stage = root.querySelector('#gallery-stage');
      this.cards = [];
      this.photos = [
        { src: 'assets/fotos/foto1.jpg', caption: 'Un recuerdo bonito' },
        { src: 'assets/fotos/foto2.jpg', caption: 'Momentos de familia' },
        { src: 'assets/fotos/foto1.jpg', caption: 'Sonrisas que se quedan' },
        { src: 'assets/fotos/foto2.jpg', caption: 'Cariño del bueno' },
        { src: 'assets/fotos/foto1.jpg', caption: 'Instantes especiales' },
        { src: 'assets/fotos/foto2.jpg', caption: 'Para guardar en el corazón' }
      ];
    }

    play() {
      this.render();
      this.animateIn();
    }

    render() {
      const layouts = [
        { left: 6, top: 28, rotate: -8 },
        { left: 30, top: 22, rotate: 5 },
        { left: 60, top: 30, rotate: -4 },
        { left: 10, top: 64, rotate: 6 },
        { left: 40, top: 58, rotate: -7 },
        { left: 68, top: 66, rotate: 5 }
      ];

      this.stage.innerHTML = this.photos.map((photo, index) => {
        const layout = layouts[index];
        return `
          <button class="polaroid" type="button" data-caption="${photo.caption}" aria-label="Abrir recuerdo: ${photo.caption}" style="left:${layout.left}%; top:${layout.top}%; --rotate:${layout.rotate}deg; --scale:${randomRange(0.92, 1.06)};">
            <span class="photo-string"></span><span class="photo-clip"></span>
            <img src="${photo.src}" alt="${photo.caption}" loading="eager" />
          </button>`;
      }).join('');
      this.cards = qsa('.polaroid', this.stage);
      this.cards.forEach((card) => card.addEventListener('pointerdown', () => this.open(card)));
    }

    animateIn() {
      window.gsap.set(this.cards, { opacity: 0, y: -180, rotation: -16, scale: 0.82 });
      this.cards.forEach((card, index) => {
        window.gsap.to(card, {
          opacity: 1,
          y: 0,
          rotation: Number.parseFloat(card.style.getPropertyValue('--rotate')),
          scale: Number.parseFloat(card.style.getPropertyValue('--scale')),
          duration: 0.9,
          delay: index * 0.28,
          ease: 'back.out(1.25)',
          onStart: () => this.soundManager.play('paperDrop')
        });
      });
      window.gsap.to(this.cards, { y: '+=8', duration: 2.8, repeat: -1, yoyo: true, stagger: 0.22, ease: 'sine.inOut' });
    }

    open(card) {
      this.soundManager.play('camera');
      this.soundManager.play('paperOpen');
      card.classList.add('is-open');
      window.gsap.to(card, { zIndex: 20, scale: 1.2, rotation: 0, y: -22, filter: 'brightness(1.13) drop-shadow(0 0 28px rgba(255,215,233,0.45))', duration: 0.35, ease: 'power3.out' });
      window.setTimeout(() => {
        window.gsap.to(card, {
          scale: Number.parseFloat(card.style.getPropertyValue('--scale')),
          rotation: Number.parseFloat(card.style.getPropertyValue('--rotate')),
          y: 0,
          duration: 0.45,
          ease: 'power3.out',
          onComplete: () => { card.style.zIndex = ''; card.classList.remove('is-open'); window.gsap.set(card, { filter: 'none' }); }
        });
      }, 1200);
    }

    async exit() {
      this.soundManager.play('magic');
      await window.gsap.to(this.cards, {
        y: -260,
        opacity: 0,
        scale: 0.7,
        rotation: () => randomRange(-24, 24),
        duration: 1.2,
        stagger: 0.12,
        ease: 'power3.in'
      });
      this.options.background?.pulse(window.innerWidth / 2, window.innerHeight / 2, '#ffd7e9');
    }

    destroy() {
      window.gsap.killTweensOf(this.cards);
      this.stage.innerHTML = '';
    }
  }

  namespace.GalleryScene = GalleryScene;
})();

