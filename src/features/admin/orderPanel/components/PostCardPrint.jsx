import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import logo from '../../../../../assets/img/log-rpr.png';

const PostCardPrint = ({ order, onAfterPrint }) => {
  const printRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
      if (onAfterPrint) onAfterPrint();
    }, 300);

    return () => clearTimeout(timer);
  }, [onAfterPrint]);

  const printedDate = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Helper function to check if text contains Bengali characters
  const isBangla = (text) => /[\u0980-\u09FF]/.test(text);

  return (
    <>
      {/* ---------- Printable Area ---------- */}
      <div
        ref={printRef}
        className="print-container relative bg-white text-gray-900 shadow-2xl w-full max-w-3xl mx-auto rounded-xl p-8 border border-gray-300 font-sans"
      >
        {/* --- Header Section with Proper Spacing --- */}
        <div className="flex items-center justify-between border-b border-gray-300 pb-6 mb-6">
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-wide text-gray-900">
              RPR DUET ADMISSION CARE
            </h1>
            <p className="text-xs text-gray-600">
              Address: M.A. Samad Villa, In front of DUET Campus, Gazipur,
              Bangladesh
            </p>
          </div>
          <div className="w-14 h-14 bg-white border border-gray-300 rounded-lg p-1 flex items-center justify-center shrink-0 shadow-sm">
            <img
              src={logo}
              alt="logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* --- From & To Section --- */}
        <div className="grid grid-cols-2 gap-6 bg-gray-50 border border-gray-300 rounded-lg p-5 mb-6 relative">
          {/* Vertical Divider */}
          <div className="absolute top-4 bottom-4 left-1/2 w-[1px] bg-gray-300 -translate-x-1/2 hidden md:block" />

          {/* From Section */}
          <div className="space-y-1 text-xs">
            <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">
              From
            </h3>
            <p className="font-semibold text-gray-900">
              RPR DUET ADMISSION CARE
            </p>
            <p className="text-gray-600">Address: DUET, Gazipur Sadar.</p>
            <p className="text-gray-600">
              Phone: +880 1742 590 128 | +880 1901 852 989
            </p>
            <p className="text-gray-600">
              Email: <span className="lowercase">rpr.group2013@gmail.com</span>
            </p>
          </div>

          {/* To Section */}
          <div className="space-y-1 text-xs">
            <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wider">
              To
            </h3>
            <p className="font-semibold text-sm text-gray-900">{order?.name}</p>
            <p className="text-gray-600">
              Address: {order?.billingAddress?.street || 'N/A'}
            </p>
            <p className="text-gray-600">
              Phone: {order?.billingAddress?.phone || 'N/A'}
            </p>
          </div>
        </div>

        {/* --- Items Table --- */}
        <div className="w-full mb-6 overflow-x-auto text-xs">
          <table className="w-full border-collapse border border-gray-300 rounded-md overflow-hidden">
            <thead>
              <tr className="bg-gray-100 text-gray-900">
                <th className="px-3 py-2.5 border border-gray-300 text-center w-12 font-semibold">
                  SL
                </th>
                <th className="px-3 py-2.5 border border-gray-300 text-left font-semibold">
                  Product
                </th>
                <th className="px-3 py-2.5 border border-gray-300 text-center w-16 font-semibold">
                  Qty
                </th>
                <th className="px-3 py-2.5 border border-gray-300 text-right font-semibold">
                  Each Price
                </th>
                <th className="px-3 py-2.5 border border-gray-300 text-right font-semibold">
                  Total Amount
                </th>
                <th className="px-3 py-2.5 border border-gray-300 text-center w-28 font-semibold">
                  Order ID
                </th>
              </tr>
            </thead>
            <tbody>
              {order?.items?.map((item, idx) => {
                const textToCheck = `${item.title} ${item.edition || ''}`;
                const containsBangla = isBangla(textToCheck);
                return (
                  <tr key={idx} className="bg-white">
                    <td className="px-3 py-2.5 border border-gray-300 text-center">
                      {idx + 1}
                    </td>
                    <td
                      className={`px-3 py-2.5 border border-gray-300 ${containsBangla ? 'font-serifbn' : 'font-sans'}`}
                    >
                      {item.title || 'N/A'}{' '}
                      {item.edition && `(${item.edition})`}
                    </td>
                    <td className="px-3 py-2.5 border border-gray-300 text-center">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-2.5 border border-gray-300 text-right">
                      ৳ {item.eachItemPrice || 'N/A'}
                    </td>
                    <td className="px-3 py-2.5 border border-gray-300 text-right">
                      ৳ {item.totalAmount || 'N/A'}
                    </td>
                    <td className="px-3 py-2.5 border border-gray-300 text-center font-mono text-[11px]">
                      {order?.orderId || 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-bold text-gray-900">
                <td
                  colSpan="4"
                  className="px-3 py-2.5 border border-gray-300 text-right"
                >
                  Grand Total (with delivery charge):
                </td>
                <td className="px-3 py-2.5 border border-gray-300 text-right">
                  ৳ {order?.totalAmount}
                </td>
                <td className="border border-gray-300"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* --- Footer --- */}
        <div className="border-t border-gray-300 pt-4 flex justify-between items-center text-[11px] text-gray-600">
          <span>Thanks for your business!</span>
          <span>Printed: {printedDate}</span>
          <span>Page 1 of 1</span>
        </div>
      </div>

      {/* --- Pixel-Perfect Print Styles with Uniform Margins --- */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 15mm;
        }

        @media print {
          body * {
            visibility: hidden;
          }

          .print-container, .print-container * {
            visibility: visible;
          }

          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 15mm !important;
            box-shadow: none !important;
            border: none !important;
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </>
  );
};

PostCardPrint.propTypes = {
  order: PropTypes.object.isRequired,
  onAfterPrint: PropTypes.func.isRequired,
};

export default PostCardPrint;
