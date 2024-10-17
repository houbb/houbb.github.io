---
layout: post
title: Python-47-python 实战之 json 序列化+反序列化
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, python3, cli, lang, sh]
published: true
---


# 场景

通过 python，实现 map 的序列化+反序列化。

# 实际代码

## 初始化

python_dict.py

```python
# 初始化一个空字典
my_map = {}

# 添加键值对
my_map['请求ip'] = '127.0.0.1'

# 打印字典查看结果
print(my_map)
```


## 序列化+反序列化

```py
# -*- coding: utf-8 -*-

import json
my_map = {
    'name': 'John',
    'age': 30,
    'city': 'New York',
    '请求ip': '127.0.0.1'
}

# 序列化字典为JSON字符串
json_str = json.dumps(my_map)

# 打印JSON字符串
print(json_str)

# 反序列化JSON字符串为字典
my_map2 = json.loads(json_str)

# 打印字典
print(my_map2)

# 打印类型以确认
print(type(my_map2))
print(my_map2[u'请求ip'])
```

效果

```
>python map.py
{"city": "New York", "age": 30, "name": "John", "\u8bf7\u6c42ip": "127.0.0.1"}
{u'\u8bf7\u6c42ip': u'127.0.0.1', u'city': u'New York', u'age': 30, u'name': u'John'}
<type 'dict'>
127.0.0.1
```

注意：中文的 key 需要指定 u 前缀，否则会报错。

# chat

## 如何通过 python，初始化一个 map。并且添加 key=请求ip, value=127.0.0.1

在Python中，字典（`dict`）是映射类型，通常用来存储键值对。如果你想要初始化一个字典并添加一个键值对，其中键是“请求ip”，值是`"127.0.0.1"`，你可以这样做：

```python
# 初始化一个空字典
my_map = {}

# 添加键值对
my_map['请求ip'] = '127.0.0.1'

# 打印字典查看结果
print(my_map)
```

这将输出：

```
{'请求ip': '127.0.0.1'}
```

如果你想要使用`map`这个类型，需要注意的是，在Python中`map`是一个内置函数，用于将一个给定的函数应用于可迭代对象的每个元素。

但是，如果你的意图是创建一个字典并使用`map`这个名称，你可以这样做：

```python
# 初始化一个空字典并命名为map
map = {}

# 添加键值对
map['请求ip'] = '127.0.0.1'

# 打印字典查看结果
print(map)
```

这将输出：

```
{'请求ip': '127.0.0.1'}
```

请注意，虽然你可以将字典命名为`map`，但这并不是一个推荐的做法，因为它会覆盖内置的`map`函数，可能会导致代码可读性降低和潜在的命名冲突。通常，我们建议使用`dict`或者更有意义的变量名来存储字典类型的数据。


# 参考资料


* any list
{:toc}