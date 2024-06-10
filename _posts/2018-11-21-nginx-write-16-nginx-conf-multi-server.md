---
layout: post
title:  从零手写实现 nginx-16-nginx.conf 支持配置多个 server
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, nginx-in-action, sh]
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

[从零手写实现 nginx-13-nginx.conf 配置文件介绍](https://houbb.github.io/2018/11/22/nginx-write-13-nginx-conf-intro)

[从零手写实现 nginx-14-nginx.conf 和 hocon 格式有关系吗？](https://houbb.github.io/2018/11/22/nginx-write-14-nginx-conf-hocon)

[从零手写实现 nginx-15-nginx.conf 如何通过 java 解析处理？](https://houbb.github.io/2018/11/22/nginx-write-15-nginx-conf-parser)

[从零手写实现 nginx-16-nginx 支持配置多个 server](https://houbb.github.io/2018/11/22/nginx-write-16-nginx-conf-multi-server)

[从零手写实现 nginx-17-nginx 默认配置优化](https://houbb.github.io/2018/11/22/nginx-write-17-nginx-conf-global-default)

[从零手写实现 nginx-18-nginx 请求头+响应头操作](https://houbb.github.io/2018/11/22/nginx-write-18-nginx-conf-header-oper)

[从零手写实现 nginx-19-nginx cors](https://houbb.github.io/2018/11/22/nginx-write-19-cors)

[从零手写实现 nginx-20-nginx 占位符 placeholder](https://houbb.github.io/2018/11/22/nginx-write-20-placeholder)

# 目标

这一节我们带着这几个问题来学习：

1）nginx.conf 配置的时候支持配置多个 server 模块吗？为什么要支持？

2）不同的 server 模块，监听端口必须相同吗？如果不同，nginx 又如何匹配区分呢？

3) 不同的 server 模块，代码启动要如何调整?

4) 实现的核心思路+代码是什么样的

# nginx.conf 配置的时候支持配置多个 server 模块吗？为什么要支持？

在 Nginx 配置文件 (`nginx.conf`) 中，确实支持配置多个 `server` 模块。

这种支持是为了满足以下几个需求：

### 1. 多域名支持

多个 `server` 模块允许 Nginx 处理多个域名或子域名。

例如，你可以为 `example.com` 和 `sub.example.com` 分别配置不同的服务器块：

```nginx
http {
    server {
        listen 80;
        server_name example.com;
        location / {
            root /var/www/example.com;
        }
    }

    server {
        listen 80;
        server_name sub.example.com;
        location / {
            root /var/www/sub.example.com;
        }
    }
}
```

### 2. 不同端口支持

你可以为不同的服务配置不同的端口。

例如，一个站点可以运行在端口 80（HTTP），另一个站点可以运行在端口 443（HTTPS）：

```nginx
http {
    server {
        listen 80;
        server_name example.com;
        location / {
            root /var/www/example.com;
        }
    }

    server {
        listen 443 ssl;
        server_name example.com;
        ssl_certificate /etc/nginx/ssl/example.com.crt;
        ssl_certificate_key /etc/nginx/ssl/example.com.key;
        location / {
            root /var/www/example.com;
        }
    }
}
```

### 3. 不同配置需求

每个 `server` 模块可以有自己的配置，例如不同的日志文件、错误页、访问控制策略等：

```nginx
http {
    server {
        listen 80;
        server_name example1.com;
        access_log /var/log/nginx/example1_access.log;
        error_log /var/log/nginx/example1_error.log;
        location / {
            root /var/www/example1.com;
        }
    }

    server {
        listen 80;
        server_name example2.com;
        access_log /var/log/nginx/example2_access.log;
        error_log /var/log/nginx/example2_error.log;
        location / {
            root /var/www/example2.com;
        }
    }
}
```

### 4. 反向代理和负载均衡

Nginx 常用作反向代理服务器，可以将请求转发到不同的后端服务器。

每个 `server` 模块可以有不同的反向代理配置：

```nginx
http {
    upstream backend1 {
        server 127.0.0.1:8080;
        server 127.0.0.1:8081;
    }

    upstream backend2 {
        server 127.0.0.1:9090;
        server 127.0.0.1:9091;
    }

    server {
        listen 80;
        server_name api.example.com;
        location / {
            proxy_pass http://backend1;
        }
    }

    server {
        listen 80;
        server_name web.example.com;
        location / {
            proxy_pass http://backend2;
        }
    }
}
```

### 为什么要支持多个 `server` 模块？

1. **灵活性**：不同的站点或服务可以有不同的配置，满足不同的需求。
2. **扩展性**：可以轻松地添加或修改配置而不影响其他站点或服务。
3. **维护性**：分离配置使得每个站点的配置文件更加简洁和易于维护。
4. **安全性**：不同站点可以有不同的安全配置，降低风险。

综上所述，Nginx 支持多个 `server` 模块，使其能够灵活地管理和配置多个站点和服务，满足各种不同的需求。


# 不同的 server 模块，监听端口必须相同吗？如果端口相同，nginx 又如何匹配区分呢？

## 监听端口不同

不同的 `server` 模块并不需要监听相同的端口。

实际上，配置不同的 `server` 模块监听不同的端口是一个常见的需求。

例如，一个站点可以运行在端口 80（HTTP），另一个站点可以运行在端口 443（HTTPS），或者其他自定义端口。

以下是一个简单的示例：

```nginx
http {
    server {
        listen 80;
        server_name example.com;
        location / {
            root /var/www/example.com;
        }
    }

    server {
        listen 8080;
        server_name example.com;
        location / {
            root /var/www/example.com;
        }
    }
}
```

在这个示例中，`example.com` 同时监听了端口 80 和 8080。

## 如果端口相同，Nginx 如何匹配和区分？

当多个 `server` 模块监听相同的端口时，Nginx 使用 `server_name` 和 `location` 来匹配和区分请求。

匹配流程如下：

1. **根据 `server_name` 进行匹配**：当一个请求到达 Nginx 时，Nginx 首先根据请求头中的 `Host` 字段与配置中的 `server_name` 进行匹配。`server_name` 可以是具体的域名、通配符（例如 `*.example.com`）、正则表达式等。

2. **默认服务器**：如果没有匹配到 `server_name`，Nginx 会选择一个默认的 `server` 模块处理请求。默认服务器是第一个定义的 `server` 模块，或者在 `listen` 指令中显式指定 `default_server`。

例如：

```nginx
http {
    server {
        listen 80 default_server;
        server_name default.example.com;
        location / {
            root /var/www/default;
        }
    }

    server {
        listen 80;
        server_name example.com;
        location / {
            root /var/www/example;
        }
    }

    server {
        listen 80;
        server_name another.example.com;
        location / {
            root /var/www/another;
        }
    }
}
```

在这个配置中：

- 请求 `example.com` 会匹配第二个 `server` 模块。
- 请求 `another.example.com` 会匹配第三个 `server` 模块。
- 任何其他没有明确匹配到的请求将会被第一个 `server` 模块（默认服务器）处理。

### 更详细的匹配机制

当多个 `server` 模块的 `server_name` 都能匹配到一个请求时，Nginx 会选择最具体的匹配。

例如：

```nginx
http {
    server {
        listen 80;
        server_name *.example.com;
        location / {
            root /var/www/wildcard;
        }
    }

    server {
        listen 80;
        server_name www.example.com;
        location / {
            root /var/www/www;
        }
    }
}
```

对于请求 `www.example.com`，Nginx 会选择第二个 `server` 模块，因为它比通配符匹配更具体。

### 正则表达式匹配

Nginx 还支持使用正则表达式进行 `server_name` 匹配，这种匹配方式的优先级最低，只在前面的精确匹配和通配符匹配失败后才会被使用：

```nginx
http {
    server {
        listen 80;
        server_name ~^www\d+\.example\.com$;
        location / {
            root /var/www/regex;
        }
    }
}
```

在这个例子中，`www1.example.com` 和 `www2.example.com` 都会匹配到这个 `server` 模块。

综上所述，当多个 `server` 模块监听相同端口时，Nginx 会通过 `server_name` 和匹配规则来区分不同的请求，从而将请求路由到正确的 `server` 模块。

# 多个 server 端口启动的方式调整

## 单个 server 启动

因为单个 server 我们只需要监听一个端口，启动的核心代码如下：

```java
// @author: 老马啸西风
// 服务器监听的端口号
String host = InnerNetUtil.getHost();

EventLoopGroup bossGroup = new NioEventLoopGroup();
//worker 线程池的数量默认为 CPU 核心数的两倍
EventLoopGroup workerGroup = new NioEventLoopGroup();

try {
    final String httpServerPrefix = String.format("http://%s:%s/", host, port);
    nginxConfig.setHttpServerPrefix(httpServerPrefix);
    ServerBootstrap serverBootstrap = new ServerBootstrap();
    serverBootstrap.group(bossGroup, workerGroup)
            .channel(NioServerSocketChannel.class)
            .childHandler(new ChannelInitializer<SocketChannel>() {
                @Override
                protected void initChannel(SocketChannel ch) throws Exception {
                    // 配置
                }
            })
            .option(ChannelOption.SO_BACKLOG, 128)
            .childOption(ChannelOption.SO_KEEPALIVE, true);
    // Bind and start to accept incoming connections.
    ChannelFuture future = serverBootstrap.bind(port).sync();
    log.info("[Nginx4j] listen on {}", httpServerPrefix);
    // Wait until the server socket is closed.
    future.channel().closeFuture().sync();
} catch (InterruptedException e) {
    log.error("[Nginx4j] start meet ex", e);
    throw new Nginx4jException(e);
} finally {
    workerGroup.shutdownGracefully();
    bossGroup.shutdownGracefully();
    log.info("[Nginx4j] shutdownGracefully", host, port);
}
```

## 多个 server port 启动时

如果有不同的监听端口，那么就要调整为：

```java
Set<Integer> httpServerPortSet = nginxConfig.getNginxUserConfig().getServerPortSet();
// 需要验证这里是否支持多个？
for(Integer port : httpServerPortSet) {
    // 单个启动
}
```

但是这段代码实际上会卡主，因为 Netty 只会启动并阻塞在第一个端口上，因为 `future.channel().closeFuture().sync()` 会阻塞当前线程，直到通道关闭。

这意味着在第一个端口启动并阻塞后，后续的端口启动代码将永远不会执行。

## 引入线程池

为了让多个 port 服务正常启动，我们引入线程池。

```java
//@author: 老马啸西风
@Override
public void start() {
    Set<Integer> httpServerPortSet = nginxConfig.getNginxUserConfig().getServerPortSet();
    ExecutorService executorService = Executors.newFixedThreadPool(httpServerPortSet.size());
    // 需要验证这里是否支持多个？
    for (final Integer port : httpServerPortSet) {
        executorService.submit(new Runnable() {
            @Override
            public void run() {
                log.info(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> START port={}", port);
                singleStart(port);
                log.info(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END port={}", port);
            }
        });
    }
}
```

## 配置的过滤

因为配置的时候，可以按照不同的 port

比如下面这样：

```conf
# nginx.conf

# 定义运行Nginx的用户和组
user nginx;

# 主进程的PID文件存放位置
pid /var/run/nginx.pid;

# 事件模块配置
events {
    worker_connections 1024;  # 每个工作进程的最大连接数
}

# HTTP模块配置
http {
    include /etc/nginx/mime.types;  # MIME类型配置文件
    default_type application/octet-stream;  # 默认的MIME类型

    # 文件传输设置
    sendfile on;  # 开启高效文件传输
    # Keepalive超时设置
    keepalive_timeout 65;

    # 定义服务器块
    server {
        listen 8080;
        server_name 192.168.1.12:8080;  # 服务器域名

        # 单独为这个 server 启用 sendfile
        sendfile on;

        # 静态文件的根目录
        root D:\data\nginx4j;  # 静态文件存放的根目录
        index index.html index.htm;  # 默认首页

        # 如果需要为这个 server 单独配置 gzip，可以覆盖全局配置
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        # 定义location块，处理对根目录的请求
        location / {
            try_files $uri $uri/ =404;  # 尝试提供请求的文件，如果不存在则404
        }
    }

    # 定义服务器块2
    server {
        listen 8081;
        server_name 192.168.1.12:8081;  # 服务器域名

        # 单独为这个 server 启用 sendfile
        sendfile on;

        # 静态文件的根目录
        root D:\data\nginx4j;  # 静态文件存放的根目录
        index index.txt; # 默认首页
    }

}
```

我们在初始化的时候，按照 port 过滤分组

```java
protected NginxConfig buildCurrentNginxConfig(NginxConfig nginxConfig,
                                              final int port,
                                              final String httpServerPrefix) {
    NginxConfig currentNginxConfig = new NginxConfig();
    // 省略基础属性

    // 按照端口号过滤
    List<NginxUserServerConfig> userServerConfigs = nginxConfig.getNginxUserConfig().getServerConfigList();
    // 过滤出 port 的列表并按 hostName 分组
    Map<String, List<NginxUserServerConfig>> groupedByHostName = new HashMap<>();
    if (CollectionUtil.isNotEmpty(userServerConfigs)) {
        groupedByHostName = userServerConfigs.stream()
                .filter(userConfig -> userConfig.getHttpServerListen() == port)
                .collect(Collectors.groupingBy(NginxUserServerConfig::getHttpServerName));
    }
    currentUserConfig.setCurrentServerConfigMap(groupedByHostName);
    currentNginxConfig.setNginxUserConfig(currentUserConfig);
    log.info("[Netty] Server start port={}, groupedByHostName={}", port, groupedByHostName);
    return currentNginxConfig;
}
```

## 使用

我们启动后设置了对应的配置，在请求过来时，可以根据请求信息直接匹配

```java
/**
 * 按照 hostName 匹配
 *
 * TODO: 这个匹配策略可以单独独立出来，后续可以拓展。
 * 比如最佳的 URL 匹配等等。
 *
 * @param hostName hostName
 * @return 结果
 */
public NginxUserServerConfig getNginxUserServerConfig(String hostName) {
    final Map<String, List<NginxUserServerConfig>> serverConfigMap = nginxConfig.getNginxUserConfig().getCurrentServerConfigMap();
    List<NginxUserServerConfig> serverConfigList = serverConfigMap.get(hostName);
    // 返回自定义
    if(CollectionUtil.isNotEmpty(serverConfigList)) {
        return serverConfigList.get(0);
    }
    // 默认的配置
    List<NginxUserServerConfig> currentDefineserverConfigList = serverConfigMap.get(NginxConst.DEFAULT_SERVER);
    if(CollectionUtil.isNotEmpty(currentDefineserverConfigList)) {
        return currentDefineserverConfigList.get(0);
    }
    // 全局默认
    return nginxConfig.getNginxUserConfig().getDefaultUserServerConfig();
}
```

当然，这里的实现比较简陋。

后续可以对这里进行拓展。

# 小结

我们可以发现 nginx 设计的非常灵活+强大。

值得我们深入学习其背后的思想+理念。

------------------------------------------------------------------------------------------------------------------------------------

# 参考资料

* any list
{:toc}