---
layout: post
title: Design Pattern 15-java 命令行模式(Command Pattern)
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 命令模式

命令模式（Command Pattern）是一种数据驱动的设计模式，它属于行为型模式。请求以命令的形式包裹在对象中，并传给调用对象。调用对象寻找可以处理该命令的合适的对象，并把该命令传给相应的对象，该对象执行命令

# 实际案例

类信息概览：

| 类名 | 说明 |
|:----|:----|
| Main.java | 方法的总入口 |
| SellStock.java | 出售股票 |
| Order.java | 下单 |
| BuyStock.java | 购买股票 |
| Stock.java | 股票 |
| StockCommand.java | 股票命令行 |

## 定义


- SellStock.java

```java
package com.ryo.design.pattern.note.command;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/13
 * @since 1.7
 */
public class SellStock implements Order {

    private Stock stock;

    public SellStock(Stock stock) {
        this.stock = stock;
    }

    @Override
    public void execute() {
        this.stock.sell();
    }
}

```


- Order.java

```java
package com.ryo.design.pattern.note.command;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/13
 * @since 1.7
 */
public interface Order {

    /**
     * 执行
     */
    void execute();

}

```


- BuyStock.java

```java
package com.ryo.design.pattern.note.command;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/13
 * @since 1.7
 */
public class BuyStock implements Order {

    private Stock stock;

    public BuyStock(Stock stock) {
        this.stock = stock;
    }

    @Override
    public void execute() {
        this.stock.buy();
    }
}

```


- Stock.java

```java
package com.ryo.design.pattern.note.command;

import lombok.Data;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/13
 * @since 1.7
 */
@Data
public class Stock {

    private String name = "Common Stock";

    private int num = 10;

    public void buy() {
        System.out.println("Buy "+this);
    }

    public void sell() {
        System.out.println("Sell "+this);
    }


}

```


- StockCommand.java

```java
package com.ryo.design.pattern.note.command;

import java.util.LinkedList;
import java.util.List;

/**
 * @author houbinbin
 * @version 1.0
 * @on 2017/8/13
 * @since 1.7
 */
public class StockCommand {

    private List<Order> orderList = new LinkedList<>();


    public void addOrder(Order order) {
        this.orderList.add(order);
    }

    public void executeOrder() {
        for(Order order : this.orderList) {
            order.execute();
        }
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

package com.ryo.design.pattern.note.command;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/5/21 下午7:27  </pre>
 * <pre> Project: design-pattern  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class Main {

    public static void main(String[] args) {
        Stock stock = new Stock();

        BuyStock buyStock = new BuyStock(stock);
        SellStock sellStock = new SellStock(stock);

        StockCommand command = new StockCommand();
        command.addOrder(buyStock);
        command.addOrder(sellStock);

        command.executeOrder();
    }

}

```

- 测试结果

```
Buy Stock(name=Common Stock, num=10)
Sell Stock(name=Common Stock, num=10)
```

# 实现方式

# UML & Code

## UML

UML 图示如下

## Code

代码地址

> [命令行模式](https://github.com/houbb/design-pattern/tree/master/design-pattern-note/src/main/java/com/ryo/design/pattern/note/command)

# 系列导航

> [系列导航](https://blog.csdn.net/ryo1060732496/article/details/80214740)

* any list
{:toc}