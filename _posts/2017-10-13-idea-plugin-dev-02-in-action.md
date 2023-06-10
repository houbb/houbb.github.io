---
layout: post
title:  Idea Plugin Dev-02-idea 插件开发入门实战笔记例子 
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea]
published: true
---


# 01-新建一个基于 Gradle 的插件项目

这里我们基于 Gradle 进行插件开发，这也是 IntelliJ 官方的推荐的插件开发解决方案。

第一步，选择 Gradle 项目类型并勾选上相应的依赖。

idea 中 【New Project】=》【gradle 项目】=》依赖添加【java + Intelij Platform Plugin】

![依赖](https://camo.githubusercontent.com/3c3360133b272dfbd1cd35e457ac533423e31fb0c34955994b00e66291bd3edc/68747470733a2f2f6f73732e6a61766167756964652e636e2f323032302d31312f312e706e67)

第二步，填写项目相关的属性比如 GroupId、ArtifactId。

```
GroupId: com.github.houbb
ArtifactId: my-first-idea-plugin
```

第三步，静静等待项目下载相关依赖。

第一次创建 IDEA 插件项目的话，这一步会比较慢。因为要下载 IDEA 插件开发所需的 SDK 。

# 02 插件项目结构概览

新建完成的项目结构如下图所示。

![插件项目结构概览](https://camo.githubusercontent.com/8b7e82855d05d727875390941b501f1e5c11fd7c5634732fea1a014523d370a1/68747470733a2f2f6f73732e6a61766167756964652e636e2f323032302d31312f2545362538462539322545342542422542362545392541312542392545372539422541452545372542422539332545362539452538342545362541362538322545382541372538382e706e67)

## 文件介绍

```
build/  build.gradle  gradle/  gradle.properties  LICENSE  README.md  settings.gradle  src/
```

### settings.gradle

```
rootProject.name = 'my-first-idea-plugin'
```

### build.gradle

项目依赖配置文件。通过它可以配置项目第三方依赖、插件版本、插件版本更新记录等信息。

```js
plugins {
    id 'java'
    id 'org.jetbrains.intellij' version '0.4.14'
    id 'org.jetbrains.kotlin.jvm' version '1.3.72'
}

apply plugin: "java"
apply plugin: 'org.jetbrains.intellij'
apply plugin: 'kotlin'

group 'com.github.houbb'
version '3.3.1'

repositories {
    mavenCentral()
}

compileKotlin {
    kotlinOptions.jvmTarget = "1.8"
}
compileTestKotlin {
    kotlinOptions.jvmTarget = "1.8"
}

sourceCompatibility = 1.8
targetCompatibility = 1.8

// See https://github.com/JetBrains/gradle-intellij-plugin/
intellij {
    plugins = ['Kotlin']
//    plugins 'java'
    version '2018.1'
    pluginName 'my-first-idea-plugin'
    updateSinceUntilBuild false
}

dependencies {
    implementation 'com.alibaba.fastjson2:fastjson2:2.0.21'
}

//配置编码格式
tasks.withType(JavaCompile) {
    options.encoding = "UTF-8"
}


task fatJar(type: Jar) {
    manifest.from jar.manifest
    classifier = 'all'
    from {
        configurations.runtimeClasspath.collect { it.isDirectory() ? it : zipTree(it) }
    }
    with jar
}
```

### gradle-wrapper.properties

\my-first-idea-plugin\gradle 下的配置文件

```properties
#Thu Sep 05 00:21:33 CST 2019
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-5.2.1-all.zip
```

### my-first-idea-plugin\src\main\resources\META-INF\plugin.xml

plugin.xml: 插件的核心配置文件。通过它可以配置插件名称、插件介绍、插件作者信息、Action 等信息。

```xml
<idea-plugin>
    <id>com.github.houbb.my-first-idea-plugin</id>
    <name>Plugin display name here</name>
    <vendor email="support@yourcompany.com" url="http://www.yourcompany.com">YourCompany</vendor>

    <description><![CDATA[
    Enter short description for your plugin here.<br>
    <em>most HTML tags may be used</em>
    ]]></description>

    <!-- please see https://www.jetbrains.org/intellij/sdk/docs/basics/getting_started/plugin_compatibility.html
         on how to target different products -->
    <depends>com.intellij.modules.platform</depends>

    <extensions defaultExtensionNs="com.intellij">
        <!-- Add your extensions here -->
    </extensions>

    <actions>
        <!-- Add your actions here -->
        <action id="hello" class="HelloAction" text="Hello" description="idea 入门插件">
        <!--    指定插件的位置-->
            <add-to-group group-id="ToolsMenu" anchor="first"/>
        </action>
    </actions>
</idea-plugin>
```

# 03 手动创建 Action

我们可以把 Action 看作是 IDEA 提供的事件响应处理器，通过 Action 我们可以自定义一些事件处理逻辑/动作。比如说你点击某个菜单的时候，我们进行一个展示对话框的操作。

第一步，右键 java 目录并选择 new 一个 Action

【New】=》【Plugin Devkit】=》【Action】

![action](https://camo.githubusercontent.com/0e0cc0f2f922006e1d99498ffc76e31a399dc467d2d9f4ff0e3a5bd678e02eec/68747470733a2f2f6f73732e6a61766167756964652e636e2f323032302d31312f254536253936254230254535254242254241616374696f6e2532302831292e706e67)

第二步，配置 Action 相关信息比如展示名称。

![相关信息](https://camo.githubusercontent.com/9a8be5224e269581f3f9365b06a1598e6870b4f304cbf0e11a3d51064750986e/68747470733a2f2f6f73732e6a61766167756964652e636e2f323032302d31312f2545392538352538442545372542442541452545352538412541382545342542442539432545352542312539452545362538302541372532302831292e706e67)


## 创建效果

创建完成之后，我们的 plugin.xml 的 `<actions>` 节点下会自动生成我们刚刚创建的 Action 信息:

```xml
<actions>
    <!-- Add your actions here -->
    <action id="hello" class="HelloAction" text="Hello" description="idea 入门插件">
    <!--    指定插件的位置-->
        <add-to-group group-id="ToolsMenu" anchor="first"/>
    </action>
</actions>
```

并且 java 目录下会生成一个叫做 HelloAction 的类。

这个类继承了 AnAction ，并覆盖了 actionPerformed() 方法。

这个 actionPerformed 方法就好比 JS 中的 onClick 方法，会在你点击的时候触发对应的动作。

我简单对 actionPerformed 方法进行了修改，添加了一行代码。这行代码很简单，就是显示 1 个对话框并展示一些信息。

```java
public class HelloAction extends AnAction {

    @Override
    public void actionPerformed(AnActionEvent e) {
        //显示对话框并展示对应的信息
        Messages.showInfoMessage("素材不够，插件来凑！", "Hello");
    }

}
```

## 归属位置

另外，我们上面也说了，每个动作都会归属到一个 Group 中，这个 Group 可以简单看作 IDEA 中已经存在的菜单。

举个例子。我上面创建的 Action 的所属 Group 是 ToolsMenu(Tools) 。

这样的话，我们创建的 Action 所在的位置就在 Tools 这个菜单下。

![位置](https://camo.githubusercontent.com/1234fafff59a0c9e636d733f47922e12b9fb3fd1859063cdf803c1925d4b964e/68747470733a2f2f6f73732e6a61766167756964652e636e2f323032302d31312f696d6167652d32303230313131333139323235353638392e706e67)

# 04 验收成果

点击 Gradle -> Tasks -> intellij -> runIde 就会启动一个默认了这个插件的 IDEA。

然后，你可以在这个 IDEA 上实际使用这个插件了。

![验收成果](https://camo.githubusercontent.com/6c2298c4fa4126ff94317035b1688ae100dfb1be1d4358184e845e139efc5e72/68747470733a2f2f6f73732e6a61766167756964652e636e2f323032302d31312f696d6167652d32303230313131383037353931323439302e706e67)

效果如下:

![效果如下](https://camo.githubusercontent.com/ac2c8239a8f320acab5960f825e42d77d6a7de10fab4a5f35b75344acdab6db4/68747470733a2f2f6f73732e6a61766167756964652e636e2f323032302d31312f696d6167652d32303230313131383038303335383736342e706e67)

PS: 我们的是放在 Tools 下面。

# 05 打包分发

插件写好之后，如果我们想把插件分享给小伙伴使用的话要怎么做呢。

## 打包

首先，我们要打包插件
执行 Gradle -> Tasks -> intellij -> buildPlugin

执行完成后，项目中会生成一个 build 文件夹，点击进入后找到 distributions 文件夹，里面会出现一个 .zip 结尾的压缩包，里面打包了插件所需要的依赖、配置文件等。

## 分发

其次，分发插件

打开 IDEA，在 Settings -> Plugins -> 点击小齿轮后选择 Install Plugin From Disk

## 最后，提交至官网

这步并不是必须的，如果你想把你的插件发布到官网上，别人直接可以在 [应用市场](https://plugins.jetbrains.com/) 中搜到你的插件的话可以做这步。

# 参考资料

https://github.com/CodingDocs/awesome-idea/blob/main/docs/tips/plug-in-development-intro.md

[8条经验轻松上手IDEA插件开发](https://developer.aliyun.com/article/777850?spm=a2c6h.12873581.0.dArticle777850.118d6446r096V4&groupCode=alitech)

[IDEA 插件开发入门教程](https://blog.xiaohansong.com/idea-plugin-development.html)

* any list
{:toc}
