import { Document, Paragraph, TextRun, HeadingLevel, Packer } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Sanitizes a title for use in download filenames
 */
export function sanitizeFilename(title: string, extension: string): string {
  const clean = (title || 'document')
    .toLowerCase()
    .replace(/[^a-z0-9_\-\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  return `${clean || 'document'}.${extension}`;
}

/**
 * Exports document content as a plain text file (.txt)
 */
export function exportToTxt(title: string, contentHtml: string): void {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = contentHtml;
  const plainText = tempDiv.innerText || tempDiv.textContent || '';

  const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
  const filename = sanitizeFilename(title, 'txt');
  saveAs(blob, filename);
}

/**
 * Parses HTML into docx Paragraphs and TextRuns
 */
function htmlToDocxElements(html: string): Paragraph[] {
  const container = document.createElement('div');
  container.innerHTML = html;

  const paragraphs: Paragraph[] = [];

  function processChildNodes(element: Node): TextRun[] {
    const runs: TextRun[] = [];

    element.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text) {
          runs.push(new TextRun({ text }));
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        const text = el.textContent || '';

        const isBold = tag === 'strong' || tag === 'b' || el.style.fontWeight === 'bold';
        const isItalic = tag === 'em' || tag === 'i' || el.style.fontStyle === 'italic';
        const isUnderline = tag === 'u';

        runs.push(
          new TextRun({
            text,
            bold: isBold,
            italics: isItalic,
            underline: isUnderline ? {} : undefined,
          })
        );
      }
    });

    return runs;
  }

  // Iterate top-level children
  container.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (tag === 'h1') {
        paragraphs.push(
          new Paragraph({
            text: el.textContent || '',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
          })
        );
      } else if (tag === 'h2') {
        paragraphs.push(
          new Paragraph({
            text: el.textContent || '',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );
      } else if (tag === 'h3') {
        paragraphs.push(
          new Paragraph({
            text: el.textContent || '',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 160, after: 80 },
          })
        );
      } else if (tag === 'ul') {
        el.querySelectorAll('li').forEach((li) => {
          paragraphs.push(
            new Paragraph({
              children: processChildNodes(li),
              bullet: { level: 0 },
              spacing: { after: 60 },
            })
          );
        });
      } else if (tag === 'ol') {
        el.querySelectorAll('li').forEach((li, idx) => {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${idx + 1}. `, bold: true }),
                ...processChildNodes(li),
              ],
              spacing: { after: 60 },
            })
          );
        });
      } else {
        // Paragraph or div
        const runs = processChildNodes(el);
        if (runs.length > 0) {
          paragraphs.push(
            new Paragraph({
              children: runs,
              spacing: { after: 120, line: 276 },
            })
          );
        }
      }
    } else if (node.nodeType === Node.TEXT_NODE && (node.textContent || '').trim()) {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: node.textContent || '' })],
          spacing: { after: 120 },
        })
      );
    }
  });

  if (paragraphs.length === 0) {
    paragraphs.push(new Paragraph({ text: 'Empty Document' }));
  }

  return paragraphs;
}

/**
 * Exports document content as a genuine .docx file
 */
export async function exportToDocx(title: string, contentHtml: string): Promise<void> {
  const docxElements = htmlToDocxElements(contentHtml);

  const doc = new Document({
    title,
    sections: [
      {
        properties: {},
        children: docxElements,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = sanitizeFilename(title, 'docx');
  saveAs(blob, filename);
}

/**
 * Exports document to PDF by opening a pristine print window with professional typography
 */
export function exportToPdf(title: string, contentHtml: string): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export to PDF.');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title || 'Document'}</title>
        <style>
          @page {
            size: A4;
            margin: 25mm 20mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #1a1a1a;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            font-size: 20pt;
            font-weight: 700;
            margin-bottom: 12pt;
            color: #0f172a;
          }
          h2 {
            font-size: 15pt;
            font-weight: 600;
            margin-top: 18pt;
            margin-bottom: 8pt;
            color: #1e293b;
          }
          h3 {
            font-size: 12.5pt;
            font-weight: 600;
            margin-top: 14pt;
            margin-bottom: 6pt;
          }
          p {
            margin: 0 0 10pt 0;
          }
          ul, ol {
            margin: 0 0 10pt 20pt;
            padding: 0;
          }
          li {
            margin-bottom: 4pt;
          }
          blockquote {
            border-left: 3px solid #6654F5;
            padding-left: 12px;
            margin: 12pt 0;
            color: #475569;
            font-style: italic;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <article id="print-content">
          ${contentHtml}
        </article>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();

  // Give the browser a moment to render then prompt print dialog
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 400);
}

/**
 * Copies formatted rich text and plain text to the clipboard
 */
export async function copyFormattedText(contentHtml: string): Promise<boolean> {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = contentHtml;
  const plainText = tempDiv.innerText || tempDiv.textContent || '';

  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
    try {
      const htmlBlob = new Blob([contentHtml], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        }),
      ]);
      return true;
    } catch {
      // Fallback to plain text copy
      await navigator.clipboard.writeText(plainText);
      return true;
    }
  } else if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(plainText);
    return true;
  }
  return false;
}
