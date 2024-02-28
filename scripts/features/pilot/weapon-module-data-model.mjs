/**
 * @extends projectfu.RollableClassFeatureDataModel
 * @property {Object} accuracy
 * @property {"dex","ins","mig","wlp"} accuracy.attr1
 * @property {"dex","ins","mig","wlp"} accuracy.attr2
 * @property {number} accuracy.modifier
 * @property {Object} damage
 * @property {"physical","air","bolt","dark","earth","fire","ice","light","poison"} damage.type
 * @property {number} damage.bonus
 * @property {"melee","ranged","shield"} type
 * @property {"arcane", "bow", "brawling", "dagger", "firearm", "flail", "heavy", "spear", "sword", "thrown"} category
 * @property {boolean} complex
 * @property {string} quality
 * @property {Object} shield
 * @property {number} shield.defense
 * @property {number} shield.magicDefense
 * @property {string} description
 */
export class WeaponModuleDataModel extends projectfu.RollableClassFeatureDataModel {

    /**
     * Defined as static function instead of const because `CONFIG.FU` is not set yet when the file gets loaded
     * @return {Object<"melee"|"ranged"|"shield", string>}
     */
    static get weaponTypes() {
        return {
            ...CONFIG.FU.weaponTypes,
            shield: "FU-PT.weaponModule.typeShield"
        }
    }

    static defineSchema() {
        const {SchemaField, StringField, NumberField, BooleanField, HTMLField} = foundry.data.fields
        return {
            accuracy: new SchemaField({
                attr1: new StringField({initial: "dex", choices: () => Object.keys(CONFIG.FU.attributeAbbreviations)}),
                attr2: new StringField({initial: "ins", choices: () => Object.keys(CONFIG.FU.attributeAbbreviations)}),
                modifier: new NumberField({initial: 0})
            }),
            damage: new SchemaField({
                type: new StringField({initial: "physical", choices: Object.keys(CONFIG.FU.damageTypes)}),
                bonus: new NumberField({initial: 0})
            }),
            type: new StringField({initial: "melee", choices: Object.keys(WeaponModuleDataModel.weaponTypes)}),
            category: new StringField({
                initial: "arcane",
                choices: Object.keys(CONFIG.FU.weaponCategoriesWithoutCustom)
            }),
            complex: new BooleanField(),
            quality: new StringField(),
            shield: new SchemaField({
                defense: new NumberField({initial: 2}),
                magicDefense: new NumberField({initial: 2}),
            }),
            description: new HTMLField()
        }
    }

    static get template() {
        return "projectfu-playtest.weaponModule.sheet"
    }

    static get previewTemplate() {
        return "projectfu-playtest.weaponModule.preview"
    }

    static get translation() {
        return "FU-PT.weaponModule.label"
    }

    static getAdditionalData(model) {
        return {
            attributes: CONFIG.FU.attributeAbbreviations,
            damageTypes: CONFIG.FU.damageTypes,
            weaponTypes: WeaponModuleDataModel.weaponTypes,
            weaponCategories: CONFIG.FU.weaponCategoriesWithoutCustom,
            active: model.actor?.vehicleManager?.weapons.includes(model.item) ?? false
        }
    }

    /**
     * @override
     */
    static async roll(model, item, hrZero) {
        if (model.isShield) {
            return;
        }

        const actor = item.actor;
        if (!actor) {
            return;
        }

        const {
            accuracyCheck: globalAccuracyBonus = 0,
            [model.category]: categoryAccuracyBonus = 0
        } = actor.system.bonuses.accuracy

        const checkData = {
            attr1: {
                attribute: model.accuracy.attr1,
                dice: actor.system.attributes[model.accuracy.attr1].current
            },
            attr2: {
                attribute: model.accuracy.attr2,
                dice: actor.system.attributes[model.accuracy.attr2].current
            },
            modifier: model.accuracy.modifier,
            bonus: globalAccuracyBonus + categoryAccuracyBonus
        }

        const checkWeapon = {
            _type: "weapon",
            name: item.name,
            img: item.img,
            id: item.id,
            category: model.category,
            hands: "one-handed",
            quality: model.quality,
            type: model.type,
            defense: "def",
            summary: item.system.summary.value,
            description: await TextEditor.enrichHTML(model.description)
        }

        const {
            [model.type]: typeDamageBonus = 0,
            [model.category]: categoryDamageBonus = 0
        } = actor.system.bonuses.damage

        const checkDamage = {
            type: model.damage.type,
            bonus: model.damage.bonus + typeDamageBonus + categoryDamageBonus,
            hrZero
        }

        return game.projectfu.rollCheck({
            check: checkData,
            details: checkWeapon,
            damage: checkDamage
        }).then(value => game.projectfu.createCheckMessage(value))
    }

    get isShield() {
        return this.type === "shield";
    }

    /**
     * Override `complex` for shields, since complex shields don't really make sense.
     */
    prepareDerivedData() {
        if (this.isShield) {
            this.complex = false
        }
    }
}