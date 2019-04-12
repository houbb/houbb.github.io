---
layout: post
title: Python-35-splider BeautifulSoup 爬虫
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, python3, splider, lang, sh]
published: true
---

# BeautifulSoup

[BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/)  is a Python library designed for quick turnaround projects like screen-scraping. 

## 特性

Three features make it powerful:

Beautiful Soup provides a few simple methods and Pythonic idioms for navigating, searching, and modifying a parse tree: a toolkit for dissecting a document and extracting what you need. It doesn't take much code to write an application

Beautiful Soup automatically converts incoming documents to Unicode and outgoing documents to UTF-8. You don't have to think about encodings, unless the document doesn't specify an encoding and Beautiful Soup can't detect one. Then you just have to specify the original encoding.

Beautiful Soup sits on top of popular Python parsers like lxml and html5lib, allowing you to try out different parsing strategies or trade speed for flexibility.

## 名称

Beautiful Soup parses anything you give it, and does the tree traversal stuff for you. 

You can tell it "Find all the links", or "Find all the links of class externalLink", or "Find all the links whose urls match "foo.com", or "Find the table heading that's got bold text, then give me that text."

Valuable data that was once locked up in poorly-designed websites is now within your reach. 

Projects that would have taken hours take only minutes with Beautiful Soup.

# 环境安装

## 安装

```
pip install beautifulsoup4
```

## 安装解析器

懂得 html 数据结构。

Beautiful Soup支持Python标准库中的HTML解析器,还支持一些第三方的解析器,其中一个是 lxml .根据操作系统不同,可以选择下列方法来安装lxml:

```
$ pip install lxml
```

另一个可供选择的解析器是纯Python实现的 html5lib , html5lib的解析方式与浏览器相同,可以选择下列方法来安装html5lib:

```
$ pip install html5lib
```

推荐使用lxml作为解析器,因为效率更高。

# 快速开始

## 数据准备

下面的一段HTML代码将作为例子被多次用到.

这是 爱丽丝梦游仙境的 的一段内容(以后内容中简称为 爱丽丝 的文档):

```py
html_doc = """
<html><head><title>The Dormouse's story</title></head>
<body>
<p class="title"><b>The Dormouse's story</b></p>

<p class="story">Once upon a time there were three little sisters; and their names were
<a href="http://example.com/elsie" class="sister" id="link1">Elsie</a>,
<a href="http://example.com/lacie" class="sister" id="link2">Lacie</a> and
<a href="http://example.com/tillie" class="sister" id="link3">Tillie</a>;
and they lived at the bottom of a well.</p>

<p class="story">...</p>
"""
```

## 获取结构化对象

使用BeautifulSoup解析这段代码,能够得到一个 BeautifulSoup 的对象,并能按照标准的缩进格式的结构输出:

```py
from bs4 import BeautifulSoup
soup = BeautifulSoup(html_doc)

print(soup.prettify())
# <html>
#  <head>
#   <title>
#    The Dormouse's story
#   </title>
#  </head>
#  <body>
#   <p class="title">
#    <b>
#     The Dormouse's story
#    </b>
#   </p>
#   <p class="story">
#    Once upon a time there were three little sisters; and their names were
#    <a class="sister" href="http://example.com/elsie" id="link1">
#     Elsie
#    </a>
#    ,
#    <a class="sister" href="http://example.com/lacie" id="link2">
#     Lacie
#    </a>
#    and
#    <a class="sister" href="http://example.com/tillie" id="link2">
#     Tillie
#    </a>
#    ; and they lived at the bottom of a well.
#   </p>
#   <p class="story">
#    ...
#   </p>
#  </body>
# </html>
```

## 获取结构化的信息

```py
soup.title
# <title>The Dormouse's story</title>

soup.title.name
# u'title'

soup.title.string
# u'The Dormouse's story'

soup.title.parent.name
# u'head'

soup.p
# <p class="title"><b>The Dormouse's story</b></p>

soup.p['class']
# u'title'

soup.a
# <a class="sister" href="http://example.com/elsie" id="link1">Elsie</a>

soup.find_all('a')
# [<a class="sister" href="http://example.com/elsie" id="link1">Elsie</a>,
#  <a class="sister" href="http://example.com/lacie" id="link2">Lacie</a>,
#  <a class="sister" href="http://example.com/tillie" id="link3">Tillie</a>]

soup.find(id="link3")
# <a class="sister" href="http://example.com/tillie" id="link3">Tillie</a>
```

## 从文档中找到所有 <a> 标签的链接:

```py
for link in soup.find_all('a'):
    print(link.get('href'))
    # http://example.com/elsie
    # http://example.com/lacie
    # http://example.com/tillie
```

## 从文档中获取所有文字内容:

```py
print(soup.get_text())
# The Dormouse's story
#
# The Dormouse's story
#
# Once upon a time there were three little sisters; and their names were
# Elsie,
# Lacie and
# Tillie;
# and they lived at the bottom of a well.
#
# ...
```

# 个人感受

1. 学习只需要学习最好的一个深入理解即可。

2. 要学会对比，然后选择一个最好的。思想是类似的，不需要同时深入理解多个。

3. 要学会看一首文档。比如官方。

## 基础知识

所有爬虫的原理都是网络请求+html的dom结构

为了提升性能使用的都是多线程。

基础知识很重要，至于不同的软件就可以吸取其精华的部分，最主要的是理解思想。

# 参考资料

[bs-4 中文文档](https://www.crummy.com/software/BeautifulSoup/bs4/doc/index.zh.html)

[bs4-en](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)

* any list
{:toc}