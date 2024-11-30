---
layout: post
title: linux netstat Network Statistics 显示网络连接、路由表、接口统计、网络协议等
date: 2018-12-05 11:35:23 +0800
categories: [Linux]
tags: [vim, linux, sh]
published: true
---

# netstat

`netstat`（Network Statistics）是 Linux 和类 Unix 系统中的一个常用命令，用于显示网络连接、路由表、接口统计、网络协议等信息。

它帮助系统管理员监控网络状态，排查网络问题，进行网络性能分析。

# 基本语法

```bash
netstat [options]
```

## 常用选项

- `-a`：显示所有连接和监听的端口，包括 TCP 和 UDP 连接。
- `-t`：显示 TCP 连接。
- `-u`：显示 UDP 连接。
- `-l`：只显示正在监听的端口（即服务端口）。
- `-p`：显示与连接相关的程序（PID）和名称。
- `-n`：显示网络地址和端口号时使用数字格式，而不是解析为主机名和服务名。
- `-r`：显示路由表。
- `-i`：显示网络接口的统计信息。
- `-s`：显示网络协议的统计信息（如 TCP、UDP、ICMP 等）。
- `-c`：以持续输出的方式实时更新显示。
- `-e`：显示扩展的网络信息，包括接收和发送的字节数、错误数量等。
- `-g`：显示组播信息。

## 输出格式

`netstat` 的输出通常包括以下几个重要列：

```
$ netstat -a
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 localhost:33060         0.0.0.0:*               LISTEN
tcp        0      0 127.0.0.53:domain       0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:5353            0.0.0.0:*               LISTEN
```

- **Proto**：显示协议类型（如 TCP、UDP、IPv6 等）。
- **Recv-Q**：接收队列中的字节数，表示接收缓存区未被读取的字节数。
- **Send-Q**：发送队列中的字节数，表示已发送但尚未被确认的数据量。
- **Local Address**：本地端口（即本机 IP 和端口号），如果显示 `0.0.0.0`，表示监听所有接口。
- **Foreign Address**：远程端口（即对端的 IP 和端口号）。
- **State**：显示连接的状态（如 `LISTEN`、`ESTABLISHED`、`TIME_WAIT` 等）。
- **PID/Program name**：显示与连接相关的进程 ID 和程序名称（仅在使用 `-p` 选项时）。

## 输出的连接状态解释

在 `netstat` 的输出中，`State` 列非常重要，尤其是对于 TCP 连接，它显示了连接的当前状态。常见的状态包括：

- **LISTEN**：表示本地端口正在监听来自远程主机的连接请求。
- **ESTABLISHED**：表示连接已成功建立，双方可以进行数据交换。
- **TIME_WAIT**：表示连接关闭后，本地系统会等待一段时间以确保远程系统已收到连接关闭的确认。
- **SYN_SENT**：表示本地系统已发送连接请求，等待远程系统的确认。
- **SYN_RECV**：表示本地系统已收到远程系统的连接请求，正在等待确认。
- **FIN_WAIT1**：表示本地系统已发出连接关闭请求，等待远程系统确认。
- **FIN_WAIT2**：表示远程系统已确认关闭连接，本地系统等待远程系统关闭连接。
- **CLOSE_WAIT**：表示远程系统已关闭连接，本地系统等待应用程序关闭连接。
- **LAST_ACK**：表示本地系统已发送连接关闭请求，等待远程系统的最终确认。
- **CLOSED**：表示连接已经完全关闭。

## netstat 的应用场景

#### 监控网络连接：
- 查看当前有哪些连接是活跃的，哪些端口在监听状态。对于排查网络故障非常有帮助。

#### 排查端口占用：
- 当你无法启动某个应用程序时，可以使用 `netstat` 检查是否已有进程占用了该端口。

#### 系统性能分析：
- 查看网络接口的统计信息，帮助判断是否存在网络瓶颈或高流量，进而做出优化调整。

