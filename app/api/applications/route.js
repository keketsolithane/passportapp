
import { NextResponse } from "next/server";


export async function POST(req) {
  const body = await req.json();
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const rec = createApplication(body);
  return NextResponse.json({ reference: rec.reference });
}
