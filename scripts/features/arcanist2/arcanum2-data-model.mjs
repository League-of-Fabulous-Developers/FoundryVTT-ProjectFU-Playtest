/**
 * @extends projectfu.RollableClassFeatureDataModel
 * @property {string} domains
 * @property {string} merge
 * @property {string} pulse
 * @property {string} dismiss
 */
export class Arcanum2DataModel extends projectfu.RollableClassFeatureDataModel {

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

	static get expandTemplate() {
		return 'projectfu-playtest.arcanum2.description';
	}

	static get translation() {
		return 'FU-PT.arcanum2.label';
	}

	static async getAdditionalData(model) {
		// Extract the ID from model.item
		const itemId = model.item?._id;

		// Get the current active arcanum ID
		const actorArcanumId = model.actor?.system.equipped.arcanum || null;

		// Provide any additional data needed for the template rendering
		return {
			enrichedMerge: await TextEditor.enrichHTML(model.merge),
			enrichedPulse: await TextEditor.enrichHTML(model.pulse),
			enrichedDismiss: await TextEditor.enrichHTML(model.dismiss),
			active: itemId === actorArcanumId,
		};
	}

	static async roll(model, item) {
		const actor = model.parent.parent.actor;
		if (!actor) {
			return;
		}
		const data = {
			domains: model.domains,
			merge: await TextEditor.enrichHTML(model.merge),
			pulse: await TextEditor.enrichHTML(model.pulse),
			dismiss: await TextEditor.enrichHTML(model.dismiss),
		};

		const speaker = ChatMessage.implementation.getSpeaker({ actor: actor });
		const chatMessage = {
			speaker,
			flavor: await renderTemplate('systems/projectfu/templates/chat/chat-check-flavor-item.hbs', model.parent.parent),
			content: await renderTemplate('modules/projectfu-playtest/templates/arcanist2/arcanum2-chat-message.hbs', data),
			flags: { [projectfu.SYSTEM]: { [projectfu.Flags.ChatMessage.Item]: item } },
		};

		ChatMessage.create(chatMessage);
	}

	transferEffects() {
		return this.item?.isEquipped ?? false;
	}

    /**
     * Action definition, invoked by sheets when 'data-action' equals the method name and no action defined on the sheet matches that name.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     */
    toggleActiveArcanum(event, target) {
        const currentArcanumId = this.actor.system.equipped.arcanum;
        // Toggle arcanum slot
        const newArcanumId = currentArcanumId === this.item.id ? null : this.item.id;
        this.actor.update({
            'system.equipped.arcanum': newArcanumId,
        });
    }
}