export const StoreProxy = (store) => {

    const eventTarget = new EventTarget()

    return [new Proxy(store, {
        get: function(target, prop, receiver) {
            if (['addQuad', 'removeQuad'].includes(prop.toString())) {
                return (quad) => {
                    eventTarget.dispatchEvent(new CustomEvent(prop.toString(), { detail: quad }))
                    return store[prop](quad)
                }
            }

            return Reflect.get(target, prop, receiver)
        }
    }), eventTarget]
}