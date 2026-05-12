import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  Film,
  ImagePlus,
  Info,
  Plus,
  Save,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { EmptyState } from '../../components/ui/empty-state';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Skeleton } from '../../components/ui/skeleton';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../components/ui/toast';
import { useAuth } from '../../providers/AuthProvider';
import {
  CatalogCategory,
  CatalogProductImage,
  fetchCategories,
} from '../../services/productService';
import {
  VendorProductAttributeOption,
  VendorProductDetailResponse,
  VendorProductStatus,
  createVendorProduct,
  deleteVendorProductMedia,
  fetchVendorProduct,
  fetchVendorProductOptions,
  updateVendorProduct,
  uploadVendorProductMedia,
} from '../../services/vendorProductService';
import { formatCurrency } from '../../utils/currency';
import { getProductPath } from '../../utils/products';
import { getVendorStorefrontPath } from '../../utils/storefront';

const MAX_PRODUCT_IMAGES = 10;
const MAX_PRODUCT_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_PRODUCT_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

function isSupportedProductImage(file: File) {
  const normalizedType = file.type.toLowerCase();
  const normalizedName = file.name.toLowerCase();

  return normalizedType === 'image/jpeg'
    || normalizedType === 'image/png'
    || normalizedType === 'image/webp'
    || SUPPORTED_PRODUCT_IMAGE_EXTENSIONS.some((extension) => normalizedName.endsWith(extension));
}

type ProductFieldErrors = Partial<
  Record<'name' | 'category_id' | 'description' | 'price' | 'discount_price' | 'stock' | 'images' | 'variants' | 'video', string>
>;

type PendingImage = {
  id: string;
  file: File;
  preview: string;
};

type VariantRowState = {
  id: string;
  sku: string;
  price: string;
  discountPrice: string;
  stock: string;
  attributeSelections: Record<string, string>;
};

function flattenCategories(categories: CatalogCategory[], depth = 0): Array<{ id: string; name: string }> {
  return categories.flatMap((category) => [
    {
      id: String(category.id),
      name: `${depth > 0 ? `${'  '.repeat(depth)}- ` : ''}${category.name}`,
    },
    ...flattenCategories(category.children, depth + 1),
  ]);
}

function extractFieldErrors(error: any): ProductFieldErrors {
  const errors = error?.data?.errors;

  if (!errors || typeof errors !== 'object') {
    return {};
  }

  return Object.entries(errors).reduce<ProductFieldErrors>((result, [field, messages]) => {
    if (!Array.isArray(messages) || !messages[0]) {
      return result;
    }

    if (field.startsWith('variants')) {
      result.variants = String(messages[0]);
      return result;
    }

    if (field.startsWith('images') || field.startsWith('keep_image_ids')) {
      result.images = String(messages[0]);
      return result;
    }

    result[field as keyof ProductFieldErrors] = String(messages[0]);
    return result;
  }, {});
}

function buildVariantRowsFromProduct(productResponse: VendorProductDetailResponse['product']): VariantRowState[] {
  return productResponse.variants.map((variant, index) => ({
    id: variant.id ? `variant-${variant.id}` : `variant-${index}`,
    sku: variant.sku || '',
    price: variant.price != null ? String(variant.price) : '',
    discountPrice: variant.discount_price != null ? String(variant.discount_price) : '',
    stock: variant.stock != null ? String(variant.stock) : '0',
    attributeSelections: variant.attribute_values.reduce<Record<string, string>>((selection, attributeValue) => {
      if (attributeValue.attribute?.id && attributeValue.attribute_value?.id) {
        selection[String(attributeValue.attribute.id)] = String(attributeValue.attribute_value.id);
      }

      return selection;
    }, {}),
  }));
}

function buildSelectedAttributeIds(productResponse: VendorProductDetailResponse['product']): number[] {
  const ids = new Set<number>();

  productResponse.variants.forEach((variant) => {
    variant.attribute_values.forEach((attributeValue) => {
      if (attributeValue.attribute?.id) {
        ids.add(attributeValue.attribute.id);
      }
    });
  });

  return Array.from(ids);
}

function formatStatus(status: VendorProductStatus | string | undefined) {
  if (status === 'active') {
    return 'published';
  }

  if (status === 'out_of_stock') {
    return 'out of stock';
  }

  return 'draft';
}

