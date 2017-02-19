# String  为什么是 final



# 常量池的概念



为什么这样设计 ? 优缺点???




[知乎](https://www.zhihu.com/question/31345592)


作者：Jaskey Lam
链接：https://www.zhihu.com/question/31345592/answer/51549787
来源：知乎
著作权归作者所有，转载请联系作者获得授权。

String基本约定中最重要的一条是immutable。

的确声明String为final 和immutable是没有必然关系，但是假如String没有声明为final, 那么你的StringChilld就有可能是被复写为mutable的，这样就打破了成为共识的基本约定。

举个例子：一个方法可能本来接受String类型并返回其大写方式
public static String uppperString(String s){
        return s.toUpperCase();
}

你传入String 的s="test", 他不会修改字符串池中"test", 而是直接新建立一个实例"TEST"返回。但如果你的StringChild的toUpperCase()被你重写（override）为mutable的方式，然后你调用这个方法的时候传入的是StringChild实例， 那么整体(依赖于(过)方法uppperString的所有类)的行为就有可能出现错乱。

要知道，String是几乎每个类都会使用的类，特别是作为Hashmap之类的集合的key值时候，mutable的String有非常大的风险。而且一旦发生，非常难发现。

声明String为final一劳永逸。



# String more  细致的内容

> 问:
String s = "Hello";
s = s + " world!";
这两行代码执行后,原始的 String 对象中的内容到底变了没有?

1) 没有。因为 String 被设计成不可变(immutable)类,所以它的所有对象都是不可变对象。


没有。因为 String 被设计成不可变(immutable)类,所以它的所有对象都是不可变对象。在 这段代码中,s 原先指向一个 String 对象,内容是 "Hello",然后我们对 s 进行了+操作,那 么 s 所指向的那个对象是否发生了改变呢?答案是没有。这时,s 不指向原来那个对象了, 而指向了另一个 String 对象,内容为"Hello world!",原来那个对象还存在于内存之中,只 是 s 这个引用变量不再指向它了。
通过上面的说明,我们很容易导出另一个结论,如果经常对字符串进行各种各样的修改,或 者说,不可预见的修改,那么使用 String 来代表字符串的话会引起很大的内存开销。因为 String 对象建立之后不能再改变,所以对于每一个不同的字符串,都需要一个 String 对象来 表示。这时,应该考虑使用 StringBuffer 类,它允许修改,而不是每个不同的字符串都要生 成一个新的对象。并且,这两种类的对象转换十分容易。 同时,我们还可以知道,如果要使用内容相同的字符串,不必每次都 new 一个 String。例 如我们要在构造器中对一个名叫 s 的 String 引用变量进行初始化,把它设置为初始值,应

当这样做:

public class Demo { private String s;
...
public Demo {
s = "Initial Value"; }
...
}

而非
s = new String("Initial Value"); 后者每次都会调用构造器,生成新对象,性能低下且内存开销大,并且没有意义,因为 String 对象不可改变,所以对于内容相同的字符串,只要一个 String 对象来表示就可以了。

也就 说,多次调用上面的构造器创建多个对象,他们的 String 类型属性 s 都指向同一个对象。

上面的结论还基于这样一个事实:对于字符串常量,如果内容相同,Java 认为它们代表同 一个 String 对象。

而用关键字 new 调用构造器,总是会创建一个新的对象,无论内容是否 相同。

至于为什么要把 String 类设计成不可变类,是它的用途决定的。其实不只 String,很多 Java 标准类库中的类都是不可变的。

在开发一个系统的时候,我们有时候也需要设计不可变类, 来传递一组相关的值,这也是面向对象思想的体现。

不可变类有一些优点,比如因为它的对 象是只读的,所以多线程并发访问也不会有任何问题。当然也有一些缺点,比如每个不同的 状态都要一个对象来代表,可能会造成性能上的问题。

所以 Java 标准类库还 供了一个可 变版本,即 StringBuffer。




> String 和 StringBuffer 的区别


JAVA 平台 供了两个类:String 和 StringBuffer,它们可以储存和操作字符串,即包含多个 字符的字符数据。这个 String 类 供了数值不可改变的字符串。而这个 StringBuffer 类 供 的字符串进行修改。当你知道字符数据要改变的时候你就可以使用 StringBuffer。典型地, 你可以使用 StringBuffers 来动态构造字符数据。另外,String 实现了 equals 方法,new String(“abc”).equals(newString(“abc”)的结果为 true,而 StringBuffer 没有实现 equals 方法, 所以,new StringBuffer(“abc”).equals(newStringBuffer(“abc”)的结果为 false。
接着要举一个具体的例子来说明,我们要把1到100的所有数字拼起来,组成一个串。 StringBuffer sbf = new StringBuffer();

for(int i=0;i<100;i++)
{
sbf.append(i); }
上面的代码效率很高,因为只创建了一个 StringBuffer 对象,而下面的代码效率很低,因为 创建了101个对象。

String str = new String(); for(int i=0;i<100;i++)
{
str = str + i; }

在讲两者区别时,应把循环的次数搞成10000,然后用 endTime-beginTime 来比较两者执 行的时间差异,最后还要讲讲 StringBuilder 与 StringBuffer 的区别。
String 覆盖了 equals 方法和 hashCode 方法,而 StringBuffer 没有覆盖 equals 方法和 hashCode 方法,所以,将 StringBuffer 对象存储进 Java 集合类中时会出现问题。



> String s = new String("xyz");创建了几个 String Object?二者之间有什么 区别?

COMMENT: 这个问题简单打出来并没有意义。可以参考【堆栈寄存器】中的信息。理解这个问题的本质。

两个或一个,”xyz”对应一个对象,这个对象放在字符串常量缓冲区,常量”xyz”不管出现多 少遍,都是缓冲区中的那一个。New String 每写一遍,就创建一个新的对象,它一句那个 常量”xyz”对象的内容来创建出一个新 String 对象。
如果以前就用过’xyz’,这句代表就不会 创建”xyz”自己了,直接从缓冲区拿。




> 下面这条语句一共创建了多少个对象:String s="a"+"b"+"c"+"d";


答:对于如下代码:
String s1 = "a";
String s2 = s1 + "b";
String s3 = "a" + "b"; System.out.println(s2 == "ab"); System.out.println(s3 == "ab");
第一条语句打印的结果为 false,第二条语句打印的结果为 true,这说明 javac 编译可以对 字符串常量直接相加的表达式进行优化,不必要等到运行期去进行加法运算处理,而是在编 译时去掉其中的加号,直接将其编译成一个这些常量相连的结果。
题目中的第一行代码被编译器在编译时优化后,相当于直接定义了一个”abcd”的字符串, 所以,上面的代码应该只创建了一个 String 对象。写如下两行代码,
String s ="a" + "b" + "c" + "d";
System.out.println(s== "abcd");

最终打印的结果应该为 true。















