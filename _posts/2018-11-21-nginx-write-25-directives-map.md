---
layout: post
title:  从零手写实现 nginx-25-directive map 条件判断指令
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


# 前言

大家好，我是老马。

这一节我们将配置的加载，拆分为不同的模块加载处理，便于后续拓展。

# if

## 详细介绍一下 nginx 的 map 指令

Nginx 的 `map` 指令是一个强大的工具，用于根据变量的值来设置另一个变量的值。

它可以用于很多场景，比如基于请求的某些特征来动态设置变量，从而影响后续的处理逻辑。

以下是关于 `map` 指令的详细介绍：

### 语法和基本用法

`map` 指令的基本语法如下：

```nginx
map $variable_to_test $variable_to_set {
    default value;
    key value;
    ...
}
```

- `$variable_to_test`：要测试的变量。
- `$variable_to_set`：要设置的变量。
- `default`：如果没有找到匹配的键，则使用默认值。
- `key value`：键值对，根据 `$variable_to_test` 的值来设置 `$variable_to_set`。

### 示例

假设我们想根据请求的主机名设置一个变量，进而用这个变量来决定后续的行为。

可以这样使用 `map` 指令：

```conf
http {
    map $http_host $backend_server {
        default         backend1.example.com;
        "www.example.com" backend2.example.com;
        "api.example.com" backend3.example.com;
    }

    server {
        listen 80;
        server_name example.com;

        location / {
            proxy_pass http://$backend_server;
        }
    }
}
```

在这个例子中：

- 根据 `$http_host` 的值（请求头中的主机名），将 `$backend_server` 变量设置为不同的后端服务器。
- 如果主机名是 `www.example.com`，则 `$backend_server` 设置为 `backend2.example.com`。
- 如果主机名是 `api.example.com`，则 `$backend_server` 设置为 `backend3.example.com`。
- 如果主机名不匹配任何键，则使用默认值 `backend1.example.com`。

### 复杂匹配

`map` 指令支持更复杂的匹配模式，包括正则表达式。

示例如下：

```conf
http {
    map $request_uri $file_extension {
        "~*\.jpg$"  image;
        "~*\.png$"  image;
        "~*\.css$"  stylesheet;
        "~*\.js$"   javascript;
        default     other;
    }

    server {
        listen 80;
        server_name example.com;

        location / {
            set $content_type $file_extension;
            # 在此可以根据 $content_type 变量进行不同的处理
        }
    }
}
```

在这个例子中：

- 根据请求的 URI，将 `$file_extension` 变量设置为不同的值。
- 如果 URI 以 `.jpg` 或 `.png` 结尾，则设置为 `image`。
- 如果 URI 以 `.css` 结尾，则设置为 `stylesheet`。
- 如果 URI 以 `.js` 结尾，则设置为 `javascript`。
- 如果 URI 不匹配任何模式，则使用默认值 `other`。

### 注意事项

- `map` 指令必须放在 `http` 块中，不能直接放在 `server` 或 `location` 块中。
- 在 `map` 指令中使用的变量必须在之前已经定义或已经存在。
- `map` 指令中键的匹配是按顺序进行的，匹配到第一个符合条件的键时就会停止匹配。

### 实际应用

`map` 指令可以用于很多实际应用场景，比如：

- 根据客户端 IP 设置访问限制或调整访问策略。
- 根据 User-Agent 头设置不同的响应头。
- 动态调整缓存策略。
- 根据请求路径或参数动态选择后端服务器。

通过 `map` 指令，Nginx 的配置变得更加灵活和强大，可以根据实际需要进行复杂的条件判断和变量设置。


## 为什么 nginx 中需要 map 指令

在 Nginx 配置中，`map` 指令用于根据某个变量的值来动态设置另一个变量的值。这在许多情况下都非常有用，尤其是在需要根据请求的不同条件（如 URL、IP 地址、请求头等）来执行不同的配置或行为时。以下是一些具体的使用场景和`map`指令的详细解释：

### 使用场景

1. **动态配置**
   - 通过`map`指令，可以根据请求的特定条件（例如，客户端 IP 地址、请求路径、请求头等）来设置不同的 Nginx 配置项。
   - 例如，可以根据访问路径设置不同的后端服务器、不同的缓存策略或不同的访问控制策略。

2. **简化配置**
   - `map`指令可以简化复杂的条件判断逻辑，避免在配置文件中编写大量的`if`指令。
   - 通过集中管理映射规则，可以使配置文件更清晰、更易于维护。

3. **负载均衡**
   - 可以根据请求的属性（如 User-Agent 或 Cookie）将请求分配到不同的后端服务器，实现更灵活的负载均衡策略。

