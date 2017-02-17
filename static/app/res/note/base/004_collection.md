# 梳理一下

Collection
    List
    Set
    
Map























# hashMap 、 hashTable


二者的联系与区别。


> hash 的初始化因子 是多少??

大了会怎么样 小了会怎么样



> hash 的原理??

(底层是通过数组实现的)

hashCode() and equals();        hash 原理可以参考




(条理上还需要整理,也是先说相同点,再说不同点)
HashMap 是 Hashtable 的轻量级实现(非线程安全的实现),他们都完成了 Map 接口,主 要区别在于 HashMap 允许空(null)键值(key),由于非线程安全,在只有一个线程访问 的情况下,效率要高于 Hashtable。
HashMap 允许将 null 作为一个 entry 的 key 或者 value,而 Hashtable 不允许。 HashMap 把 Hashtable 的 contains 方法去掉了,改成 containsvalue 和 containsKey。因为
contains 方法容易让人引起误解。
Hashtable 继承自 Dictionary 类,而 HashMap 是 Java1.2引进的 Map interface 的一个实现。
最大的不同是,Hashtable 的方法是 Synchronize 的,而 HashMap 不是,在多个线程访问 Hashtable 时,不需要自己为它的方法实现同步,而 HashMap 就必须为之提供外同步。
Hashtable 和 HashMap 采用的 hash/rehash 算法都大概一样,所以性能不会有很大的差异。
就 HashMap 与 HashTable 主要从三方面来说。
一.历史原因:Hashtable 是基于陈旧的 Dictionary 类的,HashMap 是 Java 1.2引进的 Map 接口的一个实现
二.同步性:Hashtable 是线程安全的,也就是说是同步的,而 HashMap 是线程序不安全的, 不是同步的
三.值:只有 HashMap 可以让你将空值作为一个表的条目的 key 或 value










# list & vector

这两个类都实现了 List 接口(List 接口继承了 Collection 接口),他们都是有序集合,即存 储在这两个集合中的元素的位置都是有顺序的,相当于一种动态的数组,我们以后可以按位 置索引号取出某个元素,
并且其中的数据是允许重复的,这是 HashSet 之类的集合的最大 不同处,HashSet 之类的集合不可以按索引号去检索其中的元素,也不允许有重复的元素 (本来题目问的与 hashset 没有任何关系,但为了说清楚 ArrayList 与
Vector 的功能,我们 使用对比方式,更有利于说明问题)。
接着才说 ArrayList 与 Vector 的区别,这主要包括两个方面:.

1) 同步性:

Vector 是线程安全的,也就是说是它的方法之间是线程同步的,而 ArrayList 是线程 序不安全的,它的方法之间是线程不同步的。
如果只有一个线程会访问到集合,那最好是使 用 ArrayList,因为它不考虑线程安全,效率会高些;如果有多个线程会访问到集合,那最 好是使用 Vector,因为不需要我们自己再去考虑和编写线程安全的代码。

2) 插入变更频繁 linkList

查询 arrayList


备注:对于 Vector&ArrayList、Hashtable&HashMap,要记住线程安全的问题,记住 Vector 与 Hashtable 是旧的,是 java 一诞生就提供了的,它们是线程安全的,ArrayList 与 HashMap 是 java2时才提供的,它们是线程不安全的。


3) 数据增长:

ArrayList 与 Vector 都有一个初始的容量大小,当存储进它们里面的元素的个数超过 了容量时,就需要增加 ArrayList 与 Vector 的存储空间,每次要增加存储空间时,不是只增 加一个存储单元,而是增加多个存储单元,
每次增加的存储单元的个数在内存空间利用与程 序效率之间要取得一定的平衡。Vector 默认增长为原来两倍,而 ArrayList 的增长策略在文 档中没有明确规定(从源代码看到的是增长为原来的1.5倍)。
ArrayList 与 Vector 都可以设 置初始的空间大小,Vector 还可以设置增长的空间大小,而 ArrayList 没有提供设置增长空 间的方法。
总结:即 Vector 增长原来的一倍,ArrayList 增加原来的0.5倍。


ArrayList 和 Vector 都是使用数组方式存储数据,此数组元素数大于实际存储的数据以便增 加和插入元素,它们都允许直接按序号索引元素,但是插入元素要涉及数组元素移动等内存 操作,所以索引数据快而插入数据慢,Vector 由于使用了 synchronized 方法(线程安全), 通常性能上较 ArrayList 差,而 LinkedList 使用双向链表实现存储,按序号索引数据需要进 行前向或后向遍历,但是插入数据时只需要记录本项的前后项即可,所以插入速度较快。
LinkedList 也是线程不安全的,LinkedList 提供了一些方法,使得 LinkedList 可以被当作堆 栈和队列来使用。







# list map

一个是存储单列数据的集合,另一个是存储键和值这样的双列数据的集合,List 中存储的数 据是有顺序,并且允许重复;Map 中存储的数据是没有顺序的,其键是不能重复的,它的 值是可以有重复的。


set 可以放入 多个 null;




```java
Set<String> strings = new HashSet<>();
strings.add(null);
strings.add(null);
```









# collection & collections


- 带S的一般是工具类

比如 Array, File, Path



# 随带一提及的是线程安全

dateFormat 不是 线程安全的。虽然源码中有提及,但是个大坑。


 * Date formats are not synchronized.
 * It is recommended to create separate format instances for each thread.
 * If multiple threads access a format concurrently, it must be synchronized
 * externally.


