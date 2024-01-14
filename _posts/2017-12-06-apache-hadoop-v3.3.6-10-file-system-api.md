---
layout: post
title:  Apache Hadoop v3.3.6-10-The Hadoop FileSystem API Definition
date:  2017-12-06 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

# Hadoop文件系统API定义

这是Hadoop文件系统API的规范，它将文件系统的内容建模为一组路径，这些路径可以是目录、符号链接或文件。

在这个领域，惊人地缺乏先前的艺术成果。有多个关于Unix文件系统的inode树的规范，但没有公开定义“Unix文件系统作为数据存储访问的概念模型”的内容。

这个规范试图做到这一点；定义Hadoop文件系统的模型和API，以便多个文件系统可以实现这些API，并向应用程序呈现其数据的一致模型。

它并不试图正式指定文件系统的并发行为，除了记录HDFS所展示的行为，因为这些行为通常被Hadoop客户端应用程序所期望。

- Introduction

- Notation

- Model

- FileSystem class

- OutputStream, Syncable and StreamCapabilities

- Abortable

- FSDataInputStream class

- PathCapabilities interface

- FSDataOutputStreamBuilder class

- Testing with the Filesystem specification

- Extending the specification and its tests

- Uploading a file using Multiple Parts

- IOStatistics

- openFile()

- SafeMode

- LeaseRecoverable

# 参考资料

https://hadoop.apache.org/docs/stable/hadoop-project-dist/hadoop-common/filesystem/index.html

* any list
{:toc}