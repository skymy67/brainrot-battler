import Phaser from 'phaser';
import { MAP_COLS, MAP_ROWS, TILE_SIZE } from './map/mapData.js';
import BootScene from './scenes/BootScene.js';
import StarterSelectScene from './scenes/StarterSelectScene.js';
import OverworldScene from './scenes/OverworldScene.js';
import BattleScene from './scenes/BattleScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-container',
  width: MAP_COLS * TILE_SIZE,
  height: MAP_ROWS * TILE_SIZE,
  pixelArt: true,
  backgroundColor: '#10131c',
  scene: [BootScene, StarterSelectScene, OverworldScene, BattleScene],
});
