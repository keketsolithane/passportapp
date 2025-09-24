// pages/online-passport.js
import React from "react";

const districtContacts = [
  { district: "MASERU – DIRECTOR’S OFFICE", contact: "+266 22316618" },
  { district: "MASERU – HEAD OFFICE", contact: "+266 22327142" },
  { district: "SEMONKONG", contact: "N/A" },
  { district: "BEREA", contact: "+266 22500215" },
  { district: "LERIBE", contact: "+266 22400341" },
  { district: "BOTHA-BOTHE", contact: "+266 22460230" },
  { district: "MOKHOTLONG", contact: "+266 22920227" },
  { district: "THABA-TSEKA", contact: "+266 22900250" },
  { district: "QACHA’S NEK", contact: "+266 22950225" },
  { district: "QUTHING", contact: "+266 22750214" },
  { district: "MOUNT MOOROSI", contact: "N/A" },
  { district: "MOHALE’S HOEK", contact: "+266 22785312" },
  { district: "MAFETENG", contact: "+266 22700250" },
];

export default function OnlinePassport() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-4 text-blue-700">
          Online Passport Services
        </h1>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">About Passport Services</h2>
          <p>
            The Department of Passport Services is an integral part of the Ministry of Home Affairs. It has ten (10) passport offices across all administrative districts and two (2) satellite offices in Mt. Moorosi (Quthing) and Semonkong (Maseru). The department facilitates the movement of people through the issuance of travel documents (passports). Online applications are now available for convenience.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Passport Application Requirements</h2>
          
          <h3 className="font-semibold mt-4">16 yrs and Above (Adults):</h3>
          <ul className="list-disc list-inside ml-4">
            <li>
              <strong>First Applicants:</strong> Apply online and later visit a passport office with Identity Card and appropriate fee.
            </li>
            <li>
              <strong>Replacements:</strong> Old passport, Identity Card, and appropriate fee.
            </li>
          </ul>

          <h3 className="font-semibold mt-4">Below 16 years (Minor):</h3>
          <ul className="list-disc list-inside ml-4">
            <li>Be accompanied by a parent/guardian.</li>
            <li>Child’s Birth Certificate.</li>
            <li>Parent/Guardian’s consent letter and Identity documents.</li>
            <li>Appropriate passport fee.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Fees</h2>
          <ul className="list-disc list-inside ml-4">
            <li>Regular passport – 32 pages = M 130.00</li>
            <li>Regular passport – 64 pages = M 300.00</li>
            <li>For other passport types, fees and sundry refer to:
              <ul className="list-disc list-inside ml-4">
                <li>The Lesotho Passport and Travel Documents Act, 2018</li>
                <li>Lesotho Passports and Travel Documents (Fees) Regulations, 2019</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">District Passport Contacts</h2>
          <table className="w-full border border-gray-300 rounded-md">
            <thead className="bg-blue-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">District Passport Office</th>
                <th className="border border-gray-300 p-2 text-left">Contacts</th>
              </tr>
            </thead>
            <tbody>
              {districtContacts.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                  <td className="border border-gray-300 p-2">{item.district}</td>
                  <td className="border border-gray-300 p-2">{item.contact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
