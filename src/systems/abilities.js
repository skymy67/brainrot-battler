// Battle abilities as small hook functions keyed by ability id, so
// characters.json only needs to reference an id and the engine can look up
// the behavior. Add a new ability by adding an entry here and pointing a
// character's `ability.id` at it.
export const ABILITIES = {
  streak_blaze: {
    onDamageDealt({ moveType, damage }) {
      return moveType === 'Fire' ? damage * 1.2 : damage;
    },
  },
  hydration_guard: {
    onDamageTaken({ moveType, damage }) {
      return moveType === 'Water' ? damage * 0.75 : damage;
    },
  },
  wind_rider: {
    onSpeed({ speed, hpPercent }) {
      return hpPercent < 0.5 ? speed * 1.3 : speed;
    },
  },
};

export function applyDamageDealtHook(abilityId, context) {
  const hook = ABILITIES[abilityId]?.onDamageDealt;
  return hook ? hook(context) : context.damage;
}

export function applyDamageTakenHook(abilityId, context) {
  const hook = ABILITIES[abilityId]?.onDamageTaken;
  return hook ? hook(context) : context.damage;
}

export function applySpeedHook(abilityId, context) {
  const hook = ABILITIES[abilityId]?.onSpeed;
  return hook ? hook(context) : context.speed;
}
