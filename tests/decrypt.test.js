import assert from 'assert'
import { armor_decode, decode, encode, msgpack_decode } from "../util.js"
import { open_pwhash, open_wideopen } from "../blockstream.js"
import { pwhash } from "../passphrase.js"

const ciphertext_wideopen = "2qJiI8WsMl+EIj3w6OBStCcnQRckPcE2khVY0jeEjUqDjcDI3w"

// Message from README.md
const ciphertext_passphrase = "R/i7oqt9QnTnc6Op9gw9wSbYQq1bfYtKAfEOxpiQopc0SsYdLa12AUkg0o5s4KPfU6eZX59c4SXD2F8efFCEUeU"


const test_decrypt_wideopen = () => {
  const ciphertext = armor_decode(ciphertext_wideopen)
  assert(ciphertext.length === 37)
  const blockstream = open_wideopen(ciphertext)
  assert(blockstream.block0pos === 12)
  assert(blockstream.block0end === 37)
  const block0 = blockstream.block
  assert(block0.length === 6, "invalid length", block0)
  assert(block0.nextlen === 0, "invalid nextlen", block0)
  assert(decode(block0.view) === "\x05hello", "invalid content", block0)
  // Archive layer decoding
  const m = msgpack_decode(block0.view)
  assert(m.value === 5, "index header", m.value)
  const message = decode(m.dataview)
  assert(message.length === 5, `message text length ${message.length}`)
  assert(message === "hello", `message text ${message}`)
}

const test_decrypt_passphrase = async () => {
  const ciphertext = armor_decode(ciphertext_passphrase)
  const pwh = await pwhash(encode("oliveanglepeaceethics"))
  assert(pwh instanceof Uint8Array, pwh)
  assert(pwh.length === 16)
  const blockstream = await open_pwhash(ciphertext, pwh)
  assert(blockstream.block0pos === 12)
  assert(blockstream.block0end === 65)
  const block0 = blockstream.block
  // Archive layer decoding
  const m = msgpack_decode(block0.view)
  // New view containing only the message, no padding
  const msgdata = new DataView(m.dataview.buffer, m.dataview.byteOffset, m.value)
  const message = decode(msgdata)
  assert(message === "Attack at Dawn", `message text ${message}`)
}

test_decrypt_wideopen()
test_decrypt_passphrase()
