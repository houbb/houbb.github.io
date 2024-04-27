---
layout: post
title: blog-engine-07-gatsby  建极速网站和应用程序 基于React的最佳框架，具备性能、可扩展性和安全性。
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

# Gatsby 是什么？

Gatsby 是一个基于 React 的静态网站生成器。

## Gatsby 的特点

1. **基于 React**  
   Gatsby 使用 React 作为其核心库，这意味着你可以利用 React 的强大生态系统来构建你的网站。

2. **静态生成**  
   Gatsby 生成的是静态网页，这意味着速度快，安全性高。

3. **丰富的插件**  
   Gatsby 有一个庞大的插件生态系统，可以帮助你添加各种功能，比如数据抓取、SEO 优化等。

4. **部署简单**  
   生成的静态文件可以轻松部署到 Netlify、Vercel 等现代静态网站托管服务。

5. **现代化的开发体验**  
   Gatsby 提供了现代化的开发工具和最佳实践，比如 GraphQL、Webpack 等。

# 如何安装 Gatsby？

1. **安装 Node.js**  
   因为 Gatsby 是基于 Node.js 的，所以首先需要在你的电脑上安装 Node.js。

2. **安装 Gatsby CLI**  
   打开终端或命令提示符，输入以下命令安装 Gatsby 的命令行工具：
   
   ```shell
   npm install -g gatsby-cli
   ```

3. **创建新网站**  
   使用以下命令创建一个新的 Gatsby 网站：
   
   ```shell
   gatsby new my-blog
   cd my-blog
   ```

   这里的 `my-blog` 是你的博客名，可以自定义。

# 如何使用 Gatsby？

1. **编写页面**  
   在博客的 `src/pages` 目录下创建 React 组件，就可以开始创建页面了。

2. **本地开发**  
   输入以下命令启动本地开发服务器：
   
   ```shell
   gatsby develop
   ```
   
   然后在浏览器中输入 `http://localhost:8000`，就可以实时预览你的博客了。

3. **生成静态文件**  
   当你的页面开发完成后，使用以下命令生成静态网页：
   
   ```shell
   gatsby build
   ```
   
   这会在 `public` 目录下生成静态文件。

4. **部署网站**  
   将 `public` 目录下的文件部署到你选择的静态网站托管服务上，你的博客就上线了。

5. **使用插件**  
   Gatsby 的强大之处在于其插件系统，你可以通过插件来添加各种功能，比如从 Markdown 文件生成博客文章，或者从外部 API 获取数据。

# Gatsby 优缺点

## 优点 

- **现代化**  
   Gatsby 结合了 React、GraphQL 等现代技术，提供了一个非常现代化的开发体验。

- **性能**  
   Gatsby 生成的静态网站加载速度快，性能出色。

- **社区活跃**  
   Gatsby 有一个非常活跃的社区，你可以找到大量的教程和帮助。

- **可扩展性**  
   通过插件和主题，你可以轻松扩展 Gatsby 的功能。

## 不足

- **学习曲线**  
   对于没有 React 经验的开发者来说，可能需要一些时间来学习和熟悉。

- **配置复杂性**  
   Gatsby 的配置和插件系统可能对新手来说有些复杂。

------------------------------------------------------------------------------------------------------------------------------------------------------

# Gatsby

Gatsby 是一个基于React的免费开源框架，它帮助开发者构建极速网站和应用程序。

它结合了动态渲染站点的控制性和可扩展性以及静态站点生成的速度，创造了全新的网络可能性。

Gatsby帮助专业开发者高效创建可维护、高性能、内容丰富的网站。

从任何地方加载数据。Gatsby可以从任何数据源获取数据，无论是Markdown文件、像Contentful或WordPress这样的无头CMS，还是REST或GraphQL API。使用源插件加载数据，然后使用Gatsby的统一GraphQL接口进行开发。

超越静态网站。享受静态网站的所有优势，但没有任何限制。Gatsby站点是完全功能的React应用程序，因此您可以创建高质量的动态Web应用程序，从博客到电子商务网站再到用户仪表板。

选择您的渲染选项。除了静态站点生成（SSG）之外，您还可以根据页面选择替代渲染选项，即延迟静态生成（DSG）和服务器端渲染（SSR）。这种粒度控制使您能够在不牺牲一个方面的情况下优化性能和生产力。

性能已经内置。默认情况下通过性能审核。Gatsby自动进行代码拆分、图像优化、内联关键样式、懒加载、预取资源等操作，以确保您的站点快速运行，无需手动调整。

为每个站点使用现代技术栈。无论数据来自何处，Gatsby站点都是使用React和GraphQL构建的。为您和您的团队构建统一的工作流程，无论数据来自相同的后端还是不同的后端。

以分母为单位大规模托管。Gatsby站点不需要服务器，因此您可以将整个站点托管在CDN上，成本仅为服务器渲染站点的一小部分。许多Gatsby站点可以完全免费托管在Gatsby Cloud和其他类似服务上。

在任何地方使用Gatsby的集中式数据层。使用Gatsby的Valhalla内容中心，您可以将Gatsby的数据层引入任何项目中。通过统一的GraphQL API访问它，用于构建内容站点、电子商务平台以及原生和Web应用程序。

学习如何在您的下一个项目中使用Gatsby。


# 💻 在5分钟内在本地开始使用Gatsby

您可以通过以下四个步骤在本地开发环境上快速启动并运行新的Gatsby站点：

## 初始化一个新项目。

这里需要提前安装 npm.

```sh
npm init gatsby
```

给它命名为"My Gatsby Site"。

配置选项：

```
What would you like to call your site?
√ · My Gatsby Site
What would you like to name the folder where your site will be created?
√ gatsby/ my-gatsby-site
√ Will you be using JavaScript or TypeScript?
· JavaScript
√ Will you be using a CMS?
· No (or I'll add it later)
√ Would you like to install a styling system?
· No (or I'll add it later)
√ Would you like to install additional features with other plugins?
· Add Markdown support (without MDX)
```

以开发模式启动站点。

然后，转到您新站点的目录并启动它：

```
cd my-gatsby-site/
npm run develop
```

打开源代码并开始编辑！

您的站点现在正在 http://localhost:8000 上运行。

在您选择的代码编辑器中打开my-gatsby-site目录并编辑src/pages/index.js。

保存您的更改，浏览器将实时更新！

在这一点上，您已经拥有一个完全功能的Gatsby网站。有关如何自定义Gatsby站点的更多信息，请参阅我们的插件和官方教程。


# 参考资料

https://github.com/getpelican/pelican

* any list
{:toc}