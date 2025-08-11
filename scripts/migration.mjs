import {MODULE} from "./constants.mjs";

class BaseMigration {

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
                const featureItems = await pack.getDocuments({type: this.affectedItemType});
                for (let featureItem of featureItems) {
                    for (let affectedFeature of this.affectedFeatures) {
                        if (foundry.utils.getProperty(featureItem, this.featureTypeKey) === affectedFeature.module) {
                            packs.add(pack);
                            continue pack_loop;
                        }
                    }
                }
            } else if (pack.metadata.type === "Actor") {
                const actors = await pack.getDocuments();
                for (const actor of actors) {
                    for (let item of actor._source.items) {
                        if (item.type === this.affectedItemType) {
                            for (let affectedFeature of this.affectedFeatures) {
                                if (foundry.utils.getProperty(item, this.featureTypeKey) === affectedFeature.module) {
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
                    {field: "type", value: this.affectedItemType},
                    {field: this.featureTypeKey, value: feature.module}
                ]
            });
            game.actors.forEach(actor => {
                (actor.itemTypes[this.affectedItemType] ?? []).forEach(featureItem => {
                    if (foundry.utils.getProperty(featureItem, this.featureTypeKey) === feature.module) {
                        items.push(featureItem)
                    }
                })
            });

            for (let pack of [...(await this.scanPacks())]) {
                if (!pack.locked) {
                    if (pack.metadata.type === "Item") {
                        const featureItems = await pack.getDocuments({type: this.affectedItemType});
                        for (let featureItem of featureItems) {
                            if (foundry.utils.getProperty(featureItem, this.featureTypeKey) === feature.module) {
                                items.push(featureItem)
                            }
                        }
                    } else if (pack.metadata.type === "Actor") {
                        const actors = await pack.getDocuments();
                        for (const actor of actors) {
                            for (let item of actor.items) {
                                if (item.type === this.affectedItemType) {
                                    if (foundry.utils.getProperty(item, this.featureTypeKey) === feature.module) {
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
                return item.update({[this.featureTypeKey]: feature.system, "system.data": source}, {noHook: true});
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
     * Defines the item type affected by this migration.
     * @return string
     */
    get affectedItemType() {
        throw new Error("Migrations must override the 'affectedItemType' getter.");
    }

    /**
     * Defines under which key the feature type data is stored in the item.
     * @return string
     */
    get featureTypeKey() {
        throw new Error("Migrations must override the 'featureTypeKey' getter.");
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

export class Migration extends BaseMigration {

    get affectedItemType() {
        return "classFeature";
    }

    get featureTypeKey() {
        return "system.featureType";
    }
}

export class OptionalFeatureMigration extends BaseMigration {
    get affectedItemType() {
        return "optionalFeature";
    }

    get featureTypeKey() {
        return "system.optionalType";
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

    /** @type BaseMigration[] */
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
            allMigrations.push(...migrationActions)
        }
        progress.attr("max", allMigrations.length)
        Promise.allSettled(allMigrations.map(value => value().then(updateProgress))).then(() => {
            this.close()
            game.socket.emit("reload");
            foundry.utils.debouncedReload();
        })
    }
}