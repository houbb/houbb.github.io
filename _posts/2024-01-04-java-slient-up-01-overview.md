---
layout: post
title: 让 sdk 包静默升级的 SAO 操作，你见过几种？
date: 2024-01-04 21:01:55 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# 拓展阅读

[让 sdk 包静默升级的 SAO 操作，你见过几种？](https://mp.weixin.qq.com/s/fhvT-zqhu0pbaBGuH5Mpkw)

# 业务背景

有时候为业务方提供了基础的 sdk 包，为了保证稳定性，一般都是 release 包。

但是每一次升级都非常痛苦，也不可能写一个一步到位的 jar 包，因为业务一直在变化。

那有什么方式，让 sdk 包静默升级呢？

今天学习到一个骚操作，和大家分享一下。

![骚操作](https://img-blog.csdnimg.cn/direct/801bd0acccbf412fb1fb8762f6e3788e.jpeg#pic_center)

# 方式1-snapshot

以 java 的 maven 包管理为例，如果使用 snapshot，那么就可以随时方便的升级包内容。

## 优点

非常简单，maven 天然支持、

## 缺点

- 包信息不够稳定，一般为了追求生产的稳定性，都会要求去 snapshot。

- 升级失败，不兼容等，没有回滚的余地。

## 方式2-nexus 等内部仓库直接替换

方式：直接替换指定版本的仓库中的包。这种方式的核心和上面类似。只不过是看起来不是 snapshot，但是依然无法保障安全。

## 方式3-shell 脚本结合 CI

方式：使用 shell 脚本，在升级的时候，先备份，再替换。

流程：一般结合 ci 流水线使用，部署打包的时候替换包版本到指定版本，相比较而言更加灵活，也有回旋的余地。

缺点：要求比较多，比较麻烦。且要求应用必须通过 ci 流水线部署，否则就会被绕过。

### 注意点

1）需要保证 jar 版本之间的向前兼容性，避免升级导致问题。

2）应用环境比较复杂，可能会出问题。所以一定要逐步的升级，让用户测试环境经过验证。

3）提前通知用户，让用户知道这个事情。而且允许用户不做升级操作。

# 小结

这种方式给我的感觉是无可奈何，但是又非常巧妙。

上一次有这种感觉的，还是运维怕磁盘爆，预留 500MB 放一个垃圾文件，磁盘满了直接移除，快速解决问题。

你在日常工作中，见到过哪些 SAO 操作？

# 基于 shell 的实战笔记

## 需求

我们模拟一个 maven 项目的 pomx，期望替换其中的 heaven 版本从 0.6.0=>0.7.0

## 示例

- pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>silentup-test</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!--============================== INTER ==============================-->
        <dependency>
            <groupId>com.github.houbb</groupId>
            <artifactId>heaven</artifactId>
            <version>0.6.0</version>
        </dependency>
    </dependencies>

</project>
```

- slientup.sh

```sh
targetVersion=0.7.0
currentPath=`pwd`
mainPomPath=$currentPath"/pom.xml"

if [ ! -f $mainPomPath ]; then
  echo "mainPomPath not found in $currentPath!"
  exit 1;
fi

sedStr="s#</dependencies>#<dependency><groupId>com.github.houbb</groupId><artifactId>heaven</artifactId><version>$targetVersion</version></dependency></dependencies>#"

sed -i "$sedStr" $mainPomPath

echo "Silent up version to $targetVersion DONE!"
```

这个脚本比较简单，直接在文件的最后添加我们的新版本，因为 maven 的优先级，后面的会覆盖前面的。

### 一些细节

还有一个就是 maven 优先级的问题。

maven 其实在主 pom 的时候，是前面的覆盖后面的。

所以最好是替换 `</dependencies>`。


## 执行

```
$ chmod +x silentup.sh
$ ./silentup.sh
Silent up version to 0.7.0 DONE!
```

## 效果

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>silentup-test</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!--============================== INTER ==============================-->
        <dependency>
            <groupId>com.github.houbb</groupId>
            <artifactId>heaven</artifactId>
            <version>0.6.0</version>
        </dependency>
    <dependency><groupId>com.github.houbb</groupId><artifactId>heaven</artifactId><version>0.7.0</version></dependency></dependencies>

</project>
```



# chat

## 需求

shell 脚本，解析 maven pom.xml 依赖  com.github.houbb:heaven 包

1）如果不存在这个依赖，直接结束。

2）如果存在，判断包的版本。如果版本为 2.0、2.1，则保持不变；如果不是，则修改 version 为 2.1

## A1

您可以使用`xmlstarlet`工具来解析和修改XML文件，下面是一个使用Shell脚本的例子：

```bash
#!/bin/bash

# 检查是否存在 com.github.houbb:heaven 依赖
if xmlstarlet sel -t -m "//dependency[groupId='com.github.houbb' and artifactId='heaven']" -o "1" -b pom.xml > /dev/null; then
    echo "com.github.houbb:heaven 依赖存在"
else
    echo "com.github.houbb:heaven 依赖不存在"
    exit 1
fi

# 获取当前版本
current_version=$(xmlstarlet sel -t -m "//dependency[groupId='com.github.houbb' and artifactId='heaven']/version" -v . -n pom.xml)

# 检查版本并修改
if [[ "$current_version" == "2.0" || "$current_version" == "2.1" ]]; then
    echo "版本为 2.0 或 2.1，无需修改"
else
    echo "修改版本为 2.1"
    xmlstarlet ed --inplace -u "//dependency[groupId='com.github.houbb' and artifactId='heaven']/version" -v "2.1" pom.xml
fi
```

请确保在运行脚本之前备份您的`pom.xml`文件，以防止意外的修改。上述脚本假设您已经安装了`xmlstarlet`工具。您可以使用以下命令来安装：

```bash
# 使用 apt-get 安装 xmlstarlet
sudo apt-get install xmlstarlet

# 使用 yum 安装 xmlstarlet
sudo yum install xmlstarlet
```

然后，将上述脚本保存到一个文件（例如`update_dependency.sh`），并赋予执行权限：

```bash
chmod +x update_dependency.sh
```

最后，运行脚本：

```bash
./update_dependency.sh
```

这将根据您的要求检查并更新`pom.xml`文件中的依赖。




# chat

## java jar sdk 想实现静默升级，有哪些方式

实现Java应用的静默升级有多种方式，以下是一些常见的方法：

1. **自动更新工具：** 使用专门的自动更新工具，如[Java Web Start](https://docs.oracle.com/javase/8/docs/technotes/guides/javaws/)或[GetDown](https://github.com/threerings/getdown)。这些工具可以帮助您在应用启动时检查并下载新版本，然后自动升级应用。

2. **版本检查服务：** 在应用启动时连接到服务器，检查当前应用的版本是否是最新版本。如果不是，下载并安装新版本。您可以使用HTTP或FTP等协议进行文件传输。

3. **自定义升级逻辑：** 实现自己的升级逻辑。在应用启动时，应用程序可以检查服务器上的版本信息，如果有新版本，则下载并替换旧版本的JAR文件。可以使用Java的网络库（如`java.net`包）进行文件下载，然后使用自定义的代码来完成替换和升级。

4. **使用JavaFX的自动更新功能：** 如果您的应用使用JavaFX，JavaFX提供了[Deployment Toolkit](https://docs.oracle.com/javafx/2/deployment/self-contained-packaging.htm)来支持自动更新。

5. **Java插件框架：** 使用插件框架，例如[Java Plugin Framework (JPF)](https://github.com/jpf/jpf)。通过插件框架，您可以在应用运行时动态加载和卸载模块，从而实现模块的更新和替换。

请注意，无论哪种方式，静默升级可能会涉及到文件替换，因此需要谨慎处理以确保升级过程的稳定性和完整性。另外，确保在进行任何升级之前备份用户数据，以防止数据丢失。

## jar 包上传到 nexus，可以使用 snapshot 让用户无感升级。也可以直接删除替换，还有其他方式吗？

上传到 Nexus 或其他 Maven 仓库并使用 Snapshot 版本是一种常见的方式来进行快速开发和测试，但在生产环境中，不推荐直接依赖于 Snapshot 版本进行发布和升级。 Snapshot 版本通常是不稳定的，因此在生产环境中更推荐使用稳定的版本。

对于在 Nexus 或其他 Maven 仓库中的 JAR 包进行升级的方式，以下是一些建议：

1. **发布稳定版本：** 推荐发布稳定版本，而不是使用快照版本。稳定版本更适合在生产环境中使用，因为它们经过充分的测试，较为可靠。

2. **版本管理工具：** 使用版本管理工具，如 [Semantic Versioning (SemVer)](https://semver.org/)，以规范化版本号。这可以帮助您和用户更好地理解版本之间的变化和向后兼容性。

3. **增量更新：** 将更新分为小的增量步骤，而不是一次性替换整个 JAR 包。这可以减小升级的风险，同时使用户感受到更小的影响。

4. **插件化架构：** 如果可能的话，设计您的应用以支持插件化架构，使得您可以在不中断主要功能的情况下，动态加载和卸载插件或模块。这样，您就可以通过更新插件来实现一些功能的更新，而无需替换整个应用。

5. **热更新技术：** 某些框架和工具提供了热更新的功能，允许您在运行时更新部分代码而无需停止整个应用。例如，Java 中的 [JRebel](https://www.jrebel.com/) 就是一个支持热更新的工具。

6. **蓝绿部署：** 实施蓝绿部署策略，即在新版本和旧版本之间逐步切换流量。这有助于降低升级风险，并在问题发生时快速回滚。

选择哪种方式取决于您的应用需求、部署环境和用户体验的考虑。

在任何情况下，都建议在生产环境中进行充分的测试，并备份关键数据以防万一。

# 参考资料

chat

* any list
{:toc}