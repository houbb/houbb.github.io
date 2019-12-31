---
layout: post
title:  ASM-03-classes Interface
date:  2018-07-20 13:43:31 +0800
categories: [Java]
tags: [java, asm, sh]
published: true
---

# 接口和组件

# 介绍

用于生成和转换已编译类的ASM API基于ClassVisitor抽象类（请参见图2.4）。 

此类中的每个方法都对应于同名的类文件结构部分（请参见图2.1）。

通过单个方法调用可以访问简单部分，该方法的参数描述其内容，并返回void。 

可以通过返回辅助访问者类的初始方法调用来访问其内容可以具有任意长度和复杂度的节。

visitAnnotation，visitField和visitMethod方法就是这种情况，它们分别返回AnnotationVisitor，FieldVisitor和MethodVisitor。

这些辅助类递归使用相同的原理。 

例如，FieldVisitor抽象类中的每个方法（请参见图2.5）对应于具有相同名称的类文件子结构，visitAnnotation 也是如此。

## 接口简介

- Figure 2.4.: The ClassVisitor class

```java
public abstract class ClassVisitor {
    public ClassVisitor(int api);
    public ClassVisitor(int api, ClassVisitor cv);
    public void visit(int version, int access, String name,
    String signature, String superName, String[] interfaces);
    public void visitSource(String source, String debug);
    public void visitOuterClass(String owner, String name, String desc);
    AnnotationVisitor visitAnnotation(String desc, boolean visible);
    public void visitAttribute(Attribute attr);
    public void visitInnerClass(String name, String outerName,
    String innerName, int access);
    public FieldVisitor visitField(int access, String name, String desc,
    String signature, Object value);
    public MethodVisitor visitMethod(int access, String name, String desc,
    String signature, String[] exceptions);
    void visitEnd();
}
```

与ClassVisitor中一样，返回一个辅助AnnotationVisitor。 

创作这些辅助访问者的用法将在下一章中说明：

实际上，本章仅限于可以通过ClassVisitor类解决的简单问题。

- Figure 2.5.: The FieldVisitor class

```java
public abstract class FieldVisitor {
    public FieldVisitor(int api);
    public FieldVisitor(int api, FieldVisitor fv);
    public AnnotationVisitor visitAnnotation(String desc, boolean visible);
    public void visitAttribute(Attribute attr);
    public void visitEnd();
}
```

必须按照该类的Javadoc中指定的以下顺序调用ClassVisitor类的方法：

```java
visit visitSource? visitOuterClass? ( visitAnnotation | visitAttribute )*
( visitInnerClass | visitField | visitMethod )*
visitEnd
```

这意味着必须先调用访问，然后最多调用一次visitSource，然后最多一次调用visitOuterClass，然后按任意顺序按任意顺序访问任意多个visitAnnotation和visitAttribute，然后按任意顺序任意多次调用 访问visitInnerClass，visitField和visitMethod，并通过单次调用visitEnd终止。

## 核心组件类

ASM提供了三个基于ClassVisitor API的核心组件来生成和转换类：

### ClassReader

ClassReader 类解析作为字节数组给出的已编译类，并在作为参数传递给其accept方法的ClassVisitor实例上调用相应的visitXxx方法。 可以将其视为事件产生器。

### ClassWriter

ClassWriter类是ClassVisitor抽象类的子类，该类直接以二进制形式构建编译的类。 

它产生一个包含已编译类的字节数组作为输出，可以使用toByteArray方法进行检索。 

可以将其视为事件消费者。

### ClassVisitor

ClassVisitor 类将其接收的所有方法委托给另一个ClassVisitor实例。 

可以将其视为事件过滤器。

下一节将通过具体示例显示如何使用这些组件来生成和转换类。

# 解析类（Parsing classes）

解析现有类的唯一必需组件是ClassReader组件。

## 例子

让我们以一个例子来说明这一点。

假设我们希望以与javap工具类似的方式打印类的内容。

第一步是编写ClassVisitor类的子类，该子类打印有关其访问的类的信息。

### asm 引入

