export const TILE_SIZE = 32;

// Each tile type maps to a placeholder color (used to generate a texture at
// boot) plus gameplay flags. Swapping in real pixel-art tiles later only
// means changing preload() to load an image per key instead of generating a
// colored square — nothing else in the map/movement code has to change.
export const TILE_TYPES = {
  grass: { color: 0x3fa34d, walkable: true, encounterChance: 0 },
  tall_grass: { color: 0x267a34, walkable: true, encounterChance: 0.12 },
  sand: { color: 0xe6d28a, walkable: true, encounterChance: 0 },
  water: { color: 0x2f6fb0, walkable: false, encounterChance: 0 },
  path: { color: 0xc9b283, walkable: true, encounterChance: 0 },
  cosmic_field: { color: 0x6a3fd6, walkable: true, encounterChance: 0.15 },
};

const G = 'grass';
const T = 'tall_grass';
const S = 'sand';
const W = 'water';
const P = 'path';
const C = 'cosmic_field';

// 20 columns x 15 rows. Row 0 is the top of the map.
export const MAP_LAYOUT = [
  [G, G, G, G, G, S, S, W, W, W, W, S, S, C, C, C, C, G, G, G],
  [G, G, T, T, G, S, W, W, W, W, W, W, S, C, C, C, C, G, G, G],
  [G, T, T, T, G, S, W, W, W, W, W, W, S, S, C, C, S, G, G, G],
  [G, T, T, G, G, S, S, W, W, W, W, S, S, G, G, G, G, G, G, G],
  [G, G, G, G, P, P, P, P, S, S, S, S, G, G, G, G, T, T, G, G],
  [G, G, G, G, P, G, G, G, P, G, G, G, G, G, G, G, T, T, T, G],
  [G, G, G, G, P, G, G, G, P, G, G, G, G, G, G, G, G, T, G, G],
  [G, G, G, G, P, P, P, P, P, P, P, P, P, P, P, G, G, G, G, G],
  [G, G, G, G, G, G, G, G, P, G, G, G, G, G, P, G, G, G, G, G],
  [G, C, C, G, G, G, G, G, P, G, G, G, G, G, P, G, S, S, S, G],
  [G, C, C, C, G, G, G, G, P, G, G, G, G, G, P, S, S, W, S, S],
  [G, C, C, G, G, T, T, G, P, P, P, P, P, P, P, S, W, W, W, S],
  [G, G, G, G, G, T, T, G, G, G, G, G, G, G, G, S, S, W, S, S],
  [G, G, G, G, G, T, G, G, G, G, G, G, G, G, G, G, S, S, S, G],
  [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G],
];

export const MAP_COLS = MAP_LAYOUT[0].length;
export const MAP_ROWS = MAP_LAYOUT.length;

export const PLAYER_START = { col: 6, row: 7 };

export function tileAt(col, row) {
  if (col < 0 || row < 0 || col >= MAP_COLS || row >= MAP_ROWS) return null;
  return TILE_TYPES[MAP_LAYOUT[row][col]];
}
