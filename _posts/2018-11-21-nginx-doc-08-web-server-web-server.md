---
layout: post
title:  Nginx R31 doc-08-Configuring NGINX and NGINX Plus as a Web Server 配置 NGINX 和 NGINX Plus 作为 Web 服务器
date: 2018-11-22 8:01:55 +0800 
categories: [Web]
tags: [nginx, windows, sh]
published: true
---


# 配置 NGINX 和 NGINX Plus 作为 Web 服务器

## 设置虚拟服务器

在 NGINX Plus 配置文件中，必须包含至少一个 server 指令来定义一个虚拟服务器。

当 NGINX Plus 处理请求时，首先选择将服务于该请求的虚拟服务器。

```nginx
http {
    server {
        # 服务器配置
    }
}
```

可以在 http 上下文中添加多个 server 指令来定义多个虚拟服务器。

服务器配置块通常包括一个 listen 指令，用于指定服务器监听请求的 IP 地址和端口（或 Unix 域套接字和路径）。接受 IPv4 和 IPv6 地址；将 IPv6 地址括在方括号中。

下面的示例显示了一个服务器配置，该服务器监听 IP 地址 127.0.0.1 和端口 8080：

```nginx
server {
    listen 127.0.0.1:8080;
    # 其他服务器配置
}
```

如果省略了端口，则使用标准端口。同样，如果省略了地址，则服务器将监听所有地址。如果完全不包含 listen 指令，则使用“标准”端口为 80/tcp，而“默认”端口为 8000/tcp，这取决于超级用户权限。

如果有多个服务器匹配请求的 IP 地址和端口，NGINX Plus 将请求的 Host 标头字段与 server 块中的 server_name 指令进行比较。server_name 的参数可以是完整（精确）名称、通配符或正则表达式。通配符是一个以星号 (*) 开头、结尾或两者兼有的字符字符串；星号匹配任何字符序列。NGINX Plus 使用 Perl 语法进行正则表达式；在配置文件中出现的顺序决定了它们的优先级。

```nginx
server {
    listen      80;
    server_name example.org www.example.org;
    #...
}
```

如果 Host 标头字段匹配了多个名称，则 NGINX Plus 会按以下顺序搜索名称，并使用找到的第一个匹配项：

- 精确名称
- 最长的以星号开头的通配符，例如 *.example.org
- 最长的以星号结尾的通配符，例如 mail.*
- 第一个匹配的正则表达式（按照配置文件中出现的顺序）

如果 Host 标头字段与任何服务器名称都不匹配，则 NGINX Plus 会将请求路由到该请求到达的端口的默认服务器。默认服务器是 nginx.conf 文件中列出的第一个服务器，除非您使用 listen 指令的 default_server 参数来显式地指定服务器为默认服务器。

```nginx
server {
    listen 80 default_server;
    #...
}
```

## 配置位置

NGINX Plus 可以根据请求 URI 将流量发送到不同的代理或为不同的文件提供服务。这些块使用位于 server 指令中的 location 指令定义。

例如，您可以定义三个 location 块来指示虚拟服务器将一些请求发送到一个代理服务器，将其他请求发送到不同的代理服务器，并通过从本地文件系统提供文件来为其余的请求提供服务。

NGINX Plus 将请求 URI 与所有 location 指令的参数进行比较，并应用匹配位置中定义的指令。在每个 location 块内部，通常可以（有少数例外）放置更多的 location 指令，以进一步细化特定组的请求的处理方式。

在 location 指令中，有两种类型的参数：前缀字符串（路径名）和正则表达式。对于请求 URI 要与前缀字符串匹配，必须以前缀字符串开头。

下面的示例 location 使用路径名参数，匹配以 /some/path/ 开头的请求 URI，例如 /some/path/document.html。（它不会匹配 /my-site/some/path，因为 /some/path 不是该 URI 的开头。）

```nginx
location /some/path/ {
    #...
}
```

正则表达式前面带有波浪号（~）用于区分大小写匹配，或者带有波浪号-星号（~*）用于不区分大小写匹配。下面的示例匹配任何位置包含字符串 .html 或 .htm 的 URI。

```nginx
location ~ \.html? {
    #...
}
```

## NGINX 位置优先级

为了找到最匹配 URI 的位置，NGINX Plus 首先将 URI 与具有前缀字符串的位置进行比较。然后搜索具有正则表达式的位置。

