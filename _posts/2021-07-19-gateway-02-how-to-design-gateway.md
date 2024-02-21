---
layout: post
title: 如何从零实现属于自己的 API 网关？
date:  2021-07-19 09:20:31 +0800
categories: [Distributed]
tags: [gateway, distributed, gateway-topic, sh]
published: true
---

# 序言

上一篇文章：[你连对外接口签名都不会知道？有时间还是要学习学习。](https://houbb.github.io/2020/06/17/java-tool-checksum)

有很多小伙伴反应，对外的 API 中相关的加签，验签这些工作可以统一使用网关去处理。

说到网关，大家肯定比较熟悉。市面上使用比较广泛的有：spring cloud/kong/soul。

## API 网关的作用

- 对外接口中的权限校验

- 接口调用的次数限制，频率限制

- 微服务网关中的负载均衡，缓存，路由，访问控制，服务代理，监控，日志等。

![网关架构图](https://images2017.cnblogs.com/blog/388861/201801/388861-20180104153322409-925270442.png)

# 实现原理

## 调用方式

![输入图片说明](https://images.gitee.com/uploads/images/2021/0719/221553_925c19d2_508704.png "gateway-client-server.png")

一般的请求时直接通过 client 访问 server 端，我们需要在中间实现一层 api 网关，外部 client 访问 gateway，然后 gateway 进行调用的转发。

## 核心流程

网关听起来非常复杂，最核心的部分其实基于 Servlet 的 `javax.servlet.Filter` 进行实现。

我们让 client 调用网关，然后在 Filter 中统一对消息题进行解析转发，调用服务端后，再封装返回给 client。

```java
import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@WebFilter
@Component
public class GatewayFilter implements Filter {

    private static final Logger LOGGER = LoggerFactory.getLogger(GatewayFilter.class);

    public void init(FilterConfig filterConfig) throws ServletException {

    }

    public void doFilter(ServletRequest servletRequest,
                         ServletResponse servletResponse,
                         FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) servletRequest;
        LOGGER.info("url={}, params={}", req.getRequestURI(), JSON.toJSONString(req.getParameterMap()));

        //根据 URL 获取对应的服务名称

        // 进行具体的处理逻辑

        // TODO...

        } else {
            filterChain.doFilter(req, servletResponse);
        }
    }

    public void destroy() {

    }

}
```

接下来，我们只需要重点看一下如何重写 doFilter 方法即可。

# 具体实现

## 获取 appName

网关是面对公司内部所有应用的，我们可以通过每一个服务的唯一 appName 作为区分。

比如应用名称为 test，则调用网关的请求：

```
https://gateway.com/test/version
```

这个请求，对应的 appName 就是 test，实际请求的 url 是 /version。

具体实现也比较简单：

```java
@Override
public Pair<String, String> getRequestPair(HttpServletRequest req) {
    final String url = req.getRequestURI();
    if(url.startsWith("/") && url.length() > 1) {
        String subUrl = url.substring(1);
        int nextSlash = subUrl.indexOf("/");
        if(nextSlash < 0) {
            LOGGER.warn("请求地址 {} 对应的 appName 不存在。", url);
            return Pair.of(null, null);
        }
        String appName = subUrl.substring(0, nextSlash);
        String realUrl = subUrl.substring(nextSlash);
        LOGGER.info("请求地址 {} 对应的 appName: {}, 真实请求地址：{}", url, appName, realUrl);
        return Pair.of(appName, realUrl);
    }
    LOGGER.warn("请求地址: {} 不是以 / 开头，或者长度不够 2，直接忽略。", url);
    return Pair.of(null, null);
}
```

## 请求头信息

根据 HttpServletRequest 构建出对应的请求头信息：

```java
/**
 * 构建 map 信息
 * @param req 请求
 * @return 结果
 * @since 1.0.0
 */
private Map<String, String> buildHeaderMap(final HttpServletRequest req) {
    Map<String, String> map = new HashMap<>();
    Enumeration<String> enumeration = req.getHeaderNames();
    while (enumeration.hasMoreElements()) {
        String name = enumeration.nextElement();
        String value = req.getHeader(name);
        map.put(name, value);
    }
    return map;
}
```

## 服务发现

当我们解析出请求的应用时 appName = test 时，就可以去查询配置中心中 test 应用中对应的 ip:port 信息。

```java
@Override
public String buildRequestUrl(Pair<String, String> pair) {
    String appName = pair.getValueOne();
    String appUrl = pair.getValueTwo();
    String ipPort = "127.0.0.1:8081";
    //TODO: 根据数据库配置查询
    // 根据是否启用 HTTPS 访问不同的地址
    if (appName.equals("test")) {
        // 这里需要涉及到负载均衡
        ipPort = "127.0.0.1:8081";
    } else {
        throw new GatewayServerException(GatewayServerRespCode.APP_NAME_NOT_FOUND_IP);
    }
    String format = "http://%s/%s";
    return String.format(format, ipPort, appUrl);
}
```

这里暂时固定写死，最后返回实际服务端的请求地址。

这里也可以结合具体的负载均衡/路由策略，做进一步的服务端选择。


## 不同 Method

HTTP 支持的方式是多样的，我们暂时支持一下 GET/POST 请求。

本质上就是针对 GET/POST 请求，构建形式的请求调用服务端。

这里的实现方式可以非常多样，此处以 ok-http 客户端为例作为实现。

### 接口定义

为了便于后期拓展，所有的 Method 调用，实现相同的接口：

```java
public interface IMethodType {

    /**
     * 处理
     * @param context 上下文
     * @return 结果
     */
    IMethodTypeResult handle(final IMethodTypeContext context);

}
```

### GET

GET 请求。

```java
@Service
@MethodTypeRoute("GET")
public class GetMethodType implements IMethodType {

    @Override
    public IMethodTypeResult handle(IMethodTypeContext context) {
        String respBody = OkHttpUtil.get(context.url(), context.headerMap());
        return MethodTypeResult.newInstance().respJson(respBody);
    }

}
```

### POST

POST 请求。

```java
@Service
@MethodTypeRoute("POST")
public class PostMethodType implements IMethodType {

    @Override
    public IMethodTypeResult handle(IMethodTypeContext context) {
        HttpServletRequest req = (HttpServletRequest) context.servletRequest();
        String postJson = HttpUtil.getPostBody(req);
        String respBody = OkHttpUtil.post(context.url(), postJson, context.headerMap());

        return MethodTypeResult.newInstance().respJson(respBody);
    }

}
```

### OkHttpUtil 实现

OkHttpUtil 是基于 ok-http 封装的 http 调用工具类。

```java
import com.github.houbb.gateway.server.util.exception.GatewayServerException;
import com.github.houbb.heaven.util.util.MapUtil;
import okhttp3.*;

import java.io.IOException;
import java.util.Map;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class OkHttpUtil {

    private static final MediaType JSON
            = MediaType.parse("application/json; charset=utf-8");

    /**
     * get 请求
     * @param url 地址
     * @return 结果
     * @since 1.0.0
     */
    public static String get(final String url) {
        return get(url, null);
    }

    /**
     * get 请求
     * @param url 地址
     * @param headerMap 请求头
     * @return 结果
     * @since 1.0.0
     */
    public static String get(final String url,
                             final Map<String, String> headerMap) {
        try {
            OkHttpClient client = new OkHttpClient();
            Request.Builder builder = new Request.Builder();
            builder.url(url);

            if(MapUtil.isNotEmpty(headerMap)) {
                for(Map.Entry<String, String> entry : headerMap.entrySet()) {
                    builder.header(entry.getKey(), entry.getValue());
                }
            }

            Request request = builder
                    .build();

            Response response = client.newCall(request).execute();
            return response.body().string();
        } catch (IOException e) {
            throw new GatewayServerException(e);
        }
    }

    /**
     * get 请求
     * @param url 地址
     * @param body 请求体
     * @param headerMap 请求头
     * @return 结果
     * @since 1.0.0
     */
    public static String post(final String url,
                              final RequestBody body,
                             final Map<String, String> headerMap) {
        try {
            OkHttpClient client = new OkHttpClient();
            Request.Builder builder = new Request.Builder();
            builder.post(body);
            builder.url(url);

            if(MapUtil.isNotEmpty(headerMap)) {
                for(Map.Entry<String, String> entry : headerMap.entrySet()) {
                    builder.header(entry.getKey(), entry.getValue());
                }
            }

            Request request = builder.build();
            Response response = client.newCall(request).execute();
            return response.body().string();
        } catch (IOException e) {
            throw new GatewayServerException(e);
        }
    }

    /**
     * get 请求
     * @param url 地址
     * @param bodyJson 请求体 JSON
     * @param headerMap 请求头
     * @return 结果
     * @since 1.0.0
     */
    public static String post(final String url,
                              final String bodyJson,
                              final Map<String, String> headerMap) {
        RequestBody body = RequestBody.create(JSON, bodyJson);
        return post(url, body, headerMap);
    }

}
```

## 调用结果处理

请求完服务端之后，我们需要对结果进行处理。

第一版的实现非常粗暴：

```java
/**
 * 处理最后的结果
 * @param methodTypeResult 结果
 * @param servletResponse 响应
 * @since 1.0.0
 */
private void methodTypeResultHandle(final IMethodTypeResult methodTypeResult,
                                    final ServletResponse servletResponse) {
    try {
        final String respBody = methodTypeResult.respJson();
        // 重定向（因为网络安全等原因，这个方案应该被废弃。）
        // 这里可以重新定向，也可以通过 http client 进行请求。
        // GET/POST
        //获取字符输出流对象
        servletResponse.setCharacterEncoding("UTF-8");
        servletResponse.setContentType("text/html;charset=utf-8");
        servletResponse.getWriter().write(respBody);
    } catch (IOException e) {
        throw new GatewayServerException(e);
    }
}
```

## 完整实现

我们把上面的主要流程放在一起，完整的实现如下：

```java
import com.alibaba.fastjson.JSON;
import com.github.houbb.gateway.server.util.exception.GatewayServerException;
import com.github.houbb.gateway.server.web.biz.IRequestAppBiz;
import com.github.houbb.gateway.server.web.method.IMethodType;
import com.github.houbb.gateway.server.web.method.IMethodTypeContext;
import com.github.houbb.gateway.server.web.method.IMethodTypeResult;
import com.github.houbb.gateway.server.web.method.impl.MethodHandlerContainer;
import com.github.houbb.gateway.server.web.method.impl.MethodTypeContext;
import com.github.houbb.heaven.support.tuple.impl.Pair;
import com.github.houbb.heaven.util.lang.StringUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

/**
 * 网关过滤器
 *
 * @author binbin.hou
 * @since 1.0.0
 */
@WebFilter
@Component
public class GatewayFilter implements Filter {

    private static final Logger LOGGER = LoggerFactory.getLogger(GatewayFilter.class);

    @Autowired
    private IRequestAppBiz requestAppBiz;

    @Autowired
    private MethodHandlerContainer methodHandlerContainer;

    public void init(FilterConfig filterConfig) throws ServletException {

    }

    public void doFilter(ServletRequest servletRequest,
                         ServletResponse servletResponse,
                         FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) servletRequest;
        LOGGER.info("url={}, params={}", req.getRequestURI(), JSON.toJSONString(req.getParameterMap()));

        //根据 URL 获取对应的服务名称
        Pair<String, String> pair = requestAppBiz.getRequestPair(req);
        Map<String, String> headerMap = buildHeaderMap(req);
        String appName = pair.getValueOne();
        if(StringUtil.isNotEmptyTrim(appName)) {
            String method = req.getMethod();

            String respBody = null;
            String url = requestAppBiz.buildRequestUrl(pair);

            //TODO: 其他方法的支持
            IMethodType methodType = methodHandlerContainer.getMethodType(method);

            IMethodTypeContext typeContext = MethodTypeContext.newInstance()
                    .methodType(method)
                    .url(url)
                    .servletRequest(servletRequest)
                    .servletResponse(servletResponse)
                    .headerMap(headerMap);

            // 执行前

            // 执行
            IMethodTypeResult methodTypeResult = methodType.handle(typeContext);

            // 执行后


            // 结果的处理
            this.methodTypeResultHandle(methodTypeResult, servletResponse);
        } else {
            filterChain.doFilter(req, servletResponse);
        }
    }

    public void destroy() {

    }


    /**
     * 处理最后的结果
     * @param methodTypeResult 结果
     * @param servletResponse 响应
     * @since 1.0.0
     */
    private void methodTypeResultHandle(final IMethodTypeResult methodTypeResult,
                                        final ServletResponse servletResponse) {
        try {
            final String respBody = methodTypeResult.respJson();

            // 重定向（因为网络安全等原因，这个方案应该被废弃。）
            // 这里可以重新定向，也可以通过 http client 进行请求。
            // GET/POST
            //获取字符输出流对象
            servletResponse.setCharacterEncoding("UTF-8");
            servletResponse.setContentType("text/html;charset=utf-8");
            servletResponse.getWriter().write(respBody);
        } catch (IOException e) {
            throw new GatewayServerException(e);
        }
    }

    /**
     * 构建 map 信息
     * @param req 请求
     * @return 结果
     * @since 1.0.0
     */
    private Map<String, String> buildHeaderMap(final HttpServletRequest req) {
        Map<String, String> map = new HashMap<>();

        Enumeration<String> enumeration = req.getHeaderNames();
        while (enumeration.hasMoreElements()) {
            String name = enumeration.nextElement();

            String value = req.getHeader(name);
            map.put(name, value);
        }
        return map;
    }

}
```

# 网关验证

## 网关应用

我们把拦截器加好以后，定义对应的 Application 如下：

```java
@SpringBootApplication
@ServletComponentScan
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

}
```

然后把网关启动起来，启动端口号为 8080

## 服务端应用

然后启动服务端对应的服务，端口号为 8081。

查看版本号的控制器实现：

```java
@RestController
public class MonitorController {

    @RequestMapping(value = "version", method = RequestMethod.GET)
    public String version() {
        return "1.0-demo";
    }

}
```

## 请求

我们在浏览器上直接访问 api 网关：

```
http://localhost:8080/test/version
```

页面返回：

```
1.0-demo
```

# 小结

API 网关实现的原理并不难，就是基于 servlet 对请求进行转发。

虽然看起来简单，但是可以在这个基础上实现更多强大的特性，比如限流，日志，监控等等。

如果你对 API 网关感兴趣的话，不妨关注一波，后续内容，更加精彩。

备注：涉及的代码较多，文中做了简化。如果你对全部源码感兴趣，可以關註【老马啸西风】，後臺回復【网关】即可获得。

我是老马，期待与你的下次重逢。

# 参考资料

[聊聊API网关的作用](https://www.cnblogs.com/coolfiry/p/8193768.html)

* any list
{:toc}