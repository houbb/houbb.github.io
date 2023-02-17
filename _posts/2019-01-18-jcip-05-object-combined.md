---
layout: post
title: JCIP-05-对象组合
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, sh]
published: true
excerpt: JCIP-05-对象组合
---

# 问题

- 如何保证一个类是线程安全的？怎么验证？

- 线程安全的类可以成为组件，更加方便的创建线程安全的类吗？


# 线程安全的类有哪些条件

在设计线程安全类的过程中，需要包含以下三个基本要素：

1、找出构成对象状态的所有变量

2、找出约束状态变量的不变性条件

3、建立对象状态的并发访问管理策略

ps: 一言以蔽之，让所有变量都被对象并发管理。

## 1. 收集同步需求

要确保类的线程安全型，就要确保它的不变性条件不会在并发访问的情况下被破坏。对象与变量都有一个状态空间，即所有可能的取值。状态空间越小，就越容易判断线程的状态。final 类型的域使用的越多，就越能简化对象可能状态的分析过程。

```java
public final class Counter{
    private long value = 0;
    public synchronized long getValue(){
        return value;
    }

    public synchronized long increment(){
        if(value == Long.MAX_VALUE)
            throw new IllegalStateException();
        return ++value;
    }
}
```

在许多类中都定义了一些不可变条件，用于判断状态是有效的还是无效的。 

比如 long 类型的变量 ，其状态空间为从 Long.MIN_VALUE 到 Long.MAX_VALUE ，或者一些表数量的变量值不能为负值。

同样，在操作中还会包含一些后验条件来判断状态迁移是否有效。 比如变量 counter 当前值为 17，下一个状态只能为18。当下一个状态需要依赖当前状态时，这个操作就必须使一个复合操作。并非所哟肚饿操作都会在状态转换上施加限制。例如，当更新一个保存当前温度的变量时，该变量之前的状态并不会影响计算结果。

由于不变性条件以及后验条件在状态及状态转换上施加了各种约束，因此就需要额外的同步与封装。如果某些状态是无效的，那么必须对底层的状态变量进行封装，否则客户代码可能会使对象处于无效状态。如果在某个操作中存在无效的状态转换，那么该操作必须是原子的。另外，如果在类中没有施加这种约束，那么就可以放宽封装性或序列化等要求，已获得更高的灵活性或性能。


## 2. 依赖状态的操作

类的不变性条件与后验条件约束了在对象上有哪些状态和状态转换是有效地。在某些对象的方法中还包含了一些基于状态的先验条件（Precondition）。

例如，不能从空队列中移除一个元素，在删除元素前，队列必须处于“非空的”状态。如果在某个操作中包含有基于状态的先验条件，那么这个操作就成为依赖状态的操作。

## 3. 状态的所有权

许多情况下，所有权与封装性总是相互关联的：对象封装它拥有的状态，反之也成立，即拥有它封装的状态的所有权。状态变量的所有者将决定采用何种加锁协议来维持变量状态的完整性。所有权意味着控制权。然而，如果发布了某个可变对象的引用，那么就不再拥有独占的控制权，最多是”共享控制权“。对于从构造函数或者从方法中传递进来的对象，类通常并不拥有这些对象，除非这些方法是被专门设计为转移传递进来的对象的所有权。

容器类通常便显出一种所有权分离的形式，其中容器类拥有自身的状态，而客户代码则拥有容器中各个对象的状态。

# 实例封闭

如果某对象不是线程安全的，那么可以通过多种技术使其可以在多线程程序中安全的被使用。也可以确保该对象只能由单个线程访问（线程封闭），或者通过一个锁来保护对该对象的所有访问。

封装简化了线程安全类的实现过程，它提供了一种实例封闭机制（Instance Confinement），通常也简称为”封闭“。当一个对象被封闭到另一个对象中时，能够访问被封装对象的所有代码路径都是已知的。与对象可以由整个程序访问的情况相比，更容易对代码进行分析。通过将封闭机制与合适的加锁策略结合起来，可以确保以线程安全的方式来使用非线程安全的对象。

## 实例封闭

实例封闭是构建线程安全类的一个最简单方式，他还使得在锁策略的选择上拥有了更多的灵活性。



```java
public class PersonSet{
    private final Set<Persion> mySet = new HashSet<>();
    public synchronized long addPersion(Persion p){
        mySet.add(p);
    }

    public synchronized boolean containsPersion(Persion p){
        return mySet.contains(p);
    }
}
```

HashSet并非线程安全的，但是HashSet被封闭在PersionSet中，唯一能访问mySet的代码都由锁保护的。因此PersionSet的线程安全的。

本例中并没有假设Persion的线程安全性。如果Persion是可变的，那么访问persion还需要额外的同步。

在 Java 平台的类库中还有很多线程封闭的示例，其中有些类的唯一用途就是将非线程安全的类装化为线程安全的类。

