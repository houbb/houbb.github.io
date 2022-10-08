---
layout: post
title:  webpack vue 子目录路径更改 publicPath
date:  2022-10-01 09:22:02 +0800
categories: [JS]
tags: [js, error, npm, sh]
published: true
---

# 前端

webpack的env一般分为develop、test以及production，每个环境可能所需配置都不一样，比如请求的后端服务器等等

若每次打包单独修改，那可能太过繁琐，最重要可能打包时忘记，造成不必要的损失

故而，建议将webpack区分不同环境单独配置好，打包时使用不同命令即可

# 环境配置

新建 `.env.dev` 文件

```
NODE_ENV = 'dev'
VUE_APP_BASE_UPL='开发环境api'
// 其他所需配置都可在此定义
```

新建 `.env.test` 文件

```
NODE_ENV = 'test'
VUE_APP_BASE_UPL='测试环境api'
// 其他所需配置都可在此定义
```

新建 `.env.prod` 文件

```
NODE_ENV = 'prod'
VUE_APP_BASE_UPL='生产环境api'
// 其他所需配置都可在此定义
```

# 二：请求配置

新建 request.js 文件

主要是 `const baseURL = process.env.VUE_APP_BASE_UPL` 这句话。


```js
// 此为移动端配置，引用了vant组件，如要换成其他组件请修改配置
// import Vue from 'vue'
import axios from 'axios'
import qs from 'qs'
import { isEmpty, isFormData, filterObj } from '@/utils/function.js'
import { Toast, Dialog } from 'vant'

let pending = [] // 声明一个数组用于存储每个ajax请求的取消函数和ajax标识
let CancelToken = axios.CancelToken

const TIMEOUT = 3000
const baseURL = process.env.VUE_APP_BASE_UPL

const getErrorString = (errorObj, defaultStr = '') => {
    let errStr = defaultStr
    // 对象
    if (typeof errorObj === 'object') {
        if (errorObj.response && errorObj.response.status) {
            errStr = `${errorObj.response.status}-${errorObj.response.statusText}`
        } else if (errorObj.message && typeof errorObj.message === 'string') {
            errStr = `${errorObj.message} 无返回或非正常操作`
        }
    } else if (typeof errorObj === 'string') {
        errStr = errorObj
    }
    return errStr
}

const removePending = ever => {
    for (const p in pending) {
        if (pending[p].u === ever.url + '&' + ever.method) {
            // 当当前请求在数组中存在时执行函数体
            pending[p].f() // 执行取消操作
            pending.splice(p, 1) // 把这条记录从数组中移除
        }
    }
}

function handleResponse (response, options) {
    if (!response || !options) return
    if (options.showLoading && options.data && !options.data.hideLoading) {
        Toast.clear()
    }
    if (response.status === 200) {
        const data = response.data
        const contentType = response.headers['content-type']
        if (data.code === '40001') {
            Dialog.alert({
                message: data.message || '内部错误'
            }).then(() => {
            })
            return
        }
        if (contentType && contentType.indexOf('json') !== -1) {
            if (response.data.constructor === window.Blob) {
                const reader = new FileReader()
                reader.readAsText(response.data)
                reader.addEventListener('loadend', function () {
                    const res = JSON.parse(reader.result)
                    Toast(`${response.data.message || '未知异常'}`)
                })
            } else {
                const data = eval(response.data)
                const { success, message } = data
                if (!success && !options.noToast) {
                    Toast(`${response.data.message || '未知异常'}`)
                }
            }
        }
    } else if (response.status === 401 && options.showLoading) {
        Toast(`${response.data.message || '未知异常'}`)
    } else if (response.status > 401) {
        Toast(`${response.data.message || '未知异常'}`)
    } else if (response.status === '504') {
        Toast('请求错误 网络异常')
    }
}
const fetch = options => {
    const {
        method = 'get',
        data,
        url,
        headers,
        config
    } = options
    // const { sessionId } = store.state.login.user
    const sessionId = '0lYo8du8U7KWFRhl_m1Oi9HfpAQ_9HeQnzkNlGr6lCjlQNT6BcDC!-1900339258!1628479544252'

    const axiosConfig = {
        timeout: TIMEOUT,
        baseURL,
        withCredentials: true,
        headers: {
            ...headers,
            'session': sessionId
        }
    }
    const instance = axios.create(axiosConfig)
    instance.interceptors.request.use(
        config => {
            // 判断是否需要显示满屏loading遮罩
            if (options.showLoading && options.data && !options.data.hideLoading) {
                Toast.loading({
                    mask: true,
                    loadingType: 'spinner',
                    // message: '加载中...',
                    duration: 30000,
                    getContainer: '#app'
                })
            }
            removePending(config) // 在一个ajax发送前执行一下取消操作
            config.cancelToken = new CancelToken(c => {
                // 这里的ajax标识我是用请求地址&请求方式拼接的字符串，当然你可以选择其他的一些方式
                pending.push({ u: config.url + '&' + config.method, f: c })
            })

            return config
        },
        err => {
            return Promise.reject(new Error(getErrorString(err, 'request错误')))
        }
    )

    instance.interceptors.response.use(
        response => {
            try {
                handleResponse(response, options)
                // ------------------------------------------------------------------------------------------
                removePending(options.config) // 在一个ajax响应后再执行一下取消操作，把已经完成的请求从pending中移除
                // -------------------------------------------------------------------------------------------
            } catch (err) { }
            return response
        },
        err => {
            handleResponse(err.response, options)
            return Promise.reject(new Error(getErrorString(err, 'response错误')))
        }
    )
    const filterData = isFormData ? data : filterObj(data)
    switch (method.toLowerCase()) {
        case 'get':
            return instance.get(
                `${url}${!isEmpty(data) ? `?${qs.stringify(data)}` : ''}`,
                config
            )
        case 'delete':
            return instance.delete(url, { data: filterData })
        case 'head':
            return instance.head(url, filterData)
        case 'post':
            return instance.post(url, filterData, config)
        case 'put':
            return instance.put(url, filterData, config)
        case 'patch':
            return instance.patch(url, filterData)
        default:
            return instance(options)
    }
}

export default function request (options) {
    return new Promise((resolve, reject) => {
        fetch(options)
            .then(response => {
                resolve(response.data)
            })
            .catch(err => {
                reject(err)
            })
    })
}

// function.js文件配置
export let isEmpty = obj => {
    for (const el in obj) {
        return false
    }

    return true
}
// 过滤调对象中的一些值为空的属性
export let filterObj = obj => {
    let newObj = {}
    for (const key in obj) {
        if (obj[key] === 'undefined' || obj[key] === null || obj[key] === '') {
            continue
        } else {
            newObj[key] = obj[key]
        }
    }
    return newObj
}
// 是否为formdata
export let isFormData = v => {
    return Object.prototype.toString.call(v) === '[object FormData]'
}
```

