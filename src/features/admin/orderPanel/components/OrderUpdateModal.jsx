import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const SERVER = import.meta.env.VITE_SERVER_BASE_URL;

const OrderUpdateModal = ({ order, onClose, onUpdate }) => {
  const [status, setStatus] = useState('');
  const [discount, setDiscount] = useState('');
  const [items, setItems] = useState(
    order?.items?.map((item) => ({ ...item, sl_no: item.sl_no || '' })) || [],
  );

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent scroll when modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => (document.body.style.overflow = 'auto');
  }, []);

  // ✅ FIX: was called as handleSlNoChange(e.target.value) — missing index
  const handleSlNoChange = (index, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], sl_no: value };
    setItems(updated);
  };

  const handleSubmit = async () => {
    const payload = {};

    if (status) payload.status = status;

    if (discount) {
      payload.discounts = [
        {
          discountCode: 'MANUAL',
          amount: Number(discount),
          description: 'Manual Discount',
        },
      ];
    }

    const hasSlNo = items.some((item) => item.sl_no);
    if (hasSlNo) {
      payload.items = items.map((item) => ({
        ...item,
        sl_no: item.sl_no,
      }));
    }

    if (Object.keys(payload).length === 0) {
      return alert('Nothing to update');
    }

    try {
      const res = await fetch(`${SERVER}/api/order/${order._id}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        onClose();
        toast.success(res.message || 'Order update successful!');
      } else {
        toast.error(data.error?.message);
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose} // Click backdrop to close
      >
        {/* Modal Box */}
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-xl bg-white border border-gray-200 shadow-xl rounded-2xl"
          onClick={(e) => e.stopPropagation()} // Prevent backdrop close on inner click
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Update Order
              </h2>
              <p className="text-xs text-gray-500">
                Modify status, discount or serial numbers
              </p>
            </div>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5">
            {/* Status */}
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-600">
                Status
              </label>
              <select
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Select status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="processing">Processing</option>
                <option value="shipping">Shipping</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
              </select>
            </div>

            {/* Discount */}
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-600">
                Discount Amount
              </label>
              <input
                type="number"
                min={0}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 50"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>

            {/* Items — Serial Numbers */}
            {items.length > 0 && (
              <div>
                <label className="block mb-2 text-xs font-medium text-gray-600">
                  Serial Numbers
                </label>
                <div className="pr-1 space-y-2 overflow-y-auto max-h-48">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 border rounded-lg bg-gray-50"
                    >
                      {/* ✅ FIX: show product name so user knows which item they're editing */}
                      <span className="flex-1 text-sm text-gray-700 truncate">
                        {item.name || item.productName || `Item ${index + 1}`}
                      </span>
                      <input
                        type="text"
                        placeholder="Serial No."
                        className="px-3 py-2 text-sm bg-white border rounded-lg w-36 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={item.sl_no || ''}
                        // ✅ FIX: was handleSlNoChange(e.target.value) — index was missing
                        onChange={(e) =>
                          handleSlNoChange(index, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-white border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderUpdateModal;
