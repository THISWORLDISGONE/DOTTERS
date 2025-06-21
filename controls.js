// UI Control Handlers
document.addEventListener('DOMContentLoaded', () => {
  // Particle Size Control
  const sizeSlider = document.getElementById('particleSize');
  const sizeValue = document.getElementById('sizeValue');
  sizeSlider.addEventListener('input', () => {
    sizeValue.textContent = sizeSlider.value;
    if (window.DOTTERS) {
      window.DOTTERS.updateParticleSize(parseInt(sizeSlider.value));
    }
  });

  // Fade Speed Control
  const fadeSlider = document.getElementById('fadeSpeed');
  const fadeValue = document.getElementById('fadeValue');
  fadeSlider.addEventListener('input', () => {
    fadeValue.textContent = fadeSlider.value;
    if (window.DOTTERS) {
      window.DOTTERS.updateFadeSpeed(parseFloat(fadeSlider.value));
    }
  });

  // Character Set Control
  const charSetSelect = document.getElementById('charSet');
  charSetSelect.addEventListener('change', () => {
    const sets = {
      default: [" ", "*", "•", "o", "0", "O", "●"],
      simple: [" ", "#", "$", "%", "&"],
      geometric: [" ", "■", "▲", "●", "◆"]
    };
    if (window.DOTTERS) {
      window.DOTTERS.updateCharSet(sets[charSetSelect.value]);
    }
  });

  // Clear Canvas
  document.getElementById('clearBtn').addEventListener('click', () => {
    if (window.DOTTERS) window.DOTTERS.clearCanvas();
  });

  // Pause/Resume
  const pauseBtn = document.getElementById('pauseBtn');
  pauseBtn.addEventListener('click', () => {
    if (window.DOTTERS) {
      const paused = window.DOTTERS.togglePause();
      pauseBtn.textContent = paused ? "Resume" : "Pause";
    }
  });

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && window.DOTTERS) window.DOTTERS.clearCanvas();
    if (e.code === 'KeyP' && window.DOTTERS) {
      const paused = window.DOTTERS.togglePause();
      pauseBtn.textContent = paused ? "Resume" : "Pause";
    }
  });
});

// Touch support for mobile
document.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (window.DOTTERS) {
    const touch = e.touches[0];
    window.DOTTERS.handleTouch(touch.clientX, touch.clientY);
  }
}, { passive: false });