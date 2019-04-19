---
layout: post
title: 量化计算-01-stock 股票基本信息
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

# 参考资料

[BeautifulSoup爬取页面URL三步走](https://blog.csdn.net/lylfv/article/details/81543487)

* any list
{:toc}