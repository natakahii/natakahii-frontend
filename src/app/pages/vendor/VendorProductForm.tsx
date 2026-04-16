import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, UploadCloud, Star, GripVertical, Plus, Trash2, X, Eye } from 'lucide-react';
import { useNavigate } from 'react-router';

export function VendorProductForm() {
  const navigate = useNavigate();
  const [variants, setVariants] = useState<{ color: string, size: string, sku: string, price: string, stock: number }[]>([
    { color: 'Red', size: 'S', sku: 'DRS-RED-S', price: '4500', stock: 5 },
    { color: 'Red', size: 'M', sku: 'DRS-RED-M', price: '4500', stock: 12 },
    { color: 'Blue', size: 'S', sku: 'DRS-BLU-S', price: '4500', stock: 2 },
  ]);

  const images = [
    { id: 1, url: 'https://images.unsplash.com/photo-1550614000-4b95d4ed79ea?w=200&h=200&fit=crop', featured: true },
    { id: 2, url: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200&h=200&fit=crop', featured: false },
    { id: 3, url: 'https://images.unsplash.com/photo-1602164945488-322a0e0a09e4?w=200&h=200&fit=crop', featured: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/vendor/dashboard/products')}>
          <ArrowLeft className="w-5 h-5 text-[var(--color-text-heading)]" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-heading)]">Add New Product</h1>
          <p className="text-[var(--color-text-muted)]">Fill in the details to list your product.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
        
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Basic Info */}
          <Card className="border-[var(--color-border)] shadow-sm" id="basic-info">
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" placeholder="e.g. African Print Maxi Dress" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fashion">Fashion & Apparel</SelectItem>
                    <SelectItem value="home">Home & Living</SelectItem>
                    <SelectItem value="beauty">Beauty & Cosmetics</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <div className="border border-[var(--color-border)] rounded-md">
                  {/* Rich text toolbar mock */}
                  <div className="bg-[var(--color-bg-card)] border-b border-[var(--color-border)] p-2 flex gap-2 rounded-t-md">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 font-bold">B</Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 italic">I</Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 underline">U</Button>
                  </div>
                  <Textarea id="description" placeholder="Describe your product..." className="border-0 focus-visible:ring-0 rounded-t-none min-h-[150px]" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Pricing */}
          <Card className="border-[var(--color-border)] shadow-sm" id="pricing">
            <CardHeader>
              <CardTitle className="text-lg">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Regular Price (KES)</Label>
                <Input id="price" type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-price">Discount Price (KES) <span className="text-[var(--color-text-muted)] font-normal text-xs">(Optional)</span></Label>
                <Input id="sale-price" type="number" placeholder="0.00" />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Inventory */}
          <Card className="border-[var(--color-border)] shadow-sm" id="inventory">
            <CardHeader>
              <CardTitle className="text-lg">Inventory</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" placeholder="PRD-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input id="stock" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="low-stock">Low Stock Alert</Label>
                <Input id="low-stock" type="number" placeholder="5" />
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Variants Builder */}
          <Card className="border-[var(--color-border)] shadow-sm" id="variants">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Variants</CardTitle>
                <CardDescription>Does this product come in multiple variations like size or color?</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Attributes</Label>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-[var(--color-primary-bg)] text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] gap-1 px-3 py-1 border-transparent">
                      Color <X className="w-3 h-3 cursor-pointer" />
                    </Badge>
                    <Badge variant="outline" className="bg-[var(--color-primary-bg)] text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] gap-1 px-3 py-1 border-transparent">
                      Size <X className="w-3 h-3 cursor-pointer" />
                    </Badge>
                    <Button variant="outline" size="sm" className="h-7 text-xs border-dashed border-[var(--color-primary)] text-[var(--color-primary)] gap-1">
                      <Plus className="w-3 h-3" /> Add Attribute
                    </Button>
                  </div>
                </div>

                <div className="border border-[var(--color-border)] rounded-md overflow-hidden">
                  <Table>
                    <TableHeader className="bg-[var(--color-bg-card)]">
                      <TableRow>
                        <TableHead className="w-[80px]">Color</TableHead>
                        <TableHead className="w-[80px]">Size</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="w-[120px]">Price (KES)</TableHead>
                        <TableHead className="w-[100px]">Stock</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variants.map((v, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{v.color}</TableCell>
                          <TableCell className="font-medium">{v.size}</TableCell>
                          <TableCell><Input defaultValue={v.sku} className="h-8 text-sm" /></TableCell>
                          <TableCell><Input defaultValue={v.price} type="number" className="h-8 text-sm" /></TableCell>
                          <TableCell><Input defaultValue={v.stock} type="number" className="h-8 text-sm" /></TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--color-error)]">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Media Upload */}
          <Card className="border-[var(--color-border)] shadow-sm" id="media">
            <CardHeader>
              <CardTitle className="text-lg">Media Upload</CardTitle>
              <CardDescription>Add up to 8 images and 1 video. Drag to reorder.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="border-2 border-dashed border-[var(--color-primary)] bg-[var(--color-primary-bg)]/30 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--color-primary-bg)]/50 transition-colors">
                <div className="w-12 h-12 bg-[var(--color-primary-bg)] rounded-full flex items-center justify-center mb-4">
                  <UploadCloud className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <h4 className="font-semibold text-[var(--color-text-heading)]">Click or drag images to upload</h4>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">JPEG, PNG, WebP up to 5MB</p>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2">
                {images.map((img) => (
                  <div key={img.id} className="relative group w-24 h-24 rounded-lg border border-[var(--color-border)] overflow-hidden shrink-0">
                    <img src={img.url} alt="Upload" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <div className="flex gap-2">
                        <Button size="icon" variant="secondary" className="h-6 w-6 rounded-full shadow-lg">
                          <Star className={`w-3 h-3 ${img.featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </Button>
                        <Button size="icon" variant="destructive" className="h-6 w-6 rounded-full shadow-lg bg-[var(--color-error)] text-white">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    {img.featured && (
                      <div className="absolute top-1 left-1 bg-yellow-400 text-[10px] font-bold px-1.5 rounded-sm">Cover</div>
                    )}
                    <div className="absolute top-1 right-1 cursor-move bg-black/30 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-2 border-dashed border-[var(--color-accent)] bg-[var(--color-accent-bg)]/30 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--color-accent-bg)]/50 transition-colors">
                <h4 className="font-semibold text-[var(--color-text-heading)]">Upload Product Video</h4>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">MP4 or WebM up to 50MB (Recommended for feed)</p>
                <Button variant="outline" size="sm" className="mt-4 border-[var(--color-accent)] text-[var(--color-accent)] bg-white">
                  Browse Video
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* Section 6: Attributes */}
          <Card className="border-[var(--color-border)] shadow-sm" id="attributes">
            <CardHeader>
              <CardTitle className="text-lg">Filterable Attributes</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material">Material</Label>
                <Input id="material" placeholder="e.g. 100% Cotton" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" placeholder="0.5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="origin">Origin</Label>
                <Input id="origin" placeholder="e.g. Made in Kenya" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sticky Right Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card className="border-[var(--color-border)] shadow-sm overflow-hidden">
              <div className="bg-[var(--color-bg-card)] p-4 flex justify-between items-center border-b border-[var(--color-border)]">
                <span className="font-medium text-[var(--color-text-heading)] flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[var(--color-text-muted)]" /> Preview
                </span>
                <Badge variant="outline" className="bg-white text-[var(--color-text-muted)] border-[var(--color-border)]">
                  Draft
                </Badge>
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="aspect-square bg-[var(--color-bg-page)] rounded-lg border border-[var(--color-border)] overflow-hidden flex items-center justify-center">
                  <img src={images[0].url} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--color-text-heading)] truncate">African Print Maxi Dress</h3>
                  <p className="text-[var(--color-accent)] font-bold text-xl mt-1">KES 4,500</p>
                </div>
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">Available Options:</p>
                  <div className="flex gap-2">
                    <span className="w-6 h-6 rounded-full bg-red-600 border border-white shadow-sm ring-1 ring-[var(--color-border)]"></span>
                    <span className="w-6 h-6 rounded-full bg-blue-600 border border-white shadow-sm ring-1 ring-[var(--color-border)]"></span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button size="lg" className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white font-bold text-base h-14">
                Publish Product
              </Button>
              <Button size="lg" variant="outline" className="w-full border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] h-14">
                Save as Draft
              </Button>
            </div>
            
            <p className="text-xs text-center text-[var(--color-text-muted)]">
              By publishing, you agree to our Vendor Quality Standards.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
