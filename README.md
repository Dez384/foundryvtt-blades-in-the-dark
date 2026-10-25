# Blades in the Dark: Foundry v14 ApplicationV2 pilot

This is **not a complete system-wide conversion**. It replaces only the Clock sheet with an independent `HandlebarsApplicationMixin(ActorSheetV2)` implementation, while leaving Characters, Crews, NPCs, Factions, and Items on V1. The script was syntax-checked but has **not** been tested in a live Foundry v14 browser.

Run it on a test branch in your local checkout of `BoomerET/blades-in-the-dark`:

```bash
git switch -c appv2-clock-pilot
python3 /path/to/bitd_appv2/install_clock_v2.py .
python3 /path/to/bitd_appv2/install_clock_v2.py . --enable
node --check module/blades-clock-sheet-v2.js
node --check module/blades.js
```

The script writes `module/blades-clock-sheet-v2.js`, changes the Clock registration in `module/blades.js`, and saves a `module/blades.js.before-clock-v2` backup. Do not stage the backup.

Restart Foundry; test Clock creation, size/color selection, segment updates, persisted image/token appearance, and reopening after daemon restart. Verify errors in F12 Console.

To revert the pilot without deleting other changes:

```bash
git restore -- module/blades.js
rm module/blades-clock-sheet-v2.js
```

The other sheets need separate migrations because they contain V1 event listeners, drop handlers, and legacy context preparation. Don't deploy to a production world until each has its own verified V2 implementation.
