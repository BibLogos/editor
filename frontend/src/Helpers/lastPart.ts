/**
 * Gets the identifier of a RDF URI.
 * @param uri 
 */
 export const lastPart = (uri) => {
    if (!uri) debugger
    if (uri.substr(0, 4) !== 'http') return uri
    const split = uri.split(/\/|#/)
    return split.pop()
  }