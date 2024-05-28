---
layout: post
title:  Nginx R31 doc-16-logging 配置日志
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

如果你对 nginx 原理感兴趣，可以读一下

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


# 配置日志记录

在日志文件中详细记录错误和请求处理信息，可以选择在本地或通过 syslog 进行记录。

本文描述了如何在 NGINX Open Source 和 NGINX Plus 中配置错误日志和已处理请求的日志记录。

## 设置错误日志

NGINX 将不同严重程度的问题信息写入错误日志。error_log 指令设置日志记录到特定文件、stderr 或 syslog，并指定要记录的消息的最小严重程度级别。

默认情况下，错误日志位于 logs/error.log（绝对路径取决于操作系统和安装），并记录指定严重程度级别以上的所有消息。

以下配置将错误消息的最小严重程度级别从 error 更改为 warn：

```nginx
error_log logs/error.log warn;
```

在这种情况下，将记录 warn、error、crit、alert 和 emerg 级别的消息。

错误日志的默认设置是全局的。要覆盖它，请将 error_log 指令放置在主（顶级）配置上下文中。主上下文中的设置始终会被其他配置级别（http、server、location）继承。error_log 指令也可以在 http、stream、server 和 location 级别指定，并覆盖从更高级别继承的设置。

在发生错误时，消息仅写入一个错误日志，即发生错误的级别最接近的日志。但是，如果在同一级别上指定了多个 error_log 指令，则消息将写入所有指定的日志。

注意：在 NGINX Open Source 版本 1.5.2 中添加了在同一配置级别上指定多个 error_log 指令的功能。

## 设置访问日志

NGINX 在请求处理完成后立即在访问日志中记录有关客户端请求的信息。默认情况下，访问日志位于 logs/access.log，并且信息以预定义的 combined 格式写入日志。要覆盖默认设置，请使用 log_format 指令更改记录消息的格式，以及 access_log 指令指定日志的位置和格式。日志格式使用变量定义。

以下示例定义了一个日志格式，扩展了预定义的 combined 格式，其中包含指示响应 gzip 压缩比的值。然后，将此格式应用于启用了压缩的虚拟服务器。

```nginx
http {
    log_format compression '$remote_addr - $remote_user [$time_local] '
                           '"$request" $status $body_bytes_sent '
                           '"$http_referer" "$http_user_agent" "$gzip_ratio"';

    server {
        gzip on;
        access_log /spool/logs/nginx-access.log compression;
        ...
    }
}
```

另一个日志格式的示例可跟踪 NGINX 和上游服务器之间的不同时间值，这可能有助于诊断网站出现缓慢的问题。您可以使用以下变量记录指定的时间值：

- $upstream_connect_time – 与上游服务器建立连接所花费的时间
- $upstream_header_time – 从上游服务器建立连接到接收到响应头的第一个字节所花费的时间
- $upstream_response_time – 从建立连接到从上游服务器接收到响应体的最后一个字节所花费的时间
- $request_time – 处理请求所花费的总时间

所有时间值以秒为单位，毫秒为分辨率。

```nginx
http {
    log_format upstream_time '$remote_addr - $remote_user [$time_local] '
                             '"$request" $status $body_bytes_sent '
                             '"$http_referer" "$http_user_agent"'
                             'rt=$request_time uct="$upstream_connect_time" uht="$upstream_header_time" urt="$upstream_response_time"';

    server {
        access_log /spool/logs/nginx-access.log upstream_time;
        ...
    }
}
```

在读取结果时间值时，请注意以下内容：

- 当一个请求通过多个服务器处理时，变量包含用逗号分隔的多个值
- 当存在从一个上游组到另一个的内部重定向时，值以分号分隔
- 当请求无法到达上游服务器或无法接收到完整的头时，变量包含 0
- 在连接到上游时出现内部错误或从缓存中获取回复时，变量包含 -（连字符）

通过启用消息日志的缓冲区和常用日志文件描述符的缓存，可以优化日志记录。使用 access_log 指令的 buffer 参数指定缓冲区的大小。当下一个日志消息不适合缓冲区时，以及在某些其他情况下，缓冲的消息随后写入日志文件。

要启用日志文件描述符的缓存，请使用 open_log_file_cache 指令。

与 error_log 指令类似，在特定配置级别上定义的 access_log 指令会覆盖来自前一级别的设置。

当请求处理完成时，消息将写入配置在当前级别上的日志，或从前一级别继承的日志。

如果一个级别定义了多个访问日志，消息将写入所有这些日志。

# 启用条件日志记录

条件日志记录允许从访问日志中排除微不足道或不重要的日志条目。在 NGINX 中，通过 access_log 指令的 if 参数来启用条件日志记录。

以下示例排除了 HTTP 状态码为 2xx（成功）和 3xx（重定向）的请求：

```nginx
map $status $loggable {
    ~^[23]  0;
    default 1;
}

access_log /path/to/access.log combined if=$loggable;
```

**用例：抽样 TLS 参数**

许多客户端使用早于 TLS 1.3 的 TLS 版本。虽然许多密码被声明为不安全，但旧的实现仍在使用它们；ECC 证书比 RSA 提供更好的性能，但并非所有客户端都能接受 ECC。许多 TLS 攻击依赖于“中间人”，该中间人拦截密码协商握手并强制客户端和服务器选择较不安全的密码。因此，重要的是将 NGINX Plus 配置为不支持弱密码或遗留密码，但这样做可能会排除遗留客户端。

您可以评估从客户端获取的 SSL 数据，并确定如果删除对旧 SSL 协议和密码的支持，将有多少比例的客户端被排除在外。

