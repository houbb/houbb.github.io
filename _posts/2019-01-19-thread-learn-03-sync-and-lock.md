---
layout: post
title: 轻松学习多线程 03-多线程的同步与锁
date:  2019-1-19 11:21:15 +0800
categories: [Thread]
tags: [thread, java, sh]
published: true
---

# 问题的出现

上代码

```
public class Num {
    private int num;

    public int getNum() {
        return num;
    }

    public int add(int num) {
        this.num += num;
        return this.num;
    }
}
```

测试类

```
public class ErrorDemo implements Runnable {
    private Num num = new Num();

    @Override
    public void run() {
        for(int i = 0; i < 3; i++) {
            try {
                Thread.sleep(1000);
                num.add(10);
                System.out.println(Thread.currentThread().getName()+" value is " + num.getNum());
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    public static void main(String[] args) {
        Runnable runnable = new ErrorDemo();
        Thread thread = new Thread(runnable, "thread-01");
        Thread thread2 = new Thread(runnable, "thread-02");

        thread.start();
        thread2.start();
    }
}

```
结果
```
thread-01 value is 20
thread-02 value is 20
thread-02 value is 40
thread-01 value is 40
thread-02 value is 50
thread-01 value is 60

Process finished with exit code 0
```

> 这个结果是不准确的。原因是**多个线程不加限制的共同操作同一个数据导致**。
> 
> 该怎么解决这个问题呢？

#线程的同步
>知道导致问题的原因，解决起来也不是很困难。
>我们可以限制：**每次只有一个线程可以操作数据**
>具体实现一般需满足以下2个条件
> 
 - 将竞争访问的资源变量设置为private
 - 使用关键字synchronized同步修改变量的代码


##同步方法
对ErrorDemo中的run()加上关键字

```
@Override
    public synchronized void run() {
        for(int i = 0; i < 3; i++) {
            try {
                Thread.sleep(1000);
                num.add(10);
                System.out.println(Thread.currentThread().getName()+" value is " + num.getNum());
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
```
结果：

```
thread-01 value is 10
thread-01 value is 20
thread-01 value is 30
thread-02 value is 40
thread-02 value is 50
thread-02 value is 60

Process finished with exit code 0
```

##同步代码块
上面的同步方法，也可以写成

```
@Override
    public void run() {
        for(int i = 0; i < 3; i++) {
            try {
                synchronized (this) {
                    Thread.sleep(1000);
                    num.add(10);
                    System.out.println(Thread.currentThread().getName()+" value is " + num.getNum());
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
```

> 注意
> 
> - 如果是同步静态方法，代码块中，this应替换成className.class
> - java.util.concurrent.locks Lock接口也可完成类似功能，且思路更为清晰。

# 相关内容

[线程-001-线程简介](http://blog.csdn.net/ryo1060732496/article/details/51151809)

[线程-002-基本的线程机制](http://blog.csdn.net/ryo1060732496/article/details/51154746)

[线程-003-线程的同步与锁](http://blog.csdn.net/ryo1060732496/article/details/51184874)

[线程-004-线程间的协作及状态迁移](http://blog.csdn.net/ryo1060732496/article/details/79377105)

* any list
{:toc}