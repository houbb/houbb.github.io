---
layout: post
title: 如何编写 java 插件-01-overview 
date: 2023-05-14 21:01:55 +0800
categories: [Tool]
tags: [idea, java, tool, sh]
published: false
---

# 需求目的

可能你会想什么场景会需要用到插件开发，其实插件开发算是一种通用的解决方案，由服务平台定义标准让各自使用方进行自需的扩展。

这就像我们非常常用的 P3C 代码检查插件、代码审计插件、脚手架工程创建插件、自动化API提取插件、单元测试统计插件等等，这些都是在 IDEA 代码开发平台扩展出来的各项功能插件。

插件也可以说是一种解决方案，其实与你在代码编程时使用人家已经定义好的标准结构和功能下，扩展出自己的功能时是一样的。而这种方式也可以非常好的解决一些属于代码开发期间不易于放到代码提测后问题场景，并能及时提醒研发人员作出响应的修改处理。


# 准备工作

## 环境说明

IntelliJ Platform Plugin JDK 不是自己安装的JDK1.8等，只有插件JDK才能开发插件

IntelliJ IDEA 2019.3.1 x64 如果你是其他版本，会涉及到 插件工程创建后版本修改

gradle-5.2.1 与 2019 IDEA 版本下的插件开发匹配，如果遇到一些环境问题可以参考我们开篇介绍

推荐阅读：

