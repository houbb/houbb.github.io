---
layout: post
title:  feed.xml 文件报错 PCDATA invalid Char value 
date:  2022-10-06 09:22:02 +0800
categories: [Tool]
tags: [tool, sh]
published: true
---

# 报错

个人网站 [https://houbb.github.io/feed.xml](https://houbb.github.io/feed.xml) 有一个 RSS 订阅。

但是经常会报错：

```
This page contains the following errors:
error on line 124913 at column 127: PCDATA invalid Char value 8
Below is a rendering of the page up to the first error.
```

因为内容较多，所以想找到问题也比较麻烦。

# 报错原因

包含一些特殊字符。

也就是一些无法显示的控制字符。

比如 ascii 编码 01-31 之间的，还包括 127。

# 如何排除

## 代码

整体思路：解析所有的文章内容，正则匹配特殊字符，可以代码直接替换掉。

`[\\x08]` 这个匹配的是 ascii = 8 的字符。

```java
public static void main(String[] args) {
    // 特殊字符匹配
    String regex = "[\\x08]";
    Pattern pattern = Pattern.compile(regex);
    File[] files = new File("D:\\code\\github\\houbb.github.io\\_posts").listFiles();
    for(File file : files) {
        String content = FileUtil.getFileContent(file);
        if(RegexUtil.match(pattern, content)) {
            // 正则匹配处理
        }
    }
}
```

## 全文替换

也可以直接根据 ascii 全文替换：

```java
for(int i = 1; i < 32; i++) {
    char c = (char) i;
    System.out.println(i + ": " + Character.valueOf(c));
}
```

ps: 好像很多网站不支持，这里为了不影响 feed 文件，使用截图。

![特殊字符](https://img-blog.csdnimg.cn/6950a630792446c88c473dd62c1cb833.png#pic_center)

# 参考资料

[XML 解析中，如何排除控制字符](https://www.jianshu.com/p/9958222135cb/)

* any list
{:toc}