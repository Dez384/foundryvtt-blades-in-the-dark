import { renderHandlebarsTemplate as renderTemplate } from "./compat.js";
import { openFormDialog } from "./lib/dialog-compat.js";

/**
 * Roll Dice.
 * @param {int} dice_amount
 * @param {string} attribute_name
 * @param {string} position
 * @param {string} effect
 */
export async function bladesRoll(dice_amount, attribute_name = "", position = "risky", effect = "standard", note = "", current_stress, current_crew_tier) {

  // ChatMessage.getSpeaker(controlledToken)
  let zeromode = false;

  if ( dice_amount < 0 ) { dice_amount = 0; }
  if ( dice_amount === 0 ) { zeromode = true; dice_amount = 2; }
  
  //if using Threat Rolls, increase dice pool by number of extra threats after establishing zeromode
	//Threat Roll comes in as 'effect' and number of Extra dice from threats is coming in as 'current_stress'
	if (effect === 'BITD.ThreatRoll') {dice_amount = Number(dice_amount)+Number(current_stress);}

	let r = new Roll( `${dice_amount}d6`, {} );

	// show 3d Dice so Nice if enabled
	await r.evaluate();
	await showChatRollMessage(r, zeromode, attribute_name, position, effect, note, current_stress, current_crew_tier);

}

/**
 * Shows Chat message.
 *
 * @param {Roll} r
 * @param {Boolean} zeromode
 * @param {String} attribute_name
 * @param {string} position
 * @param {string} effect
 */
