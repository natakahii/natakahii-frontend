import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Edit,
  ExternalLink,
  Heart,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Video,
} from 'lucide-react';
import { CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { useToast } from '../../components/ui/toast';
import { useAuth } from '../../providers/AuthProvider';
import { CatalogCategory, CatalogProduct, fetchCategories } from '../../services/productService';
import {
  VendorProductStatus,
  deleteVendorProduct,
  fetchVendorProducts,
  updateVendorProductStatus,
  fetchProductWishlistUsers,
} from '../../services/vendorProductService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { User, Mail } from 'lucide-react';
import { safeFormatCurrency } from '../../utils/currency';
import {
  VendorCard,
  VendorEmptyState,
  VendorPageHeader,
  VendorProductsSkeleton,
  VendorStatTile,
} from '../../components/vendor';
import { motion } from 'motion/react';
import { DollarSign, FileText, PackageX } from 'lucide-react';
import { getProductPath } from '../../utils/products';
import { getVendorStorefrontPath } from '../../utils/storefront';

function flattenCategories(categories: CatalogCategory[], depth = 0): Array<{ id: string; name: string }> {
  return categories.flatMap((category) => [
    {
      id: String(category.id),
      name: `${depth > 0 ? `${'  '.repeat(depth)}- ` : ''}${category.name}`,
    },
    ...flattenCategories(category.children, depth + 1),
  ]);
}

function formatStatus(status?: string | null) {
  if (status === 'active') {
    return 'published';
  }

  if (status === 'out_of_stock') {
    return 'out of stock';
  }

  return 'draft';
}

function getStatusBadgeClasses(status?: string | null) {
  if (status === 'active') {
    return 'border-[var(--color-success)] bg-[var(--color-success-bg)] text-[var(--color-success)]';
  }

  if (status === 'out_of_stock') {
    return 'border-[var(--color-warning)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]';
  }

  return 'border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)]';
}

export function VendorProducts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | VendorProductStatus>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Wishlist Modal State
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [wishlistUsers, setWishlistUsers] = useState<any[]>([]);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  const handleShowWishlist = async (product: CatalogProduct) => {
    setSelectedProduct(product);
    setIsWishlistModalOpen(true);
    setIsWishlistLoading(true);
    try {
      const response = await fetchProductWishlistUsers(product.id);
      setWishlistUsers(response.users || []);
    } catch (error) {
      toast({
        type: 'error',
        title: 'Error',
        message: 'Could not fetch wishlist users.',
      });
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const categoryOptions = useMemo(() => flattenCategories(categories), [categories]);
  const storefrontPath = getVendorStorefrontPath(user?.vendor);
  const hasStorefront = Boolean(user?.vendor?.shop_slug || user?.vendor?.id);
  const visibleCounts = useMemo(() => ({
    published: products.filter((product) => product.status === 'active').length,
    draft: products.filter((product) => product.status === 'draft').length,
    outOfStock: products.filter((product) => product.status === 'out_of_stock').length,
  }), [products]);

  useEffect(() => {
    let isMounted = true;

    fetchCategories()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setCategories(response);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setCategories([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchVendorProducts({
      status: filterStatus,
      categoryId: filterCategory,
      search: searchTerm.trim() || undefined,
      perPage: 50,
      sortBy: 'updated_at',
      sortDir: 'desc',
    })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setProducts(response.products);
      })
      .catch((error: any) => {
        if (!isMounted) {
          return;
        }

        setProducts([]);
        toast({
          type: 'error',
          title: 'Unable to load products',
          message: error?.message || 'Please try again in a moment.',
        });
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [filterCategory, filterStatus, searchTerm, toast]);

  async function handleStatusChange(product: CatalogProduct, status: VendorProductStatus) {
    setIsActionLoading(product.id);

    try {
      const response = await updateVendorProductStatus(product.id, status);
      setProducts((currentProducts) =>
        currentProducts.map((currentProduct) => currentProduct.id === product.id ? response.product : currentProduct)
      );
      toast({
        type: 'success',
        title: 'Product updated',
        message: response.message,
      });
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Unable to update status',
        message: error?.message || 'Please try again.',
      });
    } finally {
      setIsActionLoading(null);
    }
  }

  async function handleDelete(product: CatalogProduct) {
    const confirmed = window.confirm(`Delete "${product.name}" from your vendor catalog?`);

    if (!confirmed) {
      return;
    }

    setIsActionLoading(product.id);

    try {
      const response = await deleteVendorProduct(product.id);
      setProducts((currentProducts) => currentProducts.filter((currentProduct) => currentProduct.id !== product.id));
      toast({
        type: 'success',
        title: 'Product deleted',
        message: response.message,
      });
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Unable to delete product',
        message: error?.message || 'Please try again.',
      });
    } finally {
      setIsActionLoading(null);
    }
  }

  if (isLoading && products.length === 0) {
    return <VendorProductsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <VendorPageHeader
        title="Products"
        description="Manage your catalog, pricing, and inventory."
        actions={
          <div className="flex items-center gap-3">
            {hasStorefront && (
              <Button
                variant="outline"
                className="gap-2 rounded-xl"
                onClick={() => window.open(storefrontPath, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                View Storefront
              </Button>
            )}
            <Button
              className="bg-[var(--vendor-accent-action)] hover:bg-[#6d28d9] text-white gap-2 rounded-xl"
              onClick={() => navigate('/vendor/dashboard/products/add')}
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <VendorStatTile title="Published" value={visibleCounts.published} subtitle="Live in storefront" icon={DollarSign} accent="success" />
        <VendorStatTile title="Draft" value={visibleCounts.draft} subtitle="Being prepared" icon={FileText} accent="neutral" />
        <VendorStatTile title="Out of Stock" value={visibleCounts.outOfStock} subtitle="Need inventory" icon={PackageX} accent="warning" />
      </div>

      <VendorCard className="p-4 sm:p-6 space-y-4">

          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <Input
                  placeholder="Search your products..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'all' | VendorProductStatus)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1 bg-[var(--color-bg-card)] p-1 rounded-md self-end lg:self-auto">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${viewMode === 'table' ? 'bg-white shadow-sm' : 'text-[var(--color-text-muted)]'}`}
                onClick={() => setViewMode('table')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-[var(--color-text-muted)]'}`}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {viewMode === 'table' ? (
            <div className="rounded-md border border-[var(--color-border)] overflow-hidden">
              {products.length === 0 ? (
                <div className="p-4">
                  <VendorEmptyState
                    variant="no-products"
                    title={searchTerm || filterStatus !== 'all' ? 'No matching products' : 'No products yet'}
                    description={searchTerm || filterStatus !== 'all' ? 'Try adjusting your filters.' : 'Add your first product to start selling.'}
                    actionLabel="Add Product"
                    actionOnClick={() => navigate('/vendor/dashboard/products/add')}
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-[var(--color-bg-card)]">
                    <TableRow>
                      <TableHead className="w-[84px]">Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Wishlists</TableHead>
                <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img
                            src={product.images[0]?.image_path || 'https://via.placeholder.com/96x96?text=Product'}
                            alt={product.name}
                            className="w-14 h-14 rounded-xl object-cover border border-[var(--color-border)] bg-[var(--color-bg-card)]"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-semibold text-sm text-[var(--color-text-heading)]">{product.name}</p>
                            <div className="flex flex-wrap gap-2">
                              <span className="text-xs text-[var(--color-text-muted)]">{product.slug || `Product #${product.id}`}</span>
                              {product.video_count ? (
                                <Badge variant="outline" className="text-[10px] gap-1 border-[var(--color-primary)] text-[var(--color-primary)]">
                                  <Video className="w-3 h-3" />
                                  {product.video_count} video{product.video_count === 1 ? '' : 's'}
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-[var(--color-text-body)]">{product.category?.name || 'Uncategorized'}</TableCell>
                        <TableCell className="font-medium text-sm">{safeFormatCurrency(product.effective_price)}</TableCell>
                        <TableCell>
                          <span className={`text-sm font-medium ${product.stock > 10 ? 'text-[var(--color-success)]' : product.stock > 0 ? 'text-[var(--color-warning)]' : 'text-[var(--color-error)]'}`}>
                            {product.stock} in stock
                          </span>
                        </TableCell>
                        <TableCell>
                          <button 
                            onClick={() => handleShowWishlist(product)}
                            className="flex items-center gap-1 text-[var(--color-text-muted)] hover:text-[var(--vendor-accent-action)] transition-colors group"
                          >
                            <Heart className="w-3.5 h-3.5 text-[var(--color-accent)] group-hover:scale-110 transition-transform" />
                            <span className="text-[13px] font-medium underline underline-offset-4 decoration-dotted decoration-[var(--color-border)] group-hover:decoration-[var(--vendor-accent-action)]">
                              {product.wishlists_count || 0}
                            </span>
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`capitalize ${getStatusBadgeClasses(product.status)}`}>
                            {formatStatus(product.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" disabled={isActionLoading === product.id}>
                                <span className="sr-only">Open product actions</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2" onClick={() => navigate(`/vendor/dashboard/products/${product.id}/edit`)}>
                                <Edit className="w-4 h-4" />
                                Edit Details
                              </DropdownMenuItem>
                              {product.status === 'active' && (
                                <DropdownMenuItem className="gap-2" onClick={() => navigate(getProductPath(product))}>
                                  View Public Listing
                                </DropdownMenuItem>
                              )}
                              {product.status !== 'active' && (
                                <DropdownMenuItem className="gap-2" onClick={() => void handleStatusChange(product, 'active')}>
                                  Publish Product
                                </DropdownMenuItem>
                              )}
                              {product.status !== 'draft' && (
                                <DropdownMenuItem className="gap-2" onClick={() => void handleStatusChange(product, 'draft')}>
                                  Move to Draft
                                </DropdownMenuItem>
                              )}
                              {product.status !== 'out_of_stock' && (
                                <DropdownMenuItem className="gap-2" onClick={() => void handleStatusChange(product, 'out_of_stock')}>
                                  Mark Out of Stock
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="gap-2 text-[var(--color-error)]" onClick={() => void handleDelete(product)}>
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {products.length === 0 ? (
                <div className="col-span-full">
                  <VendorEmptyState
                    variant="no-products"
                    title={searchTerm || filterStatus !== 'all' ? 'No matching products' : 'No products yet'}
                    description={searchTerm || filterStatus !== 'all' ? 'Try adjusting your filters.' : 'Add your first product to start selling.'}
                    actionLabel="Add Product"
                    actionOnClick={() => navigate('/vendor/dashboard/products/add')}
                  />
                </div>
              ) : (
                products.map((product) => (
                  <motion.div key={product.id} whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
                  <VendorCard className="overflow-hidden p-0">
                    <div className="aspect-[4/3] w-full relative group bg-[var(--color-bg-card)]">
                      <img
                        src={product.images[0]?.image_path || 'https://via.placeholder.com/600x450?text=Product'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        <Badge variant="outline" className={`capitalize bg-white/90 backdrop-blur-sm ${getStatusBadgeClasses(product.status)}`}>
                          {formatStatus(product.status)}
                        </Badge>
                        {product.video_count ? (
                          <Badge variant="outline" className="bg-white/90 backdrop-blur-sm border-[var(--color-primary)] text-[var(--color-primary)] gap-1">
                            <Video className="w-3 h-3" />
                            Video live
                          </Badge>
                        ) : null}
                      </div>
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-10 w-10 rounded-full shadow-lg"
                          onClick={() => navigate(`/vendor/dashboard/products/${product.id}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-10 w-10 rounded-full shadow-lg"
                          onClick={() => void handleDelete(product)}
                          disabled={isActionLoading === product.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-[15px] text-[var(--color-text-heading)] line-clamp-2">{product.name}</h3>
                        <p className="text-xs text-[var(--color-text-muted)]">{product.category?.name || 'Uncategorized'}</p>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-bold text-[16px] text-[var(--color-text-heading)]">{safeFormatCurrency(product.effective_price)}</p>
                        <p className={`text-xs font-semibold ${product.stock > 10 ? 'text-[var(--color-success)]' : product.stock > 0 ? 'text-[var(--color-warning)]' : 'text-[var(--color-error)]'}`}>
                          {product.stock} in stock
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/vendor/dashboard/products/${product.id}/edit`)}>
                          Edit
                        </Button>
                        {product.status === 'active' ? (
                          <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate(getProductPath(product))}>
                            View Live
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="flex-1" onClick={() => void handleStatusChange(product, 'active')}>
                            Publish
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </VendorCard>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </VendorCard>

      <Dialog open={isWishlistModalOpen} onOpenChange={setIsWishlistModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[var(--color-accent)]" />
              Wishlist Interest
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 mb-6 p-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]">
              <img 
                src={selectedProduct?.images[0]?.image_path || 'https://via.placeholder.com/48x48?text=Product'} 
                alt={selectedProduct?.name} 
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <p className="text-sm font-bold text-[var(--color-text-heading)] line-clamp-1">{selectedProduct?.name}</p>
                <p className="text-[11px] text-[var(--color-text-muted)]">{selectedProduct?.wishlists_count} people wishlisted this</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {isWishlistLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[var(--color-bg-card)] animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-24 bg-[var(--color-bg-card)] animate-pulse rounded" />
                        <div className="h-2 w-32 bg-[var(--color-bg-card)] animate-pulse rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : wishlistUsers.length === 0 ? (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-2 opacity-20" />
                  <p className="text-sm text-[var(--color-text-muted)]">No customer details available yet.</p>
                </div>
              ) : (
                wishlistUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-bg-page)] transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-[var(--color-border)]">
                        <AvatarImage src={user.profile_photo || undefined} />
                        <AvatarFallback>
                          <User className="w-4 h-4 text-[var(--color-text-muted)]" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[var(--color-text-heading)]">{user.name}</span>
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
