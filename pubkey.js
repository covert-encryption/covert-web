import bech from './bech.js'
import {b64dec, b64enc} from './util.js'
import _sodium from 'libsodium-wrappers-sumo'

await _sodium.ready
const sodium = _sodium

export class Key {
  constructor({keystr=undefined, sk=undefined, pk=undefined, comment=undefined}) {
    this.comment = comment
    this.keystr = keystr
    this.sk = sk
    this.pk = pk
    if (sk) {
      // Calculate public key
      pk = sodium.crypto_scalarmult_base(sk)
      // If both sk and pk were given, verify that they match
      if (this.pk && !this.equals(new Key({pk}))) throw Error("Public and secret key mismatch")
      this.pk = pk
    }
  }

  equals(other) {
    let d = 0
    for (let i = 0; i < 32; ++i) d |= this.pk[i] ^ other.pk[i]
    return d === 0
  }

  // Age keystr conversions
  static from_age_pk(keystr) {
    const pk = bech.decode("age", keystr.toLowerCase())
    if (!pk) throw Error("Invalid Age public key")
    return new Key({keystr, pk: new Uint8Array(pk), comment: "age"})
  }
  static from_age_sk(keystr) {
    const sk = bech.decode("age-secret-key-", keystr.toLowerCase())
    if (!sk) throw Error("Invalid Age secret key")
    return new Key({keystr, sk: new Uint8Array(sk), comment: "age"})
  }
  get age_pk() { return bech.encode("age", this.pk) }
  get age_sk() { return bech.encode("age-secret-key=", this.sk).toUpperCase() }

  // WireGuard keystr conversions
  static from_wg_pk(keystr) {
    const pk = b64dec(keystr)
    if (pk.length !== 32) throw Error("Invalid WG public key")
    return new Key({keystr, pk, comment: "wg"})
  }
  static from_wg_sk(keystr) {
    const sk = b64dec(keystr)
    if (sk.length !== 32) throw Error("Invalid WG secret key")
    return new Key({keystr, sk, comment: "wg"})
  }
  get wg_pk() { return b64enc(this.pk) }
  get wg_sk() { return b64enc(this.sk) }

}

export const ecdh = (local, remote) => sodium.crypto_scalarmult(local.sk, remote.pk)

export const authkey = (nonce, local, remote) => {
  const h = sodium.crypto_hash_sha512_init()
  sodium.crypto_hash_sha512_update(h, nonce)
  sodium.crypto_hash_sha512_update(h, ecdh(local, remote))
  return sodium.crypto_hash_sha512_final(h).slice(0, 32)
}
