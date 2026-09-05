# Brainrot Battler

A web-based 2D top-down pixel-art monster-battler, built with [Phaser 3](https://phaser.io/) + [Vite](https://vitejs.dev/).

Standalone project — no dependency on the `brainrot-agent` chatbot repo, but it
reuses the same battle-system concepts (types, stats, movesets, abilities) as
static game data.

## Running it

```bash
npm install
npm run dev
```

Open the printed local URL. Pick a starter on the first screen, then move with
**arrow keys or WASD**. Walking into darker "tall grass" or purple "cosmic
field" tiles has a chance to trigger a random battle.

`npm run build` produces a static production build in `dist/`.

## Project structure

```
src/
  main.js               Phaser game config, scene list
  scenes/
    BootScene.js         Generates placeholder textures, then starts starter select
    StarterSelectScene.js Pick one of the three starters before entering the map
    OverworldScene.js     Tile map rendering, player movement, encounter checks
    BattleScene.js         Turn-based battle UI (HP bars, move menu, log)
  data/
    characters.json       Static roster data (stats @ level 12, ability, moves)
  systems/
    leveling.js            Stat-scaling formula (see below)
    typeChart.js            Type effectiveness + physical/special category-by-type
    abilities.js             Battle ability hooks (damage/speed modifiers)
    statStages.js             Stat stage (+/-) multiplier table
    battleEngine.js            Pure turn-resolution logic (no Phaser dependency)
    placeholderSprites.js       Generates colored-square textures at runtime
  entities/
    Character.js            Wraps a roster entry + level into battle-ready state
  map/
    mapData.js               Tile grid, tile metadata, starting position
```

## Adding a new character

Append an entry to `src/data/characters.json` with the same shape as the
existing three. `ability.id` must match a key in `src/systems/abilities.js`
(add a new one there if the ability needs new behavior). Moves with special
effects (stat changes, confuse, etc.) use the `effects` array — see
`Wotcher Wave` and `Camden Splash` for examples.

## Swapping in real pixel art

All sprites — the three starters and every tile — are placeholder colored
squares generated at runtime from `src/systems/placeholderSprites.js`, keyed
by the same string a real asset would use (a tile type name, or a character's
`spriteKey`). The overworld avatar reuses the chosen starter's own texture.
To use real art, load an image/spritesheet under that same key in a scene's
`preload()` instead of calling the generator — nothing that *renders* the
texture needs to change.

## Leveling

Character stats in `characters.json` are given at level 12. Actual battle
stats scale linearly from that reference point:

```
stat(level) = round(statAtLevel12 * level / 12)
```

Starters begin at level 5, so this formula also produces their proportional
starting stats automatically. See `src/systems/leveling.js`.

## Design decisions / assumptions made while scaffolding

A few things weren't specified in the original brief and were filled in with
a reasonable default — flagged here so they're easy to find and change:

- **Move category (Attack/SpAtk split):** determined by the move's *type*,
  classic-generation style — Fire/Water/Grass are Special, Normal/Flying are
  Physical (`src/systems/typeChart.js`). If you'd rather set category
  per-move, add a `category` field to each move and prefer it over the
  type-based default.
- **Type effectiveness chart:** a small rock-paper-scissors chart covering
  just the launch roster's types (Fire/Water/Grass/Flying/Normal) — see
  `TYPE_CHART` in `src/systems/typeChart.js`.
- **Damage formula:** the classic simplified Pokemon formula
  (`((2*level/5+2) * power * atk/def) / 50 + 2`), times type effectiveness,
  a 1/16 crit chance (x1.5), and an 85–100% random roll, before ability
  modifiers. See `src/systems/battleEngine.js`.
- **"Rum Ejection" (Tric Trac Baraboom's signature move):** power/accuracy
  weren't specified in the brief. Set to 90 power / 100% accuracy / Flying
  type / always-critical (to represent the "knocks back with high force"
  flavor). Tune freely in `characters.json`.
- **"100% accuracy at full strength" (Apipipi's signature move):** interpreted
  as flavor text for a simple 100 power / 100% accuracy move, with no
  additional conditional mechanic attached.
- **Wild encounters:** picked uniformly at random from the full roster
  (excluding the player's own character) whenever a tall-grass/cosmic tile
  triggers.
- **Enemy AI:** picks a uniformly random move each turn — no strategy yet.
