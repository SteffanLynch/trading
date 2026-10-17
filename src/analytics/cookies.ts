/** Removes a cookie wherever the vendor may have set it: this host, and each parent domain of it. */
export function expireCookie(name: string): void {
  if (typeof document === 'undefined') return;
  const parts = window.location.hostname.split('.');
  const domains: (string | null)[] = [null];
  for (let index = 0; index <= parts.length - 2; index += 1) domains.push(`.${parts.slice(index).join('.')}`);
  for (const domain of domains) {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${domain ? `; Domain=${domain}` : ''}`;
  }
}

/** Names of the cookies visible to this page that match. */
export function cookieNames(pattern: RegExp): string[] {
  if (typeof document === 'undefined') return [];
  return document.cookie
    .split(';')
    .map((part) => part.split('=')[0]?.trim())
    .filter((name): name is string => !!name && pattern.test(name));
}

/** Keys in local and session storage that match. */
export function storageKeys(pattern: RegExp): {storage: Storage; key: string}[] {
  const found: {storage: Storage; key: string}[] = [];
  for (const read of [() => window.localStorage, () => window.sessionStorage]) {
    try {
      const storage = read();
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key && pattern.test(key)) found.push({storage, key});
      }
    } catch {
      // Blocked storage has nothing to clear.
    }
  }
  return found;
}
