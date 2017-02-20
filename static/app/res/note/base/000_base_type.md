# 8 大基本类型

1) 基本类型：存储在栈中，存储速度比较快些

byte,char,short,int,long,float,double，boolean




## switch() 中可以放那些??


byte、char、short、int、枚举


> int 以上 比如 long 是不行的

@since 1.7 支持 String




在 switch(expr1)中,expr1只能是一个整数表达式或者枚举常量(更大字体),整数表达 式可以是 int 基本类型或 Integer 包装类型,由于,byte,short,char 都可以隐含转换为 int,
所以,这些类型以及这些类型的包装类型也是可以的。显然,long 和 String 类型都不符合 switch的语法规定,并且不能被隐式转换成int类型,所以,它们不能作用于swtich语句中。


# 自动提升表达式的类型

eg:

short s1 = 1; s1 = s1 + 1;有什么错? short s1 = 1; s1 += 1;有什么错?

对于 short s1 = 1; s1 = s1 + 1;由于 s1+1运算时会自动提升表达式的类型,所以结果是 int型,再赋值给 short 类型 s1时,编译器将报告需要强制转换类型的错误。
对于 short s1 = 1; s1 += 1;由于 +=是 java 语言规定的运算符,java 编译器会对它进行特殊处理,因此可以正确编译。





# char 型变量中能不能存贮一个中文汉字?为什么?


char 型变量是用来存储 Unicode 编码的字符的,unicode 编码字符集中包含了汉字,所以, char 型变量中当然可以存储汉字啦。
不过,如果某个特殊的汉字没有被包含在 unicode 编 码字符集中,那么,这个 char 型变量中就不能存储这个特殊汉字。
补充说明:unicode 编 码占用两个字节,所以,char 类型的变量也是占用两个字节。



## Integer and int

1) Integer 可以区分 null 和 0   (所以web/Facade 使用对象,而不是基本类型)

2) Integer 提供了多个与整数相关的操作方法

int 是 java 提供的8种原始数据类型之一。Java 为每个原始类型提供了封装类,Integer 是 java 为 int 提供的封装类。

int 的默认值为0,而 Integer 的默认值为 null,即 Integer 可以区分出 未赋值和值为0的区别,int 则无法表达出未赋值的情况,

例如,要想表达出没有参加考试和 考试成绩为0的区别,则只能使用 Integer。

在 JSP 开发中,Integer 的默认为 null,所以用 el 表达式在文本框中显示时,值为空白字符串,而 int 默认的默认值为0,所以用 el 表达式

在文本框中显示时,结果为0,所以,int 不适合作为 web 层的表单数据的类型。

在 Hibernate 中,如果将 OID 定义为 Integer 类型,那么 Hibernate 就可以根据其值是否为 null 而判断一个对象是否是临时的,

如果将 OID 定义为了 int 类型,还需要在 hbm 映射文 件中设置其 unsaved-value 属性为0。

另外,Integer 提供了多个与整数相关的操作方法,例如,将一个字符串转换成整数,Integer 中还定义了表示整数的最大值和最小值的常量。

