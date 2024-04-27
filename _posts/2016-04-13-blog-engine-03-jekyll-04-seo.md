---
layout: post
title:  blog-engine-03-博客引擎 jekyll SEO
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

# SEO 是什么？

好的，咱们来聊聊SEO，用一种特别接地气的方式。

### SEO是啥？

SEO是“搜索引擎优化”的简称，英文全称是Search Engine Optimization。

你可以把它想象成一种“吸引顾客”的技巧，不过这里的“顾客”是搜索引擎，比如百度、谷歌。

### 为什么要做SEO？

1. **让更多人看到你的网站**  
   如果你的网站排在搜索引擎的前几名，那么就会有更多人点击进来。

2. **提高网站的知名度**  
   排名靠前，意味着你的网站在搜索引擎眼中是“权威”的，人们更愿意信任。

3. **带来更多的潜在客户**  
   人们通过搜索关键词找到你的网站，这些关键词很可能就是他们的需求，所以这些访客很可能成为你的客户。

### 怎么做SEO？

1. **关键词研究**  
   找到和你网站内容相关的热门搜索词，这些词就是你的“目标顾客”。

2. **优化网站内容**  
   在你的文章、标题、描述中使用这些关键词，让搜索引擎知道，你的网站和这些词是相关的。

3. **提高网站速度**  
   搜索引擎喜欢加载速度快的网站，这就像是顾客喜欢不用排队的餐厅。

4. **获取高质量的外部链接**  
   如果其他网站链接到你的网站，就像是给你的网站“投票”，搜索引擎会觉得你的网站更可信。

5. **优化网站结构**  
   让网站结构清晰，易于导航，搜索引擎的“爬虫”更容易抓取你的网站内容。

6. **移动友好**  
   现在很多人用手机上网，如果你的网站在手机上看起来一团糟，搜索引擎可不会喜欢。

7. **持续更新内容**  
   定期发布新内容，让搜索引擎觉得你的网站是“活的”，而不是一个“死站”。

### SEO的好处

- **免费流量**  
  通过SEO获得的流量是免费的，比起付费广告，成本更低。

- **长期效果**  
  一旦你的网站排名上去了，只要维护得当，可以长期获得流量。

- **提高品牌知名度**  
  排名靠前，可以提高品牌在潜在客户心中的形象。

### SEO的难点

- **竞争激烈**  
  大家都在做SEO，想排在前面不容易。

- **需要时间**  
  SEO不是一蹴而就的，需要持续优化，耐心等待效果。

- **规则变化**  
  搜索引擎的算法经常变化，需要不断学习新的规则。

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