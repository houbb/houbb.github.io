---
layout: post
title:  从零手写实现 nginx-29-try_files 指令
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

# nginx try_files 指令是什么？

Nginx 的 `try_files` 指令用于尝试一个或多个文件路径或 URI，以处理客户端请求。如果找到一个文件或 URI 存在，则返回该文件或执行该 URI。如果没有找到，则返回一个指定的错误码或重定向到一个默认的处理程序。`try_files` 指令通常用于静态文件服务、动态内容处理和错误处理。

### 语法

```nginx
try_files file1 [file2 ... filen] uri|=code;
```

- **file1, file2, ... filen**: 依次检查这些文件或目录的存在性。
- **uri**: 如果前面的文件或目录都不存在，重定向到指定的 URI。
- **=code**: 如果前面的文件或目录都不存在，返回指定的 HTTP 状态码。

### 示例

#### 静态文件服务

优先返回静态文件，如果文件不存在，则返回 404 错误。

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        root /var/www/html;
        try_files $uri $uri/ =404;
    }
}
```

#### 动态内容处理

优先返回静态文件，如果文件不存在，则将请求重定向到一个 PHP 处理程序。

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        root /var/www/html;
        fastcgi_pass unix:/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

#### 单页应用（SPA）

所有路径都指向入口的 `index.html` 文件，以支持前端路由。

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
}
```

### 工作原理

1. **尝试多个文件路径**：按顺序检查指定的文件或目录是否存在。如果找到一个存在的文件或目录，则立即返回该文件或目录。
2. **重定向到 URI**：如果所有指定的文件或目录都不存在，则重定向到一个指定的 URI。这通常用于将请求传递给动态处理程序。
3. **返回指定的 HTTP 状态码**：如果所有指定的文件或目录都不存在，并且未指定 URI，则返回指定的 HTTP 状态码（如 `404`）。

### 优点

- **灵活性高**：可以轻松处理静态文件、动态内容和错误处理。
- **配置简洁**：通过一条指令即可实现多种路径检查和处理逻辑。
- **性能优化**：优先处理静态文件，避免不必要的动态处理，提高响应速度。

### 缺点

- **调试困难**：由于会依次检查多个路径，调试和排查问题时可能比较复杂。
- **灵活性有限**：无法进行条件判断或复杂的重写规则处理，需要结合其他指令使用。
- **错误处理简单**：只能指定简单的错误处理方式，无法进行复杂的错误处理逻辑。

### 总结

Nginx 的 `try_files` 指令是一种非常强大和灵活的工具，适用于处理多种请求路径和文件检查需求。

通过适当的配置，可以显著提高服务器的性能和响应速度，同时简化配置文件的编写和维护。

# java 实现

## 整体思路

1）遍历非最后一个的 uri，替换占位符，判断文件是否存在，存在则返回。

2）判断最后一个 uri 或者 code，直接处理对应的逻辑。

## 核心逻辑

