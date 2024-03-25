import {MODULE} from "../../constants.mjs";
import {WELLSPRINGS} from "./invoker-constants.mjs";

export const HOOK_WELLSPRING_CHANGED = "projectfu-playtest.wellspringChanged"

const FLAG_ACTIVE_WELLSPRINGS = "wellsprings"

/**
 * @type {Readonly<Record<WellspringElement, false>>}
 */
const DEFAULT_WELLSPRINGS = Object.freeze(Object.keys(WELLSPRINGS).reduce((agg, val) => (agg[val] = false) || agg, {}))

export class GameWellspringManager extends Application {

    static #app

    static registerSettings() {
        for (const [key, value] of Object.entries(WELLSPRINGS)) {
            game.settings.register(MODULE, value.setting, {
                name: game.i18n.localize("FU-PT.classes.invoker.name"),
                scope: "world",
                config: false,
                requiresReload: false,
                type: Boolean,
                default: false,
                onChange: newValue => Hooks.callAll(HOOK_WELLSPRING_CHANGED, [newValue, key])
            })
        }
    }

    static onGetSceneControlButton(controls) {
        const tokenControl = controls.find(control => control.name === "token");
        tokenControl.tools.push({
            name: GameWellspringManager.name,
            title: "FU-PT.invocations.wellspring.manager.title",
            icon: "fas fa-earth-asia",
            button: true,
            visible: game.user.isGM,
            onClick: () => (GameWellspringManager.#app ??= new GameWellspringManager()).render(true)
        })
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["form", "projectfu", "wellspring-manager-app"],
            width: 350,
            height: "auto",
            closeOnSubmit: false,
            editable: true,
            sheetConfig: false,
            submitOnChange: true,
            submitOnClose: true,
            minimizable: false,
            title: "FU-PT.invocations.wellspring.manager.title"
        });
    }

    constructor() {
        super();

        Hooks.on(HOOK_WELLSPRING_CHANGED, () => this.render())
        Hooks.on("canvasReady", () => this.render())
        Hooks.on("updateScene", () => this.render())
    }

    get template() {
        return "modules/projectfu-playtest/templates/invoker/wellspring-manager-application.hbs";
    }

    /**
     * @return {Record<WellspringElement, boolean>}
     */
    static get globalActiveWellsprings() {
        return Object.entries(WELLSPRINGS).reduce((agg, [key, value]) => {
            agg[key] = game.settings.get(MODULE, value.setting)
            return agg
        }, {})
    }

    static get activeScene() {
        return game.scenes.active;
    }

    /**
     * @return {Record<WellspringElement, boolean>, null}
     */
    static get activeSceneActiveWellsprings() {
        const flag = GameWellspringManager.activeScene?.getFlag(MODULE, FLAG_ACTIVE_WELLSPRINGS);
        if (flag) {
            return {...flag}
        }
        return null;
    }

    static get currentScene() {
        return game.scenes.current;
    }

    /**
     * @return {Record<WellspringElement, boolean>, null}
     */
    static get currentSceneActiveWellsprings() {
        const flag = GameWellspringManager.currentScene?.getFlag(MODULE, FLAG_ACTIVE_WELLSPRINGS);
        if (flag) {
            return {...flag}
        }
        return null
    }

    getWellsprings(context) {
        const getter = {
            global: () => GameWellspringManager.globalActiveWellsprings,
            active: () => GameWellspringManager.activeSceneActiveWellsprings,
            current: () => GameWellspringManager.currentSceneActiveWellsprings
        };
        return getter[context]() ?? {...DEFAULT_WELLSPRINGS};
    }

    async setWellsprings(context, wellsprings) {
        const setter = {
            global: newWellsprings =>
                Promise.all(Object.entries(newWellsprings).map(([key, value]) => {
                    if (game.settings.get(MODULE, WELLSPRINGS[key].setting) !== value) {
                        return game.settings.set(MODULE, WELLSPRINGS[key].setting, value)
                    }
                })),
            active: newWellsprings => GameWellspringManager.activeScene?.setFlag(MODULE, FLAG_ACTIVE_WELLSPRINGS, newWellsprings),
            current: newWellsprings => GameWellspringManager.currentScene?.setFlag(MODULE, FLAG_ACTIVE_WELLSPRINGS, newWellsprings),
        };
        return setter[context](wellsprings)
    }

    /**
     * @param {MouseEvent} event
     */
    async toggleWellspring(event) {
        const context = event.currentTarget.closest("[data-context]").dataset.context;
        const element = event.currentTarget.dataset.wellspring;

        const wellsprings = this.getWellsprings(context);

        wellsprings[element] = !wellsprings[element];

        await this.setWellsprings(context, wellsprings);

        this.render()
    }

    /**
     * @param {MouseEvent} event
     */
    clearWellsprings(event) {
        if (!event.shiftKey) return;

        const context = event.currentTarget.closest("[data-context]").dataset.context;

        ({
            global: () => Object.values(WELLSPRINGS).forEach(value => game.settings.set(MODULE, value.setting, false)),
            active: () => GameWellspringManager.activeScene?.unsetFlag(MODULE, FLAG_ACTIVE_WELLSPRINGS),
            current: () => GameWellspringManager.currentScene?.unsetFlag(MODULE, FLAG_ACTIVE_WELLSPRINGS),
        })[context]()

        this.render()
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find("a[data-action=toggleWellspring][data-wellspring]").click(this.toggleWellspring.bind(this));
        html.find("a[data-action=clearWellsprings]").click(this.clearWellsprings.bind(this));
    }

    getData(options = {}) {
        return {
            global: GameWellspringManager.globalActiveWellsprings,
            active: {
                scene: GameWellspringManager.activeScene?.name,
                wellsprings: GameWellspringManager.activeSceneActiveWellsprings ?? DEFAULT_WELLSPRINGS
            },
            current: {
                scene: GameWellspringManager.currentScene?.name,
                wellsprings: GameWellspringManager.currentSceneActiveWellsprings ?? DEFAULT_WELLSPRINGS
            },
            wellsprings: WELLSPRINGS
        }
    }
}