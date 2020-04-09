---
layout: post
title: NLP Number 数字工具类
date:  2020-1-20 10:09:32 +0800
categories: [NLP]
tags: [nlp, wsd, sh]
published: true
---

# 背景

当我们看到一串数字时：

```
123 456 7890

1989-10-01

12:35

121212.23

12'23''
```

同样的都是数字，可能读法是不同的。

转换为中文读音和英文读音也是不同的。

为了方便，此处优先转换为中文。

# 基础预料

```
0
1
2
3
4
5
6
7
8
9
```

按照单个中文去读，转换为对应的中文。

标点符号另算。

# 金额转换

```
12000
```

转为 

```
一万两千
```

# Time

- 日期转换

1994-01-10 转为：一九九四零一一零

- 时间

12:35 转为：十二点三十五

# 拓展思路

开拓两个项目：

（1）nlp-num  

专门处理数字转换为中文（其他语言）

（2）nlp-special

特殊符号的转换处理

# 参考资料

[快速转化「中文数字」和「阿拉伯数字」](https://github.com/Ailln/cn2an)

[数字转中文（大写，小写）数字，金额。](https://github.com/cnwhy/nzh)

[中文工具，支持中文数字和英文数字互转和中文时间实体识别](https://github.com/luoxuefeng01/mandarintools-1)

[中文数字转换器](https://github.com/fengcone/chinese_number_converter)

* any list
{:toc}