---
layout: post
title: linux iostat-系统输入/输出设备（磁盘、终端、网络接口等）的统计信息
date: 2018-12-21 11:28:06 +0800
categories: [Linux]
tags: [linux, shell, sh]
published: true
---

# 实战

## 安装 + 启用

```
sudo apt-get install sysstat
sudo service sysstat start
```

## iostat 执行

这里是 windows 的 linux 发行版本。

```
$ iostat
Linux 5.15.90.1-microsoft-standard-WSL2 (d)     11/14/23        _x86_64_        (16 CPU)

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           0.05    0.00    0.03    0.04    0.00   99.88

Device             tps    kB_read/s    kB_wrtn/s    kB_dscd/s    kB_read    kB_wrtn    kB_dscd
sda               0.18        11.30         0.00         0.00      72041          0          0
sdb               0.02         0.37         0.00         0.00       2356          4          0
sdc               5.54        75.06      3090.45    168498.11     478395   19697440 1073947964
```

加上 `-h` 可以让结果更加人性化：

```
$ iostat -h
Linux 5.15.90.1-microsoft-standard-WSL2 (d)     11/14/23        _x86_64_        (16 CPU)

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           0.0%    0.0%    0.0%    0.0%    0.0%   99.9%

      tps    kB_read/s    kB_wrtn/s    kB_dscd/s    kB_read    kB_wrtn    kB_dscd Device
     0.18        11.1k         0.0k         0.0k      70.4M       0.0k       0.0k sda
     0.02         0.4k         0.0k         0.0k       2.3M       4.0k       0.0k sdb
     5.45        73.9k         3.0M       162.0M     467.2M      18.8G       1.0T sdc
```

具体的解释如下：

这是 `iostat` 命令输出的典型例子，提供了有关 CPU 使用情况和磁盘 I/O 活动的详细信息。

下面对每一部分进行解释：

### CPU 使用情况：

```plaintext
avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           0.0%    0.0%    0.0%    0.0%    0.0%   99.9%
```

- `%user`：用户空间进程占用 CPU 的百分比。
- `%nice`：优先级较高的进程占用 CPU 的百分比。
- `%system`：内核空间进程占用 CPU 的百分比。
- `%iowait`：等待 I/O 操作完成的 CPU 百分比。
- `%steal`：被其他虚拟机占用的 CPU 百分比（仅在虚拟化环境中可见）。
- `%idle`：空闲 CPU 百分比。

在这个例子中，CPU 处于 99.9% 的空闲状态，没有明显的负载。

### 磁盘 I/O 统计：

```plaintext
      tps    kB_read/s    kB_wrtn/s    kB_dscd/s    kB_read    kB_wrtn    kB_dscd Device
     0.18        11.1k         0.0k         0.0k      70.4M       0.0k       0.0k sda
     0.02         0.4k         0.0k         0.0k       2.3M       4.0k       0.0k sdb
     5.45        73.9k         3.0M       162.0M     467.2M      18.8G       1.0T sdc
```

- `tps`：每秒钟完成的传输次数（transactions per second）。
- `kB_read/s`：每秒从设备读取的数据量（千字节/秒）。
- `kB_wrtn/s`：每秒写入设备的数据量（千字节/秒）。
- `kB_dscd/s`：每秒被丢弃的数据量（千字节/秒）。
- `kB_read`：从设备读取的总数据量。
- `kB_wrtn`：写入设备的总数据量。
- `kB_dscd`：被丢弃的总数据量。
- `Device`：设备名称。

在这个例子中，列出了三个设备（sda、sdb、sdc）的磁盘 I/O 统计信息。以 `sda` 为例：

- `tps` 是每秒完成的传输次数，为 0.18，表示这个设备上的 I/O 负载很低。
- `kB_read/s` 是每秒从设备读取的数据量，为 11.1k。
- `kB_wrtn/s` 是每秒写入设备的数据量，为 0.0k。
- `kB_dscd/s` 是每秒被丢弃的数据量，为 0.0k。
- `kB_read`、`kB_wrtn`、`kB_dscd` 是从设备读取、写入和被丢弃的总数据量。

这些数据提供了有关系统磁盘 I/O 活动的详细信息，可用于监视磁盘性能和检测磁盘瓶颈。

# chat

## Q1-详细介绍一下 linux iostat 命令

`iostat` 是一个用于报告系统输入/输出（I/O）统计信息的命令，它能够显示关于系统磁盘和CPU使用情况的详细数据。

`iostat` 属于 `sysstat` 软件包的一部分，通常需要先安装 `sysstat` 才能使用。

### 命令格式：

```bash
iostat [选项] [时间间隔] [次数]
```

- **选项**：`-c`（显示CPU使用情况）、`-d`（显示磁盘使用情况）、`-n`（显示网络统计）等。
- **时间间隔**：指定输出统计信息的时间间隔。
- **次数**：指定输出统计信息的次数。

### 常用选项：

1. **-c**：显示CPU使用情况。
   ```bash
   iostat -c 1 5
   ```
   上述命令每隔1秒输出一次CPU使用情况，共输出5次。

2. **-d**：显示磁盘使用情况。
   ```bash
   iostat -d 1 5
   ```
   上述命令每隔1秒输出一次磁盘使用情况，共输出5次。

3. **-n**：显示网络统计。
   ```bash
   iostat -n 1 5
   ```
   上述命令每隔1秒输出一次网络统计，共输出5次。

### 输出解释：

`iostat` 输出的信息包括：

1. **CPU Utilization（CPU 使用情况）**：
   - %user：用户空间进程占用 CPU 百分比。
   - %nice：优先级较高的进程占用 CPU 百分比。
   - %system：内核空间进程占用 CPU 百分比。
   - %iowait：等待 I/O 操作完成的 CPU 百分比。
   - %steal：被其他虚拟机占用的 CPU 百分比（仅在虚拟化环境中可见）。
   - %idle：空闲 CPU 百分比。

2. **Device Utilization（设备使用情况）**：
   - `rkB/s`：每秒从设备读取的数据量（千字节/秒）。
   - `wkB/s`：每秒写入设备的数据量（千字节/秒）。
   - `await`：平均I/O请求等待时间（毫秒）。
   - `svctm`：平均I/O请求服务时间（毫秒）。
   - `%util`：设备的利用率。

3. **Network Utilization（网络使用情况）**：
   - `rxkB/s`：每秒接收的数据量（千字节/秒）。
   - `txkB/s`：每秒发送的数据量（千字节/秒）。

`iostat` 提供了对系统性能的实时监控，特别是在了解磁盘和CPU的使用情况方面非常有用。



# 参考资料


* any list
{:toc}