import Phaser from 'phaser';
import characters from '../data/characters.json';
import { Character } from '../entities/Character.js';
import { resolveMove, getTurnOrder, tickConfusion } from '../systems/battleEngine.js';

const CHARACTERS_BY_ID = Object.fromEntries(characters.map((c) => [c.id, c]));
const BAR_WIDTH = 200;
const BAR_HEIGHT = 12;
const LOG_MAX_LINES = 3;
const ACTION_DELAY_MS = 950;

export default class BattleScene extends Phaser.Scene {
  constructor() {
    super('Battle');
  }

  init(data) {
    this.battleData = data;
  }

  create() {
    this.playerChar = new Character(CHARACTERS_BY_ID[this.battleData.playerCharacterId], this.battleData.playerLevel);
    this.enemyChar = new Character(CHARACTERS_BY_ID[this.battleData.enemyCharacterId], this.battleData.enemyLevel);
    this.returnPosition = this.battleData.returnPosition;
    this.turnLocked = false;
    this.battleOver = false;
    this.logLines = [];

    this.add.rectangle(320, 240, 640, 480, 0x10131c);

    this.add.image(480, 110, this.enemyChar.data.spriteKey).setDisplaySize(90, 90);
    this.add.image(140, 210, this.playerChar.data.spriteKey).setDisplaySize(110, 110);

    this.enemyPanel = this.createInfoPanel(20, 20, 250, 64, this.enemyChar);
    this.playerPanel = this.createInfoPanel(370, 170, 250, 64, this.playerChar);

    this.add.rectangle(320, 283, 600, 66, 0x000000, 0.35).setStrokeStyle(1, 0xffffff, 0.2);
    this.logText = this.add.text(30, 258, '', {
      fontSize: '14px',
      color: '#ffffff',
      wordWrap: { width: 580 },
      lineSpacing: 4,
    });

    this.moveButtons = this.playerChar.data.moves.map((move, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      return this.createMoveButton(20 + col * 310, 335 + row * 60, 290, 50, move);
    });

    this.log(`A wild ${this.enemyChar.data.name} appeared!`);
  }

