import Phaser from 'phaser';
import characters from '../data/characters.json';
import { MAP_LAYOUT, MAP_COLS, MAP_ROWS, TILE_SIZE, PLAYER_START, tileAt } from '../map/mapData.js';

const MOVE_DURATION = 140;

// Which roster character the player controls in battle. There's no
// starter-select flow yet, so this is a fixed default for the scaffold.
const PLAYER_CHARACTER_ID = 'apipipi';
const STARTER_LEVEL = 5;

export default class OverworldScene extends Phaser.Scene {
  constructor() {
    super('Overworld');
  }

  init(data) {
    this.startCol = data?.col ?? PLAYER_START.col;
    this.startRow = data?.row ?? PLAYER_START.row;
  }

  create() {
    this.renderMap();

    this.playerCol = this.startCol;
    this.playerRow = this.startRow;
    this.player = this.add
      .image(this.colToX(this.playerCol), this.rowToY(this.playerRow), 'player')
      .setDepth(10);

    this.isMoving = false;
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');

    this.add
      .text(8, 8, 'Arrow keys / WASD to move. Watch out for tall grass!', {
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#00000080',
        padding: { x: 4, y: 2 },
      })
      .setDepth(20)
      .setScrollFactor(0);
  }

  colToX(col) {
    return col * TILE_SIZE + TILE_SIZE / 2;
  }

  rowToY(row) {
    return row * TILE_SIZE + TILE_SIZE / 2;
  }

  renderMap() {
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const tileKey = MAP_LAYOUT[row][col];
        this.add.image(this.colToX(col), this.rowToY(row), tileKey).setDepth(0);
      }
    }
  }

  update() {
    if (this.isMoving) return;

    let dCol = 0;
    let dRow = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) dCol = -1;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) dCol = 1;
    else if (this.cursors.up.isDown || this.wasd.W.isDown) dRow = -1;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) dRow = 1;

    if (dCol !== 0 || dRow !== 0) this.tryMove(dCol, dRow);
  }

  tryMove(dCol, dRow) {
    const targetCol = this.playerCol + dCol;
    const targetRow = this.playerRow + dRow;
    const tile = tileAt(targetCol, targetRow);
    if (!tile || !tile.walkable) return;

    this.isMoving = true;
    this.playerCol = targetCol;
    this.playerRow = targetRow;

    this.tweens.add({
      targets: this.player,
      x: this.colToX(targetCol),
      y: this.rowToY(targetRow),
      duration: MOVE_DURATION,
      onComplete: () => {
        this.isMoving = false;
        this.checkForEncounter(tile);
      },
    });
  }

  checkForEncounter(tile) {
    if (tile.encounterChance <= 0 || Math.random() >= tile.encounterChance) return;

    const wildPool = characters.filter((c) => c.id !== PLAYER_CHARACTER_ID);
    const wild = Phaser.Utils.Array.GetRandom(wildPool.length ? wildPool : characters);

    this.scene.start('Battle', {
      playerCharacterId: PLAYER_CHARACTER_ID,
      playerLevel: STARTER_LEVEL,
      enemyCharacterId: wild.id,
      enemyLevel: STARTER_LEVEL,
      returnPosition: { col: this.playerCol, row: this.playerRow },
    });
  }
}