```java
/**
 * try_files path1 path2 ... final;
 *
 * - `path1`, `path2`, ...：要检查的文件或 URI 列表。可以是相对路径或绝对路径。
 *
 * - `final`：如果前面的所有路径都不存在，最后一个参数可以是一个 URI，Nginx 将内部重定向到该 URI，或者是一个 HTTP 状态码（如 404），用于返回相应的错误。
 *
 * @see INginxPlaceholder 占位符
 * @see com.github.houbb.nginx4j.support.request.dispatch.http.NginxRequestDispatchHttpReturn 设置对应的返回码 =xxx
 */
public class NginxTryFilesDefault implements INginxTryFiles{

    private static final Log log = LogFactory.getLog(NginxTryFilesDefault.class);

    /**
     * 处理 try_files 指令
     *
     * @param request     请求
     * @param nginxConfig 配置
     * @param context     上下文
     */
    public void tryFiles(FullHttpRequest request,
                         final NginxConfig nginxConfig,
                         NginxRequestDispatchContext context) {
        // 获取当前的 location
        List<NginxCommonConfigEntry> directiveList = InnerNginxContextUtil.getLocationDirectives(context);
        Map<String, List<NginxCommonConfigEntry>> directiveMap = InnerNginxContextUtil.getLocationDirectiveMap(directiveList);

        List<NginxCommonConfigEntry> tryFiles = directiveMap.get(NginxDirectiveEnum.TRY_FILES.getCode());
        if(CollectionUtil.isEmpty(tryFiles)) {
            return;
        }

        NginxCommonConfigEntry firstEntry = tryFiles.get(0);

        // 遍历非 final 的文件信息
        String notFinalUri = getNotFinalMatchedFileUri(firstEntry, context);
        if(StringUtil.isNotEmpty(notFinalUri)) {
            request.setUri(notFinalUri);
            return;
        }

        // 判断 final 变量
        final String lastUri = firstEntry.getValues().get(firstEntry.getValues().size()-1);
        if(lastUri.startsWith("=")) {
            // 拆分为 return
            NginxReturnResult result = new NginxReturnResult();
            result.setCode(Integer.parseInt(lastUri.substring(1)));
            result.setValue("try_files final");
            context.setNginxReturnResult(result);
            return;
        }

        String lastReplaceUri = replacePlaceholders(lastUri, context.getPlaceholderMap());
        request.setUri(lastReplaceUri);
    }

    /**
     * 获取匹配的文件 url
     * @param entry 实体
     * @param context 上下文
     * @return 结果
     */
    private String getNotFinalMatchedFileUri(final NginxCommonConfigEntry entry,
                                            NginxRequestDispatchContext context) {
        List<String> values = entry.getValues();

        for(int i = 0; i < values.size()-1; i++) {
            String replacedUri = getMatchedFileUri(values.get(i), context);

            if(StringUtil.isNotEmpty(replacedUri)) {
                return replacedUri;
            }
        }

        return null;
    }

    private String getMatchedFileUri(final String requestUri,
                                     NginxRequestDispatchContext context) {
        final Map<String, Object> replaceMap = context.getPlaceholderMap();

        String replacedUri = replacePlaceholders(requestUri, replaceMap);

        // 判断文件是否存
        File file = InnerFileUtil.getTargetFile(replacedUri, context);
        if(file.exists()) {
            log.info("Nginx getMatchedFileUri file={}", file.getAbsolutePath());
            return replacedUri;
        }

    return null;
    }

    /**
     * 替换字符串中的占位符
     *
     * @param input    用户输入的字符串，包含占位符
     * @param variables 存储占位符及其替换值的 Map
     * @return 替换后的字符串
     */
    public static String replacePlaceholders(String input, Map<String, Object> variables) {
        // 使用 StringBuilder 来构建替换后的字符串
        StringBuilder result = new StringBuilder(input);

        // 遍历 Map 进行替换
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            String placeholder = entry.getKey();
            String replacement = String.valueOf(entry.getValue());

            // 使用 String 的 replace 方法替换所有占位符
            int start = result.indexOf(placeholder);
            while (start != -1) {
                result.replace(start, start + placeholder.length(), replacement);
                start = result.indexOf(placeholder, start + replacement.length());
            }
        }

        return result.toString();
    }

}
```

# 小结

Nginx 的 `try_files` 指令是一个强大且灵活的工具，用于处理静态文件、友好 URL 重写和自定义错误处理。

它通过按顺序检查多个路径并执行相应操作，使配置文件更加简洁和高效。

### 主要用途

- **静态文件服务**：首先尝试提供静态文件，如果找不到则执行其他操作。
- **友好 URL 重写**：用于支持伪静态 URL，将请求重写到实际的文件路径或动态脚本。
- **错误处理**：如果所有尝试的文件都不存在，则返回一个特定的错误页面。

### 工作机制

