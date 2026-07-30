import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardNav from "@/components/DashboardNav";
import ConvertPanel from "@/components/ConvertPanel";
import { getHistoryForUser, getStatsForUser } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  // node:sqlite returns null-prototype row objects. Client Components only
  // accept plain serializable objects, so normalize these records first.
  const history = (getHistoryForUser(session.user.email) as any[]).map((row) => ({
    id: String(row.id),
    file_name: String(row.file_name),
    from_format: String(row.from_format),
    to_format: String(row.to_format),
    file_size: Number(row.file_size),
    created_at: String(row.created_at),
  }));
  const stats = getStatsForUser(session.user.email);

  return (
    <div className="min-h-screen">
      <DashboardNav user={session.user} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold">
          Hello {session.user.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="mt-1 text-sm text-ink-dim">Upload a file, pick a format, and download the result.</p>

        <ConvertPanel initialHistory={history} initialStats={stats} />
      </main>
    </div>
  );
}
