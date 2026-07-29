"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const links = [
  { href: "/#tools", label: "Tools" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#about", label: "About" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-line/60 bg-void/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight whitespace-nowrap">
          <Logo size={56} />
          <div className="flex items-baseline gap-1 whitespace-nowrap">
            <span className="text-cyan">Nova</span>
            <span className="text-white">Convert</span>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-ink-dim transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {status === "authenticated" ? (
            <>
              <Link href="/dashboard" className="text-sm text-ink-dim hover:text-ink">
                Dashboard
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-outline !px-4 !py-2 text-sm">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-ink-dim hover:text-ink">
                Log in
              </Link>
              <Link href="/login?mode=signup" className="btn-gradient !px-4 !py-2 text-sm">
                Sign up free
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line/60 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-ink-dim">
                {l.label}
              </a>
            ))}
            <div className="mt-2 flex gap-3">
              {status === "authenticated" ? (
                <Link href="/dashboard" className="btn-gradient w-full text-center text-sm">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="btn-outline w-full text-center text-sm">
                    Log in
                  </Link>
                  <Link href="/login?mode=signup" className="btn-gradient w-full text-center text-sm">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
