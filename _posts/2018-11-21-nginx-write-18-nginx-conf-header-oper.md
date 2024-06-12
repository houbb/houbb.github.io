---
layout: post
title:  从零手写实现 nginx-18-nginx.conf header 信息操作
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


# 目标

我们希望可以通过配置对 header 进行相关操作，比如添加 cors 响应。

这里应该分为两个部分：

1）请求头的统一处理

2）响应头的统一处理

处理又包含 增删改。

# 指令

抱歉，之前的回答有点冗长了。其实，对于请求头和响应头的增删改操作，各自都有一个主要指令即可。

### 请求头的增删改指令

- **增加或修改请求头**：使用 `proxy_set_header` 指令。
- **删除请求头**：同样使用 `proxy_set_header` 指令，但将值设为空。

```nginx
proxy_set_header Header-Name Value;  # 增加或修改
proxy_set_header Header-Name "";     # 删除
```

### 响应头的增删改指令

- **增加或修改响应头**：使用 `add_header` 指令。
- **删除响应头**：使用 `proxy_hide_header` 指令。

```nginx
add_header Header-Name Value;        # 增加或修改
proxy_hide_header Header-Name;       # 删除
```

### 示例

#### 请求头的增删改
```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        # 增加或修改请求头
        proxy_set_header X-Real-IP $remote_addr;
        
        # 删除请求头
        proxy_set_header X-Unwanted-Header "";

        proxy_pass http://backend;
    }
}
```

#### 响应头的增删改
```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;

        # 增加或修改响应头
        add_header X-Response-Time $request_time;
        
        # 删除响应头
        proxy_hide_header X-Unwanted-Header;
    }
}
```

这样就可以简洁地实现对请求头和响应头的增删改操作。


# 核心代码

## 配置的初始化

首先我们解析配置文件

```conf
# 默认匹配
location / {
    proxy_set_header X-DEFINE-PARAM myDefineParam;
    proxy_set_header X-DEFINE-HOST 127.0.0.1;
    # 增加或修改响应头 这里就提现了一些占位符的强大之处。下一次可以考虑支持
    add_header X-Response-Time 2024-06-08;
    # 删除响应头
    proxy_hide_header X-Unwanted-Header;
}
```

核心逻辑如下：

```java
private List<NginxUserServerLocationConfig> getHttpServerLocationList(final NgxConfig conf, final NgxBlock serverBlock) {
        List<NginxUserServerLocationConfig> resultList = new ArrayList<>();
        // value
        List<NgxEntry> entryList = serverBlock.findAll(NgxBlock.class, "location");
        if(CollectionUtil.isNotEmpty(entryList)) {
            for(NgxEntry entry : entryList) {
                NgxBlock ngxBlock = (NgxBlock) entry;
                // 参数
                NginxUserServerLocationConfig locationConfig = new NginxUserServerLocationConfig();
                locationConfig.setName(ngxBlock.getName());
                locationConfig.setValue(ngxBlock.getValue());
                locationConfig.setValues(ngxBlock.getValues());

                NginxLocationPathTypeEnum typeEnum = NginxLocationPathTypeEnum.getTypeEnum(locationConfig);
                locationConfig.setTypeEnum(typeEnum);

                // 参数
                List<NginxUserConfigParam> paramList = new ArrayList<>();
                Collection<NgxEntry> ngxEntries = ngxBlock.getEntries();
                if(CollectionUtil.isNotEmpty(ngxEntries)) {
                    for(NgxEntry ngxEntry : ngxEntries) {
                        // 暂时跳过一些注释之类的处理
                        if(!(ngxEntry instanceof NgxParam)) {
                            continue;
                        }

                        NgxParam ngxParam = (NgxParam) ngxEntry;
                        String name = ngxParam.getName();
                        List<String> values = ngxParam.getValues();
                        String value = ngxParam.getValue();

                        NginxUserConfigParam nginxUserConfigParam = new NginxUserConfigParam();
                        nginxUserConfigParam.setName(name);
                        nginxUserConfigParam.setValue(value);
                        nginxUserConfigParam.setValues(values);

                        paramList.add(nginxUserConfigParam);
                    }
                }
                locationConfig.setDirectives(paramList);

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
```

根据配置文件，构建对应的处理类信息。

这里统一设置了优先级，就按照给出的标准:

```java
public enum NginxLocationPathTypeEnum {

    EXACT("EXACT", "精确匹配 (`=`)", 1000),
    PREFIX("PREFIX", "前缀匹配 (^~)", 2000),
    REGEX("REGEX", "正则匹配 (~ 或 ~*)", 3000),
    COMMON_PREFIX("COMMON_PREFIX /prefix", "普通前缀匹配", 4000),
    DEFAULT("DEFAULT", "默认匹配 /", 5000),
    ;

}
```

## 配置的处理

在处理请求的时候，我们暂时主要处理两个部分

1）请求头

2）响应头

此处以请求头为例子，暂时如何统一处理请求头

```java
public void dispatch(final NginxRequestDispatchContext context) {
    beforeDispatch(context);
    // 统一的处理
    doDispatch(context);
    // 统一的处理
    afterDispatch(context);
}
```

我们在分发请求之前，匹配我们定义的各种指令策略

```java
/**
 * 请求头的统一处理
 * @param context 上下文
 */
protected void beforeDispatch(final NginxRequestDispatchContext context) {
    // 参数管理类
    final INginxParamManager paramManager = context.getNginxConfig().getNginxParamManager();
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
        List<INginxParamHandle> handleList = paramManager.paramHandleList(configParam, context);
        if(CollectionUtil.isNotEmpty(handleList)) {
            for(INginxParamHandle paramHandle : handleList) {
                paramHandle.beforeDispatch(configParam, context);
            }
        }
    }
}
```

## INginxParamHandle 处理类

这里统一定义各种指令的操作。以其中一个为例

```java
package com.github.houbb.nginx4j.config.param;

import com.github.houbb.heaven.util.lang.StringUtil;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.nginx4j.config.NginxUserConfigParam;
import com.github.houbb.nginx4j.support.request.dispatch.NginxRequestDispatchContext;
import io.netty.channel.ChannelHandlerContext;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.HttpHeaders;

import java.util.List;

/**
 * 参数处理类 请求头处理
 *
 * @since 0.16.0
 * @author 老马啸西风
 */
public class NginxParamHandleProxySetHeader extends AbstractNginxParamHandle {

    private static final Log logger = LogFactory.getLog(NginxParamHandleProxySetHeader.class);

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
    public void doBeforeDispatch(NginxUserConfigParam configParam, NginxRequestDispatchContext context) {
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

    // 省略

    @Override
    public boolean doMatch(NginxUserConfigParam configParam, NginxRequestDispatchContext context) {
        return "proxy_set_header".equalsIgnoreCase(configParam.getName());
    }

}
```

这里就可以针对配置的信息，执行请求头的处理。


# 小结

到这里可以发现 nginx 确实非常的强大。

不过我们目前还没有实现各种占位符，感觉这部分也是 nginx 强大的原因之一。

而且各种指令的实现方式也比较多，需要后续陆续补充实现。

# 参考资料

* any list
{:toc}