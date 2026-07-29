"use client";

import { motion } from "framer-motion";
import { FileText, ImageIcon, FileSpreadsheet, Music2, Video, Sparkles } from "lucide-react";
import Link from "next/link";

const categories = [
  {
    Icon: FileText,
    title: "PDF Tools",
    color: "text-rose",
    items: ["PDF → Word (live)", "PDF → JPG/PNG (live)", "Merge PDF", "Compress PDF", "Watermark", "Sign PDF"],
    live: "partial",
  },
  {
    Icon: ImageIcon,
    title: "Image Tools",
    color: "text-cyan",
    items: ["JPG ↔ PNG", "WEBP ↔ PNG", "AVIF ↔ JPG", "Compress Image", "Image → PDF"],
    live: true,
  },
  {
    Icon: FileSpreadsheet,
    title: "Office Tools",
    color: "text-violet",
    items: ["Word → PDF", "Excel → PDF", "PPT → PDF", "TXT → PDF", "CSV → Excel"],
    live: "partial",
  },
  {
    Icon: Music2,
    title: "Audio Tools",
    color: "text-amber",
    items: ["MP3 ↔ WAV", "FLAC → MP3", "Audio Cutter", "Audio Joiner", "Compressor"],
    live: false,
  },
  {
    Icon: Video,
    title: "Video Tools",
    color: "text-mint",
    items: ["MP4 ↔ AVI", "MOV → MP4", "Compress Video", "Trim Video", "Extract Audio"],
    live: false,
  },
  {
    Icon: Sparkles,
    title: "AI Tools",
    color: "text-cyan-soft",
    items: ["AI OCR", "PDF Summary", "AI Translator", "Resume Checker", "AI Upscale"],
    live: false,
  },
];

export default function ToolsShowcase() {
  return (
    <section id="tools" className="mx-auto max-w-7xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-14 max-w-2xl text-center"
      >
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Every tool, one workspace</h2>
        <p className="mt-4 text-ink-dim">
          Image tools are fully live. Everything else is scoped and ready for its conversion engine — see the roadmap in the README.
        </p>
      </motion.div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {categories.map(({ Icon, title, color, items, live }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="glass-card p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className={`flex items-center gap-2 ${color}`}>
                <Icon size={20} />
                <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
              </div>
              {live === true && (
                <span className="rounded-full bg-mint/15 px-2.5 py-1 text-[10px] font-semibold text-mint">LIVE</span>
              )}
              {live === "partial" && (
                <span className="rounded-full bg-amber/15 px-2.5 py-1 text-[10px] font-semibold text-amber">PARTIAL</span>
              )}
              {live === false && (
                <span className="rounded-full bg-ink-faint/15 px-2.5 py-1 text-[10px] font-semibold text-ink-faint">SOON</span>
              )}
            </div>
            <ul className="space-y-2 text-sm text-ink-dim">
              {items.map((it) => (
                <li key={it} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-ink-faint" />
                  {it}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/login?mode=signup" className="btn-gradient">
          Try the live tools
        </Link>
      </div>
    </section>
  );
}
