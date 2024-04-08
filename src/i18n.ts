interface I18n {
    cancel: string;
    fill: string;
    confirm: string;
};

const zhCN: I18n = {
    cancel: '取消[Esc]',
    fill: '填充[Alt+Enter]',
    confirm: '提交[Ctrl+Enter]',
};

const enUS: I18n = {
    cancel: 'Cancel[Esc]',
    fill: 'Fill[Alt+Enter]',
    confirm: 'Submit[Ctrl+Enter]',
};

export const useI18n = (): I18n => {
    //get lang
    const lang = navigator.language;
    switch (lang) {
        case 'zh-CN':
            return zhCN;
        case 'en-US':
            return enUS;
        default:
            return enUS;
    }
}