#### 排查恶意进程：
- 使用 `netstat -p` 结合 `ps` 等工具，查看哪些进程和连接相关。如果发现不明进程在监听可疑端口，可能是恶意进程。

#### 查看路由信息：
- 使用 `netstat -r` 查看当前的路由表，帮助诊断网络路由配置问题。

## netstat 与其他工具的对比

`netstat` 曾是最常用的网络状态查看工具，但随着时间推移，它被一些新的命令和工具逐渐替代，如：

- **`ss`**：`ss` 是一个比 `netstat` 更快、更现代的工具，用于显示套接字（socket）信息。它提供了类似 `netstat` 的功能，但在性能和显示信息的丰富性方面通常更好。
  
  示例：
  ```bash
  ss -tuln
  ```

- **`iftop`**：用于实时监控网络带宽使用情况。可以查看每个连接的带宽消耗。

- **`ip`**：`ip` 命令可以替代 `netstat -r` 来查看路由表，也可以用于管理网络接口和地址。

# 实战例子

## 常用

```sh
netstat -ano
```
每个参数的含义如下：

- **`-a`**：显示所有的连接和监听端口。包括所有 TCP 和 UDP 连接，不仅仅是处于已建立状态的连接，还包括正在监听的端口。

- **`-n`**：以数字格式显示地址和端口号，而不是解析为主机名和服务名。也就是说，IP 地址和端口会以数字的形式展示，不会做 DNS 反向解析。

- **`-o`**：显示与每个连接相关的进程 ID（PID）。这可以帮助你识别哪个进程或应用程序使用了某个端口。

## 查看所有的网络连接（包括 TCP、UDP）

```bash
netstat -a
```

这将列出所有的网络连接，无论是正在使用中的，还是处于监听状态的。

效果：

```
$ netstat -a
Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 localhost:33060         0.0.0.0:*               LISTEN
```

## 查看 TCP 连接

```bash
$ netstat -t
```

仅显示所有的 TCP 连接。TCP 是面向连接的协议，因此显示的是完整的 TCP 连接信息。

效果：

```
$ netstat -t
Active Internet connections (w/o servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
```

## 查看正在监听的端口

```bash
netstat -l
```

只显示当前系统正在监听的端口。适用于检查开放的端口和正在运行的服务。

效果：

```
$ netstat -l
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 localhost:33060         0.0.0.0:*               LISTEN
tcp        0      0 127.0.0.53:domain       0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:5353            0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:ssh             0.0.0.0:*               LISTEN
tcp6       0      0 [::]:5353               [::]:*                  LISTEN
tcp6       0      0 [::]:13306              [::]:*                  LISTEN
tcp6       0      0 [::]:ssh                [::]:*                  LISTEN
udp        0      0 0.0.0.0:mdns            0.0.0.0:*
udp        0      0 127.0.0.53:domain       0.0.0.0:*
udp        0      0 localhost:323           0.0.0.0:*
udp6       0      0 [::]:mdns               [::]:*
udp6       0      0 ip6-localhost:323       [::]:*
Active UNIX domain sockets (only servers)
Proto RefCnt Flags       Type       State         I-Node   Path
unix  2      [ ACC ]     STREAM     LISTENING     24608    /run/WSL/2_interop
```

## 查看网络连接与程序的关系

```bash
netstat -p
```

显示每个连接所对应的进程 ID 和程序名称。

注意，这通常需要超级用户权限（`sudo`），否则会显示为 `PID/Program name`。

## 总结

`netstat` 是一个非常有用的命令，适用于网络连接状态、路由、接口统计等信息的查看。

它对于系统管理员排查网络问题、性能优化、恶意进程检测等场景非常重要。

尽管有一些替代工具如 `ss`，但 `netstat` 仍然是一个经典且常用的命令，尤其是在较旧的系统或需要快速查看网络连接时。

# 参考资料

* any list
{:toc}