---
layout: post
title: java 键盘鼠标操作-01-如何操作鼠标
date: 2024-03-27 21:01:55 +0800
categories: [Java]
tags: [java, robot, sh]
published: false
---

# 需求

我们希望通过 java 控制鼠标的操作。


# 实现

在Java中，模拟鼠标左键点击的操作同样可以通过java.awt.Robot类来实现。

以下是一个简单的示例，展示了如何使用Robot类来模拟鼠标左键的点击动作：


# 方向键问题

后来发现在 Java 中，方向的模拟在游戏中无效。

# JNativeHook
\
是一个用于为Java提供全局键盘和鼠标监听器的库。这将允许您监听全局快捷键或鼠标移动，这些在纯Java中是不可能的。为了完成这项任务，JNativeHook通过Java的本地接口（JNI）利用依赖于平台的本地代码来创建低级别的系统全局钩子，并将这些事件传递给您的应用程序。

以下事件可以通过它们各自的监听器来获得：

- 键按下事件（Key Press Events）
- 键释放事件（Key Release Events）
- 键输入事件（Key Typed Events）
- 鼠标按下事件（Mouse Down Events）
- 鼠标释放事件（Mouse Up Events）
- 鼠标点击事件（Mouse Click Events）
- 鼠标移动事件（Mouse Move Events）
- 鼠标拖拽事件（Mouse Drag Events）
- 鼠标滚轮事件（Mouse Wheel Events）

除了全局事件监听器外，这个库还具有将原生事件发送回本地操作系统的能力。




## 小结

问题是永恒的，但是解法却多是多变的。

在**人类历史的长河中，我们总是在不断地努力接近答案**。

我是老马，期待与你的下次重逢。

# 参考资料

* any list
{:toc}
