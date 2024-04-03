// ==UserScript==
// @name         Poe输入对话框
// @namespace    http://tampermonkey.net/
// @version      2024-04-03
// @description 添加一个对话框在 Poe 页面上，方便长文本输入
// @author       You
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
    dialog.style.backgroundColor = 'var(--pdl-bg-base)';
    dialog.style.padding = '21px';
    dialog.style.borderRadius = '8px';
    dialog.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.3)';
    dialog.style.display = 'flex';
    dialog.style.width = '50%';
    dialog.style.flexDirection = 'column';
    dialog.style.maxWidth = '900px';
    dialog.style.minWidth = '400px';
    dialog.style.height = '500px';
    dialog.style.position = 'absolute';
    dialog.style.bottom = '100px';

    // Create the text input area
    const textInput = document.createElement('div');
    // textInput.className = 'GrowingTextArea_growWrap__im5W3 ChatMessageInputContainer_textArea__fNi6E';
    textInput.dataset.replicatedValue = '';
    textInput.style.border = '1px solid var(--pdl-accent-base)';
    textInput.style.borderRadius = '4px';
    textInput.style.padding = '8px';
    textInput.style.flexGrow = '1'; // Allow the text input area to grow
    textInput.style.display = 'flex'; // Make the text input area a flex container
    textInput.style.flexDirection = 'column'; // Stack child elements vertically

    const textarea = document.createElement('textarea');
    textarea.className = 'GrowingTextArea_textArea__ZWQbP';
    textarea.rows = 5;
    textarea.background = 'var(--pdl-bg-base) !important';
    textarea.placeholder = 'Talk to ...';
    textarea.style.width = '100%';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.fontSize = '22px';
    textarea.style.lineHeight = '1.5';
    textarea.style.fontFamily = FontFamily;
    textarea.style.flexGrow = '1'; // Allow the textarea to grow vertically
    textInput.appendChild(textarea);

    //show space inside textarea
    textarea.style.whiteSpace = 'pre-wrap';

    // Handle tab and enter key events
    textarea.addEventListener('keydown', (event) => {
        const { key, shiftKey } = event;

        // Handle tab key
        if (key === 'Tab' && !shiftKey) {
            event.preventDefault(); // Prevent the default tab behavior
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const textBeforeCursor = textarea.value.slice(0, start);
            const textAfterCursor = textarea.value.slice(end);
            textarea.value = `${textBeforeCursor}    ${textAfterCursor}`; // Insert 4 spaces
            textarea.selectionStart = textarea.selectionEnd = start + 4; // Move the cursor 4 positions forward
        }

        // Handle enter key
        if (key === 'Enter' && !shiftKey) {
            event.preventDefault(); // Prevent the default enter behavior
            const start = textarea.selectionStart;
            const lines = textarea.value.split('\n');
            const currentLine = lines[lines.length - 1];
            const whiteSpaceMatch = currentLine.match(/^\s*/);
            const whiteSpace = whiteSpaceMatch ? whiteSpaceMatch[0] : ''; // Get the whitespace before the current line
            const textBeforeCursor = textarea.value.slice(0, start);
            const textAfterCursor = textarea.value.slice(textarea.selectionEnd);
            textarea.value = `${textBeforeCursor}\n${whiteSpace}${textAfterCursor}`; // Insert a new line with the same whitespace
            textarea.selectionStart = textarea.selectionEnd = start + whiteSpace.length + 1; // Move the cursor after the whitespace
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
    cancelButton.textContent = 'Cancel';
    cancelButton.style.marginRight = '8px';
    cancelButton.style.padding = '8px 16px';
    cancelButton.style.backgroundColor = '#f2f2f2';
    cancelButton.style.color = '#333';
    cancelButton.style.border = '1px solid #ccc';
    cancelButton.style.borderRadius = '4px';
    cancelButton.style.cursor = 'pointer';

    // Create the confirm button
    const confirmButton = document.createElement('button');
    confirmButton.id = 'confirm-button';
    confirmButton.textContent = 'Confirm';
    confirmButton.style.padding = '8px 16px';
    confirmButton.style.backgroundColor = 'var(--pdl-accent-base)';
    confirmButton.style.color = '#fff';
    confirmButton.style.border = 'none';
    confirmButton.style.borderRadius = '4px';
    confirmButton.style.cursor = 'pointer';

    // Append buttons to the button container
    buttonContainer.appendChild(cancelButton);
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

    confirmButton.addEventListener('click', () => {
        globalThis.inputText = textarea.value;
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
        confirmCallback(globalThis.inputText);
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
}

function createButton() {
    // Create the floating button
    const floatingButton = document.createElement('button');
    floatingButton.id = 'floating-button';
    floatingButton.textContent = 'Dialog';
    floatingButton.style.position = 'absolute';
    floatingButton.style.top = '0px';
    floatingButton.style.right = '0px';
    floatingButton.style.padding = '10px 20px';
    floatingButton.style.backgroundColor = 'var(--pdl-accent-base)';
    floatingButton.style.color = '#fff';
    floatingButton.style.border = 'none';
    floatingButton.style.borderTopRightRadius = '25px';
    floatingButton.style.cursor = 'pointer';
    // Add event listeners
    floatingButton.addEventListener('click', () => {
        globalThis.inputText = '';
        Elements.overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        updateTextInputDialog();
    });
    Elements.floatingButton = floatingButton;
    const chatBox = document.querySelector('div.ChatMessageInputContainer_inputContainer__s2AGa');
    document.body.appendChild(floatingButton);
    //chatBox.appendChild(floatingButton);
}

function confirmed(text) {
    if (!text) return;
    const q = 'div.ChatMessageInputContainer_inputContainer__s2AGa textarea';
    const textarea = document.querySelector(q);
    if (textarea) {
        textarea.value = text;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
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
createTextInputDialog(confirmed);
createButton();
updateStyleSheet('custom-dialog-style', `
textarea.GrowingTextArea_textArea__ZWQbP {
    background: var(--pdl-bg-base) !important;
}
`);
})();