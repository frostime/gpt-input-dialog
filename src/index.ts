/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-04-06 15:54:15
 * @FilePath     : /src/index.ts
 * @LastEditTime : 2024-04-21 17:48:04
 * @Description  : Poe long input dialog
 */
import * as platform from './platform';
import { updateStyleSheet, queryOfficalTextarea, focusOffcialTextarea, StyleSheet } from './utils';
import { TextInputDialog } from './components';

const FontFamily = 'HarmonyOS Sans, PingFang SC, Lantinghei SC, Microsoft YaHei, Arial, sans-serif';

function submit() {

    setTimeout(() => {
        // const qButton = 'div.ChatMessageInputContainer_inputContainer__s2AGa button.ChatMessageInputContainer_sendButton__dBjTt';
        const qButton = platform.currentPlatform.selector.submitButton;
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
        if (platform.currentPlatform.setText) {
            platform.currentPlatform.setText(text);
        } else {
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
for (let p of platform.Platforms) {
    if (url.includes(p.baseUrl)) {
        platform.togglePlatform(p.name);
        break;
    }
}

const dialog = new TextInputDialog();
dialog.bindConfirmCallback(confirmed);
updateStyleSheet('custom-dialog-style', StyleSheet(FontFamily, platform.currentPlatform));

//监听鼠鼠标
// document.addEventListener('dblclick', (e) => {
//     let activeElement = document.activeElement;
//     if (activeElement.tagName === 'TEXTAREA' && activeElement.className === 'GrowingTextArea_textArea__ZWQbP') {
//         e.preventDefault();
//         e.stopPropagation();
//         dialog.show();
//     }
// });

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

