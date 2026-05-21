import { BladesActiveEffect } from "./blades-active-effect.js";
import { BladesHelpers } from "./blades-helpers.js";
import { openFormDialog } from "./lib/dialog-compat.js";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/**
 * Shared V2 base for every Blades actor sheet.
 *
 * Scope policy: this class only carries data-shape-agnostic plumbing —
 * item CRUD, the item-picker dialog, active-effect dispatch, and the
 * radio-cycle widget. Anything that reads or writes a specific
 * `system.<field>` shape belongs on its DataModel as a method or
 * derived getter, and the leaf sheet dispatches with a one-liner.
 *
 * As character/crew/npc/faction migrate to AppV2, their type-specific
 * handlers should land in their DataModel — not here.
 */
export class BladesSheetV2 extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["blades-in-the-dark", "sheet", "actor"],
    window: { resizable: true },
    position: { width: 790, height: 890 },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      "bid.itemAdd":       BladesSheetV2._onItemAdd,
      "bid.itemPost":      BladesSheetV2._onItemPost,
      "bid.itemOpen":      BladesSheetV2._onItemOpen,
      "bid.itemDelete":    BladesSheetV2._onItemDelete,
      "bid.effectControl": BladesSheetV2._onEffectControl,
      "bid.radioToggle":   { handler: BladesSheetV2._onRadioToggle, buttons: [0, 2] }
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
  /*  Item CRUD                                   */
  /* -------------------------------------------- */

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
  /*  Radio-toggle widget                         */
  /* -------------------------------------------- */

  /**
   * Cycle radio inputs on click, decrement on right-click. Currently the
   * stress/trauma/healing-clock widgets emit radio inputs that this handler
   * cycles via the DOM.
   */
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
