---
layout: post
title:  blog-engine-02-博客引擎jekyll SEO
date:   2016-04-13 23:20:27 +0800
categories: [Github]
tags: [jekyll, seo, github]
published: true
---

# 拓展阅读

[blog-engine-01-常见博客引擎 jekyll/hugo/Hexo/Pelican/Gatsby/VuePress/Nuxt.js/Middleman 对比](https://houbb.github.io/2016/04/13/blog-engine-01-overview)

[blog-engine-02-通过博客引擎 jekyll 构建 github pages 博客实战笔记](https://houbb.github.io/2016/04/13/blog-engine-02-jekyll-01-install)

[blog-engine-02-博客引擎jekyll-jekyll 博客引擎介绍](https://houbb.github.io/2016/04/13/blog-engine-03-jekyll-02-intro)

[blog-engine-02-博客引擎jekyll-jekyll 如何在 windows 环境安装，官方文档](https://houbb.github.io/2016/04/13/blog-engine-03-jekyll-03-install-on-windows-doc)

[blog-engine-02-博客引擎jekyll-jekyll SEO](https://houbb.github.io/2016/04/13/blog-engine-03-jekyll-04-seo)

[blog-engine-04-博客引擎 hugo intro 入门介绍+安装笔记](https://houbb.github.io/2016/04/13/blog-engine-04-hugo-intro)

[blog-engine-05-博客引擎 Hexo 入门介绍+安装笔记](https://houbb.github.io/2017/03/29/blog-engine-05-hexo)

[blog-engine-06-pelican 静态网站生成 官方文档](https://houbb.github.io/2016/04/13/blog-engine-06-pelican-01-intro)

[blog-engine-06-pelican 静态网站生成 windows 安装实战](https://houbb.github.io/2016/04/13/blog-engine-06-pelican-02-quick-start)

[blog-engine-07-gatsby 建极速网站和应用程序 基于React的最佳框架，具备性能、可扩展性和安全性](https://houbb.github.io/2016/04/13/blog-engine-07-gatsby-01-intro)

[blog-engine-08-vuepress 以 Markdown 为中心的静态网站生成器](https://houbb.github.io/2016/04/13/blog-engine-08-vuepress-01-intro)

[blog-engine-09-nuxt 构建快速、SEO友好和可扩展的Web应用程序变得轻松](https://houbb.github.io/2016/04/13/blog-engine-09-nuxt-01-intro)

[blog-engine-10-middleman 静态站点生成器，利用了现代 Web 开发中的所有快捷方式和工具](https://houbb.github.io/2016/04/13/blog-engine-10-middleman-01-intro)

# 前言

由于个人一直喜欢使用 markdown 来写 [个人博客](https://houbb.github.io/)，最近就整理了一下有哪些博客引擎。

感兴趣的小伙伴也可以选择自己合适的。
# google/baidu 收录

- 查看

```
site:https://houbb.github.io/
```

如果提示说：找不到和您查询的“site:https://houbb.github.io/”相符的内容或信息，说明未被收录。

如果搜索结果中你第一眼就看到了你的博客站点，说明已被收录，不用再继续看下面的内容了。

# 博客书写规范和心德

写了大概3年多的博客，回首看收获了很多。

为了以后博客的更好管理，规定如下标准。

## 标题标准

时间：2022-05-29

发现 search 无法工作，debug 发现标题如果出现 `"`，会导致 json 的解析失败。

## url

统一采用:

```
yyyy-MM-dd-${category}-${order}-name-${order}.md
```

所有名称统一使用小写的形式。

所有同一个类型的博客，放在一起形成一个系列。

除非确定一定不会扩展的内容，建议还是学习所有的知识都是从 00-overview 开始。

## tag

常见的 tag 规定如下：

```
overview  概览
quick-start 快速开始
why-so-fast 为什么速度这么快
why-choose 为什么选择这个技术
project-architecture 项目架构
in-action 实战
summary 总结
sh 新知识(stay-hungry)
sf 旧知识(stay-foolish)
```

技术分类则根据实际需要


## 一遍文章的行文

作为技术文章，建议有以下几个部分：

1. 开篇：介绍技术的背景，实际的业务场景

2. 概念理论：

3. 实战测试：

4. 拓展发散：

5. 总结归纳：




* any list
{:toc}