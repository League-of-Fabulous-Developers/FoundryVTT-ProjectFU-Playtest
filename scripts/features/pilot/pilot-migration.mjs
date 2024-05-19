import {Migration} from "../../migration.mjs";
import {VehicleDataModel} from "./vehicle-data-model.mjs";
import {ArmorModuleDataModel} from "./armor-module-data-model.mjs";
import {WeaponModuleDataModel} from "./weapon-module-data-model.mjs";
import {SupportModuleDataModel} from "./support-module-data-model.mjs";
import {MODULE} from "../../constants.mjs";
import {SETTINGS} from "../../settings.mjs";
import {VEHICLE_FLAGS} from "./vehicle-manager.mjs";

export class PilotMigration extends Migration {

    static #features = ["vehicle", "armorModule", "weaponModule", "supportModule"];

    canRun() {
        return PilotMigration.#features
            .every(key => key in this.systemFeatures && key in this.moduleFeatures)
    }

    run() {
        const migrations = [];
        for (let feature of PilotMigration.#features) {
            const items = game.items.search({
                filters: [
                    {field: "type", value: "classFeature"},
                    {field: "system.featureType", value: this.moduleFeatures[feature]}
                ]
            });
            game.actors.forEach(actor => {
                actor.itemTypes.classFeature.forEach(classFeature => {
                    if (classFeature.system.featureType === this.moduleFeatures[feature]) {
                        items.push(classFeature)
                    }
                })
            })

            migrations.push(...items.map(item => item.update({"system.featureType": this.systemFeatures[feature]}, {noHook: true})));
        }

        game.actors.filter(actor => actor.vehicleManager)
            .forEach(actor => {
                const activeVehicle = actor.getFlag(MODULE, VEHICLE_FLAGS.activeVehicle);
                const vehicleEmbarked = actor.getFlag(MODULE, VEHICLE_FLAGS.vehicleEmbarked);
                const activeArmor = actor.getFlag(MODULE, VEHICLE_FLAGS.activeArmor);
                const activeWeapons = actor.getFlag(MODULE, VEHICLE_FLAGS.activeWeapons);
                const activeSupports = actor.getFlag(MODULE, VEHICLE_FLAGS.activeSupports);

                migrations.push(actor.update({
                    [`flags.${MODULE}.-=vehicle`]: null,
                    "system.vehicle.vehicle": activeVehicle,
                    "system.vehicle.embarked": vehicleEmbarked,
                    "system.vehicle.armor": activeArmor,
                    "system.vehicle.weapons": activeWeapons,
                    "system.vehicle.supports": activeSupports,
                }))
            })

        migrations.push(game.settings.set(MODULE, SETTINGS.classes.pilot, false))

        return migrations;

    }

    get affectedFeatures() {
        return [VehicleDataModel, ArmorModuleDataModel, WeaponModuleDataModel, SupportModuleDataModel];
    }
}