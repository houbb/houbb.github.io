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

# jekyll 是什么？

1. **Jekyll 是什么？**

   Jekyll 是一个静态网站生成器，用 Ruby 语言编写。它可以把文本文件（通常是 Markdown 或 HTML）转换成一个完整的网站。你可以把它想象成一个厨师，把一堆原材料（文本文件）做成一桌丰盛的大餐（网站）。

2. **为什么用 Jekyll？**

   - **简单**：你只需要专注于写作，Jekyll 帮你搞定网站的布局和样式。
   - **快速**：生成的是静态网页，加载速度飞快。
   - **灵活**：你可以自由定制网站的样式和结构。
   - **免费**：Jekyll 本身是开源的，免费使用。

3. **怎么用 Jekyll？**

   - **安装**：在你的电脑上安装 Ruby，然后安装 Jekyll。
   - **写文章**：用 Markdown 格式写文章，Jekyll 会帮你转换成网页。
   - **定制样式**：修改 Jekyll 的模板文件，可以让网站看起来更酷。
   - **发布**：把生成的网站文件上传到服务器，你的网站就上线了。

4. **Jekyll 的缺点**

   - 对新手来说，安装和配置可能会有点复杂。
   - 因为是静态网站，不能实现动态功能，比如用户注册、登录。

5. **Jekyll 适合谁？**

   如果你是一个喜欢写作，但又不想花太多时间折腾网站技术的人，Jekyll 就非常适合你。

总结一下，Jekyll 就像一个贴心的小助手，帮你把写作的内容变成一个漂亮的网站。

# Jekyll 的安装+使用

### 安装Jekyll

1. **安装Ruby**  
   Jekyll是用Ruby写的，所以首先得安装Ruby。Ruby是一个编程语言，安装它，就相当于请来了一个会做网站的大厨。

2. **安装Jekyll**  
   打开终端（在Windows上是命令提示符或PowerShell），输入以下命令安装Jekyll：
   
   ```shell
   gem install jekyll bundler jekyll-feed
   ```
   
   这就像是告诉厨房：“我们需要Jekyll这个工具来做饭。”

3. **创建一个新网站**  
   使用下面的命令创建一个新的Jekyll网站：
   
   ```shell
   jekyll new my-awesome-site
   ```
   
   这里的`my-awesome-site`是你的网站名，你可以换成任何你喜欢的名字。

4. **进入你的网站目录**  
   创建完毕后，用下面的命令进入你的网站目录：
   
   ```shell
   cd my-awesome-site
   ```
   
   这就像是走进了你的厨房。

5. **启动本地服务器**  
   要预览你的网站，输入以下命令：
   
   ```shell
   bundle exec jekyll serve
   ```
   
   这会启动一个本地服务器，让你可以实时查看网站的样子。

6. **打开浏览器**  
   在浏览器中输入`http://localhost:4000`，就能看到你的网站了。

### 使用Jekyll

1. **写文章**  
   Jekyll的文章都是Markdown格式的，你可以在`_posts`目录下创建新的文本文件，比如：
   
   ```shell
   touch _posts/2024-04-27-hello-world.md
   ```
   
   然后打开这个文件，写上你的文章。

2. **定制样式**  
   如果你想要让网站看起来更个性化，可以编辑`_sass`目录下的样式文件，或者修改`_includes`目录下的模板文件。

3. **发布网站**  
   当你准备好将网站发布到互联网上时，可以使用GitHub Pages等服务，将你的网站文件推送到GitHub仓库，然后自动部署。

4. **更新Jekyll**  
   如果你需要更新Jekyll，可以使用以下命令：
   
   ```shell
   gem update jekyll
   ```
-------------------------------------------------------------------------------------------------------------------------------------------------

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