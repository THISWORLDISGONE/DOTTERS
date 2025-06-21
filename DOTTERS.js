// Why is this so oddly satisfying?

let size = 15;
let fadeFactor = 0.05; // Base fade speed
let paused = false;

let chars = [" ", "*", "•", "o", "0", "O", "●"], // These could be whatever... try something like [" ", "^", "*", ")", "%", "$", "#", "&"], or [" ", "•", "●", "⬤"]
		data,
		particles = [],
		activePixels = new Set(); // Track active (non-zero) pixels for fadeout

function setup() {
	createCanvas(~~(windowWidth/size)*size, ~~(windowHeight/size)*size);
	textFont("monospace", size*2);
	data = new Array(width/size*height/size).fill().map(_ => 0);
  
  // Expose functions to global scope for controls
  window.DOTTERS = {
    updateParticleSize,
    updateFadeSpeed,
    updateCharSet,
    clearCanvas,
    togglePause,
    handleTouch
  };
}

function draw() {
  if (paused) return;
  
	background(255);
	const ps = particles.sort((a, b) => a.vel.magSq()-b.vel.magSq());
	
	// Fade out active pixels based on their current value
	for (let i of Array.from(activePixels)) {
		// Higher values fade faster, lower values fade slower
		const decay = fadeFactor * data[i];
		data[i] = Math.max(0, data[i] - decay);
		
		// Remove fully decayed pixels
		if (data[i] < 0.1) {
			activePixels.delete(i);
			data[i] = 0;
		}
	}
	
	for(let part of ps) {
		// Calculate grid bounds around particle
		const gridX = Math.floor(part.pos.x / size);
		const gridY = Math.floor(part.pos.y / size);
		const radius = 10; // Only process 10 grid units around particle
		
		for(let x = Math.max(0, gridX - radius); x <= Math.min(width/size - 1, gridX + radius); x++) {
			for(let y = Math.max(0, gridY - radius); y <= Math.min(height/size - 1, gridY + radius); y++) {
				const i = y * (width/size) + x;
				const d = new p5.Vector(x * size, y * size);
				const dist = part.pos.dist(d);
				
				if(dist < 100) {
					const ds = dist/5;
					data[i] += Math.round((chars.length-1)/(ds < 1 ? 1 : ds));
					if(data[i] > chars.length-1) data[i] = chars.length-1;
					activePixels.add(i);
				}
			}
		}
	}
	
	// Draw only active pixels
	for(let i of activePixels) {
		text(chars[Math.floor(data[i])], (i % (width/size)) * size, Math.floor(i / (width/size)) * size);
	}
	
	for(let p of particles) {
		p.pos.add(p.vel);
		p.vel.rotate(noise(p.pos.x/100, p.pos.y/100)-0.5);
		if(p.pos.x < -20) p.pos.x = width+20;
		if(p.pos.x > width+20) p.pos.x = -20;
		if(p.pos.y < -20) p.pos.y = height+20;
		if(p.pos.y > height+20) p.pos.y = -20;
	}
}

function mouseDragged(){
	if(new p5.Vector(mouseX-pmouseX, mouseY-pmouseY).mag() > 5) particles.push({pos: new p5.Vector(mouseX, mouseY), vel: new p5.Vector(mouseX-pmouseX, mouseY-pmouseY).div(4)})
}

// Control functions
function updateParticleSize(newSize) {
  size = newSize;
  textFont("monospace", size*2);
  resizeCanvas(~~(windowWidth/size)*size, ~~(windowHeight/size)*size);
  data = new Array(width/size*height/size).fill().map(_ => 0);
  activePixels.clear();
}

function updateFadeSpeed(newSpeed) {
  fadeFactor = newSpeed;
}

function updateCharSet(newSet) {
  chars = newSet;
}

function clearCanvas() {
  particles = [];
  data.fill(0);
  activePixels.clear();
}

function togglePause() {
  paused = !paused;
  return paused;
}

function handleTouch(x, y) {
  particles.push({
    pos: new p5.Vector(x, y),
    vel: new p5.Vector(random(-1, 1), random(-1, 1)).mult(2)
  });
}