### `map` 指令的语法和用法

`map`指令的基本语法如下：

```conf
map $variable_to_map $result_variable {
    default value;  # 设置默认值
    condition1 value1;  # 条件1 对应的值
    condition2 value2;  # 条件2 对应的值
    ...
}
```

- `$variable_to_map`：要根据其值进行映射的变量。
- `$result_variable`：映射结果存储到的变量。
- `default value`：如果没有匹配的条件，使用的默认值。
- `condition value`：条件和值的对，满足条件时将值赋给`$result_variable`。

### 示例

假设我们需要根据不同的主机名来设置不同的后端服务器：

```conf
http {
    map $host $backend {
        default web1.example.com;
        host1.example.com web2.example.com;
        host2.example.com web3.example.com;
    }

    server {
        listen 80;
        
        location / {
            proxy_pass http://$backend;
        }
    }
}
```

在这个示例中：

- 根据请求的主机名（`$host`），将 `$backend` 变量设置为不同的后端服务器。
- 默认情况下，`$backend` 会被设置为 `web1.example.com`。
- 如果请求的主机名是 `host1.example.com`，`$backend` 会被设置为 `web2.example.com`。
- 如果请求的主机名是 `host2.example.com`，`$backend` 会被设置为 `web3.example.com`。

### 结论

`map`指令在 Nginx 中是一个强大的工具，可以根据请求的条件动态设置变量，从而实现更灵活和可维护的配置。

通过合理使用`map`指令，可以简化配置文件，增强 Nginx 的功能，使其能够更好地适应各种复杂的应用场景。

# java 实现

## 配置的解析

我们以一个比较全的配置为例

```conf
http {
    # 定义一个 map 指令，根据请求的主机名设置后端服务器
    map $host $backend {
        default web1.example.com;
        host1.example.com web2.example.com;
        host2.example.com web3.example.com;
    }

    # 定义另一个 map 指令，根据用户代理设置变量
    map $http_user_agent $mobile {
        default 0;
        "~*iphone|android" 1;
    }

    # others
}
```

## 配置加载

直接放在 http 的全局配置中，解析如下：

```java
/**
 * @since 0.22.0
 * @author 老马啸西风
 */
public class NginxUserMapConfigLoadFile implements INginxUserMapConfigLoad {

    //conf

    @Override
    public NginxUserMapConfig load() {
        Map<String, String> mapping = new HashMap<>();

        NginxUserMapConfig config = new NginxUserMapConfig();

        List<String> values = mapBlock.getValues();
        if(values.size() != 2) {
            throw new Nginx4jException("map 指令的 values 必须为 2，形如 map $key1 $key2");
        }
        config.setPlaceholderMatchKey(values.get(0));
        config.setPlaceholderTargetKey(values.get(1));

        Collection<NgxEntry> entryList = mapBlock.getEntries();
        if(CollectionUtil.isEmpty(entryList)) {
            throw new Nginx4jException("map 指令的映射关系不可为空，可以配置 default xxx");
        }

        for(NgxEntry entry : entryList) {
            if(entry instanceof NgxParam) {
                NgxParam ngxParam = (NgxParam) entry;
                String name = ngxParam.getName();
                String value = ngxParam.getValue();

                // 对比
                if("default".equals(name)) {
                    config.setDefaultVal(value);
                } else {
                    mapping.put(name, value);
                }
            }
        }

        config.setMapping(mapping);
        return config;
    }

}
```

## map 指令的实现

目前实现简单的，在 dispatch 前触发 map 指令。

