// Shared text cleaning for PDF / clipboard / OCR text before translating.

/**
 * Clean text that usually comes from copying a PDF or from OCR.
 *
 * - Normalises line endings.
 * - De-hyphenates words split across a line break: `exam-\nple` -> `example`.
 * - Collapses runs of spaces / tabs within a line.
 * - Joins single line breaks inside a paragraph with a space.
 * - Preserves blank-line paragraph breaks (does NOT flatten everything to one line).
 */
export function cleanText(text) {
    if (text === undefined || text === null) {
        return text;
    }
    return String(text)
        .replace(/\r\n?/g, '\n')
        // de-hyphenate across a line break
        .replace(/(\S)-\s*\n\s*(\S)/g, '$1$2')
        // collapse spaces / tabs / nbsp within a line
        .replace(/[ \t\u00a0]+/g, ' ')
        // trim spaces around line breaks
        .replace(/ *\n */g, '\n')
        // at most one blank line between paragraphs
        .replace(/\n{3,}/g, '\n\n')
        .split('\n\n')
        .map((paragraph) => paragraph.replace(/\n+/g, ' ').replace(/ +/g, ' ').trim())
        .filter((paragraph) => paragraph.length > 0)
        .join('\n\n');
}

/**
 * Append `add` to `base` when collecting text incrementally (e.g. incremental copy).
 * Uses a blank line between the pieces and skips empty input.
 */
export function appendText(base, add) {
    const a = (base || '').trim();
    const b = (add || '').trim();
    if (a === '') {
        return b;
    }
    if (b === '') {
        return a;
    }
    return a + '\n\n' + b;
}
