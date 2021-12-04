import { Sha1 } from "./sha1";

const cache = new Map()

export function stringToColor(text, minLightness = 20, maxLightness = 60, minSaturation = 30, maxSaturation = 100) {
    const cid = JSON.stringify(arguments)
    if (cache.has(cid)) return cache.get(cid)
    const hash = new Sha1()
    hash.update(text)
    const utf8Encode = new TextEncoder()
    const number = new Uint8Array(utf8Encode.encode(hash.hex())).join("").slice(16) as unknown as number
    const output = "hsl(" + (number % 360) + ", " + (number % (maxSaturation - minSaturation) + minSaturation) + "%, " + (number % (maxLightness - minLightness) + minLightness) + "%)";
    cache.set(cid, output)
    return output
}