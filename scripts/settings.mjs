import {MODULE} from "./constants.mjs";

export const SETTINGS = {
    welcomeMessage: "welcomeMessage",
    classes: {
        arcanist2: "classes.arcanist2",
        esper: "classes.esper",
        mutant: "classes.mutant",
        pilot: "classes.pilot",
        floralist: "classes.floralist",
        gourmet: "classes.gourmet",
        invoker: "classes.invoker"
    },
    optionalFeatures: {
        camping: "optionalFeatures.camping"
    }
}

export function registerModuleSettings() {
    game.settings.register(MODULE, SETTINGS.welcomeMessage, {
        name: game.i18n.localize("FU-PT.settings.welcomeMessage.name"),
        hint: game.i18n.localize("FU-PT.settings.welcomeMessage.hint"),
        scope: "world",
        config: true,
        requiresReload: false,
        type: Boolean,
        default: true
    })
}

export function registerClassSettings() {
    game.settings.register(MODULE, SETTINGS.classes.arcanist2, {
        name: game.i18n.localize("FU-PT.settings.classes.arcanist2.name"),
        hint: game.i18n.localize("FU-PT.settings.classes.arcanist2.hint"),
        scope: "world",
        config: true,
        requiresReload: true,
        type: Boolean,
        default: false
    })

    game.settings.register(MODULE, SETTINGS.classes.esper, {
        name: game.i18n.localize("FU-PT.settings.classes.esper.name"),
        hint: game.i18n.localize("FU-PT.settings.classes.esper.hint"),
        scope: "world",
        config: true,
        requiresReload: true,
        type: Boolean,
        default: false
    })

    game.settings.register(MODULE, SETTINGS.classes.mutant, {
        name: game.i18n.localize("FU-PT.settings.classes.mutant.name"),
        hint: game.i18n.localize("FU-PT.settings.classes.mutant.hint"),
        scope: "world",
        config: true,
        requiresReload: true,
        type: Boolean,
        default: false
    })

    game.settings.register(MODULE, SETTINGS.classes.pilot, {
        name: game.i18n.localize("FU-PT.settings.classes.pilot.name"),
        hint: game.i18n.localize("FU-PT.settings.classes.pilot.hint"),
        scope: "world",
        config: true,
        requiresReload: true,
        type: Boolean,
        default: false
    })

    game.settings.register(MODULE, SETTINGS.classes.floralist, {
        name: game.i18n.localize("FU-PT.settings.classes.floralist.name"),
        hint: game.i18n.localize("FU-PT.settings.classes.floralist.hint"),
        scope: "world",
        config: true,
        requiresReload: true,
        type: Boolean,
        default: false
    })

    game.settings.register(MODULE, SETTINGS.classes.gourmet, {
        name: game.i18n.localize("FU-PT.settings.classes.gourmet.name"),
        hint: game.i18n.localize("FU-PT.settings.classes.gourmet.hint"),
        scope: "world",
        config: true,
        requiresReload: true,
        type: Boolean,
        default: false
    })

    game.settings.register(MODULE, SETTINGS.classes.invoker, {
        name: game.i18n.localize("FU-PT.settings.classes.invoker.name"),
        hint: game.i18n.localize("FU-PT.settings.classes.invoker.hint"),
        scope: "world",
        config: true,
        requiresReload: true,
        type: Boolean,
        default: false
    })

    Hooks.once("setup", () => {
        const settings = {
            [SETTINGS.classes.esper]: () => !CONFIG.FU.classFeatures.psychicGift,
            [SETTINGS.classes.mutant]: () => !CONFIG.FU.classFeatures.therioform,
            [SETTINGS.classes.pilot]: () => !["vehicle", "armorModule", "weaponModule", "supportModule"].every(feature => CONFIG.FU.classFeatures[feature]),
            [SETTINGS.classes.floralist]: () => !CONFIG.FU.classFeatures.magiseed,
            [SETTINGS.classes.gourmet]: () => !["ingredient", "cookbook"].every(feature => CONFIG.FU.classFeatures[feature]),
            [SETTINGS.classes.invoker]: () => !CONFIG.FU.classFeatures.invocations
        }

        Object.entries(settings).forEach(([setting, checkConfigurable]) => {
            const settingKey = game.settings.get(MODULE, setting, {document: true}).key;
            const settingData = game.settings.settings.get(settingKey);
            if (settingData) {
                settingData.config = checkConfigurable()
            }
        })
    })
}

export function registerOptionalFeaturesSettings() {
    game.settings.register(MODULE, SETTINGS.optionalFeatures.camping, {
        name: game.i18n.localize("FU-PT.settings.optionalFeatures.camping.name"),
        hint: game.i18n.localize("FU-PT.settings.optionalFeatures.camping.hint"),
        scope: "world",
        config: !CONFIG.FU.optionalFeatures.campActivity,
        requiresReload: true,
        type: Boolean,
        default: !!CONFIG.FU.optionalFeatures.campActivity
    })

    Hooks.once("setup", () => {
        const settings = {
            [SETTINGS.optionalFeatures.camping]: () => !CONFIG.FU.optionalFeatures.campActivity,
        }

        Object.entries(settings).forEach(([setting, checkConfigurable]) => {
            const settingKey = game.settings.get(MODULE, setting, {document: true}).key;
            const settingData = game.settings.settings.get(settingKey);
            if (settingData) {
                settingData.config = checkConfigurable()
            }
        })
    })

}