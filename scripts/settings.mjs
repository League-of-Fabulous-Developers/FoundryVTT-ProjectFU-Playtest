import {MODULE} from "./constants.mjs";
import {SETTINGS as SystemSettings} from "../../../systems/projectfu/module/settings.js";

// Export the system settings directly
export const SYSTEMSETTINGS = SystemSettings;

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
        config: !CONFIG.FU.classFeatures.psychicGift,
        requiresReload: true,
        type: Boolean,
        default: false
    })

    game.settings.register(MODULE, SETTINGS.classes.mutant, {
        name: game.i18n.localize("FU-PT.settings.classes.mutant.name"),
        hint: game.i18n.localize("FU-PT.settings.classes.mutant.hint"),
        scope: "world",
        config: !CONFIG.FU.classFeatures.therioform,
        requiresReload: true,
        type: Boolean,
        default: false
    })

    game.settings.register(MODULE, SETTINGS.classes.pilot, {
        name: game.i18n.localize("FU-PT.settings.classes.pilot.name"),
        hint: game.i18n.localize("FU-PT.settings.classes.pilot.hint"),
        scope: "world",
        config: !["vehicle", "armorModule", "weaponModule", "supportModule"].every(feature => CONFIG.FU.classFeatures[feature]),
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
}