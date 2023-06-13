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

# Editor Coordinates System. Positions and Offsets

上一教程使用文本演示了如何使用操作来访问放置在编辑器中打开的文档中的插入符号。 

这些示例使用有关插入符号的信息替换了文档中的选定文本。

每个插入符都有一组属性来描述它在几个坐标系中的一个位置。 

本教程介绍如何在编辑器中访问有关插入符号的信息。

## 编辑器基础代码示例

在本教程中，editor_basics 代码示例用于探索插入符位置。 

特别是，由 editor_basics 添加到编辑器上下文菜单的 Caret Position 操作用于检索有关当前插入符位置的信息。 

键盘快捷键也可以启动操作。

菜单操作背后的 Java 类的源代码是 EditorAreaIllustration。 

讨论的重点将是 EditorAreaIllustration.actionPerformed() 方法。 

## 来自 CaretModel 和 Caret 对象的插入位置

可以通过获取 CaretModel 对象的实例来访问插入符号的属性。 

与使用文本教程一样，AnActionEvent 用于获取 Editor 对象。 

Editor 对象提供对 CaretModel 对象的访问，如下所示：

```java
public class EditorAreaIllustration extends AnAction {
  @Override
  public void actionPerformed(@NotNull AnActionEvent event) {
    // Get access to the editor and caret model. update() validated editor's existence.
    Editor editor = event.getRequiredData(CommonDataKeys.EDITOR);
    CaretModel caretModel = editor.getCaretModel();
  }
}
```

# 编辑器坐标系

打开文档时，编辑器会为文档中的行和列分配一个内部的、从零开始的坐标系。 

Document 中的第一行和每行中的第一个字符被指定为零位置。 

文档中的每个字符都分配了一个偏移量，它是从文件开头到该字符的字符计数，从零开始。 

这些 LogicalPosition 坐标用于描述插入符号位置的行号和列号。 

请注意，逻辑位置坐标系与编辑器 UI 不同，它是基于一而不是基于零的。

本教程中讨论的逻辑位置坐标和其他坐标系可用于表征编辑器中的任何位置，而不仅仅是插入符号。 

用于代码洞察的提示根据这些坐标进行表征，例如 HintManager.getHintPosition()。 编辑器中显示的自定义视觉元素（称为嵌体对象）也根据这些坐标系表示。

下图显示了应用于某些示例内容的逻辑位置坐标系。

红框内的字符“s”表示将光标放在该字符上。 

它具有第 1 行第 9 列和偏移量 28 的插入符号位置。

