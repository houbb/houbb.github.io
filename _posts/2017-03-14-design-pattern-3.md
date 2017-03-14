---
layout: post
title: Design Pattern-03 observer
date:  2017-03-14 19:52:28 +0800
categories: [Design Pattern]
tags: [design pattern, observer]
published: true
---

# Observer 

**观察者模式**隶属于系统解耦(System decoupling)。

和其它形式的回调函数(callback)类似,Observer 模式也允许你通过挂钩程序 (hook point)改变代码。
不同之处在于,从本质上说,Observer 模式是**完全动态**的。
它经常被用于需要根据其它对象的状态变化来改变自身(状态)的场合,而且它 还经常是事件管理系统(event management)的基本组成部分。无论什么时候,当你需要用完全动态的方式分离呼叫源和被呼叫代码的时候,(Observer 模式都是你的首选)。

Observer 模式解决的是一个相当常见的问题:
**当某个对象改变状态的时候,另外 一组(与之相关的)对象如何更新它们自己。**


# 简介

一、意图

定义对象间的一种一对多的依赖关系 ,当一个对象的状态发生改变时, 所有依赖于它的对象都得到通知并被自动更新。

二、别名

依赖(Dependents), 发布-订阅(Publish-Subscribe)

三、适用性

- 当一个抽象模型有两个方面 , 其中一个方面依赖于另一方面。将这二者封装在独立的对象中以使它们可以各自独立地改变和复用。

- 当对一个对象的改变需要同时改变其它对象 , 而不知道具体有多少对象有待改变。

- 当一个对象必须通知其它对象,而它又不能假定其它对象是谁。换言之, 你不希望这些对象是紧密耦合的。


四、结构


![struct]({{ site.url }}/static/app/img/designpattern/2017-03-13-design-pattern-observer.png)

五、参与者

1、Observable Subject(目标)

- 目标知道它的观察者。可以有任意多个观察者观察同一个目标。

- 提供注册和删除观察者对象的接口。 

2、Observer(观察者)

- 为那些在目标发生改变时需获得通知的对象定义一个更新接口。
 
3、ConcreteSubject(具体目标)

- 将有关状态存入各ConcreteObserver对象。

- 当它的状态发生改变时 , 向它的各个观察者发出通知。 

4、ConcreteObserver(具体观察者)

- 维护一个指向ConcreteSubject对象的引用。

- 存储有关状态,这些状态应与目标的状态保持一致。

- 实现Observer的更新接口以使自身状态与目标的状态保持一致。

六、 协作

当ConcreteSubject发生任何可能导致其观察者与其本身状态不一致的改变时,它将通知它的各个观察者。

- 在得到一个具体目标的改变通知后 , ConcreteObserver 对象可向目标对象查询信息。

- ConcreteObserver使用这些信息以使它的状态与目标对象的状态一致。

注意发出改变请求的 Observer对象并不立即更新 ,而是将其推迟到它从目标得到一个通知 之后。 Notify不总是由目标对象调用。它也可被一个观察者或其它对象调用。

(下图请忽略时序，并不严格按照此执行顺序)

![SequenceDiagram]({{ site.url }}/static/app/img/designpattern/2017-03-13-observer-SequenceDiagram.png)


七、效果

Observer模式允许你独立的改变目标和观察者。你可以单独复用目标对象而无需同时复用其观察者, 反之亦然。它也使你可以在不改动目标和其他的观察者的前提下增加观察者。

下面是观察者模式其它一些优缺点 :

1) 目标和观察者间的抽象耦合

2) 支持广播通信
 
3) 意外的更新
 
因为一个观察者并不知道其它观察者的存在, 它可能对改变目标的最终代价一无所知。在目标上一个看似无害的的操作可能会引起一系列对观察者以及依赖于这些观察者的那些对象的更新。

此外, 如果依赖准则的定义或维护不当,常常会引起错误的更新,这 种错误通常很难捕捉。


# 概念讲解

（没进行处理，可直接看代码。不理解再回来看解析。）

