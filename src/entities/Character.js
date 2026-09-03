import { computeStats } from '../systems/leveling.js';
import { clampStage, stageMultiplier } from '../systems/statStages.js';
import { applySpeedHook } from '../systems/abilities.js';

const STAGE_STATS = ['attack', 'defense', 'spAttack', 'spDefense', 'speed'];

// Wraps a static character data entry with the mutable battle state
// (current HP, stat stages, status condition) needed for a single battle.
export class Character {
  constructor(data, level) {
    this.data = data;
    this.level = level;
    this.stats = computeStats(data.baseStatsLevel12, level);
    this.currentHp = this.stats.hp;
    this.stages = Object.fromEntries(STAGE_STATS.map((stat) => [stat, 0]));
    this.status = null; // e.g. { kind: 'confuse', turnsLeft: number }
  }

  get isFainted() {
    return this.currentHp <= 0;
  }

  get hpPercent() {
    return this.currentHp / this.stats.hp;
  }

  applyStageChange(stat, stages) {
    this.stages[stat] = clampStage(this.stages[stat] + stages);
  }

  getEffectiveStat(stat) {
    const base = this.stats[stat] * (this.stages[stat] ? stageMultiplier(this.stages[stat]) : 1);
    if (stat === 'speed') {
      return applySpeedHook(this.data.ability.id, { speed: base, hpPercent: this.hpPercent });
    }
    return base;
  }

  takeDamage(amount) {
    this.currentHp = Math.max(0, this.currentHp - amount);
  }
}
