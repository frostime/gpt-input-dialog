/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-08-16 17:13:02
 * @FilePath     : /src/type.d.ts
 * @LastEditTime : 2023-08-16 17:15:04
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