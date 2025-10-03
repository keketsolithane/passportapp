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
    setError(null); // Clear errors when user types
  };

  const handleFileChange = (e) => {
    setPhotoFile(e.target.files[0]);
    setError(null); // Clear errors when file is selected
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!photoFile) {
      setError("Please upload a passport photo.");
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(photoFile.type)) {
      setError("Please upload a valid image file (JPEG, PNG, or GIF).");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const bucketName = "passport-files";
      const fileExt = photoFile.name.split(".").pop();
      
      // Create unique filename to avoid conflicts
      const timestamp = Date.now();
      const fileName = `renewals/passport_${form.passportNumber}_${timestamp}.${fileExt}`;

      console.log("Uploading file:", fileName);

      // Upload photo to Supabase
      const { error: uploadError } = await supabase
        .storage
        .from(bucketName)
        .upload(fileName, photoFile, { 
          cacheControl: "3600", 
          upsert: false // Changed to false to avoid CORB issues
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        
        // If file exists, create a new unique name
        if (uploadError.message.includes('already exists')) {
          const retryFileName = `renewals/passport_${form.passportNumber}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          
          const { error: retryError } = await supabase
            .storage
            .from(bucketName)
            .upload(retryFileName, photoFile, { 
              cacheControl: "3600", 
              upsert: false 
            });
            
          if (retryError) throw retryError;
          
          // Use the retry file name for the rest of the process
          const { data: urlData } = supabase
            .storage
            .from(bucketName)
            .getPublicUrl(retryFileName);

          await saveRenewalApplication(urlData.publicUrl);
        } else {
          throw uploadError;
        }
      } else {
        // Get public URL
        const { data: urlData } = supabase
          .storage
          .from(bucketName)
          .getPublicUrl(fileName);

        await saveRenewalApplication(urlData.publicUrl);
      }

    } catch (err) {
      console.error("Error submitting renewal:", err);
      setError("Failed to submit renewal: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function saveRenewalApplication(photoUrl) {
    try {
      // Insert into renewals table
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
      
      // Reset form
      setForm({ name: "", surname: "", passportNumber: "", district: "" });
      setPhotoFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

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
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-center">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Name Field */}
        <div>
          <label htmlFor="renew-name" className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            id="renew-name"
            name="name"
            type="text"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={form.name}
            onChange={handleChange}
            required
            aria-required="true"
            aria-describedby="name-help"
            placeholder="Enter your first name"
          />
          <div id="name-help" className="sr-only">Enter your first name</div>
        </div>

        {/* Surname Field */}
        <div>
          <label htmlFor="renew-surname" className="block text-sm font-medium text-gray-700 mb-2">
            Surname *
          </label>
          <input
            id="renew-surname"
            name="surname"
            type="text"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={form.surname}
            onChange={handleChange}
            required
            aria-required="true"
            aria-describedby="surname-help"
            placeholder="Enter your surname"
          />
          <div id="surname-help" className="sr-only">Enter your surname</div>
        </div>

        {/* Passport Number Field */}
        <div>
          <label htmlFor="renew-passport" className="block text-sm font-medium text-gray-700 mb-2">
            Passport Number *
          </label>
          <input
            id="renew-passport"
            name="passportNumber"
            type="text"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={form.passportNumber}
            onChange={handleChange}
            required
            aria-required="true"
            aria-describedby="passport-help"
            placeholder="Enter your current passport number"
          />
          <div id="passport-help" className="sr-only">Enter your current passport number</div>
        </div>

        {/* District Field */}
        <div>
          <label htmlFor="renew-district" className="block text-sm font-medium text-gray-700 mb-2">
            District *
          </label>
          <select
            id="renew-district"
            name="district"
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            value={form.district}
            onChange={handleChange}
            required
            aria-required="true"
            aria-describedby="district-help"
          >
            <option value="">Select your district</option>
            {DISTRICTS.map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
          <div id="district-help" className="sr-only">Select your district from the dropdown</div>
        </div>

        {/* Photo Upload Field */}
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
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={handleFileChange}
            required
            aria-required="true"
            aria-describedby="photo-help"
          />
          <div id="photo-help" className="text-xs text-gray-500 mt-2">
            Upload a recent passport-sized photo (JPEG, PNG, or GIF)
          </div>
          {photoFile && (
            <div className="text-sm text-green-600 mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {photoFile.name} selected ({Math.round(photoFile.size / 1024)} KB)
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          name="submit"
          disabled={submitting}
          className="w-full bg-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-800 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={submitting ? "Processing renewal application" : "Submit renewal application"}
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
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-center">
              <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Renewal Submitted Successfully!
              </h3>
              <p className="text-green-700 mb-3">
                Your passport renewal application has been received.
              </p>
              <div className="bg-green-100 p-3 rounded-lg border border-green-200">
                <p className="text-sm text-green-600 mb-1">Your Reference Number:</p>
                <p className="text-xl font-bold text-green-800 font-mono">{ref}</p>
              </div>
              <p className="text-green-600 text-sm mt-3">
                Please save this reference number for tracking your application status.
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}