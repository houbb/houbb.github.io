---
layout: post
title:  Java IO-07-RandomAccessFile 
date:  2018-09-21 17:36:38 +0800
categories: [Java]
tags: [java, io, java-base, sf]
published: true
---

# RandomAccessFile 特点

RandomAccessFile 是 java Io 体系中功能最丰富的文件内容访问类。

即可以读取文件内容，也可以向文件中写入内容。但是和其他输入/输入流不同的是，程序可以直接跳到文件的任意位置来读写数据。 

因为RandomAccessFile 可以自由访问文件的任意位置，所以如果我们希望只访问文件的部分内容，那就可以使用RandomAccessFile类。 

与OutputStearm,Writer 等输出流不同的是，RandomAccessFile类允许自由定位文件记录指针。

所以RandomAccessFile可以不从文件开始的地方进行输出，所以RandomAccessFile可以向已存在的文件后追加内容。

## 优缺点

RandomAccessFile 的方法虽然多，但它有一个最大的局限，就是只能读写文件，不能读写其他IO节点。

RandomAccessFile 的一个重要使用场景就是网络请求中的多线程下载及断点续传。

# RandomAccessFile的整体介绍

RandomAccessFile类包含了一个记录指针，用以标识当前读写处的位置，当程序新创建一个RandomAccessFile对象时，该对象的文件记录指针位于文件头（也就是0处）,当读/写了n个字节后，文件记录指针将会向后移动n个字节。

除此之外，RandomAccessFile可以自由的移动记录指针，即可以向前移动，也可以向后移动。

## 指针方法

RandomAccessFile包含了以下两个方法来操作文件的记录指针.

```java
long getFilePointer(); //返回文件记录指针的当前位置

void seek(long pos); //将文件记录指针定位到pos位置
```

RandomAccessFile即可以读文件，也可以写，所以它即包含了完全类似于InputStream的3个read()方法，其用法和InputStream的3个read()方法完全一样；

也包含了完全类似于OutputStream的3个write()方法，其用法和OutputStream的3个Writer()方法完全一样。

除此之外，RandomAccessFile还包含了一系类的readXXX()和writeXXX()方法来完成输入和输出。

## 创建方法

RandomAccessFile有两个构造器，其实这两个构造器基本相同，只是指定文件的形式不同而已，一个使用String参数来指定文件名，一个使用File参数来指定文件本身。除此之外，创建RandomAccessFile对象还需要指定一个mode参数。

该参数指定RandomAccessFile的访问模式，有以下4个值：

“r” 以只读方式来打开指定文件夹。如果试图对该RandomAccessFile执行写入方法，都将抛出IOException异常。

“rw” 以读，写方式打开指定文件。如果该文件尚不存在，则试图创建该文件。

“rws” 以读，写方式打开指定文件。相对于”rw” 模式，还要求对文件内容或元数据的每个更新都同步写入到底层设备。

“rwd” 以读，写方式打开指定文件。相对于”rw” 模式，还要求对文件内容每个更新都同步写入到底层设备。

# 方法封装实践

## 常量

对于 mode 封装

## 接口标准定义

- 读取

默认从开始到结束。

可以指定：startIndex endIndex

- 写入

默认从末尾

如果不是末尾，则进行后面内容的保留。

# 多线程

比起文件加锁。

可以将文件划分为不同的区域，每一个区域使用多线程去操作。

# 拓展阅读

场景：读取一个 2G 的文件，使用 RandomAccessFile 可以很轻松的达成。那么，要么想要复制一个 2G 的文件，应该怎么做？

IO: 传统做法：FILE 加载到 内存，内存在复制到文件。这个消耗是巨大的。所以我们需要改良的实现：

NIO:

[NIO-内存映射文件]()

# 参考资料

[RandomAccessFile 类使用详解](https://blog.csdn.net/nightcurtis/article/details/51384126)

https://www.jb51.net/article/86041.htm

* any list
{:toc}