```xml
<dependency>
    <groupId>org.ow2.asm</groupId>
    <artifactId>asm-all</artifactId>
    <version>5.1</version>
</dependency>
```

这是一个可能的，过于简化的实现：

### 实现一个类访问

这里直接实现了类 ClassVisitor 的常见方法，实现的比较简单。

```java
import org.objectweb.asm.*;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class ClassPrinter extends ClassVisitor {

    public ClassPrinter() {
        super(Opcodes.ASM4);
    }

    public ClassPrinter(int i, ClassVisitor classVisitor) {
        super(i, classVisitor);
    }

    @Override
    public void visit(int version, int access, String name,
                      String signature, String superName, String[] interfaces) {
        System.out.println(name + " extends " + superName + " {");
    }

    @Override
    public void visitSource(String source, String debug) {
    }

    @Override
    public void visitOuterClass(String owner, String name, String desc) {
    }

    @Override
    public AnnotationVisitor visitAnnotation(String desc,
                                             boolean visible) {
        return null;
    }

    @Override
    public void visitAttribute(Attribute attr) {
    }

    @Override
    public void visitInnerClass(String name, String outerName,
                                String innerName, int access) {
    }

    @Override
    public FieldVisitor visitField(int access, String name, String desc,
                                   String signature, Object value) {
        System.out.println(" " + desc + " " + name);
        return null;
    }

    @Override
    public MethodVisitor visitMethod(int access, String name,
                                     String desc, String signature, String[] exceptions) {
        System.out.println(" " + name + desc);
        return null;
    }

    @Override
    public void visitEnd() {
        System.out.println("}");
    }

}
```

### 测试访问类

```java
public static void main(String[] args) throws IOException {
    ClassPrinter cp = new ClassPrinter();
    ClassReader cr = new ClassReader("java.lang.Runnable");
    cr.accept(cp, 0);
}
```

第二行创建一个ClassReader来解析Runnable类。 在最后一行调用的accept方法解析Runnable类字节码，并在cp上调用相应的ClassVisitor方法。

- 输出结果

```
java/lang/Runnable extends java/lang/Object {
 run()V
}
```

## 构造 ClassReader 实例的方式

请注意，有几种方法可以构造ClassReader实例。

可以通过名称（如上所述）或通过值（字节数组或InputStream）指定必须读取的类。

可以使用ClassLoader的getResourceAsStream方法通过以下方式获取用于读取类内容的输入流：

```java
cl.getResourceAsStream(classname.replace(’.’, ’/’) + ".class");
```

测试形式如下：

```java
ClassPrinter cp = new ClassPrinter();
InputStream stream = Thread.currentThread().getContextClassLoader().getResourceAsStream("java/lang/Runnable.class");
ClassReader cr = new ClassReader(stream);
cr.accept(cp, 0);
```

# 生成类

生成类的唯一必需组件是ClassWriter组件。

## 例子

让我们以一个例子来说明这一点。 

考虑以下接口：

```java
package pkg;
public interface Comparable extends Mesurable {
    int LESS = -1;
    int EQUAL = 0;
    int GREATER = 1;
    int compareTo(Object o);
}
```


可以使用以下的方式生成：

```java
ClassWriter cw = new ClassWriter(0);

cw.visit(V1_5, ACC_PUBLIC + ACC_ABSTRACT + ACC_INTERFACE,
"pkg/Comparable", null, "java/lang/Object",
new String[] { "pkg/Mesurable" });

cw.visitField(ACC_PUBLIC + ACC_FINAL + ACC_STATIC, "LESS", "I",
null, new Integer(-1)).visitEnd();

cw.visitField(ACC_PUBLIC + ACC_FINAL + ACC_STATIC, "EQUAL", "I",
null, new Integer(0)).visitEnd();

cw.visitField(ACC_PUBLIC + ACC_FINAL + ACC_STATIC, "GREATER", "I",
null, new Integer(1)).visitEnd();

cw.visitMethod(ACC_PUBLIC + ACC_ABSTRACT, "compareTo",
"(Ljava/lang/Object;)I", null, null).visitEnd();

cw.visitEnd();
byte[] b = cw.toByteArray();
```

这里直接看代码其实也就可以猜个差不多。

