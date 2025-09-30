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
    "Maseru","Berea","Mafeteng","Mohale's Hoek",
    "Quthing","Leribe","Qacha's Neck","Botha-Bothe","Mokhotlong"
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

    } catch (err) {
      console.error("Error submitting renewal:", err);
      alert("Failed to submit renewal: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl p-6 bg-white shadow max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-semibold mb-4">Renew Passport</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          className="w-full border p-2 rounded"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="surname">Surname</label>
        <input
          id="surname"
          name="surname"
          type="text"
          className="w-full border p-2 rounded"
          value={form.surname}
          onChange={handleChange}
          required
        />

        <label htmlFor="passportNumber">Passport Number</label>
        <input
          id="passportNumber"
          name="passportNumber"
          type="text"
          className="w-full border p-2 rounded"
          value={form.passportNumber}
          onChange={handleChange}
          required
        />

        <label htmlFor="district">District</label>
        <select
          id="district"
          name="district"
          className="w-full border p-2 rounded"
          value={form.district}
          onChange={handleChange}
          required
        >
          <option value="">Select District</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <label htmlFor="photoFile">Passport Photo</label>
        <input
          id="photoFile"
          name="photoFile"
          type="file"
          accept="image/*"
          className="w-full border p-2 rounded"
          onChange={handleFileChange}
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-700 text-white px-4 py-2 rounded w-full"
        >
          {submitting ? "Submitting..." : "Submit Renewal"}
        </button>

        {ref && <p className="mt-2 text-green-700 text-sm">Submitted! Reference ID: {ref}</p>}
      </form>
    </div>
  );
}
