import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useCreateOrUpdateSliderMutation,
  useDeleteSlidersMutation,
  useGetAllSlidersQuery,
  useUpdateSlidersMutation,
} from '../../../../../redux/features/slider/sliderApi';
import { useForm } from 'react-hook-form';

export const useSliderManager = ({ data, close }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [sliderPreview, setSliderPreview] = useState(null);
  const [editSlider, setEditSlider] = useState(null);
  const [sliderData, setSliderData] = useState({
    id: '',
    text: '',
    sub_text: '',
    sliderImage: null,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    values: {
      text: data?.text || '',
      sub_text: data?.sub_text || '',
    },
  });

  const {
    data: sliders,
    isLoading: isFetching,
    refetch,
  } = useGetAllSlidersQuery();
  const [createOrUpdateSlider, { isLoading: isSaving }] =
    useCreateOrUpdateSliderMutation();
  const [deleteSliders, { isLoading: isDeleting }] = useDeleteSlidersMutation();
  const [updateSliders, { isLoading: isUpdating }] = useUpdateSlidersMutation();

  const sliderList = sliders?.data || [];

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSliderData((prev) => ({ ...prev, sliderImage: file }));
      setSliderPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateSlider = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('id', sliderData.id);
    formData.append('text', sliderData.text);
    formData.append('sub_text', sliderData.sub_text);

    if (sliderData.sliderImage) {
      formData.append('sliderImage', sliderData.sliderImage);
    }

    try {
      await createOrUpdateSlider(formData).unwrap();
      toast.success('Slider saved successfully!');
      refetch();
      setSliderData({ id: '', text: '', sub_text: '', sliderImage: null });
      setSliderPreview(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save slider');
    }
  };

  const handleUpdateSlider = async (formValues) => {
    try {
      const formData = new FormData();

      formData.append('text', formValues.text);
      formData.append('sub_text', formValues.sub_text);

      if (formValues.sliderImage?.[0]) {
        formData.append('sliderImage', formValues.sliderImage[0]);
      }

      await updateSliders({
        id: data?.id || data?._id,
        formData,
      }).unwrap();

      toast.success('Slider Updated Successfully');
      close();
    } catch (err) {
      toast.error(err?.data?.message || 'Update Failed');
    }
  };

  const handleSelect = (id) => {
    const idString = String(id);
    setSelectedIds((prev) =>
      prev.includes(idString)
        ? prev.filter((item) => item !== idString)
        : [...prev, idString],
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(sliderList.map((item) => String(item.id || item._id)));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDelete = async (ids) => {
    const idArray = Array.isArray(ids) ? ids : [ids];
    const cleanIds = [...new Set(idArray.filter(Boolean).map(String))];

    if (!cleanIds.length) {
      toast.error('Please select at least one item');
      return;
    }

    if (!window.confirm(`Permanently delete ${cleanIds.length} slider(s)?`))
      return;

    try {
      const response = await deleteSliders(cleanIds).unwrap();
      toast.success(response?.message || 'Deleted successfully');
      refetch();
      setSelectedIds([]);
    } catch (err) {
      toast.error(err?.data?.message || err?.error || 'Deletion failed');
    }
  };

  return {
    sliderList,
    isFetching,
    isSaving,
    isDeleting,
    sliderData,
    setSliderData,
    sliderPreview,
    selectedIds,
    editSlider,
    setEditSlider,
    handleImageChange,
    handleCreateSlider,
    handleUpdateSlider,
    handleSubmit,
    register,
    errors,
    isUpdating,
    handleSelect,
    handleSelectAll,
    handleDelete,
  };
};
