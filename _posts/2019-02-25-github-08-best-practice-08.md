---
layout: post
title: Github 开源项目最佳实践-08
date:  2019-2-25 14:33:11 +0800
categories: [Tool]
tags: [github, best-practice, sh]
published: true
---

# 模块规范

*-api 接口

*-annotation 注解

*-core 核心实现

*-common 通用实现

*-test 测试模块

所有的 util 全部抽取到 heaven 模块。


# 包命名规范

## 统一前缀

com.github.houbb

## 模块规范

比如 jdbc 就直接对应 jdbc 包

jdbc-api 对应 `jdbc.api` 转换为对应的小写。

## 常见包

- constant/enums

常量

- util

工具包

- config/bs

config 配置包

bs 引导包

- support 

相关的支持实现

- api/core/impl

api 定义接口

core 核心实现

impl 相关的实现类

- exception

异常类

# 类命名规范

## 常量类

*Const 常量
 
*Enum 枚举

## 工具类

*Bs 引导类

*s 工具类-外部

*Util 工具类-内部

## 接口篇

I* 接口

Base* 基础父类

Abstract* 抽象实现类

*Adaptor 适配器实现

Default* 默认实现

## 配置篇

*Context 上下文

*Config 配置

## 传输层

Vo 页面展示对象

Dto 数据传输对象

Req/Resp 请求/响应

* any list
{:toc}