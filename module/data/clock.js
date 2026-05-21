const { fields } = foundry.data;

const COLOR_CHOICES = {
  black:  "BITD.Colors.Black",
  blue:   "BITD.Colors.Blue",
  green:  "BITD.Colors.Green",
  grey:   "BITD.Colors.Grey",
  red:    "BITD.Colors.Red",
  white:  "BITD.Colors.White",
  yellow: "BITD.Colors.Yellow"
};

const SIZE_CHOICES = [4, 6, 8, 10, 12];

export class ClockData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      type: new fields.NumberField({
        required: true,
        initial: 4,
        choices: SIZE_CHOICES,
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
        blank: false,
        choices: COLOR_CHOICES
      })
    };
  }

  static getImgPath({ color, type, value }) {
    return `systems/blades-in-the-dark/themes/${color}/${type}clock_${value}.svg`;
  }

  prepareDerivedData() {
    this.imgPath = ClockData.getImgPath(this);
  }
}
