import {MODULE} from "../../constants.mjs";
import {VehicleDataModel} from "./vehicle-data-model.mjs";
import {ArmorModuleDataModel} from "./armor-module-data-model.mjs";
import {WeaponModuleDataModel} from "./weapon-module-data-model.mjs";
import {SupportModuleDataModel} from "./support-module-data-model.mjs";

const activeVehicle = "vehicle.active"

const vehicleEmbarked = "vehicle.embarked"

const activeWeapons = "vehicle.weapons"

const activeArmor = "vehicle.armor"

const activeSupports = "vehicle.support"

export const VEHICLE_FLAGS = {
    activeVehicle,
    vehicleEmbarked,
    activeWeapons,
    activeArmor,
    activeSupports
}

/**
 * Management component to keep track of a characters active vehicle and modules.
 */
export class VehicleManager {

    #actor

    constructor(actor) {
        this.#actor = actor
    }

    static onActorPrepared(actor) {
        if (actor.type === "character") {
            actor.vehicleManager ??= new VehicleManager(actor)
            actor.vehicleManager.apply()
        }
    }

    static async onRenderStandardFUActorSheet(sheet, html, data) {
        let vehicleManager = sheet.actor.vehicleManager;
        if (!vehicleManager) return;

        html.find("[data-action=toggleActiveVehicle][data-item-id]").click(vehicleManager.toggleActiveVehicle.bind(vehicleManager))
        html.find("[data-action=toggleArmorModule][data-item-id]").click(vehicleManager.toggleArmorModule.bind(vehicleManager))
        html.find("[data-action=toggleWeaponModule][data-item-id]").click(vehicleManager.toggleWeaponModule.bind(vehicleManager))
        html.find("[data-action=toggleSupportModule][data-item-id]").click(vehicleManager.toggleSupportModule.bind(vehicleManager))

        if (vehicleManager.vehicle) {
            html.find(".sheet-body .tab.features aside.sidebar > :first-child")
                .after(await renderTemplate("modules/projectfu-playtest/templates/pilot/vehicle-section.hbs", vehicleManager))
            html.find(".vehicle-section .rollable").click(sheet._onRoll.bind(sheet))
            html.find(".vehicle-section [data-action=toggleVehicleEmbarked]").click(vehicleManager.toggleVehicleEmbarked.bind(vehicleManager))
        }
    }

    get vehicle() {
        let flag = this.#actor.getFlag(MODULE, activeVehicle);
        if (flag) {
            const vehicle = this.#actor.items.get(flag);
            if (vehicle && vehicle.system.data instanceof VehicleDataModel) {
                return vehicle;
            }
        }
        return null
    }

    get embarked() {
        return this.#actor.getFlag(MODULE, vehicleEmbarked) ?? false
    }

