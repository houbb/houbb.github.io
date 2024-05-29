---
layout: post
title:  Nginx R31 doc-17-debugging 调试
date: 2018-11-22 8:01:55 +0800 
categories: [Web]
tags: [nginx, windows, sh]
published: true
---

# 前言

大家好，我是老马。很高兴遇到你。

我们为 java 开发者实现了 java 版本的 nginx

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

如果你想知道 servlet 如何处理的，可以参考我的另一个项目：

> 手写从零实现简易版 tomcat [minicat](https://github.com/houbb/minicat) 

## 手写 nginx 系列

如果你对 nginx 原理感兴趣，可以阅读：

[从零手写实现 nginx-01-为什么不能有 java 版本的 nginx?](https://houbb.github.io/2018/11/22/nginx-write-01-how-to)

[从零手写实现 nginx-02-nginx 的核心能力](https://houbb.github.io/2018/11/22/nginx-write-02-basic-http)

[从零手写实现 nginx-03-nginx 基于 Netty 实现](https://houbb.github.io/2018/11/22/nginx-write-03-basic-http-netty)

[从零手写实现 nginx-04-基于 netty http 出入参优化处理](https://houbb.github.io/2018/11/22/nginx-write-04-netty-http-optimize)

[从零手写实现 nginx-05-MIME类型（Multipurpose Internet Mail Extensions，多用途互联网邮件扩展类型）](https://houbb.github.io/2018/11/22/nginx-write-05-mime-type)

[从零手写实现 nginx-06-文件夹自动索引](https://houbb.github.io/2018/11/22/nginx-write-06-dir-list)

[从零手写实现 nginx-07-大文件下载](https://houbb.github.io/2018/11/22/nginx-write-07-big-file)

[从零手写实现 nginx-08-范围查询](https://houbb.github.io/2018/11/22/nginx-write-08-range)

[从零手写实现 nginx-09-文件压缩](https://houbb.github.io/2018/11/22/nginx-write-09-comparess)

[从零手写实现 nginx-10-sendfile 零拷贝](https://houbb.github.io/2018/11/22/nginx-write-10-sendfile)

[从零手写实现 nginx-11-file+range 合并](https://houbb.github.io/2018/11/22/nginx-write-11-file-and-range-merge)

[从零手写实现 nginx-12-keep-alive 连接复用](https://houbb.github.io/2018/11/22/nginx-write-12-keepalive)


# NGINX 调试

通过调试二进制文件、调试日志和核心转储来排除 NGINX 或 NGINX Plus 部署中的问题并追踪错误。

## 介绍

调试帮助您在程序代码出现问题时识别错误。它通常用于开发或测试第三方或实验性模块。

NGINX 调试功能包括调试日志和创建核心转储文件以及进一步的回溯。

## 配置 NGINX 二进制文件进行调试

首先，您需要在 NGINX 二进制文件中启用调试。NGINX Plus 已经为您提供了 nginx-debug 二进制文件，而 NGINX Open Source 需要重新编译。

### 配置 NGINX Plus 二进制文件

从版本 8 开始，NGINX Plus 与标准二进制文件一起提供 nginx-debug 二进制文件。要在 NGINX Plus 中启用调试，您需要从 nginx 切换到 nginx-debug 二进制文件。打开终端并运行以下命令：

```bash
service nginx stop && service nginx-debug start
```

完成后，在配置文件中启用调试日志。

### 编译 NGINX Open Source 二进制文件

要在 NGINX Open Source 中启用调试，您需要使用 configure 脚本中指定的 --with-debug 标志重新编译它。

要编译支持调试的 NGINX Open Source：

1. 下载并解压 NGINX 源文件，转到源文件所在的目录。参见[下载源代码](链接)。
2. 获取 NGINX 配置参数列表。运行命令：

```bash
nginx -V 2>&1 | grep arguments
```

3. 将 --with-debug 选项添加到 configure 命令列表中并运行 configure 脚本：

```bash
./configure --with-debug <其他 configure 参数>
```

4. 编译和安装 NGINX：

```bash
sudo make
sudo make install
```

5. 重新启动 NGINX。

## NGINX 和调试符号

调试符号有助于获取用于调试的附加信息，例如函数、变量、数据结构、源文件和行号信息。

NGINX 默认使用“-g”标志编译，其中包含调试符号。

但是，如果在运行回溯时出现“没有可用的符号表信息”错误，则表示缺少调试符号，您需要重新编译 NGINX 并支持调试符号。

确切的编译器标志取决于编译器。例如，对于 GCC 编译器系统：

- 使用“-g”标志包含调试符号
- 使用“-O0”标志禁用编译器优化，使调试器输出更易于理解：

```bash
./configure --with-debug --with-cc-opt='-O0 -g' ...
```

# 在 NGINX 配置中启用调试日志

调试日志记录错误和与调试相关的任何信息，默认情况下是禁用的。要启用它，请确保 NGINX 已编译支持调试（参见“为调试配置 NGINX 二进制文件”），然后在 NGINX 配置文件中使用 error_log 指令的 debug 参数启用它。调试日志可以写入文件、内存中的分配缓冲区、标准错误输出或 syslog。

建议在 NGINX 配置的“main”级别上启用调试日志，以获得正在进行的完整情况。

## 将调试日志写入文件

将调试日志写入文件可能会在高负载下降低性能。还要注意，文件可能会变得非常大，快速消耗磁盘空间。为减少负面影响，您可以配置调试日志写入内存缓冲区，或为特定 IP 地址设置调试日志。有关详细信息，请参阅“将调试日志写入内存”和“选定 IP 的调试日志”。

要启用将调试日志写入文件：

1. 确保您的 NGINX 配置了 --with-debug 配置选项。运行命令并检查输出是否包含 --with-debug 行：

    ```bash
    nginx -V 2>&1 | grep -- '--with-debug'
    ```

2. 打开 NGINX 配置文件：

    ```bash
    sudo vi /etc/nginx/nginx.conf
    ```

3. 查找 error_log 指令，默认情况下位于 main 上下文中，并将日志级别更改为 debug。如果需要，更改日志文件的路径：

    ```nginx
    error_log  /var/log/nginx/error.log debug;
    ```

4. 保存配置并退出配置文件。

## 将调试日志写入内存

调试日志可以使用循环缓冲区写入内存。优点是，在高负载下，调试级别的日志记录对性能影响不大。

要启用将调试日志写入内存：

1. 确保您的 NGINX 配置了 --with-debug 配置选项。运行命令并检查输出是否包含 --with-debug 行：

    ```bash
    nginx -V 2>&1 | grep -- '--with-debug'
    ```

2. 在 NGINX 配置文件中，使用在 main 上下文中指定的 error_log 指令启用调试日志的内存缓冲区：

    ```nginx
    error_log memory:32m debug;
    ...
    http {
        ...
    }
    ```

## 从内存中提取调试日志

可以使用在 GDB 调试器中执行的脚本从内存缓冲区中提取日志。

要从内存中提取调试日志：

1. 获取 NGINX 工作进程的 PID：

    ```bash
    ps axu |grep nginx
    ```

2. 启动 GDB 调试器：

    ```bash
    sudo gdb -p <在上一步中获得的 nginx PID>
    ```

3. 复制脚本，将其粘贴到 GDB 中并按“Enter”。该脚本将在当前目录中的 debug_log.txt 文件中保存日志：

    ```bash
    set $log = ngx_cycle->log
    while $log->writer != ngx_log_memory_writer
        set $log = $log->next
    end
    set $buf = (ngx_log_memory_buf_t *) $log->wdata
    dump binary memory debug_log.txt $buf->start $buf->end
    ```

4. 通过按下 CTRL+D 退出 GDB。

5. 打开位于当前目录中的“debug_log.txt”文件：

    ```bash
    sudo less debug_log.txt
    ```

## 选定 IP 的调试日志

可以为特定 IP 地址或 IP 地址范围启用调试日志。在生产环境中，记录特定 IP 可能很有用，因为它不会对性能产生负面影响。IP 地址在事件块中的 debug_connection 指令中指定；该指令可以定义多次：

```nginx
error_log /path/to/log;
...
events {
    debug_connection 192.168.1.1;
    debug_connection 192.168.10.0/24;
}
```

## 每个虚拟主机的调试日志

通常，error_log 指令在主上下文中指定，因此适用于所有其他上下文，包括服务器和位置。

但是，如果在特定服务器或位置块内指定了另一个 error_log 指令，则会覆盖全局设置，并且这样的 error_log 指令将设置自己的日志文件路径和调试日志级别。

要为特定虚拟主机设置调试日志，请在特定服务器块内添加 error_log 指令，并设置新的日志文件路径和调试日志级别：

```nginx
error_log /path1/to/log debug;
...
http {
    ...
    server {
    error_log /path2/to/log debug;
    ...
    }
}
```

要禁用特定虚拟主机的调试日志，请在特定服务器块内指定 error_log 指令，并仅指定日志文件路径：

```nginx
error_log /path/to/log debug;
...
http {
    ...
    server {
    error_log /path/to/log;
    ...
    }
}
```

# 启用核心转储

核心转储文件可以帮助识别和修复导致 NGINX 崩溃的问题。核心转储文件可能包含诸如密码和私钥之类的敏感信息，因此请确保对它们进行安全处理。

为了创建核心转储文件，必须在操作系统和 NGINX 配置文件中都启用它们。

## 在操作系统中启用核心转储

在操作系统中执行以下步骤：

1. 指定一个工作目录，用于保存核心转储文件，例如“/tmp/cores”：

    ```bash
    mkdir /tmp/cores
    ```

2. 确保该目录可由 NGINX 工作进程写入：

    ```bash
    sudo chown root:root /tmp/cores
    sudo chmod 1777 /tmp/cores
    ```

3. 禁用核心转储文件的最大大小限制：

    ```bash
    ulimit -c unlimited
    ```

    如果操作以“Cannot modify limit: operation not permitted”结束，请运行以下命令：

    ```bash
    sudo sh -c "ulimit -c unlimited && exec su $LOGNAME"
    ```

4. 为 setuid 和 setgid 进程启用核心转储。

   - 对于 CentOS 7.0、Debian 8.2、Ubuntu 14.04，请运行以下命令：

    ```bash
    echo "/tmp/cores/core.%e.%p" | sudo tee /proc/sys/kernel/core_pattern
    sudo sysctl -w fs.suid_dumpable=2
    sysctl -p
    ```

   - 对于 FreeBSD，请运行以下命令：

    ```bash
    sudo sysctl kern.sugid_coredump=1
    sudo sysctl kern.corefile=/tmp/cores/%N.core.%P
    ```

## 在 NGINX 配置中启用核心转储

要在 NGINX 配置文件中启用核心转储：

1. 打开 NGINX 配置文件：

    ```bash
    sudo vi /usr/local/etc/nginx/nginx.conf
    ```

2. 使用 working_directory 指令定义一个目录，该目录将保存核心转储文件。该指令在主配置级别上指定：

    ```nginx
    working_directory /tmp/cores/;
    ```

3. 确保该目录存在，并由 NGINX 工作进程写入。在终端中运行以下命令：

    ```bash
    sudo chown root:root /tmp/cores
    sudo chmod 1777 /tmp/cores
    ```

4. 使用 worker_rlimit_core 指令指定核心转储文件的最大可能大小。该指令也在主配置级别上指定。如果核心转储文件大小超过该值，将不会创建核心转储文件。

    ```nginx
    worker_rlimit_core 500M;
    ```

    示例：

    ```nginx
    worker_processes   auto;
    error_log          /var/log/nginx/error.log debug;
    working_directory  /tmp/cores/;
    worker_rlimit_core 500M;

    events {
        ...
    }

    http {
        ...
    }
    ```

通过这些设置，核心转储文件将在“/tmp/cores/”目录中创建，只有当其大小不超过 500 兆字节时才会创建。


# 从核心转储文件中获取回溯信息

回溯提供了关于程序崩溃时出错的信息。

要从核心转储文件中获取回溯信息：

1. 使用 GDB 调试器打开核心转储文件，命令格式为：

    ```bash
    sudo gdb <nginx_executable_path> <coredump_file_path>
    ```

2. 输入“backtrace”命令以从崩溃时的堆栈中获取堆栈跟踪信息：

    ```bash
    (gdb) backtrace
    ```

如果“backtrace”命令返回“没有可用的符号表信息”消息，则需要重新编译 NGINX 二进制文件以包含调试符号。请参阅NGINX和调试符号。


# 从运行中的进程中转储NGINX配置

您可以从主进程内存中提取当前的NGINX配置。当您需要：

- 验证已加载的配置
- 如果磁盘上的版本被意外删除或覆盖，恢复以前的配置

配置转储可以通过提供一个GDB脚本来获得，只要您的NGINX具有调试支持。

确保您的NGINX已经构建了调试支持（在configure参数列表中使用--with-debug选项）。运行命令并检查输出是否包含--with-debug行：

```bash
nginx -V 2>&1 | grep -- '--with-debug'
```

获取NGINX工作进程的PID：

```bash
ps axu | grep nginx
```

启动GDB调试器：

```bash
sudo gdb -p <在上一步中获取的NGINX PID>
```

复制并粘贴脚本到GDB中，然后按“Enter”键。该脚本将配置保存在当前目录中的nginx_conf.txt文件中：

```bash
set $cd = ngx_cycle->config_dump
set $nelts = $cd.nelts
set $elts = (ngx_conf_dump_t*)($cd.elts)
while ($nelts-- > 0)
set $name = $elts[$nelts]->name.data
printf "Dumping %s to nginx_conf.txt\n", $name
append memory nginx_conf.txt \
      $elts[$nelts]->buffer.start $elts[$nelts]->buffer.end
end
```

按下CTRL+D退出GDB。

打开位于当前目录中的nginx_conf.txt文件：

```bash
sudo vi nginx_conf.txt
```

在请求帮助时
在请求调试帮助时，请提供以下信息：

- NGINX版本、编译器版本和配置参数。运行命令：

```bash
nginx -V
```

- 当前完整的NGINX配置。请参阅从运行进程中转储NGINX配置

- 调试日志。请参阅在NGINX配置中启用调试日志

- 获取的回溯。请参阅启用核心转储，获取回溯信息。

# 参考资料

https://docs.nginx.com/nginx/admin-guide/monitoring/debugging/

* any list
{:toc}