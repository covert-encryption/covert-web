import { pwauthkey } from "./passphrase.js"
import { authkey } from "./pubkey.js"
import EphKey from "./ephkey.js"

import _sodium from "libsodium-wrappers-sumo"
import { xor } from "./util.js"

await _sodium.ready
const sodium = _sodium


export const decrypt_block = (key, nonce, ciphertext, aad=null) => {
  const raw = sodium.crypto_aead_chacha20poly1305_ietf_decrypt(null, ciphertext, aad, nonce, key)
  const length = raw.length - 3
  const nl = raw.slice(length)
  const nextlen = nl[0] + (nl[1] << 8) + (nl[2] << 16)
  return {raw, view: new DataView(raw.buffer, 0, length), length, nextlen}
}


export const decrypt_block0 = (key, ciphertext, block0pos, block0end) => {
  const nonce = ciphertext.slice(0, 12)
  const header = ciphertext.slice(0, block0pos)
  const cipher = ciphertext.slice(block0pos, block0end)
  const block = decrypt_block(key, nonce, cipher, header)
  return {block, key, nonce, block0pos, block0end}
}

export const find_block0 = (key, ciphertext, block0pos) => {
  let err
  for (let block0end = Math.min(1024, ciphertext.length); block0end > block0pos + 19; --block0end) {
    try {
      return decrypt_block0(key, ciphertext, block0pos, block0end)
    } catch (error) {
      err = error
    }
  }
  throw err || RangeError("No space to search for Block0")
}

export const find_slots = (authkey, ciphertext) => {
  let err
  const end = Math.min(640, ciphertext.length - 32 - 19)
  for (let pos = 0; pos < end; pos += 32) {
    const key = new Uint8Array(authkey)
    if (pos) xor(key, ciphertext.slice(pos, pos + 32))
    try {
      return find_block0(key, ciphertext, pos + 32)
    } catch (error) {
      err = error
    }
  }
  throw err || RangeError("File could not be decrypted.")
}

export const open_wideopen = ciphertext => find_block0(new Uint8Array(32), ciphertext, 12)

export const open_pwhash = async (ciphertext, pwhash) => {
  const nonce = ciphertext.slice(0, 12)
  const authkey = await pwauthkey(pwhash, nonce)
  try {
    return find_block0(authkey, ciphertext, 12) // Try single passphrase in short mode
  } catch (error) {}
  return find_slots(authkey, ciphertext)  // Try advanced mode
}

export const open_key = (ciphertext, recvkey) => {
  const nonce = ciphertext.slice(0, 12)
  const ephkey = new EphKey(ciphertext.slice(0, 32))
  return find_slots(authkey(nonce, recvkey, ephkey), ciphertext)
}
