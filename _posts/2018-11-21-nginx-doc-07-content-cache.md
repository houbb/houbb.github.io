---
layout: post
title:  Nginx R31 doc-07-内容缓存
date: 2018-11-22 8:01:55 +0800
categories: [Web]
tags: [nginx, windows, sh]
published: true
---


# NGINX 内容缓存

从代理的 Web 和应用服务器缓存静态和动态内容，以加快向客户端的传输速度并减轻服务器的负载。

## 概览

启用缓存时，NGINX Plus 会将响应保存在磁盘缓存中，并使用它们来响应客户端，而无需每次都代理相同内容的请求。

要了解有关 NGINX Plus 缓存功能的更多信息，请观看点播的 Content Caching with NGINX 网络研讨会，并深入了解诸如动态内容缓存、缓存清除和延迟缓存等功能。

## 启用响应缓存

要启用缓存，请在顶级 http {} 上下文中包含 proxy_cache_path 指令。第一个必需参数是用于缓存内容的本地文件系统路径，必需的 keys_zone 参数定义了用于存储关于缓存项的元数据的共享内存区的名称和大小：

```nginx
http {
    # ...
    proxy_cache_path /data/nginx/cache keys_zone=mycache:10m;
}
```

然后，在您希望缓存服务器响应的上下文（协议类型、虚拟服务器或位置）中包含 proxy_cache 指令，指定由 proxy_cache_path 指令中的 keys_zone 参数定义的区域名称（在此示例中为 mycache）：

```nginx
http {
    # ...
    proxy_cache_path /data/nginx/cache keys_zone=mycache:10m;
    server {
        proxy_cache mycache;
        location / {
            proxy_pass http://localhost:8000;
        }
    }
}
```

请注意，由 keys_zone 参数定义的大小不限制缓存响应数据的总量。缓存的响应本身存储在文件系统上的特定文件中，其中包含元数据的副本。要限制缓存响应数据的总量，请在 proxy_cache_path 指令中包含 max_size 参数。（但请注意，缓存数据的量在缓存管理器激活之间的时间段内可能会暂时超过此限制，如下一节所述。）

## 参与缓存的 NGINX 进程

在缓存中涉及两个额外的 NGINX 进程：

- 缓存管理器定期激活以检查缓存的状态。如果缓存大小超过由 proxy_cache_path 指令中的 max_size 参数设置的限制，缓存管理器将删除最近最少访问的数据。如前所述，缓存数据的量在缓存管理器激活之间的时间段内可能会暂时超过此限制。
  
- 缓存加载器仅在 NGINX 启动后立即运行一次。它将先前缓存数据的元数据加载到共享内存区中。一次性加载整个缓存可能会消耗足够的资源，从而在启动后的前几分钟内降低 NGINX 的性能。为了避免这种情况，请通过在 proxy_cache_path 指令中包含以下参数来配置缓存的迭代加载：

  - loader_threshold – 迭代的持续时间，以毫秒为单位（默认值为 200）
  - loader_files – 在一次迭代中加载的最大项目数（默认值为 100）
  - loader_sleeps – 迭代之间的延迟，以毫秒为单位（默认值为 50）

在以下示例中，迭代持续时间为 300 毫秒，或者在加载 200 个项目后停止：

```nginx
proxy_cache_path /data/nginx/cache keys_zone=mycache:10m loader_threshold=300 loader_files=200;
```

## 指定要缓存的请求

默认情况下，NGINX Plus 会缓存所有使用 HTTP GET 和 HEAD 方法发出的请求的响应，第一次收到此类响应时。作为请求的键（标识符），NGINX Plus 使用请求字符串。如果请求具有与缓存响应相同的键，NGINX Plus 将缓存响应发送给客户端。您可以在 http {}、server {} 或 location {} 上下文中包含各种指令，以控制哪些响应被缓存。

要更改用于计算键的请求特征，请包含 proxy_cache_key 指令：

```nginx
proxy_cache_key "$host$request_uri$cookie_user";
```

要定义具有相同键的请求必须被制作多少次才能将响应缓存，请包含 proxy_cache_min_uses 指令：

```nginx
proxy_cache_min_uses 5;
```

要缓存除 GET 和 HEAD 外的其他方法的请求的响应，请将它们与 GET 和 HEAD 一起列在 proxy_cache_methods 指令的参数中：

```nginx
proxy_cache_methods GET HEAD POST;
```

## 限制或禁用缓存

默认情况下，响应将无限期地保留在缓存中。只有当缓存超过最大配置大小时，它们才会被删除，并且根据它们自上次请求以来的时间长度的顺序进行删除。

您可以通过在 http {}、server {} 或 location {} 上下文中包含指令来设置缓存响应的有效期限，或者甚至确定它们是否被使用：

要限制特定状态代码的缓存响应被视为有效的时间，请包含 proxy_cache_valid 指令：

```nginx
proxy_cache_valid 200 302 10m;
proxy_cache_valid 404      1m;
```

