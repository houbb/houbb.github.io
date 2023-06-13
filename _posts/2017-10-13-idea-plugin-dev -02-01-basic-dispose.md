---
layout: post
title:  Idea Plugin Dev-02-插件资源销毁 Disposer and Disposable
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---


# Disposer and Disposable

IntelliJ 平台的 Disposer 有助于资源清理。 

如果子系统保持一组资源与父对象的生命周期一致，则子系统的资源应该在父对象之前或同时向处理器注册以释放。

Disposer 管理的最常见的资源类型是侦听器，但还有其他可能的类型：

文件句柄和数据库连接，

缓存和其他重要的数据结构。

Disposer 是管理 Disposable 实例树的单例。 

Disposable 是任何提供 Disposable.dispose() 方法以在特定生命周期后释放重量级资源的对象的接口。

Disposer 支持在父子关系中链接 Disposables。

# 自动处理的对象

许多对象如果实现了 Disposable 接口，就会被平台自动释放。 

这种对象最重要的类型是服务。 

应用级服务在IDE关闭或提供服务的插件卸载时由平台自动处理。 

项目级服务在项目关闭或插件卸载事件中处理。

请注意，不会自动处理在 plugin.xml 中注册的扩展。 

如果一个扩展需要执行一些代码来处理它，你需要定义一个服务并将代码放在它的 dispose() 方法中，或者将它用作父一次性。

# 处理器单例

Disposer 单例的主要**目的是强制执行子 Disposable 永远不会超过其父对象的规则**。

Disposer 在父子关系树中组织 Disposable 对象。

Disposable 对象树确保 Disposer 首先释放父对象的子对象。

有关创建 Disposable 类的更多信息，请参阅 The Disposable Interface。

通过调用 Disposer.register() 来注册一次性用品：

```java
Disposer.register(parentDisposable, childDisposable);
```

## 选择一次性父组件（Choosing a Disposable Parent）

要注册子 Disposable，使用合适生命周期的父 Disposable 来建立父子关系。 可以选择 IntelliJ 平台提供的父 Disposable 之一，也可以是另一个 Disposable。

使用以下准则选择正确的父母：

对于插件整个生命周期所需的资源，请使用应用程序或项目级服务。

对于显示对话框时所需的资源，请使用 DialogWrapper.getDisposable()。

对于显示工具窗口选项卡时所需的资源，将实现 Disposable 的实例传递给 Content.setDisposer()。

对于生命周期较短的资源，使用 Disposer.newDisposable() 创建一次性资源并使用 Disposable.dispose() 手动处理它。 请注意，最好始终为此类一次性服务（例如，项目级服务）指定一个父级，这样如果由于异常或编程错误而未达到 Disposable.dispose() 调用，则不会发生内存泄漏。

Disposer API 的灵活性意味着如果父实例选择不当，子实例消耗资源的时间可能会超过所需时间。 

在不再需要资源时继续使用资源可能会成为争用的严重来源，因为每次调用都会留下一些僵尸对象。 

另一个挑战是常规泄漏检查实用程序不会报告此类问题，因为从技术上讲，从测试套件的角度来看，这不是内存泄漏。

例如，假设为特定操作创建的 UI 组件使用项目级服务作为父对象。 

在那种情况下，整个组件将在操作完成后保留在内存中。 这会造成内存压力，并可能将 CPU 周期浪费在处理不再相关的事件上。

## 使用父一次性注册听众

许多用于注册侦听器的 IntelliJ 平台 API 要么需要传递父一次性对象，要么具有采用父一次性对象的重载。 

例如：

```java
public abstract class EditorFactory {
  // ...
  public abstract void addEditorFactoryListener(@NotNull EditorFactoryListener listener);
  public abstract void addEditorFactoryListener(@NotNull EditorFactoryListener listener, @NotNull Disposable parentDisposable);
  public abstract void removeEditorFactoryListener(@NotNull EditorFactoryListener listener);
}
```

具有 parentDisposable 参数的方法会在处理相应的父一次性对象时自动取消订阅侦听器。 

使用此类方法总是比从 dispose 方法中显式删除侦听器更可取，因为它需要更少的代码并且更容易验证正确性。

要选择正确的父母一次性用品，请使用上一节中的指南。

相同的规则适用于消息总线连接。 

始终将父级一次性传递给 MessageBus.connect()，并确保它具有尽可能短的生命周期。

