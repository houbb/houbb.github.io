---
layout: post
title: test framework-05-测试平台 flow control 流程控制树形前端代码实现
date:  2016-04-27 14:10:52 +0800
categories: [Test]
tags: [junit, framework, open-source, plateform, test]
published: true
---

# 前言

测试平台最强大的一个设计应该是流程控制。

测试平台的用户群体是测试，知道一些简单的判断，但是编程能力一般。

所以我们需要设计一个流程控制的系列组件，让测试拥有近似于开发的编程能力。

# 整体流程的串联

可以通过 tree 的方式，将上面的流程串联在一起

https://element.eleme.io/#/zh-CN/component/tree

# 入门例子

这里用 vue+element-UI 演示，其他类似。

循序渐进，演示一下实现的主流程。

## STEP1: 基本例子

演示一下最基本的 tree 效果

[tree 基本例子](https://houbb.github.io/tools/test-plateform/01-basic.html)

## STEP2: 树的修改

接下来，让其支持树的增加/删除。

[tree 支持编辑](https://houbb.github.io/tools/test-plateform/02-edit.html)

## STEP3: 指定新增的类型

我们把页面分为左右2个部分，左边就是我们原来的树形菜单。

点击【新增】按钮时，直接新增一个节点，同时弹出选择列表，有三个选项：

1. IF条件
2. 并发循环
3. 顺序循环

当选额其中一个选项之后，在右边显示对应的配置信息：

以选择 `IF条件` 为例，右侧页面效果如下：

```
IF 条件                     【保存按钮】
---------------------------------------
节点名称：【节点名称 input】

节点内容：【节点内容的 textarea】
```

点击【保存按钮】之后，才将当前的 `IF 条件` 作为标签 + 节点名称，更新到左侧的树结构。

同时保存对应的节点右侧内容，当下次点击对应的左侧子树时，可以直接支持右侧对应页面数据的反显和编辑。

ROOT 节点点击不需要显示编辑内容，点击页面【提交】控台输入对应的 json 信息。

[tree 支持内容配置](https://houbb.github.io/tools/test-plateform/03-config.html)

# 参考资料

https://github.com/metersphere/metersphere

* any list
{:toc}