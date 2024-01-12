---
layout: post
title:  maven-05-maven 配置进阶学习
date:  2017-09-28 18:52:13 +0800
categories: [Maven]
tags: [maven, bash, bat, sh]
published: true
---

# 前言

在项目开发的过程中，我们通常要使用到外部依赖的组件，同时也会使用某些插件来帮助我们管理项目。

例如，我们访问数据库的时候需要使用到jdbc组件，我们可以下载对应的jar包去加载到我们的应用中。

在我们日常开发大型的项目中，会碰到依赖各种各样的外部服务，各种各样的组件，配置繁琐，依赖冲突会增加，为了解决这些问题，我们就会有以下几种工具来管理：maven，ant，gradle等。

本文主要以Maven为主

# Settings 配置

settings.xml用来配置Maven项目中的各种参数文件，包括本地仓库、远程仓库、私服、认证等信息。

## 配置概述

全局Settings、用户settings、pom的区别
全局settings.xml是maven的全局配置文件，一般位于${maven.home}/conf/settings.xml，即maven文件夹下的conf中。
用户settings.xml是maven的用户配置文件，一般位于${user.home}/.m2/settings.xml,即每一位用户都有一份配置文件。
POM.xml文件是项目配置文件，一般位于项目的根目录或子目录下。
配置的优先级从高到底：pom.xml > 本地settings.xml > 全局的settings.xml
如果这些文件同时存在，在应用配置时候，会合并他们的内容，如果有重复的配置，优先级高的配置会覆盖优先级低的。

## 仓库

我们依赖的外部服务要有地方存储，存储的地方称为仓库，仓库分为本地仓库、中央仓库、镜像仓库、私服。

1.本地仓库

当项目在本地编译或者运行时候，直接加载本地的依赖服务无疑是最快的。默认情况下，每个用户都会加载自己用户目录下的.m2/repository/的仓库目录。而原始的本地仓库是空的，因此Maven需要知道一个网络上的仓库，在本地仓库不存在时候前往下载网络上的仓库，也就是远程仓库。

2.中央仓库
当maven未配置是，会默认请求maven的中央仓库，中央仓库包含了这个世界上绝大多数的流行开源Java构建，以及源码，作者信息，SCM，信息，许可证信息等。但是由于最常见的网络原因，国外的中央仓库使用起来并不顺利，因此就有了下载地址为国内的中央仓库，也就是镜像仓库。

3.镜像仓库
总结来说，镜像仓库就是将过来的中心仓库复制一份到国内，这样一来下载速度及访问速度都很快。

4.私服
一般来说中央仓库或者镜像仓库都能满足我们的需求，但是当我们在公司内合作开发代码时，可能因为系统保密性原因，有一些其他同事开发的外部依赖只希望能够被自己本公司内部人员使用，不能上传到镜像仓库。因此，私服最主要的功能是存储一些公司内部不希望被公开依赖的服务。

## settings配置详解

settings.xml配置了本地全局maven的相关配置。

一下是一份settings.xml的文件配置顶级元素

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
                          https://maven.apache.org/xsd/settings-1.0.0.xsd"> 
      <localRepository>  
      <interactiveMode>
      <usePluginRegistry>
      <offline>
      <pluginGroups>
      <servers>
      <mirrors>
      <proxies>
      <profiles>
      <activeProfiles>
