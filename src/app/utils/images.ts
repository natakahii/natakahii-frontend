export function getImageUrl(path: string | null | undefined): string {
  if (!path) {
    return 'https://via.placeholder.com/400x400?text=No+Image';
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Prepend CDN base if it's a relative path
  const cdnBase = 'https://cdn.natakahii.com';
  return `${cdnBase}/${path.startsWith('/') ? path.slice(1) : path}`;
}
