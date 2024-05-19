import {Migration} from "../../migration.mjs";
import {FLAG_THERIOFORMS, TherioformDataModel} from "./therioform-data-model.mjs";
import {MODULE} from "../../constants.mjs";
import {SETTINGS} from "../../settings.mjs";

export class MutantMigration extends Migration {

    canRun() {
        return "therioform" in this.systemFeatures && "therioform" in this.moduleFeatures
    }

    run() {
        const items = game.items.search({
            filters: [
                {field: "type", value: "classFeature"},
                {field: "system.featureType", value: this.moduleFeatures.therioform}
            ]
        });
        game.actors.forEach(actor => {
            actor.itemTypes.classFeature.forEach(classFeature => {
                if (classFeature.system.featureType === this.moduleFeatures.therioform) {
                    items.push(classFeature)
                }
            })
        })

        const migrations = items.map(item => item.update({"system.featureType": this.systemFeatures.therioform}, {noHook: true}));

        game.actors.filter(actor => actor.getFlag(MODULE, FLAG_THERIOFORMS))
            .forEach(actor => {
                const associatedTherioforms = actor.getFlag(MODULE, FLAG_THERIOFORMS);
                migrations.push(actor.update({[`flags.${MODULE}.-=${FLAG_THERIOFORMS}`]: null, "system.associatedTherioforms": associatedTherioforms}))
            })

        migrations.push(game.settings.set(MODULE, SETTINGS.classes.mutant, false))

        return migrations;
    }

    get affectedFeatures() {
        return [TherioformDataModel];
    }
}