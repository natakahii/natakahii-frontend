import { useEffect, useState } from 'react';
import { Heart, Mail, User, Package, ExternalLink } from 'lucide-react';
import { 
  VendorCard, 
  VendorEmptyState, 
  VendorPageHeader, 
  VendorTableSkeleton,
} from '../../components/vendor';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { fetchVendorWishlist } from '../../services/vendorProductService';
import { useToast } from '../../components/ui/toast';

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
  const { toast } = useToast();

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
            <Button variant="outline" className="gap-2 rounded-xl">
              <Heart className="w-4 h-4 text-[var(--color-accent)]" />
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
        <VendorCard className="overflow-hidden">
          <Table>
            <TableHeader className="bg-[var(--color-bg-card)]">
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Product Interested In</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wishlistItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-[var(--color-border)]">
                        <AvatarImage src={item.user.profile_photo || undefined} />
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-[var(--color-text-heading)]">
                          {item.user.name}
                        </span>
                        <span className="text-[11px] text-[var(--color-text-muted)]">
                          Added {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-body)]">
                      <Mail className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                      {item.user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-page)] relative group">
                        <img 
                          src={item.product?.images?.[0]?.image_path || 'https://via.placeholder.com/40x40?text=Product'} 
                          alt={item.product?.name || 'Product'} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Package className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-[var(--color-text-heading)] line-clamp-1 max-w-[200px]">
                        {item.product?.name || 'Unknown Product'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-2 rounded-lg text-[var(--vendor-accent-action)]">
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
    </div>
  );
}
