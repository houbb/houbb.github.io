---
layout: post
title:  从零手写实现 nginx-20-placeholder 占位符 $
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

[从零手写实现 nginx-24-nginx IF 指令](https://houbb.github.io/2018/11/22/nginx-write-24-directives-if)


# nginx 的占位符

Nginx 是一个高性能的 HTTP 和反向代理服务器。它使用占位符（变量）来动态地生成配置和响应。

这些占位符可以在 Nginx 配置文件中使用，并在运行时被特定的值替换。

以下是对 Nginx 占位符的详细介绍，包括一些常见的变量及其用法。

### 1. 基本语法

Nginx 变量的语法格式是 `$variable_name`。例如：

```nginx
server {
    listen 80;
    server_name example.com;
    
    location / {
        return 200 "The request URI is $uri\n";
    }
}
```

在这个例子中，`$uri` 是一个占位符，表示请求的 URI。

### 2. 内置变量

Nginx 提供了许多内置变量，以下是一些常见的内置变量：

- `$args`：请求中的参数。
- `$content_length`：请求的 Content-Length 头字段。
- `$content_type`：请求的 Content-Type 头字段。
- `$document_root`：当前请求的根目录或 alias 指定的路径。
- `$host`：请求的主机头字段，如果主机头字段不可用，则等于服务器名称。
- `$http_user_agent`：客户端的 User-Agent 头字段。
- `$http_cookie`：客户端的 Cookie 头字段。
- `$limit_rate`：用于限制连接速率。
- `$request_method`：请求方法（GET、POST 等）。
- `$remote_addr`：客户端 IP 地址。
- `$remote_port`：客户端端口。
- `$request_uri`：完整的原始请求 URI，包括参数。
- `$scheme`：请求使用的协议（http 或 https）。
- `$server_protocol`：请求使用的协议版本。
- `$server_addr`：服务器的地址。
- `$server_name`：服务器名称。
- `$server_port`：服务器端口。
- `$uri`：不包含请求参数的请求 URI。

### 3. 自定义变量

除了内置变量，Nginx 还允许用户自定义变量。自定义变量可以在 `set` 指令中定义。以下是一个示例：

```nginx
server {
    listen 80;
    server_name example.com;

    set $my_variable "Hello, Nginx!";
    
    location / {
        return 200 "$my_variable\n";
    }
}
```

在这个例子中，定义了一个自定义变量 `$my_variable`，其值为 `"Hello, Nginx!"`，并在响应中返回这个值。

### 4. 使用变量进行条件控制

Nginx 的 `if` 指令可以根据变量的值进行条件控制。例如：

```nginx
server {
    listen 80;
    server_name example.com;
    
    location / {
        if ($request_method = POST) {
            return 405 "Method Not Allowed\n";
        }
        
        return 200 "Hello, Nginx!\n";
    }
}
```

在这个例子中，如果请求方法是 POST，服务器会返回 405 状态码和 "Method Not Allowed" 信息，否则返回 200 状态码和 "Hello, Nginx!" 信息。

### 5. 变量的应用场景

变量在 Nginx 中有许多实际应用场景：

- **日志记录**：可以在日志格式中使用变量记录详细的请求信息。
- **URL 重写**：使用变量来实现复杂的 URL 重写规则。
- **负载均衡**：在负载均衡配置中使用变量进行复杂的请求路由。
- **限速限流**：使用变量动态控制请求的限速限流策略。

### 示例：动态生成响应

下面是一个结合多个变量的示例，用于动态生成响应内容：

```nginx
server {
    listen 80;
    server_name example.com;
    
    location / {
        set $custom_message "Your IP is $remote_addr and you are using $http_user_agent";
        return 200 "$custom_message\n";
    }
}
```

在这个示例中，服务器会返回一个包含客户端 IP 地址和 User-Agent 的消息。

Nginx 的占位符功能强大且灵活，通过合理地使用这些变量，可以实现许多复杂的功能和动态配置。

# 为什么 nginx 要支持占位符呢？

Nginx 支持占位符（变量）的主要原因是为了提供灵活性和动态性，使其配置能够适应各种复杂的应用场景。以下是 Nginx 支持占位符的一些关键原因和优势：

### 1. 动态配置

占位符使得 Nginx 配置文件能够根据实际请求动态生成响应或调整行为。例如，可以根据请求的 URI、方法或头信息来动态地路由请求、返回不同的内容或者做其他处理。

**示例：动态内容返回**

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        return 200 "Requested URI: $uri\n";
    }
}
```

这个示例会根据请求的 URI 返回相应的消息，使得响应内容是动态生成的。

### 2. 细粒度控制

通过占位符，Nginx 可以对请求和响应进行细粒度控制。例如，基于客户端 IP 地址、User-Agent 或请求参数进行不同的处理。这种细粒度控制有助于实现精细的访问控制、安全检查、个性化服务等。

**示例：基于 IP 地址的访问控制**

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        if ($remote_addr = "192.168.1.1") {
            return 403 "Access denied\n";
        }
        
        return 200 "Welcome\n";
    }
}
```

