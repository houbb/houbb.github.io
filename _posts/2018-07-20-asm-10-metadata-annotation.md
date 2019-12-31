---
layout: post
title:  ASM-10-Metadata Annotation 注解
date:  2018-07-20 13:43:31 +0800
categories: [Java]
tags: [java, asm, annotation, sh]
published: true
---

# 注解

如果类，字段，方法和方法参数注解（例如@Deprecated或@Override）存储在已编译的类中，则它们的保留策略不是RetentionPolicy.SOURCE。

该信息在运行时不会由字节码指令使用，但是如果保留策略为RetentionPolicy.RUNTIME，则可以通过反射API进行访问。

编译器也可以使用它。

# 结构

结构体

源代码中的注解可以采用多种形式，例如@ Deprecated，@ Retention（RetentionPolicy.CLASS）或@Task（desc =“ refactor”，id = 1）。

但是，在内部，所有注解都具有相同的形式，并由注解类型和一组名称/值对指定，其中值限于：

- 基本，字符串或类值，

- 枚举值，

- 注解值，

- 以上值的数组。


请注意，注解可以包含其他注解，甚至可以包含注解数组。

因此，注解可能非常复杂。

# Interfaces and components

用于生成和转换注解的ASM API基于AnnotationVisitor抽象类（请参见图4.3）。

- Figure 4.3.: The AnnotationVisitor class

```java
public abstract class AnnotationVisitor {
    public AnnotationVisitor(int api);
    public AnnotationVisitor(int api, AnnotationVisitor av);
    public void visit(String name, Object value);
    public void visitEnum(String name, String desc, String value);
    public AnnotationVisitor visitAnnotation(String name, String desc);
    public AnnotationVisitor visitArray(String name);
    public void visitEnd();
}
```

此类的方法用于访问注解的名称值对（在返回此类型的方法（即visitAnnotation方法）中访问注解类型）。

第一种方法用于原始值，String和Class值（后一种由Type对象表示），其他方法用于枚举，注解和数组值。

可以按任何顺序调用它们，但visitEnd除外：

```
( visit | visitEnum | visitAnnotation | visitArray )* visitEnd
```

请注意，有两个方法返回AnnotationVisitor：这是因为注解可以包含其他注解。

也不同于ClassVisitor返回的MethodVisitors，这两个方法返回的AnnotationVisitors必须顺序使用：

实际上，在完全访问嵌套注解之前，不必调用父访问者的方法。

还要注意，visitArray方法将AnnotationVisitor返回到访问数组的元素。 

但是，由于未命名数组的元素，所以visitArray返回的访问者的方法将忽略name参数，并且可以将其设置为null。

## 添加，删除和检测注解

### 删除

像字段和方法一样，可以通过在visitAnnotation方法中返回null来删除注解：

```java
public class RemoveAnnotationAdapter extends ClassVisitor {
    private String annDesc;

    public RemoveAnnotationAdapter(ClassVisitor cv, String annDesc) {
        super(ASM4, cv);
        this.annDesc = annDesc;
    }

    @Override
    public AnnotationVisitor visitAnnotation(String desc, boolean vis) {
        if (desc.equals(annDesc)) {
            return null;
        }
        return cv.visitAnnotation(desc, vis);
    }
}
```

### 增加

由于必须调用ClassVisitor类的方法的限制，添加类注解会更加困难。

实际上，必须重写visitAnnotation之后的所有方法，以检测何时访问了所有注解（由于使用了visitCode方法，方法注解更易于添加）：

