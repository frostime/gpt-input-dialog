/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-04-06 16:08:53
 * @FilePath     : /src/components.ts
 * @LastEditTime : 2024-04-07 17:04:01
 * @Description  : 
 */
import { enableTabToIndent, unindentSelection } from './indent-textarea';
import { insertTextIntoField } from 'text-field-edit';
import { queryOfficalTextarea, focusOffcialTextarea } from "./utils";
import { useI18n } from './i18n';

interface IDialogElements {
    textarea: HTMLTextAreaElement;
    cancelButton: HTMLButtonElement;
    fillButton: HTMLButtonElement;
    confirmButton: HTMLButtonElement;
}

/**
 * 分割 textarea 的行
 * @param textarea HTMLTextAreaElement
 * @param position number
 * @returns
 *  - befores: string[], position 之前的行
 *  - line: string, position 所在的行
 *  - afters: string[], position 之后的行
 */
const splitTextareaLines = (textarea: HTMLTextAreaElement, position) => {
    const text = textarea.value;
    const befores = text.slice(0, position).split('\n');
    const afters = text.slice(position).split('\n');

    const line = befores.pop() + afters.shift();

    return { befores, line, afters };
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
        const dialog: HTMLDivElement = document.createElement('div');
        dialog.id = 'dialog';
        this.dialog = dialog;

        // Create the text input area
        const textInput: HTMLDivElement = document.createElement('div');
        textInput.id = 'dialog-text-input';
        textInput.dataset.replicatedValue = '';

        const textarea: HTMLTextAreaElement = document.createElement('textarea');
        textarea.className = 'GrowingTextArea_textArea__ZWQbP';
        textarea.rows = 5;
        textarea.style.backgroundColor = 'var(--pdl-bg-base) !important';
        textarea.placeholder = 'Talk to ...';
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
        const column: HTMLDivElement | null = document.querySelector('.MainColumn_column__UEunw');
        //dialog 和 column 中心对齐
        this.dialog.style.left = `${column.offsetLeft + column.offsetWidth / 2 - this.dialog.offsetWidth / 2}px`;

        const baseText: string | null = queryOfficalTextarea()?.value;
        this.textarea.value = baseText || '';
        const title = document.querySelector('p.ChatHeader_overflow__aVkfq');
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
