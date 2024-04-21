/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-08-16 17:13:02
 * @FilePath     : /src/type.d.ts
 * @LastEditTime : 2024-04-21 16:37:31
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
    baseUrl: string;
    selector: {
        officialTextarea: string;
        submitButton: string;
        chatSessionTitle: string;
    };
    css: {
        backgroundColor: string;
        primaryColor: string;
    };
    createTextarea: () => HTMLTextAreaElement;
}
