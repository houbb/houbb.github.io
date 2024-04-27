---
layout: post
title: blog-engine-10-middleman 静态站点生成器，利用了现代 Web 开发中的所有快捷方式和工具
date:   2016-04-13 23:20:27 +0800
categories: [UI]
tags: [hexo, blog, blog-engine]
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

好的，咱们来聊聊Middleman，用一种特别接地气的方式。

# Middleman 是什么？

Middleman 是一个基于 Ruby 的静态网站生成器。

## Middleman 的特点

1. **静态网站生成**  
   Middleman 可以生成静态网站，这意味着速度快，安全性高。

2. **模板系统**  
   Middleman 提供了强大的模板系统，你可以很容易地创建和重用页面布局。

3. **前端支持**  
   你可以在 Middleman 中使用各种前端技术，如 Sass、CoffeeScript、JavaScript 等。

4. **数据管理**  
   Middleman 支持从 YAML、JSON、CSV 数据源生成页面。

5. **部署简单**  
   生成的静态文件可以轻松部署到 GitHub Pages、Amazon S3 等多种平台上。

# 如何安装 Middleman？

1. **安装 Ruby**  
   Middleman 是基于 Ruby 的，所以首先需要在你的电脑上安装 Ruby。

2. **安装 Middleman**  
   打开终端或命令提示符，输入以下命令安装 Middleman：
   
   ```shell
   gem install middleman
   ```

3. **创建新网站**  
   使用以下命令创建一个新的 Middleman 网站：
   
   ```shell
   middleman init my-blog
   ```

   这里的 `my-blog` 是你的博客名，可以自定义。

# 如何使用 Middleman？

1. **编写内容**  
   在 `source` 目录下创建 Markdown 或 HTML 文件，就可以开始写内容了。

2. **本地预览**  
   输入以下命令启动本地服务器：
   
   ```shell
   middleman server
   ```
   
   然后在浏览器中输入 `http://localhost:4567`，就可以实时预览你的博客了。

3. **构建网站**  
   当你的内容写好后，使用以下命令构建网站：
   
   ```shell
   middleman build
   ```
   
   这会在 `build` 目录下生成静态文件。

4. **部署网站**  
   将 `build` 目录下的文件部署到你选择的平台上，你的博客就上线了。

5. **定制主题和扩展**  
   Middleman 允许你通过修改模板和使用扩展来定制你的网站外观和功能。

# Middleman 的优势

- **静态网站**  
   静态网站加载速度快，对服务器的要求低。

- **灵活的模板系统**  
   Middleman 的模板系统非常灵活，方便创建复杂的页面布局。

- **前端支持**  
   Middleman 支持各种前端技术，方便构建现代化的网站。

- **数据管理**  
   Middleman 可以方便地从数据源生成内容，适合创建数据驱动的网站。

# Middleman 的局限

- **Ruby 语言**  
   由于 Middleman 是基于 Ruby 的，因此需要一定的 Ruby 语言基础。

- **社区规模**  
   相比其他一些静态网站生成器，Middleman 的社区规模可能稍小。

如果你熟悉 Ruby，想要一个灵活、强大的平台来构建你的网站，Middleman 是一个非常好的选择。

--------------------------------------------------------------------------------------------------------------------------------------------

# middleman

**Middleman** 是一个静态站点生成器，利用了现代 Web 开发中的所有快捷方式和工具。

请查看 [middlemanapp.com](http://middlemanapp.com/) 获取详细的教程，包括 [入门指南](http://middlemanapp.com/basics/getting-started/)。

## 为什么选择 Middleman？

如今，许多网站都是以 API 为基础构建的。

与其将前端和后端打包在一起，不如分别构建和部署，利用公共 API 从后端获取数据并在前端显示。

静态网站非常快速且需要很少的 RAM。独立部署的前端可以直接部署到云端或 CDN。许多设计师和开发人员简单地向客户提供静态的 HTML/JS/CSS。

- 使用 [Sass](https://sass-lang.com/) 来实现 DRY 样式表。

- 自带资产管道（WebPack、Babel、Sprockets 或其他任何工具）。

- 使用 [ERb](https://ruby-doc.org/stdlib-2.0.0/libdoc/erb/rdoc/ERB.html) 或 [Haml](https://haml.info/) 进行简单的模板化。

**Middleman** 为独立开发者提供了所有这些工具以及许多其他工具。

## 安装

Middleman 基于 Ruby 构建，并使用 RubyGems 包管理器进行安装。

这些通常已预先安装在 Mac OS X 和 Linux 上。

Windows 用户可以使用 [RubyInstaller] 安装这两者。

对于 Windows 用户，还需要安装 [RubyInstaller-Devkit]。

```bash
gem install middleman
```

## 入门指南

安装完 Middleman 后，您将可以访问 `middleman` 命令。

首先，让我们创建一个新项目。在终端中执行：

```bash
middleman init MY_PROJECT
```

这将在 "MY_PROJECT" 目录中创建一个新的 Middleman 项目。该项目包含一个用于配置 Middleman 的 `config.rb` 文件，以及一个用于存储页面、样式表、JavaScript 和图像的 `source` 目录。

切换到新项目的目录，并启动预览服务器：

```bash
cd MY_PROJECT
middleman server
```

预览服务器允许您构建站点，通过修改 `source` 目录中的内容，查看您的更改在浏览器中的反映：`http://localhost:4567/`

要开始，请按照您通常的方式在 `source` 目录中构建 HTML、CSS 和 JavaScript。当您准备好使用更复杂的模板时，只需将模板引擎的扩展名添加到文件中，然后开始以该格式编写。

例如，假设我正在 `source/stylesheets/site.css` 上工作，并且想开始使用 Compass 和 Sass。我会将文件重命名为 `source/stylesheets/site.css.scss`，Middleman 将自动开始处理该文件为 Sass。对于 CoffeeScript（`.js.coffee`）、Haml（`.html.haml`）和任何其他模板引擎，都适用同样的规则。

最后，您会想将项目构建为一个独立站点。从项目目录执行：

```bash
middleman build
```

这将编译您的模板，并输出一个独立站点，可以轻松托管或交付给客户。构建步骤还可以压缩图像，使用 JavaScript 和 CSS 依赖管理，压缩 JavaScript 和 CSS，并运行您选择的其他代码。查看 `config.rb` 文件，了解可以激活的一些常见扩展。

## 了解更多

官方网站上提供了一整套深入的指南，详见：<http://middlemanapp.com>。

此外，最新生成的代码文档可以在 [RubyDoc] 上找到。

## 社区

官方社区论坛位于：<http://forum.middlemanapp.com>

## Bug 报告

我们使用 Github Issues 来管理 bug 报告和功能请求。如果遇到问题，请搜索问题并提交新问题：<https://github.com/middleman/middleman/issues>

获得快速响应和快速修复您的 bug 的最佳方法是提交详细的 bug 报告，包括测试案例，并及时回复开发人员的问题。如果您了解 Ruby，您还可以提交包含 Cucumber 功能的 [Pull Requests](https://help.github.com/articles/using-pull-requests)，描述您的功能应该如何工作或利用您提交的 bug。

## 如何运行 Cucumber 测试

1. 检出存储库：`git clone https://github.com/middleman/middleman.git`
2. 安装 Bundler：`gem install bundler`
3. 在项目根目录内运行 `bundle install` 安装 gem 依赖项。
4. 运行测试案例：`bundle exec rake test`

# 参考资料

https://github.com/middleman/middleman

* any list
{:toc}