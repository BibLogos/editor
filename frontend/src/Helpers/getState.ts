const state = new Map()

export const getState = (object, defaults) => {
  return state.has(object) ? state.get(object) : state.set(object, defaults) && state.get(object)
}
