---
layout: post
title:  ASM-09-Metadata Generic 泛型
date:  2018-07-20 13:43:31 +0800
categories: [Java]
tags: [java, asm, in-action, aop, sh]
published: true
---

# 注解

本章说明如何使用核心API生成和转换已编译的Java类元数据，例如注解。 

每个部分均以一种类型的元数据开始呈现，然后以一些说明性示例呈现相应的ASM接口，组件和工具以生成和转换这些元数据。

# 泛型

诸如 `List<E>` 之类的通用类以及使用它们的类包含有关它们声明或使用的通用类型的信息。 

字节码指令在运行时不使用此信息，但是可以通过反射API进行访问。 

编译器还使用它进行单独的编译。


# Structure 结构体

出于向后兼容性的原因，关于泛型类型的信息不是存储在类型或方法描述符中（它们在Java 5中引入泛型之前就已定义），而是存储在称为类型，方法和类签名的类似构造中。

当涉及泛型时，这些签名除了在类，字段和方法声明中的描述符外还存储（泛型不影响方法的字节码：编译器使用它们执行静态类型检查，然后像编译它们一样编译方法。 不使用，请在必要时重新引入类型转换。

与类型和方法描述符不同，由于通用类型的递归性质（通用类型可以由通用类型进行参数化 -例如考虑 `List<List<E>?>` ），类型签名的语法非常复杂。

它由以下规则给出（有关这些规则的完整说明，请参见Java虚拟机规范）：

```
TypeSignature: Z | C | B | S | I | F | J | D | FieldTypeSignature
FieldTypeSignature: ClassTypeSignature | [ TypeSignature | TypeVar
ClassTypeSignature: L Id ( / Id )* TypeArgs? ( . Id TypeArgs? )* ;
TypeArgs: < TypeArg+ >
TypeArg: * | ( + | - )? FieldTypeSignature
TypeVar: T Id ;
```

第一条规则说类型签名是原始类型描述符或字段类型签名。

第二条规则将字段类型签名定义为类类型签名，数组类型签名或类型变量。

第三个规则定义了类类型签名：它们是类类型描述符，在尖括号之间，主类名称之后或内部类名称（带点前缀）之间带有可能的类型参数。

其余规则定义类型参数和类型变量。 

请注意，类型实参可以是具有其自身类型实参的完整字段类型签名：

因此，类型签名可能非常复杂（请参见图4.1）。

- Figure 4.1.: Sample type signatur

Java type and corresponding type signature

```
List<E>
Ljava/util/List<TE;>;

List<?>
Ljava/util/List<*>;

List<? extends Number>
Ljava/util/List<+Ljava/lang/Number;>;

List<? super Integer>
Ljava/util/List<-Ljava/lang/Integer;>;

List<List<String>[]>
Ljava/util/List<[Ljava/util/List<Ljava/lang/String;>;>;

HashMap<K, V>.HashIterator<K>
Ljava/util/HashMap<TK;TV;>.HashIterator<TK;>;
```

## 方法描述符

方法签名扩展了方法描述符，就像类型签名扩展了类型描述符一样。

方法签名描述了方法参数的类型签名及其返回类型的签名。

与方法描述符不同，它还包含方法抛出的异常的签名（以 `^` 开头），并且还可以在尖括号之间包含可选的形式类型参数：

```
MethodTypeSignature:
TypeParams? ( TypeSignature* ) ( TypeSignature | V ) Exception*
Exception: ^ClassTypeSignature | ^TypeVar
TypeParams: < TypeParam+ >
TypeParam: Id : FieldTypeSignature? ( : FieldTypeSignature )*
```

例如，以下由类型变量T参数化的通用静态方法的方法签名：

```java
static <T> Class<? extends T> m (int n)
```

方法签名如下：

```
<T:Ljava/lang/Object;>(I)Ljava/lang/Class<+TT;>;
```

最后，一个不能与类类型签名混淆的类签名被定义为其父类的类型签名，其后是已实现接口的类型签名以及可选的形式类型参数：

```
ClassSignature: TypeParams? ClassTypeSignature ClassTypeSignature*
```

类签名的例子：

`C<E> extends List<E>` is 

```
<E:Ljava/lang/Object;>Ljava/util/List<TE;>;.
```

# Interfaces and components

与描述符一样，出于相同的效率原因（请参阅第2.3.1节），ASM API公开存储在已编译类中的签名（签名的主要出现位置是ClassVisitor类的visit，visitField和visitMethod方法， 作为可选的类，类型或方法签名参数）。

## SignatureVisitor

希望它还在 `org.objectweb.asm.signature` 包中基于 SignatureVisitor 抽象类提供了一些生成和转换签名的工具（见图4.2）。

- Figure 4.2.: The SignatureVisitor class

