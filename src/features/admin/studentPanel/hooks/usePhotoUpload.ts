import {
  useState,
  useEffect,
  ChangeEvent,
  Dispatch,
  SetStateAction,
} from "react";
import { toast } from "sonner";
import { processStudentImage } from "../utils/imageProcessor";

export interface UsePhotoUploadReturn {
  file: File | null;
  setFile: Dispatch<SetStateAction<File | null>>;
  previewUrl: string | null;
  setPreviewUrl: Dispatch<SetStateAction<string | null>>;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export const usePhotoUpload = (): UsePhotoUploadReturn => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Cleanup object URL on unmount or when file changes to prevent memory leaks
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    try {
      const processed = await processStudentImage(selectedFile);
      setFile(processed as File);
      toast.success("Image ready!");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Image upload failed";
      toast.error(errorMessage);
    }
  };

  return { file, setFile, previewUrl, setPreviewUrl, handleFileChange };
};
