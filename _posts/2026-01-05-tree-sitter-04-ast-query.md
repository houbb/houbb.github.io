---
layout: post
title: tree-sitter-java S-expression 表达式查询的例子
date: 2026-01-05 21:01:55 +0800
categories: [AI]
tags: [ai, ai-coding, sh]
published: true
---

# maven 引入

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>local-test</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

        <!-- Maven -->
    <dependencies>
        <!-- add tree sitter -->
        <dependency>
            <groupId>io.github.bonede</groupId>
            <artifactId>tree-sitter</artifactId>
            <version>0.25.3</version>
        </dependency>
        <!-- add json parser -->
        <dependency>
            <groupId>io.github.bonede</groupId>
            <artifactId>tree-sitter-json</artifactId>
            <version>0.24.8</version>
        </dependency>
<!--        <dependency>-->
<!--            <groupId>io.github.bonede</groupId>-->
<!--            <artifactId>tree-sitter-java</artifactId>-->
<!--            <version>0.23.4</version>-->
<!--        </dependency>-->
        <dependency>
            <groupId>io.github.bonede</groupId>
            <artifactId>tree-sitter-java</artifactId>
            <version>0.23.4</version>
        </dependency>
<!--        <dependency>-->
<!--            <groupId>io.github.bonede</groupId>-->
<!--            <artifactId>tree-sitter-css</artifactId>-->
<!--            <version>0.23.1</version>-->
<!--        </dependency>-->
<!--        <dependency>-->
<!--            <groupId>io.github.bonede</groupId>-->
<!--            <artifactId>tree-sitter-go</artifactId>-->
<!--            <version>0.23.3</version>-->
<!--        </dependency>-->
<!--        <dependency>-->
<!--            <groupId>io.github.bonede</groupId>-->
<!--            <artifactId>tree-sitter-html</artifactId>-->
<!--            <version>0.23.2</version>-->
<!--        </dependency>-->


        <!-- Apache Commons Codec for SHA-256 hashing -->
        <dependency>
            <groupId>commons-codec</groupId>
            <artifactId>commons-codec</artifactId>
            <version>1.17.1</version>
        </dependency>
        <!-- Gson for JSON serialization -->
        <dependency>
            <groupId>com.google.code.gson</groupId>
            <artifactId>gson</artifactId>
            <version>2.10.1</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>17</source>
                    <target>17</target>
                    <encoding>UTF-8</encoding>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>exec-maven-plugin</artifactId>
                <version>3.1.0</version>
                <configuration>
                    <mainClass>org.example.demo.TreeSitterJavaQueryTest</mainClass>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

# 测试例子

## 例子

