import { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Plus,
  Trash2,
  ChevronRight,
  X,
  Upload,
  Video as VideoIcon,
  FileText,
  Hash,
  Type,
  ToggleLeft,
  AlertCircle,
} from 'lucide-react';

// ─── Design tokens (Notion-inspired) ─────────────────────────────────────────
const T = {
  input:
    'w-full px-3 py-[7px] text-sm bg-white border border-[#e3e2df] rounded-md text-[#37352f] placeholder:text-[#9b9a97] outline-none transition-all duration-150 hover:border-[#c9c8c5] focus:border-[#2383e2] focus:ring-2 focus:ring-[#2383e2]/15',
  inputErr:
    'w-full px-3 py-[7px] text-sm bg-[#fff8f7] border border-[#eb5757]/50 rounded-md text-[#37352f] placeholder:text-[#9b9a97] outline-none transition-all duration-150 focus:border-[#eb5757] focus:ring-2 focus:ring-[#eb5757]/15',
  select:
    'w-full px-3 py-[7px] text-sm bg-white border border-[#e3e2df] rounded-md text-[#37352f] outline-none transition-all duration-150 hover:border-[#c9c8c5] focus:border-[#2383e2] focus:ring-2 focus:ring-[#2383e2]/15 cursor-pointer',
  textarea:
    'w-full px-3 py-[7px] text-sm bg-white border border-[#e3e2df] rounded-md text-[#37352f] placeholder:text-[#9b9a97] outline-none transition-all duration-150 hover:border-[#c9c8c5] focus:border-[#2383e2] focus:ring-2 focus:ring-[#2383e2]/15 resize-none',
  label: 'block text-[13px] font-medium text-[#37352f] mb-1',
  section: 'mb-3 border border-[#e3e2df] rounded-xl overflow-hidden bg-white',
  sectionHeader:
    'flex items-center gap-2 w-full px-5 py-3.5 text-left transition-colors duration-150 hover:bg-[#f7f6f3]',
  tag: 'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md',
};

// ─── Known basic_info fields ──────────────────────────────────────────────────
const KNOWN_BASIC_INFO_KEYS = new Set([
  'name',
  'brand',
  'model',
  'sl_no',
  'short_description',
  'long_description',
  'type',
  'condition',
]);

// ─── Type helpers ─────────────────────────────────────────────────────────────
const parseCustomValue = (val) => {
  if (val === '' || val == null) return val;
  const t = String(val).trim();
  if (t === 'true') return true;
  if (t === 'false') return false;
  const n = Number(t);
  if (!isNaN(n) && t !== '') return n;
  return t;
};

const inferType = (val) => {
  const t = String(val).trim();
  if (t === 'true' || t === 'false') return 'boolean';
  if (!isNaN(Number(t)) && t !== '') return 'number';
  return 'string';
};

const TYPE_META = {
  string: { icon: Type, cls: 'bg-[#f0f0ef] text-[#787774]', label: 'text' },
  number: { icon: Hash, cls: 'bg-[#edf3ec] text-[#448361]', label: 'number' },
  boolean: {
    icon: ToggleLeft,
    cls: 'bg-[#f3f0f9] text-[#9065b0]',
    label: 'bool',
  },
};

// ─── extractCustomProps ───────────────────────────────────────────────────────
const extractCustomProps = (basicInfo = {}) =>
  Object.entries(basicInfo)
    .filter(([k]) => !KNOWN_BASIC_INFO_KEYS.has(k))
    .map(([key, value]) => ({ key, value: String(value), error: null }));

// ─── helpers ──────────────────────────────────────────────────────────────────
const generateSKU = (name) => {
  if (!name) return '';
  const base = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_')
    .slice(0, 20);
  const suffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return base ? `${base}_${suffix}` : `SKU_${suffix}`;
};

const generateSlug = (name) => {
  if (!name) return '';
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .slice(0, 80);
};

// ─── Toggle switch ────────────────────────────────────────────────────────────
const Toggle = ({ id, label, register: reg }) => (
  <label
    htmlFor={id}
    className="inline-flex items-center gap-2.5 cursor-pointer select-none"
  >
    <div className="relative">
      <input type="checkbox" id={id} className="sr-only peer" {...reg} />
      <div className="w-8 h-4 bg-[#e3e2df] peer-checked:bg-[#2383e2] rounded-full transition-colors" />
      <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
    </div>
    <span className="text-[13px] text-[#37352f]">{label}</span>
  </label>
);

