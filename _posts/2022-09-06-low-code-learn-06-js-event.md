---
layout: post
title:  低代码开源源码学习-06-js preventDefault and stopPropagation 阻止默认事件与阻止冒泡
date:  2022-09-06 21:22:02 +0800
categories: [Tool]
tags: [low-code, sh]
published: true
---

# 常见事件

## vue 拖拽事件

@dragstart : 拖拽开始时在被拖拽元素上触发此事件,监听器需要设置拖拽所需数据,从操作系统拖拽文件到浏览器时不触发此事件.

@dragenter : 拖拽鼠标进入元素时在该元素上触发,用于给拖放元素设置视觉反馈,

@dragend : 鼠标在拖放目标上释放时,在拖拽元素上触发.将元素从浏览器拖放到操作系统时不会触发此事件

@dragover: 拖拽时鼠标在目标元素上移动时触发.监听器通过阻止浏览器默认行为设置元素为可拖放元素

# 事件方法

## 例子

```java
handleDrop(e) {
  e.preventDefault()
  e.stopPropagation()
}
```

这里的 preventDefault 和 stopPropagation 是啥意思？

## e.preventDefault

我们知道比如 `<a href="http://www.baidu.com">百度</a>`,这是html中最基础的东西，起的作用就是点击百度链接到http://www.baidu.com,这是属于 `<a>` 标签的默认行为，

而preventDefault方法就是可以**阻止它的默认行为的发生**而发生其他的事情。

## e.stopPropagation

讲stopPropagation方法之前必需先给大家讲解一下js的事件代理。

事件代理用到了两个在JavaSciprt事件中常被忽略的特性：事件冒泡以及目标元素。

当一个元素上的事件被触发的时候，比如说鼠标点击了一个按钮，同样的事件将会在那个元素的所有祖先元素中被触发。这一过程被称为事件冒泡；这个事件从原始元素开始一直冒泡到DOM树的最上层。

对任何一个事件来说，其目标元素都是原始元素，在我们的这个例子中也就是按钮。

目标元素它在我们的事件对象中以属性的形式出现。使用事件代理的话我们可以把事件处理器添加到一个元素上，等待事件从它的子级元素里冒泡上来，并且可以很方便地判断出这个事件是从哪个元素开始的。

stopPropagation方法就是起到**阻止js事件冒泡的作用**。

# 参考资料

[js中的preventDefault与stopPropagation详解](https://blog.csdn.net/leipanbo/article/details/79894821)

* any list
{:toc}
