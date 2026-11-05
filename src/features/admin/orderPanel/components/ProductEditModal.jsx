import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  X,
  Save,
  Loader2,
  ImageIcon,
  FileText,
  Plus,
  Trash2,
  Package,
  Tag,
  Layers,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  Info,
  Eye,
  BarChart2,
  Globe,
  Truck,
  Shield,
  Store,
  Star,
  Gift,
  Zap,
} from 'lucide-react';

const SERVER =
  (typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_SERVER_BASE_URL) ||
  '';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const resolveUrl = (path) => {
  if (!path) return null;
  const clean = path.replace(/\\/g, '/');
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  return `${SERVER}${clean.startsWith('/') ? clean : `/${clean}`}`;
};

const arr2csv = (arr) => (Array.isArray(arr) ? arr.join(', ') : arr || '');
const csv2arr = (str) =>
  (str || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const normalizeForForm = (book) => {
  if (!book) return {};
  const p = book.pricing || {};
  const inv = book.inventory || {};
  const ship = book.shipping || {};
  const wr = book.warranty_and_returns || {};
  const vendor = book.vendor || {};
  const seo = book.seo || {};
  const attr = book.attributes || {};
  const promo = book.promotions || {};
  const tax = p.tax || {};

  return {
    // ── Basic Info
    name: book.basic_info?.name ?? book.title ?? '',
    brand: book.basic_info?.brand ?? book.brand?.name ?? '',
    model: book.basic_info?.model ?? String(book.edition ?? ''),
    sl_no: book.basic_info?.sl_no,
    short_description: book.basic_info?.short_description ?? book.summary ?? '',
    long_description:
      book.basic_info?.long_description ?? book.description ?? '',
    product_type: book.basic_info?.type ?? 'physical',
    condition: book.basic_info?.condition ?? 'new',

    // ── Category
    cat_primary_name:
      book.category?.primary?.name ??
      (typeof book.category === 'string' ? book.category : '') ??
      '',
    cat_primary_slug: book.category?.primary?.slug ?? '',
    cat_secondary_name: book.category?.secondary?.name ?? '',
    cat_secondary_slug: book.category?.secondary?.slug ?? '',
    cat_tertiary_name: book.category?.tertiary?.name ?? '',
    cat_tertiary_slug: book.category?.tertiary?.slug ?? '',

    // ── Status & Visibility
    status: book.status ?? 'draft',
    visibility: book.visibility ?? 'public',

    // ── Pricing
    currency: p.currency ?? 'BDT',
    base_price:
      p.base_price ?? (book.price !== 'TBA' ? (book.price ?? '') : ''),
    sale_price: p.sale_price ?? '',
    cost_price: p.cost_price ?? '',
    is_on_sale: p.is_on_sale ?? false,
    price_is_tba: book.price === 'TBA' && !book.pricing,
    discount_type: p.discount_type ?? 'fixed',
    discount_value: p.discount_value ?? '',
    is_taxable: tax.is_taxable ?? false,
    tax_class: tax.tax_class ?? 'standard',
    tax_rate_percent: tax.tax_rate_percent ?? 0,

    // ── Inventory
    track_inventory: inv.track_inventory ?? true,
    quantity: inv.quantity ?? book.stock ?? 0,
    low_stock_threshold: inv.low_stock_threshold ?? 5,
    allow_backorder: inv.allow_backorder ?? false,

    // ── Attributes
    material: attr.material ?? '',
    weight_grams: attr.weight_grams ?? '',

    // ── Shipping
    is_shippable: ship.is_shippable ?? true,
    is_free_shipping: ship.is_free_shipping ?? false,
    ship_weight_value: ship.weight?.value ?? '',
    ship_weight_unit: ship.weight?.unit ?? 'g',
    ship_length: ship.dimensions?.length ?? '',
    ship_width: ship.dimensions?.width ?? '',
    ship_height: ship.dimensions?.height ?? '',
    ship_dim_unit: ship.dimensions?.unit ?? 'cm',
    shipping_class: ship.shipping_class ?? 'standard',
    requires_signature: ship.requires_signature ?? false,
    fragile: ship.fragile ?? false,
    country_of_origin: ship.country_of_origin ?? '',
    hs_tariff_code: ship.hs_tariff_code ?? '',

    // ── Warranty & Returns
    has_warranty: wr.warranty?.has_warranty ?? false,
    warranty_duration_months: wr.warranty?.duration_months ?? '',
    warranty_type: wr.warranty?.type ?? '',
    warranty_description: wr.warranty?.description ?? '',
    is_returnable: wr.return_policy?.is_returnable ?? false,
    return_window_days: wr.return_policy?.return_window_days ?? '',
    return_condition: wr.return_policy?.return_condition ?? '',
    restocking_fee_percent: wr.return_policy?.restocking_fee_percent ?? 0,

    // ── Vendor
    vendor_id: vendor.vendor_id ?? '',
    vendor_name: vendor.vendor_name ?? '',
    vendor_sku: vendor.vendor_sku ?? '',
    commission_percent: vendor.commission_percent ?? '',

    // ── Taxonomy
    tags: arr2csv(book.tags),
    keywords: arr2csv(book.keywords),

    // ── SEO
    meta_title: seo.meta_title ?? '',
    meta_description: seo.meta_description ?? '',

    // ── Promotions
    eligible_for_coupons: promo.eligible_for_coupons ?? true,
    eligible_for_points: promo.eligible_for_points ?? true,

    // ── Bulk Pricing (field array)
    bulk_pricing: Array.isArray(p.bulk_pricing) ? p.bulk_pricing : [],

    // ── Related Products (comma-separated IDs)
    upsells: arr2csv(book.related_products?.upsells),
    cross_sells: arr2csv(book.related_products?.cross_sells),
    frequently_bought_together: arr2csv(
      book.related_products?.frequently_bought_together,
    ),
  };
};

const buildImageSlots = (book) => {
  const thumb = book.media?.thumbnail?.url ?? book.image ?? null;
  const raw = book.media?.images?.length
    ? book.media.images
    : (book.thumb_images ?? []).map((t, i) => ({
        id: i + 1,
        url: t.url,
        caption: t.caption,
      }));

  const slots = raw
    .filter((img) => img?.url)
    .map((img) => ({
      id: img.id ?? img._id ?? Math.random().toString(36).slice(2),
      url: img.url,
      caption: img.caption ?? img.alt ?? '',
      preview: img.thumbnail?.url,
      replacementFile: null,
      action: 'keep',
    }));
  return { thumb, slots };
};

// ─────────────────────────────────────────────────────────────────────────────
// Design Tokens
// ─────────────────────────────────────────────────────────────────────────────

const cls = {
  input: (dark, err) =>
    [
      'w-full px-3.5 py-2.5 rounded-lg text-[13px] border outline-none transition-all duration-150',
      dark
        ? 'bg-[#1c1c1c] border-white/10 text-white placeholder-white/20 focus:border-indigo-500/50'
        : 'bg-white border-black/10 text-[#111] placeholder-black/25 focus:border-indigo-400 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.08)]',
      err
        ? dark
          ? 'border-red-500/40 bg-red-950/20'
          : 'border-red-400/50 bg-red-50'
        : '',
    ].join(' '),

  textarea: (dark) =>
    [
      'w-full px-3.5 py-2.5 rounded-lg text-[13px] border outline-none transition-all duration-150 resize-none leading-relaxed',
      dark
        ? 'bg-[#1c1c1c] border-white/10 text-white placeholder-white/20 focus:border-indigo-500/50'
        : 'bg-white border-black/10 text-[#111] placeholder-black/25 focus:border-indigo-400',
    ].join(' '),

  select: (dark) =>
    [
      'w-full px-3.5 py-2.5 pr-9 rounded-lg text-[13px] border outline-none transition-all duration-150 appearance-none cursor-pointer',
      dark
        ? 'bg-[#1c1c1c] border-white/10 text-white focus:border-indigo-500/50'
        : 'bg-white border-black/10 text-[#111] focus:border-indigo-400',
    ].join(' '),

  ghost: (dark) =>
    [
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] cursor-pointer',
      'transition-all duration-150 border select-none',
      dark
        ? 'border-white/10 text-white/50 hover:bg-white/5 hover:text-white/75'
        : 'border-black/10 text-black/45 hover:bg-black/5 hover:text-black/65',
    ].join(' '),

  danger: (dark) =>
    [
      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] cursor-pointer border transition-all duration-150',
      dark
        ? 'border-red-500/20 text-red-400/70 hover:bg-red-500/10 hover:text-red-400'
        : 'border-red-200 text-red-500/70 hover:bg-red-50 hover:text-red-600',
    ].join(' '),

  checkRow: (dark) =>
    `flex items-center gap-2.5 cursor-pointer select-none text-[13px] ${dark ? 'text-white/55' : 'text-black/55'}`,

  hint: (dark) =>
    `mt-1 text-[11px] ${dark ? 'text-white/25' : 'text-black/30'}`,
};

