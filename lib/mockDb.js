
const store = new Map();

function randomRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function createApplication(payload) {
  const ref = randomRef();
  const record = {
    reference: ref,
    status: "RECEIVED",
    message: "Your application has been received.",
    payload,
    createdAt: new Date().toISOString()
  };
  store.set(ref, record);
  return record;
}

export function getStatus(ref) {
  const rec = store.get(ref);
  if (!rec) return null;
  const steps = [
    { status: "RECEIVED", message: "Your application has been received." },
    { status: "IN_REVIEW", message: "Your application is being reviewed." },
    { status: "APPROVED", message: "Your application was approved." },
    { status: "ISSUED", message: "Your passport has been issued." }
  ];
  const i = Math.min(Math.floor((Date.now()/1000) % steps.length), steps.length-1);
  return { reference: rec.reference, ...steps[i] };
}
