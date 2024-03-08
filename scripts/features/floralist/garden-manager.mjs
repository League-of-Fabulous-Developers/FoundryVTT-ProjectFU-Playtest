import {MODULE} from "../../constants.mjs";
import {MagiseedDataModel} from "./magiseed-data-model.mjs";

const FLAG_MAGISEED_PLANTED = "magiseed.planted"

const FLAG_GROWTH_CLOCK = "growthClock"

export class GardenManager {

    #actor

    constructor(actor) {
        this.#actor = actor
    }

    static onActorPrepared(actor) {
        if (actor.type === "character") {
            actor.gardenManager ??= new GardenManager(actor)
        }
    }

    static async onRenderStandardFUActorSheet(sheet, html, data) {
        let gardenManager = sheet.actor.gardenManager;
        if (!gardenManager) return;

        if (gardenManager.planted) {
            html.find(".sheet-body .tab.features aside.sidebar > :first-child")
                .after(await renderTemplate("modules/projectfu-playtest/templates/floralist/garden-section.hbs", gardenManager))
            html.find(".garden-section .rollable").click(sheet._onRoll.bind(sheet))
        }
    }

    static async onRenderFUItemSheet(sheet, html, data) {
        if (sheet.item.type === 'miscAbility'){
            html.find(".sheet-body .tab.attributes .title-fieldset:first-child .item-settings").append(`
<label class="checkbox resource-label-sm">
    <span>${game.i18n.localize("FU-PT.magiseed.growthClock.input")}</span>
    <input type="checkbox" name="flags.${MODULE}.${FLAG_GROWTH_CLOCK}" ${sheet.item.flags[MODULE]?.[FLAG_GROWTH_CLOCK] ? "checked" : ""}>
</label>
            `)
        }
    }

    /**
     * @return {FUItem|null}
     */
    get planted() {
        const flag = this.#actor.getFlag(MODULE, FLAG_MAGISEED_PLANTED);
        if (flag) {
            const magiseed = this.#actor.items.get(flag);
            if (magiseed && magiseed.system.data instanceof MagiseedDataModel) {
                return magiseed;
            }
        }
        return null
    }

    /**
     * @return {FUItem|null}
     */
    get gardenClock() {
        return this.#actor.itemTypes.miscAbility.find(item => item.system.hasClock.value && item.system.isFavored.value && item.getFlag(MODULE, FLAG_GROWTH_CLOCK)) ?? null;
    }

    /**
     * @param {FUItem} item
     */
    plantMagiseed(item) {
        if (item && item.system?.data instanceof MagiseedDataModel) {
            this.#actor.setFlag(MODULE, FLAG_MAGISEED_PLANTED, item.id)
        }
    }

    removeMagiseed() {
        this.#actor.unsetFlag(MODULE, FLAG_MAGISEED_PLANTED);
    }

}