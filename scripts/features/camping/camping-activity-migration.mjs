import {OptionalFeatureMigration} from "../../migration.mjs";
import {SETTINGS} from "../../settings.mjs";
import {CampingActivityDataModel} from "./camping-data-model.mjs";

export class CampingActivityMigration extends OptionalFeatureMigration {

    get affectedFeatures() {
        return [{
            module: this.moduleFeatures.camping,
            system: this.systemFeatures.campActivity,
            implementation: CampingActivityDataModel
        }];
    }


    get setting() {
        return SETTINGS.optionalFeatures.camping;
    }
}