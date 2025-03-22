import {Migration} from "../../migration.mjs";
import {SETTINGS} from "../../settings.mjs";
import {IngredientDataModel} from "./ingredient-data-model.mjs";
import {CookbookDataModel} from "./cookbook-data-model.mjs";
import {MODULE} from "../../constants.mjs";
import {FLAG_ALL_YOU_CAN_EAT} from "./cooking-application.mjs";

export class GourmetMigration extends Migration {


    additionalMigrations() {
        /** @type MigrationAction[] */
        const additionalMigrations = [];

        const documents = [...game.actors.contents.flatMap(actor => [actor, ...actor.items.contents]), ...game.items.contents]

        documents
            .flatMap(document => document.effects.contents)
            .filter(effect => effect.changes.some(change => change.key === `flags.${MODULE}.${FLAG_ALL_YOU_CAN_EAT}`))
            .forEach(effect => {
                additionalMigrations.push(() => {
                    const newChanges = effect.changes.map(change => {
                        if (change.key === `flags.${MODULE}.${FLAG_ALL_YOU_CAN_EAT}`) {
                            change.key = `flags.projectfu.allYouCanEat`
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
            module: this.moduleFeatures.ingredient,
            system: this.systemFeatures.ingredient,
            implementation: IngredientDataModel,
            migrateSource: (source, item) => {
                return {
                    ...source,
                    cost: item.system._source?.cost?.value ?? 10,
                    quantity: item.system._source?.quantity?.value ?? 1
                }
            }
        }, {
            module: this.moduleFeatures.cookbook,
            system: this.systemFeatures.cookbook,
            implementation: CookbookDataModel,
        }];
    }

    get setting() {
        return SETTINGS.classes.gourmet;
    }
}