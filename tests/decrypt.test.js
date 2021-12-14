import { armor_decode, decode, msgpack_decode } from "../util.js"
import { open_wideopen } from "../blockstream.js"

const ciphertext_wideopen = "2qJiI8WsMl+EIj3w6OBStCcnQRckPcE2khVY0jeEjUqDjcDI3w"

const test_decrypt = () => {
  const ciphertext = armor_decode(ciphertext_wideopen)
  console.assert(ciphertext.length === 37)
  const blockstream = open_wideopen(ciphertext)
  console.assert(blockstream.block0pos === 12)
  console.assert(blockstream.block0end === 37)
  const block0 = blockstream.block
  console.assert(block0.length === 6, "invalid length", block0)
  console.assert(block0.nextlen === 0, "invalid nextlen", block0)
  console.assert(decode(block0.view) === "\x05hello", "invalid content", block0)
  // Archive layer decoding
  const m = msgpack_decode(block0.view)
  console.assert(m.value === 5, "index header", m.value)
  const message = decode(m.dataview)
  console.assert(message.length === 5, "message text length", message.length)
  console.assert(message === "hello", "message text", message)
}

test_decrypt()