    get weapons() {
        let flag = this.#actor.getFlag(MODULE, activeWeapons);
        if (flag) {
            flag = Array.isArray(flag) ? flag : [flag]
            return flag.map(value => this.#actor.items.get(value))
                .filter(value => value?.system.data instanceof WeaponModuleDataModel)
        }
        return []
    }

    get armor() {
        let flag = this.#actor.getFlag(MODULE, activeArmor);
        if (flag) {
            const armor = this.#actor.items.get(flag);
            if (armor && armor.system.data instanceof ArmorModuleDataModel) {
                return armor;
            }
        }
        return null
    }

    get supports() {
        let flag = this.#actor.getFlag(MODULE, activeSupports);
        if (flag) {
            flag = Array.isArray(flag) ? flag : [flag]
            return flag.map(value => this.#actor.items.get(value))
                .filter(value => value?.system.data instanceof SupportModuleDataModel)
        }
        return []
    }

    get usedSlots() {
        const weaponSlots = this.weapons.length
        const armorSlots = this.armor ? 1 : 0
        const supportSlots = this.supports
            .map(value => value.system.data.complex ? 2 : 1)
            .reduce((agg, val) => agg + val, 0);

        return weaponSlots + armorSlots + supportSlots;
    }

    apply() {
        if (!this.embarked) return;
        const armor = this.armor;
        const actorData = this.#actor.system;
        if (armor) {
            let armorData = armor.system.data;
            if (armorData.martial) {
                actorData.derived.def.value = armorData.defense.modifier;
                actorData.derived.mdef.value = armorData.magicDefense.modifier;
            } else {
                actorData.derived.def.value = actorData.attributes[armorData.defense.attribute].current + armorData.defense.modifier;
                actorData.derived.mdef.value = actorData.attributes[armorData.magicDefense.attribute].current + armorData.magicDefense.modifier;
            }
        }
        const shields = this.weapons.filter(value => value.system.data.isShield)
        for (const shield of shields) {
            actorData.derived.def.value += shield.system.data.shield.defense;
            actorData.derived.mdef.value += shield.system.data.shield.magicDefense;
        }
    }

    toggleActiveVehicle(event) {
        const flag = this.#actor.getFlag(MODULE, activeVehicle);
        const vehicleId = event.currentTarget.dataset.itemId;
        if (flag === vehicleId) {
            this.#actor.unsetFlag(MODULE, activeVehicle)
        } else {
            this.#actor.setFlag(MODULE, activeVehicle, vehicleId)
        }
        for (const vehicleFlag of [activeArmor, activeWeapons, activeSupports, vehicleEmbarked]) {
            this.#actor.unsetFlag(MODULE, vehicleFlag)
        }
    }

    toggleVehicleEmbarked() {
        if (this.embarked) {
            this.#actor.unsetFlag(MODULE, vehicleEmbarked)
        } else {
            this.#actor.setFlag(MODULE, vehicleEmbarked, true)
        }
    }

    toggleArmorModule(event) {
        const armorModule = this.#actor.items.get(event.currentTarget.dataset.itemId)
        if (armorModule && armorModule.system.data instanceof ArmorModuleDataModel) {
            if (this.armor === armorModule) {
                this.#actor.unsetFlag(MODULE, activeArmor)
            } else {
                this.#actor.setFlag(MODULE, activeArmor, armorModule.id)
            }
        }
    }

    toggleWeaponModule(event) {
        const weaponModule = this.#actor.items.get(event.currentTarget.dataset.itemId)
        if (weaponModule && weaponModule.system.data instanceof WeaponModuleDataModel) {
            let equipped = this.weapons;
            if (equipped.includes(weaponModule)) {
                this.#actor.setFlag(MODULE, activeWeapons, equipped.map(value => value.id).filter(value => value !== weaponModule.id))
            } else {
                const complexWeapon = weaponModule.system.data.complex;
                const complexWeaponEquipped = equipped.some(value => value.system.data.complex);

                let newEquippedWeapons
                if (complexWeapon || complexWeaponEquipped) {
                    newEquippedWeapons = [weaponModule]
                } else {
                    const maxActive = this.vehicle.system.data.frame === "steed" ? 1 : 2;
                    newEquippedWeapons = [...equipped, weaponModule].slice(-maxActive).sort((a, b) => a.system.data.isShield - b.system.data.isShield)
                }

                this.#actor.setFlag(MODULE, activeWeapons, newEquippedWeapons.map(value => value.id))
            }
        }
    }

    toggleSupportModule(event) {
        const supportModule = this.#actor.items.get(event.currentTarget.dataset.itemId)
        if (supportModule && supportModule.system.data instanceof SupportModuleDataModel) {
            let equipped = this.supports;
            if (equipped.includes(supportModule)) {
                this.#actor.setFlag(MODULE, activeSupports, equipped.map(value => value.id).filter(value => value !== supportModule.id))
            } else {
                this.#actor.setFlag(MODULE, activeSupports, [supportModule, ...equipped].map(value => value.id))
            }
        }
    }


}