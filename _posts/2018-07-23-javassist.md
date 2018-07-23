---
layout: post
title:  javassist
date:  2018-07-23 15:11:33 +0800
categories: [Java]
tags: [java, bytecode, sf]
published: true
---

# javassist

[javassist](http://www.javassist.org/) (Java编程助手)使Java字节码操作变得简单。

它是Java中编辑字节码的类库;它允许Java程序在运行时定义新类，并在JVM加载类文件时修改类文件。

与其他类似的字节码编辑器不同，Javassist提供了两个级别的API:源级和字节码级。

如果用户使用源代码级API，他们可以编辑类文件，而不需要了解Java字节码的规范。

整个API只使用Java语言的词汇表进行设计。您甚至可以以源文本的形式指定插入的字节码;Javassist动态编译它。

另一方面，字节码级API允许用户直接编辑类文件作为其他编辑器。

# 快速开始

## jar 导入

```xml
<dependency>
    <groupId>javassist</groupId>
    <artifactId>javassist</artifactId>
    <version>3.12.1.GA</version>
</dependency>
```

## 代码实现

- PathUtil.java

```java
public class PathUtil {
    /**
     * 类似getPath(Class), 只是不包含类的路径,而是获取到当前类包的根路径。
     * @param clazz 类
     * @return 转换后的路径
     */
    public static String getRootPath(Class clazz, final String classPath) {
        String uriPath = clazz.getResource("/").toString();
        return uriPath.replace("file:", "");
    }
}
```

- Main.java

```java
package com.github.houbb.spring.aop.javassist;

import javassist.CannotCompileException;
import javassist.ClassPool;
import javassist.CtClass;
import javassist.CtConstructor;
import javassist.CtField;
import javassist.CtMethod;
import javassist.CtNewMethod;
import javassist.Modifier;
import javassist.NotFoundException;

import java.io.IOException;

public class Main {

    public static void main(String[] args) throws CannotCompileException, IOException, NotFoundException {
        ClassPool pool = ClassPool.getDefault();

        // 1. 创建一个空类
        final String classPath = "com.github.houbb.spring.aop.javassist.GenClass";
        CtClass cc = pool.makeClass(classPath);

        // 2. 新增一个字段 private String name = "init";
        // 字段名为name
        CtField param = new CtField(pool.get("java.lang.String"), "name", cc);
        // 访问级别是 private
        param.setModifiers(Modifier.PRIVATE);
        // 初始值是 "init"
        cc.addField(param, CtField.Initializer.constant("init"));

        // 3. 生成 getter、setter 方法
        cc.addMethod(CtNewMethod.setter("setName", param));
        cc.addMethod(CtNewMethod.getter("getName", param));

        // 4. 添加无参的构造函数
        CtConstructor cons = new CtConstructor(new CtClass[]{}, cc);
        cons.setBody("{name = \"ryo\";}");
        cc.addConstructor(cons);

        // 5. 添加有参的构造函数
        // http://jboss-javassist.github.io/javassist/tutorial/tutorial2.html#before
        cons = new CtConstructor(new CtClass[]{pool.get("java.lang.String")}, cc);
        // $0=this / $1,$2,$3... 代表方法参数
        cons.setBody("{$0.name = $1;}");
        cc.addConstructor(cons);

        // 6. 创建一个名为execute方法，无参数，无返回值，输出name值
        CtMethod ctMethod = new CtMethod(CtClass.voidType, "execute", new CtClass[]{}, cc);
        ctMethod.setModifiers(Modifier.PUBLIC);
        ctMethod.setBody("{System.out.println(name);}");
        cc.addMethod(ctMethod);

        final String targetPath = PathUtil.getRootPath(Main.class, classPath);
        cc.writeFile(targetPath);
    }
}
```

## 测试后生成的文件

`~/target/classes/com/github/houbb/spring/aop/javassist/GenClass.class`

```java
package com.github.houbb.spring.aop.javassist;

public class GenClass {
    private String name = "init";

    public void setName(String var1) {
        this.name = var1;
    }

    public String getName() {
        return this.name;
    }

    public GenClass() {
        this.name = "ryo";
    }

    public GenClass(String var1) {
        this.name = var1;
    }

    public void execute() {
        System.out.println(this.name);
    }
}
```


# 参考资料

http://www.javassist.org/tutorial/tutorial.html

http://zhxing.iteye.com/blog/1703305

* any list
{:toc}