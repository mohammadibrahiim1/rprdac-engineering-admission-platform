import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUpdateGalleryImagesMutation } from '../../../../../redux/features/slider/sliderApi';

const GalleryEditModal = ({ data, close }) => {
  const { register, handleSubmit } = useForm();

  const [updateGallery, { isLoading }] = useUpdateGalleryImagesMutation();

  const onSubmit = async (form) => {
    try {
      const formData = new FormData();

      formData.append('galleryImages', form.image[0]);

      await updateGallery({
        id: data.id,
        formData,
      }).unwrap();

      toast.success('Gallery Image Updated');
      close();
    } catch (err) {
      toast.error(err?.data?.message || 'Update Failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-[420px] p-6 bg-white shadow-lg rounded-xl">
        {/* Close Button */}
        <button
          onClick={close}
          className="absolute p-2 rounded-lg top-3 right-3 hover:bg-gray-100"
        >
          <X size={18} />
        </button>

        <h2 className="mb-4 text-lg font-semibold">Update Gallery Image</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="file" {...register('image', { required: true })} />

          <button
            disabled={isLoading}
            className="w-full py-2 text-white bg-black rounded-lg"
          >
            {isLoading ? 'Updating...' : 'Update Image'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GalleryEditModal;
