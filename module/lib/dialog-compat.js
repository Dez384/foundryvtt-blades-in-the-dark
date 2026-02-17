const FORCE_DIALOG_V1 = false; // Set true locally to test V1 dialogs on modern cores.

function supportsDialogV2() {
  if (FORCE_DIALOG_V1) return false;
  const dialogV2 = foundry?.applications?.api?.DialogV2;
  return Boolean(dialogV2 && typeof dialogV2.wait === "function");
}

function iconClassToHtml(iconClass) {
  if (!iconClass) return undefined;
  return `<i class="${iconClass}"></i>`;
}

function normalizeFormData(form) {
  if (!form) return {};
  const formData = new FormData(form);
  const result = {};
  for (const [key, value] of formData.entries()) {
    if (key in result) {
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

function findFormElement(html) {
  if (!html) return null;
  if (html instanceof HTMLFormElement) return html;
  // jQuery collections expose DOM nodes at numeric keys.
  if (html[0] instanceof HTMLFormElement) return html[0];
  const form = html.find?.("form")?.[0];
  return form instanceof HTMLFormElement ? form : null;
}

/**
 * Open a dialog that works with both the legacy Application V1 API and
 * Foundry's Application V2 "DialogV2" helper. The content should include a
 * `<form>` element so its values can be serialized and returned to the caller.
 *
 * @param {Object} options
 * @param {string} options.title
 * @param {string} options.content  - HTML rendered inside the dialog window
 * @param {string} options.okLabel
 * @param {string} [options.cancelLabel]
 * @param {string} [options.okIcon="fas fa-check"]
 * @param {string} [options.cancelIcon="fas fa-times"]
 * @param {"ok"|"cancel"} [options.defaultButton="ok"]
 * @param {Object} [options.window]
 * @param {Object} [options.dialog]
 * @returns {Promise<object|undefined>} Serialized form values or `undefined`
 * if the dialog was canceled/closed.
 */
export async function openFormDialog({
  title,
  content,
  okLabel,
  cancelLabel,
  okIcon = "fas fa-check",
  cancelIcon = "fas fa-times",
  defaultButton = "ok",
  window: windowOptions = {},
  dialog: legacyDialogOptions = {},
} = {}) {
  if (!title) throw new Error("openFormDialog requires a title");
  if (!content) throw new Error("openFormDialog requires dialog content");
  if (!okLabel) throw new Error("openFormDialog requires an okLabel");

  if (supportsDialogV2()) {
    const { DialogV2 } = foundry.applications.api;

    const buttons = [
      {
        action: "ok",
        label: okLabel,
        icon: okIcon,
        default: defaultButton === "ok",
        callback: (event, button, dialog) => {
          const formElement =
            dialog.element?.querySelector("form") ||
            event.target?.closest("dialog")?.querySelector("form") ||
            document.querySelector("dialog[open] form");
          return normalizeFormData(formElement);
        },
      },
    ];

    if (cancelLabel) {
      buttons.push({
        action: "cancel",
        label: cancelLabel,
        icon: cancelIcon,
        default: defaultButton === "cancel",
        callback: () => undefined,
      });
    }

    const result = await DialogV2.wait({
      window: { title, ...windowOptions },
      content,
      buttons,
    });

    // Handle action string returns and close button
    if (result === undefined || result === "cancel" || result === null) {
      return undefined;
    }
    return result;
  }

  return await new Promise((resolve) => {
    let resolved = false;
    const finish = (value) => {
      if (resolved) return;
      resolved = true;
      resolve(value);
    };

    const buttons = {
      ok: {
        icon: iconClassToHtml(okIcon),
        label: okLabel,
        callback: (html) => {
          const form = findFormElement(html);
          finish(normalizeFormData(form));
        },
      },
    };

    if (cancelLabel) {
      buttons.cancel = {
        icon: iconClassToHtml(cancelIcon),
        label: cancelLabel,
        callback: () => finish(undefined),
      };
    }

    const defaultKey = cancelLabel ? defaultButton : "ok";

    const dialog = new Dialog(
      {
        title,
        content,
        buttons,
        default: defaultKey,
        close: () => finish(undefined),
      },
      legacyDialogOptions
    );

    dialog.render(true);
  });
}
