---
layout: post
title:  web 实战-20-springboot 中 inputStream 神秘消失之谜
date:  2020-08-28 10:37:20 +0800
categories: [web]
tags: [web, http, sf]
published: true
---

# 序言

最近小明接手了前同事的代码，意料之外、情理之中的遇到了坑。

为了避免掉入同一个坑两次，小明决定把这个坑记下来，并在坑前立一个大牌子，避免其他小伙伴掉进去。

![在这里插入图片描述](https://img-blog.csdnimg.cn/6f47e889f8404440ab141230e33a1a9e.jpg)

# HTTPClient 模拟调用

为了把这个问题说明，我们首先从最简单的 http 调用说起。

## 设置 body

### 服务端

服务端的代码如下：

```java
@Controller
@RequestMapping("/")
public class ReqController {

    @PostMapping(value = "/body")
    @ResponseBody
    public String body(HttpServletRequest httpServletRequest) {
        try {
            String body = StreamUtil.toString(httpServletRequest.getInputStream());
            System.out.println("请求的 body: " + body);

            // 从参数中获取
            return body;
        } catch (IOException e) {
            e.printStackTrace();
            return e.getMessage();
        }
    }

}
```

java 客户端要如何请求才能让服务端读取到传递的 body 呢？

### 客户端

这个问题一定难不到你，实现的方式有很多种。

我们以 apache httpclient 为例：

```java
//post请求，带集合参数
public static String post(String url, String body) {
    try {
        // 通过HttpPost来发送post请求
        HttpPost httpPost = new HttpPost(url);
        StringEntity stringEntity = new StringEntity(body);
        // 通过setEntity 将我们的entity对象传递过去
        httpPost.setEntity(stringEntity);
        return execute(httpPost);
    } catch (UnsupportedEncodingException e) {
        throw new RuntimeException(e);
    }
}

//执行请求返回响应数据
private static String execute(HttpRequestBase http) {
    try {
        CloseableHttpClient client = HttpClients.createDefault();
        // 通过client调用execute方法
        CloseableHttpResponse Response = client.execute(http);
        //获取响应数据
        HttpEntity entity = Response.getEntity();
        //将数据转换成字符串
        String str = EntityUtils.toString(entity, "UTF-8");
        //关闭
        Response.close();
        return str;
    } catch (IOException e) {
        throw new RuntimeException(e);
    }
}
```

可以发现 httpclient 封装之后还是非常方便的。

我们设置 setEntity 为对应入参的 StringEntity 即可。

### 测试

为了验证正确性，小明本地实现了一个验证方法。

```java
@Test
public void bodyTest() {
    String url = "http://localhost:8080/body";
    String body = buildBody();
    String result = HttpClientUtils.post(url, body);

    Assert.assertEquals("body", result);
}

private String buildBody() {
    return "body";
}
```

很轻松，小明漏出了龙王的微笑。

## 设置 parameter

### 服务端

小明又看到有一个服务端的代码实现如下：

```java
@PostMapping(value = "/param")
@ResponseBody
public String param(HttpServletRequest httpServletRequest) {
    // 从参数中获取
    String param = httpServletRequest.getParameter("id");
    System.out.println("param: " + param);
    return param;
}

private Map<String,String> buildParamMap() {
    Map<String,String> map = new HashMap<>();
    map.put("id", "123456");

    return map;
}
```

所有的参数是通过 getParameter 方法获取，应该如何实现呢？

### 客户端

这个倒也不难，小明心想。

因为以前很多代码都是这样实现的，于是 ctrl+CV 搞定了下面的代码：

```java
//post请求，带集合参数
public static String post(String url, Map<String, String> paramMap) {
    List<NameValuePair> nameValuePairs = new ArrayList<>();
    for (Map.Entry<String, String> entry : paramMap.entrySet()) {
        NameValuePair pair = new BasicNameValuePair(entry.getKey(), entry.getValue());
        nameValuePairs.add(pair);
    }
    return post(url, nameValuePairs);
}

//post请求，带集合参数
private static String post(String url, List<NameValuePair> list) {
    try {
        // 通过HttpPost来发送post请求
        HttpPost httpPost = new HttpPost(url);
        // 我们发现Entity是一个接口，所以只能找实现类，发现实现类又需要一个集合，集合的泛型是NameValuePair类型
        UrlEncodedFormEntity formEntity = new UrlEncodedFormEntity(list);
        // 通过setEntity 将我们的entity对象传递过去
        httpPost.setEntity(formEntity);
        return execute(httpPost);
    } catch (Exception exception) {
        throw new RuntimeException(exception);
    }
}
```

如此是最常用的 paramMap，便于构建；和具体的实现方式脱离，也便于后期拓展。

### servlet 标准

UrlEncodedFormEntity 看似平平无奇，表示这是一个 post 表单请求。

里面还涉及到 servlet 3.1 的一个标准，必须满足下面的标准，post 表单的 parameter 集合才可用。

```
1. 请求是 http 或 https

2. 请求的方法是 POST

3. content type 为： application/x-www-form-urlencoded

4. servlet 已经在 request 对象上调用了相关的 getParameter 方法。
```

当以上条件不满足时，POST 表单的数据并不会设置到 parameter 集合中，但依然可以通过 request 对象的 inputstream 来获取。 

当以上条件满足时，POST 表单的数据在 request 对象的 inputstream 将不再可用了。

这是很重要的一个约定，导致很多小伙伴比较蒙圈。

### 测试

于是，小明也写好了对应的测试用例：

```java
@Test
public void paramTest() {
    String url = "http://localhost:8080/param";

    Map<String,String> map = buildParamMap();
    String result = HttpClientUtils.post(url, map);

    Assert.assertEquals("123456", result);
}
```

如果谈恋爱能像编程一样，那该多好。

![恋爱简单](https://img-blog.csdnimg.cn/b7654f83c34949c09e691b48da84dd1f.jpg)

小明想着，却不由得眉头一皱，发现事情并不简单。

## 设置 parameter 和 body

### 服务端

有一个请求的入参是比较大，所以放在 body 中，其他参数依然放在 paramter 中。

```java
@PostMapping(value = "/paramAndBody")
@ResponseBody
public String paramAndBody(HttpServletRequest httpServletRequest) {
    try {
        // 从参数中获取
        String param = httpServletRequest.getParameter("id");
        System.out.println("param: " + param);
        String body = StreamUtil.toString(httpServletRequest.getInputStream());
        System.out.println("请求的 body: " + body);
        // 从参数中获取
        return param+"-"+body;
    } catch (IOException e) {
        e.printStackTrace();
        return e.getMessage();
    }
}
```

其中 StreamUtil#toString 是一个对流简单处理的工具类。

```java
/**
 * 转换为字符串
 * @param inputStream 流
 * @return 结果
 * @since 1.0.0
 */
public static String toString(final InputStream inputStream)  {
    if (inputStream == null) {
        return null;
    }
    try {
        int length = inputStream.available();
        final Reader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
        final CharArrayBuffer buffer = new CharArrayBuffer(length);
        final char[] tmp = new char[1024];
        int l;
        while((l = reader.read(tmp)) != -1) {
            buffer.append(tmp, 0, l);
        }
        return buffer.toString();
    } catch (Exception exception) {
        throw new RuntimeException(exception);
    }
}
```

### 客户端

那么问题来了，如何同时在 HttpClient 中设置 parameter 和 body 呢？

机智的小伙伴们可以自己先尝试一下。

小明尝试了多种方法，发现一个残酷的现实—— httpPost 只能设置一个 Entity，也尝试看了各种子类，然并LUAN。

就在小明想要放弃的时候，小明忽然想到，paramter 完全可以通过拼接 URL 的方式实现。

**也就是我们把 parameter 和 url 并且为一个新的 URL，body 和以前设置方式一样。**

实现代码如下：

```java
//post请求，带集合参数
public static String post(String url, Map<String, String> paramMap,
                          String body) {
    try {
        List<NameValuePair> nameValuePairs = new ArrayList<>();
        for (Map.Entry<String, String> entry : paramMap.entrySet()) {
            NameValuePair pair = new BasicNameValuePair(entry.getKey(), entry.getValue());
            nameValuePairs.add(pair);
        }

        // 构建 url
        //构造请求路径，并添加参数
        URI uri = new URIBuilder(url).addParameters(nameValuePairs).build();

        //构造HttpClient
        CloseableHttpClient httpClient = HttpClients.createDefault();
        // 通过HttpPost来发送post请求
        HttpPost httpPost = new HttpPost(uri);
        httpPost.setEntity(new StringEntity(body));

        // 获取响应
        // 通过client调用execute方法
        CloseableHttpResponse Response = httpClient.execute(httpPost);
        //获取响应数据
        HttpEntity entity = Response.getEntity();
        //将数据转换成字符串
        String str = EntityUtils.toString(entity, "UTF-8");
        //关闭
        Response.close();
        return str;
    } catch (URISyntaxException | IOException | ParseException e) {
        throw new RuntimeException(e);
    }
}
```

这里通过 `new URIBuilder(url).addParameters(nameValuePairs).build()` 构建新的 URL，当然你可以使用 `&key=value` 的方式自己拼接。

### 测试代码

```java
@Test
public void paramAndBodyTest() {
    String url = "http://localhost:8080/paramAndBody";
    Map<String,String> map = buildParamMap();
    String body = buildBody();
    String result = HttpClientUtils.post(url, map, body);

    Assert.assertEquals("123456-body", result);
}
```

测试通过，非常完美。

# 新的征程

当然，一般的文章到这里就该结束了。

不过上面并不是本文的重点，我们的故事才刚刚开始。

## 日志需求

雁过留痕，风过留声。程序更应如此。

为了方便的跟踪问题，我们一般都是对调用的入参进行日志留痕。

为了便于代码拓展和可维护性，小明当然采用拦截器的方式。

## 日志拦截器

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StreamUtils;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;

/**
 * 日志拦截器

 * @author 老马啸西风
 * @since 1.0.0
 */
@Component
public class LogHandlerInterceptor implements HandlerInterceptor {

    private Logger logger = LoggerFactory.getLogger(LogHandlerInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest httpServletRequest,
                             HttpServletResponse httpServletResponse, Object o) throws Exception {
        // 获取参数信息
        Enumeration<String> enumeration = httpServletRequest.getParameterNames();
        while (enumeration.hasMoreElements()) {
            String paraName = enumeration.nextElement();
            logger.info("Param name: {}, value: {}", paraName, httpServletRequest.getParameter(paraName));
        }

        // 获取 body 信息
        String body = StreamUtils.copyToString(httpServletRequest.getInputStream(), StandardCharsets.UTF_8);
        logger.info("body: {}", body);

        return true;
    }

    @Override
    public void postHandle(HttpServletRequest httpServletRequest,
                           HttpServletResponse httpServletResponse, Object o, ModelAndView modelAndView) throws Exception {

    }

    @Override
    public void afterCompletion(HttpServletRequest httpServletRequest,
                                HttpServletResponse httpServletResponse, Object o, Exception e) throws Exception {

    }

}
```

非常的简单易懂，输出入参中的 parameter 参数和 body 信息。

然后指定一下生效的范围：

```java
@Configuration
public class SpringMvcConfig extends WebMvcConfigurerAdapter {

    @Autowired
    private LogHandlerInterceptor logHandlerInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(logHandlerInterceptor)
                .addPathPatterns("/**");

        super.addInterceptors(registry);
    }

}
```

所有的请求都会生效。

## 我的 inputStream 呢？

小伙伴们觉得刚才的日志拦截器有没有问题？

如果有，又应该怎么解决呢？

小明写完心想一切顺利，一运行测试用例，整个人都裂开了。

所有 Controller 方法中的 `httpServletRequest.getInputStream()` 的内容都变成空了。

是谁？偷走了我的 inputStream？

![悲伤那么大](https://img-blog.csdnimg.cn/a83480602fce4754b458b8184765f342.jpg)

转念一想，小明发现了问题所在。

肯定是自己刚才新增的日志拦截器有问题，因为 stream 作为流只能被读取一遍，日志中读取一遍之后，后面就读不到了。

可是日志中必须要输出，那应该怎么办呢？

# 遇事不决

遇事不决，技术问 google，八卦去围脖。

于是小明去查了一下，解决方案也比较直接，重写。

## 重写 HttpServletRequestWrapper

首先重写 HttpServletRequestWrapper，把每次读取的流信息保存起来，便于重复读取。

```java
/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class MyHttpServletRequestWrapper extends HttpServletRequestWrapper {

    private byte[] requestBody = null;//用于将流保存下来

    public MyHttpServletRequestWrapper(HttpServletRequest request) throws IOException {
        super(request);
        requestBody = StreamUtils.copyToByteArray(request.getInputStream());
    }


    @Override
    public ServletInputStream getInputStream() {
        final ByteArrayInputStream bais = new ByteArrayInputStream(requestBody);
        return new ServletInputStream() {
            @Override
            public int read() {
                return bais.read();  // 读取 requestBody 中的数据
            }

            @Override
            public boolean isFinished() {
                return false;
            }

            @Override
            public boolean isReady() {
                return false;
            }

            @Override
            public void setReadListener(ReadListener readListener) {
            }
        };
    }

    @Override
    public BufferedReader getReader() throws IOException {
        return new BufferedReader(new InputStreamReader(getInputStream()));
    }

}
```

## 实现 Filter

我们上面重写的 MyHttpServletRequestWrapper 什么时候生效呢？

我们可以自己实现一个 Filter，对原有的请求进行替换：

```java
import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
@Component
public class HttpServletRequestReplacedFilter implements Filter {

    @Override
    public void destroy() {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {
        ServletRequest requestWrapper = null;

        // 进行替换
        if(request instanceof HttpServletRequest) {
            requestWrapper = new MyHttpServletRequestWrapper((HttpServletRequest) request);
        }

        if(requestWrapper == null) {
            chain.doFilter(request, response);
        } else {
            chain.doFilter(requestWrapper, response);
        }
    }
    @Override
    public void init(FilterConfig arg0) throws ServletException {}

}
```

然后就可以发现一切都好起来了，小明嘴角又漏出了龙王的微笑。

# 小结

文中对原始问题进行了简化，实际遇到这个问题的时候，直接就是一个拦截器+参数和body的请求。

所以整个问题排查起来有些浪费时间。

不过**浪费的时间如果没有任何反思，那就是真的浪费了**。

最核心的两点在于：

（1）对于 servlet 标准的理解。

（2）对于流读取的理解，以及一些 spring 的相关知识。

我是老马，期待与你的下次重逢。

# 参考资料

[Java Servlet 3.1 规范笔记](https://emacsist.github.io/emacsist/servlet/Java%20Servlet%203.1%20%E8%A7%84%E8%8C%83%E7%AC%94%E8%AE%B0.html)

[SpringBoot拦截器读取流后不能再读取（详解）](https://blog.csdn.net/weixin_39933264/article/details/100181291)

* any list
{:toc}