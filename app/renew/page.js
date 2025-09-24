"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabase"; 

export default function Renew() {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [ref, setRef] = useState(null);

  const DISTRICTS = [
    "Maseru","Berea","Mafeteng","Mohale's Hoek",
    "Quthing","Leribe","Qacha's Neck","Botha-Bothe","Mokhotlong"
  ];

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
      const fileName = `passport_${passportNumber}.${fileExt}`;

      // Upload photo
      const { data: storageData, error: uploadError } = await supabase
        .storage
        .from(bucketName)
        .upload(fileName, photoFile, {
          cacheControl: "3600",
          upsert: true,
        });
      if (uploadError) throw uploadError;

      // Get public URL from the SAME bucket
      const { data: urlData, error: urlError } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(fileName);
      if (urlError) throw urlError;

      const publicURL = urlData.publicUrl;
      if (!publicURL) throw new Error("Failed to get public URL of uploaded file");

      // Insert into renewals table
      const { data, error } = await supabase
        .from("renewals")
        .insert([{
          name,
          surname,
          passport_number: passportNumber,
          district,
          photo_url: publicURL
        }])
        .select()
        .single();
      if (error) throw error;

      setRef(data.id);
      alert("Renewal submitted successfully!");

      // Reset form
      setName(""); setSurname(""); setPassportNumber(""); setDistrict(""); setPhotoFile(null);

    } catch (err) {
      console.error("Error:", err);
      alert("Failed to submit renewal: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl p-6 bg-white shadow">
      <h1 className="text-2xl font-semibold">Renew Passport</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input className="w-full border p-2 rounded" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} required />
        <input className="w-full border p-2 rounded" placeholder="Surname" value={surname} onChange={e=>setSurname(e.target.value)} required />
        <input className="w-full border p-2 rounded" placeholder="Passport Number" value={passportNumber} onChange={e=>setPassportNumber(e.target.value)} required />
        <select className="w-full border p-2 rounded" value={district} onChange={e=>setDistrict(e.target.value)} required>
          <option value="">Select District</option>
          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <div className="w-full">
          <label className="block mb-2 font-medium">Passport Photo</label>
          <input type="file" accept="image/*" onChange={e=>setPhotoFile(e.target.files[0])} className="border p-2 rounded w-full" required />
        </div>

        <button disabled={submitting} className="bg-[var(--brand)] text-white px-4 py-2 rounded">
          {submitting ? "Submitting..." : "Submit Renewal"}
        </button>

        {ref && <p className="mt-2 text-sm">Submitted! Reference ID: {ref}</p>}
      </form>
    </div>
  );
}
