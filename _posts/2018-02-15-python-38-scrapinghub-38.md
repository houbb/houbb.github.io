---
layout: post
title: Python-38-scrapinghub 爬虫平台
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, python3, splider, lang, sh]
published: true
---

# scrapinghub

[scrapinghub](https://scrapinghub.com/) 是一款爬虫托管平台。

## 数据的价值

更好的数据可带来更好的决策。 

关注行业趋势，深入了解客户（和竞争对手），保护您的业务 - 可能性无穷无尽。

## 按需数据

如果您没有时间或专业知识来抓取网站，我们的网络抓取专家可以提供帮助。 

你将掌握得很好。 我们是Scrapy的创建者和主要维护者，Scrapy是用Python编写的最流行的Web抓取框架。

有些网站非常受欢迎或难以抓取，我们会自行收集数据，因此您无需这样做。 

如果您正在考虑抓取此类网站，请与我们联系。 

我们很有机会参与其中。 您可以即时访问所需的数据 - 无需麻烦。

其他网站很复杂。 在收集所需数据时，Bot对策，草率代码，A / B测试和其他挑战可能会妨碍您。 

我们的专家知道如何解决这些问题。 

通过让我们为您处理那些复杂的爬行来节省时间和金钱

## 大规模抓取网页

Scrapy Cloud是我们基于云的Web爬网平台，允许您轻松部署爬网程序并按需扩展它们 - 无需担心服务器，监视，备份或cron作业。 

它可以帮助像您这样的开发人员每月将20亿个网页转换为有价值的数据。

我们平台的众多附加组件可让您通过点击扩展蜘蛛。 

其中，我们的智能代理旋转器（Crawlera）可帮助您绕过机器人对策，以便您可以更快地抓取大型站点。

您的数据安全地存储在高可用性数据库中。 

您可以在仪表板中浏览并与团队共享，也可以使用我们的API在您的应用中使用您的数据。

# 创建一个 scrapy 项目

## 创建运行项目

```
scrapy startproject tutorial
```

日志如下：

```
New Scrapy project 'tutorial', using template directory 'c:\users\binbin.hou\appdata\local\programs\python\python37\lib\site-packages\scrapy\templates\project', created in:
    D:\python\tutorial

You can start your first spider with:
    cd tutorial
    scrapy genspider example example.com
```

### 查看目录结构

打开 tutorial 文件夹

```
tutorial/
    scrapy.cfg            # deploy configuration file

    tutorial/             # project's Python module, you'll import your code from here
        __init__.py

        items.py          # project items definition file

        middlewares.py    # project middlewares file

        pipelines.py      # project pipelines file

        settings.py       # project settings file

        spiders/          # a directory where you'll later put your spiders
            __init__.py
```

## 第一个爬虫

新建一个文件 `blog_spider.py` 放在文件夹 `tutorial/spiders`下。


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

## 运行脚本

在项目的顶层执行。

```
$   pwd
D:\python\tutorial
```

执行

```
scrapy crawl blogspider
```

## 保存抓取的数据

```
scrapy crawl blogspider -o blog.json
```

# 部署到 hub 快速开始

## 注册登录

此处我直接使用 github 进行登录。

## Scrapy Cloud Projects

点击新建，创建一个新的爬虫项目。

## Code

在 hub 上，可以查看对应的项目信息

```
$ pip install shub
$ shub login
API key: XXXX
```

然后一直处于登录状态

## Deploys

选择在对应的文件目录下，执行部署命令。

### 路径确认

```
> pwd
D:\python\tutorial

> ls
d-----        2019/4/13     19:07                tutorial
-a----        2019/4/13     19:07            259 scrapy.cfg
```

### 执行部署

运行部署命令：

```
shub deploy 385369
```

- 部署日志

```
Messagepack is not available, please ensure that msgpack-python library is properly installed.
Saving project 385369 as default target. You can deploy to it via 'shub deploy' from now on
Saved to D:\python\tutorial\scrapinghub.yml.
Packing version 1555154269
Created setup.py at D:\python\tutorial
Deploying to Scrapy Cloud project "385369"
Run your spiders at: https://app.scrapinghub.com/p/385369/
{"status": "ok", "project": 385369, "version": "1555154269", "spiders": 1}
```

## Hub 页面查看

直接打开连接 [https://app.scrapinghub.com/p/385369/1](https://app.scrapinghub.com/p/385369/1) 可以看到刚才部署的爬虫。

直接点击右上角的【run】

日志如下：

```

```

### 爬虫项目运行

看的出来，可以可视化的指定优先级，可以执行很多爬虫。

## 定时执行

scrapinghub还有一个强大的功能就是定时执行爬虫任务，一般我们的需求就是每天定时爬取某个站点来获取更新的数据，刚好定时任务就派上用场了。

在scrapinghub中创建定时任务也非常的简单。

在菜单栏左侧点击 Periodic Jobs，就进入到定时任务面板了。



## 数据

可以把收集的数据进行导出。

# 个人收获

这种类似的平台其实非常棒

1. 但是前提是要有钱。

2. 比如 github 在初期肯定需要大量的资金，后期如果做得比较好，就可以利用大量的用户来换取巨额投资。

## 数据

常言道数据无价，谨慎操作。

这个 hub 可以获取到程序员的大量爬虫结果。

## 速度

不知道是不是网速的原因，感觉脚本执行的特别慢。

本地几秒钟的执行脚本，执行了几分钟还没有结束。

## 技术的本质

技术的本质还是一样的。

定时 job 任务的执行。

# 拓展阅读

[多线程]()

[yeild 关键字]()

[python 生成器]()

# 参考资料

[数据采集练习之部署爬虫到Scrapy Cloud](https://www.jianshu.com/p/27e5897bc95b)

- scrapy

[http://doc.scrapy.org/en/latest/intro/tutorial.html](http://doc.scrapy.org/en/latest/intro/tutorial.html)

* any list
{:toc}