比如说,Smalltalk 里的“model-view” 结构,(它是 MVC(model-view-controller)结构的一部分),再比如基本与之相当的 “文档-视图(document-view)”结构。
假设说你有一些数据(也就是“文档”)和多于一个的视图,比如说是一个图表(plot)和一个文本视图。当你改变数据的时候,这两个视图必须知道进而(根据需要)更新它们自己,这也就是 Observer 模式所 要帮你解决的问题。
这个问题是如此的常见,以至于它的解决办法已经成了标准 java.util 库的一部分。


实际上,Observer 模式真正变化的有两样东西:观察者(observing objects)的 数量和它们如何更新自己。也就是说,observer 模式使得你在不必改动其它代码的情 况下只针对这两种变化更改代码。

Observer 实际上是只有一个成员函数的接口类,这个成员函数就是 update()。 

当被观察者决定更新所有的观察者的时候,它就调用 update()函数。是否需要传递参 数是可选的; 即使是没有参数的 update()函数也同样符合 observer 模式;
但是,更通常的做法是让被观察者(通过 update( )函数)把引起更新的对象(也就是它自己)和其它有用的信息传递给观察者, 
因为一个观察者可能会注册到多于一个的被观察者。这样,观察者对象就不用再费劲查找是哪个被观察者引起的更新,并且它所 需要的信息也已经传递过来。
决定何时以及如何发起更新(updating)的那个“被观察者对象”被命名为 Observable。


Observable 类用一个标志(flag)来指示它自己是否改变。
对于比较简单的设计 来说,不用 flag 也是可以的;如果有变化,就通知所有的观察者。
如果用 flag 的 话,你可以使通知的时间延迟,并且由你来决定只在合适的时候通知观察者。

但是, 请注意,控制 flag 状态的方法是受保护的(protected),也就是说,只有 (Observable 类的)派生类可以决定哪些东西可以构成一个变化,而不是由 Observer 派生类的最终用户来决定。

大多数工作是在 notifyObservers() 这个方法里完成的。如果没有将 flag 置为 “已改变”, 那 notifyObservers( )什么也不做;
否则,它先清除 flag 的“已改变” 状态,从而避免重复调用 notifyObservers( )的时候浪费时间。

这些要在通知观察者 之前完成,为了避免对于 update( )的调用有可能引起被观察对象的一个反向的改变。


然后 notifyObservers()方法就遍历它所保存的观察者序列,并且调用每个观察者 的 update()成员函数。
初看起来,似乎可以用一个普通的 Observable 对象来管理更新。但是实际上办不到;
为了达到这个效果,你必须继承 Observable 类,并且在派生类的代码里调用 setChanged()方法。

它就是用来将 flag 置为“已改变”的那个成员函数,这么一来,当你调用 notifyObservers()的时候所有的观察者都会被准确无误的通知道。在 什么地方调用 setChanged(),这取决于你程序的逻辑结构。


# 实例

> ObserverFlowerTest.java

```java
package com.ryo.design.pattern.observer;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Test;

/**
 * Flower Tester.
 *
 * @author houbinbin
 * @version 1.0
 * @since 03/14/2017
 */
public class FlowerTest {

    static final Logger LOGGER = LogManager.getLogger(FlowerTest.class);

//    21:19:18.746 [main] INFO  com.ryo.design.pattern.observer.FlowerTest - flower first open...
//    HummingBird two's breakfast time!
//    HummingBird one's breakfast time!
//    Bee two's breakfast time!
//    Bee one's breakfast time!
//    21:19:18.748 [main] INFO  com.ryo.design.pattern.observer.FlowerTest - flower second open...
//    21:19:18.748 [main] INFO  com.ryo.design.pattern.observer.FlowerTest - flower first close...
//    HummingBird two's bed time!
//    HummingBird one's bed time!
//    Bee two's bed time!
    @Test
    public void ObserverFlowerTest()
    {

        Flower flower = new Flower();
        Bee beeOne = new Bee("one");
        Bee beeTwo = new Bee("two");

        HummingBird hummingBirdOne = new HummingBird("one");
        HummingBird hummingBirdTwo = new HummingBird("two");


        //添加花开的观察者
        flower.getOpenNotifier().addObserver(beeOne.getOpenObserver());
        flower.getOpenNotifier().addObserver(beeTwo.getOpenObserver());
        flower.getOpenNotifier().addObserver(hummingBirdOne.getOpenObserver());
        flower.getOpenNotifier().addObserver(hummingBirdTwo.getOpenObserver());


        //添加花落的观察者
        flower.getCloseNotifier().addObserver(beeOne.getCloseObserver());
        flower.getCloseNotifier().addObserver(beeTwo.getCloseObserver());
        flower.getCloseNotifier().addObserver(hummingBirdOne.getCloseObserver());
        flower.getCloseNotifier().addObserver(hummingBirdTwo.getCloseObserver());



        LOGGER.info("flower first open...");
        flower.open();
        LOGGER.info("flower second open...");
        flower.open();


        LOGGER.info("flower first close...");
        flower.getCloseNotifier().deleteObserver(beeOne.getCloseObserver());    //删除一个观察者
        flower.close();

    }
}
```

