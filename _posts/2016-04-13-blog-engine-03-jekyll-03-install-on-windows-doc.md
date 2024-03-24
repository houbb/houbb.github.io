---
layout: post
title:  blog-engine-02-博客引擎jekyll-jekyll 如何在 windows 环境安装，官方文档
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

## 在 Windows 上安装 Jekyll

尽管 Windows 不是官方支持的平台，但可以通过适当的调整来运行 Jekyll。

### 通过 RubyInstaller 安装

RubyInstaller for Windows 是安装 Ruby 和 Jekyll 的最简单方法。

1. 从 [RubyInstaller Downloads](https://rubyinstaller.org/downloads/) 下载并安装 Ruby+Devkit 版本。使用默认选项进行安装。
2. 在安装向导的最后阶段运行 `ridk install` 步骤。这是为了在安装具有本机扩展的 gem 时需要。您可以在 [RubyInstaller Documentation](https://rubyinstaller.org/downloads/) 中找到关于此的更多信息。从选项中选择 MSYS2 和 MINGW 开发工具链。
3. 从开始菜单打开一个新的命令提示符窗口，以使对 PATH 环境变量的更改生效。使用 `gem install jekyll bundler` 安装 Jekyll 和 Bundler。
4. 检查 Jekyll 是否已正确安装：`jekyll -v`

### 通过 Windows 10 上的 Bash 安装

如果您使用的是 Windows 10 版本 1607 或更高版本，另一种运行 Jekyll 的选择是安装 Windows 子系统用于 Linux。

1. 确保已启用 Windows 子系统用于 Linux。
2. 确保所有软件包和存储库都是最新的。打开一个新的命令提示符或 PowerShell 窗口并输入 `bash`。
3. 更新您的存储库列表和软件包：
    ```bash
    sudo apt-get update -y && sudo apt-get upgrade -y
    ```
4. 接下来，安装 Ruby。我们将使用 BrightBox 的存储库来安装 Ruby，该存储库为 Ubuntu 提供了优化版本的 Ruby。
    ```bash
    sudo apt-add-repository ppa:brightbox/ruby-ng
    sudo apt-get update
    sudo apt-get install ruby2.5 ruby2.5-dev build-essential dh-autoreconf
    ```
5. 更新您的 Ruby gem：
    ```bash
    gem update
    ```
6. 安装 Jekyll：
    ```bash
    gem install jekyll bundler
    ```
    不需要 sudo。
7. 检查您的 Jekyll 版本：
    ```bash
    jekyll -v
    ```

您已经准备好开始使用 Jekyll 了！

### 非超级用户帐户问题

如果 `jekyll new` 命令打印出错误 "Your user account isn't allowed to install to the system RubyGems"，请参阅[Troubleshooting](#troubleshooting)中的“Running Jekyll as Non-Superuser”说明。

### 编码

如果您使用 UTF-8 编码，当文件以表示 BOM 的字符开头时，Jekyll 会中断。因此，如果在文件开头出现此字节序列，请将其删除。

此外，如果在站点生成过程中遇到 Liquid Exception: Incompatible character encoding 错误，则可能需要将控制台窗口的代码页更改为 UTF-8。运行以下命令：
```bash
chcp 65001
```

### 时区管理

由于 Windows 没有本地的 zoneinfo 数据源，Ruby 解释器不了解 IANA 时区。因此，Jekyll 现在使用一个 rubygem 来基于已建立的 IANA 时区数据库内部配置时区。

在使用 Jekyll v3.4 及更高版本创建的“新”博客将默认将以下内容添加到其 Gemfile 中，但现有站点必须更新其 Gemfile（和已安装的 gem）以在 Windows 上启用开发：
```ruby
# Windows and JRuby does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end
```

### 自动重新生成

当使用 `--watch` 开关指定进行构建或 serve 时，Jekyll 使用 listen gem 监视更改。

虽然 listen 内置支持 UNIX 系统，但可能需要额外的 gem 与 Windows 兼容。

如果在仅在 Windows 上自动重新生成时出现问题，请将以下内容添加到站点的 Gemfile 中：

```ruby
gem "wdm", "~> 0.1.1", :install_if => Gem.win_platform?
```

您必须使用 RubyInstaller 的 Ruby+Devkit 版本，并安装 MSYS2 构建工具以成功安装 wdm gem。


* any list
{:toc}