// ─── Section ──────────────────────────────────────────────────────────────────
const Section = ({ title, children, defaultOpen = true, badge }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={T.section}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={T.sectionHeader}
      >
        <span
          className="text-[#9b9a97] transition-transform duration-200 shrink-0"
          style={{
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            display: 'inline-block',
          }}
        >
          <ChevronRight size={14} />
        </span>
        <span className="text-[13px] font-semibold text-[#37352f] tracking-[-0.01em]">
          {title}
        </span>
        {badge != null && (
          <span className="ml-auto text-[11px] font-medium text-[#9b9a97] bg-[#f0f0ef] px-1.5 py-0.5 rounded-md">
            {badge}
          </span>
        )}
      </button>
      {open && (
        <div className="px-5 pt-1 pb-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Field ────────────────────────────────────────────────────────────────────
const Field = ({ label, required, error, full, hint, children }) => (
  <div className={full ? 'sm:col-span-2' : ''}>
    <label className={T.label}>
      {label}
      {required && <span className="text-[#eb5757] ml-0.5">*</span>}
    </label>
    {children}
    {hint && !error && (
      <p className="mt-1 text-[11px] text-[#9b9a97]">{hint}</p>
    )}
    {error && (
      <p className="mt-1 flex items-center gap-1 text-[11px] text-[#eb5757]">
        <AlertCircle size={10} /> {error}
      </p>
    )}
  </div>
);

// ─── Divider ──────────────────────────────────────────────────────────────────
const Divider = () => (
  <div className="sm:col-span-2 h-px bg-[#f0f0ef] -mx-5 my-1" />
);

// ─── getDefaultValues ─────────────────────────────────────────────────────────
const getDefaultValues = (initialData) => {
  if (initialData) return initialData;
  return {
    sku: '',
    slug: '',
    edition: '',
    status: 'draft',
    visibility: 'public',
    basic_info: {
      name: '',
      brand: '',
      model: '',
      sl_no: '',
      short_description: '',
      long_description: '',
      type: 'physical',
      condition: 'new',
    },
    category: {
      primary: { id: '', name: '', slug: '' },
      secondary: { id: '', name: '', slug: '' },
      tertiary: { id: '', name: '', slug: '' },
    },
    tags: [],
    keywords: [],
    pricing: {
      currency: 'USD',
      base_price: '',
      sale_price: '',
      cost_price: '',
      is_on_sale: false,
      discount_type: 'fixed',
      discount_value: 0,
      tax: { is_taxable: true, tax_class: 'standard', tax_rate_percent: 0 },
      bulk_pricing: [],
    },
    inventory: {
      track_inventory: true,
      quantity: 0,
      reserved_quantity: 0,
      low_stock_threshold: 10,
      allow_backorder: false,
    },
    variants: [],
    attributes: { material: '', weight_grams: '', custom_attributes: {} },
    media: { thumbnail: null, images: [], videos: [], documents: [] },
    shipping: {
      is_shippable: true,
      is_free_shipping: false,
      weight: { value: '', unit: 'kg' },
      dimensions: { length: '', width: '', height: '', unit: 'cm' },
      shipping_class: 'standard',
      country_of_origin: '',
      hs_tariff_code: '',
      fragile: false,
    },
    seo: {
      meta_title: '',
      meta_description: '',
      meta_keywords: [],
      canonical_url: '',
    },
    vendor: {
      vendor_id: '',
      vendor_name: '',
      vendor_sku: '',
      commission_percent: '',
    },
    warranty_and_returns: {
      warranty: {
        has_warranty: false,
        duration_months: '',
        type: '',
        description: '',
      },
      return_policy: {
        is_returnable: true,
        return_window_days: 30,
        return_condition: '',
        restocking_fee_percent: 0,
      },
    },
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// ProductForm
// ═══════════════════════════════════════════════════════════════════════════════
const ProductForm = ({ initialData, onSubmit, isLoading, submitLabel }) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: getDefaultValues(initialData),
    mode: 'onChange',
  });

  // ── Custom Properties ────────────────────────────────────────────────────────
  const [customProps, setCustomProps] = useState(() =>
    extractCustomProps(initialData?.basic_info),
  );
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');
  const [newErr, setNewErr] = useState('');
  const newKeyRef = useRef(null);

  const addProp = () => {
    const key = newKey.trim().toLowerCase().replace(/\s+/g, '_');
    const val = newVal.trim();
    if (!key) return setNewErr('Property name is required');
    if (KNOWN_BASIC_INFO_KEYS.has(key))
      return setNewErr(`"${key}" is a reserved field`);
    if (customProps.some((p) => p.key === key))
      return setNewErr(`"${key}" already exists`);
    if (!val) return setNewErr('Value is required');
    setCustomProps((prev) => [...prev, { key, value: val, error: null }]);
    setNewKey('');
    setNewVal('');
    setNewErr('');
    setTimeout(() => newKeyRef.current?.focus(), 50);
  };

  const updateProp = (idx, field, val) =>
    setCustomProps((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: val, error: null } : p)),
    );

  const removeProp = (idx) =>
    setCustomProps((prev) => prev.filter((_, i) => i !== idx));

  // ── Blob cleanup ─────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      const media = getValues('media');
      if (media?.thumbnail?.preview?.startsWith('blob:'))
        URL.revokeObjectURL(media.thumbnail.preview);
      media?.images?.forEach(
        (img) =>
          img.preview?.startsWith('blob:') && URL.revokeObjectURL(img.preview),
      );
      media?.videos?.forEach(
        (vid) =>
          vid.preview?.startsWith('blob:') && URL.revokeObjectURL(vid.preview),
      );
    };
  }, [getValues]);

  // ── Edit mode sync ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach((k) => setValue(k, initialData[k]));
      setCustomProps(extractCustomProps(initialData.basic_info));
    }
  }, [initialData, setValue]);

  // ── Auto SKU / slug ───────────────────────────────────────────────────────────
  const productName = watch('basic_info.name');
  useEffect(() => {
    if (!productName?.trim()) return;
    const curSku = getValues('sku');
    if (!curSku || curSku.startsWith(productName.slice(0, 5).toUpperCase()))
      setValue('sku', generateSKU(productName));
    if (!getValues('slug')) setValue('slug', generateSlug(productName));
  }, [productName, setValue, getValues]);

  // ── Field arrays ──────────────────────────────────────────────────────────────
  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: 'variants' });
  const {
    fields: bulkFields,
    append: appendBulk,
    remove: removeBulk,
  } = useFieldArray({ control, name: 'pricing.bulk_pricing' });

  // ── Tags ──────────────────────────────────────────────────────────────────────
  const [tagInput, setTagInput] = useState('');
  const tags = watch('tags') || [];
  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setValue('tags', [...tags, t]);
      trigger('tags');
    }
    setTagInput('');
  };

  // ── Keywords ──────────────────────────────────────────────────────────────────
  const [kwInput, setKwInput] = useState('');
  const keywords = watch('keywords') || [];
  const addKw = () => {
    const k = kwInput.trim().toLowerCase();
    if (k && !keywords.includes(k)) {
      setValue('keywords', [...keywords, k]);
      trigger('keywords');
    }
    setKwInput('');
  };

  // ── Media handlers ────────────────────────────────────────────────────────────
  const handleThumb = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const old = getValues('media.thumbnail');
    if (old?.preview?.startsWith('blob:')) URL.revokeObjectURL(old.preview);
    setValue('media.thumbnail', { file, preview: URL.createObjectURL(file) });
    e.target.value = '';
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    setValue('media.images', [
      ...(getValues('media.images') || []),
      ...files.map((f) => ({
        file: f,
        preview: URL.createObjectURL(f),
        name: f.name,
      })),
    ]);
    e.target.value = '';
  };
  const removeImage = (i) => {
    const cur = getValues('media.images');
    if (cur[i]?.preview?.startsWith('blob:'))
      URL.revokeObjectURL(cur[i].preview);
    setValue(
      'media.images',
      cur.filter((_, idx) => idx !== i),
    );
  };

  const handleVideos = (e) => {
    const files = Array.from(e.target.files || []);
    setValue('media.videos', [
      ...(getValues('media.videos') || []),
      ...files.map((f) => ({
        file: f,
        preview: URL.createObjectURL(f),
        name: f.name,
      })),
    ]);
    e.target.value = '';
  };

  const removeVideo = (i) => {
    const cur = getValues('media.videos');
    if (cur[i]?.preview?.startsWith('blob:'))
      URL.revokeObjectURL(cur[i].preview);
    setValue(
      'media.videos',
      cur.filter((_, idx) => idx !== i),
    );
  };

  const handleDocs = (e) => {
    const files = Array.from(e.target.files || []);
    setValue('media.documents', [
      ...(getValues('media.documents') || []),
      ...files.map((f) => ({ file: f, name: f.name })),
    ]);
    e.target.value = '';
  };

  // ── Error helpers ─────────────────────────────────────────────────────────────
  const getErr = (p) => errors?.[p]?.message;
  const getNested = (path) => {
    let cur = errors;
    for (const p of path.split('.')) {
      if (!cur) return undefined;
      cur = cur[p];
    }
    return cur?.message;
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const onFormSubmit = (data) => {
    const fd = new FormData();
    const { media, ...rest } = data;

    // ১. কাস্টম প্রপার্টিজ মার্জ করা (আপনার আগের লজিক অনুযায়ী)
    const customObj = {};
    customProps.forEach(({ key, value }) => {
      if (key) customObj[key] = parseCustomValue(value);
    });
    rest.basic_info = { ...rest.basic_info, ...customObj };

    // ২. মেইন প্রোডাক্ট ডাটা JSON স্ট্রিং করে 'payload' কি-তে পাঠানো
    fd.append('payload', JSON.stringify(rest));

    // ৩. ব্যাকএন্ড মিডলওয়্যার (Multer) অনুযায়ী ফাইলগুলো অ্যাপেন্ড করা

    // ─── ক. থাম্বনেইল (Backend Expects: "thumbnail") ───
    if (media?.thumbnail?.file instanceof File) {
      fd.append('thumbnail', media.thumbnail.file);
    } else if (typeof media?.thumbnail === 'string') {
      fd.append('thumbnail_existing_url', media.thumbnail);
    }

    // ─── খ. গ্যালারি ইমেজেস (Backend Expects: "images") ───
    if (media?.images && media.images.length > 0) {
      media.images.forEach((img) => {
        if (img.file instanceof File) {
          fd.append('images', img.file); // একই নামে মাল্টিপল ফাইল অ্যাপেন্ড হবে
        } else if (img.url) {
          fd.append('gallery_existing_urls', img.url);
        }
      });
    }

    // ─── গ. ভিডিও (Backend Expects: "videos") ───
    if (media?.videos && media.videos.length > 0) {
      media.videos.forEach((vid) => {
        if (vid.file instanceof File) {
          fd.append('videos', vid.file);
        } else if (vid.url) {
          fd.append('video_existing_urls', vid.url);
        }
      });
    }

    // ─── ঘ. ডকুমেন্টস (Backend Expects: "documents") ───
    if (media?.documents && media.documents.length > 0) {
      media.documents.forEach((doc) => {
        if (doc.file instanceof File) {
          fd.append('documents', doc.file);
        } else if (doc.url) {
          fd.append('document_existing_urls', doc.url);
        }
      });
    }

    // ৪. ফাইনাল FormData অবজেক্টটি আপনার API সাবমিট ফাংশনে পাঠানো
    onSubmit(fd);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      noValidate
      className="space-y-3"
    >
      {/* ══════════════════════════ BASIC INFORMATION ═══════════════════════════ */}
      <Section title="Basic Information" defaultOpen>
        {/* Product Name */}
        <Field
          label="Product Name"
          required
          full
          error={getNested('basic_info.name')}
        >
          <input
            className={getNested('basic_info.name') ? T.inputErr : T.input}
            {...register('basic_info.name', {
              required: 'Product name is required',
              minLength: { value: 2, message: 'Minimum 2 characters' },
            })}
            placeholder="e.g. Premium Wireless Headphones"
          />
        </Field>

        {/* Brand */}
        <Field label="Brand" required error={getNested('basic_info.brand')}>
          <input
            className={getNested('basic_info.brand') ? T.inputErr : T.input}
            {...register('basic_info.brand', { required: 'Brand is required' })}
            placeholder="e.g. SoundWave"
          />
        </Field>
        <Field label="SL No" required error={getNested('basic_info.sl_no')}>
          <input
            className={getNested('basic_info.sl_no') ? T.inputErr : T.input}
            {...register('basic_info.sl_no', { required: 'SL No is required' })}
            placeholder="e.g. SL No"
          />
        </Field>

        {/* Model */}
        <Field label="Model">
          <input
            className={T.input}
            {...register('basic_info.model')}
            placeholder="e.g. SW-Pro X1"
          />
        </Field>

        {/* Edition */}
        <Field
          label="Edition"
          error={getErr('edition')}
          hint="Leave blank if not applicable"
        >
          <input
            type="number"
            min="1"
            step="1"
            className={getErr('edition') ? T.inputErr : T.input}
            {...register('edition', {
              min: { value: 1, message: 'Edition must be ≥ 1' },
              validate: (v) =>
                v === '' || !isNaN(Number(v)) || 'Must be a number',
            })}
            placeholder="e.g. 3"
          />
        </Field>

        {/* SKU */}
        <Field label="SKU" required error={getErr('sku')}>
          <input
            className={`font-mono tracking-wide ${getErr('sku') ? T.inputErr : T.input}`}
            {...register('sku', { required: 'SKU is required' })}
            placeholder="Auto-generated from name"
          />
        </Field>

        {/* Slug */}
        <Field label="Slug" hint="Auto-generated if empty">
          <input
            className={T.input}
            {...register('slug')}
            placeholder="auto-generated"
          />
        </Field>

        {/* Type */}
        <Field label="Product Type">
          <select className={T.select} {...register('basic_info.type')}>
            <option value="physical">Physical</option>
            <option value="digital">Digital</option>
            <option value="service">Service</option>
          </select>
        </Field>

        {/* Condition */}
        <Field label="Condition">
          <select className={T.select} {...register('basic_info.condition')}>
            <option value="new">New</option>
            <option value="used">Used</option>
            <option value="refurbished">Refurbished</option>
          </select>
        </Field>

        {/* Status */}
        <Field label="Status">
          <select className={T.select} {...register('status')}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </Field>

        {/* Visibility */}
        <Field label="Visibility">
          <select className={T.select} {...register('visibility')}>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="hidden">Hidden</option>
          </select>
        </Field>

        {/* Short description */}
        <Field label="Short Description" full>
          <input
            className={T.input}
            {...register('basic_info.short_description')}
            placeholder="One-line summary"
          />
        </Field>

        {/* Long description */}
        <Field label="Long Description" full>
          <textarea
            className={T.textarea}
            rows={4}
            {...register('basic_info.long_description')}
            placeholder="Detailed product description…"
          />
        </Field>

        <Divider />

        {/* ── Additional Properties ──────────────────────────────────────────── */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-semibold text-[#37352f]">
              Additional Properties
            </p>
            <p className="text-[11px] text-[#9b9a97]">
              <span className="font-mono">220</span> → number &nbsp;·&nbsp;
              <span className="font-mono">solar</span> → text &nbsp;·&nbsp;
              <span className="font-mono">true</span> → bool
            </p>
          </div>

          {/* Existing props table */}
          {customProps.length > 0 && (
            <div className="mb-3 border border-[#e3e2df] rounded-lg overflow-hidden">
              {/* Table head */}
              <div className="grid grid-cols-[1fr_1fr_76px_32px] bg-[#f7f6f3] border-b border-[#e3e2df]">
                {['Property', 'Value', 'Type', ''].map((h, i) => (
                  <div
                    key={i}
                    className="px-3 py-1.5 text-[11px] font-semibold text-[#9b9a97] uppercase tracking-wide"
                  >
                    {h}
                  </div>
                ))}
              </div>

              {customProps.map((prop, idx) => {
                const type = inferType(prop.value);
                const meta = TYPE_META[type];
                const IconComp = meta.icon;
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-[1fr_1fr_76px_32px] border-b border-[#f0f0ef] last:border-b-0 group hover:bg-[#fafaf9] transition-colors"
                  >
                    {/* Key input */}
                    <div className="px-2 py-1.5 border-r border-[#f0f0ef]">
                      <input
                        value={prop.key}
                        onChange={(e) => updateProp(idx, 'key', e.target.value)}
                        className="w-full font-mono text-[12px] text-[#37352f] bg-transparent outline-none placeholder:text-[#c9c8c5] rounded px-1 py-0.5 hover:bg-[#f0f0ef] focus:bg-white focus:ring-1 focus:ring-[#2383e2] transition-all"
                        placeholder="property_name"
                      />
                    </div>
                    {/* Value input */}
                    <div className="px-2 py-1.5 border-r border-[#f0f0ef]">
                      <input
                        value={prop.value}
                        onChange={(e) =>
                          updateProp(idx, 'value', e.target.value)
                        }
                        className="w-full text-[12px] text-[#37352f] bg-transparent outline-none placeholder:text-[#c9c8c5] rounded px-1 py-0.5 hover:bg-[#f0f0ef] focus:bg-white focus:ring-1 focus:ring-[#2383e2] transition-all"
                        placeholder="value"
                      />
                    </div>
                    {/* Type badge */}
                    <div className="px-2 py-1.5 flex items-center border-r border-[#f0f0ef]">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${meta.cls}`}
                      >
                        <IconComp size={9} />
                        {meta.label}
                      </span>
                    </div>
                    {/* Remove */}
                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeProp(idx)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[#9b9a97] hover:text-[#eb5757] hover:bg-[#fff0f0] rounded transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add new property row */}
          <div className="flex items-start gap-2">
            <div className="grid flex-1 grid-cols-2 gap-2">
              <input
                ref={newKeyRef}
                value={newKey}
                onChange={(e) => {
                  setNewKey(e.target.value);
                  setNewErr('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addProp();
                  }
                }}
                className={`${T.input} font-mono text-[12px]`}
                placeholder="property_name"
              />
              <div className="relative">
                <input
                  value={newVal}
                  onChange={(e) => {
                    setNewVal(e.target.value);
                    setNewErr('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addProp();
                    }
                  }}
                  className={`${T.input} text-[12px] ${newVal ? 'pr-16' : ''}`}
                  placeholder="value"
                />
                {newVal &&
                  (() => {
                    const type = inferType(newVal);
                    const meta = TYPE_META[type];
                    const IconComp = meta.icon;
                    return (
                      <span
                        className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${meta.cls}`}
                      >
                        <IconComp size={9} /> {meta.label}
                      </span>
                    );
                  })()}
              </div>
            </div>
            <button
              type="button"
              onClick={addProp}
              className="shrink-0 flex items-center gap-1 px-3 py-[7px] text-[12px] font-medium text-[#2383e2] bg-[#e8f1fb] border border-[#c9dff8] rounded-md hover:bg-[#d4e8f8] transition-colors"
            >
              <Plus size={12} /> Add
            </button>
          </div>
          {newErr && (
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#eb5757]">
              <AlertCircle size={10} /> {newErr}
            </p>
          )}
        </div>
        {/* ── / Additional Properties ── */}
      </Section>

      {/* ══════════════════════════════ CATEGORY ════════════════════════════════ */}
      <Section title="Category" defaultOpen={false}>
        {['primary', 'secondary', 'tertiary'].map((level) => (
          <Field
            key={level}
            label={level.charAt(0).toUpperCase() + level.slice(1)}
          >
            <input
              className={T.input}
              {...register(`category.${level}.name`)}
              placeholder={`${level} category`}
            />
          </Field>
        ))}
      </Section>

      {/* ══════════════════════════ TAGS & KEYWORDS ═════════════════════════════ */}
      <Section title="Tags & Keywords" defaultOpen={false}>
        <Field label="Tags" full>
          <div className="flex gap-2 mb-2">
            <input
              className={`${T.input} flex-1`}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Type and press Enter…"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-[7px] text-[12px] font-medium text-[#37352f] bg-[#f0f0ef] border border-[#e3e2df] rounded-md hover:bg-[#e8e8e5] transition-colors"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className={`${T.tag} bg-[#e8f1fb] text-[#2383e2]`}
                >
                  {t}
                  <button
                    type="button"
                    onClick={() =>
                      setValue(
                        'tags',
                        tags.filter((x) => x !== t),
                      )
                    }
                    className="ml-0.5 hover:text-[#1a6abf]"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>

        <Field label="SEO Keywords" full>
          <div className="flex gap-2 mb-2">
            <input
              className={`${T.input} flex-1`}
              value={kwInput}
              onChange={(e) => setKwInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addKw();
                }
              }}
              placeholder="Type and press Enter…"
            />
            <button
              type="button"
              onClick={addKw}
              className="px-3 py-[7px] text-[12px] font-medium text-[#37352f] bg-[#f0f0ef] border border-[#e3e2df] rounded-md hover:bg-[#e8e8e5] transition-colors"
            >
              Add
            </button>
          </div>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((k) => (
                <span
                  key={k}
                  className={`${T.tag} bg-[#f3f0f9] text-[#9065b0]`}
                >
                  {k}
                  <button
                    type="button"
                    onClick={() =>
                      setValue(
                        'keywords',
                        keywords.filter((x) => x !== k),
                      )
                    }
                    className="ml-0.5 hover:text-[#7a52a0]"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>
      </Section>

      {/* ════════════════════════════════ PRICING ═══════════════════════════════ */}
      <Section title="Pricing" defaultOpen>
        <Field label="Currency">
          <select className={T.select} {...register('pricing.currency')}>
            {['USD', 'EUR', 'GBP', 'BDT', 'INR', 'AUD', 'CAD'].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Base Price"
          required
          error={getNested('pricing.base_price')}
        >
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            className={getNested('pricing.base_price') ? T.inputErr : T.input}
            {...register('pricing.base_price', {
              required: 'Base price is required',
              min: { value: 0, message: 'Cannot be negative' },
            })}
          />
        </Field>

        <Field label="Cost Price">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            className={T.input}
            {...register('pricing.cost_price')}
          />
        </Field>

        <Field label="Tax Rate (%)">
          <input
            type="number"
            min="0"
            max="100"
            className={T.input}
            {...register('pricing.tax.tax_rate_percent')}
          />
        </Field>

        {/* On sale */}
        <div className="sm:col-span-2">
          <Toggle
            id="is_on_sale"
            label="On Sale"
            register={register('pricing.is_on_sale')}
          />
        </div>

        {watch('pricing.is_on_sale') && (
          <>
            <Field
              label="Sale Price"
              required
              error={getNested('pricing.sale_price')}
            >
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className={
                  getNested('pricing.sale_price') ? T.inputErr : T.input
                }
                {...register('pricing.sale_price', {
                  validate: (v) =>
                    !watch('pricing.is_on_sale') || (v && Number(v) >= 0)
                      ? true
                      : 'Sale price is required',
                })}
              />
            </Field>
            <Field label="Discount Type">
              <select
                className={T.select}
                {...register('pricing.discount_type')}
              >
                <option value="fixed">Fixed Amount</option>
                <option value="percentage">Percentage</option>
              </select>
            </Field>
            <Field label="Discount Value">
              <input
                type="number"
                min="0"
                className={T.input}
                {...register('pricing.discount_value')}
              />
            </Field>
          </>
        )}

        {/* Bulk pricing */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-medium text-[#37352f]">
              Bulk Pricing
            </p>
            <button
              type="button"
              onClick={() =>
                appendBulk({ min_quantity: '', price_per_unit: '' })
              }
              className="flex items-center gap-1 text-[12px] text-[#2383e2] hover:text-[#1a6abf] transition-colors"
            >
              <Plus size={12} /> Add tier
            </button>
          </div>
          {bulkFields.length > 0 && (
            <div className="space-y-2">
              {bulkFields.map((field, idx) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Min qty"
                    className={`${T.input} w-28`}
                    {...register(`pricing.bulk_pricing.${idx}.min_quantity`)}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price / unit"
                    className={`${T.input} flex-1`}
                    {...register(`pricing.bulk_pricing.${idx}.price_per_unit`)}
                  />
                  <button
                    type="button"
                    onClick={() => removeBulk(idx)}
                    className="p-1.5 text-[#9b9a97] hover:text-[#eb5757] hover:bg-[#fff0f0] rounded-md transition-colors shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      {/* ════════════════════════════════ INVENTORY ═════════════════════════════ */}
      <Section title="Inventory" defaultOpen>
        <Field label="Quantity">
          <input
            type="number"
            min="0"
            className={T.input}
            {...register('inventory.quantity')}
          />
        </Field>
        <Field label="Reserved Quantity">
          <input
            type="number"
            min="0"
            className={T.input}
            {...register('inventory.reserved_quantity')}
          />
        </Field>
        <Field label="Low Stock Threshold">
          <input
            type="number"
            min="0"
            className={T.input}
            {...register('inventory.low_stock_threshold')}
          />
        </Field>
        <div className="flex flex-col gap-3">
          <Toggle
            id="track_inv"
            label="Track Inventory"
            register={register('inventory.track_inventory')}
          />
          <Toggle
            id="allow_back"
            label="Allow Backorder"
            register={register('inventory.allow_backorder')}
          />
        </div>
      </Section>

      {/* ════════════════════════════════ VARIANTS ══════════════════════════════ */}
      <Section
        title="Variants"
        defaultOpen={false}
        badge={variantFields.length || null}
      >
        <div className="sm:col-span-2">
          {variantFields.length === 0 ? (
            <p className="text-[13px] text-[#9b9a97] mb-3">
              No variants added yet.
            </p>
          ) : (
            <div className="mb-3 space-y-2">
              {variantFields.map((field, idx) => (
                <div
                  key={field.id}
                  className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_1fr_80px_32px] items-center gap-2 p-3 border border-[#e3e2df] rounded-lg bg-[#fafaf9]"
                >
                  <input
                    placeholder="SKU"
                    className={`${T.input} font-mono text-[12px]`}
                    {...register(`variants.${idx}.sku`)}
                  />
                  <input
                    placeholder="Color"
                    className={T.input}
                    {...register(`variants.${idx}.attributes.color`)}
                  />
                  <input
                    placeholder="Size"
                    className={T.input}
                    {...register(`variants.${idx}.attributes.size`)}
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    className={T.input}
                    {...register(`variants.${idx}.stock`)}
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="p-1.5 text-[#9b9a97] hover:text-[#eb5757] hover:bg-[#fff0f0] rounded-md transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <label className="flex items-center col-span-2 gap-2 cursor-pointer sm:col-span-5">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 rounded accent-[#2383e2]"
                      {...register(`variants.${idx}.is_default`)}
                    />
                    <span className="text-[12px] text-[#9b9a97]">
                      Default variant
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() =>
              appendVariant({
                variant_id: `VAR-${Date.now()}`,
                sku: '',
                attributes: { color: '', size: '' },
                price_modifier: 0,
                stock: 0,
                is_default: variantFields.length === 0,
                images: [],
              })
            }
            className="flex items-center gap-1.5 px-3 py-[7px] text-[12px] font-medium text-[#37352f] bg-[#f0f0ef] border border-[#e3e2df] rounded-md hover:bg-[#e8e8e5] transition-colors"
          >
            <Plus size={13} /> Add Variant
          </button>
        </div>
      </Section>

      {/* ════════════════════════════ MEDIA & ATTACHMENTS ═══════════════════════ */}
      <Section title="Media & Attachments" defaultOpen>
        {/* Thumbnail */}
        <Field label="Main Thumbnail" full>
          <div className="flex items-start gap-4">
            <div className="relative w-28 h-28 shrink-0 border-2 border-dashed border-[#e3e2df] rounded-xl overflow-hidden bg-[#fafaf9] group hover:border-[#2383e2] transition-colors">
              {watch('media.thumbnail')?.preview ? (
                <>
                  <img
                    src={watch('media.thumbnail').preview}
                    alt="Thumbnail"
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const old = getValues('media.thumbnail');
                      if (old?.preview?.startsWith('blob:'))
                        URL.revokeObjectURL(old.preview);
                      setValue('media.thumbnail', null);
                    }}
                    className="absolute p-1 text-white transition-opacity rounded-full opacity-0 top-1 right-1 bg-black/60 group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center justify-center w-full h-full gap-1 cursor-pointer">
                    <Upload size={20} className="text-[#9b9a97]" />
                    <span className="text-[10px] text-[#9b9a97]">Upload</span>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleThumb}
                  />
                </>
              )}
            </div>
            <div className="text-[12px] text-[#9b9a97] leading-relaxed pt-1">
              <p className="font-medium text-[#37352f] mb-0.5">
                Primary product image
              </p>
              <p>Recommended: 800 × 800 px</p>
              <p>JPG, PNG or WebP · Max 10 MB</p>
            </div>
          </div>
        </Field>

        {/* Gallery */}
        <Field label="Product Gallery" full>
          <div className="flex flex-wrap gap-2">
            {watch('media.images')?.map((img, idx) => (
              <div
                key={idx}
                className="relative w-20 h-20 border border-[#e3e2df] rounded-lg overflow-hidden group bg-[#f7f6f3]"
              >
                <img
                  src={img.preview}
                  className="object-cover w-full h-full"
                  alt={`Gallery ${idx + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 p-0.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-[#e3e2df] rounded-lg cursor-pointer hover:border-[#2383e2] hover:bg-[#f0f6ff] transition-colors">
              <Plus size={18} className="text-[#9b9a97]" />
              <span className="text-[10px] text-[#9b9a97] mt-0.5">Add</span>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImages}
              />
            </label>
          </div>
        </Field>

        {/* Videos */}
        <Field label="Product Videos" full>
          <div className="space-y-1.5">
            {watch('media.videos')?.map((video, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-3 py-2 border border-[#e3e2df] rounded-lg bg-[#fafaf9]"
              >
                <div className="w-8 h-8 bg-[#e8f1fb] rounded-lg flex items-center justify-center shrink-0">
                  <VideoIcon size={14} className="text-[#2383e2]" />
                </div>
                <p className="flex-1 text-[13px] text-[#37352f] truncate">
                  {video.name}
                </p>
                <button
                  type="button"
                  onClick={() => removeVideo(idx)}
                  className="p-1 text-[#9b9a97] hover:text-[#eb5757] hover:bg-[#fff0f0] rounded transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
            <label className="inline-flex items-center gap-1.5 px-3 py-[7px] text-[12px] font-medium text-[#37352f] bg-[#f0f0ef] border border-[#e3e2df] rounded-md cursor-pointer hover:bg-[#e8e8e5] transition-colors">
              <Plus size={13} /> Add Video
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="hidden"
                onChange={handleVideos}
              />
            </label>
          </div>
        </Field>

        {/* Documents */}
        <Field label="Documents (PDF, Manuals)" full>
          <div className="space-y-1.5">
            {watch('media.documents')?.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 border border-[#e3e2df] rounded-lg bg-[#fafaf9]"
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-[#9b9a97]" />
                  <span className="text-[13px] text-[#37352f]">{doc.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      'media.documents',
                      getValues('media.documents').filter((_, i) => i !== idx),
                    )
                  }
                  className="p-1 text-[#9b9a97] hover:text-[#eb5757] hover:bg-[#fff0f0] rounded transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
            <label className="inline-flex items-center gap-1.5 px-3 py-[7px] text-[12px] font-medium text-[#37352f] bg-[#f0f0ef] border border-[#e3e2df] rounded-md cursor-pointer hover:bg-[#e8e8e5] transition-colors">
              <Plus size={13} /> Upload Document
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleDocs}
              />
            </label>
          </div>
        </Field>
      </Section>

      {/* ════════════════════════════════ SHIPPING ══════════════════════════════ */}
      <Section title="Shipping" defaultOpen={false}>
        {/* Weight — value + unit combined */}
        <Field label="Weight">
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className={`${T.input} flex-1`}
              {...register('shipping.weight.value')}
            />
            <select
              className={`${T.select} w-20`}
              {...register('shipping.weight.unit')}
            >
              {['kg', 'g', 'lb', 'oz'].map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </Field>

        {/* Dimensions */}
        <Field label="Dimensions (L × W × H cm)">
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              placeholder="L"
              className={`${T.input} flex-1 min-w-0`}
              {...register('shipping.dimensions.length')}
            />
            <input
              type="number"
              min="0"
              placeholder="W"
              className={`${T.input} flex-1 min-w-0`}
              {...register('shipping.dimensions.width')}
            />
            <input
              type="number"
              min="0"
              placeholder="H"
              className={`${T.input} flex-1 min-w-0`}
              {...register('shipping.dimensions.height')}
            />
          </div>
        </Field>

        <Field label="Country of Origin">
          <input
            className={T.input}
            {...register('shipping.country_of_origin')}
            placeholder="e.g. China"
          />
        </Field>

        <Field label="HS Tariff Code">
          <input
            className={T.input}
            {...register('shipping.hs_tariff_code')}
            placeholder="e.g. 8518300000"
          />
        </Field>

        <div className="flex flex-wrap gap-5 sm:col-span-2">
          <Toggle
            id="is_ship"
            label="Is Shippable"
            register={register('shipping.is_shippable')}
          />
          <Toggle
            id="free_ship"
            label="Free Shipping"
            register={register('shipping.is_free_shipping')}
          />
          <Toggle
            id="fragile"
            label="Fragile"
            register={register('shipping.fragile')}
          />
        </div>
      </Section>

      {/* ════════════════════════════════ SEO ═══════════════════════════════════ */}
      <Section title="SEO" defaultOpen={false}>
        <Field
          label="Meta Title"
          full
          hint={`${watch('seo.meta_title')?.length || 0} / 100`}
        >
          <input
            className={T.input}
            maxLength={100}
            {...register('seo.meta_title')}
            placeholder="SEO title (60 chars recommended)"
          />
        </Field>
        <Field
          label="Meta Description"
          full
          hint={`${watch('seo.meta_description')?.length || 0} / 320`}
        >
          <textarea
            className={T.textarea}
            rows={3}
            maxLength={320}
            {...register('seo.meta_description')}
            placeholder="SEO description (160 chars recommended)"
          />
        </Field>
        <Field label="Canonical URL" full>
          <input
            className={T.input}
            {...register('seo.canonical_url')}
            placeholder="https://example.com/products/…"
          />
        </Field>
      </Section>

      {/* ════════════════════════════════ VENDOR ════════════════════════════════ */}
      <Section title="Vendor" defaultOpen={false}>
        <Field label="Vendor Name">
          <input
            className={T.input}
            {...register('vendor.vendor_name')}
            placeholder="Vendor / Supplier name"
          />
        </Field>
        <Field label="Vendor SKU">
          <input
            className={T.input}
            {...register('vendor.vendor_sku')}
            placeholder="Vendor's SKU"
          />
        </Field>
        <Field label="Commission (%)">
          <input
            type="number"
            min="0"
            max="100"
            className={T.input}
            {...register('vendor.commission_percent')}
          />
        </Field>
      </Section>

      {/* ══════════════════════════ WARRANTY & RETURNS ══════════════════════════ */}
      <Section title="Warranty & Returns" defaultOpen={false}>
        <div className="sm:col-span-2">
          <Toggle
            id="has_warranty"
            label="Has Warranty"
            register={register('warranty_and_returns.warranty.has_warranty')}
          />
        </div>

        {watch('warranty_and_returns.warranty.has_warranty') && (
          <>
            <Field label="Duration (months)">
              <input
                type="number"
                min="0"
                className={T.input}
                {...register('warranty_and_returns.warranty.duration_months')}
              />
            </Field>
            <Field label="Warranty Type">
              <input
                className={T.input}
                {...register('warranty_and_returns.warranty.type')}
                placeholder="e.g. manufacturer"
              />
            </Field>
            <Field label="Warranty Description" full>
              <input
                className={T.input}
                {...register('warranty_and_returns.warranty.description')}
              />
            </Field>
          </>
        )}

        <Field label="Return Window (days)">
          <input
            type="number"
            min="0"
            className={T.input}
            {...register(
              'warranty_and_returns.return_policy.return_window_days',
            )}
          />
        </Field>
        <Field label="Restocking Fee (%)">
          <input
            type="number"
            min="0"
            max="100"
            className={T.input}
            {...register(
              'warranty_and_returns.return_policy.restocking_fee_percent',
            )}
          />
        </Field>
        <div className="sm:col-span-2">
          <Toggle
            id="is_returnable"
            label="Is Returnable"
            register={register(
              'warranty_and_returns.return_policy.is_returnable',
            )}
          />
        </div>
      </Section>

      {/* ════════════════════════════════ SUBMIT ════════════════════════════════ */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 text-[13px] font-medium text-[#37352f] bg-white border border-[#e3e2df] rounded-lg hover:bg-[#f7f6f3] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 text-[13px] font-medium text-white bg-[#2383e2] rounded-lg hover:bg-[#1a6abf] disabled:opacity-60 disabled:cursor-not-allowed min-w-[120px] transition-colors"
        >
          {isLoading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
