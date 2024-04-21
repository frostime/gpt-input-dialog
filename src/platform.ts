export const Poe: IPlatform = {
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


export const Mistral: IPlatform = {
    name: 'Mistral',
    baseUrl: 'chat.mistral.ai',
    selector: {
        officialTextarea: 'div.flex.flex-row.items-start>textarea',
        submitButton: 'div.flex.flex-row.items-start>textarea + button',
        chatSessionTitle: 'div.flex.w-full>p.blocl.truncate',
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

export let currentPlatform: IPlatform;
export let togglePlatform = (name: 'Poe' | 'Mistral') => {
    if (name === 'Poe') {
        currentPlatform = Poe;
    } else if (name === 'Mistral') {
        currentPlatform = Mistral;
    }
}
