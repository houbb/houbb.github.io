---
layout: post
title:  从零手写实现 nginx-28-error pages 指令
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

[从零手写实现 nginx-25-nginx map 指令](https://houbb.github.io/2018/11/22/nginx-write-25-directives-map)

[从零手写实现 nginx-26-nginx rewrite 指令](https://houbb.github.io/2018/11/22/nginx-write-26-directives-rewrite)

[从零手写实现 nginx-27-nginx return 指令](https://houbb.github.io/2018/11/22/nginx-write-27-directives-return)

[从零手写实现 nginx-28-nginx error_pages 指令](https://houbb.github.io/2018/11/22/nginx-write-28-directives-error-pages)

[从零手写实现 nginx-29-nginx try_files 指令](https://houbb.github.io/2018/11/22/nginx-write-29-directives-try_files)

[从零手写实现 nginx-30-nginx proxy_pass upstream 指令](https://houbb.github.io/2018/11/22/nginx-write-30-proxy-pass)

[从零手写实现 nginx-31-nginx load-balance 负载均衡](https://houbb.github.io/2018/11/22/nginx-write-31-load-balance)

[从零手写实现 nginx-32-nginx load-balance 算法 java 实现](https://houbb.github.io/2018/11/22/nginx-write-32-load-balance-java-impl)

[从零手写实现 nginx-33-nginx http proxy_pass 测试验证](https://houbb.github.io/2018/11/22/nginx-write-33-http-proxy-pass-test)

[从零手写实现 nginx-34-proxy_pass 配置加载处理](https://houbb.github.io/2018/11/22/nginx-write-34-http-proxy-pass-config-load)

[从零手写实现 nginx-35-proxy_pass netty 如何实现？](https://houbb.github.io/2018/11/22/nginx-write-35-http-proxy-pass-netty)



# nginx 的 error_page 指令

`nginx` 的 `error_page` 指令用于定义自定义错误页面。

当服务器遇到错误时，`nginx` 会根据配置返回自定义的错误页面，而不是默认的错误页面。这在提高用户体验和品牌一致性方面非常有用。

### `error_page` 指令语法

```nginx
error_page code [code ...] [=[response]] uri;
```

- `code`：HTTP 状态码，可以是单个状态码或多个状态码，表示哪些错误状态码会触发自定义错误页面。
- `=[response]`：可选参数，表示在返回自定义错误页面时，是否改变 HTTP 响应状态码。
- `uri`：指定自定义错误页面的 URI，可以是相对路径或绝对路径。

### 示例和解释

#### 基本用法

1. **单个错误代码**

```nginx
error_page 404 /custom_404.html;
```

当服务器返回 404 错误时，`nginx` 会返回 `/custom_404.html` 这个页面。

2. **多个错误代码**

```nginx
error_page 500 502 503 504 /custom_5xx.html;
```

当服务器返回 500, 502, 503 或 504 错误时，`nginx` 会返回 `/custom_5xx.html` 这个页面。

#### 改变响应状态码

有时，你可能希望在重定向到自定义错误页面时，改变 HTTP 响应状态码。例如，将 404 错误重定向到一个页面，但返回 200 状态码。

```nginx
error_page 404 =200 /custom_404.html;
```

当服务器返回 404 错误时，`nginx` 会返回 `/custom_404.html` 页面，但 HTTP 响应状态码是 200。

#### 使用内部重定向

可以使用 `@named_location` 来处理错误。这个方法允许你将错误处理逻辑封装在一个内部位置。

```nginx
error_page 500 502 503 504 /50x.html;

location = /50x.html {
    root /usr/share/nginx/html;
}
```

当服务器返回 500, 502, 503 或 504 错误时，`nginx` 会将请求内部重定向到 `/50x.html`。此时，`/50x.html` 页面存放在 `/usr/share/nginx/html` 目录下。

### 高级用法

#### 自定义错误页面与代理服务器结合

当你使用 `nginx` 作为反向代理服务器时，也可以定义自定义错误页面。例如，当后端服务器不可用时，显示友好的错误页面。

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;
        proxy_intercept_errors on;
        error_page 500 502 503 504 /custom_50x.html;
    }

    location = /custom_50x.html {
        root /usr/share/nginx/html;
    }
}
```

在这个例子中，当后端服务器返回 500, 502, 503 或 504 错误时，`nginx` 会拦截这些错误并返回自定义的 `/custom_50x.html` 页面。

### 常见错误代码

以下是一些常见的 HTTP 错误代码及其含义：

- `400`：Bad Request（错误请求）
- `401`：Unauthorized（未授权）
- `403`：Forbidden（禁止访问）
- `404`：Not Found（未找到）
- `500`：Internal Server Error（内部服务器错误）
- `502`：Bad Gateway（错误网关）
- `503`：Service Unavailable（服务不可用）
- `504`：Gateway Timeout（网关超时）

### 示例：完整的 Nginx 配置文件

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /custom_404.html;
    error_page 500 502 503 504 /custom_50x.html;

    location = /custom_404.html {
        root /usr/share/nginx/html;
    }

    location = /custom_50x.html {
        root /usr/share/nginx/html;
    }
}
```

### 结论

`nginx` 的 `error_page` 指令非常灵活，允许你根据需要自定义错误页面，以改善用户体验和提供更友好的错误消息。

通过使用该指令，你可以轻松地创建品牌一致的错误页面，并将其集成到现有的 `nginx` 配置中。

# java error_page

## error_page 指令的处理

```java
package com.github.houbb.nginx4j.config.param.impl.dispatch;

import com.github.houbb.heaven.util.util.CollectionUtil;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.nginx4j.config.NginxCommonConfigEntry;
import com.github.houbb.nginx4j.config.NginxConfig;
import com.github.houbb.nginx4j.config.param.AbstractNginxParamLifecycleDispatch;
import com.github.houbb.nginx4j.exception.Nginx4jException;
import com.github.houbb.nginx4j.support.errorpage.INginxErrorPageManage;
import com.github.houbb.nginx4j.support.request.dispatch.NginxRequestDispatchContext;

import java.util.List;

/**
 * 参数处理类 响应头处理
 *
 * @since 0.25.0
 * @author 老马啸西风
 */
public class NginxParamHandleErrorPage extends AbstractNginxParamLifecycleDispatch {

    private static final Log logger = LogFactory.getLog(NginxParamHandleErrorPage.class);


    @Override
    public boolean doBeforeDispatch(NginxCommonConfigEntry configParam, NginxRequestDispatchContext context) {
        List<String> values = configParam.getValues();
        if(CollectionUtil.isEmpty(values) || values.size() < 2) {
            throw new Nginx4jException("error_page 必须包含2个参数");
        }

        NginxConfig nginxConfig = context.getNginxConfig();
        INginxErrorPageManage nginxErrorPageManage = nginxConfig.getNginxErrorPageManage();

        // 直接拆分
        String lastHtml = values.get(values.size()-1);
        for(int i = 0; i < values.size()-1; i++) {
            String code = values.get(i);
            nginxErrorPageManage.register(code, lastHtml);
        }

        return true;
    }

    @Override
    public boolean doAfterDispatch(NginxCommonConfigEntry configParam, NginxRequestDispatchContext context) {
        return true;
    }

    @Override
    protected String getKey(NginxCommonConfigEntry configParam, NginxRequestDispatchContext context) {
        return "error_page";
    }

    @Override
    public String directiveName() {
        return "error_page";
    }

}
```

## 定义 error_page 映射关系的存储

```java
package com.github.houbb.nginx4j.support.errorpage;

import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * @since 0.25.0
 * @author 老马啸西风
 */
public class NginxErrorPageManageDefault implements INginxErrorPageManage {

    private static final Log logger = LogFactory.getLog(NginxErrorPageManageDefault.class);

    private final Map<String, String> map = new HashMap<>();

    @Override
    public void register(String code, String htmlPath) {
        map.put(code, htmlPath);
        logger.info("error_page register code={}, path={}", code, htmlPath);
    }

    @Override
    public String getPath(String code) {
        String path = map.get(code);

        logger.info("error_page register code={}, path={}", code, path);
        return path;
    }

}
```

# chat

## Nginx 为什么要设计 error_page 指令

Nginx 设计 `error_page` 指令的原因有很多，主要目的是为了提高用户体验、增强安全性和可维护性。以下是 Nginx 设计 `error_page` 指令的几个关键原因：

### 1. 提高用户体验
- **用户友好**：默认的错误页面通常比较简陋，无法提供用户所需的详细信息。自定义错误页面可以显示更加友好的消息，引导用户下一步操作，例如返回首页或联系客服。
- **品牌一致性**：自定义错误页面可以设计成与网站整体风格一致的页面，增强品牌的一致性和专业性。

### 2. 增强安全性
- **信息隐藏**：默认的错误页面可能泄露服务器的内部信息（如服务器类型和版本），这些信息可能被攻击者利用。通过自定义错误页面，可以隐藏这些敏感信息，从而增强网站的安全性。

### 3. 提供更好的调试和运维支持
- **详细错误信息**：对于内部团队，可以配置包含详细错误信息的页面来辅助调试和运维，而对外用户隐藏这些信息。
- **日志和监控**：自定义错误页面可以包含特定的标识符，便于在日志中快速搜索和分析错误情况，从而提高问题排查效率。

### 4. 更好的 SEO 支持
- **适当的 HTTP 状态码**：通过 `error_page` 指令，可以确保返回合适的 HTTP 状态码，帮助搜索引擎更好地理解站点的结构。例如，可以确保 404 页面返回 404 状态码，而不是 200 状态码。
- **自定义重定向**：对于已删除或移动的页面，可以使用 `error_page` 指令配置适当的重定向，保持 SEO 的权重。

### 5. 负载均衡和高可用性
- **后端故障处理**：在反向代理或负载均衡配置中，可以通过 `error_page` 指令配置自定义页面，处理后端服务器的故障情况（如 502、503 错误），向用户展示友好的错误消息，而不是显示技术性较强的错误信息。
- **减少负载**：通过自定义错误页面，可以在前端处理某些常见的错误，减少后端服务器的压力，提高整体系统的可用性。

### 6. 提供更灵活的错误处理
- **多种错误处理方式**：`error_page` 指令允许根据不同的错误代码配置不同的处理方式，例如重定向到特定页面或展示不同的错误信息，使得错误处理更加灵活和个性化。
- **内部重定向**：可以使用内部重定向，将错误处理逻辑封装在特定的位置，增强配置的可读性和可维护性。

### 结论

Nginx 设计 `error_page` 指令是为了提供一个灵活、强大且易于使用的机制来处理各种错误情况。

通过自定义错误页面，网站可以显著改善用户体验，增强安全性，支持更好的调试和运维，同时还可以优化 SEO 和提升整体系统的可用性。

这使得 `error_page` 指令成为 Nginx 配置中一个非常重要和有用的功能。

## 如果让你设计 error_page 指令，你会如何设计的更好? 为什么

如果让我设计 `error_page` 指令，我会从以下几个方面进行改进，以提高其灵活性、可维护性和用户体验：

### 1. 更加灵活的配置选项
**当前问题**：Nginx 的 `error_page` 指令虽然功能强大，但在某些情况下可能不够灵活。例如，复杂的错误处理逻辑可能需要多个配置指令或复杂的条件判断。

**改进建议**：
- **条件逻辑支持**：允许基于请求头、请求参数或客户端 IP 等条件定义不同的错误页面。例如，根据用户的地理位置或设备类型返回不同的错误页面。
- **自定义变量支持**：允许使用自定义变量或函数来动态生成错误页面的 URI，提高配置的灵活性。

```nginx
error_page 404 /errors/404_$geoip_country.html if ($geoip_country != "US");
error_page 500 /errors/500_$device_type.html if ($device_type = "mobile");
```

### 2. 更丰富的错误处理动作
**当前问题**：目前 `error_page` 指令主要用于返回静态页面或重定向，有时需要更复杂的处理逻辑。

**改进建议**：
- **回调函数或脚本支持**：允许配置执行外部脚本或回调函数来处理错误，返回动态生成的内容。例如，通过 Lua、Python 或其他脚本语言生成自定义错误页面。

```nginx
error_page 500 =@dynamic_error_handler;

location @dynamic_error_handler {
    content_by_lua_block {
        ngx.say("Internal Server Error. Please try again later.")
    }
}
```

### 3. 更好的日志和监控支持
**当前问题**：虽然 Nginx 的日志功能强大，但针对错误处理的日志配置可能还不够细致。

**改进建议**：
- **详细的错误日志**：允许为每种错误类型配置不同的日志格式和日志级别，提供更加详细的错误信息，有助于调试和运维。

```nginx
error_page 404 /custom_404.html;
error_log /var/log/nginx/error_404.log warn if ($status = 404);

error_page 500 /custom_500.html;
error_log /var/log/nginx/error_500.log error if ($status = 500);
```

### 4. 提供标准化的错误响应格式
**当前问题**：不同的错误页面可能格式不一致，导致用户体验不一致。

**改进建议**：
- **标准化错误响应模板**：提供内置的错误响应模板，可以根据需要进行定制和扩展。例如，所有错误页面使用相同的模板，只是内容不同。

```nginx
error_page_template /path/to/error_template.html {
    title: "Error occurred"
    message: "An error occurred while processing your request."
    support_email: "support@example.com"
}
```

### 5. 更方便的调试和测试功能
**当前问题**：配置错误页面后，需要实际触发错误才能看到效果，调试不方便。

**改进建议**：
- **模拟错误响应**：提供命令或 API 来模拟错误响应，方便开发和调试。

```bash
nginx -simulate-error 404 -url /test
```

### 6. 集成更多的第三方服务
**当前问题**：目前的错误页面处理主要是本地处理，缺少与第三方服务的集成。

**改进建议**：
- **集成监控和报警服务**：在发生错误时，可以自动通知监控和报警服务（如 Prometheus、Grafana 或 Slack），提高问题响应速度。

```nginx
error_page 500 /custom_500.html;
alert_on_error 500 {
    service: "slack"
    webhook: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
    message: "500 Internal Server Error occurred at $time_local"
}
```

### 总结

通过以上改进，可以使 `error_page` 指令更加灵活、强大和易于使用。

这些改进将有助于提高用户体验、增强安全性、支持更好的调试和运维，同时还可以优化 SEO 和提升整体系统的可用性。

设计这些功能的目的是让管理员能够更精细地控制错误处理逻辑，提供一致和用户友好的错误页面，并且在发生问题时能够迅速响应和解决。

# 参考资料


* any list
{:toc}