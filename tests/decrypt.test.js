import { armor_decode, encode } from "../util.js"
import _sodium from "libsodium-wrappers"

await _sodium.ready
const sodium = _sodium

const ciphertext_wideopen = "2qJiI8WsMl+EIj3w6OBStCcnQRckPcE2khVY0jeEjUqDjcDI3w"

const test_decrypt = () => {
    const data = armor_decode(ciphertext_wideopen)
    console.assert(data.length === 37)
    const header = data.slice(0, 12)
    const nonce = data.slice(0, 12)
    const key = new Uint8Array(32)
    const block0 = sodium.crypto_aead_chacha20poly1305_ietf_decrypt(null, data.slice(12), header, nonce, key)
    const expected = encode('\x05hello\0\0\0')
    console.assert(block0.length === expected.length, "length mismatch", block0)
    for (const i in expected) {
        console.assert(block0[i] === expected[i], `mismatch at block0[${i}] = ${block0[i]} vs. ${expected[i]} expected`)
    }

}

test_decrypt()
