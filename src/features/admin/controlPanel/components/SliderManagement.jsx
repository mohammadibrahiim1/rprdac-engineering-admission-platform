import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  Loader2,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Pencil,
  Image as ImageIcon,
} from 'lucide-react';

const SERVER = import.meta.env.VITE_SERVER_BASE_URL || '';

const SliderManagement = ({ manager }) => {
  const {
    sliderList,
    isFetching,
    isSaving,
    isDeleting,
    sliderData,
    setSliderData,
    sliderPreview,
    selectedIds,
    handleImageChange,
    handleSubmit,
    handleSelect,
    handleSelectAll,
    handleDelete,
    setEditSlider,
  } = manager;

  const isAllSelected =
    sliderList.length > 0 && selectedIds.length === sliderList.length;

  return (
    <div className="grid grid-cols-1 gap-8 items-start lg:grid-cols-12">
      {/* Upload/Edit Form (Sticky Left) */}
      <div className="lg:col-span-4 sticky top-6">
        <div className="p-6 bg-white border border-slate-200/80 rounded-md shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-1">
            <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-900">
              Hero Slider
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-6">
            Configure homepage hero slider details and images.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                Slider Media
              </label>
              <div className="relative border-2 border-dashed rounded-xl border-slate-200 bg-slate-50/50 p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                {sliderPreview ? (
                  <div className="relative h-28 rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={sliderPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="py-4">
                    <ImageIcon className="mx-auto w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors mb-1" />
                    <span className="text-xs text-slate-500 font-medium">
                      Select Hero Image
                    </span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                Slider ID
              </label>
              <input
                type="number"
                value={sliderData.id}
                onChange={(e) =>
                  setSliderData({ ...sliderData, id: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="e.g. 1"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                Headline Text
              </label>
              <input
                type="text"
                value={sliderData.text}
                onChange={(e) =>
                  setSliderData({ ...sliderData, text: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                placeholder="Headline phrase"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
                Sub Text / Description
              </label>
              <textarea
                value={sliderData.sub_text}
                onChange={(e) =>
                  setSliderData({ ...sliderData, sub_text: e.target.value })
                }
                className="w-full px-3 py-2 text-xs border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[80px]"
                placeholder="Sub-headline copy..."
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Save Hero Slider
            </button>
          </form>
        </div>
      </div>

      {/* Table Section */}
      <div className="lg:col-span-8 space-y-4">
        <AnimatePresence>
          {selectedIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between p-3 px-5 border border-indigo-100 shadow-sm bg-indigo-50/80 backdrop-blur-sm rounded-xl"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-semibold text-indigo-950">
                  {selectedIds.length} item(s) selected
                </span>
              </div>
              <button
                onClick={() => handleDelete(selectedIds)}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Delete Selected
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white border border-slate-200/80 rounded-md shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/30">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">
              Slider Records
            </h3>
            <span className="text-[11px] font-medium text-slate-400">
              Total: {sliderList?.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="text-[10px] font-bold uppercase bg-slate-50/60 text-slate-500 tracking-wider border-b border-slate-100">
                <tr>
                  <th className="w-12 px-6 py-3.5">
                    <input
                      type="checkbox"
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      checked={isAllSelected}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Preview</th>
                  <th className="px-6 py-3.5">Headline & Description</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isFetching ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-slate-400"
                    >
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                      Loading slider list...
                    </td>
                  </tr>
                ) : sliderList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-medium text-slate-400">
                        No sliders available
                      </p>
                    </td>
                  </tr>
                ) : (
                  sliderList?.map((item) => {
                    const idKey = String(item.id || item._id);
                    const isSelected = selectedIds.includes(idKey);
                    return (
                      <tr
                        key={item._id || item.id}
                        className={`transition-colors ${isSelected ? 'bg-indigo-50/30' : 'hover:bg-slate-50/60'}`}
                      >
                        <td className="px-6 py-3.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelect(idKey)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-3.5 font-mono text-[11px] text-slate-500">
                          #{item.id}
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="w-14 h-auto overflow-hidden">
                            <img
                              src={item?.slider_img}
                              alt={item.text}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <p className="font-semibold text-slate-800">
                            {item.text}
                          </p>
                          <p className="text-[10px] text-slate-400 max-w-xs truncate">
                            {item.sub_text}
                          </p>
                        </td>
                        <td className="px-6 py-3.5 text-right space-x-1">
                          <button
                            onClick={() => setEditSlider(item)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(idKey)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SliderManagement;
