# VIVARIUM — The Reincarnation Protocol

An original single-file 2D action roguelike rendered on HTML5 Canvas.

## Play Online

Live demo deployed via GitHub Pages:
https://alimkhalelov.github.io/vivarium/

## Tech Specs

- **Zero dependencies**: Pure vanilla JavaScript and HTML5 Canvas2D.
- **Single file**: All game logic, procedural generators, audio synthesis, and graphics rendering exist inside `index.html`.
- **Performance**: 60 FPS update loop with wrapped-world horizontal coordinate system.
- **Controls**:
  - `A` / `D` or Arrows: Movement
  - `Space`: Jump / Flight
  - `Shift`: Dash
  - `Q`: Character ability
  - `E`: Interaction
  - `I`: Equipment screen
  - `Tab`: Minimap
  - Touch: Dynamic virtual joystick for mobile screens

## Automated Testing

```bash
node test_game.js all
```
