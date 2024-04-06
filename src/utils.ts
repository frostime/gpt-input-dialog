/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-08-16 17:05:29
 * @FilePath     : /src/utils.ts
 * @LastEditTime : 2024-04-06 15:46:51
 * @Description  : 
 */
// export async function httpRequest<CONTEXT_TYPE>(payload: IHttpRequestPayload<CONTEXT_TYPE>): Promise<GM_Types.XHRResponse<any>> {
//     return new Promise((resolve, reject) => {
//         GM_xmlhttpRequest({
//             ...payload,
//             onload: response => resolve(response),
//             onerror: response => reject(response),
//             ontimeout: response => reject(response)
//         });
//     });
// }

export function updateStyleSheet(id: string, cssText: string) {
    let style = document.getElementById(id);
    if (!style) {
        style = document.createElement('style');
        style.id = id;
        document.head.appendChild(style);
    }
    style.textContent = cssText;
}

export const queryOfficalTextarea = (): HTMLTextAreaElement | null => {
    const q = 'div.ChatMessageInputContainer_inputContainer__s2AGa textarea';
    const textarea: HTMLTextAreaElement = document.querySelector(q);
    return textarea;
}
