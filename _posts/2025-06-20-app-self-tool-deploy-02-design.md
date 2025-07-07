---
layout: post
title: 如何设计实现一个部署脚本
date: 2025-6-20 23:45:51 +0800
categories: [Tool]
tags: [tool, sh]
published: true
---

# 说明

需要 md5 check 保证文件是对的。

1）备份原始的文件

2）文件 scp 拷贝到目标文件夹。

3）停止

2.1 下流量操作

stop jar，确保停止成功

4）start jar 确保启动成功

5）上流量

其实是类似的，只不过重启的过程比较快，所以可以比较粗暴一些。

# 参考资料

* any list
{:toc}  