
import { NextResponse } from "next/server";
import { getStatus } from '../../../lib/mockDb.js';

export async function GET(_req, { params }) {
  const { ref } = params;
  const status = getStatus(ref);
  if (!status) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(status);
}
