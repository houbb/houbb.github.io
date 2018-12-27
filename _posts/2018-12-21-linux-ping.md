---
layout: post
title: linux ping
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, net, sh]
published: true
excerpt: linux ping
---

# linux ping

执行ping指令会使用ICMP传输协议，发出要求回应的信息，若远端主机的网络功能没有问题，就会回应该信息，因而得知该主机运作正常。

主要用途：用来判断机器间网是否通

## 参数

参　　数：

  -d   使用Socket的SO_DEBUG功能。
  -c<完成次数>   设置完成要求回应的次数。
  -f   极限检测。
  -i<间隔秒数>   指定收发信息的间隔时间。
  -I<网络界面>   使用指定的网络界面送出数据包。
  -l<前置载入>   设置在送出要求信息之前，先行发出的数据包。
  -n   只输出数值。
  -p<范本样式>   设置填满数据包的范本样式。
  -q   不显示指令执行过程，开头和结尾的相关信息除外。
  -r   忽略普通的Routing Table，直接将数据包送到远端主机上。
  -R   记录路由过程。
  -s<数据包大小>   设置数据包的大小。
  -t<存活数值>   设置存活数值TTL的大小。
  -v   详细显示指令的执行过程。

# linux 与 windows

linuxso注:linux下的ping和windows下的ping稍有区别,linux下ping不会自动终止,需要按ctrl+c终止或者用参数-c指定要求完成的回应次数

linux下测试本机与目标主机连通性的命令是ping，这里主要讲解两个参数 –c 与 – i

其中 

–c   count 次数，也就是ping的次数

-i interval  间隔 ，每次ping之间的时间空格

## 实例

```
ping -c 10 -i 0.5 www.g.cn
```

# 案例

## 当前网络是否可用

```
ping baidu.com
```

可见百度的可用性非常之高

## 和指定机器间网络是否通畅

```
ping ip地址
```


# 参考资料

[]()

* any list
{:toc}