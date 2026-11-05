import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit2,
  Eye,
  FileText,
  Filter,
  Image as ImageIcon,
  Images,
  Moon,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  Sun,
  Trash2,
  Upload,
  X,
  Zap,
  CheckSquare,
  Square,
  RefreshCw,
} from 'lucide-react';
import BreadCrumbMenu from '../../../../../components/BreadCrumbMenu';

import AddProduct from '../components/AddProduct';
import ProductList from '../components/ProductList';
import ProductEditModal from '../components/ProductEditModal';
import {
  useCreateProductMutation,
  useDeleteMultipleProductsMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from '../../../../bookshop/services/productApi';

const CATEGORIES = [
  'electronic',
  'book',
  'Self-Help',
  'Sci-Fi',
  'Dystopia',
  'History',
  'Productivity',
  'Fiction',
  'Biography',
  'Science',
];

const AVAILABILITY_OPTIONS = ['available', 'out-of-stock', 'upcoming'];

const SORT_OPTIONS = [
  { value: 'title', label: 'Title' },
  { value: 'price', label: 'Price' },
  { value: 'stock', label: 'Stock' },
  { value: 'created_at', label: 'Date Added' },
];

const formatPrice = (price, discount) => {
  if (price === 'TBA' || price === null || price === undefined)
    return { original: 'TBA', discounted: null };
  const num = parseFloat(price);
  if (isNaN(num)) return { original: 'TBA', discounted: null };
  if (discount > 0) {
    const discounted = num - (num * discount) / 100;
    return { original: num.toFixed(2), discounted: discounted.toFixed(2) };
  }
  return { original: num.toFixed(2), discounted: null };
};

const getAvailabilityBadge = (availability) => {
  switch (availability) {
    case 'available':
      return {
        text: 'Available',
        color:
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        dot: 'bg-emerald-500',
      };
    case 'out-of-stock':
      return {
        text: 'Out of stock',
        color:
          'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        dot: 'bg-rose-500',
      };
    default:
      return {
        text: 'Upcoming',
        color:
          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        dot: 'bg-amber-500',
      };
  }
};

// ----------------------------------------------------------------------
// THUMBNAIL IMAGES MANAGER COMPONENT
// ----------------------------------------------------------------------
const ThumbImagesManager = ({ thumbImages, setThumbImages }) => {
  const inputRef = React.useRef(null);

  const handleAdd = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return;
      }
      const preview = URL.createObjectURL(file);
      setThumbImages((prev) => [...prev, { file, preview, caption: '' }]);
    });
    e.target.value = null;
  };

  const handleRemove = (idx) => {
    setThumbImages((prev) => {
      const next = [...prev];
      if (next[idx].preview?.startsWith('blob:'))
        URL.revokeObjectURL(next[idx].preview);
      next.splice(idx, 1);
      return next;
    });
  };

  const handleCaption = (idx, caption) => {
    setThumbImages((prev) =>
      prev.map((img, i) => (i === idx ? { ...img, caption } : img)),
    );
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {thumbImages?.map((img, idx) => (
          <div key={idx} className="flex flex-col gap-1.5">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <img
                src={img.preview || img.url}
                alt=""
                className="object-cover w-full h-full"
              />
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
              >
                <X size={10} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Caption..."
              value={img.caption || ''}
              onChange={(e) => handleCaption(idx, e.target.value)}
              className="px-2 py-1 text-xs text-gray-700 bg-white border border-gray-200 rounded dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="aspect-[2/3] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition"
        >
          <Plus size={20} />
          <span className="text-xs">Add image</span>
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleAdd}
      />
    </div>
  );
};

// ----------------------------------------------------------------------
// IMAGE DROP ZONE COMPONENT
// ----------------------------------------------------------------------
const ImageDropZone = ({
  label,
  preview,
  onChange,
  onClear,
  accept = 'image/*',
  hint,
}) => {
  const [drag, setDrag] = useState(false);
  const inputRef = React.useRef(null);

  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
          {label}
        </label>
      )}
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt=""
            className="object-cover w-24 h-32 border border-gray-200 rounded-lg dark:border-gray-700"
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute flex items-center justify-center w-5 h-5 text-white transition bg-gray-800 rounded-full -top-2 -right-2 hover:bg-gray-900"
          >
            <X size={10} />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${drag ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const file = e.dataTransfer.files[0];
            if (file) onChange({ target: { files: [file] } });
          }}
        >
          <Upload size={20} className="mx-auto mb-2 text-gray-400" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {hint || 'Click or drag to upload'}
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onChange}
      />
    </div>
  );
};

// ----------------------------------------------------------------------
// SKELETON LOADER
// ----------------------------------------------------------------------
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[40, 44, 140, 100, 80, 70, 60, 80, 90].map((w, i) => (
      <td key={i} className="px-3 py-3">
        <div
          className="h-3.5 rounded bg-gray-200 dark:bg-gray-700"
          style={{ width: `${w}%` }}
        />
      </td>
    ))}
  </tr>
);

