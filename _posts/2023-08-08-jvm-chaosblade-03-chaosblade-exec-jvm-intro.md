---
layout: post
title: ChaosBlade-03-Chaosblade-exec-jvm 对 Java 应用实施混沌实验的 chaosblade 执行器
date:  2023-08-08 +0800
categories: [JVM]
tags: [jvm, bytebuddy, bytecode, chaos-engineering, sh]
published: true
---

# Chaosblade-exec-jvm：用于 Java 应用的混沌实验执行器

## 简介

该项目是基于 [jvm-sandbox](https://github.com/alibaba/jvm-sandbox) 的 Chaosblade 执行器，用于通过增强类的方式对 Java 应用进行混沌实验。

实验可以通过 blade CLI 执行，详情请参见 [chaosblade](https://github.com/chaosblade-io/chaosblade) 项目。

## 编译

在项目根目录下，执行以下命令进行编译：

```bash
make
```

编译结果将存储在 `target` 目录中。

## 贡献

我们欢迎每一项贡献，即使只是标点符号的修正。详情请参见 [CONTRIBUTING](CONTRIBUTING.md)。

## 错误报告与反馈

如有错误报告、问题或讨论，请提交 [GitHub Issues](https://github.com/chaosblade-io/chaosblade-exec-jvm/issues)。

联系我们：chaosblade.io.01@gmail.com

Gitter 房间：[chaosblade community](https://gitter.im/chaosblade-io/community)

## 许可

Chaosblade-exec-jvm 采用 Apache License 2.0 许可协议。

完整的许可文本请参见 [LICENSE](LICENSE)。

# 参考资料

https://chaosblade.io/docs

* any list
{:toc}