- `try_files` 按顺序检查列出的每个路径。
- 如果找到了一个存在的文件或目录，则立即停止进一步检查并使用该文件或目录响应请求。
- 如果所有列出的路径都不存在，则执行最后指定的 URI，这通常是一个错误页面或其他处理逻辑。

### 优点

- **高效静态文件处理**：减少了不必要的动态请求处理。
- **灵活的错误处理**：可以轻松配置自定义错误页面或重写规则。
- **简洁配置**：使复杂的文件查找和重写逻辑更加直观和易于管理。

# chat

## 详细介绍nginx 的 try_files 指令

`try_files` 是 Nginx 配置文件中用于处理静态文件和代理请求的指令。

它可以按顺序检查一系列文件路径或 URI，如果找到了一个存在的文件或目录，就会返回该文件或目录。

如果所有路径都不存在，可以返回一个默认的 URI 或一个自定义的错误代码。

以下是 `try_files` 指令的语法和一些示例：

### 语法
```conf
try_files path1 path2 ... final;
```
- `path1`, `path2`, ...：要检查的文件或 URI 列表。可以是相对路径或绝对路径。
- `final`：如果前面的所有路径都不存在，最后一个参数可以是一个 URI，Nginx 将内部重定向到该 URI，或者是一个 HTTP 状态码（如 404），用于返回相应的错误。

### 示例

#### 示例 1：静态文件服务
```conf
server {
    listen 80;
    server_name example.com;

    location / {
        root /var/www/html;
        try_files $uri $uri/ =404;
    }
}
```
在这个示例中，Nginx 会依次检查以下路径：
1. `$uri`：请求的 URI（相对于 root 指定的目录）。
2. `$uri/`：如果 URI 是一个目录。
3. `=404`：如果前面的路径都不存在，返回 404 错误。

#### 示例 2：静态文件和 PHP 脚本结合
```conf
server {
    listen 80;
    server_name example.com;

    location / {
        root /var/www/html;
        index index.html index.htm index.php;
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        root /var/www/html;
        fastcgi_pass unix:/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```
在这个示例中，Nginx 会依次检查以下路径：
1. `$uri`：请求的 URI。
2. `$uri/`：如果 URI 是一个目录。
3. `/index.php?$query_string`：如果前面的路径都不存在，将请求内部重定向到 `/index.php`，并保留查询字符串。

#### 示例 3：处理 SPA (Single Page Application)
```conf
server {
    listen 80;
    server_name example.com;

    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
}
```
在这个示例中，Nginx 会依次检查以下路径：
1. `$uri`：请求的 URI。
2. `$uri/`：如果 URI 是一个目录。
3. `/index.html`：如果前面的路径都不存在，将请求内部重定向到 `/index.html`，通常用于前端单页应用（SPA），以确保所有路径都指向入口 HTML 文件。

`try_files` 指令非常强大且灵活，能够根据需求配置不同的文件处理逻辑。在配置过程中，可以结合 `$uri`、`$uri/`、`$query_string` 等变量，实现多种场景下的需求。

## 为什么 nginx 要设计 try_files 指令

Nginx 设计 `try_files` 指令是为了提供一种灵活且高效的方式来处理文件请求和内部重定向。

这一指令在多种场景下都非常有用，特别是在处理静态文件、动态内容和错误页面时。

以下是设计 `try_files` 指令的几个主要原因：

### 1. 静态文件优先
`try_files` 指令允许 Nginx 依次检查一系列静态文件或目录是否存在，并在找到第一个存在的文件时立即返回。这种方式能够显著提高静态内容的响应速度，因为不需要额外的处理逻辑。

### 2. 简化配置
在没有 `try_files` 指令的情况下，你可能需要编写多个 `location` 块或使用复杂的 `rewrite` 规则来处理不同的文件和 URI 请求。`try_files` 指令通过一条配置语句就能实现这种需求，简化了配置文件的编写和维护。

