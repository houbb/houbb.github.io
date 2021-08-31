---
layout: post
title: ivew-admin 入门介绍
date: 2021-08-29 21:01:55 +0800
categories: [WEB]
tags: [vue, element-ui, sh]
published: true
---

# 简介

iView-admin是iView生态中的成员之一，是一套采用前后端分离开发模式，基于Vue的后台管理系统前端解决方案。

iView-admin2.0脱离1.x版本进行重构，换用Webpack4.0 + Vue-cli3.0作为基本开发环境。

内置了开发后台管理系统常用的逻辑功能，和开箱即用的业务组件，旨在让开发者能够以最小的成本开发后台管理系统，降低开发量。

## 目录结构

```
.
├── config  开发相关配置
├── public  打包所需静态资源
└── src
    ├── api  AJAX请求
    └── assets  项目静态资源
        ├── icons  自定义图标资源
        └── images  图片资源
    ├── components  业务组件
    ├── config  项目运行配置
    ├── directive  自定义指令
    ├── libs  封装工具函数
    ├── locale  多语言文件
    ├── mock  mock模拟数据
    ├── router  路由配置
    ├── store  Vuex配置
    ├── view  页面文件
    └── tests  测试相关
```

# 快速开始

从github获取最新的iView-admin代码，使用如下命令获取2.0分支最新代码：

```
git clone https://github.com/iview/iview-admin.git -b 2.0
```

然后进入项目根目录

```
cd iview-admin
```

安装依赖并运行项目

```
npm install
npm run dev
```

然后只需要等待编译结束后其自动打开页面

# 参考资料

https://lison16.github.io/iview-admin-doc/#/%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B

* any list
{:toc}