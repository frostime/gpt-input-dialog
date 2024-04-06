/*
 * Copyright (c) 2023 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-08-16 17:05:29
 * @FilePath     : /src/utils.ts
 * @LastEditTime : 2024-04-06 15:51:20
 * @Description  : 
 */

export function updateStyleSheet(id: string, cssText: string) {
    let style = document.getElementById(id);
    if (!style) {
        style = document.createElement('style');
        style.id = id;
        document.head.appendChild(style);
    }
    style.textContent = cssText;
}

export const queryOfficalTextarea = (): HTMLTextAreaElement | null => {
    const q = 'div.ChatMessageInputContainer_inputContainer__s2AGa textarea';
    const textarea: HTMLTextAreaElement = document.querySelector(q);
    return textarea;
}

export const StyleSheet = (FontFamily: string) => `
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