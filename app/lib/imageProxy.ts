export function proxifyImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("/api/image-proxy?url=")) return url;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    const shouldProxy =
      host === "resources.premierleague.com" ||
      host === "upload.wikimedia.org" ||
      host === "images.fotmob.com" ||
      host === "a.espncdn.com";
    if (!shouldProxy) return url;
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  } catch {
    return url;
  }
}
