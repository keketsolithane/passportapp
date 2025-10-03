"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import StatusBadge from "../../components/StatusBadge";

export default function Updates() {
  const [approvedData, setApprovedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch approved applications directly from Supabase
  useEffect(() => {
    async function fetchApprovedApplications() {
      try {
        // Fetch all applications with approved statuses
        const { data: applications, error: fetchError } = await supabase
          .from('passport_applications')
          .select('*')
          .in('status', ['Approved', 'Ready for Pickup', 'Dispatched', 'Completed'])
          .order('updated_at', { ascending: false });

        if (fetchError) {
          throw new Error('Failed to fetch applications: ' + fetchError.message);
        }

        // Calculate statistics
        const totalApproved = applications?.length || 0;
        const readyForPickup = applications?.filter(app => app.status === 'Ready for Pickup').length || 0;
        const dispatched = applications?.filter(app => app.status === 'Dispatched').length || 0;

        setApprovedData({
          totalApproved,
          readyForPickup,
          dispatched,
          applications: applications || []
        });

      } catch (err) {
        console.error("Failed to fetch approved applications:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchApprovedApplications();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-2">
          Approved Applications
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Track the status of approved passport applications
        </p>

        {loading ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white rounded-lg shadow">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-700">Loading approved applications...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">Error: {error}</p>
          </div>
        ) : !approvedData ? (
          <p className="text-center text-gray-600">
            No data available.
          </p>
        ) : (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow border border-green-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Approved</p>
                    <p className="text-2xl font-bold text-green-700">{approvedData.totalApproved}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow border border-blue-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ready for Pickup</p>
                    <p className="text-2xl font-bold text-blue-700">{approvedData.readyForPickup}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow border border-purple-200">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Dispatched</p>
                    <p className="text-2xl font-bold text-purple-700">{approvedData.dispatched}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Approved Applications List */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h2 className="text-xl font-semibold text-gray-800">
                  Approved Applications List
                </h2>
                <p className="text-sm text-gray-600">
                  {approvedData.totalApproved} approved application(s) found
                </p>
              </div>

              {approvedData.applications.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="text-gray-500">No approved applications found.</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Applications will appear here once they are approved.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applicant Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reference Number
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Passport Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {approvedData.applications.map((application, index) => (
                        <tr key={application.id || index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {application.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {application.full_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {application.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-900">{application.reference}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge value={application.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {application.passport_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {application.updated_at ? new Date(application.updated_at).toLocaleDateString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Summary</h3>
              <p className="text-blue-700">
                Total of <strong>{approvedData.totalApproved}</strong> applications have been approved. 
                {approvedData.readyForPickup > 0 && ` ${approvedData.readyForPickup} are ready for pickup.`}
                {approvedData.dispatched > 0 && ` ${approvedData.dispatched} have been dispatched.`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}