async function showChatRollMessage(r, zeromode, attribute_name = "", position = "", effect = "", note = "", current_stress, current_crew_tier) {
  let speaker = ChatMessage.getSpeaker();
  let rolls = (r.terms)[0].results;
  let attribute_label = BladesHelpers.getRollLabel(attribute_name);

  // Retrieve Roll status.
  let roll_status = getBladesRollStatus(rolls, zeromode);
  let edge = false;
  if (roll_status == 'critical-success') {edge = true;}

  let result;
  
  // Check and log if Dice Configuration is Manual
  let method = {};
  method.type = (r.terms)[0].method;
  if( method.type ) {
    method.icon = CONFIG.Dice.fulfillment.methods[method.type].icon;
    method.label = CONFIG.Dice.fulfillment.methods[method.type].label;
  }

  // if the roll is a Threat Roll
  if (effect === 'BITD.ThreatRoll') {
	let firstLoop = true; //codes for the header of the chat message
	let r_rolls = [];
	
	// handle 0d
	if (zeromode) {
		// get the first two die results from the array for the 0d roll
		let z_rolls = rolls.slice(0,2);
		
		// remove the use dice from the array
		r_rolls = rolls.slice(2,rolls.length);
		
		//process the die results
		roll_status = getBladesRollStatus(z_rolls, zeromode);
		if (position === "desperate") {if (roll_status === "partial-success") {roll_status = "failure";} }
		result = await renderTemplate("systems/blades-in-the-dark/templates/chat/threat-roll.html", {rolls: z_rolls, zeromode: zeromode, method: method, roll_status: roll_status, attribute_label: attribute_label, position: position, effect: effect, note: note, header: true, body: true, footer: false});
		firstLoop = false;
		
		// decrement for one result output to the chat message
		current_stress--;
	} //end if zeromode
	
	// sort the roll results and remap them to have a sorted rolls array
	let s_rolls = [];
	if (zeromode) {s_rolls = r_rolls;} 
		else {s_rolls = rolls.slice(0,rolls.length);}
    let sorted_rolls = s_rolls.map(i => i.result).sort();
	for (let k =0; k < s_rolls.length; k++) {
		s_rolls[k].result = sorted_rolls[k];
	}

	let use_die=[];

	//loop through the html template for each of the extra threats
	for (let j = current_stress; j >= 0; j--) {
		//pull the highest result to feed into the html
		use_die[0] = s_rolls[s_rolls.length-1];

		//shorten the array for each die used
		s_rolls.length = s_rolls.length-1;

		//get the roll status for each used die
		let roll_status = getBladesRollStatus(use_die, false);
		if (position === "desperate") {if (roll_status === "partial-success") {roll_status = "failure";} }

		//render the html
		if (firstLoop) {
			result = await renderTemplate("systems/blades-in-the-dark/templates/chat/threat-roll.html", {rolls: use_die, zeromode: zeromode, method: method, roll_status: roll_status, attribute_label: attribute_label, position: position, effect: effect, note: note, header: true, body: true, footer: false});
		firstLoop = false;
		} else {
			result += await renderTemplate("systems/blades-in-the-dark/templates/chat/threat-roll.html", {rolls: use_die, zeromode: zeromode, method: method, roll_status: roll_status, attribute_label: attribute_label, position: position, effect: effect, note: note, header: false, body: true, footer: false});
		}

	} //end for loop

	// render html for the note and the remaining die results
	result += await renderTemplate("systems/blades-in-the-dark/templates/chat/threat-roll.html", {rolls: s_rolls, zeromode: zeromode, method: method, roll_status: roll_status, attribute_label: attribute_label, position: position, effect: effect, note: note, header: false, body: false, footer: true, edge: edge});		
  
  }
  
  else if (BladesHelpers.isAttributeAction(attribute_name)) {
    let position_localize = '';
    switch (position) {
      case 'controlled':
        position_localize = 'BITD.PositionControlled'
        break;
      case 'desperate':
        position_localize = 'BITD.PositionDesperate'
        break;
      case 'risky':
      default:
        position_localize = 'BITD.PositionRisky'
    }

    let effect_localize = '';
    switch (effect) {
      case 'limited':
        effect_localize = 'BITD.EffectLimited'
        break;
      case 'great':
        effect_localize = 'BITD.EffectGreat'
        break;
      case 'standard':
      default:
        effect_localize = 'BITD.EffectStandard'
    }

    result = await renderTemplate("systems/blades-in-the-dark/templates/chat/action-roll.html", {rolls: rolls, zeromode: zeromode, method: method, roll_status: roll_status, attribute_label: attribute_label, position: position, position_localize: position_localize, effect: effect, effect_localize: effect_localize, note: note, edge: edge});
  }
  // Check for Resistance roll
  else if (BladesHelpers.isAttributeAttribute(attribute_name)) {
    let stress = getBladesRollStress(rolls, zeromode);
	let filepath = "systems/blades-in-the-dark/templates/chat/resistance-roll.html";
	if (game.settings.get('blades-in-the-dark', 'PushYourself')){
		filepath = "systems/blades-in-the-dark/templates/chat/push-yourself-roll.html";
	}
    result = await renderTemplate(filepath, {rolls: rolls, zeromode: zeromode, method: method, roll_status: roll_status, attribute_label: attribute_label, stress: stress, note: note, edge: edge});
  }
  // Check for Indugle Vice roll
  else if (attribute_name == 'BITD.Vice') {
    let clear_stress = getBladesRollVice(rolls, zeromode);

    if (current_stress - clear_stress >= 0) {
      roll_status = "success";
    } else {
      roll_status = "failure";
      clear_stress = current_stress;
    }

    result = await renderTemplate("systems/blades-in-the-dark/templates/chat/vice-roll.html", {rolls: rolls, zeromode: zeromode, method: method, roll_status: roll_status, attribute_label: attribute_label, clear_stress: clear_stress, note: note, edge: edge});
  }
  // Check for Gather Information roll
  else if (attribute_name == 'BITD.GatherInformation') {
    result = await renderTemplate("systems/blades-in-the-dark/templates/chat/gather-info-roll.html", {rolls: rolls, zeromode: zeromode, method: method, roll_status: roll_status, attribute_label: attribute_label, note: note, edge: edge});
  }
  // Check for Engagement roll
  else if (attribute_name == 'BITD.Engagement') {
    result = await renderTemplate("systems/blades-in-the-dark/templates/chat/engagement-roll.html", {rolls: rolls, zeromode: zeromode, method: method, roll_status: roll_status, attribute_label: attribute_label, note: note, edge: edge});
  }
  // Check for Asset roll
  else if (attribute_name == 'BITD.AcquireAsset') {
    let tier_quality = Number(current_crew_tier);
    let status = String(roll_status);
    switch (status) {
      case "critical-success":
        tier_quality = tier_quality + 2;
        break;
      case "success":
        tier_quality = tier_quality + 1;
        break;
      case "failure":
        if (tier_quality > 0){
          tier_quality = tier_quality - 1;
        }
        break;
      default:
        break;
    }

    result = await renderTemplate("systems/blades-in-the-dark/templates/chat/asset-roll.html", {rolls: rolls, zeromode: zeromode, method: method, roll_status: roll_status, attribute_label: attribute_label, tier_quality: tier_quality, note: note,  edge: edge});
  }
  // Fortune roll if not specified
  else {
    result = await renderTemplate("systems/blades-in-the-dark/templates/chat/fortune-roll.html", {rolls: rolls, zeromode: zeromode, method: method, roll_status: roll_status, attribute_label: "BITD.Fortune", note: note, edge: edge});
  }

  let messageData;
  if (game.version >= 12) {
	  messageData = {
		speaker: speaker,
		content: result,
		rolls: [r]
	}
  } else {
	  messageData = {
		speaker: speaker,
		content: result,
		type: CONST.CHAT_MESSAGE_TYPES.ROLL,
		rolls: [r]
	}
  }

  ChatMessage.create(messageData);
}