```java
/**
 * @since 0.22.0
 * @author 老马啸西风
 */
public class NginxMapDirectiveDefault implements NginxMapDirective {

    private static final Log logger = LogFactory.getLog(NginxMapDirectiveDefault.class);

    @Override
    public void map(NginxRequestDispatchContext context) {
        Map<String, Object> placeholderMap = context.getPlaceholderMap();
        List<NginxUserMapConfig> mapConfigList = context.getNginxConfig().getNginxUserConfig().getMapConfigs();
        if(CollectionUtil.isEmpty(mapConfigList)) {
            // 忽略
            logger.info("mapConfigList 为空，忽略处理 map 指令");
            return;
        }

        for(NginxUserMapConfig mapConfig : mapConfigList) {
            processMap(mapConfig, placeholderMap);
        }
    }

    protected void processMap(NginxUserMapConfig mapConfig,
                              Map<String, Object> placeholderMap) {
        //1. key
        String matchKey = mapConfig.getPlaceholderMatchKey();
        String matchValue = (String) placeholderMap.get(matchKey);

        String targetKey = mapConfig.getPlaceholderTargetKey();

        // 遍历
        for(Map.Entry<String, String> mapEntry : mapConfig.getMapping().entrySet()) {
            if(matchValue == null) {
                logger.info("matchValue is null, ignore match");
                break;
            }

            String key = mapEntry.getKey();
            String value = mapEntry.getValue();
            if(key.equals(matchValue)) {
                // fast-return
                placeholderMap.put(targetKey, value);
                logger.info("命中相等 {}={}, {}={}", matchKey, matchValue, targetKey, value);
                return;
            } else if(matchValue.matches(key)) {
                placeholderMap.put(targetKey, value);
                logger.info("命中正则 {}={}, {}={}", matchKey, matchValue, targetKey, value);
                return;
            }
        }

        // 默认值
        placeholderMap.put(targetKey, mapConfig.getDefaultVal());
        logger.info("命中默认值 {}={}", targetKey, mapConfig.getDefaultVal());
    }

}
```

## 测试验证