// ─────────────────────────────────────────────────────────────────────────────
// Motion
// ─────────────────────────────────────────────────────────────────────────────

const BACKDROP = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.14 } },
};
const MODAL = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 340, damping: 28 },
  },
  exit: { opacity: 0, y: 8, scale: 0.99, transition: { duration: 0.13 } },
};

// ─────────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, title, dark }) => (
  <div
    className={`flex items-center gap-2.5 pb-3 mb-5 border-b ${dark ? 'border-white/[0.07]' : 'border-black/[0.06]'}`}
  >
    <span
      className={`p-1.5 rounded-md ${dark ? 'bg-white/[0.06] text-white/50' : 'bg-black/[0.05] text-black/40'}`}
    >
      <Icon size={13} strokeWidth={2} />
    </span>
    <span
      className={`text-[11px] font-semibold uppercase tracking-[0.1em] ${dark ? 'text-white/38' : 'text-black/35'}`}
    >
      {title}
    </span>
  </div>
);

const FL = ({ children, required, dark }) => (
  <label
    className={`block mb-1.5 text-[12px] font-medium ${dark ? 'text-white/52' : 'text-black/48'}`}
  >
    {children}
    {required && <span className="ml-0.5 text-red-400/80">*</span>}
  </label>
);

const FE = ({ message }) =>
  message ? (
    <p className="flex items-center gap-1 mt-1.5 text-[11px] font-medium text-red-400">
      <AlertCircle size={10} /> {message}
    </p>
  ) : null;

const Sel = ({ children, dark }) => (
  <div className="relative">
    {children}
    <ChevronDown
      size={13}
      className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${dark ? 'text-white/28' : 'text-black/28'}`}
    />
  </div>
);

const Pill = ({ label, value, dark }) =>
  value ? (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] border font-mono ${dark ? 'border-white/8 bg-white/3 text-white/35' : 'border-black/8 bg-black/3 text-black/35'}`}
    >
      <span className="font-sans font-medium">{label}:</span> {value}
    </span>
  ) : null;

