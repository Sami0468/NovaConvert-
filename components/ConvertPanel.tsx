"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud, FileIcon, Download, X, Loader2, CheckCircle2, AlertCircle,
  Files, HardDrive, Star, Clock,
} from "lucide-react";
import clsx from "clsx";

const IMAGE_FORMATS = ["png", "jpg", "webp", "avif", "tiff"];

function targetsFor(ext: string): string[] {
  if (IMAGE_FORMATS.includes(ext)) return [...IMAGE_FORMATS.filter((f) => f !== ext), "pdf"];
  if (ext === "txt") return ["pdf"];
  if (ext === "pdf") return ["docx", "png", "jpg"];
  if (ext === "xlsx") return ["pdf", "docx", "png", "jpg"];
  return [];
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

type Stats = { filesConverted: number; storageUsed: number; favoriteTool: string };
type HistoryItem = { id: string; file_name: string; from_format: string; to_format: string; file_size: number; created_at: string };

export default function ConvertPanel() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "converting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [downloadName, setDownloadName] = useState<string>("");
  const [stats, setStats] = useState<Stats>({ filesConverted: 0, storageUsed: 0, favoriteTool: "—" });
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const loadHistory = useCallback(async () => {
    const res = await fetch("/api/history");
    if (res.ok) {
      const data = await res.json();
      setStats(data.stats);
      setHistory(data.history);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const weeklyData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { key: d.toISOString().slice(0, 10), label: d.toLocaleDateString(undefined, { weekday: "short" }), count: 0 };
    });
    const byKey = new Map(days.map((d) => [d.key, d]));
    for (const h of history) {
      const key = h.created_at.slice(0, 10);
      const bucket = byKey.get(key);
      if (bucket) bucket.count += 1;
    }
    return days;
  }, [history]);

  const isHistoryEmpty = history.length === 0;

  const ext = file ? (file.name.split(".").pop() || "").toLowerCase() : "";
  const availableTargets = ext ? targetsFor(ext) : [];

  const onFile = (f: File) => {
    setFile(f);
    setStatus("idle");
    setDownloadUrl("");
    const t = targetsFor((f.name.split(".").pop() || "").toLowerCase());
    setTarget(t[0] || "");
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.[0]) onFile(e.dataTransfer.files[0]);
  };

  const convert = async () => {
    if (!file || !target) return;
    setStatus("converting");
    setErrorMsg("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("target", target);
      const res = await fetch("/api/convert", { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Conversion failed.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const cd = res.headers.get("X-File-Name") || `${file.name.split(".")[0]}.${target}`;
      setDownloadUrl(url);
      setDownloadName(cd);
      setStatus("done");
      loadHistory();
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  const reset = () => {
    setFile(null);
    setTarget("");
    setStatus("idle");
    setDownloadUrl("");
    setErrorMsg("");
  };

  return (
    <div className="mt-8 space-y-8">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Files} label="Files Converted" value={String(stats.filesConverted)} color="text-cyan" />
        <StatCard icon={HardDrive} label="Storage Used" value={formatBytes(stats.storageUsed)} color="text-violet" />
        <StatCard icon={Star} label="Favorite Tool" value={stats.favoriteTool.toUpperCase()} color="text-amber" />
      </div>

      {/* Weekly usage — real data from conversion history */}
      <div className="glass-card p-6">
        <h2 className="mb-4 font-display text-base font-semibold">Weekly usage</h2>
        <div className="h-48 min-w-0">
          <WeeklyUsageChart data={weeklyData} />
          {isHistoryEmpty && (
            <div className="mt-4 text-center text-sm text-ink-faint">
              No conversions yet — upload a file to populate your weekly usage graph.
            </div>
          )}
        </div>
      </div>

      {/* Upload / convert card */}
      <div className="glass-card p-8">
        {!file ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={clsx(
              "rounded-2xl border-2 border-dashed p-14 text-center transition-colors",
              dragging ? "border-cyan bg-cyan/5" : "border-line"
            )}
          >
            <UploadCloud className={clsx("mx-auto mb-4", dragging ? "text-cyan" : "text-ink-faint")} size={40} />
            <p className="font-display text-lg font-semibold">Drop Files Here</p>
            <p className="mt-1 text-sm text-ink-dim">or</p>
            <label className="btn-gradient mt-4 inline-block cursor-pointer">
              Browse Files
              <input
                type="file"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              />
            </label>
            <p className="mt-5 text-xs text-ink-faint">Live now: PNG · JPG · WEBP · AVIF · TIFF ↔ each other · TXT → PDF · PDF → DOCX/PNG/JPG · XLSX → PDF/DOCX/PNG/JPG</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between rounded-xl border border-line bg-void/40 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-nova-gradient text-void">
                  <FileIcon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{file.name}</p>
                  <p className="text-xs text-ink-dim">{formatBytes(file.size)} · .{ext}</p>
                </div>
              </div>
              <button onClick={reset} className="text-ink-faint hover:text-ink"><X size={18} /></button>
            </div>

            {availableTargets.length === 0 ? (
              <p className="mt-5 rounded-lg bg-amber/10 px-4 py-3 text-sm text-amber">
                .{ext} isn't wired up for conversion in this build yet. Try an image (PNG/JPG/WEBP/AVIF/TIFF) or a .txt file.
              </p>
            ) : (
              <>
                <div className="mt-6">
                  <p className="mb-2 text-xs uppercase tracking-wide text-ink-faint">Convert to</p>
                  <div className="flex flex-wrap gap-2">
                    {availableTargets.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTarget(t)}
                        className={clsx(
                          "rounded-lg border px-4 py-2 text-sm font-medium uppercase transition-colors",
                          target === t ? "border-cyan bg-cyan/10 text-cyan-soft" : "border-line text-ink-dim hover:border-line/80"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {status === "converting" && (
                    <motion.div key="converting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 flex items-center gap-3 rounded-lg bg-cyan/10 px-4 py-3 text-sm text-cyan-soft">
                      <Loader2 size={16} className="animate-spin" /> Converting…
                    </motion.div>
                  )}
                  {status === "done" && (
                    <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-col gap-3 rounded-lg bg-mint/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-sm text-mint">
                        <CheckCircle2 size={16} /> Done — {downloadName}
                      </div>
                      <a href={downloadUrl} download={downloadName} className="btn-gradient !px-4 !py-2 text-sm inline-flex items-center gap-2">
                        <Download size={14} /> Download
                      </a>
                    </motion.div>
                  )}
                  {status === "error" && (
                    <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex items-center gap-2 rounded-lg bg-rose/10 px-4 py-3 text-sm text-rose">
                      <AlertCircle size={16} /> {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {status !== "done" && (
                  <button
                    onClick={convert}
                    disabled={status === "converting" || !target}
                    className="btn-gradient mt-6 w-full disabled:opacity-50"
                  >
                    {status === "converting" ? "Converting…" : `Convert to ${target.toUpperCase()}`}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* History */}
      <div className="glass-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Clock size={16} className="text-ink-dim" />
          <h2 className="font-display text-base font-semibold">Recent conversions</h2>
        </div>
        {history.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-faint">No conversions yet — your history will show up here.</p>
        ) : (
          <div className="divide-y divide-line/60">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{h.file_name}</p>
                  <p className="text-xs text-ink-dim">
                    {h.from_format.toUpperCase()} → {h.to_format.toUpperCase()} · {formatBytes(h.file_size)}
                  </p>
                </div>
                <span className="text-xs text-ink-faint">{new Date(h.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WeeklyUsageChart({ data }: { data: { key: string; label: string; count: number }[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const width = 700;
  const height = 190;
  const chartTop = 16;
  const chartBottom = 142;
  const xPadding = 28;
  const max = Math.max(1, ...data.map((item) => item.count));
  const points = data.map((item, index) => ({
    x: xPadding + (index * (width - xPadding * 2)) / Math.max(1, data.length - 1),
    y: chartBottom - (item.count / max) * (chartBottom - chartTop - 8),
  }));
  const trend = data.map((item, index) => {
    const nearby = data.slice(Math.max(0, index - 1), Math.min(data.length, index + 2));
    return nearby.reduce((sum, day) => sum + day.count, 0) / nearby.length;
  });
  const trendPoints = trend.map((value, index) => ({
    x: points[index].x,
    y: chartBottom - (value / max) * (chartBottom - chartTop - 8),
  }));
  const smoothPath = (items: { x: number; y: number }[]) => items.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const previous = items[index - 1];
    const midpoint = (previous.x + point.x) / 2;
    return `${path} Q ${midpoint} ${previous.y}, ${point.x} ${point.y}`;
  }, "");
  const linePath = smoothPath(points);
  const trendPath = smoothPath(trendPoints);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartBottom} L ${points[0].x} ${chartBottom} Z`;
  const active = activeIndex === null ? null : data[activeIndex];

  return (
    <div className="relative h-full min-w-0" aria-label="Weekly conversion usage chart">
      <svg className="h-full w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img">
        <defs>
          <linearGradient id="weeklyUsageFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.58" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.02" />
          </linearGradient>
          <filter id="weeklyUsageGlow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {[45, 78, 111, 142].map((y) => <line key={y} x1={xPadding} x2={width - xPadding} y1={y} y2={y} stroke="#232B45" strokeWidth="1" />)}
        <motion.path d={areaPath} fill="url(#weeklyUsageFill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7 }} />
        <motion.path d={trendPath} fill="none" stroke="#D5B64A" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.3, ease: "easeOut" }} />
        <motion.path d={linePath} fill="none" stroke="#22D3EE" strokeWidth="3" strokeLinecap="round" filter="url(#weeklyUsageGlow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: "easeOut" }} />
        {points.map((point, index) => (
          <g key={data[index].key} onMouseEnter={() => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(null)}>
            <circle cx={point.x} cy={point.y} r="11" fill="transparent" />
            <motion.circle cx={point.x} cy={point.y} r={activeIndex === index ? 5 : 3} fill="#22D3EE" stroke="#0F172A" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.45 + index * 0.06 }} />
            <text x={point.x} y="174" textAnchor="middle" fill="#8891AC" fontSize="12">{data[index].label}</text>
          </g>
        ))}
      </svg>
      <AnimatePresence>
        {active && activeIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
            className="pointer-events-none absolute rounded-lg border border-line bg-panel-2 px-3 py-2 text-xs shadow-xl"
            style={{ left: `${(points[activeIndex].x / width) * 100}%`, top: `${Math.max(4, (points[activeIndex].y / height) * 100 - 24)}%`, transform: "translate(-50%, -100%)" }}
          >
            <p className="text-ink-dim">{active.label}</p>
            <p className="font-semibold text-cyan-soft">{active.count} conversion{active.count === 1 ? "" : "s"}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="glass-card p-5">
      <div className={clsx("mb-3 grid h-9 w-9 place-items-center rounded-lg bg-panel-2", color)}>
        <Icon size={18} />
      </div>
      <p className="font-display text-xl font-bold">{value}</p>
      <p className="text-xs text-ink-dim">{label}</p>
    </div>
  );
}
