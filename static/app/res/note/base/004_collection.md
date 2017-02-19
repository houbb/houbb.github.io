# 梳理一下

Collection
    List
    Set
    
Map



> List 和 Map 区别?

一个是存储单列数据的集合,另一个是存储键和值这样的双列数据的集合,List 中存储的数 据是有顺序,并且允许重复;Map 中存储的数据是没有顺序的,其键是不能重复的,它的 值是可以有重复的。


> List, Set, Map 是否继承自 Collection 接口?

List,Set 是,Map 不是


> List、Map、Set 三个接口,存取元素时,各有什么特点?

首先,List 与 Set 具有相似性,它们都是单列元素的集合,所以,它们有一个功共同的父接 口,叫 Collection。Set 里面不允许有重复的元素,所谓重复,即不能有两个相等(注意, 不是仅仅是相同)的对象,即假设 Set 集合中有了一个 A 对象,现在我要向 Set 集合再存 入一个 B 对象,但 B 对象与 A 对象 equals 相等,则 B 对象存储不进去,所以,Set 集合的 add 方法有一个 boolean 的返回值,当集合中没有某个元素,此时 add 方法可成功加入该 元素时,则返回 true,当集合含有与某个元素 equals 相等的元素时,此时 add 方法无法加 入该元素,返回结果为 false。Set 取元素时,没法说取第几个,只能以 Iterator 接口取得所 有的元素,再逐一遍历各个元素。
List 表示有先后顺序的集合,注意,不是那种按年龄、按大小、按价格之类的排序。 当我们多次调用 add(Obj e)方法时,每次加入的对象就像火车站买票有排队顺序一样,按先 来后到的顺序排序。有时候,也可以插队,即调用 add(int index,Obj e)方法,就可以指定当 前对象在集合中的存放位置。一个对象可以被反复存储进 List 中,每调用一次 add 方法, 这个对象就被插入进集合中一次,其实,并不是把这个对象本身存储进了集合中,而是在集 合中用一个索引变量指向这个对象,当这个对象被 add 多次时,即相当于集合中有多个索 引指向了这个对象,如图 x 所示。List 除了可以以 Iterator 接口取得所有的元素,再逐一遍 历各个元素之外,还可以调用 get(index i)来明确说明取第几个。
Map 与 List 和 Set 不同,它是双列的集合,其中有 put 方法,定义如下:put(obj key,objvalue),每次存储时,要存储一对 key/value,不能存储重复的 key,这个重复的规 则也是按 equals 比较相等。取则可以根据 key 获得相应的 value,即 get(Object key)返回 值为 key 所对应的 value。另外,也可以获得所有的 key 的结合,还可以获得所有的 value 的结合,还可以获得 key 和 value 组合成的 Map.Entry 对象的集合。
List 以特定次序来持有元素,可有重复元素。Set 无法拥有重复元素,内部排序。Map 保存 key-value 值,value 可多值。

HashSet 按照 hashcode 值的某种运算方式进行存储,而不是直接按 hashCode 值的大小进 行存储。例如,"abc"---> 78,"def" ---> 62,"xyz" ---> 65在 hashSet 中的存储顺序不是 62,65,78,这些问题感谢以前一个叫崔健的学员 出,最后通过查看源代码给他解释清楚, 看本次培训学员当中有多少能看懂源码。LinkedHashSet 按插入的顺序存储,那被存储对象 的 hashcode 方法还有什么作用呢?学员想想!hashset 集合比较两个对象是否相等,首先看 hashcode 方法是否相等,然后看 equals 方法是否相等。new 两个 Student 插入到 HashSet 中,看 HashSet 的 size,实现 hashcode 和 equals 方法后再看 size。
同一个对象可以在 Vector 中加入多次。往集合里面加元素,相当于集合里用一根绳子连接 到了目标对象。往 HashSet 中却加不了多次的。


> ArrayList,Vector, LinkedList 的存储性能和特性


ArrayList 和 Vector 都是使用数组方式存储数据,此数组元素数大于实际存储的数据以便增 加和插入元素,它们都允许直接按序号索引元素,但是插入元素要涉及数组元素移动等内存 操作,
所以索引数据快而插入数据慢,Vector 由于使用了 synchronized 方法(线程安全), 通常性能上较 ArrayList 差,而 LinkedList 使用双向链表实现存储,
按序号索引数据需要进 行前向或后向遍历,但是插入数据时只需要记录本项的前后项即可,所以插入速度较快。

LinkedList 也是线程不安全的,LinkedList  供了一些方法,使得 LinkedList 可以被当作堆 栈和队列来使用。

> Set 里的元素是不能重复的,那么用什么方法来区分重复与否呢?是用==还 是 equals()?它们有何区别?


