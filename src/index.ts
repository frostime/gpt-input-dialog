/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-04-06 15:54:15
 * @FilePath     : /src/index.ts
 * @LastEditTime : 2024-04-08 13:18:50
 * @Description  : Poe long input dialog
 */
import { updateStyleSheet, queryOfficalTextarea, focusOffcialTextarea, StyleSheet } from './utils';
import { TextInputDialog } from './components';

const FontFamily = 'HarmonyOS Sans, PingFang SC, Lantinghei SC, Microsoft YaHei, Arial, sans-serif';

function submit() {

    setTimeout(() => {
        const qButton = 'div.ChatMessageInputContainer_inputContainer__s2AGa button.ChatMessageInputContainer_sendButton__dBjTt';
        const button: HTMLButtonElement = document.querySelector(qButton);
        if (button) {
            button.click();
        }
    }, 500);
}

function confirmed(text: string, doSubmit: boolean = false) {
    if (!text) return;

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

