"use client";

import Image from "next/image";
import { Icons } from "@/components/icons";
import { ProfileImageFieldProps } from "@/lib/types";

export const ProfileImageField = ({
  onImageChange,
  imagePreview,
}: ProfileImageFieldProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageChange(file);
    }
  };

  const removeImage = () => {
    onImageChange(null);
  };

  return (
    <div className="space-y-3">
      <label
        htmlFor="profileImage"
        className="text-lg font-semibold text-[#2d5523]"
      >
        Profile Picture
      </label>
      <div className="flex items-center space-x-6">
        {imagePreview ? (
          <div className="relative">
            <Image
              src={imagePreview}
              alt="Profile preview"
              width={80}
              height={80}
              className="h-20 w-20 rounded-full object-cover border-2 border-[#4a6b3d]/20"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="h-16 w-16 rounded-full bg-[#f7f5f2] border-2 border-dashed border-[#4a6b3d]/30 flex items-center justify-center">
            <Icons.camera className="h-6 w-6 text-[#4a6b3d]" />
          </div>
        )}
        <div className="flex-1">
          <label
            htmlFor="profileImageInput"
            className="cursor-pointer inline-flex items-center px-3 py-2 border border-[#4a6b3d]/20 rounded-md text-sm font-medium text-[#4a6b3d] bg-white hover:bg-[#f7f5f2] transition-colors"
          >
            <Icons.upload className="mr-2 h-4 w-4" />
            {imagePreview ? "Change Photo" : "Upload Photo"}
          </label>
          <input
            id="profileImageInput"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-xs text-[#4a6b3d] mt-1">
            JPG, PNG or GIF (max 5MB)
          </p>
        </div>
      </div>
    </div>
  );
};
