
"use client";
import { useState } from "react";
import StatusBadge from '../../components/StatusBadge';

export default function Status() {
  const [ref, setRef] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function checkStatus(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(`/api/status/${encodeURIComponent(ref)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Not found");
      setStatus(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl p-6 bg-white shadow">
      <h1 className="text-2xl font-semibold">Track Status</h1>
      <form onSubmit={checkStatus} className="mt-4 flex gap-2">
        <input className="flex-1 border p-2 rounded" placeholder="Reference number" value={ref} onChange={e=>setRef(e.target.value)} />
        <button className="bg-[var(--brand)] text-white px-4 py-2 rounded">Check</button>
      </form>
      {loading && <p>Checking...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {status && (
        <div className="mt-4 border rounded p-4">
          <p>Reference: {status.reference}</p>
          <p>Status: <StatusBadge value={status.status} /></p>
          <p>{status.message}</p>
        </div>
      )}
    </div>
  );
}
