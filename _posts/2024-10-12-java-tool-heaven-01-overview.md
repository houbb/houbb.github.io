---
layout: post
title: java 工具类 heaven 包-01-java 字符串如何按照字节数截断？
date: 2024-10-12 21:01:55 +0800
categories: [Java]
tags: [java, tool, heaven, sh]
published: true
---

# 背景说明

三方提供的接口，限制传入参数的字节数。

发现 java 的字符串按照字节数截断，并没有直接的方法。

# 流程

## 1.输入待截取的字符串和截取长度

在Java中，我们可以使用String类的substring方法来实现字符串的截取。

需要注意的是，由于Java中字符串是以UTF-16编码的，因此直接使用substring方法截取可能会导致中文字符被截断。

我们需要按字节截取字符串，可以借助Charset类来进行转换。

```java
// 输入待截取的字符串和截取长度
String str = "这是一个测试字符串";
int length = 5; // 需要截取的字节长度
```

## 2.进行字节截取

我们可以通过String类的getBytes方法将字符串转换为字节数组，然后再根据截取的字节长度进行处理。

```java
// 将字符串转换为字节数组
byte[] bytes = str.getBytes("UTF-8");

// 进行字节截取
String result = new String(bytes, 0, length, "UTF-8");
```

## 3.输出截取后的结果

最后，我们可以将截取后的结果输出。

```java
// 输出截取后的结果
System.out.println("截取后的结果为：" + result);
```

## 完整代码示例

```java
public class SubstringDemo {

    public static void main(String[] args) {
        // 输入待截取的字符串和截取长度
        String str = "这是一个测试字符串";
        int length = 5; // 需要截取的字节长度

        try {
            // 将字符串转换为字节数组
            byte[] bytes = str.getBytes("UTF-8");
            
            // 进行字节截取
            String result = new String(bytes, 0, length, "UTF-8");

            // 输出截取后的结果
            System.out.println("截取后的结果为：" + result);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

# 工具类的改进

我们需要知道如果 bytes 的长度不够的话，那么的方法还是会报错。

## 改进后

```

```



# 总结


# 参考资料

https://blog.51cto.com/u_16213330/10876683

* any list
{:toc}