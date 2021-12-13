// String to ArrayBuffer conversion with Unicode normalisation
export const encode = str => new TextEncoder().encode(str.normalize('NFKC'))

// SHA-512 hash, returns promise - remember to await
export const sha = data => crypto.subtle.digest("SHA-512", data)

// Generate a secure random number [0, 1)
export const random = () => {
  const r = new Uint32Array(2)
  crypto.getRandomValues(r)
  r[0] &= 0xFFFFF800  // Keep it under 1.0
  return r[0] * 2**-64 + r[1] * 2**-32
}


// Randomize padding value (bytes) using exponential distributen and the given preferred mean size
const randpad = prefsize => Math.round(-prefsize * Math.log(1 - random()))


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
