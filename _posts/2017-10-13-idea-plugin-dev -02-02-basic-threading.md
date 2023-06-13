---
layout: post
title:  Idea Plugin Dev-03-threading 多线程
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---


# Read-Write Lock

通常，IntelliJ 平台中与代码相关的数据结构由单个读取器/写入器锁覆盖。

您不得在以下子系统的读取或写入操作之外访问模型：

程序结构接口 (PSI)

虚拟文件系统 (VFS)

项目根模型。

## 读取权限 Read Access

允许从任何线程读取数据。 

从 UI 线程读取数据不需要任何特别的努力。 

但是，从任何其他线程执行的读取操作需要包装在读取操作 (RA) 中。 

不保证相应的对象在几个连续的读取操作之间存活。 

根据经验，每当开始读取操作时，请检查 PSI/VFS/项目/模块是否仍然有效。

API: ApplicationManager.getApplication().runReadAction() or ReadAction run()/compute()

## 读取权限 Write Access

允许从任何线程读取数据。 

从 UI 线程读取数据不需要任何特别的努力。 

但是，从任何其他线程执行的读取操作需要包装在读取操作 (RA) 中。 

不保证相应的对象在几个连续的读取操作之间存活。 

根据经验，每当开始读取操作时，请检查 PSI/VFS/项目/模块是否仍然有效。

API: ApplicationManager.getApplication().runWriteAction() or WriteAction run()/compute()

# 模态(Modality)和 invokeLater()

要将控制权从后台线程传递到事件调度线程 (EDT)，而不是标准的 SwingUtilities.invokeLater()，插件应该使用 ApplicationManager.getApplication().invokeLater()。 

后一个 API 允许为调用指定模态状态 (ModalityState)，即允许执行调用的模态对话框堆栈：

## ModalityState.NON_MODAL

该操作将在所有模态对话框关闭后执行。 如果任何打开的（不相关的）项目显示每个项目的模式对话框，则该操作将在对话框关闭后执行。

## ModalityState.stateForComponent()

当最上面显示的对话框是包含指定组件的对话框或其父对话框之一时，可以执行该操作。

## 未指定-None Specified

将使用 ModalityState.defaultModalityState()。 

在从 UI 线程调用时使用当前模态状态的大多数情况下，这是最佳选择。 

它对使用 ProgressManager 启动的后台进程有特殊处理：来自此类进程的 invokeLater() 可能会在该进程启动的同一对话框中运行。

## ModalityState.any()

无论模态对话框如何，该操作都将尽快执行。 

请注意，此类可运行文件禁止修改 PSI、VFS 或项目模型。

如果 UI 线程活动需要访问基于文件的索引（例如，它正在进行任何项目范围的 PSI 分析、解析引用等），请使用 DumbService.smartInvokeLater()。 

这样，它会在所有可能的索引过程完成后运行。

# Background Processes and ProcessCanceledException

后台进度由 ProgressManager 类管理，它有很多方法可以使用模态（对话框）、非模态（在状态栏中可见）或不可见进度执行给定代码。 

在所有情况下，代码都在与 ProgressIndicator 对象关联的后台线程上执行。 

当前线程的指标可以随时通过 ProgressIndicatorProvider.getGlobalProgressIndicator() 检索。

对于可见的进度，线程可以使用 ProgressIndicator 来通知用户当前状态：例如，设置文本或已完成工作的视觉部分。

进度指示器还提供了处理后台进程取消的方法，无论是通过用户（按下取消按钮）还是通过代码（例如，当当前操作由于项目中的某些更改而变得过时时）。 

可以通过调用 ProgressIndicator.cancel() 将进度标记为已取消。 该过程通过调用 ProgressIndicator.checkCanceled()（如果手边没有指标实例，则调用 ProgressManager.checkCanceled()）对此作出反应。 

如果后台进程已被取消，此调用将抛出一个特殊的未经检查的 ProcessCanceledException。

所有使用 PSI 或其他类型的后台进程的代码都必须为从任何时候抛出的 ProcessCanceledException 做好准备。 

这个异常不应该被记录，而是被重新抛出，它会在启动进程的基础设施中被处理。

应该经常调用 checkCanceled() 以保证进程顺利取消。 PSI 内部有很多 checkCanceled() 调用。 

如果进程执行冗长的非 PSI 活动，请插入显式 checkCanceled() 调用，以便它频繁发生，例如，在每个 N 循环迭代中。

# 读取操作可取消性

后台线程不应长时间执行普通读取操作。 

原因是，如果 UI 线程需要写操作（例如，用户键入内容），则必须尽快获取它。 

否则，UI 将冻结，直到所有后台线程都释放了它们的读取操作。

最著名的方法是在即将发生写入操作时取消后台读取操作，并稍后从头开始重新启动该后台读取操作。 

编辑器突出显示、代码完成、Goto Class/File/... 操作都是这样工作的。

为实现这一点，冗长的后台操作从 ProgressIndicator 开始，并且专用侦听器在启动写入操作时取消该指示器。 

下次后台线程调用 checkCanceled() 时，将抛出 ProcessCanceledException，线程应尽快停止其操作（并完成读取操作）。

有两种推荐的方法可以做到这一点：

1） 如果在 UI 线程上，调用返回 NonBlockingReadAction (NBRA) 的 ReadAction.nonBlocking()

2） 如果已经在后台线程中，请在循环中使用 ProgressManager.getInstance().runInReadActionWithWriteActionPriority()，直到它通过或整个活动变得过时。

在这两种方法中，始终在每个读取操作开始时检查对象是否仍然有效，以及整个操作是否仍然有意义（即，未被用户取消，项目未关闭等）。 

对于 ReadAction.nonBlocking()，请使用 expireWith() 或 expireWhen()。

如果活动必须访问基于文件的索引（例如，它正在进行任何项目范围的 PSI 分析、解析引用等），请使用 ReadAction.nonBlocking(...).inSmartMode()。

# 避免 UI 冻结

## 不要在 UI 线程中执行长时间操作

特别是，不要遍历虚拟文件系统、解析 PSI、解析引用或查询索引/存根。

在某些情况下，平台本身会调用如此昂贵的代码（例如，在 AnAction.update() 中解析），但这些情况正在处理中。 

同时，请尝试加快插件中的速度，因为这通常是有益的，并且还可以提高背景突出显示的性能。 

对于 AnAction 的实现，插件作者应该特别查看 Actions 部分中 AnAction.getActionUpdateThread() 的文档，因为它描述了线程如何为操作工作。

WriteActions 当前必须在 UI 线程上发生，因此为了加快它们的速度，您可以尝试尽可能多地从写入操作移到准备步骤，然后可以在后台调用该准备步骤（例如，使用 ReadAction.nonBlocking()，见上文 ).

不要在事件监听器内部做任何昂贵的事情。 理想情况下，您应该只清除一些缓存。 

您还可以安排事件的后台处理，但要做好准备，一些新事件可能会在后台处理开始之前交付，因此世界可能在那一刻甚至在后台处理过程中发生变化。 

考虑使用 MergingUpdateQueue 和 ReadAction.nonBlocking() 来缓解这些问题。

可以在后台预处理海量批次的 VFS 事件，参见 AsyncFileListener（2019.2 或更高版本）。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/general-threading-rules.html

* any list
{:toc}