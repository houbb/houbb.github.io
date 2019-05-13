---
layout: post
title: Github 开源项目 jdk7 编译改造-02
date:  2019-2-25 14:33:11 +0800
categories: [Tool]
tags: [github, sh]
published: true
excerpt: Github 开源项目
---


# 改造目标1

使用 jdk7 重新编译 jdk7 相关的项目。

## 基础

- maven-archetype  这个不用处理

Heaven  Done

API         Done

log-integration     Done      
 
# 测试相关 

- JunitPerf

性能测试框架

- gen-maven-plugin

这个框架拆分为两个框架：

1. 测试生成 (gent-plugin)

2. 注释生成 (genm-plugin)

3. 文档生成 (idoc)

- DataFactory

为单元测试提供初始化数据。

缺少：只有结果，无法让结果值和对象初始化值联系起来。


# 框架

https://github.com/houbb/compress  Done

https://github.com/houbb/opencc4j   Done

https://github.com/houbb/markdown-toc Done

# 文档相关

- Charming

希望对文档进行格式化，开发中。。。

- idoc

生成接口文档。开发中。。。


* any list
{:toc}