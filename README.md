# DOTTERS Visualization

An interactive particle visualization using p5.js where mouse movements create dynamic patterns.

![DOTTERS Visualization](https://github.com/THISWORLDISGONE/DOTTERS/raw/main/screenshot.gif)

## Features
- Interactive particle generation
- Performance optimizations:
  - Spatial grid reuse
  - Object pooling
  - Typed arrays
- Fadeout effect based on particle density
- Spatial partitioning for efficient rendering
- **NEW**: Real-time parameter controls (particle size, fade speed, character sets, starting size, life duration)
- **NEW**: Pause/resume functionality
- **NEW**: Mobile touch support
- **NEW**: Keyboard shortcuts

## How to Run
1. Open `index.html` in a web browser
2. Click and drag to create particle effects
3. Watch as patterns emerge and fade based on density
4. Use the control panel to adjust parameters in real-time

### Keyboard Shortcuts
- **Space**: Clear canvas
- **P**: Pause/resume animation

### Mobile Support
- Swipe to create particle effects
- Control panel automatically adjusts for mobile screens

## Performance Optimizations
- Only processes pixels near particles
- Tracks active pixels in typed arrays for fast access
- Fadeout proportional to pixel value
- Spatial grid reuse between frames
- Object pooling for particle recycling

## Requirements
- Modern web browser
- Internet connection (for p5.js CDN)

## Repository Structure
- `DOTTERS.js` - Main visualization script
- `index.html` - Hosting file
- `README.md` - This documentation
- `controls.js` - UI control handlers
- `styles.css` - Control panel styling
- `INTERACTIVITY_ROADMAP.md` - Enhancement plan

## GitHub Repository
https://github.com/THISWORLDISGONE/DOTTERS