const BookManagement = () => {
  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bm_darkMode') || 'false');
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem('bm_darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // UI state
  const [activeTab, setActiveTab] = useState('list');
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [attributes, setAttributes] = useState([{ key: '', value: '' }]);

  const addAttribute = () => {
    setAttributes([...attributes, { key: '', value: '' }]);
  };

  const removeAttribute = (index) => {
    const filtered = attributes?.filter((_, i) => i !== index);
    setAttributes(filtered);
  };

  const handleAttributeChange = (index, field, value) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };
  const [thumbImages, setThumbImages] = useState([]); // [{ file: File, preview: "url" }]

  const handleThumbChange = (e) => {
    const files = Array.from(e.target.files);

    const newImages = files.map((file) => ({
      file: file,
      preview: URL.createObjectURL(file), // ব্রাউজারে দেখানোর জন্য টেম্পোরারি লিঙ্ক
    }));

    setThumbImages((prev) => [...prev, ...newImages]);
  };

  const removeThumb = (index) => {
    setThumbImages((prev) => {
      const updated = [...prev];
      // মেমোরি থেকে টেম্পোরারি ইউআরএল রিলিজ করা ভালো প্র্যাকটিস
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  // Filters & pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [availability, setAvailability] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Edit modal
  const [editingBook, setEditingBook] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Add form state
  const [imagePreview, setImagePreview] = useState(null);
  const [bookImage, setBookImage] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [bookPDF, setBookPDF] = useState(null);

  // API hooks
  const filters = useMemo(() => {
    const f = {};
    if (searchTerm) f.title = searchTerm;
    if (category) f.category = category;
    if (availability) f.availability = availability;
    return f;
  }, [searchTerm, category, availability]);

  const {
    data: productsData,
    isLoading: isFetchingBooks,
    refetch,
  } = useGetProductsQuery({ page, limit, sortBy, sortOrder, filters });
  const [postProduct, { isLoading: isAddingBook }] = useCreateProductMutation();
  const [deleteMultipleProduct, { isLoading: isDeletingProduct }] =
    useDeleteMultipleProductsMutation();
  const [updateProduct, { isLoading: isUpdatingProduct }] =
    useUpdateProductMutation();

  const books = productsData?.data || [];
  const pagination = productsData?.pagination || {
    page: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
    total: 0,
  };

  // Add form
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    formState: { errors: addErrors },
    watch,
    reset,
  } = useForm({
    defaultValues: {
      title: '',
      author: '',
      edition: '',
      price: '',
      category: '',
      discount: '',
      stock: '',
      availability: 'available',
      description: '',
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setBookImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('PDF must be less than 50MB');
      return;
    }
    setBookPDF(file);
    setPdfName(file.name);
  };

  const handleUpdateProduct = async (formData) => {
    try {
      const res = await updateProduct({
        id: editingBook._id,
        data: formData,
      }).unwrap();

      toast.success('Product updated!');
      setIsEditModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.message || 'Update failed');
    }
  };

  //create product
  const onSubmitAdd = async (data) => {
    try {
      const formData = new FormData();

      // ১. সাধারণ টেক্সট ডাটা অ্যাপেন্ড করা
      formData.append('title', data.title);
      formData.append('author', data.author);
      formData.append('summary', data.summary || '');
      formData.append('description', data.description || '');
      formData.append('category', data.category || 'General');
      formData.append('price', data.price);
      formData.append('edition', data.edition);
      formData.append('stock', data.stock);
      formData.append('brandName', data.brand || '');
      // আপনার ব্যাকএন্ডে availability এবং author ফিল্ড থাকলে সেগুলোও যোগ করুন

      // ২. মেইন কভার ইমেজ (খুবই গুরুত্বপূর্ণ)
      // আমরা register("image") ব্যবহার করেছি, তাই data.image[0]-এ ফাইলটি থাকবে
      if (data.image && data.image[0]) {
        formData.append('image', data.image[0]);
      } else {
        alert('Please select a cover image!');
        return;
      }

      // ৩. পিডিএফ ফাইল
      if (data.pdf && data.pdf[0]) {
        formData.append('pdf', data.pdf[0]);
      }

      // ৪. মাল্টিপল থাম্বনেইল ইমেজ (thumbImages state থেকে)
      if (thumbImages && thumbImages.length > 0) {
        thumbImages.forEach((img) => {
          // ব্যাকএন্ডে multer-এ এই নামটি 'thumbImage' হিসেবে থাকতে হবে
          formData.append('thumbImage', img.file);
        });
      }

      // ৫. ডাইনামিক এট্রিবিউটস (JSON String হিসেবে)
      const attrObject = {};
      attributes.forEach((attr) => {
        if (attr.key && attr.value) {
          attrObject[attr.key] = attr.value;
        }
      });
      formData.append('attributes', JSON.stringify(attrObject));

      // API Call
      await postProduct(formData).unwrap();

      alert('Product Created Successfully');

      // ফর্ম এবং স্টেট রিসেট করা
      setImagePreview(null);
      setPdfName('');
      setThumbImages([]);
      setAttributes([{ key: '', value: '' }]);
      setActiveTab('list');
    } catch (error) {
      alert(error?.data?.message || 'Something went wrong');
    }
  };

  const handleEditClick = (book) => {
    setEditingBook(book);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (idsArray) => {
    if (!Array.isArray(idsArray) || idsArray.length === 0) return;

    const isMultiple = idsArray.length > 1;
    const confirmMessage = isMultiple
      ? `Are you sure you want to delete these ${idsArray.length} products?`
      : 'Are you sure you want to delete this product?';

    if (!window.confirm(confirmMessage)) return;

    try {
      await deleteMultipleProduct(idsArray).unwrap();

      toast.success(
        isMultiple
          ? 'Products deleted successfully!'
          : 'Product deleted successfully!',
      );
      refetch();

      if (isMultiple && typeof setSelectedBooks === 'function') {
        setSelectedBooks([]);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete product(s)');
    }
  };

  // download product pdf
  const handleDownloadPdf = (pdfPath, fileName) => {
    if (!pdfPath) {
      toast.error('PDF not available');
      return;
    }
    const SERVER = import.meta.env?.VITE_SERVER_BASE_URL || '';
    const fullUrl = pdfPath.startsWith('http')
      ? pdfPath
      : `${SERVER}${pdfPath}`;
    const link = document.createElement('a');
    link.href = fullUrl;
    link.setAttribute('download', fileName || 'book.pdf');
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelectBook = (id) =>
    setSelectedBooks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const toggleSelectAll = () => {
    if (selectedBooks.length === books.length && books.length > 0)
      setSelectedBooks([]);
    else setSelectedBooks(books.map((b) => b._id));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) setPage(newPage);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-950 text-gray-100' : 'bg-white text-gray-900'}`}
    >
      {/* Notion Nav */}
      <nav className="sticky top-0 z-0 flex items-center justify-between px-6 bg-white border-b border-gray-100 h-11">
        <div className="flex items-center gap-2 text-[13px] opacity-70 overflow-hidden whitespace-nowrap">
          <BreadCrumbMenu />
        </div>
      </nav>

      <main className="px-4 py-8 font-sans">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Zap size={20} className="text-blue-500" />
            <h2 className="text-2xl font-bold tracking-tight">
              Library Inventory
            </h2>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage books, track stock levels, and update metadata across your
            entire catalog.
          </p>
        </div>

        <div className="flex gap-1 mb-6 border-b border-gray-200 font-sans dark:border-gray-800">
          {[
            {
              id: 'list',
              label: 'All Products',
              icon: BookOpen,
              count: pagination?.total,
            },
            { id: 'add', label: 'Add Product', icon: Plus, count: null },
          ]?.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 pb-2 text-sm font-medium transition-all ${active ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              >
                <Icon size={14} /> {tab.label}
                {tab.count !== null && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'list' ? (
            <ProductList
              key="list"
              books={books}
              pagination={pagination}
              loading={isFetchingBooks}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              category={category}
              setCategory={setCategory}
              availability={availability}
              setAvailability={setAvailability}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              onEdit={handleEditClick}
              handleDelete={handleDelete}
              onDownloadPdf={handleDownloadPdf}
              selectedBooks={selectedBooks}
              toggleSelectBook={toggleSelectBook}
              toggleSelectAll={toggleSelectAll}
              // onBulkDelete={handleBulkDelete}
              onPageChange={handlePageChange}
              itemsPerPage={limit}
            />
          ) : (
            <AddProduct
              key="add"
              register={registerAdd}
              handleSubmit={handleSubmitAdd}
              onSubmit={onSubmitAdd}
              errors={addErrors}
              isLoading={isAddingBook}
              onCancel={() => setActiveTab('list')}
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
              pdfName={pdfName}
              setPdfName={setPdfName}
              handleImageChange={handleImageChange}
              handlePdfChange={handlePdfChange}
              thumbImages={thumbImages}
              setThumbImages={setThumbImages}
              attributes={attributes}
              addAttribute={addAttribute}
              removeAttribute={removeAttribute}
              handleThumbChange={handleThumbChange}
              removeThumb={removeThumb}
              setAttributes={setAttributes}
              handleAttributeChange={handleAttributeChange}
            />
          )}
        </AnimatePresence>

        <ProductEditModal
          isOpen={isEditModalOpen}
          book={editingBook}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingBook(null);
          }}
          onSave={handleUpdateProduct}
          darkMode={darkMode}
          isUpdating={isUpdatingProduct}
        />
      </main>
    </div>
  );
};

export default BookManagement;
