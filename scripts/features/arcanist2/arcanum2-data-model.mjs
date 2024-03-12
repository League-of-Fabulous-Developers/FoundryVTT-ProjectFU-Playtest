/**
 * @extends projectfu.ClassFeatureDataModel
 * @property {string} domains
 * @property {string} merge
 * @property {string} pulse
 * @property {string} dismiss
 */
export class Arcanum2DataModel extends projectfu.ClassFeatureDataModel {

    static defineSchema() {
		const { StringField, HTMLField } = foundry.data.fields;
		return {
			domains: new StringField(),
			merge: new HTMLField(),
            pulse: new HTMLField(),
			dismiss: new HTMLField(),
		};
	}

	static get template() {
		return "projectfu-playtest.arcanum2.sheet";
	}

	static get previewTemplate() {
		return "projectfu-playtest.arcanum2.preview";
	}

	static get translation() {
		return 'FU-PT.arcanum2.label';
	}
}