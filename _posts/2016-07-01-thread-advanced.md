---
layout: post
title: Thread Advanced
date:  2016-07-02 16:57:06 +0800
categories: [Java]
tags: [thread]
published: true
---

* any list
{:toc}


# Guarded Blocks

Threads often have to coordinate their actions. The most common coordination idiom is the *guarded block*.
Such a block begins by polling a condition that must be true before the block can proceed. There are a number of steps to follow in order to do this correctly.


Let's use guarded blocks to create a Producer-Consumer application.

- Drop.java

```java
public class Drop {
    private String message;
    private boolean isEmpty = true;

    public synchronized void put(String message) {
        //wait if has message.
        while (!isEmpty) {
            try {
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        this.message = message;
        isEmpty = false;

        notifyAll();

    }

    public synchronized String take() {
        //wait if no message.
        while(isEmpty) {
            try {
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        isEmpty = true;
        notifyAll();

        return message;
    }
}
```

- Productor.java

```java
public class Productor implements Runnable {
    private Drop drop;

    public Productor(Drop drop) {
        this.drop = drop;
    }

    @Override
    public void run() {
        String importantInfo[] = {
                "Mares eat oats",
                "Does eat oats",
                "Little lambs eat ivy",
                "A kid will eat ivy too"
        };
        Random random = new Random();

        for (String anImportantInfo : importantInfo) {
            drop.put(anImportantInfo);
            try {
                Thread.sleep(random.nextInt(5000));
            } catch (InterruptedException e) {
                System.out.println("InterruptedException of Productor");
            }
        }

        drop.put("DONE");
    }
}
```

- Consumer.java

```java
public class Consumer implements Runnable {
    private Drop drop;

    public Consumer(Drop drop) {
        this.drop = drop;
    }

    @Override
    public void run() {
        Random random = new Random();
        for (String message = drop.take();
             ! message.equals("DONE");
             message = drop.take()) {
            System.out.format("MESSAGE RECEIVED: %s%n", message);
            try {
                Thread.sleep(random.nextInt(5000));
            } catch (InterruptedException e) {
                System.out.println("InterruptedException of Consumer");
            }
        }
    }
}
```

- test

```java
public static void main(String[] args) {
    Drop drop = new Drop();
    (new Thread(new Productor(drop))).start();
    (new Thread(new Consumer(drop))).start();
}
```

# Immutable Objects

An object is considered immutable if its state cannot change after it is constructed.

## Synchronized Class

```java
public class SynchronizedRGB {
    private String name;
    private int red;
    private int green;
    private int blue;

    public SynchronizedRGB(int red,
                           int green,
                           int blue,
                           String name) {
        check(red, green, blue);
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.name = name;
    }
    private void check(int red, int green, int blue) {
        if(!isInRange(red) || !isInRange(green) || !isInRange(blue)) {
            throw new IllegalArgumentException();
        }
    }
    private boolean isInRange(int colorValue) {
        return 0 <= colorValue && colorValue >= 255;
    }

    public void setRGB(int red,
                    int green,
                    int blue,
                    String name) {
        check(red, green, blue);
        synchronized (this) {
            this.red = red;
            this.green = green;
            this.blue = blue;
            this.name = name;
        }
    }

    public synchronized int getRGB() {
        return ((red << 16) | (green << 8) | blue);
    }

    public synchronized String getName() {
        return name;
    }

    public synchronized void invert() {
        red = 255 - red;
        green = 255 - green;
        blue = 255 - blue;
        name = name + "Inverse";
    }
}
```

SynchronizedRGB must be used carefully to avoid being seen in an inconsistent state. Suppose, for example, a thread executes the following code:

```java
SynchronizedRGB color =
    new SynchronizedRGB(0, 0, 0, "Pitch Black");
//...
int myColorInt = color.getRGB();      //Statement 1
String myColorName = color.getName(); //Statement 2
```

If another thread invokes color.set after Statement 1 but before Statement 2, the value of myColorInt won't match the value of myColorName. To avoid this outcome, the two statements must be bound together:

```java
synchronized (color) {
    int myColorInt = color.getRGB();
    String myColorName = color.getName();
}
```

This kind of inconsistency is only possible for mutable objects — it will not be an issue for the immutable version of SynchronizedRGB.

## Define Immutable Object

The following rules define a simple strategy for creating immutable objects.

1. Don't provide "setter" methods — methods that modify fields or objects referred to by fields.
2. Make all fields **final and private**.
3. Don't allow subclasses to override methods. The simplest way to do this is to declare the class as ```final```.
A more sophisticated approach is to make the **constructor private** and construct instances in factory methods.
4. If the instance fields include references to mutable objects, don't allow those objects to be changed:
- Don't provide methods that modify the mutable objects.
- Don't share references to the mutable objects. Never store references to external, mutable objects passed to the constructor;
if necessary, create copies, and store references to the copies. Similarly, create copies of your internal mutable objects when necessary to avoid returning the originals in your methods.

- ImmutableRGB.java

```java
public class ImmutableRGB {
    final private String name;
    final private int red;
    final private int green;
    final private int blue;

    public ImmutableRGB(int red,
                        int green,
                        int blue,
                        String name) {
        check(red, green, blue);
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.name = name;
    }

    private void check(int red, int green, int blue) {
        if(!isInRange(red) || !isInRange(green) || !isInRange(blue)) {
            throw new IllegalArgumentException();
        }
    }
    private boolean isInRange(int colorValue) {
        return 0 <= colorValue && colorValue >= 255;
    }


    public synchronized int getRGB() {
        return ((red << 16) | (green << 8) | blue);
    }

    public synchronized String getName() {
        return name;
    }

    public ImmutableRGB invert() {
        return new ImmutableRGB(255 - red,
                255 - green,
                255 - blue,
                "Inverse of " + name);
    }
}
```








