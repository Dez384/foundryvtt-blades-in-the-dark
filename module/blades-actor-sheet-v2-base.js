/** Experimental AppV2 actor sheets for Blades in the Dark, Foundry v14. */
import { BladesHelpers } from './blades-helpers.js';
import { BladesActiveEffect } from './blades-active-effect.js';
import { enrichHTML } from './compat.js';

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

export class BladesActorSheetV2Base extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ['blades-in-the-dark', 'sheet', 'actor', 'bitd-v2'],
    position: { width: 790, height: 890 },
    tag: 'form',
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false, handler: BladesActorSheetV2Base.submitForm }
  };
  static PARTS = {};

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const actor = this.document;
    const source = actor.toObject();
    const items = actor.items.contents.map(item => item.toObject()).sort((a,b) => a.sort-b.sort);
    return {
      ...context,
      ...source,
      actor,
      document: actor,
      system: foundry.utils.deepClone(actor.system.toObject?.() ?? source.system),
      items,
      effects: BladesActiveEffect.prepareActiveEffectCategories(actor.effects),
      cssClass: 'blades-in-the-dark sheet actor',
      owner: actor.isOwner,
      editable: this.isEditable,
      isGM: game.user.isGM,
      _id: actor.id
    };
  }

  static async submitForm(event, form, formData) {
    // document sheet form handling for ordinary inputs, including grouped radio controls
    const data = foundry.utils.expandObject(formData.object);
    await this.document.update(data);
  }

  _onRender(context, options) {
    super._onRender(context, options);
    const el = this.element;
    if (!el) return;
    // Keep the V1 tab markup active without V1 Tabs or jQuery.
    const tabs = el.querySelectorAll('.tabs [data-tab]');
    if (tabs.length) {
      const content = el.querySelectorAll('.tab[data-tab]');
      const activate = id => {
        for (const t of tabs) t.classList.toggle('active', t.dataset.tab === id);
        for (const t of content) t.classList.toggle('active', t.dataset.tab === id);
      };
      const current = [...tabs].find(t=>t.classList.contains('active'))?.dataset.tab || tabs[0].dataset.tab;
      activate(this._activeTab || current);
      for (const tab of tabs) tab.addEventListener('click', e => {
        e.preventDefault(); this._activeTab = tab.dataset.tab; activate(this._activeTab);
      });
    }

    el.addEventListener('click', async event => {
      const target = event.target.closest('.item-delete, .item-sheet-open, .item-body, .item-post, .crew-delete, .add-custom-contact, .item-add-popup, .roll-die-attribute, .up-exp-clock, .down-exp-clock, .add-exp-clock, .minus-exp-clock, .open-friend, .acquaintance-delete, .import-contacts, .standing-toggle');
      if (!target) return;
      event.preventDefault();
      const itemId = target.closest('[data-item-id]')?.dataset.itemId;
      const item = itemId && this.actor.items.get(itemId);
      if (target.matches('.item-delete') && item) return item.delete();
      if ((target.matches('.item-sheet-open') || target.matches('.item-body')) && item) return item.sheet.render(true);
      if (target.matches('.item-post') && item) return item.sendToChat();
      if (!this.isEditable) return;
      if (target.matches('.add-custom-contact')) return BladesHelpers.addCustomContact(this.actor);
      if (target.matches('.crew-delete')) return BladesHelpers.removeCrew(this.actor, itemId);
      if (target.matches('.item-add-popup')) return this._openItemPicker(target.dataset.itemType, target.dataset.distinct);
      if (target.matches('.roll-die-attribute')) return this.actor.rollAttributePopup(target.dataset.rollAttribute);
      if (target.matches('.up-exp-clock, .down-exp-clock, .add-exp-clock, .minus-exp-clock')) {
        const ec = this.actor.system.exp_clock;
        let value = Number(ec.value)||0, number = Number(ec.number)||0, size = Number(ec.size)||6;
        if(target.matches('.up-exp-clock')) { value++; if(value>=size){value=0;number++;} }
        if(target.matches('.down-exp-clock')) { value--; if(value<0){value=size-1;number=Math.max(0,number-1);} }
        if(target.matches('.add-exp-clock')) number++;
        if(target.matches('.minus-exp-clock')) number=Math.max(0,number-1);
        return this.actor.update({'system.exp_clock.value':value,'system.exp_clock.number':number});
      }
      if(target.matches('.open-friend') && itemId) return game.actors.get(itemId)?.sheet.render(true);
      if(target.matches('.acquaintance-delete') && itemId) return BladesHelpers.removeAcquaintance(this.actor,itemId);
      if(target.matches('.import-contacts')) {
        const type = this.actor.type==='character' ? 'class' : 'crew_type';
        const cls = this.actor.items.find(i=>i.type===type)?.name;
        return BladesHelpers.import_pb_contacts(this.actor,cls);
      }
    });
    // The legacy markup uses data-type and grouped radio elements; let V2 handle form changes.
    el.addEventListener('change', async event => {
      const target = event.target;
      if(!this.isEditable) return;
      if(target.matches('input[name="system.exp_clock.value"]')) return;
      if(target.matches('.cohort-block-harm input[type="radio"]')) {
        const id=target.closest('[data-item-id]')?.dataset.itemId;
        if(id) await this.actor.updateEmbeddedDocuments('Item',[{_id:id,'system.harm':[target.value]}]);
      }
    });
  }

  async _openItemPicker(type, distinct) {
    if(!type) return;
    let items = await BladesHelpers.getAllItemsByType(type, game);
    items = items.filter(i=>!i.name.includes('Veteran'));
    const options = items.map(i=>`<option value="${foundry.utils.escapeHTML(i.id)}">${foundry.utils.escapeHTML(i.name)}</option>`).join('');
    if(!options) return ui.notifications.warn('No available items of this type.');
    const content=`<label>Select ${foundry.utils.escapeHTML(type)}</label><select name="selected" ${distinct?'':'multiple'}>${options}</select>`;
    const result=await foundry.applications.api.DialogV2.wait({
      window:{title:`Add ${type}`}, content,
      buttons:[{action:'add',label:'Add',default:true,callback:(event,button,dialog)=> {
        const select=dialog.element.querySelector('select[name="selected"]');
        return [...select.selectedOptions].map(x=>x.value);
      }},{action:'cancel',label:'Cancel',callback:()=>null}]
    });
    if(!result?.length) return;
    const chosen=result.map(id=>items.find(i=>i.id===id)).filter(Boolean);
    if(type==='crew') return BladesHelpers.addCrew(this.actor,chosen[0]);
    await this.actor.createEmbeddedDocuments('Item',chosen.map(x=>x.toObject()));
  }
}
