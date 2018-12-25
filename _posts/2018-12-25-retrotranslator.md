---
layout: post
title: Retrotranslator jdk version transfer
date: 2018-12-25 11:29 +0800
categories: [Web]
tags: [web, java, standard, sh]
published: true
excerpt: Retrotranslator jdk 版本转换利器
---

# Retrotranslator

[Retrotranslator](http://retrotranslator.sourceforge.net/) 是一个使Java应用程序与Java 1.4，Java 1.3和其他环境兼容的工具。 

它支持J2SE 1.4和J2SE 1.3上的所有Java 5.0语言功能和Java 5.0 API的重要部分。 

在其他Java环境中，仅支持不依赖于新API的Java 5.0功能。 

Retrotranslator使用ASM字节码操作框架来转换已编译的Java类和Java 5.0并发实用程序的后端以模拟Java 5.0 API。

# 如何从命令行使用Retrotranslator？

1、下载并解压缩二进制分发文件Retrotranslator-n.n.n-bin.zip，其中n.n.n是最新的Retrotranslator版本号。

2、使用Java 5.0或Java 6编译您的类并将它们放入某个目录，例如 我的课程。

3、 转到解压缩的目录并执行：

```
java -jar retrotranslator-transformer-n.n.n.jar -srcdir myclasses
```

4、使用适当的选项来验证结果并进行故障排除，例如 -verify，-classpath，-advanced和-smart。

如果使用Java 5.0 API，请将retrotranslator-runtime-n.n.n.jar和backport-util-concurrent-n.n.jar放入应用程序的类路径中。
在Java 1.4上照常运行或调试应用程序。

## 命令行语法：

```
java -jar retrotranslator-transformer-n.n.n.jar <options>
```

要么

```
java -cp retrotranslator-transformer-n.n.n.jar net.sf.retrotranslator.transformer.Retrotranslator <options>
```

# 个人感觉

这个技术的思路仍然是可以使用的，但是看起来比较老了。

现在 jdk 的版本迭代太快，要维护个这样的项目代价还是比较大的。

作为一种思想，了解即可。

# 参考资料

[Retrotranslator使用简介(JDK1.5->1.4）](http://www.cnblogs.com/lvdongjie/p/7772338.html)

* any list
{:toc}