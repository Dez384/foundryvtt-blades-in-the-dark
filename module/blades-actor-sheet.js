import {BladesSheet} from "./blades-sheet.js";
import {BladesActiveEffect} from "./blades-active-effect.js";
import {BladesHelpers} from "./blades-helpers.js";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {BladesSheet}
 */
export class BladesActorSheet extends BladesSheet {

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["blades-in-the-dark", "sheet", "actor", "pc"],
            template: "systems/blades-in-the-dark/templates/actor-sheet.html",
            width: 790,
            height: 890,
            tabs: [{navSelector: ".tabs", contentSelector: ".tab-content", initial: "abilities"}]
        });
    }

    /* -------------------------------------------- */

    /** @override */
    async getData(options) {
        const superData = super.getData(options);
        const sheetData = superData.data;
        sheetData.owner = superData.owner;
        sheetData.editable = superData.editable;
        sheetData.isGM = game.user.isGM;

        // Prepare active effects
        sheetData.effects = BladesActiveEffect.prepareActiveEffectCategories(this.actor.effects);

        // Calculate Load
        let loadout = 0;
        sheetData.items.forEach(i => {
            loadout += (i.type === "item") ? parseInt(i.system.load) : 0
        });

        //Sanity Check
        if (loadout < 0) {
            loadout = 0;
        }
        if (loadout > 11) {
            loadout = 11;
        }

        sheetData.system.loadout = loadout;

        // Encumbrance Levels
        let load_level;
        let mule_level;
        if (game.settings.get('blades-in-the-dark', 'DeepCutLoad')) {
            load_level = ["BITD.Discreet", "BITD.Discreet", "BITD.Discreet", "BITD.Discreet", "BITD.Discreet", "BITD.Conspicuous", "BITD.Conspicuous", "BITD.Encumbered",
                "BITD.Encumbered", "BITD.Encumbered", "BITD.OverMax", "BITD.OverMax"];
            mule_level = ["BITD.Discreet", "BITD.Discreet", "BITD.Discreet", "BITD.Discreet", "BITD.Discreet", "BITD.Discreet", "BITD.Discreet", "BITD.Conspicuous",
                "BITD.Conspicuous", "BITD.Encumbered", "BITD.Encumbered", "BITD.OverMax"];
        } else {
            load_level = ["BITD.Light", "BITD.Light", "BITD.Light", "BITD.Light", "BITD.Normal", "BITD.Normal", "BITD.Heavy", "BITD.Encumbered",
                "BITD.Encumbered", "BITD.Encumbered", "BITD.OverMax", "BITD.OverMax"];
            mule_level = ["BITD.Light", "BITD.Light", "BITD.Light", "BITD.Light", "BITD.Light", "BITD.Light", "BITD.Normal", "BITD.Normal",
                "BITD.Heavy", "BITD.Encumbered", "BITD.OverMax", "BITD.OverMax"];
        }
        let mule_present = 0;


        //look for Mule ability
        // @todo - fix translation.
        sheetData.items.forEach(i => {
            if (i.type === "ability" && i.name === "(C) Mule") {
                mule_present = 1;
            }
        });

        //set encumbrance level
        if (mule_present) {
            sheetData.system.load_level = mule_level[loadout];
        } else {
            sheetData.system.load_level = load_level[loadout];
        }

        if (game.settings.get('blades-in-the-dark', 'DeepCutLoad')) {
            sheetData.system.load_levels = {"BITD.Discreet": "BITD.Discreet", "BITD.Conspicuous": "BITD.Conspicuous"};
        } else {
            sheetData.system.load_levels = {
                "BITD.Light": "BITD.Light",
                "BITD.Normal": "BITD.Normal",
                "BITD.Heavy": "BITD.Heavy"
            };
        }

        sheetData.system.description = await TextEditor.enrichHTML(sheetData.system.description, {
            secrets: sheetData.owner,
            async: true
        });

        // catch unmigrated actor data and apply the Mastery crew ability to attribute maxes
        sheetData.system.attributes = this.actor.getComputedAttributes();

        //check for additional stress and trauma from crew sources
        sheetData.system.stress.max = this.actor.getMaxStress();
        sheetData.system.trauma.max = this.actor.getMaxTrauma();

        //check for healing minimums
        sheetData.system.healing_clock.value = this.actor.getHealingMin();

        return sheetData;
    }

    /** @override **/
    async _onDropItem(event, droppedItem) {
        await super._onDropItem(event, droppedItem);
        if (!this.actor.isOwner) {
            ui.notifications.error(`You do not have sufficient permissions to edit this character. Please speak to your GM if you feel you have reached this message in error.`, {permanent: true});
            return false;
        }
        await this.handleDrop(event, droppedItem);
    }

    /** @override **/
    async _onDropActor(event, droppedActor) {
        await super._onDropActor(event, droppedActor);
        if (!this.actor.isOwner) {
            ui.notifications.error(`You do not have sufficient permissions to edit this character. Please speak to your GM if you feel you have reached this message in error.`, {permanent: true});
            return false;
        }
        await this.handleDrop(event, droppedActor);
    }

    /** @override **/
    async handleDrop(event, droppedEntity) {
        let droppedEntityFull = await fromUuid(droppedEntity.uuid);
        switch (droppedEntityFull.type) {
            case "npc":
                await BladesHelpers.addAcquaintance(this.actor, droppedEntityFull);
                break;
            case "crew":
                await BladesHelpers.addCrew(this.actor, droppedEntityFull);
                break;
            case "item":
                break;
            case "ability":
                break;
            case "class":
                break;
            default:
                break;
        }
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Everything below here is only needed if the sheet is editable
        if (!this.options.editable) return;

        // Remove Crew from character sheet
        html.find('.crew-delete').click(ev => {
            const element = $(ev.currentTarget).parents(".item");
            let crewId = element.data("itemId");
            BladesHelpers.removeCrew(this.actor, crewId);
        });

        // Add custom contact
        html.find('.add-custom-contact').click(() => {
            BladesHelpers.addCustomContact(this.actor);
        });

    }

}
