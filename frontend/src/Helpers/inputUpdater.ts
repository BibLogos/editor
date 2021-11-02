export const inputUpdater = (property) => {
    return function (event) {
        const value = event.target.value
        this[property] = value
        this.draw()
    }
}