这个示例会根据客户端的 IP 地址进行访问控制。

### 3. 简化配置管理

占位符可以减少重复配置，提高配置文件的可读性和可维护性。通过定义变量和复用这些变量，可以使得配置文件更简洁、直观。

**示例：复用变量简化配置**

```nginx
server {
    listen 80;
    server_name example.com;

    set $root_path /var/www/html;

    location / {
        root $root_path;
    }

    location /images {
        root $root_path;
    }
}
```

在这个示例中，通过定义变量 `$root_path`，避免了重复配置根目录路径。

### 4. 支持复杂应用场景

Nginx 的占位符使其能够支持复杂的应用场景，例如负载均衡、日志记录、限速限流等。通过使用变量，可以实现更灵活的负载均衡策略、详细的日志记录格式、动态的限速策略等。

**示例：自定义日志格式**

```nginx
log_format custom '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" '
                   '"$http_user_agent" "$http_x_forwarded_for"';

access_log /var/log/nginx/access.log custom;
```

这个示例通过占位符定义了自定义的日志格式，以记录详细的请求信息。

### 5. 安全与优化

通过使用占位符，可以实现动态的安全检查和优化策略。例如，根据请求头信息或者参数来启用或禁用某些功能，从而增强安全性和性能。

**示例：根据 User-Agent 进行优化**

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        if ($http_user_agent ~* "Mobile") {
            set $mobile 1;
        }

        if ($mobile) {
            return 200 "Mobile optimization enabled\n";
        }

        return 200 "Standard optimization\n";
    }
}
```

这个示例展示了如何根据 User-Agent 实现移动设备优化。

### 总结

Nginx 支持占位符的主要目的是提供更高的灵活性和动态性，使其能够适应各种复杂的应用场景和需求。

通过占位符，Nginx 的配置能够变得更加简洁、可读、可维护，并且能够实现复杂的控制逻辑，从而提供更强大的功能和更高的性能。


# java 如何设计实现？

## 系统内置的 placeholder 变量

我们首先实现内置的 placeholder 占位符操作。

### 定义抽象的接口

```java
/**
 * 占位符处理类
 * @since 0.17.0
 *
 * @author 老马啸西风
 */
public abstract class AbstractNginxPlaceholder implements INginxPlaceholder {

    private static final Log logger = LogFactory.getLog(AbstractNginxPlaceholder.class);

    @Override
    public void placeholder(NginxRequestDispatchContext context) {
        // 上下文存储的内容
        Map<String, Object> placeholderMap = context.getPlaceholderMap();

        // 请求头
        FullHttpRequest request = context.getRequest();

        String key = getKey(request, context);
        Object value = extract(request, context);

        placeholderMap.put(key, value);

        logger.info("placeholder put key={},value={}", key, value);
    }