一些基本的容器类并非线程安全的，例如 ArrayList 和 HashMap，但类库提供了包装器工厂方法（如 Collections.sychronizedList 及其类似方法），使得这些非线程安全的类可以再多线程环境中安全的使用。

这些工厂方法通过”装饰器“（Decorator）模式将容器类风状态一个同步的包装器对象中，而包装器能将接口中的每个方法都实现为同步方法，并将调用请求转发到底层的容器对象上。只要包装器对象拥有对底层容易对象的唯一引用，那么它就是线程安全的。

## 1. Java 监视器模式

从线程封闭原则及其逻辑推论可以得出 Java 监视器模式。即把对象的所有可变状态都封装起来，并由对象自己的内置锁保护。

许多类中都使用了 Java 监视器模式，例如 Vector 和 HashTable。

Java 监视器模式仅仅是一种编写代码的约定，对于任何一种锁对象，只要自始至终都使用该所对象，都可以用来保护对象的状态。

如 PrivateLock 给出了如何使用私有锁来保护状态。

```java
public class PrivateLock {
	private final Object myLock = new Object();
	Date date;
	
	void someMethod(){
		synchronized(myLock){
			//访问或修改 date 的状态
		}
	}
}
```

### 私有锁对象的优点

使用私有锁对象而不是对象的内置锁，有许多优点。

私有锁对象可以将锁封装起来，使客户代码无法得到锁，但客户代码才可以通过公有方法来访问锁，以便（正确或者不正确的）参与到它的同步策略中。

此外，要想验证某个公有访问的锁在程序中是否被正确的使用，则需要检查整个程序，而不是单个类，降低了验证的复杂度。

### 车辆追踪的例子

```java
class MutablePoint{
    public  int x,y;
    public MutablePoint(){
        x=0;
        y=0;
    }
    public MutablePoint(MutablePoint point){
        this.x = point.x;
        this.y = point.y;
    }

}

public class MonitorVehicleTracker{
    private final Map<String, MutablePoint> locations;
    public MonitorVehicleTracker(Map<String, MutablePoint> locations){
        this.locations = locations;
    }

    public synchronized Map<String, MutablePoint> getLocations(){
        return deepCopy(locations);
    }

    public synchronized MutablePoint getLocation(String id){
        MutablePoint loc = locations.get(id);
        return loc == null?null:new MutablePoint(loc);
    }

    public synchronized void setLocation(String id, int x, int y){
        MutablePoint loc = locations.get(id);
        if(loc == null)
            throw new IllegalStateException();
        loc.x = x;
        loc.y = y;
    }

    private static Map<String, MutablePoint> deepCopy(Map<String, MutablePoint> m){
        Map<String, MutablePoint> locs = new HashMap<>();
        for(String id:m.keySet()){
            MutablePoint loc = new MutablePoint(m.get(id));
            locs.put(id, loc);
        }
        return Collections.unmodifiableMap(locs);
    }
}
```

假设每辆车都有一个String对象来标记，同时拥有一个位置坐标（x，y）。通过一个线程读取位置，将其显示出来，vehicles.getLocations()

其他线程负责更新车辆的位置。vehicles.setLocation(id, x, y);

由于存在并发访问，必须是线程安全的，因此使用了监视器模式，确保了线程的安全。尽管MutablePoint不是线程安全的，但是可变的Point并没有被发布。当返回车辆位置时，通过deepCopy方法来复制当前的位置。因此MonitorVehicleTracker是线程安全的。通过复制可变数据类维持线程安全。可能存在一些问题，如性能问题，不能实时反映车辆位置，因为返回的是快照。

# 线程安全性的委托

如果类中的各个组件都是线程安全的，那么是否还需要额外的线程安全层？

需要看情况。在某些情况下，通过线程安全类组合而成的类是线程安全的，称之为线程安全性的委托。

## 代码

```java
class Point{
    public final int x,y;
    public Point(int x, int y){
        this.x=x;
        this.y=y;
    }

}

public class MonitorVehicleTracker{
    private final ConcurrentHashMap<String, Point> locations;
    private final Map<String, Point> unModifiableMap;

    public MonitorVehicleTracker(Map<String, Point> locations){
        this.locations = new ConcurrentHashMap<>(locations);
        unModifiableMap = Collections.unmodifiableMap(this.locations);
    }

    public Map<String, Point> getLocations(){
        return unModifiableMap;
    }

    public void setLocation(String id, int x, int y){
        if(locations.replace(id, new Point(x, y)) == null)
            throw new IllegalStateException();
    }
}
```

我们只是将最初的可变MutablePoint类变成不可变的Poient，不可变的值可以自由的分享和发布，因此返回的locattion不需要复制。

使用了线程安全的ConcurrentHashMap来管理，因此没有使用显示的同步，同时确保了线程安全。将线程安全委托给ConcurrentHashMap。