</settings>
```

- localRepository

用来标识本地仓库的位置
D:\repository.m2

- interactiveMode

maven 是否需要和用户交互以获得输入，默认为true
true

- usePluginRegistry

maven 是否需要使用plugin-registry.xml文件来管理插件版本，默认为false
false

- offline

用来标识是否以离线模式运营maven
当系统不能联网时候，可以通过此配置来离线运行。
false

- servers

当使用maven私服的时候，需要配置认证的信息，需要在此处填写相应的配置。

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`
  `xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0`
                      `https://maven.apache.org/xsd/settings-1.0.0.xsd">
  ...
  <!--配置服务端的一些设置。一些设置如安全证书不应该和pom.xml一起分发。这种类型的信息应该存在于构建服务器上的settings.xml文件中。 -->
  <servers>
    <!--服务器元素包含配置服务器时需要的信息 -->
    <server>
      <!--这是server的id（注意不是用户登陆的id），该id与distributionManagement中repository元素的id相匹配。 -->
      <id>server001</id>
      <!--鉴权用户名。鉴权用户名和鉴权密码表示服务器认证所需要的登录名和密码。 -->
      <username>my_login</username>
      <!--鉴权密码 。鉴权用户名和鉴权密码表示服务器认证所需要的登录名和密码。密码加密功能已被添加到2.1.0 +。详情请访问密码加密页面 -->
      <password>my_password</password>
      <!--鉴权时使用的私钥位置。和前两个元素类似，私钥位置和私钥密码指定了一个私钥的路径（默认是${user.home}/.ssh/id_dsa）以及如果需要的话，一个密语。将来passphrase和password元素可能会被提取到外部，但目前它们必须在settings.xml文件以纯文本的形式声明。 -->
      <privateKey>${usr.home}/.ssh/id_dsa</privateKey>
      <!--鉴权时使用的私钥密码。 -->
      <passphrase>some_passphrase</passphrase>
      <!--文件被创建时的权限。如果在部署的时候会创建一个仓库文件或者目录，这时候就可以使用权限（permission）。这两个元素合法的值是一个三位数字，其对应了unix文件系统的权限，如664，或者775。 -->
      <filePermissions>664</filePermissions>
      <!--目录被创建时的权限。 -->
      <directoryPermissions>775</directoryPermissions>
    </server>
  </servers>
  ...
</settings>
```

- mirrors

用来配置镜像仓库，如果一个仓库A可以提供仓库B存储的所有内容，那么就可以任务仓库A是B的一个镜像。

一般常见的国内镜像常见的是阿里云镜像，如下：

```xml
<mirrors>
    <mirror>
      <id>alimaven</id>
      <name>aliyun maven</name>
      <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
      <mirrorOf>central</mirrorOf>        
    </mirror> 
    <mirror>
      <id>alimaven1</id>
      <name>aliyun maven1</name>
      <url>http://maven.aliyun.com/nexus/content/groups/public/</url>
      <mirrorOf>*</mirrorOf>        
    </mirror>
</mirrors>
```

其中id与那么是用来标识唯一的仓库，url为镜像仓库地址，mirrorOf用来匹配当请求什么仓库依赖时使用该镜像。

`<mirrorOf>` 配置的各种选项

`<mirrorOf>*</mirrorOf>`: 匹配所有远程仓库
`<mirrorOf>external:*</mirrorOf>`: 匹配所有远程仓库，使用localhost除外，使用file://协议的除外。也就是说，匹配所有不在本机上的远程仓库。
`<mirrorOf>repo1,repo2</mirrorOf>`: 匹配仓库repo1和repo2,使用逗号分隔多个远程仓库。
`<mirrorOf>*,!repo1</mirrorOf>`:匹配所有远程仓库，repo1除外，使用感叹号将仓库从匹配中去除。

需要注意的是：

由于镜像仓库完全屏蔽了被镜像的仓库，当镜像仓库停止服务或者不稳定的时候，Maven仍无法访问被镜像仓库，因而无法下载构件。

此外，Maven读取mirror配置是从上往下读取的，因此谨慎配置 `*`，如果第一个镜像仓库配置了此标志，那么如果该仓库即使不存在对于依赖也不会像下游查询。