    /**
     * 提取值
     * @param request 请求头
     * @param context 上下文
     * @return 结果
     */
    protected abstract Object extract(FullHttpRequest request, NginxRequestDispatchContext context);

    /**
     * 唯一标识
     * @param request 请求头
     * @param context 上下文
     * @return 结果
     */
    protected abstract String getKey(FullHttpRequest request, NginxRequestDispatchContext context);

}
```

### 常见内置的实现

- `$args`：请求中的参数。
- `$content_length`：请求的 Content-Length 头字段。
- `$content_type`：请求的 Content-Type 头字段。
- `$document_root`：当前请求的根目录或 alias 指定的路径。
- `$host`：请求的主机头字段，如果主机头字段不可用，则等于服务器名称。
- `$http_user_agent`：客户端的 User-Agent 头字段。
- `$http_cookie`：客户端的 Cookie 头字段。
- `$limit_rate`：用于限制连接速率。
- `$request_method`：请求方法（GET、POST 等）。
- `$remote_addr`：客户端 IP 地址。
- `$remote_port`：客户端端口。
- `$request_uri`：完整的原始请求 URI，包括参数。
- `$scheme`：请求使用的协议（http 或 https）。
- `$server_protocol`：请求使用的协议版本。
- `$server_addr`：服务器的地址。
- `$server_name`：服务器名称。
- `$server_port`：服务器端口。
- `$uri`：不包含请求参数的请求 URI。

以 args 为例，其他的实现类似：

```java
/**
 * 占位符处理类
 * @since 0.17.0
 *
 * @author 老马啸西风
 */
public class NginxPlaceholderArgs extends AbstractNginxPlaceholder {

    private static final Log logger = LogFactory.getLog(NginxPlaceholderArgs.class);


    @Override
    protected Object extract(FullHttpRequest request, NginxRequestDispatchContext context) {
        QueryStringDecoder decoder = new QueryStringDecoder(request.uri());
        StringBuilder args = new StringBuilder();
        for (Map.Entry<String, List<String>> entry : decoder.parameters().entrySet()) {
            for (String value : entry.getValue()) {
                if (args.length() > 0) {
                    args.append("&");
                }
                args.append(entry.getKey()).append("=").append(value);
            }
        }
        return args.toString();
    }

    @Override
    protected String getKey(FullHttpRequest request, NginxRequestDispatchContext context) {
        return "$args";
    }

}
```


## set 的支持

可以看到 nginx 默认支持了 set 操作符，可以设置一个变量。

这个属于操作指令，我们在上一期的指令中进行拓展：

```java
/**
 * SET 符号，设置一个 $ 变量
 *
 * @since 0.17.0
 * @author 老马啸西风
 */
public class NginxParamHandleSet extends AbstractNginxParamHandle {

    private static final Log logger = LogFactory.getLog(NginxParamHandleSet.class);

    /**
     * # 设置一个占位符的值
     *
     * set $mobile 1;
     *
     * @param configParam 参数
     * @param context     上下文
     */
    @Override
    public void doBeforeDispatch(NginxUserConfigParam configParam, NginxRequestDispatchContext context) {
        Map<String, Object> placeholderMap = context.getPlaceholderMap();

        // 处理
        List<String> values = configParam.getValues();
        String headerName = values.get(0);
        String headerValue = values.get(1);

        // 变量名必须以 $ 开始
        if(!headerName.startsWith(NginxConst.PLACEHOLDER_PREFIX)) {
            throw new Nginx4jException("SET 指令对应的变量名必须以 $ 开始");
        }

        placeholderMap.put(headerName, headerValue);
    }

    //...

