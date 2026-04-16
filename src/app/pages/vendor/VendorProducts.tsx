import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { LayoutGrid, List, Plus, Search, MoreHorizontal, Edit, Copy, Trash2, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router';
import { fetchProducts } from '../../services/productService';
import { fetchCurrentUser } from '../../services/authService';

export function VendorProducts() {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorId, setVendorId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    fetchCurrentUser()
      .then((response) => {
        if (!isMounted) return;
        setVendorId(String(response.user?.vendor?.id ?? ''));
      })
      .catch(() => {
        // ignore login state error
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!vendorId) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetchProducts({
      vendorId,
      status: filterStatus === 'all' ? undefined : filterStatus,
      category: filterCategory === 'all' ? undefined : filterCategory,
      search: searchTerm || undefined,
      per_page: 50,
    })
      .then((data) => {
        if (!isMounted) return;
        setProducts(data.products ?? []);
      })
      .catch(() => {
        if (!isMounted) return;
        setProducts([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [vendorId, filterStatus, filterCategory, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-heading)]">Products</h1>
          <p className="text-[var(--color-text-muted)]">Manage your inventory, pricing, and variants.</p>
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
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <Input
                  placeholder="Search products..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value)}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value)}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="home">Home Decor</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1 bg-[var(--color-bg-card)] p-1 rounded-md self-end md:self-auto">
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
                <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">Loading products…</div>
              ) : products.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">No products found for your store.</div>
              ) : (
                <Table>
                  <TableHeader className="bg-[var(--color-bg-card)]">
                    <TableRow>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>Product Info</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id ?? product.slug ?? product.name}>
                        <TableCell>
                          <img
                            src={product.images?.[0]?.image_path || product.image || 'https://via.placeholder.com/64'}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover border border-[var(--color-border)]"
                          />
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-sm text-[var(--color-text-heading)]">{product.name}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{product.sku ?? product.slug ?? product.id}</p>
                        </TableCell>
                        <TableCell className="text-sm">{product.category?.name ?? product.category ?? '—'}</TableCell>
                        <TableCell className="font-medium text-sm">KES {product.price?.toLocaleString?.() ?? product.price}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-[var(--color-success)]' : product.stock > 0 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-error)]'}`} />
                            {product.stock ?? '—'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`
                            ${product.status === 'active' ? 'text-[var(--color-success)] border-[var(--color-success)] bg-[var(--color-success-bg)]' : 
                              product.status === 'draft' ? 'text-[var(--color-text-muted)] border-[var(--color-text-muted)] bg-[var(--color-bg-page)]' : 
                              'text-[var(--color-error)] border-[var(--color-error)] bg-[var(--color-error-bg)]'}
                          `}>
                            {product.status ? String(product.status).replace(/(^|_)([a-z])/g, (m, p1, p2) => p2.toUpperCase()) : 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2" onClick={() => navigate('/vendor/dashboard/products/add')}>
                                <Edit className="w-4 h-4" /> Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <ImageIcon className="w-4 h-4" /> Manage Media
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Copy className="w-4 h-4" /> Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-[var(--color-error)] gap-2">
                                <Trash2 className="w-4 h-4" /> Delete
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {isLoading ? (
                <div className="col-span-full p-8 text-center text-sm text-[var(--color-text-muted)]">Loading products…</div>
              ) : products.length === 0 ? (
                <div className="col-span-full p-8 text-center text-sm text-[var(--color-text-muted)]">No products found for your store.</div>
              ) : (
                products.map((product) => (
                  <Card key={product.id ?? product.slug ?? product.name} className="overflow-hidden border-[var(--color-border)] shadow-sm hover:shadow-[var(--shadow-level-2)] transition-shadow">
                    <div className="aspect-square w-full relative group">
                      <img src={product.images?.[0]?.image_path || product.image || 'https://via.placeholder.com/240'} alt={product.name} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge variant="outline" className="bg-white/90 text-black backdrop-blur-sm shadow-sm text-[10px] uppercase font-bold tracking-wider border-transparent">
                          {product.status ? String(product.status).toUpperCase() : 'UNKNOWN'}
                        </Badge>
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg" onClick={() => navigate('/vendor/dashboard/products/add')}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-sm text-[var(--color-text-heading)] line-clamp-2 leading-tight flex-1 pr-2">
                          {product.name}
                        </h3>
                        <p className="font-bold text-sm text-[var(--color-text-heading)] shrink-0">KES {product.price?.toLocaleString?.() ?? product.price}</p>
                      </div>
                      <div className="flex justify-between items-center text-xs text-[var(--color-text-muted)]">
                        <span>{product.sku ?? product.slug ?? product.id}</span>
                        <span className={`font-medium ${product.stock > 10 ? 'text-[var(--color-success)]' : product.stock > 0 ? 'text-[var(--color-warning)]' : 'text-[var(--color-error)]'}`}>
                          {product.stock ?? 0} in stock
                        </span>
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
