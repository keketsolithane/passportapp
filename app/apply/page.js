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
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
    }
  };

  const uploadSignature = async () => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
      alert("Please provide your signature before submitting");
      return null;
    }
    
    try {
      const dataURL = sigCanvasRef.current.toDataURL("image/png");
      const response = await fetch(dataURL);
      const blob = await response.blob();
      const fileName = `signature_${form.idNumber || Date.now()}.png`;

      const { error: uploadError } = await supabase.storage
        .from("passport-files")
        .upload(fileName, blob, { 
          cacheControl: "3600", 
          upsert: false
        });

      if (uploadError) {
        console.error("Signature upload failed:", uploadError);
        alert("Failed to upload signature. Please try again.");
        return null;
      }

      const { data } = supabase.storage
        .from("passport-files")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error("Signature upload error:", error);
      alert("Error uploading signature. Please try again.");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = [
      "fullName", "email", "dob", "idNumber", "nationality", 
      "birthPlace", "district", "headChief", "sex"
    ];
    
    const missingFields = requiredFields.filter(field => !form[field]);
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    if (!photoUrl) {
      alert("Please upload a passport photo");
      return;
    }

    if (!docsUrl) {
      alert("Please upload required documents");
      return;
    }

    const signatureUrl = await uploadSignature();
    if (!signatureUrl) return;

    const birthDate = new Date(form.dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 16 && (!form.guardianName || !form.guardianId)) {
      alert("For applicants under 16, guardian name and ID are required");
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
      
      // Reset form
      setForm({
        fullName: "", email: "", dob: "", idNumber: "", nationality: "", birthPlace: "",
        district: "", headChief: "", passportType: "32 pages", sex: "", guardianName: "", guardianId: ""
      });
      setPhotoUrl("");
      setDocsUrl("");
      if (sigCanvasRef.current) {
        sigCanvasRef.current.clear();
      }
      
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to submit application: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const age = form.dob ? new Date().getFullYear() - new Date(form.dob).getFullYear() : 0;

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-semibold text-blue-700 mb-6">
        Lesotho Passport Online Application
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="apply-fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input 
              id="apply-fullName" 
              name="fullName" 
              type="text" 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={form.fullName} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label htmlFor="apply-email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input 
              id="apply-email" 
              name="email" 
              type="email" 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={form.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label htmlFor="apply-dob" className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth *
            </label>
            <input 
              id="apply-dob" 
              name="dob" 
              type="date" 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={form.dob} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label htmlFor="apply-idNumber" className="block text-sm font-medium text-gray-700 mb-2">
              National ID Number *
            </label>
            <input 
              id="apply-idNumber" 
              name="idNumber" 
              type="text" 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={form.idNumber} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label htmlFor="apply-nationality" className="block text-sm font-medium text-gray-700 mb-2">
              Nationality *
            </label>
            <input 
              id="apply-nationality" 
              name="nationality" 
              type="text" 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={form.nationality} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label htmlFor="apply-birthPlace" className="block text-sm font-medium text-gray-700 mb-2">
              Birth Place *
            </label>
            <input 
              id="apply-birthPlace" 
              name="birthPlace" 
              type="text" 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={form.birthPlace} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label htmlFor="apply-district" className="block text-sm font-medium text-gray-700 mb-2">
              District *
            </label>
            <select 
              id="apply-district" 
              name="district" 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={form.district} 
              onChange={handleChange} 
              required 
            >
              <option value="">Select District</option>
              {DISTRICTS.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="apply-headChief" className="block text-sm font-medium text-gray-700 mb-2">
              Head Chief *
            </label>
            <input 
              id="apply-headChief" 
              name="headChief" 
              type="text" 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={form.headChief} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div>
            <label htmlFor="apply-passportType" className="block text-sm font-medium text-gray-700 mb-2">
              Passport Type
            </label>
            <select 
              id="apply-passportType" 
              name="passportType" 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={form.passportType} 
              onChange={handleChange}
            >
              <option value="32 pages">Regular Passport – 32 pages (M130.00)</option>
              <option value="64 pages">Regular Passport – 64 pages (M300.00)</option>
            </select>
          </div>

          <div>
            <label htmlFor="apply-sex" className="block text-sm font-medium text-gray-700 mb-2">
              Sex *
            </label>
            <select 
              id="apply-sex" 
              name="sex" 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={form.sex} 
              onChange={handleChange} 
              required 
            >
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        {/* Guardian Information for Minors */}
        {age < 16 && (
          <div className="grid grid-cols-1 gap-6 border-t pt-6">
            <div>
              <label htmlFor="apply-guardianName" className="block text-sm font-medium text-gray-700 mb-2">
                Guardian Name *
              </label>
              <input 
                id="apply-guardianName" 
                name="guardianName" 
                type="text" 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={form.guardianName} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div>
              <label htmlFor="apply-guardianId" className="block text-sm font-medium text-gray-700 mb-2">
                Guardian ID Number *
              </label>
              <input 
                id="apply-guardianId" 
                name="guardianId" 
                type="text" 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                value={form.guardianId} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
        )}

        {/* File Uploads */}
        <div className="border-t pt-6">
          <FileUpload 
            id="apply-photo"
            name="photoFile"
            label="Passport Photo *" 
            onUploadComplete={setPhotoUrl} 
            required={true}
          />
        </div>

        <div>
          <FileUpload 
            id="apply-documents"
            name="documentsFile"
            label="Certified Documents (e.g., Birth Certificate) *" 
            onUploadComplete={setDocsUrl} 
            required={true}
          />
        </div>

        {/* Signature */}
        <div className="border-t pt-6">
          <label htmlFor="signature-canvas" className="block text-sm font-medium text-gray-700 mb-2">
            Signature *
          </label>
          <div className="border border-gray-300 p-4 rounded-lg">
            <SignatureCanvas
              ref={sigCanvasRef}
              penColor="black"
              canvasProps={{ 
                id: "signature-canvas",
                width: 500, 
                height: 200, 
                className: "border border-gray-300 bg-white w-full",
                "aria-label": "Signature area"
              }}
            />
            <button 
              type="button" 
              onClick={clearSignature} 
              className="mt-3 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Clear Signature
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          name="submit"
          disabled={submitting} 
          className="w-full bg-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </button>

        {/* Success Message */}
        {refNum && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-center">
              Application submitted! Reference: {refNum}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}