## 委托给独立的状态变量

上面我们都是委托给单个线程安全的状态变量。我们也可以委托给多个状态变量，但是这些变量必须是彼此独立的，即组合后的类在多个状态变量上没有任何不变性条件。

## 委托失效

大多数组合对象存在着某些不变性条件。会导致委托失效，非线程安全。

```java
public class NumberRange{
    //lower <= upper
    private final AtomicInteger lower = new AtomicInteger(0);
    private final AtomicInteger upper = new AtomicInteger(0);

    public void setLower(int i){
        if(i > upper.get())
            throw new IllegalArgumentException();
        lower.set(i);
    }
    public void setUpper(int i){
        if(i < lower.get())
            throw new IllegalArgumentException();
        upper.set(i);
    }
    public boolean isInRange(int i){
        return (i >= lower.get()) && i <= upper.get();
    }
}
```

NumberRange不是线程安全的，因为进行了先检查后执行操作，并且这个操作不是原子性的，破坏了上下界进行约束的不变性条件。setLower和setUper都尝试维持不变条件，但是失败了。我们可以通过加锁机制来维护不变性条件来确保线程安全性。因此类似的符合操作，仅靠委托无法实现线程安全。

如果一个状态变量是线程安全的，并且没有任何不变性条件来约束，也不存在无效的状态转换，那么就可以安全的发布这个变量。

# 在现有的线程安全类中添加功能

## 如何添加新的方法

对一个线程安全的类添加原子操作，但是，这通常做不到，因为无法修改源代码。

我们可以扩展这个类，例如BetterVector对Vector进行了扩展，添加一个原子方法，putIfAbsent()。

```java
public class BetterVertor<E> extends Vector<E>{
    public synchronized boolean putIfAbsent(E x){
        boolean absent = !contains(x);
        if(absent)
            add(x);
        return absent;
    }
}
```

上述示例之所以线程安全，是因为Vector将状态向子类公开，并且规范中定义了同步策略。

### 如何拓展 final 类

如果一个类时 final，则无法直接继承。

可以让新的类和想拓展的类继承同一个接口，使用组合的方式，实现一遍 final 类的方法。

然后再进行拓展。

## 客户端加锁机制

我们可以用第三种方式来在线程安全类中添加功能，扩展类的功能，并不扩展类的本身，将扩展代码放入辅助类中。

```java
public class ListHepler<E> {
    public List<E> list = Collections.synchronizedList(new ArrayList<E>());
    public synchronized boolean putIfAbsent(E x){
        boolean absent = !list.contains(x);
        if(absent)
            list.add(x);
        return absent;
    }
}
```

这个类看起来是线程安全的，毕竟使用了同步方法。然而这并不是线程安全的，问题在于在错误的锁上进行了同步。因为不管list使用哪个锁来保护状态，但肯定不是ListHelper上的锁。意味着putIfAbsent相对于List的其他操作并不是原子的。

要想使这个方法正确执行，必须是List在实现客户端加锁时使用同一个锁。

下面是正确的示例。

```java
public class ListHepler<E> {
    public List<E> list = Collections.synchronizedList(new ArrayList<E>());
    public boolean putIfAbsent(E x){
        synchronized(list){
            boolean absent = !list.contains(x);
            if(absent)
                list.add(x);
            return absent;
        }
    }
}
```

## 组合

还有一种方式来添加原子操作：组合。

```java
public class ImprovedList<E> {
    private final List<E> list;
    public ImprovedList(List<E> list){
        this.list = list;
    }
    public synchronized boolean putIfAbsent(E x){
        boolean absent = !list.contains(x);
        if(absent)
            list.add(x);
        return absent;
    }
　　pubic sunchronized void otherMethod(){
        ...
    }
}
```

客户端并不会直接使用list这个对象，因此并不关心list是否是线程安全的，ImprovedList通过自身内置锁增加了一层额外的锁。

事实上，我们使用了监视器模式封装了现有的list。只要确保客户端代码不直接使用list就能确保线程安全性。

ps: 这种方式很巧妙，可以让我们不用关心到底应该使用哪个对象的锁。


# 同步策略文档化

应该有成熟的文档。

这是一件相对容易做到，且性价比比较高，却很少人去做的事。

就连Java类库的官方文档做得都不是很好。比如说，直到JDK1.4，java官方文档才说明java.text.SimpleDateFormat不是线程安全的，把程序员们吓尿了。

我们起码应该做到两件事：

1. 记录线程安全的保证给client看。

2. 记录线程安全的策略/机制给维护者看。

# 参考资料

- 设计线程安全的类

[Java 并发编程（三）设计线程安全的类-实例封闭](https://blog.csdn.net/zq602316498/article/details/40143437)

[设计线程安全的类--对象的组合](https://www.cnblogs.com/lilinwei340/p/6942317.html)

* any list
{:toc}