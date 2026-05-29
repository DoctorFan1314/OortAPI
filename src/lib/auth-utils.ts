/**
 * Sanitize a return URL to prevent open redirect attacks.
 * Only allows relative paths starting with "/".
 */
export function safeReturnUrl(url: string | null): string {
  if (!url || !url.startsWith("/") || url.includes("://")) return "/";
  return url;
}
