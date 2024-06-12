---
layout: post
title:  从零手写实现 nginx-23-directive IF 条件判断指令
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

# 前言

大家好，我是老马。

这一节我们将配置的加载，拆分为不同的模块加载处理，便于后续拓展。

# if

## 详细介绍一下 nginx 的 if 指令

Nginx 的 `if` 指令是一个用来在配置文件中进行条件判断的工具。

它通常用于 `server`、`location`、和 `http` 块中，用于执行特定的指令或改变请求的处理方式。

虽然它提供了灵活性，但也需要小心使用，因为某些情况下它可能会导致配置复杂化或带来意想不到的行为。

### 语法

```nginx
if (condition) {
    # 指令
}
```

### 常见条件判断

- **变量值匹配**:

  ```nginx
  if ($variable = value) {
      # 指令
  }
  ```

- **变量值不匹配**:

  ```nginx
  if ($variable != value) {
      # 指令
  }
  ```

- **变量是否设置**:
  ```nginx
  if ($variable) {
      # 指令
  }
  ```

- **变量是否为空**:
  ```nginx
  if ($variable = "") {
      # 指令
  }
  ```

- **正则表达式匹配**:
  ```nginx
  if ($variable ~ pattern) {
      # 指令
  }
  ```

- **正则表达式不匹配**:
  ```nginx
  if ($variable !~ pattern) {
      # 指令
  }
  ```

- **正则表达式匹配并忽略大小写**:
  ```nginx
  if ($variable ~* pattern) {
      # 指令
  }
  ```

- **正则表达式不匹配并忽略大小写**:
  ```nginx
  if ($variable !~* pattern) {
      # 指令
  }
  ```

### 示例

1. **重定向非 www 的请求到 www**:
   ```nginx
   server {
       server_name example.com;
       if ($host = example.com) {
           return 301 http://www.example.com$request_uri;
       }
   }
   ```

2. **基于 User-Agent 的条件处理**:
   ```nginx
   location / {
       if ($http_user_agent ~* "MSIE") {
           return 403;
       }
       # 其他指令
   }
   ```

3. **阻止某个特定 IP 访问**:
   ```nginx
   location / {
       if ($remote_addr = 192.168.1.1) {
           return 403;
       }
       # 其他指令
   }
   ```

### 注意事项

1. **`if` 指令的限制**:
   - `if` 指令在某些情况下可能会导致配置难以维护，特别是在嵌套复杂逻辑时。
   - 它不能改变现有上下文中的配置（如 `server` 或 `location`），只能对请求进行处理。

2. **避免使用`if`进行重写逻辑**:
   Nginx 官方推荐尽量使用 `map` 指令、重写模块 (`rewrite`) 等替代 `if` 指令来处理 URL 重写等操作，因为这些方法更高效且更直观。

3. **尽量使用 `try_files`**:
   在处理静态文件和重定向时，`try_files` 是一个更好的选择，因为它在性能和可读性上更优。

### 更好的选择
在某些情况下，使用 `map` 指令或者特定模块（如 `rewrite` 模块）可以替代 `if` 指令，提供更高效且清晰的配置。

例如，可以使用 `map` 指令来处理复杂的条件逻辑：
```nginx
map $host $is_www {
    default 0;
    "www.example.com" 1;
    "example.com" 2;
}

server {
    server_name example.com www.example.com;
    if ($is_www = 2) {
        return 301 http://www.example.com$request_uri;
    }
}
```

总结来说，Nginx 的 `if` 指令可以用于条件判断，但在使用时应谨慎，尽量考虑其他更高效和可维护的替代方案。

## nginx if 模块，放在 http 模块，server 模块，location 块中的配置例子

下面是一些 Nginx 配置示例，展示如何在 `http`、`server` 和 `location` 模块中使用 `if` 指令。

每个示例都会说明如何在这些不同的上下文中使用 `if` 指令来进行各种条件判断。

### 在 `http` 模块中使用 `if` 指令

```nginx
http {
    # 示例变量
    set $example_variable "test_value";

    # 变量值匹配
    if ($example_variable = "test_value") {
        # 执行指令，例如设置另一个变量
        set $matched "yes";
    }

    # 变量是否设置
    if ($example_variable) {
        # 执行指令，例如设置另一个变量
        set $is_set "yes";
    }

    # 其他 HTTP 块配置
    server {
        listen 80;
        server_name example.com;

        location / {
            root /var/www/html;
            index index.html;
        }
    }
}
```

### 在 `server` 模块中使用 `if` 指令