- Flower.java

```java
package com.ryo.design.pattern.observer;

import java.util.Observable;

/**
 * @author houbinbin
 * @version 1.0
 * @on 17/3/14
 * @since 1.7
 */
public class Flower {


    /**
     * 标志当前花是否开放
     */
    private boolean isOpen;

    private OpenNotifier openNotifier = new OpenNotifier();

    private CloseNotifier closeNotifier = new CloseNotifier();

    /**
     * 默认花不开
     */
    public Flower() {
        isOpen = false;
    }


    //---------Getter START---------------
    public Observable getOpenNotifier() {
        return openNotifier;
    }

    public Observable getCloseNotifier() {
        return closeNotifier;
    }
    //---------Getter END---------------


    /**
     * 花开
     */
    public void open() {
        isOpen = true;
        openNotifier.notifyObservers(); //通知所有观察者， 花开了。
        closeNotifier.open();   //重置状态
    }

    /**
     * 花落
     */
    public void close() {
        isOpen = false;
        closeNotifier.notifyObservers();
        openNotifier.close();   //重置状态
    }

    /**
     * 花开通知器
     */
    private class OpenNotifier extends Observable {

        private boolean alreadyOpen = false;

        //从花未开变成了花开
        public void notifyObservers() {
            if (isOpen && !alreadyOpen) {
                setChanged();
                super.notifyObservers();
                alreadyOpen = true;
            }
        }

        public void close() {
            alreadyOpen = false;
        }
    }

    /**
     * 花落通知器
     */
    private class CloseNotifier extends Observable {

        private boolean alreadyClosed = false;

        /**
         * 从花落变成了花开
         */
        public void notifyObservers() {
            if (!isOpen && !alreadyClosed) {
                setChanged();
                super.notifyObservers();
                alreadyClosed = true;
            }
        }

        public void open() {
            alreadyClosed = false;
        }
    }
}
```

- Bee.java

```java
package com.ryo.design.pattern.observer;

import java.util.Observable;
import java.util.Observer;

/**
 * @author houbinbin
 * @version 1.0
 * @on 17/3/14
 * @see Flower
 * @since 1.7
 */
public class Bee {

    /**
     * 小蜜蜂的名字
     */
    private String name;

    private Observer openObserver = new OpenObserver();

    private Observer closeObserver = new CloseObserver();

    public Bee(String name) {
        this.name = name;
    }


    // An inner class for observing openings:
    private class OpenObserver implements Observer {
        public void update(Observable ob, Object a) {
            System.out.println("Bee " + name
                    + "'s breakfast time!");
        }
    }

    // Another inner class for closings:
    private class CloseObserver implements Observer {
        public void update(Observable ob, Object a) {
            System.out.println("Bee " + name
                    + "'s bed time!");
        }
    }

    public Observer getOpenObserver() {
        return openObserver;
    }

    public Observer getCloseObserver() {
        return closeObserver;
    }
}
```

- HummingBird.java

