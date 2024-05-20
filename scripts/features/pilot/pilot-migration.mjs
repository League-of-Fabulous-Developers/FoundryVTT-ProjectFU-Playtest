import {Migration} from "../../migration.mjs";
import {VehicleDataModel} from "./vehicle-data-model.mjs";
import {ArmorModuleDataModel} from "./armor-module-data-model.mjs";
import {WeaponModuleDataModel} from "./weapon-module-data-model.mjs";
import {SupportModuleDataModel} from "./support-module-data-model.mjs";
import {MODULE} from "../../constants.mjs";
import {SETTINGS} from "../../settings.mjs";
import {VEHICLE_FLAGS} from "./vehicle-manager.mjs";

export class PilotMigration extends Migration {

    additionalMigrations() {
        return game.actors.filter(actor => actor.vehicleManager)
            .map(actor => {
                const activeVehicle = actor.getFlag(MODULE, VEHICLE_FLAGS.activeVehicle);
                const vehicleEmbarked = actor.getFlag(MODULE, VEHICLE_FLAGS.vehicleEmbarked);
                const activeArmor = actor.getFlag(MODULE, VEHICLE_FLAGS.activeArmor);
                const activeWeapons = actor.getFlag(MODULE, VEHICLE_FLAGS.activeWeapons);
                const activeSupports = actor.getFlag(MODULE, VEHICLE_FLAGS.activeSupports);

                return () => actor.update({
                    [`flags.${MODULE}.-=vehicle`]: null,
                    "system.vehicle.vehicle": activeVehicle,
                    "system.vehicle.embarked": vehicleEmbarked,
                    "system.vehicle.armor": activeArmor,
                    "system.vehicle.weapons": activeWeapons,
                    "system.vehicle.supports": activeSupports,
                })
            })
    }

    get affectedFeatures() {
        return [
            {
                module: this.moduleFeatures.vehicle,
                system: this.systemFeatures.vehicle,
                implementation: VehicleDataModel
            },
            {
                module: this.moduleFeatures.armorModule,
                system: this.systemFeatures.armorModule,
                implementation: ArmorModuleDataModel
            },
            {
                module: this.moduleFeatures.weaponModule,
                system: this.systemFeatures.weaponModule,
                implementation: WeaponModuleDataModel
            },
            {
                module: this.moduleFeatures.supportModule,
                system: this.systemFeatures.supportModule,
                implementation: SupportModuleDataModel
            }
        ]
    }


    get setting() {
        return SETTINGS.classes.pilot
    }
}