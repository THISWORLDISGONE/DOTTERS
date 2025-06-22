// Benchmarking variables
let fps = 0;
let frameCount = 0;
let lastFpsUpdate = 0;
let benchmarkMode = false;
let currentTest = null;
let testStartTime = 0;
let testResults = [];
let testCases = [
  { particles: 100, size: 15, fade: 0.05 },
  { particles: 500, size: 15, fade: 0.05 },
  { particles: 100, size: 30, fade: 0.05 },
  { particles: 500, size: 30, fade: 0.05 }
];

let size = 15;
let fadeFactor = 0.05; // Base fade speed
let baseLife = 200; // Default life duration
let startSize = 8; // Default starting size
let paused = false;
let emergencyMode = false; // For critical performance situations
let lastEmergencyActivation = 0;

// Dynamic lifespan optimization parameters
let autoLifespan = true;
let targetFps = 50;
let hysteresis = 3; // ±FPS buffer zone
const MAX_LIFE = 300;
const MIN_LIFE = 50;
const ADJUSTMENT_RATE = 0.05;
let lastAdjustmentTime = 0;
const ADJUSTMENT_COOLDOWN = 1000; // ms

// Define multiple glyph sets
const glyphSets = {
  default: [" ", "*", "•", "o", "0", "O", "●"],
  minimal: [" ", ".", ":", "-", "=", "+", "#"],
  blocks: [" ", "▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"],
  symbols: [" ", "○", "◔", "◑", "◕", "⬤", "✶", "✺"],
  ascii: [" ", ".", ":", ";", "o", "O", "0", "@"]
};

let chars = [...glyphSets.default]; // Start with default set
let data,
		particles = [],
		activePixels = new Set(), // Track active (non-zero) pixels for fadeout
		spatialGrid = null, // For spatial partitioning
		particlePool = []; // Object pool for particles

function setup() {
	createCanvas(~~(windowWidth/size)*size, ~~(windowHeight/size)*size);
	textFont("monospace", size*2);
	data = new Array(width/size*height/size).fill().map(_ => 0);
  
  // Expose functions to global scope for controls
  window.DOTTERS = {
    updateParticleSize,
    updateStartSize,
    updateLifeSize,
    updateFadeSpeed,
    updateCharSet,
    clearCanvas,
    togglePause,
    handleTouch,
    toggleBenchmark,
    generateParticles,
    setBackgroundColor,
    setTextColor,
    setFont,
    setShapeMode,
    setGlyphMode,
    setAutoLifespan,
    setTargetFps,
    setHysteresis
  };
}

