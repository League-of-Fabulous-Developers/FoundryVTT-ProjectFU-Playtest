import {Migration} from "../../migration.mjs";
import {SETTINGS} from "../../settings.mjs";
import {MagiseedDataModel} from "./magiseed-data-model.mjs";
import {MODULE} from "../../constants.mjs";

export class FloralistMigration extends Migration {

    get affectedFeatures() {
        return [{
            module: this.moduleFeatures.magiseed,
            system: this.systemFeatures.magiseed,
            implementation: MagiseedDataModel,
            migrateSource: (source) => {

                return {
                    effectCount: 3,
                    effects: [{
                        start: 1,
                        end: 1,
                        effect: source.effect1
                    }, {
                        start: 2,
                        end: 2,
                        effect: source.effect2
                    }, {
                        start: 3,
                        end: 3,
                        effect: source.effect3
                    }]
                }
            }
        }];
    }

    /**
     * @returns {MigrationAction[]}
     */
    additionalMigrations() {
        return game.actors.filter(actor => actor.gardenManager)
            .flatMap(actor => {
                /** @type {MigrationAction[]} */
                const migrations = [];

                const clock = actor.gardenManager.gardenClock;
                if (clock) {
                    migrations.push(() => clock.update({
                        [`flags.${MODULE}.-=growthClock`]: null,
                    }, {noHooks: true}));
                    migrations.push(() => actor.update({
                        "system.garden.clock": clock.id
                    }, {noHooks: true}));
                }

                const planted = actor.gardenManager.planted;
                if (planted) {
                    migrations.push(() =>
                        actor.update({
                            [`flags.${MODULE}.-=magiseed.planted`]: null,
                            "system.garden.planted": planted.id,
                        }, {noHooks: true}));

                }

                return migrations;
            })
    }

    get setting() {
        return SETTINGS.classes.floralist;
    }
}