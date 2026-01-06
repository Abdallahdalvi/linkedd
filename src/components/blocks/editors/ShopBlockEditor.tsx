import { useState } from 'react';
import { Block } from '@/hooks/useLinkProfile';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ImageUpload from '@/components/ImageUpload';
import { ShoppingBag, Tag, DollarSign, LayoutGrid, Square, Rows3 } from 'lucide-react';

interface ShopBlockEditorProps {
  block?: Partial<Block>;
  onSave: (data: Partial<Block>) => void;
  onCancel: () => void;
}

export default function ShopBlockEditor({ block, onSave, onCancel }: ShopBlockEditorProps) {
  const [form, setForm] = useState({
    title: block?.title || '',
    subtitle: block?.subtitle || '',
    url: block?.url || '',
    thumbnail_url: block?.thumbnail_url || '',
    open_in_new_tab: block?.open_in_new_tab ?? true,
    price: (block?.content as { price?: string })?.price || '',
    currency: (block?.content as { currency?: string })?.currency || 'USD',
    original_price: (block?.content as { original_price?: string })?.original_price || '',
    product_type: (block?.content as { product_type?: string })?.product_type || 'digital',
    badge: (block?.content as { badge?: string })?.badge || '',
    display_style: (block?.content as { display_style?: string })?.display_style || 'card',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type: 'shop',
      title: form.title,
      subtitle: form.subtitle,
      url: form.url,
      thumbnail_url: form.thumbnail_url,
      open_in_new_tab: form.open_in_new_tab,
      content: {
        price: form.price,
        currency: form.currency,
        original_price: form.original_price,
        product_type: form.product_type,
        badge: form.badge,
        display_style: form.display_style,
      },
    });
  };

  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Product Name *</Label>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g., Premium eBook, Handmade Jewelry"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Description</Label>
        <Textarea
          id="subtitle"
          value={form.subtitle}
          onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          placeholder="Brief description of your product..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Product Image</Label>
        <ImageUpload
          currentImageUrl={form.thumbnail_url}
          onUploadComplete={(url) => setForm({ ...form, thumbnail_url: url })}
          folder="products"
          aspectRatio="square"
          className="h-32"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product_type">Product Type</Label>
          <Select
            value={form.product_type}
            onValueChange={(value) => setForm({ ...form, product_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="digital">Digital Product</SelectItem>
              <SelectItem value="physical">Physical Product</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="course">Course</SelectItem>
              <SelectItem value="membership">Membership</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={form.currency}
            onValueChange={(value) => setForm({ ...form, currency: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="INR">INR (₹)</SelectItem>
              <SelectItem value="JPY">JPY (¥)</SelectItem>
              <SelectItem value="CAD">CAD (C$)</SelectItem>
              <SelectItem value="AUD">AUD (A$)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="29.99"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="original_price">Original Price (for discount)</Label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="original_price"
              value={form.original_price}
              onChange={(e) => setForm({ ...form, original_price: e.target.value })}
              placeholder="49.99"
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="badge">Sale Badge (optional)</Label>
        <Input
          id="badge"
          value={form.badge}
          onChange={(e) => setForm({ ...form, badge: e.target.value })}
          placeholder="e.g., 40% OFF, Best Seller, New"
        />
      </div>

      <div className="space-y-2">
        <Label>Display Style</Label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setForm({ ...form, display_style: 'card' })}
            className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1.5 transition-all ${
              form.display_style === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <Rows3 className="w-5 h-5" />
            <span className="text-xs font-medium">Card</span>
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, display_style: 'square' })}
            className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1.5 transition-all ${
              form.display_style === 'square' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <Square className="w-5 h-5" />
            <span className="text-xs font-medium">Square</span>
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, display_style: 'minimal' })}
            className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1.5 transition-all ${
              form.display_style === 'minimal' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-xs font-medium">Minimal</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Purchase Link / Checkout URL *</Label>
        <Input
          id="url"
          type="url"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          placeholder="https://gumroad.com/... or https://yourstore.com/..."
          required
        />
        <p className="text-xs text-muted-foreground">
          Link to your Gumroad, Shopify, Stripe, or any checkout page
        </p>
      </div>

      <div className="flex items-center justify-between py-2">
        <Label htmlFor="new-tab" className="cursor-pointer">Open in new tab</Label>
        <Switch
          id="new-tab"
          checked={form.open_in_new_tab}
          onCheckedChange={(checked) => setForm({ ...form, open_in_new_tab: checked })}
        />
      </div>

      {/* Preview */}
      <div className="p-4 bg-secondary rounded-lg">
        <p className="text-sm font-medium mb-3">Preview ({form.display_style})</p>
        <div className="bg-background rounded-xl border overflow-hidden">
          {form.display_style === 'square' ? (
            <>
              <div className="relative aspect-square max-h-32">
                {form.thumbnail_url ? (
                  <img src={form.thumbnail_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-primary" />
                  </div>
                )}
                {form.badge && (
                  <span className="absolute top-2 left-2 text-[9px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold">
                    {form.badge}
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm">{form.title || 'Product Name'}</p>
                {form.subtitle && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{form.subtitle}</p>}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-primary">{currencySymbols[form.currency] || '$'}{form.price || '0.00'}</span>
                    {form.original_price && (
                      <span className="text-xs text-muted-foreground line-through">{currencySymbols[form.currency] || '$'}{form.original_price}</span>
                    )}
                  </div>
                  <div className="px-2 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">Buy Now</div>
                </div>
              </div>
            </>
          ) : form.display_style === 'minimal' ? (
            <div className="flex items-center gap-3 p-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-4 h-4 text-primary" />
              </div>
              <p className="font-semibold text-sm flex-1 truncate">{form.title || 'Product Name'}</p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-bold text-primary">{currencySymbols[form.currency] || '$'}{form.price || '0.00'}</span>
                {form.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">{form.badge}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3">
              {form.thumbnail_url ? (
                <img src={form.thumbnail_url} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">{form.title || 'Product Name'}</p>
                  {form.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-medium">
                      {form.badge}
                    </span>
                  )}
                </div>
                {form.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">{form.subtitle}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-primary">
                    {currencySymbols[form.currency] || '$'}{form.price || '0.00'}
                  </span>
                  {form.original_price && (
                    <span className="text-xs text-muted-foreground line-through">
                      {currencySymbols[form.currency] || '$'}{form.original_price}
                    </span>
                  )}
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex-shrink-0">
                Buy Now
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!form.title || !form.price || !form.url}>
          {block?.id ? 'Save Changes' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
}
