---
layout: post
title: blog-engine-05-博客引擎 Hexo 入门介绍+安装笔记 
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

# Hexo 是什么？

Hexo 是一个基于 Node.js 的静态博客生成器。

想象一下，如果你有一个魔法笔记本，你只需要写下你的想法，它就能自动帮你排版、美化，甚至还能发布到互联网上，这个魔法笔记本就是 Hexo。

## Hexo 的特点

1. **简洁高效**  
   Hexo 的配置简单，使用 Markdown 编写文章，让你可以专注于写作。

2. **丰富的主题**  
   Hexo 社区提供了大量免费且美观的主题，你可以轻松地给你的博客换装。

3. **插件系统**  
   Hexo 支持各种插件，可以扩展博客的功能，比如增加搜索、评论、分享等。

4. **部署方便**  
   Hexo 可以部署到 GitHub Pages、Hexo Cloud 等多种平台上，操作简单。

# Hexo 的优缺点

## 优点

- **轻量级**  
   Hexo 生成的是静态网页，加载速度快，对服务器的要求低。

- **社区活跃**  
   Hexo 有一个活跃的社区，你可以找到大量的教程和帮助。

- **跨平台**  
   Hexo 支持 Windows、Mac、Linux 等多种操作系统。

## Hexo 的不足

- **静态网站**  
   由于 Hexo 生成的是静态网站，所以不支持动态网站的功能，如用户注册、登录等。

- **需要一定的技术背景**  
   对于没有编程背景的用户来说，可能需要一些时间来学习和熟悉。


# Windows 安装记录

## 准备工作

-  安装 Node（必须）

