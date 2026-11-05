import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

export const useGreenCardForm = ({
  user,
  createAdmitCard,
  institutesData,
  showNotification,
  setView,
  refetch,
  processImage,
}) => {
  // --- React Hook Form Setup ---
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: 0,
      quantity: 1,
      discountAmount: 0,
      userCollectedAmount: 0,
      payment: {
        method: 'cash',
        transactionId: '',
        accountNumber: '',
      },
    },
  });

  // --- Local UI States for Custom Inputs ---
  const [photo, setPhoto] = useState(null);
  const [useCamera, setUseCamera] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIns, setSelectedIns] = useState('');
  const [search, setSearchIns] = useState('');
  const webcamRef = useRef(null);

  // --- Watch Form Values for Dynamic Calculations & Conditional Rendering ---
  const amount = watch('amount') || 0;
  const quantity = watch('quantity') || 1;
  const discountAmount = watch('discountAmount') || 0;
  const userCollectedAmount = watch('userCollectedAmount') || 0;
  const paymentMethod = watch('payment.method');

  // Derived Financial States
  const [totalPayable, setTotalPayable] = useState(0);
  const [dueAmount, setDueAmount] = useState(0);

  // Calculate totals automatically
  useEffect(() => {
    const calculatedPayable =
      Number(amount) * Number(quantity) - Number(discountAmount);
    const finalPayable = calculatedPayable > 0 ? calculatedPayable : 0;
    const calculatedDue = finalPayable - Number(userCollectedAmount);

    setTotalPayable(finalPayable);
    setDueAmount(calculatedDue > 0 ? calculatedDue : 0);
  }, [amount, quantity, discountAmount, userCollectedAmount]);

  // Clean up payment fields based on selected method
  useEffect(() => {
    if (['free', 'cash'].includes(paymentMethod)) {
      setValue('payment.transactionId', '');
      setValue('payment.accountNumber', '');
    } else if (paymentMethod === 'bank transfer') {
      setValue('payment.transactionId', '');
    }
  }, [paymentMethod, setValue]);

  // Filter institutes for dropdown
  const filteredInstitutes =
    institutesData?.data?.filter((inst) =>
      inst.name.toLowerCase().includes(search.toLowerCase()),
    ) || [];

  // --- Submit Handler ---
  const onSubmit = async (data) => {
    if (!photo) {
      toast.error('Student profile photo is required');
      return;
    }
    if (!selectedIns) {
      toast.error('Please select an institute');
      return;
    }

    // Build FormData for multipart/form-data (required for image upload)
    const formData = new FormData();
    formData.append('studentPhoto', photo);
    formData.append('studentName', data.studentName);
    formData.append('studentId', data.studentId);
    formData.append('polytechnicName', selectedIns);
    formData.append('department', data.department);
    formData.append('examType', data.examType);
    formData.append('studentPhone', data.studentPhone);
    formData.append('academicYear', data.academicYear);

    // Financial Data
    formData.append('amount', Number(data.amount));
    formData.append('quantity', Number(data.quantity));
    formData.append('discountAmount', Number(data.discountAmount));
    formData.append('userCollectedAmount', Number(data.userCollectedAmount));

    // Payment Object mapping (bracket notation for Express/Multer array parsing)
    formData.append('payment[method]', data.payment.method);
    if (data.payment.transactionId)
      formData.append('payment[transactionId]', data.payment.transactionId);
    if (data.payment.accountNumber)
      formData.append('payment[accountNumber]', data.payment.accountNumber);

    // Seller Info
    formData.append('seller[name]', user?.userName || 'Admin');
    formData.append('seller[phone]', user?.phone || 'N/A');
    formData.append('seller[id]', user?.userId || 'N/A');

    try {
      // Execute RTK Query Mutation
      await createAdmitCard(formData).unwrap();

      // Reset application state
      reset();
      setPhoto(null);
      setSelectedIns('');
      setSearchIns('');

      toast.success('Successful');

      setView('list');
      if (refetch) refetch();
    } catch (err) {
      const errorMsg =
        err?.data?.message ||
        'Failed to submit application. Please check details.';
      if (showNotification) showNotification('error', errorMsg);
      else toast.error(errorMsg);
    }
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    paymentMethod,
    totalPayable,
    dueAmount,
    photo,
    setPhoto,
    useCamera,
    setUseCamera,
    isOpen,
    setIsOpen,
    selectedIns,
    setSelectedIns,
    search,
    setSearchIns,
    webcamRef,
    filteredInstitutes,
    processImage,
  };
};
