---
layout: post
title: vue-element-admin 入门介绍
date: 2021-08-29 21:01:55 +0800
categories: [WEB]
tags: [vue, element-ui, sh]
published: true
---

# vue-element-admin

vue-element-admin 是一个后台前端解决方案，它基于 vue 和 element-ui实现。

它使用了最新的前端技术栈，内置了 i18n 国际化解决方案，动态路由，权限验证，提炼了典型的业务模型，提供了丰富的功能组件，它可以帮助你快速搭建企业级中后台产品原型。

相信不管你的需求是什么，本项目都能帮助到你。

在线预览：https://panjiachen.github.io/vue-element-admin/#/login?redirect=%2Fdashboard

# 入门

```
# 克隆项目
git clone https://github.com/PanJiaChen/vue-element-admin.git

# 进入项目目录
cd vue-element-admin

# 安装依赖
npm install

# 建议不要直接使用 cnpm 安装依赖，会有各种诡异的 bug。可以通过如下操作解决 npm 下载速度慢的问题
npm install --registry=https://registry.npm.taobao.org

# 启动服务
npm run dev
```

浏览器访问 http://localhost:9527

# 发布

```
# 构建测试环境

npm run build:stage

# 构建生产环境
npm run build:prod
```

# 其它

```
# 预览发布环境效果
npm run preview

# 预览发布环境效果 + 静态资源分析
npm run preview -- --report

# 代码格式检查
npm run lint

# 代码格式检查并自动修复
npm run lint -- --fix
```

# 参考资料

https://github.com/PanJiaChen/vue-element-admin/blob/master/README.zh-CN.md

* any list
{:toc}