import { removeAllChildren } from "./utils";

/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-04-21 17:17:02
 * @FilePath     : /src/platform.ts
 * @LastEditTime : 2024-08-25 19:10:41
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
        officialTextarea: 'div.flex.flex-row>textarea',
        submitButton: 'div.flex.flex-row>textarea + div.items-end>button',
        chatSessionTitle: 'div.flex.w-full>p.block.truncate',
    },
    css: {
        backgroundColor: 'hsl(var(--background))',
        primaryColor: 'hsl(var(--primary))',
    },
    createTextarea: () => {
        const textarea: HTMLTextAreaElement = document.createElement('textarea');
        textarea.style.backgroundColor = 'hsl(var(--background)) !important';
        textarea.placeholder = 'Talk to ...';
        return textarea;
    }
}


//BUG setText 无法正常运行，暂时先不用了
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
        const spans = officialTextarea.querySelectorAll('span[data-slate-node="text"]>span[data-slate-leaf="true"]>span[data-slate-string="true"]');
        return Array.from(spans).map((span: HTMLElement) => span.textContent).join('\n');
    },
    setText: (text: string) => {
        const dom = `<div data-slate-node="element"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-string="true"></span></span></span></div>`;
        const element = document.createElement('template');
        element.innerHTML = dom;
        const officialTextarea = document.querySelector(Kimi.selector.officialTextarea);
        let lines = text.split('\n');
        for (let line of lines) {
            let ele = element.content.cloneNode(true) as HTMLElement;
            ele.querySelector('span[data-slate-string="true"]').textContent = line;
            officialTextarea.appendChild(ele);
        }
        // officialTextarea.innerHTML = doms.join('\n');
        // officialTextarea.textContent = text.trim();
    }
}


const ChatGPT: IPlatform = {
    name: 'ChatGPT',
    baseUrl: 'chatgpt.com',
    selector: {
        officialTextarea: 'textarea#prompt-textarea',
        submitButton: null,
        chatSessionTitle: '#chat-title', //不存在
    },
    css: {
        backgroundColor: 'var(--main-surface-primary)',
        primaryColor: '#2e95d3',
    },
    createTextarea: () => {
        const textarea: HTMLTextAreaElement = document.createElement('textarea');
        textarea.style.backgroundColor = 'var(--main-surface-primary)';
        textarea.style.padding = '0px';
        textarea.placeholder = 'Talk to ...';
        return textarea;
    },
    getSubmitButton: () => {
        let textarea = document.querySelector(ChatGPT.selector.officialTextarea);
        let grandpa = textarea.parentElement.parentElement;
        let buttons = grandpa.querySelectorAll('button');
        return buttons[buttons.length - 1];
    }
}


const Aizex: IPlatform = {
    name: 'Aizex',
    baseUrl: ['panter.aizex.cn', 'panzer.aizex.net', 'linlin.aizex.cn'],
    selector: {
        officialTextarea: 'textarea#prompt-textarea',
        submitButton: null,
        chatSessionTitle: '#chat-title', //不存在
    },
    css: {
        backgroundColor: 'var(--main-surface-primary)',
        primaryColor: '#2e95d3',
    },
    createTextarea: () => {
        const textarea: HTMLTextAreaElement = document.createElement('textarea');
        textarea.style.backgroundColor = 'var(--main-surface-primary)';
        textarea.style.padding = '0px';
        textarea.placeholder = 'Talk to ...';
        return textarea;
    },
    getSubmitButton: () => {
        let textarea = document.querySelector(Aizex.selector.officialTextarea);
        let grandpa = textarea.parentElement.parentElement;
        let buttons = grandpa.querySelectorAll('button');
        return buttons[buttons.length - 1];
    }
}


const ChatGLM: IPlatform = {
    name: 'ChatGLM',
    baseUrl: 'chatglm.cn',
    selector: {
        officialTextarea: 'div.input-box-inner>textarea',
        submitButton: 'div.input-wrap>div.enter>img',
        chatSessionTitle: '.showHideText>div:first-child',
    },
    css: {
        backgroundColor: 'var(--bg_white_1)',
        primaryColor: '#2e95d3',
    },
    createTextarea: () => {
        const textarea: HTMLTextAreaElement = document.createElement('textarea');
        textarea.style.backgroundColor = 'var(--bg_white_1)';
        textarea.style.color = 'var(--txt_icon_black_1,#1a2029)';
        textarea.style.fontSize = '20px';
        textarea.placeholder = 'Talk to ...';
        return textarea;
    }
}


const Gemini: IPlatform = {
    name: 'Gemini',
    baseUrl: 'gemini.google.com',
    selector: {
        officialTextarea: 'rich-textarea > div.ql-editor.textarea',
        submitButton: '.action-wrapper button.send-button',
        chatSessionTitle: '',
    },
    css: {
        backgroundColor: 'var(--gem-sys-color--surface-container)',
        primaryColor: '#2e95d3',
    },
    createTextarea: () => {
        const textarea: HTMLTextAreaElement = document.createElement('textarea');
        Object.assign(textarea.style, {
            'color': 'var(--bard-color-inverse-surface-container)',
            'background-color': 'var(--bard-color-surface-container)'
        })
        // textarea.className = 'GrowingTextArea_textArea__ZWQbP';
        // textarea.rows = 5;
        textarea.placeholder = 'Talk to ...';
        return textarea;
    },
    getText: () => {
        const officialTextarea: HTMLDivElement = document.querySelector(Gemini.selector.officialTextarea);
        let paras = officialTextarea.querySelectorAll('p');
        let text = Array.from(paras).map(para => para.textContent).join('\n');
        return text;
    },
    setText: (text: string) => {
        const officialTextarea: HTMLDivElement = document.querySelector(Gemini.selector.officialTextarea);
        let lines = text.trim().split('\n');
        removeAllChildren(officialTextarea);
        lines.forEach(line => {
            let p = document.createElement('p');
            p.textContent = line;
            officialTextarea.appendChild(p);
        });
    }
}


export const Platforms: IPlatform[] = [Poe, Mistral, ChatGPT, Aizex, ChatGLM, Gemini];

export let currentPlatform: IPlatform;
export let togglePlatform = (name) => {
    for (let p of Platforms) {
        if (p.name === name) {
            currentPlatform = p;
            break;
        }
    }
}
