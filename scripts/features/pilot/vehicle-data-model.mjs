/**
 * Available frame types and their translation keys
 * @type {{exoskeleton: string, steed: string, mech: string}}
 */
const frames = {
    exoskeleton: "FU-PT.vehicle.frameExoskeleton",
    mech: "FU-PT.vehicle.frameMech",
    steed: "FU-PT.vehicle.frameSteed",
}

/**
 * @extends projectfu.ClassFeatureDataModel
 * @property {"exoskeleton","mech","steed"} frame
 * @property {number} passengers
 * @property {number} distanceMultiplier
 * @property {number} moduleSlots
 * @property {string} description
 */
export class VehicleDataModel extends projectfu.ClassFeatureDataModel {

    static defineSchema() {
        const {StringField, NumberField, HTMLField} = foundry.data.fields
        return {
            frame: new StringField({initial: "exoskeleton", choices: Object.keys(frames)}),
            passengers: new NumberField({initial: 0, min: 0}),
            distanceMultiplier: new NumberField({initial: 1, min: 1}),
            moduleSlots: new NumberField({initial: 3, min: 3}),
            description: new HTMLField()
        }
    }

    static get translation() {
        return "FU-PT.vehicle.label"
    }

    static get template() {
        return "projectfu-playtest.vehicle.sheet"
    }

    static get previewTemplate() {
        return "projectfu-playtest.vehicle.preview"
    }

    static getAdditionalData(model) {
        return {
            frames,
            active: model.item === model.actor?.vehicleManager?.vehicle
        }
    }

    /**
     * How many weapon slots does this vehicle have?
     */
    get weaponSlots() {
        return this.frame === "steed" ? 1 : 2;
    }

}