```java
public class AddAnnotationAdapter extends ClassVisitor {
    private String annotationDesc;
    private boolean isAnnotationPresent;

    public AddAnnotationAdapter(ClassVisitor cv, String annotationDesc) {
        super(ASM4, cv);
        this.annotationDesc = annotationDesc;
    }

    @Override 
    public void visit(int version, int access, String name,
        String signature, String superName, String[] interfaces) {
        int v = (version & 0xFF) < V1_5 ? V1_5 : version;
        cv.visit(v, access, name, signature, superName, interfaces);
    }

    @Override 
    public AnnotationVisitor visitAnnotation(String desc,
        boolean visible) {
        if (visible && desc.equals(annotationDesc)) {
            isAnnotationPresent = true;
        }
        return cv.visitAnnotation(desc, visible);
    }

    @Override 
    public void visitInnerClass(String name, String outerName, String innerName, int access) {
        addAnnotation();
        cv.visitInnerClass(name, outerName, innerName, access);
    }

    @Override
    public FieldVisitor visitField(int access, String name, String desc, String signature, Object value) {
        addAnnotation();
        return cv.visitField(access, name, desc, signature, value);
    }

    @Override
    public MethodVisitor visitMethod(int access, String name, String desc, String signature, String[] exceptions) {
        addAnnotation();
        return cv.visitMethod(access, name, desc, signature, exceptions);
    }

    @Override public void visitEnd() {
        addAnnotation();
        cv.visitEnd();
    }
    
    private void addAnnotation() {
        if (!isAnnotationPresent) {
            AnnotationVisitor av = cv.visitAnnotation(annotationDesc, true);
            if (av != null) {
                av.visitEnd();
            }
            isAnnotationPresent = true;
        }
    }
}
```

请注意，如果该适配器的版本低于该版本，则它将升级到1.5。

这是必需的，因为JVM会忽略版本小于1.5的类中的注解。

在类和方法适配器中，注解的最后一个（也是最常见的）用例是使用注解以参数化转换。

例如，您可以仅对以下字段进行字段访问转换：

具有 `@Persistent` 批注，仅将日志记录代码添加到具有 `@Log` 批注的方法中，依此类推。

所有这些用例都可以轻松实现，因为必须首先访问注解：必须在字段和方法之前访问类注解，并且必须在代码之前访问方法和参数注解。

因此，只要在检测到所需注解时设置一个标志，然后在转换中稍后使用它就足够了，就像上述示例中使用isAnnotationPresent标志所做的那样。


# 工具类

TraceClassVisitor，CheckClassAdapter和ASMifier类， 在第2.3节中发送的消息也支持注解（与方法一样，也可以使用TraceAnnotationVisitor或CheckAnnotationAdapter在单个注解级别而不是在类级别使用）。

它们可以用来查看如何生成一些特定的注解。

例如使用：

```
java -classpath asm.jar:asm-util.jar \
org.objectweb.asm.util.ASMifier \
java.lang.Deprecated
```

打印经过少量重构后的代码，其内容为：

```java
package asm.java.lang;
import org.objectweb.asm.*;

public class DeprecatedDump implements Opcodes {
    public static byte[] dump() throws Exception {

    ClassWriter cw = new ClassWriter(0);
    AnnotationVisitor av;
    cw.visit(V1_5, ACC_PUBLIC + ACC_ANNOTATION + ACC_ABSTRACT
    + ACC_INTERFACE, "java/lang/Deprecated", null,
    "java/lang/Object",
    new String[] { "java/lang/annotation/Annotation" });
        {
        av = cw.visitAnnotation("Ljava/lang/annotation/Documented;",
        true);
        av.visitEnd();
        }
        {
        av = cw.visitAnnotation("Ljava/lang/annotation/Retention;", true);
        av.visitEnum("value", "Ljava/lang/annotation/RetentionPolicy;",
        "RUNTIME");
        av.visitEnd();
        }
        cw.visitEnd();
        return cw.toByteArray();
    }
}
```

这段代码显示了两个如何使用ACC_ANNOTATION标志创建注解类，并显示了如何创建两个类注解，一个没有值，一个带有枚举值。 可以用类似的方法来创建方法和参数注解，方法是在MethodVisitor类中定义了visitAnnotation和visitParameterAnnotation方法。


# 参考文档

[https://asm.ow2.io/asm4-guide.pdf](https://asm.ow2.io/asm4-guide.pdf)

* any list
{:toc}