// String to ArrayBuffer conversion with Unicode normalisation
export const encode = str => new TextEncoder().encode(str.normalize('NFKC'))

// Randomize padding value (bytes) using exponential distributen and the given preferred mean size
const randpad = prefsize => Math.round(-prefsize * Math.log(1 - Math.random()))
