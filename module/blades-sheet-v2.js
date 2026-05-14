import { BladesActiveEffect } from "./blades-active-effect.js";
import { BladesHelpers } from "./blades-helpers.js";
import { openFormDialog } from "./lib/dialog-compat.js";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/**
 * Shared V2 base for every Blades actor sheet. Concentrates the listener
 * surface that lived in module/blades-sheet.js (V1) so leaf sheets only need
 * to declare their tabs, parts, and `_prepareContext` body. Subclasses extend
 * `DEFAULT_OPTIONS` (respread `classes` / `actions` / `dragDrop` — V2 replaces
 * those keys per subclass rather than deep-merging).
 */
export class BladesSheetV2 extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["blades-in-the-dark", "sheet", "actor"],
    window: { resizable: true },
    position: { width: 790, height: 890 },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      "bid.itemAdd":        BladesSheetV2._onItemAdd,
      "bid.updateBox":      BladesSheetV2._onUpdateBox,
      "bid.itemPost":       BladesSheetV2._onItemPost,
      "bid.itemOpen":       BladesSheetV2._onItemOpen,
      "bid.itemDelete":     BladesSheetV2._onItemDelete,
      "bid.effectControl":  BladesSheetV2._onEffectControl,
      "bid.standingToggle": BladesSheetV2._onStandingToggle,
      "bid.openFriend":     BladesSheetV2._onOpenFriend,
      "bid.acqDelete":      BladesSheetV2._onAcqDelete,
      "bid.importContacts": BladesSheetV2._onImportContacts,
      "bid.xpUp":           BladesSheetV2._onXpUp,
      "bid.xpDown":         BladesSheetV2._onXpDown,
      "bid.xpAdd":          BladesSheetV2._onXpAdd,
      "bid.xpMinus":        BladesSheetV2._onXpMinus,
      "bid.rollAttribute":  BladesSheetV2._onRollAttribute,
      "bid.radioToggle":    { handler: BladesSheetV2._onRadioToggle, buttons: [0, 2] }
    }
  };

  static _itemIdFrom(target) {
    return target.dataset.itemId ?? target.closest("[data-item-id]")?.dataset.itemId;
  }

  /* -------------------------------------------- */
  /*  Item add (picker dialog)                    */
  /* -------------------------------------------- */

  static async _onItemAdd(event, target) {
    event.preventDefault();
    const item_type = target.dataset.itemType;
    const distinct = target.dataset.distinct;
    const input_type = (typeof distinct !== "undefined") ? "radio" : "checkbox";

    let items = await BladesHelpers.getAllItemsByType(item_type, game);
    items = items.filter(i => !i.name.includes("Veteran"));
    const grouped_items = BladesHelpers.groupItemsByClass(items);

    let items_html = '<div class="items-list">';
    for (const [itemclass, group] of Object.entries(grouped_items)) {
      items_html += `<div class="item-group"><header>${itemclass}</header>`;
      for (const item of group) {
        const trimmedName = BladesHelpers.trimClassFromName(item.name);
        const description = BladesHelpers.stripHtml(item.system?.description || "");
        items_html += `
          <div class="item-block">
            <input id="select-item-${item._id}" type="${input_type}" name="select_items" value="${item._id}">
            <label for="select-item-${item._id}" title="${description}">
              ${game.i18n.localize(trimmedName)}
            </label>
          </div>`;
      }
      items_html += "</div>";
    }
    items_html += "</div>";

    const content = `<form class="items-to-add">${items_html}</form>`;
    const formResult = await openFormDialog({
      title: `${game.i18n.localize("Add")} ${item_type}`,
      content,
      okLabel: game.i18n.localize("Add"),
      cancelLabel: game.i18n.localize("Cancel")
    });

    if (!formResult || !formResult.select_items) return;
    await this._addItemsToSheet(item_type, formResult.select_items);
  }

  async _addItemsToSheet(item_type, selections) {
    const items = await BladesHelpers.getAllItemsByType(item_type, game);
    let selectedIds = selections;
    if (!Array.isArray(selectedIds)) selectedIds = selectedIds ? [selectedIds] : [];

    const items_to_add = selectedIds
      .map(id => items.find(e => e._id === id))
      .filter(Boolean);
    if (items_to_add.length === 0) return;

    if (item_type === "crew") {
      await BladesHelpers.addCrew(this.actor, items_to_add[0]);
    } else {
      await Item.create(items_to_add, { parent: this.document });
    }
  }

  /* -------------------------------------------- */
  /*  Faction status / hold update                */
  /* -------------------------------------------- */

  static async _onUpdateBox(event, target) {
    event.preventDefault();
    const itemId = target.dataset.item;
    const utype = target.dataset.utype;
    let value = target.dataset.value;
    if (value === undefined) {
      value = this.element.querySelector(`#fac-${utype}-${itemId}`)?.value;
    }
    let update;
    if (utype === "status") {
      update = { _id: itemId, system: { status: { value } } };
    } else if (utype === "hold") {
      update = { _id: itemId, system: { hold: { value } } };
    } else {
      console.warn("bid.updateBox: unknown utype", utype);
      return;
    }
    await this.actor.updateEmbeddedDocuments("Item", [update]);
  }

  static _onItemOpen(event, target) {
    const itemId = BladesSheetV2._itemIdFrom(target);
    if (!itemId) return;
    this.actor.items.get(itemId)?.sheet.render(true);
  }

  static _onItemPost(event, target) {
    const itemId = BladesSheetV2._itemIdFrom(target);
    if (!itemId) return;
    this.actor.items.get(itemId)?.sendToChat();
  }

  static async _onItemDelete(event, target) {
    const itemId = BladesSheetV2._itemIdFrom(target);
    if (!itemId) return;
    await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  /* -------------------------------------------- */
  /*  Active effects                              */
  /* -------------------------------------------- */

  /**
   * Reads from `data-effect-action` rather than `data-action` so the V2 click
   * dispatcher and the inner action verb don't collide. Templates migrated to
   * V2 should emit `data-action="bid.effectControl" data-effect-action="…"`.
   */
  static _onEffectControl(event, target) {
    BladesActiveEffect.onManageActiveEffect(event, this.actor);
  }

  /* -------------------------------------------- */
  /*  Acquaintances                               */
  /* -------------------------------------------- */

  static async _onStandingToggle(event, target) {
    const acqId = target.dataset.acqId
      ?? target.closest(".acquaintance")?.dataset.acquaintance;
    if (!acqId) return;
    const acquaintances = this.actor.system.acquaintances;
    const idx = acquaintances.findIndex(item => item.id === acqId);
    if (idx < 0) return;
    const clicked = acquaintances[idx];
    const next = { friend: "rival", rival: "neutral", neutral: "friend" }[clicked.standing];
    clicked.standing = next ?? clicked.standing;
    acquaintances.splice(idx, 1, clicked);
    await this.actor.update({ system: { acquaintances } });
  }

  static _onOpenFriend(event, target) {
    const acqId = BladesSheetV2._itemIdFrom(target);
    if (!acqId) return;
    const inWorld = game.actors.get(acqId);
    if (inWorld) inWorld.sheet.render(true);
    else BladesHelpers.importAcquaintance(this.actor, acqId);
  }

  static _onAcqDelete(event, target) {
    const acqId = BladesSheetV2._itemIdFrom(target);
    if (!acqId) return;
    BladesHelpers.removeAcquaintance(this.actor, acqId);
  }

  static _onImportContacts(event, target) {
    const actor_type = this.actor.type;
    const item_type = actor_type === "character" ? "class"
      : actor_type === "crew" ? "crew_type"
      : null;
    if (!item_type) return;
    const playbook = this.actor.items.filter(i => i.type === item_type)[0]?.name;
    BladesHelpers.import_pb_contacts(this.actor, playbook);
  }

  /* -------------------------------------------- */
  /*  Exp clock                                   */
  /* -------------------------------------------- */

  static async _onXpUp(event, target) {
    const ec = this.actor.system.exp_clock;
    let value = ec.value + 1;
    let number = ec.number;
    if (value >= ec.size) { value = 0; number += 1; }
    await this.actor.update({ "system.exp_clock": { value, number } });
  }

  static async _onXpDown(event, target) {
    const ec = this.actor.system.exp_clock;
    let value = ec.value - 1;
    let number = ec.number;
    if (value < 0) { value = ec.size - 1; number -= 1; }
    await this.actor.update({ "system.exp_clock": { value, number } });
  }

  static async _onXpAdd(event, target) {
    const number = this.actor.system.exp_clock.number + 1;
    await this.actor.update({ "system.exp_clock": { number } });
  }

  static async _onXpMinus(event, target) {
    const current = this.actor.system.exp_clock.number;
    const number = current > 0 ? current - 1 : 0;
    await this.actor.update({ "system.exp_clock": { number } });
  }

  /* -------------------------------------------- */
  /*  Attribute roll                              */
  /* -------------------------------------------- */

  static _onRollAttribute(event, target) {
    const attributeName = target.dataset.rollAttribute;
    let defaultDice = 0;
    try {
      const rollData = this.actor.getRollData?.();
      defaultDice = Number(rollData?.dice_amount?.[attributeName] ?? 0);
    } catch (err) {
      console.warn("Failed to determine dice amount for roll.", err);
    }
    const sanitized = Number.isNaN(defaultDice) ? 0 : defaultDice;
    this.actor.rollAttributePopup(attributeName, sanitized);
  }

  /* -------------------------------------------- */
  /*  Radio-toggle (cycle on click, decrement on  */
  /*  right-click). Exposes `bladesRadioToggle`   */
  /*  for third-party modules to preempt.         */
  /* -------------------------------------------- */

  static async _onRadioToggle(event, target) {
    const input = target.tagName === "LABEL"
      ? this.element.querySelector(`#${CSS.escape(target.htmlFor)}`)
      : target;
    if (!input) return;

    const ctx = {
      sheet: this,
      document: this.document,
      input,
      event,
      name: input.name,
      value: Number.parseInt(input.value, 10),
      isContextMenu: event.type === "contextmenu"
    };
    if (Hooks.call("bladesRadioToggle", ctx) === false) return;

    event.preventDefault();

    const wasChecked = input.checked || event.type === "contextmenu";
    const targetValue = wasChecked ? ctx.value - 1 : ctx.value;
    const targetInput = wasChecked
      ? this.element.querySelector(`input[name="${ctx.name}"][value="${targetValue}"]`)
      : input;
    if (!targetInput) return;

    targetInput.checked = true;
    targetInput.dispatchEvent(new Event("change", { bubbles: true }));
  }
}
