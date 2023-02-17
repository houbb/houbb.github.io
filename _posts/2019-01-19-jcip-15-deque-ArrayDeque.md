---
layout: post
title:  JCIP-15-双端队列之 ArrayDeque
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, lock, data-struct, sh]
published: true
excerpt: JCIP-15-双端队列之 ArrayDeque
---

# ArrayDeque

ArrayDeque不是线程安全的。 

ArrayDeque不可以存取null元素，因为系统根据某个位置是否为null来判断元素的存在。 

当作为栈使用时，性能比Stack好；当作为队列使用时，性能比LinkedList好。 

## 特性

- 无容量大小限制，容量按需增长；

- 非线程安全队列，无同步策略，不支持多线程安全访问；

- 当用作栈时，性能优于Stack，当用于队列时，性能优于LinkedList

- 两端都可以操作

- 具有fail-fast特征

- 不能存储null

- 支持双向迭代器遍历

# 常用方法

## 1.添加元素

addFirst(E e)在数组前面添加元素

addLast(E e)在数组后面添加元素

offerFirst(E e) 在数组前面添加元素，并返回是否添加成功

offerLast(E e) 在数组后天添加元素，并返回是否添加成功

## 2.删除元素

removeFirst() 删除第一个元素，并返回删除元素的值,如果元素为null，将抛出异常

pollFirst() 删除第一个元素，并返回删除元素的值，如果元素为null，将返回null

removeLast() 删除最后一个元素，并返回删除元素的值，如果为null，将抛出异常

pollLast() 删除最后一个元素，并返回删除元素的值，如果为null，将返回null

removeFirstOccurrence(Object o) 删除第一次出现的指定元素

removeLastOccurrence(Object o) 删除最后一次出现的指定元素

## 3.获取元素

getFirst() 获取第一个元素,如果没有将抛出异常

getLast() 获取最后一个元素，如果没有将抛出异常

## 4.队列操作

add(E e) 在队列尾部添加一个元素

offer(E e) 在队列尾部添加一个元素，并返回是否成功

remove() 删除队列中第一个元素，并返回该元素的值，如果元素为null，将抛出异常(其实底层调用的是removeFirst())

poll()  删除队列中第一个元素，并返回该元素的值,如果元素为null，将返回null(其实调用的是pollFirst())

element() 获取第一个元素，如果没有将抛出异常

peek() 获取第一个元素，如果返回null

## 5.栈操作

push(E e) 栈顶添加一个元素

pop(E e) 移除栈顶元素,如果栈顶没有元素将抛出异常

## 6.其他

size() 获取队列中元素个数

isEmpty() 判断队列是否为空

iterator() 迭代器，从前向后迭代

descendingIterator() 迭代器，从后向前迭代

contain(Object o) 判断队列中是否存在该元素

toArray() 转成数组

clear() 清空队列

clone() 克隆(复制)一个新的队列

## 使用入门测试

```java
public class DequeTest {
    public static void main(String[] args){
        // 初始化容量为4
        ArrayDeque<String> arrayDeque = new ArrayDeque<>(4);
        //添加元素
        arrayDeque.add("A");
        arrayDeque.add("B");
        arrayDeque.add("C");
        arrayDeque.add("D");
        arrayDeque.add("E");
        arrayDeque.add("F");
        arrayDeque.add("G");
        arrayDeque.add("H");
        arrayDeque.add("I");
        System.out.println(arrayDeque);

        // 获取元素
        String a = arrayDeque.getFirst();
        String a1 = arrayDeque.pop();
        String b = arrayDeque.element();
        String b1 = arrayDeque.removeFirst();
        String c = arrayDeque.peek();
        String c1 = arrayDeque.poll();
        String d = arrayDeque.pollFirst();
        String i = arrayDeque.pollLast();
        String e = arrayDeque.peekFirst();
        String h = arrayDeque.peekLast();
        String h1 = arrayDeque.removeLast();
        System.out.printf("a = %s, a1 = %s, b = %s, b1 = %s, c = %s, c1 = %s, d = %s, i = %s, e = %s, h = %s, h1 = %s", a,a1,b,b1,c,c1,d,i,e,h,h1);
        System.out.println();
        
        // 添加元素
        arrayDeque.push(e);
        arrayDeque.add(h);
        arrayDeque.offer(d);
        arrayDeque.offerFirst(i);
        arrayDeque.offerLast(c);
        arrayDeque.offerLast(h);
        arrayDeque.offerLast(c);
        arrayDeque.offerLast(h);
        arrayDeque.offerLast(i);
        arrayDeque.offerLast(c);
        System.out.println(arrayDeque);

        // 移除第一次出现的C
        arrayDeque.removeFirstOccurrence(c);
        System.out.println(arrayDeque);

        // 移除最后一次出现的C
        arrayDeque.removeLastOccurrence(c);
        System.out.println(arrayDeque);
        
    }
}
```

