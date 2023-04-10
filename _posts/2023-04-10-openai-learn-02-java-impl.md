---
layout: post
title: OPENAI 学习笔记-02-java 实现
date:  2023-04-10 +0800
categories: [AI]
tags: [openai, sh]
published: true
---

# 获取 api token

1. 去 openai 官网注册

2. 去[个人中心](https://platform.openai.com/account/api-keys)创建一个 api keys 。

3. 记住这个 key

# java 实现

## client 包

参考：

> [https://github.com/TheoKanning/openai-java](https://github.com/TheoKanning/openai-java)

## maven 依赖

```xml
<dependency>
    <groupId>com.theokanning.openai-gpt3-java</groupId>
    <artifactId>api</artifactId>
    <version>0.12.0</version>
</dependency>
<dependency>
    <groupId>com.theokanning.openai-gpt3-java</groupId>
    <artifactId>client</artifactId>
    <version>0.12.0</version>
</dependency>
<dependency>
    <groupId>com.theokanning.openai-gpt3-java</groupId>
    <artifactId>service</artifactId>
    <version>0.12.0</version>
</dependency>
```

不过测试的时候一直超时。

# 参考资料

https://www.cnblogs.com/Studywith/p/17205139.html

* any list
{:toc}