### 3. 处理内部重定向
`try_files` 可以用来将不存在的文件请求重定向到另一个 URI，例如将所有未找到的文件请求重定向到一个处理程序（如 PHP、Python 等）。这在单页应用（SPA）或内容管理系统（CMS）中尤其有用，能够确保所有路径都能正确地加载到一个入口点进行处理。

### 4. 提高性能
通过依次检查文件的存在性，`try_files` 指令避免了不必要的文件系统查找和请求处理，从而提高了服务器的性能。例如，在处理静态文件时，Nginx 可以直接返回文件，而不需要经过动态处理程序或数据库查询。

### 5. 错误处理
`try_files` 指令还允许你指定一个默认的错误处理方式（如返回 404 错误）。这对于统一处理不存在的文件请求非常有用，能够提供一致的用户体验。

### 示例场景

以下是几个常见的使用 `try_files` 指令的场景：

#### 1. 静态文件服务
假设你有一个网站，主要提供静态文件，并希望在文件不存在时返回 404 错误：

```conf
server {
    listen 80;
    server_name example.com;

    location / {
        root /var/www/html;
        try_files $uri $uri/ =404;
    }
}
```

#### 2. 静态文件和动态内容结合
你希望优先返回静态文件，如果文件不存在，则将请求重定向到一个 PHP 处理程序：

```conf
server {
    listen 80;
    server_name example.com;

    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        root /var/www/html;
        fastcgi_pass unix:/run/php/php7.4-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}
```

#### 3. 单页应用（SPA）
你有一个前端单页应用，需要所有路径都指向入口的 `index.html` 文件：

```conf
server {
    listen 80;
    server_name example.com;

    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
}
```

### 总结
`try_files` 指令设计的核心目的是为了提供一种高效、简洁且灵活的方式来处理文件请求和内部重定向。

它大大简化了 Nginx 配置文件的复杂度，提高了服务器性能，并能很好地适应不同的应用场景。

## nginx 要设计 try_files 指令有哪些优缺点？

Nginx 设计 `try_files` 指令有许多优点，同时也存在一些缺点。下面详细介绍这些优缺点：

### 优点

1. **灵活性高**：
   - `try_files` 允许在一个配置块中指定多个文件或 URI 路径，并按顺序进行检查。这种灵活性简化了处理静态文件和动态内容的配置。

2. **配置简洁**：
   - `try_files` 能够通过一条指令实现多种路径检查和处理逻辑，减少了复杂的配置规则和冗长的配置文件，使配置更加简洁和易于维护。

3. **性能优化**：
   - `try_files` 优先检查文件系统中的静态文件，避免了不必要的动态内容处理。这样可以减少服务器的处理开销，提高响应速度和整体性能。

4. **统一错误处理**：
   - 通过 `try_files` 可以方便地处理文件未找到的情况，指定一个默认的错误处理方式（如返回 404 错误），提供一致的用户体验。

5. **简化内部重定向**：
   - `try_files` 指令可以直接将请求重定向到另一个 URI 或处理程序（如 PHP、Python 等），这在单页应用（SPA）或内容管理系统（CMS）中尤其有用。

### 缺点

1. **调试困难**：
   - 由于 `try_files` 会依次检查多个路径，调试和排查问题时可能会比较复杂，特别是在处理复杂的路径匹配和重定向逻辑时。

2. **灵活性有限**：
   - 尽管 `try_files` 提供了一定的灵活性，但在处理更复杂的逻辑时可能会显得不够。例如，`try_files` 无法进行条件判断或执行复杂的重写规则，这需要结合其他指令如 `rewrite`。

3. **错误处理简单**：
   - `try_files` 只能指定一个简单的错误处理方式（如返回一个状态码或重定向到一个固定的 URI），无法进行更复杂的错误处理逻辑。

4. **不适用于所有场景**：
   - 在某些复杂应用场景下，可能需要使用 `try_files` 之外的指令或工具来实现所需功能，例如使用 `rewrite` 规则或 `if` 条件语句。

### 结论

总体而言，`try_files` 指令在简化配置、优化性能和提供灵活性方面具有显著的优势，但在调试、处理复杂逻辑和错误处理方面存在一定的局限性。