![offset](https://plugins.jetbrains.com/docs/intellij/images/editor_coords.png)

多个插入符文档涵盖了编辑器中多个插入符的主题。 对于本教程，请注意在任何给定时间编辑器中可能有多个插入符号。 

因此，示例在编辑器中使用主插入符号。 

如果编辑器中只有一个插入符，则它是主插入符。 

对于编辑器中有多个插入符的情况，主要插入符是模型中查询和更新方法目前运行的插入符。

## 插入符逻辑位置

插入符号逻辑位置是编辑器中插入符号的从零开始的（行和列）位置。 

逻辑位置信息是从该插入符号的 LogicalPosition 对象中获取的。

**插入符号的逻辑位置行号忽略了更改编辑器中文档显示的设置的影响。** 

这些设置的示例是代码（行）折叠和软换行。 

这些效果意味着无论编辑器中的一行或多行是折叠还是软换行，插入符号逻辑位置行号都不会改变。

在下面的示例 Java 文件中，第 1-3 行的逻辑位置被折叠到第 0 行。脱字符号（一个蓝色块）位于“public”中的字母“p”上。 

使用 editor_basics Caret Position 操作检查插入符，据报告它位于逻辑位置 (5,0) - 即第 5 行，字符 0 - 该行的第一个字符。 这意味着代码折叠不会改变插入符号的逻辑位置：

但是，请注意，即使逻辑位置保持不变，应用代码折叠也会更改插入符号的报告视觉位置。 

下面讨论更多关于视觉位置的信息。 

然而，很明显，代码折叠和软包装的组合意味着插入符号的一个逻辑位置可以映射到多个视觉位置。 

Editor 接口提供了处理插入符逻辑和视觉位置的方法，例如 Editor.logicalToVisualPosition() 方法。

## 插入符号视觉位置

插入符号的视觉位置与逻辑位置的不同之处在于它考虑了编辑器表示设置，例如代码折叠和软换行。 

这样做时，VisualPosition 会计算（从零开始）可以在编辑器中显示的文档的行数。 

因此，视觉位置不能唯一地映射到逻辑位置或基础文档中的相应行。

例如，软换行会影响后续行的视觉位置。 在下图中，Soft Line Wrap 应用于逻辑行 3。 

将插入符号放置在与之前测试相同的字符位置后，很明显逻辑位置没有改变。 

但是，Visual Position 行号增加了一个！ 

每行上的注释说明了逻辑第三行的软包装部分如何被评估为视觉位置第四行，就好像它是一个单独的行一样。

插入符号的逻辑和可视位置对象是从插入符号对象中获取的，如下面的代码片段所示。

```java
public class EditorAreaIllustration extends AnAction {
  @Override
  public void actionPerformed(@NotNull AnActionEvent event) {
    // Get access to the editor and caret model.
    Editor editor = event.getRequiredData(CommonDataKeys.EDITOR);
    CaretModel caretModel = editor.getCaretModel();
    Caret primaryCaret = caretModel.getPrimaryCaret();
    LogicalPosition logicalPos = primaryCaret.getLogicalPosition();
    VisualPosition visualPos = primaryCaret.getVisualPosition();
  }
}
```

## 插入符列位置

列位置是从逻辑（位置）行的开头到该行中当前插入符号位置的字符数。 

使用从零开始的编号系统对字符进行计数，因此一行的第一个字符编号为零。 

请注意，Column Position 不同于使用基于 1 的编号方案的编辑器 UI。

列位置包括：

空格，例如制表符。 选项卡可以占据多列，最多为编辑器设置的选项卡大小。

插入符号选择的字符。

### 插入式精益 Caret Lean

插入符号的列位置是两个字符之间的边界。 

插入符号可以与前面或后面的字符相关联。 

该关联在双向文本中很重要，其中从逻辑列位置到可视列位置的映射不是连续的。

如 LogicalPosition 类中所定义，如果插入符号位置与后续字符相关联，则它向前倾斜。 否则，它与前面的字符相关联。

如 VisualPosition 类中所定义，如果插入符号位置与后继字符相关联，则它向右倾斜。 否则，它与前面的字符相关联。

### 插入符号精益的例子

在下面的示例中，在逻辑第三行的第一个可见字符上放置一个（蓝色）块插入符号会为视觉位置和逻辑位置生成列位置 0。 

请注意，此示例中的文本是单向的。 

在逻辑位置，插入符号向前倾斜，这意味着它与逻辑行中的后续字符相关联。 

对于视觉位置，插入符号向右倾斜，表明它与视觉行中的后续字符相关联。

考虑下面的 Java 代码片段，并使用 editor_basics Caret Position 操作在每一步报告插入符信息。 请务必使用键盘快捷键调用操作，以免插入符号位置受到干扰。

包含 String 变量声明的行包含双向文本。 从行的左端开始，使用箭头键将线形光标推进到 `("` 字符之间，显示插入符坐标列位置的不连续性。

在插入符号首先从 `g(` 到 `("` 之间移动后，逻辑位置和视觉位置的列位置相等，均为 26，并且两者都不倾斜。请注意，由于行缩进，您测量的插入符号位置的值可能具有不同的起始值，但是 位置变化的符号和幅度将相同。

再次推进插入符号似乎不会在视觉上移动光标。 但是，Logical Position 列增加到 59，而 Visual Position 列虽然没有变化，但向右倾斜。

继续在字符串中移动光标（向右）会导致逻辑位置列减少，而视觉位置列增加。

一旦光标前进到 ". 字符之间，逻辑位置列位置再次为 26，并向前倾斜。视觉位置列位置现在为 59。

再次向右移动插入符号似乎不会在视觉上推进光标。 但是，Logical Position 和 Visual Position 列的值都是 59，而且都是 lean。

随着光标向右移动，逻辑和可视列值都会增加。

```java
public void showNow() {
//234567890123456789012345678901234567890123456789012345678901234567890
  String str = new String("تعطي يونيكود رقما فريدا لكل حرف".getBytes(), java.nio.charset.StandardCharsets.UTF_8);
  System.out.println(str);
}
```

逻辑位置中明显的不连续性是因为字符串的 RTL 部分是按照写入它的逻辑字符顺序处理（或计算）的。 

视觉位置的明显连续性是因为字符串的 RTL 部分是按照它在代码中显示的视觉顺序计算的。

## 插入符偏移

插入符号的偏移量是从文档开头到插入符号位置的字符数。 插入符偏移量始终根据逻辑位置计算。 插入符偏移量包括：

文档中的第一个（第 0 个）字符。

空白字符，包括换行符和制表符。

如果 IDE 设置允许，行尾后的任何字符。 （设置 `| 编辑器 | 一般 | 虚拟空间`）

插入符号选择的字符。

下面的示例演示了放置在逻辑第一行第一个字符处的插入符号的偏移量。

注意 Offset 是 22，比第 0 行和第 1 行第一个字符的可见字符数大一个。 这种明显的差异实际上是正确的，因为 Offset 包括第 0 行的换行符。

# 显示插入位置

要显示插入符号逻辑和视觉位置以及偏移量的值，Messages.showInfoMessage() 方法会在执行操作时以通知的形式显示它们。

```java
public class EditorAreaIllustration extends AnAction {

  public void actionPerformed(@NotNull AnActionEvent event) {
    // Get access to the editor and caret model.
    Editor editor = event.getRequiredData(CommonDataKeys.EDITOR);
    CaretModel caretModel = editor.getCaretModel();

    // Getting the primary caret ensures we get the correct one of a possible many.
    Caret primaryCaret = caretModel.getPrimaryCaret();
    // Get the caret information
    LogicalPosition logicalPos = primaryCaret.getLogicalPosition();
    VisualPosition visualPos = primaryCaret.getVisualPosition();
    int caretOffset = primaryCaret.getOffset();

    // Build and display the caret report.
    String report = logicalPos.toString() + "\n" +
        visualPos.toString() + "\n" +
        "Offset: " + caretOffset;
    Messages.showInfoMessage(report, "Caret Parameters Inside The Editor");
  }

}
```

# 3. Handling Editor Events

之前的教程编辑器坐标系描述了在编辑器窗口中使用插入符号坐标系。 

插入符位置在逻辑位置、视觉位置和偏移量方面进行了讨论。 

本教程介绍了编辑器动作系统，它处理由编辑器中的击键事件激活的动作。 

editor_basics 代码示例中的两个类用于说明：

使用 IntelliJ 平台 EditorActionHandler 来操作插入符号。

创建并注册自定义 TypedActionHandler 以拦截击键并更改文档

## 使用 IntelliJ 平台 EditorActionHandler

在本教程的这一部分中，editor_basics 代码示例用于演示克隆现有插入符号。 

自定义操作类将使用 EditorActionManager 访问特定的 EditorActionHandler 以进行插入符号克隆。 

editor_basics 代码示例将 Editor Add Caret 菜单项添加到编辑器上下文菜单：

### 创建菜单操作类

Java 动作类的源代码是 AnAction 的子类 EditorHandlerIllustration。 有关创建动作类的更多信息，请参阅动作教程，其中深入介绍了该主题。

EditorHandlerIllustration 操作在 editor_basic plugin.xml 文件中注册。 请注意，此操作类已注册为出现在编辑器上下文菜单中。

```xml
<actions>
  <action
      id="EditorBasics.EditorHandlerIllustration"
      class="org.intellij.sdk.editor.EditorHandlerIllustration"
      text="Editor Add Caret"
      description="Adds a second caret below the existing one."
      icon="SdkIcons.Sdk_default_icon">
    <add-to-group group-id="EditorPopupMenu" anchor="first"/>
  </action>
</action>
```

### 设置操作菜单条目的可见性

在什么条件下 EditorHandlerIllustration 操作应该能够克隆插入符？ 

仅当 EditorHandlerIllustration.update() 方法中满足以下条件时：

一个项目是开放的，

有一个编辑器，

编辑器中至少有一个插入符号处于活动状态。

在确保 Project 和 Editor 对象可用后，Editor 对象用于验证至少有一个插入符号：

```java
public class EditorHandlerIllustration extends AnAction {
  @Override
  public void update(@NotNull AnActionEvent event) {
    Project project = event.getProject();
    Editor editor = event.getData(CommonDataKeys.EDITOR);

    // Make sure at least one caret is available
    boolean menuAllowed = false;
    if (editor != null && project != null) {
      // Ensure the list of carets in the editor is not empty
      menuAllowed = !editor.getCaretModel().getAllCarets().isEmpty();
    }
    event.getPresentation().setEnabledAndVisible(menuAllowed);
  }
}
```

### 获取正确的 EditorActionHandler

当 EditorHandlerIllustration.actionPerformed() 方法克隆插入符时，它应该使用适当的 IntelliJ 平台 EditorActionHandler。 

需要一个 EditorActionManager 实例来获取正确的 EditorActionHandler。 

EditorActionManager 类提供了一个静态方法来执行此操作。

要从 EditorActionManager 请求正确的 EditorActionHandler，请查阅 IdeActions 接口以获得正确的常量以传递到 EditorActionManager.getActionHandler() 方法。 

对于在主插入符下方克隆插入符，常量是 ACTION_EDITOR_CLONE_CARET_BELOW。 

基于该常量，EditorActionManager 返回 CloneCaretActionHandler 的实例，它是 EditorActionHandler 的子类。

```java
// Snippet from EditorHandlerIllustration.actionPerformed()
EditorActionManager actionManager = EditorActionManager.getInstance();
EditorActionHandler actionHandler = actionManager.getActionHandler(IdeActions.ACTION_EDITOR_CLONE_CARET_BELOW);
```

### 使用 EditorActionHandler 克隆插入符号

要克隆插入符，只需调用 EditorActionHandler.execute() 方法并传入适当的上下文。

```java
public class EditorHandlerIllustration extends AnAction {
  @Override
  public void actionPerformed(@NotNull AnActionEvent event) {
    Editor editor = event.getRequiredData(CommonDataKeys.EDITOR);
    EditorActionManager actionManager = EditorActionManager.getInstance();
    EditorActionHandler actionHandler =
        actionManager.getActionHandler(IdeActions.ACTION_EDITOR_CLONE_CARET_BELOW);
    actionHandler.execute(editor,
        editor.getCaretModel().getPrimaryCaret(), event.getDataContext());
  }
}
```

# 创建自定义 TypedActionHandler

TypedActionHandler 接口是**处理来自编辑器的击键事件的类的基础**。 

该类的自定义实现已注册以处理编辑器击键事件，并接收每次击键的回调。 

下面的步骤解释了如何使用 TypedActionHandler 来自定义接收到击键事件时编辑器的行为。

## 实现自定义 TypedActionHandler 类

首先在TypedActionHandler的基础上创建一个子类如MyTypedHandler。 

该类覆盖了 TypedActionHandler.execute() 方法，它是编辑器击键事件的回调。

## 实现击键事件处理逻辑

覆盖 MyTypedHandler 中的 TypedActionHandler.execute() 方法以实现处理击键事件的逻辑。 

当编辑器工具窗口具有焦点时，每次按下一个键时都会调用此方法。

在下面的示例中，MyTypedHandler.execute() 方法在发生击键事件时在零插入符号偏移位置插入“editor_basics\n”。 

如使用文本中所述，对文档的安全修改必须在写入操作的上下文中进行。 

因此，尽管 Document 接口上的方法执行字符串插入，但写入操作可确保稳定的上下文。

```java
class MyTypedHandler implements TypedActionHandler {
  @Override
  public void execute(@NotNull Editor editor,
                      char c,
                      @NotNull DataContext dataContext) {
    Document document = editor.getDocument();
    Project project = editor.getProject();
    Runnable runnable = () -> document.insertString(0, "editor_basics\n");
    WriteCommandAction.runWriteCommandAction(project, runnable);
  }
}
```

## 注册自定义 TypedActionHandler

必须注册 TypedActionHandler 的自定义实现以替换现有的键入处理程序以接收编辑器击键事件。 

注册是通过 TypedAction 类完成的。

如下面的代码片段所示，EditorActionManager 用于访问 TypedAction 类。 

TypedAction.setupHandler() 方法用于注册自定义 MyTypedHandler 类：

```java
public class EditorHandlerIllustration extends AnAction {
  static {
    EditorActionManager actionManager = EditorActionManager.getInstance();
    TypedAction typedAction = actionManager.getTypedAction();
    typedAction.setupHandler(new MyTypedHandler());
  }
}
```

将注册代码放在 EditorHandlerIllustration 类中有点武断，因为 MyTypedHandler 的注册与 EditorHandlerIllustration 类无关。

但是，EditorHandlerIllustration 类很方便，因为它作为一个动作在应用程序启动时被实例化。 

在实例化时，会评估 EditorHandlerIllustration 中的静态代码块。 

在 editor_basics 代码示例中，任何 AnAction 派生类都可以用于注册 MyTypedHandler。

# 参考资料


https://plugins.jetbrains.com/docs/intellij/multiple-carets.html#code-insight-actions

* any list
{:toc}