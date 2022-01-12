import assert from 'assert'
import EphKey from "../ephkey.js"
import {ecdh} from "../pubkey.js"

const assert_bytes_equal = (a, b) => {
  assert(a instanceof Uint8Array)
  assert(b instanceof Uint8Array)
  assert(a.length === b.length)
  for (const i in a) assert(a[i] === b[i], `Diff at [${i}]: ${a[i]} != ${b[i]}`)
}

const test_hidden_keys = () => {
  const sender = new EphKey()
  assert(sender.pkhash instanceof Uint8Array)
  assert(sender.pkhash.length === 32)
  const trans = new EphKey(sender.pkhash)
  assert(sender.pkhash instanceof Uint8Array)
  assert(sender.pkhash.length === 32)
  assert(sender.pk instanceof Uint8Array)
  assert(sender.pk.length === 32)

  // Usually the sender/trans pk don't match but ECDH should match:
  const recipient = new EphKey()  // Recipient key (not ephemeral)
  const shared1 = ecdh(sender, recipient)
  const shared2 = ecdh(recipient, trans)
  assert_bytes_equal(shared1, shared2)
}

test_hidden_keys()
