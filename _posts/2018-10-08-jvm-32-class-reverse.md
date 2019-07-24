---
layout: post
title: JVM-反编译字节码 decompile bytecode-32
date: 2018-10-08 23:36:46 +0800
categories: [Java]
tags: [jvm, gc, bytecode, sh]
published: true
---

# 背景

有编译，就有反编译。

实际使用中，我们最常见的需求，应该是根据 class 文件，阅读相关的源码信息。


# CFR(Class File Reader)

最近在研究一下class字节码的东西，尝试将class文件反编译成java文件。尝试了很多的工具，比如JD-GUI及其插件以及各种在线反编译，始终感觉不够酷，毕竟我是一个比较依赖终端的人，所以尝试找一些能否在终端可以实现反编译的工具。

还是Google好，很快就找到了一个很满意的工具。

它是一个jar包

名称叫做 CFR(Class File Reader)

支持反编译 class 文件和 jar 包

## 反编译 class 文件

```
java -jar ~/Documents/scripts/cfr-0.139.jar JavaTest.class
```

```java
/*
 * Decompiled with CFR 0.139.
 */
import java.io.PrintStream;

public class JavaTest {
    public void functionOne() {
        System.out.println("functionOne");
    }

    public void functionTwo() {
        System.out.println("functionTwo");
    }
}
```

## 反编译jar包

```
java -jar ~/Documents/scripts/cfr-0.139.jar ~/Documents/scripts/cfr-0.139.jar --outputdir /tmp/outputdir
Processing org.benf.cfr.reader.api.CfrDriver
Processing org.benf.cfr.reader.api.ClassFileSource
Processing org.benf.cfr.reader.api.OutputSinkFactory
Processing org.benf.cfr.reader.api.SinkReturns
Processing org.benf.cfr.reader.bytecode.analysis.opgraph.Graph
...
```

执行上述命令结束后，从输出目录(outputdir)下就能找到对应的java文件了。

# 参考资料

[终端反编译字节码利器 CFR](https://droidyue.com/blog/2019/02/24/decompile-class-file-command-line/)

[cfr](http://www.benf.org/other/cfr/index.html)

* any list
{:toc}