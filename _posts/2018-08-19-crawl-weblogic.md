---
layout: post
title: Crawl WebMagic 爬虫入门使用简介 webmagic
date:  2018-08-19 11:02:05 +0800
categories: [Tool]
tags: [crawl, tool, web, java, sh]
published: true
---

# WebMagic

[WebMagic](https://github.com/code4craft/webmagic) 是一个可扩展的网络爬虫框架。

它涵盖了爬虫的整个生命周期：下载、URL 管理、内容提取和持久化。

它可以简化特定爬虫的开发过程。


这个框架覆盖了爬虫完整的生命周期，我们可以在其基础上进行处理。

或者参考这种思路，实现自己需要的爬虫工具。

# 快速开始

## maven 引入

```xml
<dependency>
    <groupId>us.codecraft</groupId>
    <artifactId>webmagic-core</artifactId>
    <version>0.7.3</version>
</dependency>
<dependency>
    <groupId>us.codecraft</groupId>
    <artifactId>webmagic-extension</artifactId>
    <version>0.7.3</version>
</dependency>
```

## 入门例子

```java
public class GithubRepoPageProcessor implements PageProcessor {

    private Site site = Site.me().setRetryTimes(3).setSleepTime(1000);

    @Override
    public void process(Page page) {
        page.addTargetRequests(page.getHtml().links().regex("(https://github\\.com/\\w+/\\w+)").all());
        page.putField("author", page.getUrl().regex("https://github\\.com/(\\w+)/.*").toString());
        page.putField("name", page.getHtml().xpath("//h1[@class='public']/strong/a/text()").toString());
        if (page.getResultItems().get("name")==null){
            //skip this page
            page.setSkip(true);
        }
        page.putField("readme", page.getHtml().xpath("//div[@id='readme']/tidyText()"));
    }

    @Override
    public Site getSite() {
        return site;
    }

    public static void main(String[] args) {
        Spider.create(new GithubRepoPageProcessor()).addUrl("https://github.com/code4craft").thread(5).run();
    }
}
```

# 拓展阅读

[基于 webmagic 的 Java 爬虫应用](https://github.com/brianway/webporter)

* any list
{:toc}
