---
layout: post
title: Python-44-threading 多线程
date:  2018-02-14 15:09:30 +0800
categories: [Lang]
tags: [python, python3, thread, lang, sh]
published: true
---

# 多线程

线程是一种对于非顺序依赖的多个任务进行解耦的技术。

多线程可以提高应用的响应效率，当接收用户输入的同时，保持其他任务在后台运行。一个有关的应用场景是，将 I/O 和计算运行在两个并行的线程中。

## 例子

以下代码展示了高阶的 threading 模块如何在后台运行任务，且不影响主程序的继续运行:

```py
import threading, zipfile

class AsyncZip(threading.Thread):
    def __init__(self, infile, outfile):
        threading.Thread.__init__(self)
        self.infile = infile
        self.outfile = outfile

    def run(self):
        f = zipfile.ZipFile(self.outfile, 'w', zipfile.ZIP_DEFLATED)
        f.write(self.infile)
        f.close()
        print('Finished background zip of:', self.infile)

background = AsyncZip('mydata.txt', 'myarchive.zip')
background.start()
print('The main program continues to run in foreground.')

background.join()    # Wait for the background task to finish
print('Main program waited until background was done.')
```

多线程应用面临的主要挑战是，相互协调的多个线程之间需要共享数据或其他资源。

为此，threading 模块提供了多个同步操作原语，包括线程锁、事件、条件变量和信号量。

尽管这些工具非常强大，但微小的设计错误却可以导致一些难以复现的问题。

因此，实现多任务协作的首选方法是将对资源的所有请求集中到一个线程中，然后使用 queue 模块向该线程供应来自其他线程的请求。

应用程序使用 Queue 对象进行线程间通信和协调，更易于设计，更易读，更可靠。

# 深入学习

TBC...

# 个人收获

对于任何一种语言的多线程而言，线程安全，锁，信号量，栅栏，守护线程，条件对象，ThreadLocal 等概念都是相通的。

所以把一个语言的底层原理吃透，其他语言也是一样的道理。

# 参考资料

[多线程](https://docs.python.org/zh-cn/3/tutorial/stdlib2.html#multi-threading)

[多线程详解](https://docs.python.org/zh-cn/3/library/threading.html#module-threading)

* any list
{:toc}