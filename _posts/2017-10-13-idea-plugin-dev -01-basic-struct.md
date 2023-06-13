---
layout: post
title:  Idea Plugin Dev-01-插件结构 plugin struct
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea]
published: true
---


# Plugin Content

插件的分发将使用Gradle或Plugin DevKit构建。

插件的.jar文件必须包含以下内容：

配置文件（META-INF/plugin.xml）（插件配置文件）

实现插件功能的类

推荐：插件标志文件（META-INF/pluginIcon*.svg）（插件标志）

请参阅有关优化插件分发文件的重要步骤的“分发大小”。

无法将插件分发定位到特定操作系统（问题）。

## 无依赖的插件

一个由单个.jar文件组成的插件被放置在/plugins目录中。

```
.IntelliJIDEAx0/
└── plugins
    └── sample.jar
        ├── com/company/sample/SamplePluginService.class
        │   ...
        │   ...
        └── META-INF
            ├── plugin.xml
            ├── pluginIcon.svg
            └── pluginIcon_dark.svg
```

## 带有依赖项的插件

插件的.jar文件与所有所需的捆绑库一起放置在插件的“根”文件夹下的/lib文件夹中。

/lib文件夹中的所有.jar文件都会自动添加到类路径中（也请参阅插件类加载器）。

```
.IntelliJIDEAx0/
└── plugins
    └── sample
        └── lib
            ├── lib_foo.jar
            ├── lib_bar.jar
            │   ...
            │   ...
            └── sample.jar
                ├── com/company/sample/SamplePluginService.class
                │   ...
                │   ...
                └── META-INF
                    ├── plugin.xml
                    ├── pluginIcon.svg
                    └── pluginIcon_dark.svg
```

# Bundling Plugin API Sources

如果一个插件公开自己的API供其他插件使用，那么考虑将插件的API源码捆绑在ZIP分发中是值得的。

如果第三方插件使用Gradle IntelliJ插件，并添加了一个依赖于将源码捆绑在ZIP分发中的插件，那么源码将自动附加到插件库中，并且在开发人员导航到API类时在IDE中可见。

能够看到API源码极大地改善了开发体验，强烈建议将它们捆绑在一起。

# API源码的位置

API源码的JAR文件必须位于插件ZIP分发中的 `example-plugin.zip!/plugin/lib/src` 目录中，例如：

```
example-plugin.zip
└── example-plugin
    └── lib
        ├── example-plugin.jar
        └── src
            └── example-plugin-api-src.jar
```

插件ZIP可以包含多个源码JAR文件，并且对于源码JAR的命名没有严格的规定。

## 定义插件 API

通常，以下类被视为插件API：

扩展点及相关类

监听器及相关类

提供对插件数据/行为访问的服务和实用工具

请记住，API应该是稳定的，并且很少更改，因为每个不兼容的更改都会破坏客户端插件。还建议使用具有明确职责的多个模块组织插件代码，例如：

example-plugin-api - 包含API的模块

example-plugin-impl - 包含插件功能代码的模块，这些代码不打算被客户端插件扩展或使用

定义API的一般规则是包括可能由客户端插件代码使用的类。

当然，更复杂的插件可能需要更精细的结构。请参阅Gradle IntelliJ插件-使用示例。

## 在 Gradle 构建脚本中捆绑 API 源

在最简单的情况下，如果项目由单个模块组成，并且插件 API 在包中明确隔离，例如 com.example.plugin.openapi，包括源 JAR 可以通过将以下片段添加到 Gradle 构建脚本的任务部分来实现：

```kotlin
tasks {
  val createOpenApiSourceJar by registering(Jar::class) {
    // Java sources
    from(sourceSets.main.get().java) {
      include("**/com/example/plugin/openapi/**/*.java")
    }
    // Kotlin sources
    from(kotlin.sourceSets.main.get().kotlin) {
      include("**/com/example/plugin/openapi/**/*.kt")
    }
    destinationDirectory.set(layout.buildDirectory.dir("libs"))
    archiveClassifier.set("src")
  }

  buildPlugin {
    dependsOn(createOpenApiSourceJar)
    from(createOpenApiSourceJar) { into("lib/src") }
  }
}
```

