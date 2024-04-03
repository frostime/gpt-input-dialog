// ==UserScript==
// @name         Poe输入对话框
// @namespace    http://tampermonkey.net/
// @version      v24.4.7
// @description 添加一个对话框在 Poe 页面上，方便长文本输入: 1) 双击文本框打开对话框 2) 点击右下角按钮打开对话框 3) Ctrl+Enter 提交 4) Ctrl+[-=] 调整字体大小
// @author       frostime
// @match        https://poe.com/chat/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=poe.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
let Elements = {
    overlay: null,
    dialog: null,
    textarea: null,
    cancelButton: null,
    confirmButton: null,

    floatingButton: null
}

const FontFamily = 'HarmonyOS Sans, sans-serif';

function createTextInputDialog(confirmCallback) {
    // Create the overlay
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

    // Create the dialog
    const dialog = document.createElement('div');
    dialog.id = 'dialog';

    // Create the text input area
    const textInput = document.createElement('div');
    textInput.id = 'dialog-text-input';
    textInput.dataset.replicatedValue = '';

    const textarea = document.createElement('textarea');
    textarea.className = 'GrowingTextArea_textArea__ZWQbP';
    textarea.rows = 5;
    textarea.background = 'var(--pdl-bg-base) !important';
    textarea.placeholder = 'Talk to ...';
    textInput.appendChild(textarea);

    //show space inside textarea
    textarea.style.whiteSpace = 'pre-wrap';

    // Handle tab and enter key events
    textarea.addEventListener('keydown', (event) => {
        const { key, shiftKey } = event;

        // Handle tab key
        if (key === 'Tab' && !shiftKey) {
            event.preventDefault();
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const textBeforeCursor = textarea.value.slice(0, start);
            const textAfterCursor = textarea.value.slice(end);
            textarea.value = `${textBeforeCursor}    ${textAfterCursor}`; // Insert 4 spaces
            textarea.selectionStart = textarea.selectionEnd = start + 4; // Move the cursor 4 positions forward
        }

        // Shift+Tab to unindent the text
        if (key === 'Tab' && shiftKey) {
            event.preventDefault();
            const start = textarea.selectionStart;
            // const end = textarea.selectionEnd;
            const lines = textarea.value.split('\n');
            const currentLineNumber = textarea.value.slice(0, start).split('\n').length - 1;
            const currentLine = lines[currentLineNumber];
            const whiteSpaceMatch = currentLine.match(/^(\t| {4})/);
            const whiteSpace = whiteSpaceMatch ? whiteSpaceMatch[0] : '';
            const textBeforeCurrentLine = lines.slice(0, currentLineNumber).join('\n');
            const textAfterCurrentLine = lines.slice(currentLineNumber + 1).join('\n');
            const updatedCurrentLine = currentLine.replace(/^(\t| {4})/, '');
            const updatedValue = `${textBeforeCurrentLine}\n${updatedCurrentLine}\n${textAfterCurrentLine}`;
            textarea.value = updatedValue;
            textarea.selectionStart = textarea.selectionEnd = start - whiteSpace.length;
        }

        //Ctrl + Enter to submit
        if (key === 'Enter' && event.ctrlKey) {
            event.preventDefault();
            confirmButton.click();
        }

        // Handle enter key
        if (key === 'Enter' && !shiftKey) {
            event.preventDefault(); // Prevent the default enter behavior
            const start = textarea.selectionStart;
            const lines = textarea.value.split('\n');
            const currentLine = lines[lines.length - 1];
            //获取当前行前面的空格
            const whiteSpaceMatch = currentLine.match(/^\s*/);
            const whiteSpace = whiteSpaceMatch ? whiteSpaceMatch[0] : '';
            const textBeforeCursor = textarea.value.slice(0, start);
            const textAfterCursor = textarea.value.slice(textarea.selectionEnd);
            //新开一行自动缩进
            textarea.value = `${textBeforeCursor}\n${whiteSpace}${textAfterCursor}`;
            // Move the cursor after the whitespace
            textarea.selectionStart = textarea.selectionEnd = start + whiteSpace.length + 1;
            textarea.scrollTop = textarea.scrollHeight; // Scroll to the bottom
        }

        //Press ctrl+[-=] to change font size
        if (key === '-' && event.ctrlKey) {
            event.preventDefault();
            textarea.style.fontSize = `${parseInt(textarea.style.fontSize) - 1}px`;
        } else if (key === '=' && event.ctrlKey) {
            event.preventDefault();
            textarea.style.fontSize = `${parseInt(textarea.style.fontSize) + 1}px`;
        }

    });

    // Create the button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.marginTop = '16px';

    // Create the cancel button
    const cancelButton = document.createElement('button');
    cancelButton.id = 'cancel-button';
    cancelButton.textContent = '取消';

    // Create the confirm button
    const fillButton = document.createElement('button');
    fillButton.id = 'fill-button';
    fillButton.textContent = '填充';

    // Create the confirm button
    const confirmButton = document.createElement('button');
    confirmButton.id = 'confirm-button';
    confirmButton.textContent = '提交';

    // Append buttons to the button container
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(fillButton);
    buttonContainer.appendChild(confirmButton);

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
    });

    fillButton.addEventListener('click', () => {
        globalThis.inputText = textarea.value;
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
        confirmCallback(globalThis.inputText, false);
    });

    confirmButton.addEventListener('click', () => {
        globalThis.inputText = textarea.value;
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
        confirmCallback(globalThis.inputText, true);
    });

    Elements.overlay = overlay;
    Elements.dialog = dialog;
    Elements.textarea = textarea;
    Elements.cancelButton = cancelButton;
    Elements.confirmButton = confirmButton;
}

