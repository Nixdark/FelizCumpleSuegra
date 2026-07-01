# CumpleSuegra

CumpleSuegra es una experiencia interactiva HTML5 pensada como una pequena pelicula de cumpleanos: fondo canvas vivo, escenas cinematograficas, audio con Howler, animaciones GSAP, torta interactiva, galeria de recuerdos, carta magica y final con fuegos artificiales.

## Caracteristicas

- Experiencia de una sola pantalla, sin recargas y compatible con GitHub Pages.
- Canvas optimizado con estrellas, nebulosas, polvo magico, fugaces y explosiones de particulas.
- Transiciones entre escenas con GSAP, wash de luz, blur, escala y profundidad.
- Torta CSS/HTML de tres pisos con cara, respiracion, parpadeo, ojos que siguen el cursor y velas interactivas.
- Galeria manual tipo album familiar, sin sliders ni librerias externas.
- Sobre y carta construidos con HTML/CSS, sello interactivo y escritura letra por letra.
- Sistema de audio modular con Howler.js para musica y efectos.
- Final con foto central, corazon de estrellas, confeti y fuegos artificiales.
- Diseno responsive desde 320 px hasta pantallas grandes.

## Tecnologias

- HTML5
- CSS3
- JavaScript ES6+
- Canvas API
- GSAP
- Howler.js
- Canvas Confetti
- html2canvas preparado por CDN

## Como ejecutar

Abre `index.html` directamente en Chrome, Edge, Firefox o Safari. La experiencia usa CDN para GSAP, Howler y Canvas Confetti, por lo que el navegador necesita internet la primera vez que cargue esas librerias.

## Fotos

La experiencia busca estas imagenes:

- `assets/fotos/foto1.jpg`
- `assets/fotos/foto2.jpg`
- `assets/fotos/final.jpg`

Ya se dejaron copias en esa carpeta a partir de los archivos que estaban dentro de `assets/audio/fotos`.

## Estructura

```text
Cumple_Suegra/
  index.html
  css/
    style.css
  js/
    app.js
    particles.js
    scenes.js
    sounds.js
    cake.js
    gallery.js
    fireworks.js
    utils.js
  assets/
    audio/
      music/
      effects/
    fotos/
    img/
    fonts/
```

## Licencia

MIT

## Autor

Proyecto creado como regalo interactivo de cumpleanos, con enfoque emocional, elegante y cinematografico.
