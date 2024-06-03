---
layout: post
title:  从零手写实现 nginx-18-nginx.conf header 信息操作
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

# 目标

我们希望可以通过配置对 header 进行相关操作，比如添加 cors 响应。

这里应该分为两个部分：

1）请求头的统一处理

2）响应头的统一处理

处理又包含 增删改。

# 指令

抱歉，之前的回答有点冗长了。其实，对于请求头和响应头的增删改操作，各自都有一个主要指令即可。

### 请求头的增删改指令

- **增加或修改请求头**：使用 `proxy_set_header` 指令。
- **删除请求头**：同样使用 `proxy_set_header` 指令，但将值设为空。

```nginx
proxy_set_header Header-Name Value;  # 增加或修改
proxy_set_header Header-Name "";     # 删除
```

### 响应头的增删改指令

- **增加或修改响应头**：使用 `add_header` 指令。
- **删除响应头**：使用 `proxy_hide_header` 指令。

```nginx
add_header Header-Name Value;        # 增加或修改
proxy_hide_header Header-Name;       # 删除
```

### 示例

#### 请求头的增删改
```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        # 增加或修改请求头
        proxy_set_header X-Real-IP $remote_addr;
        
        # 删除请求头
        proxy_set_header X-Unwanted-Header "";

        proxy_pass http://backend;
    }
}
```

#### 响应头的增删改
```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;

        # 增加或修改响应头
        add_header X-Response-Time $request_time;
        
        # 删除响应头
        proxy_hide_header X-Unwanted-Header;
    }
}
```

这样就可以简洁地实现对请求头和响应头的增删改操作。






# 小结

这里有一个难点，就在于如何平衡配置的灵活性+用户使用的易用性。

# chat

## nginx 如何实现请求的 header 处理？响应的 header 处理？

在 Nginx 中，可以通过配置文件来实现对请求头和响应头的处理。以下是一些常用的配置示例：

### 处理请求头
要处理请求头，可以使用 `set` 指令和 `map` 指令，以及 `proxy_set_header` 指令等。以下是一些示例：

#### 修改请求头
```conf
server {
    listen 80;
    server_name example.com;

    location / {
        # 修改请求头
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;

        proxy_pass http://backend;
    }
}
```

#### 添加或删除请求头
```conf
server {
    listen 80;
    server_name example.com;

    location / {
        # 添加新的请求头
        proxy_set_header X-New-Header "HeaderValue";

        # 删除请求头
        proxy_set_header X-Unwanted-Header "";

        proxy_pass http://backend;
    }
}
```

#### 使用 `map` 指令修改请求头
```conf
http {
    map $http_user_agent $custom_header_value {
        default "default_value";
        "~*Chrome" "chrome_value";
        "~*Firefox" "firefox_value";
    }

    server {
        listen 80;
        server_name example.com;

        location / {
            # 根据 user agent 设置自定义请求头
            proxy_set_header X-Custom-Header $custom_header_value;
            proxy_pass http://backend;
        }
    }
}
```

### 处理响应头
要处理响应头，可以使用 `add_header` 和 `proxy_hide_header` 指令等。以下是一些示例：

#### 添加响应头
```conf
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;

        # 添加响应头
        add_header X-Response-Time $request_time;
    }
}
```

#### 修改响应头
```conf
http {
    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://backend;

            # 修改响应头
            proxy_set_header X-New-Header "NewValue";
        }
    }
}
```

#### 删除响应头
```conf
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;

        # 删除某个响应头
        proxy_hide_header X-Unwanted-Header;
    }
}
```

### 综合示例
以下是一个综合示例，展示了如何同时处理请求头和响应头：

```conf
server {
    listen 80;
    server_name example.com;

    location / {
        # 修改和添加请求头
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_set_header X-New-Header "NewValue";

        # 代理请求到后端服务器
        proxy_pass http://backend;

        # 添加和修改响应头
        add_header X-Response-Time $request_time;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        proxy_set_header X-Custom-Response-Header "CustomValue";
        proxy_hide_header X-Unwanted-Header;
    }
}
```

通过这些配置示例，你可以根据实际需求对 Nginx 中的请求头和响应头进行灵活的处理。

## 为什么 nginx 对于请求头/响应头的指令不一致呢？

请求头一个指令，响应头却是多个？

在 Nginx 中，请求头和响应头的处理使用了不同的指令，这主要是由于历史原因和配置的设计理念。

尽管一个单一的指令例如 `proxy_set_resp_header` 可能会使配置更加统一和简洁，但 Nginx 目前的设计选择了使用不同的指令来分别处理这些操作。

以下是一些背景和原因：

### 不同指令的背景

1. **请求头的处理 (`proxy_set_header`)**:
    - `proxy_set_header` 指令专门用于设置和修改发送到后端服务器的请求头。这是 Nginx 代理模块的一部分，用于确保代理服务器能够正确传递和修改客户端请求的信息。

2. **响应头的处理 (`add_header` 和 `proxy_hide_header`)**:
    - `add_header` 指令用于在响应中添加新的头或修改现有的响应头。这指令不局限于代理模块，而是可以在任何 HTTP 响应中使用。
    - `proxy_hide_header` 指令专门用于隐藏或删除从后端服务器收到的响应头。这是代理模块的一部分，用于控制从后端传递到客户端的响应头。

### 设计选择
Nginx 的设计选择不同的指令来处理请求头和响应头，主要是基于以下考虑：

- **灵活性和控制**：使用不同的指令可以更精确地控制每个处理阶段。例如，`proxy_set_header` 是专门为请求头设计的，而 `add_header` 可以在任何 HTTP 响应阶段使用。

- **模块化设计**：Nginx 通过不同模块提供功能，每个模块有其专门的指令集。代理模块 (`proxy`) 和 HTTP 核心模块 (`http_core`) 提供了针对不同场景的指令。

- **历史兼容性**：Nginx 是一个长期发展的项目，保持历史兼容性对于用户配置和升级非常重要。现有指令的使用习惯已经深入人心，改变这种设计需要非常慎重。

尽管 `proxy_set_resp_header` 这样的统一指令看起来会更简洁，但现有的指令设计提供了更大的灵活性和控制力，适应了不同场景的需求。

### 当前的实际操作
以下是如何使用现有指令进行请求头和响应头处理的示例：

#### 请求头
```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        # 增加或修改请求头
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Custom-Header "custom_value";
        
        # 删除请求头
        proxy_set_header X-Unwanted-Header "";

        proxy_pass http://backend;
    }
}
```

#### 响应头
```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;

        # 增加或修改响应头
        add_header X-Response-Time $request_time;
        add_header X-Custom-Response "custom_response_value";
        
        # 删除响应头
        proxy_hide_header X-Unwanted-Header;
    }
}
```

希望这些解释能帮助你理解为什么 Nginx 选择了这种设计方式。

# 参考资料

* any list
{:toc}