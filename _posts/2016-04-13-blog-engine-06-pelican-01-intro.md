---
layout: post
title: blog-engine-06-pelican 静态网站生成 支持 markdown 和 reST 语法
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

# Pelican 是什么？

Pelican 是一个使用 Python 编写的静态博客生成器。想象一下，如果你有一个智能助手，你只需要告诉它你的想法，它就能帮你整理成漂亮的文章，甚至还能自动发布到网上，这个智能助手就是 Pelican。

## Pelican 的特点

1. **静态生成**  
   Pelican 生成的是静态网页，这意味着速度快，安全性高。

2. **Markdown 写作**  
   使用 Markdown 语法来写作，简洁高效，让你更专注于内容。

3. **丰富的主题**  
   Pelican 社区提供了很多美观的主题，你可以挑选一个你喜欢的。

4. **插件系统**  
   通过插件，你可以扩展 Pelican 的功能，比如增加文章摘要、分类、标签等。

5. **部署简单**  
   生成的静态文件可以轻松部署到 GitHub Pages、FTP、CDN 等多种平台上。

# 如何安装 Pelican？

1. **安装 Python**  
   Pelican 是基于 Python 的，所以首先需要在你的电脑上安装 Python。

2. **安装 Pelican**  
   打开终端或命令提示符，输入以下命令安装 Pelican：
   
   ```shell
   pip install pelican
   ```

3. **创建新博客**  
   使用以下命令创建一个新的 Pelican 博客：
   
   ```shell
   pelican-quickstart
   ```
   
   按照提示设置你的博客信息。

# 如何使用 Pelican？

1. **编写文章**  
   在博客的 `content` 目录下创建 Markdown 文件，就可以开始写文章了。

2. **本地预览**  
   输入以下命令启动本地服务器：
   
   ```shell
   pelican --listen
   ```
   
   然后在浏览器中输入 `http://localhost:8000`，就可以实时预览你的博客了。

3. **生成静态文件**  
   当你的文章写好后，使用以下命令生成静态网页：
   
   ```shell
   pelican
   ```
   
   这会在 `output` 目录下生成静态文件。

4. **发布博客**  
   将 `output` 目录下的文件部署到你选择的平台上，你的博客就上线了。

5. **选择主题和插件**  
   Pelican 有很多免费的主题和插件，你可以挑选你喜欢的，按照文档说明进行安装和配置。

# Pelican 的优缺点

## 优点

- **静态网站**  
   静态网站加载速度快，安全性高。

- **写作体验好**  
   Markdown 写作简洁高效，让你更专注于内容。

- **社区支持**  
   Pelican 有一个活跃的社区，你可以找到大量的教程和帮助。

- **高度可定制**  
   通过主题和插件，你可以高度定制你的博客。

## Pelican 的不足

- **静态网站**  
   由于 Pelican 生成的是静态网站，所以不支持动态网站的功能，如用户注册、登录等。

- **学习曲线**  
   Pelican 的配置和主题定制可能需要一定的学习成本。

如果你喜欢写作，想要一个简单、安全的平台来分享你的想法，Pelican 是一个不错的选择。

---------------------------------------------------------------------------------------------------------------------------------------

# pelican

