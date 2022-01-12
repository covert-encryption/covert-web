import {Key} from './pubkey.js'
import { webcrypto } from 'crypto'
import Monocypher from 'monocypher-wasm'

await Monocypher.ready
const crypto = webcrypto

// Ephemeral keys using dirty points and Elligator 2 to make the
// pkhash indistinguisable from random. Note that the recovered
// point is not undirtied, thus sender.equals(recipient) only 1/8
// of times but ECDH will still always produce the same output.

export default class EphKey extends Key {
  constructor(pkhash=undefined) {
    if (pkhash) {
      // Restore public key from pkhash
      const pk = Monocypher.crypto_hidden_to_curve(pkhash)
      super({pk, comment: "eph"})
      this.pkhash = pkhash
      return
    }
    // Generate a key with random-looking pkhash
    const seed = new Uint8Array(32)
    crypto.getRandomValues(seed)
    const k = Monocypher.crypto_hidden_key_pair(seed)
    super({sk: k.secret_key, comment: "eph"})
    this.pkhash = k.hidden
  }
}
