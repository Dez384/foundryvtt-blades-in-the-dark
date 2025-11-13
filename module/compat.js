/**
 * Lightweight compatibility helpers that prefer the V13+ namespaced APIs while
 * keeping graceful fallbacks for the V11/V12 globals this system still
 * supports. Each accessor resolves the modern entry point first so the module
 * avoids deprecation warnings once the legacy globals disappear (planned for
 * Foundry VTT V15+).
 */
export function getActorSheetClass() {
  return foundry?.appv1?.sheets?.ActorSheet ?? globalThis.ActorSheet;
}

export function getItemSheetClass() {
  return foundry?.appv1?.sheets?.ItemSheet ?? globalThis.ItemSheet;
}

let cachedSheetConfig;

function getSheetConfig() {
  if (cachedSheetConfig) return cachedSheetConfig;
  const apiConfig = foundry?.applications?.api?.DocumentSheetConfig ?? foundry?.applications?.config?.DocumentSheetConfig;
  cachedSheetConfig = apiConfig ?? null;
  return cachedSheetConfig;
}

function getActorsCollectionLegacy() {
  return foundry?.documents?.collections?.Actors ?? game?.actors ?? globalThis.Actors;
}

function getItemsCollectionLegacy() {
  return foundry?.documents?.collections?.Items ?? game?.items ?? globalThis.Items;
}

export function unregisterActorSheet(namespace, sheetClass) {
  const sheetConfig = getSheetConfig();
  if (sheetConfig?.unregisterSheet) {
    return sheetConfig.unregisterSheet(CONFIG.Actor.documentClass, namespace, sheetClass);
  }
  return getActorsCollectionLegacy()?.unregisterSheet?.(namespace, sheetClass);
}

export function registerActorSheet(namespace, sheetClass, options) {
  const sheetConfig = getSheetConfig();
  if (sheetConfig?.registerSheet) {
    return sheetConfig.registerSheet(CONFIG.Actor.documentClass, namespace, sheetClass, options);
  }
  return getActorsCollectionLegacy()?.registerSheet?.(namespace, sheetClass, options);
}

export function unregisterItemSheet(namespace, sheetClass) {
  const sheetConfig = getSheetConfig();
  if (sheetConfig?.unregisterSheet) {
    return sheetConfig.unregisterSheet(CONFIG.Item.documentClass, namespace, sheetClass);
  }
  return getItemsCollectionLegacy()?.unregisterSheet?.(namespace, sheetClass);
}

export function registerItemSheet(namespace, sheetClass, options) {
  const sheetConfig = getSheetConfig();
  if (sheetConfig?.registerSheet) {
    return sheetConfig.registerSheet(CONFIG.Item.documentClass, namespace, sheetClass, options);
  }
  return getItemsCollectionLegacy()?.registerSheet?.(namespace, sheetClass, options);
}

export function loadHandlebarsTemplates(paths) {
  const loader = foundry?.applications?.handlebars?.loadTemplates ?? globalThis.loadTemplates;
  if (!loader) {
    throw new Error("Unable to resolve a Handlebars template loader");
  }
  return loader(paths);
}

export function renderHandlebarsTemplate(...args) {
  const renderer = foundry?.applications?.handlebars?.renderTemplate ?? globalThis.renderTemplate;
  if (!renderer) {
    throw new Error("Unable to resolve a Handlebars template renderer");
  }
  return renderer(...args);
}

export function enrichHTML(...args) {
  const textEditor = foundry?.applications?.ux?.TextEditor?.implementation ?? globalThis.TextEditor;
  const enrich = textEditor?.enrichHTML;
  if (!enrich) {
    throw new Error("Unable to resolve TextEditor.enrichHTML");
  }
  return enrich.apply(textEditor, args);
}

export function generateRandomId() {
  const randomIdFn = foundry?.utils?.randomID ?? globalThis.randomID;
  if (!randomIdFn) {
    throw new Error("Unable to resolve a randomID generator");
  }
  return randomIdFn();
}
