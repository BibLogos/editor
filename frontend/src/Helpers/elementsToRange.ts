export const elementsToRange = (elements: Array<Element>) => {
    const words = elements.map((element: HTMLSpanElement) => {
        return element.getAttribute('verse') ? element.getAttribute('verse') + '.' + element.getAttribute('index') : null
    }).filter(Boolean)
    return words.at(0) + ':' + words.at(-1)
}