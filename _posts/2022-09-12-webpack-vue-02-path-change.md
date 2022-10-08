---
layout: post
title:  webpack vue 子目录路径更改 publicPath
date:  2022-10-01 09:22:02 +0800
categories: [JS]
tags: [js, error, npm, sh]
published: true
---

# 说明

1：默认情况下，Vue CLI 会默认你的应用是被部署在一个域名的根路径上。例如 https://www.my-app.com/。

2：需求需要你的应用被部署在一个子路径上，例如如果你的应用路径改为 https://www.my-app.com/my-app/。

3：此时打包后资源路径也会增加子路径。例如由https://www.my-app.com/assets/js/app.js改为https://www.my-app.com/my-app/assets/js/app.js

4：此外前端的页面路径也增加子路径。例如页面路径由https://www.my-app.com/test改为https://www.my-app.com/my-app/test

5：开发、测试、生产的子路径各不相同。例如开发子路径：my-app-dev；测试子路径：my-app-test；生产子路径my-app

上述情况都需要修改设置 publicPath，具体内容如下：

# 前端工程配置

## 一：环境配置

为了满足开发、测试、生产的子路径各不相同，且不需要每次打包时调整，故而在env文件中增加相关配置

解析不同环境打包配置文件具体参考webpack优化系列一：

[webpack不同环境打包配置](https://blog.csdn.net/duanhy_love/article/details/122404581?spm=1001.2014.3001.5501)


- 新建 `.env.dev` 文件

```
VUE_APP_NODE_ENV = 'dev'
VUE_APP_BASE_UPL='/my-app-dev/' // 必须前后斜杠都有
// 其他所需配置都可在此定义
```

- 新建 `.env.test` 文件

```
VUE_APP_NODE_ENV = 'test'
VUE_APP_BASE_UPL='/my-app-test/'
// 其他所需配置都可在此定义
```

- 新建 `.env.prod` 文件

```
VUE_APP_NODE_ENV = 'prod'
VUE_APP_BASE_UPL='/my-app/'
// 其他所需配置都可在此定义
```

## 修改vue.config.js配置

部署应用包时的基本 URL，前端资源路径增加子目录

```js
module.exports = {
  // 基本路径 
  publicPath: process.env.VUE_APP_BASE_UPL,
}
```

## 修改router配置

前端路径中增加子目录

```js
export default new Router({
    mode: 'history',
    base: process.env.VUE_APP_BASE_UPL,
    routes:[
        {
            path: '/home',
            name: 'home',
            component: () => import('@/components/home.vue')
        }
    ]
})
```

## 接口请求配置

- 需要将后端请求也加上子目录

- 若请求直接用的真实ip则只修改前端

- 若请求调用的是虚拟域名，则需要修改域名及nginx

- 请求url，例如https://www.my-app.com/my-app/web/message/view/unread

## 前端调整

直接在各环境配置域名的部分增加子目录即可，配置如上述环境配置

## nginx配置

```
location / {
    root   /usr/share/nginx/html/dist;  # 存放dist
    index  index.html index.htm;
    try_files $uri $uri/  /index.html;  # 解决history路由页面刷新404问题
    # 若上面方法不行则可增加如下配置
    if (!-e $request_filename) { 
      rewrite ^/(.*) /index.html last;
    break;
}
    
}
# 配置与后端服务器地址的映射
location ^~ /my-app-dev/ {
    proxy_pass  http://172.17.0.2:8080/my-app-dev/;
}
location ^~ /my-app-test/ {
    proxy_pass  http://172.17.0.2:8080/my-app-test/;
}
 location ^~ /my-app/ {
    proxy_pass  http://172.17.0.2:8080/my-app/;
}
```



# 参考资料

[webpack优化系列三：vue子目录路径更改---publicPath](https://blog.csdn.net/duanhy_love/article/details/125554120)


* any list
{:toc}