/**
 * Get status of the Roll.
 *  - failure
 *  - partial-success
 *  - success
 *  - critical-success
 * @param {Array} rolls
 * @param {Boolean} zeromode
 */
export function getBladesRollStatus(rolls, zeromode = false) {

  // Sort roll values from lowest to highest.
  let sorted_rolls = rolls.map(i => i.result).sort();

  let roll_status = "failure"

  if (sorted_rolls[0] === 6 && zeromode) {
    roll_status = "success";
  }
  else {
    let use_die;
    let prev_use_die = false;

    if (zeromode) {
      use_die = sorted_rolls[0];
    }
    else {
      use_die = sorted_rolls[sorted_rolls.length - 1];

      if (sorted_rolls.length - 2 >= 0) {
        prev_use_die = sorted_rolls[sorted_rolls.length - 2]
      }
    }

    // 1,2,3 = failure
    if (use_die <= 3) {
      roll_status = "failure";
    }
    // if 6 - check the prev highest one.
    else if (use_die === 6) {
      // 6,6 - critical success
      if (prev_use_die && prev_use_die === 6) {
        roll_status = "critical-success";
      }
      // 6 - success
      else {
        roll_status = "success";
      }
    }
    // else (4,5) = partial success
    else {
      roll_status = "partial-success";
    }

  }

  return roll_status;

}
/**
 * Get stress of the Roll.
 * @param {Array} rolls
 * @param {Boolean} zeromode
 */
export function getBladesRollStress(rolls, zeromode = false) {

  var stress = 6;

  // Sort roll values from lowest to highest.
  let sorted_rolls = rolls.map(i => i.result).sort();

  let roll_status = "failure"

  if (sorted_rolls[0] === 6 && zeromode) {
    stress = -1;
  }
  else {
    let use_die;
    let prev_use_die = false;

    if (zeromode) {
      use_die = sorted_rolls[0];
    }
    else {
      use_die = sorted_rolls[sorted_rolls.length - 1];

      if (sorted_rolls.length - 2 >= 0) {
        prev_use_die = sorted_rolls[sorted_rolls.length - 2]
      }
    }

    if (use_die === 6 && prev_use_die && prev_use_die === 6) {
      stress = -1;
    } else {
      stress = 6 - use_die;
    }

  }

  return stress;

}

/**
 * Get stress cleared with a Vice Roll.
 * @param {Array} rolls
 * @param {Boolean} zeromode
 */
export function getBladesRollVice(rolls, zeromode = false) {
  // Sort roll values from lowest to highest.
  let sorted_rolls = rolls.map(i => i.result).sort();
  let use_die;

  if (zeromode) {
    use_die = sorted_rolls[0];
  }
  else {
    use_die = sorted_rolls[sorted_rolls.length - 1];
  }

  return use_die;

}


/**
 * Call a Roll popup.
 */