# 三：打包配置

在 `package.json` 中修改配置

```json
"scripts": {
    "serve": "vue-cli-service serve --open",
    "start": "npm run serve",
    "dev": "npm run start",
    "build": "vue-cli-service build",
    "build:dev": "vue-cli-service build --mode dev", // 开发环境打包
    "build:test": "vue-cli-service build --mode test", // 测试环境打包
    "build:prod": "vue-cli-service build --mode prod", // 生产环境打包
    "lint": "vue-cli-service lint"
},
```

主要是指定环境。

# 四：相关知识：获取环境配置

```html
// 在index.html中获取环境配置相关
'<%= VUE_APP_BASE_UPL %>'
// 在其他文件中获取环境配置相关，例如上面request中
process.env.VUE_APP_BASE_UPL
```

# 拓展阅读

1：webpack优化系列一：webpack不同环境打包配置

2：webpack优化系列二：Vue配置compression-webpack-plugin实现Gzip压缩

3：webpack优化系列三：vue子目录路径更改—publicPath

4：webpack优化系列四：vue打包后生成的chunk-vendors文件过大,利用SplitChunks插件，分离chunk

ps: 知道这个技巧即可，后续实战使用。

# 参考资料

[webpack优化系列一：webpack不同环境打包配置](https://blog.csdn.net/duanhy_love/article/details/122404581)

[Vue中.env|.env.development|.env.production文件说明](https://blog.csdn.net/weixin_46872121/article/details/124231380)

* any list
{:toc}