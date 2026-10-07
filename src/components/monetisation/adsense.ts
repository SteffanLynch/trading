declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const SCRIPT_ID = 'tn-adsense';

/** Loads the AdSense script once. Called only after the visitor has allowed advertising. */
export function loadAdsense(client: string): void {
  if (typeof document === 'undefined' || document.getElementById(SCRIPT_ID)) return;
  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  document.head.appendChild(script);
}

/** Asks AdSense to fill the next empty ad unit on the page. */
export function requestAd(): void {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch {
    // A blocked or failed ad never breaks the page.
  }
}