在此示例中，代码为 200 或 302 的响应在 10 分钟内视为有效，而代码为 404 的响应在 1 分钟内视为有效。要为所有状态代码的响应定义有效时间，请将任何指定为第

一个参数：

```nginx
proxy_cache_valid any 5m;
```

要定义 NGINX Plus 在何种情况下不会向客户端发送缓存的响应，请包含 proxy_cache_bypass 指令。每个参数都定义一个条件，并由一些变量组成。如果至少有一个参数不为空且不等于 “0”（零），NGINX Plus 就不会在缓存中查找响应，而是立即将请求转发到后端服务器。

```nginx
proxy_cache_bypass $cookie_nocache $arg_nocache$arg_comment;
```

要定义 NGINX Plus 在何种情况下根本不缓存响应，请包含 proxy_no_cache 指令，并以与 proxy_cache_bypass 指令相同的方式定义参数。

```nginx
proxy_no_cache $http_pragma $http_authorization;
```

# 清除缓存内容

NGINX 可以删除缓存中过期的缓存文件。这是为了删除过期的缓存内容，以防止同时提供旧版本和新版本的网页。在接收到包含自定义 HTTP 头或 HTTP PURGE 方法的特殊“清除”请求时，缓存将被清除。

## 配置缓存清除

让我们设置一个配置，识别使用 HTTP PURGE 方法并删除匹配的 URL 的请求。

在 http {} 上下文中，创建一个新变量，例如 $purge_method，它依赖于 $request_method 变量：

```nginx
http {
    # ...
    map $request_method $purge_method {
        PURGE 1;
        default 0;
    }
}
```

在配置了缓存的 location {} 块中，包含 proxy_cache_purge 指令，以指定缓存清除请求的条件。在我们的示例中，它是上一步中配置的 $purge_method：

```nginx
server {
    listen      80;
    server_name www.example.com;

    location / {
        proxy_pass  https://localhost:8002;
        proxy_cache mycache;

        proxy_cache_purge $purge_method;
    }
}
```

## 发送清除命令

当配置了 proxy_cache_purge 指令时，您需要发送一个特殊的缓存清除请求来清除缓存。您可以使用各种工具发送清除请求，包括像下面这样使用 curl 命令：

```bash
$ curl -X PURGE -D – "https://www.example.com/*"
HTTP/1.1 204 No Content
Server: nginx/1.15.0
Date: Sat, 19 May 2018 16:33:04 GMT
Connection: keep-alive
```

在该示例中，具有相同 URL 部分（由星号通配符指定）的资源将被清除。但是，这样的缓存条目并没有完全从缓存中删除：它们仍然保存在磁盘上，直到它们由于不活动（由 proxy_cache_path 指令的 inactive 参数确定）或由缓存清除器（通过 proxy_cache_path 的 purger 参数启用）而被删除，或者客户端尝试访问它们。

## 限制对清除命令的访问

我们建议您限制允许发送缓存清除请求的 IP 地址数量：

```nginx
geo $purge_allowed {
   default         0;  # deny from other
   10.0.0.1        1;  # allow from 10.0.0.1 address
   192.168.0.0/24  1;  # allow from 192.168.0.0/24
}

map $request_method $purge_method {
   PURGE   $purge_allowed;
   default 0;
}
```

在此示例中，NGINX 检查请求中是否使用了 PURGE 方法，如果是，则分析客户端 IP 地址。如果 IP 地址被列入白名单，则 $purge_method 设置为 $purge_allowed：1 表示允许清除，0 表示拒绝。

## 完全从缓存中删除文件

要完全删除与通配符匹配的缓存文件，激活一个特殊的缓存清除器进程，它会循环遍历所有缓存条目并删除与通配符键匹配的条目。在 http {} 上下文中包含 purger 参数到 proxy_cache_path 指令：

```nginx
proxy_cache_path /data/nginx/cache levels=1:2 keys_zone=mycache:10m purger=on;
```

## 字节范围缓存

初始缓存填充操作有时需要相当长的时间，特别是对于大文件。例如，当视频文件开始下载以满足文件的一部分的初始请求时，后续请求必须等待整个文件下载并放入缓存中。

NGINX 使得可以缓存这种范围请求，并逐渐填充缓存，使用 Cache Slice 模块，该模块将文件分成较小的“切片”。每个范围请求选择覆盖请求范围的特定切片，如果该范围仍未缓存，则将其放入缓存中。对于这些切片的所有其他请求从缓存中获取数据。

要启用字节范围缓存：

- 确保 NGINX 已编译 Cache Slice 模块。
- 使用 slice 指令指定切片的大小：

```nginx
location / {
    slice  1m;
}
```

- 将 $slice_range 变量包含到缓存键中：

```nginx
proxy_cache_key $uri$is_args$args$slice_range;
```

- 启用响应状态码为 206 的响应的缓存：

```nginx
proxy_cache_valid 200 206 1h;
```

