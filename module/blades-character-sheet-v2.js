import { BladesActorSheetV2Base } from './blades-actor-sheet-v2-base.js';
import { enrichHTML } from './compat.js';

export class BladesCharacterSheetV2 extends BladesActorSheetV2Base {
  static DEFAULT_OPTIONS = {classes:['pc'],position:{width:790,height:890}};
  static PARTS = {body:{template:'systems/blades-in-the-dark/templates/v2/actor-sheet.html'}};

  async _prepareContext(options) {
    const data = await super._prepareContext(options);
    let loadout=0;
    for(const item of data.items) if(item.type==='item') loadout+=Number(item.system.load)||0;
    loadout=Math.max(0,Math.min(11,loadout));
    data.system.loadout=loadout;
    const deep=game.settings.get('blades-in-the-dark','DeepCutLoad');
    const levels=deep?['Discreet','Discreet','Discreet','Discreet','Discreet','Conspicuous','Conspicuous','Encumbered','Encumbered','Encumbered','OverMax','OverMax']:['Light','Light','Light','Light','Normal','Normal','Heavy','Encumbered','Encumbered','Encumbered','OverMax','OverMax'];
    const mule=deep?['Discreet','Discreet','Discreet','Discreet','Discreet','Discreet','Discreet','Conspicuous','Conspicuous','Encumbered','OverMax','OverMax']:['Light','Light','Light','Light','Light','Light','Normal','Normal','Heavy','Encumbered','OverMax','OverMax'];
    const isMule=data.items.some(i=>i.type==='ability'&&i.name==='(C) Mule');
    data.system.load_level='BITD.'+(isMule?mule:levels)[loadout];
    data.system.load_levels=deep?{'BITD.Discreet':'BITD.Discreet','BITD.Conspicuous':'BITD.Conspicuous'}:{'BITD.Light':'BITD.Light','BITD.Normal':'BITD.Normal','BITD.Heavy':'BITD.Heavy'};
    data.system.description=await enrichHTML(data.system.description??'',{secrets:data.owner,async:true});
    data.system.attributes=this.actor.getComputedAttributes();
    data.system.stress.max=this.actor.getMaxStress();
    data.system.trauma.max=this.actor.getMaxTrauma();
    data.system.healing_clock.value=this.actor.getHealingMin();
    return data;
  }
  async _onDropActor(event,actor){
    if(!this.actor.isOwner) return;
    if(actor.type==='npc') return (await import('./blades-helpers.js')).BladesHelpers.addAcquaintance(this.actor,actor);
    if(actor.type==='crew') return (await import('./blades-helpers.js')).BladesHelpers.addCrew(this.actor,actor);
    return super._onDropActor(event,actor);
  }
}
