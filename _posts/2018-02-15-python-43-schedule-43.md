---
layout: post
title: Python-43-schedule 定时执行
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, python3, schedule, lang, sh]
published: true
---

# 定时执行

我们经常需要定时执行一个任务。

在 python 中很多方式实现定时执行。

## python 官方库

time 定时执行

shed 定时执行

threading里的timer,实现非阻塞型

## 开源框架

看了一下对开发者比较友好的框架。

[schedule](https://schedule.readthedocs.io/en/stable/)

## 其他

windows、linux 系统自带的定时执行。

# time

## 入门例子

- 例子

```py
import time

for i in range(1,5):
     print(i)
     time.sleep(1)
```

- 输出内容

```
1
2
3
4
```

## 缺点

这个例子虽然规定了多久执行一次，但是如果我想固定循环执行，就很不方便。

# sche

## 简介

sched模块定义了一个实现通用事件调度程序的类：

```py
class sched.scheduler(timefunc=time.monotonic, delayfunc=time.sleep)
```

scheduler类定义了调度事件的通用接口。 

它需要两个函数来实际处理“外部世界” -  timefunc应该可以在没有参数的情况下调用，并返回一个数字（“时间”，以任何单位表示）。

如果time.monotonic不可用，则timefunc默认为time.time。 

delayfunc函数应该可以用一个参数调用，与timefunc的输出兼容，并且应该延迟那么多时间单位。 

在每个事件运行后，还将使用参数0调用delayfunc，以允许其他线程有机会在多线程应用程序中运行。

## 例子

- sche-test.py

```py
import time
import sched

s = sched.scheduler(time.time, time.sleep)

def print_time(a='default'):
    print("From print_time", time.time(), a)

def print_some_times():
    print(time.time())
    s.enter(10, 1, print_time)
    s.enter(5, 2, print_time, argument=('positional',))
    s.enter(5, 1, print_time, kwargs={'a': 'keyword'})
    s.run()
    print(time.time())

print_some_times()
```

- 测试日志

```
1555307543.8377874
From print_time 1555307548.8392546 keyword
From print_time 1555307548.8392546 positional
From print_time 1555307553.8393369 default
1555307553.8403316
```

## 缺点

任务指定时候会阻塞主线程。

# threading.timer

## 简介

此类表示仅在经过一定时间后才应运行的操作 - 计时器。 Timer是Thread的子类，因此也可以作为创建自定义线程的示例。

与线程一样，通过调用start()方法启动计时器。 通过调用cancel()方法可以停止计时器（在其动作开始之前）。 

计时器在执行其操作之前等待的时间间隔可能与用户指定的时间间隔不完全相同。

- 接口说明

```py
threading.Timer(interval, function, args=None, kwargs=None)
```

创建一个定时器，在经过间隔秒后，将使用参数args和关键字参数kwargs运行函数。 

如果args为None（默认值），则将使用空列表。 

如果kwargs为None（默认值），则将使用空的dict。

## 例子

- timer-test.py

```py
# utf-8
import time
from threading import Timer

def print_time(in_time):
    print("current time: ", time.time(), "; in time: " + in_time)


# timer run
print("Start: ", time.time())
Timer(5, print_time, {time.time()}).start()
Timer(10, print_time, {time.time()}).start()
print("End: ", time.time())
```

- 测试日志

```
Start:  1555308384.7972178
End:  1555308384.8102322
current time:  1555308386.8022282 ; in time: 1555308384.798218
current time:  1555308388.8112411 ; in time: 1555308384.8012347
```

可见，并没有阻塞主线程。

## 缺点

代码编写不是很利于人读写。

也没有达到指定时间定时执行的效果。

# schedule

## 简介

用于定期作业的进程内调度程序，使用构建器模式进行配置。 

Schedule允许您使用简单，人性化的语法以预定的时间间隔定期运行Python函数（或任何其他可调用函数）。

## 快速开始

### install

```
pip install schedule
```

### demo

```py
import time
import schedule

import schedule
import time

def job():
    print("I'm working...")

schedule.every(10).minutes.do(job)
schedule.every().hour.do(job)
schedule.every().day.at("10:30").do(job)
schedule.every().monday.do(job)
schedule.every().wednesday.at("13:15").do(job)
schedule.every().minute.at(":17").do(job)

while True:
    schedule.run_pending()
    time.sleep(1)
```

# 拓展阅读

[time-时间暂定](https://houbb.github.io/2018/02/14/python-41-time-41)

## 个人理解

python 相对应的生态也比较完整，使用起来的方便程度也非常的好。

从某种角度来说，java 的定时库设计的并不友好，可以模仿类似的思想。

借鉴 api，开发一套对应的框架。

# 参考资料

[python定时执行方法](https://www.cnblogs.com/xqnq2007/p/7930159.html)

## sched

[sched — Event scheduler](https://docs.python.org/3/library/sched.html)

## timer

[threading-timer](https://docs.python.org/3/library/threading.html#timer-objects)

## 开源框架

[schedule](https://schedule.readthedocs.io/en/stable/)

* any list
{:toc}