上述配置将创建一个包含 com.example.plugin.openapi 包中的 Java 和 Kotlin 源文件的源 JAR，并将其添加到所需的 example-plugin.zip!/example-plugin/lib/src 中的最终插件 ZIP 分发中 目录。

如果你的插件是Gradle项目，没有明确的开放API包分离，建议将插件项目重组为Gradle多项目变体，并创建一个专用的开放API子项目，其中包含最终要包含的所有API源 由主要插件 Gradle 项目创建的发行版。

# Class Loaders

一个单独的类加载器用于加载每个插件的类。 这允许每个插件使用不同的库版本，即使 IDE 本身或另一个插件使用相同的库。

## 捆绑库

第三方软件和许可证列出了每个产品的所有捆绑库及其版本。

## 覆盖 IDE 依赖项

Gradle 7 引入了实现范围，取代了编译范围。 

对于此设置，要使用项目定义的依赖项而不是捆绑的 IDE 版本，请将以下代码片段添加到 Gradle 构建脚本中：

```kotlin
configurations.all {
  resolutionStrategy.sortArtifacts(ResolutionStrategy.SortOrder.DEPENDENCY_FIRST)
}
```

## 插件依赖类

默认情况下，主 IDE 类加载器加载在插件类加载器中找不到的类。 

但是，在 plugin.xml 文件中，您可以使用 `<depends>` 元素来指定一个插件依赖于一个或多个其他插件。 

在这种情况下，这些插件的类加载器将用于当前插件中未找到的类。 这允许插件从其他插件引用类。

## 使用服务加载器

一些库使用 ServiceLoader 来检测和加载实现。 为了在插件中工作，必须将上下文类加载器设置为插件的类加载器，然后使用初始化代码周围的原始类加载器恢复：

# Actions

IntelliJ 平台提供了操作的概念。 

动作是从 AnAction 派生的类，当其菜单项或工具栏按钮被选中时，将调用其 actionPerformed() 方法。

操作是用户调用插件功能的最常见方式。 

可以使用键盘快捷键或帮助 | 从菜单或工具栏调用操作。 查找操作...查找。

动作被组织成组，而这些组又可以包含其他组。 

一组操作可以形成工具栏或菜单。 组的子组可以形成菜单的子菜单。

用户可以通过菜单和工具栏设置自定义所有已注册的操作。

请参阅动作系统了解如何在 IDE 中创建和注册动作。

# Extensions

扩展是插件扩展 IntelliJ 平台功能的最常见方式，其方式不像向菜单或工具栏添加操作那样简单。

以下是使用扩展完成的一些最常见的任务：

com.intellij.toolWindow 扩展点允许插件添加工具窗口（显示在 IDE 用户界面两侧的面板）；

com.intellij.applicationConfigurable 和 com.intellij.projectConfigurable 扩展点允许插件将页面添加到设置对话框；

自定义语言插件使用许多扩展点来扩展 IDE 中的各种语言支持功能。

平台和捆绑插件中有 1000 多个可用扩展点，允许自定义 IDE 行为的不同部分。

## 探索可用的扩展

扩展点和监听器列表列出了 IntelliJ 平台和 IntelliJ IDEA 中捆绑插件的所有可用扩展点。 

此外，在第 VIII 部分 — 产品特定下提供了特定于 IDE 的专用扩展点和侦听器列表。 通

过 IntelliJ Platform Explorer 浏览开源 IntelliJ 平台插件的现有实现中的用法。

