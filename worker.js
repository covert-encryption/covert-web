const argon2 = async (hashLen, pw, salt, cost) => {
  const res = await new Promise((resolve, reject) => {
    const argon2 = new Worker('./argon2-worker.js')
    argon2.onmessage = resolve
    argon2.onerror = reject
    argon2.postMessage({
      pass: pw,
      salt: salt,
      time: cost,
      mem: 262144,
      hashLen,
      parallelism: 1,
      type: 2,
    })
  })
  return res.data
}

const pwhash = async pw => argon2(16, pw, encode("covertpassphrase"), 8 << Math.max(0, 12 - pw.length))
const pwauthkey = async (pwhash, nonce) => argon2(32, nonce, pwhash, 2)

// String to ArrayBuffer conversion with Unicode normalisation
const encode = str => new TextEncoder().encode(str.normalize('NFKC'))
