import bech from './bech.js'
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
      if (this.pk && this.pk !== pk) throw Error("Public and secret key mismatch")
      this.pk = pk
    }
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
    return new Key({keystr, sk: new UInt8Array(sk), comment: "age"})
  }
  get age_pk() { bech.encode("age", this.pk) }
  get age_sk() { bech.encode("age-secret-key=", this.sk).toUpperCase() }
}
