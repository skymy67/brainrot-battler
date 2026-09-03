// Move category is derived from the move's type, classic-generation style
// (Fire/Water/Grass are Special; Normal/Flying are Physical). This keeps the
// character data free of a category field and gives new types an obvious
// place to be classified as the roster grows.
export const TYPE_CATEGORY = {
  Normal: 'physical',
  Flying: 'physical',
  Fire: 'special',
  Water: 'special',
  Grass: 'special',
};

export function categoryForType(type) {
  return TYPE_CATEGORY[type] ?? 'physical';
}

// effectiveness[attackingType][defendingType] = multiplier. Missing entries
// default to 1 (neutral). Small starter-only chart for the scaffold — extend
// as more types are added.
const TYPE_CHART = {
  Fire: { Grass: 2, Water: 0.5, Fire: 0.5 },
  Water: { Fire: 2, Grass: 0.5, Water: 0.5 },
  Grass: { Water: 2, Fire: 0.5, Flying: 0.5, Grass: 0.5 },
  Flying: { Grass: 2 },
  Normal: {},
};

export function getTypeEffectiveness(moveType, defenderTypes) {
  return defenderTypes.reduce((multiplier, defType) => {
    const value = TYPE_CHART[moveType]?.[defType];
    return multiplier * (value ?? 1);
  }, 1);
}
