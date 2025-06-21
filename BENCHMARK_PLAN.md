# DOTTERS Performance Benchmark Plan

## 1. Benchmark Objectives
- Determine particle count threshold where FPS drops below 60
- Identify performance bottlenecks in rendering pipeline
- Establish baseline metrics for optimization comparisons
- Evaluate impact of grid size and resolution on performance

## 2. Test Scenarios
```mermaid
graph LR
    S[Test Scenarios] --> P[Particle Count]
    S --> G[Grid Size]
    S --> R[Resolution]
    
    P --> P1[100 particles]
    P --> P2[200 particles]
    P --> P3[300 particles]
    P --> P4[400 particles]
    P --> P5[500 particles]
    
    G --> G1[10px]
    G --> G2[15px]
    G --> G3[20px]
    
    R --> R1[1280x720]
    R --> R2[1920x1080]
    R --> R3[2560x1440]
```

## 3. Implementation Steps

### File: DOTTERS.js
1. **Add FPS counter** ([`DOTTERS.js:26`](DOTTERS.js:26)):
   ```js
   let fps = 0;
   let frameCount = 0;
   let lastFpsUpdate = 0;
   
   function draw() {
     // Existing code
     frameCount++;
     
     // Update FPS every second
     if (millis() - lastFpsUpdate > 1000) {
       fps = frameCount;
       frameCount = 0;
       lastFpsUpdate = millis();
     }
   }
   ```

2. **Create particle generator** ([`DOTTERS.js:92`](DOTTERS.js:92)):
   ```js
   function generateParticles(count) {
     for (let i = 0; i < count; i++) {
       particles.push({
         pos: new p5.Vector(random(width), random(height)),
         vel: new p5.Vector(random(-1, 1), random(-1, 1)).mult(2),
         life: 500
       });
     }
   }
   ```

3. **Add benchmark mode** ([`DOTTERS.js:120`](DOTTERS.js:120)):
   ```js
   let benchmarkMode = false;
   let currentTest = 0;
   const testCases = [
     {particles: 100, size: 15, width: 1280, height: 720},
     {particles: 200, size: 15, width: 1280, height: 720},
     {particles: 300, size: 15, width: 1280, height: 720},
     {particles: 400, size: 15, width: 1280, height: 720},
     {particles: 500, size: 15, width: 1280, height: 720},
     // Additional test cases
   ];
   
   function toggleBenchmark() {
     benchmarkMode = !benchmarkMode;
     if (benchmarkMode) runNextTest();
     return benchmarkMode;
   }
   
   function runNextTest() {
     if (currentTest >= testCases.length) {
       benchmarkMode = false;
       return;
     }
     
     const test = testCases[currentTest];
     updateParticleSize(test.size);
     resizeCanvas(test.width, test.height);
     clearCanvas();
     generateParticles(test.particles);
     
     // Run test for 5 seconds
     setTimeout(() => {
       recordResults(test);
       currentTest++;
       runNextTest();
     }, 5000);
   }
   ```

### File: controls.js
1. **Add benchmark UI controls** ([`controls.js:1`](controls.js:1)):
   ```js
   // Add to DOMContentLoaded
   const benchmarkBtn = document.getElementById('benchmarkBtn');
   benchmarkBtn.addEventListener('click', () => {
     if (window.DOTTERS) {
       const running = window.DOTTERS.toggleBenchmark();
       benchmarkBtn.textContent = running ? "Stop Benchmark" : "Start Benchmark";
     }
   });
   ```

## 4. Metrics Collection
```mermaid
flowchart TD
    Start[Start Benchmark] --> Init[Initialize Test Case]
    Init --> Run[Run for 5 seconds]
    Run --> Collect[Collect FPS Metrics]
    Collect --> Next{More cases?}
    Next -->|Yes| Init
    Next -->|No| Report[Generate Report]
    Report --> End[End Benchmark]
```

## 5. Visualization Approach
- Implement real-time performance graph using p5.js
- Output CSV data with columns: 
  `test_case,particle_count,grid_size,resolution,avg_fps,min_fps`
- Create summary table in UI showing:
  - Test parameters
  - Average FPS
  - Min FPS
  - Performance rating

## 6. Proposed Timeline
```mermaid
gantt
    title Benchmark Implementation Timeline
    dateFormat  YYYY-MM-DD
    section Implementation
    FPS Counter         :a1, 2025-06-22, 1d
    Particle Generator  :a2, after a1, 1d
    Test Harness        :a3, after a2, 2d
    section Testing
    Validation          :a4, after a3, 1d
    Data Collection     :a5, after a4, 2d
```

## Next Steps
1. Review benchmark plan
2. Implement benchmark features
3. Execute tests across configurations
4. Analyze results and propose optimizations