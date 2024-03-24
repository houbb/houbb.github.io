---
layout: post
title:  Python-02-Python Windows 环境 windows install python 3.x
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, lang, sh]
published: true
---

# Windows 环境

## 下载

[Windows Python 下载](https://www.python.org/downloads/windows/)

## 安装

此处我选择的 python 3.X 

下载之后，直接双击安装即可。

记得选择 【Add To Path】，就省得手动配置 python 路径了。

## 测试

打开命令行，输入 python 

信息如下：

```
>python
Python 3.7.3 (v3.7.3:ef4ec6ed12, Mar 25 2019, 22:22:05) [MSC v.1916 64 bit (AMD64)] on win32
Type "help", "copyright", "credits" or "license" for more information.
```

然后就进入了 python 的命令行中。

# 入门案例

## 直接输入

```
>>> print("hello python");
hello python
```

直接打印出了对应信息。

## 文件编码

- hello.py

内容如下

```
print("hello py")
```

- 运行测试

命令行运行

```
python hello.py
```

输出信息如下：

```
D:\python>python hello.py
hello py
```

# 参考资料

[BeginnersGuide](https://wiki.python.org/moin/BeginnersGuide)

http://www.runoob.com/python/python-basic-syntax.html

* any list
{:toc}

