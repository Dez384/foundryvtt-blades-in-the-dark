import { BladesActorSheetV2Base } from './blades-actor-sheet-v2-base.js';
import { BladesHelpers } from './blades-helpers.js';

export class BladesCrewSheetV2 extends BladesActorSheetV2Base {
  static DEFAULT_OPTIONS = {classes:['crew'],position:{width:940,height:940}};
  static PARTS = {body:{template:'systems/blades-in-the-dark/templates/v2/crew-sheet.html'}};

  async _prepareContext(options){
    const data=await super._prepareContext(options);
    let claimed=0;
    for(const item of data.items){
      if(item.type==='crew_type') for(const turf of Object.values(item.system.turfs??{})){
        if(turf.name==='BITD.Turf'&&turf.value===true) claimed++;
      }
    }
    data.system.turfs_amount=Math.min(data.system.turf.max,claimed+(data.system.turf.bonus||0));
    return data;
  }

  _onRender(context,options){
    super._onRender(context,options);
    this.element.addEventListener('click',async event=>{
      const target=event.target.closest('.crew-class, .add-item, .turf-select');
      if(!target||!this.isEditable) return;
      event.preventDefault();
      if(target.matches('.crew-class')) return this._openItemPicker(target.dataset.itemType||'crew_type',true);
      if(target.matches('.add-item')) return BladesHelpers._addOwnedItem(event,this.actor);
      if(target.matches('.turf-select')){
        const id=target.closest('[data-item-id]')?.dataset.itemId;
        if(!id)return;
        const key=target.dataset.turfId;
        return this.actor.updateEmbeddedDocuments('Item',[{_id:id,[`system.turfs.${key}.value`]: target.dataset.turfStatus!=='true'}]);
      }
    });
  }
  async _onDropActor(event,actor){
    if(actor.type==='npc'&&this.actor.isOwner) return BladesHelpers.addAcquaintance(this.actor,actor);
    return super._onDropActor(event,actor);
  }
}
