---
layout: post
title:  Crawl htmlunit 模拟浏览器动态 js 爬虫入门使用简介
date:  2018-08-19 11:02:05 +0800
categories: [Tool]
tags: [crawl, tool, web, java, sh]
published: true
---

# htmlunit

htmlunit 可以认为是一个无界面的浏览器，可以模拟动态 js 加载，这些是 jsoup 这种专注于页面解析的工具做不到的。


# 快速开始

## maven 引入

```xml
<dependency>
    <groupId>net.sourceforge.htmlunit</groupId>
    <artifactId>htmlunit</artifactId>
    <version>2.29</version>
</dependency>
```

## 实例代码

```java
public static void main(String[] args) throws FailingHttpStatusCodeException, MalformedURLException, IOException {
    
    // 屏蔽HtmlUnit等系统 log
    LogFactory.getFactory().setAttribute("org.apache.commons.logging.Log","org.apache.commons.logging.impl.NoOpLog");
    java.util.logging.Logger.getLogger("com.gargoylesoftware").setLevel(Level.OFF);
    java.util.logging.Logger.getLogger("org.apache.http.client").setLevel(Level.OFF);

    String url = "https://bluetata.com/";
    System.out.println("Loading page now-----------------------------------------------: "+url);
    
    // HtmlUnit 模拟浏览器
    WebClient webClient = new WebClient(BrowserVersion.CHROME);
    webClient.getOptions().setJavaScriptEnabled(true);              // 启用JS解释器，默认为true
    webClient.getOptions().setCssEnabled(false);                    // 禁用css支持
    webClient.getOptions().setThrowExceptionOnScriptError(false);   // js运行错误时，是否抛出异常
    webClient.getOptions().setThrowExceptionOnFailingStatusCode(false);
    webClient.getOptions().setTimeout(10 * 1000);                   // 设置连接超时时间
    HtmlPage page = webClient.getPage(url);
    webClient.waitForBackgroundJavaScript(30 * 1000);               // 等待js后台执行30秒

    String pageAsXml = page.asXml();
    
    // Jsoup解析处理
    Document doc = Jsoup.parse(pageAsXml, "https://bluetata.com/");  
    Elements pngs = doc.select("img[src$=.png]");                   // 获取所有图片元素集
    // 此处省略其他操作
    System.out.println(doc.toString());
}
```

## 内存经常 OMM 的问题

这是因为 htmlunit 后台会模拟一个浏览器，这是非常消耗资源的。

所以每次循环使用，记得关闭浏览器。

```java
webClient.close();
```

or

```java
webClient.closeAllWindows();
```

# 参考资料

[[Jsoup] 使用HtmlUnit + Jsoup解析js动态生成的网页](https://blog.csdn.net/dietime1943/article/details/79035779)

[web-client 使用问题](https://www.jianshu.com/p/b75489c09078)

* any list
{:toc}
