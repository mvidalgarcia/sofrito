export function cyrb53(str: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    h1 = Math.imul(h1 ^ str.charCodeAt(i), 2654435761);
    h2 = Math.imul(h2 ^ str.charCodeAt(i), 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h1 >>> 0).toString(36) + (h2 >>> 0).toString(36);
}

export function generateId(name: string): string {
  return cyrb53(name.toLowerCase().trim());
}