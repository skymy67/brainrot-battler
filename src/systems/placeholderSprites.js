import { TILE_SIZE, TILE_TYPES } from '../map/mapData.js';

// Every placeholder here is generated at runtime from a color, keyed by the
// same string a real pixel-art asset would use (a tile type name, 'player',
// or a character's spriteKey). To swap in real art later, replace the
// generateTexture() call for that key with `this.load.image(key, url)` in a
// scene's preload() — nothing that *uses* the texture (map rendering,
// sprite placement, battle UI) needs to change.

export function generateTileTextures(scene) {
  for (const [key, tile] of Object.entries(TILE_TYPES)) {
    if (scene.textures.exists(key)) continue;
    const g = scene.add.graphics();
    g.fillStyle(tile.color, 1);
    g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    g.generateTexture(key, TILE_SIZE, TILE_SIZE);
    g.destroy();
  }
}

export function generatePlayerTexture(scene, key = 'player') {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  g.fillStyle(0xffe066, 1);
  g.fillRect(5, 5, TILE_SIZE - 10, TILE_SIZE - 10);
  g.lineStyle(2, 0x2b2b2b, 1);
  g.strokeRect(5, 5, TILE_SIZE - 10, TILE_SIZE - 10);
  g.generateTexture(key, TILE_SIZE, TILE_SIZE);
  g.destroy();
}

export function generateCharacterTexture(scene, key, colorHex, size = 128) {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  g.fillStyle(Number(colorHex), 1);
  g.fillRect(0, 0, size, size);
  g.lineStyle(4, 0x1a1a1a, 0.7);
  g.strokeRect(2, 2, size - 4, size - 4);
  g.generateTexture(key, size, size);
  g.destroy();
}
