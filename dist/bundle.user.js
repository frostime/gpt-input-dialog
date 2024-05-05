// ==UserScript==
// @name      GPT 网站对话框
// @namespace gitlab.com/frostime
// @version   5.5.0
// @match     *://poe.com/chat/*
// @match     *://poe.com
// @match     *://chat.mistral.ai/chat
// @match     *://chat.mistral.ai/chat/*
// @match     *://kimi.moonshot.cn
// @match     *://kimi.moonshot.cn/chat/*
// @match     *://chat.openai.com/*
// @match     ://panter.aizex.cn
// @icon      https://www.google.com/s2/favicons?sz=64&domain=poe.com
// @run-at    document-end
// @author    frostime
// @license   AGPL-3.0-only
// @grant     GM.xmlHttpRequest
// ==/UserScript==
(function () {
    'use strict';

    const Poe = {
        name: 'Poe',
        baseUrl: 'poe.com',
        selector: {
            officialTextarea: 'div.ChatMessageInputContainer_inputContainer__s2AGa textarea',
            submitButton: 'div.ChatMessageInputContainer_inputContainer__s2AGa button.ChatMessageInputContainer_sendButton__dBjTt',
            chatSessionTitle: 'p.ChatHeader_overflow__aVkfq',
        },
        css: {
            backgroundColor: 'var(--pdl-bg-base)',
            primaryColor: 'var(--pdl-accent-base)',
        },
        createTextarea: () => {
            const textarea = document.createElement('textarea');
            textarea.className = 'GrowingTextArea_textArea__ZWQbP';
            textarea.rows = 5;
            textarea.style.backgroundColor = 'var(--pdl-bg-base) !important';
            textarea.placeholder = 'Talk to ...';
            return textarea;
        }
    };
    const Mistral = {
        name: 'Mistral',
        baseUrl: 'chat.mistral.ai/chat',
        selector: {
            officialTextarea: 'div.flex.flex-row>textarea',
            submitButton: 'div.flex.flex-row>textarea + button',
            chatSessionTitle: 'div.flex.w-full>p.block.truncate',
        },
        css: {
            backgroundColor: 'hsl(var(--background))',
            primaryColor: 'hsl(var(--primary))',
        },
        createTextarea: () => {
            const textarea = document.createElement('textarea');
            textarea.style.backgroundColor = 'hsl(var(--background)) !important';
            textarea.placeholder = 'Talk to ...';
            return textarea;
        }
    };
    const ChatGPT = {
        name: 'ChatGPT',
        baseUrl: 'chat.openai.com',
        selector: {
            officialTextarea: 'textarea#prompt-textarea',
            submitButton: 'textarea#prompt-textarea + button',
            chatSessionTitle: '#chat-title',
        },
        css: {
            backgroundColor: 'var(--main-surface-primary)',
            primaryColor: '#2e95d3',
        },
        createTextarea: () => {
            const textarea = document.createElement('textarea');
            textarea.placeholder = 'Talk to ...';
            return textarea;
        }
    };
    const Aizex = {
        name: 'Aizex',
        baseUrl: 'panter.aizex.cn',
        selector: {
            officialTextarea: 'textarea#prompt-textarea',
            submitButton: 'textarea#prompt-textarea + button',
            chatSessionTitle: '#chat-title',
        },
        css: {
            backgroundColor: 'var(--main-surface-primary)',
            primaryColor: '#2e95d3',
        },
        createTextarea: () => {
            const textarea = document.createElement('textarea');
            textarea.placeholder = 'Talk to ...';
            return textarea;
        }
    };
    const Platforms = [Poe, Mistral, ChatGPT, Aizex];
    let currentPlatform;
    let togglePlatform = (name) => {
        for (let p of Platforms) {
            if (p.name === name) {
                currentPlatform = p;
                break;
            }
        }
    };

    const splitTextareaLines = (textarea, position) => {
        const text = textarea.value;
        if (position < 0 || position > text.length) {
            throw new Error('Position is out of bounds of the text length');
        }
        const befores = text.slice(0, position).split('\n');
        const afters = text.slice(position).split('\n');
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
        const q = currentPlatform.selector.officialTextarea;
        const textarea = document.querySelector(q);
        return textarea;
    };
    const focusOffcialTextarea = () => {
        const textarea = queryOfficalTextarea();
        textarea?.focus();
    };
    const StyleSheet = (FontFamily, currentPlatform) => `
textarea.GrowingTextArea_textArea__ZWQbP {
    background: ${currentPlatform.css.backgroundColor} !important;
}
button#floating-button {
    position: absolute;
    right: 50px;
    bottom: 10px;
    padding: 10px 20px;
    background-color: ${currentPlatform.css.primaryColor};
    color: #fff;
    border: none;
    border-radius: 25px;
    cursor: pointer;
}
div#dialog {
    background-color: ${currentPlatform.css.backgroundColor};
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
    border: 1px solid ${currentPlatform.css.primaryColor};
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
    background-color: ${currentPlatform.css.primaryColor};
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
div#dialog button#confirm-button {
    padding: 8px 16px;
    background-color: ${currentPlatform.css.primaryColor};
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}`;

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
        field.blur();
        if (initialFocus instanceof HTMLElement) {
          initialFocus.focus();
        }
      }
    }
    function insertTextWhereverTheFocusIs(document, text) {
      if (text === '') {
        document.execCommand('delete');
      } else {
        document.execCommand('insertText', false, text);
      }
    }
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
    function indentSelection(element) {
        const { selectionStart, selectionEnd, value } = element;
        const selectedText = value.slice(selectionStart, selectionEnd);
        const lineBreakCount = /\n/g.exec(selectedText)?.length;
        if (lineBreakCount > 0) {
            const firstLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
            const newSelection = element.value.slice(firstLineStart, selectionEnd - 1);
            const indentedText = newSelection.replaceAll(/^|\n/g,
            '$&    ');
            const replacementsCount = indentedText.length - newSelection.length;
            element.setSelectionRange(firstLineStart, selectionEnd - 1);
            insertTextIntoField(element, indentedText);
            element.setSelectionRange(selectionStart + 4, selectionEnd + replacementsCount);
        }
        else {
            insertTextIntoField(element, '    ');
        }
    }
    function findLineEnd(value, currentEnd) {
        const lastLineStart = value.lastIndexOf('\n', currentEnd - 1) + 1;
        if (value.charAt(lastLineStart) !== '\t') {
            return currentEnd;
        }
        return lastLineStart + 1;
    }
    function unindentSelection(element) {
        const { selectionStart, selectionEnd, value } = element;
        const firstLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
        const minimumSelectionEnd = findLineEnd(value, selectionEnd);
        const newSelection = element.value.slice(firstLineStart, minimumSelectionEnd);
        const indentedText = newSelection.replaceAll(/(^|\n)(\t| {1,4})/g, '$1');
        const replacementsCount = newSelection.length - indentedText.length;
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

    const KeydownEventHandler = (event, { textarea, cancelButton, fillButton, confirmButton }) => {
        const { key, shiftKey } = event;
        if (key === 'Escape') {
            cancelButton.click();
        }
        if (key === 'Enter' && event.ctrlKey) {
            event.preventDefault();
            confirmButton.click();
        }
        if (key === 'Enter' && event.altKey) {
            event.preventDefault();
            fillButton.click();
        }
        if (key === 'Enter' && !shiftKey) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            if (start !== end) {
                return;
            }
            const position = textarea.selectionStart;
            const { befores, line, afters } = splitTextareaLines(textarea, position);
            const whiteSpaceMatch = line.match(/^\s*/);
            const whiteSpace = whiteSpaceMatch ? whiteSpaceMatch[0] : '';
            insertTextIntoField(textarea, `\n${whiteSpace}`);
            event.preventDefault();
        }
        if (key === 'Backspace' && textarea.selectionStart === textarea.selectionEnd) {
            const position = textarea.selectionStart;
            if (position === 0)
                return;
            const { line } = splitTextareaLines(textarea, position);
            if (line === '')
                return;
            if (line.trim() === '') {
                event.preventDefault();
                unindentSelection(textarea);
            }
        }
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
            const dialog = document.createElement('div');
            dialog.id = 'dialog';
            this.dialog = dialog;
            const textInput = document.createElement('div');
            textInput.id = 'dialog-text-input';
            textInput.dataset.replicatedValue = '';
            const textarea = currentPlatform.createTextarea();
            textInput.appendChild(textarea);
            this.textarea = textarea;
            textarea.style.whiteSpace = 'pre-wrap';
            textarea.addEventListener('keydown', (event) => {
                KeydownEventHandler(event, this);
            });
            enableTabToIndent(textarea);
            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.justifyContent = 'flex-end';
            buttonContainer.style.marginTop = '16px';
            const cancelButton = document.createElement('button');
            cancelButton.id = 'cancel-button';
            cancelButton.textContent = i18n.cancel;
            const fillButton = document.createElement('button');
            fillButton.id = 'fill-button';
            fillButton.textContent = i18n.fill;
            const confirmButton = document.createElement('button');
            confirmButton.id = 'confirm-button';
            confirmButton.textContent = i18n.confirm;
            buttonContainer.appendChild(cancelButton);
            buttonContainer.appendChild(fillButton);
            buttonContainer.appendChild(confirmButton);
            this.cancelButton = cancelButton;
            this.fillButton = fillButton;
            this.confirmButton = confirmButton;
            dialog.appendChild(textInput);
            dialog.appendChild(buttonContainer);
            overlay.appendChild(dialog);
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
            if (this.overlay.style.display === 'flex') {
                return;
            }
            this.overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            this.updateDialog();
            this.textarea.focus();
        }
        updateDialog() {
            if (currentPlatform.getText === undefined) {
                const baseText = queryOfficalTextarea()?.value;
                this.textarea.value = baseText || '';
            }
            else {
                this.textarea.value = currentPlatform.getText();
            }
            const title = document.querySelector(currentPlatform.selector.chatSessionTitle);
            if (title) {
                this.textarea.placeholder = `Talk to ${title.textContent}`;
            }
            this.textarea.focus();
        }
    }

    const FontFamily = 'HarmonyOS Sans, PingFang SC, Lantinghei SC, Microsoft YaHei, Arial, sans-serif';
    function submit() {
        setTimeout(() => {
            const qButton = currentPlatform.selector.submitButton;
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
            if (currentPlatform.setText) {
                currentPlatform.setText(text);
            }
            else {
                textarea.value = text;
            }
            textarea.focus();
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            if (doSubmit) {
                submit();
            }
        }
        focusOffcialTextarea();
    }
    const url = window.location.href;
    for (let p of Platforms) {
        if (url.includes(p.baseUrl)) {
            togglePlatform(p.name);
            break;
        }
    }
    const dialog = new TextInputDialog();
    dialog.bindConfirmCallback(confirmed);
    updateStyleSheet('custom-dialog-style', StyleSheet(FontFamily, currentPlatform));
    document.addEventListener('keydown', (event) => {
        if (event.altKey && event.key === 's') {
            event.preventDefault();
            event.stopPropagation();
            dialog.show();
        }
    }, true);

})();
//# sourceMappingURL=bundle.user.js.map