直接结合目标类其实不用解释太多。

### 代码说明

第一行创建一个ClassWriter实例，该实例实际上将构建该类的字节数组表示形式（在下一章中将解释构造函数参数）。

- visit

对visit方法的调用定义了类头。

与所有其他ASM常量一样，V1_5参数是在ASM Opcodes接口中定义的常量。它指定类版本Java 1.5。

ACC_XXX常量是与Java修饰符相对应的标志。在这里，我们指定该类为接口，并且它是公共的和抽象的（因为无法实例化）。

下一个参数以内部形式指定类名称（请参阅第2.1.2节）。

回想一下，已编译的类不包含package或import部分，因此所有类名必须完全合格。

下一个参数对应于泛型（请参阅第4.1节）。

在我们的情况下，它为null，因为未对接口进行参数化通过类型变量。

第五个参数是内部形式的超类（接口类隐式继承自Object）。最后一个参数是扩展接口的数组，由其内部名称指定。

- field

接下来的对visitField的三个调用是相似的，用于定义三个界面字段。 

第一个参数是一组标志，它们对应于Java修饰符。 

在这里，我们指定字段是public，final和static。

第二个参数是字段的名称，它出现在源代码中。

第三个参数是字段的类型，采用类型描述符形式。 

在这里字段是整数字段，其描述符为I。

第四个参数对应于泛型。 

在我们的示例中，该字段为null，因为字段类型未使用泛型。

最后一个参数是字段的常量值：必须使用此参数仅适用于真正恒定的字段，即最终的静态字段。 

对于其他领域必须为null。 

由于此处没有 annotations，因此我们将其称为visitEnd立即返回的FieldVisitor的方法，即无需调用其visitAnnotation或visitAttribute方法。

- method

visitMethod调用用于定义compareTo方法。

同样，这里的第一个参数是一组与Java修饰符相对应的标志。

第二个参数是方法名称，它出现在源代码中。

第三个参数是方法的描述符。

第四个参数对应于泛型。在我们的例子中，它为null，因为该方法未使用泛型。

最后一个参数是由方法抛出的异常数组，由其内部名称指定。此处为null，因为该方法未声明任何异常。

visitMethod方法将返回MethodVisitor（请参见图3.4），该方法可用于定义方法的注解和属性，最重要的是定义方法的代码。

在这里，由于没有注解，并且由于该方法是抽象的，因此我们将visitEnd方法称为返回的MethodVisitor的值。

最后，对visitEnd的最后一次调用用于通知CW类已完成对toByteArray的调用用于将其作为字节数组检索。

### 使用生成的类

（1）生成 class 文件 

先前的字节数组可以存储在Comparable.class文件中，以备将来使用。

或者，可以使用ClassLoader动态加载它。

（2）定义自己的 ClassLoader

一种方法是定义一个classLoader子类，该类的defineClass方法是公共的：

```java
class MyClassLoader extends ClassLoader {
    public Class defineClass(String name, byte[] b) {
        return defineClass(name, b, 0, b.length);
    }
}
```

ps: 其实这里还是需要对 jvm 对于 class 文件的加载有一定的理解。

直接加载我们自定义的类：

```java
Class c = myClassLoader.defineClass("pkg.Comparable", b);
```

（3）重写 findClass 方法

加载生成的类的另一种方法（可能更干净）是定义ClassLoader子类，该类的findClass方法被重写，以便动态生成请求的类：

```java
class StubClassLoader extends ClassLoader {
    @Override
    protected Class findClass(String name) throws ClassNotFoundException {
    if (name.endsWith("_Stub")) {
        ClassWriter cw = new ClassWriter(0);
        ...
            byte[] b = cw.toByteArray();
            return defineClass(name, b, 0, b.length);
        }
        return super.findClass(name);
    }
}
```

实际上，使用生成的类的方式取决于上下文，并且超出了ASM API的范围。

如果正在编写编译器，则类生成过程将由表示要编译的程序的抽象语法树驱动，并且所生成的类将存储在磁盘上。

如果要编写动态代理类生成器或Aspect Weaver，则将以一种或多种方式使用ClassLoader。

