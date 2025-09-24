"use client";
import { useEffect, useState } from "react";

export default function Updates() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch updates from backend API
  useEffect(() => {
    async function fetchUpdates() {
      try {
        const res = await fetch("/api/updates");
        const data = await res.json();
        setUpdates(data);
      } catch (err) {
        console.error("Failed to fetch updates:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUpdates();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-[var(--brand)] mb-8">
          Latest Updates
        </h1>

        {loading ? (
          <p className="text-center text-gray-600">Loading updates...</p>
        ) : updates.length === 0 ? (
          <p className="text-center text-gray-600">
            No updates available at this time.
          </p>
        ) : (
          <div className="space-y-6">
            {updates.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-xl shadow bg-white hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-800">
                  {item.title}
                </h2>
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(item.date).toLocaleDateString()}
                </p>
                <p className="text-gray-700">{item.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
