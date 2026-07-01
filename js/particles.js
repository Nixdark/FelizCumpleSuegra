(function () {
  'use strict';

  const namespace = (window.CumpleSuegra = window.CumpleSuegra || {});
  const { clamp, randomRange, randomItem } = namespace.utils;
  const CONFIG = namespace.CONFIG || {};

  class BackgroundParticles {
    constructor(canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d', { alpha: true });
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this.quality = this.detectQuality();
      this.stars = [];
      this.dust = [];
      this.floaters = [];
      this.shootingStars = [];
      this.bursts = [];
      this.time = 0;
      this.lastFrame = 0;
      this.running = false;
      this.frameHandle = null;
      this.palette = ['#ffffff', '#fff1b8', '#ffd7e9', '#c9c1ff'];
      this.resize = this.resize.bind(this);
      this.animate = this.animate.bind(this);
      window.addEventListener('resize', this.resize, { passive: true });
      this.resize();
    }

    detectQuality() {
      const cores = navigator.hardwareConcurrency || 4;
      const memory = navigator.deviceMemory || 4;
      const mobile = matchMedia('(max-width: 760px)').matches;
      if (mobile || cores <= 4 || memory <= 3) return 'low';
      if (cores >= 8 && memory >= 8) return 'high';
      return 'medium';
    }

    resize() {
      this.dpr = Math.min(window.devicePixelRatio || 1, this.quality === 'high' ? 2 : 1.5);
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.createField();
    }

    createField() {
      const configured = CONFIG.PARTICLE_COUNT?.[this.quality] || 320;
      const starCount = clamp(Math.floor(configured * 0.42), 70, 320);
      const dustCount = clamp(Math.floor(configured * 0.72), 110, 560);
      const floaterCount = clamp(Math.floor(configured * 0.08), 12, 54);

      this.stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: randomRange(0.35, 1.75),
        alpha: randomRange(0.16, 0.95),
        twinkle: randomRange(0.4, 1.8),
        phase: randomRange(0, Math.PI * 2),
        color: randomItem(this.palette)
      }));

      this.dust = Array.from({ length: dustCount }, () => ({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z: randomRange(0.25, 1),
        radius: randomRange(0.25, 1.15),
        alpha: randomRange(0.05, 0.34),
        drift: randomRange(-0.08, 0.08),
        speed: randomRange(0.035, 0.16),
        color: randomItem(['#fff1b8', '#ffd7e9', '#ffffff'])
      }));

      this.floaters = Array.from({ length: floaterCount }, () => this.createFloater());
    }

    createFloater() {
      return {
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        type: randomItem(['petal', 'feather', 'spark']),
        size: randomRange(4, 13),
        alpha: randomRange(0.12, 0.38),
        vx: randomRange(-0.18, 0.18),
        vy: randomRange(0.04, 0.18),
        rotation: randomRange(0, Math.PI * 2),
        spin: randomRange(-0.012, 0.012)
      };
    }

    start() {
      if (this.running) return;
      this.running = true;
      this.lastFrame = performance.now();
      this.frameHandle = requestAnimationFrame(this.animate);
    }

    stop() {
      this.running = false;
      if (this.frameHandle) cancelAnimationFrame(this.frameHandle);
      this.frameHandle = null;
    }

    pulse(x = this.width / 2, y = this.height / 2, color = '#fff1b8') {
      const amount = this.quality === 'low' ? 48 : this.quality === 'medium' ? 90 : 140;
      for (let index = 0; index < amount; index += 1) {
        const angle = randomRange(0, Math.PI * 2);
        const speed = randomRange(0.9, 5.8);
        this.bursts.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: randomRange(1, 3.2),
          life: randomRange(0.6, 1.1),
          alpha: 1,
          color
        });
      }
    }

    drawBackground() {
      const ctx = this.context;
      const wave = Math.sin(this.time * 0.08) * 0.08;
      const main = ctx.createLinearGradient(0, 0, this.width, this.height);
      main.addColorStop(0, '#02030a');
      main.addColorStop(0.28 + wave, '#0d1434');
      main.addColorStop(0.62, '#241442');
      main.addColorStop(1, '#04040b');
      ctx.fillStyle = main;
      ctx.fillRect(0, 0, this.width, this.height);

      this.drawNebula(this.width * 0.22 + Math.sin(this.time * 0.11) * 34, this.height * 0.18, this.width * 0.62, 'rgba(244,182,215,0.13)', 'rgba(141,123,255,0.055)');
      this.drawNebula(this.width * 0.78, this.height * 0.72 + Math.cos(this.time * 0.09) * 30, this.width * 0.52, 'rgba(243,211,123,0.08)', 'rgba(255,215,233,0.035)');
      if (this.quality !== 'low') {
        this.drawAurora();
        this.drawClouds();
      }
    }

    drawNebula(x, y, radius, colorA, colorB) {
      const ctx = this.context;
      const nebula = ctx.createRadialGradient(x, y, 10, x, y, radius);
      nebula.addColorStop(0, colorA);
      nebula.addColorStop(0.5, colorB);
      nebula.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = nebula;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    drawAurora() {
      const ctx = this.context;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      for (let band = 0; band < 3; band += 1) {
        const y = this.height * (0.18 + band * 0.09);
        const gradient = ctx.createLinearGradient(0, y, this.width, y + 130);
        gradient.addColorStop(0, 'rgba(141,123,255,0)');
        gradient.addColorStop(0.45, `rgba(141,123,255,${0.035 + band * 0.012})`);
        gradient.addColorStop(0.68, `rgba(244,182,215,${0.025 + band * 0.01})`);
        gradient.addColorStop(1, 'rgba(141,123,255,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= this.width; x += 80) {
          ctx.lineTo(x, y + Math.sin(this.time * 0.18 + x * 0.01 + band) * 38 + band * 22);
        }
        ctx.lineTo(this.width, y + 190);
        ctx.lineTo(0, y + 160);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    drawClouds() {
      const ctx = this.context;
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.filter = 'blur(18px)';
      ctx.fillStyle = '#ffd7e9';
      for (let i = 0; i < 4; i += 1) {
        const x = ((this.time * 8 + i * this.width * 0.34) % (this.width + 260)) - 130;
        const y = this.height * (0.24 + i * 0.13);
        ctx.beginPath();
        ctx.ellipse(x, y, 220, 42, Math.sin(this.time * 0.04 + i) * 0.12, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    drawStars() {
      const ctx = this.context;
      this.stars.forEach((star) => {
        const shimmer = Math.sin(this.time * star.twinkle + star.phase) * 0.28;
        const alpha = clamp(star.alpha + shimmer, 0.05, 1);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.withAlpha(star.color, alpha);
        ctx.fill();
      });
    }

    drawDust() {
      const ctx = this.context;
      this.dust.forEach((particle) => {
        particle.y += particle.speed * particle.z;
        particle.x += Math.sin(this.time * 0.28 + particle.y * 0.02) * 0.06 + particle.drift;
        if (particle.y > this.height + 6) {
          particle.y = -6;
          particle.x = Math.random() * this.width;
        }
        if (particle.x < -6) particle.x = this.width + 6;
        if (particle.x > this.width + 6) particle.x = -6;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * particle.z, 0, Math.PI * 2);
        ctx.fillStyle = this.withAlpha(particle.color, particle.alpha);
        ctx.fill();
      });
    }

    drawFloaters() {
      const ctx = this.context;
      this.floaters.forEach((item, index) => {
        item.x += item.vx + Math.sin(this.time * 0.25 + index) * 0.08;
        item.y += item.vy;
        item.rotation += item.spin;
        if (item.y > this.height + 30 || item.x < -40 || item.x > this.width + 40) Object.assign(item, this.createFloater(), { y: -20 });

        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);
        ctx.globalAlpha = item.alpha;
        if (item.type === 'petal') {
          ctx.fillStyle = '#ffd7e9';
          ctx.beginPath();
          ctx.ellipse(0, 0, item.size * 0.55, item.size, 0.6, 0, Math.PI * 2);
          ctx.fill();
        } else if (item.type === 'feather') {
          ctx.strokeStyle = 'rgba(255,255,255,0.72)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, -item.size);
          ctx.quadraticCurveTo(item.size * 0.65, 0, 0, item.size);
          ctx.quadraticCurveTo(-item.size * 0.5, 0, 0, -item.size);
          ctx.stroke();
        } else {
          ctx.fillStyle = '#fff1b8';
          ctx.beginPath();
          ctx.arc(0, 0, item.size * 0.22, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
    }

    drawShootingStars() {
      const chance = this.quality === 'high' ? 0.0045 : 0.0022;
      if (Math.random() < chance && this.shootingStars.length < 2) {
        this.shootingStars.push({ x: randomRange(this.width * 0.1, this.width * 0.95), y: randomRange(20, this.height * 0.42), length: randomRange(90, 180), speed: randomRange(8, 13), alpha: 1 });
      }
      const ctx = this.context;
      this.shootingStars = this.shootingStars.filter((star) => star.alpha > 0.02);
      this.shootingStars.forEach((star) => {
        const gradient = ctx.createLinearGradient(star.x, star.y, star.x - star.length, star.y + star.length * 0.34);
        gradient.addColorStop(0, `rgba(255,255,255,${star.alpha})`);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x - star.length, star.y + star.length * 0.34);
        ctx.stroke();
        star.x += star.speed;
        star.y += star.speed * 0.3;
        star.alpha *= 0.965;
      });
    }

    drawBursts() {
      const ctx = this.context;
      this.bursts = this.bursts.filter((particle) => particle.life > 0.01);
      this.bursts.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.985;
        particle.vy *= 0.985;
        particle.life -= 0.018;
        particle.alpha = clamp(particle.life, 0, 1);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.withAlpha(particle.color, particle.alpha);
        ctx.fill();
      });
    }

    withAlpha(hex, alpha) {
      const value = hex.replace('#', '');
      const bigint = parseInt(value, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r},${g},${b},${alpha})`;
    }

    animate(timestamp) {
      if (!this.running) return;
      const delta = Math.min((timestamp - this.lastFrame) / 1000 || 0.016, 0.032);
      this.lastFrame = timestamp;
      this.time += delta;
      this.drawBackground();
      this.drawDust();
      this.drawFloaters();
      this.drawStars();
      if (this.quality !== 'low') this.drawShootingStars();
      this.drawBursts();
      this.frameHandle = requestAnimationFrame(this.animate);
    }

    destroy() {
      this.stop();
      window.removeEventListener('resize', this.resize);
    }
  }

  namespace.BackgroundParticles = BackgroundParticles;
})();
