
/**
 * @extends projectfu.ClassFeatureDataModel
 * @property {Object} defense
 * @property {"", "dex", "ins", "mig", "wlp"} defense.attribute
 * @property {number} defense.modifier
 * @property {Object} magicDefense
 * @property {"", "dex", "ins", "mig", "wlp"} magicDefense.attribute
 * @property {number} magicDefense.modifier
 * @property {boolean} martial
 * @property {string} quality
 * @property {string} description
 */
export class ArmorModuleDataModel extends projectfu.ClassFeatureDataModel {

    static defineSchema() {
        const {SchemaField, StringField, NumberField, BooleanField, HTMLField} = foundry.data.fields
        return {
            defense: new SchemaField({
                attribute: new StringField({initial: "dex", choices: Object.keys(CONFIG.FU.attributeAbbreviations), nullable: false, blank: true}),
                modifier: new NumberField({initial: 0, integer: true, nullable: false})
            }),
            magicDefense: new SchemaField({
                attribute: new StringField({initial: "ins", choices: Object.keys(CONFIG.FU.attributeAbbreviations), nullable: false, blank: true}),
                modifier: new NumberField({initial: 0, integer: true, nullable: false})
            }),
            martial: new BooleanField(),
            quality: new StringField(),
            description: new HTMLField()
        }
    }

    static get template() {
        return "projectfu-playtest.armorModule.sheet"
    }

    static get previewTemplate() {
        return "projectfu-playtest.armorModule.preview"
    }

    static get translation() {
        return "FU-PT.armorModule.label"
    }

    static getAdditionalData(model) {
        return {
            attributes: CONFIG.FU.attributeAbbreviations,
            active: (model.item === model.actor?.vehicleManager?.armor) ?? false
        }
    }

    /**
     * Override defensive attributes based on the `martial` toggle.
     */
    prepareBaseData() {
        if (this.martial) {
            this.defense.attribute = ""
            this.magicDefense.attribute = ""
        } else {
            this.defense.attribute = this.defense.attribute || "dex"
            this.magicDefense.attribute = this.magicDefense.attribute || "ins"
        }
    }

}