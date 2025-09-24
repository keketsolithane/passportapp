
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl p-8 bg-white shadow">
        <h1 className="text-3xl font-semibold">Passport Services</h1>
        <p className="mt-2 text-slate-600">
          Apply for a new passport, renew one, or track application status.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Link href="/apply" className="block rounded-xl p-5 border bg-slate-50 hover:bg-blue-500">
            <h3 className="font-semibold">Apply</h3>
            <p className="text-sm text-slate-600">Start a new passport application.</p>
          </Link>
          <Link href="/renew" className="block rounded-xl p-5 border bg-slate-50 hover:bg-yellow-500">
            <h3 className="font-semibold">Renew</h3>
            <p className="text-sm text-slate-600">Renew your existing passport.</p>
          </Link>
          <Link href="/status" className="block rounded-xl p-5 border bg-slate-50 hover:bg-green-500">
            <h3 className="font-semibold">Track Status</h3>
            <p className="text-sm text-slate-600">Check your application status.</p>
          </Link>
          <Link href="/updates" className="block rounded-xl p-5 border bg-slate-50 hover:bg-purple-500">
            <h3 className="font-semibold">Check updates</h3>
            <p className="text-sm text-slate-600">Check updates Of All Events.</p>
          </Link>
          <Link href="/readmore" className="block rounded-xl p-5 border bg-slate-50 hover:bg-red-500">
            <h3 className="font-semibold">More Info</h3>
            <p className="text-sm text-slate-600">Get More Information.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
