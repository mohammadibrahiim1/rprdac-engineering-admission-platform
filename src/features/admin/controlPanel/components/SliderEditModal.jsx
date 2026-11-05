import React from 'react';
import { X, Loader2 } from 'lucide-react';
import { useSliderManager } from '../hooks/useSliderManager';

const SliderEditModal = ({ data, close }) => {
  const { register, handleSubmit, handleUpdateSlider, isUpdating } =
    useSliderManager({
      data,
      close,
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        {/* Close Button */}
        <button
          onClick={close}
          type="button"
          className="absolute p-2 text-gray-500 rounded-lg top-4 right-4 hover:bg-gray-100 hover:text-gray-800 transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="mb-4 text-lg font-bold text-gray-800">Edit Slider</h2>

        <form onSubmit={handleSubmit(handleUpdateSlider)} className="space-y-4">
          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-600">
              Headline
            </label>
            <input
              {...register('text')}
              type="text"
              className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Headline"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-600">
              Sub Text
            </label>
            <textarea
              {...register('sub_text')}
              rows={3}
              className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none"
              placeholder="Sub text"
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-semibold text-gray-600">
              Slider Image
            </label>
            <input
              type="file"
              accept="image/*"
              {...register('sliderImage')}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full py-2.5 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {isUpdating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Please wait...
              </>
            ) : (
              'Update Slider'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SliderEditModal;
