---
layout: post
title:  低代码开源源码学习-01-drag 拖拽事件
date:  2022-09-03 21:22:02 +0800
categories: [Tool]
tags: [low-code, sh]
published: true
---

# vue 拖拽事件

@dragstart : 拖拽开始时在被拖拽元素上触发此事件,监听器需要设置拖拽所需数据,从操作系统拖拽文件到浏览器时不触发此事件.

@dragenter : 拖拽鼠标进入元素时在该元素上触发,用于给拖放元素设置视觉反馈,

@dragend : 鼠标在拖放目标上释放时,在拖拽元素上触发.将元素从浏览器拖放到操作系统时不会触发此事件

@dragover: 拖拽时鼠标在目标元素上移动时触发.监听器通过阻止浏览器默认行为设置元素为可拖放元素



# 参考资料

https://blog.csdn.net/m0_60559048/article/details/123359788

* any list
{:toc}