function draw() {
  if (paused) return;
  
  // Adjust lifespan dynamically if enabled
  if (autoLifespan) {
    adjustLifespan();
  }
  
  // Emergency performance mode activation
  if (fps > 0 && fps < 30 && millis() - lastEmergencyActivation > 5000) {
    activateEmergencyMode();
  }
  
  // FPS calculation
  frameCount++;
  if (millis() - lastFpsUpdate > 1000) {
    fps = frameCount;
    frameCount = 0;
    lastFpsUpdate = millis();
  }
  
  // Emergency mode cooldown
  if (emergencyMode && fps > 40 && millis() - lastEmergencyActivation > 3000) {
    emergencyMode = false;
    fadeFactor = 0.05; // Reset to default
  }
  
  // Benchmark test monitoring
  if (benchmarkMode && currentTest !== null && millis() - testStartTime > 10000 && !emergencyMode) {
    recordResults();
    runNextTest();
  }
  
 background(bgColor[0], bgColor[1], bgColor[2]);
 // Removed particle sorting for performance
 
 // Draw FPS counter with emergency mode indicator
 fill(emergencyMode ? 255 : 0, emergencyMode ? 0 : 0, emergencyMode ? 0 : 0);
 textSize(16);
 text(`FPS: ${fps}${emergencyMode ? ' (EMERGENCY MODE)' : ''}`, 10, 20);
 
 // Draw benchmark status
 if (benchmarkMode) {
   text(`Test ${currentTest}/${testCases.length}`, 10, 40);
 }
	
	// Fade out active pixels based on their current value
	for (let i of activePixels) {
		// Higher values fade faster, lower values fade slower
		const decay = fadeFactor * data[i];
		data[i] = Math.max(0, data[i] - decay);
		
		// Remove fully decayed pixels
		if (data[i] < 0.1) {
			activePixels.delete(i);
			data[i] = 0;
		}
	}
	
	// Spatial partitioning optimization (reused between frames)
	const gridSize = size * 2;
	const gridCols = Math.ceil(width / gridSize);
	const gridRows = Math.ceil(height / gridSize);
	const gridCellCount = gridCols * gridRows;
	
	// Initialize or reuse spatial grid
	if (!spatialGrid || spatialGrid.length !== gridCellCount) {
	  spatialGrid = Array(gridCellCount).fill().map(() => []);
	} else {
	  // Clear existing grid for reuse
	  for (let i = 0; i < gridCellCount; i++) {
	    spatialGrid[i] = [];
	  }
	}
	
	// Assign particles to grid cells
	for (let i = 0; i < particles.length; i++) {
	  const part = particles[i];
	  const col = Math.floor(part.pos.x / gridSize);
	  const row = Math.floor(part.pos.y / gridSize);
	  if (col >= 0 && col < gridCols && row >= 0 && row < gridRows) {
	    spatialGrid[row * gridCols + col].push(part);
	  }
	}
	
	// Process particles in grid cells
	for (let row = 0; row < gridRows; row++) {
	  for (let col = 0; col < gridCols; col++) {
	    const cellIndex = row * gridCols + col;
	    const cellParticles = spatialGrid[cellIndex];
	    
	    // Only process particles in visible cells
	    for (let part of cellParticles) {
	      // Calculate grid bounds around particle
	      const gridX = Math.floor(part.pos.x / size);
	      const gridY = Math.floor(part.pos.y / size);
	      const radius = 8; // Reduced radius for performance
		
		for(let x = Math.max(0, gridX - radius); x <= Math.min(width/size - 1, gridX + radius); x++) {
			for(let y = Math.max(0, gridY - radius); y <= Math.min(height/size - 1, gridY + radius); y++) {
				const i = y * (width/size) + x;
				const dx = part.pos.x - (x * size);
				const dy = part.pos.y - (y * size);
				const distSq = dx * dx + dy * dy;
				let radiusSq = 100 * 100;
				if (emergencyMode) {
				  radiusSq = 50 * 50; // Reduce influence radius in emergency mode
				}
				
				if(distSq < radiusSq) {
					const dist = Math.sqrt(distSq);
					const ds = dist/5;
					data[i] += Math.round((chars.length-1)/(ds < 1 ? 1 : ds));
					if(data[i] > chars.length-1) data[i] = chars.length-1;
					activePixels.add(i);
				}
			}
		}
	    }
	  }
	}
	
	// Draw only active pixels
	fill(textColor[0], textColor[1], textColor[2]);
	for(let i of activePixels) {
		text(chars[Math.floor(data[i])], (i % (width/size)) * size, Math.floor(i / (width/size)) * size);
	}
	
	// Object pooling for particles
	for (let i = particles.length - 1; i >= 0; i--) {
	  const p = particles[i];
	  p.pos.add(p.vel);
	  
	  // Simplify movement in emergency mode
	  if (!emergencyMode) {
	    p.vel.rotate(noise(p.pos.x/100, p.pos.y/100)-0.5);
	  }
	  
	  // Boundary checks
	  if(p.pos.x < -20) p.pos.x = width+20;
	  if(p.pos.x > width+20) p.pos.x = -20;
	  if(p.pos.y < -20) p.pos.y = height+20;
	  if(p.pos.y > height+20) p.pos.y = -20;
	  
	  // Calculate particle age
	  p.age = 1 - (p.life / p.baseLife);
	  
	  // Apply droplet shape transformation
	  if (p.shapeMode === 'droplet' && p.age > 0.7) {
	    const dropletFactor = map(p.age, 0.7, 1, 0, 1);
	    p.width = p.size * (1 + dropletFactor * 0.5);
	    p.height = p.size * (1 - dropletFactor * 0.3);
	  }
	  
	  // Update glyph for animated sequences
	  if (p.glyphMode === 'animated' && p.glyphSequence && p.glyphSequence.length > 0) {
	    const seqIndex = floor(map(p.age, 0, 1, 0, p.glyphSequence.length));
	    p.char = p.glyphSequence[seqIndex];
	  }
	  
	  p.life--;
	  if (p.life <= 0) {
	    // Return particle to pool
	    particlePool.push(p);
	    particles.splice(i, 1);
	  }
	}
}