或者（或在使用第 3 方扩展点时），可以使用 plugin.xml 中 `<extensions>` 块内的自动完成列出指定命名空间 (defaultExtensionNs) 的所有可用扩展点。 

使用视图 | 查找列表中的快速文档，以访问有关扩展点和实现的更多信息（如果适用）。 

有关更多信息和策略，请参阅探索 IntelliJ 平台 API。

## Declaring Extensions

为阐明此过程，请考虑 plugin.xml 文件的以下示例部分，该部分定义了两个旨在访问 IntelliJ 平台中的 com.intellij.appStarter 和 com.intellij.projectTemplatesFactory 扩展点的扩展，以及一个用于访问另一个的扩展。 

plugin.myExtensionPoint 在另一个插件another.plugin 中的扩展点：

```xml
<!--
  Declare extensions to access extension points in the IntelliJ Platform.
  These extension points have been declared using "interface".
 -->
<extensions defaultExtensionNs="com.intellij">
  <appStarter
      implementation="com.example.MyAppStarter"/>
  <projectTemplatesFactory
      implementation="com.example.MyProjectTemplatesFactory"/>
</extensions>

<!--
  Declare extensions to access extension points in a custom plugin "another.plugin".
  The "myExtensionPoint" extension point has been declared using "beanClass"
  and exposes custom properties "key" and "implementationClass".
-->
<extensions defaultExtensionNs="another.plugin">
  <myExtensionPoint
      key="keyValue"
      implementationClass="com.example.MyExtensionPointImpl"/>
</extensions>
```

# Services

服务是当您的插件调用相应 ComponentManager 实例的 getService() 方法时按需加载的插件组件（请参阅类型）。 

IntelliJ 平台确保仅加载服务的一个实例，即使它被多次调用也是如此。 

服务用于封装在一组相关类上运行的逻辑，或者提供一些可以跨插件项目使用的可重用功能，并且在概念上与其他语言或框架中的服务类没有区别。

服务必须具有用于服务实例化的实现类。 服务也可能有一个接口类，用于获取服务实例并提供服务的 API。

需要关闭挂钩/清理例程的服务可以实现 Disposable 并在 dispose() 中执行必要的工作（请参阅自动处理对象）。

## 类型

IntelliJ 平台提供三种类型的服务：应用级服务（全局单例）、项目级服务和模块级服务。 

对于后两者，为其对应范围的每个实例创建一个单独的服务实例，参见项目模型介绍。

## 构造函数

项目/模块级服务构造函数可以有一个项目/模块参数。 要提高启动性能，请避免在构造函数中进行任何繁重的初始化。

## 轻型服务

不会被覆盖的服务不需要在 plugin.xml 中注册（请参阅声明服务）。 

相反，使用 `@Service` 注释服务类。 

项目级服务必须指定@Service(Service.Level.PROJECT)。 服务实例将根据调用者在范围内创建（请参阅检索服务）。

限制：

这些属性都不是必需的：os、client、overrides、id、preload。

服务类必须是最终的。

不支持依赖服务的构造函数注入。

如果应用程序级服务是 PersistentStateComponent，则必须禁用漫游 (roamingType = RoamingType.DISABLED)。

### Examples

Application-level light service:

```java
@Service
public final class MyAppService {
  public void doSomething(String param) {
    // ...
  }
}
```

Project-level light service example:

```java
@Service(Service.Level.PROJECT)
public final class MyProjectService {
  private final Project myProject;

  public MyProjectService(Project project) {
    myProject = project;
  }

  public void doSomething(String param) {
    String projectName = myProject.getName();
    // ...
  }
}
```

## 声明服务

要注册非轻型服务，为每种类型提供不同的扩展点：

com.intellij.applicationService - 应用级服务

com.intellij.projectService - 项目级服务

com.intellij.moduleService - 模块级服务（不推荐，见上面的注释）

要公开服务 API，请为 serviceInterface 创建单独的类，并在 serviceImplementation 中注册的相应类中扩展它。 