直接本地启用访问 [http://192.168.1.13:8080/](http://192.168.1.13:8080/)

日志：

```
信息: 命中默认值 $backend=web1.example.com
信息: 命中默认值 $mobile=0
```

# 小结

map 指令是 Nginx 中一个强大的工具，用于根据请求属性动态设置变量。

通过合理使用 map 指令，可以简化配置，提高性能和灵活性。

使用 Java 库 nginxparser 可以动态解析和处理 Nginx 配置文件，进一步增强配置管理的自动化和灵活性。

我们后续考虑继续学习下 rewrite try_files 等指令。

我是老马，期待与你的下次重逢。

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

# 参考资料

# chat

## nginx 的 map 指令有哪些优缺点

Nginx 的 `map` 指令在配置中扮演着重要的角色，它能够根据输入变量的值来动态地设置输出变量的值。

它具有许多优点，同时也有一些缺点。

以下是对 Nginx `map` 指令的优缺点的详细分析：

### 优点

1. **简化配置**
   - `map` 指令可以替代复杂的 `if` 指令和条件判断，使配置文件更加简洁和可读。例如，可以避免在不同的位置重复写相同的判断逻辑。

2. **提高性能**
   - 相较于在请求处理中多次使用 `if` 判断，`map` 指令通过一次查找来设置变量，从而可以减少请求处理的开销，提升性能。

3. **增强灵活性**
   - 可以根据请求的各种属性（如请求路径、主机名、客户端 IP、请求头等）来动态设置变量，从而实现更灵活的请求处理策略。

4. **集中管理**
   - 所有映射规则都集中在一处进行管理，方便统一修改和维护，减少错误的可能性。

5. **默认值支持**
   - `map` 指令支持设置默认值，在没有匹配的情况下可以自动使用默认值，避免未匹配情况的处理问题。

### 缺点

1. **配置复杂度**
   - 对于新手来说，理解和使用 `map` 指令可能需要一定的学习成本，特别是在面对复杂的映射规则时。

2. **不支持正则表达式**
   - `map` 指令的条件匹配不支持正则表达式，只能进行精确匹配。这在某些需要更复杂匹配规则的场景下可能显得不足。

3. **可能导致配置冗长**
   - 当需要处理的映射规则非常多时，`map` 指令可能会导致配置文件变得冗长，增加维护难度。

4. **动态性有限**
   - `map` 指令的映射关系是在配置文件加载时确定的，不能在运行时动态修改。如果需要动态更新映射关系，需要重新加载 Nginx 配置。

### 结论

Nginx 的 `map` 指令是一个非常有用的工具，通过它可以实现灵活和高效的配置管理。

它的优点在于简化配置、提高性能、增强灵活性以及集中管理，而其缺点主要在于配置复杂度较高、不支持正则表达式、可能导致配置文件冗长以及动态性有限。

在使用时，应根据具体的需求和场景，权衡这些优缺点，以充分发挥 `map` 指令的优势。

## nginx 中 map 指令可以放在哪些模块？给出例子

在 Nginx 配置中，`map` 指令只能放在 `http` 模块内。它不能放在 `server` 或 `location` 块内，而是必须定义在 `http` 块的顶层。这是因为 `map` 指令的作用域是全局的，它在 `http` 模块中定义后，可以在该模块的任何地方使用。

### 示例

以下是一个完整的 Nginx 配置示例，展示了如何在 `http` 模块中使用 `map` 指令，并在 `server` 和 `location` 块中引用它。

```conf
http {
    # 定义一个 map 指令，根据请求的主机名设置后端服务器
    map $host $backend {
        default web1.example.com;
        host1.example.com web2.example.com;
        host2.example.com web3.example.com;
    }

    # 第一个 server 块
    server {
        listen 80;
        
        location / {
            # 使用 proxy_pass 指令，将请求转发到动态设置的后端服务器
            proxy_pass http://$backend;
        }
    }

    # 定义另一个 map 指令，根据用户代理设置变量
    map $http_user_agent $mobile {
        default 0;
        "~*iphone|android" 1;
    }

    # 第二个 server 块
    server {
        listen 8080;
        
        location / {
            if ($mobile) {
                # 如果是移动设备，则跳转到移动版网站
                return 301 http://m.example.com$request_uri;
            }
            
            # 否则处理普通请求
            root /var/www/html;
            index index.html index.htm;
        }
    }
}
```

### 解释

1. **定义 Map 指令**
   - 在 `http` 块内，定义了两个 `map` 指令：
     - 第一个 `map` 指令根据请求的主机名 `$host` 设置后端服务器的地址 `$backend`。
     - 第二个 `map` 指令根据用户代理字符串 `$http_user_agent` 设置是否为移动设备的标志 `$mobile`。

2. **使用 Map 指令**
   - 在第一个 `server` 块中，通过 `proxy_pass` 指令使用 `$backend` 变量，将请求转发到不同的后端服务器。
   - 在第二个 `server` 块中，通过检查 `$mobile` 变量，如果请求来自移动设备，则将请求重定向到移动版网站；否则，处理普通请求。

### 注意事项

- `map` 指令必须定义在 `http` 块内，不能放在 `server` 或 `location` 块内。
- 定义在 `http` 块内的 `map` 指令可以在整个 `http` 块的所有子块中使用。
- `map` 指令中的匹配条件支持精确匹配和简单的正则表达式（如 `~*` 表示不区分大小写的匹配）。

## 可以一个配置文件中定义多个 map 指令吗？

是的，在一个 Nginx 配置文件中，可以定义多个 `map` 指令。每个 `map` 指令可以用于不同的目的，并且它们之间相互独立。

下面是一个包含多个 `map` 指令的 Nginx 配置文件示例。

### 示例

```conf
http {
    # 定义第一个 map 指令，根据请求的主机名设置后端服务器
    map $host $backend {
        default web1.example.com;
        host1.example.com web2.example.com;
        host2.example.com web3.example.com;
    }

    # 定义第二个 map 指令，根据用户代理设置是否为移动设备
    map $http_user_agent $is_mobile {
        default 0;
        "~*iphone|android" 1;
    }

    # 定义第三个 map 指令，根据客户端 IP 设置访问控制变量
    map $remote_addr $access_control {
        default allow;
        192.168.1.1 deny;
        192.168.1.2 deny;
    }

    server {
        listen 80;
        
        location / {
            # 检查访问控制变量
            if ($access_control = deny) {
                return 403;
            }

            # 如果是移动设备，则跳转到移动版网站
            if ($is_mobile) {
                return 301 http://m.example.com$request_uri;
            }

            # 使用 proxy_pass 指令，将请求转发到动态设置的后端服务器
            proxy_pass http://$backend;
        }
    }
}
```

### 解释

1. **定义多个 Map 指令**
   - 第一个 `map` 指令：根据请求的主机名 `$host` 设置后端服务器的地址 `$backend`。
   - 第二个 `map` 指令：根据用户代理字符串 `$http_user_agent` 设置是否为移动设备的标志 `$is_mobile`。
   - 第三个 `map` 指令：根据客户端 IP 地址 `$remote_addr` 设置访问控制变量 `$access_control`。

2. **使用 Map 指令**
   - 在 `location` 块内，首先检查 `$access_control` 变量，如果值为 `deny`，则返回 403 Forbidden 状态码，禁止访问。
   - 然后检查 `$is_mobile` 变量，如果请求来自移动设备，则将请求重定向到移动版网站。
   - 最后，通过 `proxy_pass` 指令使用 `$backend` 变量，将请求转发到不同的后端服务器。

### 注意事项

- 每个 `map` 指令都在 `http` 块内定义，并且它们之间相互独立，可以在配置文件中的任何地方引用。
- 多个 `map` 指令可以为不同的目的服务，提供更细粒度的控制和灵活性。
- 确保每个 `map` 指令的变量名称是唯一的，以避免冲突。

通过定义和使用多个 `map` 指令，可以实现复杂和灵活的 Nginx 配置策略，以适应不同的请求处理需求。






* any list
{:toc}