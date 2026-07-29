import Link from "next/link";
import Logo from "./Logo";

const cols = [
  { title: "Product", links: ["PDF Tools", "Image Tools", "AI Tools", "Pricing"] },
  { title: "Company", links: ["About", "Careers", "API Documentation"] },
  { title: "Legal", links: ["Privacy Policy", "Terms", "Cookies"] },
];

export default function Footer() {
  return (
    <footer className="border-t border-line/60 bg-panel/30">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
              <Logo size={56} />
              <div className="flex items-baseline gap-1">
                <span className="text-cyan">Nova</span>
                <span className="text-white">Convert</span>
              </div>
            </div>
            <p className="max-w-xs text-sm text-ink-dim">Convert Anything. Anywhere. Instantly.</p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold text-ink">{col.title}</h4>
              <ul className="space-y-2 text-sm text-ink-dim">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="transition-colors hover:text-cyan-soft">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-line/60 pt-6 text-center text-xs text-ink-faint">
          © {new Date().getFullYear()} NovaConvert. Built as a portfolio project by Muhammad Sami ur Rehman.
        </div>
      </div>
    </footer>
  );
}
