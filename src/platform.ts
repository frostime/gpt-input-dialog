/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-04-21 17:17:02
 * @FilePath     : /src/platform.ts
 * @LastEditTime : 2024-04-21 17:54:26
 * @Description  : 
 */
const Poe: IPlatform = {
    name: 'Poe',
    baseUrl: 'poe.com',
    selector: {
        officialTextarea: 'div.ChatMessageInputContainer_inputContainer__s2AGa textarea',
        submitButton: 'div.ChatMessageInputContainer_inputContainer__s2AGa button.ChatMessageInputContainer_sendButton__dBjTt',
        chatSessionTitle: 'p.ChatHeader_overflow__aVkfq',
    },
    css: {
        backgroundColor: 'var(--pdl-bg-base)',
        primaryColor: 'var(--pdl-accent-base)',
    },
    createTextarea: () => {
        const textarea: HTMLTextAreaElement = document.createElement('textarea');
        textarea.className = 'GrowingTextArea_textArea__ZWQbP';
        textarea.rows = 5;
        textarea.style.backgroundColor = 'var(--pdl-bg-base) !important';
        textarea.placeholder = 'Talk to ...';
        return textarea;
    }
}


const Mistral: IPlatform = {
    name: 'Mistral',
    baseUrl: 'chat.mistral.ai/chat',
    selector: {
        officialTextarea: 'div.flex.flex-row.items-start>textarea',
        submitButton: 'div.flex.flex-row.items-start>textarea + button',
        chatSessionTitle: 'div.flex.w-full>p.block.truncate',
    },
    css: {
        backgroundColor: 'hsl(var(--background))',
        primaryColor: 'hsl(var(--primary))',
    },
    createTextarea: () => {
        const textarea: HTMLTextAreaElement = document.createElement('textarea');
        // textarea.className = 'GrowingTextArea_textArea__ZWQbP';
        // textarea.rows = 5;
        textarea.style.backgroundColor = 'hsl(var(--background)) !important';
        textarea.placeholder = 'Talk to ...';
        return textarea;
    }
}


const Kimi: IPlatform = {
    name: 'Kimi',
    baseUrl: 'kimi.moonshot.cn',
    selector: {
        officialTextarea: 'div.editor___KShcc>div[role="textbox"]',
        submitButton: 'button#send-button',
        chatSessionTitle: 'div.chatHeader___mPWFf>span.title___Jbjbz',
    },
    css: {
        backgroundColor: 'var(--background-default)',
        primaryColor: 'var(--msh-button-primary-bg)',
    },
    createTextarea: () => {
        const textarea: HTMLTextAreaElement = document.createElement('textarea');
        // textarea.className = 'GrowingTextArea_textArea__ZWQbP';
        // textarea.rows = 5;
        textarea.placeholder = 'Talk to ...';
        return textarea;
    },
    getText: () => {
        const officialTextarea = document.querySelector(Kimi.selector.officialTextarea);
        return officialTextarea ? officialTextarea.textContent : '';
    },
    setText: (text: string) => {
        // let doms = [];
        // let lines = text.split('\n');
        // for (let line of lines) {
        //     const dom = `<div data-slate-node="element"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true">${line}</span></span></span></div>`;
        //     doms.push(dom);
        // }
        const officialTextarea = document.querySelector(Kimi.selector.officialTextarea);
        // officialTextarea.innerHTML = doms.join('\n');
        officialTextarea.textContent = text.trim();
    }
}


export const Platforms: IPlatform[] = [Poe, Mistral, Kimi];

export let currentPlatform: IPlatform;
export let togglePlatform = (name) => {
    for (let p of Platforms) {
        if (p.name === name) {
            currentPlatform = p;
            break;
        }
    }
}
