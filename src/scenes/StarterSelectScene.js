import Phaser from 'phaser';
import characters from '../data/characters.json';
import { computeStats, STARTER_LEVEL } from '../systems/leveling.js';

// Real pixel-art portraits for the Dex entry, one per character id
// (src/assets/dex/<id>.png). Resolved eagerly to URLs at build time; a
// character with no file here just falls back to its placeholder square.
// This is portrait art only — the overworld avatar and battle sprites stay
// placeholder squares (battle art is coming separately later).
const DEX_ART = import.meta.glob('../assets/dex/*.png', { eager: true, import: 'default' });

function dexArtUrl(characterId) {
  return DEX_ART[`../assets/dex/${characterId}.png`];
}

function dexTextureKey(characterId) {
  return `${characterId}_dex`;
}

// A full "Pokedex-style" entry per starter, paged with prev/next, ending in
// a Yes/Go-back confirmation before the choice is locked in.
export default class StarterSelectScene extends Phaser.Scene {
  constructor() {
    super('StarterSelect');
  }

  preload() {
    for (const character of characters) {
      const url = dexArtUrl(character.id);
      const key = dexTextureKey(character.id);
      if (url && !this.textures.exists(key)) {
        this.load.image(key, url);
      }
    }
  }

  create() {
    this.currentIndex = 0;
    this.confirmOverlay = null;

    this.add.rectangle(320, 240, 640, 480, 0x10131c);
    this.add.text(320, 10, 'Choose Your Starter!', { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5, 0);

    this.pageContainer = this.add.container(0, 0);
    this.pageIndicator = this.add.text(320, 434, '', { fontSize: '12px', color: '#999999' }).setOrigin(0.5);

    this.createNavButton(35, 240, '<', () => this.changePage(-1));
    this.createNavButton(605, 240, '>', () => this.changePage(1));
    this.createChooseButton();

    this.renderPage();
  }

  changePage(delta) {
    this.currentIndex = (this.currentIndex + delta + characters.length) % characters.length;
    this.renderPage();
  }

  renderPage() {
    this.pageContainer.removeAll(true);
    const character = characters[this.currentIndex];
    const stats = computeStats(character.baseStatsLevel12, STARTER_LEVEL);
    const objs = [];

    const dexKey = dexTextureKey(character.id);
    if (this.textures.exists(dexKey)) {
      objs.push(this.add.image(140, 185, dexKey).setDisplaySize(200, 200));
    } else {
      objs.push(this.add.image(140, 185, character.spriteKey).setDisplaySize(140, 140));
    }

    objs.push(
      this.add
        .text(140, 295, character.name, { fontSize: '18px', color: '#ffffff', fontStyle: 'bold', align: 'center', wordWrap: { width: 240 } })
        .setOrigin(0.5, 0),
    );
    objs.push(this.add.text(140, 322, character.types.join(' / '), { fontSize: '13px', color: '#9fd3ff' }).setOrigin(0.5, 0));
    objs.push(
      this.add
        .text(140, 344, character.flavor, { fontSize: '10px', color: '#999999', align: 'center', wordWrap: { width: 230 } })
        .setOrigin(0.5, 0),
    );

    objs.push(this.add.text(275, 52, `Ability: ${character.ability.name}`, { fontSize: '13px', color: '#ffe066', fontStyle: 'bold' }));
    objs.push(
      this.add.text(275, 71, character.ability.description, { fontSize: '11px', color: '#cccccc', wordWrap: { width: 335 } }),
    );

    objs.push(this.add.text(275, 105, `Base Stats (Lv.${STARTER_LEVEL})`, { fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }));
    objs.push(
      this.add.text(
        275,
        124,
        `HP ${stats.hp}        ATK ${stats.attack}\nDEF ${stats.defense}       SPA ${stats.spAttack}\nSPDEF ${stats.spDefense}   SPE ${stats.speed}`,
        { fontSize: '12px', color: '#eeeeee', lineSpacing: 6 },
      ),
    );

    objs.push(this.add.text(275, 200, 'Moves', { fontSize: '13px', color: '#ffffff', fontStyle: 'bold' }));
    character.moves.forEach((move, i) => {
      const y = 220 + i * 28;
      objs.push(
        this.add.text(275, y, `${move.name}${move.isSignature ? ' ★' : ''}`, { fontSize: '11px', color: '#ffffff' }),
      );
      objs.push(this.add.text(275, y + 13, `${move.type} | PWR ${move.power} | ACC ${move.accuracy}%`, { fontSize: '10px', color: '#999999' }));
    });

    this.pageContainer.add(objs);
    this.pageIndicator.setText(`${this.currentIndex + 1} / ${characters.length}`);
  }

  createNavButton(x, y, label, onClick) {
    const circle = this.add.circle(x, y, 18, 0x2b2f42).setStrokeStyle(1, 0xffffff, 0.4).setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);
    circle.on('pointerover', () => circle.setFillStyle(0x3d4260));
    circle.on('pointerout', () => circle.setFillStyle(0x2b2f42));
    circle.on('pointerdown', onClick);
  }

  createChooseButton() {
    const rect = this.add.rectangle(320, 460, 260, 36, 0xffe066).setInteractive({ useHandCursor: true });
    this.add.text(320, 460, 'Choose this Brainrot', { fontSize: '14px', color: '#1a1a1a', fontStyle: 'bold' }).setOrigin(0.5);
    rect.on('pointerover', () => rect.setFillStyle(0xffd93d));
    rect.on('pointerout', () => rect.setFillStyle(0xffe066));
    rect.on('pointerdown', () => this.showConfirm());
  }

  showConfirm() {
    if (this.confirmOverlay) return;
    const character = characters[this.currentIndex];
    const overlay = this.add.container(0, 0).setDepth(50);

    const dim = this.add.rectangle(320, 240, 640, 480, 0x000000, 0.75).setInteractive();
    const panel = this.add.rectangle(320, 240, 440, 190, 0x1c2030).setStrokeStyle(2, 0xffe066, 1);
    const message = this.add
      .text(320, 200, `Are you sure you want to choose ${character.name} as your first brainrot?`, {
        fontSize: '14px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: 380 },
      })
      .setOrigin(0.5);

    const yesRect = this.add.rectangle(255, 300, 150, 40, 0x4caf50).setInteractive({ useHandCursor: true });
    const yesText = this.add.text(255, 300, 'Yes!', { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    const noRect = this.add.rectangle(415, 300, 150, 40, 0x555a6e).setInteractive({ useHandCursor: true });
    const noText = this.add.text(415, 300, 'Go Back', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5);

    overlay.add([dim, panel, message, yesRect, yesText, noRect, noText]);

    yesRect.on('pointerover', () => yesRect.setFillStyle(0x5fcf63));
    yesRect.on('pointerout', () => yesRect.setFillStyle(0x4caf50));
    noRect.on('pointerover', () => noRect.setFillStyle(0x666c85));
    noRect.on('pointerout', () => noRect.setFillStyle(0x555a6e));

    yesRect.on('pointerdown', () => this.confirmSelection(character));
    noRect.on('pointerdown', () => {
      overlay.destroy(true);
      this.confirmOverlay = null;
    });

    this.confirmOverlay = overlay;
  }

  confirmSelection(character) {
    this.scene.start('Overworld', { playerCharacterId: character.id, playerLevel: STARTER_LEVEL });
  }
}
