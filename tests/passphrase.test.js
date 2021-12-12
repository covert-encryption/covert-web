import { generatePassphrase, pwhints, costfactor, autoComplete, generatePassword } from "../passphrase.js"

const test_generate_passphrase = () => {
    let pw1 = generatePassphrase()
    let pw2 = generatePassphrase()
    console.assert(pw1 !== pw2)
    let pw3 = generatePassphrase(8, "-")
    console.assert((pw3.match(/-/g) || []).length === 7)
    for (let i = 0; i<10; i++) {
        generatePassphrase(8, "_") // logic_left_mercy_yes_check_sugar_radio_place
    } 
    
}

const test_generate_password = () => {
    console.assert(generatePassword().length === 22) // l3lnES0RLMKi-rP4k4XR7Q
    console.assert(generatePassword(5).length === 7) // LpOHmg0
}

const test_autoComplete = () => {
    console.assert(autoComplete("") === "enter a few letters of a word first")
    console.assert(autoComplete("ang").includes("angle"))
    console.assert(autoComplete("an").length === 7)
    console.assert(autoComplete("a") === "too many matches")
}

const test_costfactor = () => {
    console.assert(costfactor("xxxxxxxx") === 16)
    console.assert(costfactor("xxxxxxxxA") === 8)
    console.assert(costfactor("xxxxxxxxAA") === 4)
    console.assert(costfactor("xxxxxxxxAAA") === 2)
    console.assert(costfactor("xxxxxxxxAAAA") === 1)
    console.assert(costfactor("xxxxxxxxAAAAA") === 1)
}

const test_pwhints = () => {
    let crackTime, out, valid
    const setRes = str => [ crackTime, out, valid ] = pwhints(str)
    
    setRes("")
    console.assert(!valid)
    console.assert(out.includes("Choose a passphrase you don't use elsewhere."))

    setRes("abcabcabcabc")
    console.assert(!valid)
    console.assert(out.includes(`⚠️  Repeats like "abcabcabc" are only slightly harder to guess than "abc"`))

    setRes("ridiculouslylongpasswordthatwecannotletzxcvbncheckbecauseitbecomestooslow")
    //fails in the time estimation ~ weird
    
    setRes("quitelegitlongpwd")
    console.assert(valid)
    console.assert(crackTime === 'Estimated time to hack: centuries')
    console.assert(out.includes(`🔹 Seems long enough, using the fastest hashing!`))
    
    setRes("faketest")
    console.assert(valid)
    console.assert(out.includes(`🔹 Add some more and we can hash it 16 times faster.`))

    // function return example 
    // [
    //     'Estimated time to hack: less than a second',
    //     [
    //       "Choose a passphrase you don't use elsewhere.",
    //       '⚠️ Repeats like "abcabcabc" are only slightly harder to guess than "abc"',
    //       '🔹 Add another word or two. Uncommon words are better.',
    //       '🔹 Avoid repeated words and characters'
    //     ],
    //     false
    // ]
}

test_generate_passphrase()
test_generate_password()
test_autoComplete()
test_costfactor()
test_pwhints()