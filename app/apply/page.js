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
  const formRef = useRef(null);

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
      alert("Please provide your signature");
      return null;
    }
    
    try {
      const dataURL = sigCanvasRef.current.toDataURL("image/png");
      const blob = await (await fetch(dataURL)).blob();
      const fileName = `signature_${form.idNumber || Date.now()}.png`;

      const { error: uploadError } = await supabase.storage
        .from("passport-files")
        .upload(fileName, blob, { 
          cacheControl: "3600", 
          upsert: true,
          contentType: "image/png"
        });

      if (uploadError) {
        console.error("Signature upload failed:", uploadError.message);
        alert("Failed to upload signature. Please try again.");
        return null;
      }

      const { data } = supabase.storage
        .from("passport-files")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error("Signature upload error:", error);
      return null;
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ["fullName", "email", "dob", "idNumber", "nationality", "birthPlace", "district", "headChief", "sex"];
    for (let field of requiredFields) {
      if (!form[field]) {
        alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    if (!photoUrl) {
      alert("Please upload a passport photo.");
      return;
    }

    if (!docsUrl) {
      alert("Please upload required documents.");
      return;
    }

    const signatureUrl = await uploadSignature();
    if (!signatureUrl) {
      return; // uploadSignature already shows alert
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

      // Reset form
      setForm({
        fullName: "", email: "", dob: "", idNumber: "", nationality: "", birthPlace: "",
        district: "", headChief: "", passportType: "32 pages", sex: "", guardianName: "", guardianId: ""
      });
      setPhotoUrl(""); 
      setDocsUrl(""); 
      if (sigCanvasRef.current) sigCanvasRef.current.clear();
      
      // Reset file inputs
      if (formRef.current) {
        const fileInputs = formRef.current.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => input.value = '');
      }
    } catch (err) {
      console.error("Error submitting application:", err.message);
      alert("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const age = form.dob ? new Date().getFullYear() - new Date(form.dob).getFullYear() : 0;

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-semibold text-blue-700 mb-6">
        Lesotho Passport Online Application
      </h1>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Full Name */}
        <div className="form-group">
          <label htmlFor="apply-fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input 
            id="apply-fullName" 
            name="fullName" 
            type="text" 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
            value={form.fullName} 
            onChange={handleChange} 
            required 
            aria-required="true"
            placeholder="Enter your full name as shown on ID"
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="apply-email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input 
            id="apply-email" 
            name="email" 
            type="email" 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
            value={form.email} 
            onChange={handleChange} 
            required 
            aria-required="true"
            placeholder="Enter your email address"
          />
        </div>

        {/* Date of Birth */}
        <div className="form-group">
          <label htmlFor="apply-dob" className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth *
          </label>
          <input 
            id="apply-dob" 
            name="dob" 
            type="date" 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
            value={form.dob} 
            onChange={handleChange} 
            required 
            aria-required="true"
          />
        </div>

        {/* ID Number */}
        <div className="form-group">
          <label htmlFor="apply-idNumber" className="block text-sm font-medium text-gray-700 mb-2">
            National ID Number *
          </label>
          <input 
            id="apply-idNumber" 
            name="idNumber" 
            type="text" 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
            value={form.idNumber} 
            onChange={handleChange} 
            required 
            aria-required="true"
            placeholder="Enter your national ID number"
          />
        </div>

        {/* Nationality */}
        <div className="form-group">
          <label htmlFor="apply-nationality" className="block text-sm font-medium text-gray-700 mb-2">
            Nationality *
          </label>
          <input 
            id="apply-nationality" 
            name="nationality" 
            type="text" 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
            value={form.nationality} 
            onChange={handleChange} 
            required 
            aria-required="true"
            placeholder="Enter your nationality"
          />
        </div>

        {/* Birth Place */}
        <div className="form-group">
          <label htmlFor="apply-birthPlace" className="block text-sm font-medium text-gray-700 mb-2">
            Birth Place *
          </label>
          <input 
            id="apply-birthPlace" 
            name="birthPlace" 
            type="text" 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
            value={form.birthPlace} 
            onChange={handleChange} 
            required 
            aria-required="true"
            placeholder="Enter your place of birth"
          />
        </div>

        {/* District */}
        <div className="form-group">
          <label htmlFor="apply-district" className="block text-sm font-medium text-gray-700 mb-2">
            District *
          </label>
          <select 
            id="apply-district" 
            name="district" 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
            value={form.district} 
            onChange={handleChange} 
            required 
            aria-required="true"
          >
            <option value="">Select your district</option>
            {DISTRICTS.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>

        {/* Head Chief */}
        <div className="form-group">
          <label htmlFor="apply-headChief" className="block text-sm font-medium text-gray-700 mb-2">
            Head Chief *
          </label>
          <input 
            id="apply-headChief" 
            name="headChief" 
            type="text" 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
            value={form.headChief} 
            onChange={handleChange} 
            required 
            aria-required="true"
            placeholder="Enter your head chief&apos;s name"
          />
        </div>

        {/* Passport Type */}
        <div className="form-group">
          <label htmlFor="apply-passportType" className="block text-sm font-medium text-gray-700 mb-2">
            Passport Type
          </label>
          <select 
            id="apply-passportType" 
            name="passportType" 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
            value={form.passportType} 
            onChange={handleChange}
          >
            <option value="32 pages">Regular Passport – 32 pages (M130.00)</option>
            <option value="64 pages">Regular Passport – 64 pages (M300.00)</option>
          </select>
        </div>

        {/* Sex */}
        <div className="form-group">
          <label htmlFor="apply-sex" className="block text-sm font-medium text-gray-700 mb-2">
            Sex *
          </label>
          <select 
            id="apply-sex" 
            name="sex" 
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
            value={form.sex} 
            onChange={handleChange} 
            required 
            aria-required="true"
          >
            <option value="">Select your sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Conditional Guardian Fields */}
        {age < 16 && (
          <>
            <div className="form-group">
              <label htmlFor="apply-guardianName" className="block text-sm font-medium text-gray-700 mb-2">
                Guardian Name *
              </label>
              <input 
                id="apply-guardianName" 
                name="guardianName" 
                type="text" 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                value={form.guardianName} 
                onChange={handleChange} 
                required 
                aria-required="true"
                placeholder="Enter guardian&apos;s full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="apply-guardianId" className="block text-sm font-medium text-gray-700 mb-2">
                Guardian ID Number *
              </label>
              <input 
                id="apply-guardianId" 
                name="guardianId" 
                type="text" 
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                value={form.guardianId} 
                onChange={handleChange} 
                required 
                aria-required="true"
                placeholder="Enter guardian&apos;s ID number"
              />
            </div>
          </>
        )}

        {/* File Uploads */}
        <FileUpload 
          id="apply-photo"
          name="photoFile"
          label="Take or upload a passport photo" 
          onUploadComplete={setPhotoUrl} 
          required={true}
        />

        <FileUpload 
          id="apply-documents"
          name="documentsFile"
          label="Upload certified documents (e.g., Birth Certificate)" 
          onUploadComplete={setDocsUrl} 
          required={true}
        />

        {/* Signature - Improved Accessibility */}
        <div className="form-group">
          <label htmlFor="signature-canvas" className="block text-sm font-medium text-gray-700 mb-2">
            Draw Your Signature *
          </label>
          <div className="signature-container border border-gray-300 p-4 rounded-lg">
            <SignatureCanvas
              ref={sigCanvasRef}
              penColor="black"
              canvasProps={{ 
                id: "signature-canvas",
                width: 300, 
                height: 100, 
                className: "border border-gray-300 bg-white mx-auto",
                "aria-label": "Signature area - draw your signature using your mouse or touch screen",
                "aria-required": "true",
                role: "application"
              }}
            />
            <div className="flex space-x-2 mt-3">
              <button 
                type="button" 
                onClick={clearSignature} 
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Clear signature"
              >
                Clear Signature
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Draw your signature in the box above. Click &quot;Clear Signature&quot; to start over.
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          name="submit"
          disabled={submitting} 
          className="w-full bg-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {submitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Application...
            </span>
          ) : (
            "Submit Application"
          )}
        </button>

        {/* Reference Number */}
        {refNum && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium text-center">
              ✅ Application submitted successfully!
            </p>
            <p className="text-green-600 text-sm text-center mt-2">
              Reference Number: <strong className="font-mono text-lg">{refNum}</strong>
            </p>
            <p className="text-green-600 text-xs text-center mt-2">
              Please save this reference number for tracking your application.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}