import { useEffect, useState } from 'react';
import {
  useUpdateStudentDuePaymentMutation,
  useUpdateStudentPaymentWithCGPAMutation,
} from '../../../../../redux/features/student/studentApi';
import {
  CheckCircle,
  Info,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  X,
} from 'lucide-react';

const StudentPaymentModal = ({ selectedData, isOpen, onClose, refetch }) => {
  const [payAmount, setPayAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cgpa, setCgpa] = useState(null);
  const [cgpaDiscount, setCgpaDiscount] = useState(0);
  const [referenceDiscount, setReferenceDiscount] = useState(0);
  const [studentCashback, setStudentCashback] = useState(0);
  const [cashbackAllowed, setCashbackAllowed] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  const [updateStudentDuePayment] = useUpdateStudentDuePaymentMutation();
  const [updateStudentPaymentWithCgpa, { isLoading }] =
    useUpdateStudentPaymentWithCGPAMutation();

  useEffect(() => {
    if (cgpa >= 3.9) {
      setCgpaDiscount(selectedData?.courseFee * 0.25);
    } else if (cgpa >= 3.75) {
      setCgpaDiscount(selectedData?.courseFee * 0.15);
    } else {
      setCgpaDiscount(0);
    }
  }, [cgpa, selectedData?.courseFee]);

  useEffect(() => {
    const discount =
      selectedData?.courseFee - (selectedData?.admissionFee || 0);
    setReferenceDiscount(discount);
  }, [selectedData?.admissionFee, selectedData?.courseFee]);

  useEffect(() => {
    if (
      selectedData?.admissionFee < 11250 &&
      referenceDiscount > cgpaDiscount
    ) {
      setCashbackAllowed(false);
      setStudentCashback(0);
    } else if (
      selectedData?.admissionFee >= 11250 &&
      cgpaDiscount >= referenceDiscount
    ) {
      setCashbackAllowed(true);
      setStudentCashback(cgpaDiscount - referenceDiscount);
    } else {
      setCashbackAllowed(false);
      setStudentCashback(0);
    }
  }, [cgpaDiscount, referenceDiscount, selectedData?.admissionFee]);

  const handleSave = async () => {
    try {
      await updateStudentPaymentWithCgpa({
        id: selectedData?._id,
        data: {
          cgpa,
          cgpaDiscount,
          referenceDiscount,
          cashback: studentCashback,
        },
      }).unwrap();
      setSuccessMsg('Payment data updated successfully');
      setErrMsg('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (error) {
      setErrMsg('Failed to update payment data.');
      setSuccessMsg('');
    }
  };

  const handleStudentPayment = async (e) => {
    e.preventDefault();

    if (!payAmount || Number(payAmount) <= 0) {
      setErrMsg('Please enter a valid amount');
      return;
    }
    if (!paymentMethod) {
      setErrMsg('Please select payment method');
      return;
    }
    if (
      paymentMethod.toLowerCase() !== 'cash' &&
      (!accountNumber || !transactionId || !paymentDate)
    ) {
      setErrMsg('Please fill all banking details');
      return;
    }

    try {
      const response = await updateStudentDuePayment({
        studentId: selectedData?._id,
        payAmount,
        paymentMethod,
        accountNumber:
          paymentMethod.toLowerCase() === 'cash' ? null : accountNumber,
        transactionId:
          paymentMethod.toLowerCase() === 'cash' ? null : transactionId,
        paymentDate:
          paymentMethod.toLowerCase() === 'cash' ? null : paymentDate,
      }).unwrap();

      setSuccessMsg(response?.message || 'Payment successful');
      setErrMsg('');
      setTimeout(() => setSuccessMsg(''), 3000);

      // Clear inputs
      setPayAmount(0);
      setAccountNumber('');
      setTransactionId('');
      setPaymentDate('');
      setPaymentMethod('');
      refetch();
    } catch (error) {
      setErrMsg(error?.data?.message || 'Payment failed');
      setSuccessMsg('');
    }
  };

  const getStatusColor = () => {
    if (selectedData?.dueAmount > 0) return 'bg-amber-100 text-amber-800';
    if (selectedData?.studentReturnAmount > 0)
      return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-auto bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200">
            {/* Header */}
            {/* Header - Notion Style */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 text-gray-600 border border-gray-100 rounded-md bg-gray-50">
                  <User size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#37352F] leading-tight">
                    {selectedData?.name || 'Student Payment'}
                  </h2>
                  <p className="text-xs font-medium tracking-wider text-gray-400 uppercase">
                    ID: {selectedData?.studentId}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Main Content */}
            <div className="p-6">
              {/* Summary Card */}
              {/* <div className="p-4 mb-6 bg-white border border-gray-200 rounded shadow-sm">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Course Fee
                  </p>
                  <p className="text-xs font-semibold text-gray-800">
                    {selectedData?.courseFee?.toLocaleString('en-US',{style:'currency',currency:"BDT"}) || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500">
                    Admission Fee (After reference Discount)
                  </p>
                  <p className="font-semibold text-gray-800">
                    {selectedData?.admissionFee?.toLocaleString('en-US',{style:'currency',currency:"BDT"})}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">
                    Student Paid
                  </p>
                  <p className="font-semibold text-indigo-700">
                    {selectedData?.studentPaid?.toLocaleString('en-US',{style:'currency',currency:"BDT"}) || 0}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500">
                    {selectedData?.cashback > 0 ? "Cashback" : "Due Amount"}
                  </p>
                  <p className="font-semibold text-indigo-700">
                    {selectedData?.cashback?.toLocaleString('en-US',{style:'currency',currency:"BDT"}) > 0
                      ? selectedData?.cashback?.toLocaleString('en-US',{style:'currency',currency:"BDT"}) || 0
                      : selectedData?.dueAmount?.toLocaleString('en-US',{style:'currency',currency:"BDT"}) || 0}{" "}

                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center mt-3 text-sm text-indigo-600 hover:text-indigo-800"
              >
                {showDetails ? (
                  <>
                    <ChevronUp size={16} className="mr-1" />
                    Hide details
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} className="mr-1" />
                    Show all details
                  </>
                )}
              </button>

              {showDetails && (
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">CGPA</p>
                      <p className="text-sm text-gray-800">
                        {selectedData?.cgpa || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">
                        CGPA Discount
                      </p>
                      <p className="text-sm text-gray-800">
                        {selectedData?.cgpaDiscount || 0} BDT
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">
                        Reference Discount
                      </p>
                      <p className="text-sm text-gray-800">
                        {selectedData?.referenceDiscount || 0} BDT
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">
                        Deducted Amount (CGPA discount - Reference Discount)
                      </p>
                      <p className="font-semibold text-indigo-700">
                        {selectedData?.deductMoney || 0} BDT
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">
                        Due Amount
                      </p>
                      <p className="text-sm text-gray-800">
                        {selectedData?.dueAmount || 0} BDT
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">
                        Cashback
                      </p>
                      <p className="text-sm text-gray-800">
                        {selectedData?.cashback || 0} BDT
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div> */}
              {/* Notion Style Data Table */}
              <div className="mb-8 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                {/* Summary Grid - Quick View */}
                <div className="grid grid-cols-1 border-b border-gray-100 md:grid-cols-2 lg:grid-cols-4">
                  <div className="p-4 transition-colors border-r border-gray-100 group hover:bg-gray-50">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Course Fee
                    </p>
                    <p className="text-sm font-semibold text-[#37352F]">
                      {selectedData?.courseFee?.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'BDT',
                      }) || 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 transition-colors border-r border-gray-100 group hover:bg-gray-50">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Admission Fee(after reference)
                    </p>
                    <p className="text-sm font-semibold text-[#37352F]">
                      {selectedData?.admissionFee?.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'BDT',
                      })}
                    </p>
                  </div>
                  <div className="p-4 transition-colors border-r border-gray-100 group hover:bg-gray-50">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      Paid to Date
                    </p>
                    <p className="text-sm font-semibold text-blue-600">
                      {selectedData?.studentPaid?.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'BDT',
                      }) || 0}
                    </p>
                  </div>
                  <div className="p-4 transition-colors group hover:bg-gray-50">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {selectedData?.cashback > 0
                        ? 'Refundable'
                        : 'Balance Due'}
                    </p>
                    <p
                      className={`text-sm font-bold ${selectedData?.cashback > 0 ? 'text-green-600' : 'text-orange-600'}`}
                    >
                      {(selectedData?.cashback > 0
                        ? selectedData?.cashback
                        : selectedData?.dueAmount
                      )?.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'BDT',
                      }) || 0}
                    </p>
                  </div>
                </div>

                {/* Detail Toggle */}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-between px-4 py-2 bg-[#F7F7F5] text-[12px] font-medium text-gray-500 hover:text-gray-800 transition-all border-t border-gray-100"
                >
                  <span className="flex items-center gap-2">
                    {showDetails ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                    {showDetails
                      ? 'HIDE PROPERTY DETAILS'
                      : 'SHOW ALL PROPERTIES'}
                  </span>
                </button>

                {/* Property Table Layout */}
                {showDetails && (
                  <div className="duration-200 animate-in fade-in slide-in-from-top-1">
                    <div className="grid grid-cols-1 border-t border-gray-100 md:grid-cols-2">
                      {/* Left Column */}
                      <div className="border-r border-gray-100 divide-y divide-gray-100">
                        <div className="flex items-center px-4 py-3">
                          <span className="w-1/2 text-xs font-medium text-gray-400">
                            CGPA Score
                          </span>
                          <span className="w-1/2 text-sm text-[#37352F]">
                            {selectedData?.cgpa || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center px-4 py-3">
                          <span className="w-1/2 text-xs font-medium text-gray-400">
                            Merit Discount
                          </span>
                          <span className="w-1/2 text-sm text-[#37352F]">
                            {selectedData?.cgpaDiscount || 0} BDT
                          </span>
                        </div>
                        <div className="flex items-center px-4 py-3">
                          <span className="w-1/2 text-xs font-medium text-gray-400">
                            Reference Offset
                          </span>
                          <span className="w-1/2 text-sm text-[#37352F]">
                            {selectedData?.referenceDiscount || 0} BDT
                          </span>
                        </div>
                      </div>
                      {/* Right Column */}
                      <div className="divide-y divide-gray-100">
                        <div className="flex items-center px-4 py-3">
                          <span className="w-1/2 text-xs font-medium text-gray-400">
                            Adjusted Net
                          </span>
                          <span className="w-1/2 text-sm font-semibold text-indigo-600">
                            {selectedData?.deductMoney || 0} BDT
                          </span>
                        </div>
                        <div className="flex items-center px-4 py-3">
                          <span className="w-1/2 text-xs font-medium text-gray-400">
                            Final Due
                          </span>
                          <span className="w-1/2 text-sm text-[#37352F]">
                            {selectedData?.dueAmount || 0} BDT
                          </span>
                        </div>
                        <div className="flex items-center px-4 py-3">
                          <span className="w-1/2 text-xs font-medium text-gray-400">
                            Cashback Eligible
                          </span>
                          <span className="w-1/2 text-sm text-[#37352F]">
                            {selectedData?.cashback || 0} BDT
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Forms Section */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Payment Form */}
                <div className="p-5 bg-white border border-gray-200 rounded shadow-sm">
                  <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-800">
                    <span className="w-2 h-5 mr-2 bg-indigo-600 rounded-full"></span>
                    {selectedData?.dueAmount > 0
                      ? 'Pay Due Amount'
                      : 'Process Return'}
                  </h3>

                  <form onSubmit={handleStudentPayment}>
                    {/* Payment Method */}
                    <div className="mb-4">
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select Payment method</option>
                        <option value="cash">Cash</option>
                        <option value="bkash">bKash</option>
                        <option value="nagad">Nagad</option>
                        <option value="rocket">DBBL</option>
                        <option value="bank">Bank Transfer</option>
                      </select>
                    </div>

                    {/* Conditional Mobile Banking Fields */}
                    {paymentMethod !== 'cash' && paymentMethod !== '' && (
                      <>
                        <div className="mb-4">
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Account Number
                          </label>
                          <input
                            type="text"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter account number"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Transaction ID
                          </label>
                          <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter transaction ID"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Payment Date
                          </label>
                          <input
                            type="date"
                            value={paymentDate}
                            onChange={(e) => setPaymentDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </>
                    )}

                    {/* Amount Field */}
                    <div className="mb-4">
                      <label className="block mb-1 text-sm font-medium text-gray-700">
                        Amount to{' '}
                        {selectedData?.dueAmount > 0 ? 'Pay' : 'Return'}
                      </label>
                      <input
                        type="number"
                        value={payAmount}
                        onChange={(e) =>
                          setPayAmount(Math.max(0, e.target.value))
                        }
                        min="0"
                        max={
                          selectedData?.dueAmount > 0
                            ? selectedData.dueAmount
                            : selectedData?.cashback
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Enter amount in BDT"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-2.5 px-4 rounded font-medium text-white transition-all ${
                        selectedData?.dueAmount > 0
                          ? 'bg-indigo-600 hover:bg-indigo-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {isLoading
                        ? 'Processing...'
                        : selectedData?.dueAmount > 0
                          ? 'Confirm Payment'
                          : 'Process Return'}
                    </button>
                  </form>

                  {(successMsg || errMsg) && (
                    <div
                      className={`mt-4 p-3 rounded ${
                        successMsg
                          ? 'bg-green-50 text-green-800'
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      <div className="flex items-start">
                        {successMsg ? (
                          <CheckCircle className="flex-shrink-0 h-5 w-5 mr-2 mt-0.5" />
                        ) : (
                          <AlertCircle className="flex-shrink-0 h-5 w-5 mr-2 mt-0.5" />
                        )}
                        <p className="text-sm">{successMsg || errMsg}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Discount Calculator */}
                <div className="p-5 bg-white border border-gray-200 rounded shadow-sm">
                  <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-800">
                    <span className="w-2 h-5 mr-2 bg-indigo-600 rounded-full"></span>
                    Discount Calculator
                  </h3>

                  <div className="mb-4">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Enter CGPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={cgpa || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        setCgpa(value > 4 ? 4 : value);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter student's CGPA"
                    />
                  </div>

                  <div className="mb-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        CGPA Discount:
                      </span>
                      <span className="font-medium text-blue-600">
                        {cgpaDiscount || 0} BDT
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Reference Discount:
                      </span>
                      <span className="font-medium text-blue-600">
                        {referenceDiscount || 0} BDT
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cashback:</span>
                      <span
                        className={`font-medium ${
                          cashbackAllowed ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        {cashbackAllowed
                          ? `${studentCashback?.toFixed(2)} BDT`
                          : 'Not applicable'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-sm font-medium text-gray-700">
                        Total Discount:
                      </span>
                      <span className="font-semibold text-indigo-700">
                        {Math.max(cgpaDiscount, referenceDiscount) || 0} BDT
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={isLoading || !cgpa}
                    className={`w-full py-2.5 px-4 rounded font-medium text-white transition-all ${
                      isLoading || !cgpa
                        ? 'bg-gray-400'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {isLoading ? 'Updating...' : 'Update Discounts'}
                  </button>

                  <div className="flex items-start p-3 mt-3 text-sm text-blue-800 rounded bg-blue-50">
                    <Info className="flex-shrink-0 h-4 w-4 mr-2 mt-0.5" />
                    <p>
                      CGPA ≥ 3.90 → 25% discount
                      <br />
                      CGPA ≥ 3.75 → 15% discount
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-start px-6 py-3 border-t border-gray-200 bg-gray-50 lg:justify-end">
              <button
                onClick={onClose}
                className="text-white rounded-full btn btn-xs btn-error"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPaymentModal;
