import { BladesActiveEffect } from "./blades-active-effect.js";
import { BladesHelpers } from "./blades-helpers.js";
import { getActorSheetClass } from "./compat.js";

const BaseActorSheet = getActorSheetClass();

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */

export class BladesSheet extends BaseActorSheet {

  /* -------------------------------------------- */

  /** @override */
	activateListeners(html) {
    super.activateListeners(html);
    html.find(".item-add-popup").click(this._onItemAddClick.bind(this));
    html.find(".update-box").click(this._onUpdateBoxClick.bind(this));
	
	//for compatibility with bitd-alternate-sheets v1.0.10
	let alt_sheets = false;
	try {alt_sheets = game.modules.get("bitd-alternate-sheets").active;} catch {}
	if (alt_sheets) {
		html.find("input.radio-toggle, label.radio-toggle").click((e) => e.preventDefault());
		html.find("input.radio-toggle, label.radio-toggle").mousedown((e) => {
			this._onRadioToggle(e);
		});
		html.find("input.radio-toggle, label.radio-toggle").contextmenu((e) => {	
			this._onRadioToggle(e);
		});		
	} else {
		html.find("input.radio-toggle, label.radio-toggle").click((e) => {	
			this._onRadioToggle(e);
		});
		html.find("input.radio-toggle, label.radio-toggle").contextmenu((e) => {	
			this._onRadioToggle(e);
		});		
	}

    // Post item to chat
    html.find(".item-post").click((ev) => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      item.sendToChat();
    });

    // This is a workaround until is being fixed in FoundryVTT.
    if ( this.options.submitOnChange ) {
      html.on("change", "textarea", this._onChangeInput.bind(this));  // Use delegated listener on the form
    }

    html.find(".roll-die-attribute").click((event) => {
      const attributeName = event.currentTarget?.dataset?.rollAttribute;
      let defaultDice = 0;
      try {
        const rollData = this.actor.getRollData?.();
        defaultDice = Number(rollData?.dice_amount?.[attributeName] ?? 0);
      } catch (err) {
        console.warn("Failed to determine dice amount for roll.", err);
        defaultDice = 0;
      }

      const sanitizedDice = Number.isNaN(defaultDice) ? 0 : defaultDice;

      this.actor.rollAttributePopup(attributeName, sanitizedDice);
    });
	
