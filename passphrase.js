import zxcvbn from 'zxcvbn'
import {display_time} from './helpers.js'
import { encode } from './util.js'

const costfactor = pwd => {
  return 1 << Math.max(0, 12 - pwd.length)
}

const pwhints = pwd => {
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
  out.push(`Estimated time to hack: ${display_time(t)}`)
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
  sugg.slice(0, 3 - Boolean(warn)).map(sugg => out.push(`⚠️  ${sugg}`))

  return [out, valid]
}

export { pwhints, costfactor }


