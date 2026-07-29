import { spawn } from "child_process";
import { mkdtemp, readFile, rm, writeFile, readdir } from "fs/promises";
import { tmpdir } from "os";
import path from "path";

const PYTHON_BIN = process.env.PYTHON_BIN || "python";
const SCRIPTS_DIR = path.join(process.cwd(), "scripts");

function run(script: string, args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(PYTHON_BIN, [path.join(SCRIPTS_DIR, script), ...args]);
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => reject(err));
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

/** Converts a PDF buffer to a real, editable DOCX buffer using pdf2docx. */
export async function pdfToDocx(input: Buffer): Promise<Buffer> {
  const dir = await mkdtemp(path.join(tmpdir(), "novaconvert-"));
  const srcPath = path.join(dir, "in.pdf");
  const dstPath = path.join(dir, "out.docx");
  try {
    await writeFile(srcPath, input);
    const { code, stdout, stderr } = await run("pdf_to_docx.py", [srcPath, dstPath]);
    if (code !== 0) {
      throw new Error(parsePyError(stdout, stderr) || "PDF → DOCX conversion failed.");
    }
    return await readFile(dstPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** Renders every page of a PDF to an image. Returns one buffer per page. */
export async function pdfToImages(input: Buffer, format: "png" | "jpg"): Promise<Buffer[]> {
  const dir = await mkdtemp(path.join(tmpdir(), "novaconvert-"));
  const srcPath = path.join(dir, "in.pdf");
  const outDir = path.join(dir, "out");
  try {
    await writeFile(srcPath, input);
    await import("fs/promises").then((fs) => fs.mkdir(outDir));
    const pyFormat = format === "jpg" ? "jpg" : "png";
    const { code, stdout, stderr } = await run("pdf_to_images.py", [srcPath, outDir, pyFormat]);
    if (code !== 0) {
      throw new Error(parsePyError(stdout, stderr) || "PDF → image conversion failed.");
    }
    const files = (await readdir(outDir)).sort();
    const buffers = await Promise.all(files.map((f) => readFile(path.join(outDir, f))));
    return buffers;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function parsePyError(stdout: string, stderr: string): string | null {
  try {
    const line = stdout.trim().split("\n").pop();
    if (line) {
      const parsed = JSON.parse(line);
      if (parsed?.error) return parsed.error;
    }
  } catch {
    /* fall through */
  }
  return stderr.trim() || null;
}
