/** Foundry VTT v14 TypeDataModels for Blades in the Dark. */
import { systemDataDefaults } from "./data-defaults.js";

const F = foundry.data.fields;

// Existing Blades sheets store mutable, heterogeneous objects in system data.
// Model their top-level shape without imposing strict nested schemas.
function fieldForDefault(value) {
  const opts = { required: true, nullable: false };
  if (Array.isArray(value)) {
    return new F.ArrayField(new F.AnyField(), {
      ...opts, initial: () => foundry.utils.deepClone(value)
    });
  }
  if (value === null) return new F.AnyField({ required: false, nullable: true, initial: null });
  if (value && typeof value === "object") {
    return new F.ObjectField({ ...opts, initial: () => foundry.utils.deepClone(value) });
  }
  if (typeof value === "string") return new F.StringField({ ...opts, initial: value });
  if (typeof value === "number") return new F.NumberField({ ...opts, initial: value });
  if (typeof value === "boolean") return new F.BooleanField({ ...opts, initial: value });
  return new F.AnyField({ required: false });
}

function buildModel(defaults) {
  return class BladesDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
      return Object.fromEntries(Object.entries(defaults).map(
        ([name, value]) => [name, fieldForDefault(value)]
      ));
    }

    static migrateData(source) {
      source = super.migrateData(source);
      return foundry.utils.mergeObject(
        foundry.utils.deepClone(defaults), source ?? {},
        { inplace: false, overwrite: true }
      );
    }
  };
}

export function registerSystemDataModels() {
  for (const [documentName, types] of Object.entries(systemDataDefaults)) {
    for (const [type, defaults] of Object.entries(types)) {
      CONFIG[documentName].dataModels[type] = buildModel(defaults);
    }
  }
}