对于正则表达式，会给予更高的优先级，除非使用 ^~ 修饰符。在前缀字符串中，NGINX Plus 选择最具体的一个（即最长且最完整的字符串）。选择用于处理请求的位置的确切逻辑如下所示：

- 将 URI 与所有前缀字符串进行比较。
- =（等号）修饰符定义 URI 和前缀字符串的精确匹配。如果找到了精确匹配，则搜索停止。
- 如果 ^~（插入波浪号）修饰符在最长匹配的前缀字符串之前，则不检查正则表达式。
- 存储最长匹配的前缀字符串。
- 将 URI 与正则表达式进行比较。
- 当找到第一个匹配的正则表达式时停止处理，并使用相应的位置。
- 如果没有正则表达式匹配，则使用对应于存储的前缀字符串的位置。
  
对于 = 修饰符的典型用例是请求 /（斜杠）。如果请求 / 频繁，则将 = / 指定为 location 指令

的参数可以加快处理速度，因为在第一次比较后搜索匹配项就会停止。

```nginx
location = / {
    #...
}
```

位置上下文可以包含指令，定义如何解析请求 - 服务静态文件或将请求传递到代理服务器。

在下面的示例中，匹配第一个位置上下文的请求将从 /data 目录提供文件，而匹配第二个位置上下文的请求将被传递到托管 `<www.example.com>` 域的代理服务器。

```nginx
server {
    location /images/ {
        root /data;
    }

    location / {
        proxy_pass http://www.example.com;
    }
}
```

root 指令指定文件系统路径，用于搜索要提供的静态文件。与位置相关联的请求 URI 附加到路径以获取要提供的静态文件的完整名称。在上面的示例中，对于 /images/example.png 的请求，NGINX Plus 会提供文件 /data/images/example.png。

proxy_pass 指令将请求传递到使用配置的 URL 访问的代理服务器。然后将来自代理服务器的响应传递回客户端。在上面的示例中，所有 URI 不以 /images/ 开头的请求都将传递到代理服务器。


## 使用变量

您可以在配置文件中使用变量，使 NGINX Plus 根据定义的情况处理请求。变量是在运行时计算的命名值，用作指令的参数。变量以其名称的开头为 $（美元）符号表示。变量根据 NGINX 的状态定义信息，例如当前正在处理的请求的属性。

有许多预定义的变量，例如核心 HTTP 变量，并且您可以使用 set、map 和 geo 指令定义自定义变量。大多数变量在运行时计算，并包含与特定请求相关的信息。例如，$remote_addr 包含客户端 IP 地址，$uri 包含当前 URI 值。

## 返回特定状态码

一些网站 URI 需要立即返回具有特定错误或重定向代码的响应，例如当页面已被临时或永久移动时。最简单的方法是使用 return 指令。例如：

```nginx
location /wrong/url {
    return 404;
}
```

return 的第一个参数是响应代码。可选的第二个参数可以是重定向的 URL（对于代码 301、302、303 和 307）或要在响应正文中返回的文本。例如：

```nginx
location /permanently/moved/url {
    return 301 http://www.example.com/moved/here;
}
```

return 指令可以包含在 location 和 server 上下文中。

## 重写请求中的 URI

请求 URI 可以在请求处理期间多次修改，通过使用 rewrite 指令，它有一个可选和两个必需的参数。第一个（必需）参数是请求 URI 必须匹配的正则表达式。第二个参数是匹配 URI 的 URI 替换。可选的第三个参数是一个标志，可以停止进一步重写指令的处理或发送重定向（代码 301 或 302）。例如：

```nginx
location /users/ {
    rewrite ^/users/(.*)$ /show?user=$1 break;
}
```

如此示例所示，第二个参数 users 通过正则表达式的匹配捕获。

您可以在 server 和 location 上下文中包含多个 rewrite 指令。NGINX Plus 按照它们出现的顺序逐一执行这些指令。在选择 server 上下文后，会执行一次 server 上下文中的 rewrite 指令。

在 NGINX 处理一组重写指令后，它根据新 URI 选择位置上下文。如果所选位置包含重写指令，则它们依次执行。如果 URI 匹配其中任何一个，那么在处理完所有已定义的重写指令后，将开始搜索新位置。

以下示例显示了将 rewrite 指令与 return 指令结合使用。

```nginx
server {
    #...
    rewrite ^(/download/.*)/media/(\w+)\.?.*$ $1/mp3/$2.mp3 last;
    rewrite ^(/download/.*)/audio/(\w+)\.?.*$ $1/mp3/$2.ra  last;
    return  403;
    #...
}
```

