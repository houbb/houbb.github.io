---
layout: post
title:  Idea Plugin Dev-15-08-spi IntelliJ IDEA 插件开发指南 
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# 进入插件世界

## 类别

插件主要分为如下几类：

UI Themes（UI主题）
Custom language support （自定义编程语言支持，如Kotlin)
Framework integration （框架集成，例如Spring，T插件正属于此类）
Tool integration （工具集成，如Maven、Gradle、Git）
User interface add-ons （用户界面组件，例如Random Background）

## 技术栈

开发一个插件需要的用到的技术栈：

Java & Kotlin
IntelliJ SDK
Gradle：依赖管理、sandbox、打包发版
Swing：是的，整个IDEA界面组件用的都是Swing

# 新建插件

官方提供了  [插件模板](https://github.com/JetBrains/intellij-platform-plugin-template)

项目基本结构：

```
├── build.gradle # 构建脚本文件
├── gradle # Gradle包装器
│   └── wrapper
│       ├── gradle-wrapper.jar
│       └── gradle-wrapper.properties # 包装器配置文件
├── gradlew # shell脚本
├── gradlew.bat # 批处理脚本
├── settings.gradle # 对于单个项目，设置文件是可选的
└── src
    └── main
        ├── java
        │   └── io
        │       └── org
        │           └── example
        │               └── plugin
        │                   ├── MyToolWindow.form
        │                   ├── MyToolWindow.java
        │                   └── MyToolWindowFactory.java
        └── resources 
	    ├── images
	    │		├── a.svg
	    │           └── b.svg
	    ├── messages
	    │		├── TBundle.properties #Bundle
		        └── TBundle_zh_CN.properties #国际化Bundle
            ├── META-INF
            │   ├── plugin.xml # 插件配置文件
            └── └── pluginIcon.svg #Plugin Logo ，插件在IDEA/Plugins中的展示图标
```

其中插件的配置文件至关重要：

```xml
<idea-plugin>
 ​
   <!-- 插件名 -->
   <name>MyPrluginName</name>
 ​
   <!-- 插件的唯一标识符，应该是FQN，不设置即name（不推荐） -->
   <id>io.org.example.plugin</id>
 ​
   <!-- 插件描述，使用<![CDATA[  ]]> 来支持HTML格式-->
   <description>Integrates Volume Snapshot Service W10</description>
 ​
    <!-- 插件更新记录，使用<![CDATA[  ]]> 来支持HTML格式-->
   <change-notes>Initial release of the plugin.</change-notes>
 ​
   <!-- 插件版本，格式：BRANCH.BUILD.FIX (MAJOR.MINOR.FIX) -->
   <version>1.1.1</version>
   
    <!-- 插件依赖，可以依赖模块或插件 -->
   <depends>com.intellij.java</depends>
   <depends optional="true" config-file="mysecondplugin.xml">com.MySecondPlugin</depends>
 ​
   <!-- 插件兼容构建的IDE版本， until-build可以不写，默认到最新版 -->
   <idea-version since-build="201" until-build="211"/>
 ​
   <!-- 资源包，kv，方便管理文本以及i18n-->
   <resource-bundle>messages.TBundle</resource-bundle>
 ​
   <!-- 行为 https://plugins.jetbrains.com/docs/intellij/plugin-actions.html-->
   <actions>
   </actions>
   
   
   <!-- 声明该插件对IDEA core或其他插件的扩展，Ns是NameSpace的缩写 -->
   <extensions defaultExtensionNs="com.intellij">
     ...
   </extensions>
   
     <!-- 插件定义的扩展点，以供其他插件扩展该插件，类似Java的抽象类的功能 
     如何在https://plugins.jetbrains.com/docs/intellij/plugin-extensions.html -->
   <extensionPoints>
   </extensionPoints>
   
     <!-- 监听器 
         https://plugins.jetbrains.com/docs/intellij/plugin-listeners.html -->
   <applicationListeners>
     <listener class="io.org.example.plugin.projectManager.MyProjectListener"
               topic="com.intellij.openapi.project.ProjectManagerListener"/>
   </applicationListeners>
 ...... 
 </idea-plugin>
```

# IntelliJ SDK

## PSI

PSI (Program Structure Interface)，程序结构接口，主要负责解析文件、创建语法、语义代码。

IDEA （有很多内置的插件），它们把整个工程的所有元素解析成了它们设计实现的PsiElement，你可以用它们提供的API很方便的去CURD所有元素。

IDEA也支持自定义语言，比较复杂了，需要实现Parser、PsiElement、FileType、Visitor等，有兴趣的话可以看看这个插件

> [simple_language_plugin](https://github.com/JetBrains/intellij-sdk-code-samples/tree/main/simple_language_plugin)

## PsiFile

com.intellij.psi.PsiFile是文件结构的根，表示文件的内容为特定语言中元素的层次结构。

它是所有PSI文件的公共基类，而在特定的语言文件通常是由它的子类来表示。

例如，PsiJavaFile该类表示Java文件，而，XmlFile该类表示XML文件。

> [Implementing Parser and PSI](https://plugins.jetbrains.com/docs/intellij/implementing-parser-and-psi.html)

## View PSI

一开始我也很懵，上哪去知道code对应的是什么PSI，特别是复杂的PSI，像嵌套的注解、xml、json等。

直到有一天发现了神奇宝贝 。

它直接打开了我和PSI之间的大门。

`Tools | View PSI Structure of Current File...` ，使用Gradle:runIde沙箱里才能看到这个工具。

So easy～ 哪里不会点

![video](https://vdn3.vzuu.com/SD/764c5eee-fb4c-11ec-8880-ba49563a26ba.mp4?disable_local_cache=1&bu=078babd7&c=avc.1.1&f=mp4&expiration=1687577688&auth_key=1687577688-0-0-b54bfdd3e933d3ad95ac7b79bc0e1e8a&v=tx&pu=078babd7)

## 常用 API

com.intellij.psi.PsiFileFactory：
文件相关操作，e.g.创建文件等。
com.intellij.psi.PsiElementFactory:
元素相关操作，e.g.创建java方法、注解、字段、构造方法等。
com.intellij.psi.PsiManager:
项目访问PSI服务的主要入口点，e.g.查找文件、查找文件夹等。
com.intellij.psi.PsiClass:
在java类查找元素，e.g.查找方法、字段、注解。
com.intellij.psi.JavaPsiFacade:
java元素查找等操作，e.g.查找类等。

...太多了，有些方法得自己猜下方法名全局去搜，或者猜类名利用IDEA的自动提示去查找。

### 写操作

⚠️ 特别注意，对PsiElement的写操作需要在 writeAction 上下文中

```java
WriteCommandAction.runWriteCommandAction
```

# Virtual Files

虚拟文件VirtualFile（VF）是在IntelliJ的虚拟文件系统（VFS)中的文件表示。虚拟文件即本地文件系统中的文件。

不过，虚拟文件也可以表示JAR文件中的文件：

```java
Library library = LibraryUtil.findLibraryByClass(psiClass.getQualifiedName(), project);
VirtualFile YmlFile = library.getFiles(OrderRootType.CLASSES)[0].findChild(TModuleExplorer.T_YAML);
```

## PsiFIle 和 VF 互转

```java
PsiFile psiFile = PsiManager.getInstance(serverModule.getProject()).findFile(virtualFile);
VirtualFile virtualFile = psiFile.getVirtualFile();
```

# Action

定义

`com.intellij.openapi.actionSystem.AnAction` 是所有Action的基类。

必须覆盖 `AnAction.update(@NotNull AnActionEvent e)`

⚠️它先于actionPerformed()被调用，用来更新动作状态（启用，可见），以确定该动作在IDE的UI中是否可见。

AnActionEvent 类型的对象将传递给此方法，并包含有关该操作的当前上下文的信息。

```java
e.getPresentation().setVisible(false);  //Action不可见
```

必须覆盖AnAction.actionPerformed(@NotNull AnActionEvent e)：Action执行的操作，同样可以从AnActionEvent获取当前操作的上下文。

## 创建

- 根据上述Action定义手动创建。

- 利用Plugin DevKit

## 注册

在plugin.xml定义action注册：

```xml
<action id="T.RefreshProjectAction"
         class="io.org.t.plugin.navigator.action.RefreshProjectAction"
         icon="AllIcons.Actions.Refresh"
         text="Refresh T " description="RefreshProjectAction">
    <keyboard-shortcut keymap="$default" first-keystroke="shift meta T"/>
 </action>
```

# Grouping Action

操作组

## 创建

```java
public class NewTActionGroup extends DefaultActionGroup {}
```

## 绑定UI

```xml
<!-- 注意这里的Bundle -->
 <actions resource-bundle="messages.TBundle">
   <group id="NewTGroupInProjectView"
        class="io.org.t.plugin.navigator.action.NewTActionGroup"
        popup="true">
     <separator/>
     <add-to-group group-id="ProjectViewPopupMenu" anchor="after" relative-to-action="WeighingNewGroup"/>
     <separator/>
   </group>
 </actions>
```

需要在Bundle定义group的Text和description

# Service

调用ServiceManager.getService() 获取服务实例。

IntelliJ平台可确保仅加载一个服务实例，即使它被多次调用也是如此。需要关闭挂钩/清除例程的服务可以在其中实现 Disposable并执行必要的工作dispose()。

## 种类


应用级别（plugin.xml/extensions/applicationService）
项目级别（plugin.xml/extensions/projectService）
模块级别（plugin.xml/extensions/moduleService）

## 创建

由于我开发的插件用的Service都是LightServices即ProjectService，下面只介绍Light Services

https://upsource.jetbrains.com/idea-ce/file/idea-ce-ba0c8fc9ab9bf23a71a6a963cd84fc89b09b9fc8/platform/core-api/src/com/intellij/openapi/components/Service.java

不需要注册plugin.xml，而是使用注释服务类@Service，参考检索服务。

Light Service（since 2019.3）的一些限制：

class需加上注释@Service
class必须以final修饰。
不支持构造函数注入。

```java
@Service
public final class MyProjectService {
   private final Project myProject;
  
   //看大部分源码，一般都会创建getInstance()来获取实例。
   public static MyProjectService getInstance() {
        return ServiceManager.getService(MyProjectService.class);
    }
  
   public MyProjectService(Project project) {
     myProject = project;
   }

   public void someServiceMethod(String parameter) {
     // do some more stuff
   }
}
```

# Plugin UI

## 界面组件

比较常用的组件：

### Tool Windows：

```xml
<! -- plugin.xml -->
<toolWindow id="T" icon="/images/node/T.svg" anchor="left" factoryClass="io.org.t.plugin.navigator.TToolWindowFactory"/>
```

### DialogWrapper：

这是IntelliJ封装好的对话框组件，其包含了OK、Cancel按钮、setTitle、验证、doOkAction等。

## Swing UI Designer

利用Swing UI Designer设计界面：New —> Swing UI Designer —>Create Dialog Class

Palette可以自己自定义或添加其他库提供的组件，比如IDEA的EditorTextField（支持代码高光、代码提示等）

## UI检查器

Gradle:runIde沙箱里，Tools | Internal Actions | UI | UI Inspector ， 如何开启

# Gradle插件

## 安装

Gradle IDEA插件：

## Run or Debug

Gradle｜toolWindow ｜intelliJ ｜runIde ，可以run或者debug，会生成一个sandbox（一个安装了当前插件的IDEA）

## 构建打包

Gradle｜toolWindow ｜intelliJ ｜buildPlugin ，生成的插件zip文件在./build/distributions

## PublishPlugin

官方提供了两种方式：

1）发布到 JetBrains插件存储库

a) 注册 Jetbrains 账号，官网上传插件。

## 我的实现

想了一下，功能实现和安全性上oss都做到了，就在build.gradle写了一个Gradle插件（publisT）和 oss文件更新脚本（updateOss.sh）

- build.gradle

```java
class PublishT implements Plugin<Project> {
    static def myPluginName = "T_Plugin"
    static def myPluginGroup = "t"

    @Override
    void apply(Project project) {
        project.task('checkVersion') {
            log.severe("Start Check T Version...")
            if (project.getVersion().toString() != "unspecified") {
                compareVersion(project)
            } else {
                throw new Exception("[build.gradle]未声明version")
            }
        }.group(myPluginGroup)
        project.task('publishT') {
            def pluginZip = myPluginName + "-" + project.getVersion() + ".zip"
            def ossUrl = "https://xxxx"
            doFirst {
                log.severe("Start Publish T...")
                def xmlFile = project.rootDir.absolutePath + '/updatePlugins.xml'
                def updatePlugins = new XmlSlurper().parse(xmlFile)
                updatePlugins.plugin[0].@version = project.getVersion()
                updatePlugins.plugin[0].@url = ossUrl + pluginZip
                save(xmlFile, updatePlugins)
            }.dependsOn("buildPlugin")
            doLast {
                project.exec {
                    workingDir './'
                    commandLine 'chmod', '+x', './updateOss.sh'
                    commandLine 'sh', './updateOss.sh', pluginZip
                }
                log.severe(String.format(" Successfully released [%s]！", pluginZip))
            }
        }.group(myPluginGroup)
    }
  }
```

- updatePlugins.xml

⚠️ 特别注意，这里的 plugin.id 、version要和plugin.xml里面的一致，不然用户在配置plugin repository 时会提示连接出错。

```xml
<?xml version="1.0" encoding="UTF-8"?><plugins>
  <plugin id="io.org.t.plugin" version="0.3.6" url="https://xxxx/T-0.3.6.zip">
    <idea-version since-build="201"/>
  </plugin>
</plugins>
```

# 有用的链接

IntelliJ Plugin SDK Doc: https://plugins.jetbrains.com/docs/intellij/welcome.html

插件Demo工程: https://github.com/JetBrains/intellij-sdk-code-samples

IntelliJ-IDEA插件社区: https://intellij-support.jetbrains.com/hc/en-us/community/topics/200366979-IntelliJ-IDEA-Open-API-and-Plugin-Development

IntelliJ Platform UI Guidelines：里面定义了一些UI相关的规范以及使用范例。: https://jetbrains.design/intellij/

插件库：可以过滤是否开源~https://plugins.jetbrains.com/search

Gradle: https://docs.gradle.org/current/userguide/userguide.html


# 参考资料

https://zhuanlan.zhihu.com/p/400059601

* any list
{:toc}