```java
public abstract class SignatureVisitor {
    public final static char EXTENDS = ’+’;
    public final static char SUPER = ’-’;
    public final static char INSTANCEOF = ’=’;
    public SignatureVisitor(int api);
    public void visitFormalTypeParameter(String name);
    public SignatureVisitor visitClassBound();
    public SignatureVisitor visitInterfaceBound();
    public SignatureVisitor visitSuperclass();
    public SignatureVisitor visitInterface();
    public SignatureVisitor visitParameterType();
    public SignatureVisitor visitReturnType();
    public SignatureVisitor visitExceptionType();
    public void visitBaseType(char descriptor);
    public void visitTypeVariable(String name);
    public SignatureVisitor visitArrayType();
    public void visitClassType(String name);
    public void visitInnerClassType(String name);
    public void visitTypeArgument();
    public SignatureVisitor visitTypeArgument(char wildcard);
    public void visitEnd();
}
```

该抽象类用于访问类型签名，方法签名和类签名。

用于访问类型签名的方法以粗体显示，并且必须按以下顺序调用，这反映了先前的语法规则（请注意，其中两个返回SignatureVisitor：这是由于类型签名的递归定义）：

```
visitBaseType | visitArrayType | visitTypeVariable |
( visitClassType visitTypeArgument*
( visitInnerClassType visitTypeArgument* )* visitEnd ) )
```

方法访问方法签名如下:

```
( visitFormalTypeParameter visitClassBound? visitInterfaceBound* )*
visitParameterType* visitReturnType visitExceptionType
```

最后，用于访问类签名的方法是：

```
( visitFormalTypeParameter visitClassBound? visitInterfaceBound* )*
visitSuperClass visitInterface*
```

## 说明

这些方法大多数都返回SignatureVisitor：它旨在访问类型签名。

请注意，与ClassVisitor返回的MethodVisitors不同，SignatureVisitor返回的SignatureVisitors不能为null，并且必须按顺序使用：实际上，在完全访问嵌套签名之前，不必调用父级访问者的任何方法。

与类一样，ASM API提供了基于此API的两个组件：SignatureReader组件解析一个签名并在给定的签​​名访问者上调用适当的访问方法，而SignatureWriter组件则基于接收到的方法构建一个签名。

通过使用与类和方法相同的原理，这两个类可用于生成和转换签名。

例如，假设您要重命名出现在某些签名中的类名。

可以使用以下签名适配器完成此操作，该签名适配器将转发所有接收到的未更改的方法调用，但visitClassType和visitInnerClassType方法除外（我们在此假设sv方法始终返回此值，在SignatureWriter的情况下）：

```java
public class RenameSignatureAdapter extends SignatureVisitor {
    private SignatureVisitor sv;
    private Map<String, String> renaming;
    private String oldName;

    public RenameSignatureAdapter(SignatureVisitor sv,
        Map<String, String> renaming) {
        super(ASM4);
        this.sv = sv;
        this.renaming = renaming;
    }

    public void visitFormalTypeParameter(String name) {
        sv.visitFormalTypeParameter(name);
    }

    public SignatureVisitor visitClassBound() {
        sv.visitClassBound();
        return this;
    }

    public SignatureVisitor visitInterfaceBound() {
        sv.visitInterfaceBound();
        return this;
    }

    ...
    
    public void visitClassType(String name) {
        oldName = name;
        String newName = renaming.get(oldName);
        sv.visitClassType(newName == null ? name : newName);
    }

    public void visitInnerClassType(String name) {
        oldName = oldName + "." + name;
        String newName = renaming.get(oldName);
        sv.visitInnerClassType(newName == null ? name : newName);
    }

    public void visitTypeArgument() {
        sv.visitTypeArgument();
    }

    public SignatureVisitor visitTypeArgument(char wildcard) {
        sv.visitTypeArgument(wildcard);
        return this;
    }

    public void visitEnd() {
        sv.visitEnd();
    }
}
```

下面的代码结果是 `LA<TK;TV;>.B<TK;>;`:

```java
String s = "Ljava/util/HashMap<TK;TV;>.HashIterator<TK;>;";
Map<String, String> renaming = new HashMap<String, String>();
renaming.put("java/util/HashMap", "A");
renaming.put("java/util/HashMap.HashIterator", "B");
SignatureWriter sw = new SignatureWriter();
SignatureVisitor sa = new RenameSignatureAdapter(sw, renaming);
SignatureReader sr = new SignatureReader(s);
sr.acceptType(sa);
sw.toString();
```

# Tools

2.3节中介绍的TraceClassVisitor和ASMifier类以内部形式打印类文件中包含的签名。

它们可以通过以下方式用于查找与给定泛型类型相对应的签名：

编写具有某些泛型类型的Java类，对其进行编译，然后使用这些命令行工具来找到相应的签名。


# 参考文档

[https://asm.ow2.io/asm4-guide.pdf](https://asm.ow2.io/asm4-guide.pdf)

* any list
{:toc}