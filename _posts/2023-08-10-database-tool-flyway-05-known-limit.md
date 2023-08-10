---
layout: post
title: database tool-05-Known Parser Limitations 已知到的转换异常
date:  2023-08-10 +0800
categories: [Database]
tags: [database, migrate, sh]
published: true
---

# 已知解析器限制

我们经常遇到有关 Flyway 解析器无法处理某些 sql 脚本的错误。

创建此页面是为了记录一些已知问题、怪异现象和解决方法。

如果所有解决方法都不适合您，或者您认为该解决方法出于任何原因不适合，请创建一个包含复制步骤的 GitHub 问题，包括文件内容，或者在可能的情况下附加文件本身。

# 控制流关键字处理

如果您看到任何错误消息“分隔符已在语句内更改”、“语句不完整”或“无法将块深度减小到 0 以下”，则可能是因为 Flyway 的控制流处理遇到错误。 这可能是由多种不同的原因造成的：

- 可能是因为尚不支持特定关键字（在这种情况下，请创建一个 Github 问题）。

- 这可能是因为您尚未关闭该块（例如，IF 未由 END IF 关闭）。

- 这可能是因为您使用控制流关键字作为变量名（Flyway 不支持）。 控制流关键字最常见的是 BEGIN 和 END，但也可能包括 IF、CASE、REPEAT、WHILE 等，具体取决于数据库类型。 

在这种情况下，请将变量名称更改为不用于控制流的变量名称。

## 多行注释

我们经常会遇到嵌套的多行注释，比如 `/* ... /* ... */ ... */`。 

Flyway 要求所有多行注释都关闭，因此 `/* ... /* ... */` 将无效。

# 参考资料

https://documentation.red-gate.com/fd/known-parser-limitations-184127224.html

* any list
{:toc}d