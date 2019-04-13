---
layout: post
title: Python-37-splider Scrapy 爬虫
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, python3, splider, lang, sh]
published: true
---

# Scrapy

[Scrapy](https://scrapy.org/) is an and collaborative framework for extracting the data you need from websites.

In a fast, simple, yet extensible way.

# 快速开始

## install

```
$   pip install scrapy
```

### windows  报错

windows 参见下面的 [windows 安装报错](#windows-安装报错)

安装解决之后，继续执行

```
$   pip install scrapy
```

### 版本验证

```
> scrapy version
Scrapy 1.6.0
```

## 编写测试文件

- myspider.py

```py
import scrapy

class BlogSpider(scrapy.Spider):
    name = 'blogspider'
    start_urls = ['https://blog.csdn.net/ryo1060732496']

    next_pages = []
    for num in range(2, 22):
        next_pages.append('https://blog.csdn.net/ryo1060732496/article/list/'+str(num))

    def parse(self, response):
        for href in response.css('.article-list>.article-item-box>h4'):
            yield {'href': href.css('a').attrib['href']}

        for next_page in self.next_pages:
            yield response.follow(next_page, self.parse)
```


- run

```
scrapy runspider myspider.py
```

日志信息如下：

如果报错，参考 [运行报错](#运行报错) 解决之后再次运行即可。

- 结果日志

看的出来这里用到了多线程，并且提供了大量的日志统计信息。

# 个人收获

## 平台效应

前面的各种 request bs 都是一个框架，工具包

但是这里是一个完整的平台。具有


# windows 安装报错

## 报错信息

```
running build_ext
  building 'twisted.test.raiser' extension
  error: Microsoft Visual C++ 14.0 is required. Get it with "Microsoft Visual C++ Build Tools": https://visualstudio.microsoft.com/downloads/

  ----------------------------------------
  Failed building wheel for Twisted
  Running setup.py clean for Twisted
Failed to build Twisted
Installing collected packages: queuelib, Twisted, PyDispatcher, pyasn1, pyasn1-modules, service-identity, scrapy
  Running setup.py install for Twisted ... error
```

## 解决

### 手动安装twisted插件：

在 http://www.lfd.uci.edu/~gohlke/pythonlibs/#twisted 用Ctrl+F搜索twisted，下载对应版本。

版本如下：

```
Twisted‑19.2.0‑cp27‑cp27m‑win32.whl
Twisted‑19.2.0‑cp27‑cp27m‑win_amd64.whl
Twisted‑19.2.0‑cp35‑cp35m‑win32.whl
Twisted‑19.2.0‑cp35‑cp35m‑win_amd64.whl
Twisted‑19.2.0‑cp36‑cp36m‑win32.whl
Twisted‑19.2.0‑cp36‑cp36m‑win_amd64.whl
Twisted‑19.2.0‑cp37‑cp37m‑win32.whl
Twisted‑19.2.0‑cp37‑cp37m‑win_amd64.whl
```

我是Python3.7,64位，即下载 `Twisted‑19.2.0‑cp37‑cp37m‑win_amd64.whl`

### 安装 wheel

```
pip install wheel
```

### 安装 twisted 插件

把下载下来的 `Twisted‑19.2.0‑cp37‑cp37m‑win_amd64.whl` 放到Python37\Scripts目录，

我的个人目录：

```
C:\Users\binbin.hou\AppData\Local\Programs\Python\Python37\Scripts
```

执行

```
pip install .\Twisted-19.2.0-cp37-cp37m-win_amd64.whl
```

日志如下：

```
Processing c:\users\binbin.hou\appdata\local\programs\python\python37\scripts\twisted-19.2.0-cp37-cp37m-win_amd64.whl
Requirement already satisfied: incremental>=16.10.1 in c:\users\binbin.hou\appdata\local\programs\python\python37\lib\site-packages (from ...
Installing collected packages: Twisted
Successfully installed Twisted-19.2.0
```

# 运行报错

## 报错信息

```
 File "c:\users\binbin.hou\appdata\local\programs\python\python37\lib\site-packages\twisted\internet\_win32stdio.py", line 9, in <module>
    import win32api
builtins.ModuleNotFoundError: No module named 'win32api'
```

## 解决

原因就是缺少 win32 的包

解决办法：安装pywin32

### 运行命令

```
pip install pywin32
```

建议使用这种方式

# 参考资料

## 安装报错

[windows7 安装Scrapy爬虫框架报错解决方案](https://blog.csdn.net/JoeHuesh/article/details/82768869)

[Windows安装Python组件Scrapy报错的解决方案](https://blog.csdn.net/tiantuanzi/article/details/70829914)

## 运行报错

* any list
{:toc}