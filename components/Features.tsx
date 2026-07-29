"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, Brain, Layers, Cloud, Sparkles } from "lucide-react";

const features = [
  { Icon: Zap, title: "Instant conversions", desc: "Real image and document processing runs server-side — no watching a fake progress bar." },
  { Icon: Brain, title: "AI tools built in", desc: "OCR, summarization, translation, and resume scoring, all in one workspace." },
  { Icon: ShieldCheck, title: "Auto-delete after 24h", desc: "Files are processed in memory and never kept longer than they need to be." },
  { Icon: Layers, title: "Batch conversion", desc: "Queue multiple files and let NovaConvert work through them in order." },
  { Icon: Cloud, title: "Cloud history", desc: "Every conversion is logged to your account so you can re-download anytime." },
  { Icon: Sparkles, title: "Built for makers", desc: "Clean API-first architecture designed to be extended with new format engines." },
];

export default function Features() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-16 max-w-2xl text-center"
      >
        <h2 className="font-display text-3xl font-bold sm:text-4xl">A full conversion ecosystem</h2>
        <p className="mt-4 text-ink-dim">Not just PDF-to-Word. Documents, images, audio and video, in one place.</p>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="glass-card group p-6 transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-nova-gradient text-void">
              <Icon size={20} />
            </div>
            <h3 className="font-display text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-ink-dim">{desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
