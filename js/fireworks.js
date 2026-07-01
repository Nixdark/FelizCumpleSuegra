(function () {
  'use strict';

  const namespace = (window.CumpleSuegra = window.CumpleSuegra || {});

  class Fireworks {
    constructor(soundManager) {
      this.soundManager = soundManager;
      this.interval = null;
      this.colors = ['#fff1b8', '#ffd7e9', '#c9c1ff', '#ffffff', '#f3d37b'];
    }

    burst(options = {}) {
      if (!window.confetti) return;
      window.confetti({
        particleCount: options.count || 92,
        spread: options.spread || 78,
        startVelocity: options.velocity || 34,
        ticks: options.ticks || 150,
        scalar: options.scalar || 0.9,
        colors: this.colors,
        origin: options.origin || { x: 0.5, y: 0.58 }
      });
    }

    sideCannons() {
      if (!window.confetti) return;
      this.soundManager.play('confetti');
      window.confetti({ particleCount: 70, angle: 60, spread: 55, origin: { x: 0, y: 0.72 }, colors: this.colors });
      window.confetti({ particleCount: 70, angle: 120, spread: 55, origin: { x: 1, y: 0.72 }, colors: this.colors });
    }

    startFinale() {
      this.stop();
      this.soundManager.play('fireworks');
      this.sideCannons();
      this.interval = window.setInterval(() => {
        this.burst({
          count: 55,
          spread: 64,
          velocity: 26,
          scalar: Math.random() * 0.45 + 0.65,
          origin: { x: Math.random() * 0.72 + 0.14, y: Math.random() * 0.34 + 0.08 }
        });
      }, 1400);
    }

    heartBurst() {
      this.soundManager.play('heart');
      this.burst({ count: 160, spread: 110, velocity: 28, scalar: 1.05, origin: { x: 0.5, y: 0.5 } });
    }

    stop() {
      if (this.interval) window.clearInterval(this.interval);
      this.interval = null;
    }
  }

  namespace.Fireworks = Fireworks;
})();
