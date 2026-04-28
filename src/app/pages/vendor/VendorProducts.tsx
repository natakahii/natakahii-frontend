import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Edit,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Video,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { useToast } from '../../components/ui/toast';
import { CatalogCategory, CatalogProduct, fetchCategories } from '../../services/productService';
import {
  VendorProductStatus,
  deleteVendorProduct,
  fetchVendorProducts,
  updateVendorProductStatus,
} from '../../services/vendorProductService';
import { formatCurrency } from '../../utils/currency';

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
  return String(status || 'draft').replace(/_/g, ' ');
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
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | VendorProductStatus>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categoryOptions = useMemo(() => flattenCategories(categories), [categories]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-heading)]">Products</h1>
          <p className="text-[var(--color-text-muted)]">Upload new products, edit listings, and control what goes live in your storefront and video commerce flow.</p>
        </div>
        <Button
          className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white gap-2 w-full sm:w-auto"
          onClick={() => navigate('/vendor/dashboard/products/add')}
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <Card className="border-[var(--color-border)] shadow-sm">
        <CardContent className="p-4 sm:p-6 space-y-4">
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
                  <SelectItem value="active">Live</SelectItem>
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
              {isLoading ? (
                <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">Loading your vendor products...</div>
              ) : products.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">No products match the current filters yet.</div>
              ) : (
                <Table>
                  <TableHeader className="bg-[var(--color-bg-card)]">
                    <TableRow>
                      <TableHead className="w-[84px]">Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
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
                        <TableCell className="font-medium text-sm">{formatCurrency(product.effective_price)}</TableCell>
                        <TableCell>
                          <span className={`text-sm font-medium ${product.stock > 10 ? 'text-[var(--color-success)]' : product.stock > 0 ? 'text-[var(--color-warning)]' : 'text-[var(--color-error)]'}`}>
                            {product.stock} in stock
                          </span>
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
                              {product.status !== 'active' && (
                                <DropdownMenuItem className="gap-2" onClick={() => void handleStatusChange(product, 'active')}>
                                  Publish Live
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
              {isLoading ? (
                <div className="col-span-full p-8 text-center text-sm text-[var(--color-text-muted)]">Loading your vendor products...</div>
              ) : products.length === 0 ? (
                <div className="col-span-full p-8 text-center text-sm text-[var(--color-text-muted)]">No products match the current filters yet.</div>
              ) : (
                products.map((product) => (
                  <Card key={product.id} className="overflow-hidden border-[var(--color-border)] shadow-sm hover:shadow-[var(--shadow-level-2)] transition-shadow">
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
                        <p className="font-bold text-[16px] text-[var(--color-text-heading)]">{formatCurrency(product.effective_price)}</p>
                        <p className={`text-xs font-semibold ${product.stock > 10 ? 'text-[var(--color-success)]' : product.stock > 0 ? 'text-[var(--color-warning)]' : 'text-[var(--color-error)]'}`}>
                          {product.stock} in stock
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/vendor/dashboard/products/${product.id}/edit`)}>
                          Edit
                        </Button>
                        {product.status === 'active' ? (
                          <Button variant="ghost" size="sm" className="flex-1" onClick={() => void handleStatusChange(product, 'draft')}>
                            Draft
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="flex-1" onClick={() => void handleStatusChange(product, 'active')}>
                            Publish
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