    @Override
    public boolean doMatch(NginxUserConfigParam configParam, NginxRequestDispatchContext context) {
        return "set".equalsIgnoreCase(configParam.getName());
    }

}
```

我们把 set 对应的指令值，放入到 placeholderMap 占位符中。

## set指令 + 占位符的处理的时机

我们放在 request 分发处理前，统一处理：

```java
    /**
     * 请求头的统一处理
     * @param context 上下文
     * @author 老马啸西风
     */
    protected void beforeDispatch(final NginxRequestDispatchContext context) {
        // 参数管理类
        final INginxParamManager paramManager = context.getNginxConfig().getNginxParamManager();

        // v0.17.0 占位符管理类
        final INginxPlaceholderManager placeholderManager = context.getNginxConfig().getNginxPlaceholderManager();
        // 提前处理内置的各种参数
        placeholderManager.init(context);


        //1. 当前的配置
        NginxUserServerLocationConfig locationConfig = context.getCurrentUserServerLocationConfig();
        if(locationConfig == null) {
            return;
        }

        List<NginxUserConfigParam> directives = locationConfig.getDirectives();
        if(CollectionUtil.isEmpty(directives)) {
            return;
        }

        // 处理
        for(NginxUserConfigParam configParam : directives) {
            // 占位符处理
            placeholderHandle(configParam, placeholderManager, context);

            List<INginxParamHandle> handleList = paramManager.paramHandleList(configParam, context);
            if(CollectionUtil.isNotEmpty(handleList)) {
                for(INginxParamHandle paramHandle : handleList) {
                    paramHandle.beforeDispatch(configParam, context);
                }
            }
        }
    }

    /**
     * 占位符处理
     *
     * SET 问题，这个是按顺序处理的，所以暂时不用特别考虑
     *
     * @param configParam 配置指令
     * @param placeholderManager 占位符管理类
     * @param context 上下文
     * @since 0.17.0
     */
    protected void placeholderHandle(NginxUserConfigParam configParam,
                                     final INginxPlaceholderManager placeholderManager,
                                     final NginxRequestDispatchContext context) {
        String name = configParam.getName();
        if(name.equals("set")) {
            logger.warn("暂时不处理 set 指令对应的操作符替换，后续可考虑改进。");
            return;
        }

        // name 暂时不添加 $ 处理

        // value
        String value = configParam.getValue();
        String actualValue = getPlaceholderStr(value, placeholderManager, context);
        configParam.setValue(actualValue);

        // list
        List<String> valueList = configParam.getValues();
        List<String> newValueList = new ArrayList<>();
        if(CollectionUtil.isNotEmpty(valueList)) {
            for(String valueItem : valueList) {
                String actualValueItem = getPlaceholderStr(valueItem, placeholderManager, context);
                newValueList.add(actualValueItem);
            }

            configParam.setValues(newValueList);
        }

        // 结束
    }

    /**
     * 获取占位符对应的值
     * @param value 原始值
     * @param placeholderManager 管理类
     * @param context 上下文
     * @return 结果
     */
    protected String getPlaceholderStr(String value,
                                       final INginxPlaceholderManager placeholderManager,
                                       final NginxRequestDispatchContext context) {
        // value
        if(value.startsWith(NginxConst.PLACEHOLDER_PREFIX)) {
            Object actualValue = placeholderManager.getValue(context, value);
            if(actualValue == null) {
                logger.error("占位符未初始化 value={}", value);
                throw new Nginx4jException("占位符未初始化" + value);
            }

            // 设置值
            String actualValueStr = actualValue.toString();
            logger.info("占位符替换 value={}, actualValueStr={}", value, actualValueStr);
            return actualValueStr;
        }

        // 原始值
        return value;
    }
