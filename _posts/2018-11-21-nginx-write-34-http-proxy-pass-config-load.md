---
layout: post
title:  从零手写实现 nginx-34-proxy_pass 配置加载处理
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

# 配置加载

## 配置文件的例子

- nginx-proxy-pass.conf

```conf
# HTTP模块配置
http {
    upstream backend {
        server 127.0.0.1:3000 weight=5;
    }

    # 定义服务器块
    server {
        listen 8080;
        server_name 127.0.0.1:8080;  # 服务器域名

        # 静态文件的根目录
        root D:\data\nginx4j;  # 静态文件存放的根目录
        index index.html index.htm;  # 默认首页

        # = 精准匹配
        location / {
        }

        # = 精准匹配
        location /p {
            proxy_pass http://backend;
        }
    }

}
```

## 配置文件加载

下面的实现主要用来解析 upstream 模块处理。

```java
/**
 * @since 0.27.0
 * @author 老马啸西风
 */
public class NginxUserUpstreamConfigLoadFile implements INginxUserUpstreamConfigLoad {

    private final NgxConfig conf;

    private final NgxBlock ngxBlock;

    public NginxUserUpstreamConfigLoadFile(NgxConfig conf, NgxBlock ngxBlock) {
        this.conf = conf;
        this.ngxBlock = ngxBlock;
    }

    @Override
    public NginxUserUpstreamConfig load() {
        NginxUserUpstreamConfig config = new NginxUserUpstreamConfig();
        config.setName(ngxBlock.getName());
        config.setValue(ngxBlock.getValue());
        config.setValues(ngxBlock.getValues());

        // 配置
        String upstreamName = ngxBlock.getValue();
        if(StringUtil.isEmpty(upstreamName)) {
            throw new Nginx4jException("upstream 名称不可为空");
        }

        config.setUpstream(upstreamName);
        Collection<NgxEntry> entryList = ngxBlock.getEntries();
        List<NginxUserUpstreamConfigItem> configItemList = new ArrayList<>();
        if(CollectionUtil.isNotEmpty(entryList)) {
            for(NgxEntry ngxEntry : entryList) {
                if(ngxEntry instanceof NgxParam) {
                    NgxParam ngxParam = (NgxParam) ngxEntry;

                    NginxUserUpstreamConfigItem configItem = new NginxUserUpstreamConfigItem();
                    configItem.setName(ngxParam.getName());
                    configItem.setValue(ngxParam.getValue());
                    configItem.setValues(ngxParam.getValues());

                    configItemList.add(configItem);
                }
            }
        }

        config.setConfigItemList(configItemList);
        return config;
    }

}
```

# 配置的预处理

我们在处理配置的时候，需要处理一下上面的配置

## 整体逻辑

直接处理上述的 NginxUserServerLocationConfig 加载处理，针对 proxy_pass 指令解析处理。

```java
/**
 * 默认负载均衡配置
 * 
 * @since 0.27.0
 * @author 老马啸西风
 */
public class NginxLoadBalanceDefaultConfig implements INginxLoadBalanceConfig {

    private static final Log log = LogFactory.getLog(NginxLoadBalanceDefaultConfig.class);

    @Override
    public NginxLoadBalanceConfig buildBalanceConfig(NginxRequestDispatchContext dispatchContext) {
        NginxLoadBalanceConfig config = new NginxLoadBalanceConfig();
        config.setNeedProxyPass(false);

        NginxUserServerLocationConfig nginxUserServerLocationConfig = dispatchContext.getCurrentUserServerLocationConfig();
        List<NginxCommonConfigEntry> configEntryList = nginxUserServerLocationConfig.getConfigEntryList();
        if(CollectionUtil.isEmpty(configEntryList)) {
            return config;
        }

        //1. serverList proxy_pass http://my_backend;
        for(NginxCommonConfigEntry entry : configEntryList) {
            if("proxy_pass".equals(entry.getName())) {
                config.setNeedProxyPass(true);

                final String url = entry.getValue();
                config.setProxyPassUrl(url);
                String upstreamName = getUpstreamName(url, dispatchContext);
                config.setUpstreamName(upstreamName);
                // 获取对应的配置信息
                final NginxUserUpstreamConfig upstreamConfig = getUpstreamConfig(upstreamName, url, dispatchContext);

                List<IServer> serverList = buildServerList(upstreamConfig, url, dispatchContext);
                config.setUpstreamServerList(serverList);

                // 设置对应的哈希策略 一般第一行为策略？
                NginxCommonConfigEntry upstreamStrategy = getUpstreamStrategyConfig(upstreamConfig);
                if(upstreamStrategy != null) {
                    config.setUpstreamProxyStrategy(upstreamStrategy.getName());
                    config.setUpstreamProxyStrategyValue(upstreamStrategy.getValue());
                }

                break;
            }
        }

        return config;
    }
}
```

