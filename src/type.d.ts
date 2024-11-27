/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-08-16 17:13:02
 * @FilePath     : /src/type.d.ts
 * @LastEditTime : 2024-07-01 17:00:48
 * @Description  : 
 */
interface IHttpRequestPayload<CONTEXT_TYPE> {
    method?: "GET" | "HEAD" | "POST" | "PUT",
    url?: string,
    headers?: { readonly [key: string]: string },
    data?: string,
    binary?: boolean,
    timeout?: number,
    context?: CONTEXT_TYPE,
    responseType?: "arraybuffer" | "blob" | "json",
    overrideMimeType?: string,
    anonymous?: boolean,
    fetch?: boolean,
    username?: string,
    password?: string,
}

interface IPlatform {
    name: string;
    matchUrl?: (url: string) => boolean;
    baseUrl: string | string[];
    selector: {
        officialTextarea: string;
        submitButton: string;
        chatSessionTitle?: string;
    };
    css: {
        backgroundColor: string;
        primaryColor: string;
    };
    createTextarea: () => HTMLTextAreaElement;
    getText?: () => string;
    setText?: (text: string) => void;
    getSubmitButton?: () => HTMLButtonElement;
}
