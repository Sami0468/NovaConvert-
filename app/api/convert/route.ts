import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sharp from "sharp";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import JSZip from "jszip";
import { randomUUID } from "crypto";
import { logConversion } from "@/lib/db";
import { pdfToDocx, pdfToImages } from "@/lib/pythonConvert";
import { xlsxToDocx, xlsxToPdf } from "@/lib/excelConvert";
import { exportExcelCharts } from "@/lib/excelCharts";

export const runtime = "nodejs";
export const maxDuration = 60;

const IMAGE_FORMATS = ["png", "jpg", "jpeg", "webp", "avif", "tiff"];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Sign in to convert files." }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const target = String(form.get("target") || "").toLowerCase();

  if (!file) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  if (!target) return NextResponse.json({ error: "No target format specified." }, { status: 400 });

  const originalName = file.name;
  const ext = (originalName.split(".").pop() || "").toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());
  const baseName = originalName.replace(/\.[^/.]+$/, "");

  try {
    let outputBuffer: Buffer;
    let outMime = "application/octet-stream";

    if (IMAGE_FORMATS.includes(ext) && IMAGE_FORMATS.includes(target)) {
      // Real image format conversion via sharp
      const sharpFormat = target === "jpg" ? "jpeg" : (target as keyof sharp.FormatEnum);
      outputBuffer = await sharp(buffer).toFormat(sharpFormat as keyof sharp.FormatEnum).toBuffer();
      outMime = `image/${target === "jpg" ? "jpeg" : target}`;
    } else if (IMAGE_FORMATS.includes(ext) && target === "pdf") {
      // Image -> PDF via pdf-lib
      const pdfDoc = await PDFDocument.create();
      const jpegLike = ["jpg", "jpeg"].includes(ext);
      const normalized = jpegLike ? buffer : await sharp(buffer).jpeg().toBuffer();
      const embedded = jpegLike ? await pdfDoc.embedJpg(normalized) : await pdfDoc.embedJpg(normalized);
      const page = pdfDoc.addPage([embedded.width, embedded.height]);
      page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
      outputBuffer = Buffer.from(await pdfDoc.save());
      outMime = "application/pdf";
    } else if (ext === "txt" && target === "pdf") {
      // Plain text -> PDF via pdf-lib
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const text = buffer.toString("utf-8");
      const fontSize = 11;
      const margin = 50;
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const maxWidth = pageWidth - margin * 2;
      const lineHeight = fontSize * 1.4;

      const words = text.split(/\s+/);
      const lines: string[] = [];
      let current = "";
      for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(test, fontSize) > maxWidth) {
          if (current) lines.push(current);
          current = word;
        } else {
          current = test;
        }
      }
      if (current) lines.push(current);

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;
      for (const line of lines) {
        if (y < margin) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
        page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.15) });
        y -= lineHeight;
      }
      outputBuffer = Buffer.from(await pdfDoc.save());
      outMime = "application/pdf";
    } else if (ext === "pdf" && target === "docx") {
      // Real PDF -> editable DOCX via Python's pdf2docx (layout-aware, not just text dump)
      outputBuffer = await pdfToDocx(buffer);
      outMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (ext === "pdf" && ["png", "jpg", "jpeg"].includes(target)) {
      // Real PDF -> image rendering via PyMuPDF. Single page -> image file, multi-page -> zip.
      const pyFormat = target === "png" ? "png" : "jpg";
      const pages = await pdfToImages(buffer, pyFormat);
      if (pages.length === 1) {
        outputBuffer = pages[0];
        outMime = target === "png" ? "image/png" : "image/jpeg";
      } else {
        const zip = new JSZip();
        pages.forEach((buf, i) => zip.file(`page-${i + 1}.${pyFormat}`, buf));
        outputBuffer = await zip.generateAsync({ type: "nodebuffer" });
        outMime = "application/zip";
      }
    } else if (ext === "xlsx" && target === "pdf") {
      let charts: Buffer[] = [];
      try {
        charts = (await exportExcelCharts(buffer)).charts;
      } catch {
        // The table still converts if the workbook contains no exportable chart.
      }
      outputBuffer = await xlsxToPdf(buffer, charts);
      outMime = "application/pdf";
    } else if (ext === "xlsx" && target === "docx") {
      let charts: Buffer[] = [];
      try {
        charts = (await exportExcelCharts(buffer)).charts;
      } catch {
        // The worksheet table can still be converted when Excel has no chart to export.
      }
      outputBuffer = await xlsxToDocx(buffer, charts);
      outMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (ext === "xlsx" && ["png", "jpg", "jpeg"].includes(target)) {
      const pyFormat = target === "png" ? "png" : "jpg";
      let charts: Buffer[] = [];
      try {
        charts = (await exportExcelCharts(buffer)).charts;
      } catch {
        // No chart images: the worksheet page is still exported below.
      }
      const pdfBuffer = await xlsxToPdf(buffer);
      const pages = await pdfToImages(pdfBuffer, pyFormat);
      const chartImages = target === "png" ? charts : await Promise.all(charts.map((chart) => sharp(chart).jpeg().toBuffer()));
      if (pages.length + chartImages.length === 1) {
        outputBuffer = pages[0] || chartImages[0];
        outMime = target === "png" ? "image/png" : "image/jpeg";
      } else {
        const zip = new JSZip();
        pages.forEach((page, index) => zip.file(`worksheet-page-${index + 1}.${pyFormat}`, page));
        chartImages.forEach((image, index) => zip.file(`chart-${index + 1}.${pyFormat}`, image));
        outputBuffer = await zip.generateAsync({ type: "nodebuffer" });
        outMime = "application/zip";
      }
    } else {
      return NextResponse.json(
        { error: `Conversion ${ext.toUpperCase()} → ${target.toUpperCase()} isn't wired up in this build yet. Currently live: JPG/PNG/WEBP/AVIF/TIFF ↔ each other, images → PDF, TXT → PDF, PDF → DOCX/PNG/JPG, and XLSX → PDF/DOCX/PNG/JPG.` },
        { status: 422 }
      );
    }

    const outExt = outMime === "application/zip" ? "zip" : target;

    logConversion({
      id: randomUUID(),
      userEmail: session.user.email,
      fileName: originalName,
      fromFormat: ext,
      toFormat: target,
      fileSize: outputBuffer.length,
    });

    return new Response(new Uint8Array(outputBuffer), {
      headers: {
        "Content-Type": outMime,
        "Content-Disposition": `attachment; filename="${baseName}.${outExt}"`,
        "X-File-Name": `${baseName}.${outExt}`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Conversion failed." }, { status: 500 });
  }
}
