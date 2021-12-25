---
layout: post
title: CentOS7 vue build 部署到 tomcat 子目录实战笔记
date: 2021-08-02 21:01:55 +0800
categories: [System]
tags: [system, maven, sh]
published: true
---


# 说明

在上一篇我们把 vue 应用的根目录解决之后，有一个子应用希望部署到 tomcat 的子目录。

我想这还不简单。

但是实际发现，页面打开空白，console 没有报错。

## 排查

经历了 vue 的 tomcat ROOT 部署，我再次确认了 `vue.config.js`

```
publicPath: './',
```

这里已经改成 `./` 了。

## 问题原因

查了一堆资料，发现需要调整一下 `VueRouter` 中的配置信息。

```js
const router = new VueRouter({
  mode: 'history',
  base: process.env.NODE_ENV === 'production' ? '/what-happened-h5/' : '/',
  routes: [{
    path: '/',
    name: 'mainPage',
    component: MainPage,
    children: pages,
    meta: {
      requiresAuth: true // 访问该路由时需要判断是否登录
    }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      requiresAuth: false // 访问该路由时需要判断是否登录
    }
  }
  ]
});
```

只修改了 `base: process.env.NODE_ENV === 'production' ? '/what-happened-h5/' : '/',` 这一句，让访问生产的资源路径使用 `what-happened-h5`。

what-happened-h5 为我们的应用名称。

## 部署验证

修改完成之后，直接部署到 `/usr/share/tomcat/webapps/what-happened-h5`，重启验证成功。

# 参考资料

[vue-cli3如何部署在服务器的tomcat,以及vue.config.js如何配置才能上线（亲测可用）](https://blog.csdn.net/weixin_41272626/article/details/88570885)

[如果要部署到二级目录，将项目内部引用的css、img修改为相对路径](https://www.jianshu.com/p/92037428f5db)

[vue项目如何部署到Tomcat的二级目录](https://blog.csdn.net/hefeng6500/article/details/86750024)

[vue打包项目部署到二级目录](https://www.cnblogs.com/lewis-messi/p/11043546.html)

[vue-cli3搭建的项目打包部署到tomcat下面](https://www.cnblogs.com/zhangkeke/p/11989939.html)

[vuecli3.x 打包部署到子目录相关配置](https://segmentfault.com/a/1190000039089903?utm_source=tag-newest)

[VUE部署到tomcat下访问页面显示空白](https://blog.csdn.net/benbendelove/article/details/114369533)


* any list
{:toc}