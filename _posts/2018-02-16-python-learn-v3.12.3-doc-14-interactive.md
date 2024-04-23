---
layout: post
title:  Python v3.12.3 学习-14-Interactive Input Editing and History Substitution
date:  2018-02-14 15:09:30 +0800 
categories: [Lang]
tags: [python, lang, why-learn, sh]
published: true
---

### 14. 交互式输入编辑和历史替换

Python 解释器的某些版本支持编辑当前输入行和历史替换，类似于 Korn shell 和 GNU Bash shell 中的设施。这是使用 GNU Readline 库实现的，该库支持各种编辑样式。这个库有自己的文档，我们这里不会重复。

**14.1. Tab 键补全和历史编辑**

变量和模块名的补全在解释器启动时自动启用，这样 Tab 键就会调用补全函数；它查看 Python 语句名、当前局部变量和可用的模块名。对于点表达式，如 string.a，它将评估表达式直到最后一个 '.'，然后从结果对象的属性中建议补全。注意，如果表达式中包含有 __getattr__() 方法的对象，这可能会执行应用程序定义的代码。默认配置还将你的历史保存到名为 .python_history 的文件中，该文件位于你的用户目录中。下次交互式解释器会话时，历史将再次可用。

**14.2. 交互式解释器的替代方案**

这个设施与解释器的早期版本相比是一个巨大的进步；然而，还有一些遗愿：如果在继续行上建议适当的缩进会很好（解析器知道下一个是否需要缩进标记）。补全机制可能使用解释器的符号表。检查（甚至建议）匹配的括号、引号等的命令也会很有用。

一个已经存在很长时间的增强交互式解释器的替代方案是 IPython，它具有 Tab 键补全、对象探索和高级历史管理功能。它也可以被彻底定制并嵌入到其他应用程序中。另一个类似的增强交互环境是 bpython。

# 参考资料

https://docs.python.org/3.12/tutorial/interactive.html

* any list
{:toc}

