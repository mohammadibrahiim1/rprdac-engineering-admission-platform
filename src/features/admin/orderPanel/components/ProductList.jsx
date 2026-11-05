import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ImageIcon,
  Trash2,
  Edit,
  Download,
  Inbox,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Package,
  Tag,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

// ─── Constants ─────────────────────────────────────────────────────────────

const SERVER =
  (typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_SERVER_BASE_URL) ||
  '';

// ─── Normalize raw product document to flat view model ────────────────────

const normalizeProduct = (rawDoc) => {
  if (!rawDoc) return null;

  const basicInfo = rawDoc.basic_info || {};
  const pricing = rawDoc.pricing || {};
  const inventory = rawDoc.inventory || {};
  const category = rawDoc.category || {};
  const media = rawDoc.media || {};

  // Extract PDF URL from media.documents if any
  let pdfUrl = null;
  if (media.documents && Array.isArray(media.documents)) {
    const pdfDoc = media.documents.find(
      (doc) => doc.type === 'pdf' || doc.name?.endsWith('.pdf'),
    );
    if (pdfDoc && pdfDoc.url) pdfUrl = pdfDoc.url;
  }

  const effectivePrice =
    pricing.is_on_sale && pricing.sale_price != null
      ? pricing.sale_price
      : pricing.base_price;

  return {
    id: rawDoc._id,
    _raw: rawDoc, // keep original for edit
    sku: rawDoc.sku || '—',
    title: basicInfo.name || 'Untitled',
    brand: basicInfo.brand || '—',
    slNo: basicInfo.sl_no || '—',
    edition: basicInfo.edition || null,
    category: {
      primary: {
        id: category.primary?.id || '',
        name: category.primary?.name || '—',
        slug: category.primary?.slug || '',
      },
      secondary: category.secondary?.name || '',
      tertiary: category.tertiary?.name || '',
    },
    rawStatus: rawDoc.status || 'draft',
    currency: pricing.currency || 'BDT',
    basePrice: pricing.base_price != null ? pricing.base_price : null,
    salePrice: pricing.sale_price != null ? pricing.sale_price : null,
    isOnSale: !!pricing.is_on_sale && pricing.sale_price != null,
    effectivePrice: effectivePrice != null ? effectivePrice : null,
    inventory: {
      quantity: inventory.quantity ?? 0,
      reserved_quantity: inventory.reserved_quantity ?? 0,
      available_quantity: inventory.available_quantity ?? 0,
      low_stock_threshold: inventory.low_stock_threshold ?? 5,
      in_stock: inventory.in_stock ?? inventory.quantity > 0,
      allow_backorder: inventory.allow_backorder ?? false,
    },
    threshold: inventory.low_stock_threshold ?? 5,
    stock: inventory.quantity ?? 0,
    thumbnail: media.thumbnail || null,
    pdfUrl: pdfUrl,
    tags: rawDoc.tags || [],
    created_at: rawDoc.created_at,
    updated_at: rawDoc.updated_at,
  };
};

// ─── Stock status helper ────────────────────────────────────────────────────

const getStockBadge = (stock, threshold) => {
  if (stock === 0)
    return { label: 'Out of Stock', variant: 'danger', Icon: XCircle };
  if (stock <= threshold)
    return { label: 'Low Stock', variant: 'warn', Icon: AlertTriangle };
  return { label: 'In Stock', variant: 'success', Icon: CheckCircle2 };
};

const getStatusBadge = (rawStatus) => {
  const map = {
    active: { label: 'Active', variant: 'success' },
    inactive: { label: 'Inactive', variant: 'neutral' },
    draft: { label: 'Draft', variant: 'warn' },
    archived: { label: 'Archived', variant: 'neutral' },
    available: { label: 'Available', variant: 'success' },
    'out-of-stock': { label: 'Out of Stock', variant: 'danger' },
    discontinued: { label: 'Discontinued', variant: 'neutral' },
    upcoming: { label: 'Upcoming', variant: 'info' },
  };
  const raw = (rawStatus ?? '')
    .toLowerCase()
    .replace(/\.\.\.$/, '')
    .trim();
  return map[raw] ?? { label: rawStatus ?? '—', variant: 'neutral' };
};

// ─── Format currency ────────────────────────────────────────────────────────

