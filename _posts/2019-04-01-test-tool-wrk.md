---
layout: post
title: WRK-测试利器
date:  2019-4-1 19:24:57 +0800
categories: [Test]
tags: [test, tool]
published: true
---

# WRK

[WRK](https://github.com/wg/wrk) is a modern HTTP benchmarking tool capable of generating significant load when run on a single multi-core CPU. 

It combines a multithreaded design with scalable event notification systems such as epoll and kqueue.

An optional LuaJIT script can perform HTTP request generation, response processing, and custom reporting. 

Details are available in SCRIPTING and several examples are located in [scripts](https://github.com/wg/wrk/tree/master/scripts) package.

# 基本用法

```
wrk -t12 -c400 -d30s http://127.0.0.1:8080/index.html
```

This runs a benchmark for 30 seconds, using 12 threads, and keeping 400 HTTP connections open.

输出

```
Running 30s test @ http://127.0.0.1:8080/index.html
  12 threads and 400 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency   635.91us    0.89ms  12.92ms   93.69%
    Req/Sec    56.20k     8.07k   62.00k    86.54%
  22464657 requests in 30.00s, 17.76GB read
Requests/sec: 748868.53
Transfer/sec:    606.33MB
```

# 基准提示

运行wrk的机器必须有足够数量的短暂端口，并且应该快速回收关闭的插座。 

要处理初始连接突发，服务器的listen（2）backlog应该大于正在测试的并发连接数。

仅更改HTTP方法，路径，添加标头或正文的用户脚本不会对性能产生影响。 

每个请求的操作，特别是构建新的HTTP请求，以及使用response()，必然会减少可以生成的负载量。

# 个人收获

1. C 语言实际上非常强大。

2. 基本原理还是类似的，但是不同的是，C 语言编写的多线程需要对计算机的底层理解的更多。

3. Lua 脚本使用的很广。比如 Redis 中也用到了。有时间可以学一下。

# 拓展阅读

[JunitPerf](https://github.com/houbb/junitperf)

[Lua](https://houbb.github.io/2018/09/09/lang-lua)

# 参考资料

[https://github.com/wg/wrk](https://github.com/wg/wrk)

* any list
{:toc}