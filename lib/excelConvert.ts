import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import ExcelJS from "exceljs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const DEFAULT_GRID = "D9E2F3";

/** Return the calculated value of a formula, never the formula object itself. */
function formatCellValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value.replace(/\s+/g, " ").trim();
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);
  if (value instanceof Date) return value.toISOString().split("T")[0];
  if (Array.isArray(value)) return value.map(formatCellValue).join(" ");
  if (typeof value === "object") {
    const item = value as Record<string, unknown>;
    // ExcelJS uses this shape for both ordinary and shared formulas.
    if ("formula" in item || "sharedFormula" in item) return formatCellValue(item.result);
    if (typeof item.text === "string") return item.text;
    if (Array.isArray(item.richText)) return item.richText.map((run: any) => formatCellValue(run.text)).join("");
    if ("result" in item) return formatCellValue(item.result);
    return "";
  }
  return String(value);
}

function normalizeHexColor(input: string | undefined): string | undefined {
  if (!input) return undefined;
  const hex = input.replace(/^#/, "").toUpperCase();
  if (hex.length === 3) return hex.split("").map((part) => part + part).join("");
  if (hex.length === 6) return hex;
  if (hex.length === 8) return hex.slice(2);
  return undefined;
}

function excelColor(color: any): string | undefined {
  return normalizeHexColor(color?.argb || color?.rgb);
}

function cellFillColor(cell: ExcelJS.Cell): string | undefined {
  const fill = cell.fill as any;
  if (fill?.type === "pattern") return excelColor(fill.fgColor) || excelColor(fill.bgColor);
  if (fill?.type === "gradient") return excelColor(fill.stops?.[0]?.color);
  return undefined;
}

function cellFontColor(cell: ExcelJS.Cell): string | undefined {
  return excelColor((cell.font as any)?.color);
}

function hexToRgb(hex: string) {
  const cleaned = normalizeHexColor(hex) || "000000";
  const value = parseInt(cleaned, 16);
  return { r: ((value >> 16) & 255) / 255, g: ((value >> 8) & 255) / 255, b: (value & 255) / 255 };
}

function pdfColor(hex: string | undefined, fallback = "000000") {
  return rgb(...Object.values(hexToRgb(hex || fallback)) as [number, number, number]);
}

function usedRange(sheet: ExcelJS.Worksheet) {
  const rows = Math.max(sheet.rowCount, 1);
  let columns = Math.max(sheet.columnCount, 1);
  sheet.eachRow({ includeEmpty: false }, (row) => {
    columns = Math.max(columns, row.cellCount);
  });
  return { rows, columns };
}

function mergedEndColumn(sheet: ExcelJS.Worksheet, cell: ExcelJS.Cell) {
  const startColumn = Number((cell as any).col);
  if (!(cell as any).isMerged || (cell as any).master?.address !== cell.address) return startColumn;
  const merge = ((sheet.model as any).merges || []).find((range: string) => range.split(":")[0] === cell.address);
  if (!merge) return startColumn;
  const end = sheet.getCell(merge.split(":")[1]);
  return Number((end as any).col);
}

function baseWidthForColumn(sheet: ExcelJS.Worksheet, column: number, fallback: number) {
  // Excel column widths are approximate character counts; this gives a stable visual proportion.
  return Math.max(36, Math.min(220, (sheet.getColumn(column).width || 12) * 6.2 || fallback));
}

function isMergedFollower(cell: ExcelJS.Cell) {
  return Boolean((cell as any).isMerged && (cell as any).master?.address !== cell.address);
}

function cellAlignment(cell: ExcelJS.Cell) {
  return (cell.alignment as any)?.horizontal || "left";
}

function docxAlignment(cell: ExcelJS.Cell) {
  const alignment = cellAlignment(cell);
  if (alignment === "center" || alignment === "centerContinuous") return AlignmentType.CENTER;
  if (alignment === "right") return AlignmentType.RIGHT;
  if (alignment === "justify") return AlignmentType.JUSTIFIED;
  return AlignmentType.LEFT;
}

export async function xlsxToPdf(input: Buffer | Uint8Array | ArrayBuffer, chartImages: Buffer[] = []): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(input as any);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error("Workbook contains no worksheets.");

  const { rows, columns } = usedRange(sheet);
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageSize: [number, number] = [841.89, 595.28]; // A4 landscape keeps Excel tables readable.
  const margin = 26;
  const availableWidth = pageSize[0] - margin * 2;
  const sourceWidths = Array.from({ length: columns }, (_, i) => baseWidthForColumn(sheet, i + 1, 72));
  const scale = Math.min(1, availableWidth / sourceWidths.reduce((total, width) => total + width, 0));
  const widths = sourceWidths.map((width) => width * scale);
  let page = pdf.addPage(pageSize);
  let y = pageSize[1] - margin;

  const newPage = () => {
    page = pdf.addPage(pageSize);
    y = pageSize[1] - margin;
  };

  for (let rowNumber = 1; rowNumber <= rows; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    const height = Math.max(18, Math.min(70, (row.height || 18) * 1.2));
    if (y - height < margin) newPage();
    let x = margin;

    for (let column = 1; column <= columns; column += 1) {
      const cell = row.getCell(column);
      if (isMergedFollower(cell)) {
        x += widths[column - 1];
        continue;
      }
      const endColumn = mergedEndColumn(sheet, cell);
      const width = widths.slice(column - 1, endColumn).reduce((total, item) => total + item, 0);
      const fill = cellFillColor(cell);
      if (fill) page.drawRectangle({ x, y: y - height, width, height, color: pdfColor(fill) });
      page.drawRectangle({ x, y: y - height, width, height, borderColor: pdfColor(DEFAULT_GRID), borderWidth: 0.45 });

      const text = formatCellValue(cell.value);
      if (text) {
        const font = (cell.font as any)?.bold ? bold : regular;
        const size = Math.max(7, Math.min(18, ((cell.font as any)?.size || 11) * scale));
        const maxTextWidth = Math.max(1, width - 8);
        let fitted = text;
        while (fitted.length > 1 && font.widthOfTextAtSize(fitted, size) > maxTextWidth) fitted = `${fitted.slice(0, -2)}…`;
        const textWidth = font.widthOfTextAtSize(fitted, size);
        const alignment = cellAlignment(cell);
        const textX = alignment === "center" || alignment === "centerContinuous"
          ? x + (width - textWidth) / 2
          : alignment === "right" ? x + width - textWidth - 4 : x + 4;
        page.drawText(fitted, { x: textX, y: y - height / 2 - size / 3, size, font, color: pdfColor(cellFontColor(cell)) });
      }
      x += width;
    }
    y -= height;
  }
  // Charts are exported by Excel as PNGs and placed on their own PDF pages.
  // This keeps complex chart types (pie, combo, waterfall, etc.) visually identical.
  for (const chartImage of chartImages) {
    const image = await pdf.embedPng(chartImage);
    const chartPage = pdf.addPage(pageSize);
    const maxWidth = pageSize[0] - margin * 2;
    const maxHeight = pageSize[1] - margin * 2;
    const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
    const width = image.width * scale;
    const height = image.height * scale;
    chartPage.drawImage(image, {
      x: (pageSize[0] - width) / 2,
      y: (pageSize[1] - height) / 2,
      width,
      height,
    });
  }
  return Buffer.from(await pdf.save());
}

