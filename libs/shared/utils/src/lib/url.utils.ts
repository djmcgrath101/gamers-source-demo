/**
 * Converts a URLSearchParams object into a plain JavaScript object (Record<string, string>).
 * This is useful for easily accessing query parameters as key-value pairs.
 *
 * @param searchParams - The URLSearchParams instance to convert.
 * @returns A Record<string, string> containing the key-value pairs from the URLSearchParams.
 */
export function convertUrlSearchParamsToRecord(
  searchParams: URLSearchParams
): Record<string, string> {
  const params: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

/**
 * Checks if a given string is a valid HTTP or HTTPS URL.
 *
 * @param url - The URL string to validate.
 * @returns True if the URL is valid and uses HTTP or HTTPS scheme, false otherwise.
 */
export function isValidHttpUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return (
      ['http:', 'https:'].includes(parsedUrl.protocol) && isValidUrlHostname(parsedUrl.hostname)
    );
  } catch {
    return false;
  }
}

/**
 * Checks if a given hostname is valid according to standard hostname rules.
 *
 * @param hostname - The hostname string to validate.
 * @returns True if the hostname is valid, false otherwise.
 */
export function isValidUrlHostname(hostname: string): boolean {
  const hostnameRegex =
    /^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))*\.?$/;
  return hostnameRegex.test(hostname);
}
