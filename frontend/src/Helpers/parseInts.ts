export const parseInts = (items) => items.map(item => parseInt(item).toString() === item ? parseInt(item) : item)