如果未指定 serviceInterface，则它应该具有与 serviceImplementation 相同的值。

要为测试/无头环境提供自定义实现，请另外指定 testServiceImplementation/headlessImplementation。

### Example

Application-level service:

```java
public interface MyAppService {
  void doSomething(String param);
}

public class MyAppServiceImpl implements MyAppService {
  @Override
  public void doSomething(String param) {
    // ...
  }
}
```

Project-level service:

```java
public interface MyProjectService {
  void doSomething(String param);
}

public class MyProjectServiceImpl {
  private final Project myProject;

  public MyProjectServiceImpl(Project project) {
    myProject = project;
  }

  public void doSomething(String param) {
    String projectName = myProject.getName();
    // ...
  }
}
```

Registration in plugin.xml:

```xml
<extensions defaultExtensionNs="com.intellij">
  <!-- Declare the application-level service -->
  <applicationService
      serviceInterface="com.example.MyAppService"
      serviceImplementation="com.example.MyAppServiceImpl"/>

  <!-- Declare the project-level service -->
  <projectService
      serviceInterface="com.example.MyProjectService"
      serviceImplementation="com.example.MyProjectServiceImpl"/>
</extensions>
```

# 检索服务  Retrieving a Service

获取服务不需要读取操作，可以从任何线程执行。 

如果一个服务被多个线程请求，它将在第一个线程中被初始化，其他线程将被阻塞，直到它被完全初始化。

```java
MyAppService applicationService =
    ApplicationManager.getApplication().getService(MyAppService.class);

MyProjectService projectService =
    project.getService(MyProjectService.class);
```

服务实现可以使用方便的静态 getInstance() 或 getInstance(Project) 方法包装这些调用：

```java
MyAppService applicationService = MyAppService.getInstance();

MyProjectService projectService = MyProjectService.getInstance(project);
```

## 示例插件

