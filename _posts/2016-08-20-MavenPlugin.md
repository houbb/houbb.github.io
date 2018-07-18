---
layout: post
title: Maven Plugin
date: 2016-08-20 12:35:04 +0800
categories: [apache]
tags: [maven]
published: true
---
* any list
{:toc}


Maven is - at its heart - a plugin execution framework; all work is done by plugins. Looking for a specific goal to execute?
This page lists the core plugins and others. There are the build and the reporting plugins:

- **Build** plugins will be executed during the build and they should be configured in the ```<build/>``` element from the POM.
- **Reporting** plugins will be executed during the site generation and they should be configured in the ```<reporting/>``` element from the POM.
Because the result of a Reporting plugin is part of the generated site, Reporting plugins should be both internationalized and localized.
You can read more about the localization of our plugins and how you can help.

> [maven plugin](http://maven.apache.org/plugins/index.html)


# Core plugins

Plugins corresponding to default core phases (ie. clean, compile). They may have multiple goals as well.

## [compiler]()

Compiles Java sources.

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>${maven-compiler-plugin.version}</version>
    <configuration>
        <source>1.8</source>
        <target>1.8</target>
    </configuration>
</plugin>
```



## [surefire]()

Run the JUnit unit tests in an isolated classloader.

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>${maven-surefire-plugin.version}</version>
    <configuration>
        <skipTests>true</skipTests>
        <testFailureIgnore>true</testFailureIgnore>
    </configuration>
</plugin>
```

# Reporting plugins

Plugins which generate reports, are configured as reports in the POM and run under the site generation lifecycle.

## [javadoc]()

Generate Javadoc for the project.

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-javadoc-plugin</artifactId>
    <version>2.9.1</version>


    <configuration>
        <!--maven 多模块-->
        <aggregate>true</aggregate>

        <!--路径-->
        <reportOutputDirectory>../doc</reportOutputDirectory>
        <!--目录-->
        <destDir>myapidocs</destDir>

        <!--IOS ERROR: Unable to find javadoc command: The environment variable JAVA_HOME is not correctly set.-->
        <javadocExecutable>${java.home}/../bin/javadoc</javadocExecutable>


        <!--自定义标签-->
        <tags>
            <tag>
                <!--name为你Java代码中的注解的名字-->
                <name>Description</name>
                <!--事实上这个就是说你要把哪些（方法、字段、类）上面的注解放到JavaDoc中-->
                <placement>a</placement>
                <!--head。假设不写这个，用的就是name，假设写了，那么显示效果例如以下：-->
                <head>用途</head>
            </tag>
        </tags>
    </configuration>

</plugin>
```

# Misc

A number of other projects provide their own Maven plugins.

## [tomcat7]()

Run an Apache Tomcat container for rapid webapp development.

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>

<build>
    <plugins>
        <plugin>
            <groupId>org.apache.tomcat.maven</groupId>
            <artifactId>tomcat7-maven-plugin</artifactId>
            <version>${plugin.tomcat.version}</version>
            <configuration>
                <port>8081</port>
                <path>/</path>
                <uriEncoding>${project.build.sourceEncoding}</uriEncoding>
            </configuration>
        </plugin>
    </plugins>
</build>
```


# Versions

> [versions-plugin zh_CN](http://www.dexcoder.com/selfly/article/4002)

```
mvn versions:set -DnewVersion=1.0.1-SNAPSHOT
```


- commit

```
mvn versions:commit
```

- revert

```
mvn versions:revert
```


正确修改方法:

(1) 修改父类

```
mvn versions:set -DgroupId=com.framework -DartifactId=framework* -DoldVersion=* -DnewVersion=1.0.2-SNAPSHOT
```

(2) 修改子类

```
mvn -N versions:update-child-modules
```

# Auto-Config

> [Auto-Config](http://openwebx.org/docs/autoconfig.html)

> [简单案例](https://github.com/houbb/springmvc/tree/master/springmvc-autoconfig)

Import in maven

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <properties>
        <!-- 定义autoconfig的版本，建议将此行写在parent pom.xml中。 -->
        <autoconfig-plugin-version>1.2</autoconfig-plugin-version>
    </properties>
    <build>
        <plugins>
            <plugin>
                <groupId>com.alibaba.citrus.tool</groupId>
                <artifactId>autoconfig-maven-plugin</artifactId>
                <version>${autoconfig-plugin-version}</version>
                <configuration>
                    <!-- 要进行AutoConfig的目标文件，默认为${project.artifact.file}。
                    <dest>${project.artifact.file}</dest>
                    -->
                    <!-- 配置后，是否展开目标文件，默认为false，不展开。
                    <exploding>true</exploding>
                    -->
                    <!-- 展开到指定目录，默认为${project.build.directory}/${project.build.finalName}。
                    <explodedDirectory>
                        ${project.build.directory}/${project.build.finalName}
                    </explodedDirectory>
                    -->
                </configuration>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>autoconfig</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```


跳过执行

```
$   mvn install –Dautoconfig.skip
```


- 想使用配置文件

(1) 直接将生成的配置文件 ```antx.properties``` 视为配置文件使用。放在本地。
(2) 打成war包之后可以自动属性替换掉。

1、 maven war struct:

```
war-project（源目录结构）               -> war-project.war（目标目录结构）
 │  pom.xml
 │
 └─src
     └─main
         ├─java
         ├─resources                    -> /WEB-INF/classes
         │      file1.xml                      file1.xml
         │      file2.xml                      file2.xml
         │
         └─webapp                       -> /
             ├─META-INF                 -> /META-INF
             │  └─autoconf              -> /META-INF/autoconf
             │        auto-config.xml          auto-config.xml
             │
             └─WEB-INF                  -> /WEB-INF
                   web.xml                     web.xml
                   file3.xml                   file3.xml
```


- ```/META-INF/autoconf``` 目录用来存放AutoConfig的描述文件，以及可选的模板文件。

- ```auto-config.xml``` 是用来指导AutoConfig行为的关键描述文件。


2、 maven jar struct

```
jar-project（源目录结构）               -> jar-project.jar（目标目录结构）
 │  pom.xml
 │
 └─src
     └─main
         ├─java
         └─resources                    -> /
             │  file1.xml                      file1.xml
             │  file2.xml                      file2.xml
             │
             └─META-INF                 -> /META-INF
                 └─autoconf             -> /META-INF/autoconf
                       auto-config.xml         auto-config.xml
```


3、Common directory

```
directory
 │  file1.xml
 │  file2.xml
 │
 └─conf
       auto-config.xml
```


## auto-config

```xml
<?xml version="1.0" encoding="UTF-8"?>
<config>
    <group>

        <property name="petstore.work"
                    description="应用程序的工作目录" />

        <property name="petstore.loggingRoot"
                    defaultValue="${petstore.work}/logs"
                    description="日志文件目录" />

        <property name="petstore.upload"
                    defaultValue="${petstore.work}/upload"
                    description="上传文件的目录" />

        <property name="petstore.loggingLevel"
                    defaultValue="warn"
                    description="日志文件级别">

            <validator name="choice"
                         choice="trace, debug, info, warn, error" />

        </property>

    </group>
    <script>
        <generate template="WEB-INF/web.xml" />
        <generate template="WEB-INF/common/resources.xml" />
    </script>
</config>
```

完整的properties

```
<property
    name="..."
    [defaultValue="..."]
    [description="..."]
    [required="true|false"]
>
    <validator name="..." />
    <validator name="..." />
    ...
</property>
```

生成配置文件的指令

```
<generate
    template="..."
    [destfile="..."]
    [charset="..."]
    [outputCharset="..."]
>
```

## auto-config 命令

```
$ autoconfig
Detected system charset encoding: UTF-8
If your can't read the following text, specify correct one like this:
  autoconfig -c mycharset

使用方法：autoconfig [可选参数] [目录名|包文件名]

可选参数：
 -c,--charset                输入/输出编码字符集
 -d,--include-descriptors
                             包含哪些配置描述文件，例如：conf/auto-config.xml，可使用*、**、?通配符，如有多项，用逗号分隔
 -D,--exclude-descriptors    排除哪些配置描述文件，可使用*、**、?通配符，如有多项，用逗号分隔
 -g,--gui                    图形用户界面（交互模式）
 -h,--help                   显示帮助信息
 -i,--interactive            交互模式：auto|on|off，默认为auto，无参数表示on
 -I,--non-interactive        非交互模式，相当于--interactive=off
 -n,--shared-props-name      共享的属性文件的名称
 -o,--output                 输出文件名或目录名
 -P,--exclude-packages       排除哪些打包文件，可使用*、**、?通配符，如有多项，用逗号分隔
 -p,--include-packages
                             包含哪些打包文件，例如：target/*.war，可使用*、**、?通配符，如有多项，用逗号分隔
 -s,--shared-props           共享的属性文件URL列表，以逗号分隔
 -T,--type                   文件类型，例如：war, jar, ear等
 -t,--text                   文本用户界面（交互模式）
 -u,--userprop               用户属性文件
 -v,--verbose                显示更多信息
```

## 可执行 jar

- xml 引入

```xml
<plugin>
	<groupId>org.apache.maven.plugins</groupId>
	<artifactId>maven-assembly-plugin</artifactId>
	<version>2.5.5</version>
	<configuration>
		<archive>
			<manifest>
				<mainClass>com.xxg.Main</mainClass>
			</manifest>
		</archive>
		<descriptorRefs>
			<descriptorRef>jar-with-dependencies</descriptorRef>
		</descriptorRefs>
	</configuration>
	<executions>
		<execution>
			<id>make-assembly</id>
			<phase>package</phase>
			<goals>
				<goal>single</goal>
			</goals>
		</execution>
	</executions>
</plugin>
```

- 命令行执行

```sh
$   mvn package
```