官方 [https://nodejs.org/en/](https://nodejs.org/en/) 下载安装即可。

```
node -v
v12.16.2
```

- git 安装

```
git --version
git version 2.24.0.rc1.windows.1
```

- github 申请

## 正式使用

- 安装 hexo

```
npm install -g hexo-cli
```

- 初始化文件夹

```
$ hexo init itbook52.github.io
$ cd itbook52.github.io
```

这个目标文件夹必须为空

生成的文件信息

```
$ ls
_config.yml  db.json  node_modules/  package.json  package-lock.json  scaffolds/  source/  themes/
```

## 修改配置

为了更方便的使用，我们修改一下 `_config.yml` 配置文件。

- 原始内容

```yml
# Hexo Configuration
## Docs: https://hexo.io/docs/configuration.html
## Source: https://github.com/hexojs/hexo/

# Site
title: Hexo
subtitle: ''
description: ''
keywords:
author: John Doe
language: en
timezone: ''

# URL
## If your site is put in a subdirectory, set url as 'http://yoursite.com/child' and root as '/child/'
url: http://yoursite.com
root: /
permalink: :year/:month/:day/:title/
permalink_defaults:
pretty_urls:
  trailing_index: true # Set to false to remove trailing 'index.html' from permalinks
  trailing_html: true # Set to false to remove trailing '.html' from permalinks

# Directory
source_dir: source
public_dir: public
tag_dir: tags
archive_dir: archives
category_dir: categories
code_dir: downloads/code
i18n_dir: :lang
skip_render:

# Writing
new_post_name: :title.md # File name of new posts
default_layout: post
titlecase: false # Transform title into titlecase
external_link:
  enable: true # Open external links in new tab
  field: site # Apply to the whole site
  exclude: ''
filename_case: 0
render_drafts: false
post_asset_folder: false
relative_link: false
future: true
highlight:
  enable: true
  line_number: true
  auto_detect: false
  tab_replace: ''
  wrap: true
  hljs: false

# Home page setting
# path: Root path for your blogs index page. (default = '')
# per_page: Posts displayed per page. (0 = disable pagination)
# order_by: Posts order. (Order by date descending by default)
index_generator:
  path: ''
  per_page: 10
  order_by: -date

# Category & Tag
default_category: uncategorized
category_map:
tag_map:

# Metadata elements
## https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta
meta_generator: true

# Date / Time format
## Hexo uses Moment.js to parse and display date
## You can customize the date format as defined in
## http://momentjs.com/docs/#/displaying/format/
date_format: YYYY-MM-DD
time_format: HH:mm:ss
## Use post's date for updated date unless set in front-matter
use_date_for_updated: false

# Pagination
## Set per_page to 0 to disable pagination
per_page: 10
pagination_dir: page

# Include / Exclude file(s)
## include:/exclude: options only apply to the 'source/' folder
include:
exclude:
ignore:

# Extensions
## Plugins: https://hexo.io/plugins/
## Themes: https://hexo.io/themes/
theme: landscape

# Deployment
## Docs: https://hexo.io/docs/deployment.html
deploy:
  type: ''
```

- 修改后

主要修改以下三个部分的内容：

```yml
title: IT Books
subtitle: the it books
description: 收集常见的 it 书籍，供学习之用
author: ryo
language: zh-CN
timezone: Asia/Shanghai

url: https://itbook52.github.io

deploy:
  type: git
  repo: https://github.com/itbook52/itbook52.github.io.git
  branch: master
```

## 运行

- 新建博客

```
hexo new "helloworld"
```

- 启动

```
hexo server
```

通过 [http://localhost:4000](http://localhost:4000) 可以访问。

## 生成与发布

- 生成静态文件

```
$ hexo generate
```

- 将本地文件与远程进行管理

```
git init
git add *
git commit -m "first commit"
git remote add origin https://github.com/itbook52/itbook52.github.io.git
git push -u origin master
```

- 部署

```
$ hexo deploy
```

报错：

```
ERROR Deployer not found: git
```

执行

```
npm install --save hexo-deployer-git
```

重新执行即可。

# 主题

## 主题列表

[主题](https://github.com/hexojs/hexo/wiki/Themes)

## 推荐主题

[hexo-theme-next](https://notes.iissnan.com/)

[hexo-theme-yilia](http://litten.me/)

## 使用 next 主题

```
$ pwd
D:\_github\itbook52.github.io
```

在 blog 的 themes 目录下，下载 next 主题。

```
$ git clone https://github.com/theme-next/hexo-theme-next themes/next
```

将主题直接下载到对应的 themes\next 目录下。

## 配置 _config.yml

配置主题为 next

```
theme: next
```

## 启动

- 清空历史数据

```
hexo clean
```

- 启动服务

```
hexo server
```

再次访问即可 [http://localhost:4000/](http://localhost:4000/)

# 添加本地搜索

## 安装

安装 hexo-generator-searchdb，在站点的根目录下执行以下命令：

```
npm install hexo-generator-searchdb --save
```

## 编辑配置

编辑站点配置文件，新增以下内容到任意位置：

```yml
search:
  path: search.xml
  field: post
  format: html
  limit: 10000
```

## 编辑主题配置文件

启用本地搜索功能：

```yml
# Local search
local_search:
  enable: true
```

# 报错

```
INFO  Start processing
FATAL Something's wrong. Maybe you can find the solution here: https://hexo.io/docs/troubleshooting.html
Template render error: (unknown path)
  Error: expected end of comment, got end of file
```

## 原因

```
hexo 中 {# 属于吧保留字，会报错。
```

## 解决方案

将 `{` 与 `#` 拆开写。


------------------------------------------------------------------------------------------------------------------------------------------


# Hexo

[Hexo](https://hexo.io/) is a fast, simple & powerful blog framework.

一直使用的是 [jekyll](https://houbb.github.io/2016/04/13/jekyll)，文章越写越多，不太好管理。是时候换个博客尝试一下。

# Prepare

> [blog zh_CN](http://www.jianshu.com/p/465830080ea9)

本机为 MAC。不同系统会略有不同，但是大同小异。

- [Node.js](https://nodejs.org/)

必须。

作用：用来生成静态页面的。


```
houbinbindeMacBook-Pro:~ houbinbin$ node -v
v6.2.2
```


- [Git](https://git-scm.com/)

必须。

作用：代码仓库管理。

```
houbinbindeMacBook-Pro:~ houbinbin$ git --version
git version 2.8.1
```

- [Github](https://github.com/)

申请个账号。我相信你应该知道。


# Install

- 下载安装 hexo

找一个你想放置blog的文件夹，执行：

```
sudo npm install -g hexo-cli
```

实际操作：

```
houbinbindeMacBook-Pro:fork houbinbin$ pwd
/Users/houbinbin/it/fork
houbinbindeMacBook-Pro:fork houbinbin$ npm install -g hexo-cli
fetchMetadata → network  。。。。
```

- 测试

等待下载完成。输入命令 `hexo`

```
houbinbindeMacBook-Pro:fork houbinbin$ hexo
Usage: hexo <command>

Commands:
  help     Get help on a command.
  init     Create a new Hexo folder.
  version  Display version information.

Global Options:
  --config  Specify config file instead of using _config.yml
  --cwd     Specify the CWD
  --debug   Display all verbose messages in the terminal
  --draft   Display draft posts
  --safe    Disable all plugins and scripts
  --silent  Hide output on console

For more help, you can use 'hexo help [command]' for the detailed information
or you can check the docs: http://hexo.io/docs/
```

- 初始化博客

```
// 建立一个博客文件夹，并初始化博客，<folder>为文件夹的名称，可以随便起名字
$ hexo init <folder>
// 进入博客文件夹，<folder>为文件夹的名称
$ cd <folder>
// node.js的命令，根据博客既定的dependencies配置安装所有的依赖包
$ npm install
```

此处为了方便, 直接使用 `XXX.github.io` 命名。
实际操作


```
houbinbindeMacBook-Pro:fork houbinbin$ hexo init ryo.github.io
INFO  Cloning hexo-starter to ~/IT/fork/ryo.github.io
Cloning into '/Users/houbinbin/IT/fork/ryo.github.io'...
remote: Counting objects: 53, done.
remote: Total 53 (delta 0), reused 0 (delta 0), pack-reused 53
Unpacking objects: 100% (53/53), done.
Checking connectivity... done.
Submodule 'themes/landscape' (https://github.com/hexojs/hexo-theme-landscape.git) registered for path 'themes/landscape'
Cloning into 'themes/landscape'...
remote: Counting objects: 764, done.
remote: Total 764 (delta 0), reused 0 (delta 0), pack-reused 764
Receiving objects: 100% (764/764), 2.53 MiB | 130.00 KiB/s, done.
Resolving deltas: 100% (390/390), done.
Checking connectivity... done.
Submodule path 'themes/landscape': checked out 'decdc2d9956776cbe95420ae94bac87e22468d38'
INFO  Install dependencies
npm WARN deprecated swig@1.4.2: This package is no longer maintained
npm WARN deprecated minimatch@0.3.0: Please update to minimatch 3.0.2 or higher to avoid a RegExp DoS issue
npm WARN prefer global marked@0.3.6 should be installed with -g

> fsevents@1.1.1 install /Users/houbinbin/IT/fork/ryo.github.io/node_modules/fsevents
> node install

[fsevents] Success: "/Users/houbinbin/IT/fork/ryo.github.io/node_modules/fsevents/lib/binding/Release/node-v48-darwin-x64/fse.node" already installed
Pass --update-binary to reinstall or --build-from-source to recompile

> dtrace-provider@0.8.1 install /Users/houbinbin/IT/fork/ryo.github.io/node_modules/dtrace-provider
> node scripts/install.js
```

新开一个窗口

```
houbinbindeMacBook-Pro:blog houbinbin$ pwd
/Users/houbinbin/it/fork/ryo.github.io
houbinbindeMacBook-Pro:blog houbinbin$ npm install
houbinbindeMacBook-Pro:blog houbinbin$ ls
_config.yml	node_modules	package.json	scaffolds	source		themes
```

# config blog

类似 jekyll，需要修改 `_config.yml`文件。

> 修改网站相关信息

```
title: echo blog
subtitle: the blog of ryo
description: One Echo, Endless Miss
author: ryo
language: zh-CN
timezone: Asia/Shanghai
```


> 配置统一资源定位符（个人域名）

```
url: https://ryo.github.io
```

对于root（根目录）、permalink（永久链接）、permalink_defaults（默认永久链接）等其他信息保持默认。

> 配置部署

```
deploy:
  type: git
  repo: https://github.com/houbb/ryo.github.io.git
  branch: master
```

# Hello World


- 新建一篇文章

```
// 新建一篇文章
hexo new "文章标题"
```

实际：

```
houbinbindeMacBook-Pro:ryo.github.io houbinbin$ hexo new "helloworld"
INFO  Created: ~/IT/fork/ryo.github.io/source/_posts/helloworld.md
```


- 启动服务

```
hexo server
```

实际

```
houbinbindeMacBook-Pro:ryo.github.io houbinbin$ hexo server
INFO  Start processing
INFO  Hexo is running at http://localhost:4000/. Press Ctrl+C to stop.
```


![hello world](https://raw.githubusercontent.com/houbb/resource/master/img/hexo/2017-03-29-hexo-helloworld.png)


# 博客发布

```
$ hexo generate
$ hexo deploy
```

前面的 `deploy` 已经指定了其对应的 github 仓库。你可以在github上创建一个 `XXX.github.io` 项目，或者使用其他方式。

其中 **XXX** 是你的github用户名。我以前使用 jekyll 已经占用一个了。此处先演示本地。


实际操作：

```
houbinbindeMacBook-Pro:ryo.github.io houbinbin$ hexo generate
INFO  Start processing
INFO  Files loaded in 177 ms
INFO  Generated: index.html
INFO  Generated: archives/index.html
INFO  Generated: fancybox/blank.gif
INFO  Generated: fancybox/jquery.fancybox.css
INFO  Generated: fancybox/jquery.fancybox.pack.js
INFO  Generated: fancybox/fancybox_loading.gif
INFO  Generated: fancybox/jquery.fancybox.js
INFO  Generated: fancybox/fancybox_overlay.png
INFO  Generated: fancybox/fancybox_loading@2x.gif
INFO  Generated: fancybox/fancybox_sprite.png
INFO  Generated: fancybox/fancybox_sprite@2x.png
INFO  Generated: archives/2017/03/index.html
INFO  Generated: archives/2017/index.html
INFO  Generated: css/fonts/FontAwesome.otf
INFO  Generated: js/script.js
INFO  Generated: fancybox/helpers/jquery.fancybox-buttons.js
INFO  Generated: fancybox/helpers/jquery.fancybox-buttons.css
INFO  Generated: fancybox/helpers/jquery.fancybox-thumbs.css
INFO  Generated: fancybox/helpers/jquery.fancybox-thumbs.js
INFO  Generated: css/style.css
INFO  Generated: css/fonts/fontawesome-webfont.woff
INFO  Generated: fancybox/helpers/jquery.fancybox-media.js
INFO  Generated: css/fonts/fontawesome-webfont.eot
INFO  Generated: fancybox/helpers/fancybox_buttons.png
INFO  Generated: css/images/banner.jpg
INFO  Generated: css/fonts/fontawesome-webfont.svg
INFO  Generated: css/fonts/fontawesome-webfont.ttf
INFO  Generated: 2017/03/29/hello-world/index.html
INFO  28 files generated in 656 ms
```

<label class="label label-danger">Deployer not found</label>

解决方式 `npm install hexo-deployer-git --save`

```
houbinbindeMacBook-Pro:ryo.github.io houbinbin$ hexo deploy
ERROR Deployer not found: github
houbinbindeMacBook-Pro:ryo.github.io houbinbin$ npm install hexo-deployer-git --save
hexo-site@0.0.0 /Users/houbinbin/IT/fork/ryo.github.io
`-- hexo-deployer-git@0.2.0
```


重新运行

```
houbinbindeMacBook-Pro:ryo.github.io houbinbin$ hexo deploy
INFO  Deploying: git
INFO  Setting up Git deployment...
Initialized empty Git repository in /Users/houbinbin/IT/fork/ryo.github.io/.deploy_git/.git/
[master (root-commit) 29675e7] First commit
 1 file changed, 0 insertions(+), 0 deletions(-)
 create mode 100644 placeholder
INFO  Clearing .deploy_git folder...
INFO  Copying files from public folder...
[master 02b7255] Site updated: 2017-03-29 23:17:16
 29 files changed, 5793 insertions(+)
 create mode 100644 2017/03/29/hello-world/index.html
 create mode 100644 archives/2017/03/index.html
 create mode 100644 archives/2017/index.html
 create mode 100644 archives/index.html
 create mode 100644 css/fonts/FontAwesome.otf
 create mode 100644 css/fonts/fontawesome-webfont.eot
 create mode 100644 css/fonts/fontawesome-webfont.svg
 create mode 100644 css/fonts/fontawesome-webfont.ttf
 create mode 100644 css/fonts/fontawesome-webfont.woff
 create mode 100644 css/images/banner.jpg
 create mode 100644 css/style.css
 create mode 100644 fancybox/blank.gif
 create mode 100644 fancybox/fancybox_loading.gif
 create mode 100644 fancybox/fancybox_loading@2x.gif
 create mode 100644 fancybox/fancybox_overlay.png
 create mode 100644 fancybox/fancybox_sprite.png
 create mode 100644 fancybox/fancybox_sprite@2x.png
 create mode 100644 fancybox/helpers/fancybox_buttons.png
 create mode 100644 fancybox/helpers/jquery.fancybox-buttons.css
 create mode 100644 fancybox/helpers/jquery.fancybox-buttons.js
 create mode 100644 fancybox/helpers/jquery.fancybox-media.js
 create mode 100644 fancybox/helpers/jquery.fancybox-thumbs.css
 create mode 100644 fancybox/helpers/jquery.fancybox-thumbs.js
 create mode 100644 fancybox/jquery.fancybox.css
 create mode 100644 fancybox/jquery.fancybox.js
 create mode 100644 fancybox/jquery.fancybox.pack.js
 create mode 100644 index.html
 create mode 100644 js/script.js
 delete mode 100644 placeholder
To https://github.com/houbb/ryo.github.io.git
 + 921a4a1...02b7255 HEAD -> master (forced update)
Branch master set up to track remote branch master from https://github.com/houbb/ryo.github.io.git.
INFO  Deploy done: git
```


# 参考资料

[hexo-theme-next](https://github.com/theme-next)

[Hexo个人博客NexT主题添加Local Search本地搜索](https://blog.csdn.net/mqdxiaoxiao/article/details/93257866)

* any list
{:toc}