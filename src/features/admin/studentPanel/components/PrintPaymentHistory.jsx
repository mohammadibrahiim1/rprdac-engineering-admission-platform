import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, FileText, Receipt } from 'lucide-react';
import InvoiceA4 from './InvoiceA4';
import InvoicePOS from './InvoicePos';

export default function PrintPaymentHistory({
  invoice,
  onClose,
  showPrintModal,
}) {
  const [printType, setPrintType] = useState('a4');
  const printRef = useRef(null);

  const handlePrint = () => {
    if (!printRef.current) return;

    const content = printRef.current.innerHTML;
    const pageConfig =
      printType === 'a4'
        ? 'size: 210mm 297mm; margin: 0;'
        : 'size: 80mm auto; margin: 0;';

    const win = window.open(
      '',
      '_blank',
      'width=900,height=750,scrollbars=yes',
    );
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Invoice ${invoice?.invoiceNumber || 'Receipt'}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              background: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @page { ${pageConfig} }
            @media print { body { margin: 0; padding: 0; } }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
      win.close();
    }, 500);
  };

  const formats = [
    {
      id: 'a4',
      label: 'A4 Format',
      sub: 'Dual-copy · 210 × 297 mm',
      Icon: FileText,
    },
    {
      id: 'pos',
      label: 'POS Thermal',
      sub: 'Single-copy · 80 mm roll',
      Icon: Receipt,
    },
  ];

  return (
    <AnimatePresence>
      {showPrintModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
          style={{
            background: 'rgba(15,23,42,0.55)',
            backdropFilter: 'blur(6px)',
          }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex flex-col w-full overflow-hidden bg-white shadow-2xl rounded-2xl"
            style={{ maxWidth: '1000px', maxHeight: '94vh' }}
          >
            {/* ── HEADER ── */}
            <div className="flex items-center justify-between flex-shrink-0 px-5 py-4 border-b sm:px-6 border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center shadow-sm w-9 h-9 rounded-xl"
                  style={{
                    background:
                      'linear-gradient(135deg, #1e293b 0%, #3730a3 100%)',
                  }}
                >
                  <Printer size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Print Invoice
                  </p>
                  <p className="text-sm font-black text-slate-800">
                    #{invoice?.invoiceNumber || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 transition-all rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── FORMAT SELECTOR ── */}
            <div className="flex items-center gap-3 px-5 sm:px-6 py-3.5 border-b border-slate-100 bg-white flex-shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1 hidden sm:block">
                Layout
              </span>
              {formats?.map(({ id, label, sub, Icon }) => {
                const active = printType === id;
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => setPrintType(id)}
                    className={`
                    flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-left transition-all
                    ${
                      active
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                    }
                  `}
                  >
                    <Icon
                      size={14}
                      className={active ? 'text-indigo-600' : 'text-slate-400'}
                    />
                    <div>
                      <div
                        className={`text-xs font-bold leading-tight ${
                          active ? 'text-indigo-900' : 'text-slate-700'
                        }`}
                      >
                        {label}
                      </div>
                      <div
                        className={`text-[10px] leading-tight ${
                          active ? 'text-indigo-500' : 'text-slate-400'
                        }`}
                      >
                        {sub}
                      </div>
                    </div>
                    {active && (
                      <div className="ml-1 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── PREVIEW AREA ── */}
            <div
              className="flex items-start justify-center flex-1 p-4 overflow-auto sm:p-8"
              style={{ background: '#e2e8f0', minHeight: 0 }}
            >
              {/* Checkerboard bg hint */}
              <div
                className="overflow-hidden shadow-2xl rounded-xl"
                style={{
                  boxShadow:
                    '0 25px 60px rgba(0,0,0,0.20), 0 0 0 1px rgba(0,0,0,0.06)',
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={printType}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                  >
                    {printType === 'a4' ? (
                      <div
                        style={{
                          transform: 'scale(0.75)',
                          transformOrigin: 'top center',
                          display: 'inline-block',
                        }}
                      >
                        <InvoiceA4 ref={printRef} invoice={invoice} />
                      </div>
                    ) : (
                      <div
                        style={{
                          transform: 'scale(0.95)',
                          transformOrigin: 'top center',
                          display: 'inline-block',
                        }}
                      >
                        <InvoicePOS ref={printRef} invoice={invoice} />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* ── FOOTER ACTIONS ── */}
            <div className="flex items-center justify-between flex-shrink-0 gap-3 px-5 py-4 border-t sm:px-6 border-slate-100 bg-slate-50/80">
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {printType === 'a4'
                  ? 'Preview scaled to 75% — printed at full A4 size'
                  : 'Prints at 80mm thermal width'}
              </p>
              <div className="flex items-center gap-2.5 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold transition-colors border text-slate-600 border-slate-200 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handlePrint}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white transition-all shadow-md rounded-xl"
                  style={{
                    background:
                      'linear-gradient(135deg, #1e293b 0%, #312e81 100%)',
                    boxShadow: '0 4px 14px rgba(49,46,129,0.30)',
                  }}
                >
                  <Printer size={13} />
                  Print Invoice
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
