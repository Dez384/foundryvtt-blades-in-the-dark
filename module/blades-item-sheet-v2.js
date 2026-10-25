/** Blades in the Dark Item sheets using Foundry v14 ApplicationV2. */
import { BladesActiveEffect } from './blades-active-effect.js';
import { enrichHTML } from './compat.js';

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

export class BladesItemSheetV2Base extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ['blades-in-the-dark', 'sheet', 'item', 'bitd-item-v2'],
    position: { width: 560, height: 600 },
    tag: 'form',
    window: { resizable: true },
    form: {
      submitOnChange: true,
      closeOnSubmit: false,
      handler: BladesItemSheetV2Base.submitItem
    }
  };

  static PARTS = {};

  async _prepareContext(options) {
    const ctx = await super._prepareContext(options);
    const item = this.document;
    const source = item.toObject();
    const system = foundry.utils.deepClone(item.system.toObject?.() ?? source.system);
    // Preserve raw description for legacy editor helper; also provide enriched text.
    return {
      ...ctx, ...source,
      item, document: item, actor: item.parent,
      _id: item.id,
      system,
      owner: item.isOwner,
      editable: this.isEditable,
      isGM: game.user.isGM,
      cssClass: 'blades-in-the-dark sheet item',
      effects: BladesActiveEffect.prepareActiveEffectCategories(item.effects),
      enrichedDescription: await enrichHTML(system.description ?? '', {
        secrets: item.isOwner, async: true
      })
    };
  }

  /** @this {BladesItemSheetV2Base} */
  static async submitItem(event, form, formData) {
    await this.document.update(formData.object);
  }

  _onRender(context, options) {
    super._onRender(context, options);
    const el = this.element;
    if (!el) return;
    const tabs = [...el.querySelectorAll('.sheet-tabs [data-tab]')];
    if (tabs.length) {
      const content = [...el.querySelectorAll('.sheet-body .tab[data-tab], .tab-content .tab[data-tab]')];
      const activate = id => {
        for (const t of tabs) t.classList.toggle('active', t.dataset.tab === id);
        for (const t of content) t.classList.toggle('active', t.dataset.tab === id);
      };
      activate(this._activeTab ?? 'description');
      for (const tab of tabs) tab.addEventListener('click', event => {
        event.preventDefault();
        this._activeTab = tab.dataset.tab;
        activate(this._activeTab);
      });
    }
    el.addEventListener('click', async event => {
      const control = event.target.closest('.effect-control');
      if (control) {
        event.preventDefault();
        if (!this.isEditable) return;
        if (this.item.parent?.documentName === 'Actor') {
          return ui.notifications.warn(game.i18n.localize('BITD.EffectWarning'));
        }
        return BladesActiveEffect.onManageActiveEffect(event, this.item);
      }
      const label = event.target.closest('label.radio-toggle');
      if (!label || !this.isEditable) return;
      if (game.modules.get('bitd-alternate-sheets')?.active) return;
      // Preserve legacy click-to-uncheck behavior on radio tracks.
      const input = el.querySelector(`#${CSS.escape(label.htmlFor)}`);
      if (!input?.name) return;
      if (input.checked) {
        event.preventDefault();
        const next = el.querySelector(`input[type="radio"][name="${CSS.escape(input.name)}"][value="${Number(input.value)-1}"]`);
        if (next) { next.checked = true; next.dispatchEvent(new Event('change', { bubbles: true })); }
      }
    });
    el.addEventListener('contextmenu', event => {
      const target = event.target.closest('label.radio-toggle, input.radio-toggle');
      if (!target || !this.isEditable) return;
      const input = target.matches('label') ? el.querySelector(`#${CSS.escape(target.htmlFor)}`) : target;
      if (!input?.name) return;
      event.preventDefault();
      const prev = el.querySelector(`input[type="radio"][name="${CSS.escape(input.name)}"][value="${Number(input.value)-1}"]`);
      if (prev) { prev.checked = true; prev.dispatchEvent(new Event('change', { bubbles: true })); }
    });
  }
}

/** One concrete sheet class per template; V2 PARTS are class-static, not instance-dynamic. */
const names = ['ability','class','cohort','crew_ability','crew_type','crew_upgrade','faction','hunting_grounds','item','prison','simple'];
export const BladesItemSheetV2Types = Object.fromEntries(names.map(name => {
  class Sheet extends BladesItemSheetV2Base {}
  Sheet.PARTS = { body: { template: `systems/blades-in-the-dark/templates/v2/items/${name}.html` } };
  return [name, Sheet];
}));
