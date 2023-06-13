---
layout: post
title:  Idea Plugin Dev-10-01-Editors 
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# Working with Text

本教程介绍如何使用操作来访问放置在编辑器中打开的文档中的插入符号。 

使用有关插入符号的信息，将文档中的选定文本替换为字符串。

本教程中的方法在很大程度上依赖于创建和注册操作。 

# 创建一个新的菜单操作

在此示例中，我们从操作访问编辑器。 

本例中 Java 类的源代码是 EditorIllustrationAction。

要注册动作，我们必须将相应的元素添加到插件配置文件 plugin.xml 的 `<actions>` 部分。 

有关详细信息，请参阅操作教程的注册操作部分。 

EditorIllustrationAction 操作在组 EditorPopupMenu 中注册，因此当焦点位于编辑器上时，它可以从上下文菜单中使用：

```xml
<action
    id="EditorBasics.EditorIllustrationAction"
    class="org.intellij.sdk.editor.EditorIllustrationAction"
    text="Editor Replace Text"
    description="Replaces selected text with 'Replacement'."
    icon="SdkIcons.Sdk_default_icon">
  <add-to-group group-id="EditorPopupMenu" anchor="first"/>
</action>
```

# 定义菜单操作的可见性

要确定操作可见和可用的条件，需要 EditorIllustrationAction 覆盖 AnAction.update() 方法。 

要处理文本的选定部分，只有在满足以下要求时才使菜单操作可用是合理的：

- 有一个项目对象，

- 有一个可用的编辑器实例，

- 编辑器中有一个文本选择。

其他步骤将展示如何通过获取 Project 和 Editor 对象的实例来检查这些条件，以及如何显示或隐藏基于它们的操作菜单项。

## 从动作事件中获取活动编辑器的实例

使用传入更新方法的 AnActionEvent 事件，可以通过调用 getData(CommonDataKeys.EDITOR) 获取对编辑器实例的引用。 

同样，要获取项目引用，我们使用 getProject() 方法。

```java
public class EditorIllustrationAction extends AnAction {
  @Override
  public void update(@NotNull AnActionEvent event) {
    // Get required data keys
    Project project = event.getProject();
    Editor editor = event.getData(CommonDataKeys.EDITOR);
    // ...
  }
}
```

注意：还有其他方法可以访问 Editor 实例：

如果 DataContext 对象可用： CommonDataKeys.EDITOR.getData(context);

如果只有 Project 对象可用，请使用 FileEditorManager.getInstance(project).getSelectedTextEditor()

## 获取插入符号模型和选择

在确保项目已打开并获得编辑器实例后，我们需要检查是否有可用的选择。 

SelectionModel 接口是从 Editor 对象访问的。 

确定是否选择了某些文本是通过调用 SelectionModel.hasSelection() 方法来完成的。 

以下是 EditorIllustrationAction.update(AnActionEvent event) 方法的外观：

```java
public class EditorIllustrationAction extends AnAction {
  @Override
  public void update(@NotNull AnActionEvent event) {
    // Get required data keys
    Project project = event.getProject();
    Editor editor = event.getData(CommonDataKeys.EDITOR);

    // Set visibility only in the case of
    // existing project editor, and selection
    event.getPresentation().setEnabledAndVisible(project != null
        && editor != null && editor.getSelectionModel().hasSelection());
  }
}
```

# 安全地替换文档中的选定文本

根据 EditorIllustrationAction.update() 对条件的评估，EditorIllustrationAction 操作菜单项可见。 

要使菜单项执行某些操作，EditorIllustrationAction 类必须覆盖 AnAction.actionPerformed() 方法。 

如下所述，这将需要 EditorIllustrationAction.actionPerformed() 方法来：

- 获得对文档的访问权限。

- 获取定义选择的字符位置。

- 安全地替换选择的内容。

修改选定的文本需要一个 Document 对象的实例，它可以从 Editor 对象访问。 

Document 表示加载到内存中并在基于 IntelliJ 平台的 IDE 编辑器中打开的文本文件的内容。 

稍后执行文本替换时将使用 Document 的实例。

文本替换还需要有关所选内容在文档中的位置的信息，这些信息由从 CaretModel 获得的主要 Caret 对象提供。 

选择信息是根据偏移量来衡量的，偏移量是从文档开头到插入位置的字符数。

可以通过调用 Document 对象的 replaceString() 方法来完成文本替换。 但是，安全地替换文本需要锁定文档并在写入操作中执行任何更改。 

请参阅线程问题部分以了解有关 IntelliJ 平台上的同步问题和更改安全性的更多信息。 此示例更改 WriteCommandAction 中的文档。

完整的 EditorIllustrationAction.actionPerformed() 方法如下所示：

请注意，文档中的选择已使用 Document 对象上的方法替换为字符串，但方法调用包含在写入操作中。

文档更改后，通过调用主插入符号取消选择新文本。

```java
public class EditorIllustrationAction extends AnAction {
  @Override
  public void actionPerformed(@NotNull AnActionEvent event) {
    // Get all the required data from data keys
    Editor editor = event.getRequiredData(CommonDataKeys.EDITOR);
    Project project = event.getRequiredData(CommonDataKeys.PROJECT);
    Document document = editor.getDocument();

    // Work off of the primary caret to get the selection info
    Caret primaryCaret = editor.getCaretModel().getPrimaryCaret();
    int start = primaryCaret.getSelectionStart();
    int end = primaryCaret.getSelectionEnd();

    // Replace the selection with a fixed string.
    // Must do this document change in a write action context.
    WriteCommandAction.runWriteCommandAction(project, () ->
        document.replaceString(start, end, "editor_basics")
    );

    // De-select the text range that was just replaced
    primaryCaret.removeSelection();
  }
}
```

# 参考资料

https://plugins.jetbrains.com/docs/intellij/multiple-carets.html#code-insight-actions

* any list
{:toc}