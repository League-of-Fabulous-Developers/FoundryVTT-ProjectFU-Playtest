import {Migration} from "../../migration.mjs";
import {PsychicGiftDataModel} from "./psychic-gift-data-model.mjs";
import {MODULE} from "../../constants.mjs";
import {SETTINGS} from "../../settings.mjs";

export class EsperMigration extends Migration {

    canRun() {
        return "psychicGift" in this.systemFeatures && "psychicGift" in this.moduleFeatures
    }

    run() {
        const items = game.items.search({
            filters: [
                {field: "type", value: "classFeature"},
                {field: "system.featureType", value: this.moduleFeatures.psychicGift}
            ]
        });
        game.actors.forEach(actor => {
            actor.itemTypes.classFeature.forEach(classFeature => {
                if (classFeature.system.featureType === this.moduleFeatures.psychicGift) {
                    items.push(classFeature)
                }
            })
        })


        const migrations = items.map(item => item.update({"system.featureType": this.systemFeatures.psychicGift}, {noHook: true}));

        migrations.push(game.settings.set(MODULE, SETTINGS.classes.esper, false))

        return migrations;
    }

    get affectedFeatures() {
        return [PsychicGiftDataModel];
    }
}