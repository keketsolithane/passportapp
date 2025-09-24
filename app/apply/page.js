"use client";

import { useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import FileUpload from "../../components/FileUpload";
import SignatureCanvas from "react-signature-canvas";

const DISTRICTS = [
  "Maseru", "Berea", "Mafeteng", "Mohale'shoek", "Quthing",
  "Leribe", "Qacha'sneck", "Botha-Bothe", "Mokhotlong", "Thaba-Tseka",
];

export default function Apply() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    dob: "",
    idNumber: "",
    nationality: "",
    birthPlace: "",
    district: "",
    headChief: "",
    passportType: "32 pages",
    sex: "",
    guardianName: "",
    guardianId: "",
  });

  const [photoUrl, setPhotoUrl] = useState("");
  const [docsUrl, setDocsUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refNum, setRefNum] = useState("");
  const sigCanvasRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const clearSignature = () => {
    sigCanvasRef.current.clear();
  };

  const uploadSignature = async () => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) return null;

    const dataURL = sigCanvasRef.current.toDataURL("image/png");
    const blob = await (await fetch(dataURL)).blob();
    const fileName = `signature_${form.idNumber || "user"}.png`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase
      .storage
      .from("passport-files")
      .upload(fileName, blob, { cacheControl: "3600", upsert: true });

    if (uploadError) {
      console.error("Signature upload failed:", uploadError.message);
      return null;
    }

    // Get public URL
    const { data } = supabase
      .storage
      .from("passport-files")
      .getPublicUrl(fileName);

    return data.publicUrl; // Always available
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const { fullName, email, dob, idNumber, nationality, birthPlace, district, headChief, passportType, sex, guardianName, guardianId } = form;

    // Upload signature if drawn
    const signatureUrl = await uploadSignature();

    // Validate all required fields
    if (!fullName || !email || !dob || !idNumber || !nationality || !birthPlace || !district || !headChief || !sex || !photoUrl || !docsUrl || !signatureUrl) {
      alert("Please fill all required fields and upload/provide files.");
      return;
    }

    const birthDate = new Date(dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();

    if (age < 16 && (!guardianName || !guardianId)) {
      alert("Minors must include guardian name and ID.");
      return;
    }

    setSubmitting(true);

    const applicationData = {
      full_name: fullName,
      email,
      dob,
      id_number: idNumber,
      nationality,
      birth_place: birthPlace,
      district,
      head_chief: headChief,
      passport_type: passportType,
      sex,
      guardian_name: age < 16 ? guardianName : null,
      guardian_id: age < 16 ? guardianId : null,
      photo_url: photoUrl,
      docs_url: docsUrl,
      signature_url: signatureUrl,
    };

    try {
      const { data, error } = await supabase
        .from("passport_applications")
        .insert([applicationData])
        .select();

      if (error) throw error;

      setRefNum(`LS-${data[0].id}`);
      alert("Application submitted successfully!");

      // Reset form
      setForm({
        fullName: "",
        email: "",
        dob: "",
        idNumber: "",
        nationality: "",
        birthPlace: "",
        district: "",
        headChief: "",
        passportType: "32 pages",
        sex: "",
        guardianName: "",
        guardianId: "",
      });
      setPhotoUrl("");
      setDocsUrl("");
      sigCanvasRef.current.clear();
    } catch (err) {
      console.error("Error submitting application:", err.message);
      alert("Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-semibold text-blue-700 mb-4">
        Lesotho Passport Online Application
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="fullName" type="text" className="w-full border p-2 rounded" placeholder="Full Name" value={form.fullName} onChange={handleChange} required />
        <input name="email" type="email" className="w-full border p-2 rounded" placeholder="Email Address" value={form.email} onChange={handleChange} required />
        <input name="dob" type="date" className="w-full border p-2 rounded" value={form.dob} onChange={handleChange} required />
        <input name="idNumber" type="text" className="w-full border p-2 rounded" placeholder="National ID Number" value={form.idNumber} onChange={handleChange} required />
        <input name="nationality" type="text" className="w-full border p-2 rounded" placeholder="Nationality" value={form.nationality} onChange={handleChange} required />
        <input name="birthPlace" type="text" className="w-full border p-2 rounded" placeholder="Birth Place" value={form.birthPlace} onChange={handleChange} required />

        <select name="district" className="w-full border p-2 rounded" value={form.district} onChange={handleChange} required>
          <option value="">Select District</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <input name="headChief" type="text" className="w-full border p-2 rounded" placeholder="Head Chief" value={form.headChief} onChange={handleChange} required />

        <select name="passportType" className="w-full border p-2 rounded" value={form.passportType} onChange={handleChange}>
          <option value="32 pages">Regular Passport – 32 pages (M130.00)</option>
          <option value="64 pages">Regular Passport – 64 pages (M300.00)</option>
        </select>

        <select name="sex" className="w-full border p-2 rounded" value={form.sex} onChange={handleChange} required>
          <option value="">Select Sex</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        {form.dob && new Date().getFullYear() - new Date(form.dob).getFullYear() < 16 && (
          <>
            <input name="guardianName" type="text" className="w-full border p-2 rounded" placeholder="Guardian Name" value={form.guardianName} onChange={handleChange} required />
            <input name="guardianId" type="text" className="w-full border p-2 rounded" placeholder="Guardian ID Number" value={form.guardianId} onChange={handleChange} required />
          </>
        )}

        <FileUpload label="Take or upload a passport photo" onUploadComplete={(url) => setPhotoUrl(url)} />
        <FileUpload label="Upload certified documents (e.g., Birth Certificate)" onUploadComplete={(url) => setDocsUrl(url)} />

        {/* Signature Pad */}
        <div className="signature-container border p-2 rounded">
          <label className="block mb-2 font-medium">Draw Your Signature</label>
          <SignatureCanvas
            ref={sigCanvasRef}
            penColor="black"
            canvasProps={{width: 300, height: 100, className: "border"}}
          />
          <div className="flex space-x-2 mt-2">
            <button type="button" onClick={clearSignature} className="px-4 py-1 bg-gray-300 rounded">Clear</button>
          </div>
        </div>

        <button type="submit" disabled={submitting} className="bg-blue-700 text-white px-4 py-2 rounded w-full">
          {submitting ? "Submitting..." : "Submit Application"}
        </button>

        {refNum && <p className="mt-2 text-sm text-green-700">Application submitted! Ref: {refNum}</p>}
      </form>
    </div>
  );
}
