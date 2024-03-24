---
layout: post
title:  blog-engine 常见的博客引擎有哪些？jekyll/hugo/Hexo/Pelican/Gatsby/VuePress/Nuxt.js/Middleman 对比
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

## 常见的博客引擎有哪些？

除了 Jekyll、Hugo 和 Hexo，还有许多其他流行的博客引擎可供选择。

以下是一些常见的博客引擎：

1. **WordPress**：WordPress 是最流行的博客引擎之一，它提供了丰富的插件和主题，使用户能够轻松地创建和管理博客。

2. **Ghost**：Ghost 是一个专注于博客的开源平台，它提供了简洁的界面和强大的编辑工具，适合那些追求写作体验的用户。

3. **Pelican**：Pelican 是一个用 Python 编写的静态博客生成器，它使用简单的 Markdown 或 reStructuredText 格式来撰写内容。

4. **Gatsby**：Gatsby 是一个基于 React 的静态网站生成器，它可以用来创建博客和其他类型的静态网站，具有出色的性能和灵活性。

5. **VuePress**：VuePress 是一个由 Vue 驱动的静态网站生成器，它具有简单的配置和强大的插件系统，适合那些熟悉 Vue.js 的用户。

6. **Nuxt.js**：Nuxt.js 是一个基于 Vue.js 的通用应用框架，它可以用来创建静态网站和单页面应用（SPA），具有灵活的路由和组件系统。

7. **Harp**：Harp 是一个用 Node.js 编写的静态网站生成器，它支持使用 Markdown、Jade 和 EJS 等模板语言来创建内容。

8. **Middleman**：Middleman 是一个用 Ruby 编写的静态网站生成器，它支持使用 Haml、Slim 和 Sass 等语言来构建网站。

这些博客引擎各有特点，你可以根据自己的需求和偏好选择最适合的。

## 博客引擎的对比表格

以下是一份对一些常见博客引擎的比较表格。

| 特性/博客引擎   | Jekyll                                      | Hugo                                      | Hexo                                      | Pelican                                   | Gatsby                                    | VuePress                                  | Nuxt.js                                   | Middleman                                 |
| --------------- | ------------------------------------------- | ----------------------------------------- | ----------------------------------------- | ----------------------------------------- | ---------------------------------------- | ---------------------------------------- | ---------------------------------------- | ---------------------------------------- |
| **语言**        | Ruby                                        | Go                                        | Node.js                                   | Python                                    | JavaScript (React)                       | JavaScript (Vue)                         | JavaScript (Vue)                         | Ruby                                     |
| **模板引擎**    | Liquid                                      | Go Templates                              | EJS (Embedded JavaScript)                 | Jinja2                                    | React (JSX)                              | Vue                                      | Vue                                      | ERB (Embedded Ruby)                      |
| **速度**        | 中等                                        | 快速                                      | 中等                                      | 中等                                      | 快速                                     | 快速                                     | 快速                                     | 快速                                     |
| **主题系统**    | 有                                       | 有                                       | 有                                       | 有                                       | 有                                       | 有                                       | 有                                       | 有                                       |
| **插件系统**    | 有                                       | 有                                       | 有                                       | 有                                       | 插件生态较小                            | 插件系统较小                            | 有                                       | 有                                       |
| **社区活跃度**  | 高                                       | 高                                       | 高                                       | 中等                                     | 高                                       | 高                                       | 高                                       | 中等                                     |
| **数据源**      | YAML、JSON、CSV                             | TOML、YAML                                | YAML、JSON                                | reStructuredText、Markdown               | 数据源插件                               | Markdown                                 | Markdown                                 | YAML、JSON                               |
| **构建时间**    | 取决于网站规模和内容量                      | 快速                                      | 取决于网站规模和内容量                    | 取决于网站规模和内容量                    | 快速                                     | 快速                                     | 快速                                     | 取决于网站规模和内容量                    |
| **托管支持**    | GitHub Pages、Netlify、自己的服务器           | GitHub Pages、Netlify、自己的服务器           | GitHub Pages、Netlify、自己的服务器           | GitHub Pages、Netlify、自己的服务器           | Netlify、Vercel、自己的服务器               | GitHub Pages、Netlify、自己的服务器           | GitHub Pages、Netlify、自己的服务器           | GitHub Pages、Netlify、自己的服务器           |
| **适用场景**    | 个人博客、文档                             | 个人博客、文档                             | 个人博客                                  | 个人博客、文档                             | 博客、文档、应用官网                      | 文档、博客                               | 文档、博客                               | 小型网站、博客                            |


# 小结

以下是对各个博客引擎的简单总结：

1. **Jekyll**：
   - 静态网站生成器，使用 Ruby 编写。
   - 简单易用，支持 Markdown 和 Liquid 模板语言。
   - 社区活跃，有丰富的主题和插件可用。

2. **Hugo**：
   - 快速且高效的静态网站生成器，使用 Go 编写。
   - 构建速度快，适合大型网站和博客。
   - 支持 Markdown 和自定义模板，具有灵活的主题系统。

3. **Hexo**：
   - 快速的静态网站生成器，使用 Node.js 编写。
   - 支持 Markdown，使用 EJS 模板语言。
   - 插件丰富，可扩展性强。

4. **WordPress**：
   - 最流行的博客平台之一，使用 PHP 和 MySQL。
   - 功能强大，支持插件和主题定制。
   - 需要服务器支持，适合有一定技术基础的用户。

5. **Ghost**：
   - 简洁的博客平台，使用 Node.js 和 Ember.js。
   - 提供良好的写作体验和编辑工具。
   - 面向写作者和博客专业人士。

6. **Pelican**：
   - Python 编写的静态网站生成器。
   - 使用简单，支持 Markdown 和 reStructuredText。
   - 社区活跃，有各种插件可用。

7. **Gatsby**：
   - 基于 React 的静态网站生成器，使用 GraphQL 查询数据。
   - 具有出色的性能和灵活性，支持 Markdown 和 React 组件。
   - 适合构建高度交互的博客和网站。

8. **VuePress**：
   - 基于 Vue.js 的静态网站生成器，使用 Markdown 和 Vue 组件。
   - 简单易用，支持自定义主题和插件。
   - 适合开发者和技术博客。

下面我们来简单的看一下这些博客引擎。

# 参考资料

* any list
{:toc}