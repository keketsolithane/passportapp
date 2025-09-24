// components/FileUpload.jsx
"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function FileUpload({ label, onUploadComplete, onUploadStart, onUploadError }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (event) => {
    try {
      setUploading(true);
      onUploadStart?.(); // Notify parent upload started

      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('passport-files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('passport-files')
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl); // Notify parent upload completed

    } catch (error) {
      console.error('Upload error:', error);
      onUploadError?.(error.message); // Notify parent of error
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="file"
        onChange={handleUpload}
        disabled={uploading}
        className="w-full border p-2 rounded"
        accept="image/*,.pdf,.doc,.docx"
      />
      {uploading && <p className="text-sm text-gray-600 mt-1">Uploading...</p>}
    </div>
  );
}