---
layout: post
title: Python-14-class 类的接口
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, lang, class, sh]
published: true
---

# Python 中的接口问题

作为习惯了 java 语言的开发者来说，我首先想到的是，python 有接口吗？

然后查了一下。大部分的解答如下：

1. 没有。在Python中没必要使用类似Java的interface。因为Python里有多继承和使用鸭子类型。

2. 在Python中，协议就是接口。例如上下文管理协议，只要实现了对应的`__enter__`, `__exit__`方法就实现了这个上下文管理协议。

3. Java中的接口是抽象类的特殊情况，抽象类：对一类事物的抽象。接口：对某一行为抽象。Java中的接口里面全部都是抽象方法。

4. 在Python中，可以用抽象类实现接口

# Python VS Java 接口

## Java

Java里的Interface是一种特殊的类. 要兼容某种协议, 就要implements相应的interface. 

例如, 序列化协议Serializable, 比较/排序协议Comparable.

## Python

而在Python里, 不是通过implements接口类来兼容特定协议, 而是只需通过实现特定的方法. 

例如, 只需要实现 `__getitem__` 方法, 就可以支持索引操作: obj[idx], 实现 `__hash__` 方法就可以支持Hash操作.

用Fluent Python里的话来讲, 要判断一个动物是不是鸭子, Java看的是它的血统: 是否实现了鸭子接口, 是一个鸭子实例； Python则是看它的行为: 是否像鸭子一样走路, 一样叫发声.

Java是静态类型语言, 在编译时就可以通过类型检查知道某调用是否合法, 例如是否可序列化。 

Python是动态类型语言, 加上可在运行时给Object/Class动态添加方法/属性(即Monkey Patching), 在运行时才能知道调用是否合法.


# 基于 ABC 实现抽象类的例子

- Payment.py

```py
'''
desc: 支付接口测试
author: binbin.hou
'''

from abc import abstractmethod, ABCMeta

class Payment(metaclass=ABCMeta):
	'''支付接口：该类定义为抽象类/接口类'''
	@abstractmethod
	def pay(self, amount):
		pass;
	
	
class AliPay(Payment):
	'''支付宝实现'''
	def pay(self, amount):
		print("Ali pay ", amount, " 金额")
		
		
class WeChat(Payment):
	'''微信实现'''
	def pay(self, amount):
		print("WeChat pay ", amount, " 金额")
		
		
'''测试代码'''
ali = AliPay()
weChat = WeChat()
ali.pay(100)
weChat.pay(100)
```

- 日志信息

```
$   python Payment.py
Ali pay  100  金额
WeChat pay  100  金额
```


# 拓展学习

IOC-控制反转

ABC-抽象基础类

# 参考资料

- 接口相关信息

[python--面向对象—接口](https://www.cnblogs.com/gaoshengyue/p/7552557.html)

[Python - python里有类似Java的接口(interface)吗？](https://www.cnblogs.com/allen2333/p/9092580.html)

[python之接口](https://www.cnblogs.com/hester/p/8304932.html)

[Python中的接口](https://blog.csdn.net/weixin_35653315/article/details/78106404)

* any list
{:toc}