# 转换已经存在的类

到目前为止，单独使用了ClassReader和ClassWriter组件。

这些事件是“手动”产生的，并由ClassWriter直接消费（consumed），或者对称地，它们是由ClassReader产生并“手动”消费的，即由自定义的ClassVisitor实现。

当这些组件一起使用时，事情开始变得非常有趣。

第一步是将ClassReader产生的事件定向到ClassWriter。

结果是由类编写器重构了由类读取器解析的类：

```java
byte[] b1 = ...;
ClassWriter cw = new ClassWriter(0);
ClassReader cr = new ClassReader(b1);
cr.accept(cw, 0);
byte[] b2 = cw.toByteArray(); // b2 represents the same class as b1
```

这本身并不是很有趣（有更简单的方法可以复制字节数组！），但是请耐心等待。

下一步是在类读取器和类写入器之间引入ClassVisitor：

```java
byte[] b1 = ...;
ClassWriter cw = new ClassWriter(0);
// cv forwards all events to cw
ClassVisitor cv = new ClassVisitor(ASM4, cw) { };
ClassReader cr = new ClassReader(b1);
cr.accept(cv, 0);
byte[] b2 = cw.toByteArray(); // b2 represents the same class as b1
```

与上述代码相对应的体系结构如图2.6所示，其中的组件用正方形表示，事件用箭头表示（如时序图中的垂直时间线）。

