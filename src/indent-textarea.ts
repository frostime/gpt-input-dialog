/**
 * @Declaration Copyfrom a MIT licensed project, with slight modifications.
 * @URL https://github.com/fregante/indent-textarea
 * @license MIT
 * ----------------------------------------------------------------------------
MIT License

Copyright (c) Federico Brigante <me@fregante.com> (https://fregante.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import { insertTextIntoField } from 'text-field-edit';

/*

# Global notes

Indent and unindent affect characters outside the selection, so the selection has to be expanded (`newSelection`) before applying the replacement regex.

The unindent selection expansion logic is a bit convoluted and I wish a genius would rewrite it more efficiently.

*/

export function indentSelection(element: HTMLTextAreaElement): void {
    const { selectionStart, selectionEnd, value } = element;
    const selectedText = value.slice(selectionStart, selectionEnd);
    // The first line should be indented, even if it starts with `\n`
    // The last line should only be indented if includes any character after `\n`
    const lineBreakCount = /\n/g.exec(selectedText)?.length;

    if (lineBreakCount! > 0) {
        // Select full first line to replace everything at once
        const firstLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;

        const newSelection = element.value.slice(firstLineStart, selectionEnd - 1);
        const indentedText = newSelection.replaceAll(
            /^|\n/g, // Match all line starts
            '$&\t',
        );
        const replacementsCount = indentedText.length - newSelection.length;

        // Replace newSelection with indentedText
        element.setSelectionRange(firstLineStart, selectionEnd - 1);
        insertTextIntoField(element, indentedText);

        // Restore selection position, including the indentation
        element.setSelectionRange(selectionStart + 1, selectionEnd + replacementsCount);
    } else {
        insertTextIntoField(element, '\t');
    }
}

function findLineEnd(value: string, currentEnd: number): number {
    // Go to the beginning of the last line
    const lastLineStart = value.lastIndexOf('\n', currentEnd - 1) + 1;

    // There's nothing to unindent after the last cursor, so leave it as is
    if (value.charAt(lastLineStart) !== '\t') {
        return currentEnd;
    }

    return lastLineStart + 1; // Include the first character, which will be a tab
}

// The first line should always be unindented
// The last line should only be unindented if the selection includes any characters after `\n`
export function unindentSelection(element: HTMLTextAreaElement): void {
    const { selectionStart, selectionEnd, value } = element;

    // Select the whole first line because it might contain \t
    const firstLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const minimumSelectionEnd = findLineEnd(value, selectionEnd);

    const newSelection = element.value.slice(firstLineStart, minimumSelectionEnd);
    const indentedText = newSelection.replaceAll(
        /(^|\n)(\t| {1,2})/g,
        '$1',
    );
    const replacementsCount = newSelection.length - indentedText.length;

    // Replace newSelection with indentedText
    element.setSelectionRange(firstLineStart, minimumSelectionEnd);
    insertTextIntoField(element, indentedText);

    // Restore selection position, including the indentation
    const firstLineIndentation = /\t| {1,2}/.exec(value.slice(firstLineStart, selectionStart));

    const difference = firstLineIndentation
        ? firstLineIndentation[0]!.length
        : 0;

    const newSelectionStart = selectionStart - difference;
    element.setSelectionRange(
        selectionStart - difference,
        Math.max(newSelectionStart, selectionEnd - replacementsCount),
    );
}

export function tabToIndentListener(event: KeyboardEvent): void {
    if (
        event.defaultPrevented
        || event.metaKey
        || event.altKey
        || event.ctrlKey
    ) {
        return;
    }

    const textarea = event.target as HTMLTextAreaElement;

    if (event.key === 'Tab') {
        if (event.shiftKey) {
            unindentSelection(textarea);
        } else {
            indentSelection(textarea);
        }

        event.preventDefault();
        event.stopImmediatePropagation();
    } else if (
        event.key === 'Escape'
        && !event.shiftKey
    ) {
        textarea.blur();
        event.preventDefault();
        event.stopImmediatePropagation();
    }
}

type WatchableElements =
    | string
    | HTMLTextAreaElement
    | Iterable<HTMLTextAreaElement>;

export function enableTabToIndent(
    elements: WatchableElements,
    signal?: AbortSignal,
): void {
    if (typeof elements === 'string') {
        elements = document.querySelectorAll(elements);
    } else if (elements instanceof HTMLTextAreaElement) {
        elements = [elements];
    }

    for (const element of elements) {
        element.addEventListener('keydown', tabToIndentListener, { signal });
    }
}

/** @deprecated Renamed to indentSelection */
export const indent = indentSelection;
/** @deprecated Renamed to unindentSelection */
export const unindent = unindentSelection;
/** @deprecated Renamed to tabToIndentListener */
export const eventHandler = tabToIndentListener;
/** @deprecated Renamed to enableTabToIndent */
export const watch = enableTabToIndent;
