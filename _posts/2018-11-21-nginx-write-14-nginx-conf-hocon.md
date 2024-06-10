---
layout: post
title:  从零手写实现 nginx-14-nginx.conf 是 HOCON 的格式吗？
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

## 配置相关

配置文件部分，可以阅读下面的文章：

[config 配置方式概览-8 种配置文件介绍对比 xml/json/proeprties/ini/yaml/TOML/hcl/hocon](https://houbb.github.io/2017/06/21/config-00-overivew)

[config HCL（HashiCorp Configuration Language） 配置文件介绍](https://houbb.github.io/2017/06/21/config-hcl-01-intro)

[config HCL（HashiCorp Configuration Language） 官方文档翻译](https://houbb.github.io/2017/06/21/config-hcl-02-doc)

[config HOCON（Human-Optimized Config Object Notation）配置文件介绍](https://houbb.github.io/2017/06/21/config-hocon-01-intro)

[toml-01-toml 配置文件介绍](https://houbb.github.io/2017/06/21/config-toml-01-overview)

[YAML-01-yml 配置文件介绍](https://houbb.github.io/2017/06/21/config-yaml-01-intro)

[YAML-02-yml 配置文件 java 整合使用 yamlbeans + snakeyaml + jackson-dataformat-yaml](https://houbb.github.io/2017/06/21/config-yaml-02-java-integration)

[YAML-03-yml 配置文件介绍官方文档翻译](https://houbb.github.io/2017/06/21/config-yaml-03-doc)

[config ini 配置文件介绍](https://houbb.github.io/2017/06/21/config-ini-01-intro)

[config properties 配置文件介绍](https://houbb.github.io/2017/06/21/config-properties-01-intro)

[java 实现 xml 与对象 pojo 之间的转换的几种方式 dom4j/xstream/jackson](https://houbb.github.io/2017/06/21/config-xml-to-pojo)

[XStream java 实现 xml 与对象 pojo 之间的转换](https://houbb.github.io/2017/06/21/config-xml-XStream-intro)

[json 专题系列](https://houbb.github.io/2018/07/20/json-00-overview)

# 目标

本小节，我们主要看下面几个问题：

1) nginx.conf 是 hocon 格式吗？

2）nginx.conf 格式和 hocon 之间可以转换吗？

3）我们自己设计格式，应该选择哪一种?

# Q1: nginx.conf 是 hocon 格式的吗？

Nginx 的配置文件不是 HOCON 格式的。Nginx 使用自己的配置格式，通常称为 Nginx 配置语法（Nginx configuration syntax）。

这种格式相对简单且专门为 Nginx 设计。

它使用块（block）和指令（directive）的组合来定义服务器的行为和特性。

以下是一个简单的 Nginx 配置文件示例：

```nginx
worker_processes  1;

events {
    worker_connections  1024;
}

http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       80;
        server_name  localhost;

        location / {
            root   html;
            index  index.html index.htm;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }
    }
}
```

在这个示例中，`worker_processes`、`events`、`http` 和 `server` 等都是块指令，而 `listen`、`server_name`、`location` 等是普通指令。

相比之下，HOCON（Human-Optimized Config Object Notation）是一种用于配置文件的格式，主要用于配置基于 JVM 的应用程序，如 Akka、Play Framework 等。

HOCON 具有更复杂和灵活的语法，支持嵌套结构、对象、数组等。

下面是一个 HOCON 配置示例：

```hocon
application {
  name = "MyApp"
  version = "1.0.0"
  http {
    host = "localhost"
    port = 8080
  }
  database {
    url = "jdbc:mysql://localhost:3306/mydb"
    user = "dbuser"
    password = "dbpassword"
  }
}
```

可以看到，HOCON 的语法和 Nginx 的配置语法有很大的不同。

因此，Nginx 的配置文件并不是 HOCON 格式的，它有自己专门的配置格式。

# Q2: 可以把你给的 nginx 配置例子，改成 hocon 格式的吗

将 Nginx 配置文件转换为 HOCON 格式涉及到将 Nginx 的指令和块转换为 HOCON 支持的键值对和嵌套结构。

以下是如何将上面示例的 Nginx 配置文件转换为类似 HOCON 的格式，但请注意，这只是一个结构上的转换，实际上 Nginx 并不支持 HOCON 格式的配置文件。

```hocon
nginx {
  worker_processes = 1

  events {
    worker_connections = 1024
  }

  http {
    include = "mime.types"
    default_type = "application/octet-stream"
    sendfile = "on"
    keepalive_timeout = 65

    server {
      listen = 80
      server_name = "localhost"

      location_root {
        root = "html"
        index = ["index.html", "index.htm"]
      }

      error_page {
        code = [500, 502, 503, 504]
        page = "/50x.html"
        location {
          root = "html"
        }
      }
    }
  }
}
```

在这个示例中：

1. 使用嵌套结构来表示 Nginx 配置中的块，例如 `events` 和 `http`。
2. 将指令转换为键值对，例如 `worker_processes = 1`。
3. 将数组值表示为 HOCON 数组，例如 `index = ["index.html", "index.htm"]`。
4. 为了示例的完整性，`error_page` 里面的 `code` 和 `page` 分开写，表示多个错误代码使用相同的错误页面。

请记住，这只是一个理论上的转换，实际使用中，Nginx 不支持 HOCON 格式的配置文件，因此这个 HOCON 配置文件不能直接用于配置 Nginx 服务器。

这个示例仅用于展示如何将配置内容结构化为 HOCON 格式。

# Q3: 我们自己设计文件格式，应该使用什么格式

老马这里，首先对配置文件做了统一的 java 抽象：

```java
/**
 * 用户配置
 *
 * @since 0.12.0
 * @author 老马啸西风
 */
public class NginxUserConfig {

    // 全局配置
    private String httpPid;


    /**
     * 全部的 server 配置列表
     *
     * @since 0.12.0
     */
    private List<NginxUserServerConfig> serverConfigList;

    /**
     * 服务器端口
     */
    private Set<Integer> serverPortSet;

    /**
     * 当前的服务端口
     */
    private Integer currentServerPort;

    /**
     * 当前的 server 配置 map
     */
    private Map<String, List<NginxUserServerConfig>> currentServerConfigMap;

    /**
     * 默认的服务配置
     * @since 0.14.0
     */
    private NginxUserServerConfig defaultUserServerConfig;

    // 示意图...

}
```

定义配置解析的接口：

```java
public interface INginxUserConfigLoader {

    /**
     * 加载
     * @return 结果
     *
     * */
    NginxUserConfig load();

}
```

然后默认实现了 nginx.conf 标准格式的解析处理类：

```java
public  class NginxUserConfigLoaderConfigFile extends AbstractNginxUserConfigLoader {

    private final String filePath;

    public NginxUserConfigLoaderConfigFile(String filePath) {
        this.filePath = filePath;
    }

    // 其他省略实现...

    @Override
    protected NginxUserConfig doLoad() {
        NgxConfig conf = null;
        try {
            NginxUserConfigBs configBs = NginxUserConfigBs.newInstance();
            conf = NgxConfig.read(filePath);

            //1. basic
            fillBasicInfo(configBs, conf);

            //2. server 信息
            fillServerInfo(configBs, conf);

            // 返回
            return configBs.build();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

}
```

# 小结

这篇文章我们一起讨论了如何为 nginx 设计一套配置实现。

开始老马以为 nginx.conf 比较接近  hocon 的文件格式，后来发现并不是。

所以还是决定抽象为标准的 pojo，这样一者便于使用，再者后续用户可以根据自己的需要拓展为 yaml 等其他格式的配置。

我是老马，期待与你的下次重逢。

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)


# 参考资料

* any list
{:toc}