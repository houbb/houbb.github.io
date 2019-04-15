---
layout: post
title: Python-08-iterator 迭代器
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, lang, iter, sh]
published: true
---

# 迭代器

## 方便的 for 

到目前为止，您可能已经注意到大多数容器对象都可以使用 for 语句:

```py
for element in [1, 2, 3]:
    print(element)
for element in (1, 2, 3):
    print(element)
for key in {'one':1, 'two':2}:
    print(key)
for char in "123":
    print(char)
for line in open("myfile.txt"):
    print(line, end='')
```

ps: 这里是所有语言的共性，java 也是如此。

## 内部实现

这种访问风格清晰、简洁又方便。 迭代器的使用非常普遍并使得 Python 成为一个统一的整体。 

在幕后，for 语句会调用容器对象中的 iter()。 

该函数返回一个定义了 `__next__()` 方法的迭代器对象，该方法将逐一访问容器中的元素。 

当元素用尽时，`__next__()` 将引发 StopIteration 异常来通知终止 for 循环。 

你可以使用 next() 内置函数来调用 `__next__()` 方法；

## 例子

这个例子显示了它的运作方式:

```py
>>> s = 'abc'
>>> it = iter(s)
>>> it
<iterator object at 0x00A1DB50>
>>> next(it)
'a'
>>> next(it)
'b'
>>> next(it)
'c'
>>> next(it)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
    next(it)
StopIteration
```

### 和 java 的对比

这里使用 StopIteration 一种异常类中断遍历，好处是只需要两个接口。

缺点也显而易见，不够优雅。会在遍历集合的时候需要异常。

这显然也是一种折中。


# 自定义迭代器

看过迭代器协议的幕后机制，给你的类添加迭代器行为就很容易了。 

定义一个 `__iter__()` 方法来返回一个带有 `__next__()` 方法的对象。 

如果类已定义了 `__next__()`，则 `__iter__()` 可以简单地返回 self:

## 例子

```py
class Reverse:
    """Iterator for looping over a sequence backwards."""
    def __init__(self, data):
        self.data = data
        self.index = len(data)

    def __iter__(self):
        return self

    def __next__(self):
        if self.index == 0:
            raise StopIteration
        self.index = self.index - 1
        return self.data[self.index]
```

测试

```py
>>> rev = Reverse('spam')
>>> iter(rev)
<__main__.Reverse object at 0x00A1DB50>
>>> for char in rev:
...     print(char)
...
m
a
p
s
```

# 参考资料

[python3 迭代器](https://docs.python.org/zh-cn/3/tutorial/classes.html#iterators)

[迭代器和生成器](http://www.runoob.com/python3/python3-iterator-generator.html)

* any list
{:toc}