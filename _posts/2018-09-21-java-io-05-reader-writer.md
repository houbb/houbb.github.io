---
layout: post
title:  Java IO-05-Reader Writer
date:  2018-09-21 17:36:38 +0800
categories: [Java]
tags: [java, io, java-base, sf]
published: true
excerpt: java io 入门系列-05-Reader Writer
---

# Reader 

Reader是Java IO中所有Reader的基类。

Reader与InputStream类似，不同点在于，Reader基于字符而非基于字节。

换句话说，Reader用于读取文本，而InputStream用于读取原始字节。

read()方法返回一个包含了读取到的字符内容的int类型变量(译者注：0~65535)。如果方法返回-1，表明Reader中已经没有剩余可读取字符，此时可以关闭Reader。-1是一个int类型，不是byte或者char类型，这是不一样的。

你通常会使用Reader的子类，而不会直接使用Reader。Reader的子类包括InputStreamReader，CharArrayReader，FileReader等等。可

# Writer

Writer是Java IO中所有Writer的基类。与Reader和InputStream的关系类似，Writer基于字符而非基于字节，Writer用于写入文本，OutputStream用于写入字节。

同样，你最好使用Writer的子类，不需要直接使用Writer，因为子类的实现更加明确，更能表现你的意图。常用子类包括OutputStreamWriter，CharArrayWriter，FileWriter等。

Writer的write(int c)方法，会将传入参数的低16位写入到Writer中，忽略高16位的数据。

# InputStreamReader

InputStreamReader会包含一个InputStream，从而可以将该输入字节流转换成字符流，代码例子：

```java
InputStream inputStream = new FileInputStream("c:\\data\\input.txt");
Reader reader = new InputStreamReader(inputStream);
int data = reader.read();
while(data != -1){
    char theChar = (char) data;
    data = reader.read();
}
reader.close();
```

注意：为了清晰，代码忽略了一些必要的异常处理。想了解更多异常处理的信息，请参考Java IO异常处理。

read()方法返回一个包含了读取到的字符内容的int类型变量(译者注：0~65535)。代码如下：

```java
int data = reader.read();
```

你可以把返回的int值转换成char变量，就像这样：

```java
char aChar = (char) data; //译者注：这里不会造成数据丢失，因为返回的int类型变量data只有低16位有数据，高16位没有数据
```

如果方法返回-1，表明Reader中已经没有剩余可读取字符，此时可以关闭Reader。-1是一个int类型，不是byte或者char类型，这是不一样的。

InputStreamReader同样拥有其他可选的构造函数，能够让你指定将底层字节流解释成何种编码的字符流。例子如下：

```java
InputStream inputStream = new FileInputStream("c:\\data\\input.txt");
Reader reader = new InputStreamReader(inputStream, "UTF-8");
```

注意构造函数的第二个参数，此时该InputStreamReader会将输入的字节流转换成UTF8字符流。

## OutputStreamWriter

OutputStreamWriter会包含一个OutputStream，从而可以将该输出字节流转换成字符流，代码如下：

```java
OutputStream outputStream = new FileOutputStream("c:\\data\\output.txt");
Writer writer = new OutputStreamWriter(outputStream);
writer.write("Hello World");
writer.close();
```

# 参考资料

http://ifeve.com/java-io-reader%E5%92%8Cwriter/

http://ifeve.com/java-io-inputstreamreader%E5%92%8Coutputstreamwriter/

http://ifeve.com/java-io-filereader%E5%92%8Cfilewriter/

* any list
{:toc}