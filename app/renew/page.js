"use client";

import { useState, useRef } from "react";
import { supabase } from "../../lib/supabase";

export default function Renew() {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    passportNumber: "",
    district: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null); // <-- new preview state
  const [submitting, setSubmitting] = useState(false);
  const [ref, setRef] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const DISTRICTS = [
    "Maseru", "Berea", "Mafeteng", "Mohale's Hoek",
    "Quthing", "Leribe", "Qacha's Neck", "Botha-Bothe", "Mokhotlong"
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPEG, PNG, or GIF).");
        setPhotoFile(null);
        setPhotoPreview(null);
        return;
      }

      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError("File is too large. Max size is 2MB.");
        setPhotoFile(null);
        setPhotoPreview(null);
        return;
      }

      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file)); // <-- create live preview
      setError(null);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!photoFile) {
      setError("Please upload a passport photo.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const bucketName = "passport-files";
      const fileExt = photoFile.name.split(".").pop();
      const timestamp = Date.now();
      const fileName = `renewals/passport_${form.passportNumber}_${timestamp}.${fileExt}`;

      const { error: uploadError } = await supabase
        .storage
        .from(bucketName)
        .upload(fileName, photoFile, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(fileName);

      await saveRenewalApplication(urlData.publicUrl);

    } catch (err) {
      console.error("Error submitting renewal:", err);
      setError("Failed to submit renewal: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function saveRenewalApplication(photoUrl) {
    try {
      const { data, error } = await supabase
        .from("renewals")
        .insert([{
          name: form.name,
          surname: form.surname,
          passport_number: form.passportNumber,
          district: form.district,
          photo_url: photoUrl,
          reference: `RENEW-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        }])
        .select()
        .single();

      if (error) throw error;

      setRef(data.reference);
      setForm({ name: "", surname: "", passportNumber: "", district: "" });
      setPhotoFile(null);
      setPhotoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (err) {
      console.error("Database error:", err);
      throw new Error("Failed to save application: " + err.message);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
        Renew Passport
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-center">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Name */}
        <div>
          <label htmlFor="renew-name" className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            id="renew-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Enter your first name"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Surname */}
        <div>
          <label htmlFor="renew-surname" className="block text-sm font-medium text-gray-700 mb-2">
            Surname *
          </label>
          <input
            id="renew-surname"
            name="surname"
            type="text"
            value={form.surname}
            onChange={handleChange}
            required
            placeholder="Enter your surname"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Passport Number */}
        <div>
          <label htmlFor="renew-passport" className="block text-sm font-medium text-gray-700 mb-2">
            Passport Number *
          </label>
          <input
            id="renew-passport"
            name="passportNumber"
            type="text"
            value={form.passportNumber}
            onChange={handleChange}
            required
            placeholder="Enter your passport number"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* District */}
        <div>
          <label htmlFor="renew-district" className="block text-sm font-medium text-gray-700 mb-2">
            District *
          </label>
          <select
            id="renew-district"
            name="district"
            value={form.district}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select your district</option>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Photo Upload */}
        <div>
          <label htmlFor="renew-photo" className="block text-sm font-medium text-gray-700 mb-2">
            Passport Photo *
          </label>
          <input
            ref={fileInputRef}
            id="renew-photo"
            name="photoFile"
            type="file"
            accept="image/jpeg, image/jpg, image/png, image/gif"
            onChange={handleFileChange}
            required
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {photoPreview && (
            <img
              src={photoPreview}
              alt="Passport preview"
              className="mt-2 w-32 h-32 object-cover rounded-lg border"
            />
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-700 text-white py-3 px-4 rounded-lg hover:bg-blue-800 disabled:bg-blue-400"
        >
          {submitting ? "Processing..." : "Submit Renewal Application"}
        </button>

        {/* Success Message */}
        {ref && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-green-700 font-semibold">Renewal Submitted Successfully!</p>
            <p className="text-green-600 mt-2">Reference Number: <span className="font-mono">{ref}</span></p>
          </div>
        )}
      </form>
    </div>
  );
}