export function VendorProductForm() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const isEditMode = Boolean(productId);
  const { toast } = useToast();
  const { user } = useAuth();
  const previewUrlsRef = useRef<string[]>([]);
  const videoPreviewUrlRef = useRef<string | null>(null);

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [variantAttributes, setVariantAttributes] = useState<VendorProductAttributeOption[]>([]);
  const [existingImages, setExistingImages] = useState<CatalogProductImage[]>([]);
  const [newImages, setNewImages] = useState<PendingImage[]>([]);
  const [socialVideos, setSocialVideos] = useState<VendorProductDetailResponse['social_media']>([]);
  const [selectedVariantAttributeIds, setSelectedVariantAttributeIds] = useState<number[]>([]);
  const [variantRows, setVariantRows] = useState<VariantRowState[]>([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('');
  const [currentStatus, setCurrentStatus] = useState<VendorProductStatus>('draft');
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);
  const [currentProductSlug, setCurrentProductSlug] = useState<string | null>(null);
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [newVideoPreviewUrl, setNewVideoPreviewUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ProductFieldErrors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitMode, setSubmitMode] = useState<VendorProductStatus | null>(null);
  const [deletingMediaId, setDeletingMediaId] = useState<number | null>(null);

  const categoryOptions = useMemo(() => flattenCategories(categories), [categories]);
  const selectedVariantAttributes = useMemo(
    () => variantAttributes.filter((attribute) => selectedVariantAttributeIds.includes(attribute.id)),
    [selectedVariantAttributeIds, variantAttributes],
  );
  const totalImageCount = existingImages.length + newImages.length;
  const previewImage = newImages[0]?.preview || existingImages[0]?.image_path || '/natakahii-logo.png';
  const storefrontPath = getVendorStorefrontPath(user?.vendor);
  const hasStorefront = Boolean(user?.vendor?.shop_slug || user?.vendor?.id);
  const publicProductPath = currentProductId
    ? getProductPath({ id: currentProductId, slug: currentProductSlug })
    : null;

  useEffect(() => {
    previewUrlsRef.current = newImages.map((image) => image.preview);
  }, [newImages]);

  useEffect(() => {
    videoPreviewUrlRef.current = newVideoPreviewUrl;
  }, [newVideoPreviewUrl]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));

      if (videoPreviewUrlRef.current) {
        URL.revokeObjectURL(videoPreviewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    Promise.all([
      fetchCategories(),
      fetchVendorProductOptions(),
      isEditMode && productId ? fetchVendorProduct(productId) : Promise.resolve(null),
    ])
      .then(([categoryData, variantAttributeData, productResponse]) => {
        if (!isMounted) {
          return;
        }

        setCategories(categoryData);
        setVariantAttributes(variantAttributeData);

        if (productResponse) {
          setCurrentProductId(productResponse.product.id);
          setCurrentProductSlug(productResponse.product.slug || null);
          setName(productResponse.product.name);
          setCategoryId(String(productResponse.product.category_id || ''));
          setDescription(productResponse.product.description || '');
          setPrice(String(productResponse.product.price));
          setDiscountPrice(productResponse.product.discount_price != null ? String(productResponse.product.discount_price) : '');
          setStock(String(productResponse.product.stock));
          setCurrentStatus((productResponse.product.status as VendorProductStatus) || 'draft');
          setExistingImages(productResponse.product.images);
          setSocialVideos(productResponse.social_media.filter((media) => media.type === 'video'));
          setSelectedVariantAttributeIds(buildSelectedAttributeIds(productResponse.product));
          setVariantRows(buildVariantRowsFromProduct(productResponse.product));
        }
      })
      .catch((error: any) => {
        if (!isMounted) {
          return;
        }

        setLoadError(error?.message || 'Unable to load the product editor right now.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isEditMode, productId]);

  function clearFieldError(field: keyof ProductFieldErrors) {
    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function addVariantRow() {
    if (selectedVariantAttributeIds.length === 0) {
      setFieldErrors((currentErrors) => ({
        ...currentErrors,
        variants: 'Select at least one variant attribute before adding rows.',
      }));
      return;
    }

    const attributeSelections = selectedVariantAttributeIds.reduce<Record<string, string>>((result, attributeId) => {
      result[String(attributeId)] = '';
      return result;
    }, {});

    setVariantRows((currentRows) => [
      ...currentRows,
      {
        id: `new-${Date.now()}-${currentRows.length}`,
        sku: '',
        price: price || '',
        discountPrice: '',
        stock: stock || '0',
        attributeSelections,
      },
    ]);
    clearFieldError('variants');
  }

  function updateVariantRow(rowId: string, updates: Partial<VariantRowState>) {
    setVariantRows((currentRows) =>
      currentRows.map((row) => row.id === rowId ? { ...row, ...updates } : row)
    );
    clearFieldError('variants');
  }

  function removeVariantRow(rowId: string) {
    setVariantRows((currentRows) => currentRows.filter((row) => row.id !== rowId));
  }

  function toggleVariantAttribute(attributeId: number) {
    const isSelected = selectedVariantAttributeIds.includes(attributeId);
    const nextSelectedIds = isSelected
      ? selectedVariantAttributeIds.filter((id) => id !== attributeId)
      : variantAttributes.filter((attribute) => [...selectedVariantAttributeIds, attributeId].includes(attribute.id)).map((attribute) => attribute.id);

    setSelectedVariantAttributeIds(nextSelectedIds);
    setVariantRows((currentRows) =>
      currentRows.map((row) => {
        const nextSelections = { ...row.attributeSelections };

        if (isSelected) {
          delete nextSelections[String(attributeId)];
        } else {
          nextSelections[String(attributeId)] = nextSelections[String(attributeId)] || '';
        }

        return {
          ...row,
          attributeSelections: nextSelections,
        };
      })
    );

    if (nextSelectedIds.length === 0) {
      setVariantRows([]);
    }

    clearFieldError('variants');
  }

  function handleAddImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (files.length === 0) {
      return;
    }

    const availableSlots = MAX_PRODUCT_IMAGES - totalImageCount;

    if (availableSlots <= 0) {
      toast({
        type: 'warning',
        title: 'Image limit reached',
        message: `You can upload up to ${MAX_PRODUCT_IMAGES} product images.`,
      });
      return;
    }

    let skippedForSlots = 0;
    let skippedForType = 0;
    let skippedForSize = 0;

    const acceptedFiles = files
      .slice(0, availableSlots)
      .reduce<PendingImage[]>((result, file, index) => {
        if (!isSupportedProductImage(file)) {
          skippedForType += 1;
          return result;
        }

        if (file.size > MAX_PRODUCT_IMAGE_SIZE_BYTES) {
          skippedForSize += 1;
          return result;
        }

        result.push({
          id: `image-${Date.now()}-${index}`,
          file,
          preview: URL.createObjectURL(file),
        });

        return result;
      }, []);

    if (files.length > availableSlots) {
      skippedForSlots = files.length - availableSlots;
    }

    if (skippedForSlots > 0 || skippedForType > 0 || skippedForSize > 0) {
      const reasons = [
        skippedForSlots > 0 ? `only ${availableSlots} more image${availableSlots === 1 ? '' : 's'} can be added` : null,
        skippedForType > 0 ? `${skippedForType} file${skippedForType === 1 ? '' : 's'} ${skippedForType === 1 ? 'was' : 'were'} not JPG, PNG, or WebP` : null,
        skippedForSize > 0 ? `${skippedForSize} file${skippedForSize === 1 ? '' : 's'} ${skippedForSize === 1 ? 'was' : 'were'} larger than 5 MB` : null,
      ].filter(Boolean);

      toast({
        type: 'warning',
        title: 'Some images were skipped',
        message: `${reasons.join('. ')}.`,
      });
    }

    if (acceptedFiles.length === 0) {
      return;
    }

    setNewImages((currentImages) => [...currentImages, ...acceptedFiles]);
    clearFieldError('images');
  }

  function removeNewImage(imageId: string) {
    setNewImages((currentImages) => {
      const imageToRemove = currentImages.find((image) => image.id === imageId);

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }

      return currentImages.filter((image) => image.id !== imageId);
    });
  }

  function removeExistingImage(imageId: number) {
    setExistingImages((currentImages) => currentImages.filter((image) => image.id !== imageId));
  }

  function handleVideoSelection(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    event.target.value = '';

    if (!file) {
      return;
    }

    if (newVideoPreviewUrl) {
      URL.revokeObjectURL(newVideoPreviewUrl);
    }

    setNewVideoFile(file);
    setNewVideoPreviewUrl(URL.createObjectURL(file));
    clearFieldError('video');
  }

  async function handleDeleteVideo(mediaId: number) {
    const confirmed = window.confirm('Remove this social commerce video from the product feed?');

    if (!confirmed) {
      return;
    }

    setDeletingMediaId(mediaId);

    try {
      const response = await deleteVendorProductMedia(mediaId);
      setSocialVideos((currentVideos) => currentVideos.filter((video) => video.id !== mediaId));
      toast({
        type: 'success',
        title: 'Video removed',
        message: response.message,
      });
    } catch (error: any) {
      toast({
        type: 'error',
        title: 'Unable to remove video',
        message: error?.message || 'Please try again.',
      });
    } finally {
      setDeletingMediaId(null);
    }
  }

  function validateForm(nextStatus: VendorProductStatus) {
    const nextErrors: ProductFieldErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Product name is required.';
    }

    if (!categoryId) {
      nextErrors.category_id = 'Choose a category for this product.';
    }

    if (!description.trim()) {
      nextErrors.description = 'A product description is required.';
    }

    if (!price || Number(price) < 0) {
      nextErrors.price = 'Enter a valid product price.';
    }

    if (discountPrice && Number(discountPrice) >= Number(price)) {
      nextErrors.discount_price = 'Discount price must be lower than the regular price.';
    }

    if (!stock || Number(stock) < 0) {
      nextErrors.stock = 'Enter a valid stock quantity.';
    }

    const normalizedVariants = selectedVariantAttributeIds.length > 0
      ? variantRows.map((row) => {
          const normalizedAttributes = selectedVariantAttributeIds.map((attributeId) => ({
            attribute_id: attributeId,
            attribute_value_id: Number(row.attributeSelections[String(attributeId)] || 0),
          }));

          return {
            sku: row.sku.trim(),
            price: Number(row.price),
            discount_price: row.discountPrice ? Number(row.discountPrice) : null,
            stock: Number(row.stock),
            attributes: normalizedAttributes,
          };
        })
      : [];

    // Variants are now optional - only validate if variant rows are added
    if (variantRows.length > 0) {
      if (
        normalizedVariants.some((variant) =>
          !variant.sku ||
          Number.isNaN(variant.price) ||
          variant.price < 0 ||
          Number.isNaN(variant.stock) ||
          variant.stock < 0 ||
          variant.attributes.some((attribute) => !attribute.attribute_value_id)
        )
      ) {
        nextErrors.variants = 'Complete every variant row with SKU, price, stock, and attribute values.';
      } else {
        const signatures = normalizedVariants.map((variant) =>
          variant.attributes
            .map((attribute) => `${attribute.attribute_id}:${attribute.attribute_value_id}`)
            .sort()
            .join('|')
        );

        if (new Set(signatures).size !== signatures.length) {
          nextErrors.variants = 'Each variant row must use a unique combination of attribute values.';
        }
      }
    }

    if (nextStatus === 'active' && totalImageCount === 0) {
      nextErrors.images = 'Add at least one product image before publishing live.';
    }

    setFieldErrors(nextErrors);

    return {
      isValid: Object.keys(nextErrors).length === 0,
      normalizedVariants,
    };
  }

  async function handleSubmit(nextStatus: VendorProductStatus) {
    const { isValid, normalizedVariants } = validateForm(nextStatus);

    if (!isValid) {
      toast({
        type: 'error',
        title: 'Please review the product details',
        message: 'Some fields still need attention before this product can be saved.',
      });
      return;
    }

    setSubmitMode(nextStatus);

    try {
      const payload = {
        category_id: Number(categoryId),
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        discount_price: discountPrice ? Number(discountPrice) : null,
        stock: Number(stock),
        status: nextStatus,
        images: newImages.map((image) => image.file),
        keep_image_ids: existingImages.map((image) => image.id),
        variants: normalizedVariants,
      };

      const response = isEditMode && productId
        ? await updateVendorProduct(productId, payload)
        : await createVendorProduct(payload);

      setCurrentProductId(response.product.id);
      setCurrentProductSlug(response.product.slug || null);
      setCurrentStatus((response.product.status as VendorProductStatus) || nextStatus);

      if (newVideoFile) {
        try {
          await uploadVendorProductMedia(response.product.id, {
            file: newVideoFile,
            type: 'video',
            title: videoTitle.trim() || undefined,
            description: videoDescription.trim() || undefined,
          });
        } catch (videoError: any) {
          toast({
            type: 'warning',
            title: 'Product saved, but video upload failed',
            message: videoError?.message || 'You can add the social commerce video again from the editor.',
          });
        }
      }

      toast({
        type: 'success',
        title: isEditMode ? 'Product updated' : 'Product created',
        message: response.message,
      });

      navigate('/vendor/dashboard/products');
    } catch (error: any) {
      setFieldErrors(extractFieldErrors(error));
      toast({
        type: 'error',
        title: isEditMode ? 'Unable to update product' : 'Unable to create product',
        message: error?.message || 'Please review the product data and try again.',
      });
    } finally {
      setSubmitMode(null);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="w-48 h-7" />
            <Skeleton className="w-72 h-4" />
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border-[var(--color-border)] shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="w-48 h-6" />
                  <Skeleton className="w-full h-12" />
                  <Skeleton className="w-full h-36" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-[var(--color-border)] shadow-sm">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="aspect-square rounded-[18px]" />
              <Skeleton className="w-3/4 h-6" />
              <Skeleton className="w-1/2 h-5" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <EmptyState
        variant="products"
        title="Product editor unavailable"
        description={loadError}
        actionLabel="Back to Products"
        actionOnClick={() => navigate('/vendor/dashboard/products')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/vendor/dashboard/products')}>
            <ArrowLeft className="w-5 h-5 text-[var(--color-text-heading)]" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-heading)]">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-[var(--color-text-muted)]">
              Build a real catalog listing with gallery images, inventory details, variants, and optional video-commerce media.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {publicProductPath && currentStatus === 'active' && (
            <Button
              type="button"
              variant="outline"
              className="border-[var(--color-primary)] text-[var(--color-primary)]"
              onClick={() => navigate(publicProductPath)}
            >
              View Public Product
            </Button>
          )}
          {hasStorefront && (
            <Button
              type="button"
              variant="outline"
              className="border-[var(--color-primary)] text-[var(--color-primary)]"
              onClick={() => navigate(storefrontPath)}
            >
              View Storefront
            </Button>
          )}
          <Badge className="capitalize bg-[var(--color-primary-bg)] text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)]">
            {formatStatus(currentStatus)}
          </Badge>
          <Button
            type="button"
            variant="outline"
            className="border-[var(--color-primary)] text-[var(--color-primary)]"
            onClick={() => void handleSubmit('draft')}
            isLoading={submitMode === 'draft'}
          >
            <Save className="w-4 h-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            type="button"
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white"
            onClick={() => void handleSubmit('active')}
            isLoading={submitMode === 'active'}
          >
            {isEditMode ? 'Update Live Product' : 'Publish Product'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-[var(--color-border)] shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
              <CardDescription>These details power your storefront listing and product discovery.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    clearFieldError('name');
                  }}
                  placeholder="e.g. African Print Maxi Dress"
                  error={Boolean(fieldErrors.name)}
                />
                {fieldErrors.name && <p className="text-[12px] font-bold text-[var(--color-error)]">{fieldErrors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={categoryId || undefined}
                  onValueChange={(value) => {
                    setCategoryId(value);
                    clearFieldError('category_id');
                  }}
                >
                  <SelectTrigger aria-invalid={Boolean(fieldErrors.category_id)}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.category_id && <p className="text-[12px] font-bold text-[var(--color-error)]">{fieldErrors.category_id}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="product-description">Description</Label>
                <Textarea
                  id="product-description"
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    clearFieldError('description');
                  }}
                  placeholder="Describe the product, materials, fit, key selling points, and anything buyers should know."
                  className="min-h-[180px]"
                  aria-invalid={Boolean(fieldErrors.description)}
                />
                {fieldErrors.description && <p className="text-[12px] font-bold text-[var(--color-error)]">{fieldErrors.description}</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--color-border)] shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Pricing & Inventory</CardTitle>
              <CardDescription>Set the base listing price, stock, and storefront inventory status.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="product-price">Regular Price (TZS)</Label>
                <Input
                  id="product-price"
                  type="number"
                  min="0"
                  value={price}
                  onChange={(event) => {
                    setPrice(event.target.value);
                    clearFieldError('price');
                  }}
                  placeholder="0"
                  error={Boolean(fieldErrors.price)}
                />
                {fieldErrors.price && <p className="text-[12px] font-bold text-[var(--color-error)]">{fieldErrors.price}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="product-discount">Discount Price (Optional)</Label>
                <Input
                  id="product-discount"
                  type="number"
                  min="0"
                  value={discountPrice}
                  onChange={(event) => {
                    setDiscountPrice(event.target.value);
                    clearFieldError('discount_price');
                  }}
                  placeholder="0"
                  error={Boolean(fieldErrors.discount_price)}
                />
                {fieldErrors.discount_price && <p className="text-[12px] font-bold text-[var(--color-error)]">{fieldErrors.discount_price}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="product-stock">Stock Quantity</Label>
                <Input
                  id="product-stock"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(event) => {
                    setStock(event.target.value);
                    clearFieldError('stock');
                  }}
                  placeholder="0"
                  error={Boolean(fieldErrors.stock)}
                />
                {fieldErrors.stock && <p className="text-[12px] font-bold text-[var(--color-error)]">{fieldErrors.stock}</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[var(--color-border)] shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Product Gallery</CardTitle>
              <CardDescription>These images appear on the storefront product page. The first image becomes the cover image.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <label className="border-2 border-dashed border-[var(--color-primary)] bg-[var(--color-primary-bg)]/30 rounded-[20px] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--color-primary-bg)]/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary-bg)] flex items-center justify-center mb-4">
                  <UploadCloud className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <h3 className="font-semibold text-[var(--color-text-heading)]">Upload Product Images</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  Add up to {MAX_PRODUCT_IMAGES} images. JPEG, PNG, and WebP are supported, up to 5 MB each.
                </p>
                    <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleAddImages} />
              </label>

              {fieldErrors.images && <p className="text-[12px] font-bold text-[var(--color-error)]">{fieldErrors.images}</p>}

              {totalImageCount > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={image.id} className="relative rounded-[18px] border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-card)]">
                      <div className="aspect-square">
                        <ImageWithFallback src={image.image_path} alt={`Existing product image ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute top-2 left-2">
                        {index === 0 && <Badge className="bg-white/90 text-[var(--color-text-heading)] hover:bg-white/90">Cover</Badge>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image.id)}
                        className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 text-[var(--color-error)] flex items-center justify-center shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {newImages.map((image, index) => (
                    <div key={image.id} className="relative rounded-[18px] border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-card)]">
                      <div className="aspect-square">
                        <img src={image.preview} alt={image.file.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute top-2 left-2">
                        {existingImages.length === 0 && index === 0 && <Badge className="bg-white/90 text-[var(--color-text-heading)] hover:bg-white/90">Cover</Badge>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(image.id)}
                        className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 text-[var(--color-error)] flex items-center justify-center shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[18px] border border-dashed border-[var(--color-border)] p-6 text-sm text-[var(--color-text-muted)] text-center">
                  No product images added yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[var(--color-border)] shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Variants</CardTitle>
              <CardDescription>Create color, size, or option-based SKUs when your product has multiple buyable versions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {variantAttributes.length > 0 ? (
                <>
                  <div className="space-y-3">
                    <Label>Variant Attributes</Label>
                    <div className="flex flex-wrap gap-2">
                      {variantAttributes.map((attribute) => {
                        const isSelected = selectedVariantAttributeIds.includes(attribute.id);

                        return (
                          <button
                            key={attribute.id}
                            type="button"
                            onClick={() => toggleVariantAttribute(attribute.id)}
                            className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${
                              isSelected
                                ? 'border-[var(--color-primary)] bg-[var(--color-primary-bg)] text-[var(--color-primary)]'
                                : 'border-[var(--color-border)] text-[var(--color-text-body)] hover:border-[var(--color-primary)]'
                            }`}
                          >
                            {attribute.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedVariantAttributeIds.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-[var(--color-text-muted)]">
                          Add one row for each sellable variant combination you want vendors to manage.
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={addVariantRow}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Variant Row
                        </Button>
                      </div>

                      {fieldErrors.variants && <p className="text-[12px] font-bold text-[var(--color-error)]">{fieldErrors.variants}</p>}

                      {variantRows.length > 0 ? (
                        <div className="space-y-4">
                          {variantRows.map((row, rowIndex) => (
                            <div key={row.id} className="rounded-[18px] border border-[var(--color-border)] p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-[var(--color-text-heading)]">Variant #{rowIndex + 1}</h3>
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeVariantRow(row.id)}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Remove
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedVariantAttributes.map((attribute) => (
                                  <div key={attribute.id} className="space-y-1.5">
                                    <Label>{attribute.name}</Label>
                                    <Select
                                      value={row.attributeSelections[String(attribute.id)] || undefined}
                                      onValueChange={(value) => {
                                        updateVariantRow(row.id, {
                                          attributeSelections: {
                                            ...row.attributeSelections,
                                            [String(attribute.id)]: value,
                                          },
                                        });
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder={`Choose ${attribute.name.toLowerCase()}`} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {attribute.values.map((value) => (
                                          <SelectItem key={value.id} value={String(value.id)}>
                                            {value.value}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                ))}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                  <Label>SKU</Label>
                                  <Input
                                    value={row.sku}
                                    onChange={(event) => updateVariantRow(row.id, { sku: event.target.value })}
                                    placeholder="SKU-RED-M"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label>Price</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={row.price}
                                    onChange={(event) => updateVariantRow(row.id, { price: event.target.value })}
                                    placeholder="0"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label>Discount</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={row.discountPrice}
                                    onChange={(event) => updateVariantRow(row.id, { discountPrice: event.target.value })}
                                    placeholder="0"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <Label>Stock</Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    value={row.stock}
                                    onChange={(event) => updateVariantRow(row.id, { stock: event.target.value })}
                                    placeholder="0"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-[18px] border border-dashed border-[var(--color-border)] p-6 text-sm text-[var(--color-text-muted)] text-center">
                          Variant attributes are selected, but no variant rows exist yet.
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-[18px] border border-dashed border-[var(--color-border)] p-6 text-sm text-[var(--color-text-muted)]">
                      Leave this section empty if the product is sold as one simple item with no option-based SKUs.
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-[18px] border border-dashed border-[var(--color-border)] p-6 text-sm text-[var(--color-text-muted)] text-center">
                  This product will be sold as a single item. Variant options are not enabled for this platform.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[var(--color-border)] shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Social Commerce Media</CardTitle>
              <CardDescription>Attach a short-form product video so this listing can participate in the video feed and seller storytelling flow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 flex items-start gap-3">
                <Film className="w-5 h-5 text-[var(--color-primary)] mt-0.5 shrink-0" />
                <p className="text-sm text-[var(--color-text-body)]">
                  Videos upload after the product itself is saved. That keeps product publishing reliable even if a large video file needs a second step.
                </p>
              </div>

              {socialVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {socialVideos.map((video) => (
                    <div key={video.id} className="rounded-[18px] border border-[var(--color-border)] overflow-hidden bg-[var(--color-bg-card)]">
                      <video src={video.file_path} controls className="w-full aspect-video bg-black" />
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <h3 className="font-semibold text-[var(--color-text-heading)]">{video.title || 'Social commerce video'}</h3>
                            {video.description && <p className="text-sm text-[var(--color-text-muted)] mt-1">{video.description}</p>}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleDeleteVideo(video.id)}
                            isLoading={deletingMediaId === video.id}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[18px] border border-dashed border-[var(--color-border)] p-6 text-sm text-[var(--color-text-muted)] text-center">
                  No social commerce videos have been attached yet.
                </div>
              )}

              <div className="rounded-[20px] border-2 border-dashed border-[var(--color-accent)] bg-[var(--color-accent-bg)]/30 p-6 space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-semibold text-[var(--color-text-heading)]">Upload a Feed Video</h3>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">MP4 or WebM, up to 50MB. Great for demos, styling clips, and short product explainers.</p>
                  </div>
                  <label className="inline-flex items-center gap-2 cursor-pointer rounded-full bg-white border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text-heading)]">
                    <ImagePlus className="w-4 h-4" />
                    Choose Video
                    <input type="file" accept="video/mp4,video/webm,video/*" className="hidden" onChange={handleVideoSelection} />
                  </label>
                </div>

                {newVideoPreviewUrl ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <video src={newVideoPreviewUrl} controls className="w-full aspect-video rounded-[18px] bg-black" />
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="video-title">Video Title (Optional)</Label>
                        <Input
                          id="video-title"
                          value={videoTitle}
                          onChange={(event) => setVideoTitle(event.target.value)}
                          placeholder="Behind the scenes, try-on, quick demo..."
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="video-description">Video Caption (Optional)</Label>
                        <Textarea
                          id="video-description"
                          value={videoDescription}
                          onChange={(event) => setVideoDescription(event.target.value)}
                          placeholder="Tell shoppers what the clip is showing."
                          className="min-h-[140px]"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                {fieldErrors.video && <p className="text-[12px] font-bold text-[var(--color-error)]">{fieldErrors.video}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-1">
          <div className="sticky top-24 space-y-6">
            <Card className="border-[var(--color-border)] shadow-sm overflow-hidden">
              <div className="bg-[var(--color-bg-card)] p-4 flex justify-between items-center border-b border-[var(--color-border)]">
                <span className="font-medium text-[var(--color-text-heading)] flex items-center gap-2">
                  <Info className="w-4 h-4 text-[var(--color-text-muted)]" />
                  Listing Preview
                </span>
                <Badge variant="outline" className="capitalize bg-white text-[var(--color-text-heading)] border-[var(--color-border)]">
                  {formatStatus(currentStatus)}
                </Badge>
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="aspect-square bg-[var(--color-bg-page)] rounded-[18px] border border-[var(--color-border)] overflow-hidden">
                  <ImageWithFallback src={previewImage} alt={name || 'Product preview'} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--color-text-heading)] line-clamp-2">
                    {name || 'Your product name will appear here'}
                  </h3>
                  <p className="text-[var(--color-accent)] font-bold text-xl mt-2">
                    {price ? formatCurrency(Number(price)) : formatCurrency(0)}
                  </p>
                  {discountPrice && Number(discountPrice) < Number(price || 0) ? (
                    <p className="text-sm text-[var(--color-text-muted)] line-through">{formatCurrency(Number(price))}</p>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[16px] border border-[var(--color-border)] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.3px] text-[var(--color-text-muted)]">Stock</p>
                    <p className="text-sm font-bold text-[var(--color-text-heading)] mt-1">{stock || '0'} units</p>
                  </div>
                  <div className="rounded-[16px] border border-[var(--color-border)] p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.3px] text-[var(--color-text-muted)]">Media</p>
                    <p className="text-sm font-bold text-[var(--color-text-heading)] mt-1">
                      {totalImageCount} image{totalImageCount === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>

                {selectedVariantAttributes.length > 0 && (
                  <div className="rounded-[16px] border border-[var(--color-border)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3px] text-[var(--color-text-muted)] mb-2">Variant Setup</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedVariantAttributes.map((attribute) => (
                        <Badge key={attribute.id} variant="outline" className="bg-[var(--color-primary-bg)] text-[var(--color-primary)] border-transparent">
                          {attribute.name}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-3">{variantRows.length} sellable variant row{variantRows.length === 1 ? '' : 's'} configured</p>
                  </div>
                )}

                <div className="rounded-[16px] border border-[var(--color-border)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3px] text-[var(--color-text-muted)] mb-2">Social Commerce</p>
                  <p className="text-sm text-[var(--color-text-body)]">
                    {socialVideos.length + (newVideoFile ? 1 : 0) > 0
                      ? `${socialVideos.length + (newVideoFile ? 1 : 0)} video asset${socialVideos.length + (newVideoFile ? 1 : 0) === 1 ? '' : 's'} ready for the feed.`
                      : 'No video attached yet.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button
                type="button"
                className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white font-bold text-base h-14"
                onClick={() => void handleSubmit('active')}
                isLoading={submitMode === 'active'}
              >
                {isEditMode ? 'Update Live Product' : 'Publish Product'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] h-14"
                onClick={() => void handleSubmit('draft')}
                isLoading={submitMode === 'draft'}
              >
                Save as Draft
              </Button>
            </div>

            <p className="text-xs text-center text-[var(--color-text-muted)]">
              Publishing makes the product available in the live storefront. Social commerce video uploads happen right after the product save finishes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
