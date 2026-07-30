import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getHistoryForUser, getStatsForUser } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const history = getHistoryForUser(session.user.email);
  const stats = getStatsForUser(session.user.email);
  return NextResponse.json({ history, stats }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
