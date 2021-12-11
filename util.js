// String to ArrayBuffer conversion with Unicode normalisation
export const encode = str => new TextEncoder().encode(str.normalize('NFKC'))