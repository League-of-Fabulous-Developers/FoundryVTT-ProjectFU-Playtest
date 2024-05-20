import {Migration} from "../../migration.mjs";
import {PsychicGiftDataModel} from "./psychic-gift-data-model.mjs";
import {SETTINGS} from "../../settings.mjs";

export class EsperMigration extends Migration {

    get affectedFeatures() {
        return [{
            module: this.moduleFeatures.psychicGift,
            system: this.systemFeatures.psychicGift,
            implementation: PsychicGiftDataModel
        }];
    }

    get setting(){
        return SETTINGS.classes.esper;
    }
}