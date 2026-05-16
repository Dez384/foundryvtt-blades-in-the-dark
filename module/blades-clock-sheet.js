import { BladesSheetV2 } from "./blades-sheet-v2.js";
import { ClockData } from "./data/clock.js";

/**
 * Clock actor sheet. The SVG image recipe and the dropdown choices both
 * live on ClockData; this class only handles rendering and the scene-level
 * side effect of pushing the new texture to placed tokens.
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
    const schema = this.actor.system.schema.fields;
    const sizeDropdown = Object.fromEntries(
      schema.type.choices.map(n => [String(n), String(n)])
    );
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
      sizeDropdown,
      colorDropdown: schema.color.choices
    };
  }

  // Bake the derived img / token texture into the same update as the form
  // change, then sync placed tokens on the current scene.
  static async _onSubmitForm(event, form, formData) {
    const data = foundry.utils.expandObject(formData.object);
    const sys = data.system ?? {};
    const imgPath = ClockData.getImgPath({
      color: sys.color ?? this.actor.system.color,
      type:  sys.type  ?? this.actor.system.type,
      value: sys.value ?? this.actor.system.value
    });
    data.img = imgPath;
    foundry.utils.setProperty(data, "prototypeToken.texture.src", imgPath);
    await this.actor.update(data);

    const scene = game.scenes.current;
    if (scene) {
      const tokenUpdates = this.actor.getActiveTokens()
        .map(t => ({ _id: t.id, "texture.src": imgPath }));
      if (tokenUpdates.length) {
        await scene.updateEmbeddedDocuments("Token", tokenUpdates);
      }
    }
  }
}
