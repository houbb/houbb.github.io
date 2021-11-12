---
layout: post
title:  web 安全系列-03-XSS 的解决方案及一些绕过方式
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, web-safe, sf]
published: true
---

# XSS 解决方案

## 前言

我们先看一篇比较常见的解决方式：

## 实现

### 拦截器配置

- web.xml

```xml
<filter>
  <filter-name>XssSqlFilter</filter-name>
<!-- 文件路径 -->
  <filter-class>com.xxx.XssFilter</filter-class>
 </filter>
 <filter-mapping>
  <filter-name>XssSqlFilter</filter-name>
<!-- 拦截请求路径 -->
  <url-pattern>/*</url-pattern>
  <dispatcher>REQUEST</dispatcher>
 </filter-mapping>
```

### 拦截器实现

- XssFilter

```java
import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

public class XssFilter implements Filter {

 FilterConfig filterConfig = null;

 public void init(FilterConfig filterConfig) throws ServletException {
  this.filterConfig = filterConfig;
 }

 public void destroy() {
  this.filterConfig = null;
 }

 public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
   throws IOException, ServletException {
  //调用重写后的请求
  chain.doFilter(new XssHttpServletRequestWrapper((HttpServletRequest) request), response);
 }

}
```

- XssHttpServletRequestWrapper.java

```java
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

public class XssHttpServletRequestWrapper extends HttpServletRequestWrapper{


 public XssHttpServletRequestWrapper(HttpServletRequest servletRequest) {
  super(servletRequest);
 }
 
 @Override
 public Map<String, String[]> getParameterMap(){
  
  Set<String> names = super.getParameterMap().keySet();
  Map<String, String[]> parameterMap = new HashMap<String, String[]>(names.size());

  for (String name : names) {
   String [] values = getParameterValues(name);
   String [] newValues = new String [values.length];
   for(int i=0;i<values.length;i++) {
    newValues[i] = cleanXSS(values[i]);
   }
   parameterMap.put(name, newValues);
   values = null;
   newValues = null;
  }
  return parameterMap;
 }

 /**
  * 重写getParameterValues方法
  */
 @Override
 public String[] getParameterValues(String parameter) {
  String[] values = super.getParameterValues(parameter);
  // 如果参数为空那就直接返回空
  if (values == null) {
   return null;
  }
  //如果不为空，那就获取参数的长度
  int count = values.length;
  String[] encodedValues = new String[count];
  //将每个参数的值都进行过滤
  for (int i = 0; i < count; i++) {
   encodedValues[i] = cleanXSS(values[i]);
  }
  return encodedValues;
 }
 /**
  * 重写getParameter
  */
 @Override
 public String getParameter(String parameter) {
  String value = super.getParameter(parameter);
  //如果为空返回空
  if (value == null) {
   return null;
  }
  //不为空返回过滤后的
  return cleanXSS(value);
 }
 /**
  * 重写getHeader
  */
 @Override
 public String getHeader(String name) {
  //如果为空返回空
  String value = super.getHeader(name);
  if (value == null)
   return null;
  //不为空返回过滤后的
  return cleanXSS(value);
 }
 /**
  * 过滤
  * @param value
  * @return
  */
 private String cleanXSS(String value) {
  String inj_str = "\" ) \' \\* % < > &";
  String inj_stra[] = inj_str.split(" ");
  
  for (int i = 0; i < inj_stra.length; i++) {
   value = value.replaceAll("[" + inj_stra[i] + "]", "");
  }
  String badStr = "and exec execute insert select delete update count drop chr mid master truncate " +
    "char declare sitename net user xp_cmdshell or like and exec execute insert create drop " +
    "table from grant use group_concat column_name " +
    "information_schema.columns table_schema union where select delete update order by count " +
    "chr mid master truncate char declare or like";//过滤掉的sql关键字，可以手动添加
  String badStrs[] = badStr.split(" ");
  for (int i = 0; i < badStrs.length; i++) {
   value = value.replaceAll(badStrs[i].toLowerCase(), "");
   value = value.replaceAll(badStrs[i].toUpperCase(), "");
  }

  value = value.replaceAll("<", "& lt;").replaceAll(">", "& gt;");
  value = value.replaceAll("\\(", "& #40;").replaceAll("\\)", "& #41;");
  value = value.replaceAll("'", "& #39;");
  value = value.replaceAll("eval\\((.*)\\)", "");
  value = value.replaceAll("[\\\"\\\'][\\s]*javascript:(.*)[\\\"\\\']", "\"\"");
  value = value.replaceAll("script", "");
  value = value.replaceAll("iframe", "");
  value = value.replaceAll("img", "");

  return value;
 }
}
```


