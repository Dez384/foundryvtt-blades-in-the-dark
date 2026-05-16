const { fields } = foundry.data;

export class ClockData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      type: new fields.NumberField({
        required: true,
        initial: 4,
        choices: [4, 6, 8, 10, 12],
        integer: true
      }),
      value: new fields.NumberField({
        required: true,
        initial: 0,
        min: 0,
        integer: true
      }),
      color: new fields.StringField({
        required: true,
        initial: "black",
        blank: false
      })
    };
  }
}
