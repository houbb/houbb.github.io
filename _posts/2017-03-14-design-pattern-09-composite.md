---
layout: post
title: Design Pattern 09-java 组合模式(Composite Pattern)
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 组合模式

组合模式(Composite Pattern)使得用户对单个对象和组合对象的使用具有唯一性。

将对象组合成树形结构以表示【部分-整体】的层次结构。

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| Component.java | 组件 |
| Composite.java | 组合类 |
| Leaf.java | 叶子 |

## 定义


- Component.java

```java
package com.ryo.design.pattern.note.composite;

/**
 *
 * @author bbhou
 * @date 2017/8/11
 */
public abstract class Component {

    private String name;

    public Component(String name) {
        this.name = name;
    }
    public String getName() {
        return name;
    }

    /**
     * add one compoent
     * @param component
     */
    public abstract void add(Component component);

    /**
     * remove one compoent
     * @param component
     */
    public abstract void remove(Component component);

    /**
     * display the component info;
     * @param depth
     */
    public abstract void display(int depth);


}

```


- Composite.java

```java
package com.ryo.design.pattern.note.composite;

import java.util.LinkedList;
import java.util.List;

/**
 *
 * @author bbhou
 * @date 2017/8/11
 */
public class Composite extends Component {
    /**
     * 用于存放子节点
     */
    private List<Component> children = new LinkedList<>();

    /**
     * 定义枝节点行为，用来存储子部件，在 Component 接口中实现与子部件相关的操作。
     * @param name
     */
    public Composite(String name) {
        super(name);
    }

    @Override
    public void add(Component component) {
        this.children.add(component);
    }

    @Override
    public void remove(Component component) {
        this.children.remove(component);
    }

    @Override
    public void display(int depth) {
        //1.itself
        StringBuilder stringBuilder = new StringBuilder();
        for(int i = 0; i < depth; i++) {
            stringBuilder.append("-");
        }
        System.out.println(stringBuilder.toString()+" "+getName());

        //2.children
        for(Component component : this.children) {
            component.display(depth+2);
        }
    }
}

```


- Leaf.java

```java
package com.ryo.design.pattern.note.composite;

/**
 *
 * @author bbhou
 * @date 2017/8/11
 */
public class Leaf extends Component {

    public Leaf(String name) {
        super(name);
    }

    @Override
    public void add(Component component) {
        System.out.println("can't add child to leaf.");
    }

    @Override
    public void remove(Component component) {
        System.out.println("can't remove child from leaf.");
    }

    @Override
    public void display(int depth) {
        StringBuilder stringBuilder = new StringBuilder();
        for(int i = 0; i < depth; i++) {
            stringBuilder.append("-");
        }

        System.out.println(stringBuilder.toString()+" "+getName());
    }
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

package com.ryo.design.pattern.note.composite;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/16 下午8:11  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        Composite root = new Composite("root");
        root.add(new Leaf("Leaf A"));
        root.add(new Leaf("Leaf B"));

        Composite compX = new Composite("Composite X");
        compX.add(new Leaf("Leaf XA"));
        compX.add(new Leaf("Leaf XB"));
        root.add(compX);

        Composite compXY = new Composite("Composite XY");
        compXY.add(new Leaf("Leaf XYA"));
        compXY.add(new Leaf("Leaf XYB"));
        compX.add(compXY);

        root.display(1);
    }

}

```

- 测试结果

```
- root
--- Leaf A
--- Leaf B
--- Composite X
----- Leaf XA
----- Leaf XB
----- Composite XY
------- Leaf XYA
------- Leaf XYB
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [组合模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/composite)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}