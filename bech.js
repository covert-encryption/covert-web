export const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"
export const GENERATOR = [ 0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
export const BECH32M_CONST = "0x2BC830A3"

export const encoding = {
  BECH32: "bech32",
  BECH32M: "bech32m",
}

const getEncodingConst = (enc) => {
  if (enc == encoding.BECH32) {
    return 1
  } else if (enc == encoding.BECH32M) {
    return 0x2bc830a3
  } else {
    return null
  }
}

export const bech32_polymod = (values) => {
  let chk = 1
  for (let p = 0; p < values.length; ++p) {
    let top = chk >> 25
    chk = ((chk & 0x1ffffff) << 5) ^ values[p]
    for (let i = 0; i < 5; ++i) {
      if ((top >> i) & 1) {
        chk ^= GENERATOR[i]
      }
    }
  }
  return chk
}

export const bech32_hrp_expand = (hrp) => {
  let out = []
  let p
  for (p = 0; p < hrp.length; ++p) {
    out.push(hrp.charCodeAt(p) >> 5)
  }
  out.push(0)
  for (p = 0; p < hrp.length; ++p) {
    out.push(hrp.charCodeAt(p) & 31)
  }
  return out
}

export const bech32_verify_checksum = (hrp, data, enc) => {
  return (
    bech32_polymod(bech32_hrp_expand(hrp).concat(data)) ===
    getEncodingConst(enc)
  )
}

export const bech32_create_checksum = (hrp, data, spec) => {
  const values = bech32_hrp_expand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0])
  const e = spec == encoding.BECH32M ? BECH32M_CONST : 1
  const polymod = bech32_polymod(values) ^ e
  let out = []
  for (let p = 0; p < 6; ++p) {
    out.push((polymod >> (5 * (5 - p))) & 31)
  }
  return out
}

export const bech32_encode = (hrp, data, spec) => {
  const combined = data.concat(bech32_create_checksum(hrp, data, spec))
  let out = hrp + "1"
  for (let p = 0; p < combined.length; ++p) {
    out += CHARSET.charAt(combined[p])
  }
  return out
}

export const bech32_decode = (bech, spec) => {
  let p
  let lower = false
  let upper = false
  for (p = 0; p < bech.length; ++p) {
    if (bech.charCodeAt(p) < 33 || bech.charCodeAt(p) > 126) {
      return null
    }
    if (bech.charCodeAt(p) >= 97 && bech.charCodeAt(p) <= 122) {
      lower = true
    }
    if (bech.charCodeAt(p) >= 65 && bech.charCodeAt(p) <= 90) {
      upper = true
    }
  }
  if (lower && upper) {
    return null
  }
  bech = bech.toLowerCase()
  const pos = bech.lastIndexOf("1")
  if (pos < 1 || pos + 7 > bech.length || bech.length > 90) {
    return null
  }
  const hrp = bech.substring(0, pos)
  let data = []
  for (p = pos + 1; p < bech.length; ++p) {
    const d = CHARSET.indexOf(bech.charAt(p))
    if (d === -1) {
      return null
    }
    data.push(d)
  }
  if (!bech32_verify_checksum(hrp, data, spec)) {
    return null
  }
  return { hrp: hrp, data: data.slice(0, data.length - 6) }
}

export const convertbits = (data, frombits, tobits, pad) => {
  let acc = 0
  let bits = 0
  let out = []
  const maxv = (1 << tobits) - 1
  for (let p = 0; p < data.length; ++p) {
    const value = data[p]
    if (value < 0 || value >> frombits !== 0) {
      return null
    }
    acc = (acc << frombits) | value
    bits += frombits
    while (bits >= tobits) {
      bits -= tobits
      out.push((acc >> bits) & maxv)
    }
  }
  if (pad) {
    if (bits > 0) {
      out.push((acc << (tobits - bits)) & maxv)
    }
  } else if (bits >= frombits || (acc << (tobits - bits)) & maxv) {
    return null
  }
  return out
}

export const decode = (hrp, addr) => {
  let bech32m = false
  var dec = bech32_decode(addr, encoding.BECH32)
  if (dec === null) {
    dec = bech32_decode(addr, encoding.BECH32M)
    bech32m = true
  }
  if (
    dec === null ||
    dec.hrp !== hrp ||
    dec.data.length < 1 ||
    dec.data[0] > 16
  ) {
    return null
  }
  const res = convertbits(dec.data.slice(1), 5, 8, false)
  if (res === null || res.length < 2 || res.length > 40) {
    return null
  }
  if (dec.data[0] === 0 && res.length !== 20 && res.length !== 32) {
    return null
  }
  if (dec.data[0] === 0 && bech32m) {
    return null
  }
  if (dec.data[0] !== 0 && !bech32m) {
    return null
  }
  return { version: dec.data[0], program: res }
}

export const encode = (hrp, version, databytes) => {
  let enc = encoding.BECH32
  if (version > 0) {
    enc = encoding.BECH32M
  }
  const ret = bech32_encode(
    hrp,
    [version].concat(convertbits(databytes, 8, 5, true)),
    enc
  )
  if (decode(hrp, ret, enc) === null) {
    return null
  }
  return ret
}
