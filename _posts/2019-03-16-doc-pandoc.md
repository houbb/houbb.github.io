---
layout: post
title: PanDoc-文档类型转换神器
date:  2019-3-16 12:15:10 +0800
categories: [Doc]
tags: [doc, markdown, tool, sh]
published: true
---

# 情景引入

手写了一个生成 markdown 格式文档的工具。

但是公司有时候需要 word 类型的文档，有时候我们又需要 pdf 格式的文档。

## 方式一：自己造轮子

为每一种转换都写一种实现，但是很消耗时间。

而且看了 word 的相关生成，也不是很友好。

会导致迭代周期变得非常长。

## 方式二：让专业的人做专业的事

以前使用过 Typora 等 md 编辑器，知道 markdown 可以导出各种类型的文件。

我就没必要再重复一次。

# PanDoc

Typora 等诸多文件的转换，底层都是使用了 PanDoc

## 简介

[PanDoc](https://github.com/jgm/pandoc) is a Haskell library for converting from one markup format to another, and a command-line tool that uses this library.

# 入门使用

## 安装

直接 [Github](https://github.com/jgm/pandoc/releases) 上下载对应的 release 版本。

或者去官网下载。

安装比较简答，不赘述。

## 测试

```
$   pandoc -i XXX.md -o XXX.docx
```

-i 表示输入文件

-o 表示输出文件

# 其他

## Typora

如果你不想使用命令行，可以尝试 [Typora](https://www.typora.io/)

## Writage

[writage](http://www.writage.com/) 是一款 office word 插件。

用于 word 和 markdown 之间的转换比较方便。

# 思考

## 不忘初心

本来想写一个文档，总是被各种技术和眼界限制。

觉得最初的目的不要忘记了。

## 核心竞争力

自己把各种都实现，其实是 ROI 很低的一件事情。

专业的事情已经有人做了，我们只需要使用即可。

社会分工协作，方能完成大事。


# Windows 使用

## 安装

```
pandoc -h
```

有提示说明安装成功。

## pandoc 添加到 path

rcc不是内部或外部命令
搜索下rcc.exe二进制文件的位置，
然后将该路径添加到path环境变量中。

在cmd中输入path，显示当前的环境变量。

然后 

```
path = %path%;C:\Program Files\Pandoc;
```

回车即可。


## 测试

```
λ pandoc -i "D:\_github\write\blogs\比 spring BeanUtils 性能更好的属性拷贝框架.md" -o "D:\_github\write\blogs\比 spring
 BeanUtils 性能更好的属性拷贝框架.pdf"
pdflatex not found. Please select a different --pdf-engine or install pdflatex
```

缺少 pdflatex

# bat 脚本乱码

bat脚本在批处理的时候被经常用到，但是有时候不正确的使用，会导致在bat脚本中的中文，运行起来的时候显示为乱码，这个让人很不爽，下面分享下自己解决这个问题的方法。

好吧，其实造成这个问题的原因很简单。

编辑批处理文件时，以ANSI方式编辑即可。若以别的方式（如UTF-8）编辑了批处理，转换成ANSI格式即可。

windows自带的记事本保存文件时即可选择编码方式

可以看到中文都可以显示正常了。

## java 执行

```java
String cmd = String.format("C:\\Program Files\\Pandoc\\pandoc -i \"%s\" -o \"%s\"",
                    original, target);
System.out.println(cmd);
Runtime.getRuntime().exec(cmd);
```

## 循环生成代码

```java
package com.github.houbb.test;

import com.lowagie.text.DocumentException;
import com.qkyrie.markdown2pdf.internal.exceptions.ConversionException;
import com.qkyrie.markdown2pdf.internal.exceptions.Markdown2PdfLogicException;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * <p> project: markdown-transfer-Main </p>
 * <p> create on 2019/12/29 11:01 </p>
 *
 * @author Administrator
 * @since 1.0.0
 */
public class Main {

    public static void main(String[] args) throws Markdown2PdfLogicException, ConversionException, IOException, DocumentException {
        List<String> stringList = getFiles();
        for(String md : stringList) {
            if(md.endsWith("md")) {
                execute(md);
            }
        }
    }

    public static void execute(final String path) {
        try {
            final String dirPath = "D:\\_github\\write\\blogs\\";
            String original = dirPath+path;
            String target = dirPath+path.split("\\.")[0]+".docx";
            String cmd = String.format("C:\\Program Files\\Pandoc\\pandoc -i \"%s\" -o \"%s\"",
                    original, target);

            System.out.println(cmd);
            Runtime.getRuntime().exec(cmd);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static List<String> getFiles() {
        final String dirPath = "D:\\_github\\write\\blogs\\";

        File dir = new File(dirPath);

        File[] files = dir.listFiles();

        List<String> stringList = new ArrayList<>(files.length);

        for(File file : files) {
            stringList.add(file.getName());
        }

        return stringList;
    }

}
```

* any list
{:toc}