const InfoBox = ({ children, dark }) => (
  <div
    className={`flex items-start gap-2 p-3 rounded-lg text-[12px] leading-relaxed ${dark ? 'bg-white/4 text-white/40' : 'bg-black/[0.04] text-black/45'}`}
  >
    <Info size={12} className="mt-0.5 flex-shrink-0" />
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Image Slot Card
// ─────────────────────────────────────────────────────────────────────────────

const ImageSlotCard = ({ slot, dark, onReplace, onDelete }) => {
  const isDeleted = slot.action === 'delete';
  const isReplaced = slot.action === 'replace';
  return (
    <div
      className={`relative group rounded-xl overflow-hidden border transition-all duration-200 ${isDeleted ? (dark ? 'border-red-500/30 opacity-40' : 'border-red-300 opacity-45') : dark ? 'border-white/10 hover:border-white/22' : 'border-black/10 hover:border-black/20'}`}
    >
      <div
        className={`relative aspect-square ${dark ? 'bg-white/5' : 'bg-black/5'}`}
      >
        {slot.preview ? (
          <img
            src={slot.preview}
            alt=""
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <ImageIcon
              size={18}
              className={dark ? 'text-white/20' : 'text-black/20'}
            />
          </div>
        )}
        {isReplaced && (
          <div className="absolute inset-0 flex items-center justify-center bg-indigo-500/25 backdrop-blur-[2px]">
            <span className="text-[9.5px] font-bold text-white bg-indigo-600 px-1.5 py-0.5 rounded-full">
              NEW
            </span>
          </div>
        )}
        {!isDeleted && (
          <div className="absolute inset-0 flex items-end justify-center gap-1.5 p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 via-transparent to-transparent">
            <label className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-white bg-white/20 hover:bg-white/30 cursor-pointer backdrop-blur-sm transition-all">
              <RefreshCw size={9} /> Replace
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) {
                    onReplace(slot.id, f);
                    e.target.value = '';
                  }
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => onDelete(slot.id)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-white bg-red-500/70 hover:bg-red-600/80 backdrop-blur-sm"
            >
              <Trash2 size={9} /> Remove
            </button>
          </div>
        )}
      </div>
      {isDeleted && (
        <button
          type="button"
          onClick={() => onDelete(slot.id)}
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[10px] font-semibold text-red-400"
        >
          <Trash2 size={13} />
          <span>Removed</span>
          <span
            className={`text-[9.5px] underline ${dark ? 'text-white/35' : 'text-black/30'}`}
          >
            Undo
          </span>
        </button>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Tabs
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  'Basic',
  'Category',
  'Pricing',
  'Inventory',
  'Shipping',
  'Warranty',
  'Media',
  'Vendor',
  'SEO',
  'Advanced',
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const ProductEditModal = ({
  isOpen,
  book,
  onClose,
  onSave,
  darkMode: dark = false,
  isUpdating = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm({ defaultValues: normalizeForForm(book) });

  // Bulk pricing field array
  const {
    fields: bulkFields,
    append: bulkAppend,
    remove: bulkRemove,
  } = useFieldArray({ control, name: 'bulk_pricing' });

  const [activeTab, setActiveTab] = useState('Basic');

  // ── Media state ──────────────────────────────────────────────────────────
  const [thumbPreview, setThumbPreview] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbAction, setThumbAction] = useState('keep');
  const [originalThumbUrl, setOriginalThumbUrl] = useState(null);
  const [imageSlots, setImageSlots] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfLabel, setPdfLabel] = useState('');
  const [pdfAction, setPdfAction] = useState('keep');

  // ── Populate on book change ──────────────────────────────────────────────
  useEffect(() => {
    if (!book) return;
    reset(normalizeForForm(book));
    setActiveTab('Basic');

    const { thumb, slots } = buildImageSlots(book);
    const tUrl = thumb;
    setOriginalThumbUrl(tUrl);
    setThumbPreview(tUrl);
    setThumbFile(null);
    setThumbAction('keep');
    setImageSlots(slots);
    setNewImages([]);

    const pdfPath = book.pdfUrl ?? book.media?.documents?.[0]?.url ?? null;
    setPdfLabel(pdfPath ? 'Existing PDF' : '');
    setPdfFile(null);
    setPdfAction('keep');
  }, [book, reset]);

  // ── Thumbnail handlers ───────────────────────────────────────────────────
  const handleThumbChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Cover must be under 5 MB.');
      return;
    }
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
    setThumbAction('replace');
    e.target.value = '';
  }, []);

  const handleThumbRemove = useCallback(() => {
    setThumbFile(null);
    setThumbPreview(null);
    setThumbAction('remove');
  }, []);

  const handleThumbRestore = useCallback(() => {
    setThumbFile(null);
    setThumbPreview(originalThumbUrl);
    setThumbAction('keep');
  }, [originalThumbUrl]);

  // ── Gallery handlers ─────────────────────────────────────────────────────
  const handleSlotReplace = useCallback((id, file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB.');
      return;
    }
    setImageSlots((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              replacementFile: file,
              preview: URL.createObjectURL(file),
              action: 'replace',
            }
          : s,
      ),
    );
  }, []);

  const handleSlotDelete = useCallback((id) => {
    setImageSlots((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (s.action === 'delete')
          return {
            ...s,
            action: s.replacementFile ? 'replace' : 'keep',
            preview: s.replacementFile
              ? URL.createObjectURL(s.replacementFile)
              : s.url,
          };
        return { ...s, action: 'delete', preview: s.url };
      }),
    );
  }, []);

  const handleNewImages = useCallback((e) => {
    const valid = Array.from(e.target.files).filter((f) => {
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} is not an image.`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 5 MB.`);
        return false;
      }
      return true;
    });
    setNewImages((prev) => [
      ...prev,
      ...valid.map((f) => ({ file: f, preview: URL.createObjectURL(f) })),
    ]);
    e.target.value = '';
  }, []);

  const removeNewImage = useCallback(
    (idx) => setNewImages((prev) => prev.filter((_, i) => i !== idx)),
    [],
  );

  // ── PDF handler ──────────────────────────────────────────────────────────
  const handlePdfChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('PDF must be under 50 MB.');
      return;
    }
    setPdfFile(file);
    setPdfLabel(file.name);
    setPdfAction('replace');
    e.target.value = '';
  }, []);

  // ── Submit ───────────────────────────────────────────────────────────────
  const onSubmit = (data) => {
    const fd = new FormData();

    const payload = {
      basic_info: {
        name: data.name?.trim(),
        brand: data.brand?.trim(),
        model: data.model?.trim(),
        sl_no: data.sl_no?.trim(),
        short_description: data.short_description?.trim(),
        long_description: data.long_description?.trim(),
        type: data.product_type,
        condition: data.condition,
      },
      category: {
        primary: {
          name: data.cat_primary_name?.trim(),
          slug:
            data.cat_primary_slug?.trim() ||
            data.cat_primary_name?.toLowerCase().replace(/\s+/g, '-'),
        },
        ...(data.cat_secondary_name?.trim() && {
          secondary: {
            name: data.cat_secondary_name.trim(),
            slug: data.cat_secondary_slug?.trim(),
          },
        }),
        ...(data.cat_tertiary_name?.trim() && {
          tertiary: {
            name: data.cat_tertiary_name.trim(),
            slug: data.cat_tertiary_slug?.trim(),
          },
        }),
      },
      status: data.status,
      visibility: data.visibility,
      pricing: {
        currency: data.currency,
        base_price: data.price_is_tba ? 'TBA' : Number(data.base_price) || 0,
        sale_price: data.sale_price ? Number(data.sale_price) : null,
        cost_price: data.cost_price ? Number(data.cost_price) : null,
        is_on_sale: data.is_on_sale,
        discount_type: data.discount_type,
        discount_value: data.discount_value ? Number(data.discount_value) : 0,
        tax: {
          is_taxable: data.is_taxable,
          tax_class: data.tax_class,
          tax_rate_percent: Number(data.tax_rate_percent) || 0,
        },
        bulk_pricing: (data.bulk_pricing || []).map((b) => ({
          min_qty: Number(b.min_qty),
          max_qty: b.max_qty ? Number(b.max_qty) : null,
          price: Number(b.price),
          discount_percent: b.discount_percent
            ? Number(b.discount_percent)
            : null,
        })),
      },
      inventory: {
        track_inventory: data.track_inventory,
        quantity: Number(data.quantity) || 0,
        low_stock_threshold: Number(data.low_stock_threshold) || 0,
        allow_backorder: data.allow_backorder,
      },
      attributes: {
        material: data.material?.trim(),
        weight_grams: data.weight_grams ? Number(data.weight_grams) : '',
      },
      shipping: {
        is_shippable: data.is_shippable,
        is_free_shipping: data.is_free_shipping,
        weight: {
          value: data.ship_weight_value ? Number(data.ship_weight_value) : null,
          unit: data.ship_weight_unit,
        },
        dimensions: {
          length: data.ship_length ? Number(data.ship_length) : null,
          width: data.ship_width ? Number(data.ship_width) : null,
          height: data.ship_height ? Number(data.ship_height) : null,
          unit: data.ship_dim_unit,
        },
        shipping_class: data.shipping_class,
        requires_signature: data.requires_signature,
        fragile: data.fragile,
        country_of_origin: data.country_of_origin?.trim(),
        hs_tariff_code: data.hs_tariff_code?.trim(),
      },
      warranty_and_returns: {
        warranty: {
          has_warranty: data.has_warranty,
          duration_months: data.warranty_duration_months
            ? Number(data.warranty_duration_months)
            : null,
          type: data.warranty_type?.trim(),
          description: data.warranty_description?.trim(),
        },
        return_policy: {
          is_returnable: data.is_returnable,
          return_window_days: data.return_window_days
            ? Number(data.return_window_days)
            : null,
          return_condition: data.return_condition?.trim(),
          restocking_fee_percent: Number(data.restocking_fee_percent) || 0,
        },
      },
      vendor: {
        vendor_id: data.vendor_id?.trim(),
        vendor_name: data.vendor_name?.trim(),
        vendor_sku: data.vendor_sku?.trim(),
        commission_percent: data.commission_percent
          ? Number(data.commission_percent)
          : null,
      },
      tags: csv2arr(data.tags),
      keywords: csv2arr(data.keywords),
      seo: {
        meta_title: data.meta_title?.trim(),
        meta_description: data.meta_description?.trim(),
      },
      promotions: {
        eligible_for_coupons: data.eligible_for_coupons,
        eligible_for_points: data.eligible_for_points,
      },
      related_products: {
        upsells: csv2arr(data.upsells),
        cross_sells: csv2arr(data.cross_sells),
        frequently_bought_together: csv2arr(data.frequently_bought_together),
      },
      _image_ops: {
        thumbnail: thumbAction,
        images: imageSlots.map((s) => ({
          id: s.id,
          url: s.url,
          public_id: s.public_id || null,
          action: s.action,
        })),
        newImagesCount: newImages.length,
        pdf: pdfAction,
      },
    };

    fd.append('_data', JSON.stringify(payload));

    // ==========================================================================
    // FILE APPENDING (মাল্টার কনফিগারেশন ম্যাচিং)
    // ==========================================================================

    // ১. থাম্বনেইল ফাইল
    if (thumbFile && thumbAction === 'replace') {
      fd.append('thumbnail', thumbFile);
    }

    // ২. গ্যালারি ইমেজেস (ফিল্ডের নাম 'images')
    imageSlots
      .filter((s) => s.action === 'replace' && s.replacementFile)
      .forEach((s) => fd.append('images', s.replacementFile));

    // নতুন মাল্টিপল ইমেজ যুক্ত করা
    newImages.forEach((e) => {
      if (e.file) fd.append('images', e.file);
    });

    // ৩. ডকুমেন্ট/পিডিএফ ফাইল (ফিল্ডের নাম 'documents')
    if (pdfFile && pdfAction === 'replace') {
      fd.append('documents', pdfFile);
    }

    onSave(fd);
  };

  const priceIsTba = watch('price_is_tba');
  const isOnSale = watch('is_on_sale');
  const hasWarranty = watch('has_warranty');
  const isReturnable = watch('is_returnable');
  const isShippable = watch('is_shippable');
  const isTaxable = watch('is_taxable');

  const tabHasError = useMemo(
    () => ({
      Basic: !!(errors.name || errors.brand),
      Pricing: !!(errors.base_price || errors.sale_price || errors.quantity),
      Inventory: !!errors.quantity,
      Category: false,
      Shipping: false,
      Warranty: false,
      Media: false,
      Vendor: false,
      SEO: false,
      Advanced: false,
    }),
    [errors],
  );

  const border = dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)';
  const surface = dark ? '#141414' : '#f9f9f9';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          variants={BACKDROP}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: dark ? 'rgba(0,0,0,0.78)' : 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            key="modal"
            variants={MODAL}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative flex flex-col w-full max-w-2xl"
            style={{
              maxHeight: 'calc(100dvh - 32px)',
              borderRadius: 14,
              border: `1px solid ${border}`,
              boxShadow: dark
                ? '0 32px 80px rgba(0,0,0,0.78), 0 2px 0 rgba(255,255,255,0.04) inset'
                : '0 24px 64px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.9) inset',
              background: surface,
              overflow: 'hidden',
            }}
          >
            {/* ══ Header ══════════════════════════════════════════════════ */}
            <div
              className="flex items-center justify-between flex-shrink-0 px-6 py-4"
              style={{
                borderBottom: `1px solid ${border}`,
                background: dark
                  ? 'rgba(255,255,255,0.02)'
                  : 'rgba(255,255,255,0.8)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${dark ? 'bg-white/7' : 'bg-black/6'}`}
                >
                  <Package
                    size={16}
                    className={dark ? 'text-white/60' : 'text-black/50'}
                  />
                </div>
                <div>
                  <h2
                    className={`text-[15px] font-semibold leading-none ${dark ? 'text-white/90' : 'text-[#111]'}`}
                  >
                    Edit Product
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <Pill label="SKU" value={book?.sku} dark={dark} />
                    <Pill label="slug" value={book?.slug} dark={dark} />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${dark ? 'hover:bg-white/8 text-white/35' : 'hover:bg-black/7 text-black/35'}`}
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>

            {/* ══ Tabs ═════════════════════════════════════════════════════ */}
            <div
              className="flex items-center gap-0.5 px-4 py-2 flex-shrink-0 overflow-x-auto scrollbar-hide"
              style={{
                borderBottom: `1px solid ${border}`,
                background: dark ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.02)',
              }}
            >
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={[
                    'relative px-3 py-1.5 rounded-md text-[12px] font-medium transition-all duration-150 whitespace-nowrap flex-shrink-0',
                    activeTab === tab
                      ? dark
                        ? 'bg-white/10 text-white'
                        : 'bg-black/8 text-black'
                      : dark
                        ? 'text-white/38 hover:text-white/60 hover:bg-white/5'
                        : 'text-black/38 hover:text-black/60 hover:bg-black/5',
                  ].join(' ')}
                >
                  {tab}
                  {tabHasError[tab] && (
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* ══ Scrollable Body ══════════════════════════════════════════ */}
            <div className="flex-1 overflow-y-auto">
              <form
                id="product-edit-form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                <div className="px-6 py-6">
                  {/* ─────────── TAB: Basic ─────────────────────────────── */}
                  {activeTab === 'Basic' && (
                    <div className="space-y-8">
                      <section>
                        <SectionHeader
                          icon={Tag}
                          title="Basic Information"
                          dark={dark}
                        />
                        <div className="space-y-4">
                          <div>
                            <FL required dark={dark}>
                              Product Name
                            </FL>
                            <input
                              {...register('name', {
                                required: 'Name is required',
                                validate: (v) =>
                                  v?.trim() !== '' || 'Cannot be blank',
                              })}
                              placeholder="Product name…"
                              className={cls.input(dark, !!errors.name)}
                            />
                            <FE message={errors.name?.message} />
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <FL required dark={dark}>
                                Brand / Author
                              </FL>
                              <input
                                {...register('brand', {
                                  required: 'Brand is required',
                                })}
                                placeholder="Brand or author name…"
                                className={cls.input(dark, !!errors.brand)}
                              />
                              <FE message={errors.brand?.message} />
                            </div>
                            <div>
                              <FL dark={dark}>Model / Edition</FL>
                              <input
                                {...register('model')}
                                placeholder="e.g. 2025, v2, fx-991CW…"
                                className={cls.input(dark)}
                              />
                            </div>
                            <div>
                              <FL dark={dark}>SL NO</FL>
                              <input
                                {...register('sl_no')}
                                placeholder="e.g. SL NO"
                                className={cls.input(dark)}
                              />
                            </div>
                            <div>
                              <FL dark={dark}>Product Type</FL>
                              <Sel dark={dark}>
                                <select
                                  {...register('product_type')}
                                  className={cls.select(dark)}
                                >
                                  <option value="physical">Physical</option>
                                  <option value="digital">Digital</option>
                                  <option value="service">Service</option>
                                </select>
                              </Sel>
                            </div>
                            <div>
                              <FL dark={dark}>Condition</FL>
                              <Sel dark={dark}>
                                <select
                                  {...register('condition')}
                                  className={cls.select(dark)}
                                >
                                  <option value="new">New</option>
                                  <option value="used">Used</option>
                                  <option value="refurbished">
                                    Refurbished
                                  </option>
                                </select>
                              </Sel>
                            </div>
                          </div>
                          <div>
                            <FL dark={dark}>Short Description</FL>
                            <input
                              {...register('short_description')}
                              placeholder="One-line summary…"
                              className={cls.input(dark)}
                            />
                          </div>
                          <div>
                            <FL dark={dark}>Full Description</FL>
                            <textarea
                              {...register('long_description')}
                              rows={5}
                              placeholder="Detailed product description… (supports markdown)"
                              className={cls.textarea(dark)}
                            />
                          </div>
                        </div>
                      </section>

                      <section>
                        <SectionHeader
                          icon={Eye}
                          title="Status & Visibility"
                          dark={dark}
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <FL dark={dark}>Status</FL>
                            <Sel dark={dark}>
                              <select
                                {...register('status')}
                                className={cls.select(dark)}
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="draft">Draft</option>
                                <option value="archived">Archived</option>
                              </select>
                            </Sel>
                          </div>
                          <div>
                            <FL dark={dark}>Visibility</FL>
                            <Sel dark={dark}>
                              <select
                                {...register('visibility')}
                                className={cls.select(dark)}
                              >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                                <option value="hidden">Hidden</option>
                              </select>
                            </Sel>
                          </div>
                        </div>
                      </section>

                      <section>
                        <SectionHeader
                          icon={Tag}
                          title="Tags & Keywords"
                          dark={dark}
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <FL dark={dark}>Tags</FL>
                            <input
                              {...register('tags')}
                              placeholder="tag1, tag2, tag3…"
                              className={cls.input(dark)}
                            />
                            <p className={cls.hint(dark)}>Comma-separated</p>
                          </div>
                          <div>
                            <FL dark={dark}>Keywords</FL>
                            <input
                              {...register('keywords')}
                              placeholder="keyword1, keyword2…"
                              className={cls.input(dark)}
                            />
                            <p className={cls.hint(dark)}>Comma-separated</p>
                          </div>
                        </div>
                      </section>

                      <section>
                        <SectionHeader
                          icon={Package}
                          title="Attributes"
                          dark={dark}
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <FL dark={dark}>Material</FL>
                            <input
                              {...register('material')}
                              placeholder="e.g. Plastic, Metal…"
                              className={cls.input(dark)}
                            />
                          </div>
                          <div>
                            <FL dark={dark}>Weight (grams)</FL>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              {...register('weight_grams')}
                              placeholder="e.g. 150"
                              className={`${cls.input(dark)} tabular-nums`}
                            />
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* ─────────── TAB: Category ──────────────────────────── */}
                  {activeTab === 'Category' && (
                    <section>
                      <SectionHeader
                        icon={Layers}
                        title="Category Hierarchy"
                        dark={dark}
                      />
                      <div className="space-y-5">
                        <div>
                          <p
                            className={`text-[12px] font-semibold mb-3 ${dark ? 'text-white/40' : 'text-black/40'}`}
                          >
                            Primary
                          </p>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <FL dark={dark}>Category Name</FL>
                              <input
                                {...register('cat_primary_name')}
                                placeholder="e.g. Electronics…"
                                className={cls.input(dark)}
                              />
                            </div>
                            <div>
                              <FL dark={dark}>Slug</FL>
                              <input
                                {...register('cat_primary_slug')}
                                placeholder="auto-generated if blank"
                                className={cls.input(dark)}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <p
                            className={`text-[12px] font-semibold mb-3 ${dark ? 'text-white/40' : 'text-black/40'}`}
                          >
                            Secondary (optional)
                          </p>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <FL dark={dark}>Category Name</FL>
                              <input
                                {...register('cat_secondary_name')}
                                placeholder="Sub-category…"
                                className={cls.input(dark)}
                              />
                            </div>
                            <div>
                              <FL dark={dark}>Slug</FL>
                              <input
                                {...register('cat_secondary_slug')}
                                placeholder="auto-generated if blank"
                                className={cls.input(dark)}
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <p
                            className={`text-[12px] font-semibold mb-3 ${dark ? 'text-white/40' : 'text-black/40'}`}
                          >
                            Tertiary (optional)
                          </p>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <FL dark={dark}>Category Name</FL>
                              <input
                                {...register('cat_tertiary_name')}
                                placeholder="Sub-sub-category…"
                                className={cls.input(dark)}
                              />
                            </div>
                            <div>
                              <FL dark={dark}>Slug</FL>
                              <input
                                {...register('cat_tertiary_slug')}
                                placeholder="auto-generated if blank"
                                className={cls.input(dark)}
                              />
                            </div>
                          </div>
                        </div>
                        <InfoBox dark={dark}>
                          Secondary and tertiary categories are optional. Only
                          fill if your product belongs to a sub-category.
                        </InfoBox>
                      </div>
                    </section>
                  )}

                  {/* ─────────── TAB: Pricing ───────────────────────────── */}
                  {activeTab === 'Pricing' && (
                    <div className="space-y-8">
                      <section>
                        <SectionHeader
                          icon={BarChart2}
                          title="Pricing"
                          dark={dark}
                        />
                        <div className="space-y-5">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <FL dark={dark}>Currency</FL>
                              <Sel dark={dark}>
                                <select
                                  {...register('currency')}
                                  className={cls.select(dark)}
                                >
                                  <option value="BDT">
                                    BDT – Bangladeshi Taka
                                  </option>
                                  <option value="USD">USD – US Dollar</option>
                                  <option value="EUR">EUR – Euro</option>
                                  <option value="GBP">
                                    GBP – British Pound
                                  </option>
                                </select>
                              </Sel>
                            </div>
                            <div className="flex items-end pb-1">
                              <label className={cls.checkRow(dark)}>
                                <Controller
                                  name="price_is_tba"
                                  control={control}
                                  render={({ field }) => (
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      className="w-4 h-4 rounded accent-indigo-500"
                                    />
                                  )}
                                />
                                Mark price as TBA
                              </label>
                            </div>
                          </div>

                          {priceIsTba ? (
                            <div
                              className="flex items-center justify-center py-4 rounded-xl text-[14px] font-bold tracking-[0.3em] opacity-40"
                              style={{
                                border: `1px dashed ${dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                                color: dark ? '#fff' : '#111',
                              }}
                            >
                              TBA
                            </div>
                          ) : (
                            <div className="grid gap-4 md:grid-cols-3">
                              <div>
                                <FL required dark={dark}>
                                  Base Price
                                </FL>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...register('base_price', {
                                    required:
                                      !priceIsTba && 'Base price is required',
                                    min: { value: 0, message: 'Must be ≥ 0' },
                                  })}
                                  placeholder="0.00"
                                  className={`${cls.input(dark, !!errors.base_price)} tabular-nums`}
                                />
                                <FE message={errors.base_price?.message} />
                              </div>
                              <div>
                                <FL dark={dark}>Sale Price</FL>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...register('sale_price', {
                                    validate: (v) => {
                                      if (!v || v === '') return true;
                                      const base = Number(watch('base_price'));
                                      if (Number(v) >= base)
                                        return 'Must be less than base price';
                                      return true;
                                    },
                                  })}
                                  placeholder="Optional…"
                                  className={`${cls.input(dark, !!errors.sale_price)} tabular-nums`}
                                />
                                <FE message={errors.sale_price?.message} />
                              </div>
                              <div>
                                <FL dark={dark}>Cost Price</FL>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  {...register('cost_price')}
                                  placeholder="Internal cost…"
                                  className={`${cls.input(dark)} tabular-nums`}
                                />
                              </div>
                            </div>
                          )}

                          {!priceIsTba && (
                            <>
                              <label className={cls.checkRow(dark)}>
                                <Controller
                                  name="is_on_sale"
                                  control={control}
                                  render={({ field }) => (
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      className="w-4 h-4 rounded accent-indigo-500"
                                    />
                                  )}
                                />
                                Mark product as &quot;On Sale&quot;
                              </label>

                              {isOnSale && (
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <FL dark={dark}>Discount Type</FL>
                                    <Sel dark={dark}>
                                      <select
                                        {...register('discount_type')}
                                        className={cls.select(dark)}
                                      >
                                        <option value="fixed">
                                          Fixed Amount
                                        </option>
                                        <option value="percentage">
                                          Percentage (%)
                                        </option>
                                      </select>
                                    </Sel>
                                  </div>
                                  <div>
                                    <FL dark={dark}>Discount Value</FL>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      {...register('discount_value', {
                                        validate: (v) => {
                                          if (!v || v === '') return true;
                                          const base = Number(
                                            watch('base_price'),
                                          );
                                          const type = watch('discount_type');
                                          if (
                                            type === 'fixed' &&
                                            Number(v) >= base
                                          )
                                            return 'Discount must be less than base price';
                                          if (
                                            type === 'percentage' &&
                                            Number(v) > 100
                                          )
                                            return 'Percentage cannot exceed 100%';
                                          return true;
                                        },
                                      })}
                                      placeholder="e.g. 10"
                                      className={`${cls.input(dark, !!errors.discount_value)} tabular-nums`}
                                    />
                                    <FE
                                      message={errors.discount_value?.message}
                                    />
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </section>

                      <section>
                        <SectionHeader
                          icon={BarChart2}
                          title="Tax"
                          dark={dark}
                        />
                        <div className="space-y-4">
                          <label className={cls.checkRow(dark)}>
                            <Controller
                              name="is_taxable"
                              control={control}
                              render={({ field }) => (
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4 rounded accent-indigo-500"
                                />
                              )}
                            />
                            This product is taxable
                          </label>
                          {isTaxable && (
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <FL dark={dark}>Tax Class</FL>
                                <Sel dark={dark}>
                                  <select
                                    {...register('tax_class')}
                                    className={cls.select(dark)}
                                  >
                                    <option value="standard">Standard</option>
                                    <option value="reduced">Reduced</option>
                                    <option value="zero">Zero</option>
                                  </select>
                                </Sel>
                              </div>
                              <div>
                                <FL dark={dark}>Tax Rate (%)</FL>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="100"
                                  {...register('tax_rate_percent')}
                                  placeholder="0"
                                  className={`${cls.input(dark)} tabular-nums`}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </section>

                      <section>
                        <div className="flex items-center justify-between mb-5">
                          <SectionHeader
                            icon={BarChart2}
                            title="Bulk Pricing"
                            dark={dark}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              bulkAppend({
                                min_qty: '',
                                max_qty: '',
                                price: '',
                                discount_percent: '',
                              })
                            }
                            className={cls.ghost(dark)}
                          >
                            <Plus size={12} /> Add Tier
                          </button>
                        </div>
                        {bulkFields.length === 0 ? (
                          <InfoBox dark={dark}>
                            No bulk pricing tiers defined. Add tiers to offer
                            volume discounts.
                          </InfoBox>
                        ) : (
                          <div className="space-y-3">
                            {bulkFields.map((field, idx) => (
                              <div
                                key={field.id}
                                className={`grid gap-2 p-3 rounded-xl border ${dark ? 'border-white/8 bg-white/2' : 'border-black/8 bg-black/2'}`}
                                style={{
                                  gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                                }}
                              >
                                <div>
                                  <FL dark={dark}>Min Qty</FL>
                                  <input
                                    type="number"
                                    min="1"
                                    {...register(`bulk_pricing.${idx}.min_qty`)}
                                    placeholder="1"
                                    className={`${cls.input(dark)} tabular-nums`}
                                  />
                                </div>
                                <div>
                                  <FL dark={dark}>Max Qty</FL>
                                  <input
                                    type="number"
                                    min="1"
                                    {...register(`bulk_pricing.${idx}.max_qty`)}
                                    placeholder="∞"
                                    className={`${cls.input(dark)} tabular-nums`}
                                  />
                                </div>
                                <div>
                                  <FL dark={dark}>Price</FL>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register(`bulk_pricing.${idx}.price`)}
                                    placeholder="0.00"
                                    className={`${cls.input(dark)} tabular-nums`}
                                  />
                                </div>
                                <div>
                                  <FL dark={dark}>Discount %</FL>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    {...register(
                                      `bulk_pricing.${idx}.discount_percent`,
                                    )}
                                    placeholder="0"
                                    className={`${cls.input(dark)} tabular-nums`}
                                  />
                                </div>
                                <div className="flex items-end pb-0.5">
                                  <button
                                    type="button"
                                    onClick={() => bulkRemove(idx)}
                                    className={cls.danger(dark)}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    </div>
                  )}

                  {/* ─────────── TAB: Inventory ─────────────────────────── */}
                  {activeTab === 'Inventory' && (
                    <section>
                      <SectionHeader
                        icon={Package}
                        title="Inventory Management"
                        dark={dark}
                      />
                      <div className="space-y-5">
                        <label className={cls.checkRow(dark)}>
                          <Controller
                            name="track_inventory"
                            control={control}
                            render={({ field }) => (
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="w-4 h-4 rounded accent-indigo-500"
                              />
                            )}
                          />
                          Track inventory for this product
                        </label>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <FL required dark={dark}>
                              Quantity in Stock
                            </FL>
                            <input
                              type="number"
                              min="0"
                              {...register('quantity', {
                                required: 'Quantity is required',
                                min: { value: 0, message: 'Must be ≥ 0' },
                              })}
                              placeholder="0"
                              className={`${cls.input(dark, !!errors.quantity)} tabular-nums`}
                            />
                            <FE message={errors.quantity?.message} />
                          </div>
                          <div>
                            <FL dark={dark}>Low Stock Threshold</FL>
                            <input
                              type="number"
                              min="0"
                              {...register('low_stock_threshold')}
                              placeholder="5"
                              className={`${cls.input(dark)} tabular-nums`}
                            />
                            <p className={cls.hint(dark)}>
                              Alert when stock falls below this number
                            </p>
                          </div>
                        </div>
                        <label className={cls.checkRow(dark)}>
                          <Controller
                            name="allow_backorder"
                            control={control}
                            render={({ field }) => (
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="w-4 h-4 rounded accent-indigo-500"
                              />
                            )}
                          />
                          Allow backorders when out of stock
                        </label>
                      </div>
                    </section>
                  )}

                  {/* ─────────── TAB: Shipping ──────────────────────────── */}
                  {activeTab === 'Shipping' && (
                    <section>
                      <SectionHeader
                        icon={Truck}
                        title="Shipping"
                        dark={dark}
                      />
                      <div className="space-y-5">
                        <div className="flex flex-wrap gap-6">
                          <label className={cls.checkRow(dark)}>
                            <Controller
                              name="is_shippable"
                              control={control}
                              render={({ field }) => (
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4 rounded accent-indigo-500"
                                />
                              )}
                            />
                            This product requires shipping
                          </label>
                          <label className={cls.checkRow(dark)}>
                            <Controller
                              name="is_free_shipping"
                              control={control}
                              render={({ field }) => (
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4 rounded accent-indigo-500"
                                />
                              )}
                            />
                            Free shipping
                          </label>
                        </div>

                        {isShippable && (
                          <>
                            <div>
                              <p
                                className={`text-[12px] font-semibold mb-3 ${dark ? 'text-white/40' : 'text-black/40'}`}
                              >
                                Weight
                              </p>
                              <div className="grid gap-3 md:grid-cols-3">
                                <div className="md:col-span-2">
                                  <FL dark={dark}>Value</FL>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register('ship_weight_value')}
                                    placeholder="0"
                                    className={`${cls.input(dark)} tabular-nums`}
                                  />
                                </div>
                                <div>
                                  <FL dark={dark}>Unit</FL>
                                  <Sel dark={dark}>
                                    <select
                                      {...register('ship_weight_unit')}
                                      className={cls.select(dark)}
                                    >
                                      <option value="g">g</option>
                                      <option value="kg">kg</option>
                                      <option value="lb">lb</option>
                                      <option value="oz">oz</option>
                                    </select>
                                  </Sel>
                                </div>
                              </div>
                            </div>

                            <div>
                              <p
                                className={`text-[12px] font-semibold mb-3 ${dark ? 'text-white/40' : 'text-black/40'}`}
                              >
                                Dimensions
                              </p>
                              <div className="grid gap-3 md:grid-cols-4">
                                <div>
                                  <FL dark={dark}>Length</FL>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register('ship_length')}
                                    placeholder="0"
                                    className={`${cls.input(dark)} tabular-nums`}
                                  />
                                </div>
                                <div>
                                  <FL dark={dark}>Width</FL>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register('ship_width')}
                                    placeholder="0"
                                    className={`${cls.input(dark)} tabular-nums`}
                                  />
                                </div>
                                <div>
                                  <FL dark={dark}>Height</FL>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...register('ship_height')}
                                    placeholder="0"
                                    className={`${cls.input(dark)} tabular-nums`}
                                  />
                                </div>
                                <div>
                                  <FL dark={dark}>Unit</FL>
                                  <Sel dark={dark}>
                                    <select
                                      {...register('ship_dim_unit')}
                                      className={cls.select(dark)}
                                    >
                                      <option value="cm">cm</option>
                                      <option value="mm">mm</option>
                                      <option value="in">in</option>
                                    </select>
                                  </Sel>
                                </div>
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <FL dark={dark}>Shipping Class</FL>
                                <Sel dark={dark}>
                                  <select
                                    {...register('shipping_class')}
                                    className={cls.select(dark)}
                                  >
                                    <option value="standard">Standard</option>
                                    <option value="express">Express</option>
                                    <option value="heavy">
                                      Heavy / Freight
                                    </option>
                                    <option value="fragile">Fragile</option>
                                    <option value="digital">Digital</option>
                                  </select>
                                </Sel>
                              </div>
                              <div>
                                <FL dark={dark}>Country of Origin</FL>
                                <input
                                  {...register('country_of_origin')}
                                  placeholder="e.g. China / Thailand…"
                                  className={cls.input(dark)}
                                />
                              </div>
                              <div>
                                <FL dark={dark}>HS Tariff Code</FL>
                                <input
                                  {...register('hs_tariff_code')}
                                  placeholder="e.g. 8470.10.00"
                                  className={cls.input(dark)}
                                />
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-6">
                              <label className={cls.checkRow(dark)}>
                                <Controller
                                  name="requires_signature"
                                  control={control}
                                  render={({ field }) => (
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      className="w-4 h-4 rounded accent-indigo-500"
                                    />
                                  )}
                                />
                                Requires signature on delivery
                              </label>
                              <label className={cls.checkRow(dark)}>
                                <Controller
                                  name="fragile"
                                  control={control}
                                  render={({ field }) => (
                                    <input
                                      type="checkbox"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      className="w-4 h-4 rounded accent-indigo-500"
                                    />
                                  )}
                                />
                                Fragile item
                              </label>
                            </div>
                          </>
                        )}
                      </div>
                    </section>
                  )}

                  {/* ─────────── TAB: Warranty ──────────────────────────── */}
                  {activeTab === 'Warranty' && (
                    <div className="space-y-8">
                      <section>
                        <SectionHeader
                          icon={Shield}
                          title="Warranty"
                          dark={dark}
                        />
                        <div className="space-y-4">
                          <label className={cls.checkRow(dark)}>
                            <Controller
                              name="has_warranty"
                              control={control}
                              render={({ field }) => (
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4 rounded accent-indigo-500"
                                />
                              )}
                            />
                            This product has a warranty
                          </label>
                          {hasWarranty && (
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <FL dark={dark}>Duration (months)</FL>
                                <input
                                  type="number"
                                  min="0"
                                  {...register('warranty_duration_months')}
                                  placeholder="e.g. 12"
                                  className={`${cls.input(dark)} tabular-nums`}
                                />
                              </div>
                              <div>
                                <FL dark={dark}>Warranty Type</FL>
                                <input
                                  {...register('warranty_type')}
                                  placeholder="e.g. Manufacturer, Limited…"
                                  className={cls.input(dark)}
                                />
                              </div>
                              <div className="md:col-span-2">
                                <FL dark={dark}>Warranty Description</FL>
                                <textarea
                                  {...register('warranty_description')}
                                  rows={3}
                                  placeholder="Warranty terms and conditions…"
                                  className={cls.textarea(dark)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </section>

                      <section>
                        <SectionHeader
                          icon={RefreshCw}
                          title="Return Policy"
                          dark={dark}
                        />
                        <div className="space-y-4">
                          <label className={cls.checkRow(dark)}>
                            <Controller
                              name="is_returnable"
                              control={control}
                              render={({ field }) => (
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4 rounded accent-indigo-500"
                                />
                              )}
                            />
                            This product is returnable
                          </label>
                          {isReturnable && (
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <FL dark={dark}>Return Window (days)</FL>
                                <input
                                  type="number"
                                  min="0"
                                  {...register('return_window_days')}
                                  placeholder="e.g. 7"
                                  className={`${cls.input(dark)} tabular-nums`}
                                />
                              </div>
                              <div>
                                <FL dark={dark}>Restocking Fee (%)</FL>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="100"
                                  {...register('restocking_fee_percent')}
                                  placeholder="0"
                                  className={`${cls.input(dark)} tabular-nums`}
                                />
                              </div>
                              <div className="md:col-span-2">
                                <FL dark={dark}>Return Condition</FL>
                                <input
                                  {...register('return_condition')}
                                  placeholder="e.g. Unopened, original packaging…"
                                  className={cls.input(dark)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </section>
                    </div>
                  )}

                  {/* ─────────── TAB: Media ─────────────────────────────── */}
                  {activeTab === 'Media' && (
                    <div className="space-y-8">
                      {/* Thumbnail */}
                      <section>
                        <SectionHeader
                          icon={ImageIcon}
                          title="Cover / Thumbnail"
                          dark={dark}
                        />
                        <div
                          className="flex items-center gap-4 p-4 rounded-xl"
                          style={{
                            border: `1px solid ${border}`,
                            background: dark
                              ? 'rgba(255,255,255,0.02)'
                              : 'rgba(0,0,0,0.02)',
                          }}
                        >
                          <div
                            className="flex-shrink-0 w-20 overflow-hidden h-28 rounded-xl"
                            style={{
                              border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                            }}
                          >
                            {thumbPreview && thumbAction !== 'remove' ? (
                              <img
                                src={thumbPreview}
                                alt="Thumbnail"
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div
                                className={`flex items-center justify-center w-full h-full ${dark ? 'bg-white/5' : 'bg-black/5'}`}
                              >
                                <ImageIcon
                                  size={20}
                                  className={
                                    dark ? 'text-white/20' : 'text-black/20'
                                  }
                                />
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className={cls.ghost(dark)}>
                              <RefreshCw size={12} />{' '}
                              {thumbFile ? 'Change Cover' : 'Replace Cover'}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleThumbChange}
                              />
                            </label>
                            {thumbAction !== 'remove' ? (
                              <button
                                type="button"
                                onClick={handleThumbRemove}
                                className={cls.danger(dark)}
                              >
                                <Trash2 size={12} /> Remove
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={handleThumbRestore}
                                className={cls.ghost(dark)}
                              >
                                Restore Original
                              </button>
                            )}
                            <p className={cls.hint(dark)}>
                              JPG, PNG, WEBP — max 5 MB
                            </p>
                          </div>
                        </div>
                      </section>

                      {/* Gallery */}
                      <section>
                        <div className="flex items-center justify-between mb-4">
                          <SectionHeader
                            icon={ImageIcon}
                            title="Gallery Images"
                            dark={dark}
                          />
                          <label
                            className={`${cls.ghost(dark)} cursor-pointer -mt-5`}
                          >
                            <Plus size={12} /> Add Images
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={handleNewImages}
                            />
                          </label>
                        </div>
                        {imageSlots.length === 0 && newImages.length === 0 ? (
                          <div
                            className="flex flex-col items-center justify-center gap-2 py-10 border-2 border-dashed rounded-xl"
                            style={{
                              borderColor: dark
                                ? 'rgba(255,255,255,0.09)'
                                : 'rgba(0,0,0,0.09)',
                            }}
                          >
                            <ImageIcon
                              size={22}
                              className={`opacity-30 ${dark ? 'text-white' : 'text-black'}`}
                            />
                            <p
                              className={`text-[12.5px] ${dark ? 'text-white/28' : 'text-black/28'}`}
                            >
                              No gallery images
                            </p>
                            <label
                              className={`${cls.ghost(dark)} cursor-pointer`}
                            >
                              <Plus size={12} /> Add Images
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleNewImages}
                              />
                            </label>
                          </div>
                        ) : (
                          <>
                            <p
                              className={`text-[11px] mb-3 ${dark ? 'text-white/28' : 'text-black/32'}`}
                            >
                              Hover an image to Replace or Remove it.
                            </p>
                            <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5">
                              {imageSlots.map((slot) => (
                                <ImageSlotCard
                                  key={slot.id}
                                  slot={slot}
                                  dark={dark}
                                  onReplace={handleSlotReplace}
                                  onDelete={handleSlotDelete}
                                />
                              ))}
                              {newImages.map((entry, idx) => (
                                <div
                                  key={`new-${idx}`}
                                  className={`relative group rounded-xl overflow-hidden border ${dark ? 'border-indigo-500/30' : 'border-indigo-300'}`}
                                >
                                  <div className="relative aspect-square">
                                    <img
                                      src={entry.preview}
                                      alt=""
                                      className="object-cover w-full h-full"
                                    />
                                    <span className="absolute top-1 left-1 text-[9px] font-bold text-white bg-indigo-600 px-1.5 py-0.5 rounded-full">
                                      NEW
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeNewImage(idx)}
                                    className="absolute p-1 text-white transition-opacity rounded-full opacity-0 top-1 right-1 bg-black/50 group-hover:opacity-100"
                                  >
                                    <X size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </section>

                      {/* PDF */}
                      <section>
                        <SectionHeader
                          icon={FileText}
                          title="PDF Document"
                          dark={dark}
                        />
                        <div
                          className="flex items-center gap-4 p-4 rounded-xl"
                          style={{
                            border: `1px solid ${border}`,
                            background: dark
                              ? 'rgba(255,255,255,0.02)'
                              : 'rgba(0,0,0,0.02)',
                          }}
                        >
                          <div
                            className="p-2.5 rounded-lg flex-shrink-0"
                            style={{
                              background: dark
                                ? 'rgba(239,68,68,0.1)'
                                : 'rgba(220,38,38,0.07)',
                            }}
                          >
                            <FileText
                              size={18}
                              style={{
                                color: dark
                                  ? 'rgba(252,165,165,0.8)'
                                  : 'rgba(185,28,28,0.7)',
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            {pdfLabel && (
                              <p
                                className={`mb-1.5 text-[12.5px] truncate ${dark ? 'text-white/52' : 'text-black/50'}`}
                              >
                                {pdfLabel}
                              </p>
                            )}
                            <label
                              className={`${cls.ghost(dark)} cursor-pointer`}
                            >
                              <FileText size={12} />
                              {pdfFile
                                ? 'Change PDF'
                                : pdfLabel
                                  ? 'Replace PDF'
                                  : 'Upload PDF'}
                              <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={handlePdfChange}
                              />
                            </label>
                            <p className={cls.hint(dark)}>
                              PDF only — max 50 MB
                            </p>
                          </div>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* ─────────── TAB: Vendor ────────────────────────────── */}
                  {activeTab === 'Vendor' && (
                    <section>
                      <SectionHeader
                        icon={Store}
                        title="Vendor Information"
                        dark={dark}
                      />
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <FL dark={dark}>Vendor ID</FL>
                          <input
                            {...register('vendor_id')}
                            placeholder="Internal vendor ID…"
                            className={cls.input(dark)}
                          />
                        </div>
                        <div>
                          <FL dark={dark}>Vendor Name</FL>
                          <input
                            {...register('vendor_name')}
                            placeholder="Vendor or supplier name…"
                            className={cls.input(dark)}
                          />
                        </div>
                        <div>
                          <FL dark={dark}>Vendor SKU</FL>
                          <input
                            {...register('vendor_sku')}
                            placeholder="Vendor's own SKU…"
                            className={cls.input(dark)}
                          />
                        </div>
                        <div>
                          <FL dark={dark}>Commission (%)</FL>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            {...register('commission_percent')}
                            placeholder="0"
                            className={`${cls.input(dark)} tabular-nums`}
                          />
                        </div>
                      </div>
                    </section>
                  )}

                  {/* ─────────── TAB: SEO ───────────────────────────────── */}
                  {activeTab === 'SEO' && (
                    <section>
                      <SectionHeader
                        icon={Globe}
                        title="SEO & Meta"
                        dark={dark}
                      />
                      <div className="space-y-4">
                        <div>
                          <FL dark={dark}>Meta Title</FL>
                          <input
                            {...register('meta_title')}
                            placeholder="SEO title (defaults to product name)…"
                            className={cls.input(dark)}
                          />
                        </div>
                        <div>
                          <FL dark={dark}>Meta Description</FL>
                          <textarea
                            {...register('meta_description')}
                            rows={4}
                            placeholder="Short description for search engines (120–160 chars)…"
                            className={cls.textarea(dark)}
                          />
                        </div>
                        <InfoBox dark={dark}>
                          Leave blank to auto-generate from product name and
                          short description.
                        </InfoBox>
                      </div>
                    </section>
                  )}

                  {/* ─────────── TAB: Advanced ──────────────────────────── */}
                  {activeTab === 'Advanced' && (
                    <div className="space-y-8">
                      <section>
                        <SectionHeader
                          icon={Gift}
                          title="Promotions"
                          dark={dark}
                        />
                        <div className="space-y-3">
                          <label className={cls.checkRow(dark)}>
                            <Controller
                              name="eligible_for_coupons"
                              control={control}
                              render={({ field }) => (
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4 rounded accent-indigo-500"
                                />
                              )}
                            />
                            Eligible for coupon codes
                          </label>
                          <label className={cls.checkRow(dark)}>
                            <Controller
                              name="eligible_for_points"
                              control={control}
                              render={({ field }) => (
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4 rounded accent-indigo-500"
                                />
                              )}
                            />
                            Eligible for loyalty points
                          </label>
                        </div>
                      </section>

                      <section>
                        <SectionHeader
                          icon={Zap}
                          title="Related Products"
                          dark={dark}
                        />
                        <div className="space-y-4">
                          <InfoBox dark={dark}>
                            Enter product IDs or slugs, comma-separated.
                          </InfoBox>
                          <div>
                            <FL dark={dark}>Upsells</FL>
                            <input
                              {...register('upsells')}
                              placeholder="product-id-1, product-id-2…"
                              className={cls.input(dark)}
                            />
                          </div>
                          <div>
                            <FL dark={dark}>Cross-sells</FL>
                            <input
                              {...register('cross_sells')}
                              placeholder="product-id-1, product-id-2…"
                              className={cls.input(dark)}
                            />
                          </div>
                          <div>
                            <FL dark={dark}>Frequently Bought Together</FL>
                            <input
                              {...register('frequently_bought_together')}
                              placeholder="product-id-1, product-id-2…"
                              className={cls.input(dark)}
                            />
                          </div>
                        </div>
                      </section>

                      <section>
                        <SectionHeader
                          icon={Star}
                          title="Ratings (read-only)"
                          dark={dark}
                        />
                        <div
                          className={`flex flex-wrap gap-3 p-4 rounded-xl ${dark ? 'bg-white/3' : 'bg-black/3'}`}
                        >
                          {[
                            {
                              label: 'Avg Rating',
                              value:
                                book?.ratings_and_reviews?.average_rating ?? 0,
                            },
                            {
                              label: 'Total Reviews',
                              value:
                                book?.ratings_and_reviews?.total_reviews ?? 0,
                            },
                            {
                              label: '5★',
                              value:
                                book?.ratings_and_reviews?.rating_breakdown?.[
                                  '5_star'
                                ] ?? 0,
                            },
                            {
                              label: '4★',
                              value:
                                book?.ratings_and_reviews?.rating_breakdown?.[
                                  '4_star'
                                ] ?? 0,
                            },
                            {
                              label: '3★',
                              value:
                                book?.ratings_and_reviews?.rating_breakdown?.[
                                  '3_star'
                                ] ?? 0,
                            },
                            {
                              label: '2★',
                              value:
                                book?.ratings_and_reviews?.rating_breakdown?.[
                                  '2_star'
                                ] ?? 0,
                            },
                            {
                              label: '1★',
                              value:
                                book?.ratings_and_reviews?.rating_breakdown?.[
                                  '1_star'
                                ] ?? 0,
                            },
                          ].map(({ label, value }) => (
                            <div
                              key={label}
                              className={`px-3 py-2 rounded-lg text-center ${dark ? 'bg-white/5' : 'bg-black/5'}`}
                            >
                              <p
                                className={`text-[10.5px] ${dark ? 'text-white/35' : 'text-black/35'}`}
                              >
                                {label}
                              </p>
                              <p
                                className={`text-[15px] font-semibold tabular-nums ${dark ? 'text-white/80' : 'text-black/80'}`}
                              >
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* ══ Footer ═══════════════════════════════════════════════════ */}
            <div
              className="flex items-center flex-shrink-0 gap-3 px-6 py-4"
              style={{
                borderTop: `1px solid ${border}`,
                background: dark
                  ? 'rgba(255,255,255,0.015)'
                  : 'rgba(255,255,255,0.8)',
              }}
            >
              <div className="flex items-center gap-1 mr-auto">
                {TABS.indexOf(activeTab) > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab(TABS[TABS.indexOf(activeTab) - 1])
                    }
                    className={`px-3 py-1.5 rounded-lg text-[12px] border transition-all ${dark ? 'border-white/8 text-white/35 hover:bg-white/5' : 'border-black/8 text-black/35 hover:bg-black/5'}`}
                  >
                    ← {TABS[TABS.indexOf(activeTab) - 1]}
                  </button>
                )}
                {TABS.indexOf(activeTab) < TABS.length - 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab(TABS[TABS.indexOf(activeTab) + 1])
                    }
                    className={`px-3 py-1.5 rounded-lg text-[12px] border transition-all ${dark ? 'border-white/8 text-white/35 hover:bg-white/5' : 'border-black/8 text-black/35 hover:bg-black/5'}`}
                  >
                    {TABS[TABS.indexOf(activeTab) + 1]} →
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg text-[13px] border transition-all ${dark ? 'border-white/10 text-white/52 hover:bg-white/6 hover:text-white/75' : 'border-black/10 text-black/48 hover:bg-black/5 hover:text-black/68'}`}
              >
                Cancel
              </button>

              <button
                type="submit"
                form="product-edit-form"
                disabled={isUpdating}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-semibold text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background:
                    'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  boxShadow: isUpdating
                    ? 'none'
                    : '0 1px 2px rgba(99,102,241,0.5), 0 0 0 1px rgba(99,102,241,0.22)',
                }}
              >
                {isUpdating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {isUpdating ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductEditModal;
