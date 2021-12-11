import { pwhints, costfactor } from "../passphrase.js";

const test_costfactor = () => {
    console.assert(costfactor("xxxxxxxx") === 16)
    console.assert(costfactor("xxxxxxxxA") === 8)
    console.assert(costfactor("xxxxxxxxAA") === 4)
    console.assert(costfactor("xxxxxxxxAAA") === 2)
    console.assert(costfactor("xxxxxxxxAAAA") === 1)
    console.assert(costfactor("xxxxxxxxAAAAA") === 1)
}

const test_pwhints = () => {
    let out, valid
    const setRes = str => [ out, valid ] = pwhints(str)
    
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
    console.assert(out.includes(`⚠️  Seems long enough, using the fastest hashing!`))
    
    setRes("faketest")
    console.assert(valid)
    console.assert(out.includes(`⚠️  Add some more and we can hash it 16 times faster.`))
}

test_costfactor()
test_pwhints()