/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-08-16 17:05:29
 * @FilePath     : /src/utils.ts
 * @LastEditTime : 2023-08-16 17:18:46
 * @Description  : 
 */
async function httpRequest<CONTEXT_TYPE>(payload: IHttpRequestPayload<CONTEXT_TYPE>): Promise<GM_Types.XHRResponse<any>> {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            ...payload,
            onload: response => resolve(response),
            onerror: response => reject(response),
            ontimeout: response => reject(response)
        });
    });
}