import { categoryForType, getTypeEffectiveness } from './typeChart.js';
import { applyDamageDealtHook, applyDamageTakenHook } from './abilities.js';

const CRIT_CHANCE = 1 / 16;
const CRIT_MULTIPLIER = 1.5;
const MIN_DAMAGE_ROLL = 0.85;
const MAX_DAMAGE_ROLL = 1.0;

function baseDamage(level, power, atk, def) {
  return Math.floor((((2 * level) / 5 + 2) * power * (atk / def)) / 50 + 2);
}

// Resolves one character's use of `move` against `defender`. Pure function of
// its inputs (plus an injectable `rng` for deterministic tests) so it can be
// unit tested and reused outside of the Phaser scene that renders it.
export function resolveMove(attacker, defender, move, rng = Math.random) {
  const result = { move, missed: false, damage: 0, effectiveness: 1, isCrit: false, effects: [] };

  if (rng() > move.accuracy / 100) {
    result.missed = true;
    return result;
  }

  if (move.power > 0) {
    const category = categoryForType(move.type);
    const atkStat = category === 'physical' ? attacker.getEffectiveStat('attack') : attacker.getEffectiveStat('spAttack');
    const defStat = category === 'physical' ? defender.getEffectiveStat('defense') : defender.getEffectiveStat('spDefense');

    let damage = baseDamage(attacker.level, move.power, atkStat, defStat);
    result.effectiveness = getTypeEffectiveness(move.type, defender.data.types);
    damage *= result.effectiveness;

    result.isCrit = Boolean(move.alwaysCrit) || rng() < CRIT_CHANCE;
    if (result.isCrit) damage *= CRIT_MULTIPLIER;

    damage *= MIN_DAMAGE_ROLL + rng() * (MAX_DAMAGE_ROLL - MIN_DAMAGE_ROLL);

    damage = applyDamageDealtHook(attacker.data.ability.id, { moveType: move.type, damage });
    damage = applyDamageTakenHook(defender.data.ability.id, { moveType: move.type, damage });

    result.damage = Math.max(1, Math.floor(damage));
    defender.takeDamage(result.damage);
  }

  for (const effect of move.effects ?? []) {
    if (rng() > (effect.chance ?? 1)) continue;
    const target = effect.target === 'self' ? attacker : defender;
    if (effect.type === 'stat_change') {
      target.applyStageChange(effect.stat, effect.stages);
      result.effects.push({ type: 'stat_change', target: effect.target, stat: effect.stat, stages: effect.stages });
    } else if (effect.type === 'confuse' && !target.status) {
      target.status = { kind: 'confuse', turnsLeft: 2 + Math.floor(rng() * 3) };
      result.effects.push({ type: 'confuse', target: effect.target });
    }
  }

  return result;
}

// Returns [first, second] ordering of the two combatants for this turn.
export function getTurnOrder(a, b, rng = Math.random) {
  const speedA = a.getEffectiveStat('speed');
  const speedB = b.getEffectiveStat('speed');
  if (speedA === speedB) return rng() < 0.5 ? [a, b] : [b, a];
  return speedA > speedB ? [a, b] : [b, a];
}

// Consumes one turn of confusion for `character`. Returns true if the
// character hits itself instead of acting (a self-hit deals a small fixed
// amount of typeless damage, Pokemon-style).
export function tickConfusion(character, rng = Math.random) {
  if (character.status?.kind !== 'confuse') return false;
  character.status.turnsLeft -= 1;
  if (character.status.turnsLeft <= 0) character.status = null;
  if (rng() < 1 / 3) {
    const selfDamage = Math.max(1, Math.floor(character.stats.attack / 8));
    character.takeDamage(selfDamage);
    return true;
  }
  return false;
}
