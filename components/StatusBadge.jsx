
export default function StatusBadge({ value }) {
  const colors = {
    RECEIVED: "bg-blue-100 text-blue-700",
    IN_REVIEW: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    ISSUED: "bg-emerald-100 text-emerald-700"
  };
  return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[value] || "bg-slate-100"}`}>{value}</span>;
}