- 输出日志

```
[A, B, C, D, E, F, G, H, I]
a = A, a1 = A, b = B, b1 = B, c = C, c1 = C, d = D, i = I, e = E, h = H, h1 = H
[I, E, E, F, G, H, D, C, H, C, H, I, C]
[I, E, E, F, G, H, D, H, C, H, I, C]
[I, E, E, F, G, H, D, H, C, H, I]
```

# 卡拉兹(Callatz)猜想

## 题目

对任何一个自然数n，如果它是偶数，那么把它砍掉一半；如果它是奇数，那么把(3n+1)砍掉一半。这样一直反复砍下去，最后一定在某一步得到n=1。当我们验证卡拉兹猜想的时候，为了避免重复计算，可以记录下递推过程中遇到的每一个数。例如对n=3进行验证的时候，我们需要计算3、5、8、4、2、1，则当我们对n=5、8、4、2进行验证的时候，就可以直接判定卡拉兹猜想的真伪，而不需要重复计算，因为这4个数已经在验证3的时候遇到过了，我们称5、8、4、2是被3“覆盖”的数。我们称一个数列中的某个数n为“关键数”，如果n不能被数列中的其他数字所覆盖。

现在给定一系列待验证的数字，我们只需要验证其中的几个关键数，就可以不必再重复验证余下的数字。你的任务就是找出这些关键数字，并按从大到小的顺序输出它们。

输入格式：每个测试输入包含1个测试用例，第1行给出一个正整数K(<100)，第2行给出K个互不相同的待验证的正整数n(`1<n<=100`)的值，数字间用空格隔开。

输出格式：每个测试用例的输出占一行，按从大到小的顺序输出关键数字。数字间用1个空格隔开，但一行中最后一个数字后没有空格。

输入样例：

```
6
3 5 6 7 8 11
```

输出样例：

```
7 6
```

## 使用 Deque 来编码

```java
import java.util.ArrayDeque; 
import java.util.ArrayList; 
import java.util.Deque; 
import java.util.List; 
import java.util.Queue; 
import java.util.Scanner; 
import java.util.SortedSet; 
import java.util.TreeSet; 
  
public class PAT1005 { 
  
  public static void main(String[] args) { 
    Scanner scanner = new Scanner(System.in); 
    int numSize=scanner.nextInt(); 
    ArrayDeque<Integer> newArrayDeque=new ArrayDeque<Integer>(); 
    ArrayDeque<Integer> closeArrayDeque=new ArrayDeque<Integer>(); 
    int i; 
    while (scanner.hasNext()) {           //读取键盘输入值 
      for (i = 0; i < numSize; i++) { 
        newArrayDeque.add(scanner.nextInt()); 
          
      } 
      if (i>=numSize) { 
        break; 
      } 
    } 
    int temp; 
    for (Integer integer : newArrayDeque) {    //将非关键数存入closeArrayDeque中 
      temp=integer;  
      while (temp!=1) { 
        if (temp%2==0) { 
          temp=temp/2; 
          if (newArrayDeque.contains(temp)) { 
            closeArrayDeque.add(temp); 
          } 
            
        }else { 
          temp=(temp*3+1)/2; 
          if (newArrayDeque.contains(temp)) { 
            closeArrayDeque.add(temp); 
          } 
        } 
      } 
    } 
    SortedSet<Integer> sortedSet=new TreeSet<Integer>(); //sortedSet用于存放关键数 
    for (Integer integer : newArrayDeque) { 
      if (!closeArrayDeque.contains(integer)) { 
        sortedSet.add(integer); 
      } 
    } 
    int[] leftInt=new int[sortedSet.size()]; 
    int j=sortedSet.size()-1; 
    for (Integer integer : sortedSet) { 
      leftInt[j]=integer; 
      j--; 
    } 
    for (int j2 = 0; j2 < leftInt.length; j2++) {    //按照从大到小的顺序输出关键数 
      if (j2==leftInt.length-1) { 
        System.out.println(leftInt[j2]); 
      }else { 
        System.out.print(leftInt[j2]+" "); 
      } 
        
    } 
  } 
} 
```

# 源码分析

jdk 版本: 1.8.0_191

## 接口

```java
public class ArrayDeque<E> extends AbstractCollection<E>
                           implements Deque<E>, Cloneable, Serializable
```

## 基础属性

