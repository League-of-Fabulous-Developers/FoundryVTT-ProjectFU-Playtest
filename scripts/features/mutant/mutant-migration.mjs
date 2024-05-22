import {Migration} from "../../migration.mjs";
import {FLAG_THERIOFORMS, TherioformDataModel} from "./therioform-data-model.mjs";
import {MODULE} from "../../constants.mjs";
import {SETTINGS} from "../../settings.mjs";

export class MutantMigration extends Migration {

    additionalMigrations() {
        return game.actors.filter(actor => actor.getFlag(MODULE, FLAG_THERIOFORMS))
            .map(actor => {
                const associatedTherioforms = actor.getFlag(MODULE, FLAG_THERIOFORMS);
                return () => actor.update({
                    [`flags.${MODULE}.-=${FLAG_THERIOFORMS}`]: null,
                    "system.associatedTherioforms": associatedTherioforms
                })
            })
    }

    get affectedFeatures() {
        return [{
            module: this.moduleFeatures.therioform,
            system: this.systemFeatures.therioform,
            implementation: TherioformDataModel
        }];
    }

    get setting() {
        return SETTINGS.classes.mutant
    }
}