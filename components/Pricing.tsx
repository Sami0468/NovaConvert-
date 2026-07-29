"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const plans = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    desc: "For trying NovaConvert out",
    features: ["10 conversions / day", "Max 25MB per file", "Core image & PDF tools", "24h auto-delete"],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Pro",
    monthly: 9,
    yearly: 90,
    desc: "For regular, everyday use",
    features: ["Unlimited conversions", "Max 500MB per file", "All AI tools", "Batch conversion", "Priority queue", "No ads"],
    cta: "Go Pro",
    highlighted: true,
  },
  {
    name: "Business",
    monthly: 29,
    yearly: 290,
    desc: "For teams shipping at scale",
    features: ["Everything in Pro", "Team workspaces", "API access", "Shared cloud storage", "Admin dashboard", "Priority support"],
    cta: "Contact sales",
    highlighted: false,
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto mb-10 max-w-2xl text-center"
      >
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Simple, honest pricing</h2>
        <p className="mt-4 text-ink-dim">Start free. Upgrade only when you actually need more.</p>
      </motion.div>

      <div className="mb-12 flex items-center justify-center gap-3 text-sm">
        <span className={clsx(!yearly ? "text-ink" : "text-ink-faint")}>Monthly</span>
        <button
          onClick={() => setYearly((v) => !v)}
          className="relative h-6 w-11 rounded-full bg-panel-2 transition-colors"
          aria-label="Toggle yearly billing"
        >
          <span
            className={clsx(
              "absolute top-1 h-4 w-4 rounded-full bg-nova-gradient transition-transform",
              yearly ? "translate-x-6" : "translate-x-1"
            )}
          />
        </button>
        <span className={clsx(yearly ? "text-ink" : "text-ink-faint")}>
          Yearly <span className="text-mint">(save ~17%)</span>
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className={clsx(
              "relative rounded-2xl border p-8",
              plan.highlighted ? "border-cyan/50 bg-panel/80 shadow-[0_0_60px_rgba(34,211,238,0.12)]" : "glass-card"
            )}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-nova-gradient px-3 py-1 text-xs font-semibold text-void">
                Most popular
              </span>
            )}
            <h3 className="font-display text-xl font-bold">{plan.name}</h3>
            <p className="mt-1 text-sm text-ink-dim">{plan.desc}</p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold">
                ${yearly ? Math.round(plan.yearly / 12) : plan.monthly}
              </span>
              <span className="text-sm text-ink-dim">/mo</span>
            </div>
            {yearly && plan.monthly > 0 && (
              <p className="mt-1 text-xs text-ink-faint">billed ${plan.yearly}/year</p>
            )}

            <ul className="mt-7 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink-dim">
                  <Check size={16} className="mt-0.5 shrink-0 text-mint" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/login?mode=signup"
              className={clsx("mt-8 block text-center", plan.highlighted ? "btn-gradient" : "btn-outline")}
            >
              {plan.cta}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
