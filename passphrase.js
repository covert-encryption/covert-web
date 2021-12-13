import _sodium from 'libsodium-wrappers'
import zxcvbn from 'zxcvbn'
import { webcrypto } from 'crypto'
import { display_time } from './helpers.js'
import { encode } from './util.js'
import { words } from './wordlist.js'

await _sodium.ready
const sodium = _sodium
const crypto = webcrypto

// Generate a password of random words without repeating any word.
export const generate = (n=4, sep="") => {
  if (!Number.isInteger(n) || n < 1 || n > words.length) throw RangeError("Invalid n")
  while (true) {
    const r = new Uint32Array(n)
    crypto.getRandomValues(r)
    const wl = [...words]
    const pw = Array.from(r).map(v => wl.splice(Math.floor(v * 2**-32 * wl.length), 1)[0]).join(sep)
    if (4 * zxcvbn(pw).guesses > words.length**n) return pw
  }
}


export const costfactor = pwd => (1 << Math.max(0, 12 - pwd.length))


export const autoComplete = str => {
  const results = words.filter((word) => word.startsWith(str))
  if(!str) return "enter a few letters of a word first"
  if (results.length > 0 && results.length <= 10) {
    return results
  } else if (results.length > 10) {
    return "too many matches"
  } else {
    return "no matches"
  }
}


export const pwhints = pwd => {
  const maxLen = 20
  const z = zxcvbn(pwd)
  const fb = z.feedback
  const warn = fb.warning
  let sugg = fb.suggestions
  let guesses = parseInt(z.guesses)

  if(pwd.length > maxLen) {
    guesses <<= pwd.length - maxLen
    sugg = []
  }

  let t = .7/100 * guesses
  const pwbytes = encode(pwd)
  const factor = costfactor(pwbytes)
  t *= factor
  let out = []
  const crackTime = `Estimated time to hack: ${display_time(t)}`
  let valid = true

  const enclen = pwbytes.length
  if (enclen < 8 || t < 600){
    out.push('Choose a passphrase you don\'t use elsewhere.')
    valid = false
  } else if (factor != 1){
    sugg = sugg.filter(f => f !== 'Add another word or two. Uncommon words are better.')
    sugg.push(`Add some more and we can hash it ${factor} times faster.`)
  } else if (sugg.length < 1) {
    sugg.push('Seems long enough, using the fastest hashing!')
  }

  if(warn) {out.push(`⚠️  ${warn}`)}
  sugg.slice(0, 3 - Boolean(warn)).map(sugg => out.push(`🔹 ${sugg}`))

  return [crackTime, out, valid]
}
