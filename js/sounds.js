(function () {
  'use strict';

  const namespace = (window.CumpleSuegra = window.CumpleSuegra || {});

  class SoundManager {
    constructor() {
      this.enabled = true;
      this.initialized = false;
      this.masterVolume = 0.82;
      this.music = null;
      this.sounds = new Map();
      this.isLocalFile = window.location.protocol === 'file:';
      this.musicPaths = {
        intro: 'assets/audio/music/ambient_intro.mp3',
        letter: 'assets/audio/music/ambient_letter.mp3',
        birthday: 'assets/audio/music/happy_birthday.mp3'
      };
      this.effectPaths = {
        whoosh: 'assets/audio/effects/whoosh.mp3',
        sparkle: 'assets/audio/effects/sparkle.mp3',
        paperDrop: 'assets/audio/effects/paper_drop.mp3',
        paperOpen: 'assets/audio/effects/paper_open.mp3',
        paperClose: 'assets/audio/effects/paper_close.mp3',
        sealBreak: 'assets/audio/effects/seal_break.mp3',
        penWrite: 'assets/audio/effects/pen_write.mp3',
        buttonClick: 'assets/audio/effects/button_click.mp3',
        countdown: 'assets/audio/effects/countdown.mp3',
        candleLight: 'assets/audio/effects/candle_light.mp3',
        magic: 'assets/audio/effects/magic.mp3',
        fireworks: 'assets/audio/effects/fireworks.mp3',
        confetti: 'assets/audio/effects/confetti.mp3',
        heart: 'assets/audio/effects/heart.mp3',
        success: 'assets/audio/effects/success.mp3',
        wind: 'assets/audio/effects/magic.mp3',
        bells: 'assets/audio/effects/sparkle.mp3',
        crystals: 'assets/audio/effects/sparkle.mp3',
        feathers: 'assets/audio/effects/paper_drop.mp3',
        fairy: 'assets/audio/effects/magic.mp3',
        breath: 'assets/audio/effects/whoosh.mp3',
        camera: 'assets/audio/effects/paper_open.mp3'
      };
    }

    init() {
      if (this.initialized) return;
      this.initialized = true;
      if (window.Howler) window.Howler.volume(this.masterVolume);
      if (this.isLocalFile) {
        this.enabled = false;
        return;
      }
    }

    createHowl(src, loop, volume) {
      if (!window.Howl) return null;
      return new window.Howl({ src: [src], loop, volume, html5: true, preload: true });
    }

    effectVolume(key) {
      if (['penWrite', 'paperDrop', 'paperOpen', 'feathers', 'breath'].includes(key)) return 0.14;
      if (['fireworks', 'success', 'confetti', 'heart'].includes(key)) return 0.42;
      if (['bells', 'crystals', 'fairy'].includes(key)) return 0.2;
      return 0.28;
    }

    unlock() {
      if (window.Howler?.ctx?.state === 'suspended') window.Howler.ctx.resume();
    }

    play(key) {
      return this.playOnce(key);
    }

    playOnce(key, options = {}) {
      if (!this.enabled || !this.initialized || this.isLocalFile) return null;
      const { duration = 0 } = options;
      let sound = this.sounds.get(key);
      if (!sound) {
        const src = this.effectPaths[key];
        if (!src) return null;
        sound = this.createHowl(src, false, this.effectVolume(key));
        if (sound) this.sounds.set(key, sound);
      }
      if (!sound) return null;
      try {
        const id = sound.play();
        if (duration > 0) {
          window.setTimeout(() => {
            try {
              sound.stop(id);
            } catch (error) {
              // Ignore short-lived sound stop errors.
            }
          }, duration);
        }
        return id;
      } catch (error) {
        return null;
      }
    }

    loop(key, volume = 0.12) {
      if (!this.enabled || !this.initialized) return null;
      const sound = this.sounds.get(key);
      if (!sound) return null;
      sound.loop(true);
      sound.volume(volume);
      return sound.play();
    }

    playMusic(name, targetVolume = 0.2) {
      this.crossFade(name, targetVolume, 1400);
    }

    crossFade(name, targetVolume = 0.2, duration = 1400) {
      if (!this.enabled || !window.Howl || this.isLocalFile) return;
      const src = this.musicPaths[name];
      if (!src) return;

      const previous = this.music;
      const next = this.createHowl(src, true, 0);
      this.music = next;
      if (!next) return;
      next.play();
      next.fade(0, targetVolume, duration);

      if (previous) {
        previous.fade(previous.volume(), 0, duration);
        previous.once('fade', () => previous.stop());
      }
    }

    setMusicVolume(volume, duration = 900) {
      this.fadeMusic(volume, duration);
    }

    fadeMusic(volume, duration = 900) {
      if (!this.music) return;
      this.music.fade(this.music.volume(), volume, duration);
    }

    stopMusic() {
      if (!this.music) return;
      const current = this.music;
      current.fade(current.volume(), 0, 900);
      current.once('fade', () => current.stop());
      this.music = null;
    }

    mute() {
      this.setEnabled(false);
    }

    resume() {
      this.setEnabled(true);
      this.unlock();
    }

    setEnabled(enabled) {
      this.enabled = enabled;
      if (window.Howler) window.Howler.mute(!enabled);
    }
  }

  namespace.SoundManager = SoundManager;
})();
