import React, {
  type FC,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Camera, Upload, X } from "lucide-react";
import CapturePhoto from "@/components/common/CapturePhoto";

export interface StudentPhotoProps {
  previewUrl?: string | null;
  setFile:
    | Dispatch<SetStateAction<File | null>>
    | ((file: File | null) => void);
  setPreviewUrl:
    | Dispatch<SetStateAction<string | null>>
    | ((url: string | null) => void);
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const StudentPhoto: FC<StudentPhotoProps> = ({
  previewUrl,
  setFile,
  setPreviewUrl,
  handleFileChange,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="w-full aspect-square max-w-[160px] mx-auto lg:mx-0 rounded-md border-2 border-dashed border-[#e3e2de] overflow-hidden bg-[#fafaf8] flex items-center justify-center relative group">
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Preview"
              className="object-cover w-full h-full"
            />
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
              }}
              className="absolute top-2 right-2 bg-white border border-[#e3e2de] rounded-full p-1 shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              <X className="w-3 h-3 text-[#9b9a97] hover:text-red-500" />
            </button>
          </>
        ) : (
          <div className="p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-[#f1f0ee] flex items-center justify-center mx-auto mb-2">
              <Camera className="w-4 h-4 text-[#9b9a97]" />
            </div>
            <p className="text-[11px] font-semibold text-[#9b9a97]">
              Student Photo
            </p>
            <p className="text-[10px] text-[#c7c6c1] mt-0.5">1:1 ratio</p>
          </div>
        )}
      </div>

      <label className="flex items-center justify-center gap-1.5 w-full max-w-[160px] mx-auto lg:mx-0 px-3 py-2 border border-dashed border-[#e3e2de] rounded-md cursor-pointer hover:border-[#2383e2] hover:bg-blue-50/30 transition-all group">
        <Upload className="w-3.5 h-3.5 text-[#9b9a97] group-hover:text-[#2383e2] transition-colors" />
        <span className="text-[11.5px] font-medium text-[#9b9a97] group-hover:text-[#2383e2] transition-colors">
          Upload photo
        </span>
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </label>

      <div className="flex items-center gap-2 max-w-[160px] mx-auto lg:mx-0">
        <div className="flex-1 h-px bg-[#e9e8e3]" />
        <span className="text-[10px] text-[#c7c6c1] font-semibold">OR</span>
        <div className="flex-1 h-px bg-[#e9e8e3]" />
      </div>

      <div className="max-w-[160px] mx-auto">
        <CapturePhoto
          onCapture={(photoFile: File | null) => setFile(photoFile)}
        />
      </div>
    </div>
  );
};

export default StudentPhoto;
