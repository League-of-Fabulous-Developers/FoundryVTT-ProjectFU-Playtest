/**
 * @typedef {"air","earth","fire","lightning","water"} WellspringElement
 */

/**
 * @type {Record<WellspringElement, {name: string, icon: string, type: string, nameShort: string, element: string, setting: string}>}
 */
export const WELLSPRINGS = {
    air: {
        name: "FU-PT.invocations.wellspring.air.name",
        nameShort: "FU-PT.invocations.wellspring.air.nameShort",
        type: "air",
        element: "FU-PT.invocations.wellspring.air.element",
        setting: "wellspring.air",
        icon: "fu-wind"
    },
    earth: {
        name: "FU-PT.invocations.wellspring.earth.name",
        nameShort: "FU-PT.invocations.wellspring.earth.nameShort",
        type: "earth",
        element: "FU-PT.invocations.wellspring.earth.element",
        setting: "wellspring.earth",
        icon: "fu-earth"
    },
    fire: {
        name: "FU-PT.invocations.wellspring.fire.name",
        nameShort: "FU-PT.invocations.wellspring.fire.nameShort",
        type: "fire",
        element: "FU-PT.invocations.wellspring.fire.element",
        setting: "wellspring.fire",
        icon: "fu-fire"
    },
    lightning: {
        name: "FU-PT.invocations.wellspring.lightning.name",
        nameShort: "FU-PT.invocations.wellspring.lightning.nameShort",
        type: "bolt",
        element: "FU-PT.invocations.wellspring.lightning.element",
        setting: "wellspring.lightning",
        icon: "fu-bolt"
    },
    water: {
        name: "FU-PT.invocations.wellspring.water.name",
        nameShort: "FU-PT.invocations.wellspring.water.nameShort",
        type: "ice",
        element: "FU-PT.invocations.wellspring.water.element",
        setting: "wellspring.water",
        icon: "fupt-waves"
    },
}