```java
    /**
     * The array in which the elements of the deque are stored.
     * The capacity of the deque is the length of this array, which is
     * always a power of two. The array is never allowed to become
     * full, except transiently within an addX method where it is
     * resized (see doubleCapacity) immediately upon becoming full,
     * thus avoiding head and tail wrapping around to equal each
     * other.  We also guarantee that all array cells not holding
     * deque elements are always null.
     */
    transient Object[] elements; // non-private to simplify nested class access

    /**
     * The index of the element at the head of the deque (which is the
     * element that would be removed by remove() or pop()); or an
     * arbitrary number equal to tail if the deque is empty.
     */
    transient int head;

    /**
     * The index at which the next element would be added to the tail
     * of the deque (via addLast(E), add(E), or push(E)).
     */
    transient int tail;

    /**
     * The minimum capacity that we'll use for a newly created deque.
     * Must be a power of 2.
     */
    private static final int MIN_INITIAL_CAPACITY = 8;
```

elements 用来存放元素对象，MIN_INITIAL_CAPACITY 是容器的最小初始值。

head、tail 分别是头尾指针。

## 构造器

```java
/** 
 * Constructs an empty array deque with an initial capacity
 * sufficient to hold 16 elements.
 */
public ArrayDeque() {
    elements = new Object[16];
}

/**
 * Constructs an empty array deque with an initial capacity
 * sufficient to hold the specified number of elements.
 *
 * @param numElements  lower bound on initial capacity of the deque
 */
public ArrayDeque(int numElements) {
    allocateElements(numElements);
}

/**
 * Constructs a deque containing the elements of the specified
 * collection, in the order they are returned by the collection's
 * iterator.  (The first element returned by the collection's
 * iterator becomes the first element, or <i>front</i> of the
 * deque.)
 *
 * @param c the collection whose elements are to be placed into the deque
 * @throws NullPointerException if the specified collection is null
 */
public ArrayDeque(Collection<? extends E> c) {
    allocateElements(c.size());
    addAll(c);
}
```

### allocateElements() 方法

```java
/**
 * Allocates empty array to hold the given number of elements.
 *
 * @param numElements  the number of elements to hold
 */
private void allocateElements(int numElements) {
    elements = new Object[calculateSize(numElements)];
}
```

- calculateSize()

```java
private static int calculateSize(int numElements) {
    int initialCapacity = MIN_INITIAL_CAPACITY;
    // Find the best power of two to hold elements.
    // Tests "<=" because arrays aren't kept full.
    if (numElements >= initialCapacity) {
        initialCapacity = numElements;
        initialCapacity |= (initialCapacity >>>  1);
        initialCapacity |= (initialCapacity >>>  2);
        initialCapacity |= (initialCapacity >>>  4);
        initialCapacity |= (initialCapacity >>>  8);
        initialCapacity |= (initialCapacity >>> 16);
        initialCapacity++;
        if (initialCapacity < 0)   // Too many elements, must back off
            initialCapacity >>>= 1;// Good luck allocating 2 ^ 30 elements
    }
    return initialCapacity;
}
```