const formatPrice = (amount, currency = 'BDT') => {
  if (amount == null || amount === 'TBA') return 'TBA';
  try {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
};

// ─── Image resolution ───────────────────────────────────────────────────────

// const resolveImageSrc = (thumbnail) => {
//   if (!thumbnail) return null;
//   const normalized = thumbnail;
//   if (normalized.startsWith("http://") || normalized.startsWith("https://"))
//     return normalized;
//   const withSlash = normalized.startsWith("/") ? normalized : `/${normalized}`;
//   return `${SERVER}${withSlash}`;
// };

// ─── Styling tokens ─────────────────────────────────────────────────────────

const BADGE_CLASSES = {
  success:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  danger:
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
  warn: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  neutral:
    'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20',
  info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20',
};

const Badge = ({ label, variant, Icon, size = 'sm' }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full border font-medium tracking-wide
    ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}
    ${BADGE_CLASSES[variant] ?? BADGE_CLASSES.neutral}`}
    style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
  >
    {Icon && <Icon size={10} strokeWidth={2.5} />}
    {label}
  </span>
);

// ─── Sortable column header ─────────────────────────────────────────────────

const SortableHeader = ({
  label,
  field,
  activeSortBy,
  activeSortOrder,
  onSort,
  className = '',
}) => {
  const isActive = activeSortBy === field;
  const SortIcon = isActive
    ? activeSortOrder === 'asc'
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <th
      className={`px-4 py-3.5 cursor-pointer select-none group whitespace-nowrap ${className}`}
      onClick={() => onSort(field)}
    >
      <span
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        {label}
        <SortIcon
          size={11}
          className={`transition-all ${isActive ? 'text-indigo-500 dark:text-indigo-400' : 'opacity-0 group-hover:opacity-60'}`}
        />
      </span>
    </th>
  );
};

// ─── Table skeleton row ─────────────────────────────────────────────────────

const SkeletonRow = ({ darkMode }) => (
  <tr
    className={`animate-pulse border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}
  >
    {[12, 10, 40, 20, 24, 16, 12, 20, 16].map((w, i) => (
      <td key={i} className="px-4 py-4">
        <div
          className={`h-4 rounded-md ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}
          style={{ width: `${w * 4}px` }}
        />
      </td>
    ))}
  </tr>
);

// ─── Main ProductList component ─────────────────────────────────────────────

const ProductList = ({
  books = [], // raw product documents
  pagination,
  loading = false,
  darkMode = false,
  searchTerm,
  setSearchTerm,
  category,
  setCategory,
  availability,
  setAvailability,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onEdit,
  handleDelete, // expects (ids: string | string[]) -> void
  onDownloadPdf,
  selectedBooks = [],
  toggleSelectBook,
  toggleSelectAll,
  onPageChange,
}) => {
  // ── Normalise incoming documents ──────────────────────────────────────────
  const products = useMemo(() => {
    return books.filter(Boolean).map(normalizeProduct).filter(Boolean);
  }, [books]);

  // ── Apply filters & sorting ───────────────────────────────────────────────
  const filteredAndSorted = useMemo(() => {
    let filtered = [...products];

    // Search term (title, brand, sku)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term),
      );
    }

    // Category filter (primary category name)
    if (category) {
      filtered = filtered.filter((p) => p.category.primary.name === category);
    }

    // Availability / status filter
    if (availability) {
      if (availability === 'out-of-stock') {
        filtered = filtered.filter((p) => p.stock === 0);
      } else {
        filtered = filtered.filter((p) => p.rawStatus === availability);
      }
    }

    // Sorting
    if (sortBy) {
      filtered.sort((a, b) => {
        let aVal, bVal;
        switch (sortBy) {
          case 'title':
            aVal = a.title.toLowerCase();
            bVal = b.title.toLowerCase();
            break;
          case 'brand':
            aVal = a.brand.toLowerCase();
            bVal = b.brand.toLowerCase();
            break;
          case 'category':
            aVal = a.category.primary.name.toLowerCase();
            bVal = b.category.primary.name.toLowerCase();
            break;
          case 'sku':
            aVal = a.sku;
            bVal = b.sku;
            break;
          case 'price':
            aVal = a.effectivePrice ?? 0;
            bVal = b.effectivePrice ?? 0;
            break;
          case 'stock':
            aVal = a.stock;
            bVal = b.stock;
            break;
          case 'status':
            aVal = a.rawStatus;
            bVal = b.rawStatus;
            break;
          default:
            return 0;
        }
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [products, searchTerm, category, availability, sortBy, sortOrder]);

  // ── Unique categories for filter dropdown ─────────────────────────────────
  const categoryOptions = useMemo(() => {
    const cats = [
      ...new Set(
        filteredAndSorted
          .map((p) => p.category.primary.name)
          .filter((c) => c && c !== '—'),
      ),
    ];
    return cats.sort();
  }, [filteredAndSorted]);

  const handleSort = useCallback(
    (field) => {
      if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      else {
        setSortBy(field);
        setSortOrder('asc');
      }
    },
    [sortBy, sortOrder, setSortBy, setSortOrder],
  );

  const isAllSelected =
    filteredAndSorted.length > 0 &&
    selectedBooks.length === filteredAndSorted.length;

  // const handleBulkDelete = useCallback(() => {
  //   if (selectedBooks.length > 0 && onDelete) {
  //     onDelete(selectedBooks);
  //   }
  // }, [selectedBooks, onDelete]);

  // const handleSingleDelete = useCallback(
  //   (id) => {
  //     if (onDelete) onDelete(id);
  //   },
  //   [onDelete]
  // );

  // ── Styles ────────────────────────────────────────────────────────────────

  const surface = darkMode
    ? 'bg-[#0f1117] border-slate-800'
    : 'bg-white border-slate-200';
  const inputCls = `w-full h-9 px-3 text-sm rounded-lg border outline-none transition-all
    focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400
    ${
      darkMode
        ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-600'
        : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-sm'
    }`;

  return (
    <div
      className="w-full space-y-4"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={15}
            className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none
            ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}
          />
          <input
            type="text"
            placeholder="Search by name, brand, SKU…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputCls} pl-9`}
            style={{ fontFamily: "'Inter', monospace" }}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center flex-shrink-0 gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${inputCls} w-auto pr-8`}
            style={{ fontFamily: "'Inter', monospace" }}
          >
            <option value="">All Categories</option>
            {categoryOptions?.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            {categoryOptions?.length === 0 && (
              <>
                <option value="book">Book</option>
                <option value="computer">Computer</option>
                <option value="electronic">Electronic</option>
                <option value="calculator">Calculator</option>
              </>
            )}
          </select>

          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className={`${inputCls} w-auto pr-8`}
            style={{ fontFamily: "'Inter', monospace" }}
          >
            <option value="">Any Status</option>
            <option value="active">Active</option>
            <option value="available">Available</option>
            <option value="out-of-stock">Out of Stock</option>
            <option value="draft">Draft</option>
            <option value="upcoming">Upcoming</option>
          </select>

          <button
            onClick={() => {
              setCategory('');
              setAvailability('');
              setSearchTerm('');
            }}
            className={`h-9 px-3 text-xs font-medium rounded-lg border transition-all
              ${
                darkMode
                  ? 'border-slate-700 text-slate-400 hover:bg-slate-800'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            Reset
          </button>
        </div>

        {/* Bulk Delete */}
        <AnimatePresence>
          {selectedBooks?.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.15 }}
              onClick={() => handleDelete(selectedBooks)}
              className="flex items-center flex-shrink-0 gap-2 px-4 text-sm font-semibold text-white transition-all rounded-lg shadow-lg h-9 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 shadow-rose-500/25"
              style={{ fontFamily: "'Inter', monospace" }}
            >
              <Trash2 size={14} />
              Delete ({selectedBooks.length})
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Table Card ── */}
      <div className={`rounded-xl border overflow-hidden ${surface}`}>
        {/* Results summary */}
        {!loading && filteredAndSorted.length > 0 && (
          <div
            className={`flex items-center justify-between px-5 py-2.5 border-b text-xs
            ${darkMode ? 'border-slate-800 text-slate-500 bg-slate-900/50' : 'border-slate-100 text-slate-400 bg-slate-50/50'}`}
            style={{ fontFamily: "'Inter', monospace" }}
          >
            <span className="flex items-center gap-2">
              <Package size={12} />
              <span style={{ fontFamily: "'Inter', monospace" }}>
                {filteredAndSorted.length} product
                {filteredAndSorted.length !== 1 ? 's' : ''}
                {pagination?.total &&
                pagination.total !== filteredAndSorted.length
                  ? ` of ${pagination.total}`
                  : ''}
              </span>
            </span>
            {selectedBooks.length > 0 && (
              <span
                className={`font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
                style={{ fontFamily: "'Inter', monospace" }}
              >
                {selectedBooks.length} selected
              </span>
            )}
          </div>
        )}

        {loading ? (
          /* Loading skeleton */
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} darkMode={darkMode} />
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredAndSorted?.length === 0 ? (
          /* Empty state */
          <div className="py-20 text-center">
            <div
              className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4
              ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}
            >
              <Inbox
                size={24}
                className={darkMode ? 'text-slate-600' : 'text-slate-300'}
              />
            </div>
            <p
              className={`text-base font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
              No products found
            </p>
            <p
              className={`mt-1 text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
              Adjust your filters or add a new product.
            </p>
          </div>
        ) : (
          /* Data table */
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr
                  className={`border-b ${darkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50/70'}`}
                >
                  {/* Checkbox */}
                  <th className="w-12 pl-3 py-3.5">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded accent-indigo-500"
                    />
                  </th>

                  {/* Cover */}
                  <th className="px-4 py-3.5">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500"
                      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                    >
                      Cover
                    </span>
                  </th>

                  <SortableHeader
                    label="Name"
                    field="title"
                    activeSortBy={sortBy}
                    activeSortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Brand"
                    field="brand"
                    activeSortBy={sortBy}
                    activeSortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Category"
                    field="category"
                    activeSortBy={sortBy}
                    activeSortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="SKU"
                    field="sku"
                    activeSortBy={sortBy}
                    activeSortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Price"
                    field="price"
                    activeSortBy={sortBy}
                    activeSortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Stock"
                    field="stock"
                    activeSortBy={sortBy}
                    activeSortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <SortableHeader
                    label="Status"
                    field="status"
                    activeSortBy={sortBy}
                    activeSortOrder={sortOrder}
                    onSort={handleSort}
                  />

                  {/* Actions */}
                  <th className="px-4 py-3.5 text-right pr-5">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500"
                      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                    >
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                <AnimatePresence initial={false}>
                  {filteredAndSorted?.map((product, idx) => {
                    const stockBadge = getStockBadge(
                      product.stock,
                      product.threshold,
                    );
                    const statusBadge = getStatusBadge(product.rawStatus);
                    const imgSrc = product?.thumbnail?.url;
                    const isSelected = selectedBooks.includes(product.id);

                    return (
                      <motion.tr
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, delay: idx * 0.03 }}
                        className={`group border-b transition-colors duration-150
                          ${darkMode ? 'border-slate-800/60' : 'border-slate-100'}
                          ${
                            isSelected
                              ? darkMode
                                ? 'bg-indigo-500/5'
                                : 'bg-indigo-50/60'
                              : darkMode
                                ? 'hover:bg-slate-800/40'
                                : 'hover:bg-slate-50/80'
                          }`}
                      >
                        {/* Checkbox */}
                        <td className="w-12 py-4 pl-5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectBook(product.id)}
                            className="w-4 h-4 rounded accent-indigo-500"
                          />
                        </td>

                        {/* Cover image */}
                        <td className="px-4 py-3">
                          <div
                            className={`relative w-9 h-[52px] rounded-md overflow-hidden flex-shrink-0
                            ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}
                          >
                            {imgSrc ? (
                              <img
                                src={imgSrc}
                                alt={product.title}
                                loading="lazy"
                                className="object-contain w-full h-full"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div
                                className={`flex items-center justify-center w-full h-full
                                ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}
                              >
                                <ImageIcon
                                  size={14}
                                  className="text-slate-400"
                                />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Name + description */}
                        <td className="px-4 py-3 max-w-[200px]">
                          <p
                            className={`font-semibold truncate leading-snug
                            ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}
                            style={{
                              fontFamily: "'Inter', system-ui, sans-serif",
                            }}
                          >
                            {product.title}
                          </p>
                          {product.edition && (
                            <span
                              className={`text-[11px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}
                              style={{ fontFamily: "'Inter', monospace" }}
                            >
                              Ed. {product.edition}
                            </span>
                          )}
                        </td>

                        {/* Brand / Author */}
                        <td
                          className={`px-4 py-3 truncate max-w-[140px] text-sm
                          ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
                          style={{
                            fontFamily: "'Inter', system-ui, sans-serif",
                          }}
                        >
                          {product.brand}
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3">
                          {product.category.primary.name !== '—' ? (
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border
                              ${
                                darkMode
                                  ? 'bg-slate-800 border-slate-700 text-slate-300'
                                  : 'bg-slate-100 border-slate-200 text-slate-600'
                              }`}
                              style={{
                                fontFamily: "'Inter', system-ui, sans-serif",
                              }}
                            >
                              <Tag size={9} />
                              {product.category.primary.name}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        {/* SKU */}
                        <td
                          className={`px-4 py-3 font-mono text-[11px] tracking-wide
                          ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}
                          style={{ fontFamily: "'Inter', monospace" }}
                        >
                          {product.sku}
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3">
                          <div className="flex flex-col leading-tight">
                            <span
                              className={`font-semibold tabular-nums
                              ${
                                product.isOnSale
                                  ? 'text-rose-500 dark:text-rose-400'
                                  : darkMode
                                    ? 'text-slate-100'
                                    : 'text-slate-900'
                              }`}
                              style={{ fontFamily: "'Inter', monospace" }}
                            >
                              {formatPrice(
                                product.effectivePrice,
                                product.currency,
                              )}
                            </span>
                            {product.isOnSale && (
                              <span
                                className={`text-[11px] line-through ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}
                                style={{ fontFamily: "'Inter', monospace" }}
                              >
                                {formatPrice(
                                  product.basePrice,
                                  product.currency,
                                )}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`tabular-nums font-medium text-sm
                              ${
                                product.stock === 0
                                  ? 'text-rose-500'
                                  : product.stock <= product.threshold
                                    ? 'text-amber-500'
                                    : darkMode
                                      ? 'text-slate-300'
                                      : 'text-slate-700'
                              }`}
                              style={{ fontFamily: "'Inter', monospace" }}
                            >
                              {product.stock}
                            </span>
                            <Badge
                              label={stockBadge.label}
                              variant={stockBadge.variant}
                              Icon={stockBadge.Icon}
                            />
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <Badge
                            label={statusBadge.label}
                            variant={statusBadge.variant}
                          />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 pr-5">
                          <div className="flex items-center justify-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <ActionBtn
                              title="Edit product"
                              onClick={() => onEdit(product._raw)}
                              darkMode={darkMode}
                              icon={<Edit size={14} />}
                            />
                            <ActionBtn
                              title="Delete product"
                              onClick={() => handleDelete(product?.id)}
                              darkMode={darkMode}
                              danger
                              icon={<Trash2 size={14} />}
                            />
                            {product.pdfUrl && (
                              <ActionBtn
                                title="Download PDF"
                                onClick={() =>
                                  onDownloadPdf(
                                    product.pdfUrl,
                                    `${product.title}.pdf`,
                                  )
                                }
                                darkMode={darkMode}
                                icon={<Download size={14} />}
                              />
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p
            className={`text-xs ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}
            style={{ fontFamily: "'Inter', monospace" }}
          >
            Page <span className="font-semibold">{pagination.page}</span> of{' '}
            <span className="font-semibold">{pagination.totalPages}</span>
            {pagination.total ? ` · ${pagination.total} total` : ''}
          </p>

          <div className="flex items-center gap-1">
            <NavBtn
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              darkMode={darkMode}
              icon={<ChevronLeft size={15} />}
            />

            {buildPageNumbers(pagination.page, pagination.totalPages).map(
              (item, i) =>
                item === '…' ? (
                  <span
                    key={`ellipsis-${i}`}
                    className="w-8 text-xs text-center text-slate-400"
                    style={{ fontFamily: "'Inter', monospace" }}
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => onPageChange(item)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all
                    ${
                      pagination.page === item
                        ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30'
                        : darkMode
                          ? 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                    style={{ fontFamily: "'Inter', monospace" }}
                  >
                    {item}
                  </button>
                ),
            )}

            <NavBtn
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              darkMode={darkMode}
              icon={<ChevronRight size={15} />}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Action button ──────────────────────────────────────────────────────────

const ActionBtn = ({ icon, onClick, title, darkMode, danger = false }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded-md transition-all duration-150
      ${
        danger
          ? 'hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400'
          : darkMode
            ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200'
            : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
      }`}
  >
    {icon}
  </button>
);

// ─── Nav button (pagination) ────────────────────────────────────────────────

const NavBtn = ({ icon, onClick, disabled, darkMode }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all
      ${
        darkMode
          ? 'border-slate-800 text-slate-500 hover:bg-slate-800 disabled:opacity-20'
          : 'border-slate-200 text-slate-400 hover:bg-slate-100 disabled:opacity-30'
      }`}
  >
    {icon}
  </button>
);

// ─── Pagination page numbers with ellipsis ───────────────────────────────────

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set(
    [1, total, current, current - 1, current + 1].filter(
      (n) => n >= 1 && n <= total,
    ),
  );
  const sorted = [...pages].sort((a, b) => a - b);
  const result = [];
  let prev = null;
  for (const n of sorted) {
    if (prev !== null && n - prev > 1) result.push('…');
    result.push(n);
    prev = n;
  }
  return result;
}

export default ProductList;
