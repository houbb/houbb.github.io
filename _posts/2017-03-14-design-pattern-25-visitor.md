---
layout: post
title: Design Pattern 25-java 访问者模式（Visitor Pattern）
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 访问者模式

在访问者模式（Visitor Pattern）中，我们使用了一个访问者类，它改变了元素类的执行算法。
通过这种方式，元素的执行算法可以随着访问者改变而改变。这种类型的设计模式属于行为型模式。
根据模式，元素对象已接受访问者对象，这样访问者对象就可以处理元素对象上的操作。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| Mouse.java | 鼠标类 |
| Computer.java | 电脑类 |
| ComputerVisitorImpl.java | 电脑访问者实现类 |
| KeyBoard.java | 键盘类 |
| ComputerPartion.java | 电脑组件类 |
| ComputerVisitor.java | 电脑访问者接口 |

## 定义


- Mouse.java

```java
package com.ryo.design.pattern.note.visitor;

/**
 *
 * @author bbhou
 * @date 2017/8/18
 */
public class Mouse implements ComputerPartion {

    @Override
    public void accept(ComputerVisitor computerVisitor) {
        computerVisitor.visit(this);
    }

}

```


- Computer.java

```java
package com.ryo.design.pattern.note.visitor;

import java.util.Arrays;
import java.util.List;

/**
 * 电脑
 * @author bbhou
 * @date 2017/8/18
 */
public class Computer implements ComputerPartion {

    private List<ComputerPartion> computerPartionList = Arrays.asList(new KeyBoard(), new Mouse());

    @Override
    public void accept(ComputerVisitor computerVisitor) {
        for(ComputerPartion computerPartion : computerPartionList) {
            computerVisitor.visit(computerPartion);
        }
    }
}

```


- ComputerVisitorImpl.java

```java
package com.ryo.design.pattern.note.visitor;

/**
 * @author bbhou
 * @date 2017/8/18
 */
public class ComputerVisitorImpl implements ComputerVisitor {

    @Override
    public void visit(ComputerPartion computerPartion) {
        String className = computerPartion.getClass().getSimpleName();
        System.out.println("visitor " + className);
    }

}

```


- KeyBoard.java

```java
package com.ryo.design.pattern.note.visitor;

/**
 *
 * @author bbhou
 * @date 2017/8/18
 */
public class KeyBoard implements ComputerPartion {
    @Override
    public void accept(ComputerVisitor computerVisitor) {
        computerVisitor.visit(this);
    }
}

```


- ComputerPartion.java

```java
package com.ryo.design.pattern.note.visitor;

/**
 * 电脑部分
 * @author bbhou
 * @date 2017/8/18
 */
public interface ComputerPartion {

    /**
     * 接受电脑组件
     * @param computerVisitor 电脑组件
     */
    void accept(ComputerVisitor computerVisitor);

}

```


- ComputerVisitor.java

```java
package com.ryo.design.pattern.note.visitor;

/**
 *
 * @author bbhou
 * @date 2017/8/18
 */
public interface ComputerVisitor {

    /**
     * 访问者
     * @param computerPartion 组件
     */
    void visit(ComputerPartion computerPartion);

}

```


## 测试

- Main.java

```java
/*
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
 * Copyright (c) 2012-2018. houbinbini Inc.
 * design-pattern All rights reserved.
 */

package com.ryo.design.pattern.note.visitor;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/26 下午8:36  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        ComputerPartion computerPartion = new Computer();
        computerPartion.accept(new ComputerVisitorImpl());
    }

}

```

- 测试结果

```
visitor KeyBoard
visitor Mouse
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [访问者模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/visitor)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}