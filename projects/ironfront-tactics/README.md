# Ironfront Tactics Assets

All game-specific assets are intended to remain inside this project directory so the game can be moved or deployed without external asset downloads.

## Planned asset tree
- assets/sprites/units/ - unit sprite sheets
- assets/sprites/effects/ - muzzle flashes, impacts, smoke, explosions
- assets/sprites/fortifications/ - trenches, walls, bunkers, gates
- assets/sprites/siege/ - siege engines and artillery
- assets/terrain/ - terrain tiles and overlays
- assets/ui/ - icons and interface art
- data/units.json - unit definitions
- data/fortifications.json - fortification definitions
- data/scenarios.json - preset challenges
- data/terrain.json - terrain modifiers

## Performance contract
Target iPhone 16 Plus at 60 FPS. Assets should favor compact sprite sheets, texture atlases, object pooling, batched rendering, capped particle counts, and simulation LOD.