[Pelican](https://github.com/getpelican/pelican)  是一个静态网站生成器，用Python编写，它允许您通过编写Markdown、reStructuredText和HTML等格式的文本文件来创建网站。

使用Pelican，您可以创建网站而无需担心数据库或服务器端编程。Pelican生成可以通过任何网络服务器或托管服务提供的静态站点。

您可以使用Pelican执行以下功能：

- 使用您选择的编辑器在Markdown或reStructuredText中编写内容

- 简单的命令行工具重新生成HTML、CSS和JS源内容

- 易于与版本控制系统和Web挂钩进行接口

- 完全静态的输出可以简单地托管在任何地方

## 功能特点

Pelican的功能亮点包括：

- 时间排序的内容（例如，文章、博客文章）以及静态页面

- 与外部服务的集成

- 站点主题（使用Jinja2模板创建）

- 在多种语言中发布文章

- 生成Atom和RSS订阅源

- 通过Pygments进行代码语法高亮显示

- 从WordPress、Dotclear或RSS订阅源导入现有内容

- 由于内容缓存和选择性输出编写，重建速度快

- 可通过丰富的插件生态系统进行扩展：Pelican插件

查看 [Pelican 文档](https://docs.getpelican.com/en/latest/) 以获取更多信息。

## 为什么叫“Pelican”？

“Pelican”是“calepin”的一个变位词，法语中意为“笔记本”。

# Pelican主题

该存储库包含了用于Pelican的主题。请随意克隆、添加您自己的主题，并提交拉取请求。这是由社区管理的！

您可以在 http://www.pelicanthemes.com 查看实时版本。

## 使用主题

以下说明假定您已经阅读了所有Pelican文档，有一个工作站点，并且现在想要应用一个非默认主题。

首先，选择一个位置来存放您的主题。对于这个示例，我们将使用目录~/pelican-themes，但您的目录可能不同。

在您的本地机器上将pelican-themes存储库克隆到该位置：

```sh
git clone --recursive https://github.com/getpelican/pelican-themes ~/pelican-themes
```

现在您应该在 `~/pelican-themes/` 下存储您的 pelican-themes 存储库。

要使用其中一个主题，请编辑您的Pelican设置文件以包含以下行：

```
THEME = "/home/user/pelican-themes/theme-name"
```

所以，例如，要使用mnmlist主题，您将编辑您的设置文件以包含：

```
THEME = "/home/user/pelican-themes/mnmlist"
```

保存对设置文件的更改，然后使用您已经设置的 `pelican-quickstart Makefile` 重新生成您的站点：

```sh
make html
```

也可以通过-pelican命令的 `-t ~/pelican-themes/theme-name` 参数直接指定主题。

如果您想要编辑您的主题，请确保您所做的任何编辑都是针对存储在~/pelican-themes/theme-name中的副本进行的。

对于存储在站点输出目录中的文件所做的任何更改都将在下次生成站点时被删除。


# Pelican插件

重要提示：我们正在将插件从这个单一的存储库迁移到它们自己的独立存储库，这些存储库位于新的Pelican插件组织下，这是一个供插件作者与Pelican维护者和社区其他成员更广泛合作的地方。我们的意图是让所有新组织下的插件都采用新的“命名空间插件”格式，这意味着这些插件可以轻松地通过Pip安装，并且Pelican 4.5+可以立即识别它们——而不必显式启用它们。

这个过渡过程需要一些时间，因此我们感谢您在此期间的耐心等待。如果您想帮助加速这个过渡，以下内容将非常有帮助：

- 如果您在这里找到一个尚未迁移到新组织的插件，请在这个存储库下创建一个新的问题，并说明您想要帮助迁移的插件，之后Pelican维护者将指导您完成此过程。
- 如果您来到这里提交一个拉取请求以添加您的插件，请考虑将您的插件移动到Pelican插件组织下。要开始，请在这个存储库下创建一个新的问题，提供您插件的详细信息，之后Pelican维护者将指导您完成此过程。
- 无论您是创建新插件还是迁移现有插件，请使用提供的Cookiecutter模板生成符合社区约定的脚手架命名空间插件。查看Simple Footnotes存储库，以查看一个已迁移插件的示例。

以下其余信息与传统插件相关，但不适用于Pelican插件组织中的新命名空间插件。

# 如何使用插件

安装和使用这些插件的最简单方法是克隆这个存储库：

```sh
git clone --recursive https://github.com/getpelican/pelican-plugins
```

并在您的设置文件中激活您想要的插件：

```
PLUGIN_PATHS = ['path/to/pelican-plugins']
PLUGINS = ['assets', 'sitemap', 'gravatar']
```

PLUGIN_PATHS可以是相对于您的设置文件的路径，也可以是绝对路径。

或者，如果插件位于可导入的路径中，您可以省略PLUGIN_PATHS并列出它们：

```
PLUGINS = ['assets', 'sitemap', 'gravatar']
```

或者您可以直接导入插件并给出：

```
import my_plugin
PLUGINS = [my_plugin, 'assets']
```

## 插件描述

迁移状态：

(blank)：本地托管插件仍在等待迁移工作。

⚠️：已弃用。可以安全地从此存储库中删除。

❓：由外部维护的插件，不需要从单一存储库显式迁移。迁移工作需要在原始所有者的存储库中进行。

✔️：存储库已迁移到Pelican插件组织。

| 插件                   | 状态 | 描述                                                                                     |
|------------------------|------|------------------------------------------------------------------------------------------|
| Ace Editor             | ❓   | 将默认的<code>替换为在pelicanconf.py上配置的Ace代码编辑器。                               |
| Always modified        |      | 将创建日期元数据复制到修改日期，以便在“最新更新”索引中轻松查找。                           |
| AsciiDoc reader        |      | 使用AsciiDoc编写您的帖子。                                                                |
| Asset management       | ✔   | 使用Webassets模块管理资产，如CSS和JS文件。                                                   |
| Author images          |      | 添加对作者图片和头像的支持。                                                               |
| Auto Pages             |      | 为生成的作者、分类和标签页面生成自定义内容（例如作者传记）。                                  |
| Backref Translate      | ❓   | 为每篇文章/页面（作为翻译的一部分）添加一个新属性（is_translation_of），指向原始文章/页面。     |
| Better code samples    | ❓   | 使用div > .hilitewrapper > .codehilitetable类属性包装表格块，允许滚动代码块。                |
| Better code line numbers |    | 允许带有行号的代码块换行。                                                                 |
| Better figures/samples |      | 为内容中的任何<img>标签添加style="width: ???px; height: auto;"属性。                         |
| Better tables          |      | 删除reST生成的HTML表中的多余属性和元素。                                                    |
| bootstrap-rst          |      | 提供大多数（尽管不是全部）Bootstrap的rst指令。                                              |
| bootstrapify           | ❓   | 自动将bootstrap的默认类添加到您的内容中。                                                   |
| Category meta          |      | 从该类别目录中的索引文件读取每个类别的元数据。                                               |
| Category Order         | ❓   | 按照该类别（或标签）中的文章数量对类别（或标签）进行排序。                                     |
| CJK auto spacing       | ❓   | 在中文/日文/韩文字符和英文单词之间插入空格。                                                  |
| Clean summary          |      | 清除摘要中多余的图像。                                                                     |
| Code include           |      | 在reStructuredText中包含Pygments突出显示的代码。                                               |
| Collate content        |      | 将内容的类别作为列表通过collations属性提供给模板。                                              |
| Creole reader          |      | 使用wikicreole语法编写您的帖子。                                                           |
| CSS HTML JS Minify     |      | 在站点生成后，对所有CSS、HTML和JavaScript文件进行最小化。                                        |
| CTags generator        |      | 生成一个“tags”文件，按照“content/”目录中的CTags，以提供对支持它的代码编辑器的自动完成。         |
| Custom article URLs    |      | 支持为不同的类别定义不同的默认URL。                                                          |
| Dateish                |      | 将任意元数据字段视为datetime对象。                                                         |
| Dead Links             | ❓   | 管理失效的链接（网站不可用，错误如403、404）。                                                  |
| Disqus static comments |      | 向所有文章添加disqus_comments属性。评论在生成时使用disqus API获取。                            |
| Encrypt content        | ❓   | 为页面和文章设置密码保护。                                                                 |
| Events                 |      | 将事件开始、持续时间和位置信息添加到帖子元数据中，以生成iCalendar文件。                         |
| Extract table of content |    | 从文章内容中提取目录（ToC）。                                                                |
| Feed summary           | ⚠️  | 允许将文章摘要用于ATOM和RSS订阅源，而不是整篇文章。                                               |
| Figure References      | ❓   | 提供一个系统来编号和引用图像。                                                               |
| Filetime from Git      |      | 使用Git提交确定页面日期。                                                                   |
| Filetime from Hg       |      | 使用Mercurial提交确定页面日期。                                                              |
| Footer Insert          |      | 在每篇文章的末尾添加标准化的页脚（例如作者信息）。                                               |
| GA Page View           | ❓   | 在个别文章和页面上显示Google Analytics页面视图。                                                 |
| Gallery                |      | 允许一篇文章包含一个相册。                                                                 |
| Gist directive         |      | 此插件添加了一个gist reStructuredText指令。                                                   |
| GitHub wiki            |      | 将平面的github wiki转换为结构化的只读wiki，放在您的站点上。                                       |
| GitHub activity        |      | 在模板方面，您只需迭代github_activity变量。                                                    |
| Global license         |      | 允许您定义一个LICENSE设置，并将该许可变量的内容添加到文章的上下文中。                             |
| Glossary               |      | 添加包含从文章和页面中的定义列表中提取的定义的变量。此变量对所有页面模板可见。                      |
| Goodreads activity     |      | 列出您的Goodreads书架上的书籍。                                                             |
| GooglePlus comments    |      | 向Pelican添加GooglePlus评论。                                                                |
| Gravatar               | ✔   | 此插件的功能已由更新的Avatar插件取代。                                                          |
| Gzip cache             |      | 启用某些网络服务器（例如Nginx）使用gzip压缩文件的静态缓存，以防止在HTTP调用期间服务器对文件进行压缩。    |
| Headerid               |      | 此插件为每个标题添加一个锚点，以便您可以在reStructuredText文章中进行深度链接。                        |
| HTML entities          |      | 允许您在RST文档中内联输入HTML实体，如&copy;、&lt;、&#149;。                                        |
| HTML tags for rST      |      | 允许您在reST文档中使用HTML标签。                                                             |
| I18N Sub-sites         |      | 通过为默认站点创建国际化子站点来扩展翻


# 参考资料

https://github.com/getpelican/pelican

* any list
{:toc}