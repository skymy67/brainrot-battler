// The design data in characters.json gives each character's stats at level 12.
// Stats scale linearly with level from that reference point:
//   stat(level) = round(statAtLevel12 * level / REFERENCE_LEVEL)
// This makes the level-5 starting stats a direct proportional scale-down of the
// level-12 numbers, and gives smooth, gradual growth at every level in between
// and beyond (level 24 doubles the level-12 stat, etc).
export const REFERENCE_LEVEL = 12;
export const STARTER_LEVEL = 5;

export function scaleStat(statAtReferenceLevel, level) {
  return Math.max(1, Math.round((statAtReferenceLevel * level) / REFERENCE_LEVEL));
}

export function computeStats(baseStatsLevel12, level) {
  return {
    hp: scaleStat(baseStatsLevel12.hp, level),
    attack: scaleStat(baseStatsLevel12.attack, level),
    defense: scaleStat(baseStatsLevel12.defense, level),
    spAttack: scaleStat(baseStatsLevel12.spAttack, level),
    spDefense: scaleStat(baseStatsLevel12.spDefense, level),
    speed: scaleStat(baseStatsLevel12.speed, level),
  };
}
