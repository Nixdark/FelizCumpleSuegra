(function () {
  'use strict';

  const namespace = (window.CumpleSuegra = window.CumpleSuegra || {});

  function normalizeTargets(target) {
    if (typeof target === 'string') return qsa(target);
    if (Array.isArray(target)) return target.filter(Boolean);
    if (target instanceof NodeList) return Array.from(target);
    if (target instanceof Element) return [target];
    return [];
  }

  function applyVars(target, vars = {}) {
    const elements = normalizeTargets(target);
    elements.forEach((element) => {
      if (!element || !(element instanceof Element)) return;

      const transformParts = [];
      if (Object.prototype.hasOwnProperty.call(vars, 'x')) transformParts.push(`translateX(${vars.x}px)`);
      if (Object.prototype.hasOwnProperty.call(vars, 'y')) transformParts.push(`translateY(${vars.y}px)`);
      if (Object.prototype.hasOwnProperty.call(vars, 'scale')) transformParts.push(`scale(${vars.scale})`);
      if (Object.prototype.hasOwnProperty.call(vars, 'scaleX')) transformParts.push(`scaleX(${vars.scaleX})`);
      if (Object.prototype.hasOwnProperty.call(vars, 'scaleY')) transformParts.push(`scaleY(${vars.scaleY})`);
      if (Object.prototype.hasOwnProperty.call(vars, 'rotation')) transformParts.push(`rotate(${vars.rotation}deg)`);
      if (Object.prototype.hasOwnProperty.call(vars, 'rotationX')) transformParts.push(`rotateX(${vars.rotationX}deg)`);
      if (Object.prototype.hasOwnProperty.call(vars, 'rotationY')) transformParts.push(`rotateY(${vars.rotationY}deg)`);

      if (transformParts.length) element.style.transform = transformParts.join(' ');
      if (Object.prototype.hasOwnProperty.call(vars, 'opacity')) element.style.opacity = vars.opacity;
      if (Object.prototype.hasOwnProperty.call(vars, 'filter')) element.style.filter = vars.filter;
      if (Object.prototype.hasOwnProperty.call(vars, 'display')) element.style.display = vars.display;
      if (Object.prototype.hasOwnProperty.call(vars, 'z')) element.style.zIndex = vars.z;
      if (Object.prototype.hasOwnProperty.call(vars, 'background')) element.style.background = vars.background;
      if (Object.prototype.hasOwnProperty.call(vars, 'textContent')) element.textContent = vars.textContent;
      if (Object.prototype.hasOwnProperty.call(vars, 'className')) element.className = vars.className;
    });
  }

  function createTweenPromise(target, vars = {}) {
    return new Promise((resolve) => {
      const duration = Number(vars.duration || 0) * 1000;
      vars.onStart?.();
      applyVars(target, vars);
      window.setTimeout(() => {
        vars.onComplete?.();
        resolve();
      }, Math.max(0, duration));
    });
  }

  if (!window.gsap) {
    const createTimeline = () => {
      let chain = Promise.resolve();
      const timeline = {
        fromTo(target, fromVars, toVars) {
          chain = chain.then(() => new Promise((resolve) => {
            const duration = Number(toVars.duration || 0) * 1000;
            const delay = Number(toVars.delay || 0) * 1000;
            const run = () => {
              applyVars(target, fromVars);
              window.setTimeout(() => {
                applyVars(target, toVars);
                window.setTimeout(() => {
                  toVars.onComplete?.();
                  resolve();
                }, Math.max(0, duration));
              }, Math.max(0, delay));
            };
            run();
          }));
          return this;
        },
        to(target, vars) {
          chain = chain.then(() => new Promise((resolve) => {
            const duration = Number(vars.duration || 0) * 1000;
            const delay = Number(vars.delay || 0) * 1000;
            const run = () => {
              vars.onStart?.();
              applyVars(target, vars);
              window.setTimeout(() => {
                vars.onComplete?.();
                resolve();
              }, Math.max(0, duration));
            };
            if (delay > 0) {
              window.setTimeout(run, delay);
            } else {
              run();
            }
          }));
          return this;
        },
        set(target, vars) {
          chain = chain.then(() => new Promise((resolve) => {
            applyVars(target, vars);
            resolve();
          }));
          return this;
        },
        kill() { return this; },
        then(resolve) {
          chain.then(() => resolve?.());
          return this;
        }
      };
      return timeline;
    };

    window.gsap = {
      to(target, vars) { return createTweenPromise(target, vars); },
      fromTo(target, fromVars, toVars) {
        return createTweenPromise(target, fromVars).then(() => createTweenPromise(target, toVars));
      },
      set(target, vars) { return createTweenPromise(target, vars); },
      timeline: createTimeline,
      killTweensOf() {}
    };
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function preloadImage(src) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve({ src, ok: true });
      image.onerror = () => resolve({ src, ok: false });
      image.src = src;
    });
  }

  function shouldReduceMotion() {
    return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  }

  function typeText({ element, text, minDelay = 28, maxDelay = 72, pauseDelay = 260, onLetter }) {
    let index = 0;
    element.textContent = '';

    return new Promise((resolve) => {
      const write = () => {
        if (index >= text.length) {
          resolve();
          return;
        }

        const character = text[index];
        element.textContent += character;
        index += 1;
        if (character.trim()) onLetter?.(character, index);

        const punctuation = /[.,;:!?\n]/.test(character);
        const delay = punctuation ? pauseDelay : randomRange(minDelay, maxDelay);
        window.setTimeout(write, delay);
      };

      write();
    });
  }

  function createElement(tag, className, attributes = {}) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }

  function typeRichText({ element, text, highlights = [], minDelay = 28, maxDelay = 72, pauseDelay = 260, onLetter }) {
    let index = 0;
    element.textContent = '';

    const sortedHighlights = [...highlights].sort((a, b) => b.length - a.length);

    return new Promise((resolve) => {
      const write = () => {
        if (index >= text.length) {
          resolve();
          return;
        }

        const match = sortedHighlights.find((word) => text.slice(index).startsWith(word));
        if (match) {
          const span = document.createElement('span');
          span.className = 'gold-word';
          element.appendChild(span);
          let innerIndex = 0;

          const writeHighlight = () => {
            if (innerIndex >= match.length) {
              index += match.length;
              window.gsap?.fromTo(span, { textShadow: '0 0 0 rgba(243,211,123,0)' }, { textShadow: '0 0 18px rgba(243,211,123,0.8)', duration: 0.45, yoyo: true, repeat: 1 });
              window.setTimeout(write, pauseDelay * 0.35);
              return;
            }
            span.textContent += match[innerIndex];
            innerIndex += 1;
            onLetter?.(match[innerIndex - 1], index + innerIndex);
            window.setTimeout(writeHighlight, randomRange(minDelay, maxDelay));
          };

          writeHighlight();
          return;
        }

        const character = text[index];
        element.appendChild(document.createTextNode(character));
        index += 1;
        if (character.trim()) onLetter?.(character, index);
        const punctuation = /[.,;:!?\n]/.test(character);
        window.setTimeout(write, punctuation ? pauseDelay : randomRange(minDelay, maxDelay));
      };

      write();
    });
  }

  namespace.utils = {
    clamp,
    randomRange,
    randomItem,
    wait,
    qs,
    qsa,
    preloadImage,
    shouldReduceMotion,
    typeText,
    typeRichText,
    createElement
  };
})();

