import {Arcanum2DataModel} from "./features/arcanist2/arcanum2-data-model.mjs";
import {PsychicGiftDataModel} from "./features/esper/psychic-gift-data-model.mjs";
import {TherioformDataModel} from "./features/mutant/therioform-data-model.mjs";
import {ArmorModuleDataModel} from "./features/pilot/armor-module-data-model.mjs";
import {WeaponModuleDataModel} from "./features/pilot/weapon-module-data-model.mjs";
import {VehicleDataModel} from "./features/pilot/vehicle-data-model.mjs";
import {LOG_MESSAGE, MODULE} from "./constants.mjs";
import {VehicleManager} from "./features/pilot/vehicle-manager.mjs";
import {SupportModuleDataModel} from "./features/pilot/support-module-data-model.mjs";
import {registerClassSettings, registerModuleSettings, SETTINGS} from "./settings.mjs";
import {MagiseedDataModel} from "./features/floralist/magiseed-data-model.mjs";
import {GardenManager} from "./features/floralist/garden-manager.mjs";

export const registeredFeatures = {}

Hooks.once('init', async function () {
    console.log(LOG_MESSAGE, "Initialization started")

    console.log(LOG_MESSAGE, "Registering settings")
    registerModuleSettings()
    registerClassSettings()

    console.log(LOG_MESSAGE, "Registering class features")
    const templates = {}

    if (game.settings.get(MODULE, SETTINGS.classes.arcanist2)) {
        registeredFeatures.arcanum2 = CONFIG.FU.classFeatureRegistry.register(MODULE, "arcanum2", Arcanum2DataModel)

        Object.assign(templates, {
            "projectfu-playtest.arcanum2.sheet": "modules/projectfu-playtest/templates/arcanist2/arcanum2-sheet.hbs",
            "projectfu-playtest.arcanum2.preview": "modules/projectfu-playtest/templates/arcanist2/arcanum2-preview.hbs",
        })
    }

    if (game.settings.get(MODULE, SETTINGS.classes.esper)) {
        registeredFeatures.psychicGift = CONFIG.FU.classFeatureRegistry.register(MODULE, "psychicGift", PsychicGiftDataModel)

        Object.assign(templates, {
            "projectfu-playtest.psychicGift.sheet": "modules/projectfu-playtest/templates/esper/psychic-gift-sheet.hbs",
            "projectfu-playtest.psychicGift.preview": "modules/projectfu-playtest/templates/esper/psychic-gift-preview.hbs",
        })
    }

    if (game.settings.get(MODULE, SETTINGS.classes.mutant)) {
        registeredFeatures.therioform = CONFIG.FU.classFeatureRegistry.register(MODULE, "therioform", TherioformDataModel)

        Hooks.on("renderFUStandardActorSheet", TherioformDataModel.onRenderStandardFUActorSheet)

        Object.assign(templates, {
            "projectfu-playtest.therioform.sheet": "modules/projectfu-playtest/templates/mutant/therioform-sheet.hbs",
        })
    }

    if (game.settings.get(MODULE, SETTINGS.classes.pilot)) {
        registeredFeatures.vehicle = CONFIG.FU.classFeatureRegistry.register(MODULE, "vehicle", VehicleDataModel)
        registeredFeatures.armorModule = CONFIG.FU.classFeatureRegistry.register(MODULE, "armorModule", ArmorModuleDataModel)
        registeredFeatures.weaponModule = CONFIG.FU.classFeatureRegistry.register(MODULE, "weaponModule", WeaponModuleDataModel)
        registeredFeatures.supportModule = CONFIG.FU.classFeatureRegistry.register(MODULE, "supportModule", SupportModuleDataModel)

        Hooks.on("projectfu.actor.dataPrepared", VehicleManager.onActorPrepared)
        Hooks.on("renderFUStandardActorSheet", VehicleManager.onRenderStandardFUActorSheet)

        Object.assign(templates, {
            "projectfu-playtest.vehicle.sheet": "modules/projectfu-playtest/templates/pilot/vehicle-sheet.hbs",
            "projectfu-playtest.vehicle.preview": "modules/projectfu-playtest/templates/pilot/vehicle-preview.hbs",
            "projectfu-playtest.armorModule.sheet": "modules/projectfu-playtest/templates/pilot/armor-module-sheet.hbs",
            "projectfu-playtest.armorModule.preview": "modules/projectfu-playtest/templates/pilot/armor-module-preview.hbs",
            "projectfu-playtest.weaponModule.sheet": "modules/projectfu-playtest/templates/pilot/weapon-module-sheet.hbs",
            "projectfu-playtest.weaponModule.preview": "modules/projectfu-playtest/templates/pilot/weapon-module-preview.hbs",
            "projectfu-playtest.supportModule.sheet": "modules/projectfu-playtest/templates/pilot/support-module-sheet.hbs",
            "projectfu-playtest.supportModule.preview": "modules/projectfu-playtest/templates/pilot/support-module-preview.hbs",
        })
    }

    if (game.settings.get(MODULE, SETTINGS.classes.floralist)) {
        registeredFeatures.magiseed = CONFIG.FU.classFeatureRegistry.register(MODULE, "magiseed", MagiseedDataModel)

        Hooks.on("projectfu.actor.dataPrepared", GardenManager.onActorPrepared)
        Hooks.on("renderFUStandardActorSheet", GardenManager.onRenderStandardFUActorSheet)
        Hooks.on("renderFUItemSheet", GardenManager.onRenderFUItemSheet)

        Object.assign(templates, {
            "projectfu-playtest.magiseed.sheet": "modules/projectfu-playtest/templates/floralist/magiseed-sheet.hbs"
        })
    }

    loadTemplates(templates)

    console.log(LOG_MESSAGE, "Class Features registered", registeredFeatures)

    console.log(LOG_MESSAGE, "Initialized")
});

Hooks.once("ready", async function() {
    if (game.settings.get(MODULE, SETTINGS.welcomeMessage) && game.user === game.users.activeGM) {
        /** @type ChatMessageData */
        const message = {
            speaker: {alias: "ProjectFU Playtest"},
            whisper: ChatMessage.getWhisperRecipients("GM"),
            content: `
<div>
    <div style="margin-bottom: .5em">${game.i18n.localize("FU-PT.welcomeMessage.thankYou")}</div>
    <div style="margin-bottom: .5em">${game.i18n.localize("FU-PT.welcomeMessage.explanation")}</div>
    <div>${game.i18n.localize("FU-PT.welcomeMessage.warning")}</div>
</div>`
        };

        ChatMessage.create(message);
        game.settings.set(MODULE, SETTINGS.welcomeMessage, false);
    }
})