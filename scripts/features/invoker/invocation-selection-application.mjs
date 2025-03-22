import {WELLSPRINGS} from "./invoker-constants.mjs";

export class InvocationSelectionApplication extends Application {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["form", "projectfu", "invocations-selection-app"],
            width: 350,
            height: "auto",
            closeOnSubmit: false,
            editable: true,
            sheetConfig: false,
            submitOnChange: true,
            submitOnClose: true,
            minimizable: false,
            title: "FU-PT.invocations.dialog.title"
        });
    }

    #model

    constructor(model) {
        super();
        this.#model = model
        this.#model.app ??= this;
        return this.#model.app
    }

    get template() {
        return "modules/projectfu-playtest/templates/invoker/invocations-selection-application.hbs";
    }


    async getData(options = {}) {
        const cleanedWellsprings = Object.entries(this.#model.actor.playtestWellspringManager.activeWellsprings)
            .filter(([, value]) => value)
            .reduce((agg, [key, value]) => (agg[key] = value) && agg, {})

        const availableInvocations = ({
            basic: ["basic"],
            advanced: ["basic", "advanced"],
            superior: ["basic", "advanced", "superior1", "superior2"]
        })[this.#model.level]

        const data = {}
        for (const [element] of Object.entries(cleanedWellsprings)) {
            const modelElement = this.#model[element];
            const invocations = {}
            for (const invocation of availableInvocations) {
                const modelInvocation = modelElement[invocation];
                invocations[invocation] = {
                    name: modelInvocation.name,
                    description: await TextEditor.enrichHTML(modelInvocation.description)
                }
            }
            data[element] = {
                name: WELLSPRINGS[element].name,
                icon: WELLSPRINGS[element].icon,
                invocations
            };
        }

        return {wellsprings: data};
    }


    render(force = false, options = {}) {
        const activeWellsprings = Object.values(this.#model.actor.playtestWellspringManager.activeWellsprings)
            .filter(value => value)
            .length;
        return super.render(force, {width: InvocationSelectionApplication.defaultOptions.width * activeWellsprings, ...options});
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find("[data-element] [data-invocation]").click(this.useInvocation.bind(this))
    }

    useInvocation(event) {
        const invocation = event.currentTarget.dataset.invocation;
        const element = event.currentTarget.closest("[data-element]").dataset.element;

        this.close({use: {element, invocation}})
    }

    async close(options = {}) {
        const promises = [super.close(options)];
        delete this.#model.app
        if (options.use) {
            promises.push(this.postInvocation(options.use.element, options.use.invocation))
        }
        return Promise.all(promises);
    }

    async postInvocation(element, invocation) {
        const invocationData = this.#model[element][invocation];

        const item = this.#model.item.toObject();
        item.name = invocationData.name
        /** @type ChatMessageData */
        const data = {
            speaker: ChatMessage.implementation.getSpeaker({actor: this.#model.actor}),
            content: await renderTemplate("modules/projectfu-playtest/templates/invoker/invocation-use-message.hbs", {
                name: invocationData.name,
                description: await TextEditor.enrichHTML(invocationData.description),
                icon: WELLSPRINGS[element].icon
            }),
            flags: {[projectfu.SYSTEM]: {[projectfu.Flags.ChatMessage.Item]: item}}
        }

        return ChatMessage.create(data);
    }
}