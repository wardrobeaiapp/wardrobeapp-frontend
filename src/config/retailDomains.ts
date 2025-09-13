/**
 * List of known retail domains that commonly have CORS restrictions
 * Used to determine how to handle image loading from these sources
 */
export const retailDomains = [
  'reserved.com',
  'static.reserved.com',
  'shop.mango.com',
  'mango.com',
  'zara.com',
  'hm.com',
  'asos.com',
  'nordstrom.com'
];

/**
 * Checks if a URL is from a known retail site with CORS issues
 * @param url The URL to check
 * @returns Boolean indicating if the URL is from a retail site
 */
export const isKnownRetailSite = (url: string): boolean => {
  try {
    console.log('[retailDomains] Checking if URL is from a known retail site:', url);
    const domain = new URL(url).hostname;
    const isRetail = retailDomains.some(retailDomain => domain.includes(retailDomain));
    console.log('[retailDomains] URL domain:', domain, 'Is retail site:', isRetail);
    return isRetail;
  } catch (e) {
    return false;
  }
};