以下配置示例记录了任何连接的 TLS 客户端的 SSL 协议、密码和 User-Agent 标头，假设每个客户端选择其支持的最新协议和最安全的密码。

在此示例中，每个客户端由其唯一的 IP 地址和 User-Agent 组合标识。

定义包括 SSL 协议版本（$ssl_protocol）、连接中使用的密码（$ssl_cipher）、客户端 IP 地址（$remote_addr）和标准 User Agent HTTP 请求字段的值（$http_user_agent）的自定义日志格式 sslparams：

```nginx
log_format sslparams '$ssl_protocol $ssl_cipher '
                  '$remote_addr "$http_user_agent"';
```

定义一个键值存储，将客户端的 IP 地址和其 User Agent 保存在其中，例如，clients：

```nginx
keyval_zone zone=clients:80m timeout=3600s;
```

为每个唯一的 $remote_addr 和 User-Agent 标头组合创建一个变量，例如，$seen：

```nginx
keyval $remote_addr:$http_user_agent $seen zone=clients;
```

```nginx
server {
    listen 443 ssl;

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers   HIGH:!aNULL:!MD5;

    if ($seen = "") {
        set $seen  1;
        set $logme 1;
    }
    access_log  /tmp/sslparams.log sslparams if=$logme;

    # ...
}
```

查看使用此配置生成的日志文件：

```nginx
TLSv1.2 AES128-SHA 1.1.1.1 "Mozilla/5.0 (X11; Linux x86_64; rv:45.0) Gecko/20100101 Firefox/45.0"
TLSv1.2 ECDHE-RSA-AES128-GCM-SHA256 2.2.2.2 "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1"
TLSv1.2 ECDHE-RSA-AES128-GCM-SHA256 3.3.3.3 "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:58.0) Gecko/20100101 Firefox/58.0"
TLSv1.2 ECDHE-RSA-AES128-GCM-SHA256 4.4.4.4 "Mozilla/5.0 (Android 4.4.2; Tablet; rv:65.0) Gecko/65.0 Firefox/65.0"
TLSv1 AES128-SHA 5.5.5.5 "Mozilla/5.0 (Android 4.4.2; Tablet; rv:65.0) Gecko/65.0 Firefox/65.0"
TLSv1.2 ECDHE-RSA-CHACHA20-POLY1305 6.6.6.6 "Mozilla/5.0 (Linux; U; Android 5.0.2; en-US; XT1068 Build/LXB22.46-28) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/57.0.2987.108 UCBrowser/12.10.2.1164 Mobile Safari/537.36"
```

处理日志文件以确定数据的分布：

```nginx
cat /tmp/sslparams.log | cut -d ' ' -f 2,2 | sort | uniq -c | sort -rn | perl -ane 'printf "%30s %s\n", $F[1], "="x$F[0];'
```

在此输出中，识别了低容量、不太安全的密码：

```nginx
ECDHE-RSA-AES128-GCM-SHA256 =========================
ECDHE-RSA-AES256-GCM-SHA384 ========
                 AES128-SHA ====
ECDHE-RSA-CHACHA20-POLY1305 ==
    ECDHE-RSA-AES256-SHA384 ==
```

然后，您可以检查日志以确定哪些客户端正在使用这些密码，然后做出有关从 NGINX Plus 配置中删除这些密码的决定。

有关使用 NGINX 条件日志记录进行请求抽样的更多信息，请参阅[博客文章](https://www.nginx.com/blog/sampling-requests-with-nginx-conditional-logging/#var_request_id)。

## 记录到 Syslog

syslog 实用程序是计算机消息记录的标准，它允许将日志消息从不同设备发送到单个 syslog 服务器。在 NGINX 中，通过 error_log 和 access_log 指令的 syslog: 前缀来配置日志记录到 syslog。

Syslog 消息可以发送到 server=，可以是域名、IP 地址或 UNIX 域套接字路径。域名或 IP 地址可以使用端口指定，以覆盖默认端口 514。UNIX 域套

接字路径可以在 unix: 前缀之后指定：

```nginx
error_log  syslog:server=unix:/var/log/nginx.sock debug;
access_log syslog:server=[2001:db8::1]:1234,facility=local7,tag=nginx,severity=info;
```

在此示例中，NGINX 错误日志消息写入了一个 UNIX 域套接字，并设置为调试日志级别，访问日志写入了一个带有 IPv6 地址和端口 1234 的 syslog 服务器。

facility= 参数指定记录消息的程序类型。默认值为 local7。其他可能的值包括：auth、authpriv、daemon、cron、ftp、lpr、kern、mail、news、syslog、user、uucp、local0 ... local7。

tag= 参数将自定义标签应用于 syslog 消息（在我们的示例中为 nginx）。

severity= 参数设置了访问日志的 syslog 消息的严重级别。按照严重级别递增的可能值是：debug、info、notice、warn、error（默认）、crit、alert 和 emerg。消息以指定级别和所有更严重级别记录。在我们的示例中，严重级别 error 还启用了 crit、alert 和 emerg 级别的记录。

## 实时活动监控

NGINX Plus 提供了实时活动监控界面，显示您的 HTTP 和 TCP 上游服务器的关键负载和性能指标。有关更多信息，请参阅实时活动监控文章。

要了解有关 NGINX Plus 的更多信息，请访问[产品页面](https://www.nginx.com/products/)。

# 参考资料

https://docs.nginx.com/nginx/admin-guide/monitoring/logging/

* any list
{:toc}