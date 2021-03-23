---
layout: post
title:  Failed to connect to github.com port 443 Timed out
date:  2021-3-06 16:52:15 +0800
categories: [Distributed]
tags: [distributed, sh]
published: true
---


# 问题描述


git push 失败。

浏览器可以正常访问 github.com


# 方案一

## 可能原因

代理导致的。

## 解决方案

取消代理：

```
git config --global --unset http.proxy
```

自测无效。

# 地址失效


## 查询可以用的IP

在 [http://ping.chinaz.com/github.com](http://ping.chinaz.com/github.com) 查询对应的耗时情况。

## 修改 hosts 文件

hosts 文件路径：C:\Windows\System32\drivers\etc\HOSTS

我们把 `13.250.177.223 github.com` 添加到 hosts 文件。

立刻刷新 dns

```
ipconfig /flushdns
```

ping 测试

```
λ ping github.com

正在 Ping github.com [13.250.177.223] 具有 32 字节的数据:
来自 13.250.177.223 的回复: 字节=32 时间=67ms TTL=42
来自 13.250.177.223 的回复: 字节=32 时间=69ms TTL=42
来自 13.250.177.223 的回复: 字节=32 时间=67ms TTL=42
来自 13.250.177.223 的回复: 字节=32 时间=67ms TTL=43

13.250.177.223 的 Ping 统计信息:
    数据包: 已发送 = 4，已接收 = 4，丢失 = 0 (0% 丢失)，
往返行程的估计时间(以毫秒为单位):
    最短 = 67ms，最长 = 69ms，平均 = 67ms
```

重新操作成功。

# ssl 异常

## 异常

```
OpenSSL SSL_read: Connection was reset, errno 10054
```

## 解决方案

```
git config --global http.sslVerify "false"
```

# 开源工具

（1）获取 github.com 对应的所有 ip 列表

（2）ping 获取所有的 github.com 耗时

（3）选择耗时比较短的 IP 内容，写入到 hosts 文件

（4）执行 `ipconfig /flushdns` 命令


## 开源地址

https://github.com/houbb/ping-hosts

# 参考资料

[Failed to connect to github.com port 443: Timed out](https://blog.csdn.net/yy339452689/article/details/104040279)

[问题：Failed to connect to github.com port 443: Operation timed out](https://www.jianshu.com/p/471aeba64724)

* any list
{:toc}