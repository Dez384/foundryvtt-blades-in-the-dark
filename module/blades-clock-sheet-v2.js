/** Blades in the Dark: Foundry v14 ApplicationV2 Clock sheet pilot. */
const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class BladesClockSheetV2 extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["blades-in-the-dark", "sheet", "actor", "clock"],
    position: { width: 360, height: 400 },
    // V2 binds its own form to the application. Do not nest a <form> in the part.
    tag: "form",
    form: {
      submitOnChange: true,
      closeOnSubmit: false,
      handler: BladesClockSheetV2.submitClock
    }
  };

  static PARTS = {
    body: { template: "systems/blades-in-the-dark/templates/actors/clock-sheet-v2.hbs" }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.document;
    return {
      ...context,
      actor,
      document: actor,
      id: actor.id,
      _id: actor.id,
      name: actor.name,
      system: actor.system.toObject?.() ?? actor.system,
      editable: actor.isOwner,
      owner: actor.isOwner,
      isGM: game.user.isGM,
      sizeDropdown: { "4": "4", "6": "6", "8": "8", "10": "10", "12": "12" },
      colorDropdown: {
        black: "BITD.Colors.Black", blue: "BITD.Colors.Blue",
        green: "BITD.Colors.Green", grey: "BITD.Colors.Grey",
        red: "BITD.Colors.Red", white: "BITD.Colors.White",
        yellow: "BITD.Colors.Yellow"
      }
    };
  }

  /** @this {BladesClockSheetV2} */
  static async submitClock(event, form, formData) {
    // FormDataExtended.object supplies dotted input names in the normal V2 format.
    const input = formData.object;
    const actor = this.document;
    const color = String(input["system.color"] ?? actor.system.color ?? "black");
    const size = Number(input["system.type"] ?? actor.system.type ?? 4);
    const value = String(input["system.value"] ?? actor.system.value ?? "0");
    const img = `systems/blades-in-the-dark/themes/${color}/${size}clock_${value}.svg`;

    const updates = { ...input, img, "prototypeToken.texture.src": img };
    await actor.update(updates);

    // Update placed tokens in each scene, not only the currently active scene.
    const byScene = new Map();
    for (const token of actor.getActiveTokens(true)) {
      const scene = token.document.parent;
      if (!scene) continue;
      if (!byScene.has(scene)) byScene.set(scene, []);
      byScene.get(scene).push({ _id: token.document.id, "texture.src": img });
    }
    for (const [scene, changes] of byScene) {
      await scene.updateEmbeddedDocuments("Token", changes);
    }
  }
}
