const argon2 = async (pw, salt, cost) => {
  const res = await new Promise((resolve, reject) => {
    const argon2 = new Worker('./argon2-worker.js')
    argon2.onmessage = resolve
    argon2.onerror = reject
    argon2.postMessage({
      pass: pw,
      salt: salt,
      time: cost,
      mem: 262144,
      hashLen: 16,
      parallelism: 1,
      type: 2,
    })
  })
  return res.data
}

const pwhash = async pw => argon2(pw, encode("covertpassphrase"), 8 << Math.max(0, 12 - pw.length))
const pwauthkey = async (pwhash, nonce) => argon2(nonce, pwhash, 2)

// String to ArrayBuffer conversion with Unicode normalisation
const encode = str => new TextEncoder().encode(str.normalize('NFKC'))

// XOR buffer a with bytes of b (both of length multiple of four)
const xor = (a, b) => {
  const a32 = new Uint32Array(a), b32 = new Uint32Array(b)
  for (let i = 0; i < b32.length; ++i) a32[i] ^= b32[i]
}


const armor_decode = text => Uint8Array.from(atob(text), c => c.charCodeAt(0))
const armor_encode = data => btoa(String.fromCharCode.apply(null, data))

// Increment nonce which must be Uint8Array(12)
const nonce_increment = n => {
  for (let i = 0; i < 12; ++i) if (++n[i] < 256) break
}
