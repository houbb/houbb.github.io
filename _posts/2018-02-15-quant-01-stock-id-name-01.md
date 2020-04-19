---
layout: post
title: Qutan-01-stock 股票基本信息
date:  2018-02-14 15:09:30 +0800
categories: [Quant]
tags: [quant, stock, lang, sh]
published: true
---

# 获取所有的沪深股票代码和名称

## 数据的来源

别人整理好的

同花顺

东方(南方)财富网

...

其他：

[上海深圳股票代码一览表](https://hq.gucheng.com/gpdmylb.html)

类似的网站很多，顺便找一个比较好抓取的。

## 实例抓取代码

```py
# -*- coding: utf-8 -*-

# 导入BeautifulSoup和requests模块
from bs4 import BeautifulSoup
import requests
import os

# 获取字符串格式的html_doc。由于content为bytes类型，故需要decode()
url = "https://hq.gucheng.com/gpdmylb.html"
html_doc = requests.get(url).content.decode()  
# 使用BeautifulSoup模块对页面文件进行解析
soup = BeautifulSoup(html_doc, 'html.parser')
# 查找所有tag为'a'的html元素，并生成列表
links = soup.find('section', {'class':'stockTable'}).find_all('a')
# 获取每个元素中'href'键对应的键值--即URL，并放入url_lst
url_lst = []
for item in links:
	# url = item.get('href')
	url = item.contents[0]+","+item.get('href')+"\n"
	url_lst.append(url)
# 过滤url_lst--仅保留包含http的URL
# url_lst = list(filter(lambda url_str: 'http' in url_str, url_lst))

# 写入到文件
with open('stock_base.data', 'w') as f:
	f.writelines(url_lst)
```

# 基本信息处理

股票数据抓取框架使用 [TuShare](http://tushare.org/)。

数据分析清洗使用 [Pandas](https://houbb.github.io/2018/02/14/quant-07-pandas-07)，[numpy](https://houbb.github.io/2019/04/16/numpy-01-overview-01)。

数据存储到磁盘上，不使用数据库。存储 [PyTabe](http://www.pytables.org/)，hdf5格式。

web框架使用 [tornado](http://www.tornadoweb.org/en/stable/)

机器学习，当然使用最流行 [TensorFlow](https://www.tensorflow.org/)

数据展示使用 [echarts](http://echarts.baidu.com/)

# 架构设计

全系使用python实现。

因为都是python的类库，互相之间调用方便。

从数据抓取，数据处理，到数据展示数据运算都是python实现。

最终的数据都到前端展示出来。

主要分为4个文件夹。

jobs 抓取数据并存储实现类。

libs 通用工具类。

web 前端展示框架。

tf 机器学习文件夹，推测数据。

项目使用hdf5 数据格式进行存储。如果要是单机跑数据。需要将服务部署到一起。

要是分布式部署需要使用 nfs 或者存储到，分布式的文件系统上。

将服务拆分。分开跑数据。

hdf5数据格式本身就是压缩的。所以会节省磁盘空间。

然后在安装年月日的目录进行拆分。初期估计也不会太多，完全可以单机跑起来。

所以数据可以存储为：/data/stock/yyyy/yyyMM/yyyyMMdd.hdf5

或者可以使用mysql+分区表存储数据。也可以实现存储股票数据。

并且速度也挺快的。



# 参考资料

[BeautifulSoup爬取页面URL三步走](https://blog.csdn.net/lylfv/article/details/81543487)

[python 股票系统设计](https://blog.csdn.net/freewebsys/article/details/75364909)

* any list
{:toc}