```

首先初始化所有的占位符策略；

然后依次执行以前的 param 用户指令，这里 set 会按照顺序执行。

我们在占位符策略处理时特意跳过了 set，其实可以细化一点，比如支持 value 值使用 `$` 占位符。

# 测试

完成了上面的实现，本地启动验证一下：

基本访问：http://192.168.1.12:8080/

```
信息: [Nginx] channelRead writeAndFlush start request=HttpObjectAggregator$AggregatedFullHttpRequest(decodeResult: success, version: HTTP/1.1, content: CompositeByteBuf(ridx: 0, widx: 0, cap: 0, components=0))
GET /favicon.ico HTTP/1.1
Host: 192.168.1.12:8080
Connection: keep-alive
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36
Accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8
Referer: http://192.168.1.12:8080/
Accept-Encoding: gzip, deflate
Accept-Language: zh-CN,zh;q=0.9
content-length: 0, id=40a5effffe257be0-00002a80-00000004-f834a6fd4eed4fe9-527bc66f
六月 09, 2024 8:51:12 下午 com.github.houbb.log.integration.adaptors.commons.JakartaCommonsLoggingImpl info
信息: 命中普通前缀配置 requestUri=/favicon.ico, value=/
六月 09, 2024 8:51:12 下午 com.github.houbb.log.integration.adaptors.commons.JakartaCommonsLoggingImpl info
信息: placeholder put key=$args,value=
六月 09, 2024 8:51:12 下午 com.github.houbb.log.integration.adaptors.commons.JakartaCommonsLoggingImpl info
信息: placeholder put key=$content_length,value=0
六月 09, 2024 8:51:12 下午 com.github.houbb.log.integration.adaptors.commons.JakartaCommonsLoggingImpl info
信息: placeholder put key=$content_type,value=null
六月 09, 2024 8:51:12 下午 com.github.houbb.log.integration.adaptors.commons.JakartaCommonsLoggingImpl info
信息: placeholder put key=$document_root,value=/D:/github/nginx4j/target/classes/
六月 09, 2024 8:51:12 下午 com.github.houbb.log.integration.adaptors.commons.JakartaCommonsLoggingImpl info
信息: placeholder put key=$host,value=192.168.1.12:8080
六月 09, 2024 8:51:12 下午 com.github.houbb.log.integration.adaptors.commons.JakartaCommonsLoggingImpl info
信息: placeholder put key=$http_cookie,value=
六月 09, 2024 8:51:12 下午 com.github.houbb.log.integration.adaptors.commons.JakartaCommonsLoggingImpl info
信息: placeholder put key=$remote_addr,value=192.168.1.12
六月 09, 2024 8:51:12 下午 com.github.houbb.log.integration.adaptors.commons.JakartaCommonsLoggingImpl info
信息: placeholder put key=$remote_port,value=54511
六月 09, 2024 8:51:12 下午 com.github.houbb.log.integration.adaptors.commons.JakartaCommonsLoggingImpl info
信息: placeholder put key=$request_method,value=GET
六月 09, 2024 8:51:12 下午 com.github.houbb.log.integration.adaptors.commons.JakartaCommonsLoggingImpl info
信息: placeholder put key=$request_uri,value=/favicon.ico
六月 09, 2024 8:51:12 下午 com.github.houbb.log.integration.adaptors.commons.JakartaCommonsLoggingImpl info
信息: placeholder put key=$schema,value=http
六月 09, 2024 8:51:12 下午 com.github.houbb.log.integration.adaptors.commons.JakartaCommonsLoggingImpl info
信息: placeholder put key=$server_addr,value=192.168.1.12
六月 09, 2024 8:51:12 下午 com.github.houbb.log.integration.adaptors.commons.JakartaCommonsLoggingImpl info
信息: placeholder put key=$server_name,value=192.168.1.12:8080
六月 09, 2024 8:51:12 下午 com.github.houbb.log.integration.adaptors.commons.JakartaCommonsLoggingImpl info
信息: placeholder put key=$server_port,value=192.168.1.12:8080
六月 09, 2024 8:51:12 下午 com.github.houbb.log.integration.adaptors.commons.JakartaCommonsLoggingImpl info
信息: placeholder put key=$server_protocol,value=HTTP/1.1
六月 09, 2024 8:51:12 下午 com.github.houbb.log.integration.adaptors.commons.JakartaCommonsLoggingImpl info
信息: placeholder put key=$uri,value=/favicon.ico
六月 09, 2024 8:51:12 下午 com.github.houbb.log.integration.adaptors.commons.JakartaCommonsLoggingImpl info
信息: placeholder put key=$user_agent,value=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36
六月 09, 2024 8:51:12 下午 com.github.houbb.log.integration.adaptors.commons.JakartaCommonsLoggingImpl warn
警告: 暂时不处理 set 指令对应的操作符替换，后续可考虑改进。
...
```

这里的日志量还是比较多的，我们把级别还是从 INFO 调整为 debug 比较合理。

# 小结

占位符为 nginx 的配置提供了非常强大灵活的能力。

我们目前实现的指令比较少，后续考虑花一段时间，将 nginx 的常见指令都支持一下。

这样的 nginx 才是强大易用的。

我是老马，期待与你的下次重逢。

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

# 实现优化

## 占位符周期调整

设置 3 个生命周期：

```java