位运算用的真熟练。参见 [java 位运算](https://houbb.github.io/2018/09/13/java-bit-operation)

在这系列操作中，其他位只是配角，我们只需要关注第一个不为0的位即可，假设其为第n位，先右移一位然后进行或操作，得到的结果，第n位和第n-1位肯定为1，这样就有两个位为1了，然后进行右移两位，再进行或操作，那么第n位到第n-3位一定都为1，然后右移4位，依次类推。int为32位，因此，最后只需要移动16位即可。1+2+4+8+16 = 31，所以经过这一波操作，原数字对应的二进制，操作得到的结果将是从其第一个不为0的位开始，往后的位均为1。

## 元素的插入

```java
    /**
     * Inserts the specified element at the front of this deque.
     *
     * @param e the element to add
     * @throws NullPointerException if the specified element is null
     */
    public void addFirst(E e) {
        if (e == null)
            throw new NullPointerException();
        elements[head = (head - 1) & (elements.length - 1)] = e;
        if (head == tail)
            doubleCapacity();
    }

    /**
     * Inserts the specified element at the end of this deque.
     *
     * <p>This method is equivalent to {@link #add}.
     *
     * @param e the element to add
     * @throws NullPointerException if the specified element is null
     */
    public void addLast(E e) {
        if (e == null)
            throw new NullPointerException();
        elements[tail] = e;
        if ( (tail = (tail + 1) & (elements.length - 1)) == head)
            doubleCapacity();
    }

    /**
     * Inserts the specified element at the front of this deque.
     *
     * @param e the element to add
     * @return {@code true} (as specified by {@link Deque#offerFirst})
     * @throws NullPointerException if the specified element is null
     */
    public boolean offerFirst(E e) {
        addFirst(e);
        return true;
    }
```

### 元素的定位

`elements[head = (head - 1) & (elements.length - 1)] = e` 位运算定位元素。

因为列表的大小在申请时，是 2 的次幂。这里可以使用这种高性能的运算方式获取元素的位置。

### 扩容 doubleCapacity

因为elements.length是2的幂次方，所以减一后就变成了掩码，tail如果记录的是最后一个位置，即 elements.length - 1，tail + 1 则等于elements.length，与 elements.length - 1 做与操作后，就变成了0，嗯，没错，这样就变成了一个循环数组，如果tail与head相等，则表示没有剩余空间可以存放更多元素了，则调用doubleCapacity进行扩容：


当队列满的时候进行扩容。

扩容条件：`if ( (tail = (tail + 1) & (elements.length - 1)) == head)`

扩容大小：简单粗暴，直接翻倍。

扩容方式：创建一个双倍大小的数组，元素直接拷贝过来(分别放在首尾)。



```java
/**
 * Doubles the capacity of this deque.  Call only when full, i.e.,
 * when head and tail have wrapped around to become equal.
 */
private void doubleCapacity() {
    assert head == tail;
    int p = head;
    int n = elements.length;
    int r = n - p; // number of elements to the right of p
    int newCapacity = n << 1;
    if (newCapacity < 0)
        throw new IllegalStateException("Sorry, deque too big");
    Object[] a = new Object[newCapacity];
    System.arraycopy(elements, p, a, 0, r);
    System.arraycopy(elements, 0, a, r, p);
    elements = a;
    head = 0;
    tail = n;
}
```

## 删除元素

也是通过位运算获取指定位置的元素。

然后将元素置为 null。

如果元素不存在，则直接抛出异常：NoSuchElementException

```java
    /**
     * @throws NoSuchElementException {@inheritDoc}
     */
    public E removeFirst() {
        E x = pollFirst();
        if (x == null)
            throw new NoSuchElementException();
        return x;
    }

    /**
     * @throws NoSuchElementException {@inheritDoc}
     */
    public E removeLast() {
        E x = pollLast();
        if (x == null)
            throw new NoSuchElementException();
        return x;
    }

    public E pollFirst() {
        int h = head;
        @SuppressWarnings("unchecked")
        E result = (E) elements[h];
        // Element is null if deque empty
        if (result == null)
            return null;
        elements[h] = null;     // Must null out slot
        head = (h + 1) & (elements.length - 1);
        return result;
    }

    public E pollLast() {
        int t = (tail - 1) & (elements.length - 1);
        @SuppressWarnings("unchecked")
        E result = (E) elements[t];
        if (result == null)
            return null;
        elements[t] = null;
        tail = t;
        return result;
    }
```

## 获取元素

获取元素相对比较简单。

因为底层的存储结构是数组，直接指定元素位置获取即可。

如果从队列后面获取，则通过 `(tail - 1) & (elements.length - 1)` 获取元素的下标。

元素不存在：抛出异常 NoSuchElementException

```java
    /**
     * @throws NoSuchElementException {@inheritDoc}
     */
    public E getFirst() {
        @SuppressWarnings("unchecked")
        E result = (E) elements[head];
        if (result == null)
            throw new NoSuchElementException();
        return result;
    }

    /**
     * @throws NoSuchElementException {@inheritDoc}
     */
    public E getLast() {
        @SuppressWarnings("unchecked")
        E result = (E) elements[(tail - 1) & (elements.length - 1)];
        if (result == null)
            throw new NoSuchElementException();
        return result;
    }

    @SuppressWarnings("unchecked")
    public E peekFirst() {
        // elements[head] is null if deque empty
        return (E) elements[head];
    }

    @SuppressWarnings("unchecked")
    public E peekLast() {
        return (E) elements[(tail - 1) & (elements.length - 1)];
    }
```


# 后续学习

这个不是线程安全的类。

如果我们希望在多线程中使用，该怎么办呢？

见下一节：[LinkedBlockingDeque]()

# 参考资料

[ArrayDeque类的使用详解](https://blog.csdn.net/skh2015java/article/details/74840513)

[【Java入门提高篇】Day32 Java容器类详解（十四）ArrayDeque详解](https://www.cnblogs.com/mfrank/p/9600137.html)

[Java ArrayDeque使用方法详解](https://www.zhangshengrong.com/p/JKN8Ej4mX6/)

* any list
{:toc}

