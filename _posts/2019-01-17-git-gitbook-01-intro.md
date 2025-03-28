---
layout: post
title:  GitBook-01-gitbook 发布文章入门介绍
date: 2019-1-17 09:34:35 +0800
categories: [Git]
tags: [git, devops, git-learn, git-topic, gitbook, sh]
published: true
---

# GitBook


[GitBook](https://www.gitbook.com) Modern documentation format and toolchain using Git and Markdown.
 
优点是：将写作与编程的思想结合。

> [Git](https://git-scm.com/)

> [Markdown syntax](https://daringfireball.net/projects/markdown/syntax)

# Quick Start

## 创建项目

- 创建项目

建议直接在 [Github](https://github.com) 上创建一个项目。

详情可参见教程：[github 入门教程](http://blog.csdn.net/javaandroid730/article/details/53522872)


- 添加总入口

项目根路径下，新建文件 `SUMMARY.md`，作为目录。可以随便输入内容。


## 登录 gitbook

登录 [gitbook](https://www.gitbook.com)，可以使用 github 账号直接授权登录。

## 创建一本书

- 整合 github

![2018-01-06-install-github-integration.png](https://raw.githubusercontent.com/houbb/resource/master/img/tools/gitbook/2018-01-06-install-github-integration.png)

点击安装之后，会请求 github 授权，你可以选择指定的仓库生成 gitbook。

- 授权

建议只授权指定的仓库，因为大部分还都是代码，没有实际意义。

![2018-01-06-github-auth.png](https://raw.githubusercontent.com/houbb/resource/master/img/tools/gitbook/2018-01-06-github-auth.png)

- 2018-01-06-gitbook-create-book.png

新建一本书，根据你刚才授权的仓库。然后耐心等待初始化。
 
![2018-01-06-gitbook-create-book.png](https://raw.githubusercontent.com/houbb/resource/master/img/tools/gitbook/2018-01-06-gitbook-create-book.png)
 

## 书的编辑

直接编辑，可以新建文章，`TOC` 是对应的索引，`FILES` 对应文件。每次变动，代码库文件也会随之更新。

- 中文支持

对中文的支持不够友好，会变成对应的拼音。

- 目录结构

在每个一级目录下新建文章，生成的文件也会在对应的文件夹中。


# 本地安装

## npm 环境的准备

[https://nodejs.org/en/#download](https://nodejs.org/en/#download) 直接下载对应的 `node.pkg` 文件安装即可。

验证：

```
$ npm -v
3.9.5
```

## 安装 gitbook

- 运行

```
sudo npm install -g gitbook-cli
```

- 是否安装成功

```
gitbook -V
```

有时候不会出现版本号，但是不报错就是安装成功了。

```
houbinbindeMacBook-Pro:~ houbinbin$ gitbook -V
CLI version: 2.3.2
GitBook version: 3.2.3
```

## 安装 editor

[editor](https://www.gitbook.com/editor) 直接下载安装即可。


# 本地使用

## 创建文件

任意创建一个文件夹。

```
/Users/houbinbin/Write/gitbook
```

创建一个文件 `README.md`
 
## 初始化

```
$ gitbook init
warn: no summary file in this book 
info: create SUMMARY.md 
info: initialization is finished 
```

备注：如果你手动创建 `SUMMARY.md`，则 gitbook 不会再次创建。

## 启动服务

```
$ gitbook serve

Live reload server started on port: 35729
Press CTRL+C to quit ...

info: 7 plugins are installed 
info: loading plugin "livereload"... OK 
info: loading plugin "highlight"... OK 
info: loading plugin "search"... OK 
info: loading plugin "lunr"... OK 
info: loading plugin "sharing"... OK 
info: loading plugin "fontsettings"... OK 
info: loading plugin "theme-default"... OK 
info: found 1 pages 
info: found 0 asset files 
info: >> generation finished with success in 0.5s ! 

Starting server ...
Serving book on http://localhost:4000
```

直接访问 [http://localhost:4000](http://localhost:4000) 即可。

### 修改端口号

GitBook 默认的监听端口是 `40000`，和我本地的 jekyll 冲突了。

怎么修改端口号呢？

- help

```
$ gitbook help
    build [book] [output]       build a book
        --log                   Minimum log level to display (Default is info; Values are debug, info, warn, error, disabled)
        --format                Format to build to (Default is website; Values are website, json, ebook)
        --[no-]timing           Print timing debug information (Default is false)

    serve [book] [output]       serve the book as a website for testing
        --port                  Port for server to listen on (Default is 4000)
        --lrport                Port for livereload server to listen on (Default is 35729)
        --[no-]watch            Enable file watcher and live reloading (Default is true)
        --[no-]live             Enable live reloading (Default is true)
        --[no-]open             Enable opening book in browser (Default is false)
        --browser               Specify browser for opening book (Default is )
        --log                   Minimum log level to display (Default is info; Values are debug, info, warn, error, disabled)
        --format                Format to build to (Default is website; Values are website, json, ebook)

    install [book]              install all plugins dependencies
        --log                   Minimum log level to display (Default is info; Values are debug, info, warn, error, disabled)

    parse [book]                parse and print debug information about a book
        --log                   Minimum log level to display (Default is info; Values are debug, info, warn, error, disabled)

    init [book]                 setup and create files for chapters
        --log                   Minimum log level to display (Default is info; Values are debug, info, warn, error, disabled)

    pdf [book] [output]         build a book into an ebook file
        --log                   Minimum log level to display (Default is info; Values are debug, info, warn, error, disabled)

    epub [book] [output]        build a book into an ebook file
        --log                   Minimum log level to display (Default is info; Values are debug, info, warn, error, disabled)

    mobi [book] [output]        build a book into an ebook file
        --log                   Minimum log level to display (Default is info; Values are debug, info, warn, error, disabled)
```

- 指定端口号运行

```
$ gitbook serve --port 4001
Live reload server started on port: 35729
Press CTRL+C to quit ...

info: 7 plugins are installed 
info: loading plugin "livereload"... OK 
info: loading plugin "highlight"... OK 
info: loading plugin "search"... OK 
info: loading plugin "lunr"... OK 
info: loading plugin "sharing"... OK 
info: loading plugin "fontsettings"... OK 
info: loading plugin "theme-default"... OK 
info: found 1 pages 
info: found 0 asset files 
info: >> generation finished with success in 1.3s ! 

Starting server ...
Serving book on http://localhost:4001
Restart after change in file SUMMARY.md
```

搞定~

* any list
{:toc}