```nginx
http {
    server {
        listen 80;
        server_name example.com;

        # 示例变量
        set $example_variable "test_value";

        # 变量值不匹配
        if ($example_variable != "other_value") {
            # 执行指令，例如重定向
            return 301 http://example.com/redirect;
        }

        # 变量是否为空
        if ($example_variable = "") {
            # 执行指令，例如返回 404
            return 404;
        }

        location / {
            root /var/www/html;
            index index.html;
        }
    }
}
```

### 在 `location` 模块中使用 `if` 指令

```nginx
http {
    server {
        listen 80;
        server_name example.com;

        location / {
            root /var/www/html;
            index index.html;

            # 示例变量
            set $example_variable "test_value";

            # 正则表达式匹配
            if ($example_variable ~ "^test.*") {
                # 执行指令，例如设置头部
                add_header X-Matched "yes";
            }

            # 正则表达式匹配并忽略大小写
            if ($example_variable ~* "TEST.*") {
                # 执行指令，例如设置头部
                add_header X-Matched-IgnoreCase "yes";
            }

            # 正则表达式不匹配
            if ($example_variable !~ "^no_match$") {
                # 执行指令，例如返回 403
                return 403;
            }
        }
    }
}
```

### 配置说明

1. **在 `http` 模块中**：这里的 `if` 指令可以用来设置全局变量或根据条件设置变量。配置项适用于整个 `http` 块中的所有 `server` 和 `location`。

2. **在 `server` 模块中**：`if` 指令用于服务器级别的配置，例如条件重定向或返回特定的 HTTP 状态码。

3. **在 `location` 模块中**：`if` 指令可以针对特定的 URL 路径进行更细粒度的控制，如条件设置响应头部或根据变量值返回特定状态码。

请注意，虽然在 `if` 指令中可以执行很多操作，但在实际配置中应尽量避免过于复杂的逻辑，以确保服务器的高性能和可维护性。如果有更复杂的需求，建议考虑使用 Nginx 的 `map` 指令或其他更合适的模块。


## nginx 中 if 的双引号问题

在 Nginx 配置中，使用双引号是为了确保字符串或正则表达式被正确解析，特别是在字符串或正则表达式中包含特殊字符或空格的情况下。对于正则表达式模式来说，双引号不是必须的，但在某些情况下使用双引号可以避免解析错误。

### 不使用双引号的情况
对于简单的正则表达式，不包含空格和特殊字符的情况，可以不使用双引号，例如：

```nginx
if ($example_variable ~ ^test.*) {
    # 指令集
}
```

### 使用双引号的情况
1. **包含空格或特殊字符**：
   当正则表达式或字符串中包含空格或特殊字符时，使用双引号可以确保这些字符被正确解析。例如：

   ```nginx
   if ($example_variable ~ "^test.*") {
       # 指令集
   }
   ```

2. **提高可读性**：
   在某些情况下，使用双引号可以提高配置文件的可读性，使正则表达式模式更加清晰。

### 实际处理

无论是否使用双引号，Nginx 会将正则表达式作为模式来进行匹配。

如果不使用双引号，Nginx 会直接解析模式，如果正则表达式中没有空格或特殊字符，这样做是完全可以的。

### 示例说明

以下是一个不使用双引号的配置：
```nginx
if ($example_variable ~ ^test.*) {
    # 指令集
}
```

这个配置与使用双引号的配置效果是相同的，只要正则表达式模式中不包含需要转义或解释的特殊字符。

### 结论
- **不使用双引号**：适用于正则表达式中不包含空格或特殊字符的简单模式。
- **使用双引号**：适用于包含空格或特殊字符的正则表达式模式，或者需要提高配置文件的可读性。

简而言之，双引号在 Nginx 配置文件中是可选的，但在某些情况下使用双引号可以确保配置文件被正确解析和处理。



## http 模块下，可以直接 if 下面配置一个模块吗？

在 Nginx 配置中，`if` 指令不能直接包含其他模块或块配置。

`if` 指令的语法只允许包含一些简单的动作或指令，例如 `return`、`rewrite`、`set`、`break`、`access_log`、`add_header` 等。

不能在 `if` 指令内部直接配置 `server`、`location` 或其他复杂的块。

### 错误示例
下面的配置是无效的，因为 `if` 指令中包含了一个 `server` 块，这在 Nginx 中是不允许的。

```nginx
http {
    set $example_variable "test_value";

    if ($example_variable = "test_value") {
        server {
            listen 80;
            server_name example.com;
            
            location / {
                root /var/www/html;
                index index.html;
            }
        }
    }
}
```

### 正确的使用方式

