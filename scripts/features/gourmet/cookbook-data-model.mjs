import {TASTES} from "./ingredient-data-model.mjs";
import {CookingApplication} from "./cooking-application.mjs";


export class CookbookDataModel extends projectfu.RollableClassFeatureDataModel {

    static defineSchema() {
        const {StringField, HTMLField, SchemaField} = foundry.data.fields

        const tastes = Object.keys(TASTES);
        const combinations = {};

        for (let i = 0; i < tastes.length; i++) {
            for (let j = i; j < tastes.length; j++) {
                combinations[`${tastes[i]}_${tastes[j]}`] = new SchemaField({
                    taste1: new StringField({initial: tastes[i], choices: [tastes[i]]}),
                    taste2: new StringField({initial: tastes[j], choices: [tastes[j]]}),
                    effect: new HTMLField()
                })
            }
        }
        return {
            combinations: new SchemaField(combinations)
        }
    }

    static get template() {
        return "projectfu-playtest.cookbook.sheet"
    }

    static get translation() {
        return "FU-PT.cookbook.label"
    }

    static getAdditionalData(model) {
        return {
            tastes: TASTES
        }
    }

    static activateListeners(html, item, sheet) {
        sheet.taste1 ??= html.find("input[type=radio][name=taste1]:checked").val()
        sheet.taste2 ??= html.find("input[type=radio][name=taste2]:checked").val()

        html.find("input[type=radio][name=taste1]").val([sheet.taste1])
        html.find("input[type=radio][name=taste2]").val([sheet.taste2])

        const toggleHighlight = () => {
            html.find(`[data-taste1=${sheet.taste1}][data-taste2=${sheet.taste2}],[data-taste1=${sheet.taste2}][data-taste2=${sheet.taste1}]`).toggleClass("active")
        }
        toggleHighlight()

        html.find("input[type=radio][name=taste1]").change(function () {
            console.log(this)
            toggleHighlight()
            sheet.taste1 = this.value
            toggleHighlight()
        })
        html.find("input[type=radio][name=taste2]").change(function () {
            toggleHighlight()
            sheet.taste2 = this.value
            toggleHighlight()
        })
    }

    /**
     * @param {Taste} taste1
     * @param {Taste} taste2
     * @return {{taste1: Taste, taste2: Taste, effect: string}, null}
     */
    getCombination(taste1, taste2) {
        return this.combinations[`${taste1}_${taste2}`] || this.combinations[`${taste2}_${taste1}`] || null
    }

    static roll(model, item, isShift) {
        new CookingApplication(model).render(true);
    }

    prepareData() {
        this.selected ??= "bitter+bitter"
    }

}