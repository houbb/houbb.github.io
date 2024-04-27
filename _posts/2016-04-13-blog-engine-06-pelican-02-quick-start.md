---
layout: post
title: blog-engine-06-pelican 静态网站生成 windows11 安装实战笔记
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

# windows11 安装实战笔记

## python 安装

> [windows 安装 python](https://houbb.github.io/2018/02/14/python-02-environment-windows-02)

### 下载

https://www.python.org/downloads/windows/

比如选择 [Download Windows installer (64-bit)](https://www.python.org/ftp/python/3.13.0/python-3.13.0a5-amd64.exe)

### 安装

双击运行安装包，选择 Add Python to PATH

等待安装完成。

### 验证

```sh
>python --version
Python 3.13.0a5
```

## 安装 pelican

```sh
python -m pip install "pelican[markdown]"
```

### 报错

```
error: subprocess-exited-with-error

  × Preparing metadata (pyproject.toml) did not run successfully.
  │ exit code: 1
  ╰─> [6 lines of output]

      Cargo, the Rust package manager, is not installed or is not on PATH.
      This package requires Rust and Cargo to compile extensions. Install it through
      the system's package manager or via https://rustup.rs/

      Checking for Rust toolchain....
      [end of output]

  note: This error originates from a subprocess, and is likely not a problem with pip.
error: metadata-generation-failed

× Encountered error while generating package metadata.
╰─> See above for output.

note: This is an issue with the package mentioned above, not pip.
hint: See above for details.
```

这个错误是由于 Pelican 中的某些模块需要 Rust 和 Cargo 来编译扩展模块，但您的系统中没有安装 Rust 或者 Rust 没有添加到 PATH 环境变量中引起的。


## 安装 rust + cargo

通常情况下，Rust 安装程序会自动安装 Cargo。

### 下载

访问 https://rustup.rs/ 网站。

下载 [https://win.rustup.rs/x86_64](https://win.rustup.rs/x86_64) 安装包。

### 安装

双击运行，选择默认标准安装配置。

```
Current installation options:


   default host triple: x86_64-pc-windows-msvc
     default toolchain: stable (default)
               profile: default
  modify PATH variable: yes

1) Proceed with standard installation (default - just press enter)
2) Customize installation
3) Cancel installation
>

info: profile set to 'default'
info: default host triple is x86_64-pc-windows-msvc
info: syncing channel updates for 'stable-x86_64-pc-windows-msvc'
714.8 KiB / 714.8 KiB (100 %)  69.0 KiB/s in  8s ETA:  0s
info: latest update on 2024-03-21, rust version 1.77.0 (aedd173a2 2024-03-17)
info: downloading component 'cargo'
  5.5 MiB /   6.3 MiB ( 87 %)  54.4 KiB/s in  1m 54s ETA: 15s
```

可以看到，默认安装了 cargo 组件。

安装可能会比较慢，安装完成的日志：

```
info: default toolchain set to 'stable-x86_64-pc-windows-msvc'

  stable-x86_64-pc-windows-msvc installed - rustc 1.77.0 (aedd173a2 2024-03-17)


Rust is installed now. Great!

To get started you may need to restart your current shell.
This would reload its PATH environment variable to include
Cargo's bin directory (%USERPROFILE%\.cargo\bin).

Press the Enter key to continue.
```

### 验证

```sh
rustc --version
cargo --version
```

如下：

```
>rustc --version
rustc 1.77.0 (aedd173a2 2024-03-17)

>cargo --version
cargo 1.77.0 (3fe68eabf 2024-02-29)
```

## 重新安装 pelican

可以用管理员方式启动命令行，执行：

```sh
python -m pip install "pelican[markdown]"
```

安装完成日志：

```
Building wheels for collected packages: watchfiles
  Building wheel for watchfiles (pyproject.toml) ... done
  Created wheel for watchfiles: filename=watchfiles-0.21.0-cp313-none-win_amd64.whl size=267641 sha256=64c21d246b70aa70984c8b7fff0e8a64f61b48aec50df29cfdfae657fec780a7
  Stored in directory: c:\users\administrator\appdata\local\pip\cache\wheels\f3\79\9e\3f3a98d978d6bfb8e78b0841fcd0de0e61377b3f4f3fe55efa
Successfully built watchfiles
Installing collected packages: pytz, unidecode, tzdata, sniffio, six, pygments, ordered-set, mdurl, MarkupSafe, markdown, idna, feedgenerator, docutils, blinker, python-dateutil, markdown-it-py, jinja2, anyio, watchfiles, rich, pelican
Successfully installed MarkupSafe-2.1.5 anyio-4.3.0 blinker-1.7.0 docutils-0.20.1 feedgenerator-2.1.0 idna-3.6 jinja2-3.1.3 markdown-3.6 markdown-it-py-3.0.0 mdurl-0.1.2 ordered-set-4.1.0 pelican-4.9.1 pygments-2.17.2 python-dateutil-2.9.0.post0 pytz-2024.1 rich-13.7.1 six-1.16.0 sniffio-1.3.1 tzdata-2024.1 unidecode-1.3.8 watchfiles-0.21.0
```

## 创建项目

我们创建测试目录：`D:\blogs\test`

```bat
d:
mkdir D:\blogs\test
cd D:\blogs\test
```

然后创建项目骨架：

```bat
pelican-quickstart
```

这里面有一些配置项，根据自己的选择：

```
> Where do you want to create your new web site? [.]
> What will be the title of this web site?
You must enter something
> What will be the title of this web site? test
> Who will be the author of this web site? laomaxiaoxifeng
> What will be the default language of this web site? [Chinese (Simplified)]
> Do you want to specify a URL prefix? e.g., https://example.com   (Y/n) Y
> What is your URL prefix? (see above example; no trailing slash)
You must enter something
> What is your URL prefix? (see above example; no trailing slash) /
> Do you want to enable article pagination? (Y/n) Y
> How many articles per page do you want? [10] 10
> What is your time zone? [Europe/Rome] Rome
Please enter a valid time zone:
 (check [https://en.wikipedia.org/wiki/List_of_tz_database_time_zones])
> What is your time zone? [Europe/Rome] Asia/Shanghai
> Do you want to generate a tasks.py/Makefile to automate generation and publishing? (Y/n) Y
> Do you want to upload your website using FTP? (y/N) y
> What is the hostname of your FTP server? [localhost]
> What is your username on that server? [anonymous]
> Where do you want to put your web site on that server? [/] /
> Do you want to upload your website using SSH? (y/N) N
> Do you want to upload your website using Dropbox? (y/N) N
> Do you want to upload your website using S3? (y/N) N
> Do you want to upload your website using Rackspace Cloud Files? (y/N) N
> Do you want to upload your website using GitHub Pages? (y/N) N
Done. Your new project is available at D:\blogs\test
```

时区这里选择的 `Asia/Shanghai`

生成的项目架构：

```
2024/03/24  18:26    <DIR>          content
2024/03/24  18:26             2,829 Makefile
2024/03/24  18:26    <DIR>          output
2024/03/24  18:26               832 pelicanconf.py
2024/03/24  18:26               525 publishconf.py
2024/03/24  18:26             4,041 tasks.py
```

## 编写文章

然后我们在 `D:\blogs\test\content\` 目录编写一个文章：

- my.md

```
Title: My First Review
Date: 2010-12-03 10:20
Category: Review

我的第一篇 pelican 文章!
```


## 生成您的站点

从您的项目根目录中运行pelican命令来生成您的站点：

```bash
pelican content
```

## 预览

打开一个新的终端会话，导航到您的项目根目录，并运行以下命令启动Pelican的Web服务器：

```bash
pelican --listen
```

通过在浏览器中导航到 http://localhost:8000/  来预览您的站点。


效果如下：

![首页](https://img-blog.csdnimg.cn/direct/0f5c626d77db4ff59c55527c9d3ed326.png#pic_center)



---------------------------------------------------------------------------------------------------------------- 


# 快速入门官方文档


强烈建议阅读所有文档，但对于那些真正急于开始的人，以下是一些快速入门步骤。

## 安装

在Python >=3.8.1上安装Pelican（如果打算使用Markdown，则可选安装Markdown），在您首选的终端中运行以下命令进行安装，如果需要权限，前面加上sudo：

```bash
python -m pip install "pelican[markdown]"
```

## 创建项目

首先，为您的项目选择一个名称，创建一个适当命名的目录用于您的站点，并切换到该目录：

```bash
mkdir -p ~/projects/yoursite
cd ~/projects/yoursite
```

通过pelican-quickstart命令创建一个骨架项目，该命令会询问有关您站点的一些问题：

```bash
pelican-quickstart
```

对于拥有默认值（用方括号标记）的问题，可以使用回车键接受这些默认值 [1]。当要求输入URL前缀时，按照指示输入您的域名（例如，https://example.com）。

## 创建文章

在创建一些内容之前，您无法运行Pelican。使用您首选的文本编辑器创建您的第一篇文章，内容如下：

```
Title: My First Review
Date: 2010-12-03 10:20
Category: Review

以下是我最喜欢的机械键盘的评论。
```

鉴于这个示例文章采用Markdown格式，请将其保存为~/projects/yoursite/content/keyboard-review.md。

## 生成您的站点

从您的项目根目录中运行pelican命令来生成您的站点：

```bash
pelican content
```

您的站点现在已经生成在output/目录中。（您可能会看到与feeds相关的警告，但这在本地开发时是正常的，现在可以忽略它。）

## 预览您的站点

打开一个新的终端会话，导航到您的项目根目录，并运行以下命令启动Pelican的Web服务器：

```bash
pelican --listen
```

通过在浏览器中导航到 http://localhost:8000/来预览您的站点。

继续阅读其他文档部分以获取更多详细信息，并查看Pelican Wiki的教程页面，其中包含指向社区发布的教程的链接。


# 参考资料

https://docs.getpelican.com/en/latest/quickstart.html

* any list
{:toc}