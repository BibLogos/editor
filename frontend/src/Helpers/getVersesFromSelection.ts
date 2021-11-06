import { unique } from './unique'

export const getVersesFromSelection = (selection: Selection, root) => {
    const contained = []
    const nodeIterator = document.createNodeIterator(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT)
    
    while (nodeIterator.nextNode()) {
        const node = nodeIterator.referenceNode
        if (selection.containsNode(node)) contained.push(node)
    }

    const verses = []
    for (const node of contained) {
        const element = node.nodeName === '#text' ? node.parentElement : node
        const reference = element.hasAttribute('verse') ? element.getAttribute('verse') : element.closest('[verse]')?.getAttribute('verse')
        if (reference) {
            const verse = parseInt(reference.split('.').pop())
            verses.push(verse)
        }
    }

    return verses.filter(Boolean).filter(unique)
}