---
layout: post
title: Python-45-prettytable-color 更好的命令号表格输出
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, python3, cli, lang, sh]
published: true
---

# 表格输出-PrettyTable 

PrettyTable is a simple Python library designed to make it quick and easy to represent tabular data in visually appealing ASCII tables. It was inspired by the ASCII tables used in the PostgreSQL shell psql. PrettyTable allows for selection of which columns are to be printed, independent alignment of columns (left or right justified or centred) and printing of “sub-tables” by specifying a row range.

## 快速开始

### install

```
pip3 install PrettyTable
```

### 测试代码

```py
from prettytable import PrettyTable

x = PrettyTable()
```

- 一行行的添加数据

```py
x.set_field_names(["City name", "Area", "Population", "Annual Rainfall"])
x.add_row(["Adelaide",1295, 1158259, 600.5])
x.add_row(["Brisbane",5905, 1857594, 1146.4])
x.add_row(["Darwin", 112, 120900, 1714.7])
x.add_row(["Hobart", 1357, 205556, 619.5])
x.add_row(["Sydney", 2058, 4336374, 1214.8])
x.add_row(["Melbourne", 1566, 3806092, 646.9])
x.add_row(["Perth", 5386, 1554769, 869.4])
```

- 一下添加多列

```py
x.add_column("City name", 
["Adelaide","Brisbane","Darwin","Hobart","Sydney","Melbourne","Perth"])
x.add_column("Area", [1295, 5905, 112, 1357, 2058, 1566, 5386])
x.add_column("Population", [1158259, 1857594, 120900, 205556, 4336374, 3806092, 
1554769])
x.add_column("Annual Rainfall",[600.5, 1146.4, 1714.7, 619.5, 1214.8, 646.9, 
869.4])
```

- 直接展示

```py
print x.get_string()
```

- 效果图

```
+-----------+------+------------+-----------------+
| City name | Area | Population | Annual Rainfall |
+-----------+------+------------+-----------------+
| Adelaide  | 1295 |  1158259   |      600.5      |
| Brisbane  | 5905 |  1857594   |      1146.4     |
| Darwin    | 112  |   120900   |      1714.7     |
| Hobart    | 1357 |   205556   |      619.5      |
| Melbourne | 1566 |  3806092   |      646.9      |
| Perth     | 5386 |  1554769   |      869.4      |
| Sydney    | 2058 |  4336374   |      1214.8     |
+-----------+------+------------+-----------------+
```

## 拓展功能

### 指定展示的列

```py
x.get_string(fields=["City name", "Population"])
```

```
+-----------+------------+
| City name | Population |
+-----------+------------+
| Adelaide  |  1158259   |
| Brisbane  |  1857594   |
| Darwin    |   120900   |
| Hobart    |   205556   |
| Melbourne |  3806092   |
| Perth     |  1554769   |
| Sydney    |  4336374   |
+-----------+------------+
```

### 指定开始结束的位置

```py
print x.get_string(start=1,end=4)
```

```
+-----------+------+------------+-----------------+
| City name | Area | Population | Annual Rainfall |
+-----------+------+------------+-----------------+
| Brisbane  | 5905 |    1857594 | 1146.4          |
| Darwin    | 112  |     120900 | 1714.7          |
| Hobart    | 1357 |     205556 | 619.5           |
+-----------+------+------------+-----------------+
```

### 对齐方式

默认都是居中。

```py
x.align = "r"
print x
```

```
+-----------+------+------------+-----------------+
| City name | Area | Population | Annual Rainfall |
+-----------+------+------------+-----------------+
|  Adelaide | 1295 |    1158259 |           600.5 |
|  Brisbane | 5905 |    1857594 |          1146.4 |
|    Darwin |  112 |     120900 |          1714.7 |
|    Hobart | 1357 |     205556 |           619.5 |
| Melbourne | 1566 |    3806092 |           646.9 |
|     Perth | 5386 |    1554769 |           869.4 |
|    Sydney | 2058 |    4336374 |          1214.8 |
+-----------+------+------------+-----------------+
```

- 更加灵活的指定

```py
x.align["City name"] = "l"
x.align["Area"] = "c"
x.align["Population"] = "r"
x.align["Annual Rainfall"] = "c"
print x
```

效果图

```
+-----------+------+------------+-----------------+
| City name | Area | Population | Annual Rainfall |
+-----------+------+------------+-----------------+
| Adelaide  | 1295 |    1158259 |      600.5      |
| Brisbane  | 5905 |    1857594 |      1146.4     |
| Darwin    | 112  |     120900 |      1714.7     |
| Hobart    | 1357 |     205556 |      619.5      |
| Melbourne | 1566 |    3806092 |      646.9      |
| Perth     | 5386 |    1554769 |      869.4      |
| Sydney    | 2058 |    4336374 |      1214.8     |
+-----------+------+------------+-----------------+
```

### 按照字段排序

```py
print x.get_string(sortby="Population")
```

```
+-----------+------+------------+-----------------+
| City name | Area | Population | Annual Rainfall |
+-----------+------+------------+-----------------+
| Darwin    | 112  |   120900   |      1714.7     |
| Hobart    | 1357 |   205556   |      619.5      |
| Adelaide  | 1295 |  1158259   |      600.5      |
| Perth     | 5386 |  1554769   |      869.4      |
| Brisbane  | 5905 |  1857594   |      1146.4     |
| Melbourne | 1566 |  3806092   |      646.9      |
| Sydney    | 2058 |  4336374   |      1214.8     |
+-----------+------+------------+-----------------+
```

其他更多功能，不在赘述。
# 参考资料

[Python查询12306余票：漂亮的输出-----prettytable和colorama的使用](https://blog.csdn.net/qq_25343557/article/details/78964228)

https://github.com/dprince/python-prettytable

* any list
{:toc}