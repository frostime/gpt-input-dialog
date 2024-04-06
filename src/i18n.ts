interface I18n {
    cancel: string;
    fill: string;
    confirm: string;
};

const zhCN: I18n = {
    cancel: '取消',
    fill: '填充',
    confirm: '提交',
};

const enUS: I18n = {
    cancel: 'Cancel',
    fill: 'Fill',
    confirm: 'Submit',
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
