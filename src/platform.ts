import { removeAllChildren } from "./utils";


const ContenteditableTextarea = {
    getText: (ele: HTMLDivElement) => {
        let paras = ele.querySelectorAll('p');
        let text = Array.from(paras).map(para => para.textContent).join('\n');
        return text;
    },
    setText: (ele: HTMLDivElement, text: string) => {
        let lines = text.trim().split('\n');
        removeAllChildren(ele);
        lines.forEach(line => {
            let p = document.createElement('p');
            p.textContent = line;
            ele.appendChild(p);
        });
    }
}


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
        officialTextarea: 'textarea',
        submitButton: 'button[type="submit"]',
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

const ChatGPT: IPlatform = {
    name: 'ChatGPT',
    baseUrl: 'chatgpt.com',
    selector: {
        officialTextarea: 'div#prompt-textarea',
        submitButton: 'button[data-testid="send-button"]',
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
        let button = document.querySelector('button[data-testid="send-button"]') as HTMLButtonElement;
        return button;
    },
    getText: () => {
        const officialTextarea: HTMLDivElement = document.querySelector(ChatGPT.selector.officialTextarea);
        return ContenteditableTextarea.getText(officialTextarea);
    },
    setText: (text: string) => {
        const officialTextarea: HTMLDivElement = document.querySelector(ChatGPT.selector.officialTextarea);
        ContenteditableTextarea.setText(officialTextarea, text);
    }
}


const Aizex: IPlatform = {
    name: 'Aizex',
    baseUrl: ['aizex.cn', 'aizex.net', 'aizex.me', 'memofun.net'],
    matchUrl: (url: string) => {
        const urlObj = new URL(url);
        const host = urlObj.hostname;
        const path = urlObj.pathname;
        const isAizex = (Aizex.baseUrl as string[]).some(base => host.endsWith(base) && host !== base);
        const prefix = host.split('.')[0];
        if (isAizex && prefix.endsWith('-c')) {
            return false;
        }
        return isAizex && path.startsWith('/');
    },
    selector: {
        officialTextarea: 'div#prompt-textarea',
        submitButton: 'button[data-testid="send-button"]',
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
        let button = document.querySelector('button[data-testid="send-button"]') as HTMLButtonElement;
        return button;
    },
    getText: () => {
        const officialTextarea: HTMLDivElement = document.querySelector(Aizex.selector.officialTextarea);
        return ContenteditableTextarea.getText(officialTextarea);
    },
    setText: (text: string) => {
        const officialTextarea: HTMLDivElement = document.querySelector(Aizex.selector.officialTextarea);
        ContenteditableTextarea.setText(officialTextarea, text);
    }
}


const Claude: IPlatform = {
    name: 'Claude',
    baseUrl: ['claude.ai'],
    matchUrl: (url: string) => {
        const urlObj = new URL(url);
        const host = urlObj.hostname;
        // const path = urlObj.pathname;
        const isClaude = (Claude.baseUrl as string[]).some(base => host.endsWith(base));
        // https://stug-c.memofun.net/new
        // https://stug-c.aizex.cn/new
        const isAizexClaude = (() => {
            const aizexBaseUrls = (Aizex.baseUrl as string[]);
            const isAizex = aizexBaseUrls.some(base => host.endsWith(base));
            if (!isAizex) return false;
            const firstPart = host.split('.aizex')[0];
            return firstPart.endsWith('-c');
        })();

        if (!isClaude && isAizexClaude) {
            return true;
        }
        return isClaude;
    },
    selector: {
        officialTextarea: 'fieldset div.ProseMirror[contenteditable="true"]',
        submitButton: 'fieldset button[aria-label="Send Message"]',
        chatSessionTitle: '#chat-title', //不存在
    },
    css: {
        backgroundColor: 'hsl(var(--bg-000)/var(--tw-bg-opacity))',
        primaryColor: 'hsl(var(--accent-main-100)/var(--tw-bg-opacity))',
    },
    createTextarea: () => {
        const textarea: HTMLTextAreaElement = document.createElement('textarea');
        textarea.style.backgroundColor = Claude.css.backgroundColor;
        textarea.style.padding = '0px';
        textarea.style.boxShadow = 'unset';
        textarea.placeholder = 'Talk to ...';
        return textarea;
    },
    // getSubmitButton: () => {
    //     let button = document.querySelector('button[data-testid="send-button"]') as HTMLButtonElement;
    //     return button;
    // },
    getText: () => {
        const officialTextarea: HTMLDivElement = document.querySelector(Claude.selector.officialTextarea);
        return ContenteditableTextarea.getText(officialTextarea);
    },
    setText: (text: string) => {
        const officialTextarea: HTMLDivElement = document.querySelector(Claude.selector.officialTextarea);
        ContenteditableTextarea.setText(officialTextarea, text);
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
        submitButton: '.input-buttons-wrapper-bottom button.send-button',
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
        return ContenteditableTextarea.getText(officialTextarea);
    },
    setText: (text: string) => {
        const officialTextarea: HTMLDivElement = document.querySelector(Gemini.selector.officialTextarea);
        ContenteditableTextarea.setText(officialTextarea, text);
    }
}


