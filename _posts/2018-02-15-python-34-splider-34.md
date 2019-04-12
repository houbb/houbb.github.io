---
layout: post
title: Python-34-splider 爬虫
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, python3, splider, lang, sh]
published: true
---

# 善良比聪明更重要

[爬虫究竟是合法还是违法的？](https://www.zhihu.com/question/291554395/answer/487952336)

## 遵守以下规则

遵守 Robots 协议，但有没有 Robots 都不代表可以随便爬，可见下面的大众点评百度案；

限制你的爬虫行为，禁止近乎 DDOS 的请求频率，一旦造成服务器瘫痪，约等于网络攻击；

对于明显反爬，或者正常情况不能到达的页面不能强行突破，否则是 Hacker 行为；

最后，审视清楚自己爬的内容，以下是绝不能碰的红线（包括但不限于）：

爬取用户个人数据非法牟利，包括模拟登录他人账号，如下一案例中操作账号加粉


# 爬虫流程

## 基本

1. 找到一个网站

2. 判断是否需要登录。[常见网站登录](https://github.com/xchaoinfo/fuck-login)

3. 解析对应的 html 内容。

4. 选择合适的框架，进行抓取+存储

5. 选择合适的存储方式。比较小可以使用文件。都是 json 使用 mongo，条理化清晰可以使用 mysql 等关系型数据库。

## 应用

1. 根据需要对数据进行展现。比如 cli 工具，或者页面。

## 进阶

1. ip 如何动态变换？

2. 多线程爬虫。

# 拓展阅读

[python 多线程]()

[beautiful soup]()

# 参考资料

- 法律

[爬虫究竟是合法还是违法的？](https://www.zhihu.com/question/291554395/answer/487952336)

* any list
{:toc}