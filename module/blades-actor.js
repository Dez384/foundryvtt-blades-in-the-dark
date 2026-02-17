import { bladesRoll } from "./blades-roll.js";
import { BladesHelpers } from "./blades-helpers.js";
import { openFormDialog } from "./lib/dialog-compat.js";

/**
 * Extend the basic Actor
 * @extends {Actor}
 */
export class BladesActor extends Actor {

  /** @override */
  static async create(data, options={}) {

    data.prototypeToken = data.prototypeToken || {};

    // For Crew and Character set the Token to sync with charsheet.
    switch (data.type) {
      case 'character':
      case 'crew':
      case '\uD83D\uDD5B clock':
	  case 'npc':
	  case 'factions':
        data.prototypeToken.actorLink = true;
        break;
    }

    return super.create(data, options);
  }

  /** @override */
  getRollData() {
    const rollData = super.getRollData();

    rollData.dice_amount = this.getAttributeDiceToThrow();

    return rollData;
  }

  /* -------------------------------------------- */
  /**
   * Calculate Attribute Dice to throw.
   */
  getAttributeDiceToThrow() {

    // Calculate Dice to throw.
    let dice_amount = {};
    dice_amount['BITD.Vice'] = 4;

    for (var attribute_name in this.system.attributes) {
      //dice_amount[attribute_name] = 0;
	  dice_amount[attribute_name] = this.system.attributes[attribute_name].bonus;
      for (var skill_name in this.system.attributes[attribute_name].skills) {
       // dice_amount[skill_name] = parseInt(this.system.attributes[attribute_name].skills[skill_name]['value'][0])
        dice_amount[skill_name] = parseInt(this.system.attributes[attribute_name].skills[skill_name]['value'])

        // We add a +1d for every skill higher than 0.
        if (dice_amount[skill_name] > 0) {
          dice_amount[attribute_name]++;
        }
      }
      // Vice dice roll uses lowest attribute dice amount
      dice_amount['BITD.Vice'] = Math.min(dice_amount['insight'],dice_amount['prowess'],dice_amount['resolve']);
    }

    return dice_amount;
  }

  /* -------------------------------------------- */

  _getCrewActor() {
    const crewInfo = this.system?.crew?.[0];
    if (!crewInfo?.id) return null;
    const crewActor = game.actors.get(crewInfo.id);
    return crewActor ?? null;
  }

  /* -------------------------------------------- */