// Dynamic lifespan adjustment
function adjustLifespan() {
  // Apply adjustment cooldown
  if (millis() - lastAdjustmentTime < ADJUSTMENT_COOLDOWN) return;
  
  // Calculate hysteresis boundaries
  const upperBound = targetFps + hysteresis;
  const lowerBound = targetFps - hysteresis;
  
  if (fps > lowerBound && fps < upperBound) {
    // Within hysteresis band - no adjustment needed
    return;
  }
  
  const fpsDiff = targetFps - fps;
  const adjustment = fpsDiff * ADJUSTMENT_RATE;
  
  // Apply with bounds checking
  baseLife = constrain(
    baseLife + adjustment,
    MIN_LIFE,
    MAX_LIFE
  );
  
  lastAdjustmentTime = millis();
}

// Emergency performance measures
function activateEmergencyMode() {
	emergencyMode = true;
	lastEmergencyActivation = millis();
	
	// 1. Remove oldest 50% of particles
	const particlesToKeep = Math.floor(particles.length / 2);
	particles = particles.slice(-particlesToKeep);
	
	// 2. Increase fade rate to clear canvas faster
	fadeFactor = 0.2;
	
	// 3. Skip next frame to allow system to catch up
	frameRate(30);
	setTimeout(() => frameRate(60), 1000);
	
	console.log("Emergency mode activated");
}

function mouseDragged(){
  // Block generation if FPS drops below 50
  if (fps < 50) {
    // Visual feedback - red FPS counter
    fill(255, 0, 0);
    textSize(16);
    text(`FPS: ${fps} (BLOCKED)`, 10, 20);
    return;
  }
  
  if (particles.length > 500) return;
  
  // Create new particle using object pool
  let particle;
  if (particlePool.length > 0) {
    particle = particlePool.pop();
    particle.pos.set(mouseX, mouseY);
    particle.vel.set(mouseX-pmouseX, mouseY-pmouseY).div(4);
    particle.life = baseLife;
    particle.size = startSize;
  } else {
    particle = {
      pos: new p5.Vector(mouseX, mouseY),
      vel: new p5.Vector(mouseX-pmouseX, mouseY-pmouseY).div(4),
      life: baseLife,
      baseLife: baseLife,
      size: startSize,
      shapeMode: globalShapeMode,
      glyphMode: globalGlyphMode,
      glyphSequence: globalGlyphMode === 'animated' ?
        [...glyphSets.default] : []
    };
  }
  
  if(new p5.Vector(mouseX-pmouseX, mouseY-pmouseY).mag() > 5) {
    particles.push(particle);
  }
}

// Control functions
function updateParticleSize(newSize) {
  size = newSize;
  textFont("monospace", size*2);
  resizeCanvas(~~(windowWidth/size)*size, ~~(windowHeight/size)*size);
  data = new Array(width/size*height/size).fill().map(_ => 0);
  activePixels.clear();
}

function updateStartSize(newSize) {
  startSize = newSize;
}

function updateLifeSize(newLife) {
  baseLife = newLife;
}

function updateFadeSpeed(newSpeed) {
  fadeFactor = newSpeed;
}