此示例配置区分了两组 URI。例如 /download/some/media/file 的 URI 将更改为 /download/some/mp3/file.mp3。由于 last 标志，跳过了后续的指令（第二个 rewrite 和 return 指令），但是 NGINX Plus 继续处理请求，此时请求的 URI 已更改。类似地，URI（例如 /download/some/audio/file）将替换为 /download/some/mp3/file.ra。如果 URI 不匹配任何一个 rewrite 指令，NGINX Plus 将向客户端返回 403 错误代码。

有两个参数会中断 rewrite 指令的处理：

- last - 停止执行当前服务器或位置上下文中的 rewrite 指令，但是 NGINX Plus 将搜索与重写后的 URI 匹配的位置，新位置中的任何重写指令都将被应用（这意味着 URI 可能会再次更改）。

- break - 类似于 break 指令，停止处理当前上下文中的 rewrite 指令，并取消搜索与新 URI 匹配的位置。不会执行新位置中的 rewrite 指令。


## 重写 HTTP 响应

有时您需要重写或更改 HTTP 响应中的内容，将一个字符串替换为另一个。您可以使用 sub_filter 指令定义要应用的重写。该指令支持变量和替换链，使更复杂的更改成为可能。

例如，您可以更改绝对链接，引用代理之外的服务器：

```nginx
location / {
    sub_filter      /blog/ /blog-staging/;
    sub_filter_once off;
}
```

另一个示例是将方案从 http:// 更改为 https:// 并将 localhost 地址替换为请求标头字段中的主机名。sub_filter_once 指令告诉 NGINX 在位置内按顺序应用 sub_filter 指令：

```nginx
location / {
    sub_filter     'href="http://127.0.0.1:8080/'    'href="https://$host/';
    sub_filter     'img src="http://127.0.0.1:8080/' 'img src="https://$host/';
    sub_filter_once on;
}
```

请注意，如果另一个 sub_filter 匹配发生，已经使用 sub_filter 修改的响应部分不会再次替换。

## 处理错误

使用 error_page 指令，您可以配置 NGINX Plus 返回自定义页面以及错误代码，将响应中的不同错误代码替换为不同的错误代码，或将浏览器重定向到不同的 URI。在下面的示例中，error_page 指令指定了要返回的页面（/404.html），并带有 404 错误代码。

```nginx
error_page 404 /404.html;
```

请注意，此指令并不意味着立即返回错误（return 指令会这样做），而只是指定了出现错误时如何处理错误。错误代码可以来自代理服务器，也可以在 NGINX Plus 处理过程中发生（例如，404 是当 NGINX Plus 找不到客户端请求的文件时发生的错误）。

在下面的示例中，当 NGINX Plus 找不到页面时，它将 404 代码替换为 301 代码，并将客户端重定向到 http:/example.com/new/path.html。这种配置在客户端仍然试图访问页面的旧 URI 时非常有用。301 代码通知浏览器页面已永久移动，它需要在返回时自动将旧地址替换为新地址。

```nginx
location /old/path.html {
    error_page 404 =301 http:/example.com/new/path.html;
}
```

以下配置是在找不到文件时将请求传递给后端的示例。由于 error_page 指令中等号后面没有指定状态代码，所以返回给客户端的响应具有由代理服务器返回的状态代码（不一定是 404）。

```nginx
server {
    ...
    location /images/ {
        # 设置要搜索文件的根目录
        root /data/www;

        # 禁用与文件存在相关的错误的日志记录
        open_file_cache_errors off;

        # 如果找不到文件，则进行内部重定向
        error_page 404 = /fetch$uri;
    }

    location /fetch/ {
        proxy_pass http://backend/;
    }
}
```

error_page 指令指示 NGINX Plus 在找不到文件时进行内部重定向。error_page 指令的最后一个参数中的 $uri 变量保存当前请求的 URI，该变量在重定向中传递。

例如，如果找不到 /images/some/file，则它将被替换为 /fetch/images/some/file，然后开始搜索新的位置。结果，请求最终进入第二个位置上下文，并被代理到 “http://backend/”。

open_file_cache_errors 指令防止在找不到文件时编写错误消息。在这里不是必需的，因为缺少文件会得到正确处理。


# 参考资料

https://docs.nginx.com/nginx/admin-guide/web-server/web-server/

* any list
{:toc}