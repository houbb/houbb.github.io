---
layout: post
title:  从零手写实现 nginx-23-nginx 对于 cookie 的操作
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

[从零手写实现 nginx-21-nginx modules 模块信息概览](https://houbb.github.io/2018/11/22/nginx-write-21-modules-overview)

[从零手写实现 nginx-22-nginx modules 分模块加载优化](https://houbb.github.io/2018/11/22/nginx-write-22-modules-load)

[从零手写实现 nginx-23-nginx cookie 的操作处理](https://houbb.github.io/2018/11/22/nginx-write-23-cookie-oper)

# 前言

大家好，我是老马。

这一节我们将配置的加载，拆分为不同的模块加载处理，便于后续拓展。

# 1. proxy_set_header Cookie 指令

## 介绍下 nginx proxy_set_header Cookie "admin_cookie=admin_value; $http_cookie"; 操作 cookie 的指令

在 Nginx 配置文件中，`proxy_set_header` 指令用于设置在代理请求中传递的 HTTP 头部字段。

通过 `proxy_set_header` 可以在将请求转发给上游服务器时添加、修改或删除请求头部字段。

具体来说，`proxy_set_header Cookie "admin_cookie=admin_value; $http_cookie";` 这条指令用于修改请求头中的 `Cookie` 字段。

它将一个新的 cookie（`admin_cookie=admin_value`）添加到现有的请求 cookie 中。详细解释如下：

1. **`proxy_set_header` 指令**：这是 Nginx 用来设置请求头部字段的指令。
2. **`Cookie`**：这是要设置的头部字段名称。在这种情况下，设置的是 HTTP 请求的 `Cookie` 头部。
3. **`"admin_cookie=admin_value; $http_cookie"`**：这是要设置的头部字段值。
   - **`admin_cookie=admin_value`**：这是要添加的新 cookie 值。`admin_cookie` 是 cookie 的名称，`admin_value` 是它的值。
   - **`;`**：分号用来分隔多个 cookie。
   - **`$http_cookie`**：这是一个 Nginx 的内置变量，它包含了当前请求中的所有 cookie 值。

通过这条指令，Nginx 会在转发请求到上游服务器之前，将一个新的 cookie 添加到现有的 cookie 中。这样上游服务器就会收到一个包含新添加的 `admin_cookie=admin_value` 的 `Cookie` 头部。

示例配置片段如下：

```conf
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend_server;
        proxy_set_header Cookie "admin_cookie=admin_value; $http_cookie";
    }
}
```

在这个示例中，当客户端向 `example.com` 发起请求时，Nginx 会将请求转发给 `backend_server`，并在请求头部的 `Cookie` 字段中添加一个新的 `admin_cookie=admin_value`。

### 其他相关的 Nginx 指令

- **`proxy_pass`**：用于定义请求转发到的上游服务器。
- **`proxy_set_header`**：用于设置转发请求的头部字段。

### 注意事项

1. **安全性**：在操作 cookie 时需要注意安全性，尤其是涉及敏感信息的 cookie。
2. **兼容性**：确保上游服务器能够正确处理添加的 cookie。
3. **配置顺序**：`proxy_set_header` 通常放在 `location` 或 `server` 块中，并在 `proxy_pass` 指令之前。

通过合理配置 `proxy_set_header` 指令，可以在 Nginx 中灵活地操作 HTTP 请求头部，满足各种代理需求。

## netty 如何实现 对于 cookie 的新增/修改/删除？

这个我们原来就支持了

```java
    /**
     * # 增加或修改请求头
     * proxy_set_header X-Real-IP $remote_addr;
     * # 删除请求头
     * proxy_set_header X-Unwanted-Header "";
     *
     * @param configParam 参数
     * @param context     上下文
     */
    @Override
    public void doBeforeDispatch(NginxCommonConfigParam configParam, NginxRequestDispatchContext context) {
        List<String> values = configParam.getValues();

        // $ 占位符号后续处理

        String headerName = values.get(0);
        String headerValue = values.get(1);

        FullHttpRequest fullHttpRequest = context.getRequest();

        // 设置
        HttpHeaders headers = fullHttpRequest.headers();
        if (StringUtil.isEmpty(headerValue)) {
            headers.remove(headerName);
            logger.info(">>>>>>>>>>>> doBeforeDispatch headers.remove({})", headerName);
        } else {
            // 是否包含
            if (headers.contains(headerName)) {
                headers.set(headerName, headerValue);
                logger.info(">>>>>>>>>>>> doBeforeDispatch headers.set({}, {});", headerName, headerValue);
            } else {
                headers.add(headerName, headerValue);
                logger.info(">>>>>>>>>>>> doBeforeDispatch headers.set({}, {});", headerName, headerValue);
            }
        }
    }
```

# proxy_cookie_domain 指令

## 解释

`proxy_cookie_domain` 是 Nginx 的一个指令，用于修改代理服务器响应中的 `Set-Cookie` 头部的 `Domain` 属性。

这个指令通常用于在反向代理配置中，当上游服务器设置的 `Domain` 属性与客户端访问的域名不一致时，通过重写 `Domain` 属性来解决跨域问题。

### 语法

```nginx
proxy_cookie_domain [上游服务器的域名] [要重写为的域名];
```

- **上游服务器的域名**：指定要匹配并重写的 `Domain` 属性值。
- **要重写为的域名**：指定新的 `Domain` 属性值。

### 默认值

```nginx
proxy_cookie_domain off;
```

如果不设置 `proxy_cookie_domain`，则默认不对 `Set-Cookie` 头部的 `Domain` 属性进行任何修改。

### 配置范围

该指令可以在 `http`、`server` 或 `location` 块中配置。

### 示例

假设我们有一个后端服务器 `backend.example.com`，它在设置 Cookie 时将 `Domain` 属性设为 `backend.example.com`。

但是，客户端访问的是 `www.example.com`。

我们可以使用 `proxy_cookie_domain` 来重写 `Domain` 属性，以便客户端能够正确地接收和发送这些 Cookie。

```conf
http {
    server {
        listen 80;
        server_name www.example.com;

        location / {
            proxy_pass http://backend.example.com;
            proxy_cookie_domain backend.example.com www.example.com;
        }
    }
}
```

在这个配置中，当上游服务器 `backend.example.com` 在响应中返回 `Set-Cookie` 头部时：

```
Set-Cookie: sessionid=abcd1234; Domain=backend.example.com; Path=/
```

Nginx 会将其重写为：

```
Set-Cookie: sessionid=abcd1234; Domain=www.example.com; Path=/
```

### 使用场景

1. **跨域 Cookie 共享**：当后端服务器和客户端使用不同的域名时，通过 `proxy_cookie_domain` 重写 `Set-Cookie` 头部的 `Domain` 属性，使 Cookie 能够在客户端域名下有效。
2. **域名变更**：如果网站的域名发生变化，通过该指令可以确保旧域名设置的 Cookie 仍然有效。
3. **子域名问题**：在使用子域名时，可以通过该指令将所有子域名的 Cookie 统一到主域名下。

### 注意事项

1. **安全性**：确保重写的域名是可信任的，以防止 Cookie 被不当共享。
2. **精确匹配**：`proxy_cookie_domain` 的匹配是精确匹配的，因此需要确保指定的上游服务器域名与实际的 `Set-Cookie` 头部中的 `Domain` 属性完全一致。

通过合理使用 `proxy_cookie_domain` 指令，可以有效地解决跨域 Cookie 共享的问题，确保在反向代理场景下的 Cookie 设置和使用正确无误。

## 如何通过 netty，实现 proxy_cookie_domain 指令特性？

核心实现如下：

```java
/**
 * 参数处理类 响应头处理
 *
 * @since 0.20.0
 * @author 老马啸西风
 */
public class NginxParamHandleProxyCookieDomain extends AbstractNginxParamLifecycleWrite {

    private static final Log logger = LogFactory.getLog(NginxParamHandleProxyCookieDomain.class);

    @Override
    public void doBeforeWrite(NginxCommonConfigParam configParam, ChannelHandlerContext ctx, Object object, NginxRequestDispatchContext context) {
        if(!(object instanceof HttpResponse)) {
            return;
        }


        List<String> values = configParam.getValues();
        if(CollectionUtil.isEmpty(values) || values.size() < 2) {
            return;
        }


        // 原始
        String upstreamDomain = values.get(0);
        // 目标
        String targetDomain = values.get(1);

        HttpResponse response = (HttpResponse) object;
        HttpHeaders headers = response.headers();
        String setCookieHeader = headers.get(HttpHeaderNames.SET_COOKIE);

        if (setCookieHeader != null) {
            Set<Cookie> cookies = ServerCookieDecoder.STRICT.decode(setCookieHeader);

            Set<Cookie> modifiedCookies = cookies.stream().map(cookie -> {
                if (upstreamDomain.equals(cookie.domain())) {
                    Cookie newCookie = new DefaultCookie(cookie.name(), cookie.value());
                    newCookie.setDomain(targetDomain);
                    newCookie.setPath(cookie.path());
                    newCookie.setMaxAge(cookie.maxAge());
                    newCookie.setSecure(cookie.isSecure());
                    newCookie.setHttpOnly(cookie.isHttpOnly());
                    return newCookie;
                }
                return cookie;
            }).collect(Collectors.toSet());

            List<String> encodedCookies = ServerCookieEncoder.STRICT.encode(modifiedCookies);
            headers.set(HttpHeaderNames.SET_COOKIE, encodedCookies);
        }

        logger.info(">>>>>>>>>>>> doBeforeWrite proxy_hide_header upstreamDomain={} => targetDomain={}", upstreamDomain, targetDomain);
    }

    @Override
    public void doAfterWrite(NginxCommonConfigParam configParam, ChannelHandlerContext ctx, Object object, NginxRequestDispatchContext context) {

    }

    @Override
    protected String getKey(NginxCommonConfigParam configParam, ChannelHandlerContext ctx, Object object, NginxRequestDispatchContext context) {
        return "proxy_hide_header";
    }

}
```

# proxy_cookie_flags 指令

## 支持哪些？

在 Nginx 中，`proxy_cookie_flags` 指令用于设置从代理服务器返回给客户端的 `Set-Cookie` 头中特定 cookie 的属性标志。主要支持的配置选项包括：

1. **HttpOnly**：将 `HttpOnly` 标志添加到 cookie，使得 JavaScript 无法通过 `document.cookie` 访问该 cookie。

   ```nginx
   proxy_cookie_flags <cookie_name> HttpOnly;
   ```

2. **Secure**：将 `Secure` 标志添加到 cookie，仅在通过 HTTPS 协议发送时才会发送该 cookie。

   ```nginx
   proxy_cookie_flags <cookie_name> Secure;
   ```

3. **SameSite**：设置 `SameSite` 标志，限制浏览器仅在同站点请求时发送该 cookie，有助于防止跨站点请求伪造（CSRF）攻击。

   ```nginx
   proxy_cookie_flags <cookie_name> SameSite=Strict;
   ```

   支持的 `SameSite` 值包括 `Strict`、`Lax` 和 `None`。

4. **Max-Age**：设置 `Max-Age` 属性，指定 cookie 的过期时间（秒）。通常用于设置持久化 cookie 的过期时间。

   ```nginx
   proxy_cookie_flags <cookie_name> Max-Age=3600;
   ```

5. **Expires**：设置 `Expires` 属性，指定 cookie 的过期时间点。通常以 GMT 格式的日期字符串指定。

   ```nginx
   proxy_cookie_flags <cookie_name> Expires=Wed, 21 Oct 2026 07:28:00 GMT;
   ```

6. **Domain**：设置 `Domain` 属性，指定可接受该 cookie 的域名范围。通过 `proxy_cookie_domain` 指令更常用地配置。

   ```nginx
   proxy_cookie_flags <cookie_name> Domain=example.com;
   ```

7. **Path**：设置 `Path` 属性，指定该 cookie 的路径范围。

   ```nginx
   proxy_cookie_flags <cookie_name> Path=/;
   ```

### 示例

以下是一些示例，展示如何使用 `proxy_cookie_flags` 指令设置不同的 cookie 标志：

```conf
server {
    listen 80;
    server_name example.com;

    location / {
        # 添加 HttpOnly 和 Secure 标志
        proxy_cookie_flags session_cookie HttpOnly Secure;
        
        # 设置 SameSite 标志为 Strict
        proxy_cookie_flags mycookie SameSite=Strict;
        
        # 设置 Max-Age 为 1 小时
        proxy_cookie_flags persistent_cookie Max-Age=3600;
        
        # 设置 Expires 属性
        proxy_cookie_flags old_cookie Expires=Wed, 21 Oct 2026 07:28:00 GMT;
        
        # 设置 Domain 属性
        proxy_cookie_flags global_cookie Domain=example.com;
        
        # 设置 Path 属性
        proxy_cookie_flags local_cookie Path=/subpath;
        
        proxy_pass http://backend;
    }
}
```

通过这些配置，您可以灵活地控制从代理服务器返回的 `Set-Cookie` 头中各个 cookie 的属性，以满足安全需求和业务逻辑。

## java 核心实现

```java
    public void doBeforeWrite(NginxCommonConfigParam configParam, ChannelHandlerContext ctx, Object object, NginxRequestDispatchContext context) {
        if(!(object instanceof HttpResponse)) {
            return;
        }


        List<String> values = configParam.getValues();
        if(CollectionUtil.isEmpty(values) || values.size() < 2) {
            return;
        }

        HttpResponse response = (HttpResponse) object;
        HttpHeaders headers = response.headers();
        String cookieHeader = headers.get(HttpHeaderNames.COOKIE);

        final String cookieName = values.get(0);

        if (cookieHeader != null) {
            Set<Cookie> cookies = ServerCookieDecoder.STRICT.decode(cookieHeader);

            Set<Cookie> modifiedCookies = cookies.stream().map(cookie -> {
                // 相同的名字
                if (cookieName.equals(cookie.name())) {
                    // HttpOnly Secure
                    for(int i = 1; i < values.size(); i++) {
                        String value = values.get(i);
                        if("HttpOnly".equals(value)) {
                            cookie.setHttpOnly(true);
                        }
                        if("Secure".equals(value)) {
                            cookie.setSecure(true);
                        }

                        // 拆分
                        if(!value.contains("=")) {
                            return cookie;
                        }

                        String[] items = value.split("=");
                        String itemKey = items[0];
                        String itemVal = items[1];

//                        if("SameSite".equals(itemKey) && "Strict".equals(itemVal)) {
//                        }

                        if("Max-Age".equals(itemKey)) {
                            cookie.setMaxAge(Long.parseLong(itemVal));
                        }
                        if("Expires".equals(itemKey)) {
                            Date expireDate = calcDate(itemVal);
                            long maxAge = expireDate.getTime() - System.currentTimeMillis();
                            cookie.setMaxAge(maxAge);
                        }

                        if("Domain".equals(itemKey)) {
                            cookie.setDomain(itemVal);
                        }

                        if("Path".equals(itemKey)) {
                            cookie.setPath(itemVal);
                        }
                    }
                }
                return cookie;
            }).collect(Collectors.toSet());

            List<String> encodedCookies = ServerCookieEncoder.STRICT.encode(modifiedCookies);
            headers.set(HttpHeaderNames.COOKIE, encodedCookies);
        }

        logger.info(">>>>>>>>>>>> doBeforeWrite proxy_cookie_flags values={}", values);
    }
```


# nginx proxy_cookie_path 指令

## 介绍

在 Nginx 中，`proxy_cookie_path` 指令用于修改传递到后端服务器的 HTTP 请求中的 Cookie 的路径。

这个指令通常在反向代理服务器配置中使用，用于调整传递给后端服务器的 Cookie 的路径信息，以适应后端服务器的预期路径结构。

### 语法和用法

语法：

```
proxy_cookie_path regex path;
```

参数解释：

- `regex`：一个正则表达式，用于匹配要修改的 Cookie 的路径。
- `path`：要替换成的路径。

### 示例

假设有如下配置：

```
location /app/ {
    proxy_pass http://backend.example.com;
    proxy_cookie_path ~*^/app(.*) $1;
}
```

在这个示例中：

- `proxy_cookie_path` 指令配合 `proxy_pass` 使用，表示将从客户端接收的带有路径 `/app/` 的 Cookie 的路径信息去除 `/app` 部分后再传递给后端服务器。

例如，如果客户端发送的 Cookie 路径是 `/app/session`, Nginx 将修改为 `/session` 后传递给后端服务器。

### 注意事项

- 使用 `proxy_cookie_path` 时，确保理解你的后端服务器期望接收的 Cookie 路径格式，以便正确设置正则表达式和路径。
- 正则表达式必须能够正确匹配客户端发送的 Cookie 路径。
- 这个指令通常用于调整不同路径的代理请求，以便与后端服务器的预期路径结构匹配。

## java 核心实现

```java
public void doBeforeDispatch(NginxCommonConfigParam configParam, NginxRequestDispatchContext context) {
    List<String> values = configParam.getValues();
    if(CollectionUtil.isEmpty(values) || values.size() < 2) {
        throw new Nginx4jException("proxy_cookie_path 必须包含2个参数");
    }

    FullHttpRequest request = context.getRequest();
    // 原始
    String regex = values.get(0);
    String path = values.get(1);
    HttpHeaders headers = request.headers();
    String cookieHeader = headers.get(HttpHeaderNames.COOKIE);

    if (cookieHeader != null) {
        String modifiedCookieHeader = cookieHeader.replaceAll(regex, path);
        headers.set(HttpHeaderNames.COOKIE, modifiedCookieHeader);
    }
    logger.info(">>>>>>>>>>>> doBeforeDispatch proxy_cookie_path replace regex={} => path={}", regex, path);
}
```

# 小结

对于 cookie 的处理，让我们的请求可以更加强大灵活。

1. `proxy_cookie_domain`: 设置后端服务器响应的 Cookie 中的域名。
   
2. `proxy_cookie_flags`: 设置后端服务器响应的 Cookie 的标志位。
   
3. `proxy_cookie_path`: 设置后端服务器响应的 Cookie 的路径。

我是老马，期待与你的下次重逢。

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)


# chat

## 为什么 nginx 要单独设计一个 proxy_cookie_path 指令，proxy_cookie_flags 无法实现吗？

Nginx 的 `proxy_cookie_flags` 指令和 `proxy_cookie_path` 指令在功能上有明显的区别，这两者并不是用来完成同样的任务。

1. **`proxy_cookie_flags` 指令**：
   - 用于设置 Cookie 的属性，比如 `HttpOnly`、`Secure`、`SameSite` 等。
   - 主要作用是为了增加或修改 Cookie 的安全性和行为属性，例如确保 Cookie 只能通过 HTTP 协议传输（`HttpOnly`），只能在安全连接中传输（`Secure`），或者限制 Cookie 的跨站点传输行为（`SameSite`）。
   - 这些属性通常不涉及修改 Cookie 的路径或者名称，而是关注于保证 Cookie 的安全性和正确的使用。

2. **`proxy_cookie_path` 指令**：
   - 用于修改传递到后端服务器的 HTTP 请求中的 Cookie 的路径。
   - 主要作用是在 Nginx 作为反向代理时，调整传递给后端服务器的 Cookie 的路径信息，以适应后端服务器对路径的预期要求。
   - 典型的应用场景包括将代理请求中的路径信息重写，确保后端服务器能够正确解析和处理这些 Cookie，尤其是在多级代理路径下或者需要与后端应用服务器路径匹配时。

因此，`proxy_cookie_flags` 和 `proxy_cookie_path` 这两个指令虽然都涉及到处理 Cookie，但它们的作用和用途是不同的：
- `proxy_cookie_flags` 用于修改 Cookie 的属性，增强安全性和行为控制。
- `proxy_cookie_path` 用于修改 Cookie 的路径信息，调整后端服务器接收到的 Cookie 的路径。

如果将 `proxy_cookie_flags` 用来尝试修改 Cookie 的路径信息，将会违反其设计意图，并且可能导致无法预期的行为或错误。

因此，Nginx 在设计时专门为这两种不同的需求提供了对应的指令，以确保功能的清晰和正确性。

## proxy_cookie_path 是修改 request 中的 cookie，还是 Response 中的 cookie?

`proxy_cookie_path` 指令是用来修改传递到后端服务器的 HTTP 请求中的 Cookie 的路径，并非用来修改响应中的 Cookie。

具体来说，当 Nginx 充当反向代理服务器时，它会接收到客户端发来的 HTTP 请求，包括请求中携带的 Cookie。

`proxy_cookie_path` 指令的作用是在转发这些请求到后端服务器之前，修改请求中携带的 Cookie 的路径信息，以适应后端服务器对路径的预期要求。

例如，假设客户端发送了一个带有路径 `/app/session` 的 Cookie。

如果后端服务器期望接收的路径只是 `/session`，那么可以使用 `proxy_cookie_path` 指令来去除 `/app` 部分，从而使后端服务器能够正确解析和处理这个 Cookie。

因此，`proxy_cookie_path` 主要作用于请求阶段，用来调整传递给后端服务器的 Cookie 的路径信息。

对于响应中的 Cookie，Nginx 通常不需要额外的指令来处理，因为响应中的 Cookie 通常由后端服务器生成和管理，并直接传递给客户端。

* any list
{:toc}