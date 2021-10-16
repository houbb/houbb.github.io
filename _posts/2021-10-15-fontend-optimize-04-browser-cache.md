---
layout: post
title: 前端性能优化-04-浏览器缓存机制介绍与缓存策略剖析
date: 2021-10-12 21:01:55 +0800
categories: [FrontEnd]
tags: [front-end, tool, web, sh]
published: true
---

# 缓存

缓存可以减少网络 IO 消耗，提高访问速度。浏览器缓存是一种操作简单、效果显著的前端性能优化手段。对于这个操作的必要性，Chrome 官方给出的解释似乎更有说服力一些：

通过网络获取内容既速度缓慢又开销巨大。较大的响应需要在客户端与服务器之间进行多次往返通信，这会延迟浏览器获得和处理内容的时间，还会增加访问者的流量费用。因此，缓存并重复利用之前获取的资源的能力成为性能优化的一个关键方面。

很多时候，大家倾向于将浏览器缓存简单地理解为“HTTP 缓存”。但事实上，浏览器缓存机制有四个方面，它们按照获取资源时请求的优先级依次排列如下：

Memory Cache
Service Worker Cache
HTTP Cache
Push Cache

大家对 HTTP Cache（即 Cache-Control、expires 等字段控制的缓存）应该比较熟悉，如果对其它几种缓存可能还没什么概念，我们可以先来看一张线上网站的 Network 面板截图：

我们给 size 这一栏一个特写：

大家注意一下非数字——即形如“（from xxx）”这样的描述——对应的资源，这些资源就是我们通过缓存获取到的。其中，“from memory cache”对标到 Memory Cache 类型，“from ServiceWorker”对标到 Service Worker Cache 类型。至于 Push Cache，这个比较特殊，是 HTTP2 的新特性。

本节将会针对这四个方面各个击破。

考虑到 HTTP 缓存是最主要、最具有代表性的缓存策略，也是每一位前端工程师都应该深刻理解掌握的性能优化知识点，我们下面优先针对 HTTP 缓存机制进行剖析。

# HTTP 缓存机制探秘

HTTP 缓存是我们日常开发中最为熟悉的一种缓存机制。它又分为强缓存和协商缓存。优先级较高的是强缓存，在命中强缓存失败的情况下，才会走协商缓存。

## 强缓存的特征

强缓存是利用 http 头中的 Expires 和 Cache-Control 两个字段来控制的。

强缓存中，当请求再次发出时，浏览器会根据其中的 expires 和 cache-control 判断目标资源是否“命中”强缓存，若命中则直接从缓存中获取资源，不会再与服务端发生通信。

命中强缓存的情况下，返回的 HTTP 状态码为 200 （如下图）。

## 强缓存的实现：从 expires 到 cache-control

实现强缓存，过去我们一直用 expires。

当服务器返回响应时，在 Response Headers 中将过期时间写入 expires 字段。

像这样：

我们给 expires 一个特写：

```
expires: Wed, 11 Sep 2019 16:12:18 GMT
```

可以看到，expires 是一个时间戳，接下来如果我们试图再次向服务器请求资源，浏览器就会先对比本地时间和 expires 的时间戳，如果本地时间小于 expires 设定的过期时间，那么就直接去缓存中取这个资源。

从这样的描述中大家也不难猜测，expires 是有问题的，它最大的问题在于对“本地时间”的依赖。如果服务端和客户端的时间设置可能不同，或者我直接手动去把客户端的时间改掉，那么 expires 将无法达到我们的预期。

考虑到 expires 的局限性，HTTP1.1 新增了 Cache-Control 字段来完成 expires 的任务。

expires 能做的事情，Cache-Control 都能做；expires 完成不了的事情，Cache-Control 也能做。因此，Cache-Control 可以视作是 expires 的完全替代方案。在当下的前端实践里，我们继续使用 expires 的唯一目的就是向下兼容。

现在我们给 Cache-Control 字段一个特写：

```
cache-control: max-age=31536000
```

如大家所见，在 Cache-Control 中，我们通过 max-age 来控制资源的有效期。max-age 不是一个时间戳，而是一个时间长度。在本例中，max-age 是 31536000 秒，它意味着该资源在 31536000 秒以内都是有效的，完美地规避了时间戳带来的潜在问题。

Cache-Control 相对于 expires 更加准确，它的优先级也更高。当 Cache-Control 与 expires 同时出现时，我们以 Cache-Control 为准。
# 参考资料

https://www.kancloud.cn/sllyli/performance/1242196

* any list
{:toc}