export async function simpleRollPopup() {
	//get stress and tier from selected token
	let current_stress = 0;
	let current_tier = 0;
	let selected_tokens = canvas.tokens.controlled;
	if (selected_tokens.length >0) {
		let target_actor = game.actors.get(selected_tokens[0].document.actorId);
		if (target_actor.type == "character") {
			current_stress = parseInt(target_actor.system.stress.value);
			try {
				let current_crew = game.actors.get(target_actor.system.crew[0].id);
				current_tier = parseInt(current_crew.system.tier);
			}
			catch (error) {
				console.warn("No Crew is attached to the selected Token.");
				console.error(error);
			}
		}
		if (target_actor.type == "crew") {
			current_tier = parseInt(target_actor.system.tier);
		}
		console.log("For the selected token, Stress is "+current_stress+" and Tier is "+current_tier);
	} 
	else {console.log("No Token is selected.");}
	
  const content = `
      <h2>${game.i18n.localize("BITD.RollSomeDice")}</h2>
      <form class="bitd-simple-roll-dialog">
        <div class="form-group">
          <label>${game.i18n.localize("BITD.RollNumberOfDice")}:</label>
          <select id="qty" name="qty">
            ${Array(11).fill().map((item, i) => `<option value="${i}">${i}d</option>`).join('')}
          </select>
        </div>
        <fieldset class="form-group">
          <legend>Roll Types</legend>
          <div style="display:grid; grid-template-columns:auto auto; gap:1em;">
            <div style="display:grid; gap:0.4em;">
              <label><input type="radio" id="fortune" name="rollSelection" value="fortune" checked=true> ${game.i18n.localize("BITD.Fortune")}</label>
              <label><input type="radio" id="gatherInfo" name="rollSelection" value="gatherInfo"> ${game.i18n.localize("BITD.GatherInformation")}</label>
              <label><input type="radio" id="engagement" name="rollSelection" value="engagement"> ${game.i18n.localize("BITD.Engagement")}</label>
              <label><input type="radio" id="indulgeVice" name="rollSelection" value="indulgeVice"> ${game.i18n.localize("BITD.IndulgeVice")}</label>
              <label><input type="radio" id="acquireAsset" name="rollSelection" value="acquireAsset"> ${game.i18n.localize("BITD.AcquireAsset")}</label>
            </div>
            <div style="display:grid; gap:0.4em; align-content:end;">
              <span><label>${game.i18n.localize('BITD.Stress')}:</label> <select id="stress" name="stress"><option value="${current_stress}" selected disabled hidden>${current_stress}</option>${Array(11).fill().map((item, i) => `<option value="${i}">${i}</option>`).join('')}</select></span>
              <span><label>${game.i18n.localize('BITD.CrewTier')}:</label> <select id="tier" name="tier"><option value="${current_tier}" selected disabled hidden>${current_tier}</option>${Array(5).fill().map((item, i) => `<option value="${i}">${i}</option>`).join('')}</select></span>
            </div>
          </div>
        </fieldset>
        <div className="form-group">
          <label>${game.i18n.localize('BITD.Notes')}:</label>
          <input id="note" name="note" type="text" value="">
        </div><br/>
      </form>
    `;

  const formResult = await openFormDialog({
    title: `Simple Roll`,
    content,
    okLabel: `Roll`,
    cancelLabel: game.i18n.localize('Cancel'),
  });

  if (!formResult) {
    return;
  }

  let diceQty = Number(formResult.qty ?? 0) || 0;
  const stress = Number(formResult.stress ?? current_stress) || 0;
  const tier = Number(formResult.tier ?? current_tier) || 0;
  const note = formResult.note ?? "";
  const selection = formResult.rollSelection ?? "fortune";

  switch (selection) {
    case 'gatherInfo':
      await bladesRoll(diceQty,"BITD.GatherInformation","","",note,"");
      break;
    case 'engagement':
      await bladesRoll(diceQty,"BITD.Engagement","","",note,"");
      break;
    case 'indulgeVice':
      await bladesRoll(diceQty,"BITD.Vice","","",note,stress);
      break;
    case 'acquireAsset':
	  diceQty = diceQty + tier;
      await bladesRoll(diceQty,"BITD.AcquireAsset","","",note,"",tier);
      break;
    default:
      await bladesRoll(diceQty,"","","",note,"");
      break;
  }
}
