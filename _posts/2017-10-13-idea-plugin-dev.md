---
layout: post
title:  Idea Plugin Dev
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea]
published: true
---


# Idea Plugin

[Idea Plugin](http://www.jetbrains.org/intellij/sdk/docs/basics/getting_started.html) 我们一直在用。

当然学起来也不难。本篇提供简单的入门范例。

# 一些想法

适合：

1）检测

比如代码质量、语法等

2）代码生成

测试用例、文档等

3）其他工具类

依附于 idea 的便利性，开发对应的工具。

# Quick Start

## Prepare

- Plugin DevKit

【File】=>【Setting】=>【Plugins】=》【Plugin DevKit】

启用这个插件。(默认是开启的)

## New Project

直接新建一个插件项目。

![new plugin project](https://raw.githubusercontent.com/houbb/resource/master/img/idea/2017-10-13-idea-new-plugin.jpg)

- plugin.xml

创建后会在 `resources/META-INF` 下有一个插件配置文件。内容如下：

```xml
<idea-plugin>
  <id>com.your.company.unique.plugin.id</id>
  <name>Plugin display name here</name>
  <version>1.0</version>
  <vendor email="support@yourcompany.com" url="http://www.yourcompany.com">YourCompany</vendor>

  <description><![CDATA[
      Enter short description for your plugin here.<br>
      <em>most HTML tags may be used</em>
    ]]></description>

  <change-notes><![CDATA[
      Add change notes here.<br>
      <em>most HTML tags may be used</em>
    ]]>
  </change-notes>

  <!-- please see http://www.jetbrains.org/intellij/sdk/docs/basics/getting_started/build_number_ranges.html for description -->
  <idea-version since-build="145.0"/>

  <!-- please see http://www.jetbrains.org/intellij/sdk/docs/basics/getting_started/plugin_compatibility.html
       on how to target different products -->
  <!-- uncomment to enable plugin in all products
  <depends>com.intellij.modules.lang</depends>
  -->

  <extensions defaultExtensionNs="com.intellij">
    <!-- Add your extensions here -->
  </extensions>

  <actions>
      <!-- Add your actions here -->
  </actions>

</idea-plugin>
```

- Build Number Ranges

`<idea-version since-build="145.0"/>` 

用于指定插件对应的 idea 版本信息。详情见 [Build Number Ranges](http://www.jetbrains.org/intellij/sdk/docs/basics/getting_started/build_number_ranges.html)。

## Creating an action

- Project Struct

```
├─resources
│  └─META-INF
│          plugin.xml
│
└─src
    └─com
        └─ryo
            └─idea
                └─plugins
                        TextBoxes.java
```

- TextBoxes.java

这个类就是我们定义的 Action。内容如下：

```java
package com.ryo.idea.plugins;

import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.actionSystem.PlatformDataKeys;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.ui.Messages;

/**
 * Created by bbhou on 2017/10/13.
 */
public class TextBoxes extends AnAction {
    // If you register the action from Java code, this constructor is used to set the menu item name
    // (optionally, you can specify the menu description and an icon to display next to the menu item).
    // You can omit this constructor when registering the action in the plugin.xml file.
    public TextBoxes() {
        // Set the menu item name.
        super("Text _Boxes");
        // Set the menu item name, description and icon.
        // super("Text _Boxes","Item description",IconLoader.getIcon("/Mypackage/icon.png"));
    }

    public void actionPerformed(AnActionEvent event) {
        Project project = event.getData(PlatformDataKeys.PROJECT);
        String txt= Messages.showInputDialog(project, "What is your name?", "Input your name", Messages.getQuestionIcon());
        Messages.showMessageDialog(project, "Hello, " + txt + "!\n I am glad to see you.", "Information", Messages.getInformationIcon());
    }
}
```

- Register an action

当我们定义好上述 action 之后，需要进行注册。

注册的方式有两种: [creating_an_action](http://www.jetbrains.org/intellij/sdk/docs/basics/getting_started/creating_an_action.html)

(1) 界面操作

- In your project, on the context menu of the destination package click **New** or press **Alt + Insert**.

- On the **New** menu, click **Action**.

(2) 修改 `plugin.xml`

其中 (1) 实际上是 idea 自动帮我们修改了文件。个人偏向后者。

```xml
<actions>
    <group id="MyPlugin.SampleMenu" text="_Sample Menu" description="Sample menu">
      <add-to-group group-id="MainMenu" anchor="last"  />
      <action id="Myplugin.Textboxes" class="com.ryo.idea.plugins.TextBoxes" text="Text _Boxes" description="A test menu item" />
    </group>
  </actions>
```

`<add-to-group group-id="MainMenu" anchor="last"  />` 将在**主菜单**添加对应菜单栏。
 
`<action id="Myplugin.Textboxes" class="com.ryo.idea.plugins.TextBoxes" text="Text _Boxes" description="A test menu item" />`

`id` 菜单唯一标识。`class` 为对应的实现类。

## Run/Debug

和运行普通项目一样。然后就会启动一个新的 idea 窗口，可以在窗口中看到新添加的主菜单信息。

- To debug a plugin

Select Run/Debug in the main menu, or press <kbd>Shift</kbd> + <kbd>F9</kbd>.

- To run a plugin

Select Run/Run in the main menu, or press <kbd>Shift</kbd> + <kbd>F10</kbd>.


## Deploying a Plugin
 
安装的步骤也比较简单：

一、生成

To deploy a plugin:

- Make your project by invoking Build / Make Project.

- Prepare your plugin for deployment. In the main menu, select **Build / Prepare Plugin Module `<module name>` for Deployment**.

运行完之后，会生成一个 `<module name>.jar` 文件。

二、复制到插件目录

将上述 jar 文件复制到 `.IntelliJIDEAx0\config\plugins`， 重启 Idea 将生效。

关于插件文件夹的定位，详情见[这里](http://www.jetbrains.org/intellij/sdk/docs/basics/settings_caches_logs.html)。

三、安装

这个和安装其他插件很类似。打开设置，直接安装即可。

- In the main menu, select File/Settings to open the Settings dialog box.

- In the Settings dialog box, under IDE Settings, click Plugins.

- In the Plugins area, open the Installed tab, and then select the check-box next to your plugin name.

- When finished, click OK to close the Settings dialog box.

- **Restart** the IDE so that your changes take effect.


## 发布

为了更多人方便地使用我们的插件，可以直接发布到官方仓库中。

> [publishing plugin](http://www.jetbrains.org/intellij/sdk/docs/basics/getting_started/publishing_plugin.html)


* any list
{:toc}












 

