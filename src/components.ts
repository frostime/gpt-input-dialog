/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-04-06 16:08:53
 * @FilePath     : /src/components.ts
 * @LastEditTime : 2024-11-19 21:52:36
 * @Description  : 
 */
import { enableTabToIndent, unindentSelection } from './indent-textarea';
import { insertTextIntoField } from 'text-field-edit';
import { queryOfficalTextarea, focusOffcialTextarea, splitTextareaLines } from "./utils";
import { useI18n } from './i18n';

import * as platform from './platform';

interface IDialogElements {
    textarea: HTMLTextAreaElement;
    cancelButton: HTMLButtonElement;
    fillButton: HTMLButtonElement;
    confirmButton: HTMLButtonElement;
}


const KeydownEventHandler = (event: KeyboardEvent, { textarea, cancelButton, fillButton, confirmButton }: IDialogElements) => {
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

    const position = textarea.selectionStart;

    const { befores, line, afters } = splitTextareaLines(textarea, position);

    // Handle enter key, 自动跟随缩进
    if (key === 'Enter' && !shiftKey) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        if (start !== end) {
            // If there is no selection, just insert a newline
            return;
        }
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
        if (position === 0) return;

        const { line } = splitTextareaLines(textarea, position);
        if (line === '') return;

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

    // XML tag cmpletion
    if (key === '>') {
        const tagMatch = line.match(/^\s*<(\S+?)$/);

        if (tagMatch) {
            event.preventDefault();
            const tagName = tagMatch[1];
            insertTextIntoField(textarea, `>${tagName ? `</${tagName}>` : ''}`);
            // Move cursor to middle position
            const newPosition = position + 1;
            textarea.setSelectionRange(newPosition, newPosition);
            return;
        }
    }
}

export class TextInputDialog {

    public static readonly OVERLAY_ID = 'overlay';

    overlay: HTMLDivElement;
    dialog: HTMLDivElement;
    textarea: HTMLTextAreaElement;
    cancelButton: HTMLButtonElement;
    fillButton: HTMLButtonElement;
    confirmButton: HTMLButtonElement;

    confirmCallback: (text: string, submit: boolean) => void = () => { };

    constructor() {
        this.buildDialog();
    }

    bindConfirmCallback(callback: (text: string, submit: boolean) => void) {
        this.confirmCallback = callback;
    }