```
































--------------------------------------------------------------------------------------------------------------------------------------------------------


# chat


## nginx 的占位符

Nginx 中的占位符（也称为变量）是预定义的变量，用于在配置文件中动态获取和使用请求相关的信息。

Nginx 提供了许多内置变量，涵盖了请求头、客户端信息、服务器信息等。以下是一些常用的内置变量及其用途。

### 请求相关变量

- `$request`：完整的原始请求行，例如 `GET /index.html HTTP/1.1`。
- `$request_uri`：包含请求的 URI 和参数，但不包括主机名，例如 `/index.html?arg=1`。
- `$uri`：包含请求的 URI，不包括参数部分，例如 `/index.html`。
- `$args`：请求的参数部分，例如 `arg=1&arg2=2`。
- `$is_args`：如果请求有参数，则值为 `?`，否则为空字符串。
- `$query_string`：同 `$args`。

基于 netty 的 FullHttpRequest，如何获取 $request $is_args 的值？

### 客户端相关变量

- `$remote_addr`：客户端的 IP 地址。
- `$remote_port`：客户端的端口号。
- `$remote_user`：用于 HTTP 基本认证的用户名。
- `$http_user_agent`：客户端的 User-Agent 头。
- `$http_referer`：客户端的 Referer 头。

基于 netty 的 FullHttpRequest，如何获取 $remote_user 的值？

### 服务器相关变量

- `$server_addr`：服务器的 IP 地址。这个值是通过系统调用获取的，在高负载时可能会影响性能。如果可能，尽量使用变量 `$hostname` 代替。
- `$server_name`：服务器名称。
- `$server_port`：服务器端口号。
- `$hostname`：服务器的主机名。


基于 netty 的 FullHttpRequest，如何获取 $hostname 的值？ 

### 连接相关变量

- `$connection`：连接的序列号。
- `$connection_requests`：这个连接上处理的请求数量。

基于 netty 的 FullHttpRequest，如何获取 $connection $connection_requests 的值？ 

### 请求处理相关变量

- `$request_time`：处理请求所用的时间，精度是毫秒。
- `$request_length`：请求的长度（包括请求行、请求头和请求体）。


基于 netty 的 FullHttpRequest/HttpResponse，如何获取 $request_time $request_length 的值？ 

### 响应相关变量

- `$body_bytes_sent`：传送给客户端的主体字节数，不包括响应头。
- `$status`：响应的状态码。
- `$sent_http_*`：发送给客户端的特定 HTTP 头部字段的值，例如 `$sent_http_content_type` 代表 `Content-Type` 头部字段的值。

基于 netty 的 FullHttpRequest/HttpResponse，如何获取 $body_bytes_sent $status $sent_http_* 的值？ 

### 其他常用变量

- `$scheme`：请求的协议（http 或 https）。
- `$document_root`：当前请求所在的根目录。
- `$document_uri`：同 `$uri`。
- `$realpath_root`：当前请求的真实路径，对应文件系统上的路径。
- `$binary_remote_addr`：客户端地址的二进制形式。
- `$request_filename`：当前请求的文件路径，由根目录和 URI 组成。
- `$limit_rate`：用于限制响应传输速率。

### 示例配置

以下是一个示例 Nginx 配置文件，展示了如何使用这些变量：

```conf
http {
    server {
        listen 80;
        server_name example.com;

        location / {
            root /var/www/html;
            index index.html index.htm;

            # 日志格式包含一些常用变量
            log_format custom '$remote_addr - $remote_user [$time_local] '
                              '"$request" $status $body_bytes_sent '
                              '"$http_referer" "$http_user_agent"';

            access_log /var/log/nginx/access.log custom;

            # 使用变量设置响应头
            add_header X-Request-ID $request_id;
            add_header X-Server-Name $server_name;

            # 使用变量设置响应内容
            if ($request_uri ~* "/test") {
                return 200 "Test URI: $request_uri\nServer: $server_name\n";
            }

            # 代理请求并传递一些头部信息
            location /proxy {
                proxy_pass http://backend_server;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            }
        }
    }
}
```

在这个示例中，我们使用了一些常见的内置变量来记录日志、设置响应头和代理请求。

这些变量在处理请求时非常有用，可以帮助我们动态地获取和使用请求相关的信息。

## set 指令用于设置一个占位符的值， nginx 可以修改或者移除一个占位符吗？如何配置

在 Nginx 中，通过 `set` 指令可以设置变量的值，但 Nginx 不能直接“移除”一个变量。相反，可以通过重新设置变量的值为空字符串或其他默认值来达到“移除”变量的效果。此外，Nginx 变量是局部的，在每个请求的上下文中独立存在，因此一个请求的变量不会影响其他请求。

### 修改变量的值

要修改一个已设置的变量的值，只需要再次使用 `set` 指令设置新的值即可。例如：

```conf
server {
    listen 80;
    server_name example.com;

    location / {
        set $my_var "Initial Value";
        # Some processing...
        set $my_var "Modified Value";  # Modify the value
        return 200 "Variable value is $my_var\n";
    }
}
```

### 清空变量的值

要清空一个变量的值，可以将其设置为空字符串：

```conf
server {
    listen 80;
    server_name example.com;

    location / {
        set $my_var "Some Value";
        # Some processing...
        set $my_var "";  # Clear the value
        return 200 "Variable value is '$my_var'\n";  # Will print an empty value
    }
}
```

### 条件性设置变量

可以使用条件语句 `if` 来根据某些条件设置或清空变量的值：

```conf
server {
    listen 80;
    server_name example.com;

    location / {
        set $my_var "Some Value";

        if ($request_method = POST) {
            set $my_var "POST Method Detected";
        }

        if ($request_method = GET) {
            set $my_var "";
        }

        return 200 "Variable value is '$my_var'\n";
    }
}
```

在这个示例中，根据请求方法的不同来设置变量 `$my_var` 的值。

对于 POST 方法，将变量设置为 `"POST Method Detected"`，对于 GET 方法，将变量清空。

### 例子：使用 `map` 指令来更灵活地管理变量

可以使用 `map` 指令来更灵活地设置变量的值，根据不同的条件动态改变变量。

这种方法在需要基于请求属性或其他条件动态设置变量时特别有用。

```conf
http {
    map $request_method $my_var {
        default "";
        POST "POST Method Detected";
        GET "GET Method Detected";
    }

    server {
        listen 80;
        server_name example.com;

        location / {
            return 200 "Variable value is '$my_var'\n";
        }
    }
}
```

在这个示例中，`$my_var` 的值根据请求方法动态设置。默认情况下，变量为空字符串，对于 POST 和 GET 方法分别设置不同的值。

### 结论

在 Nginx 中，可以通过 `set` 指令修改变量的值，通过设置为空字符串来清空变量的值。

此外，还可以结合 `if` 指令和 `map` 指令实现更加灵活的变量管理。

这些方法使得 Nginx 配置能够根据请求的不同条件动态调整，从而满足复杂的应用需求。

# 参考资料


* any list
{:toc}