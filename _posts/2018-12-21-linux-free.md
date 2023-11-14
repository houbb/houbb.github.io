---
layout: post
title: linux free 查看内存信息
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

# chat

## Q1-详细介绍一下 linux free 命令

`free`命令用于显示系统内存的使用情况，包括物理内存（RAM）和交换空间。

它可以提供有关系统内存分配和使用情况的快速概览。

以下是`free`命令的详细介绍：

### 命令格式：

```bash
free [选项]
```

### 常用选项：

- `-b`：以字节为单位显示内存使用情况。
- `-k`：以千字节为单位显示内存使用情况。
- `-m`：以兆字节为单位显示内存使用情况。
- `-g`：以千兆字节为单位显示内存使用情况。
- `-t`：显示总计行，包括物理内存和交换空间的总计。

### 示例：

1. **默认输出**：以千字节为单位显示系统内存和交换空间的使用情况。

    ```bash
    free
    ```

2. **以兆字节为单位显示**：使用`-m`选项，以兆字节为单位显示内存使用情况。

    ```bash
    free -m
    ```

3. **显示总计行**：使用`-t`选项，显示物理内存和交换空间的总计。

    ```bash
    free -t
    ```

### 输出解释：

`free`命令的输出包括以下信息：

- **总内存（total）**：系统的总物理内存。
- **已用内存（used）**：已经被系统占用的内存。
- **空闲内存（free）**：未被使用的内存。
- **共享内存（shared）**：被多个进程共享的内存。
- **缓存内存（buffers）**：用于存储文件系统元数据的缓存。
- **缓冲内存（cached）**：用于存储文件系统数据的缓存。
- **交换空间（Swap）**：交换空间的总量、已用和空闲量。

### 示例输出：

```plaintext
             total       used       free     shared    buffers     cached
Mem:       1633980    1455096     178884     104848      17004     742560
-/+ buffers/cache:     691532     942448
Swap:      1951740      10544    1941196
Total:     3585720    1465640    2110080
```

上述输出中，"Mem"行提供了物理内存的详细信息，"Swap"行提供了交换空间的详细信息。 

"Total"行提供了总计信息，包括物理内存和交换空间的总量。 

"buffers"和"cached"列显示了用于文件系统缓存的内存。

第二行（-/+ buffers/cache）提供了一个更直观的内存使用情况，去除了文件系统缓存对内存的影响。

## Q2-实际例子

```
$ free -h
               total        used        free      shared  buff/cache   available
Mem:           7.6Gi       519Mi       6.2Gi       3.0Mi       973Mi       6.9Gi
Swap:          2.0Gi          0B       2.0Gi
```




# 参考资料

[Linux上的free命令详解](https://www.cnblogs.com/coldplayerest/archive/2010/02/20/1669949.html)

[Linux查看应用可用内存-free命令详解](https://blog.csdn.net/loongshawn/article/details/51758116)

* any list
{:toc}