- proxies代理

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
                      https://maven.apache.org/xsd/settings-1.0.0.xsd">
  ...
  <proxies>
    <!--代理元素包含配置代理时需要的信息 -->
    <proxy>
      <!--代理的唯一定义符，用来区分不同的代理元素。 -->
      <id>myproxy</id>
      <!--该代理是否是激活的那个。true则激活代理。当我们声明了一组代理，而某个时候只需要激活一个代理的时候，该元素就可以派上用处。 -->
      <active>true</active>
      <!--代理的协议。 协议://主机名:端口，分隔成离散的元素以方便配置。 -->
      <protocol>http</protocol>
      <!--代理的主机名。协议://主机名:端口，分隔成离散的元素以方便配置。 -->
      <host>proxy.somewhere.com</host>
      <!--代理的端口。协议://主机名:端口，分隔成离散的元素以方便配置。 -->
      <port>8080</port>
      <!--代理的用户名，用户名和密码表示代理服务器认证的登录名和密码。 -->
      <username>proxyuser</username>
      <!--代理的密码，用户名和密码表示代理服务器认证的登录名和密码。 -->
      <password>somepassword</password>
      <!--不该被代理的主机名列表。该列表的分隔符由代理服务器指定；例子中使用了竖线分隔符，使用逗号分隔也很常见。 -->
      <nonProxyHosts>*.google.com|ibiblio.org</nonProxyHosts>
    </proxy>
  </proxies>
  ...
</settings>
```

### profiles

根据环境参数来调整构建配置的列表，用于定义一组profile，settings中的profile是pom.xml中profile元素的裁剪版本。
它包含了id、activation、repositories、pluginRepositories和properties元素。如果一个settings.xml文件中的profile被激活，它的值就会覆盖任何其他定义在pom.xml中带有相同id的profile

### repositories

定义了一组远程的仓库的列表，当该属性对应的profile被激活时，会使用该远程仓库（也可以使用私仓）

```xml
<repositories>
  <!--包含需要连接到远程仓库的信息 -->
  <repository>
    <!--远程仓库唯一标识 -->
    <id>codehausSnapshots</id>
    <!--远程仓库名称 -->
    <name>Codehaus Snapshots</name>
    <!--如何处理远程仓库里发布版本的下载 -->
    <releases>
      <!--true或者false表示该仓库是否为下载某种类型构件（发布版，快照版）开启。 -->
      <enabled>false</enabled>
      <!--该元素指定更新发生的频率。Maven会比较本地POM和远程POM的时间戳。这里的选项是：always（一直），daily（默认，每日），interval：X（这里X是以分钟为单位的时间间隔），或者never（从不）。 -->
      <updatePolicy>always</updatePolicy>
      <!--当Maven验证构件校验文件失败时该怎么做-ignore（忽略），fail（失败），或者warn（警告）。 -->
      <checksumPolicy>warn</checksumPolicy>
    </releases>
    <!--如何处理远程仓库里快照版本的下载。有了releases和snapshots这两组配置，POM就可以在每个单独的仓库中，为每种类型的构件采取不同的策略。例如，可能有人会决定只为开发目的开启对快照版本下载的支持。参见repositories/repository/releases元素 -->
    <snapshots>
      <enabled />
      <updatePolicy />
      <checksumPolicy />
    </snapshots>
    <!--远程仓库URL，按protocol://hostname/path形式 -->
    <url>http://snapshots.maven.codehaus.org/maven2</url>
    <!--用于定位和排序构件的仓库布局类型-可以是default（默认）或者legacy（遗留）。Maven 2为其仓库提供了一个默认的布局；然而，Maven 1.x有一种不同的布局。我们可以使用该元素指定布局是default（默认）还是legacy（遗留）。 -->
    <layout>default</layout>
  </repository>
</repositories>
```

### properties

定义了一组扩展熟悉，当对应的profile被激活时，该属性有效。

```xml
<!--
  1. env.X: 在一个变量前加上"env."的前缀，会返回一个shell环境变量。例如,"env.PATH"指代了$path环境变量（在Windows上是%PATH%）。
  2. project.x：指代了POM中对应的元素值。例如: <project><version>1.0</version></project>通过${project.version}获得version的值。
  3. settings.x: 指代了settings.xml中对应元素的值。例如：<settings><offline>false</offline></settings>通过 ${settings.offline}获得offline的值。
  4. java System Properties: 所有可通过java.lang.System.getProperties()访问的属性都能在POM中使用该形式访问，例如 ${java.home}。
  5. x: 在<properties/>元素中，或者外部文件中设置，以${someVar}的形式使用。
 -->
