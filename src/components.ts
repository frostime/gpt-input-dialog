/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-04-06 16:08:53
 * @FilePath     : /src/components.ts
 * @LastEditTime : 2024-09-23 19:59:25
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

        // Create the button container
        const buttonContainer: HTMLDivElement = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.marginTop = '16px';

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
