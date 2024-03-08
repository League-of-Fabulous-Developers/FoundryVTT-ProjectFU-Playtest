import {MODULE} from "./constants.mjs";

export const SETTINGS = {
    welcomeMessage: "welcomeMessage",
    classes: {
        arcanist2: "classes.arcanist2",
        esper: "classes.esper",
        mutant: "classes.mutant",
        pilot: "classes.pilot",
        floralist: "classes.floralist"
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
}