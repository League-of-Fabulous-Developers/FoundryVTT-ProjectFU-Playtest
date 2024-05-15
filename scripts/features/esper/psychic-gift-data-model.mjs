/**
 * @extends projectfu.ClassFeatureDataModel
 * @property {string} trigger
 * @property {string} description
 */
export class PsychicGiftDataModel extends projectfu.ClassFeatureDataModel {

    static defineSchema() {
        const {StringField, HTMLField} = foundry.data.fields
        return {
            trigger: new StringField(),
            description: new HTMLField(),
        }
    }

    static get template() {
        return "projectfu-playtest.psychicGift.sheet"
    }

    static get previewTemplate() {
        return "projectfu-playtest.psychicGift.preview"
    }

    static get translation(){
        return "FU-PT.psychicGift.label"
    }
}