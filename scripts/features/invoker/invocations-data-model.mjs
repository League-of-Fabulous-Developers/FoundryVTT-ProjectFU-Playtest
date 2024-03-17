import {WELLSPRINGS} from "./invoker-constants.mjs";
import {InvocationSelectionApplication} from "./invocation-selection-application.mjs";

const BASIC = "FU-PT.invocations.basic.name"

const ADVANCED = "FU-PT.invocations.advanced.name"

const FIRST_SUPERIOR = "FU-PT.invocations.superior.nameFirst"
const SECOND_SUPERIOR = "FU-PT.invocations.superior.nameSecond"

const RANKS = {
    basic: "FU-PT.invocations.rank.basic",
    advanced: "FU-PT.invocations.rank.advanced",
    superior: "FU-PT.invocations.rank.superior",
}

export class InvocationsDataModel extends projectfu.RollableClassFeatureDataModel {

    static defineSchema() {
        const {StringField, SchemaField, HTMLField} = foundry.data.fields
        const schema = {
            level: new StringField({initial: "basic", choices: Object.keys(RANKS)}),
            description: new HTMLField()
        };

        for (const [key, wellspring] of Object.entries(WELLSPRINGS)) {
            schema[key] = new SchemaField({
                basic: new SchemaField({
                    name: new StringField({initial: () => game.i18n.format(BASIC, {element: game.i18n.localize(wellspring.element)})}),
                    description: new HTMLField(),
                }),
                advanced: new SchemaField({
                    name: new StringField({initial: () => game.i18n.format(ADVANCED, {element: game.i18n.localize(wellspring.element)})}),
                    description: new HTMLField(),
                }),
                superior1: new SchemaField({
                    name: new StringField({initial: () => game.i18n.format(FIRST_SUPERIOR, {element: game.i18n.localize(wellspring.element)})}),
                    description: new HTMLField(),
                }),
                superior2: new SchemaField({
                    name: new StringField({initial: () => game.i18n.format(SECOND_SUPERIOR, {element: game.i18n.localize(wellspring.element)})}),
                    description: new HTMLField(),
                })
            })
        }

        return schema
    }

    static get template() {
        return "projectfu-playtest.invocations.sheet"
    }

    static get previewTemplate() {
        return "projectfu-playtest.invocations.preview"
    }

    static get translation() {
        return "FU-PT.invocations.label"
    }

    static getTabConfigurations() {
        return [
            {
                group: 'invocationsTabs',
                navSelector: '.invocations-tabs',
                contentSelector: '.invocations-content',
                initial: 'description',
            },
        ];
    }

    static getAdditionalData(model) {
        return {
            levels: RANKS,
            wellsprings: WELLSPRINGS,
            activeWellsprings: model.actor?.wellspringManager.activeWellsprings ?? {}
        }
    }


    static async roll(model, item, isShift) {
        if (isShift) {
            this.#postDescription(model)
        } else {
            const activeWellsprings = model.actor?.wellspringManager.activeWellsprings
            if (!activeWellsprings) return;
            new InvocationSelectionApplication(model).render(true)
        }
    }

    static async #postDescription(model) {
        let renderData = {
            ...model.item,
            additionalData: InvocationsDataModel.getAdditionalData(model),
            enrichedHtml: {description: await TextEditor.enrichHTML(model.description)},
            collapseDescriptions: game.settings.get(projectfu.SYSTEM, 'collapseDescriptions')
        };
        return ChatMessage.create({
            speaker: ChatMessage.implementation.getSpeaker({actor: model.actor}),
            flavor: await renderTemplate("systems/projectfu/templates/chat/chat-check-flavor-item.hbs", renderData),
            content: await renderTemplate("modules/projectfu-playtest/templates/invoker/invocation-description-message.hbs", renderData),
            flags: {[projectfu.SYSTEM]: {[projectfu.Flags.ChatMessage.Item]: model.item}}
        })
    }
}