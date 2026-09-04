const AB = 'abcdefghijkmnopqrstuvwxyz23456789'
export function nid(len = 10) {
  const a = new Uint8Array(len)
  crypto.getRandomValues(a)
  let s = ''
  for (let i = 0; i < len; i++) s += AB[a[i] % AB.length]
  return s
}
