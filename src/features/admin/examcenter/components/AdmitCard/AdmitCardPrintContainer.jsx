// @ts-ignore
import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import SingleAdmitCard from './SingleAdmitCard';
import { AlertCircle, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeleteBulkAdmitCardsByDateMutation } from '../../../../../../redux/features/student/studentApi';
import toast from 'react-hot-toast';

// @ts-ignore
const AdmitCardPrintContainer = ({ admitCardsData }) => {
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedDate, setSelectedDate] = useState('');
  const printRef = useRef();
  const [loading, setLoading] = useState(false);

  const handlePrintAdmitCard = useReactToPrint({
    // @ts-ignore
    content: () => printRef.current,
    documentTitle: 'Admit_Cards_RPR',
  });

  const [deleteBulkAdmitCardsByDate, { isLoading }] =
    useDeleteBulkAdmitCardsByDateMutation();

  // @ts-ignore
  const handleDelete = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!selectedDate) return;

    const confirmDelete = window.confirm(
      `Sorbonash! Apni ki nishchit? ${selectedDate} tarikh-er shob admit card permanently delete hoye jabe.`,
    );

    if (!confirmDelete) return;

    setMessage({ type: '', text: '' });

    try {
      setLoading(true);
      const response = await deleteBulkAdmitCardsByDate(selectedDate).unwrap();
      toast.success(response.message);
      setSelectedDate('');
    } catch (error) {
      // @ts-ignore
      toast.error(error?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  // ১টি লিগ্যাল পেজে পারফেক্টলি ৮টি কার্ড ফিক্সড
  const CARDS_PER_PAGE = 8;

  const chunkedCards = [];
  if (admitCardsData && admitCardsData.length > 0) {
    for (let i = 0; i < admitCardsData.length; i += CARDS_PER_PAGE) {
      chunkedCards.push(admitCardsData.slice(i, i + CARDS_PER_PAGE));
    }
  }

  return (
    <div>
      {/* Top Action Bar UI */}
      <div className="flex flex-col gap-6 py-2 border-b md:flex-row md:items-end md:justify-between border-slate-500">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          {/* Bulk Delete Section */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex items-center gap-3 p-2"
          >
            <form onSubmit={handleDelete} className="flex items-center gap-2">
              <div className="relative group">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-10 px-3 py-2 text-xs font-bold transition-all bg-transparent border outline-none cursor-pointer border-slate-200 rounded focus:ring-2 focus:ring-red-500/20 focus:border-red-500 w-36 group-hover:border-slate-300"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !selectedDate}
                className="h-10 px-4 text-[11px] font-bold tracking-widest uppercase transition-all bg-slate-900 text-white rounded hover:bg-red-600 disabled:opacity-20 flex items-center gap-2 shadow-sm active:scale-95"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span className="hidden lg:inline">Wipe Date</span>
                  </>
                )}
              </button>
            </form>

            <AnimatePresence>
              {message.text && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`absolute -bottom-10 right-0 px-3 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-2 shadow-sm whitespace-nowrap ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-700 border-green-100'
                      : 'bg-red-50 text-red-700 border-red-100'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <AlertCircle size={12} />
                  )}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Download Action Trigger */}
          <button
            onClick={handlePrintAdmitCard}
            className="flex items-center justify-center gap-2 px-8 text-xs font-bold tracking-widest text-white uppercase transition-all bg-cyan-600 shadow-lg h-14 md:h-11 rounded hover:bg-cyan-700 shadow-indigo-100 active:scale-95"
          >
            Download Cards
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="hidden">
        <div
          // @ts-ignore
          ref={printRef}
          id="print-area"
        >
          <style>
            {`
              @media print {
                body * { visibility: hidden; }
                #print-area, #print-area * { visibility: visible; }
                
                #print-area {
                  position: absolute !important;
                  left: 0;
                  top: 0;
                  width: 100%;
                  display: block !important;
                }

                .print-page {
                  display: grid !important;
                  grid-template-columns: repeat(2, 1fr) !important;
                  grid-template-rows: repeat(4, 1fr) !important;
                  
                  /* কলাম ও রো এর মাঝের গ্যাপ পারফেক্টলি অ্যালাইনড */
                  gap: 12px !important; 
                  
                  /* ওপর-নিচের এক্সট্রা মার্জিন ও বর্ডার কাটাকাটি রোধ করতে ক্যালকুলেটেড হাইট */
                  height: calc(355.6mm - 16mm) !important; 
                  width: 100% !important;
                  box-sizing: border-box !important;
                  
                  page-break-after: always !important;
                  break-after: page !important;
                }

                .print-page:last-child {
                  page-break-after: auto !important;
                  break-after: auto !important;
                }

                .admit-card-wrapper {
                  width: 100% !important;
                  height: 100% !important;
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                  overflow: hidden !important;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  box-sizing: border-box !important;
                }

                @page {
                  size: legal portrait;
                  /* প্রিন্টারের নিজের সেফ মার্জিন এখানে পুশ করা হয়েছে যাতে বর্ডার না কাটে */
                  margin: 8mm 6mm !important; 
                }
              }
            `}
          </style>

          {chunkedCards?.map((pageCards, pageIndex) => (
            <div key={pageIndex} className="print-page">
              {pageCards?.map((card) => (
                <div key={card?._id} className="admit-card-wrapper">
                  <SingleAdmitCard data={card} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdmitCardPrintContainer;