在实际使用中，可以根据具体需求权衡其优缺点，选择合适的指令和配置方式。

例如，对于简单的静态文件服务和单页应用，`try_files` 是一个非常有效的工具；而对于复杂的动态内容处理和重写规则，可能需要结合其他 Nginx 指令来实现。

## 如果让你设计 ngnix try_files 指令，你会如何设计的更好？为什么？

设计 `try_files` 指令时可以借鉴现有的优点，并解决其现有的缺点，从而使其更加灵活、高效和易于调试。以下是一些改进建议和设计思路：

### 改进建议

1. **增强调试能力**：
   - **增加调试选项**：提供一个可选的调试模式，允许记录每一步的路径检查和匹配结果，以便更容易地排查问题。
   - **详细日志**：在日志中记录每一个被尝试的路径，以及为什么选择或不选择该路径（如文件不存在、权限问题等）。

2. **增加条件逻辑**：
   - **条件判断**：允许在 `try_files` 指令中使用条件判断，根据请求的特定属性（如 HTTP 方法、请求头）进行不同的路径检查。
   - **增强的重写能力**：在路径不存在的情况下，允许指定复杂的重写规则，而不仅仅是简单的 URI 重定向或状态码返回。

3. **改进的错误处理**：
   - **自定义错误处理函数**：允许用户定义复杂的错误处理逻辑，而不仅仅是返回一个状态码或重定向到一个固定的 URI。
   - **细粒度错误配置**：提供更多的错误处理选项，例如在文件不存在时执行特定的脚本或回调。

4. **更灵活的路径检查**：
   - **优先级控制**：允许用户控制路径检查的优先级，而不仅仅是按顺序检查。
   - **并行检查**：在可能的情况下，同时检查多个路径，以提高性能。

### 示例设计

下面是一个改进后的 `try_files` 指令的设计示例，包含了上述的一些改进：

```conf
server {
    listen 80;
    server_name example.com;

    location / {
        root /var/www/html;
        
        # 启用调试模式
        try_files_debug on;

        # 进行路径检查，增加条件判断和优先级控制
        try_files {
            path "/static" if ($request_method = GET) priority=1;
            path "/dynamic" if ($request_method = POST) priority=2;
            path "/cached" priority=3;
            default 404;
        }

        # 自定义错误处理函数
        error_handler {
            404 {
                # 自定义处理逻辑，可以是脚本、回调等
                execute /scripts/handle_404.sh;
            }
            500 {
                # 自定义处理逻辑
                log "Internal Server Error";
                redirect /error_page.html;
            }
        }
    }
}
```

### 设计思路

1. **调试模式**：
   - `try_files_debug on`：启用调试模式，记录每一步的路径检查和匹配结果。

2. **路径检查和条件判断**：
   - `try_files` 指令块中，使用 `path` 子指令进行路径检查，允许使用条件判断（如 `$request_method`）。
   - `priority` 参数用于控制路径检查的优先级。

3. **自定义错误处理**：
   - `error_handler` 指令块中，定义了不同错误码的处理逻辑，可以是执行脚本、记录日志、重定向等。

### 为什么这样设计

1. **增强调试能力**：
   - 通过增加调试模式和详细日志，用户可以更容易地排查和解决配置问题。

2. **增加条件逻辑**：
   - 条件判断和增强的重写能力使得 `try_files` 更加灵活，能够处理更复杂的请求和路径检查需求。

3. **改进的错误处理**：
   - 自定义错误处理函数和细粒度错误配置使得错误处理更加灵活和可控，满足更多应用场景的需求。

4. **更灵活的路径检查**：
   - 通过优先级控制和并行检查，优化了路径检查的性能和灵活性，适应不同的业务需求。

通过这些改进，`try_files` 指令可以变得更加高效、灵活和易于使用，能够处理更复杂的应用场景和配置需求。

# 参考资料


* any list
{:toc}