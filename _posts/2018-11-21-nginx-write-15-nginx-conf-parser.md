---
layout: post
title:  从零手写实现 nginx-15-nginx.conf 解析处理转换为 POJO
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

# 目标

上一节我们定义了配置的标准 POJO

这一节课我们来把 nginx.conf 文件解析为标准的 pojo

# 实现思路

通过三方库直接解析处理配置文件。

## 核心代码

```java
package com.github.houbb.nginx4j.config.load;

import com.github.houbb.heaven.util.lang.StringUtil;
import com.github.houbb.heaven.util.util.CollectionUtil;
import com.github.houbb.nginx4j.bs.NginxUserConfigBs;
import com.github.houbb.nginx4j.bs.NginxUserServerConfigBs;
import com.github.houbb.nginx4j.config.NginxUserConfig;
import com.github.houbb.nginx4j.config.NginxUserServerConfig;
import com.github.houbb.nginx4j.constant.NginxUserConfigDefaultConst;
import com.github.houbb.nginx4j.constant.NginxUserServerConfigDefaultConst;
import com.github.odiszapc.nginxparser.NgxBlock;
import com.github.odiszapc.nginxparser.NgxConfig;
import com.github.odiszapc.nginxparser.NgxEntry;
import com.github.odiszapc.nginxparser.NgxParam;

import java.io.IOException;
import java.util.List;

/**
 * @since 0.13.0
 */
public  class NginxUserConfigLoaderConfigFile extends AbstractNginxUserConfigLoader {

    private final String filePath;

    public NginxUserConfigLoaderConfigFile(String filePath) {
        this.filePath = filePath;
    }


    protected void fillBasicInfo(final NginxUserConfigBs configBs,
                                 final NgxConfig conf) {
        // 基本信息
        configBs.httpPid(getHttpPid(conf));
    }

    private String getHttpPid(final NgxConfig conf) {
        // 基本信息
        NgxParam pidParam = conf.findParam("pid");
        if(pidParam != null) {
            return pidParam.getValue();
        }


        return NginxUserConfigDefaultConst.HTTP_PID;
    }

    /**
     * <pre>
     *         listen 80;  # 监听80端口
     *         server_name example.com;  # 服务器域名
     *
     *         # 单独为这个 server 启用 sendfile
     *         sendfile on;
     *
     *         # 静态文件的根目录
     *         root /usr/share/nginx/html;  # 静态文件存放的根目录
     *         index index.html index.htm;  # 默认首页
     *
     *         # 如果需要为这个 server 单独配置 gzip，可以覆盖全局配置
     *         gzip on;
     *         gzip_disable "msie6";
     *         gzip_vary on;
     *         gzip_proxied any;
     *         gzip_comp_level 6;
     *         gzip_buffers 16 8k;
     *         gzip_http_version 1.1;
     *         gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
     *
     * </pre>
     * @param configBs 配置
     * @param conf 文件信息
     */
    protected void fillServerInfo(final NginxUserConfigBs configBs,
                                 final NgxConfig conf) {
        // 首先获取 block
        List<NgxEntry> servers = conf.findAll(NgxConfig.BLOCK, "http", "server"); // 示例3
        if(CollectionUtil.isNotEmpty(servers)) {
            for (NgxEntry entry : servers) {
                NginxUserServerConfigBs serverConfigBs = NginxUserServerConfigBs.newInstance();
                NgxBlock serverBlock = (NgxBlock) entry;
                String name = serverBlock.getName();

                int httpServerPort = getHttpServerListen(conf, serverBlock);
                String httpServerName = getHttpServerName(conf, serverBlock);
                String httpServerRoot = getHttpServerRoot(conf, serverBlock);
                List<String> httpIndexList = getHttpServerIndexList(conf, serverBlock);

                // sendfile on;
                String sendFile = getHttpServerSendFile(conf, serverBlock);

                //gzip
                String gzip = getHttpServerGzip(conf, serverBlock);
                long gzipMinLen = getHttpServerGzipMinLen(conf, serverBlock);
                List<String> gzipTypes = getHttpServerGzipTypes(conf, serverBlock);

                serverConfigBs.httpServerName(httpServerName)
                        .httpServerListen(httpServerPort)
                        .httpServerRoot(httpServerRoot)
                        .httpServerIndexList(httpIndexList)
                        .sendFile(sendFile)
                        .gzip(gzip)
                        .gzipMinLength(gzipMinLen)
                        .gzipTypes(gzipTypes);

                NginxUserServerConfig serverConfig = serverConfigBs.build();
                configBs.addServerConfig(httpServerPort, httpServerName, serverConfig);
            }
        }
    }

    private List<String> getHttpServerGzipTypes(final NgxConfig conf, final NgxBlock serverBlock) {
        // value
        NgxParam param = serverBlock.findParam("gzip_types");
        if(param != null) {
            return StringUtil.splitToList(param.getValue(), " ");
        }

        return NginxUserServerConfigDefaultConst.gzipTypes;
    }

    private long getHttpServerGzipMinLen(final NgxConfig conf, final NgxBlock serverBlock) {
        // value
        NgxParam param = serverBlock.findParam("gzip_min_len");
        if(param != null) {
            return Long.valueOf(param.getValue());
        }

        return NginxUserServerConfigDefaultConst.gzipMinLength;
    }

    private String getHttpServerGzip(final NgxConfig conf, final NgxBlock serverBlock) {
        // value
        NgxParam param = serverBlock.findParam("gzip");
        if(param != null) {
            return param.getValue();
        }

        return NginxUserServerConfigDefaultConst.gzip;
    }

    private List<String> getHttpServerIndexList(final NgxConfig conf, final NgxBlock serverBlock) {
        // value
        NgxParam param = serverBlock.findParam("index");
        if(param != null) {
            return StringUtil.splitToList(param.getValue(), " ");
        }

        return NginxUserServerConfigDefaultConst.httpServerIndexList;
    }

    private String getHttpServerSendFile(final NgxConfig conf, final NgxBlock serverBlock) {
        // value
        NgxParam param = serverBlock.findParam("sendfile");
        if(param != null) {
            return param.getValue();
        }

        return NginxUserServerConfigDefaultConst.sendFile;
    }

    private String getHttpServerRoot(final NgxConfig conf, final NgxBlock serverBlock) {
        // value
        NgxParam param = serverBlock.findParam("root");
        if(param != null) {
            return param.getValue();
        }

        return NginxUserServerConfigDefaultConst.httpServerRoot;
    }

    private int getHttpServerListen(final NgxConfig conf, final NgxBlock serverBlock) {
        // value
        NgxParam listenParam = serverBlock.findParam("listen");
        if(listenParam != null) {
            String value = listenParam.getValue();
            List<String> valueList = StringUtil.splitToList(value, " ");
            return Integer.parseInt(valueList.get(0));
        }

        return NginxUserServerConfigDefaultConst.httpServerListen;
    }

    private String getHttpServerName(final NgxConfig conf, final NgxBlock serverBlock) {
        // value
        NgxParam param = serverBlock.findParam("server_name");
        if(param != null) {
            return param.getValue();
        }

        return NginxUserServerConfigDefaultConst.httpServerName;
    }

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


## 启动类

```java
NginxUserConfig nginxUserConfig = NginxUserConfigLoaders.configFile("D:\\github\\nginx4j\\src\\main\\resources\\nginx.conf").load();

Nginx4jBs.newInstance()
        .nginxUserConfig(nginxUserConfig)
        .init()
        .start();
```

# 小结

整体而言 nginx.conf 的配置非常灵活。还有很多特性需要持续优化支持。

比如默认的全局配置，单独的 server 配置重载。

# 参考资料

* any list
{:toc}