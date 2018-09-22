---
layout: post
title:  Java IO-03-字符/字节数组
date:  2018-09-21 17:36:38 +0800
categories: [Java]
tags: [java, io, java-base, sf]
published: true
excerpt: java io 入门系列-03-字符/字节数组
---

# 字符/字节数组

在java中常用字节和字符数组在应用中临时存储数据。而这些数组又是通常的数据读取来源或者写入目的地。

如果你需要在程序运行时需要大量读取文件里的内容，那么你也可以把一个文件加载到数组中。

当然你可以通过直接指定索引来读取这些数组。但如果设计成为从InputStream或者Reader，而不是从数组中读取某些数据的话，你会用什么组件呢？


## 读取

要使这样的组件从数组中读取数据，您必须将字节或char数组包装在ByteArrayInputStream或CharArrayReader中。

这样，数组中可用的字节或字符就可以通过包装流或阅读器读取。

```java
@Test
public void readByteArrayTest() throws IOException {
    //write data into byte array...
    byte[] bytes = "hello byte array!".getBytes();
    InputStream input = new ByteArrayInputStream(bytes);

    //read first byte
    int data = input.read();
    while(data != -1) {
        //do something with data
        System.out.print((char)data);
        //read next byte
        data = input.read();
    }
}
```

## 写入

同样，也可以把数据写到ByteArrayOutputStream或者CharArrayWriter中。

你只需要创建ByteArrayOutputStream或者CharArrayWriter，把数据写入，就像写其它的流一样。

当所有的数据都写进去了以后，只要调用 toByteArray() 或者 toCharArray()，所有写入的数据就会以数组的形式返回。

```java
@Test
public void writeByteArrayTest() throws IOException {
    ByteArrayOutputStream output = new ByteArrayOutputStream();
    output.write("This text is converted to bytes".getBytes("UTF-8"));
    byte[] bytes = output.toByteArray();
}
```

# 参考资料

http://ifeve.com/java-io-array/

* any list
{:toc}