## 确定处置状态

您可以使用 Disposer.isDisposed() 检查 Disposable 是否已被处置。 

此检查很有用，例如，对于可能在执行回调之前处理的 Disposable 的异步回调。 

在这种情况下，最好的策略通常是什么都不做，早点返回。

## 结束一次性生命周期

插件可以通过调用 `Disposer.dispose(Disposable)` 手动结束 Disposable 生命周期。 

此方法还处理递归处理所有 Disposable 子后代。

# 实现 Disposable 接口

创建类需要实现 Disposable 接口并定义 dispose() 方法。

在许多情况下，当对象实现 Disposable 仅用作父一次性对象时，该方法的实现将完全是空的。

下面显示了一个重要的处置实现示例：

```java
public class Foo<T> extends JBFoo implements Disposable {

  public Foo(@NotNull Project project,
             @NotNull String name,
             @Nullable FileEditor fileEditor,
             @NotNull Disposable parentDisposable) {
    this(project, name, fileEditor, InitParams.createParams(project),
        DetachedToolWindowManager.getInstance(project));
    Disposer.register(parentDisposable, this);
  }

  @Override
  public void dispose() {
    myFooManager.unregister(this);
    myDetachedToolWindowManager.unregister(myFileEditor);
    KeyboardFocusManager.getCurrentKeyboardFocusManager()
        .removePropertyChangeListener("focusOwner", myMyPropertyChangeListener);
    setToolContext(null);
  }
}
```

为简单起见，省略了许多代码设置所有需要在 dispose() 中释放的条件。

无论如何，它说明了基本模式，即：

在这种情况下，父一次性传递给构造函数，

Foo disposable 在构造函数中注册为 parentDisposable 的子项。

dispose() 方法整合了必要的释放操作，将由 Disposer 调用。

# 诊断处理器泄漏 Diagnosing Disposer Leaks﻿

当应用程序退出时，它会执行最终的健全性检查以验证所有内容都已处理。 如果某些东西已在处置器中注册但仍未处置，则 IntelliJ 平台会在关闭前报告它。

在测试和调试模式下（idea.disposer.debug 设置为开），向 Disposer 注册 Disposable 也会为对象的分配路径注册堆栈跟踪。 

Disposer 通过在注册时创建一个虚拟的 Throwable 来实现这一点。

下面的代码片段代表了在实践中遇到的那种“检测到内存泄漏”的错误：

```
java.lang.RuntimeException:
Memory leak detected: <Instance> of class <com.example.classtype>
See the cause for the corresponding Disposer.register() stacktrace:
    at ObjectTree.assertIsEmpty(ObjectTree.java:209)
    at Disposer.assertIsEmpty(Disposer.java:125)
    at Disposer.assertIsEmpty(Disposer.java:121)
    at ApplicationImpl.disposeSelf(ApplicationImpl.java:323)
    at ApplicationImpl.doExit(ApplicationImpl.java:780)
    …
Caused by: java.lang.Throwable
    at ObjectTree.getOrCreateNodeFor(ObjectTree.java:101)
    at ObjectTree.register(ObjectTree.java:62)
    at Disposer.register(Disposer.java:81)
    at Disposer.register(Disposer.java:75)
    …
    at ProjectManagerEx.createProject(ProjectManagerEx.java:69)
    at NewProjectWizardDynamic.doFinish(NewProjectWizardDynamic.java:235)
    at DynamicWizard$1.run(DynamicWizard.java:433)
    at CoreProgressManager$5.run(CoreProgressManager.java:237)
    at CoreProgressManager$TaskRunnable.run(CoreProgressManager.java:563)
    …
```

在这种特定情况下，IntelliJ 平台 (CoreProgressManager) 启动了一个包含 DynamicWizard 代码的任务。 

反过来，该代码分配了一个项目，该项目在应用程序退出时从未被释放。 这是一个很有希望开始挖掘的地方。

上述内存泄漏最终是由于未能将 Project 实例传递给负责注册它以进行处理的函数而引起的。 

通常，内存泄漏的修复非常简单，只需了解正在分配的对象（通常是 UI 容器、项目或应用程序）的内存范围，并确保为其正确调用 Disposer.register() 即可。

# 参考资料

https://plugins.jetbrains.com/docs/intellij/disposers.html#diagnosing-disposer-leaks

* any list
{:toc}