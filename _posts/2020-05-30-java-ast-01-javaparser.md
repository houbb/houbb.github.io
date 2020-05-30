---
layout: post
title: java AST 抽象语法树-JavaParser 框架
date:  2020-5-29 14:24:18 +0800
categories: [java]
tags: [aop, ast, sh]
published: true
---

# JavaParser

[JavaParser](https://github.com/javaparser/javaparser) is java 1-14 Parser and Abstract Syntax Tree for Java, including preview features to Java 13.

该项目包含一组实现具有高级分析功能的Java 1.0-Java 14 Parser的库。 

这包括Java 13的预览功能，以及Java 14的预览功能正在进行中。

## 学习资料

[官方书籍](https://leanpub.com/javaparservisited)

阅读：https://leanpub.com/javaparservisited/read_full

TODO: 整本书的学习笔记。

## 入门例子

[Sample project with a basic Maven + JavaParser setup](https://github.com/javaparser/javaparser-maven-sample)

[Sample project with basic Maven + JavaSymbolSolver set up](https://github.com/javaparser/javasymbolsolver-maven-sample)

# Inspecting an AST

## maven 引入

```xml
<dependency>
    <groupId>com.github.javaparser</groupId>
    <artifactId>javaparser-symbol-solver-core</artifactId>
    <version>3.15.21</version>
</dependency>
```

ps: 需要设置 jdk 级别为 1.8

## 断点

```java
public static void main(String[] args) {
   // Parse the code you want to inspect:
   CompilationUnit cu = StaticJavaParser.parse("class X { int x; }");
   // Now comes the inspection code:
   System.out.println(cu);

   
}
```

我们可以通过断点的方式获取 `"class X { int x; }"` 的信息。

## 输出

```java
// Now comes the inspection code:
YamlPrinter printer = new YamlPrinter(true);
System.out.println(printer.output(cu));
```

直接输出

```
---
root(Type=CompilationUnit): 
    types: 
        - type(Type=ClassOrInterfaceDeclaration): 
            isInterface: "false"
            name(Type=SimpleName): 
                identifier: "X"
            members: 
                - member(Type=FieldDeclaration): 
                    variables: 
                        - variable(Type=VariableDeclarator): 
                            name(Type=SimpleName): 
                                identifier: "x"
                            type(Type=PrimitiveType): 
                                type: "INT"
...
```

## xml 格式

```xml
<root type='CompilationUnit'><types><type type='ClassOrInterfaceDeclaration' isInterface='false'><name type='SimpleName' identifier='X'></name><members><member type='FieldDeclaration'><variables><variable type='VariableDeclarator'><name type='SimpleName' identifier='x'></name><type type='PrimitiveType' type='INT'></type></variable></variables></member></members></type></types></root>
```


# 修改 class 文件

直接参考 [Sample project with a basic Maven + JavaParser setup](https://github.com/javaparser/javaparser-maven-sample)

## maven 引入

```xml
<dependency>
    <groupId>com.github.javaparser</groupId>
    <artifactId>javaparser-core</artifactId>
    <version>3.15.21</version>
</dependency>
```

## 原始 java 类

ps: 某种角度是为了展现强大，所以代码很冗余，很长。

```java
import com.github.javaparser.utils.CodeGenerationUtils;
import com.github.javaparser.utils.SourceRoot;

public class Blabla {

    private final void method1013(StreamBuffer buf, int opcode) {
        if (opcode != 1) {
            if (opcode != 2) {
                if (opcode != 4) {
                    do {
                        if (opcode != 5) {
                            if (opcode == 6)
                                ((Class94) this).anInt1477 = buf.readUnsignedShort();
                            else {
                                if (opcode != 7) {
                                    if (opcode != 8) {
                                        if (opcode == 11)
                                            ((Class94) this).anInt1456 = 1;
                                        else if (opcode != 12) {
                                            if (opcode != 16) {
                                                if (opcode == 23)
                                                    ((Class94) this).anInt1424 = (buf.readUnsignedShort());
                                                else if (opcode != 24) {
                                                    if (opcode == 25)
                                                        ((Class94) this).anInt1487 = (buf.readUnsignedShort());
                                                    else if (opcode == 26)
                                                        anInt1435 = (buf.readUnsignedShort());
                                                    else if (opcode < 30 || opcode >= 35) {
                                                        if (opcode >= 35 && opcode < 40)
                                                            ((Class94) this).aStringArray1475[-35 + opcode] = (buf.readString());
                                                        else if (opcode == 40) {
                                                            int i_48_ = (buf.readUnsignedByte());
                                                            aShortArray1457 = (new short[i_48_]);
                                                            aShortArray1492 = (new short[i_48_]);
                                                            for (int i_49_ = 0; i_49_ < i_48_; i_49_++) {
                                                                aShortArray1457[i_49_] = (short) buf.readUnsignedShort();
                                                                aShortArray1492[i_49_] = (short) buf.readUnsignedShort();
                                                            }
                                                        } else if (opcode != 41) {
                                                            if (opcode == 42) {
                                                                int i_50_ = (buf.readUnsignedByte());
                                                                aByteArray1501 = (new byte[i_50_]);
                                                                for (int i_51_ = 0; (i_51_ < i_50_); i_51_++) aByteArray1501[i_51_] = (buf.readByte(false));
                                                            } else if (opcode != 65) {
                                                                if (opcode == 78)
                                                                    anInt1479 = (buf.readUnsignedShort());
                                                                else if (opcode == 79)
                                                                    anInt1438 = (buf.readUnsignedShort());
                                                                else if (opcode != 90) {
                                                                    if (opcode != 91) {
                                                                        if (opcode == 92)
                                                                            anInt1450 = buf.readUnsignedShort();
                                                                        else if (opcode != 93) {
                                                                            if (opcode != 95) {
                                                                                if (opcode != 96) {
                                                                                    if (opcode == 97)
                                                                                        ((Class94) this).anInt1474 = buf.readUnsignedShort();
                                                                                    else if (opcode == 98)
                                                                                        ((Class94) this).anInt1500 = buf.readUnsignedShort();
                                                                                    else if (opcode < 100 || opcode >= 110) {
                                                                                        if (opcode == 110)
                                                                                            anInt1423 = buf.readUnsignedShort();
                                                                                        else if (opcode != 111) {
                                                                                            if (opcode == 112)
                                                                                                anInt1480 = buf.readUnsignedShort();
                                                                                            else if (opcode != 113) {
                                                                                                if (opcode == 114)
                                                                                                    anInt1439 = buf.readByte(false) * 5;
                                                                                                else if (opcode == 115)
                                                                                                    ((Class94) this).anInt1462 = buf.readUnsignedByte();
                                                                                                else if (opcode != 121) {
                                                                                                    if (opcode != 122) {
                                                                                                        if (opcode == 125) {
                                                                                                            anInt1493 = buf.readByte(false) << 2;
                                                                                                            anInt1465 = buf.readByte(false) << 2;
                                                                                                            anInt1437 = buf.readByte(false) << 2;
                                                                                                        } else if (opcode == 126) {
                                                                                                            anInt1498 = buf.readByte(false) << 2;
                                                                                                            anInt1470 = buf.readByte(false) << 2;
                                                                                                            anInt1446 = buf.readByte(false) << 2;
                                                                                                        } else if (opcode == 127) {
                                                                                                            ((Class94) this).anInt1455 = buf.readUnsignedByte();
                                                                                                            ((Class94) this).anInt1426 = buf.readUnsignedShort();
                                                                                                        } else if (opcode != 128) {
                                                                                                            if (opcode == 129) {
                                                                                                                ((Class94) this).anInt1433 = buf.readUnsignedByte();
                                                                                                                ((Class94) this).anInt1468 = buf.readUnsignedShort();
                                                                                                            } else if (opcode == 130) {
                                                                                                                ((Class94) this).anInt1440 = buf.readUnsignedByte();
                                                                                                                ((Class94) this).anInt1483 = buf.readUnsignedShort();
                                                                                                            } else if (opcode != 132) {
                                                                                                                if (opcode == 249) {
                                                                                                                    int i_52_ = buf.readUnsignedByte();
                                                                                                                    if (((Class94) this).aClass194_1472 == null) {
                                                                                                                        int i_53_ = Class307.calculateSize(i_52_);
                                                                                                                        ((Class94) this).aClass194_1472 = new HashTable(i_53_);
                                                                                                                    }
                                                                                                                    for (int i_54_ = 0; i_54_ < i_52_; i_54_++) {
                                                                                                                        boolean bool = buf.readUnsignedByte() == 1;
                                                                                                                        int i_55_ = buf.method2507(125);
                                                                                                                        Node class279;
                                                                                                                        if (bool)
                                                                                                                            class279 = new StringNode(buf.readString());
                                                                                                                        else
                                                                                                                            class279 = new IntegerNode(buf.readInt());
                                                                                                                        ((Class94) this).aClass194_1472.add((long) i_55_, class279);
                                                                                                                    }
                                                                                                                }
                                                                                                            } else {
                                                                                                                int i_56_ = buf.readUnsignedByte();
                                                                                                                ((Class94) this).anIntArray1441 = new int[i_56_];
                                                                                                                for (int i_57_ = 0; i_56_ > i_57_; i_57_++) ((Class94) this).anIntArray1441[i_57_] = buf.readUnsignedShort();
                                                                                                            }
                                                                                                        } else {
                                                                                                            ((Class94) this).anInt1442 = buf.readUnsignedByte();
                                                                                                            ((Class94) this).anInt1476 = buf.readUnsignedShort();
                                                                                                        }
                                                                                                    } else
                                                                                                        ((Class94) this).anInt1431 = buf.readUnsignedShort();
                                                                                                } else
                                                                                                    ((Class94) this).anInt1429 = buf.readUnsignedShort();
                                                                                            } else
                                                                                                anInt1458 = buf.readByte(false);
                                                                                        } else
                                                                                            anInt1503 = buf.readUnsignedShort();
                                                                                    } else {
                                                                                        if (((Class94) this).anIntArray1460 == null) {
                                                                                            ((Class94) this).anIntArray1460 = new int[10];
                                                                                            ((Class94) this).anIntArray1445 = new int[10];
                                                                                        }
                                                                                        ((Class94) this).anIntArray1460[-100 + opcode] = buf.readUnsignedShort();
                                                                                        ((Class94) this).anIntArray1445[opcode - 100] = buf.readUnsignedShort();
                                                                                    }
                                                                                } else
                                                                                    ((Class94) this).anInt1443 = buf.readUnsignedByte();
                                                                            } else
                                                                                ((Class94) this).anInt1494 = buf.readUnsignedShort();
                                                                        } else
                                                                            anInt1490 = buf.readUnsignedShort();
                                                                    } else
                                                                        anInt1466 = buf.readUnsignedShort();
                                                                } else
                                                                    anInt1454 = (buf.readUnsignedShort());
                                                            } else
                                                                ((Class94) this).aBoolean1463 = true;
                                                        } else {
                                                            int i_58_ = (buf.readUnsignedByte());
                                                            aShortArray1504 = (new short[i_58_]);
                                                            aShortArray1488 = (new short[i_58_]);
                                                            for (int i_59_ = 0; i_59_ < i_58_; i_59_++) {
                                                                aShortArray1488[i_59_] = (short) buf.readUnsignedShort();
                                                                aShortArray1504[i_59_] = (short) buf.readUnsignedShort();
                                                            }
                                                        }
                                                    } else
                                                        ((Class94) this).aStringArray1485[opcode + -30] = (buf.readString());
                                                } else
                                                    anInt1449 = (buf.readUnsignedShort());
                                            } else
                                                ((Class94) this).aBoolean1502 = true;
                                        } else
                                            ((Class94) this).anInt1473 = (buf.readInt());
                                    } else {
                                        ((Class94) this).anInt1491 = buf.readUnsignedShort();
                                        if (((Class94) this).anInt1491 > 32767)
                                            ((Class94) this).anInt1491 -= 65536;
                                    }
                                } else {
                                    ((Class94) this).anInt1425 = buf.readUnsignedShort();
                                    if (((Class94) this).anInt1425 <= 32767)
                                        break;
                                    ((Class94) this).anInt1425 -= 65536;
                                }
                                break;
                            }
                            break;
                        }
                        ((Class94) this).anInt1444 = buf.readUnsignedShort();
                    } while (false);
                } else
                    ((Class94) this).anInt1436 = buf.readUnsignedShort();
            } else
                ((Class94) this).aString1434 = buf.readString();
        } else
            anInt1481 = buf.readUnsignedShort();
    }
}
```


## 核心代码

```java
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.expr.BinaryExpr;
import com.github.javaparser.ast.stmt.IfStmt;
import com.github.javaparser.ast.stmt.Statement;
import com.github.javaparser.ast.visitor.ModifierVisitor;
import com.github.javaparser.ast.visitor.Visitable;
import com.github.javaparser.utils.CodeGenerationUtils;
import com.github.javaparser.utils.Log;
import com.github.javaparser.utils.SourceRoot;

import java.nio.file.Paths;

/**
 * Some code that uses JavaParser.
 */
public class LogicPositivizer {
    public static void main(String[] args) {
        // JavaParser has a minimal logging class that normally logs nothing.
        // Let's ask it to write to standard out:
        Log.setAdapter(new Log.StandardOutStandardErrorAdapter());
        
        // SourceRoot is a tool that read and writes Java files from packages on a certain root directory.
        // In this case the root directory is found by taking the root from the current Maven module,
        // with src/main/resources appended.
        SourceRoot sourceRoot = new SourceRoot(CodeGenerationUtils.mavenModuleRoot(LogicPositivizer.class).resolve("src/main/resources"));

        // Our sample is in the root of this directory, so no package name.
        CompilationUnit cu = sourceRoot.parse("", "Blabla.java");

        Log.info("Positivizing!");
        
        cu.accept(new ModifierVisitor<Void>() {
            /**
             * For every if-statement, see if it has a comparison using "!=".
             * Change it to "==" and switch the "then" and "else" statements around.
             */
            @Override
            public Visitable visit(IfStmt n, Void arg) {
                // Figure out what to get and what to cast simply by looking at the AST in a debugger! 
                n.getCondition().ifBinaryExpr(binaryExpr -> {
                    if (binaryExpr.getOperator() == BinaryExpr.Operator.NOT_EQUALS && n.getElseStmt().isPresent()) {
                        /* It's a good idea to clone nodes that you move around.
                            JavaParser (or you) might get confused about who their parent is!
                        */
                        Statement thenStmt = n.getThenStmt().clone();
                        Statement elseStmt = n.getElseStmt().get().clone();
                        n.setThenStmt(elseStmt);
                        n.setElseStmt(thenStmt);
                        binaryExpr.setOperator(BinaryExpr.Operator.EQUALS);
                    }
                });
                return super.visit(n, arg);
            }
        }, null);

        // This saves all the files we just read to an output directory.  
        sourceRoot.saveAll(
                // The path of the Maven module/project which contains the LogicPositivizer class.
                CodeGenerationUtils.mavenModuleRoot(LogicPositivizer.class)
                        // appended with a path to "output"
                        .resolve(Paths.get("output")));
    }
}
```

## 结果

```java
import com.github.javaparser.utils.CodeGenerationUtils;
import com.github.javaparser.utils.SourceRoot;

public class Blabla {

    private final void method1013(StreamBuffer buf, int opcode) {
        if (opcode == 1)
            anInt1481 = buf.readUnsignedShort();
        else {
            if (opcode == 2)
                ((Class94) this).aString1434 = buf.readString();
            else {
                if (opcode == 4)
                    ((Class94) this).anInt1436 = buf.readUnsignedShort();
                else {
                    do {
                        if (opcode != 5) {
                            if (opcode == 6)
                                ((Class94) this).anInt1477 = buf.readUnsignedShort();
                            else {
                                if (opcode == 7) {
                                    ((Class94) this).anInt1425 = buf.readUnsignedShort();
                                    if (((Class94) this).anInt1425 <= 32767)
                                        break;
                                    ((Class94) this).anInt1425 -= 65536;
                                } else {
                                    if (opcode == 8) {
                                        ((Class94) this).anInt1491 = buf.readUnsignedShort();
                                        if (((Class94) this).anInt1491 > 32767)
                                            ((Class94) this).anInt1491 -= 65536;
                                    } else {
                                        if (opcode == 11)
                                            ((Class94) this).anInt1456 = 1;
                                        else if (opcode == 12)
                                            ((Class94) this).anInt1473 = (buf.readInt());
                                        else {
                                            if (opcode == 16)
                                                ((Class94) this).aBoolean1502 = true;
                                            else {
                                                if (opcode == 23)
                                                    ((Class94) this).anInt1424 = (buf.readUnsignedShort());
                                                else if (opcode == 24)
                                                    anInt1449 = (buf.readUnsignedShort());
                                                else {
                                                    if (opcode == 25)
                                                        ((Class94) this).anInt1487 = (buf.readUnsignedShort());
                                                    else if (opcode == 26)
                                                        anInt1435 = (buf.readUnsignedShort());
                                                    else if (opcode < 30 || opcode >= 35) {
                                                        if (opcode >= 35 && opcode < 40)
                                                            ((Class94) this).aStringArray1475[-35 + opcode] = (buf.readString());
                                                        else if (opcode == 40) {
                                                            int i_48_ = (buf.readUnsignedByte());
                                                            aShortArray1457 = (new short[i_48_]);
                                                            aShortArray1492 = (new short[i_48_]);
                                                            for (int i_49_ = 0; i_49_ < i_48_; i_49_++) {
                                                                aShortArray1457[i_49_] = (short) buf.readUnsignedShort();
                                                                aShortArray1492[i_49_] = (short) buf.readUnsignedShort();
                                                            }
                                                        } else if (opcode == 41) {
                                                            int i_58_ = (buf.readUnsignedByte());
                                                            aShortArray1504 = (new short[i_58_]);
                                                            aShortArray1488 = (new short[i_58_]);
                                                            for (int i_59_ = 0; i_59_ < i_58_; i_59_++) {
                                                                aShortArray1488[i_59_] = (short) buf.readUnsignedShort();
                                                                aShortArray1504[i_59_] = (short) buf.readUnsignedShort();
                                                            }
                                                        } else {
                                                            if (opcode == 42) {
                                                                int i_50_ = (buf.readUnsignedByte());
                                                                aByteArray1501 = (new byte[i_50_]);
                                                                for (int i_51_ = 0; (i_51_ < i_50_); i_51_++) aByteArray1501[i_51_] = (buf.readByte(false));
                                                            } else if (opcode == 65)
                                                                ((Class94) this).aBoolean1463 = true;
                                                            else {
                                                                if (opcode == 78)
                                                                    anInt1479 = (buf.readUnsignedShort());
                                                                else if (opcode == 79)
                                                                    anInt1438 = (buf.readUnsignedShort());
                                                                else if (opcode == 90)
                                                                    anInt1454 = (buf.readUnsignedShort());
                                                                else {
                                                                    if (opcode == 91)
                                                                        anInt1466 = buf.readUnsignedShort();
                                                                    else {
                                                                        if (opcode == 92)
                                                                            anInt1450 = buf.readUnsignedShort();
                                                                        else if (opcode == 93)
                                                                            anInt1490 = buf.readUnsignedShort();
                                                                        else {
                                                                            if (opcode == 95)
                                                                                ((Class94) this).anInt1494 = buf.readUnsignedShort();
                                                                            else {
                                                                                if (opcode == 96)
                                                                                    ((Class94) this).anInt1443 = buf.readUnsignedByte();
                                                                                else {
                                                                                    if (opcode == 97)
                                                                                        ((Class94) this).anInt1474 = buf.readUnsignedShort();
                                                                                    else if (opcode == 98)
                                                                                        ((Class94) this).anInt1500 = buf.readUnsignedShort();
                                                                                    else if (opcode < 100 || opcode >= 110) {
                                                                                        if (opcode == 110)
                                                                                            anInt1423 = buf.readUnsignedShort();
                                                                                        else if (opcode == 111)
                                                                                            anInt1503 = buf.readUnsignedShort();
                                                                                        else {
                                                                                            if (opcode == 112)
                                                                                                anInt1480 = buf.readUnsignedShort();
                                                                                            else if (opcode == 113)
                                                                                                anInt1458 = buf.readByte(false);
                                                                                            else {
                                                                                                if (opcode == 114)
                                                                                                    anInt1439 = buf.readByte(false) * 5;
                                                                                                else if (opcode == 115)
                                                                                                    ((Class94) this).anInt1462 = buf.readUnsignedByte();
                                                                                                else if (opcode == 121)
                                                                                                    ((Class94) this).anInt1429 = buf.readUnsignedShort();
                                                                                                else {
                                                                                                    if (opcode == 122)
                                                                                                        ((Class94) this).anInt1431 = buf.readUnsignedShort();
                                                                                                    else {
                                                                                                        if (opcode == 125) {
                                                                                                            anInt1493 = buf.readByte(false) << 2;
                                                                                                            anInt1465 = buf.readByte(false) << 2;
                                                                                                            anInt1437 = buf.readByte(false) << 2;
                                                                                                        } else if (opcode == 126) {
                                                                                                            anInt1498 = buf.readByte(false) << 2;
                                                                                                            anInt1470 = buf.readByte(false) << 2;
                                                                                                            anInt1446 = buf.readByte(false) << 2;
                                                                                                        } else if (opcode == 127) {
                                                                                                            ((Class94) this).anInt1455 = buf.readUnsignedByte();
                                                                                                            ((Class94) this).anInt1426 = buf.readUnsignedShort();
                                                                                                        } else if (opcode == 128) {
                                                                                                            ((Class94) this).anInt1442 = buf.readUnsignedByte();
                                                                                                            ((Class94) this).anInt1476 = buf.readUnsignedShort();
                                                                                                        } else {
                                                                                                            if (opcode == 129) {
                                                                                                                ((Class94) this).anInt1433 = buf.readUnsignedByte();
                                                                                                                ((Class94) this).anInt1468 = buf.readUnsignedShort();
                                                                                                            } else if (opcode == 130) {
                                                                                                                ((Class94) this).anInt1440 = buf.readUnsignedByte();
                                                                                                                ((Class94) this).anInt1483 = buf.readUnsignedShort();
                                                                                                            } else if (opcode == 132) {
                                                                                                                int i_56_ = buf.readUnsignedByte();
                                                                                                                ((Class94) this).anIntArray1441 = new int[i_56_];
                                                                                                                for (int i_57_ = 0; i_56_ > i_57_; i_57_++) ((Class94) this).anIntArray1441[i_57_] = buf.readUnsignedShort();
                                                                                                            } else {
                                                                                                                if (opcode == 249) {
                                                                                                                    int i_52_ = buf.readUnsignedByte();
                                                                                                                    if (((Class94) this).aClass194_1472 == null) {
                                                                                                                        int i_53_ = Class307.calculateSize(i_52_);
                                                                                                                        ((Class94) this).aClass194_1472 = new HashTable(i_53_);
                                                                                                                    }
                                                                                                                    for (int i_54_ = 0; i_54_ < i_52_; i_54_++) {
                                                                                                                        boolean bool = buf.readUnsignedByte() == 1;
                                                                                                                        int i_55_ = buf.method2507(125);
                                                                                                                        Node class279;
                                                                                                                        if (bool)
                                                                                                                            class279 = new StringNode(buf.readString());
                                                                                                                        else
                                                                                                                            class279 = new IntegerNode(buf.readInt());
                                                                                                                        ((Class94) this).aClass194_1472.add((long) i_55_, class279);
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    } else {
                                                                                        if (((Class94) this).anIntArray1460 == null) {
                                                                                            ((Class94) this).anIntArray1460 = new int[10];
                                                                                            ((Class94) this).anIntArray1445 = new int[10];
                                                                                        }
                                                                                        ((Class94) this).anIntArray1460[-100 + opcode] = buf.readUnsignedShort();
                                                                                        ((Class94) this).anIntArray1445[opcode - 100] = buf.readUnsignedShort();
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    } else
                                                        ((Class94) this).aStringArray1485[opcode + -30] = (buf.readString());
                                                }
                                            }
                                        }
                                    }
                                }
                                break;
                            }
                            break;
                        }
                        ((Class94) this).anInt1444 = buf.readUnsignedShort();
                    } while (false);
                }
            }
        }
    }
}
```



# JavaParser的快速完整API

JavaParser站点的两个API背后的想法迷失在JavaParser网站的黑暗角落。 

这是一种尝试：-)

我在这里讨论的API实际上是JavaParser和StaticJavaParser类的API。

## 快速开始

建立该API的目的是使普通用例尽可能轻松。 

最后，此API是完整API的快捷方式的集合。

```java
import static com.github.javaparser.StaticJavaParser.*;
    // ...
CompilationUnit cu = parse("class X{}");
```

StaticJavaParser.parse 处理的是一个完整的 java 文件，你也可以处理一个 File 或者是文件流。

- 编译表达式

```java
Expression expression = StaticJavaParser.parseExpression("1+1");
```

# JavaParser api

建立此API的目的是为了获得存在的所有灵活性，并提供更多性能。

```java
import static com.github.javaparser.ParseStart.*;
import static com.github.javaparser.Providers.provider;
...
JavaParser javaParser = new JavaParser();
ParseResult result = javaParser.parse(COMPILATION_UNIT, provider("class X{}"));
result.ifSuccessful(cu ->
    // use cu        
);
```

或者

```java
import static com.github.javaparser.ParseStart.*;
import static com.github.javaparser.Providers.provider;
...
new JavaParser().parse(COMPILATION_UNIT, provider("class X{}")).ifSuccessful(cu ->
        System.out.println(cu)        
);
```

完整的API由JavaParser构造函数和整套解析方法组成，其中有一个额外的功能-一个用于实际解析的功能。

它永远不会引发异常。 ParseResult可以告诉您解析是否正常，如果遇到问题，请告诉我们。

重用JavaParser实例将提高速度。

JavaParser实例不是线程安全的！

extra parse方法的第一个参数指示您将传递的源类型。 通常，它是一个编译单元，但是您可以解析表达式，名称等。

额外解析方法的第二个参数提供源代码。 提供者是对任何种类输入的抽象。

完整的API可让您随意组合这些参数。

再次解析Javadoc是一个例外。 为此，您需要JavadocParser。

可以在构造函数中传递配置。

```java
ParserConfiguration configuration = new ParserConfiguration();
JavaParser parser = new JavaParser(configuration);
ParseResult parseResult = parser.parse(EXPRESSION, provider("1+1"));
if (!parseResult.isSuccessful()) {
    System.out.println(parseResult.getProblems().toString());
}
// a failed parse does not always mean there is no result.
parseResult.getResult().ifPresent(System.out::println);
if (parseResult.getCommentsCollection().isPresent()) {
    // ...
}
```

# 一次性分析整个项目

JavaParser非常适合分析Java代码，并提供了一种一次性处理源目录的方法。 

但是它缺少分析项目的方法，该项目可能包含多个源目录。 

以前的答案是手动创建所有SourceRoot，然后可以对其进行分析。 

让我们回顾一下JavaParser存储库的以下示例。 

为了解析存储库中的所有文件，您必须手动定义每个模块的根目录，然后使用每个源根目录创建SourceRoot，然后可以对其进行进一步处理。

```java
Path projectRoot = path-to-project-root;
String[] roots = new String[]{
        "javaparser-core/src/main/java",
        "javaparser-core-testing/src/test/java",
        "javaparser-core-generators/src/main/java",
        "javaparser-core-metamodel-generator/src/main/java",
        "javaparser-symbol-solver-core/src/main/java",
        "javaparser-symbol-solver-logic/src/main/java",
        "javaparser-symbol-solver-model/src/main/java",
        "javaparser-symbol-solver-testing/src/test/java"
};

for (String root : roots) {
    SourceRoot sourceRoot = new SourceRoot(projectRoot.resolve(root));
    List<ParseResult> parseResults = sourceRoot.tryToParse();
}
```

我们需要一种自动实现此目的的方法，从而避免了所有人重新发明轮子的麻烦。 

为此，我们介绍ProjectRootand CollectionStrategy。

如果仅需要解析Java文件，则仅收集项目中的SourceRoots就足够了。 

但是，如果您还想解析java文件中的符号，则还需要收集jar文件。 

使用ParserCollectionStrategy或SymbolSolverCollectionStrategy，您可以分别指定要解析还是解析。 

以下示例显示如何初始化ProjectRoot：

```java
// only parsing
private final ProjectRoot projectRoot = 
    new ParserCollectionStrategy()
    .collect(root);
// parsing and resolving
private final ProjectRoot projectRoot = 
    new SymbolSolverCollectionStrategy()
    .collect(root);
```


# 拓展阅读

## ASM 

[java assist]()

[cglib]()


## java 源码

[java poet]()




# 参考资料

[基于AST抽象语法树实现删除java/android代码中的Log.*输出,主要运用在apk发布阶段](https://github.com/stormzsl/AndroidDeleteLog)

[解析表达式抽象语法树](https://github.com/LaplaceDemon/light-expr)

* any list
{:toc}