如果要根据某个条件配置 `server` 或 `location` 块，可以使用其他方式，比如使用变量和条件语句来进行动态配置。
通常情况下，Nginx 的 `if` 指令用于简单条件检查，并执行一些简单的指令。

#### 在 `http` 模块中使用 `if` 指令的正确示例

```conf
http {
    set $example_variable "test_value";

    # 条件设置变量
    if ($example_variable = "test_value") {
        set $matched "yes";
    }

    server {
        listen 80;
        server_name example.com;

        location / {
            root /var/www/html;
            index index.html;

            # 根据变量条件添加头部
            if ($matched = "yes") {
                add_header X-Matched "true";
            }
        }
    }

    server {
        listen 8080;
        server_name test.com;

        location / {
            root /var/www/test;
            index index.html;

            # 根据其他条件返回 404
            if ($example_variable != "test_value") {
                return 404;
            }
        }
    }
}
```

在上述示例中，`if` 指令被用来设置变量或添加头部，实际的 `server` 和 `location` 块在 `http` 模块下直接定义，并且可以根据变量值进行条件设置。

这样配置更符合 Nginx 的工作方式和配置语法。

PS: 这样的好处是我们对于 if 的实现可以简化很多，不然太灵活也是一个灾难。

## 为什么 nginx 需要 if 指令？

Nginx 需要 `if` 指令主要是为了提供灵活性，允许在处理请求时基于条件执行特定的操作。

这种灵活性在许多实际应用场景中是非常重要的，尤其是当需要动态地调整响应或行为时。

以下是一些常见的使用场景和原因：

### 使用场景

1. **条件重定向**:
   例如，基于请求的特定条件（如主机名、URI、HTTP 方法等）进行重定向。
   ```conf
   server {
       server_name example.com;
       if ($host = example.com) {
           return 301 http://www.example.com$request_uri;
       }
   }
   ```

2. **访问控制**:
   阻止或允许某些特定的 IP 地址或用户代理访问站点。
   ```conf
   location / {
       if ($remote_addr = 192.168.1.1) {
           return 403;
       }
   }
   ```

3. **根据请求头处理**:
   基于 HTTP 请求头（如 `User-Agent`、`Referer` 等）来执行不同的操作。
   ```conf
   location / {
       if ($http_user_agent ~* "MSIE") {
           return 403;
       }
   }
   ```

4. **设置特定变量**:
   在特定条件下设置或修改变量的值，以便在后续的指令中使用。
   ```conf
   if ($request_method = POST) {
       set $do_not_cache 1;
   }
   ```

5. **动态配置响应**:
   根据请求的特定条件动态地改变响应内容或行为。
   ```conf
   location / {
       if ($http_referer ~* "bad_referer") {
           return 403;
       }
   }
   ```

### 为什么需要 `if` 指令？

1. **动态控制**:
   提供了在配置中动态控制请求处理的能力，允许根据不同的条件执行不同的指令。这在复杂的应用场景中非常有用。

2. **灵活性**:
   增加了配置文件的灵活性，可以更细粒度地控制请求处理流程，而不需要编写额外的代码。

3. **快速解决问题**:
   在调试和临时调整配置时，`if` 指令可以提供快速的解决方案。例如，临时阻止某个特定 IP 地址的访问。

### 使用 `if` 指令的注意事项

尽管 `if` 指令提供了很大的灵活性，但在使用时需要注意以下几点：

1. **性能问题**:
   在某些情况下，使用 `if` 指令可能会导致性能问题，特别是当 `if` 指令嵌套过多或条件过于复杂时。

2. **潜在的意外行为**:
   不当使用 `if` 指令可能会导致配置的意外行为，例如重写规则失效或响应错误。因此，需要小心确保条件和指令的正确性。

3. **替代方案**:
   在很多情况下，可以使用 `map` 指令、重写模块 (`rewrite`) 或 `try_files` 等替代 `if` 指令，这些方法通常更高效且更易维护。

总之，Nginx 的 `if` 指令在需要基于特定条件动态地调整请求处理流程时非常有用。

然而，为了保持配置的简洁性和高效性，应谨慎使用 `if` 指令，并考虑是否有更好的替代方案。

## nginx 的 if 有哪些优缺点

Nginx 的 `if` 指令提供了在配置文件中执行条件判断的能力，带来了灵活性，但同时也存在一些局限和潜在问题。以下是 Nginx `if` 指令的主要优缺点：

### 优点

1. **灵活性**:
   `if` 指令允许基于请求的特定条件动态地调整处理流程，这在许多实际应用场景中非常重要。它可以根据请求头、URI、请求方法等进行灵活的响应处理。

