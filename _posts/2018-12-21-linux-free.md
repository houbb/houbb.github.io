---
layout: post
title: linux free
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
excerpt: linux free 查看系统内存
---

# linux free

free显示系统中可用和已用物理和交换内存的总量，以及内核使用的缓冲区。

共享内存列表示“Shmem”值。 

可用内存列表示“MemAvailable”值。

# man 语法

```
$   man free
```

## 用法

```
free [-b | -k | -m | -g | -h] [-o] [-s delay ] [-c count ] [-a] [-t] [-l] [-V]
```

## 参数

| 参数 | 说明 |
|:----|:----|
| b | 以 B 为单位显示 |
| k | 以 KB 为单位显示 |
| m | 以 M 显示 |
| g | 以千兆字节显示 |
| h | 便于人类读取 |
| o | 禁用“缓冲区调整”行的显示 |
| s | 激活连续轮询延迟秒 |
| c | 重复计数后中断轮询 |
| a | 显示可用内存 |
| t |  显示包含总计的行 |
| l | 显示详细的低内存和高内存统计信息 |
| V | 版本号 |

# 实际使用

```
$   free
```

结果：

```
             total       used       free     shared    buffers     cached
Mem:       8060952    6492772    1568180        192     202936    1681928
-/+ buffers/cache:    4607908    3453044
Swap:     10485756        584   10485172
```

## 输出说明

| 参数	        | 释义 |
|:---|:---|
| total	        | 内存总数，物理内存总数 |
| used	        | 已经使用的内存数 |
| free	        | 空闲的内存数 |
| shared	        | 多个进程共享的内存总额 |
| buffers Buffer	| 缓存内存数 |
| cached Page	缓  | 存内存数 |
| -buffers/cache	| 应用使用内存数 |
| +buffers/cache	| 应用可用内存数 |
| Swap	        | 交换分区，虚拟内存 |


# 参考资料

[Linux上的free命令详解](https://www.cnblogs.com/coldplayerest/archive/2010/02/20/1669949.html)

[Linux查看应用可用内存-free命令详解](https://blog.csdn.net/loongshawn/article/details/51758116)

* any list
{:toc}