"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Image as ImageIcon, FileType2, Music, Video, ArrowRight, Plus, Image as FileIcon } from "lucide-react";

const floaters = [
  { Icon: FileText, top: "12%", left: "8%", delay: 0, color: "text-purple-400" },
  { Icon: ImageIcon, top: "70%", left: "6%", delay: 1.2, color: "text-fuchsia-400" },
  { Icon: FileType2, top: "22%", left: "88%", delay: 0.6, color: "text-violet-400" },
  { Icon: Music, top: "68%", left: "90%", delay: 1.8, color: "text-purple-500" },
  { Icon: Video, top: "88%", left: "45%", delay: 0.9, color: "text-fuchsia-500" },
];

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-screen items-center overflow-hidden pt-28 bg-slate-950 text-white">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute -left-32 top-10 h-[420px] w-[420px] animate-blob rounded-full bg-purple-600/10 blur-[110px]" />
      <div className="pointer-events-none absolute -right-24 top-40 h-[480px] w-[480px] animate-blob rounded-full bg-violet-600/15 blur-[120px]" style={{ animationDelay: "3s" }} />

      {/* Particle dots */}
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{
        backgroundImage: "radial-gradient(rgba(168,85,247,0.15) 1px, transparent 1px)",
        backgroundSize: "34px 34px",
      }} />

      {/* Floating file icons */}
      {floaters.map(({ Icon, top, left, delay, color }, i) => (
        <motion.div
          key={i}
          className={`pointer-events-none absolute hidden md:block ${color}`}
          style={{ top, left }}
          animate={{ y: [0, -18, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
        >
          <div className="rounded-2xl border border-purple-500/20 bg-slate-900/50 backdrop-blur-md grid h-14 w-14 place-items-center shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <Icon size={22} />
          </div>
        </motion.div>
      ))}

      <div className="relative mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:items-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-950/40 px-4 py-1.5 text-xs text-purple-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            100+ formats · AI tools included
          </div>

          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Convert Anything.
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">Anywhere. Instantly.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-slate-400">
            One workspace for every document, image, audio, and video conversion —
            with AI-powered OCR, summarization, and translation built in.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/login?mode=signup" className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 font-medium inline-flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              Convert Now <ArrowRight size={16} />
            </Link>
            <a href="#tools" className="px-6 py-3 rounded-xl border border-slate-700 hover:border-purple-500 hover:bg-purple-500/5 transition-all text-slate-300">
              Explore Tools
            </a>
          </div>

          <div className="mt-10 flex items-center gap-3 text-sm text-slate-400">
            <span className="text-amber-500">★★★★★</span>
            Trusted by thousands of students &amp; developers
          </div>
        </motion.div>

        {/* Futuristic Purple Upload Dashboard (Matching the Screenshot Layout) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
          className="relative justify-self-center lg:justify-self-end w-full max-w-xl"
        >
          {/* Main Outer Panel with Purple Border Glow */}
          <div className="relative rounded-[2rem] border border-purple-500/40 bg-slate-950/80 p-8 shadow-[0_0_50px_rgba(147,51,234,0.15)] backdrop-blur-xl">
            
            {/* Top Grid: Image Preview & Circular Progress */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
              
              {/* Left Side: Image Preview Box */}
              <div className="relative aspect-square w-full max-w-[220px] mx-auto rounded-2xl border border-purple-500/30 overflow-hidden group shadow-[0_0_20px_rgba(147,51,234,0.1)]">
                {/* Simulated Mountain Image background */}
                <div 
                  className="w-full h-full bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80')` }}
                />
                {/* Plus (+) Overlay Button top right */}
                <div className="absolute top-3 right-3 h-7 w-7 rounded-lg bg-purple-600/80 hover:bg-purple-500 border border-purple-400/40 flex items-center justify-center text-white cursor-pointer backdrop-blur-sm transition-all">
                  <Plus size={16} />
                </div>
              </div>

              {/* Right Side: Circular Uploading Progress */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative h-36 w-36 flex items-center justify-center">
                  {/* SVG Circular Ring */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Track Circle */}
                    <circle 
                      cx="50" cy="50" r="40" 
                      className="stroke-purple-950/40 fill-none" 
                      strokeWidth="6"
                    />
                    {/* Animated Glow / Filled Circle */}
                    <circle 
                      cx="50" cy="50" r="40" 
                      className="stroke-purple-500 fill-none transition-all duration-500" 
                      strokeWidth="6"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * 68) / 100} // 68% Filled
                      strokeLinecap="round"
                      style={{ filter: "drop-shadow(0px 0px 6px rgba(168, 85, 247, 0.6))" }}
                    />
                  </svg>
                  {/* Inner text */}
                  <span className="absolute text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                    68%
                  </span>
                </div>
                <p className="mt-4 text-xs font-mono tracking-[0.4em] text-purple-400 font-semibold uppercase">
                  Uploading
                </p>
              </div>

            </div>

            {/* Bottom Section: File Info and Linear Progress Bar */}
            <div className="mt-8 pt-6 border-t border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* File Icon & details */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="text-purple-400">
                  <FileIcon size={24} className="drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-slate-200">mountain_lake.jpg</p>
                  <p className="text-xs text-slate-500">2.4 MB</p>
                </div>
              </div>

              {/* Linear Bar and percentage */}
              <div className="flex items-center gap-4 w-full sm:w-72">
                {/* Tiny Up Arrow Icon */}
                <span className="text-purple-400 text-sm font-bold">↑</span>
                {/* Progress bar container */}
                <div className="h-2 w-full bg-purple-950/60 rounded-full overflow-hidden border border-purple-500/10">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]" 
                    style={{ width: "68%" }}
                  />
                </div>
                {/* Percentage value */}
                <span className="text-xs font-mono text-slate-400 min-w-[28px] text-right">
                  68%
                </span>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}