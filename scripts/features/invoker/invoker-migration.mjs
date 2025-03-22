import {Migration} from "../../migration.mjs";
import {MODULE} from "../../constants.mjs";
import {SETTINGS} from "../../settings.mjs";
import {InvocationsDataModel} from "./invocations-data-model.mjs";
import {FLAG_INNER_WELLSPRING} from "./actor-wellspring-manager.mjs";
import {FLAG_ACTIVE_WELLSPRINGS, GameWellspringManager} from "./game-wellspring-manager.mjs";

export class InvokerMigration extends Migration {

    additionalMigrations() {
        /** @type MigrationAction[] */
        const additionalMigrations = []

        additionalMigrations.push(() => {
            const activeWellsprings = GameWellspringManager.globalActiveWellsprings;
            return game.settings.set("projectfu", "activeWellsprings", activeWellsprings);
        })

        game.scenes.filter(scene => scene.getFlag(MODULE, FLAG_ACTIVE_WELLSPRINGS))
            .forEach((scene) => {
                additionalMigrations.push(() => {
                    const activeWellsprings = scene.getFlag(MODULE, FLAG_ACTIVE_WELLSPRINGS);
                    scene.update({
                        [`flags.${MODULE}.-=${FLAG_ACTIVE_WELLSPRINGS}`]: null,
                        "flags.projectfu.wellsprings": activeWellsprings
                    })
                })
            })

        const documents = [...game.actors.contents.flatMap(actor => [actor, ...actor.items.contents]), ...game.items.contents]

        documents
            .flatMap(document => document.effects.contents)
            .filter(effect => effect.changes.some(change => change.key === `flags.${MODULE}.${FLAG_INNER_WELLSPRING}`))
            .forEach(effect => {
                additionalMigrations.push(() => {
                    const newChanges = effect.changes.map(change => {
                        if (change.key === `flags.${MODULE}.${FLAG_INNER_WELLSPRING}`) {
                            change.key = `flags.projectfu.innerWellspring`
                        }
                        return change;
                    })
                    return effect.update({
                        changes: newChanges
                    })
                })
            });

        return additionalMigrations;
    }

    get affectedFeatures() {
        return [{
            module: this.moduleFeatures.invocations,
            system: this.systemFeatures.invocations,
            implementation: InvocationsDataModel
        }];
    }

    get setting() {
        return SETTINGS.classes.invoker
    }
}