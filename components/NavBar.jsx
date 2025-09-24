
import Link from "next/link";

export default function NavBar() {
  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="container flex items-center justify-between h-14">
        <Link href="/" className="font-semibold text-[var(--brand)]">Passport Services</Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/apply" className="hover:underline">Apply</Link>
          <Link href="/renew" className="hover:underline">Renew</Link>
          <Link href="/status" className="hover:underline">Status</Link>
           <Link href="/updates" className="hover:underline">Updates</Link>
           <Link href="/" className="hover:underline">Home</Link>
        </nav>
      </div>
    </header>
  );
}
