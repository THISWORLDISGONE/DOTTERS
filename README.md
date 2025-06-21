# DOTTERS Visualization

An interactive particle visualization using p5.js where mouse movements create dynamic patterns.

![DOTTERS Visualization](https://github.com/THISWORLDISGONE/DOTTERS/raw/main/screenshot.gif)

## Features
- Interactive particle generation
- Performance optimizations
- Fadeout effect based on particle density
- Spatial partitioning for efficient rendering

## How to Run
1. Open `index.html` in a web browser
2. Click and drag to create particle effects
3. Watch as patterns emerge and fade based on density

## Performance Optimizations
- Only processes pixels near particles
- Tracks active pixels for partial redraws
- Fadeout proportional to pixel value

## Requirements
- Modern web browser
- Internet connection (for p5.js CDN)

## Repository Structure
- `DOTTERS.js` - Main visualization script
- `index.html` - Hosting file
- `README.md` - This documentation

## GitHub Repository
https://github.com/THISWORLDISGONE/DOTTERS