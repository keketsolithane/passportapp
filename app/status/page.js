"use client";
import { useState } from 'react';
import StatusBadge from '../../components/StatusBadge';

export default function Status() {
  const [ref, setRef] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  async function checkStatus(e) {
    e.preventDefault();
    
    if (!ref.trim()) {
      setError("Please enter a reference number");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus(null);
    setDebugInfo(null);
    
    try {
      console.log('🔍 Checking status for:', ref.trim());
      
      // Use dynamic route to call the API
      const response = await fetch(`/api/status/${encodeURIComponent(ref.trim())}`);
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        // Handle 404 and other errors
        const errorData = await response.json();
        
        if (errorData.debug) {
          setDebugInfo(errorData.debug);
        }
        
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Status data received from database:', data);
      setStatus(data);
      
    } catch (err) {
      console.error('❌ Status check error:', err);
      
      if (err.message.includes('not found')) {
        setError('Application not found with this reference number');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(err.message || "Failed to check status. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Application Status</h1>
            <p className="text-gray-600">Enter your reference number to check your passport application status</p>
          </div>

          <form onSubmit={checkStatus} className="space-y-6">
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-2">
                Reference Number
              </label>
              <input
                id="reference"
                type="text"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="Enter your reference number (e.g., LS-123456789)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking Status...
                </div>
              ) : (
                'Check Status'
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800 font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
              
              {debugInfo && (
                <div className="mt-4 p-3 bg-red-100 rounded border border-red-200">
                  <h4 className="font-semibold text-red-800 text-sm mb-2">Debug Information:</h4>
                  <div className="text-red-700 text-sm">
                    <p><strong>Total applications in database:</strong> {debugInfo.totalApplications || 0}</p>
                    <p><strong>Searched for:</strong> {debugInfo.searchedFor}</p>
                    {debugInfo.availableReferences && debugInfo.availableReferences.length > 0 && (
                      <div className="mt-2">
                        <p><strong>Available references in database:</strong></p>
                        <ul className="list-disc list-inside mt-1">
                          {debugInfo.availableReferences.map((ref, index) => (
                            <li key={index} className="font-mono text-xs">{ref}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status Results - Displaying Real Database Data */}
          {status && (
            <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-green-50 px-6 py-4 border-b border-green-200">
                <h2 className="text-lg font-semibold text-green-900">Application Details</h2>
                <p className="text-green-700 text-sm">Retrieved from database</p>
              </div>
              
              <div className="p-6">
                {/* Application Status Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Reference Number</p>
                    <p className="text-xl font-bold text-blue-800 font-mono">{status.reference}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Current Status</p>
                    <div className="mt-1">
                      <StatusBadge value={status.status} />
                    </div>
                  </div>
                </div>

                {/* Status Message */}
                {status.message && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Status Update</h4>
                    <p className="text-blue-700">{status.message}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Need Help?</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Make sure you&apos;re using the exact reference number from your confirmation</li>
              <li>Reference numbers are case-sensitive and must match exactly</li>
              <li>Applications may take a few minutes to appear in the system after submission</li>
              <li>If you just submitted an application, wait 2-3 minutes and try again</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}