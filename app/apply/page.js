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

  const clearSignature = () => sigCanvasRef.current?.clear();

  const uploadSignature = async () => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) return null;
    const dataURL = sigCanvasRef.current.toDataURL("image/png");
    const blob = await (await fetch(dataURL)).blob();
    const fileName = `signature_${form.idNumber || "user"}.png`;

    const { error: uploadError } = await supabase
      .storage
      .from("passport-files")
      .upload(fileName, blob, { cacheControl: "3600", upsert: true });

    if (uploadError) {
      console.error("Signature upload failed:", uploadError.message);
      return null;
    }

    const { data } = supabase
      .storage
      .from("passport-files")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const signatureUrl = await uploadSignature();

    // Validate required fields
    const requiredFields = ["fullName", "email", "dob", "idNumber", "nationality", "birthPlace", "district", "headChief", "sex"];
    for (let field of requiredFields) {
      if (!form[field]) {
        alert("Please fill all required fields.");
        return;
      }
    }
    if (!photoUrl || !docsUrl || !signatureUrl) {
      alert("Please upload photo, documents, and signature.");
      return;
    }

    const birthDate = new Date(form.dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 16 && (!form.guardianName || !form.guardianId)) {
      alert("Minors must include guardian name and ID.");
      return;
    }

    setSubmitting(true);

    const applicationData = {
      full_name: form.fullName,
      email: form.email,
      dob: form.dob,
      id_number: form.idNumber,
      nationality: form.nationality,
      birth_place: form.birthPlace,
      district: form.district,
      head_chief: form.headChief,
      passport_type: form.passportType,
      sex: form.sex,
      guardian_name: age < 16 ? form.guardianName : null,
      guardian_id: age < 16 ? form.guardianId : null,
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

      setForm({
        fullName: "", email: "", dob: "", idNumber: "", nationality: "", birthPlace: "",
        district: "", headChief: "", passportType: "32 pages", sex: "", guardianName: "", guardianId: ""
      });
      setPhotoUrl(""); setDocsUrl(""); 
      if (sigCanvasRef.current) sigCanvasRef.current.clear();
    } catch (err) {
      console.error("Error submitting application:", err.message);
      alert("Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  }

  const age = form.dob ? new Date().getFullYear() - new Date(form.dob).getFullYear() : 0;

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-semibold text-blue-700 mb-4">
        Lesotho Passport Online Application
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="form-group">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input 
            id="fullName" 
            name="fullName" 
            type="text" 
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={form.fullName} 
            onChange={handleChange} 
            required 
            aria-required="true"
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input 
            id="email" 
            name="email" 
            type="email" 
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={form.email} 
            onChange={handleChange} 
            required 
            aria-required="true"
          />
        </div>

        {/* Date of Birth */}
        <div className="form-group">
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth *
          </label>
          <input 
            id="dob" 
            name="dob" 
            type="date" 
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={form.dob} 
            onChange={handleChange} 
            required 
            aria-required="true"
          />
        </div>

        {/* ID Number */}
        <div className="form-group">
          <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
            National ID Number *
          </label>
          <input 
            id="idNumber" 
            name="idNumber" 
            type="text" 
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={form.idNumber} 
            onChange={handleChange} 
            required 
            aria-required="true"
          />
        </div>

        {/* Nationality */}
        <div className="form-group">
          <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">
            Nationality *
          </label>
          <input 
            id="nationality" 
            name="nationality" 
            type="text" 
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={form.nationality} 
            onChange={handleChange} 
            required 
            aria-required="true"
          />
        </div>

        {/* Birth Place */}
        <div className="form-group">
          <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700 mb-1">
            Birth Place *
          </label>
          <input 
            id="birthPlace" 
            name="birthPlace" 
            type="text" 
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={form.birthPlace} 
            onChange={handleChange} 
            required 
            aria-required="true"
          />
        </div>

        {/* District */}
        <div className="form-group">
          <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
            District *
          </label>
          <select 
            id="district" 
            name="district" 
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={form.district} 
            onChange={handleChange} 
            required 
            aria-required="true"
          >
            <option value="">Select District</option>
            {DISTRICTS.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>

        {/* Head Chief */}
        <div className="form-group">
          <label htmlFor="headChief" className="block text-sm font-medium text-gray-700 mb-1">
            Head Chief *
          </label>
          <input 
            id="headChief" 
            name="headChief" 
            type="text" 
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={form.headChief} 
            onChange={handleChange} 
            required 
            aria-required="true"
          />
        </div>

        {/* Passport Type */}
        <div className="form-group">
          <label htmlFor="passportType" className="block text-sm font-medium text-gray-700 mb-1">
            Passport Type
          </label>
          <select 
            id="passportType" 
            name="passportType" 
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={form.passportType} 
            onChange={handleChange}
          >
            <option value="32 pages">Regular Passport – 32 pages (M130.00)</option>
            <option value="64 pages">Regular Passport – 64 pages (M300.00)</option>
          </select>
        </div>

        {/* Sex */}
        <div className="form-group">
          <label htmlFor="sex" className="block text-sm font-medium text-gray-700 mb-1">
            Sex *
          </label>
          <select 
            id="sex" 
            name="sex" 
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
            value={form.sex} 
            onChange={handleChange} 
            required 
            aria-required="true"
          >
            <option value="">Select Sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Conditional Guardian Fields */}
        {age < 16 && (
          <>
            <div className="form-group">
              <label htmlFor="guardianName" className="block text-sm font-medium text-gray-700 mb-1">
                Guardian Name *
              </label>
              <input 
                id="guardianName" 
                name="guardianName" 
                type="text" 
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={form.guardianName} 
                onChange={handleChange} 
                required 
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="guardianId" className="block text-sm font-medium text-gray-700 mb-1">
                Guardian ID Number *
              </label>
              <input 
                id="guardianId" 
                name="guardianId" 
                type="text" 
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={form.guardianId} 
                onChange={handleChange} 
                required 
                aria-required="true"
              />
            </div>
          </>
        )}

        {/* File Uploads */}
        <div className="form-group">
          <FileUpload 
            label="Take or upload a passport photo" 
            onUploadComplete={setPhotoUrl} 
            required 
          />
        </div>

        <div className="form-group">
          <FileUpload 
            label="Upload certified documents (e.g., Birth Certificate)" 
            onUploadComplete={setDocsUrl} 
            required 
          />
        </div>

        {/* Signature */}
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Draw Your Signature *
          </label>
          <div className="signature-container border border-gray-300 p-4 rounded">
            <SignatureCanvas
              ref={sigCanvasRef}
              penColor="black"
              canvasProps={{ 
                width: 300, 
                height: 100, 
                className: "border border-gray-300 bg-white",
                "aria-label": "Signature canvas - draw your signature here"
              }}
            />
            <div className="flex space-x-2 mt-2">
              <button 
                type="button" 
                onClick={clearSignature} 
                className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
              >
                Clear Signature
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={submitting} 
          className="bg-blue-700 text-white px-4 py-2 rounded w-full hover:bg-blue-800 disabled:bg-blue-400 transition-colors"
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </button>

        {/* Reference Number */}
        {refNum && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-green-700 font-medium">
              Application submitted successfully! Reference Number: <strong>{refNum}</strong>
            </p>
          </div>
        )}
      </form>
    </div>
  );
}