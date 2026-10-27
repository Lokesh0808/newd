/**
 * Text extraction for uploaded resumes (PDF / DOCX).
 *
 * Runs on the server only. The extracted plain text is then handed to Claude,
 * which turns it into a structured `ResumeData` object.
 */

/** Maximum upload size we accept (10 MB). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_UPLOAD_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
];

/** Extract plain text from a PDF buffer. */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  // The legacy build works in Node without a DOM shim.
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: false,
    // Node has no DOM; never try to attach fonts to a canvas.
    disableFontFace: true,
    verbosity: 0,
  });

  const doc = await loadingTask.promise;

  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber += 1) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      // Normalise the whitespace that PDF extraction tends to produce.
      .replace(/[ \t]+/g, " ")
      .replace(/\s*\n\s*/g, "\n");
    pages.push(text.trim());
  }

  await loadingTask.destroy();
  return pages.join("\n\n").trim();
}

/** Extract plain text from a DOCX buffer. */
export async function extractDocxText(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

/**
 * Extract text from an uploaded file, dispatching on the MIME type.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  try {
    if (type === "application/pdf" || name.endsWith(".pdf")) {
      return await extractPdfText(buffer);
    }
    if (
      type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      type === "application/msword" ||
      name.endsWith(".docx") ||
      name.endsWith(".doc")
    ) {
      return await extractDocxText(buffer);
    }
    if (type.startsWith("text/")) {
      return buffer.toString("utf-8").trim();
    }
  } catch (error) {
    throw new Error(
      `We could not read ${file.name}. ${
        error instanceof Error ? error.message : "The file may be corrupted."
      }`,
    );
  }

  throw new Error("Unsupported file type. Upload a PDF, DOCX or TXT file.");
}
