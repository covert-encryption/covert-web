import _sodium from 'libsodium-wrappers'
import zxcvbn from 'zxcvbn'
import { display_time } from './helpers.js'
import { encode } from './util.js'
import { words } from './wordList.js'

await _sodium.ready
const sodium = _sodium

// Generate a password of random words without repeating any word.
export const generatePassphrase = (n=4, sep="") => {
  let wl = words
  let pw = wl.sort(() => sodium.randombytes_random() - sodium.randombytes_random()).slice(0, n).join(sep)
  if (4 * zxcvbn(pw).guesses > wl.length ** n) {
    return pw
  }
}

// Generate a password of base64 string from 16 bytes of random buf
export const generatePassword = (len = 16) => {
  let pwd = sodium.to_base64(
    sodium.randombytes_buf(len),
    sodium.base64_variants.URLSAFE_NO_PADDING
  )
  return pwd
}


export const costfactor = pwd => {
  return 1 << Math.max(0, 12 - pwd.length)
}


export const autoComplete = str => {
  let results = words.filter((word) => word.startsWith(str))
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
  let maxLen = 20
  let z = zxcvbn(pwd)
  let fb = z.feedback
  let warn = fb.warning
  let sugg = fb.suggestions
  let guesses = parseInt(z.guesses)

  if(pwd.length > maxLen) {
    guesses <<= pwd.length - maxLen
    sugg = []
  }

  let t = .7/100 * guesses
  let pwbytes = encode(pwd)
  let factor = costfactor(pwbytes)
  t *= factor
  let out = []
  let crackTime = `Estimated time to hack: ${display_time(t)}`
  let valid = true

  let enclen = pwbytes.length
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