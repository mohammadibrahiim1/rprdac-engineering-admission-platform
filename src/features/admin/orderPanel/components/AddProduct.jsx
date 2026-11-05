import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { useCreateProductMutation } from '../../../../bookshop/services/productApi';
import ProductForm from './ProductForm';

const AddProduct = () => {
  const navigate = useNavigate();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const handleSubmit = async (formData) => {
    try {
      const result = await createProduct(formData).unwrap();
      toast.success(result?.message || 'Product created successfully!');
    } catch (err) {
      const msg = err?.data?.message || 'Failed to create product';
      toast.error(msg);
      if (err?.data?.errors) {
        err.data.errors.forEach((e) => toast.error(`${e.field}: ${e.message}`));
      }
    }
  };

  return (
    <div className="max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-500 transition-colors rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Product</h1>
          <p className="text-sm text-gray-500">
            Fill in the details to add a new product
          </p>
        </div>
      </div>

      <ProductForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Create Product"
      />
    </div>
  );
};

export default AddProduct;
