/*
 * Copyright (c) 2025 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-04-06 15:54:15
 * @FilePath     : /dev.user.js
 * @LastEditTime : 2025-01-08 15:11:53
 * @Description  : 
 */
/*  globals GM */

'use strict';

(function () {
  const url = `http://localhost:%PORT%/bundle.user.js?${Date.now()}`
  new Promise(function loadBundleFromServer(resolve, reject) {
    const req = GM.xmlHttpRequest({
      method: 'GET',
      url: url,
      onload: function (r) {
        if (r.status !== 200) {
          return reject(r)
        }
        resolve(r.responseText)
      },
      onerror: e => reject(e)
    })
    if (req && 'catch' in req) {
      req.catch(e => { /* ignore */ })
    }
  }).catch(function (e) {
    const log = function (obj, b) {
      let prefix = 'loadBundleFromServer: '
      try {
        prefix = GM.info.script.name + ': '
      } catch (e) { }
      if (b) {
        console.log(prefix + obj, b)
      } else {
        console.log(prefix, obj)
      }
    }
    if (e && 'status' in e) {
      if (e.status <= 0) {
        log('Server is not responding')
        GM.getValue('scriptlastsource3948218', false).then(function (src) {
          if (src) {
            log('%cExecuting cached script version', 'color: Crimson; font-size:x-large;')
            /* eslint-disable no-eval */
            eval(src)
          }
        })
      } else {
        log('HTTP status: ' + e.status)
      }
    } else {
      log(e)
    }
  }).then(function (s) {
    if (s) {
      try {
        const script = document.createElement('script');
        script.type = 'text/javascript';

        // 使用 Trusted Types API
        if (window.trustedTypes && window.trustedTypes.createPolicy) {
          // 创建一个信任策略
          const policy = window.trustedTypes.createPolicy('userscript-policy', {
            createScript: (string) => string
          });
          // 使用策略创建受信任的脚本
          script.text = policy.createScript(s + `\n//# sourceURL=${url}`);
        } else {
          // 降级处理：如果浏览器不支持 Trusted Types
          script.text = s + `\n//# sourceURL=${url}`;
        }

        document.head.appendChild(script);
        GM.setValue('scriptlastsource3948218', s);
      } catch (error) {
        console.error('Failed to execute script:', error);
      }
    }
  })
})()
