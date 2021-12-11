import zxcvbn from './zxcvbn.js'

const updater = div => ev => {
  let timer
  const doUpdate = () => {
    timer = undefined
    const pwinput = ev.target
    const pwq = zxcvbn(pwinput.value.slice(0, 80))
    const ul = div.querySelector('ul')
    ul.innerHTML = ''
    const add = (cl, text) => {
      if (ul.childElementCount === 2) return
      const li = document.createElement('li')
      li.classList.add(cl)
      li.textContent = text
      ul.appendChild(li)
    }
    if (pwq.feedback.warning) add('warning', pwq.feedback.warning)
    for (const s of pwq.feedback.suggestions) add('suggestion', s)
    const crackTime = pwq.crack_times_display.online_no_throttling_10_per_second
    const score = pwq.guesses === 1 ? -1 : crackTime === 'centuries' ? 5 : pwq.score
    div.setAttribute('data-score', score)
    div.querySelector('span').textContent = (
      pwq.guesses === 1 ? 'Choose a passphrase you don\'t use elsewhere' : 'Hacking takes ' + crackTime
    )
    pwinput.setCustomValidity(score >= 2 ? '' : 'Strong password required')
  }
  // Lazyish updates
  if (timer) {
    clearTimeout(timer)
    timer = setTimeout(doUpdate, 200)
  } else {
    // Instant update, but add a bogus timeout to avoid future spam
    doUpdate(div, ev.target)
    timer = setTimeout(() => {}, 200)
  }
}

export default (selector='.pwvalidate') => {
  window.addEventListener('load', () => {
    for (const label of document.querySelectorAll(selector)) {
      const id = label.getAttribute('for')
      const input = id ? document.getElementById(id) : label.querySelector('input')
      const div = document.createElement('div')
      div.innerHTML = '<div><span></span><ul></ul></div>'
      label.prepend(div)
      input.addEventListener('input', updater(div))
      input.dispatchEvent(new Event('input'))
      if (input.form) {
        // Reset pwvalidator info *after* form reset
        input.form.addEventListener(
          'reset', () => setTimeout(() => input.dispatchEvent(new Event('input')), 0)
        )
      }
    }
  })
}

const argon2 = async (pw, salt, cost) => {
  const res = await new Promise((resolve, reject) => {
    const argon2 = new Worker('./argon2-worker.js')
    argon2.onmessage = resolve
    argon2.onerror = reject
    argon2.postMessage({
      pass: pw,
      salt: salt,
      time: cost,
      mem: 262144,
      hashLen: 16,
      parallelism: 1,
      type: 2,
    })
  })
  return res.data
}

const pwhash = async pw => argon2(pw, encode("covertpassphrase"), 8 << Math.max(0, 12 - pw.length))
const pwauthkey = async (pwhash, nonce) => argon2(nonce, pwhash, 2)

// String to ArrayBuffer conversion with Unicode normalisation
const encode = str => new TextEncoder().encode(str.normalize('NFKC'))

// XOR buffer a with bytes of b (both of length multiple of four)
const xor = (a, b) => {
  const a32 = new Uint32Array(a), b32 = new Uint32Array(b)
  for (let i = 0; i < b32.length; ++i) a32[i] ^= b32[i]
}

