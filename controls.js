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
  
  // Starting Size Control
  const startSizeSlider = document.getElementById('startSize');
  const startSizeValue = document.getElementById('startSizeValue');
  startSizeSlider.addEventListener('input', () => {
    startSizeValue.textContent = startSizeSlider.value;
    if (window.DOTTERS) {
      window.DOTTERS.updateStartSize(parseInt(startSizeSlider.value));
    }
  });
  
  // Life Duration Control
  const lifeSizeSlider = document.getElementById('lifeSize');
  const lifeSizeValue = document.getElementById('lifeSizeValue');
  lifeSizeSlider.addEventListener('input', () => {
    lifeSizeValue.textContent = lifeSizeSlider.value;
    if (window.DOTTERS) {
      window.DOTTERS.updateLifeSize(parseInt(lifeSizeSlider.value));
    }
  });

  // Character Set Control
  const charSetSelect = document.getElementById('charSet');
  charSetSelect.addEventListener('change', () => {
    if (window.DOTTERS) {
      window.DOTTERS.updateCharSet(charSetSelect.value);
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

  // Benchmark Button
  const benchmarkBtn = document.getElementById('benchmarkBtn');
  const resultsContainer = document.getElementById('resultsContainer');
  benchmarkBtn.addEventListener('click', () => {
    if (window.DOTTERS) {
      const benchmarking = window.DOTTERS.toggleBenchmark();
      benchmarkBtn.textContent = benchmarking ? "Stop Benchmark" : "Run Benchmark";
      resultsContainer.style.display = benchmarking ? "block" : "none";
    }
  });
  
  // Set benchmark completion handler
  if (window.DOTTERS) {
    window.DOTTERS.onBenchmarkComplete = function(results) {
      // Store results in localStorage for the results page
      localStorage.setItem('dotterBenchmarkResults', JSON.stringify(results));
      
      // Navigate to results page
      window.location.href = 'benchmark-results.html';
      
      // Re-enable benchmark button
      document.getElementById('benchmarkBtn').disabled = false;
      document.getElementById('benchmarkBtn').textContent = 'Run Benchmark';
    };
  }

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && window.DOTTERS) window.DOTTERS.clearCanvas();
    if (e.code === 'KeyP' && window.DOTTERS) {
      const paused = window.DOTTERS.togglePause();
      pauseBtn.textContent = paused ? "Resume" : "Pause";
    }
    if (e.code === 'KeyB' && window.DOTTERS) {
      const benchmarking = window.DOTTERS.toggleBenchmark();
      benchmarkBtn.textContent = benchmarking ? "Stop Benchmark" : "Run Benchmark";
      resultsContainer.style.display = benchmarking ? "block" : "none";
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
