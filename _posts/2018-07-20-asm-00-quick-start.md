---
layout: post
title:  ASM-00-入门教程
date:  2018-07-20 13:43:31 +0800
categories: [Java]
tags: [java, asm, sh]
published: true
---

# ASM

[ASM](https://asm.ow2.io/) 是一个通用的Java字节码操作和分析框架。

它可以用来修改现有的类或动态地生成类，直接以二进制形式。

ASM提供了一些通用的字节码转换和分析算法，可以从这些算法中构建自定义复杂的转换和代码分析工具。

ASM提供与其他Java字节码框架类似的功能，但主要关注性能。

因为它的设计和实现都尽可能地小和快，所以非常适合在动态系统中使用(当然也可以以静态的方式使用，例如在编译器中)。


## 特性

ASM 并不是生成和转换已编译Java类的唯一工具，但它是最近和最有效的工具之一。

可以从 http://asm.objectweb.org 下载。其主要优点有:

- 它有一个简单、设计良好、模块化的API，易于使用。

- 为最新的 Java 版本提供支持。

- 它很小，速度很快，而且非常健壮。

- 其庞大的用户社区可以为新用户提供支持。

- 它的开放源码许可允许你以任何你想要的方式使用它。

# 快速入门

## jar 引入

```xml
<dependency>
	<groupId>org.ow2.asm</groupId>
	<artifactId>asm-all</artifactId>
	<version>5.1</version>
</dependency>
```


## Hello World

- HelloWorld.java

```java
import org.objectweb.asm.ClassWriter;
import org.objectweb.asm.MethodVisitor;
import org.objectweb.asm.Opcodes;
import org.objectweb.asm.Type;
import org.objectweb.asm.commons.GeneratorAdapter;
import org.objectweb.asm.commons.Method;

import java.io.FileOutputStream;
import java.io.PrintStream;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/7/20 下午2:01  </pre>
 * <pre> Project: asm  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Bean extends ClassLoader implements Opcodes {

    public static void main(final String args[]) throws Exception {
        // creates a ClassWriter for the Example public class,
        // which inherits from Object

        ClassWriter cw = new ClassWriter(0);
        cw.visit(V1_1, ACC_PUBLIC, "Example", null, "java/lang/Object", null);
        MethodVisitor mw = cw.visitMethod(ACC_PUBLIC, "<init>", "()V", null,
                null);
        mw.visitVarInsn(ALOAD, 0);
        mw.visitMethodInsn(INVOKESPECIAL, "java/lang/Object", "<init>", "()V");
        mw.visitInsn(RETURN);
        mw.visitMaxs(1, 1);
        mw.visitEnd();
        mw = cw.visitMethod(ACC_PUBLIC + ACC_STATIC, "main",
                "([Ljava/lang/String;)V", null, null);
        mw.visitFieldInsn(GETSTATIC, "java/lang/System", "out",
                "Ljava/io/PrintStream;");
        mw.visitLdcInsn("Hello world!");
        mw.visitMethodInsn(INVOKEVIRTUAL, "java/io/PrintStream", "println",
                "(Ljava/lang/String;)V");
        mw.visitInsn(RETURN);
        mw.visitMaxs(2, 2);
        mw.visitEnd();
        byte[] code = cw.toByteArray();
        FileOutputStream fos = new FileOutputStream("Example.class");
        fos.write(code);
        fos.close();
        Bean loader = new Bean();
        Class exampleClass = loader
                .defineClass("Example", code, 0, code.length);
        exampleClass.getMethods()[0].invoke(null, new Object[]{null});

        // ------------------------------------------------------------------------
        // Same example with a GeneratorAdapter (more convenient but slower)
        // ------------------------------------------------------------------------

        cw = new ClassWriter(ClassWriter.COMPUTE_MAXS);
        cw.visit(V1_1, ACC_PUBLIC, "Example", null, "java/lang/Object", null);
        Method m = Method.getMethod("void <init> ()");
        GeneratorAdapter mg = new GeneratorAdapter(ACC_PUBLIC, m, null, null,
                cw);
        mg.loadThis();
        mg.invokeConstructor(Type.getType(Object.class), m);
        mg.returnValue();
        mg.endMethod();
        m = Method.getMethod("void main (String[])");
        mg = new GeneratorAdapter(ACC_PUBLIC + ACC_STATIC, m, null, null, cw);
        mg.getStatic(Type.getType(System.class), "out", Type
                .getType(PrintStream.class));
        mg.push("Hello world!");
        mg.invokeVirtual(Type.getType(PrintStream.class), Method
                .getMethod("void println (String)"));
        mg.returnValue();
        mg.endMethod();
        cw.visitEnd();
        code = cw.toByteArray();
        loader = new Bean();
        exampleClass = loader.defineClass("Example", code, 0, code.length);
        exampleClass.getMethods()[0].invoke(null, new Object[]{null});
    }

}
```


## 应用实战

[ASM-Tool](https://github.com/houbb/asm-tool)

[基于 ASM 实现比 Spring BeanUtil.copyProperties 性能更好的拷贝框架](https://github.com/houbb/bean-mapping)

# 参考文档

> [快速入门](https://blog.csdn.net/mn960mn/article/details/51418236)

> [ASM介绍及简易教程](https://blog.csdn.net/wodeyuer125/article/details/44618679)

* any list
{:toc}