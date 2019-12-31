---
layout: post
title:  ASM-08-Method 方法增强实战
date:  2018-07-20 13:43:31 +0800
categories: [Java]
tags: [java, asm, in-action, aop, sh]
published: true
---

# Method 回顾

上面几节谈论了大量的 method 方法，感觉 ASM 提供了很多强大的功能。

但是缺少实战有时候就比较没有实感，所以选择一个比较简单的例子进行编码。

# 一点想法

## 基本信息

可以基于 asm 获取 class 的基本信息

## reflect

可以学习 ReflectASM 的思想，自己基于 ASM 实现 field/method 等较为高效的调用。

## aop

直接可以对已有的方法进行增强。

换种方式就是直接生成当前类的代码，对代码进行增强。

## 结合编译时注解

编译的时候直接重写 class 文件即可。

这样会让实现变得非常简单。


# 最简单的 AOP 增强例子


## 原始类

- MethodDemo.java

```java
public class MethodDemo {

    public void hello() {
        System.out.println("hello asm method!");
    }

}
```

- MethodAspect.java

```java
public class MethodAspect {

    public static void beforeMethod() {
        System.out.println("方式二:方法开始运行...");
    }

    public static void afterMethod() {
        System.out.println("方式二:方法运行结束...");
    }

}
```




## ClassVisitor 编写

```java
import org.objectweb.asm.ClassVisitor;
import org.objectweb.asm.MethodVisitor;
import org.objectweb.asm.Opcodes;

public class ClassAopMethodVisitor extends ClassVisitor {

    public ClassAopMethodVisitor(final ClassVisitor classVisitor) {
        super(Opcodes.ASM4, classVisitor);
    }

    @Override
    public MethodVisitor visitMethod(int access, String name, String descriptor, String signature, String[] exceptions) {
        //不代理构造函数
        if(!"<init>".equals(name)) {
            MethodVisitor mv = cv.visitMethod(access, name, descriptor, signature, exceptions);
            //方式一
//            return new MethodVisitorOne(this.api,mv);
            //方式二
             return new MethodVisitorTwo(this.api,mv);
        }

        return super.visitMethod(access, name, descriptor, signature, exceptions);
    }

}
```

这里我们有两种类增强的方式。

MethodVisitorOne、MethodVisitorTwo

## MethodVisitor 实现

### MethodVisitorOne

基于字节码直接编写。

```java
package com.github.houbb.asm.learn.method;

import org.objectweb.asm.MethodVisitor;
import org.objectweb.asm.Opcodes;

import static org.objectweb.asm.Opcodes.*;
import static org.objectweb.asm.Opcodes.INVOKEVIRTUAL;

/**
 * 通过字节编写字节码的方式织入代码
 */
public class MethodVisitorOne extends MethodVisitor {

    public MethodVisitorOne(int api, MethodVisitor methodVisitor) {
        super(api, methodVisitor);
    }

    @Override
    public void visitCode() {
        mv.visitFieldInsn(Opcodes.GETSTATIC,"java/lang/System","out","Ljava/io/PrintStream;");
        mv.visitLdcInsn("方式一:方法开始运行");
        mv.visitMethodInsn(INVOKEVIRTUAL,"java/io/PrintStream","println","(Ljava/lang/String;)V");
        super.visitCode();
    }

    @Override
    public void visitInsn(int opcode) {
        if(opcode == ARETURN || opcode == RETURN ) {
            mv.visitFieldInsn(Opcodes.GETSTATIC,"java/lang/System","out","Ljava/io/PrintStream;");
            mv.visitLdcInsn("方式一:方法调用结束");
            mv.visitMethodInsn(INVOKEVIRTUAL,"java/io/PrintStream","println","(Ljava/lang/String;)V");
        }
        super.visitInsn(opcode);
    }

    @Override
    public void visitEnd() {
        mv.visitMaxs(6,6);
        super.visitEnd();
    }
}
```

### MethodVisitorTwo

也可以结合已有的方法进行代码增强。

```java
import org.objectweb.asm.MethodVisitor;
import org.objectweb.asm.Opcodes;
import sun.rmi.runtime.Log;

import static org.objectweb.asm.Opcodes.*;

public class MethodVisitorTwo extends MethodVisitor {

    public MethodVisitorTwo(int api, MethodVisitor methodVisitor) {
        super(api, methodVisitor);
    }

    /**方法的开始,即刚进入方法里面*/
    @Override
    public void visitCode() {
        mv.visitMethodInsn(INVOKESTATIC, MethodAspect.class.getName().replace(".","/"),"beforeMethod","()V",false);
        super.visitCode();
    }

    @Override
    public void visitInsn(int opcode) {
        if(opcode == ARETURN || opcode == RETURN ) {
            mv.visitMethodInsn(INVOKESTATIC, MethodAspect.class.getName().replace(".","/"),"afterMethod","()V",false);
        }
        super.visitInsn(opcode);
    }

    @Override
    public void visitEnd() {
        mv.visitMaxs(6,6);
        super.visitEnd();
    }
}
```


## 测试代码

基于上面定义的信息，重新生成 ClassLoader 及对应的 class，如下

```java
public void aopWithAsmTest() throws IOException, IllegalAccessException, InstantiationException, InvocationTargetException, NoSuchMethodException {
    String fullName = MethodDemo.class.getName();
    String fullNameType = fullName.replace(".", "/");
    ClassReader cr = new ClassReader(fullNameType);
    ClassWriter cw = new ClassWriter(0);
    ClassAopMethodVisitor cv = new ClassAopMethodVisitor(cw);
    cr.accept(cv,ClassReader.SKIP_DEBUG);
    byte[] bytes = cw.toByteArray();
    MyClassLoader classLoader = new MyClassLoader();
    Class cls = classLoader.defineClass(fullName, bytes);

    // 反射调用
    Object demo = cls.newInstance();
    Method method = demo.getClass().getMethod("hello");
    method.invoke(demo);
}
```

- 日志输出

```
方式二:方法开始运行...
hello asm method!
方式二:方法运行结束...
```

## 更常见的策略

将增强的类设置为当前类的子类。

类似于 spring 等常见框架。


# 参考文档

[https://asm.ow2.io/asm4-guide.pdf](https://asm.ow2.io/asm4-guide.pdf)

## 反射基本信息

TODO: 下面的可以抽象为工具方法。

[Java通过ASM运行时读取方法参数名称](https://blog.csdn.net/weixin_34335458/article/details/89413530)

[java1.8中ASM获取接口和抽象类以及类函数参数名称](https://blog.csdn.net/chy2z/article/details/81773142)

[ReflectASM详解](https://www.jianshu.com/p/ca7bdf8b7718)

## aop

[JAVA通过ASM字节码为成员方法前后添加其他代码](https://blog.csdn.net/wjy160925/article/details/85332998)

[AOP 的利器：ASM 3.0 介绍](https://www.ibm.com/developerworks/cn/java/j-lo-asm30/index.html)

## 引用拓展

[使用reflectasm实现bean快速复制（缓存了生成的class对象](https://blog.csdn.net/wyyrockking/article/details/84525440)

所有原来基于反射去做的，都可以基于 asm 反射在做一次。

提升性能。

## Tree API

[Java利用ASM读取变量值(Field value)](https://blog.csdn.net/zmx729618/article/details/51321241)


* any list
{:toc}