import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetGalleryImagesQuery,
  useUploadGalleryImagesMutation,
  useDeleteGalleryImagesMutation,
} from '../../../../../redux/features/slider/sliderApi';

export const useGalleryManager = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [editGallery, setEditGallery] = useState(null);

  const { data: galleries, isLoading: isFetching } = useGetGalleryImagesQuery();
  const [uploadGalleryImages, { isLoading: isUploading }] =
    useUploadGalleryImagesMutation();
  const [deleteImages, { isLoading: isDeleting }] =
    useDeleteGalleryImagesMutation();

  const galleryList = galleries?.images || [];

  const handleFileChange = (e) => {
    if (e.target.files) {
      setGalleryFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!galleryFiles.length) {
      toast.error('Please select at least one image to upload.');
      return;
    }

    const formData = new FormData();
    galleryFiles.forEach((file) => formData.append('gallery', file));

    try {
      await uploadGalleryImages(formData).unwrap();
      toast.success('Gallery images uploaded successfully!');
      setGalleryFiles([]);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to upload gallery images');
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
      setSelectedIds(galleryList.map((item) => String(item.id || item._id)));
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

    if (
      !window.confirm(`Permanently delete ${cleanIds.length} gallery item(s)?`)
    )
      return;

    try {
      const response = await deleteImages(cleanIds).unwrap();
      toast.success(response?.message || 'Deleted successfully');
      setSelectedIds([]);
    } catch (err) {
      toast.error(err?.data?.message || err?.error || 'Deletion failed');
    }
  };

  return {
    galleryList,
    isFetching,
    isUploading,
    isDeleting,
    galleryFiles,
    setGalleryFiles,
    selectedIds,
    editGallery,
    setEditGallery,
    handleFileChange,
    handleUpload,
    handleSelect,
    handleSelectAll,
    handleDelete,
  };
};
