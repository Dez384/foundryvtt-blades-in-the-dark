/**
 * Extend the basic ItemSheet
 * @extends {ItemSheet}
 */
import {onManageActiveEffect, prepareActiveEffectCategories} from "./effects.js";
import { BladesActiveEffect } from "./blades-active-effect.js";
import { getItemSheetClass, enrichHTML } from "./compat.js";

const BaseItemSheet = getItemSheetClass();

export class BladesItemSheet extends BaseItemSheet {

  /** @override */
	static get defaultOptions() {

	  return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ["blades-in-the-dark", "sheet", "item"],
			width: 560,
			height: 'auto',
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}]
		});
  }

  /* -------------------------------------------- */

  /** @override */
  get template() {
    const path = "systems/blades-in-the-dark/templates/items";
    let simple_item_types = ["background", "heritage", "vice", "crew_reputation"];
    let template_name = `${this.item.type}`;

    if (simple_item_types.indexOf(this.item.type) >= 0) {
      template_name = "simple";
    }

    return `${path}/${template_name}.html`;
  }

  /* -------------------------------------------- */

  /** @override */
	activateListeners(html) {
    super.activateListeners(html);

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

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find(".effect-control").click(ev => {
      if ( this.item.isOwned ) return ui.notifications.warn(game.i18n.localize("BITD.EffectWarning"))
      BladesActiveEffect.onManageActiveEffect(ev, this.item)
    });
  }

  /* -------------------------------------------- */

  /** @override */
  async getData(options) {
    const superData = super.getData( options );
    const sheetData = superData.data;

    sheetData.isGM = game.user.isGM;
    sheetData.owner = superData.owner;
    sheetData.editable = superData.editable;

    // Prepare Active Effects
    sheetData.effects = prepareActiveEffectCategories(this.document.effects);

    sheetData.system.description = await enrichHTML(sheetData.system.description, {secrets: sheetData.owner, async: true});

    return sheetData;
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