function updateCharSet(setName) {
  if (glyphSets[setName]) {
    chars = [...glyphSets[setName]];
  } else {
    console.warn(`Glyph set "${setName}" not found. Using default set.`);
    chars = [...glyphSets.default];
  }
}

function clearCanvas() {
  particles = [];
  data.fill(0);
  activePixels.clear();
}

// Map function implementation (missing in p5.js)
function map(n, start1, stop1, start2, stop2) {
  return ((n - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
}

// Implement new control functions
let bgColor = [255, 255, 255];
let textColor = [0, 0, 0];
let currentFont = "monospace";

function setBackgroundColor(color) {
  bgColor = color;
}

function setTextColor(color) {
  textColor = color;
}

function setFont(font) {
  currentFont = font;
  textFont(currentFont, size*2);
}

let globalShapeMode = 'circle';
let globalGlyphMode = 'static';

function setShapeMode(mode) {
  globalShapeMode = mode;
}

function setGlyphMode(mode) {
  globalGlyphMode = mode;
}

// New control functions for dynamic lifespan
function setAutoLifespan(enabled) {
  autoLifespan = enabled;
}

function setTargetFps(fps) {
  targetFps = fps;
}

function setHysteresis(value) {
  hysteresis = value;
}

function togglePause() {
  paused = !paused;
  return paused;
}

// Generate particles for benchmark tests
function generateParticles(count) {
  particles = [];
  
  for (let i = 0; i < count; i++) {
    // Create new particle using object pool
    let particle;
    if (particlePool.length > 0) {
      particle = particlePool.pop();
      particle.pos.set(random(width), random(height));
      particle.vel.set(random(-1, 1), random(-1, 1)).mult(2);
      particle.life = 10000;
    } else {
      particle = {
        pos: new p5.Vector(random(width), random(height)),
        vel: new p5.Vector(random(-1, 1), random(-1, 1)).mult(2),
        life: 10000,
        baseLife: 10000,
        size: startSize,
        shapeMode: 'circle',
        glyphMode: 'static',
        glyphSequence: []
      };
    }
    particles.push(particle);
  }
}

// Benchmark control functions
function toggleBenchmark() {
  benchmarkMode = !benchmarkMode;
  if (benchmarkMode) {
    // Start benchmark tests
    currentTest = 0;
    runNextTest();
  } else {
    // Stop benchmark tests
    currentTest = null;
    testResults = [];
    clearCanvas();
  }
  return benchmarkMode;
}

function runNextTest() {
  if (currentTest === null || currentTest >= testCases.length) {
    // Benchmark complete
    generateCSV();
    toggleBenchmark();
    return;
  }
  
  const test = testCases[currentTest];
  // Apply test parameters
  size = test.size;
  fadeFactor = test.fade;
  resizeCanvas(~~(windowWidth/size)*size, ~~(windowHeight/size)*size);
  data = new Array(width/size*height/size).fill().map(_ => 0);
  activePixels.clear();
  
  // Generate particles
  generateParticles(test.particles);
  
  // Start test
  testStartTime = millis();
  currentTest++;
}

function recordResults() {
  const test = testCases[currentTest-1];
  testResults.push({
    particles: test.particles,
    size: test.size,
    fade: test.fade,
    fps: fps,
    timestamp: new Date().toISOString()
  });
}

function generateCSV() {
  let csv = "Particle Count,Size,Fade Factor,FPS,Timestamp\n";
  for (const result of testResults) {
    csv += `${result.particles},${result.size},${result.fade},${result.fps},${result.timestamp}\n`;
  }
  return csv;
}

function handleTouch(x, y) {
  // Block generation if FPS drops below 50
  if (fps < 50) return;
  
  if (particles.length > 500) return;
  particles.push({
    pos: new p5.Vector(x, y),
    vel: new p5.Vector(random(-1, 1), random(-1, 1)).mult(2),
    life: 200,
    baseLife: 200,
    size: startSize,
    shapeMode: globalShapeMode,
    glyphMode: globalGlyphMode,
    glyphSequence: globalGlyphMode === 'animated' ?
      [...glyphSets.default] : []
  });
}