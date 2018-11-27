---
layout: post
title: Mybaits in Practice
date: 2018-11-27 09:14:43 +0800
categories: [Mybaits]
tags: [mybatis, in-practice, sh]
published: true
excerpt: Mybaits 实战使用
---

# Mybaits 报错：Invalid bound statement (not found): 

## 原因

1. 方法 mapper.java 和 mapper.xml 不匹配

2. mapper.xml 中的类型，namespace，Type 等属性配置错误

3. spring 整合 mybatis 扫描包，指定扫描 package 错误。

4. mapper 没有被生成到 target 下面，需要配置 maven 的文件信息插件。

5. 今天遇到的是 idea 在创建 `com.github.houbb` 这样的文件夹时，他可能创建的只是一个文件夹 `/com.github.houbb` 而不是预期的 `com/github.houbb`

* any list
{:toc}