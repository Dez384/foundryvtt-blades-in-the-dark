import { BladesSheetV2 } from "./blades-sheet-v2.js";

const CLOCK_COLORS = {
  "black":  "BITD.Colors.Black",
  "blue":   "BITD.Colors.Blue",
  "green":  "BITD.Colors.Green",
  "grey":   "BITD.Colors.Grey",
  "red":    "BITD.Colors.Red",
  "white":  "BITD.Colors.White",
  "yellow": "BITD.Colors.Yellow"
};

const CLOCK_SIZES = { "4": "4", "6": "6", "8": "8", "10": "10", "12": "12" };

/**
 * Clock actor sheet. Picks an SVG asset from
 * {color, type, value} on every save and propagates the new texture to every
 * placed token of the actor on the current scene.
 */
export class BladesClockSheet extends BladesSheetV2 {

  static DEFAULT_OPTIONS = {
    classes: [...super.DEFAULT_OPTIONS.classes, "clock"],
    position: { width: 360, height: 430 },
    form: {
      handler: BladesClockSheet._onSubmitForm,
      submitOnChange: true,
      closeOnSubmit: false
    }
  };

  static PARTS = {
    body: { template: "systems/blades-in-the-dark/templates/actors/clock-sheet.html" }
  };

  /* -------------------------------------------- */

  async _prepareContext(options) {
    const ctx = await super._prepareContext(options);
    return {
      ...ctx,
      actor: this.actor,
      document: this.document,
      _id: this.actor.id,
      id: this.actor.id,
      name: this.actor.name,
      system: this.actor.system,
      owner: this.actor.isOwner,
      editable: this.isEditable,
      cssClass: this.isEditable ? "editable" : "locked",
      isGM: game.user.isGM,
      sizeDropdown: CLOCK_SIZES,
      colorDropdown: CLOCK_COLORS
    };
  }


  // Updating the actor image and all tokens to the correct segments and fill level
  static async _onSubmitForm(event, form, formData) {
    const data = foundry.utils.expandObject(formData.object);
    const color = data.system?.color ?? this.actor.system.color;
    const type  = data.system?.type  ?? this.actor.system.type;
    const value = data.system?.value ?? this.actor.system.value;
    const imgPath = `systems/blades-in-the-dark/themes/${color}/${type}clock_${value}.svg`;
    data.img = imgPath;
    foundry.utils.setProperty(data, "prototypeToken.texture.src", imgPath);

    const scene = game.scenes.current;
    if (scene) {
      const tokenUpdates = this.actor.getActiveTokens()
        .map(t => ({ _id: t.id, "texture.src": imgPath }));
      if (tokenUpdates.length) {
        await scene.updateEmbeddedDocuments("Token", tokenUpdates);
      }
    }

    await this.actor.update(data);
  }
}