2. **简洁性**:
   在一些简单的场景下，`if` 指令可以提供一种简洁明了的解决方案。例如，重定向非 www 的请求到 www 或阻止某些特定 IP 的访问。

3. **快速解决问题**:
   `if` 指令可以快速解决一些临时性问题或需求，比如临时封锁某个 IP 地址或禁止某种类型的用户代理访问。

### 缺点

1. **性能问题**:
   在某些复杂场景下，使用 `if` 指令可能会导致性能问题。特别是在处理大量请求时，复杂的 `if` 判断逻辑可能会增加服务器的负担。

2. **潜在的意外行为**:
   `if` 指令有时会导致意外行为或配置的不可预测性。这是因为 `if` 指令的执行环境和上下文与其他指令可能有所不同，可能会导致一些配置冲突或错误。

3. **局限性**:
   `if` 指令无法改变现有上下文（如 `server` 或 `location`）中的配置，只能对请求进行处理。这限制了 `if` 指令在复杂场景中的适用性。

4. **可读性和维护性**:
   在配置文件中大量使用 `if` 指令会使配置变得复杂且难以维护。嵌套的 `if` 指令尤其容易导致配置的可读性降低。

5. **推荐替代方案**:
   Nginx 官方建议在可能的情况下，使用其他指令（如 `map` 指令、重写模块 `rewrite` 或 `try_files`）来替代 `if` 指令。这些替代方案通常更高效且易于维护。

### 替代方案

1. **map 指令**:
   `map` 指令可以用来基于条件设置变量，然后在请求处理中使用这些变量。

   ```conf
   map $host $is_www {
       default 0;
       "www.example.com" 1;
       "example.com" 2;
   }

   server {
       server_name example.com www.example.com;
       if ($is_www = 2) {
           return 301 http://www.example.com$request_uri;
       }
   }
   ```

2. **rewrite 指令**:
   `rewrite` 指令可以用来基于条件重写 URL，比 `if` 更高效。
   ```conf
   server {
       server_name example.com;
       rewrite ^/(.*)$ http://www.example.com/$1 permanent;
   }
   ```

3. **try_files 指令**:
   在处理静态文件时，`try_files` 指令通常比 `if` 更高效。
   ```conf
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```

### 结论

Nginx 的 `if` 指令提供了条件判断的灵活性，使得配置文件可以根据请求的不同条件进行动态调整。

然而，由于潜在的性能问题、意外行为和配置复杂性，建议在使用时谨慎，并在可能的情况下考虑使用替代方案来实现同样的功能。

这有助于提高配置文件的可读性、可维护性和整体性能。

## 如果让你设计 if，你会如何设计的更好？考虑兼顾灵活性，与配置的可维护性。

为了设计一个改进版的 Nginx `if` 指令，需要考虑以下几个关键点：灵活性、可维护性、性能和可读性。

下面是一些可能的设计改进方案：

### 1. 明确的作用域与上下文

**问题**: 目前的 `if` 指令在不同上下文中有不同的行为，容易导致混淆和错误。

**改进**: 定义 `if` 指令的明确作用域，使其行为一致，并且限定在某些特定的上下文中使用。

例如，可以在 `server`、`location` 块中分别定义不同的 `if` 指令，确保上下文一致性。

```conf
server {
    server_name example.com;

    if (condition) in server {
        # 指令
    }

    location / {
        if (condition) in location {
            # 指令
        }
    }
}
```

### 2. 更强大的条件语法
**问题**: 现有的条件语法较为基础，复杂逻辑处理不方便。

**改进**: 引入更强大的条件语法和逻辑操作符（如 `and`、`or`、`not`），并支持更多类型的条件判断。

```conf
server {
    server_name example.com;

    location / {
        if ($host = example.com and $uri ~* "\.php$") {
            return 301 http://www.example.com$request_uri;
        }
    }
}
```

### 3. 函数与变量支持
**问题**: 复杂的条件逻辑需要更强大的表达能力。

**改进**: 支持内置函数和自定义变量，以便在条件判断中使用。函数可以用于字符串操作、正则表达式匹配、日期处理等。

```conf
server {
    server_name example.com;

    set $is_php (string_ends_with($uri, ".php"));
    set $is_example (string_equals($host, "example.com"));

    location / {
        if ($is_php and $is_example) {
            return 301 http://www.example.com$request_uri;
        }
    }
}
```

### 4. 配置块与逻辑分离
**问题**: 当前的 `if` 指令混杂在配置指令中，可能导致配置文件的可读性和可维护性下降。

