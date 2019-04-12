---
layout: post
title: Python-32-clis fire 命令行框架
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, python3, clis, lang, sh]
published: true
---

# Python

[Python Fire](https://github.com/google/python-fire) is a library for automatically generating command line interfaces (CLIs) from absolutely any Python object.

Python Fire is a simple way to create a CLI in Python. 

Python Fire is a helpful tool for developing and debugging Python code. 

Python Fire helps with exploring existing code or turning other people's code into a CLI. 

Python Fire makes transitioning between Bash and Python easier. 

Python Fire makes using a Python REPL easier by setting up the REPL with the modules and variables you'll need already imported and created. 

# 快速开始

## 安装

```
pip install fire
```

- 根据源码安装

```
python setup.py install
```

## hello world

- hello.py

```py
import fire

def hello(name):
  return 'Hello {name}!'.format(name=name)

if __name__ == '__main__':
  fire.Fire()
```

- 测试

```
python hello.py hello world
Hello world!
```

## 简化调用

- hello_fn.py

```py
import fire

def hello(name):
  return 'Hello {name}!'.format(name=name)

if __name__ == '__main__':
  fire.Fire(hello)
```

- 测试

```
python .\hello_fn.py world
Hello world!
```

# 执行多个方法

## 多个方法

- multi_fn.py

```py
import fire

def add(x, y):
  return x + y

def multiply(x, y):
  return x * y

if __name__ == '__main__':
  fire.Fire()
```

- 测试

```
python .\multi_fn.py add 1 2
3
```

## 结合对象

- fire_obj.py

```py
import fire

class Calculator(object):

  def add(self, x, y):
    return x + y

  def multiply(self, x, y):
    return x * y

if __name__ == '__main__':
  calculator = Calculator()
  fire.Fire(calculator)
```

测试

```
python fire_obj.py add 1 2
3
```

## 结合 class

- fire_clz.py

```py
import fire

class Calculator(object):

  def add(self, x, y):
    return x + y

  def multiply(self, x, y):
    return x * y

if __name__ == '__main__':
  fire.Fire(Calculator)
```

- 测试

```
python fire_clz.py add 1 2
3
```

## 组合多个类

```py
import fire

class IngestionStage(object):

  def run(self):
    print('Ingesting! Nom nom nom...')

class DigestionStage(object):

  def run(self, volume=1):
    print(' '.join(['Burp!'] * volume))

  def status(self):
    print('Satiated.')

class Pipeline(object):

  def __init__(self):
    self.ingestion = IngestionStage()
    self.digestion = DigestionStage()

  def run(self):
    self.ingestion.run()
    self.digestion.run()

if __name__ == '__main__':
  fire.Fire(Pipeline)
```

- 测试

```
> python .\intergration_claz.py run
Ingesting! Nom nom nom...
Burp!
> python .\intergration_claz.py ingestion run
Ingesting! Nom nom nom...
> python .\intergration_claz.py  digestion run
Burp!
```

- 个人理解

当我们需要将多个类的行为组合起来的时候，这是一种非常不错的方式。


## 访问属性

- access_prop.py

```py
import fire

class Prop(object):
    
    def __init__(self, code):
        __prop_dict = {"A": "Apple", "B": "Box"}
        self.code = code
        self.name = __prop_dict.get(self.code, self.code)

if __name__ == '__main__':
  fire.Fire(Prop)
```

## 链式调用

更简单的链式调用。

- chain_fn.py

```py
import fire

class Chain(object):
    # int var
    __var=1
    
    def add(self, n):
        self.__var+=n
        return self
    
    def show(self):
        print(self.__var)

if __name__ == '__main__':
  fire.Fire(Chain)
```

- 测试

```
> python .\chain_fn.py add 1 add 1 add 1 show
4
```


# 参数说明

参数提示怎么处理的？



# 参考资料

[python命令行解析工具](https://zhuanlan.zhihu.com/p/31274256)

https://www.jianshu.com/p/d3d6e5dfdbe9


* any list
{:toc}