const Deepseek: IPlatform = {
    name: 'Deepseek',
    baseUrl: 'chat.deepseek.com',
    selector: {
        officialTextarea: 'textarea#chat-input',
        submitButton: 'div[role="button"]._7436101',
        chatSessionTitle: '',
    },
    css: {
        backgroundColor: 'rgb(var(--ds-rgb-header))',
        primaryColor: '#4d6bfe',
    },
    createTextarea: () => {
        const textarea: HTMLTextAreaElement = document.createElement('textarea');
        Object.assign(textarea.style, {
            'background-color': 'var(--ds-toast-custom-color)',
            color: 'rgb(var(--ds-rgb-label-1))'
        })
        textarea.placeholder = 'Talk to ...';
        return textarea;
    }
}


const GoogleAIStudio: IPlatform = {
    name: 'GoogleAIStudio',
    baseUrl: 'aistudio.google.com',
    selector: {
        officialTextarea: 'footer textarea',
        submitButton: 'footer button[type="submit"]',
        chatSessionTitle: '',
    },
    css: {
        backgroundColor: 'var(--color-neutral-8)',
        primaryColor: '#2e95d3',
    },
    createTextarea: () => {
        const textarea: HTMLTextAreaElement = document.createElement('textarea');
        Object.assign(textarea.style, {
            'background-color': 'var(--color-surface-container-lowest)',
            color: 'var(--color-neutral-90)'
        });
        textarea.placeholder = 'Talk to ...';
        return textarea;
    }
}


const Grok: IPlatform = {
    name: 'Grok',
    baseUrl: 'grok.com',
    selector: {
        officialTextarea: 'textarea.w-full',
        submitButton: 'button[type="submit"]',
        chatSessionTitle: '',
    },
    css: {
        backgroundColor: 'var(--background)',
        primaryColor: '#1d9bf0',
    },
    createTextarea: () => {
        const textarea: HTMLTextAreaElement = document.createElement('textarea');
        Object.assign(textarea.style, {
            borderRadius: '8px',
            padding: '12px'
        });
        textarea.placeholder = 'Talk to Grok...';
        return textarea;
    }
}


export const Platforms: IPlatform[] = [
    Poe, Mistral, ChatGPT,
    Aizex, ChatGLM, Gemini,
    Claude, Deepseek, GoogleAIStudio, Grok
];

export let currentPlatform: IPlatform;
export const togglePlatform = (name: string) => {
    console.log(`Try to toggle platform: ${name}`);
    const platform = Platforms.find(p => p.name === name);
    if (platform) {
        currentPlatform = platform;
        console.log(`platform ${name} toggled.`);
    } else {
        console.error(`platform ${name} not found; togglePlatform failed.`);
    }
}
