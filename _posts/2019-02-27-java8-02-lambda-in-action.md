---
layout: post
title: java8-02-lambda 入门实战
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [jdk8, java, sh]
published: true
---

# 环绕执行模式

JDK1.7 引入的 [TWR](http://www.eclipse.org/jdt/ui/r3_8/Java7news/whats-new-java-7.html#try-with-resources) 语法，
令读取文件后的资源释放变得更加简洁。

```java
public static String processFile() throws IOException {
    try (BufferedReader bufferedReader =
                 new BufferedReader(new FileReader("1.txt"))) {
        return bufferedReader.readLine();
    }
}
```

# lambda 

## 行为参数化

上面的方法中有局限。

如果我想返回头 2 行的内容，甚至返回最频繁的，怎么办？

我们要做的就是将 `processFile()` 的**行为参数化**。

传递行为，正是 lambda 擅长的。

代码看起来可能是这样：

```java
String result = processFile((BufferedReader br)->br.readLine()+br.readLine());
```

## 定义函数式接口

与上面我们的定义相互匹配。

```java
/**
 * 文件读取
 * @author bbhou
 */
@FunctionalInterface
public interface BufferedReaderProcessor {

    /**
     * 执行
     * @param bufferedReader
     * @return
     * @throws IOException
     */
    String process(BufferedReader bufferedReader) throws IOException;

}
```

## 执行一个行为

```java
public static String processFile(BufferedReaderProcessor bufferedReaderProcessor) throws IOException {
    try(BufferedReader bufferedReader = new BufferedReader(new FileReader("1.txt"))) {
        return bufferedReaderProcessor.process(bufferedReader);
    }
}
```

## 传递 lambda

```java
public static void main(String[] args) throws IOException {
    processFile((BufferedReader br)->br.readLine()+br.readLine());
}
```

* any list
{:toc}