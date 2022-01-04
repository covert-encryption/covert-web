import { generate, pwhints, costfactor, autoComplete, pwhash, pwauthkey } from "../passphrase.js"
import { encode } from "../util.js"
import _sodium from 'libsodium-wrappers-sumo'
import assert from 'assert'

await _sodium.ready
const sodium = _sodium

const test_generate_passphrase = () => {
    let pw1 = generate()
    let pw2 = generate()
    assert(pw1 !== pw2)
    let pw3 = generate(8, "-")
    assert((pw3.match(/-/g) || []).length === 7)
    for (let i = 0; i<10; i++) {
        generate(8, "_") // logic_left_mercy_yes_check_sugar_radio_place
    }
}


const test_autoComplete = () => {
    assert(autoComplete("") === "enter a few letters of a word first")
    assert(autoComplete("ang").includes("angle"))
    assert(autoComplete("an").length === 7)
    assert(autoComplete("a") === "too many matches")
}

const test_costfactor = () => {
    assert(costfactor("xxxxxxxx") === 16)
    assert(costfactor("xxxxxxxxA") === 8)
    assert(costfactor("xxxxxxxxAA") === 4)
    assert(costfactor("xxxxxxxxAAA") === 2)
    assert(costfactor("xxxxxxxxAAAA") === 1)
    assert(costfactor("xxxxxxxxAAAAA") === 1)
}

const test_pwhints = () => {
    let crackTime, out, valid
    const setRes = str => [ crackTime, out, valid ] = pwhints(str)

    setRes("")
    assert(!valid)
    assert(out.includes("Choose a passphrase you don't use elsewhere."))

    setRes("abcabcabcabc")
    assert(!valid)
    assert(out.includes(`⚠️  Repeated character patterns like "abcabcabc" are easy to guess.`))


    setRes("ridiculouslylongpasswordthatwecannotletzxcvbncheckbecauseitbecomestooslow")
    assert(out.includes(`🔹 Seems long enough, using the fastest hashing!`))

    setRes("quitelegitlongpwd")
    assert(valid)
    assert(crackTime === 'Estimated time to hack: centuries')
    assert(out.includes(`🔹 Seems long enough, using the fastest hashing!`))

    setRes("faketest")
    assert(valid)
    assert(out.includes(`🔹 Add some more and we can hash it 16 times faster.`))

    // function return example
    // [
    //     'Estimated time to hack: less than a second',
    //     [
    //       "Choose a passphrase you don't use elsewhere.",
    //       '⚠️ Repeated character patterns like "abcabcabc" are easy to guess.',
    //       '🔹 Add another word or two. Uncommon words are better.',
    //       '🔹 Avoid repeated words and characters'
    //     ],
    //     false
    // ]
}

const test_pwhashing = async () => {
  const pwbytes = encode("xxxxxxxxAAAA")
  const pwh = await pwhash(pwbytes)
  const pwhex = sodium.to_hex(pwh)
  assert(pwh.length === 16, "pwh length", pwh)
  assert(pwhex === "dbc27f84f3f3747826801c68e3e8aa1b", "pwhash value", pwh)
  const authkey = await pwauthkey(pwh, encode("faketestsalt"))
  const authhex = sodium.to_hex(authkey)
  assert(authkey.length === 32, "pwauthkey length", authkey)
  assert(authhex === "a8586c8811ab565a2f30ad876305ebecfc93a3302dd3a3ba2ac83c07a961b9c8", "pwauthkey value", authhex)
}

test_generate_passphrase()
test_autoComplete()
test_costfactor()
test_pwhints()
await test_pwhashing()
