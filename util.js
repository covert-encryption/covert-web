// String to ArrayBuffer conversion with Unicode normalisation
export const encode = str => new TextEncoder().encode(str.normalize('NFKC'))

// SHA-512 hash, returns promise - remember to await
export const sha = data => crypto.subtle.digest("SHA-512", data)

// Randomize padding value (bytes) using exponential distribution and the given preferred mean size
const randpad = prefsize => {
  const r = new Uint32Array(2)
  crypto.getRandomValues(r)
  // Calculate with 65 bits of precision, providing m between 0 and 45.05...
  const m = Math.log(2**32) - Math.log(r[1] + r[0] * 2**-32 + 2**-33)
  return Math.round(m * prefsize)
}

// Calculate random padding size in bytes as (roughly) proportion p of total size.
export const random_padding = (total, p=0.05) => {
  if (!p) return 0
  // Choose the amount of fixed padding to hide very short messages
  const low = Math.floor(p * 500)
  const padfixed = Math.max(0, low - total)
  // Calculate a preferred mean size and randomize
  const prefsize = 1 + p * 200 + p * .7e8 * Math.log2(1 + 1e-8 * Math.max(low, total))
  // Apply pad-to-fixed-size for very short messages plus random padding
  return padfixed + randpad(prefsize)
}
