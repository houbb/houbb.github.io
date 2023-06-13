---
layout: post
title:  Idea Plugin Dev-05-01-actions 
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# Actions

动作系统允许插件将它们的项目添加到基于 IntelliJ 平台的 IDE 菜单和工具栏。 

例如，其中一个操作类负责 File | 打开文件...菜单项和打开...工具栏按钮。

IntelliJ 平台中的操作需要代码实现并且必须注册。 操作实现确定操作可用的上下文，以及在 UI 中选择时的功能。 

注册确定操作在 IDE 用户界面中的显示位置。 一旦实现并注册，动作就会从 IntelliJ 平台接收回调以响应用户手势。

创建动作教程描述了将自定义动作添加到插件的过程。 

分组操作教程演示了三种可以包含操作的组。

# 详细介绍下 idea 插件 Actions

在 IntelliJ IDEA 插件开发中，Actions 是非常重要的组件，它定义了插件的功能和用户界面上的操作。

Actions 定义了用户可以执行的操作，例如菜单项、工具栏按钮、快捷键等。

以下是关于 IntelliJ IDEA 插件中的 Actions 的详细介绍：

1. 动作层次结构：Actions 在 IntelliJ IDEA 中以层次结构的形式组织。根节点是插件的主要 Action，可以通过插件的插件描述符（plugin.xml）文件中的 `<actions>` 元素定义。子节点可以表示子菜单、分组或具体的操作。

2. AnAction 类：Actions 在插件开发中通常通过扩展 `com.intellij.openapi.actionSystem.AnAction` 类来创建。`AnAction` 类提供了一系列方法来定义和处理操作的行为，例如 `actionPerformed` 方法用于处理操作的主要逻辑。

3. 动作属性：每个 Action 都可以具有各种属性，例如名称、描述、图标、快捷键等。这些属性可以在插件的插件描述符文件中进行配置，也可以在代码中动态设置。

4. 菜单和工具栏：Actions 可以被添加到 IntelliJ IDEA 的菜单栏、工具栏、上下文菜单等位置。可以通过 `plugin.xml` 文件中的 `<actions>` 元素来定义菜单和工具栏的结构，并通过指定 `groupId` 和 `actionId` 将 Action 添加到相应的位置。

5. 动态 Actions：Actions 还可以是动态的，这意味着它们的状态和可用性可以根据上下文动态改变。通过实现 `com.intellij.openapi.actionSystem.DynamicAction` 接口，可以创建动态 Action，并在特定条件下启用或禁用该 Action。

6. 快捷键绑定：Actions 可以与快捷键进行绑定，以便用户可以通过键盘快速触发操作。可以通过 `plugin.xml` 文件中的 `<keyboard-shortcut>` 元素来配置快捷键。

7. 动作事件和监听器：在执行 Action 时，可以触发相应的事件。可以通过实现 `com.intellij.openapi.actionSystem.AnActionListener` 接口来监听 Action 事件，并在事件发生时执行相应的操作。

通过定义和使用 Actions，插件开发人员可以轻松创建各种功能和操作，使插件的功能在 IntelliJ IDEA 用户界面上可见和可操作。

插件可以提供自定义的菜单项、工具栏按钮、上下文菜单等，以便用户可以方便地访问插件的功能。

## 如何使用 Action，给一个入门例子

当使用 IntelliJ IDEA 的插件开发时，可以通过以下步骤使用 Action。

1. 创建一个新的 Java 类，扩展 `com.intellij.openapi.actionSystem.AnAction` 类。

例如，创建一个名为 `HelloAction` 的类。

```java
import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.ui.Messages;

public class HelloAction extends AnAction {

    @Override
    public void actionPerformed(AnActionEvent e) {
        // 在这里定义操作的逻辑
        Messages.showMessageDialog("Hello, World!", "Greeting", Messages.getInformationIcon());
    }
}
```

2. 在插件的 `plugin.xml` 文件中声明 Action。在 `<actions>` 元素下添加一个 `<action>` 元素。

```xml
<actions>
    <action id="myPlugin.HelloAction"
            class="HelloAction"
            text="Say Hello"
            description="A sample action that displays a greeting message"
            icon="icons/hello.png">
    </action>
</actions>
```

在上述代码中，`id` 属性指定了 Action 的唯一标识符，`class` 属性指定了 Action 类的完全限定名，`text` 属性定义了 Action 在菜单项中的显示文本，`description` 属性是对 Action 的描述，`icon` 属性指定了 Action 的图标。

3. 在插件的 `plugin.xml` 文件中声明菜单项。在 `<menus>` 元素下添加一个 `<menu>` 元素，并将 Action 添加到菜单项中。

```xml
<menus>
    <menu id="MyPluginMenu" text="My Plugin" description="My Plugin Menu">
        <add-to-group group-id="EditorPopupMenu" anchor="first" />
        <action id="myPlugin.HelloAction" />
    </menu>
</menus>
```

在上述代码中，`id` 属性指定了菜单项的唯一标识符，`text` 属性定义了菜单项的显示文本，`description` 属性是对菜单项的描述。

`<add-to-group>` 元素用于将菜单项添加到特定的菜单组中，这里示例将菜单项添加到 `EditorPopupMenu` 菜单组中的第一个位置。

4. 构建和运行插件。将插件打包为 `.jar` 文件，并将其安装到 IntelliJ IDEA 中。然后在菜单中找到 `My Plugin` 菜单，并点击 `Say Hello` 菜单项，将显示一个对话框显示 "Hello, World!"。

通过这个简单的例子，您可以了解如何创建和使用 Action，在菜单中添加自定义操作，并定义操作的逻辑。

您可以根据需求扩展和定制 Action 的行为，并与其他插件组件进行交互。


# 参考资料

https://plugins.jetbrains.com/docs/intellij/basic-action-system.html

* any list
{:toc}