    // Update Inventory Item
    html.find('.item-body').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      item.sheet.render(true);
    });
    // Update Inventory Item
    html.find('.item-sheet-open').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(element.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click( async ev => {
      const element = $(ev.currentTarget).parents(".item");
      await this.actor.deleteEmbeddedDocuments("Item", [element.data("itemId")]);
      element.slideUp(200, () => this.render(false));
    });

    // manage active effects
    html.find(".effect-control").click(ev => BladesActiveEffect.onManageActiveEffect(ev, this.actor));	
	
	
		// acquaintance status toggle
    html.find('.standing-toggle').click(ev => {
      let acquaintances = this.actor.system.acquaintances;
      let acqId = ev.target.closest('.acquaintance').dataset.acquaintance;
      let clickedAcqIdx = acquaintances.findIndex(item => item.id == acqId);
      let clickedAcq = acquaintances[clickedAcqIdx];
      let oldStanding = clickedAcq.standing;
      let newStanding;
      switch(oldStanding){
        case "friend":
          newStanding = "rival";
          break;
        case "rival":
          newStanding = "neutral";
          break;
        case "neutral":
          newStanding = "friend";
          break;
      }
      clickedAcq.standing = newStanding;
      acquaintances.splice(clickedAcqIdx, 1, clickedAcq);
      this.actor.update({system: {acquaintances : acquaintances}});
    });
	html.find('.standing-toggle').keydown(ev => {
	  if (ev.key === " " || ev.key === "Spacebar" || ev.key === "Enter") {
		 ev.preventDefault();
		 ev.currentTarget.click();
	  }
	});
	
	  // Open Acquaintance
    html.find('.open-friend').click(ev => {
      const element = $(ev.currentTarget).parents(".item");
		//acqId is the UUID of the Acquaintance
	  let acqId = element.data("itemId");
		// if the Acquaintance is not in the world the if loop will trigger
	  if (game.actors.get(element.data("itemId")) == undefined) {
		  //send the UUID and this actor to a helper fuction
		  BladesHelpers.importAcquaintance(this.actor, acqId);
	  } else {
      const actor = game.actors.get(element.data("itemId"));
      actor?.sheet.render(true);
	  }
    });
	
	// Remove Acquaintance from character sheet
    html.find('.acquaintance-delete').click(ev => {
      //let acqId = ev.target.closest('.acquaintance').dataset.acquaintance; //used when <div class="acquaintance"
	  const element = $(ev.currentTarget).parents(".item");
	  let acqId = element.data("itemId");
	  BladesHelpers.removeAcquaintance(this.actor, acqId);
    });

	  // Import Acquaintance by playbook
    html.find('.import-contacts').click(ev => {
	  const actor_type = this.actor.type;
	  let item_type;
	  if (actor_type=="character") {item_type = "class";}
		else if (actor_type=="crew") {item_type = "crew_type";}
	  const playbook = this.actor.items.filter(i=> i.type === item_type)[0]?.name;
	  BladesHelpers.import_pb_contacts(this.actor, playbook);

    });

		// Increment Exp Clock
	html.find('.up-exp-clock').click(ev => {
		let value = this.actor.system.exp_clock.value;
		let number = this.actor.system.exp_clock.number;
		value = value + 1;
		if (value >= this.actor.system.exp_clock.size) {
			value = 0;
			number = number + 1;
		}
		this.actor.update({"system.exp_clock": {value : value, number : number}});
	});
	
			// Decrement Exp Clock
	html.find('.down-exp-clock').click(ev => {
		let value = this.actor.system.exp_clock.value;
		let number = this.actor.system.exp_clock.number;
		value = value - 1;
		if (value < 0) {
			value = this.actor.system.exp_clock.size - 1;
			number = number - 1;
		}
		this.actor.update({"system.exp_clock": {value : value, number : number}});
	});
	
			// Add a whole Exp Clock
	html.find('.add-exp-clock').click(ev => {
		let number = this.actor.system.exp_clock.number;
		number = number + 1;
		this.actor.update({"system.exp_clock": {number : number}});
	});
	
				// Remove a whole Exp Clock
	html.find('.minus-exp-clock').click(ev => {
		let number = this.actor.system.exp_clock.number;
		if (number > 0) {number = number - 1;}
		else {number = 0;}
		this.actor.update({"system.exp_clock": {number : number}});
	});
	
	
  }

  /* -------------------------------------------- */

  async _onItemAddClick(event) {
    event.preventDefault();
    const item_type = $(event.currentTarget).data("itemType")
    const distinct = $(event.currentTarget).data("distinct")
    let input_type = "checkbox";

    if (typeof distinct !== "undefined") {
      input_type = "radio";
    }

    let items = await BladesHelpers.getAllItemsByType(item_type, game);

    let html = `<div class="items-to-add">`;

    items.forEach(e => {
      let addition_price_load = ``;

      if (typeof e.system.load !== "undefined") {
        addition_price_load += `(${e.system.load})`
      } else if (typeof e.system.price !== "undefined") {
        addition_price_load += `(${e.system.price})`
      }

      html += `<input id="select-item-${e._id}" type="${input_type}" name="select_items" value="${e._id}">`;
      html += `<label class="flex-horizontal" for="select-item-${e._id}">`;
      html += `${game.i18n.localize(e.name)} ${addition_price_load} <i class="fas fa-question-circle" data-tooltip="${game.i18n.localize(e.system.description)}"></i>`;
      html += `</label>`;
    });

    html += `</div>`;

    let options = {
      // width: "500"
    }

    let dialog = new Dialog({
      title: `${game.i18n.localize('Add')} ${item_type}`,
      content: html,
      buttons: {
        one: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize('Add'),
          callback: async (html) => await this.addItemsToSheet(item_type, $(html).find('.items-to-add'))
        },
        two: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('Cancel'),
          callback: () => false
        }
      },
      default: "two"
    }, options);

    dialog.render(true);
  }

  /* -------------------------------------------- */

  async addItemsToSheet(item_type, el) {

    let items = await BladesHelpers.getAllItemsByType(item_type, game);
    let items_to_add = [];
    el.find("input:checked").each(function() {
      items_to_add.push(items.find(e => e._id === $(this).val()));
    });

    if (item_type == "crew") {
		let actor = this.actor;
		await BladesHelpers.addCrew(actor,items_to_add[0]);
	}
	else {
		await Item.create(items_to_add, {parent: this.document});
	}
  }
  /* -------------------------------------------- */

  /**
   * Roll an Attribute die.
   * @param {*} event
   */
  async _onRollAttributeDieClick(event) {

    const attribute_name = $(event.currentTarget).data("rollAttribute");
    this.actor.rollAttributePopup(attribute_name);

  }

  /* -------------------------------------------- */

  async _onUpdateBoxClick(event) {
    event.preventDefault();
    const item_id = $(event.currentTarget).data("item");
    var update_value = $(event.currentTarget).data("value");
      const update_type = $(event.currentTarget).data("utype");
      if ( update_value === undefined) {
      update_value = document.getElementById('fac-' + update_type + '-' + item_id).value;
    };
    var update;
    if ( update_type === "status" ) {
      update = {_id: item_id, system:{status:{value: update_value}}};
    }
    else if (update_type == "hold") {
      update = {_id: item_id, system:{hold:{value: update_value}}};
    } else {
      console.log("update attempted for type undefined in blades-sheet.js onUpdateBoxClick function");
      return;
    };

    await this.actor.updateEmbeddedDocuments("Item", [update]);


    }

  /* -------------------------------------------- */
  
   async _onRadioToggle(event) {
    let type = event.target.tagName.toLowerCase();
    let target = event.target;
    if (type == "label") {
      let labelID = $(target).attr("for");
      target = $(`#${labelID}`).get(0);
    }

    if (target.checked || (event.type == "contextmenu")) {
      //find the next lowest-value input with the same name and click that one instead
      let name = target.name;
      let value = parseInt(target.value) - 1;
      this.element
        .find(`input[name="${name}"][value="${value}"]`)
        .trigger("click");
    } else {
      //trigger the click on this one
      $(target).trigger("click");
    }
  }	

}
