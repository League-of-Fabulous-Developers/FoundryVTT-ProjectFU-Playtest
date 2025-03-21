import {Migration} from "../../migration.mjs";
import {SETTINGS} from "../../settings.mjs";
import {IngredientDataModel} from "./ingredient-data-model.mjs";
import {CookbookDataModel} from "./cookbook-data-model.mjs";

export class GourmetMigration extends Migration {

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