import msgpack from "@msgpack/msgpack"

// String to ArrayBuffer conversion with Unicode normalisation
export const encode = str => new TextEncoder().encode(str.normalize('NFKC'))
export const decode = data => new TextDecoder().decode(data)

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


export const armor_decode = text => Uint8Array.from(atob(text), c => c.charCodeAt(0))
export const armor_encode = data => btoa(String.fromCharCode.apply(null, data))

// Increment nonce which must be Uint8Array(12)
export const nonce_increment = n => {
  for (let i = 0; i < 12; ++i) if (++n[i] < 256) break
}

// XOR buffer a with bytes of b (both of length multiple of four)
export const xor = (a, b) => {
  const a32 = new Uint32Array(a), b32 = new Uint32Array(b)
  for (let i = 0; i < b32.length; ++i) a32[i] ^= b32[i]
}

// This reads one object, also returning the remaining data as a new view
// Hacking around a stupid restriction of the msgpack module
// TODO: Needs a proper solution
export const msgpack_decode = dataview => {
  let pos
  try {
    msgpack.decode(dataview)  // Calculate size
    pos = dataview.byteLength
  } catch (error) {
    pos = parseInt(`${error}`.match(/Extra \d+ of \d+ byte\(s\) found at buffer\[(\d+)\]/)[1])
  }
  const obj = new DataView(dataview.buffer, dataview.byteOffset, pos)
  dataview = new DataView(dataview.buffer, dataview.byteOffset + pos, dataview.byteLength - pos)
  return {value: msgpack.decode(obj), dataview}
}