**改进**: 引入一个单独的 `condition` 块，用于定义所有条件判断和相应的处理逻辑，使配置和逻辑分离，提高可读性和可维护性。

```conf
server {
    server_name example.com;

    condition {
        if ($host = example.com) {
            action return 301 http://www.example.com$request_uri;
        }

        if ($uri ~* "\.php$") {
            action set $php_request 1;
        }
    }

    location / {
        if ($php_request) {
            # 执行特定处理
        }
    }
}
```

### 5. 可视化调试与日志支持
**问题**: 目前调试和定位 `if` 指令问题较为困难。

**改进**: 增加调试和日志功能，允许在条件判断失败或通过时记录详细的日志信息，便于问题定位和调试。

```conf
server {
    server_name example.com;

    condition {
        if ($host = example.com) {
            action {
                return 301 http://www.example.com$request_uri;
                log "Redirecting to www.example.com";
            }
        }

        if ($uri ~* "\.php$") {
            action {
                set $php_request 1;
                log "PHP request detected";
            }
        }
    }

    location / {
        if ($php_request) {
            # 执行特定处理
        }
    }
}
```

### 6. 复用与模块化
**问题**: 相似的条件判断逻辑可能会在多个地方重复出现，增加维护成本。

**改进**: 支持条件逻辑的复用和模块化定义，可以在多个地方引用同一套条件逻辑。

```conf
condition_set example_conditions {
    if ($host = example.com) {
        action set $is_example 1;
    }

    if ($uri ~* "\.php$") {
        action set $is_php 1;
    }
}

server {
    server_name example.com;

    use_condition_set example_conditions;

    location / {
        if ($is_example and $is_php) {
            return 301 http://www.example.com$request_uri;
        }
    }
}
```

通过以上改进，可以在保留 `if` 指令灵活性的同时，增强其可维护性、可读性和性能，使 Nginx 配置更加清晰和高效。

# java 的话，如何实现 nginx 的 if 指令特性（基础能力）

## 一些思考

感觉我们需要把配置文件中的基础属性全部全拿出来？不然初始化的时机要怎么定义呢？

IF 指令也应该是在根据最新的数据，条件判断得到的。

## 核心实现

```java
/**
 * 操作符
 *
 * @since 0.21.0
 * @author 老马啸西风
 */
public class NginxIfOperatorManager {

    private static final Map<String, NginxIfOperator> map = new HashMap<>();

    static {
        final NginxIfOperatorDefine operatorDefine = new NginxIfOperatorDefine();
        final NginxIfOperatorEquals operatorEquals = new NginxIfOperatorEquals();
        final NginxIfOperatorNotEquals operatorNotEquals = new NginxIfOperatorNotEquals();
        final NginxIfOperatorRegexMatch regexMatch = new NginxIfOperatorRegexMatch();
        final NginxIfOperatorRegexNotMatch regexNotMatch = new NginxIfOperatorRegexNotMatch();
        final NginxIfOperatorRegexMatchIgnoreCase regexMatchIgnoreCase = new NginxIfOperatorRegexMatchIgnoreCase();
        final NginxIfOperatorRegexMatchIgnoreCaseNot regexMatchIgnoreCaseNot = new NginxIfOperatorRegexMatchIgnoreCaseNot();

        map.put(operatorDefine.operator(), operatorDefine);
        map.put(operatorEquals.operator(), operatorEquals);
        map.put(operatorNotEquals.operator(), operatorNotEquals);
        map.put(regexMatch.operator(), regexMatch);
        map.put(regexNotMatch.operator(), regexNotMatch);
        map.put(regexMatchIgnoreCase.operator(), regexMatchIgnoreCase);
        map.put(regexMatchIgnoreCaseNot.operator(), regexMatchIgnoreCaseNot);
    }

    public boolean match(NginxCommonConfigEntry configParam, NginxRequestDispatchContext dispatchContext) {
        List<String> values = configParam.getValues();

        String key = getOperKey(configParam, dispatchContext);

        return map.get(key).eval(values.get(0), values.get(2), dispatchContext);
    }

    protected String getOperKey(NginxCommonConfigEntry configParam, NginxRequestDispatchContext dispatchContext) {
        List<String> values = configParam.getValues();

        if(values.size() == 1) {
            return "";
        }

        return values.get(1);
    }

}
```




# 小结

if 是一个非常灵活的能力，但是非常灵活的同时，可能会导致配置变得难以维护。

我们后续考虑继续学习下 map rewrite try_files 等指令。

我是老马，期待与你的下次重逢。

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

# 参考资料

# chat




* any list
{:toc}