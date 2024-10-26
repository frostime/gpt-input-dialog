/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-04-06 15:54:15
 * @FilePath     : /src/index.ts
 * @LastEditTime : 2024-10-26 22:12:23
 * @Description  : Poe long input dialog
 */
import * as platform from './platform';
import { updateStyleSheet, queryOfficalTextarea, focusOffcialTextarea, StyleSheet } from './utils';
import { TextInputDialog } from './components';

const FontFamily = 'HarmonyOS Sans, PingFang SC, Lantinghei SC, Microsoft YaHei, Arial, sans-serif';

function submit() {

    setTimeout(() => {
        const cur = platform.currentPlatform;
        let button: HTMLButtonElement;
        if (cur?.getSubmitButton) {
            button = cur.getSubmitButton();
        } else {
            const qButton = platform.currentPlatform.selector.submitButton;
            button = document.querySelector(qButton);
        }
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

const DefaultMatchPlatformMethod = (url: string, p: IPlatform) => {
    if (p?.matchUrl) {
        return p.matchUrl(url);
    }
    if (typeof p.baseUrl === 'string' && url.includes(p.baseUrl)) {
        return true;
    } else if (Array.isArray(p.baseUrl)) {
        for (let u of p.baseUrl) {
            if (url.includes(u)) {
                return true;
            }
        }
    }
    return false;
}

const toggle = () => {
    for (let p of platform.Platforms) {
        let match = DefaultMatchPlatformMethod(url, p)
        if (match) {
            platform.togglePlatform(p.name);
            return p;
        }
    }
    return null;
}

const install = () => {
    const dialog = new TextInputDialog();
    dialog.render(document.body);
    dialog.bindConfirmCallback(confirmed);
    updateStyleSheet(dialog.overlay, 'custom-dialog-style', StyleSheet(FontFamily, platform.currentPlatform));

    //监听按键
    document.addEventListener('keydown', (event) => {
        //Alt + S
        if (event.altKey && event.key === 's') {
            event.preventDefault();
            event.stopPropagation();
            dialog.show();
        }
    }, true);
    return dialog;
}

const currentPlatform = toggle();

if (currentPlatform === null) {
    console.warn(`无法匹配当前网页: ${url}`);
} else {
    if (['Aizex', 'ChatGPT', 'Claude'].includes(currentPlatform.name)) {
        //不知道为什么 Aizex 平台非常不稳定，经常会初始化失败。。。
        setTimeout(install, 1000 * 3);
        setTimeout(() => {
            //保险期间，在检查一遍
            const overlay = document.getElementById(TextInputDialog.OVERLAY_ID);
            if (!overlay) {
                install();
            }
        }, 1000 * 10);
    } else {
        install();
    }
}