  async rollAttributePopup(attribute_name, defaultDice = 0) {

    // const roll = new Roll("1d20 + @abilities.wis.mod", actor.getRollData());
    let attribute_label = BladesHelpers.getRollLabel(attribute_name);

    const sanitizedDefaultDice = (() => {
      const numeric = Number(defaultDice);
      if (Number.isNaN(numeric)) return 0;
      return Math.max(0, Math.min(Math.floor(numeric), 10));
    })();

    // get crew tier info from character sheet if available
    let current_tier = 0;
    try {
      const crewActor = this._getCrewActor();
      const parsedTier = Number(crewActor?.system?.tier);
      current_tier = Number.isFinite(parsedTier) ? parsedTier : 0;
    } catch (error) {
      console.warn("No Crew is attached to the Actor.");
      console.error(error);
    }

    let content = `
        <h2>${game.i18n.localize('BITD.Roll')} ${game.i18n.localize(attribute_label)}</h2>
        <form class="bitd-roll-dialog">
          <div class="form-group">
            <label>${game.i18n.localize('BITD.Modifier')}:</label>
            <select id="mod" name="mod">
              ${this.createListOfDiceMods(-3,+3,0)}
            </select>
          </div>`;
    if (BladesHelpers.isAttributeAction(attribute_name)) {
      content += `
        <fieldset class="form-group" style="display:grid; gap:0.5em;">
          <legend>Roll Types</legend>`;
		// Row 1: Action Roll (if enabled)
		if (game.settings.get('blades-in-the-dark', 'ActionRoll')) {
		  content += `
          <div style="display:grid; grid-template-columns:auto auto auto; gap:0.5em 1em; align-items:center;">
            <label><input type="radio" id="actionRoll" name="rollSelection" value="actionRoll" checked=true> ${game.i18n.localize("BITD.ActionRoll")}</label>
            <span><label>${game.i18n.localize('BITD.Position')}:</label> <select id="pos" name="pos"><option value="controlled">${game.i18n.localize('BITD.PositionControlled')}</option><option value="risky" selected>${game.i18n.localize('BITD.PositionRisky')}</option><option value="desperate">${game.i18n.localize('BITD.PositionDesperate')}</option></select></span>
            <span><label>${game.i18n.localize('BITD.Effect')}:</label> <select id="fx" name="fx"><option value="limited">${game.i18n.localize('BITD.EffectLimited')}</option><option value="standard" selected>${game.i18n.localize('BITD.EffectStandard')}</option><option value="great">${game.i18n.localize('BITD.EffectGreat')}</option></select></span>
          </div>`;
		}
		// Row 2: Threat Roll (if enabled)
		if (game.settings.get('blades-in-the-dark', 'ThreatRoll')) {
		  content += `
          <div style="display:grid; grid-template-columns:auto auto auto; gap:0.5em 1em; align-items:center;">
            <label><input type="radio" id="threatRoll" name="rollSelection" value="threatRoll" checked=true> ${game.i18n.localize("BITD.ThreatRoll")}</label>
            <span><label>${game.i18n.localize('BITD.Position')}:</label> <select id="pos2" name="pos2"><option value="risky" selected>${game.i18n.localize('BITD.PositionRisky')}</option><option value="desperate">${game.i18n.localize('BITD.PositionDesperate')}</option></select></span>
            <span><label>${game.i18n.localize('BITD.ExtraThreats')}:</label> <select id="extraThreats" name="extraThreats">${Array(6).fill().map((item, i) => `<option value="${i}">${i}</option>`).join('')}</select></span>
          </div>`;
		}
		// Row 3: Other roll types
		content += `
          <div style="display:grid; grid-template-columns:auto auto; gap:0.4em 1em;">
            <div style="display:grid; gap:0.4em;">
              <label><input type="radio" id="fortune" name="rollSelection" value="fortune"> ${game.i18n.localize("BITD.Fortune")}</label>
              <label><input type="radio" id="gatherInfo" name="rollSelection" value="gatherInfo"> ${game.i18n.localize("BITD.GatherInformation")}</label>
              <label><input type="radio" id="indulgeVice" name="rollSelection" value="indulgeVice"> ${game.i18n.localize("BITD.IndulgeVice")}</label>
              <label><input type="radio" id="engagement" name="rollSelection" value="engagement"> ${game.i18n.localize("BITD.Engagement")}</label>
              <label><input type="radio" id="acquireAsset" name="rollSelection" value="acquireAsset"> ${game.i18n.localize("BITD.AcquireAsset")}</label>
            </div>
            <div style="display:grid; gap:0.4em; align-content:end;">
              <span><label>${game.i18n.localize("BITD.RollNumberOfDice")}:</label> <select id="qty" name="qty">${Array.from({ length: 11 }, (_, i) => { const selected = i === sanitizedDefaultDice ? " selected" : ""; return `<option value="${i}"${selected}>${i}d</option>`; }).join("")}</select></span>
              <span><label>${game.i18n.localize('BITD.CrewTier')}:</label> <select id="tier" name="tier"><option value="${current_tier}" selected disabled hidden>${current_tier}</option>${Array(5).fill().map((item, i) => `<option value="${i}">${i}</option>`).join('')}</select></span>
            </div>
          </div>
        </fieldset>
            `;
      } else {
        content += `
            <input  id="pos" name="pos" type="hidden" value="">
			<input  id="pos2" name="pos2" type="hidden" value="">
            <input id="fx" name="fx" type="hidden" value="">`;
    }
    content += `
        <div className="form-group">
          <label>${game.i18n.localize('BITD.Notes')}:</label>
          <input id="note" name="note" type="text" value="">
        </div><br/>
       </form>
      `;
    const dialogResult = await openFormDialog({
      title: `${game.i18n.localize('BITD.Roll')} ${game.i18n.localize(attribute_label)}`,
      content,
      okLabel: game.i18n.localize('BITD.Roll'),
      cancelLabel: game.i18n.localize('Close'),
      defaultButton: "ok",
    });

    if (!dialogResult) {
      return;
    }

    const modifier = Number(dialogResult.mod ?? 0) || 0;
    const note = dialogResult.note ?? "";
    const rollData = this.getRollData();
    const actionDiceAmount = rollData.dice_amount[attribute_name] + modifier;
    const viceDiceAmount = rollData.dice_amount['BITD.Vice'] + modifier;
    const stress = Number(this.system.stress.value) || 0;

    if (!BladesHelpers.isAttributeAction(attribute_name)) {
      await this.rollAttribute(attribute_name, modifier, "", "", note);
      return;
    }

    const rollSelection = dialogResult.rollSelection ?? "actionRoll";
    const effect = dialogResult.fx ?? "standard";
    const position = dialogResult.pos ?? "risky";

    switch (rollSelection) {
      case "actionRoll":
        await this.rollAttribute(attribute_name, modifier, position, effect, note);
        break;
      case "threatRoll": {
        const extraThreats = Number(dialogResult.extraThreats ?? 0) || 0;
        const position2 = dialogResult.pos2 ?? "risky";
        await bladesRoll(actionDiceAmount, attribute_name, position2, 'BITD.ThreatRoll', note, extraThreats);
        break;
      }
      case "fortune":
        await bladesRoll(actionDiceAmount, "BITD.Fortune", "", "", note, "");
        break;
      case "gatherInfo":
        await bladesRoll(actionDiceAmount, "BITD.GatherInformation", "", "", note, "");
        break;
      case "indulgeVice":
        await bladesRoll(viceDiceAmount, "BITD.Vice", "", "", note, stress);
        break;
      case "engagement": {
        const engagementDice = Number(dialogResult.qty ?? sanitizedDefaultDice) || 0;
        await bladesRoll(engagementDice, "BITD.Engagement", "", "", note, "");
        break;
      }
      case "acquireAsset": {
        const tier = Number(dialogResult.tier ?? current_tier) || 0;
        const assetDice = tier + modifier;
        await bladesRoll(assetDice, "BITD.AcquireAsset", "", "", note, "", tier);
        break;
      }
      default:
        await this.rollAttribute(attribute_name, modifier, position, effect, note);
        break;
    }

  }

