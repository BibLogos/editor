export async function stringToColor(text, minLightness = 40, maxLightness = 80, minSaturation = 30, maxSaturation = 100) {
    let hash = await window.crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
    const number = new Uint8Array(hash).join("").slice(16) as unknown as number
    return "hsl(" + (number % 360) + ", " + (number % (maxSaturation - minSaturation) + minSaturation) + "%, " + (number % (maxLightness - minLightness) + minLightness) + "%)";
  }