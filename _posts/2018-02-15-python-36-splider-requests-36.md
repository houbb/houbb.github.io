---
layout: post
title: Python-36-splider requests 爬虫
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, python3, splider, lang, sh]
published: true
---

# Requests

[Requests](http://docs.python-requests.org/en/master/)  is the only Non-GMO HTTP library for Python, safe for human consumption.

## 特性

请求允许您发送有机草草HTTP / 1.1请求，而无需手工劳动。 

无需手动将查询字符串添加到您的URL，也无需对POST数据进行表单编码。 

由于urllib3，保持活动和HTTP连接池是100％自动的。

# 快速开始

```py
>>> r = requests.get('https://api.github.com/user', auth=('user', 'pass'))
>>> r.status_code
200
>>> r.headers['content-type']
'application/json; charset=utf8'
>>> r.encoding
'utf-8'
>>> r.text
u'{"type":"User"...'
>>> r.json()
{u'private_gists': 419, u'total_private_repos': 77, ...}
```

强大！

# 个人理解

bs4 可以很优雅的处理 html xml 文件信息。

但是对于 http 请求的处理应该交给更加专业的 requests 来处理。

# 参考资料

[python---requests和beautifulsoup4模块的使用](https://www.cnblogs.com/ssyfj/p/9200602.html)

* any list
{:toc}