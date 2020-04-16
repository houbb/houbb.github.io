---
layout: post
title: Windows 常用技巧
date:  2020-4-9 17:43:55 +0800
categories: [Windows]
tags: [windows, tips, sh]
published: true
---

# 将 xxx.exe 添加到 path

在cmd中输入path，显示当前的环境变量。

然后 

```
path = %path%;C:\Qt\4.8.1\bin;
```

回车即可。

# 本地 FF为例

`C:\Users\binbin.hou\Downloads\ffmpeg-20200403-52523b6-win64-static\bin`

```
path = %path%;D:\tool\video\ffmpeg\bin;
```

# 参考资料

[将rcc.exe添加到系统Path](https://www.cnblogs.com/findumars/p/5746516.html)

* any list
{:toc}