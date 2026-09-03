import Phaser from 'phaser';
import characters from '../data/characters.json';
import { generateTileTextures, generatePlayerTexture, generateCharacterTexture } from '../systems/placeholderSprites.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create() {
    generateTileTextures(this);
    generatePlayerTexture(this);
    for (const character of characters) {
      generateCharacterTexture(this, character.spriteKey, character.color);
    }
    this.scene.start('Overworld');
  }
}
