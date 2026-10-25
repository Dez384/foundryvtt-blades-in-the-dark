/** Foundry v14 ApplicationV2 faction sheet. */
import { BladesActorSheetV2Base } from './blades-actor-sheet-v2-base.js';

export class BladesFactionSheetV2 extends BladesActorSheetV2Base {
  static DEFAULT_OPTIONS = {
    classes: ['faction'],
    position: { width: 900, height: 680 }
  };

  static PARTS = {
    body: { template: 'systems/blades-in-the-dark/templates/v2/faction-sheet.html' }
  };

  _onRender(context, options) {
    super._onRender(context, options);
    // The V1 sheet's .update-box controls modify embedded faction Items,
    // not the parent Actor. The shared V2 form handler must not save these
    // controls as Actor system data.
    this.element?.addEventListener('change', async event => {
      const target = event.target.closest('input.update-box');
      if (!target || !this.isEditable) return;
      const type = target.dataset.utype;
      const itemId = target.dataset.item;
      if (!itemId || !['status', 'hold'].includes(type)) return;
      const value = Number(target.dataset.value ?? target.value);
      if (!Number.isInteger(value)) return;
      await this.actor.updateEmbeddedDocuments('Item', [
        { _id: itemId, [`system.${type}.value`]: [value] }
      ]);
    });
  }
}
