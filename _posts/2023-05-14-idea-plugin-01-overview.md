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

# idea 与 各种依赖的关系

> [系统性解决IntelliJ IDEA插件开发环境问题](https://juejin.cn/post/7122385701257084941)

## 依赖关系

### idea 与 gradle

> [https://www.jetbrains.com/legal/third-party-software/?product=iic&version=2022.1.3](https://www.jetbrains.com/legal/third-party-software/?product=iic&version=2022.1.3)

可以找到 2022.1.3 对应的 gradle 版本是 7.4

### gradle 与 jdk

通过grale版本号，然后确定jdk版本

不同版本的gradle依赖的jdk版本不同，同样可以在idea官网查询，

https://www.jetbrains.com/help/idea/2019.3/gradle-jvm-selection.html

5.4.1+ 对应的是： 1.8 - 12

### 通过gradle版本号确定gradle-intellij-plugin版本号

这个版本号需要到idea gradle插件官方github上查看版本信息，需要从字里行间找对应版本号，比较费劲，地址：github.com/JetBrains/g…
建议从最高版本依次往下梳理，通过查找适合gradle 5.2.1的版本号是0.4.20，如下图

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

[官方代码案例](https://github.com/JetBrains/intellij-sdk-code-samples/tree/main)

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

## 编译运行

点击 Plugin 绿色箭头，和正常启动程序一样。

这个时候它会打开一个新的 IDEA 工程，并在这个工程中默认安装你开发好的插件

![绿色按钮](https://img-blog.csdnimg.cn/img_convert/d90ead6c1aeda4a6cdeefdac597b504e.png)

### gradle 的配置

项目创建时，默认在根路径下有一个 gradle 文件夹。

下面的文件内容

```
└─wrapper
        gradle-wrapper.jar
        gradle-wrapper.properties
```

其中 gradle-wrapper.properties 的配置如下：

```
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-7.4.2-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

### 报错

```
Build file 'D:\code\coin\idea-plugin-use-plugin\build.gradle.kts' line: 1

Plugin [id: 'org.jetbrains.intellij', version: '1.5.2'] was not found in any of the following sources:

* Try:
> Run with --stacktrace option to get the stack trace.
> Run with --info or --debug option to get more log output.
> Run with --scan to get full insights.
```

详细的报错如下：

```
* Exception is:
org.gradle.api.plugins.UnknownPluginException: Plugin [id: 'org.jetbrains.intellij', version: '1.5.2'] was not found in any of the following sources:

- Gradle Core Plugins (plugin is not in 'org.gradle' namespace)
- Plugin Repositories (could not resolve plugin artifact 'org.jetbrains.intellij:org.jetbrains.intellij.gradle.plugin:1.5.2')
  Searched in the following repositories:
    Gradle Central Plugin Repository
	at org.gradle.plugin.use.internal.DefaultPluginRequestApplicator.resolveToFoundResult(DefaultPluginRequestApplicator.java:238)
	at org.gradle.plugin.use.internal.DefaultPluginRequestApplicator.lambda$resolvePluginRequests$3(DefaultPluginRequestApplicator.java:168)
	at org.gradle.util.internal.CollectionUtils.collect(CollectionUtils.java:207)
	at org.gradle.util.internal.CollectionUtils.collect(CollectionUtils.java:201)
	at org.gradle.plugin.use.internal.DefaultPluginRequestApplicator.resolvePluginRequests(DefaultPluginRequestApplicator.java:166)
	at org.gradle.plugin.use.internal.DefaultPluginRequestApplicator.applyPlugins(DefaultPluginRequestApplicator.java:101)
	at org.gradle.kotlin.dsl.provider.PluginRequestsHandler.handle(PluginRequestsHandler.kt:48)
	at org.gradle.kotlin.dsl.provider.StandardKotlinScriptEvaluator$InterpreterHost.applyPluginsTo(KotlinScriptEvaluator.kt:195)
	at org.gradle.kotlin.dsl.execution.Interpreter$ProgramHost.applyPluginsTo(Interpreter.kt:398)
	at Program.execute(Unknown Source)
	.....
```


`build.gradle.kts` 是对应的 gradle build 文件。

### 可能的错误原因

这个报错信息可能是由于 Gradle 无法找到指定的插件，可以尝试以下步骤解决问题：

1. 检查插件 ID 和版本号是否正确。
   确保插件 ID 和版本号与插件清单文件（`plugin.xml`）中指定的相同，否则 Gradle 将无法正确识别插件。

2. 检查 Gradle 仓库配置。
   确保 Gradle 仓库配置正确。如果使用了自定义的 Maven 仓库，确保添加了正确的仓库地址和认证信息。

3. 检查 Gradle 版本。
   IntelliJ IDEA 插件开发需要使用 Gradle 4.x 或更高版本。确保已安装正确的 Gradle 版本，并且在项目中指定了正确的 Gradle 版本。

4. 清除 Gradle 缓存。
   有时候 Gradle 缓存会出现问题，导致插件无法正确加载。可以尝试清除 Gradle 缓存，重新构建项目，看是否能解决问题。

如果以上步骤都没有解决问题，可以尝试查看 Gradle 控制台的详细输出，查找更多有用的信息。

如果仍然无法解决问题，可以搜索相关的错误信息，或者在 IntelliJ IDEA 官方论坛或 Stack Overflow 上发帖求助。

OR

这个错误通常是由于Gradle构建无法找到所需的插件引起的。在这种情况下，似乎找不到 `org.jetbrains.intellij` 插件。

以下是您可以尝试解决此问题的几种方法：

1. 检查 `build.gradle` 文件中是否包含该插件。您可以在文件中查找以下行：`id 'org.jetbrains.intellij' version '1.13.2'`。如果没有，请将其添加到文件的 `plugins` 块中。

2. 确保您具有插件的正确版本。`build.gradle` 文件中指定的版本必须与存储库中可用的版本匹配。您可以访问Gradle插件门户网站上的插件页面来检查可用版本。

3. 检查您是否有互联网连接，并且Gradle构建能够访问必要的存储库。您可以检查 `build.gradle` 文件中的 `repositories` 块。

4. 尝试通过在命令行中运行 `./gradlew cleanBuildCache` 来清理Gradle缓存。

5. 如果上述任何步骤都无效，请尝试删除 `~/.gradle` 目录并重新运行Gradle构建。这将强制Gradle从头开始下载所有依赖项。

希望这些步骤中的其中一个可以帮助您解决 `UnknownPluginException` 错误，并成功将 `org.jetbrains.intellij` 插件包含在Gradle构建中。


--------------------------------

- Gradle插件门户网站上的插件访问网址

Gradle插件门户网站的网址是 https://plugins.gradle.org/。

在该网站上，您可以搜索并找到各种Gradle插件，包括 `org.jetbrains.intellij` 插件。通过访问插件页面，您可以查看插件的文档、示例和可用版本等信息。

是有的 

> [https://plugins.gradle.org/plugin/org.jetbrains.intellij](https://plugins.gradle.org/plugin/org.jetbrains.intellij)

------------------------

### 国内 gradle plugins 下载太慢，如何配置解决？比如修改 plugin 仓库地址

如果您在国内使用Gradle时下载插件很慢，可以通过以下几种方式来加速下载：

1. 修改Gradle的全局配置文件（`~/.gradle/init.gradle`），将插件仓库地址修改为国内镜像站点，例如阿里云、清华大学等。以下是一个示例配置文件：

   ```
   allprojects {
       repositories {
           maven { url 'https://maven.aliyun.com/repository/public/' }
           maven { url 'https://maven.aliyun.com/repository/jcenter' }
           maven { url 'https://maven.aliyun.com/repository/google' }
           mavenLocal()
           mavenCentral()
           jcenter()
       }
   }
   ```

2. 在项目的 `build.gradle` 文件中设置插件仓库地址。例如：

   ```
   buildscript {
       repositories {
           maven { url 'https://maven.aliyun.com/repository/public/' }
           maven { url 'https://maven.aliyun.com/repository/jcenter' }
           maven { url 'https://maven.aliyun.com/repository/google' }
           mavenLocal()
           mavenCentral()
           jcenter()
       }
   }
   ```

3. 使用代理工具，例如 Shadowsocks、V2Ray 等，来加速网络连接。

使用以上方法之一应该能够加速Gradle插件的下载速度。

# 缺失的包

https://github.com/JetBrains/gradle-intellij-plugin

TODO..

应该是网络问题，无法下载到 gradle 依赖的包。

## 查看具体的报错信息

```
gradle --debug
```

以 debug 的模式输出日志。


# 报错

```
A problem occurred configuring root project 'demo1'.
> Could not resolve all dependencies for configuration ':classpath'.
   > Using insecure protocols with repositories, without explicit opt-in, is unsupported. Switch Maven repository 'maven(http://maven.aliyun.com/nexus/content/repositories/jcenter)' to redirect to a secure protocol (like HTTPS) or allow insecure protocols. See https://docs.gradle.org/8.0.2/dsl/org.gradle.api.artifacts.repositories.UrlArtifactRepository.html#org.gradle.api.artifacts.repositories.UrlArtifactRepository:allowInsecureProtocol for more details. 

```

这个是上面的对应的仓库配置调整，全部改为 https 即可。

# 链接插件超时

```
2023-05-14T16:09:25.143+0800 [DEBUG] [org.apache.http.impl.conn.PoolingHttpClientConnectionManager] Connection request: [route: {s}->https://plugins.gradle.org:443][total available: 0; route allocated: 0 of 20; total allocated: 0 of 20]
2023-05-14T16:09:25.143+0800 [DEBUG] [org.apache.http.impl.conn.PoolingHttpClientConnectionManager] Connection leased: [id: 4][route: {s}->https://plugins.gradle.org:443][total available: 0; route allocated: 1 of 20; total allocated: 1 of 20]
2023-05-14T16:09:25.143+0800 [DEBUG] [org.apache.http.impl.execchain.MainClientExec] Opening connection {s}->https://plugins.gradle.org:443
2023-05-14T16:09:25.179+0800 [DEBUG] [org.apache.http.impl.conn.DefaultHttpClientConnectionOperator] Connecting to plugins.gradle.org/104.17.10.66:443
2023-05-14T16:09:25.179+0800 [DEBUG] [org.apache.http.conn.ssl.SSLConnectionSocketFactory] Connecting socket to plugins.gradle.org/104.17.10.66:443 with timeout 30000
```

or

```
Caused by: org.gradle.api.resources.ResourceException: Could not get resource 'https://plugins.gradle.org/m2/org/jetbrains/intellij/org.jetbrains.intellij.gradle.plugin/1.13.3/org.jetbrains.intellij.gradle.plugin-1.13.3.pom'.
```

## 解决方案

调整 maven 仓库

```
repositories {
    maven("https://maven.aliyun.com/repository/public")
    maven("https://maven.aliyun.com/repository/jcenter")
    maven("https://maven.aliyun.com/repository/google")
    maven("https://maven.aliyun.com/nexus/content/repositories/jcenter")
    maven("https://maven.aliyun.com/repository/gradle-plugin")

    mavenLocal()
    mavenCentral()
    jcenter()
}
```

# 依赖包不存在

## 报错

```
A problem occurred configuring root project 'idea-plugin-with-plugins'.
> Could not resolve all files for configuration ':classpath'.
   > Could not find kotlinx-serialization-core-jvm-1.5.0.jar (org.jetbrains.kotlinx:kotlinx-serialization-core-jvm:1.5.0).
     Searched in the following locations:
         https://maven.aliyun.com/repository/jcenter/org/jetbrains/kotlinx/kotlinx-serialization-core-jvm/1.5.0/kotlinx-serialization-core-jvm-1.5.0.jar
   > Could not find commons-compress-1.22.jar (org.apache.commons:commons-compress:1.22).
     Searched in the following locations:
         https://maven.aliyun.com/repository/jcenter/org/apache/commons/commons-compress/1.22/commons-compress-1.22.jar

Possible solution:
 - Declare repository providing the artifact, see the documentation at https://docs.gradle.org/current/userguide/declaring_repositories.html
```

## 如何设置的地址

https://docs.gradle.org/current/userguide/declaring_repositories.html


## 报错1-commons-compress-1.22.jar

### 可能原因

这个错误通常表示您在 Gradle 项目中使用了 `org.apache.commons:commons-compress` 依赖项，但 Gradle 无法在 Maven 存储库中找到对应的 `commons-compress-1.22.jar` 文件。

您可以尝试以下几个解决方案：

1. 检查依赖项名称和版本号是否正确。请确保在您的 `build.gradle` 或 `build.gradle.kts` 文件中正确指定了 `org.apache.commons:commons-compress:1.22` 依赖项。

2. 检查您的项目是否可以连接到 Maven 存储库。您可以尝试在浏览器中打开 https://repo.maven.apache.org/maven2/org/apache/commons/commons-compress/1.22/，以确保您的计算机可以访问此存储库。如果您的网络环境存在代理或防火墙，则可能需要在 Gradle 配置文件中配置代理或调整防火墙设置。

3. 尝试清除 Gradle 项目缓存。有时候，Gradle 可能会缓存依赖项文件，从而导致构建问题。您可以尝试运行 `./gradlew clean build --refresh-dependencies` 命令清除 Gradle 项目缓存并重新下载依赖项。

如果上述解决方案均无效，请尝试在 `build.gradle` 或 `build.gradle.kts` 文件中添加 Maven 存储库，以确保 Gradle 可以下载 `org.apache.commons:commons-compress:1.22` 依赖项。您可以在 Gradle 配置文件中添加以下代码：

```
repositories {
    mavenCentral()
}
```

这将使 Gradle 使用 Maven 中央存储库来解析依赖项。如果仍然无法解决问题，请检查 Gradle 版本是否与您的依赖项兼容。


### 尝试1

每次都感觉没有重新加载，直接删除 `C:\Users\dh\.gradle\caches`，重新构建。

发现还是不不行。

### 尝试2

手动下载缺失的 jar 到本地。


------------------------ 如何使用？

您可以将手动下载的 JAR 文件添加到项目的类路径中，以便 Gradle 可以将其用作项目的依赖项。

一种常见的方法是使用 `flatDir` 存储库，该存储库可以从本地目录中加载 JAR 文件。在 `build.gradle.kts` 文件中，您可以将以下内容添加到 `repositories` 部分：

```kotlin
repositories {
    flatDir {
        dirs("libs") // 将本地目录 "libs" 添加到 flatDir 存储库中
    }
}
```

然后，将手动下载的 JAR 文件复制到本地目录 `libs` 中。最后，在 `dependencies` 部分中添加以下内容，将 JAR 文件添加到项目中：

```kotlin
dependencies {
    implementation(fileTree(mapOf("dir" to "libs", "include" to "*.jar")))
}
```

这将扫描 `libs` 目录中的所有 JAR 文件，并将它们添加到您的项目中。

请注意，使用 `flatDir` 存储库可能会导致依赖项冲突和版本控制问题，因此建议您使用其他存储库来管理依赖项。


还是不行，暂时不搞了，浪费时间。

# 参考资料

https://blog.csdn.net/qq_63815371/article/details/128722976

[实践idea插件开发](https://blog.csdn.net/cj_eryue/article/details/127059594)

[【idea插件开发】从0入门idea插件开发，idea插件开发教程，如何开发idea插件](https://blog.csdn.net/smile_795/article/details/125470136)

[编写一个IDEA插件之：自动生成Java代码](https://blog.csdn.net/baidu_28523317/article/details/109020050)

[IDEA插件开发（简单案例助你快速入门）](https://blog.csdn.net/qq_44901906/article/details/124718876)

[新手编写IntelliJ IDEA插件](https://blog.csdn.net/qq_63815371/article/details/128722976)

[开发Idea插件遇到的问题-解决方案](https://www.zhihu.com/tardis/bd/art/258504236?source_id=1001)

[IDEA-插件开发踩坑记录-第一坑-创建gradle工程编译失败](https://blog.csdn.net/u013205724/article/details/122856601)

[系统性解决IntelliJ IDEA插件开发环境问题](https://juejin.cn/post/7122385701257084941)

https://stackoverflow.com/questions/68256252/plugin-id-org-jetbrains-intellij-version-1-1-2-was-not-found-in-any-of

https://younghz.github.io/jetbrains-plugins

[彻底解决gradle与gradle plugin匹配关系以及gradle下载缓慢的问题](https://blog.csdn.net/fxjzzyo/article/details/113776278)

[IDEA 插件开发入门](http://idea.javaguide.cn/tips/plug-in-development-intro.html#_01-%E6%96%B0%E5%BB%BA%E4%B8%80%E4%B8%AA%E5%9F%BA%E4%BA%8E-gradle-%E7%9A%84%E6%8F%92%E4%BB%B6%E9%A1%B9%E7%9B%AE)

[IDEA-插件开发踩坑记录-第一坑-创建gradle工程编译失败](https://blog.csdn.net/u013205724/article/details/122856601)

[IntelliJ IDEA插件开发入门](https://blog.csdn.net/cccying/article/details/123182669)

* any list
{:toc}