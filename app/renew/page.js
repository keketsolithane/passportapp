"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Renew() {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    passportNumber: "",
    district: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [ref, setRef] = useState(null);

  const DISTRICTS = [
    "Maseru", "Berea", "Mafeteng", "Mohale's Hoek",
    "Quthing", "Leribe", "Qacha's Neck", "Botha-Bothe", "Mokhotlong"
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!photoFile) {
      alert("Please upload a passport photo.");
      return;
    }

    setSubmitting(true);

    try {
      const bucketName = "passport-files";
      const fileExt = photoFile.name.split(".").pop();
      const fileName = `passport_${form.passportNumber}.${fileExt}`;

      // Upload photo to Supabase
      const { error: uploadError } = await supabase
        .storage
        .from(bucketName)
        .upload(fileName, photoFile, { cacheControl: "3600", upsert: true });
      if (uploadError) throw uploadError;

      // Get public URL or signed URL
      const { data: urlData } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(fileName);

      const publicURL = urlData.publicUrl;
      if (!publicURL) throw new Error("Failed to get public URL of uploaded file");

      // Insert into renewals table
      const { data, error } = await supabase
        .from("renewals")
        .insert([{
          name: form.name,
          surname: form.surname,
          passport_number: form.passportNumber,
          district: form.district,
          photo_url: publicURL
        }])
        .select()
        .single();
      if (error) throw error;

      setRef(data.id);
      alert("Renewal submitted successfully!");

      // Reset form
      setForm({ name: "", surname: "", passportNumber: "", district: "" });
      setPhotoFile(null);
      // Reset file input
      const fileInput = document.getElementById('photoFile');
      if (fileInput) fileInput.value = '';

    } catch (err) {
      console.error("Error submitting renewal:", err);
      alert("Failed to submit renewal: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
        Renew Passport
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="form-group">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={form.name}
            onChange={handleChange}
            required
            aria-required="true"
            placeholder="Enter your first name"
          />
        </div>

        {/* Surname Field */}
        <div className="form-group">
          <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
            Surname *
          </label>
          <input
            id="surname"
            name="surname"
            type="text"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={form.surname}
            onChange={handleChange}
            required
            aria-required="true"
            placeholder="Enter your surname"
          />
        </div>

        {/* Passport Number Field */}
        <div className="form-group">
          <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Passport Number *
          </label>
          <input
            id="passportNumber"
            name="passportNumber"
            type="text"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={form.passportNumber}
            onChange={handleChange}
            required
            aria-required="true"
            placeholder="Enter your current passport number"
          />
        </div>

        {/* District Field */}
        <div className="form-group">
          <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
            District *
          </label>
          <select
            id="district"
            name="district"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={form.district}
            onChange={handleChange}
            required
            aria-required="true"
          >
            <option value="">Select your district</option>
            {DISTRICTS.map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>

        {/* Photo Upload Field */}
        <div className="form-group">
          <label htmlFor="photoFile" className="block text-sm font-medium text-gray-700 mb-1">
            Passport Photo *
          </label>
          <input
            id="photoFile"
            name="photoFile"
            type="file"
            accept="image/*"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={handleFileChange}
            required
            aria-required="true"
            aria-describedby="photoHelp"
          />
          <div id="photoHelp" className="text-xs text-gray-500 mt-1">
            Upload a recent passport-sized photo (JPEG, PNG, etc.)
          </div>
          {photoFile && (
            <div className="text-sm text-green-600 mt-1">
              ✓ {photoFile.name} selected
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {submitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            "Submit Renewal Application"
          )}
        </button>

        {/* Success Message */}
        {ref && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium text-center">
              ✅ Renewal submitted successfully!
            </p>
            <p className="text-green-600 text-sm text-center mt-1">
              Reference ID: <strong className="font-mono">{ref}</strong>
            </p>
            <p className="text-green-600 text-xs text-center mt-2">
              Please save this reference number for future inquiries.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}