import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardNav from "@/components/DashboardNav";
import ConvertPanel from "@/components/ConvertPanel";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen">
      <DashboardNav user={session.user} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-display text-2xl font-bold">
          Hello {session.user.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="mt-1 text-sm text-ink-dim">Upload a file, pick a format, and download the result.</p>

        <ConvertPanel />
      </main>
    </div>
  );
}
