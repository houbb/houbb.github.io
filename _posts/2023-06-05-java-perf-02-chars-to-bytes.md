---
layout: post
title: char数组转byte数组
date:  2023-06-05 +0800
categories: [Basic]
tags: [basic, xml, sh]
published: true
---

# 例子

将char数组转换为byte数组需要考虑编码方式的问题。如果使用ASCII编码的话，每个字符只需要一个字节，直接将char数组中的每个字符转换为byte即可；如果使用其他编码方式，可能会出现一个字符需要多个字节的情况。

下面是一个使用UTF-8编码转换的示例代码：

```java
public static byte[] charToByte(char[] chars) {
    Charset utf8 = Charset.forName("UTF-8");
    CharBuffer charBuffer = CharBuffer.wrap(chars);
    ByteBuffer byteBuffer = utf8.encode(charBuffer);
    byte[] bytes = Arrays.copyOfRange(byteBuffer.array(), byteBuffer.position(), byteBuffer.limit());
    Arrays.fill(byteBuffer.array(), (byte) 0);
    return bytes;
}
```

该代码中，首先使用UTF-8编码方式创建一个Charset对象，然后将char数组包装成CharBuffer，再通过Charset对象将CharBuffer编码成ByteBuffer，最后将ByteBuffer转换为byte数组。

由于ByteBuffer中可能包含一些空字节，因此使用Arrays.copyOfRange将非空字节复制到新的byte数组中，最后将ByteBuffer中的内容清空。

需要注意的是，如果使用不同的编码方式，需要将创建Charset对象的参数修改为对应的编码方式名称。

# 或者

直接复制出 String 类中的底层实现。

# 参考资料

https://juejin.cn/s/char%E6%95%B0%E7%BB%84%E8%BD%ACbyte%E6%95%B0%E7%BB%84

* any list
{:toc}