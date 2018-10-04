---
layout: post
title: Java Servlet 教程-11-包装器 Wrapper
date:  2018-10-04 19:49:44 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
excerpt: Java Servlet 教程-11-包装器 Wrapper
---

# 包装器

包装器包装了实际的请求或响应对象，而且把调用委托给实际的对象，还允许你对定制请求或响应做所需的额外处理。

过滤器可以用于创建请求包装器或创建响应包装器。

## 核心类

- ServletRequestWrapper

- HttpServletRequestWrapper

- ServletResponseWrapper

- HttpServletResponseWrapper

## 使用步骤

1. 编写 *Wrapper 的子类 

2. 重写希望修改其行为的方法 

一般用于 [过滤器](https://houbb.github.io/2018/10/04/java-servlet-tutorial-10-filter) 中 


# 实战代码

## 业务场景

对于请求的信息进行修改，比如编码信息。可以参考例子 [Servlet过滤器、包装器](https://www.jianshu.com/p/c467eb0e582f)

为了简单起见，本例子演示修改 request 入参。

比如替换一些敏感词汇、非法字符等等

## 实例代码

### 代码

- 自定义的请求包装类

```java
public class MyRequestWapper extends HttpServletRequestWrapper {

    private HttpServletRequest request;

    public MyRequestWapper(HttpServletRequest request) {
        super(request);
        this.request = request;
    }

    @Override
    public String getParameter(String name) {
        String value = request.getParameter(name);
        // 敏感词替换等
        return value.replaceAll("bad", "good");
    }

}
```

- 敏感词汇过滤器

```java
@WebFilter(urlPatterns = {"/wrapper/*"})
public class WordFilter implements Filter {

    public void init(FilterConfig filterConfig) throws ServletException {
    }

    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        chain.doFilter(new MyRequestWapper((HttpServletRequest) request), response);
    }

    public void destroy() {
    }

}
```

- 简单的实例 servlet

```java
@WebServlet("/wrapper/word")
public class WapperWordServlet extends HttpServlet {

    private static final long serialVersionUID = 3994711400300020410L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.getWriter().write(req.getParameter("evaluation"));
    }

}
```

### 测试

浏览器访问 [http://localhost:8081/wrapper/word?evaluation=badrequest](http://localhost:8081/wrapper/word?evaluation=badrequest)

页面显示：

```
goodrequest
```

# 参考资料

《Head First Servlet & JSP》

https://blog.csdn.net/shengpiangui9845/article/details/77885272

https://www.cnblogs.com/myitroad/p/6192537.html

https://www.jianshu.com/p/c467eb0e582f

http://blog.wangjinping.top/2015/07/31/web/%E8%BF%87%E6%BB%A4%E5%99%A8%E4%B8%8E%E5%8C%85%E8%A3%85%E5%99%A8/

[包装器动态添加参数](http://cailin.iteye.com/blog/2337474)

* any list
{:toc}