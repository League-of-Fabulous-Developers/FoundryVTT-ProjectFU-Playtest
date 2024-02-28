/**
 * @extends projectfu.ClassFeatureDataModel
 * @property {boolean} complex
 * @property {string} description
 */
export class SupportModuleDataModel extends projectfu.ClassFeatureDataModel {

    static defineSchema(){
        const {BooleanField, HTMLField} = foundry.data.fields
        return {
            complex: new BooleanField(),
            description: new HTMLField()
        }
    }

    static get template() {
        return "projectfu-playtest.supportModule.sheet"
    }

    static get previewTemplate() {
        return "projectfu-playtest.supportModule.preview"
    }

    static get translation() {
        return "FU-PT.supportModule.label"
    }

    static getAdditionalData(model) {
        return {
            active: model.actor?.vehicleManager?.supports.includes(model.item) ?? false
        }
    }


}