import { mkdtemp, readFile, readdir, rm, writeFile } from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { spawn } from "child_process";

function runPowerShell(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    // Next's server environment may not include WindowsPowerShell in PATH.
    // Use its system location explicitly so Excel chart exports do not silently fall back.
    const executable = path.join(process.env.SystemRoot || "C:\\Windows", "System32", "WindowsPowerShell", "v1.0", "powershell.exe");
    const child = spawn(executable, ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", ...args], { windowsHide: true });
    let error = "";
    child.stderr.on("data", (chunk) => { error += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(error.trim() || "Excel chart export failed.")));
  });
}

export type ExcelChartExport = { charts: Buffer[]; pdf?: Buffer };

/** Uses installed Microsoft Excel to render native charts exactly as they appear in the workbook. */
export async function exportExcelCharts(input: Buffer, includePdf = false): Promise<ExcelChartExport> {
  const directory = await mkdtemp(path.join(tmpdir(), "novaconvert-excel-"));
  const source = path.join(directory, "source.xlsx");
  const chartsDirectory = path.join(directory, "charts");
  const pdf = path.join(directory, "sheet.pdf");
  try {
    await writeFile(source, input);
    const script = path.join(process.cwd(), "scripts", "excel_charts.ps1");
    const args = [script, "-InputPath", source, "-OutputDirectory", chartsDirectory];
    if (includePdf) args.push("-PdfPath", pdf);
    await runPowerShell(args);
    const chartNames = (await readdir(chartsDirectory)).filter((name) => /^chart-\d+\.png$/i.test(name)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const charts = await Promise.all(chartNames.map((name) => readFile(path.join(chartsDirectory, name))));
    return { charts, pdf: includePdf ? await readFile(pdf) : undefined };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}
