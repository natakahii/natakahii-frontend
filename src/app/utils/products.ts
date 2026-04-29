export interface ProductPathLike {
  id: string | number;
  slug?: string | null;
}

export function getProductPath(product: ProductPathLike): string {
  const identifier = product.slug || String(product.id);
  return `/product/${encodeURIComponent(identifier)}`;
}
