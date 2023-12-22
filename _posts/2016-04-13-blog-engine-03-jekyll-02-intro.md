---
layout: post
title:  blog-engine-02-博客引擎jekyll-jekyll 博客引擎介绍，常见博客引擎 jekyll/hugo/Hexo/Pelican/Gatsby/VuePress/Nuxt.js/Middleman  对比
date:   2016-04-13 23:20:27 +0800
categories: [Github]
tags: [jekyll, seo, github]
published: true
---

# 详细介绍一下 jekyll 博客引擎

Jekyll 是一个简单、轻量级的静态网站生成工具，被广泛用于搭建个人博客、项目文档和小型网站。

它使用 Ruby 编程语言，是由 GitHub 的创始人之一 Tom Preston-Werner 创建的。

Jekyll 的设计理念是将文本内容与样式分离，以便更好地管理和维护网站。

以下是 Jekyll 博客引擎的一些主要特点和组成部分：

1. **静态网站生成：** Jekyll 不同于传统的动态网站，它是一个静态网站生成器。它通过解析文本文件（通常是 Markdown 或 Textile 格式）和 Liquid 模板引擎，生成静态 HTML 页面。

2. **Markdown 支持：** Jekyll 使用 Markdown 作为默认的文本格式，这使得写作更加简单，同时生成的网页也具有良好的可读性。

3. **Liquid 模板引擎：** Liquid 是一个轻量级的模板语言，用于在 Jekyll 中构建动态内容。它允许你插入变量、条件语句、循环等，以便更灵活地定制页面布局和内容展示。

4. **布局和模板：** Jekyll 支持使用布局和模板来定义网站的整体结构和样式。这样可以使网站保持一致的外观，同时方便进行更改。

5. **插件系统：** Jekyll 具有强大的插件系统，可以通过插件扩展其功能。这使得用户可以根据自己的需求添加各种功能，如社交分享、评论系统等。

6. **GitHub Pages 集成：** Jekyll 与 GitHub Pages 高度集成，允许用户在 GitHub 上托管他们的博客。GitHub Pages 支持 Jekyll，并自动构建并托管用户的 Jekyll 网站。

7. **易于部署：** 由于 Jekyll 生成的是静态文件，部署非常简单。你只需将生成的文件上传到任何支持静态文件托管的地方，如 GitHub Pages、Netlify、或自己的服务器。

使用 Jekyll 构建博客的一般步骤包括安装 Jekyll、创建博客项目、编写文章、配置样式和布局，最后生成并部署静态网站。

Jekyll 提供了详细的文档，可以在官方网站（https://jekyllrb.com/）上找到。

# 还有哪些类似的博客引擎？

有许多类似的博客引擎可供选择，每个都有其独特的特点和适用场景。以下是一些类似于 Jekyll 的博客引擎：

1. **Hugo：** Hugo 是一款用 Go 语言编写的静态网站生成器，与 Jekyll 类似，但更快速。它具有简单易用的语法和强大的主题系统。

2. **Hexo：** Hexo 是一个基于 Node.js 的快速、简单的博客框架。它支持使用 Markdown 编写文章，并提供丰富的主题和插件系统。

3. **Pelican：** Pelican 是一个用 Python 编写的静态网站生成器，类似于 Jekyll。它支持使用 reStructuredText 和 Markdown，并具有可扩展的插件系统。

4. **Gatsby：** Gatsby 是一个 React 驱动的静态网站生成器，适用于构建高性能的博客和网站。它使用 GraphQL 查询语言来获取数据，支持各种数据源。

5. **VuePress：** VuePress 是由 Vue.js 驱动的静态网站生成器，适用于编写文档和博客。它简单易用，同时支持使用 Markdown 编写内容。

6. **Nuxt.js：** Nuxt.js 是基于 Vue.js 的通用应用框架，可以用于构建静态生成的博客。它提供了灵活的配置和插件系统。

7. **Middleman：** Middleman 是一个基于 Ruby 的静态站点生成器，类似于 Jekyll。它支持多种模板语言和插件，适用于构建各种类型的静态网站。

这只是其中一小部分博客引擎的代表，每个工具都有其独特的优势和适用场景。选择一个适合自己需求和技术栈的工具是很重要的，可以根据具体的项目要求和个人偏好进行选择。

# 博客引擎的对比表格

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





* any list
{:toc}