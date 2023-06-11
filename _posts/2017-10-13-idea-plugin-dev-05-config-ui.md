---
layout: post
title:  Idea Plugin Dev-05-idea 插件 UI 用户界面交互之 ToolWidnow 实战笔记
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---


# 背景

想写一个数据库的访问配置工具。

需要有一个配置页面，输入对应的配置信息。

# 沟通过程

## 如果我想添加一个 action，点击后让用户输入数据库配置信息，应该用哪一种 ui 交互？

如果您想添加一个 action，在用户点击后让其输入数据库配置信息，您可以使用以下两种 UI 交互方式之一：

1. 使用对话框（Dialog）：创建一个自定义的对话框，在其中展示数据库配置相关的表单和输入字段。当用户点击 action 后，打开对话框并让用户填写所需的数据库配置信息。您可以使用 IntelliJ IDEA 的 Swing 或者 JavaFX 组件来构建对话框界面。对话框可以包含文本输入框、下拉列表、复选框等控件，用于接收用户的输入。用户填写完毕后，您可以从对话框中获取所需的配置信息进行后续处理。

2. 使用工具窗口（Tool Window）：创建一个自定义的工具窗口，将数据库配置相关的表单和输入字段放置在工具窗口中。当用户点击 action 后，展示工具窗口供用户输入数据库配置信息。工具窗口可以提供更大的空间用于展示和编辑复杂的配置信息，同时可以在用户配置完毕后保持打开状态以供后续操作。

选择使用对话框还是工具窗口取决于您的具体需求和用户体验的考虑。如果配置信息较简单且只需要用户输入一次，对话框可能更合适。如果配置信息较复杂，或者需要用户多次编辑和保存配置，工具窗口可能更适合。

请注意，在 IntelliJ IDEA 插件开发中，您可以使用 Swing 或者 JavaFX 来构建自定义的对话框或工具窗口，并通过相关 API 进行交互和数据传递。

# 工具窗口（Tool Window）要如何使用呢

## 使用步骤

在 IntelliJ IDEA 插件开发中，您可以通过以下步骤创建和使用工具窗口（Tool Window）：

1. 定义工具窗口的内容：
   - 创建一个继承自 `com.intellij.openapi.wm.ToolWindowFactory` 的工厂类，实现其中的方法。
   - 在工厂类的 `createToolWindowContent` 方法中创建工具窗口的内容面板（通常是自定义的 Swing 或 JavaFX 组件）。
   - 将内容面板添加到工具窗口中。

2. 注册工具窗口：
   - 在插件的 `plugin.xml` 文件中注册工具窗口。
   - 在 `plugin.xml` 文件的 `<application-components>` 或 `<project-components>` 部分中添加相应的扩展点。
   - 指定工厂类和工具窗口的 ID。

3. 显示和使用工具窗口：
   - 通过 `com.intellij.openapi.wm.ToolWindowManager` 类获取工具窗口管理器实例。
   - 使用工具窗口管理器实例中的方法打开、关闭、获取工具窗口等。

## 实现代码

### ToolWindowFactory

我们定义一个简单的 ToolWindow。

```java
package com.github.houbb.database.migrate.idea.plugin.windows;

import com.intellij.openapi.project.Project;
import com.intellij.openapi.wm.ToolWindow;
import com.intellij.openapi.wm.ToolWindowFactory;
import com.intellij.ui.components.JBLabel;
import com.intellij.ui.content.Content;
import com.intellij.ui.content.ContentFactory;
import javax.swing.*;

public class MyToolWindowFactory implements ToolWindowFactory {

    @Override
    public void createToolWindowContent(Project project, ToolWindow toolWindow) {
        try {
            // 创建工具窗口内容面板
            JPanel panel = new JPanel();
            panel.add(new JBLabel("This is my custom tool window!"));

            // 创建工具窗口内容
            ContentFactory contentFactory = ContentFactory.SERVICE.getInstance();
            Content content = contentFactory.createContent(panel, "my content", false);

            // 将内容添加到工具窗口
            toolWindow.getContentManager().addContent(content);
        } catch (Exception exception) {
            exception.printStackTrace();
        }
    }

}
```

