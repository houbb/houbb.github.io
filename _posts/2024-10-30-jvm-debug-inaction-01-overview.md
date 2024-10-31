---
layout: post
title: jvm debug 断点信息 IDEA DEBUG 启动慢，启动卡死，本地IDEA环境，千万千万不要在方法上打断点！太坑了！
date: 2024-10-30 21:01:55 +0800
categories: [Java]
tags: [java, jvm, sh]
published: true
---

# 场景

上周遇到了一个莫名其妙的搞心态的问题，浪费了我好几个小时。

主要是最后问题的解决方式也让我特别的无语，真的是越想越气。

先说结论，也就是标题：

在本地以 Debug 模式启动项目的时候，千万不要在方法上打断点！千万不要！

# 方法断点

首先什么是方法断点呢？

比如这样的，打在方法名这一行的断点：

![方法断点](https://i-blog.csdnimg.cn/blog_migrate/2738df06e826f1c57bd262479792e3c4.png)

点击 IDEA 里面的下面这个图标，View Breakpoints，它会弹出一个框。

这个弹框里面展示的就是当前项目里面所有的断点，其中有一个复选框，Java Method Breakpoints，就是当前项目里面所有的“方法断点”：

![view](https://i-blog.csdnimg.cn/blog_migrate/92c8eaa1533bbb9071721e12137cc054.png)

那么这个玩意到底有什么坑呢？

当项目以 Debug 模式启动的时候，非常非常非常严重地拖慢启动速度。

一起看两个截图。

下面这个是我本地的一个非常简单的项目，没有方法断点的时候，只要 1.753 秒就启动完成了：

# 到底为什么

在找答案的过程中，我发现了这个 idea 的官方社区的链接：

https://intellij-support.jetbrains.com/hc/en-us/articles/206544799-Java-slow-performance-or-hangups-when-starting-debugger-and-stepping

这个贴子，是 JetBrains Team 发布的，关于 Debug 功能可能会导致性能缓慢的问题。

```
Debugger performance can be affected by the following:

Method breakpoints will slow down debugger a lot because of the JVM design, they are expensive to evaluate. Remove method breakpoints and consider using the regular line breakpoints. To verify that you don't have any method breakpoints open .idea/workspace.xml file in the project root directory (or <project>.iws file if you are using the old project format) and look for any breakpoints inside the method_breakpoints node.
Show method return values option is enabled in the Debugger tool window. Try disabling this option to improve the performance.
Enable alternative views for Collections classes and Enable toString()’ object view options enabled in Settings (Preferences on macOS) | Build, Execution, Deployment | Debugger | Data Views. If toString() methods take a long time to complete, disable this option. Note that custom toString() methods can also change the semantics of the application when running under debugger in case the code inside these methods changes the state of your application.
Memory tab in the debugger toolwindow. It is updated on every debugger stop, try to minimize it to improve stepping performance.
Settings (Preferences on macOS) | Build, Execution, Deployment | Debugger | Data Views | Editor | Show values inline. Disable to improve performance.
Settings (Preferences on macOS) | Build, Execution, Deployment | Debugger | Data Views | Java | Predict condition values and exceptions based on data flow analysis. Disable to improve performance.
Enable Mute Renderers option in the Debug tool window Variables view context menu.
See also the following help sections:

Monitor debugger overhead
Improve stepping speed
```

在这个帖子中，第一个性能点，就是 Method breakpoints。

官方是怎么解释这个问题的呢？

我给大家翻译一波。

```
Method breakpoints will slow down debugger a lot because of the JVM design, they are expensive to evaluate.
```

他们说由于 JVM 的设计，方法断点会大大降低调试器的速度，因为这玩意的 “evaluate” 成本很高。

他首先指出了问题的根本原因：

```
it seems that the root issue is that Method Breakpoints are implemented by using JDPA’s Method Entry & Method Exit feature.
```

根本问题在于方法断点是通过使用 JDPA 的 Method Entry & Method Exit 特性实现的。

有同学就要问了，JDPA，是啥？

是个宝贝：

https://docs.oracle.com/javase/8/docs/technotes/guides/jpda/index.html

# JDPA

JPDA，全称 Java Platform Debugger Architecture。

IDEA 里面的各种 Debug 功能，就是基于这个玩意来实现的。

不懂也没关系，这个东西面试又不考，在这里知道有这个技术就行。

接着，他用了四个 any 来完成了跳句四押：

```
This implementation requires the JVM to fire an event each time any thread enters any method and when any thread exits any method.
```

这个实现，要求 JVM，每次，在任何（any）线程进入任何（any）方法时，以及在任何（any）线程退出任何（any）方法时触发事件。

好家伙，这不就是个 AOP 吗？

这么一说，我就明白为什么方法断点的性能这么差了。要触发这么多进入方法和退出方法的事件，可不得耗费这么多时间吗？

具体的细节，他在前面说的研究报告里面都写清楚了，如果你对细节感兴趣的话，可以自行阅读一下他的那篇报告。

话说他这个报告的名字也起得挺唬人的：Method Breakpoints are Evil。

## 问题

一起看两个关键的地方。

第一个是关于 Method Entry & Method Exit 的：

- IDE 将断点添加到其内部方法断点 list 中。

- IDE 告诉前端启用 Method Entry & Method Exit 事件。

- 前端（调试器）通过代理将请求传递给 VM。

- 在每个 Method Entry & Method Exit 事件中，通过整个链将通知转发到 IDE。

- IDE 检查其方法断点 list 是否包含当前的这个方法。

- 如果发现包含，说明这个方法上有一个方法断点，则 IDE 将向 VM 发送一个 SetBreakpoint 请求，打上断点。否则，VM 的线程将被释放，不会发生任何事情。

这里是表明，前面我说的那个类似 AOP 的稍微具体一点的操作。

核心意思就一句话：触发的事件太多，导致性能下降厉害。

第二个关键的地方是这样的：

文章的最后给出了五个结论：

- 方法断点 IDE 的特性，不是 JPDA 的特性。

- 方法断点是真的邪恶，evil 的一比。

- 方法断点将极大地的影响调试程序。

- 只有在真正需要时才使用它们。

- 如果必须使用方法作为断点，请考虑关闭方法退出事件。

前面四个点没啥说的了。

最后一个点：考虑关闭方法退出事件。

这个点验证起来非常简单，在方法断点上右键可以看到这个选项，Method Entry & Method Exit 默认都是勾选上了：

# 总结

[IDEA DEBUG 启动慢，启动卡死，本地IDEA环境，千万千万不要在方法上打断点！太坑了！](https://blog.csdn.net/qq_44866828/article/details/126417687)

# 参考资料

* any list
{:toc}