  createInfoPanel(x, y, w, h, character) {
    this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x1c2030, 0.9).setStrokeStyle(1, 0xffffff, 0.25);
    this.add.text(x + 10, y + 6, character.data.name, { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' });
    this.add.text(x + w - 48, y + 6, `Lv.${character.level}`, { fontSize: '12px', color: '#cccccc' });

    const barX = x + 10;
    const barY = y + 28;
    this.add.rectangle(barX + BAR_WIDTH / 2, barY + BAR_HEIGHT / 2, BAR_WIDTH, BAR_HEIGHT, 0x000000, 0.6).setStrokeStyle(1, 0xffffff, 0.3);
    const fill = this.add.graphics();
    const hpText = this.add.text(barX, y + 44, '', { fontSize: '11px', color: '#dddddd' });

    const panel = { fill, barX, barY, hpText, character };
    this.drawHpBar(panel);
    return panel;
  }

  drawHpBar(panel) {
    const pct = Math.max(0, panel.character.currentHp / panel.character.stats.hp);
    const color = pct > 0.5 ? 0x4caf50 : pct > 0.2 ? 0xffc107 : 0xe53935;
    panel.fill.clear();
    panel.fill.fillStyle(color, 1);
    panel.fill.fillRect(panel.barX, panel.barY, BAR_WIDTH * pct, BAR_HEIGHT);
    panel.hpText.setText(`HP ${panel.character.currentHp}/${panel.character.stats.hp}`);
  }

  updateHpBar(character) {
    this.drawHpBar(character === this.playerChar ? this.playerPanel : this.enemyPanel);
  }

  createMoveButton(x, y, w, h, move) {
    const rect = this.add
      .rectangle(x + w / 2, y + h / 2, w, h, 0x2b2f42)
      .setStrokeStyle(1, 0xffffff, 0.4)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(x + 10, y + 8, `${move.name}\n${move.type} | PWR ${move.power} | ACC ${move.accuracy}%`, {
      fontSize: '12px',
      color: '#ffffff',
      lineSpacing: 2,
    });
    rect.on('pointerover', () => rect.setFillStyle(0x3d4260));
    rect.on('pointerout', () => rect.setFillStyle(0x2b2f42));
    rect.on('pointerdown', () => this.onPlayerSelectMove(move));
    return { rect, text };
  }

  setButtonsEnabled(enabled) {
    for (const { rect, text } of this.moveButtons) {
      if (enabled) rect.setInteractive({ useHandCursor: true });
      else rect.disableInteractive();
      rect.setAlpha(enabled ? 1 : 0.5);
      text.setAlpha(enabled ? 1 : 0.5);
    }
  }

  onPlayerSelectMove(move) {
    if (this.turnLocked || this.battleOver) return;
    this.turnLocked = true;
    this.setButtonsEnabled(false);
    this.resolveTurn(move);
  }

  resolveTurn(playerMove) {
    const enemyMove = Phaser.Utils.Array.GetRandom(this.enemyChar.data.moves);
    const [first, second] = getTurnOrder(this.playerChar, this.enemyChar);
    const firstMove = first === this.playerChar ? playerMove : enemyMove;
    const secondMove = second === this.playerChar ? playerMove : enemyMove;

    this.performAction(first, second, firstMove, () => {
      if (this.checkBattleEnd()) return;
      this.performAction(second, first, secondMove, () => {
        if (this.checkBattleEnd()) return;
        this.turnLocked = false;
        this.setButtonsEnabled(true);
      });
    });
  }

  performAction(attacker, defender, move, onDone) {
    const hitSelf = tickConfusion(attacker);
    if (hitSelf) {
      this.log(`${attacker.data.name} is confused and hurt itself!`);
      this.updateHpBar(attacker);
      this.time.delayedCall(ACTION_DELAY_MS, onDone);
      return;
    }

    const result = resolveMove(attacker, defender, move);
    this.narrateResult(attacker, defender, result);
    this.updateHpBar(defender);
    this.time.delayedCall(ACTION_DELAY_MS, onDone);
  }

  narrateResult(attacker, defender, result) {
    if (result.missed) {
      this.log(`${attacker.data.name} used ${result.move.name}, but it missed!`);
      return;
    }

    let msg = `${attacker.data.name} used ${result.move.name}!`;
    if (result.damage > 0) msg += ` (${result.damage} dmg)`;
    if (result.effectiveness > 1) msg += ' Super effective!';
    else if (result.effectiveness > 0 && result.effectiveness < 1) msg += ' Not very effective...';
    if (result.isCrit) msg += ' Critical hit!';
    this.log(msg);

    for (const effect of result.effects) {
      const target = effect.target === 'self' ? attacker : defender;
      if (effect.type === 'stat_change') {
        this.log(`${target.data.name}'s ${effect.stat} ${effect.stages < 0 ? 'fell' : 'rose'}!`);
      } else if (effect.type === 'confuse') {
        this.log(`${target.data.name} became confused!`);
      }
    }
  }

  checkBattleEnd() {
    if (this.enemyChar.isFainted) {
      this.endBattle(true);
      return true;
    }
    if (this.playerChar.isFainted) {
      this.endBattle(false);
      return true;
    }
    return false;
  }

  endBattle(playerWon) {
    this.battleOver = true;
    this.setButtonsEnabled(false);
    this.log(playerWon ? `${this.enemyChar.data.name} fainted! You won!` : `${this.playerChar.data.name} fainted... You blacked out.`);
    this.add.text(320, 300, 'Click anywhere to continue', { fontSize: '14px', color: '#ffffff' }).setOrigin(0.5).setDepth(30);
    this.input.once('pointerdown', () => {
      this.scene.start('Overworld', this.returnPosition);
    });
  }

  log(message) {
    this.logLines.push(message);
    if (this.logLines.length > LOG_MAX_LINES) this.logLines.shift();
    this.logText.setText(this.logLines.join('\n'));
  }
}
