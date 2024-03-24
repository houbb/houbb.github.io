---
layout: post
title: maven 包管理平台-05-multi module 多模块
date: 2016-08-06 13:10:53 +0800
categories: [VCS]
tags: [maven, devops, sf]
published: true
---

# 拓展阅读

[maven 包管理平台-01-maven 入门介绍 + Maven、Gradle、Ant、Ivy、Bazel 和 SBT 的详细对比表格](https://houbb.github.io/2016/08/06/maven-01-intro)

[maven 包管理平台-02-windows 安装配置 + mac 安装配置](https://houbb.github.io/2016/08/06/maven-02-windows-mac-install)

[maven 包管理平台-03-maven project maven 项目的创建入门](https://houbb.github.io/2016/08/06/maven-03-maven-project)

[maven 包管理平台-04-maven archetype 项目原型](https://houbb.github.io/2016/08/06/maven-04-maven-archetype)

[maven 包管理平台-05-multi module 多模块](https://houbb.github.io/2016/08/06/maven-05-multi-module)

[maven 包管理平台-06-常用技巧 实时更新快照/乱码问题/下载很慢/包依赖解决包冲突/如何导入本地 jar](https://houbb.github.io/2016/08/06/maven-06-tips)

[maven 包管理平台-07-plugins 常见插件介绍](https://houbb.github.io/2016/08/06/maven-07-plugins)

[maven 包管理平台-08-nexus 自己搭建 maven 仓库](https://houbb.github.io/2016/08/06/maven-08-nexus)


# 多模块

## 创建

创建一个空的 Maven 项目，它的 `pom.xml` 如下所示：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.ryo</groupId>
    <artifactId>multiModule</artifactId>
    <version>1.0-SNAPSHOT</version>

</project>
```

为 *multiModule* 创建子模块 *util*，同时我们以类似的方式创建另一个模块 *dao*：

![子模块](https://raw.githubusercontent.com/houbb/resource/master/img/2016-08-01-maven-module.png)

- *multiModule* 的 `pom.xml` 将是：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.ryo</groupId>
    <artifactId>multiModule</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <modules>
        <module>util</module>
    </modules>

</project>
```

- *util* 模块的 `pom.xml` 如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>multiModule</artifactId>
        <groupId>com.ryo</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>util</artifactId>

</project>
```

- 在 *util* 模块中的 StringUtil.java 文件

```java
public class StringUtil {
    private static final String EMPTY_STRING = "";

    private StringUtil(){}

    public static boolean isEmpty(String string) {
        return string == null || string.trim().equals(EMPTY_STRING);
    }
}
```


## 使用

如果我们想要在 *dao* 模块中使用 *util* 模块的 **StringUtil.java**，我们应该按照以下步骤进行：

- 安装

在 *util* 模块或 *multiModule*（根模块）中安装您想要使用的模块。

![多模块](https://raw.githubusercontent.com/houbb/resource/master/img/2016-08-01-maven-multi.png)

- 定义

在 *dao* 模块的 ```pom.xml``` 中定义 *util* 的依赖关系。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>multiModule</artifactId>
        <groupId>com.ryo</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>dao</artifactId>

    <dependencies>
        <dependency>
            <groupId>com.ryo</groupId>
            <artifactId>util</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>
    </dependencies>
</project>
```

- 使用

```java
public class UserDao {
    public boolean login(String username, String password) {
        return StringUtil.isEmpty(username) || StringUtil.isEmpty(password);
    }
}
```

> 提示

如果您在 *根模块* 中定义了 [一个模块] 的依赖关系，那么它的所有子模块都可以使用 [一个模块]。

但通常我们可能会像这样使用：

- 根模块的 ```pom.xml``` 中，**声明** 使用。

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.ryo</groupId>
            <artifactId>util</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

- *dao* 模块的 ```pom.xml``` 中，**定义** 使用。

```xml
<dependencies>
    <dependency>
        <groupId>com.ryo</groupId>
        <artifactId>util</artifactId>
    </dependency>
</dependencies>
```

* any list
{:toc}