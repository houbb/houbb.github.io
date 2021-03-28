---
layout: post
title:  vscode extension 插件开发-02-Glossary 术语表
date:  2021-3-09 16:52:15 +0800
categories: [Web]
tags: [web, vscode, plugin, sh]
published: true
---

# 术语表

收录出现在VS Code中独有的或是易引起歧义的词汇，不包含常见词汇，如Extension。该表按首字母排序。 

该表格式：

普通词汇 英文名称 术语名称

单义词 [出处或参考解释链接]() 术语名称：解释

多义词 [出处或参考解释链接]() 术语名称1/术语名称2：解释

Activation Events 激活事件：用于激活插件的VS Code事件钩子。

Contribution Points 发布内容配置点：package.json的一部分，用于配置插件启动命令、用户可更改的插件配置，可以理解为插件的主要配置文件。

Debug Adapter 调试适配器：连接真正的调试程序（或运行时）和调试界面的插件称之为调试适配器。VS Code没有原生调试程序，而是依赖【调试器插件】调用通信协议（调试适配器协议）和VS Code的调试器界面实现。

Extension Manifest 插件清单：VS Code自定义的pacakge.json文件，其中包含着插件的入口、配置等重要信息。

Extensibility 扩展性

Extension Host 扩展主机：与VS Code主进程隔离的插件进程，插件运行的地方，开发者可在这个进程中调用VS Code提供的各类API。

Language Servers 语言服务器：插件模式中使用C/S结构的的服务器端，用于高消耗的特殊插件场景，如语言解析、智能提示等。与之相对，客户端则是普通的插件，两者通过VS Code 的API进行通信。

Language Identifier 语言标识符：定义在发布内容配置的特定标识/名称，便于后续引用该语言配置。通常为某种编程语言的通俗名称，如JavaScript的语言标识符是【javascript】，Python的语言标识符是【python】。

# 参考资料

[vscode插件开发教程](https://www.jianshu.com/p/e642856f6044)

* any list
{:toc}