import {MODULE} from "../../constants.mjs";

/**
 * @extends projectfu.ClassFeatureDataModel
 * @property {string} description
 */
export class TherioformDataModel extends projectfu.ClassFeatureDataModel {

    static async onRenderStandardFUActorSheet(sheet, html, data) {
        if (sheet.actor.type === "npc") {
            html.find(".sheet-body .body-section .stats-container > :first-child")
                .after(`
<fieldset class="desc resource-content title-fieldset associated-therioforms">
    <legend class="resource-label-m">
        <label>${game.i18n.localize("FU-PT.therioform.associatedTherioforms")}</label>
    </legend>
    <div>
        <input type="text" name="flags.projectfu-playtest.therioforms" value="${sheet.actor.getFlag(MODULE, "therioforms")}" class="resource-label-sm">
    </div>
</fieldset>`)
        }
    }

    static defineSchema() {
        const {HTMLField} = foundry.data.fields
        return {
            description: new HTMLField(),
        }
    }

    static get template() {
        return "projectfu-playtest.therioform.sheet"
    }

    static get translation() {
        return "FU-PT.therioform.label"
    }
}