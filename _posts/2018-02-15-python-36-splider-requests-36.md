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