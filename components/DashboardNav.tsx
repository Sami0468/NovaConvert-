"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import type { Session } from "next-auth";
import Logo from "./Logo";
import { span } from "framer-motion/m";

export default function DashboardNav({ user }: { user: Session["user"] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-void/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex flex-col items-center gap-1 font-display text-lg font-bold">
          <Logo size={56} />
          <div className="flex items-center gap-1 text-center">
            <span className="text-cyan">Nova</span>
            <span className="text-white">Convert</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {user?.image ? (
              <Image src={user.image} alt={user.name || "User"} width={32} height={32} className="rounded-full" />
            ) : (
              <div className="grid h-8 w-8 place-items-center rounded-full bg-nova-gradient text-sm font-bold text-void">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <span className="hidden text-sm text-ink-dim sm:inline">{user?.name || user?.email}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-ink-dim transition-colors hover:border-rose/50 hover:text-rose"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
