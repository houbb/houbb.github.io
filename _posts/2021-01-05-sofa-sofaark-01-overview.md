---
layout: post
title:  SOFAArk-01-蚂蚁金服类隔离工具 SOFAArk 入门及源码讲解
date:  2021-01-05 08:11:27 +0800
categories: [SOFA]
tags: [sofa, springboot, sh]
published: true
---


# 情境导入

你是否遇到过包冲突问题？又是如何解决的？

有些项目都是多年的历史“遗留财产”，老马甚至还遇到过一个应用中有 3 个不同版本的 spring，只能说能跑起来就是奇迹。

不过有时候会进行各种版本升级，然后会发现各种版本冲突，浪费时间在排除各种版本冲突的问题上。

那有没有一种方法，可以帮助我们更好的解决包冲突呢？

![类冲突](https://images.gitee.com/uploads/images/2021/0109/163236_1331143e_508704.png "屏幕截图.png")

今天就让我们一起学习下蚂蚁金服开源的利器——SOFAArk。

# SOFAArk

SOFAArk 是一款基于 Java 实现的轻量级类隔离容器，主要提供类隔离和应用(模块)合并部署能力，由蚂蚁金服公司开源贡献；

在大型软件开发过程中，通常会推荐底层功能插件化，业务功能模块化的开发模式，以期达到低耦合、高内聚、功能复用的优点。

## 特性

基于此，SOFAArk 提供了一套较为规范化的插件化、模块化的开发方案，产品能力主要包括：

- 定义类加载模型，运行时底层插件、业务应用(模块)之间均相互隔离，单一插件和应用(模块)由不同的 ClassLoader 加载，可以有效避免相互之间的包冲突，提升插件和模块功能复用能力；

- 定义插件开发规范，提供 maven 打包工具，简单快速将多个二方包打包成插件（Ark Plugin，以下简称 Plugin）

- 定义模块开发规范，提供 maven 打包工具，简单快速将应用打包成模块 (Ark Biz，以下简称 Biz)

- 针对 Plugin、Biz 提供标准的编程界面，包括服务、事件、扩展点等机制

- 支持多 Biz 的合并部署，开发阶段将多个 Biz 打包成可执行 Fat Jar，或者运行时使用 API 或配置中心(Zookeeper)动态地安装卸载 Biz

基于以上能力，SOFAArk 可以帮助解决依赖包冲突、多应用(模块)合并部署等场景问题。

## classloader 加载

jvm认为不同classloader加载的类即使包名类名相同，也认为他们是不同的。

sofa-ark将需要隔离的jar包打成plugin，对每个plugin都用独立的classloader去加载。

![蚂蚁金服](https://images.gitee.com/uploads/images/2021/0109/163326_23043cd2_508704.png "屏幕截图.png")

# 快速入门

## 定义 2 个不同版本的 jar

为了模拟不同版本之间的冲突，你可以自己定义 2 个不同版本的 jar 安装到本地，也可以直接使用常用的一些工具包进行模拟。

我这里直接使用了自己的一个工具包：

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>heaven</artifactId>
    <version>${heaven.version}</version>
</dependency>
```

## 项目结构

一共下面 3 个模块：

```
sofaark-learn-serviceone
sofaark-learn-servicetwo
sofaark-learn-run
```

我们让 serviceone 和 servicetwo 依赖不同的 heaven 版本，然后在 run 模块中同时依赖二者，模拟 jar 版本冲突。

## serviceone

- pom.xml

指定依赖了 0.0.1 版本的 heaven。

`sofa-ark-plugin-maven-plugin` 是为了将当前模块打包成为 ark-plugin。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>sofaark-learn</artifactId>
        <groupId>org.example</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>sofaark-learn-serviceone</artifactId>

    <dependencies>
        <dependency>
            <groupId>com.github.houbb</groupId>
            <artifactId>heaven</artifactId>
            <version>0.0.1</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>com.alipay.sofa</groupId>
                <artifactId>sofa-ark-plugin-maven-plugin</artifactId>
                <version>0.6.0</version>
                <executions>
                    <execution>
                        <id>default-cli</id>
                        <goals>
                            <goal>ark-plugin</goal>
                        </goals>

                        <configuration>
                            <!-- configure exported class -->
                            <exported>
                                <!-- configure class-level exported class -->
                                <classes>
                                    <class>com.github.houbb.sofaark.learn.serviceone.ServiceOne</class>
                                </classes>
                            </exported>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>

</project>
```

- ServiceOne.java

服务定义比较简单，输出一下当前类的 classloader。

```java
package com.github.houbb.sofaark.learn.serviceone;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class ServiceOne {

    public static void say() {
        System.out.println("v0.0.1 classloader:" + ServiceOne.class.getClassLoader());
    }

}
```

## servicetwo

这个和 serviceone 基本一样，只是依赖的 heaven 版本不同。

- pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>sofaark-learn</artifactId>
        <groupId>org.example</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>sofaark-learn-servicetwo</artifactId>

    <dependencies>
        <dependency>
            <groupId>com.github.houbb</groupId>
            <artifactId>heaven</artifactId>
            <version>0.1.120</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>com.alipay.sofa</groupId>
                <artifactId>sofa-ark-plugin-maven-plugin</artifactId>
                <version>0.6.0</version>
                <executions>
                    <execution>
                        <id>default-cli</id>
                        <goals>
                            <goal>ark-plugin</goal>
                        </goals>

                        <configuration>
                            <!-- configure exported class -->
                            <exported>
                                <!-- configure class-level exported class -->
                                <classes>
                                    <class>com.github.houbb.sofaark.learn.servicetwo.ServiceTwo</class>
                                </classes>
                            </exported>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>

</project>
```

- ServiceTwo.java

```java
package com.github.houbb.sofaark.learn.servicetwo;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class ServiceTwo {

    public static void say() {
        System.out.println("v0.1.120 classloader:" + ServiceTwo.class.getClassLoader());
    }

}
```

## run

这个模块会依赖二者的实现。

- pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>sofaark-learn</artifactId>
        <groupId>org.example</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>sofaark-learn-run</artifactId>

    <dependencies>

<!--        只作用于编译器-->
        <dependency>
            <groupId>${project.groupId}</groupId>
            <artifactId>sofaark-learn-serviceone</artifactId>
            <version>${project.version}</version>
            <scope>compile</scope>
        </dependency>
        <dependency>
            <groupId>${project.groupId}</groupId>
            <artifactId>sofaark-learn-servicetwo</artifactId>
            <version>${project.version}</version>
            <scope>compile</scope>
        </dependency>

<!--        实际执行的是 ark-plugin-->
        <dependency>
            <groupId>${project.groupId}</groupId>
            <artifactId>sofaark-learn-serviceone</artifactId>
            <version>${project.version}</version>
            <classifier>ark-plugin</classifier>
        </dependency>
        <dependency>
            <groupId>${project.groupId}</groupId>
            <artifactId>sofaark-learn-servicetwo</artifactId>
            <version>${project.version}</version>
            <classifier>ark-plugin</classifier>
        </dependency>

        <dependency>
            <groupId>com.alipay.sofa</groupId>
            <artifactId>sofa-ark-support-starter</artifactId>
            <version>0.6.0</version>
        </dependency>

    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>com.alipay.sofa</groupId>
                <artifactId>sofa-ark-maven-plugin</artifactId>
                <version>0.6.0</version>
                <executions>
                    <execution>
                        <id>default-cli</id>

                        <!--goal executed to generate executable-ark-jar -->
                        <goals>
                            <goal>repackage</goal>
                        </goals>
                        <configuration>
                            <!--specify destination where executable-ark-jar will be saved, default saved to ${project.build.directory}-->
                            <outputDirectory>./</outputDirectory>

                            <!--default none-->
                            <arkClassifier>executable-ark</arkClassifier>
                        </configuration>
                    </execution>
                </executions>
            </plugin>

        </plugins>
    </build>

</project>
```

注意这里的 `<classifier>ark-plugin</classifier>`，实际上是引入了上面编译后的 ark-plugin，为了让 idea 识别。

plugins 中的 `<arkClassifier>executable-ark</arkClassifier>` 为了将当前的模块打包成为一个可以执行的 ark 包。

- Main.java

运行的方法如下：

```java
package com.github.houbb.sofaark.learn.run;

import com.alipay.sofa.ark.support.startup.SofaArkBootstrap;
import com.github.houbb.sofaark.learn.serviceone.ServiceOne;
import com.github.houbb.sofaark.learn.servicetwo.ServiceTwo;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class Main {

    public static void main(String[] args) {
        SofaArkBootstrap.launch(args);
        System.out.println("Main classloader: " + Main.class.getClassLoader());

        ServiceOne.say();
        ServiceTwo.say();
    }

}
```

我们需要指定 `SofaArkBootstrap.launch(args);`，让 ark 启动生效。

这样整个入门流程就完成了，对应的日志如下：

```
Main classloader: com.alipay.sofa.ark.container.service.classloader.BizClassLoader@1cec3a6
v0.0.1 classloader:com.alipay.sofa.ark.container.service.classloader.BizClassLoader@1cec3a6
v0.1.120 classloader:com.alipay.sofa.ark.container.service.classloader.BizClassLoader@1cec3a6
Ark container started in 2894 ms.
```

可以发现，所有的 classloader 都变成了 ark 对应的容器 BizClassLoader。

接下来，我们可以继续学习一下，这背后的原理。

![实现原理](https://images.gitee.com/uploads/images/2021/0109/163458_cc8d3d38_508704.png "屏幕截图.png")

# sofa-ark-plugin-maven-plugin 插件原理

这 3 个模块中，都反复出现一个核心插件：sofa-ark-plugin-maven-plugin。

这个插件做了什么？

最好的答案就在源码之中，我们可以到 [sofa-ark-plugin](https://github.com/sofastack/sofa-ark/tree/master/sofa-ark-plugin) 查看对应的源码。

## ArkPluginMojo 

ark-plugin 核心实现类 ArkPluginMojo 定义如下：

```java
@Mojo(name = "ark-plugin", defaultPhase = LifecyclePhase.PACKAGE, requiresDependencyResolution = ResolutionScope.RUNTIME)
public class ArkPluginMojo extends AbstractMojo {}
```

这里通过注解 `@Mojo` 定义了 ark-plugin，并将其生效的阶段绑定为 package 打包阶段。

### execute 方法

也就是每次执行 mvn package 时，会执行其对应的 execute 方法进行处理。

核心实现精简如下：

```java
@Override
public void execute() throws MojoExecutionException {
    Archiver archiver = getArchiver();
    String fileName = getFileName();
    File destination = new File(outputDirectory, fileName);
    File tmpDestination = new File(outputDirectory, getTempFileName());
    archiver.setDestFile(tmpDestination);
    Set<Artifact> artifacts = project.getArtifacts();
    artifacts = filterExcludeArtifacts(artifacts);
    Set<Artifact> conflictArtifacts = filterConflictArtifacts(artifacts);
    addArkPluginArtifact(archiver, artifacts, conflictArtifacts);
    addArkPluginConfig(archiver);
    archiver.createArchive();
    shadeJarIntoArkPlugin(destination, tmpDestination, artifacts);
    
    if (isAttach()) {
        if (StringUtils.isEmpty(classifier)) {
            Artifact artifact = project.getArtifact();
            artifact.setFile(destination);
            project.setArtifact(artifact);
        } else {
            projectHelper.attachArtifact(project, destination, classifier);
        }
    }
}
```

这个方法主要做了下面几步：

1. 建立一个zip格式的归档，用来保存引入的jar包和其他文件，建立输出路径。

2. 获取引入的所有依赖（Artifacts），并且将需要exclude的包排除出去。

3. 将所有依赖写入zip归档中的lib目录下

4. 将配置信息写入zip归档中，包括 export.index，MANIFEST.MF，mark 等


# SofaArkBootstrap ark 引导类

![容器加载机制](https://images.gitee.com/uploads/images/2021/0109/163549_376b7489_508704.png "屏幕截图.png")

## 初始化 Ark Container

我们使用的方式，和普通的 main() 方法相比，就是多了一句  `SofaArkBootstrap.launch(args);`

对应的源码如下：

```java
public static void launch(String[] args) {
    try {
        // ark 是否已经启动
        // 直接 debug 可以发现，会进入到判断之中
        if (!isSofaArkStarted()) {
            // 
            entryMethod = new EntryMethod(Thread.currentThread());
            IsolatedThreadGroup threadGroup = new IsolatedThreadGroup(
                entryMethod.getDeclaringClassName());

            //MAIN_ENTRY_NAME 对应的方法名称为 remain，实际上这里就是一个反射调用 remain()    
            LaunchRunner launchRunner = new LaunchRunner(SofaArkBootstrap.class.getName(),
                MAIN_ENTRY_NAME, args);
            Thread launchThread = new Thread(threadGroup, launchRunner,
                entryMethod.getMethodName());
            launchThread.start();
            LaunchRunner.join(threadGroup);
            threadGroup.rethrowUncaughtException();
            System.exit(0);
        }
    } catch (Throwable e) {
        throw new RuntimeException(e);
    }
}
```

核心目的：

（1）将 ark container 启动起来

（2）让 ark container 加载 ark-plugin 和 ark-biz


- isSofaArkStarted ark 是否已经启动

实现如下：

```java
private static boolean isSofaArkStarted() {
    Class<?> bizClassLoader = SofaArkBootstrap.class.getClassLoader().getClass();
    return BIZ_CLASSLOADER.equals(bizClassLoader.getCanonicalName());
}
```

- remain()

实现如下：

```java
private static void remain(String[] args) throws Exception {// NOPMD
    AssertUtils.assertNotNull(entryMethod, "No Entry Method Found.");
    URL[] urls = getURLClassPath();
    new ClasspathLauncher(new ClassPathArchive(entryMethod.getDeclaringClassName(),
        entryMethod.getMethodName(), urls)).launch(args, getClasspath(urls),
        entryMethod.getMethod());
}
```

作用：

1. 获取classpath下的所有jar包，包括jdk自己的jar包和maven引入的jar包。

2. 将所有依赖jar包和自己写的启动类及其main函数以url的形式传入ClasspathLauncher，ClasspathLauncher反射调用ArkContainer的main方法，并且使用ContainerClassLoader加载ArkContainer。

至此，就开始启动ArkContainer了。

## 启动 ArkContainer

接着就运行到了ArkContainer中的main方法，传入的参数args即之前 ClasspathLauncher 传入的url。

ClasspathLauncher 继承自 ArkLauncher，实现如下：

```java
public class ArkLauncher extends BaseExecutableArchiveLauncher {

    public final String SOFA_ARK_MAIN = "com.alipay.sofa.ark.container.ArkContainer";

    public static void main(String[] args) throws Exception {
        new ArkLauncher().launch(args);
    }

    public ArkLauncher() {
    }

    public ArkLauncher(ExecutableArchive executableArchive) {
        super(executableArchive);
    }

    @Override
    protected String getMainClass() {
        return SOFA_ARK_MAIN;
    }
}
```

所以后续反射调用 main 实际上会调用到 `ArkContainer#main()` 方法。

完整实现如下：

```java
public static Object main(String[] args) throws ArkRuntimeException {
    // 参数校验
    if (args.length < MINIMUM_ARGS_SIZE) {
        throw new ArkRuntimeException("Please provide suitable arguments to continue !");
    }
    try {
        //使用 LaunchCommand 将传入的参数按类型分类
        LaunchCommand launchCommand = LaunchCommand.parse(args);
        if (launchCommand.isExecutedByCommandLine()) {
            ExecutableArkBizJar executableArchive;
            File rootFile = new File(URLDecoder.decode(launchCommand.getExecutableArkBizJar()
                .getFile()));
            if (rootFile.isDirectory()) {
                executableArchive = new ExecutableArkBizJar(new ExplodedArchive(rootFile));
            } else {
                executableArchive = new ExecutableArkBizJar(new JarFileArchive(rootFile,
                    launchCommand.getExecutableArkBizJar()));
            }
            return new ArkContainer(executableArchive, launchCommand).start();
        } else {
            //ClassPathArchive将传入依赖的Jar包分类，并提供获得plugin和biz的filter方法
            ClassPathArchive classPathArchive = new ClassPathArchive(
                launchCommand.getEntryClassName(), launchCommand.getEntryMethodName(),
                launchCommand.getClasspath());
            return new ArkContainer(classPathArchive, launchCommand).start();
        }
    } catch (IOException e) {
        // 异常处理
        throw new ArkRuntimeException(String.format("SOFAArk startup failed, commandline=%s",
            LaunchCommand.toString(args)), e);
    }
}
```

最后都会调用 start 方法进行 ArkContainer 容器启动：

```java
public Object start() throws ArkRuntimeException {
    AssertUtils.assertNotNull(arkServiceContainer, "arkServiceContainer is null !");

    //AtomicBoolean 通过 cas 进行比较
    if (started.compareAndSet(false, true)) {
        // 添加关闭时的钩子函数
        Runtime.getRuntime().addShutdownHook(new Thread(new Runnable() {
            @Override
            public void run() {
                stop();
            }
        }));

        // ark 配置的处理工作
        prepareArkConfig();
        // 重新初始化 Ark Logger
        reInitializeArkLogger();

        // 初始化 ArkService
        arkServiceContainer.start();
        // 依次执行 pipeline
        Pipeline pipeline = arkServiceContainer.getService(Pipeline.class);
        pipeline.process(pipelineContext);
        System.out.println("Ark container started in " + (System.currentTimeMillis() - start) //NOPMD
                           + " ms.");
    }
    return this;
}
```

### 初始化 ArkService

`arkServiceContainer.start();` 实现如下：

这里是选择的 google Guice 作为注入实现。

```java
public void start() throws ArkRuntimeException {
    if (started.compareAndSet(false, true)) {
        ClassLoader oldClassLoader = ClassLoaderUtils.pushContextClassLoader(getClass()
            .getClassLoader());
        try {
            LOGGER.info("Begin to start ArkServiceContainer");
            injector = Guice.createInjector(findServiceModules());
            for (Binding<ArkService> binding : injector
                .findBindingsByType(new TypeLiteral<ArkService>() {
                })) {
                arkServiceList.add(binding.getProvider().get());
            }
            Collections.sort(arkServiceList, new OrderComparator());

            // 循环 ark 列表，执行 init
            for (ArkService arkService : arkServiceList) {
                LOGGER.info(String.format("Init Service: %s", arkService.getClass().getName()));
                arkService.init();
            }

            ArkServiceContainerHolder.setContainer(this);
            ArkClient.setBizFactoryService(getService(BizFactoryService.class));
            ArkClient.setBizManagerService(getService(BizManagerService.class));
            ArkClient.setInjectionService(getService(InjectionService.class));
            ArkClient.setEventAdminService(getService(EventAdminService.class));
            ArkClient.setArguments(arguments);
            LOGGER.info("Finish to start ArkServiceContainer");
        } finally {
            ClassLoaderUtils.popContextClassLoader(oldClassLoader);
        }
    }
}
```

### pipeline 流水线

arkServiceContainer中包含了一些Container启动前需要运行的Service，这些Service被封装到一个个的PipelineStage中，这些PipelineStage又被封装成List到一个pipeline中。

主要包含这么几个PipelineStage，依次执行：

（1）HandleArchiveStage

筛选所有第三方jar包中含有mark标记的plugin jar，说明这些jar是sofa ark maven插件打包成的需要隔离的jar。

从jar中的export.index中提取需要隔离的类，把他们加入一个PluginList中，并给每个plugin，分配一个独立的PluginClassLoader。同时以同样的操作给Biz也分配一个BizClassLoader

（2）DeployPluginStage 

创建一个map，key是需要隔离的类，value是这个加载这个类使用的PluginClassLoader实例。

（3）DeployBizStage 

使用BizClassLoader反射调用Biz的main方法。

至此，Container就启动完了。

后面再调用需要隔离的类时，由于启动Biz的线程已经被换成了BizClassLoader，在loadClass时BizClassLoader会首先看看在DeployPluginStage创建的Map中是否有PluginClassLoader能加载这个类，如果能就委托PluginClassLoader加载。

就实现了不同类使用不同的类加载器加载。

# 小结

对于类冲突，ark 确实是一种非常优雅轻量的解决方案。

背后核心原理就是对于 jvm classloader 和 maven plugin 的理解和应用。

学习好原理，并且和具体的应用场景结合起来，就产生了新的技术工具。

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

[Java隔离容器之sofa-ark使用说明及源码解析](https://blog.csdn.net/weixin_34246551/article/details/87990362)

[Ark 容器启动流程](https://www.sofastack.tech/projects/sofa-boot/sofa-ark-startup/)

* any list
{:toc}