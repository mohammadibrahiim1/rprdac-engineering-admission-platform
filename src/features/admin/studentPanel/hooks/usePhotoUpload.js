import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { processStudentImage } from '../utils/imageProcessor';

export const usePhotoUpload = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    try {
      const processed = await processStudentImage(selectedFile);
      setFile(processed);
      toast.success('Image ready!');
    } catch (err) {
      toast.error(err.message || 'Image upload failed');
    }
  };

  return { file, setFile, previewUrl, setPreviewUrl, handleFileChange };
};