![image](https://user-images.githubusercontent.com/18375710/70375141-55b35a80-1935-11ea-87ea-fa4e5976a0ba.png)

但是，结果不会改变，因为ClassVisitor事件过滤器不过滤任何内容。

但是，现在可以通过重写某些方法来过滤某些事件，以便能够转换类。

例如，考虑以下ClassVisitor子类：


```java
public class ChangeVersionAdapter extends ClassVisitor {
    public ChangeVersionAdapter(ClassVisitor cv) {
        super(ASM4, cv);
    }
    
    @Override
    public void visit(int version, int access, String name,
        String signature, String superName, String[] interfaces) {
        cv.visit(V1_5, access, name, signature, superName, interfaces);
    }
}
```

此类仅覆盖ClassVisitor类的一个方法。

结果，除了对visit方法的调用之外，所有调用均以不变的方式转发给传递给构造函数的类visitor cv，后者以修改后的类版本号转发。

相应的时序图如图2.7所示。

![image](https://user-images.githubusercontent.com/18375710/70375174-d5412980-1935-11ea-84aa-6f947df7e7ca.png)

通过修改visit方法的其他参数，您可以实现其他转换，而不仅仅是更改类版本。

例如，您可以将接口添加到已实现接口的列表中。

也可以更改类的名称，但这不仅仅需要更改visit方法中的name参数。

实际上，该类的名称可以出现在已编译类的许多不同位置，并且必须更改所有这些出现以真正重命名该类。

## 优化

上一个转换仅更改原始类中的四个字节。

但是，使用上面的代码，b1被完全解析，并且相应的事件被用来从头开始构造b2，这不是很有效。

复制没有直接转换为b2的b1部分，而无需解析这些部分并且不生成相应的事件，将更加有效。

ASM对方法自动执行此优化：

（1）如果ClassReader组件检测到作为参数传递给其accept方法的ClassVisitor返回的MethodVisitor来自ClassWriter，则意味着该方法的内容将不会被转换，并且实际上甚至不会被应用程序看到。

（2）在这种情况下，ClassReader组件不会解析此方法的内容，不会生成相应的事件，而只是在ClassWriter中复制此方法的字节数组表示形式。

如果ClassReader和ClassWriter组件具有相互引用，则可以通过以下方式进行此优化：

```java
byte[] b1 = ...
ClassReader cr = new ClassReader(b1);
ClassWriter cw = new ClassWriter(cr, 0);
ChangeVersionAdapter ca = new ChangeVersionAdapter(cw);
cr.accept(ca, 0);
byte[] b2 = cw.toByteArray();
```

由于进行了这种优化，以上代码比上一个代码快了两倍，因为ChangeVersionAdapter不会转换任何方法。

对于转换某些或所有方法的通用类转换，加速较小，但仍很引人注目：实际上大约为10％到20％。

不幸的是，这种优化需要将原始类中定义的所有常量复制到转换后的常量中。

对于添加字段，方法或指令的转换来说，这不是问题，但是与未优化的情况相比，对于删除或重命名许多类元素的转换，这导致更大的类文件。

因此，建议仅将此优化用于“附加”转换。

## 使用转换类

如上一节所述，可以将转换后的类b2存储在磁盘上或用ClassLoader加载。

但是，在ClassLoader内部完成的类转换只能转换由此类加载器加载的类。

如果要转换所有类，则必须将转换放入ClassFileTransformer内，如java.lang.instrument包中所定义（有关更多详细信息，请参见此包的文档）：

```java
public static void premain(String agentArgs, Instrumentation inst) {
    inst.addTransformer(new ClassFileTransformer() {
        public byte[] transform(ClassLoader l, String name, Class c,
            ProtectionDomain d, byte[] b)
            throws IllegalClassFormatException {
            ClassReader cr = new ClassReader(b);
            ClassWriter cw = new ClassWriter(cr, 0);
            ClassVisitor cv = new ChangeVersionAdapter(cw);
            cr.accept(cv, 0);
            return cw.toByteArray();
        }
    });
}
```


ps: 这里就是监控工具，比如 skyworking，flink 等框架使用的套路。

# 删除类成员

上一节中用于转换类版本的方法当然可以应用于ClassVisitor类的其他方法。

例如，通过更改visitField和visitMethod方法中的access或name参数，可以更改修饰符或字段或方法的名称。

此外，您可以选择完全不转发此调用，而不是转发带有已修改参数的方法调用。

结果是删除了相应的类元素。

## 例子

例如，以下类适配器删除有关外部和内部类的信息，以及从中编译该类的源文件的名称（生成的类将保持完整功能，因为这些元素仅用于调试目的）。

通过不使用适当的访问方法转发任何内容来完成此操作：

```java
public class RemoveDebugAdapter extends ClassVisitor {
    public RemoveDebugAdapter(ClassVisitor cv) {
        super(ASM4, cv);
    }

    @Override
    public void visitSource(String source, String debug) {
    }
    
    @Override
    public void visitOuterClass(String owner, String name, String desc) {
    }
    
    @Override
    public void visitInnerClass(String name, String outerName,
    String innerName, int access) {
    }
}
```

## 字段和方法

此策略不适用于字段和方法，因为visitField和visitMethod方法必须返回结果。 

为了删除字段或方法，必须不要转发方法调用，并且必须将null返回给调用方。

例如，以下类适配器删除由其名称和其描述符指定的单个方法（该名称不足以标识一个方法，因为一个类可以包含多个同名但参数不同的方法）：

```java
public class RemoveMethodAdapter extends ClassVisitor {

    private String mName;

    private String mDesc;

    public RemoveMethodAdapter(ClassVisitor cv, String mName, String mDesc) {
        super(ASM4, cv);
        this.mName = mName;
        this.mDesc = mDesc;
    }

    @Override
    public MethodVisitor visitMethod(int access, String name,
        String desc, String signature, String[] exceptions) {
        if (name.equals(mName) && desc.equals(mDesc)) {
            // do not delegate to next visitor -> this removes the method
            return null;
        }
        return cv.visitMethod(access, name, desc, signature, exceptions);
    }
}
```

# 增加类成员

您可以转发更多的调用（call），而不是转发比收到的调用少的调用，这具有添加类元素的作用。

新的调用可以在原始方法调用之间的多个位置插入，前提是要遵循必须调用各种visitXxx方法的顺序（请参阅第2.2.1节）。

## 例子

例如，如果要向类添加字段，则必须在原始方法调用之间插入对visitField的新调用，并且必须将此新调用放入类适配器的visit方法之一。

例如，您无法在visit方法中执行此操作，因为这可能会导致对visitField的调用，随后是无效的visitSource，visitOuterClass，visitAnnotation或visitAttribute。

出于相同的原因，您不能将此新调用放入visitSource，visitOuterClass，visitAnnotation或visitAttribute方法中。

唯一的可能性是visitInnerClass，visitField，visitMethod或visitEnd方法。

如果将新调用放入visitEnd方法中，则将始终添加该字段（除非您添加显式条件），因为始终会调用此方法。

**如果将其放在visitField或visitMethod中，则会添加几个字段：原始类中的每个字段或方法一个。**

两种解决方案都有意义。这取决于您的需求。

例如，您可以添加一个计数器字段来计算对象的调用次数，或者每个方法添加一个计数器来计算对象的调用次数分别调用每个方法。

注意：实际上，唯一真正正确的解决方案是通过在visitEnd方法中进行其他调用来添加新成员。

实际上，一个类一定不能包含重复的成员，并且确保新成员唯一的唯一方法是将其与所有现有成员进行比较，只有在所有成员都被访问后才可以进行访问，即在visitEnd方法中。

这相当有约束力。

在实践中，使用不太可能被程序员使用的生成名称，例如_counter $或_4B7F_，足以避免重复的成员而不必在其中添加它们visitEnd。

请注意，如第一章所述，树API没有此限制：可以随时添加新成员在使用此API的转换中。

## 适配器例子

为了说明以上讨论，这里是一个类适配器，它将一个字段添加到类中，除非该字段已经存在：

```java
import org.objectweb.asm.ClassVisitor;
import org.objectweb.asm.FieldVisitor;
import org.objectweb.asm.Opcodes;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class AddFieldAdapter extends ClassVisitor {

    private int fAcc;
    private String fName;
    private String fDesc;
    private boolean isFieldPresent;

    public AddFieldAdapter(ClassVisitor cv, int fAcc, String fName,
                           String fDesc) {
        super(Opcodes.ASM4, cv);
        this.fAcc = fAcc;
        this.fName = fName;
        this.fDesc = fDesc;
    }

    @Override
    public FieldVisitor visitField(int access, String name, String desc,
                                   String signature, Object value) {
        if (name.equals(fName)) {
            isFieldPresent = true;
        }
        return cv.visitField(access, name, desc, signature, value);
    }

    @Override
    public void visitEnd() {
        if (!isFieldPresent) {
            FieldVisitor fv = cv.visitField(fAcc, fName, fDesc, null, null);
            if (fv != null) {
                fv.visitEnd();
            }
        }
        cv.visitEnd();
    }

}
```

该字段已添加到visitEnd方法中。 

不会覆盖visitField方法来修改现有字段或删除字段，而只是检测我们要添加的字段是否已经存在。 

在调用fv.visitEnd()之前，请注意visitEnd方法中的fv！= null测试：

这是因为，如前一节所述，类访问者可以在visitField中返回null。


# 转换链

到目前为止，我们已经看到了由ClassReader，类适配器和ClassWriter组成的简单转换链。 

当然，可以使用更复杂的链，将多个类适配器链在一起。

链接多个适配器可让您组成多个独立的类转换，以执行复杂的转换。

还要注意，转换链不一定是线性的。 

您可以编写一个ClassVisitor，将同时收到的所有方法调用转发到多个ClassVisitor：

```java
public class MultiClassAdapter extends ClassVisitor {

    protected ClassVisitor[] cvs;

    public MultiClassAdapter(ClassVisitor[] cvs) {
        super(Opcodes.ASM4);
        this.cvs = cvs;
    }

    @Override
    public void visit(int version, int access, String name,
                      String signature, String superName, String[] interfaces) {
        for (ClassVisitor cv : cvs) {
            cv.visit(version, access, name, signature, superName, interfaces);
        }
    }
    
}
```

对称地，几个类适配器可以委派给同一个ClassVisitor（这需要采取一些预防措施，以确保例如，在此ClassVisitor上仅一次调用visit和visitEnd方法）。

因此，如图2.8所示的转换链是完全可能的。

![image](https://user-images.githubusercontent.com/18375710/70375619-a8dbdc00-193a-11ea-96dd-0e7fad934ad2.png)



# 参考文档

[https://asm.ow2.io/asm4-guide.pdf](https://asm.ow2.io/asm4-guide.pdf)

* any list
{:toc}