// ==UserScript==
// @name      Poe 输入功能增强
// @namespace gitlab.com/frostime
// @version   4.8.3
// @match     *://poe.com/chat/*
// @match     *://poe.com
// @icon      https://www.google.com/s2/favicons?sz=64&domain=poe.com
// @run-at    document-end
// @author    frostime
// @license   AGPL-3.0-only
// @grant     GM.xmlHttpRequest
// ==/UserScript==
(function () {
    'use strict';

    /*
     * Copyright (c) 2023 by frostime. All Rights Reserved.
     * @Author       : frostime
     * @Date         : 2023-08-16 17:05:29
     * @FilePath     : /src/utils.ts
     * @LastEditTime : 2024-04-07 17:14:47
     * @Description  :
     */
    /**
     * 分割 textarea 的行
     * @param textarea HTMLTextAreaElement
     * @param position number - The position index to split the text at
     * @returns
     *  - befores: string[], position 之前的行
     *  - line: string, position 所在的行
     *  - afters: string[], position 之后的行
     */
    const splitTextareaLines = (textarea, position) => {
        const text = textarea.value;
        // Guard against positions out of bounds
        if (position < 0 || position > text.length) {
            throw new Error('Position is out of bounds of the text length');
        }
        const befores = text.slice(0, position).split('\n');
        const afters = text.slice(position).split('\n');
        // Safely concatenate the current line, even if pop or shift return undefined
        const currentLineBefore = befores.pop() ?? '';
        const currentLineAfter = afters.shift() ?? '';
        const line = currentLineBefore + currentLineAfter;
        return { befores, line, afters };
    };
    function updateStyleSheet(id, cssText) {
        let style = document.getElementById(id);
        if (!style) {
            style = document.createElement('style');
            style.id = id;
            document.head.appendChild(style);
        }
        style.textContent = cssText;
    }
    const queryOfficalTextarea = () => {
        const q = 'div.ChatMessageInputContainer_inputContainer__s2AGa textarea';
        const textarea = document.querySelector(q);
        return textarea;
    };
    const focusOffcialTextarea = () => {
        const textarea = queryOfficalTextarea();
        textarea?.focus();
    };
    const StyleSheet = (FontFamily) => `
textarea.GrowingTextArea_textArea__ZWQbP {
    background: var(--pdl-bg-base) !important;
}
button#floating-button {
    position: absolute;
    right: 50px;
    bottom: 10px;
    padding: 10px 20px;
    background-color: var(--pdl-accent-base);
    color: #fff;
    border: none;
    border-radius: 25px;
    cursor: pointer;
}
div#dialog {
    background-color: var(--pdl-bg-base);
    padding: 21px;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    display: flex;
    width: 50%;
    flex-direction: column;
    max-width: 900px;
    min-width: 400px;
    height: 500px;
    max-height: 80%;
    position: absolute;
    bottom: 50px;
}
div#dialog #dialog-text-input {
    border: 1px solid var(--pdl-accent-base);
    border-radius: 4px;
    padding: 8px;
    flex-grow: 1; /* Allow the text input area to grow */
    display: flex; /* Make the text input area a flex container */
    flex-direction: column; /* Stack child elements vertically */
}
div#dialog #dialog-text-input textarea {
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    font-size: 22px;
    line-height: 1.5;
    font-family: ${FontFamily};
    flex-grow: 1; /* Allow the textarea to grow vertically */
}

div#dialog button#cancel-button {
    margin-right: 8px;
    padding: 8px 16px;
    background-color: #f2f2f2;
    color: #333;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
}
div#dialog button#fill-button {
    margin-right: 8px;
    padding: 8px 16px;
    background-color: var(--pdl-accent-base);
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
div#dialog button#confirm-button {
    padding: 8px 16px;
    background-color: var(--pdl-accent-base);
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}`;

    /** Call a function after focusing a field and then restore the previous focus afterwards if necessary */
    function withFocus(field, callback) {
      const document = field.ownerDocument;
      const initialFocus = document.activeElement;
      if (initialFocus === field) {
        return callback();
      }
      try {
        field.focus();
        return callback();
      } finally {
        field.blur(); // Supports `intialFocus === body`
        if (initialFocus instanceof HTMLElement) {
          initialFocus.focus();
        }
      }
    }
    // This will insert into the focused field. It shouild always be called inside withFocus.
    // Use this one locally if there are multiple `insertTextIntoField` or `document.execCommand` calls
    function insertTextWhereverTheFocusIs(document, text) {
      if (text === '') {
        // https://github.com/fregante/text-field-edit/issues/16
        document.execCommand('delete');
      } else {
        document.execCommand('insertText', false, text);
      }
    }
    /** Inserts `text` at the cursor’s position, replacing any selection, with **undo** support and by firing the `input` event. */
    function insertTextIntoField(field, text) {
      withFocus(field, () => {
        insertTextWhereverTheFocusIs(field.ownerDocument, text);
      });
    }

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
    /*

    # Global notes

    Indent and unindent affect characters outside the selection, so the selection has to be expanded (`newSelection`) before applying the replacement regex.

    The unindent selection expansion logic is a bit convoluted and I wish a genius would rewrite it more efficiently.

    */
    function indentSelection(element) {
        const { selectionStart, selectionEnd, value } = element;
        const selectedText = value.slice(selectionStart, selectionEnd);
        // The first line should be indented, even if it starts with `\n`
        // The last line should only be indented if includes any character after `\n`
        const lineBreakCount = /\n/g.exec(selectedText)?.length;
        if (lineBreakCount > 0) {
            // Select full first line to replace everything at once
            const firstLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
            const newSelection = element.value.slice(firstLineStart, selectionEnd - 1);
            const indentedText = newSelection.replaceAll(/^|\n/g, // Match all line starts
            '$&    ');
            const replacementsCount = indentedText.length - newSelection.length;
            // Replace newSelection with indentedText
            element.setSelectionRange(firstLineStart, selectionEnd - 1);
            insertTextIntoField(element, indentedText);
            // Restore selection position, including the indentation
            element.setSelectionRange(selectionStart + 4, selectionEnd + replacementsCount);
        }
        else {
            insertTextIntoField(element, '    ');
        }
    }
    function findLineEnd(value, currentEnd) {
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
    function unindentSelection(element) {
        const { selectionStart, selectionEnd, value } = element;
        // Select the whole first line because it might contain \t
        const firstLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
        const minimumSelectionEnd = findLineEnd(value, selectionEnd);
        const newSelection = element.value.slice(firstLineStart, minimumSelectionEnd);
        const indentedText = newSelection.replaceAll(/(^|\n)(\t| {1,4})/g, '$1');
        const replacementsCount = newSelection.length - indentedText.length;
        // Replace newSelection with indentedText
        element.setSelectionRange(firstLineStart, minimumSelectionEnd);
        insertTextIntoField(element, indentedText);
        const firstLineIndentation = /\t| {1,4}/.exec(value.slice(firstLineStart, selectionStart));
        const difference = firstLineIndentation
            ? firstLineIndentation[0].length
            : 0;
        const newSelectionStart = selectionStart - difference;
        element.setSelectionRange(selectionStart - difference, Math.max(newSelectionStart, selectionEnd - replacementsCount));
    }
    function tabToIndentListener(event) {
        if (event.defaultPrevented
            || event.metaKey
            || event.altKey
            || event.ctrlKey) {
            return;
        }
        const textarea = event.target;
        if (event.key === 'Tab') {
            if (event.shiftKey) {
                unindentSelection(textarea);
            }
            else {
                indentSelection(textarea);
            }
            event.preventDefault();
            event.stopImmediatePropagation();
        }
        else if (event.key === 'Escape'
            && !event.shiftKey) {
            textarea.blur();
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }
    function enableTabToIndent(elements, signal) {
        if (typeof elements === 'string') {
            elements = document.querySelectorAll(elements);
        }
        else if (elements instanceof HTMLTextAreaElement) {
            elements = [elements];
        }
        for (const element of elements) {
            element.addEventListener('keydown', tabToIndentListener, { signal });
        }
    }

    const zhCN = {
        cancel: '取消[Esc]',
        fill: '填充[Alt+Enter]',
        confirm: '提交[Ctrl+Enter]',
    };
    const enUS = {
        cancel: 'Cancel[Esc]',
        fill: 'Fill[Alt+Enter]',
        confirm: 'Submit[Ctrl+Enter]',
    };
    const useI18n = () => {
        //get lang
        const lang = navigator.language;
        switch (lang) {
            case 'zh-CN':
                return zhCN;
            case 'en-US':
                return enUS;
            default:
                return enUS;
        }
    };

    /*
     * Copyright (c) 2024 by frostime. All Rights Reserved.
     * @Author       : frostime
     * @Date         : 2024-04-06 16:08:53
     * @FilePath     : /src/components.ts
     * @LastEditTime : 2024-04-07 17:04:01
     * @Description  :
     */
    const KeydownEventHandler = (event, { textarea, cancelButton, fillButton, confirmButton }) => {
        const { key, shiftKey } = event;
        //Esc to close dialog
        if (key === 'Escape') {
            cancelButton.click();
        }
        //Ctrl + Enter to submit
        if (key === 'Enter' && event.ctrlKey) {
            event.preventDefault();
            confirmButton.click();
        }
        //Alt + Enter to fill
        if (key === 'Enter' && event.altKey) {
            event.preventDefault();
            fillButton.click();
        }
        // Handle enter key, 自动跟随缩进
        if (key === 'Enter' && !shiftKey) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            if (start !== end) {
                // If there is no selection, just insert a newline
                return;
            }
            const position = textarea.selectionStart;
            const { befores, line, afters } = splitTextareaLines(textarea, position);
            //获取当前行前面的空格
            const whiteSpaceMatch = line.match(/^\s*/);
            const whiteSpace = whiteSpaceMatch ? whiteSpaceMatch[0] : '';
            // //获取当前行的开头是否满足 markdown 列表语法 -, +, *
            // const listMatch = currentLine.trim().match(/^[-+*]\s/);
            // const headingChar = listMatch ? listMatch[0] : '';
            //新开一行自动缩进
            insertTextIntoField(textarea, `\n${whiteSpace}`);
            event.preventDefault();
        }
        //Delete key, 对于空行做 unindent 处理
        if (key === 'Backspace' && textarea.selectionStart === textarea.selectionEnd) {
            const position = textarea.selectionStart;
            if (position === 0)
                return;
            const { line } = splitTextareaLines(textarea, position);
            if (line === '')
                return;
            if (line.trim() === '') {
                event.preventDefault();
                // event.stopPropagation();
                unindentSelection(textarea);
            }
        }
        //Press ctrl+[up arrow /down arrow] to change font size
        if (event.ctrlKey && (key === 'ArrowUp' || key === 'ArrowDown')) {
            event.preventDefault();
            const fontSize = parseInt(window.getComputedStyle(textarea).fontSize);
            const newFontSize = key === 'ArrowUp' ? fontSize + 1 : fontSize - 1;
            textarea.style.fontSize = `${newFontSize}px`;
        }
    };
    class TextInputDialog {
        constructor() {
            this.confirmCallback = () => { };
            this.buildDialog();
        }
        bindConfirmCallback(callback) {
            this.confirmCallback = callback;
        }
        buildDialog() {
            const i18n = useI18n();
            const overlay = document.createElement('div');
            overlay.id = 'overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            overlay.style.display = 'none';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.zIndex = '9999';
            this.overlay = overlay;
            // Create the dialog
            const dialog = document.createElement('div');
            dialog.id = 'dialog';
            this.dialog = dialog;
            // Create the text input area
            const textInput = document.createElement('div');
            textInput.id = 'dialog-text-input';
            textInput.dataset.replicatedValue = '';
            const textarea = document.createElement('textarea');
            textarea.className = 'GrowingTextArea_textArea__ZWQbP';
            textarea.rows = 5;
            textarea.style.backgroundColor = 'var(--pdl-bg-base) !important';
            textarea.placeholder = 'Talk to ...';
            textInput.appendChild(textarea);
            this.textarea = textarea;
            //show space inside textarea
            textarea.style.whiteSpace = 'pre-wrap';
            textarea.addEventListener('keydown', (event) => {
                KeydownEventHandler(event, this);
            });
            //优先自定义的事件处理，以防止被 preventDefault
            enableTabToIndent(textarea);
            // Create the button container
            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.justifyContent = 'flex-end';
            buttonContainer.style.marginTop = '16px';
            // Create the cancel button
            const cancelButton = document.createElement('button');
            cancelButton.id = 'cancel-button';
            cancelButton.textContent = i18n.cancel;
            // Create the confirm button
            const fillButton = document.createElement('button');
            fillButton.id = 'fill-button';
            fillButton.textContent = i18n.fill;
            // Create the confirm button
            const confirmButton = document.createElement('button');
            confirmButton.id = 'confirm-button';
            confirmButton.textContent = i18n.confirm;
            // Append buttons to the button container
            buttonContainer.appendChild(cancelButton);
            buttonContainer.appendChild(fillButton);
            buttonContainer.appendChild(confirmButton);
            this.cancelButton = cancelButton;
            this.fillButton = fillButton;
            this.confirmButton = confirmButton;
            // Append text input and button container to the dialog
            dialog.appendChild(textInput);
            dialog.appendChild(buttonContainer);
            // Append dialog to the overlay
            overlay.appendChild(dialog);
            // Append overlay to the document body
            document.body.appendChild(overlay);
            cancelButton.addEventListener('click', () => {
                overlay.style.display = 'none';
                document.body.style.overflow = 'auto';
                focusOffcialTextarea();
            });
            fillButton.addEventListener('click', () => {
                globalThis.inputText = textarea.value;
                overlay.style.display = 'none';
                document.body.style.overflow = 'auto';
                this.confirmCallback(textarea.value, false);
            });
            confirmButton.addEventListener('click', () => {
                globalThis.inputText = textarea.value;
                overlay.style.display = 'none';
                document.body.style.overflow = 'auto';
                this.confirmCallback(textarea.value, true);
            });
        }
        hide() {
            this.overlay.style.display = 'none';
            document.body.style.overflow = 'auto';
            focusOffcialTextarea();
        }
        show() {
            //避免重复显示
            if (this.overlay.style.display === 'flex') {
                return;
            }
            this.overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            this.updateDialog();
            this.textarea.focus();
        }
        /**
         * 将官方网页的输入框的内容填充到自定义输入框
         */
        updateDialog() {
            const column = document.querySelector('.MainColumn_column__UEunw');
            //dialog 和 column 中心对齐
            this.dialog.style.left = `${column.offsetLeft + column.offsetWidth / 2 - this.dialog.offsetWidth / 2}px`;
            const baseText = queryOfficalTextarea()?.value;
            this.textarea.value = baseText || '';
            const title = document.querySelector('p.ChatHeader_overflow__aVkfq');
            if (title) {
                this.textarea.placeholder = `Talk to ${title.textContent}`;
            }
            this.textarea.focus();
        }
    }

    /*
     * Copyright (c) 2024 by frostime. All Rights Reserved.
     * @Author       : frostime
     * @Date         : 2024-04-06 15:54:15
     * @FilePath     : /src/index.ts
     * @LastEditTime : 2024-04-08 13:18:50
     * @Description  : Poe long input dialog
     */
    const FontFamily = 'HarmonyOS Sans, PingFang SC, Lantinghei SC, Microsoft YaHei, Arial, sans-serif';
    function submit() {
        setTimeout(() => {
            const qButton = 'div.ChatMessageInputContainer_inputContainer__s2AGa button.ChatMessageInputContainer_sendButton__dBjTt';
            const button = document.querySelector(qButton);
            if (button) {
                button.click();
            }
        }, 500);
    }
    function confirmed(text, doSubmit = false) {
        if (!text)
            return;
        const textarea = queryOfficalTextarea();
        if (textarea) {
            textarea.value = text;
            textarea.focus();
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            if (doSubmit) {
                submit();
            }
        }
        focusOffcialTextarea();
    }
    const dialog = new TextInputDialog();
    dialog.bindConfirmCallback(confirmed);
    updateStyleSheet('custom-dialog-style', StyleSheet(FontFamily));
    //监听鼠鼠标
    document.addEventListener('dblclick', (e) => {
        let activeElement = document.activeElement;
        if (activeElement.tagName === 'TEXTAREA' && activeElement.className === 'GrowingTextArea_textArea__ZWQbP') {
            e.preventDefault();
            e.stopPropagation();
            dialog.show();
        }
    });
    //监听按键
    document.addEventListener('keydown', (event) => {
        //Alt + S
        if (event.altKey && event.key === 's') {
            event.preventDefault();
            event.stopPropagation();
            dialog.show();
        }
        //禁止 Enter 直接提交
        // if (event.key === 'Enter' && !event.ctrlKey && !event.altKey && !event.shiftKey) {
        //     const q = 'div.ChatMessageInputContainer_inputContainer__s2AGa textarea';
        //     let target = event.target;
        //     if (target.tagName === 'TEXTAREA' && target.className === 'GrowingTextArea_textArea__ZWQbP') {
        //         event.stopPropagation();
        //         return;
        //     }
        // }
    }, true);

})();
//# sourceMappingURL=bundle.user.js.map