export async function xlsxToDocx(input: Buffer | Uint8Array | ArrayBuffer, chartImages: Buffer[] = []): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(input as any);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error("Workbook contains no worksheets.");

  const { rows, columns } = usedRange(sheet);
  const grid = { style: BorderStyle.SINGLE, size: 4, color: DEFAULT_GRID };
  const tableRows: TableRow[] = [];

  for (let rowNumber = 1; rowNumber <= rows; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    const cells: TableCell[] = [];
    for (let column = 1; column <= columns; column += 1) {
      const cell = row.getCell(column);
      if (isMergedFollower(cell)) continue;
      const font = cell.font as any;
      const fill = cellFillColor(cell);
      const columnSpan = mergedEndColumn(sheet, cell) - column + 1;
      cells.push(new TableCell({
        width: { size: Math.max(1, Math.round(baseWidthForColumn(sheet, column, 72) * 12)), type: WidthType.DXA },
        columnSpan,
        verticalAlign: VerticalAlign.CENTER,
        shading: fill ? { fill, type: "clear", color: "auto" } : undefined,
        borders: { top: grid, bottom: grid, left: grid, right: grid },
        children: [new Paragraph({
          alignment: docxAlignment(cell),
          spacing: { before: 0, after: 0 },
          children: [new TextRun({
            text: formatCellValue(cell.value),
            bold: Boolean(font?.bold),
            italics: Boolean(font?.italic),
            color: cellFontColor(cell) || "000000",
            size: Math.max(14, Math.min(36, Math.round((font?.size || 11) * 2))),
          })],
        })],
      }));
    }
    tableRows.push(new TableRow({ children: cells, height: { value: Math.max(240, Math.round((row.height || 18) * 20)), rule: "atLeast" } }));
  }

  const chartParagraphs = chartImages.flatMap((image, index) => [
    new Paragraph({ text: `Chart ${index + 1}`, spacing: { before: 240, after: 80 } }),
    new Paragraph({ children: [new ImageRun({ data: image, type: "png", transformation: { width: 600, height: 360 } })] }),
  ]);
  const doc = new Document({ sections: [{ children: [new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }), ...chartParagraphs] }] });
  return Buffer.from(await Packer.toBuffer(doc));
}