    private buildDialog() {
        const i18n = useI18n();

        const overlay: HTMLDivElement = document.createElement('div');
        overlay.id = TextInputDialog.OVERLAY_ID;
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
        const dialog: HTMLDivElement = document.createElement('div');
        dialog.id = 'dialog';
        this.dialog = dialog;

        // Create the text input area
        const textInput: HTMLDivElement = document.createElement('div');
        textInput.id = 'dialog-text-input';
        textInput.dataset.replicatedValue = '';

        const textarea: HTMLTextAreaElement = platform.currentPlatform.createTextarea();
        textInput.appendChild(textarea);
        this.textarea = textarea;

        //show space inside textarea
        textarea.style.whiteSpace = 'pre-wrap';

        textarea.addEventListener('keydown', (event: KeyboardEvent) => {
            KeydownEventHandler(event, this);
        });
        //优先自定义的事件处理，以防止被 preventDefault
        enableTabToIndent(textarea);

        const bottom: HTMLDivElement = document.createElement('div');
        bottom.style.display = 'flex';
        bottom.style.justifyContent = 'space-between';

        const bottomLeft: HTMLDivElement = document.createElement('div');
        bottomLeft.style.display = 'flex';
        bottomLeft.style.alignItems = 'center';
        bottomLeft.style.justifyContent = 'flex-start';
        const reloadButton = document.createElement('button');
        reloadButton.ariaLabel = 'Latest Input';
        Object.assign(reloadButton.style, {
            width: '24px',
            height: '24px',
            padding: '0',
            margin: '0',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            outline: 'none',
        });
        reloadButton.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
<path d="M3 5.67541V3C3 2.44772 2.55228 2 2 2C1.44772 2 1 2.44772 1 3V7C1 8.10457 1.89543 9 3 9H7C7.55229 9 8 8.55229 8 8C8 7.44772 7.55229 7 7 7H4.52186C4.54218 6.97505 4.56157 6.94914 4.57995 6.92229C5.621 5.40094 7.11009 4.22911 8.85191 3.57803C10.9074 2.80968 13.173 2.8196 15.2217 3.6059C17.2704 4.3922 18.9608 5.90061 19.9745 7.8469C20.9881 9.79319 21.2549 12.043 20.7247 14.1724C20.1945 16.3018 18.9039 18.1638 17.0959 19.4075C15.288 20.6513 13.0876 21.1909 10.9094 20.9247C8.73119 20.6586 6.72551 19.605 5.27028 17.9625C4.03713 16.5706 3.27139 14.8374 3.06527 13.0055C3.00352 12.4566 2.55674 12.0079 2.00446 12.0084C1.45217 12.0088 0.995668 12.4579 1.04626 13.0078C1.25994 15.3309 2.2082 17.5356 3.76666 19.2946C5.54703 21.3041 8.00084 22.5931 10.6657 22.9188C13.3306 23.2444 16.0226 22.5842 18.2345 21.0626C20.4464 19.541 22.0254 17.263 22.6741 14.6578C23.3228 12.0526 22.9963 9.30013 21.7562 6.91897C20.5161 4.53782 18.448 2.69239 15.9415 1.73041C13.4351 0.768419 10.6633 0.756291 8.14853 1.69631C6.06062 2.47676 4.26953 3.86881 3 5.67541Z"/>
<path d="M12 5C11.4477 5 11 5.44771 11 6V12.4667C11 12.4667 11 12.7274 11.1267 12.9235C11.2115 13.0898 11.3437 13.2344 11.5174 13.3346L16.1372 16.0019C16.6155 16.278 17.2271 16.1141 17.5032 15.6358C17.7793 15.1575 17.6155 14.546 17.1372 14.2698L13 11.8812V6C13 5.44772 12.5523 5 12 5Z"/>
</svg>`;
        reloadButton.addEventListener('click', () => {
            textarea.value = globalThis.inputText ?? '';
        });

        bottomLeft.appendChild(reloadButton);

        // Create the button container
        const bottomRight: HTMLDivElement = document.createElement('div');
        bottomRight.style.display = 'flex';
        bottomRight.style.alignItems = 'center';
        bottomRight.style.justifyContent = 'flex-end';
        bottomRight.style.marginTop = '16px';

        // Create the cancel button
        const cancelButton: HTMLButtonElement = document.createElement('button');
        cancelButton.id = 'cancel-button';
        cancelButton.textContent = i18n.cancel;

        // Create the confirm button
        const fillButton: HTMLButtonElement = document.createElement('button');
        fillButton.id = 'fill-button';
        fillButton.textContent = i18n.fill;

        // Create the confirm button
        const confirmButton: HTMLButtonElement = document.createElement('button');
        confirmButton.id = 'confirm-button';
        confirmButton.textContent = i18n.confirm;

        // Append buttons to the button container
        bottomRight.appendChild(cancelButton);
        bottomRight.appendChild(fillButton);
        bottomRight.appendChild(confirmButton);

        this.cancelButton = cancelButton;
        this.fillButton = fillButton;
        this.confirmButton = confirmButton;

        // Append the button container to the bottom of the dialog
        bottom.appendChild(bottomLeft);
        bottom.appendChild(bottomRight);

        // Append text input and button container to the dialog
        dialog.appendChild(textInput);
        dialog.appendChild(bottom);

        // Append dialog to the overlay
        overlay.appendChild(dialog);

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

    render(container: HTMLElement) {
        console.log(`Install GPT-Dialog within: ${container.tagName}`)
        if (container.querySelector(`#${TextInputDialog.OVERLAY_ID}`)) {
            console.warn(`Overlay already exists, skip render`);
            return;
        }
        container.appendChild(this.overlay);
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
        if (platform.currentPlatform.getText === undefined) {
            const baseText: string | null = queryOfficalTextarea()?.value;
            this.textarea.value = baseText || '';
        } else {
            this.textarea.value = platform.currentPlatform.getText();
        }

        const title = document.querySelector(platform.currentPlatform.selector.chatSessionTitle);
        if (title) {
            this.textarea.placeholder = `Talk to ${title.textContent}`;
        }
        this.textarea.focus();
    }
}


export function createDialogButton(dialog: TextInputDialog) {
    // Create the floating button
    const floatingButton = document.createElement('button');
    floatingButton.id = 'floating-button';
    floatingButton.textContent = 'Dialog';
    floatingButton.addEventListener('click', () => {
        dialog.show();
    });

    // const box = document.querySelector('main.SidebarLayout_main__0ZApe');
    document.body.appendChild(floatingButton);
    // box.appendChild(floatingButton);
}
