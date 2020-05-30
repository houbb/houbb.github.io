---
layout: post
title: java AST 抽象语法树-JavaParser 实际使用
date:  2020-5-29 14:24:18 +0800
categories: [java]
tags: [aop, ast, sh]
published: true
---

# 简单使用

## maven 引入

```xml
<dependency>
    <groupId>com.github.javaparser</groupId>
    <artifactId>javaparser-symbol-solver-core</artifactId>
    <version>3.15.21</version>
</dependency>

<dependency>
    <groupId>com.github.javaparser</groupId>
    <artifactId>javaparser-core</artifactId>
    <version>3.15.21</version>
</dependency>
```

ps: 需要设置 jdk 级别为 1.8

## 测试代码

- 测试类

```java
package com.github.houbb;

public class Main {

    public static void main(String[] args) {
        System.out.println("main");
    }

}
```

- 输出方法名称

```java
package com.github.houbb;

import com.github.javaparser.JavaParser;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.visitor.VoidVisitorAdapter;
import jdk.internal.org.objectweb.asm.MethodVisitor;

import java.io.FileInputStream;
import java.io.FileNotFoundException;

public class MainMethodAccess {

    public static void main(String[] args) throws FileNotFoundException {
        // creates an input stream for the file to be parsed
        FileInputStream in = new FileInputStream("D:\\github_other\\javaparser-maven-sample\\src\\main\\java\\com\\github\\houbb\\Main.java");

        CompilationUnit cu = StaticJavaParser.parse(in);

        // visit and print the methods names
        new MethodVisitor().visit(cu, null);
    }

    /**
     * Simple visitor implementation for visiting MethodDeclaration nodes.
     */
    private static class MethodVisitor extends VoidVisitorAdapter {
        @Override
        public void visit(MethodDeclaration n, Object arg) {
            // here you can access the attributes of the method.
            // this method will be called for all methods in this
            // CompilationUnit, including inner class methods
            System.out.println(n.getName());
        }
    }

}
```

执行结果

```
main
```

# 改变方法



# 拓展阅读

## AST


jdt


## ASM 

[java assist]()

[cglib]()


## java 源码

[java poet]()


# 参考资料

[JavaParser：Java代码生成](https://www.jianshu.com/p/04b413c97988)

[javaparser 使用](https://blog.csdn.net/weixin_33805557/article/details/92757611)

[JavaParser 使用指南](https://blog.csdn.net/crabstew/article/details/89547472)

[使用JavaParser进行java源码解析](https://www.cnblogs.com/tajnice/articles/3543813.html)

* any list
{:toc}