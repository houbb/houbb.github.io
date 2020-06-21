---
layout: post
title: Design Pattern 35-依赖倒置原则（Dependence Inversion Principle，DIP）
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, sf]
published: true
---

# 依赖倒置原则的定义

依赖倒置原则（Dependence Inversion Principle，DIP）是 Object Mentor 公司总裁罗伯特·马丁（Robert C.Martin）于 1996 年在 C++ Report 上发表的文章。

依赖倒置原则的原始定义为：高层模块不应该依赖低层模块，两者都应该依赖其抽象；抽象不应该依赖细节，细节应该依赖抽象（High level modules shouldnot depend upon low level modules.Both should depend upon abstractions.Abstractions should not depend upon details. Details should depend upon abstractions）。

其核心思想是：**要面向接口编程，不要面向实现编程**。

依赖倒置原则是实现开闭原则的重要途径之一，它降低了客户与实现模块之间的耦合。

由于在软件设计中，细节具有多变性，而抽象层则相对稳定，因此以抽象为基础搭建起来的架构要比以细节为基础搭建起来的架构要稳定得多。这里的抽象指的是接口或者抽象类，而细节是指具体的实现类。

使用接口或者抽象类的目的是制定好规范和契约，而不去涉及任何具体的操作，把展现细节的任务交给它们的实现类去完成。

# 依赖、倒置原则的作用

依赖倒置原则的主要作用如下。

- 依赖倒置原则可以降低类间的耦合性。

- 依赖倒置原则可以提高系统的稳定性。

- 依赖倒置原则可以减少并行开发引起的风险。

- 依赖倒置原则可以提高代码的可读性和可维护性。

# 依赖倒置原则的实现方法

依赖倒置原则的目的是通过要面向接口的编程来降低类间的耦合性，所以我们在实际编程中只要遵循以下4点，就能在项目中满足这个规则。

1. 每个类尽量提供接口或抽象类，或者两者都具备。

2. 变量的声明类型尽量是接口或者是抽象类。

3. 任何类都不应该从具体类派生。

4. 使用继承时尽量遵循里氏替换原则。

## 例子

下面以“顾客购物程序”为例来说明依赖倒置原则的应用。

【例1】依赖倒置原则在“顾客购物程序”中的应用。

分析：本程序反映了 “顾客类”与“商店类”的关系。商店类中有 sell() 方法，顾客类通过该方法购物以下代码定义了顾客类通过韶关网店 ShaoguanShop 购物：

```java
class Customer
{
    public void shopping(ShaoguanShop shop)
    {
        //购物
        System.out.println（shop.sell());
    }
}
```

但是，这种设计存在缺点，如果该顾客想从另外一家商店（如婺源网店 WuyuanShop）购物，就要将该顾客的代码修改如下：

```java
class Customer
{
    public void shopping(WuyuanShop shop)
    {
        //购物
        System.out.println(shop.sell());
    }
}
```

顾客每更换一家商店，都要修改一次代码，这明显违背了开闭原则。

存在以上缺点的原因是：顾客类设计时同具体的商店类绑定了，这违背了依赖倒置原则。

解决方法是：定义“婺源网店”和“韶关网店”的共同接口 Shop，顾客类面向该接口编程，其代码修改如下：

```java
class Customer
{
    public void shopping(Shop shop)
    {
        //购物
        System.out.println(shop.sell());
    }
}
```

这样，不管顾客类 Customer 访问什么商店，或者增加新的商店，都不需要修改原有代码了，其类图如图 1 所示。

![图1 顾客购物程序的类图](http://c.biancheng.net/uploads/allimg/181113/3-1Q113131610L7.gif)

程序代码如下：

```java
public class DIPtest
{
    public static void main(String[] args)
    {
        Customer wang=new Customer();
        System.out.println("顾客购买以下商品："); 
        wang.shopping(new ShaoguanShop()); 
        wang.shopping(new WuyuanShop());
    }
}
//商店
interface Shop
{
    public String sell(); //卖
}
//韶关网店
class ShaoguanShop implements Shop
{
    public String sell()
    {
        return "韶关土特产：香菇、木耳……"; 
    } 
}
//婺源网店
class WuyuanShop implements Shop
{
    public String sell()
    {
        return "婺源土特产：绿茶、酒糟鱼……"; 
    }
} 
//顾客
class Customer
{
    public void shopping(Shop shop)
    {
        //购物
        System.out.println(shop.sell()); 
    }
}
```

- 日志

```
顾客购买以下商品：
韶关土特产：香菇、木耳……
婺源土特产：绿茶、酒糟鱼……
```

# 参考资料

[里氏替换原则](http://c.biancheng.net/view/1324.html)

* any list
{:toc}
