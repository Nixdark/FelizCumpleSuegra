(function () {
  'use strict';

  window.CumpleSuegra = window.CumpleSuegra || {};

  window.CumpleSuegra.CONFIG = {
    PARTICLE_COUNT: {
      low: 160,
      medium: 320,
      high: 560
    },
    MESSAGE_SPEED: {
      min: 20,
      max: 54,
      pause: 220
    },
    LETTER_SPEED: {
      min: 18,
      max: 48,
      pause: 180
    },
    COUNTDOWN_TIME: 980,
    GALLERY_TIME: 21000,
    FIREWORK_POWER: 1.25,
    MUSIC_VOLUME: 0.2,
    LETTER_VOLUME: 0.16,
    SHAKE_INTENSITY: 7,
    CAMERA: {
      idleZoom: 1.035,
      idleDuration: 14,
      parallaxStrength: 12,
      finalZoom: 1.08,
      finalDuration: 11
    },
    CINEMATIC: {
      introStars: 36,
      outroPhraseDelay: 2800,
      outroFadeDuration: 6500,
      outroZoomDuration: 12,
      replayDelay: 1800
    },
    MOBILE: {
      maxParticles: 240,
      blurThreshold: 900
    },
    HIGHLIGHT_WORDS: ['Gracias', 'Familia', 'familia', 'Sonrisa', 'sonrisa', 'Cariño', 'cariño', 'especiales', 'especial'],
    OUTRO_LINES: [
      'Gracias por compartir este momento...',
      'Esperamos haber dibujado una sonrisa en tu rostro...',
      'Con todo nuestro cariño...',
      '♡ Tu hija y tu yerno ♡'
    ]
  };
})();