Set 里的元素是不能重复的,元素重复与否是使用 equals()方法进行判断的。 equals()和==方法决定引用值是否指向同一对象 equals()在类中被覆盖,为的是当两个
分离的对象的内容和类型相配的话,返回真值。



> 你所知道的集合类都有哪些?主要方法?


最常用的集合类是 List 和 Map。 List 的具体实现包括 ArrayList 和 Vector,它们是可变 大小的列表,比较适合构建、存储和操作任何类型对象的元素列表。 List 适用于按数值索 引访问元素的情形。
Map  供了一个更通用的元素存储方法。 Map 集合类用于存储元素对(称作"键"和"值"), 其中每个键映射到一个值。
ArrayList/VectoràList
àCollection
HashSet/TreeSetàSet PropetiesàHashTable
Treemap/HashMap
àMap
我记的不是方法名,而是思想,我知道它们都有增删改查的方法,但这些方法的具体名称, 我记得不是很清楚,对于 set,大概的方法是 add,remove, contains;

对于 map,大概的方 法就是 put,remove,contains 等,因为,我只要在 eclispe 下按点操作符,很自然的这些方 法就出来了。

我记住的一些思想就是 List 类会有 get(int index)这样的方法,因为它可以按 顺序取元素,而 set 类中没有 get(int index)这样的方法。List 和 set 都可以迭代出所有元素,
迭代时先要得到一个 iterator 对象,所以,set 和 list 类都有一个 iterator 方法,用于返回那 个 iterator 对象。map 可以返回三个集合,一个是返回所有的 key 的集合,另外一个返回的 是所有 value 的集合,

再一个返回的 key 和 value 组合成的 EntrySet 对象的集合,map 也 有 get 方法,参数是 key,返回值是 key 对应的 value。


> TreeSet 里面放对象,如果同时放入了父类和子类的实例对象,那比较时使 用的是父类的 compareTo 方法,还是使用的子类的 compareTo 方法,还是抛 异常!


应该是没有针对问题的确切的答案,当前的 add 方法放入的是哪个对象,就调用哪个对 象的 compareTo 方法,至于这个 compareTo 方法怎么做,就看当前这个对象的类中是如何 编写这个方法的)
实验代码:


```java
public class ParentimplementsComparable { private int age = 0;
public Parent(int age){
this.age = age; }
public int compareTo(Object o){
// TODO Auto-generated method stub System.out.println("method ofparent"); Parent o1 = (Parent)o;
return age>o1.age?1:age<o1.age?-1:0;
} }
public class Childextends Parent {
//
public Child(){ super(3);
}
public int compareTo(Object o){
// TODO Auto-generated methodstub
System.out.println("methodof child"); Child o1 = (Child)o;
return 1; }
}
public class TreeSetTest {
/**
* @paramargs */
public static voidmain(String[] args) {
// TODO Auto-generated method stub TreeSet set = new TreeSet(); set.add(newParent(3));
set.add(new Child()); set.add(newParent(4)); System.out.println(set.size());
} }
```

























# hashMap 、 hashTable

共同点:

1) 他们都完成了 Map 接口

不同点:

1) HashMap **允许空(null)键值(key)**, 由于非线程安全,在只有一个线程访问 的情况下,效率要高于 Hashtable。

(其实就是很多方法没有添加 **synchronized** 关键字, 这个道理同样适用于 StringBuilder_StringBuffer)

2) HashTable 自  Dictionary

3) HashTable 从来没用过


```java
public class Hashtable<K,V>
    extends Dictionary<K,V>
    implements Map<K,V>, Cloneable, java.io.Serializable
    {}
```


```java
public class HashMap<K,V> extends AbstractMap<K,V>
    implements Map<K,V>, Cloneable, Serializable{
    }
```



二者的联系与区别。


> hash 的初始化因子 是多少??

大了会怎么样 小了会怎么样  这个一定要理解透彻(面试无所谓,为了以后进阶)



> hash 的原理??

(底层是通过数组实现的)

hashCode() and equals();        hash 原理可以参考




(条理上还需要整理,也是先说相同点,再说不同点)
HashMap 是 Hashtable 的轻量级实现(非线程安全的实现),他们都完成了 Map 接口,主 要区别在于 HashMap 允许空(null)键值(key),由于非线程安全,在只有一个线程访问 的情况下,效率要高于 Hashtable。
HashMap 允许将 null 作为一个 entry 的 key 或者 value,而 Hashtable 不允许。

HashMap 把 Hashtable 的 contains 方法去掉了,改成 containsvalue 和 containsKey。因为
contains 方法容易让人引起误解。
Hashtable 继承自 Dictionary 类, 而 HashMap 是 Java1.2引进的 Map interface 的一个实现。
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


