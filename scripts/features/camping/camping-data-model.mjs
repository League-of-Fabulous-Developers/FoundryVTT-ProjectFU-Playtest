/**
 * @extends projectfu.OptionalFeatureDataModel
 * @property {string} description
 */
export class CampingActivityDataModel extends projectfu.OptionalFeatureDataModel {

    static defineSchema() {
		const { HTMLField } = foundry.data.fields;
		return {
            description: new HTMLField(),
		};
	}

	static get template() {
		return "projectfu-playtest.camping.sheet";
	}

	static get previewTemplate() {
		return "projectfu-playtest.camping.preview";
	}

	static get translation() {
		return 'FU-PT.camping.label';
	}
}