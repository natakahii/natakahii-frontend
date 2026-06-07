import { useEffect, useState } from 'react';
import { Heart, Mail, User, Package, ExternalLink, Sparkles, TrendingUp, Users, ShoppingBag } from 'lucide-react';
import { getImageUrl } from '../../utils/images';
import { 
  VendorCard, 
  VendorEmptyState, 
  VendorPageHeader, 
  VendorTableSkeleton 
} from '../../components/vendor';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { fetchVendorWishlist } from '../../services/vendorProductService';
import { useToast } from '../../components/ui/toast';
import { useNavigate } from 'react-router';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';

interface WishlistItem {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    profile_photo: string | null;
  };
  product: {
    id: number;
    name: string;
    images: Array<{ image_path: string }>;
  };
  created_at: string;
}

export function VendorWishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchVendorWishlist()
      .then((response) => {
        if (!isMounted) return;
        setWishlistItems(response.wishlists || []);
      })
      .catch((error) => {
        if (!isMounted) return;
        toast({
          type: 'error',
          title: 'Error loading wishlist',
          message: error?.message || 'Please try again later.',
        });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const stats = {
    totalInteractions: wishlistItems.length,
    uniqueCustomers: new Set(wishlistItems.map(i => i.user.id)).size,
    topProduct: wishlistItems.reduce((acc, curr) => {
      acc[curr.product.name] = (acc[curr.product.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  const topProductName = Object.entries(stats.topProduct).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <VendorPageHeader title="Wishlist" description="Customers who have wishlisted your products." />
        <VendorTableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <VendorPageHeader 
        title="Wishlist" 
        description="Connect with customers interested in your products."
        actions={
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setIsAnalyticsOpen(true)}
              variant="outline" 
              className="gap-2 rounded-xl border-[var(--color-border)] text-[var(--color-text-heading)] hover:bg-[var(--color-bg-page)] h-12 px-6"
            >
              <TrendingUp className="w-4 h-4 text-[var(--vendor-accent-action)]" />
              Wishlist Analytics
            </Button>
          </div>
        }
      />

      {wishlistItems.length === 0 ? (
        <VendorEmptyState
          variant="no-products"
          title="No wishlists yet"
          description="Your products haven't been wishlisted by customers yet. Try promoting your shop!"
        />
      ) : (
        <VendorCard className="overflow-hidden bg-white border-[var(--color-border)]">
          <Table>
            <TableHeader className="bg-[var(--color-bg-card)] border-b border-[var(--color-border)]">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-[var(--color-text-muted)] font-black uppercase tracking-widest text-[10px] h-14">Customer</TableHead>
                <TableHead className="text-[var(--color-text-muted)] font-black uppercase tracking-widest text-[10px] h-14">Contact</TableHead>
                <TableHead className="text-[var(--color-text-muted)] font-black uppercase tracking-widest text-[10px] h-14">Product Interested In</TableHead>
                <TableHead className="text-right text-[var(--color-text-muted)] font-black uppercase tracking-widest text-[10px] h-14">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wishlistItems.map((item) => (
                <TableRow key={item.id} className="border-[var(--color-border)] hover:bg-[var(--color-bg-page)] transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-[var(--color-border)]">
                        <AvatarImage src={item.user.profile_photo || undefined} />
                        <AvatarFallback className="bg-[var(--color-bg-card)] text-[var(--color-text-muted)]">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <Heart className="w-3 h-3 text-[var(--color-accent)] fill-[var(--color-accent)]" />
                          <span className="font-bold text-sm text-[var(--color-text-heading)]">
                            {item.user.name}
                          </span>
                        </div>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-widest font-black border-[var(--color-border)] bg-[var(--color-bg-card)] py-0 px-2 h-5">
                            {new Date(item.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-body)] font-medium">
                      <Mail className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                      {item.user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-page)] relative group">
                        <img 
                          src={getImageUrl(item.product.images?.[0]?.image_path)} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Package className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[var(--color-text-heading)] line-clamp-1 max-w-[200px]">
                        {item.product.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      onClick={() => navigate(`/vendor/dashboard/products/${item.product.id}/edit`)}
                      variant="ghost" 
                      size="sm" 
                      className="gap-2 rounded-xl text-[var(--vendor-accent-action)] hover:bg-[var(--vendor-accent-action-bg)] font-bold"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Product
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </VendorCard>
      )}

      {/* Analytics Dialog */}
      <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border-none text-[var(--color-text-heading)] p-0 overflow-hidden rounded-[32px] shadow-2xl">
          <div className="p-8">
            <DialogHeader className="mb-8">
              <DialogTitle className="flex items-center gap-3 text-2xl font-black">
                <TrendingUp className="w-6 h-6 text-[var(--vendor-accent-action)]" />
                Wishlist Insights
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--color-bg-card)] rounded-[24px] p-6 border border-[var(--color-border)]">
                <Users className="w-6 h-6 text-[var(--vendor-accent-action)] mb-4" />
                <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-1">Unique Customers</p>
                <p className="text-3xl font-black">{stats.uniqueCustomers}</p>
              </div>
              <div className="bg-[var(--color-bg-card)] rounded-[24px] p-6 border border-[var(--color-border)]">
                <ShoppingBag className="w-6 h-6 text-[var(--vendor-accent-action)] mb-4" />
                <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-[0.2em] mb-1">Total Wishlists</p>
                <p className="text-3xl font-black">{stats.totalInteractions}</p>
              </div>
              <div className="col-span-2 bg-[var(--vendor-accent-action-bg)] rounded-[24px] p-6 border border-[var(--vendor-accent-action)]/10">
                <Sparkles className="w-6 h-6 text-[var(--vendor-accent-action)] mb-4" />
                <p className="text-[10px] font-black text-[var(--vendor-accent-action)] uppercase tracking-[0.2em] mb-1">Hottest Product</p>
                <p className="text-xl font-black text-[var(--color-text-heading)] truncate">{topProductName}</p>
              </div>
            </div>

            <Button 
              onClick={() => setIsAnalyticsOpen(false)}
              className="w-full h-14 bg-[var(--vendor-accent-action)] text-white hover:bg-[var(--vendor-accent-action)]/90 rounded-2xl font-black mt-8 shadow-xl shadow-[var(--vendor-accent-action)]/20"
            >
              Close Analytics
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
