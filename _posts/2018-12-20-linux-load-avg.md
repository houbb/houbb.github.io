---
layout: post
title:  Linux Load AVG linux 平均负载是什么? 简单解释说明 
date: 2018-12-20 17:21:25 +0800
categories: [Linux]
tags: [linux, sh]
published: true
---

# linux 命令基础汇总

| 命令&基础             | 描述                                   | 地址                                              |
|------------------|----------------------------------------|---------------------------------------------------|
| linux curl       | 命令行直接发送 http 请求               | [Linux curl 类似 postman 直接发送 get/post 请求](https://houbb.github.io/2018/12/20/linux-curl) |
| linux ln         | 创建链接（link）的命令               | [创建链接（link）的命令](https://houbb.github.io/2018/12/20/linux-ln) |
| linux link       | linux 软链接介绍               | [linux 软链接介绍](https://houbb.github.io/2018/12/20/linux-link-intro) |
| linux top        | 实时查看系统性能                       | [linux top-linux 内存](https://houbb.github.io/2018/12/21/linux-top)                 |
| linux tar gz     | 解压命令                               | [linux tar gz 解压命令](https://houbb.github.io/2018/12/21/linux-tar-gz)              |
| linux tail       | 显示文件末尾内容                       | [linux tail, linux head](https://houbb.github.io/2018/12/21/linux-tail)               |
| linux rm         | 删除文件或目录                         | [linux rm, mkdir](https://houbb.github.io/2018/12/21/linux-rm)                         |
| linux pwd        | 显示当前目录                           | [linux pwd](https://houbb.github.io/2018/12/21/linux-pwd)                               |
| linux ps         | 显示当前进程信息                       | [linux ps](https://houbb.github.io/2018/12/21/linux-ps)                                 |
| linux port       | 显示端口占用情况                       | [linux port 端口占用](https://houbb.github.io/2018/12/21/linux-port)                   |
| linux ping       | 测试网络连通性                         | [linux ping](https://houbb.github.io/2018/12/21/linux-ping)                             |
| linux mv         | 移动文件或目录                         | [linux mv](https://houbb.github.io/2018/12/21/linux-mv)                                 |
| linux ls         | 列出文件和目录                         | [linux ls](https://houbb.github.io/2018/12/21/linux-ls)                                 |
| linux less, more | 分页显示文件内容                       | [linux less, linux more](https://houbb.github.io/2018/12/21/linux-less)                 |
| linux grep       | 在文件中搜索指定字符串                 | [linux grep](https://houbb.github.io/2018/12/21/linux-grep)                               |
| linux file       | 确定文件类型                           | [linux file 命令](https://houbb.github.io/2018/12/21/linux-file)                         |
| linux diff       | 比较文件的不同                         | [linux diff](https://houbb.github.io/2018/12/21/linux-diff)                               |
| linux chmod      | 修改文件权限                           | [linux chmod](https://houbb.github.io/2018/12/21/linux-chmod)                             |
| linux cd         | 切换当前目录                           | [linux cd](https://houbb.github.io/2018/12/21/linux-cd)                                   |
| linux cat        | 显示文件内容                           | [linux cat](https://houbb.github.io/2018/12/21/linux-cat)                                 |
| linux telnet     | 远程登录                               | [linux telnet](https://houbb.github.io/2018/12/20/linux-telnet)                           |
| linux free       | 显示内存使用情况                       | [linux free-内存统计信息](https://houbb.github.io/2018/12/21/linux-free)                 |
| linux df         | 显示磁盘空间使用情况                   | [linux df-磁盘统计信息](https://houbb.github.io/2018/12/21/linux-df)                     |
| linux netstat   | 显示网络连接、路由表、接口统计等信息 | [linux netstat-显示系统网络连接、路由表、接口统计、masquerade 连接等信息](https://houbb.github.io/2018/12/20/linux-netstat) |
| linux load average   | 如何查看 linux 的负载 | [Linux Load AVG linux 平均负载是什么解释说明](https://houbb.github.io/2018/12/20/linux-load-avg) |

# inux 查看当前系统平均负载的情况

linux shell 中可以有很多种方法查看load average

```
[root@localhost]# uptime | w | top | tload | cat /proc/loadavg           //这些都可以查看系统负载情况

02:03:50 up 126 days, 12:57, 2 users, load average: 0.08, 0.03, 0.05
```

显示内容说明：

```
02:03:50        //系统当前时间

up 126 days, 12:57        //系统已经运行的时间，时间越大，越说明系统稳定

2 users        //当前已连接系统的用户总数

load average         //系统最近1,5,15分钟的负载情况
```

# 那什么是系统平均负载呢？

系统平均负载是指在特定时间间隔内运行队列中的平均进程数，换句话说就是系统在过去1分钟、5分钟、15分钟内运行进程队列中的平均进程数量。

```
[root@localhost]# ps -aux            //可查看正在使用中的进程“R”
```

## 类比交通

为了更好的理解系统负载，我们用交通流量做对比

### 1，cpu 单核

![cpu 单核](https://upload-images.jianshu.io/upload_images/18272409-ea7fb42436749a81.png?imageMogr2/auto-orient/strip|imageView2/2/w/418/format/webp)

0.00-1.00 之间的数字表示正常，车辆可以有序的通过。

1.00 表示道路还算正常，但继续下去，道路状况可能会恶化，造成拥堵。

1.00-*.** 之间的数字表示路况不好，如果到达2.00表示道路有多一倍的车辆要通过，这个时候就必须检查了，严重可能会造成服务器崩溃。

### 2. cpu 多核

多核cpu，满负荷cpu状态的数字是"1.00 * CPU核心数"，即双核为2.00，四核为4.00


# 3. 怎样正确的知道系统负载情况？

我们拿单核cpu来说，如果load average的三个值长期大1.00时，说明CPU很繁忙，负载很高，可能会影响系统性能，但是偶尔大于1.00时，倒不用担心，一般不会影响系统性能。

相反，如果load average的输出值小于CPU的个数，则表示CPU还有空闲。

如果确定很繁忙的话，就要考虑是否更换服务器或增加CPU的个数了。

# 4. 怎么知道系统的cpu核心数

```
[root@localhost]# grep "model name" /proc/cpuinfo | wc -l
```

# 参考文章

[linux系统平均负载是什么？](https://www.jianshu.com/p/70b9b5c216c2)

* any list
{:toc}