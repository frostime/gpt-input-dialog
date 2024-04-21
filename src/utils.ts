/*
 * Copyright (c) 2023 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-08-16 17:05:29
 * @FilePath     : /src/utils.ts
 * @LastEditTime : 2024-04-21 16:37:55
 * @Description  : 
 */
import * as platform from './platform';

/**
 * 分割 textarea 的行
 * @param textarea HTMLTextAreaElement
 * @param position number - The position index to split the text at
 * @returns
 *  - befores: string[], position 之前的行
 *  - line: string, position 所在的行
 *  - afters: string[], position 之后的行
 */
export const splitTextareaLines = (textarea: HTMLTextAreaElement, position: number) => {
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
}

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
    // const q = 'div.ChatMessageInputContainer_inputContainer__s2AGa textarea';
    const q = platform.currentPlatform.selector.officialTextarea;
    const textarea: HTMLTextAreaElement = document.querySelector(q);
    return textarea;
}

export const focusOffcialTextarea = () => {
    const textarea = queryOfficalTextarea();
    textarea?.focus();
}

export const StyleSheet = (FontFamily: string, currentPlatform: IPlatform) => `
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