<properties>
  <user.install>${user.home}/our-project</user.install>
</properties>
```

### id

全局唯一标识，如果一个settings.xml中profile被激活，它的值会覆盖任何其他定义在pom.xml总带有相同id的profile。

### pluginRepositories

同repositories差不多，不该该标签定义的插件的远程仓库

### activation

触发激活该profile的条件。

```xml
<activation>
  <!--profile默认是否激活的标识 -->
  <activeByDefault>false</activeByDefault>
  <!--当匹配的jdk被检测到，profile被激活。例如，1.4激活JDK1.4，1.4.0_2，而!1.4激活所有版本不是以1.4开头的JDK。 -->
  <jdk>1.5</jdk>
  <!--当匹配的操作系统属性被检测到，profile被激活。os元素可以定义一些操作系统相关的属性。 -->
  <os>
    <!--激活profile的操作系统的名字 -->
    <name>Windows XP</name>
    <!--激活profile的操作系统所属家族(如 'windows') -->
    <family>Windows</family>
    <!--激活profile的操作系统体系结构 -->
    <arch>x86</arch>
    <!--激活profile的操作系统版本 -->
    <version>5.1.2600</version>
  </os>
  <!--如果Maven检测到某一个属性（其值可以在POM中通过${name}引用），其拥有对应的name = 值，Profile就会被激活。如果值字段是空的，那么存在属性名称字段就会激活profile，否则按区分大小写方式匹配属性值字段 -->
  <property>
    <!--激活profile的属性的名称 -->
    <name>mavenVersion</name>
    <!--激活profile的属性的值 -->
    <value>2.0.3</value>
  </property>
  <!--提供一个文件名，通过检测该文件的存在或不存在来激活profile。missing检查文件是否存在，如果不存在则激活profile。另一方面，exists则会检查文件是否存在，如果存在则激活profile。 -->
  <file>
    <!--如果指定的文件存在，则激活profile。 -->
    <exists>${basedir}/file2.properties</exists>
    <!--如果指定的文件不存在，则激活profile。 -->
    <missing>${basedir}/file1.properties</missing>
  </file>
</activation>
```

### ActiveProfiles

在运行时手工激活的profile，该元素包含了一组activeProfile元素，每个active Profile元素都含有一个profileId。

任何一个在activeProfile中定义的profile id ，不论环境变量设置如何，其对应的profile都会被激活。如果没有匹配的profile，则什么都不会发生。

```xml
<activeProfiles>
    <!-- 要激活的profile id -->
    <activeProfile>env-test</activeProfile>
</activeProfiles>
```

激活profile的三种方式
1.通过ActiveProfiles激活
2.通过activation激活
3.通过命令激活

也是常用的方式，例如mvn -P 我们可以通过在 pom.xml 或 setting.xml 中指定不同环境的 profile，在编译构建不同的项目时，通过上述的命令行方式激活对应的 profIle。例如在开发环境下：mvn package -P dev可以打包开发环境下的项目。

注意：

从上文可以看到，repository 标签与 mirror 标签都定义了一个远程仓库的位置，那么当一个依赖同时存在于两个仓库时，会先加载那个依赖呢？
这里需要阐述一下 maven 加载真正起作用的 repository 的步骤，
1.首先获取 pom.xml 中 repository 的集合，然后获取 setting.xml 中 mirror 中元素。
2.如果 repository 的 id 和 mirror 的 mirrorOf 的值相同，则该 mirror 替代该 repository。
3.如果该 repository 找不到对应的 mirror，则使用其本身。
4.依此可以得到最终起作用的 repository 集合。可以理解 mirror 是复写了对应 id 的 repository。
mirror 相当于一个拦截器，会拦截被 mirrorOf 匹配到的 repository，匹配原则参照 1.2.6 ，在匹配到后，会用 mirror 里定义的 url 替换到 repository。

# 参考资料

https://www.cnblogs.com/eric-liu-cn/p/17514243.html

* any list
{:toc}