ps: 这里也包含了 SQL 注入的过滤。

# 绕过的方式

## 大小写

这个绕过方式的出现是因为网站仅仅只过滤了 `<script>` 标签，而没有考虑标签中的大小写并不影响浏览器的解释所致。

具体的方式就像这样：

```
http://192.168.1.102/xss/example2.php?name=<sCript>alert("hey!")</scRipt>
```

## 利用过滤后返回语句再次构成攻击语句来绕过


这个字面上不是很好理解，用实例来说。

如下图，在这个例子中我们直接敲入script标签发现返回的网页代码中script标签被去除了，但其余的内容并没有改变。

```
http://192.168.1.102/xss/example3.php?name=<sCri<script>pt>alert("hey!")</scRi</script>pt>
```

ps: 这其实是一个非常巧妙的方式，当然我们后续会统一给出解决方案。

## 并不是只有script标签才可以插入代码


在这个例子中，我们尝试了前面两种方法都没能成功，原因在于script标签已经被完全过滤，但不要方，能植入脚本代码的不止script标签。

例如这里我们用 `<img>` 标签做一个示范。

```
http://192.168.1.102/xss/example4.php?name=<img
src='w.123' onerror='alert("hey!")'>
```

就可以再次愉快的弹窗。

原因很简单，我们指定的图片地址根本不存在也就是一定会发生错误，这时候onerror里面的代码自然就得到了执行。

以下列举几个常用的可插入代码的标签。

```xml
<a onmousemove=’do something here’> 
```

当用户鼠标移动时即可运行代码

```xml
<div onmouseover=‘do something here’> 
```

## 编码脚本代码绕过关键字过滤

有的时候，服务器往往会对代码中的关键字（如alert）进行过滤，这个时候我们可以尝试将关键字进行编码后再插入，不过直接显示编码是不能被浏览器执行的，我们可以用另一个语句eval（）来实现。

eval()会将编码过的语句解码后再执行，简直太贴心了。

例如alert(1)编码过后就是

```
\u0061\u006c\u0065\u0072\u0074(1)
```

攻击语句：

```
http://192.168.1.102/xss/example5.php?name=<script>eval(\u0061\u006c\u0065\u0072\u0074(1))</script>
```

# 解决方案

## 思考

如果去穷举各种各样的 Onxxx 函数肯定是不现实的。

我们只需要处理最核心的 `<` `>` 之类的特殊字符即可。

这样实现就可以变得非常简单。

## 实现

- 配置拦截器

```java
import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

@WebFilter(urlPatterns = "/*")
public class XssFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        filterChain.doFilter(new XssFilterWrapper((HttpServletRequest) servletRequest), servletResponse);
    }

    @Override
    public void destroy() {

    }
}
```


XssFilterWrapper 实现如下：

```java
import org.apache.commons.lang.StringUtils;
import org.springframework.web.util.HtmlUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

public class XssFilterWrapper extends HttpServletRequestWrapper {
    public XssFilterWrapper(HttpServletRequest request) {
        super(request);
    }
    /**
     * 对数组参数进行特殊字符过滤
     */
    @Override
    public String[] getParameterValues(String name) {
        String[] values = super.getParameterValues(name);
        String[] newValues = new String[values.length];
        for (int i = 0; i < values.length; i++) {
            newValues[i] = HtmlUtils.htmlEscape(values[i]);
        }
        return newValues;
    }

    @Override
    public String getParameter(String name) {
        String value = super.getParameter(name);
        if (StringUtils.isNotBlank(value)) {
            return HtmlUtils.htmlEscape(value);
        }
        return value;
    }
}
```

非常的简单粗暴，就是一个过滤。

# 拓展阅读 

[web 安全系列]()

# 参考资料

[浅谈XSS攻击的那些事（附常用绕过姿势）](https://zhuanlan.zhihu.com/p/26177815)

[Java使用过滤器防止SQL注入XSS脚本注入的实现](https://www.jb51.net/article/203904.htm)

[06_JavaWeb项目防止xss漏洞攻击解决办法](https://www.jianshu.com/p/8c11901a9778)

[java解决xss问题](https://www.cnblogs.com/mrsans/articles/11730333.html)

https://www.pianshen.com/article/8324902448/

[Java拦截器处理XSS漏洞](https://blog.csdn.net/qq_41466891/article/details/102842889)

[java 拦截器解决xss攻击](https://www.cnblogs.com/0201zcr/p/13143165.html)

[Java中使用Springmvc拦截器拦截XSS攻击（XSS拦截）](https://blog.csdn.net/starry7953810/article/details/79850865)

* any list
{:toc}