- 通过设置 $slice_range 变量到 Range 头字段，启用将范围请求传递到代理服务器：

```nginx
proxy_set_header  Range $slice_range;
```

以下是完整的配置：

```nginx
location / {
    slice             1m;
    proxy_cache       cache;
    proxy_cache_key   $uri$is_args$args$slice_range;
    proxy_set_header  Range $slice_range;
    proxy_cache_valid 200 206 1h;
    proxy_pass        http://localhost:8000;
}
```

请注意，如果打开了切片缓存，则初始文件不能更改。

## 组合配置示例

以下示例配置结合了上述部分描述的一些缓存选项。

```nginx
http {
    # ...
    proxy_cache_path /data/nginx/cache keys_zone=mycache

:10m loader_threshold=300
                     loader_files=200 max_size=200m;

    server {
        listen 8080;
        proxy_cache mycache;

        location / {
            proxy_pass http://backend1;
        }

        location /some/path {
            proxy_pass http://backend2;
            proxy_cache_valid any 1m;
            proxy_cache_min_uses 3;
            proxy_cache_bypass $cookie_nocache $arg_nocache$arg_comment;
        }
    }
}
```

在此示例中，两个位置使用相同的缓存，但以不同的方式。

由于来自 backend1 的响应很少更改，因此未包含任何缓存控制指令。响应在第一次请求时被缓存，并无限期保持有效。

相反，对由 backend2 提供的请求的响应经常更改，因此它们只有在 1 分钟内才被认为有效，并且直到相同请求被 3 次执行才被缓存。

此外，如果请求匹配了 proxy_cache_bypass 指令定义的条件，则 NGINX Plus 会立即将请求传递到 backend2，而不会在缓存中查找相应的响应。

--------------------------------------------------------------------------------------------------------------------------

# chat

## 详细介绍一下 NGINX 内容缓存

Nginx 是一个高性能的 HTTP 服务器和反向代理，它提供了内容缓存功能，允许将动态或静态内容暂存于更快的存储介质（如 RAM 或 SSD）中，以提高访问速度和减轻后端服务器的负载。

以下是 Nginx 内容缓存的详细介绍：

### 为什么使用 Nginx 内容缓存

1. **提高性能**：通过缓存频繁访问的内容，减少对后端服务器的请求，从而加快响应时间和提高吞吐量。
2. **减少延迟**：用户请求被快速处理，无需每次都请求后端服务器。
3. **减轻后端负载**：减少后端服务器的请求量，可以更有效地分配资源。
4. **节省带宽**：缓存可以减少原始内容的传输，节省网络带宽。

### 如何配置 Nginx 内容缓存

Nginx 的内容缓存配置通常在 `http`、`server` 或 `location` 块中进行。

以下是配置内容缓存的基本指令：

```nginx
http {
    cache {
        levels 1:2;
        keys_zone my_cache:10m;
        size 1g;
    }

    server {
        location / {
            proxy_pass http://backend;
            proxy_cache my_cache;
            proxy_cache_valid 200 302 10m;
            proxy_cache_valid 404 1m;
            proxy_cache_use_stale error timeout http_404;
            proxy_cache_lock on;
        }
    }
}
```

各指令解释如下：

- `cache`：定义一个缓存区域，包含多个指令。
  - `levels`：设置缓存中使用的目录级别。
  - `keys_zone`：定义一个共享内存区域，用于存储缓存键和元数据。`my_cache:10m` 表示名为 `my_cache` 的共享内存区大小为 10MB。
  - `size`：设置缓存区域的总大小，这里是 1GB。

- `proxy_cache`：指定用于当前 `location` 的缓存区域名称，这里为 `my_cache`。

- `proxy_cache_valid`：定义缓存响应的有效状态码和持续时间。例如，状态码为 200 时缓存 10 分钟，状态码为 404 时缓存 1 分钟。

- `proxy_cache_use_stale`：定义在后端服务器不可用时，使用已缓存的过期或错误响应。`error timeout http_404` 表示在发生错误、超时或 HTTP 404 响应时使用缓存内容。

- `proxy_cache_lock`：启用缓存锁定，以同步对缓存的并发访问。

### 缓存的失效和更新

Nginx 会根据 `proxy_cache_valid` 指令中定义的规则来缓存和失效缓存条目。

当缓存条目过期时，Nginx 会在下一次请求时从后端服务器更新内容。

### 注意事项

- 缓存适用于频繁访问的内容，对于不常访问的内容，缓存可能不会带来显著的性能提升。
- 缓存会占用服务器的存储空间，需要合理规划缓存大小。
- 对于敏感内容，如用户特定数据，可能不适合缓存。

通过合理配置 Nginx 的内容缓存，你可以显著提高网站的性能和响应速度，同时减轻后端服务器的负载。



# 参考资料

https://docs.nginx.com/nginx/admin-guide/content-cache/content-caching/

* any list
{:toc}