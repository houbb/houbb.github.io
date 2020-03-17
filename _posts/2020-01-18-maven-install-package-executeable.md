---
layout: post
title: maven 打包成可执行的文件 jar
date:  2020-1-9 10:09:32 +0800
categories: [Devops]
tags: [devops, maven, java, error, sh]
published: true
---

# 业务背景

直接生成一个可执行的 jar，而不是一个麻烦的 war 包之类的。

# maven 打包方式

## 配置

- pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.xxx</groupId>
    <artifactId>xx</artifactId>
    <version>1.0-SNAPSHOT</version>

    <dependencies>
        
    </dependencies>

    <build>
        <plugins>
            <!--compiler plugin -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.2</version>

                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                    <encoding>UTF-8</encoding>
                </configuration>
            </plugin>

            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-assembly-plugin</artifactId>
                <version>2.5.5</version>
                <configuration>
                    <archive>
                        <manifest>
                            <mainClass>com.xxx.Main</mainClass>
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

        </plugins>
    </build>

</project>
```

- Main.java

`com.xxx.Main` 对应的使我们的主运行类。

实现 main() 函数即可，作为整体的入口。

## 打包

```
$ mvn clean install
```

会生成两个，选择 `jar-with-dependencies` 的可以默认依赖相关包，个人觉得比较方便。

当然你也可以重新命名，比如 `main.jar`

## 执行

```
$   java -jar main.jar
```

就可以执行了。

## 日志

`System.out.println();` 可以直接输出出来。

# 参考资料

[使用maven生成可执行的jar包](https://www.cnblogs.com/justinzhang/p/4975727.html)

[Maven 生成打包可执行jar包](https://blog.csdn.net/daerzei/article/details/82883472)

* any list
{:toc}