import {MODULE} from "../../constants.mjs";
import {IngredientDataModel, tasteComparator, TASTES} from "./ingredient-data-model.mjs";

const ALL_YOU_CAN_EAT_FLAG = "AllYouCanEat"

/**
 * @typedef Recipe
 * @property {string[]} ingredients
 */

/**
 * @property {Recipe} object
 */
export class CookingApplication extends FormApplication {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["form", "projectfu", "cooking-app"],
            width: 550,
            height:"auto",
            closeOnSubmit: false,
            editable: true,
            sheetConfig: false,
            submitOnChange: true,
            submitOnClose: true,
            minimizable: false,
            title: "FU-PT.cookbook.cooking.title"
        });
    }

    /**
     * @type CookbookDataModel
     */
    #cookbook

    /**
     * @type number
     */
    #maxIngredients

    constructor(cookbook) {
        if (cookbook.app) {
            return cookbook.app
        }
        const maxIngredients = cookbook.actor.getFlag(MODULE, ALL_YOU_CAN_EAT_FLAG) ? 4 : 3;
        super({ingredients: Array(maxIngredients).fill("")});
        this.#cookbook = cookbook;
        this.#maxIngredients = maxIngredients
        cookbook.app = this;
    }


    get template() {
        return "modules/projectfu-playtest/templates/gourmet/cooking-application.hbs";
    }

    async getData(options = {}) {
        /** @type {Record<string, FUItem>} */
        const ingredients = this.#cookbook.actor.itemTypes.classFeature
            .filter(value => value.system.data instanceof IngredientDataModel)
            .reduce((agg, val) => (agg[val.id] = val) && agg, {});

        const tastes = this.object.ingredients.map(value => ingredients[value])
            .filter(value => !!value)
            .map(value => value.system.data.taste)
            .sort(tasteComparator);

        const combinations = [];

        for (let i = 0; i < tastes.length - 1; i++) {
            for (let j = i + 1; j < tastes.length; j++) {
                let firstTaste = tastes[i];
                let secondTaste = tastes[j];
                if (!combinations.some(([t1, t2]) => t1 === firstTaste && t2 === secondTaste )) {
                    combinations.push([firstTaste, secondTaste])
                }
            }
        }

        const effects = await Promise.all(combinations.map(([taste1, taste2]) => this.#cookbook.getCombination(taste1, taste2))
            .map(async value => ({
                taste1: {
                    value: value.taste1,
                    label: TASTES[value.taste1]
                },
                taste2: {
                    value: value.taste2,
                    label: TASTES[value.taste2]
                },
                effect: await TextEditor.enrichHTML(value.effect)
            })));

        const selectOptions = []
        this.object.ingredients.forEach((value, index, array) => {
            const alreadySelectedIngredients = array.toSpliced(index, 1);
            const options = Object.keys(ingredients)
                .filter(ingredientId => !alreadySelectedIngredients.includes(ingredientId))
                .map(ingredientId => ({
                    value: ingredientId,
                    label: `${ingredients[ingredientId].name} (${game.i18n.localize(TASTES[ingredients[ingredientId].system.data.taste])})`
                }))
            selectOptions.push(options)
        })

        return {
            recipe: this.object,
            ingredients: ingredients,
            effects: effects,
            options: selectOptions
        };
    }

    async close(options = {}) {
        await super.close(options);
        delete this.#cookbook.app
        if (options.getCooking) {
            return this.#startCooking()
        }
    }

    async #startCooking(){
        const data = await this.getData();
        const updates = []

        const renderData = {
            ingredients: data.recipe.ingredients.map(id => data.ingredients[id]).filter(value => !!value),
            effects: data.effects
        }

        /**
         * @type FUActor
         */
        const actor = this.#cookbook.actor;

        updates.push(Item.deleteDocuments(renderData.ingredients.map(item => item.id), {parent: actor}))

        /**
         * @type ChatMessageData
         */
        const messageData = {
            speaker: ChatMessage.implementation.getSpeaker({actor: actor}),
            content: await renderTemplate("modules/projectfu-playtest/templates/gourmet/cooking-chat-message.hbs", renderData)
        }

        updates.unshift(ChatMessage.create(messageData));

        return Promise.all(updates)
    }

    async _updateObject(event, formData) {
        formData = foundry.utils.expandObject(formData)
        this.object.ingredients = Array.from(Object.values(formData.ingredients))
        this.render()
    }

    activateListeners(html) {
        html.find("[data-action=startCooking]").click(() => this.close({getCooking: true}))
        return super.activateListeners(html);
    }

}