```java
package org.example.demo;

import org.treesitter.*;

import java.nio.charset.StandardCharsets;

/**
 * Tree-sitter Java 基础解析示例
 * 只提取最核心的信息：类、方法、字段
 */
public class TreeSitterJavaQueryTest2 {

    public static void main(String[] args) {
        testJavaQueryExtraction();
    }

    public static void testJavaQueryExtraction() {

        String source = """
            package demo;

            import java.util.List;
            import java.io.File;

            @interface MyAnno {}

            interface MyInterface {}

            enum MyEnum {
                A, B
            }

            class Parent {}

            class Main extends Parent implements MyInterface {

                public Main() {}

                public void hello() {
                    System.out.println("hello");
                    test();
                }

                private void test() {}
            }
            """;

        byte[] sourceBytes = source.getBytes(StandardCharsets.UTF_8);

        // ===============================
        // 1️⃣ Parser
        // ===============================
        TSParser parser = new TSParser();
        TSLanguage javaLang = new TreeSitterJava();

        parser.setLanguage(javaLang);

        TSTree tree = parser.parseString(null, source);

        // assertNotNull(tree);

        TSNode root = tree.getRootNode();

        // ===============================
        // 2️⃣ Query
        // ===============================
        TSQuery query = new TSQuery(
                javaLang,
                getJavaQuery()
        );

        TSQueryCursor cursor = new TSQueryCursor();
        cursor.exec(query, root);

        TSQueryMatch match = new TSQueryMatch();

        int matchCount = 0;

        // ===============================
        // 3️⃣ Iterate matches
        // ===============================
        while (cursor.nextMatch(match)) {
            matchCount++;

            for (TSQueryCapture capture : match.getCaptures()) {
//                TSQueryCapture capture = match.getCaptures()[i];
                TSNode node = capture.getNode();

                String captureName =
                        query.getCaptureNameForId(
                                capture.getIndex()
                        );

                String text = getNodeText(node, sourceBytes);

                System.out.printf(
                        "Capture: %-30s -> %s%n",
                        captureName,
                        text
                );
            }

            System.out.println("------\n\n");
        }
    }

    /**
     * 从源代码字节数组中提取节点的文本内容
     */
    private static String getNodeText(TSNode node, byte[] sourceBytes) {
        if (node == null || node.isNull()) {
            return "";
        }
        int startByte = node.getStartByte();
        int endByte = node.getEndByte();
        if (startByte >= 0 && endByte <= sourceBytes.length) {
            byte[] contentBytes = new byte[endByte - startByte];
            System.arraycopy(sourceBytes, startByte, contentBytes, 0, endByte - startByte);
            return new String(contentBytes, StandardCharsets.UTF_8);
        }
        return "";
    }

    /**
     * Java 查询语句
     */
    private static String getJavaQuery() {
        return """
            ; Classes, Interfaces, Enums, Annotations
            (class_declaration name: (identifier) @name) @definition.class
            (interface_declaration name: (identifier) @name) @definition.interface
            (enum_declaration name: (identifier) @name) @definition.enum
            (annotation_type_declaration name: (identifier) @name) @definition.annotation
            
            ; Methods & Constructors
            (method_declaration name: (identifier) @name) @definition.method
            (constructor_declaration name: (identifier) @name) @definition.constructor
            
            ; Imports
            (import_declaration (_) @import.source) @import
            
            ; Calls
            (method_invocation name: (identifier) @call.name) @call
            (method_invocation object: (_) name: (identifier) @call.name) @call
            
            ; Heritage - extends class
            (class_declaration
              name: (identifier) @heritage.class
              (superclass (type_identifier) @heritage.extends)
            ) @heritage
            
            ; Heritage - implements interfaces
            (class_declaration
              name: (identifier) @heritage.class
              (super_interfaces
                (type_list
                    (type_identifier) @heritage.implements
                )
              )
            ) @heritage.impl
            """;
    }

}
```

## 效果

输出：

```
m2\repository\com\google\code\gson\gson\2.10.1\gson-2.10.1.jar org.example.demo.TreeSitterJavaQueryTest2


Capture: import                         -> import java.util.List;
Capture: import.source                  -> java.util.List
------


Capture: import                         -> import java.io.File;
Capture: import.source                  -> java.io.File
------


Capture: definition.annotation          -> @interface MyAnno {}
Capture: name                           -> MyAnno
------


Capture: definition.interface           -> interface MyInterface {}
Capture: name                           -> MyInterface
------


Capture: definition.enum                -> enum MyEnum {
    A, B
}
Capture: name                           -> MyEnum
------


Capture: definition.class               -> class Parent {}
Capture: name                           -> Parent
------


Capture: definition.class               -> class Main extends Parent implements MyInterface {

    public Main() {}

    public void hello() {
        System.out.println("hello");
        test();
    }

    private void test() {}
}
Capture: name                           -> Main
------


Capture: heritage                       -> class Main extends Parent implements MyInterface {

    public Main() {}

    public void hello() {
        System.out.println("hello");
        test();
    }

    private void test() {}
}
Capture: heritage.class                 -> Main
Capture: heritage.extends               -> Parent
------


Capture: heritage.impl                  -> class Main extends Parent implements MyInterface {

    public Main() {}

    public void hello() {
        System.out.println("hello");
        test();
    }

    private void test() {}
}
Capture: heritage.class                 -> Main
Capture: heritage.implements            -> MyInterface
------


Capture: definition.constructor         -> public Main() {}
Capture: name                           -> Main
------


Capture: definition.method              -> public void hello() {
        System.out.println("hello");
        test();
    }
Capture: name                           -> hello
------


Capture: call                           -> System.out.println("hello")
Capture: call.name                      -> println
------


Capture: call                           -> System.out.println("hello")
Capture: call.name                      -> println
------


Capture: call                           -> test()
Capture: call.name                      -> test
------


Capture: definition.method              -> private void test() {}
Capture: name                           -> test
------
```



# 参考资料

https://github.com/bonede/tree-sitter-ng

* any list
{:toc}