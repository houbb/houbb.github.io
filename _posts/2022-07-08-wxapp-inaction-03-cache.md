---
layout: post
title:  微信公众号项目开发实战-03-cache 微信浏览器缓存问题
date:  2022-07-08 09:22:02 +0800
categories: [Wechat]
tags: [wechat, sh]
published: true
---



# 前端 Nginx 配置

## 微信的缓存

微信页面缓存问题

经过实际认证，发现微信确实存在缓存问题。

**需要前端打包添加指纹， nginx 添加 no cache 等**

对付微信的浏览器缓存，首先是 css/js/html/image 等静态资源文件打包的时候指定版本号。

这个一般的 webpack 等打包时已经自带了。

但是实际发现还是会存在问题，那就是在 nginx 处理时，指定不做缓存。

如下：

```conf
server {
    listen  8080;
    server_name  localhost;

    # gzip config
    gzip on;
    gzip_min_length 1k;
    gzip_comp_level 9;
    gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
    gzip_vary on;
    gzip_disable "MSIE [1-6]\.";

    root /usr/share/nginx/html/;
    index  index.html  index.htm  web_ok.html;

    location /wxapp-front {
        alias /usr/share/nginx/html/wxapp-front;
        index index.html index.htm;
        try_files $uri $uri/ /wxapp-front/index.html;
        # kill cache
        add_header Last-Modified $date_gmt;
        add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
        if_modified_since off;
        expires off;
        etag off;
    }

    location ~ .*\.(gif|jpg|jpeg|png|bmp|swf|ico|js|css)$ {
        access_log    off;
    }

    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

最核心的配置：

```
# kill cache
add_header Last-Modified $date_gmt;
add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
if_modified_since off;
expires off;
etag off;
```

------------------------------------------------------------------------------------------------------------

微信公众号的消息推送

微信公众号的小程序跳转

- 小程序部分机型无法跳转

- 如何兼容环境

- 测试

微信公众号的踩坑指南

公众号 ios12 系统无法接受信息

公众号 

# 参考资料

## 微信缓存问题


https://blog.csdn.net/woyidingshijingcheng/article/details/89926990

浅谈微信页面入口文件被缓存解决方案:  https://www.jb51.net/article/148249.htm

* any list
{:toc}