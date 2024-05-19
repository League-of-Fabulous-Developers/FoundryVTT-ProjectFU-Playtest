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
        throw new Error("Migrations must override the 'canRun' method.")
    }

    /**
     * @return Promise[]
     */
    run() {
        throw new Error("Migrations must override the 'run' method.")
    }

    /**
     * @return ClassFeatureDataModel[]
     */
    get affectedFeatures() {
        throw new Error("Migrations must override the 'affectedFeatures' getter.")
    }
}

export class MigrationApplication extends Application {

    static get defaultOptions(){
        return foundry.utils.mergeObject(super.defaultOptions, {
            title: "FU-PT.migration.app.title",
            width: 600,
            classes: ["projectfu", "projectfu-playtest-migration-app"]
        })
    }

    /** @type Migration[] */
    #migrations

    constructor(migrations) {
        super();
        this.#migrations = migrations;
        this.render(true)
    }

    get template() {
        return "modules/projectfu-playtest/templates/migration/migration-application.hbs"
    }

    getData(options = {}) {
        return {
            affectedFeatures: this.#migrations.flatMap(migration => migration.affectedFeatures)
                .map(feature => feature.translation)
        }
    }

    activateListeners(html) {
        html.find("[data-progress]").hide()
        html.find("[data-action=cancel]").on("click", () => this.close())
        html.find("[data-action=migrate]").on("click", () => this.migrate())
    }

    migrate() {
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
            const runningMigrations = migration.run();
            runningMigrations.map(promise => promise.then(updateProgress))
            allMigrations.push(...runningMigrations)
        }
        progress.attr("max", allMigrations.length)
        Promise.allSettled(allMigrations).then(() => {
            this.close()
            game.socket.emit("reload");
            foundry.utils.debouncedReload();
        })
    }
}