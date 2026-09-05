import Phaser from 'phaser';
import characters from '../data/characters.json';
import { computeStats, STARTER_LEVEL } from '../systems/leveling.js';

const CARD_WIDTH = 190;
const CARD_HEIGHT = 400;
const CARD_GAP = 10;
const CARD_TOP = 55;

// The first screen the player sees: pick one of the three starters. The
// choice is passed straight into OverworldScene as `playerCharacterId`,
// which uses it both for the overworld avatar and as the character the
// player battles with.
export default class StarterSelectScene extends Phaser.Scene {
  constructor() {
    super('StarterSelect');
  }

  create() {
    this.add.rectangle(320, 240, 640, 480, 0x10131c);
    this.add
      .text(320, 18, `Choose your starter! (Lv.${STARTER_LEVEL})`, { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5, 0);

    const totalWidth = characters.length * CARD_WIDTH + (characters.length - 1) * CARD_GAP;
    const startX = (640 - totalWidth) / 2;

    characters.forEach((character, i) => {
      this.createCard(startX + i * (CARD_WIDTH + CARD_GAP), CARD_TOP, character);
    });
  }

  createCard(x, y, character) {
    const cx = x + CARD_WIDTH / 2;
    const stats = computeStats(character.baseStatsLevel12, STARTER_LEVEL);

    const bg = this.add
      .rectangle(cx, y + CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT, 0x1c2030, 0.9)
      .setStrokeStyle(2, 0xffffff, 0.3)
      .setInteractive({ useHandCursor: true });

    this.add.image(cx, y + 55, character.spriteKey).setDisplaySize(80, 80);

    this.add
      .text(cx, y + 102, character.name, {
        fontSize: '13px',
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: CARD_WIDTH - 16 },
      })
      .setOrigin(0.5, 0);

    this.add
      .text(cx, y + 142, character.types.join(' / '), { fontSize: '12px', color: '#9fd3ff' })
      .setOrigin(0.5, 0);

    this.add
      .text(cx, y + 160, `Ability: ${character.ability.name}`, {
        fontSize: '10px',
        color: '#cccccc',
        align: 'center',
        wordWrap: { width: CARD_WIDTH - 16 },
      })
      .setOrigin(0.5, 0);

    this.add
      .text(
        cx,
        y + 196,
        `HP ${stats.hp}   ATK ${stats.attack}   DEF ${stats.defense}\nSPA ${stats.spAttack}   SPD ${stats.spDefense}   SPE ${stats.speed}`,
        { fontSize: '11px', color: '#eeeeee', align: 'center', lineSpacing: 4 },
      )
      .setOrigin(0.5, 0);

    this.add
      .text(cx, y + 240, character.flavor, {
        fontSize: '10px',
        color: '#999999',
        align: 'center',
        wordWrap: { width: CARD_WIDTH - 20 },
      })
      .setOrigin(0.5, 0);

    const chooseLabel = this.add
      .text(cx, y + CARD_HEIGHT - 24, 'Choose', {
        fontSize: '13px',
        color: '#ffe066',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0);

    bg.on('pointerover', () => bg.setStrokeStyle(3, 0xffe066, 1));
    bg.on('pointerout', () => bg.setStrokeStyle(2, 0xffffff, 0.3));
    bg.on('pointerdown', () => this.selectStarter(character));
    chooseLabel.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.selectStarter(character));
  }

  selectStarter(character) {
    this.scene.start('Overworld', { playerCharacterId: character.id, playerLevel: STARTER_LEVEL });
  }
}
