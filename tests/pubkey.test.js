import assert from 'assert'
import { Key } from "../pubkey.js"

const assert_bytes_equal = (a, b) => {
  assert(a instanceof Uint8Array)
  assert(b instanceof Uint8Array)
  assert(a.length === b.length)
  for (const i in a) assert(a[i] === b[i], `Diff at [${i}]: ${a[i]} != ${b[i]}`)
}

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

  assert_bytes_equal(sec.pk, pub.pk)
}

const test_wg_keys = () => {
  // Generated with wg genkey and wg pubkey
  const WG_SK = "kLkIpWh5MYKwUA7JdQHnmbc6dEiW0py4VRvqmYyPLHc="
  const WG_PK = "ElMfFd2qVIROK4mRaXJouYWC2lxxMApMSe9KyAZcEBc="

  const pub = Key.from_wg_pk(WG_PK)
  assert(pub.keystr === WG_PK)
  assert(pub.comment === "wg")
  assert(pub.sk === undefined)
  assert(pub.pk instanceof Uint8Array)
  assert(pub.wg_pk === WG_PK)

  const sec = Key.from_wg_sk(WG_SK)
  assert(sec.keystr === WG_SK)
  assert(sec.comment === "wg")
  assert(sec.sk instanceof Uint8Array)
  assert(sec.pk instanceof Uint8Array)
  assert(sec.wg_sk === WG_SK)
  assert(sec.wg_pk === WG_PK)

  assert_bytes_equal(sec.pk, pub.pk)
}

//test_age_keys()
test_wg_keys()
