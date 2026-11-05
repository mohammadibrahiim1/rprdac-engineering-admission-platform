import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useCreateBulkAdmitCardMutation } from '../../../../../../redux/features/student/studentApi';

export const getBanglaPosition = (index) => {
  const banglaNumbers = [
    '১ম',
    '২য়',
    '৩য়',
    '৪র্থ',
    '৫ম',
    '৬ষ্ঠ',
    '৭ম',
    '৮ম',
    '৯ম',
    '১০ম',
  ];
  return banglaNumbers[index] || `${index + 1}তম`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '21-01-2026';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '21-01-2026';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

export const useAdmitCardForm = () => {
  const [createBulkAdmitCard, { isLoading }] = useCreateBulkAdmitCardMutation();

  // Initialize React Hook Form
  const { register, control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      topics: '',
      examType: 'written+mcq',
      department: '',
      date: '',
      time: '',
      startId: '',
      endId: '',
      totalPrizeWinners: 10,
      venue: 'RPR DUET Admission Care',
      prizes: [{ position: '১ম', prizeName: '' }],
    },
  });

  // Manage Dynamic Prize Fields using useFieldArray
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'prizes',
  });

  // Watch entire form or specific fields for Real-time Preview syncing
  const watchedValues = watch();

  const addPrizeRow = () => {
    const nextPos = getBanglaPosition(fields.length);
    append({ position: nextPos, prizeName: '' });
  };

  const removePrizeRow = (index) => {
    if (fields.length === 1) return;
    remove(index);
  };

  // Sync positions array if elements are deleted from the middle
  useEffect(() => {
    fields.forEach((field, index) => {
      const expectedPos = getBanglaPosition(index);
      if (field.position !== expectedPos) {
        field.position = expectedPos;
      }
    });
  }, [fields]);

  const handleClear = () => {
    reset({
      topics: '',
      examType: 'written+mcq',
      department: '',
      date: '',
      time: '',
      startId: '',
      endId: '',
      totalPrizeWinners: 10,
      venue: 'RPR DUET Admission Care',
      prizes: [{ position: '১ম', prizeName: '' }],
    });
  };

  const onSubmit = async (data) => {
    if (parseInt(data.startId) > parseInt(data.endId)) {
      return alert('Start ID cannot be greater than End ID');
    }

    const payload = {
      ...data,
      startId: Number(data.startId),
      endId: Number(data.endId),
      totalPrizeWinners: Number(data.totalPrizeWinners),
      prizes: data.prizes.filter((p) => p.prizeName.trim() !== ''),
    };

    try {
      await createBulkAdmitCard(payload).unwrap();
      alert('Admit Cards Generated Successfully!');
    } catch (err) {
      alert('Error: ' + (err.data?.message || 'Something went wrong'));
    }
  };

  return {
    register,
    control,
    fields,
    watchedValues,
    isLoading,
    addPrizeRow,
    removePrizeRow,
    handleClear,
    handleSubmit: handleSubmit(onSubmit),
  };
};
