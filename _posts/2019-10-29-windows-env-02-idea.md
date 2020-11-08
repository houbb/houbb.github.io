---
layout: post
title: 从零开始的 windows 开发环境搭建-02-idea
date:  2019-9-26 22:35:36 +0800
categories: [Windows]
tags: [windows, tool, sf]
published: true
---

# IDEA 常用的设计

## 常见设置

参见 [idea 工具](https://houbb.github.io/2016/05/06/ide-idea)

# 需要调整的地方

## font-size

直接 `crtl+alt+s` 设置 font 

## serial 相关

直接搜索，设置为系列化的对象生成唯一标识 

## 设置 java 文件头

java 文件还是很需要文件头的，建议常用如下：

file and code template

```java
/**
 * <p> project: ${PROJECT_NAME}-${NAME} </p>
 * <p> create on ${DATE} ${TIME} </p>
 * @author ${USER}
 * @since 1.0.0
 */
```

## 设置常用的 live template

因为经常写重复的代码。

所以定义快捷键是必须的。

- 分组

新建一个分组，比如 DEFINE

- 指令

比如 `$log`，添加描述，内容如下：


选择为 java 声明。

```java
/**
 * $CLASS$ logger
 */
private static final Log LOG = LogFactory.getLog($CLASS$.class);
```

- 变量

其中 `$CLASS$` 是类名称变量，可以在【edit varaibles】 中指定表达式为 `className()`

- 效果

输入 `$log` 加 tab，效果如下：

```java
/**
 * ClientBs logger
 */
private static final Log LOG = LogFactory.getLog(ClientBs.class);
```

## 自动导入

设置确定的包自动导入，

设置不用的包自动移除。

可以让你写代码的时候快捷如飞。


* any list
{:toc}
