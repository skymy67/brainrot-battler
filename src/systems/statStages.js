// Pokemon-style stat stage multipliers, clamped to +/-6.
const STAGE_MIN = -6;
const STAGE_MAX = 6;

export function clampStage(stage) {
  return Math.max(STAGE_MIN, Math.min(STAGE_MAX, stage));
}

export function stageMultiplier(stage) {
  return stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
}