> [Gradle-01-gradle install on windows](https://houbb.github.io/2018/06/28/gradle-02-install-on-windows)


## 配置 IntelliJ Platform Plugin SDK

IntelliJ Platform Plugin SDK 就是开发 IntelliJ 平台插件的SDK, 是基于 JDK 之上运行的

导航到 File ->Project Structure，选择对话框左侧栏 Platform Settings 下的 SDKs

点击 + 按钮，先选择 JDK，指定 JDK 的路径；再创建 IntelliJ Platform Plugin SDK，指定 home path 为 IDEA 的安装路径，如图

![IntelliJ Platform Plugin SDK](https://img-blog.csdnimg.cn/7af66add286347eaaf68e45516269bcc.png)

## project 选择 sdk

然后再 ide 中选择上面配置的 sdk

![选择](https://img-blog.csdnimg.cn/img_convert/573955c6d64c6621e70ac0de5a56b78f.png)

## 启用 Plugin DevKit

Plugin DevKit 是 IntelliJ 的一个插件，它使用 IntelliJ IDEA 自己的构建系统来为开发 IDEA 插件提供支持。开发 IDEA 插件之前需要安装并启用 Plugin DevKit 。

打开 IDEA，导航到 Settings | Plugins，若插件列表中没有 Plugin DevKit，点击 Install JetBrains plugin，搜索并安装。

![Plugin DevKit](https://img-blog.csdnimg.cn/9f5d9cb0f04c4027b3d885282663dcda.png)

启动并重启。

# idea 插件的 2 种创建方式

在官方文档 https://plugins.jetbrains.com/docs/intellij/disposers.html 介绍开发 IDEA 插件的工程方式有两种，分别是模板方式和 Gradle 工程方式。

这里我们分别演示下不同方式下工程的创建和所涉及到知识点内容的介绍，虽然两种方式都能创建 IDEA 插件工程，但更推荐使用 Gradle 方式。

官方的 2 个文档：

https://plugins.jetbrains.com/docs/intellij/intellij-platform.html

https://jb.gg/plugin-template


# 模板方式创建

## 1. 创建引导

New -> Project -> IntelliJ Platform Plugin

此处主要填写下自己的项目。

另外 idea 2022+，需要 jdk11。

![创建引导](https://img-blog.csdnimg.cn/66ac9b3ee20742098864a13512768090.png#pic_center)

## 文件目录

整体生成的文件目录如下：



```
│  .gitignore
│  build.gradle.kts
│  gradlew
│  gradlew.bat
│  settings.gradle.kts
│
├─.idea
│  │  .gitignore
│  │  dbnavigator.xml
│  │  gradle.xml
│  │  misc.xml
│  │  vcs.xml
│  │  workspace.xml
│  │
│  └─sonarlint
│      └─issuestore
│              index.pb
│
├─.run
│      Run IDE with Plugin.run.xml
│
        │  └─com
        │      └─github
        │          └─houbb
        │              └─ideapluginuseplugin
        └─resources
            └─META-INF
                    plugin.xml
                    pluginIcon.svg
```

ps: 其实发现，这个还是基于 gradle 生成的。

## 核心配置（plugin.xml）文件说明 

```xml
<idea-plugin>
    
  <!-- 插件唯一id，不能和其他插件项目重复，所以推荐使用com.xxx.xxx的格式
       插件不同版本之间不能更改，若没有指定，则与插件名称相同 -->
  <id>com.your.company.unique.plugin.id</id>
   
  <!-- 插件名称，别人在官方插件库搜索你的插件时使用的名称 -->
  <name>CJPlugin</name>
  
  <!-- 插件版本号 -->
  <version>1.0</version>
    
  <!-- 供应商主页和email（不能使用默认值，必须修改成自己的）-->
  <vendor email="support@yourcompany.com" url="http://www.yourcompany.com">YourCompany</vendor>
  <!-- 插件的描述 （不能使用默认值，必须修改成自己的。并且需要大于40个字符）-->
  <description><![CDATA[
      Enter short description for your plugin here.<br>
      <em>most HTML tags may be used</em>
    ]]></description>
  <!-- 插件版本变更信息，支持HTML标签；
       将展示在 settings | Plugins 对话框和插件仓库的Web页面 -->
  <change-notes><![CDATA[
      Add change notes here.<br>
      <em>most HTML tags may be used</em>
    ]]>
  </change-notes>
 
 <!-- 插件兼容IDEAbuild 号-->
  <idea-version since-build="173.0"/>
 
  <!-- 插件所依赖的其他插件的id -->
  <depends>com.intellij.modules.platform</depends>
 
  <extensions defaultExtensionNs="com.intellij">
  <!-- 声明该插件对IDEA core或其他插件的扩展 -->
  </extensions>
 
  <!-- 编写插件动作 -->
  <actions>
  </actions>
 
</idea-plugin>
```

## 添加自己的 actions

```java
package com.github.houbb.ideapluginuseplugin;

import com.intellij.openapi.actionSystem.AnAction;
import com.intellij.openapi.actionSystem.AnActionEvent;
import com.intellij.openapi.ui.Messages;
import org.jetbrains.annotations.NotNull;
import com.intellij.openapi.project.Project;

public class MyAction extends AnAction {

    @Override
    public void actionPerformed(@NotNull AnActionEvent anActionEvent) {
        Project project = anActionEvent.getProject();
        Messages.showMessageDialog(project, "this is message content", "this message title", Messages.getInformationIcon());
    }

}
```

## 将 action 添加到 plugin.xml 中

```xml
<!-- action配置，按钮展示在哪里需要在这配置 -->
<actions>
    <action class="com.github.houbb.ideapluginuseplugin.MyAction" id="myAction" text="action" description="this is action demo" >
        <!-- 将插件放在Tools菜单中的first位置。 -->
        <add-to-group group-id="ToolsMenu" anchor="first" />
    </action>
</actions>
```

另外类似 MyAction 的创建并不是直接创建普通类，而是通过 New -> Plugin DevKit -> Action 的方式进行创建，因为这样的创建方式可以再 plugin.xml 中自动添加 action 配置。

当然如果你要是自己手动创建普通类那样创建 Action 类，则需要自己手动处理配置信息。

# 参考资料

https://blog.csdn.net/qq_63815371/article/details/128722976

[实践idea插件开发](https://blog.csdn.net/cj_eryue/article/details/127059594)

[【idea插件开发】从0入门idea插件开发，idea插件开发教程，如何开发idea插件](https://blog.csdn.net/smile_795/article/details/125470136)

[编写一个IDEA插件之：自动生成Java代码](https://blog.csdn.net/baidu_28523317/article/details/109020050)

[IDEA插件开发（简单案例助你快速入门）](https://blog.csdn.net/qq_44901906/article/details/124718876)

[新手编写IntelliJ IDEA插件](https://blog.csdn.net/qq_63815371/article/details/128722976)

* any list
{:toc}