function updateTextInputDialog() {
    const baseText = document.querySelector('div.ChatMessageInputContainer_inputContainer__s2AGa textarea').value;
    Elements.textarea.value = baseText || '';
    const title = document.querySelector('p.ChatHeader_overflow__aVkfq');
    if (title) {
        Elements.textarea.placeholder = `Talk to ${title.textContent}`;
    }
    Elements.textarea.focus();
}

function openDialog() {
    globalThis.inputText = '';
    Elements.overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    updateTextInputDialog();
}

function createButton() {
    // Create the floating button
    const floatingButton = document.createElement('button');
    floatingButton.id = 'floating-button';
    floatingButton.textContent = 'Dialog';
    floatingButton.addEventListener('click', openDialog);
    Elements.floatingButton = floatingButton;

    // const box = document.querySelector('main.SidebarLayout_main__0ZApe');
    document.body.appendChild(floatingButton);
    // box.appendChild(floatingButton);
}

function submit() {
    const q = 'div.ChatMessageInputContainer_inputContainer__s2AGa textarea';
    const textarea = document.querySelector(q);

    if (textarea) {
        textarea.focus();
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }

    setTimeout(() => {
        const qButton = 'div.ChatMessageInputContainer_inputContainer__s2AGa button.ChatMessageInputContainer_sendButton__dBjTt';
        const button = document.querySelector(qButton);
        if (button) {
            button.click();
        }
    }, 500);
}

function confirmed(text, submit=false) {
    if (!text) return;
    const q = 'div.ChatMessageInputContainer_inputContainer__s2AGa textarea';
    const textarea = document.querySelector(q);
    if (textarea) {
        textarea.value = text;
        if (submit) {
            submit();
        }
    }
}

function updateStyleSheet(id, cssText) {
    let style = document.getElementById(id);
    if (!style) {
        style = document.createElement('style');
        style.id = id;
        document.head.appendChild(style);
    }
    style.textContent = cssText;
}

function createStyleSheet() {
    updateStyleSheet('custom-dialog-style', `
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
}
    `);
}

createTextInputDialog(confirmed);
createButton();
createStyleSheet();

//监听鼠鼠标
document.addEventListener('dblclick', () => {
    let activeElement = document.activeElement;
    if (activeElement.tagName === 'TEXTAREA' && activeElement.className === 'GrowingTextArea_textArea__ZWQbP') {
        openDialog();
    }
});

})();