  /* -------------------------------------------- */

  async rollAttribute(attribute_name = "", additional_dice_amount = 0, position, effect, note) {

    let dice_amount = 0;
    if (attribute_name !== "") {
      let roll_data = this.getRollData();
      dice_amount += roll_data.dice_amount[attribute_name];
    }
    else {
      dice_amount = 1;
    }
    dice_amount += additional_dice_amount;

    await bladesRoll(dice_amount, attribute_name, position, effect, note, this.system.stress.value);
  }


  /* -------------------------------------------- */

  /**
   * Create <options> for available actions
   *  which can be performed.
   */
  createListOfActions() {

    let text, attribute, skill;
    let attributes = this.system.attributes;

    for ( attribute in attributes ) {

      const skills = attributes[attribute].skills;

      text += `<optgroup label="${attribute} Actions">`;
      text += `<option value="${attribute}">${attribute} (Resist)</option>`;

      for ( skill in skills ) {
        text += `<option value="${skill}">${skill}</option>`;
      }

      text += `</optgroup>`;

    }

    return text;

  }

  /* -------------------------------------------- */

  /**
   * Creates <options> modifiers for dice roll.
   *
   * @param {int} rs
   *  Min die modifier
   * @param {int} re
   *  Max die modifier
   * @param {int} s
   *  Selected die
   */
  createListOfDiceMods(rs, re, s) {

    var text = ``;
    var i = 0;

    if ( s == "" ) {
      s = 0;
    }

    for ( i  = rs; i <= re; i++ ) {
      var plus = "";
      if ( i >= 0 ) { plus = "+" };
      text += `<option value="${i}"`;
      if ( i == s ) {
        text += ` selected`;
      }

      text += `>${plus}${i}d</option>`;
    }

    return text;

  }

  /* -------------------------------------------- */
  getComputedAttributes() {
    let attributes = this.system.attributes;
    for( const a in attributes ) {
      for( const s in attributes[a].skills ) {
        if( attributes[a].skills[s].max === undefined || attributes[a].skills[s].max === 4){
          attributes[a].skills[s].max = 3;
        }
		
		//include Active Effect alterations to skill minimums
        if( attributes[a].skills[s].value <= attributes[a].skills[s].min ) { 
          attributes[a].skills[s].value = attributes[a].skills[s].min;
        }
      }
    }
    //check for mastery
    if (this.getHasMastery()) {
      for( const b in attributes ) {
        for( const t in attributes[b].skills ) {
          if (attributes[b].skills[t].max === 3) {
            attributes[b].skills[t].max = 4;
          }
        }
      }
    }
    return attributes;
  }

  getMaxStress() {
    let max_stress = this.system.stress.max;
    const crew_actor = this._getCrewActor();
    if (crew_actor) {
      const bonus = Number(crew_actor?.system?.scoundrel?.add_stress);
      if (Number.isFinite(bonus)) {
        max_stress += bonus;
      }
    }
    return max_stress;
  }

  getMaxTrauma() {
    let max_trauma = this.system.trauma.max;
    const crew_actor = this._getCrewActor();
    if (crew_actor) {
      const bonus = Number(crew_actor?.system?.scoundrel?.add_trauma);
      if (Number.isFinite(bonus)) {
        max_trauma += bonus;
      }
    }
    return max_trauma;
  }

  getHasMastery(){
    const crew_actor = this._getCrewActor();
    if (!crew_actor) {
      return false;
    }
    return Boolean(crew_actor?.system?.scoundrel?.mastery);
  }
  
  getHealingMin(){
	let current_healing = parseInt(this.system.healing_clock.value);
	if (current_healing < this.system.healing_clock.min) {
		current_healing = this.system.healing_clock.min;
	}
	return current_healing;
  }

	
}
