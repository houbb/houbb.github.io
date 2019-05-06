---
layout: post
title: CSV 文件生成实战
date:  2019-4-16 10:55:13 +0800
categories: [Java]
tags: [java, csv, sh]
published: true
---

# 业务背景

我们经常需要去解析某些文件生成 csv, 比如数据库数据生成 csv。

下面记录一下采坑记录，以后可以借鉴。

# 不同的系统

需要解析一个文件，平时使用 windows 系统。

结果收到的是 *.tar.gz 文件。

## linux 解压方式

你可以把文件上传到 linux 来加压。

流程如下：

### 下载 putty

[putty-64bit-0.71-installer.msi](https://the.earth.li/~sgtatham/putty/0.71/w64/putty-64bit-0.71-installer.msi)

然后安装，我们需要用到一个命令 PSCP

### 复制到 linux 

```
pscp *.tar.gz user@address:/path/
```

可以将文件上传到对应机器的用户目录下面。

### 解压

```
$   gunzip  *.tar.gz
```

or

```
$   tar -xzvf *.tar.gz
```

## windows 解压方式

使用 7zip 解压两次即可。

gzip=>tar=>file 

## java 代码解压方式

当然，你可以使用 java 代码直接解压。

此处不再赘述。

# 需求梳理

## 文件

文件是什么样的？

有没有对应的文档？

使用者希望以什么样的形式生成？

这些问题，需要在解析之前就确认好，不然也是白费力气。

## 设计思路

确认好用户是想要 csv 还是 excel。

如果是 excel 则需要创建对应的对象，你可以参考我原来写的 

[IExcel](https://github.com/houbb/iexcel)

如果是 csv 就可以自己手动去写。

不过写的过程中，还是遇到了不少的坑。

# CSV 采坑记录

## 最佳实践

```java
Writer writer = new FileWriter(targetFileName);
// 手动加上BOM标识
writer.write(new String(new byte[] { (byte) 0xEF, (byte) 0xBB, (byte) 0xBF }));
for(int i = 0; i < allLines.size(); i++) {
    writer.write(allLines.get(i));
    writer.write(System.getProperty("line.separator"));
}
writer.flush();
```

## windows 下的 bom

如果你只是单纯的生成 csv+中文表头。

双击打开的时候，中文可能会乱码。

但是你用存文本打开，发现文件没有问题。

因为 windows excel 需要借助 bom 去识别文件，所以需要这一行：

```java
writer.write(new String(new byte[] { (byte) 0xEF, (byte) 0xBB, (byte) 0xBF }));
```

## 文件生成不全

一开始测试的时候，文件没有生成全。debug 发现内容并没有问题。

感觉莫名其妙。后来想起来，可能是缓冲区造成的。

所以需要这一句

```java
writer.flush();
```

## 文件生成报错

有时候目标文件可能不是 utf-8 的，你可能会遇到下面的报错：

```
java.nio.charset.MalformedInputException: Input length = 1
```

调整下文件读取的代码即可：

比如是 gbk 的话

```java
Charset charset = Charset.forName("GBK");
List<String> stringList = Files.readAllLines(filePath, charset);
```

# excel 生成的一些思考

通畅情况下，excel 根据 bean 去生成，就要写很多 line==>field==>对象 的代码。

后来想想，实际上没有必要。

因为对象只是一个中间临时变量。

## 字段生成

可以直接根据行的解析内容，生成对象字段。下标和名称一一对应。

```java
private String _0;
private String _1;
private String _2;
...
```

## 字段设置

可以直接根据发射设置字段的值，这样反而方便很多。

# 文件遍历的方法

## jdk7 的强大功能

有时候你可能需要遍历某一个文件夹下的所有文件，jdk7 以后这一切都变得非常简单。

## 示例代码

```java
@Override
public List<Path> getAllMatch() throws IOException {
    Path rootPath = Paths.get(Visit.DEFAULT_ROOT_PATH);
    List<Path> stringList = new ArrayList<>();
    Files.walkFileTree(rootPath, new SimpleFileVisitor<Path>() {
        @Override
        public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
            boolean condition = 你的过滤条件;
            if(condition) {
                stringList.add(file);
            }
            return FileVisitResult.CONTINUE;
        }
        @Override
        public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
            return FileVisitResult.CONTINUE;
        }
    });
    return stringList;
}
```

# 代码的灵活性

有时候可能使用者希望文件是单独的，有时候希望放在一起。

所以即使在写最基本的代码，你也应该考虑自己代码实现的灵活性。

# 一些思考

## compress 

压缩算法平时太依赖于工具，想想这并不是好事情。

比如我想把某些文件夹下的所有文件解密。

那么对于解压文件的依赖就难以做到。

或者说有时候跨平台的文件解压，获取压缩文件内容，等等。

所以我需要一个自己的 compress 代码仓库，用于学习记录。

# 参考资料

[我的Java开发学习之旅------>Java NIO 报java.nio.charset.MalformedInputException: Input length = 1异常](https://blog.csdn.net/ouyang_peng/article/details/46462379)

* any list
{:toc}