```java
package com.ryo.design.pattern.observer;

import java.util.Observable;
import java.util.Observer;

/**
 * @author houbinbin
 * @version 1.0
 * @on 17/3/14
 * @see Flower
 * @since 1.7
 */
public class HummingBird {

    /**
     * 蜂鸟的名字
     */
    private String name;

    private Observer openObserver = new OpenObserver();

    private Observer closeObserver = new CloseObserver();

    public HummingBird(String name) {
        this.name = name;
    }


    // An inner class for observing openings:
    private class OpenObserver implements Observer {
        public void update(Observable ob, Object a) {
            System.out.println("HummingBird " + name
                    + "'s breakfast time!");
        }
    }

    // Another inner class for closings:
    private class CloseObserver implements Observer {
        public void update(Observable ob, Object a) {
            System.out.println("HummingBird " + name
                    + "'s bed time!");
        }
    }

    public Observer getOpenObserver() {
        return openObserver;
    }

    public Observer getCloseObserver() {
        return closeObserver;
    }
}
```


- Observable.java

这个类还在用 Vector。到JDK1.8还是没改。

```java
/*
 * Copyright (c) 1994, 2012, Oracle and/or its affiliates. All rights reserved.
 * ORACLE PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */

package java.util;

/**
 * This class represents an observable object, or "data"
 * in the model-view paradigm. It can be subclassed to represent an
 * object that the application wants to have observed.
 * <p>
 * An observable object can have one or more observers. An observer
 * may be any object that implements interface <tt>Observer</tt>. After an
 * observable instance changes, an application calling the
 * <code>Observable</code>'s <code>notifyObservers</code> method
 * causes all of its observers to be notified of the change by a call
 * to their <code>update</code> method.
 * <p>
 * The order in which notifications will be delivered is unspecified.
 * The default implementation provided in the Observable class will
 * notify Observers in the order in which they registered interest, but
 * subclasses may change this order, use no guaranteed order, deliver
 * notifications on separate threads, or may guarantee that their
 * subclass follows this order, as they choose.
 * <p>
 * Note that this notification mechanism has nothing to do with threads
 * and is completely separate from the <tt>wait</tt> and <tt>notify</tt>
 * mechanism of class <tt>Object</tt>.
 * <p>
 * When an observable object is newly created, its set of observers is
 * empty. Two observers are considered the same if and only if the
 * <tt>equals</tt> method returns true for them.
 *
 * @author  Chris Warth
 * @see     java.util.Observable#notifyObservers()
 * @see     java.util.Observable#notifyObservers(java.lang.Object)
 * @see     java.util.Observer
 * @see     java.util.Observer#update(java.util.Observable, java.lang.Object)
 * @since   JDK1.0
 */
public class Observable {
    private boolean changed = false;
    private Vector<Observer> obs;

    /** Construct an Observable with zero Observers. */

    public Observable() {
        obs = new Vector<>();
    }

    /**
     * Adds an observer to the set of observers for this object, provided
     * that it is not the same as some observer already in the set.
     * The order in which notifications will be delivered to multiple
     * observers is not specified. See the class comment.
     *
     * @param   o   an observer to be added.
     * @throws NullPointerException   if the parameter o is null.
     */
    public synchronized void addObserver(Observer o) {
        if (o == null)
            throw new NullPointerException();
        if (!obs.contains(o)) {
            obs.addElement(o);
        }
    }

    /**
     * Deletes an observer from the set of observers of this object.
     * Passing <CODE>null</CODE> to this method will have no effect.
     * @param   o   the observer to be deleted.
     */
    public synchronized void deleteObserver(Observer o) {
        obs.removeElement(o);
    }

    /**
     * If this object has changed, as indicated by the
     * <code>hasChanged</code> method, then notify all of its observers
     * and then call the <code>clearChanged</code> method to
     * indicate that this object has no longer changed.
     * <p>
     * Each observer has its <code>update</code> method called with two
     * arguments: this observable object and <code>null</code>. In other
     * words, this method is equivalent to:
     * <blockquote><tt>
     * notifyObservers(null)</tt></blockquote>
     *
     * @see     java.util.Observable#clearChanged()
     * @see     java.util.Observable#hasChanged()
     * @see     java.util.Observer#update(java.util.Observable, java.lang.Object)
     */
    public void notifyObservers() {
        notifyObservers(null);
    }

    /**
     * If this object has changed, as indicated by the
     * <code>hasChanged</code> method, then notify all of its observers
     * and then call the <code>clearChanged</code> method to indicate
     * that this object has no longer changed.
     * <p>
     * Each observer has its <code>update</code> method called with two
     * arguments: this observable object and the <code>arg</code> argument.
     *
     * @param   arg   any object.
     * @see     java.util.Observable#clearChanged()
     * @see     java.util.Observable#hasChanged()
     * @see     java.util.Observer#update(java.util.Observable, java.lang.Object)
     */
    public void notifyObservers(Object arg) {
        /*
         * a temporary array buffer, used as a snapshot of the state of
         * current Observers.
         */
        Object[] arrLocal;

        synchronized (this) {
            /* We don't want the Observer doing callbacks into
             * arbitrary code while holding its own Monitor.
             * The code where we extract each Observable from
             * the Vector and store the state of the Observer
             * needs synchronization, but notifying observers
             * does not (should not).  The worst result of any
             * potential race-condition here is that:
             * 1) a newly-added Observer will miss a
             *   notification in progress
             * 2) a recently unregistered Observer will be
             *   wrongly notified when it doesn't care
             */
            if (!changed)
                return;
            arrLocal = obs.toArray();
            clearChanged();
        }

        for (int i = arrLocal.length-1; i>=0; i--)
            ((Observer)arrLocal[i]).update(this, arg);
    }

    /**
     * Clears the observer list so that this object no longer has any observers.
     */
    public synchronized void deleteObservers() {
        obs.removeAllElements();
    }

    /**
     * Marks this <tt>Observable</tt> object as having been changed; the
     * <tt>hasChanged</tt> method will now return <tt>true</tt>.
     */
    protected synchronized void setChanged() {
        changed = true;
    }

    /**
     * Indicates that this object has no longer changed, or that it has
     * already notified all of its observers of its most recent change,
     * so that the <tt>hasChanged</tt> method will now return <tt>false</tt>.
     * This method is called automatically by the
     * <code>notifyObservers</code> methods.
     *
     * @see     java.util.Observable#notifyObservers()
     * @see     java.util.Observable#notifyObservers(java.lang.Object)
     */
    protected synchronized void clearChanged() {
        changed = false;
    }

    /**
     * Tests if this object has changed.
     *
     * @return  <code>true</code> if and only if the <code>setChanged</code>
     *          method has been called more recently than the
     *          <code>clearChanged</code> method on this object;
     *          <code>false</code> otherwise.
     * @see     java.util.Observable#clearChanged()
     * @see     java.util.Observable#setChanged()
     */
    public synchronized boolean hasChanged() {
        return changed;
    }

    /**
     * Returns the number of observers of this <tt>Observable</tt> object.
     *
     * @return  the number of observers of this object.
     */
    public synchronized int countObservers() {
        return obs.size();
    }
}
```

- Observer.java

```java
/*
 * Copyright (c) 1994, 1998, Oracle and/or its affiliates. All rights reserved.
 * ORACLE PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 */
package java.util;

/**
 * A class can implement the <code>Observer</code> interface when it
 * wants to be informed of changes in observable objects.
 *
 * @author  Chris Warth
 * @see     java.util.Observable
 * @since   JDK1.0
 */
public interface Observer {
    /**
     * This method is called whenever the observed object is changed. An
     * application calls an <tt>Observable</tt> object's
     * <code>notifyObservers</code> method to have all the object's
     * observers notified of the change.
     *
     * @param   o     the observable object.
     * @param   arg   an argument passed to the <code>notifyObservers</code>
     *                 method.
     */
    void update(Observable o, Object arg);
}
```

> [c#](http://www.cnblogs.com/libingql/p/3638453.html)

C# 建议使用事件监听机制。没必要使用此传统方式。

* any list
{:toc}





