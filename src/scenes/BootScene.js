import Phaser from 'phaser';
import characters from '../data/characters.json';
import { generateTileTextures, generateCharacterTexture } from '../systems/placeholderSprites.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    generateTileTextures(this);
    for (const character of characters) {
      generateCharacterTexture(this, character.spriteKey, character.color);
    }
    this.scene.start('StarterSelect');
  }
}