创建了一个名为 "myToolWindow" 的工具窗口，并将其内容设置为 "This is my custom tool window!" 的标签。您可以根据自己的需求自定义工具窗口的内容和功能。

### 注册到 plugin.xml

```xml
<extensions defaultExtensionNs="com.intellij">
    <toolWindow id="myToolWindow"
                anchor="right"
                canCloseContents="true"
                factoryClass="com.github.houbb.database.migrate.idea.plugin.windows.MyToolWindowFactory"/>
</extensions>
```

### 效果

这样其实就可以了。

idea 加载的时候，会直接在右侧显示我们的  idea toolWindows。

PS: 这个 toolWindow 可以在 idea 的 【view】=》【Tool Widnows】中找到。

# Action 控制 ToolWindow

## 说明

我们也可以根据 action 控制对应的 toolWindow。

## 代码

```java
package com.github.houbb.database.migrate.idea.plugin.action;

import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.wm.ToolWindow;
import com.intellij.openapi.wm.ToolWindowAnchor;
import com.intellij.openapi.wm.ToolWindowManager;
import com.intellij.openapi.wm.ToolWindowType;

import java.awt.*;

public class DatabaseMigrateAction extends AnAction {

    @Override
    public void actionPerformed(AnActionEvent e) {
        // TODO: insert action logic here
        try {
            Project project = e.getProject();
            if(project != null) {
                ToolWindowManager toolWindowManager = ToolWindowManager.getInstance(project);

                // 获取到对应的 toolWindows，可以进行相关操作
                ToolWindow toolWindow = toolWindowManager.getToolWindow("myToolWindow");

                //实现一个 toggle 的效果
                boolean isActive = toolWindow.isVisible();
                if(isActive) {
                    toolWindow.hide(new Runnable() {
                        @Override
                        public void run() {
                            System.out.println("hide");
                        }
                    });
                } else {
                    toolWindow.show(new Runnable() {
                        @Override
                        public void run() {
                            System.out.println("show");
                        }
                    });
                }
            }
        } catch (Exception exception) {
            exception.printStackTrace();
        }
    }
}
```

我们实现一个 toggle 效果，如果隐藏就显示，显示就隐藏。

以上示例代码中的 `project` 是当前的项目对象，通过 `ToolWindowManager.getInstance(project)` 获取工具窗口管理器实例，然后使用 `getToolWindow("myToolWindow")` 获取具体的工具窗口实例，并调用 `show()` 方法来显示工具窗口。

这样，您就可以使用工具窗口在 IntelliJ IDEA 插件中创建自定义的工具窗口，并在插件中显示和使用它。您可以根据需求在工具窗口中添加更复杂的 UI 组件和交互逻辑，以满足特定的功能要求。

需要注意的是，工具窗口的使用也与插件的上下文有关。

具体而言，有两种类型的工具窗口：

Project 工具窗口：在整个项目范围内共享的工具窗口。可以在项目的上下文中使用，例如在 ToolWindowFactory 中创建和管理。

Editor 工具窗口：与当前打开的编辑器相关联的工具窗口。可以在编辑器上下文中使用，例如在 AnAction 中使用 ToolWindowManager.getInstance(e.getProject()).getToolWindow("myToolWindow") 获取编辑器工具窗口实例。

## 注册 action 

```xml
<actions>
    <!-- Add your actions here -->
    <action id="DatabaseMigrate" class="com.github.houbb.database.migrate.idea.plugin.action.DatabaseMigrateAction"
            text="DatabaseMigrate" description="datebase migrate">
        <add-to-group group-id="ToolsMenu" anchor="first"/>
    </action>
</actions>
```

# 参考资料

* any list
{:toc}
