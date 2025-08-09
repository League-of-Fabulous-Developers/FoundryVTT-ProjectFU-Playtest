import {MODULE} from "./constants.mjs";

export class Migration {

    systemFeatures
    moduleFeatures

    constructor(systemFeatures, moduleFeatures) {
        this.systemFeatures = systemFeatures
        this.moduleFeatures = moduleFeatures
    }

    /**
     * @return boolean
     */
    canRun() {
        return this.affectedFeatures.every(feature => feature.module && feature.system)
    }

    /**
     * @return {Promise<Set<CompendiumCollection>>}
     */
    async scanPacks() {
        const packs = new Set();

        pack_loop: for (const pack of game.packs.contents) {
            if (pack.metadata.type === "Item") {
                const classFeatures = await pack.getDocuments({type: "classFeature"});
                for (let classFeature of classFeatures) {
                    for (let affectedFeature of this.affectedFeatures) {
                        if (classFeature.system.featureType === affectedFeature.module) {
                            packs.add(pack);
                            continue pack_loop;
                        }
                    }
                }
            } else if (pack.metadata.type === "Actor") {
                const actors = await pack.getDocuments();
                for (const actor of actors) {
                    for (let item of actor._source.items) {
                        if (item.type === "classFeature") {
                            for (let affectedFeature of this.affectedFeatures) {
                                if (item.system.featureType === affectedFeature.module) {
                                    packs.add(pack);
                                    continue pack_loop;
                                }
                            }
                        }
                    }
                }
            }
        }
        return packs
    }

    /**
     * @typedef {() => Promise} MigrationAction
     */
    /**
     * @return Promise<MigrationAction[]>
     */
    async getMigrations() {
        /**
         * @type {MigrationAction[]}
         */
        const migrations = []
        for (let feature of this.affectedFeatures) {
            /** @type Item[] */
            const items = game.items.search({
                filters: [
                    {field: "type", value: "classFeature"},
                    {field: "system.featureType", value: feature.module}
                ]
            });
            game.actors.forEach(actor => {
                actor.itemTypes.classFeature.forEach(classFeature => {
                    if (classFeature.system.featureType === feature.module) {
                        items.push(classFeature)
                    }
                })
            });

            for (let pack of [...(await this.scanPacks())]) {
                if (!pack.locked) {
                    if (pack.metadata.type === "Item") {
                        const classFeatures = await pack.getDocuments({type: "classFeature"});
                        for (let classFeature of classFeatures) {
                            if (classFeature.system.featureType === feature.module) {
                                items.push(classFeature)
                            }
                        }
                    } else if (pack.metadata.type === "Actor") {
                        const actors = await pack.getDocuments();
                        for (const actor of actors) {
                            for (let item of actor.items) {
                                if (item.type === "classFeature") {
                                    if (item.system.featureType === feature.module) {
                                        items.push(item);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            migrations.push(...items.map(item => () => {
                let source = item.system.data._source
                if (typeof feature.migrateSource === "function") {
                    source = feature.migrateSource(source, item)
                }
                return item.update({"system.featureType": feature.system, "system.data": source }, {noHook: true});
            }));
        }
        migrations.push(...this.additionalMigrations())
        migrations.push(() => game.settings.set(MODULE, this.setting, false))
        return migrations;
    }

    /**
     * @return MigrationAction[]
     */
    additionalMigrations() {
        return []
    }

    /**
     * @typedef AffectedClassFeature
     * @property {string} module
     * @property {string} system
     * @property {typeof ClassFeatureDataModel} implementation
     * @property {(source: Object, item: Item) => Object} migrateSource
     */
    /**
     * @return AffectedClassFeature[]
     */
    get affectedFeatures() {
        throw new Error("Migrations must override the 'affectedFeatures' getter.")
    }

    /**
     * @return string
     */
    get setting() {
        throw new Error("Migrations must override the 'settings' getter.")
    }
}

export class MigrationApplication extends Application {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            title: "FU-PT.migration.app.title",
            width: 600,
            classes: ["projectfu", "projectfu-playtest-migration-app"]
        })
    }

    /** @type Migration[] */
    #migrations

    #hook

    constructor(migrations) {
        super();
        this.#migrations = migrations;
        this.#hook = Hooks.on("updateSetting", () => this.render())
        this.render(true)
    }

    get template() {
        return "modules/projectfu-playtest/templates/migration/migration-application.hbs"
    }

    async getData(options = {}) {
        const affectedCompendiums = (await Promise.all(this.#migrations.map(migration => migration.scanPacks())))
            .reduce((agg, curr) => agg.union(curr), new Set());

        return {
            affectedFeatures: this.#migrations
                .flatMap(migration => migration.affectedFeatures)
                .map(feature => feature.implementation.translation),
            affectedCompendiums: [...affectedCompendiums]
                .map(compendium => ({
                    name: compendium.metadata.name,
                    label: compendium.metadata.label,
                    locked: compendium.locked
                }))
                .sort((a, b) => b.locked - a.locked || a.label.localeCompare(b.label))
        }
    }

    activateListeners(html) {
        html.find("[data-progress]").hide()
        html.find("[data-action=cancel]").on("click", () => this.close())
        html.find("[data-action=migrate]").on("click", () => this.migrate())
    }

    async close(options = {}) {
        Hooks.off("updateSetting", this.#hook)
        return super.close(options);
    }

    async migrate() {
        this.element.find("[data-buttons]").hide();
        this.element.find("[data-migration]").text(game.i18n.localize("FU-PT.migration.app.migrationInProgress"))
        let progress = this.element.find("[data-progress]");
        progress.show();

        let allMigrations = [];
        let completedMigrations = 0;

        const updateProgress = () => {
            completedMigrations++;
            progress.attr("value", completedMigrations)
        }

        for (let migration of this.#migrations) {
            const migrationActions = await migration.getMigrations();
            allMigrations.push(...migrationActions.filter(action => action && typeof action === 'function'))
        }
        progress.attr("max", allMigrations.length)
        Promise.allSettled(allMigrations.map(async value => {
            try {
                const result = value();
                if (result && typeof result.then === 'function') await result;
                updateProgress();
            } catch (error) {
                console.error('Migration failed:', error);
                updateProgress();
            }
        })).then(() => {
            this.close()
            game.socket.emit("reload");
            foundry.utils.debouncedReload();
        })
    }
}