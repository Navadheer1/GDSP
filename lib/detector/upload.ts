/**
 * Extracts plain text from user-uploaded files (.txt, .md) with size and type validation
 */
export async function extractTextFromFile(file: File): Promise<{ text: string; filename: string }> {
  const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('File size exceeds the 5MB maximum limit. Please select a smaller file.');
  }

  const name = file.name.toLowerCase();
  const validExtensions = ['.txt', '.md', '.markdown', '.text'];
  const isValid = validExtensions.some((ext) => name.endsWith(ext));

  if (!isValid) {
    throw new Error(
      'Unsupported document format. Please upload a plain text (.txt) or Markdown (.md) document, or paste the content directly into the editor.'
    );
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content || !content.trim()) {
        reject(new Error('The uploaded document is empty.'));
        return;
      }
      resolve({ text: content, filename: file.name });
    };
    reader.onerror = () => {
      reject(new Error('Failed to read the document. Please try copying and pasting the text.'));
    };
    reader.readAsText(file);
  });
}
