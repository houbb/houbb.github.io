---
layout: post
title: java doc 文档注释最佳实践
date:  2019-02-12 21:31:37 +0800
categories: [DevOps]
tags: [DevOps, java, doc, best-practise, sh]
published: true
excerpt: java doc 文档注释最佳实践
---

# 为什么要写注释？

## 给别人看

## 给自己看

# java 文档注释?

标签	作用域	说明
@author	类	标明开发该类模块作者
@version	类	标明该类模块的版本
@see	类, 属性, 方法	参考转向(相关主题)
@param	方法	对方法中某参数的说明
@return	方法	对方法返回值的说明
@exception	方法	抛出的异常类型
@throws	方法	与@exception相同
@deprecated	方法	不建议使用该方法

# 怎么能写好注释?

## 什么情况需要

- 典型算法必有注释

- 代码不明晰处必有注释

- 在循环/逻辑分支组成的代码中加注释

- 为他人提供的接口必有注释

- 在代码修改处加修改标识

# 如何生成注释

java doc 插件

手写

# 拓展阅读

[swagger-ui](https://houbb.github.io/2016/12/22/swagger) 基于注解的 java 文档生成。

# 自己设计一套注释生成插件

[idoc](https://github.com/houbb/idoc)

# 参考资料 

https://yq.aliyun.com/articles/455242

* any list
{:toc}