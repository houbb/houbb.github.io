---
layout: post
title: Java Servlet 教程-16-Servlet 国际化 i18n
date:  2018-10-06 13:21:56 +0800
categories: [Java]
tags: [web, servlet, java, sh]
published: true
excerpt: Java Servlet 教程-16-Servlet 国际化 i18n
---

# 国际化

## 常见术语 

在我们开始之前，先来看看三个术语：

- 国际化（i18n）

这意味着一个网站提供了不同版本的翻译成访问者的语言或国籍的内容。

- 本地化（l10n）

这意味着向网站添加资源，以使其适应特定的地理或文化区域，例如网站翻译成印地文（Hindi）。

- 区域设置（locale）

这是一个特殊的文化或地理区域。它通常指语言符号后跟一个下划线和一个国家符号。

## 区域设置

例如 "en_US" 表示针对 US 的英语区域设置。

当建立一个全球性的网站时有一些注意事项。本教程不会讲解这些注意事项的完整细节，但它会通过一个很好的实例向您演示如何通过差异化定位（即区域设置）来让网页以不同语言呈现。

完整信息可以自行 google，比如 [i18n(国际化) 和l18n(本地化)时的地域标识代码](https://www.cnblogs.com/isdom/p/webclips009.html)

## servlet 获取 Local 信息

Servlet 可以根据请求者的区域设置拾取相应版本的网站，并根据当地的语言、文化和需求提供相应的网站版本。

以下是 request 对象中返回 Locale 对象的方法。

```java
java.util.Locale request.getLocale() 
```

## 检测区域设置

下面列出了重要的区域设置方法，您可以使用它们来检测请求者的地理位置、语言和区域设置。

下面所有的方法都显示了请求者浏览器中设置的国家名称和语言名称。

| 序号 | 方法 | 描述 |
|:---|:---|:---|
| 1 | getCountry() | 该方法以 2 个大写字母形式的 ISO 3166 格式返回该区域设置的国家/地区代码 |
| 2 | getDisplayCountry() | 该方法返回适合向用户显示的区域设置的国家的名称 |
| 1 | getLanguage() | 该方法以小写字母形式的 ISO 639 格式返回该区域设置的语言代码 |
| 1 | getDisplayLanguage() | 该方法返回适合向用户显示的区域设置的语言的名称 |
| 1 | getISO3Country() | 该方法返回该区域设置的国家的三个字母缩写 |
| 1 | getISO3Language() | 该方法返回该区域设置的语言的三个字母的缩写 |

# 实战代码

## 方法测试

- I18nMethodServlet.java

测试 Local 常见的方法。

```java
@WebServlet("/i18n/method")
public class I18nMethodServlet extends HttpServlet {

    private static final long serialVersionUID = -3141800062532020317L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 设置编码
        resp.setContentType("text/plain;charset=UTF-8");
        resp.setCharacterEncoding("UTF-8");

        // 获取客户端的区域设置
        Locale locale = req.getLocale();

        PrintWriter printWriter = resp.getWriter();
        printWriter.println("getCountry:    " + locale.getCountry());
        printWriter.println("getDisplayCountry: " + locale.getDisplayCountry());
        printWriter.println("getLanguage: " + locale.getLanguage());
        printWriter.println("getDisplayLanguage: " + locale.getDisplayLanguage());
        printWriter.println("getISO3Country: " + locale.getISO3Country());
        printWriter.println("getISO3Language: " + locale.getISO3Language());
    }
}
```

- 测试

浏览器访问 [http://localhost:8081/i18n/method](http://localhost:8081/18n/method)，页面内容如下：

```
getCountry:    CN
getDisplayCountry: 中国
getLanguage: zh
getDisplayLanguage: 中文
getISO3Country: CHN
getISO3Language: zho
```

## 指定国际化国家

- 代码

```java
@WebServlet("/i18n/spanish")
public class I18nSpanishServlet extends HttpServlet {

    private static final long serialVersionUID = 5306996735449856747L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        // 设置响应内容类型
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();

        // 设置西班牙语言代码
        resp.setHeader("Content-Language", "es");

        out.println("En Espa&ntilde;ol:");
        out.println("&iexcl;Hola Mundo!");
    }
}
```

- 测试

浏览器访问 [http://localhost:8081/i18n/spanish](http://localhost:8081/18n/spanish)，页面内容如下：

```
En Español: ¡Hola Mundo!
```

# 小结

当然了 web 中的 i18n 大都和 spring 结合，只需要在配置文件中写一下就好了。

但是原理还是这些东西。

# 参考资料

http://www.runoob.com/servlet/servlet-internationalization.html

[国际化与本地化](https://zh.wikipedia.org/wiki/%E5%9B%BD%E9%99%85%E5%8C%96%E4%B8%8E%E6%9C%AC%E5%9C%B0%E5%8C%96)

* any list
{:toc}