/**
 * @extends projectfu.ClassFeatureDataModel
 * @property {string} trigger
 * @property {string} description
 */
export class MagiseedDataModel extends projectfu.RollableClassFeatureDataModel {

    static defineSchema() {
        const {HTMLField} = foundry.data.fields
        return {
            effect1: new HTMLField,
            effect2: new HTMLField,
            effect3: new HTMLField,
        }
    }

    static get template() {
        return "projectfu-playtest.magiseed.sheet"
    }

    static get previewTemplate() {
		return "projectfu-playtest.magiseed.preview";
	}

	static get expandTemplate() {
		return 'projectfu-playtest.magiseed.description';
	}

    static get translation() {
        return "FU-PT.magiseed.label"
    }

    static async getAdditionalData(model) {
		// Provide any additional data needed for the template rendering
		return {
			enrichedEffect1: await TextEditor.enrichHTML(model.effect1),
			enrichedEffect2: await TextEditor.enrichHTML(model.effect2),
			enrichedEffect3: await TextEditor.enrichHTML(model.effect3),
		};
	}

    static getTabConfigurations() {
        return [
            {
                group: 'magiseedTabs',
                navSelector: '.magiseed-tabs',
                contentSelector: '.magiseed-content',
                initial: 'effect1',
            },
        ];
    }

    static roll(model, item, shiftClick) {
        const gardenManager = item.actor.gardenManager;
        if (gardenManager) {
            if (shiftClick) {
                return MagiseedDataModel.manageMagiseed(item, gardenManager);
            } else {
                return MagiseedDataModel.postEffect(item, gardenManager)
            }
        }
    }

    static async manageMagiseed(item, gardenManager) {
        let effect;
        if (gardenManager.planted === item) {
            gardenManager.removeMagiseed();
            effect = "FU-PT.magiseed.removed"
        } else {
            gardenManager.plantMagiseed(item);
            effect = "FU-PT.magiseed.planted"
        }
        const speaker = ChatMessage.implementation.getSpeaker({actor: item.actor});
        const chatMessage = {
            speaker,
            flavor: await renderTemplate('systems/projectfu/templates/chat/chat-check-flavor-item.hbs', item),
            content: await renderTemplate('modules/projectfu-playtest/templates/floralist/magiseed-chat-message.hbs', {effect}),
            flags: {[projectfu.SYSTEM]: {[projectfu.Flags.ChatMessage.Item]: item}}
        };

        return ChatMessage.create(chatMessage);
    }

    static async postEffect(item, gardenManager) {
        let effect = null;
        if (gardenManager.gardenClock) {
            const filledSections = gardenManager.gardenClock.system.progress.current;
            if (filledSections === 1) {
                effect = item.system.data.effect1;
            } else if (filledSections === 2) {
                effect = item.system.data.effect2;
            } else if (filledSections >= 3) {
                effect = item.system.data.effect3;
            } else {
                effect = game.i18n.localize("FU-PT.magiseed.growthClock.invalid")
            }
        }

        effect = effect !== null ? await TextEditor.enrichHTML(effect, {rollData: item.getRollData()}) : game.i18n.localize("FU-PT.magiseed.growthClock.notFound")

        const speaker = ChatMessage.implementation.getSpeaker({actor: item.actor});
        const chatMessage = {
            speaker,
            flavor: await renderTemplate('systems/projectfu/templates/chat/chat-check-flavor-item.hbs', item),
            content: await renderTemplate('modules/projectfu-playtest/templates/floralist/magiseed-chat-message.hbs', {effect}),
            flags: {[projectfu.SYSTEM]: {[projectfu.Flags.ChatMessage.Item]: item}}
        };

        return ChatMessage.create(chatMessage);
    }

}