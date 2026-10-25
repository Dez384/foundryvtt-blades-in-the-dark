/** Foundry v14 ApplicationV2 NPC sheet. Uses the existing V2 actor sheet base. */
import { BladesActorSheetV2Base } from './blades-actor-sheet-v2-base.js';
import { enrichHTML } from './compat.js';

export class BladesNPCSheetV2 extends BladesActorSheetV2Base {
  static DEFAULT_OPTIONS = {
    classes: ['npc'],
    position: { width: 900, height: 600 }
  };

  static PARTS = {
    body: { template: 'systems/blades-in-the-dark/templates/v2/npc-sheet.html' }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    // Match the old NPC sheet's data preparation without mutating document data.
    context.system.description = await enrichHTML(context.system.description ?? '', {
      secrets: context.owner, async: true
    });
    return context;
  }
}