要阐明如何使用服务，请考虑代码示例中提供的 maxOpenProjects [示例插件](https://github.com/JetBrains/intellij-sdk-code-samples/tree/main/max_opened_projects)。

此插件有一个应用程序服务，用于计算 IDE 中当前打开的项目数。 如果此数量超过插件允许的同时打开项目的最大数量 (3)，它会显示一条警告消息。

有关如何设置和运行插件的信息，请参阅代码示例。

# 定义项目级监听器

项目级侦听器以相同的方式注册，除了顶级标记是 `<projectListeners>`。 

它们可用于监听项目级事件，例如，工具窗口操作：

```xml
<idea-plugin>
  <projectListeners>
    <listener
        class="myPlugin.MyToolWindowListener"
        topic="com.intellij.openapi.wm.ex.ToolWindowManagerListener"/>
  </projectListeners>
</idea-plugin>
```

实现侦听器接口的类可以定义一个接受项目的单参数构造函数，它将接收为其创建侦听器的项目实例：

```java
package myPlugin;

public class MyToolWindowListener implements ToolWindowManagerListener {
  private final Project project;

  public MyToolwindowListener(Project project) {
    this.project = project;
  }

  @Override
  public void stateChanged(@NotNull ToolWindowManager toolWindowManager) {
    // handle the state change
  }
}
```

## 附加属性

可以使用以下属性限制侦听器的注册：

os - 允许将侦听器限制为给定的操作系统，例如 os="windows" 仅适用于 Windows（2020.1 及更高版本）

activeInTestMode - 如果 Application.isUnitTestMode() 返回 true，则设置为 false 以禁用侦听器

activeInHeadlessMode - 如果 Application.isHeadlessEnvironment() 返回 true，则设置为 false 以禁用侦听器。 

此外，还涵盖了 activeInTestMode，因为测试模式意味着无头模式。

# Extension Points

通过在您的插件中定义扩展点，您可以允许其他插件扩展您的插件的功能。 有两种类型的扩展点：

接口扩展点允许其他插件使用代码扩展您的插件。 

当你定义一个接口扩展点时，你指定了一个接口，其他插件将提供实现该接口的类。 然后您将能够调用这些接口上的方法。

Bean 扩展点允许其他插件使用数据扩展您的插件。 

您指定扩展类的完全限定名称，其他插件将提供将转换为该类实例的数据。

## 声明扩展点

您可以在插件配置文件 plugin.xml 的 `<extensions>` 和 `<extensionPoints>` 部分中声明扩展和扩展点。

要在您的插件中声明扩展点，请将 `<extensionPoints>` 部分添加到您的 plugin.xml。 

然后插入一个子元素 `<extensionPoint>`，分别在 name、beanClass 和 interface 属性中定义扩展点名称和 bean 类的名称或允许扩展插件功能的接口。

- myPlugin/META-INF/plugin.xml

```xml
<idea-plugin>
  <id>my.plugin</id>

  <extensionPoints>
    <extensionPoint
            name="myExtensionPoint1"
            beanClass="com.example.MyBeanClass"/>

    <extensionPoint
            name="myExtensionPoint2"
            interface="com.example.MyInterface"/>
  </extensionPoints>

</idea-plugin>
```

name 属性为此扩展点分配一个唯一的名称。 它在使用扩展点中所需的完全限定名称是通过将插件 `<id>` 前缀为“命名空间”后跟 来构建的。 

分隔符：my.plugin.myExtensionPoint1 和 my.plugin.myExtensionPoint2。

beanClass 属性设置一个 bean 类，该类指定一个或多个使用 @Attribute 注释进行注释的属性。 

请注意，bean 类不遵循 JavaBean 标准。 实施 PluginAware 以获取有关提供实际扩展的插件的信息。

interface 属性设置了一个接口，该接口对扩展点有贡献的插件必须实现。

area 属性确定扩展将被实例化的范围。 由于扩展应该是无状态的，因此不建议使用非默认。 

必须是应用程序的 IDEA_APPLICATION（默认）、项目的 IDEA_PROJECT 或模块范围的 IDEA_MODULE 之一。

对扩展点有贡献的插件将从 plugin.xml 文件中读取这些属性。

### sample

为阐明这一点，请考虑上述 plugin.xml 文件中使用的以下示例 MyBeanClass bean 类：

myPlugin/src/com/myplugin/MyBeanClass.java

```java
public class MyBeanClass extends AbstractExtensionPointBean {

  @Attribute("key")
  public String key;

  @Attribute("implementationClass")
  public String implementationClass;

  public String getKey() {
    return key;
  }

  public String getClass() {
    return implementationClass;
  }

}
```

对于上述扩展点，在 anotherPlugin 中的用法如下所示（另请参见声明扩展）：

- anotherPlugin/META-INF/plugin.xml

```xml
<idea-plugin>
  <id>another.plugin</id>

  <!-- Declare dependency on plugin defining extension point: -->
  <depends>my.plugin</depends>

  <!-- Use "my.plugin" namespace: -->
  <extensions defaultExtensionNs="my.plugin">
    <myExtensionPoint1
            key="someKey"
            implementationClass="another.some.implementation.class"/>

    <myExtensionPoint2
            implementation="another.MyInterfaceImpl"/>
  </extension>

</idea-plugin>
```

## 使用扩展点

要在运行时引用所有已注册的扩展实例，请声明一个 ExtensionPointName，传入与其在 plugin.xml 中的声明相匹配的完全限定名称。

- myPlugin/src/com/myplugin/MyExtensionUsingService.java

```java
public class MyExtensionUsingService {

  private static final ExtensionPointName<MyBeanClass> EP_NAME =
          ExtensionPointName.create("my.plugin.myExtensionPoint1");

  public void useExtensions() {
    for (MyBeanClass extension : EP_NAME.getExtensionList()) {
      String key = extension.getKey();
      String clazz = extension.getClass();
      // ...
    }
  }

}
```

ExtensionPointName 声明的装订线图标允许导航到 plugin.xml 中相应的 `<extensionPoint>` 声明。 

代码洞察可用于扩展点名称字符串文字 (2022.3)。

## 动态扩展点

要支持动态插件（2020.1 及更高版本），扩展点必须遵守特定的使用规则：

每次使用都会枚举扩展，并且扩展实例不会存储在任何地方

或者，ExtensionPointListener 可以执行必要的数据结构更新（通过 ExtensionPointName.addExtensionPointListener() 注册）

然后可以通过在声明中添加 dynamic="true" 来将符合这些条件的扩展点标记为动态的：

```xml
<extensionPoints>
  <extensionPoint
          name="myDynamicExtensionPoint"
          beanClass="com.example.MyBeanClass"
          dynamic="true"/>
</extensionPoints>
```

# Plugin Configuration File

plugin.xml 配置文件包含有关插件的所有信息，这些信息显示在插件设置对话框中，以及所有已注册的扩展、操作、侦听器等。

下面的部分详细描述了所有元素。

可以在 IntelliJ SDK 文档代码示例存储库中找到示例 plugin.xml 文件。

## 附加插件配置文件

除了主 plugin.xml 之外，插件还可以包含其他配置文件。 

它们具有相同的格式，并且包含在指定插件依赖项的 `<depends>` 元素的配置文件属性中。 

但是，plugin.xml 中所需的某些元素和属性在其他配置文件中会被忽略。 

如果要求不同，下面的文档将明确说明。 

附加配置文件的一个用例是当插件提供仅在某些 IDE 中可用且需要某些模块的可选功能时。

## 有用的资源

请确保遵循插件概述页面中的指南，以便在 JetBrains Marketplace 上以最佳方式展示您的插件。 

忙碌的插件开发者。 

第 2 集更详细地讨论了优化 JetBrains Marketplace 插件页面的 5 个技巧。

另请参阅有关小部件和徽章的市场营销。

# Plugin Logo

从版本 2019.1 开始，IntelliJ 平台支持用徽标表示插件。 

插件徽标旨在成为插件功能、技术或公司的独特代表。

注意：插件中使用的图标和图像有不同的要求。 有关详细信息，请参阅使用图标和图像。

## 插件标志用法

插件徽标显示在 JetBrains Marketplace 中。 它们还出现在基于 IntelliJ 平台的 IDE 的设置插件管理器 UI 中。 无论是在线还是在产品 UI 中，插件 Logo 都可以帮助用户在列表中更快地识别插件，如下所示：

![plugin](https://plugins.jetbrains.com/docs/intellij/images/plugin_prefs.png)

## 将插件徽标文件添加到插件项目

插件徽标文件必须位于插件分发文件的 META-INF 文件夹中，即您上传到插件存储库并安装到 IDE 中的 plugin.jar 或 plugin.zip 文件。

要在您的分发文件中包含插件徽标文件，请将插件徽标文件放入插件项目的 resources/META-INF 文件夹中。 例如：

![icons](https://plugins.jetbrains.com/docs/intellij/images/resource_directory_structure.png)

# Plugin Dependencies

一个插件可能依赖于其他插件的类，这些插件可能是捆绑的、第三方的或同一作者的。

本文档描述了声明插件依赖项和可选插件依赖项的语法。 

有关 IntelliJ 平台模块依赖项的更多信息，请参阅本文档的第二部分：与 IntelliJ 平台产品的插件兼容性。

## 所需步骤

要表达对来自其他插件或模块的类的依赖，请执行本页下方详述的以下三个必需步骤：

找到插件 ID

项目设置

plugin.xml 中的声明

如果在运行时出现了java.lang.NoClassDefFoundError，则意味着第3步被省略或加载插件依赖失败（请查看开发实例的日志文件）。

## 1. 定位插件 ID 并准备沙盒

必须根据插件的兼容性仔细选择兼容版本。 对于非捆绑插件，无法为依赖插件指定最低/最高版本。 （问题）

JetBrains 市场

对于在 JetBrains Marketplace 上发布的插件：

打开插件的详细信息页面

向下滚动到底部的附加信息部分

复制插件 ID

捆绑和其他插件

使用 Gradle IntelliJ 插件时，可以使用 listBundledPlugins 任务收集所有捆绑的插件。

当使用 DevKit 和非公共插件时，找到包含 META-INF/plugin.xml 描述符的插件主 JAR 文件，带有 `<id>` 标签（或 `<name>` 如果未指定）。 捆绑的插件位于 $PRODUCT_ROOT$/plugins/$PLUGIN_NAME$/lib/$PLUGIN_NAME$.jar。

捆绑插件的 ID

下表列出了一些常用的捆绑插件及其 ID。 另请参阅特定于功能的 IntelliJ 社区插件和模块。

## 2. Project Setup

Depending on the chosen development workflow (Gradle or DevKit), one of the two following steps is necessary.

```js
intellij {
  plugins.set(listOf("com.example.another-plugin:1.0"))
}
```

## 3. plugin.xml 中的依赖声明

无论插件项目是使用所有产品中可用的模块，还是使用特定于功能的模块，都必须将正确的模块列为 plugin.xml 中的依赖项。 

如果一个项目依赖于另一个插件，则必须像模块一样声明依赖项。 如果仅使用通用 IntelliJ 平台功能 (API)，则必须声明对 com.intellij.modules.platform 的默认依赖项。

要显示可用的 IntelliJ 平台模块列表，请在编辑插件项目的 plugin.xml 文件时调用 `<depends>` 元素内容的代码完成功能。

在 plugin.xml 中，添加一个 `<depends>` 标签，内容是依赖插件的 ID。 

继续上面项目设置中的示例，plugin.xml 中的依赖声明为：

```xml
<depends>com.example.another-plugin</depends>
```

## 可选的插件依赖项

插件还可以指定可选的插件依赖项。 

在这种情况下，即使它依赖的插件没有安装或启用，插件也会加载，但插件的部分功能将不可用。

声明额外的 optional="true" 和指向可选插件描述符文件的配置文件属性：

```xml
<depends
    optional="true"
    config-file="myPluginId-optionalPluginName.xml">dependency.plugin.id</depends>
```

### 样品

该插件为 Java 和 Kotlin 文件添加了额外的突出显示。 

主 plugin.xml 定义了对 Java 插件（插件 ID com.intellij.java）的必需依赖，并注册了相应的 com.intellij.annotator 扩展。

此外，它还指定了对 Kotlin 插件（插件 ID org.jetbrains.kotlin）的可选依赖项：

- plugin.xml

```xml
<idea-plugin>
   ...
   <depends>com.intellij.java</depends>

   <depends
       optional="true"
       config-file="myPluginId-withKotlin.xml">org.jetbrains.kotlin</depends>

   <extensions defaultExtensionNs="com.intellij">
      <annotator
          language="JAVA"
          implementationClass="com.example.MyJavaAnnotator"/>
   </extensions>
</idea-plugin>
```

配置文件 myPluginId-withKotlin.xml 与主 plugin.xml 文件位于同一目录中。 

在该文件中，定义了 Kotlin 的注释器扩展：

- myPluginId-withKotlin.xml

```xml
<idea-plugin>
   <extensions defaultExtensionNs="com.intellij">
      <annotator
          language="kotlin"
          implementationClass="com.example.MyKotlinAnnotator"/>
   </extensions>
</idea-plugin>
```

# 参考资料

https://plugins.jetbrains.com/docs/intellij/plugin-icon-file.html#configuration-structure-overview

* any list
{:toc}