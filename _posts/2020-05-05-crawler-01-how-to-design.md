---
layout: post
title: Cralwer-01-如何设计一个爬虫框架
date:  2020-5-5 09:23:59 +0800
categories: [Crawl]
tags: [crawl, web, sh]
published: true
---

# 创作背景

其实在此之前，自己也尝试过做过尝试。

而且做了两次，最后因为没有成为一个可高度复用的框架，而逐渐失去维护。

本篇整理下成熟工具的长处，结合自己失败的经验，为设计一款简单灵活的爬虫打下基础。

# 以前失败的教训

## 暂停的工具

[crawl](https://github.com/houbb/crawl)

[poseidon](https://github.com/houbb/poseidon.git)

## 设计理念

为了初期的快速迭代，使用**单个模块**。

对于页面等，初期不要求。

初期可以只考虑单机，后期初步加入分布式的设计。（要有预留）

## 依赖框架

### 爬虫

[jsoup](https://houbb.github.io/2018/08/19/crawl-jsoup)

[crawler4j](https://github.com/yasserg/crawler4j#quickstart)

### 结果解析

[json 系列](https://houbb.github.io/tags/#json)

其中 [jsonpath](https://houbb.github.io/2018/07/20/json-03-jsonpath) 在解析的时候非常方便。

[http 请求](https://houbb.github.io/2018/03/16/okhttp)

## 需要注意的点

对于抓取的频率+动态ip 

对于失败的重试

对于抓取的防重复（已经做过的直接跳过）

js 需要动态获取的内容

## 登录

可以参见 [fuxk-login](https://github.com/xchaoinfo/fuck-login)，用于抓取登录后的内容。

# xxl-crawler 的特性

1、简洁：API直观简洁，可快速上手；

2、轻量级：底层实现仅强依赖jsoup，简洁高效；

3、模块化：模块化的结构设计，可轻松扩展

4、面向对象：支持通过注解，方便的映射页面数据到PageVO对象，底层自动完成PageVO对象的数据抽取和封装返回；单个页面支持抽取一个或多个PageVO

5、多线程：线程池方式运行，提高采集效率；

6、分布式支持：通过扩展 “RunData” 模块，并结合Redis或DB共享运行数据可实现分布式。默认提供LocalRunData单机版爬虫。

7、JS渲染：通过扩展 “PageLoader” 模块，支持采集JS动态渲染数据。原生提供 Jsoup(非JS渲染，速度更快)、HtmlUnit(JS渲染)、Selenium+Phantomjs(JS渲染，
兼容性高) 等多种实现，支持自由扩展其他实现。

8、失败重试：请求失败后重试，并支持设置重试次数；

9、代理IP：对抗反采集策略规则WAF；

10、动态代理：支持运行时动态调整代理池，以及自定义代理池路由策略；

11、异步：支持同步、异步两种方式运行；

12、扩散全站：支持以现有URL为起点扩散爬取整站；

13、去重：防止重复爬取；

14、URL白名单：支持设置页面白名单正则，过滤URL；

15、自定义请求信息，如：请求参数、Cookie、Header、UserAgent轮询、Referrer等；

16、动态参数：支持运行时动态调整请求参数；

17、超时控制：支持设置爬虫请求的超时时间；

18、主动停顿：爬虫线程处理完页面之后进行主动停顿，避免过于频繁被拦截；

# 初期设计

## OO

基于 jsoup 抓取页面，配合注解构建为 model。

## fluent-api

基于 fluent-api 设计，优雅配置。

## module-spi

基于 spi 进行设计，全部可以自行拓展。

## thread

多线程处理

# 拓展阅读

[htmlunit](https://houbb.github.io/2018/08/19/crawl-htmlunit)

# 参考资料

[xxl-crawler](https://www.xuxueli.com/xxl-crawler/)

* any list
{:toc}