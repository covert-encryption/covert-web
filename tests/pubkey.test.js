import assert from 'assert'
import { Key } from "../pubkey.js"

const test_age_keys = () => {
  // Test vectors from https://age-encryption.org/v1
  const AGE_PK = "age1zvkyg2lqzraa2lnjvqej32nkuu0ues2s82hzrye869xeexvn73equnujwj"
  const AGE_SK = "AGE-SECRET-KEY-1GFPYYSJZGFPYYSJZGFPYYSJZGFPYYSJZGFPYYSJZGFPYYSJZGFPQ4EGAEX"
  const AGE_SK_BYTES = new Uint8Array(32).fill(0x42)

  const pub = Key.from_age_pk(AGE_PK)
  assert(pub.keystr === AGE_PK)
  assert(pub.comment === "age")
  assert(pub.sk === undefined)
  assert(pub.pk instanceof Uint8Array)
  assert(pub.age_pk === AGE_PK)

  const sec = Key.from_age_sk(AGE_SK)
  assert(sec.keystr === AGE_SK)
  assert(sec.comment === "age")
  assert(sec.sk instanceof Uint8Array)
  assert(sec.pk instanceof Uint8Array)
  assert(sec.sk === AGE_SK_BYTES)
  assert(sec.age_sk === AGE_SK)
  assert(sec.age_pk === AGE_PK)

  assert(sec.pk === pub.pk)
}

test_age_keys()