## getUpstreamName 获取 upstreamName

假如配置信息为 `proxy_pass http://backend;`

那么我们需要解析到 `backend` 作为 upstreamName。

```java
/**
 * 获取对应的 upstream 名称
 * @param target 目标url
 * @param dispatchContext 上下文
 * @return 结果
 */
private String getUpstreamName(String target, NginxRequestDispatchContext dispatchContext) {
    String urlSuffix = getUrlSuffix(target);
    if(StringUtil.isEmpty(urlSuffix)) {
        return urlSuffix;
    }

    // 结果
    return urlSuffix.split(":")[0];
}
```

## getUpstreamConfig 获取配置信息

如果我们得到了 upstreamName，那么如何找到对应的 upstream 配置呢？

根据 upstream 名称，找到对应的配置信息。

```java
private NginxUserUpstreamConfig getUpstreamConfig(String upstreamName, String url, NginxRequestDispatchContext dispatchContext) {
    if(StringUtil.isEmpty(upstreamName)) {
        return null;
    }
    NginxUserConfig nginxUserConfig =  dispatchContext.getNginxConfig().getNginxUserConfig();
    List<NginxUserUpstreamConfig> upstreamConfigs = nginxUserConfig.getUpstreamConfigs();
    if(CollectionUtil.isEmpty(upstreamConfigs)) {
        log.info("upstreamConfigs is empty, match config is null");
        return null;
    }

    // 遍历
    for(NginxUserUpstreamConfig upstreamConfig : upstreamConfigs) {
        if(upstreamName.equals(upstreamConfig.getUpstream())) {
            return upstreamConfig;
        }
    }
    log.info("upstreamConfigs match config not found!");
    return null;
}
```

## buildServerList 如何构建对应的目标服务器列表？

这里稍微繁琐一点。

### 默认配置

我们首先可以指定默认的端口：

在 HTTP 和 HTTPS 通信中，默认端口号如下：

- **HTTP**: 默认端口是 **80**。
- **HTTPS**: 默认端口是 **443**。

### 核心实现

核心实现如下：

1) 没找到对应的 upstream

直接根据指定的配置，构建服务器列表。

比如 `proxy_pass http://localhost:8080;`

2) 找到对应的 upstream 配置

根据对应的服务器列表，构建对应的列表即可。

这里需要注意一下细节，处理一下 host+port+weight

```java
    private List<IServer> buildServerList(final NginxUserUpstreamConfig upstreamConfig,
                                          String url,
                                          NginxRequestDispatchContext dispatchContext) {
        List<IServer> list = new ArrayList<>();

        // 协议
        Integer defaultPort = NginxHttpEnum.getDefaultPortByUrl(url);
        String urlSuffix = getUrlSuffix(url);

        if(upstreamConfig == null) {
            // proxy_pass http://backend.example.com:8080;
            String[] urlSuffixSplits = urlSuffix.split(":");
            if(urlSuffixSplits.length > 1) {
                defaultPort = Integer.parseInt(urlSuffixSplits[1]);
            }
            IServer server = Server.newInstance().host(urlSuffixSplits[0]).port(defaultPort).weight(1);
            list.add(server);
        } else {
            //....

            //server backend1.example.com:8080 weight=3;
            for(NginxUserUpstreamConfigItem configItem : configItemList) {
                String name = configItem.getName();
                if(!"server".equals(name)) {
                    continue;
                }

                List<String> values = configItem.getValues();
                String serverValue = values.get(0);
                String[] serverValueSplits = serverValue.split(":");
                int port = defaultPort;
                if(serverValueSplits.length > 1) {
                    port = Integer.parseInt(serverValueSplits[1]);
                }

                int weight = 1;
                if(values.size() > 1) {
                    String weightValue = values.get(1);
                    weight = Integer.parseInt(weightValue.split("=")[1]);
                }

                IServer server = Server.newInstance()
                        .host(serverValueSplits[0])
                        .port(port)
                        .weight(weight);

                list.add(server);
            }
        }

        return list;
    }
```

# 小结

到这里开始，我们介绍了如何解析配置文件。

并且介绍了针对 proxy_pass 的指令，如何做好对应的配置解析处理。

下一节，我们一起看一下如何实现 proxy_pass 的反向代理。

# 参考资料

* any list
{:toc}