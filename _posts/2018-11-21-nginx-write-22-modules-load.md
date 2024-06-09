---
layout: post
title:  从零手写实现 nginx-21-modules 模块配置加载
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

# 核心实现

```java
/**
 * 细化为不同的组件读取
 *
 * @since 0.18.0
 * @author 老马啸西风
 */
public  class NginxUserConfigLoaderConfigComponentFile extends AbstractNginxUserConfigLoader {

    private final String filePath;

    public NginxUserConfigLoaderConfigComponentFile(String filePath) {
        this.filePath = filePath;
    }

    @Override
    protected NginxUserConfig doLoad() {
        NgxConfig conf = null;
        try {
            conf = NgxConfig.read(filePath);

            NginxUserConfigBs configBs = NginxUserConfigBs.newInstance();

            //1. basic
            INginxUserMainConfigLoad mainConfigLoad = new NginxUserMainConfigLoadFile(conf);
            NginxUserMainConfig mainConfig = mainConfigLoad.load();
            configBs.mainConfig(mainConfig);

            //2. events
            INginxUserEventsConfigLoad eventsConfigLoad = new NginxUserEventsConfigLoadFile(conf);
            NginxUserEventsConfig eventsConfig = new NginxUserEventsConfig();
            configBs.eventsConfig(eventsConfig);

            //3. server 信息
            // 首先获取 block
            List<NgxEntry> servers = conf.findAll(NgxConfig.BLOCK, "http", "server"); // 示例3
            if(CollectionUtil.isNotEmpty(servers)) {
                for (NgxEntry entry : servers) {
                    // 每一个 server 的处理
                    NgxBlock ngxBlock = (NgxBlock) entry;

                    final INginxUserServerConfigLoad serverConfigLoad = new NginxUserServerConfigLoadFile(conf, ngxBlock);
                    NginxUserServerConfig serverConfig = serverConfigLoad.load();
                    configBs.addServerConfig(serverConfig);
                }
            }

            // 返回
            return configBs.build();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

}
```

然后每一个模块，都有对应的子实现。

我们以 server 为例。

## NginxUserServerConfigLoadFile

```java
package com.github.houbb.nginx4j.config.load.component.impl;

import com.github.houbb.heaven.util.lang.StringUtil;
import com.github.houbb.heaven.util.util.CollectionUtil;
import com.github.houbb.nginx4j.bs.NginxUserServerConfigBs;
import com.github.houbb.nginx4j.config.NginxCommonConfigParam;
import com.github.houbb.nginx4j.config.NginxUserServerConfig;
import com.github.houbb.nginx4j.config.NginxUserServerLocationConfig;
import com.github.houbb.nginx4j.config.load.component.INginxUserServerConfigLoad;
import com.github.houbb.nginx4j.config.load.component.INginxUserServerLocationConfigLoad;
import com.github.houbb.nginx4j.constant.NginxLocationPathTypeEnum;
import com.github.houbb.nginx4j.constant.NginxUserServerConfigDefaultConst;
import com.github.odiszapc.nginxparser.NgxBlock;
import com.github.odiszapc.nginxparser.NgxConfig;
import com.github.odiszapc.nginxparser.NgxEntry;
import com.github.odiszapc.nginxparser.NgxParam;

import java.util.*;

/**
 * @since 0.18.0
 */
public class NginxUserServerConfigLoadFile implements INginxUserServerConfigLoad {

    private final NgxConfig conf;

    private final NgxBlock serverBlock;


    public NginxUserServerConfigLoadFile(NgxConfig conf, NgxBlock serverBlock) {
        this.conf = conf;
        this.serverBlock = serverBlock;
    }

    @Override
    public NginxUserServerConfig load() {
        NginxUserServerConfigBs serverConfigBs = NginxUserServerConfigBs.newInstance();
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

        // 添加 location
        List<NginxUserServerLocationConfig> locationConfigList = getHttpServerLocationList(conf, serverBlock);
        NginxUserServerLocationConfig defaultLocationConfig = getDefaultLocationConfig(locationConfigList);

        serverConfigBs.httpServerName(httpServerName)
                .httpServerListen(httpServerPort)
                .httpServerRoot(httpServerRoot)
                .httpServerIndexList(httpIndexList)
                .sendFile(sendFile)
                .gzip(gzip)
                .gzipMinLength(gzipMinLen)
                .gzipTypes(gzipTypes)
                .locationConfigList(locationConfigList)
                .defaultLocationConfig(defaultLocationConfig);

        return serverConfigBs.build();
    }

    // 各种实现

    private List<NginxUserServerLocationConfig> getHttpServerLocationList(final NgxConfig conf, final NgxBlock serverBlock) {
        List<NginxUserServerLocationConfig> resultList = new ArrayList<>();
        // value
        List<NgxEntry> entryList = serverBlock.findAll(NgxBlock.class, "location");
        if(CollectionUtil.isNotEmpty(entryList)) {
            for(NgxEntry entry : entryList) {
                NgxBlock ngxBlock = (NgxBlock) entry;
                // 参数

                // location 的处理
                final INginxUserServerLocationConfigLoad locationConfigLoad = new NginxUserServerLocationConfigLoadFile(conf, ngxBlock);
                NginxUserServerLocationConfig locationConfig = locationConfigLoad.load();
                resultList.add(locationConfig);
            }
        }

        // 排序。按照匹配的优先级，从高到底排序
        if(CollectionUtil.isNotEmpty(resultList)) {
            Collections.sort(resultList, new Comparator<NginxUserServerLocationConfig>() {
                @Override
                public int compare(NginxUserServerLocationConfig o1, NginxUserServerLocationConfig o2) {
                    return o1.getTypeEnum().getOrder() - o2.getTypeEnum().getOrder();
                }
            });
        }

        return resultList;
    }

}
```

因为 server 中，又涉及到 location 子模块，这里继续让 NginxUserServerLocationConfigLoadFile 来处理具体的逻辑。

# 小结

模块的加载拆分为不同的模块加载后，我们暂时实现了其中的部分。

后续有时间再实现更多的配置信息。

我是老马，期待与你的下次重逢。

# 开源地址

为了便于大家学习，已经将 nginx 开源

> [https://github.com/houbb/nginx4j](https://github.com/houbb/nginx4j)

# 参考资料


* any list
{:toc}