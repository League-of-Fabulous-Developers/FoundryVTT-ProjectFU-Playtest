/**
 * @typedef Taste
 * @type {"bitter","salty","sour","sweet","umami"}
 */

export const TASTES = Object.freeze({
    "bitter": "FU-PT.ingredient.taste.bitter",
    "salty": "FU-PT.ingredient.taste.salty",
    "sour": "FU-PT.ingredient.taste.sour",
    "sweet": "FU-PT.ingredient.taste.sweet",
    "umami": "FU-PT.ingredient.taste.umami"
})

const TASTE_ARRAY = Object.keys(TASTES);

/**
 * @param {Taste} taste1
 * @param {Taste} taste2
 */
export function tasteComparator(taste1, taste2) {
    return TASTE_ARRAY.indexOf(taste1) - TASTE_ARRAY.indexOf(taste2)
}


/**
 * @property {Taste} taste
 * @property {string} description
 */
export class IngredientDataModel extends projectfu.ClassFeatureDataModel {

    static defineSchema() {
        const {StringField} = foundry.data.fields
        return {
            taste: new StringField({initial: "bitter", choices: TASTE_ARRAY})
        }
    }

    static get template() {
        return "projectfu-playtest.ingredient.sheet"
    }

    static get translation() {
        return "FU-PT.ingredient.label"
    }

    static getAdditionalData(model) {
        return {
            tastes: TASTES
        }
    }

}