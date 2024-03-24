---
layout: post
title:  blog-engine-02-博客引擎jekyll-jekyll 博客引擎介绍
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


## 快速入门

Jekyll是一个静态网站生成器。

它接受您喜欢的标记语言编写的文本，并使用布局来创建静态网站。

您可以调整网站的外观和感觉、URL、页面上显示的数据等等。

## 先决条件

- Ruby 版本 2.5.0 或更高，包括所有开发标头（使用 `ruby -v` 检查您的 Ruby 版本）

- RubyGems（使用 `gem -v` 检查您的 Gems 版本）

- GCC 和 Make（使用 `gcc -v`、`g++ -v` 和 `make -v` 检查版本）

### 指令

1. 安装所有先决条件。

2. 安装 jekyll 和 bundler gems。

    ```bash
    gem install jekyll bundler
    ```

3. 在 ./myblog 创建一个新的 Jekyll 站点。

    ```bash
    jekyll new myblog
    ```

4. 切换到您的新目录。

    ```bash
    cd myblog
    ```

5. 构建站点并在本地服务器上提供访问。

    ```bash
    bundle exec jekyll serve
    ```

6. 浏览至 http://localhost:4000

如果您使用的是 Ruby 版本 3.0.0 或更高版本，则第 5 步可能会失败。

您可以通过将 webrick 添加到您的依赖项来解决此问题：
```bash
bundle add webrick
```

通过将 --livereload 选项传递给 serve，以便在对源文件进行更改时自动刷新页面：

```bash
bundle exec jekyll serve --livereload
```
如果在此过程中遇到任何错误，请检查是否已安装了所有先决条件。

如果仍然有问题，请参见[Troubleshooting](https://jekyllrb.com/docs/troubleshooting/#configuration-problems)。

根据您的操作系统不同，安装方式有所不同。请查看我们的指南以获取特定于操作系统的说明。


* any list
{:toc}