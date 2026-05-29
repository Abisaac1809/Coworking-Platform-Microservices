const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * Builds an absolute, browser-usable URL for a space photo.
 * The backend stores a relative gateway path (e.g. `/api/spaces/uploads/x.jpg`),
 * so we prepend the public gateway origin.
 */
export function spaceImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${PUBLIC_API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
