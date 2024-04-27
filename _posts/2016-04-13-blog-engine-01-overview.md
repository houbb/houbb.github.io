---
layout: post
title:  8 大博客引擎 jekyll/hugo/Hexo/Pelican/Gatsby/VuePress/Nuxt.js/Middleman 对比
date:   2016-04-13 23:20:27 +0800
categories: [Github]
tags: [jekyll, seo, github]
published: true
---


# 博客引擎系列

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

由于老马一直喜欢使用 markdown 来写 [个人博客](https://houbb.github.io/)，最近就整理了一下有哪些博客引擎。

感兴趣的小伙伴也可以选择自己合适的。

## 常见的博客引擎有哪些？

我们先简单的看一下常见的博客引擎。

1. **Jekyll**:
   - 介绍：Jekyll 是一个静态站点生成器，使用 Ruby 编写。它将标记语言（如Markdown）转换为静态网页，可以方便地托管在 GitHub Pages 等平台上。
   - 优点：
     - 简单易用，适合用于个人博客、项目文档等小型网站。
     - 社区庞大，有丰富的插件和主题可供选择。
   - 缺点：
     - Ruby 依赖性可能导致一些配置和安装问题。
     - 功能相对较少，对于大型网站可能不够灵活。

2. **Hugo**:
   - 介绍：Hugo 是一款用 Go 语言编写的静态网站生成器，速度快，功能丰富。
   - 优点：
     - 极快的构建速度，适合用于大型网站和项目。
     - 简单易用，文档详尽。
     - 大量的主题和插件可供选择。
   - 缺点：
     - Go 语言的学习曲线可能较陡峭。
     - 社区相对较小，插件生态可能不如其他工具丰富。

3. **Pelican**:
   - 介绍：Pelican 是用 Python 编写的静态网站生成器，类似于 Jekyll。
   - 优点：
     - 使用 Python，因此适合 Python 开发者。
     - 简单易用，有很多可用的主题和插件。
   - 缺点：
     - 社区相对较小，可能不如其他工具那么活跃。
     - 插件生态可能相对较弱。

4. **Gatsby**:
   - 介绍：Gatsby 是一个基于 React 的静态网站生成器，可以使用 React 构建动态网站并将其编译成静态文件。
   - 优点：
     - 强大的生态系统和插件支持，可用于构建各种类型的网站，从个人博客到电子商务网站。
     - 使用 GraphQL 查询数据，灵活性高。
     - 支持服务器端渲染，提供优秀的性能。
   - 缺点：
     - 学习曲线较陡峭，特别是对于不熟悉 React 和 GraphQL 的人来说。
     - 构建时间可能较长，特别是对于较大的网站。

5. **VuePress**:
   - 介绍：VuePress 是一个基于 Vue.js 的静态网站生成器，专注于文档网站的构建。
   - 优点：
     - 使用 Vue.js，易于上手，并且有一个活跃的社区。
     - 专注于文档，提供了一些方便的文档撰写和管理功能。
     - 支持 Vue 组件，可以构建动态内容。
   - 缺点：
     - 功能相对较少，适用范围可能受限于文档网站。

6. **Nuxt.js**:
   - 介绍：Nuxt.js 是一个基于 Vue.js 的通用应用框架，可以用来创建服务器渲染的应用、静态网站等。
   - 优点：
     - 提供了服务器端渲染和静态网站生成功能，适用于各种类型的项目。
     - 基于 Vue.js，易于上手，并且有一个庞大的社区。
     - 支持自动生成路由和代码拆分，提高了性能。
   - 缺点：
     - 学习曲线较陡峭，特别是对于初学者来说。
     - 对于某些项目可能会显得过于复杂。

7. **Middleman**:
   - 介绍：Middleman 是一个基于 Ruby 的静态网站生成器，类似于 Jekyll，但更灵活。
   - 优点：
     - 灵活性高，支持多种模板引擎（ERB、Haml、Slim 等）和 CSS 预处理器（Sass、Less 等）。
     - 插件丰富，社区活跃。
   - 缺点：
     - Ruby 依赖性可能导致一些配置和安装问题。
     - 文档相对较少，可能需要花费一些时间来掌握。

## 博客引擎的对比表格

简单的对比表格：

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

# 入门安装使用

简化后的安装使用方式，感兴趣可以移步文章末尾详细介绍。

1. **Jekyll**:

   - 入门安装：
     - 首先，确保你的系统已经安装了 Ruby 和 RubyGems。
     - 打开命令行工具，运行以下命令安装 Jekyll：
       ```
       gem install jekyll bundler
       ```
   - 使用：
     - 创建一个新的 Jekyll 项目：
       ```
       jekyll new myblog
       ```
     - 进入项目目录：
       ```
       cd myblog
       ```
     - 运行本地服务器以查看网站：
       ```
       bundle exec jekyll serve
       ```
     - 打开浏览器，访问 `http://localhost:4000` 即可查看网站。

2. **Hugo**:

   - 入门安装：
     - 前往 Hugo 的官方网站，下载适合你系统的安装包。
     - 将 Hugo 添加到系统 PATH 中。
   - 使用：
     - 创建一个新的 Hugo 项目：
       ```
       hugo new site mysite
       ```
     - 进入项目目录：
       ```
       cd mysite
       ```
     - 添加一个主题：
       ```
       git submodule add https://github.com/budparr/gohugo-theme-ananke.git themes/ananke
       ```
     - 运行本地服务器以查看网站：
       ```
       hugo server -D
       ```
     - 打开浏览器，访问 `http://localhost:1313` 即可查看网站。

3. **Pelican**:

   - 入门安装：
     - 确保你的系统已经安装了 Python。
     - 打开命令行工具，运行以下命令安装 Pelican：
       ```
       pip install pelican
       ```
   - 使用：
     - 创建一个新的 Pelican 项目：
       ```
       pelican-quickstart
       ```
     - 进入项目目录：
       ```
       cd mysite
       ```
     - 编写文章（使用 Markdown 格式），然后构建网站：
       ```
       pelican content -o output -s pelicanconf.py
       ```
     - 运行本地服务器以查看网站：
       ```
       cd output
       python -m http.server
       ```
     - 打开浏览器，访问 `http://localhost:8000` 即可查看网站。

4. **Gatsby**:

   - 入门安装：
     - 确保你的系统已经安装了 Node.js 和 npm。
     - 打开命令行工具，运行以下命令安装 Gatsby CLI：
       ```
       npm install -g gatsby-cli
       ```
   - 使用：
     - 创建一个新的 Gatsby 项目：
       ```
       gatsby new mysite
       ```
     - 进入项目目录：
       ```
       cd mysite
       ```
     - 运行本地服务器以查看网站：
       ```
       gatsby develop
       ```
     - 打开浏览器，访问 `http://localhost:8000` 即可查看网站。

5. **VuePress**:

   - 入门安装：
     - 确保你的系统已经安装了 Node.js 和 npm。
     - 打开命令行工具，运行以下命令安装 VuePress：
       ```
       npm install -g vuepress
       ```
   - 使用：
     - 创建一个新的 VuePress 项目：
       ```
       mkdir mysite && cd mysite
       npm init -y
       npm install vuepress@next
       ```
     - 创建一个 Markdown 文件，然后运行本地服务器以查看网站：
       ```
       npx vuepress dev
       ```
     - 打开浏览器，访问 `http://localhost:8080` 即可查看网站。

6. **Nuxt.js**:

   - 入门安装：
     - 确保你的系统已经安装了 Node.js 和 npm。
     - 打开命令行工具，运行以下命令安装 Nuxt.js：
       ```
       npx create-nuxt-app mysite
       ```
   - 使用：
     - 进入项目目录：
       ```
       cd mysite
       ```
     - 运行本地服务器以查看网站：
       ```
       npm run dev
       ```
     - 打开浏览器，访问 `http://localhost:3000` 即可查看网站。

7. **Middleman**:

   - 入门安装：
     - 首先，确保你的系统已经安装了 Ruby 和 RubyGems。
     - 打开命令行工具，运行以下命令安装 Middleman：
       ```
       gem install middleman
       ```
   - 使用：
     - 创建一个新的 Middleman 项目：
       ```
       middleman init mysite
       ```
     - 进入项目目录：
       ```
       cd mysite
       ```
     - 运行本地服务器以查看网站：
       ```
       bundle exec middleman server
       ```
     - 打开浏览器，访问 `http://localhost:4567` 即可查看网站。


# 小结

博客引擎的选择还是比较多的，目前个人使用的 jekyll。

后续考虑迁移到 vuepress 等相对现代的引擎上，使用起来也更加方便。

如果你对每一个细节感兴趣，可以查看下面的链接。

点击 `{查看原文}` 获得更好的阅读体验。

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


# 参考资料

* any list
{:toc}