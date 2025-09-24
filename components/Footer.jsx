
export default function Footer() {
  return (
    <footer className="mt-12 border-t bg-white">
      <div className="container py-6 text-sm text-slate-600 flex flex-col sm:flex-row gap-2 sm:justify-between">
        <p>© {new Date().getFullYear()} Passport Services </p>
        <p>Fast and always active</p>
      </div>
    </footer>
  );
}
