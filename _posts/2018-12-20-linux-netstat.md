---
layout: post
title: linux netstat-显示系统网络连接、路由表、接口统计、masquerade 连接等信息
date: 2018-12-20 17:21:25 +0800
categories: [Linux]
tags: [linux, net, shell, sh]
published: true
excerpt: linux netstat
---

# linux 命令汇总

| 命令             | 描述                                   | 地址                                              |
|------------------|----------------------------------------|---------------------------------------------------|
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
| linux top        | 实时查看系统性能                       | [linux top 实时查看系统性能](https://houbb.github.io/2018/12/20/linux-top)                 |


# linux netstat 命令

## 介绍

`netstat`（网络统计）是一个用于显示系统网络连接、路由表、接口统计、masquerade 连接等信息的命令。

它可以帮助你监控系统的网络活动和了解网络配置。

## 解释

`netstat` 的输出提供了关于系统网络连接的详细信息，包括协议类型、本地和远程地址、状态、进程名等。

以下是输出的一部分示例： 

```plaintext
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      1234/sshd
tcp        0      0 192.168.1.2:12345       203.0.113.5:80          ESTABLISHED 5678/example
tcp        0      0 192.168.1.2:43210       203.0.113.6:443         TIME_WAIT   -
udp        0      0 0.0.0.0:69              0.0.0.0:*                           9012/in.tftpd
```

- **Proto**：协议类型，可以是 `tcp`（TCP）、`udp`（UDP）等。

- **Recv-Q**：接收队列的大小。

- **Send-Q**：发送队列的大小。

- **Local Address**：本地地址和端口。

- **Foreign Address**：远程地址和端口。

- **State**：连接状态，如 `LISTEN`、`ESTABLISHED`、`TIME_WAIT` 等。

- **PID/Program name**：占用连接的进程标识符和程序名。

通过 `netstat`，你可以快速了解系统的网络连接情况，对于网络故障排除和性能监控都是很有帮助的工具。

# 安装使用实战

## 安装

```
$ netstat
Command 'netstat' not found, but can be installed with:
sudo apt install net-tools
```

## 使用

```
$ netstat
Active Internet connections (w/o servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
Active UNIX domain sockets (w/o servers)
Proto RefCnt Flags       Type       State         I-Node   Path
unix  2      [ ]         DGRAM                    21522    /var/run/chrony/chronyd.sock
unix  3      [ ]         DGRAM      CONNECTED     20062    /run/systemd/notify
unix  2      [ ]         DGRAM                    18869    /run/user/1000/systemd/notify
unix  2      [ ]         DGRAM                    20071    /run/systemd/journal/syslog
unix  9      [ ]         DGRAM      CONNECTED     20078    /run/systemd/journal/dev-log
unix  7      [ ]         DGRAM      CONNECTED     20080    /run/systemd/journal/socket
unix  2      [ ]         DGRAM      CONNECTED     26151
unix  3      [ ]         STREAM     CONNECTED     21143    /run/systemd/journal/stdout
...
```

# netstat 常用参数组合

```
netstat -ntlp   //查看当前所有tcp端口·

netstat -ntulp | grep 80   //查看所有80端口使用情况·

netstat -an | grep 3306   //查看所有3306端口使用情况·
```

# chat

## Q1-详细介绍一下 linux netstat 命令

`netstat`（网络统计）是一个用于显示系统网络连接、路由表、接口统计、masquerade 连接等信息的命令。

它可以帮助你监控系统的网络活动和了解网络配置。

下面是 `netstat` 命令的基本格式和一些常用选项：

### 命令格式：

```bash
netstat [选项]
```

### 常用选项：

1. **-a, --all**：显示所有连接，包括监听中的连接。
   ```bash
   netstat -a
   ```

2. **-t, --tcp**：显示 TCP 协议的连接。
   ```bash
   netstat -t
   ```

3. **-u, --udp**：显示 UDP 协议的连接。
   ```bash
   netstat -u
   ```

4. **-n, --numeric**：以数字形式显示 IP 地址和端口号，而不进行域名解析。
   ```bash
   netstat -n
   ```

5. **-p, --programs**：显示占用连接的程序名。
   ```bash
   netstat -p
   ```

### 示例：

1. **显示所有连接**：
   ```bash
   netstat -a
   ```

2. **显示所有 TCP 连接**：
   ```bash
   netstat -t
   ```

3. **显示所有 UDP 连接**：
   ```bash
   netstat -u
   ```

4. **显示监听中的连接**：
   ```bash
   netstat -l
   ```

5. **显示占用连接的程序名**：
   ```bash
   netstat -p
   ```

### 输出解释：

`netstat` 的输出提供了关于系统网络连接的详细信息，包括协议类型、本地和远程地址、状态、进程名等。

以下是输出的一部分示例：

```plaintext
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      1234/sshd
tcp        0      0 192.168.1.2:12345       203.0.113.5:80          ESTABLISHED 5678/example
tcp        0      0 192.168.1.2:43210       203.0.113.6:443         TIME_WAIT   -
udp        0      0 0.0.0.0:69              0.0.0.0:*                           9012/in.tftpd
```

- **Proto**：协议类型，可以是 `tcp`（TCP）、`udp`（UDP）等。
- **Recv-Q**：接收队列的大小。
- **Send-Q**：发送队列的大小。
- **Local Address**：本地地址和端口。
- **Foreign Address**：远程地址和端口。
- **State**：连接状态，如 `LISTEN`、`ESTABLISHED`、`TIME_WAIT` 等。
- **PID/Program name**：占用连接的进程标识符和程序名。

通过 `netstat`，你可以快速了解系统的网络连接情况，对于网络故障排除和性能监控都是很有帮助的工具。

# 参考资料

https://www.cnblogs.com/jiu0821/p/7994838.html

[Linux netstat命令](http://www.runoob.com/linux/linux-comm-netstat.html)

* any list
{:toc}