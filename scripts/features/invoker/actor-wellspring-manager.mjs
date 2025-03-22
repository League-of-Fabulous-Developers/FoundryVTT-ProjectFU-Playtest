import {GameWellspringManager, HOOK_WELLSPRING_CHANGED} from "./game-wellspring-manager.mjs";
import {MODULE} from "../../constants.mjs";


export const FLAG_INNER_WELLSPRING = "InnerWellspring"

export class ActorWellspringManager {

    #actor

    constructor(actor) {
        this.#actor = actor

        Hooks.on(HOOK_WELLSPRING_CHANGED, () => this.#actor.sheet.render())
        Hooks.on("canvasReady", () => this.#actor.sheet.render())
        Hooks.on("updateScene", () => this.#actor.sheet.render())
    }

    static onActorPrepared(actor) {
        if (actor.type === "character") {
            actor.playtestWellspringManager ??= new ActorWellspringManager(actor)
        }
    }

    get activeWellsprings() {
        let activeWellsprings = GameWellspringManager.currentSceneActiveWellsprings
        if (!activeWellsprings || !Object.values(activeWellsprings).some(value => value)) {
            activeWellsprings = GameWellspringManager.activeSceneActiveWellsprings
        }
        if (!activeWellsprings || !Object.values(activeWellsprings).some(value => value)) {
            activeWellsprings = GameWellspringManager.globalActiveWellsprings
        }

        const innerWellspring = this.#actor.getFlag(MODULE, FLAG_INNER_WELLSPRING);
        if (innerWellspring) {
            activeWellsprings[innerWellspring] = true
        }

        return activeWellsprings
    }
}