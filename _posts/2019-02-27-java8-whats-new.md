---
layout: post
title: JDK8 新特性详解，2014-03-18正式发布
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# java8

简介：JDK8 的主要新特性六个：Lambda、Stream、Date、新注解、函数编程、并发，前两者主要用于集合中。

JDK8 函数编程详解（本篇博客就不介绍了，太多了）

# 1、Lambda演变过程

```java
@Data
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    //名字
    private String name;
    //性别
    private String sex;
    //薪水
    private int salary;
    //年龄
    private int age;
    //星座
    private String star;
}
```

## 1.1、普通筛选

将这个集合遍历，然后依次的判断，这是最为普通的一种方式。

```java
@Test
public void test1(){
    //首先创建一个
    List<Student> list = Arrays.asList(
            new Student("九天","男",5000,18,"天秤座"),
            new Student("十夜","男",4000,16,"双鱼座"),
            new Student("十一郎","男",3000,24,"水瓶座")
    );

    List<Student> result = new ArrayList<>();
    for (Student student:list){
        if ("天秤座".equals(student.getStar())){
            result.add(student);
        }
    }
    System.out.println(result);
}
```

## 1.2、匿名内部类筛选

通过匿名内部类的方法，在内部类中添加判断条件进行筛选,首先创建一个公共接口：

```java
public interface FilterProcess<T> {
    boolean process(T t);
}
```

接下来通过一个公共函数，对集合以及筛选条件做一个共同方法，筛选到班级里星座是天秤星座的学生

```java
public List<Student> filterStudent(List<Student> students, FilterProcess<Student> mp){
    List<Student> list = new ArrayList<>();

    for (Student student : students) {
        if(mp.process(student)){
            list.add(student);
        }
    }
    return list;
}
```

最后是通过匿名内部类和该方法得到结果：

```java
@Test
public void test2(){
    List<Student> students = Arrays.asList(
            new Student("九天","男",5000,18,"天秤座"),
            new Student("十夜","男",4000,16,"双鱼座"),
            new Student("十一郎","男",3000,24,"水瓶座")
    );

    List<Student> list = filterStudent(students, new FilterProcess<Student>() {
        @Override
        public boolean process(Student student) {
            return student.getStar().equals("天秤座");
        }
    });
    for (Student student : list) {
        System.out.println(student);
    }
}
```

## 1.3、半Lambda方法

但是通过这两种代码都是很多，所以java8在这一点上提供了对集合筛选最大程度的删减代码，就是第三种方法。

第三种方法：通过Lambda直接判断，一步到位，不需要在写其他的方法。

```java
@Test
public void test3(){
    List<Student> list = Arrays.asList(
            new Student("九天","男",5000,18,"天秤座"),
            new Student("十夜","男",4000,16,"双鱼座"),
            new Student("十一郎","男",3000,24,"水瓶座")
    );
    List<Student> result = filterStudent(list,(e)->e.getStar().equals("天秤座"));
    System.out.println(result);
}
```

但是现在又会有人会问这个问题，我的那个方法中是这样子的

```java
filterStudent(List<Student> students, FilterProcess<Student> mp)
```

为什么我的代码参数却是这样子的呢

```java
filterStudent(list,(e)->e.getStar().equals("天秤座")
```

其实 `->` 这个是一个连接符，左边代表参数，而右边代表函数体（也就是我们说的条件），这个e就是代表  `FilterProcess<Student> mp` 这个参数的，只不过我们得java8 中lambda可以给这个参数附加上了条件，这些条件筛选都是封装到jdk8中内部类中自己实现的，所以我们只要附加条件就可以了，那个(e)就代表传了参数。

## 1.4、真正运用 lambda 方法

```java
@Test
public void test1() {
    List<Student> list = Arrays.asList(
            new Student("九天","男",5000,18,"天秤座"),
            new Student("十夜","男",4000,16,"双鱼座"),
            new Student("十一郎","男",3000,24,"水瓶座")
    );

    list.stream().filter((e) -> e.getStar().equals("天秤座"))
            .forEach(System.out::println);
}
```

# StreamAPI 详解

## 2.0、功能 

父类：BasicStream

子类：Stream、IntStream、LongStream、DoubleStream

包含两个类型，中间操作(intermediate operations)和结束操作(terminal operations)

下面是所有方法的属于那一端操作的方法：

![操作方法](https://oscimg.oschina.net/oscnet/4f4270bd343312f4e7cff7e681240522ab6.jpg)

然后准备一个测试类，和一个静态变量，图下：

```java
public class JdkTest {

    public static List<Student> list = Arrays.asList(
            new Student("九天", "男", 5000, 18, "天秤座"),
            new Student("十夜", "男", 4000, 16, "双鱼座"),
            new Student("十一郎", "男", 3000, 24, "水瓶座")
    );
}
```

## 2.1、stream

将集合转换成流,一般会使用流继续后续操作。

```java
list.stream();
```

## forEach 遍历

forEach遍历集合，System.out::println等同于System.out.println()

```java
list.forEach(System.out::println);
```

## filter 过滤

该方法中是一个筛选条件，等同于sql查询的where后面的筛选。

```java
list.stream().filter((e) -> e.getStar().equals("天秤座"))
            .forEach(System.out::println);
```

## map 转换集合

将 `List<Student>` 转换为 `List<String>`, collect是将结果转换为List

```java
List<String> names = list.stream().map(Student::getName).collect(Collectors.toList());
names.stream().forEach(System.out::println);
```

map的key直接转换list，如下：

```java
Map<String, Object> map = new HashMap<>();

map.put("key1","1");
map.put("key2","1");
map.put("key3","1");
map.put("key4","1");

List<String> cidList = map.keySet().stream().map(String::toString).collect(Collectors.toList());
System.out.println(cidList);
```

结果：

```
[key1, key2, key3, key4]
```

## mapToInt 转换数值流

转换数值流，等同mapToLong、mapToDouble，如下这个是取最大值

```java
IntStream intStream = list.stream().mapToInt(Student::getAge);
Stream<Integer> integerStream = intStream.boxed();
Optional<Integer> max   = integerStream.max(Integer::compareTo);
System.out.println(max.get());
```

## flatMap 合并成一个流

将流中的每一个元素 T 映射为一个流，再把每一个流连接成为一个流

```java
List<String> list2 = new ArrayList<>();
list2.add("aaa bbb ccc");
list2.add("ddd eee fff");
list2.add("ggg hhh iii");
list2 = list2.stream().map(s -> s.split(" ")).flatMap(Arrays::stream).collect(Collectors.toList());
System.out.println(list2);
```

结果为：

```
[aaa, bbb, ccc, ddd, eee, fff, ggg, hhh, iii]
```

## distinct 去重

```java
List<String> list2 = new ArrayList<>();
list2.add("aaa bbb ccc");
list2.add("ddd eee fff");
list2.add("ggg hhh iii");
list2.add("ggg hhh iii");
list2.stream().distinct().forEach(System.out::println);
```

结果：

```
aaa bbb ccc
ddd eee fff
ggg hhh iii
```

## sorted 排序

```java
//asc排序
list.stream().sorted(Comparator.comparingInt(Student::getAge)).forEach(System.out::println);
System.out.println("------------------------------------------------------------------");

//desc排序
list.stream().sorted(Comparator.comparingInt(Student::getAge).reversed()).forEach(System.out::println);
```

结果：

```
Student(name=十夜, sex=男, salary=4000, age=16, star=双鱼座)
Student(name=九天, sex=男, salary=5000, age=18, star=天秤座)
Student(name=十一郎, sex=男, salary=3000, age=24, star=水瓶座)
------------------------------------------------------------------
Student(name=十一郎, sex=男, salary=3000, age=24, star=水瓶座)
Student(name=九天, sex=男, salary=5000, age=18, star=天秤座)
Student(name=十夜, sex=男, salary=4000, age=16, star=双鱼座)
```

## skip 跳过前 n 个

```java
list.stream().skip(1).forEach(System.out::println);
```

## limit 截取前 n 个

```java
list.stream().limit(1).forEach(System.out::println);
```

## anyMatch

只要有其中任意一个符合条件

```java
boolean isHave = list.stream().anyMatch(student -> student.getAge() == 16);
System.out.println(isHave);
```

## allMatch

全部符合

```java
boolean isHave = list.stream().allMatch(student -> student.getAge() == 16);
System.out.println(isHave);
```

## noneMatch

是否满足没有符合的

```java
boolean isHave = list.stream().noneMatch(student -> student.getAge() == 16);
System.out.println(isHave);
```

## findAny

找到其中一个元素 （使用 stream() 时找到的是第一个元素；使用 parallelStream() 并行时找到的是其中一个元素）

```java
Optional<Student> student = list.stream().findAny();
System.out.println(student.get());
```

## findFirst

找到第一个元素

```java
Optional<Student> student = list.stream().findFirst();
System.out.println(student.get());
```

## count 计数

```java
long count = list.stream().count();
System.out.println(count);
```

## of 生成一个字符串流

```java
Stream<String> stringStream = Stream.of("i","love","you");
```

## empty 生成一个空流

```java
Stream<String> stringStream = Stream.empty();
```

## iterate

```java
List<String> list = Arrays.asList("a", "b", "c", "c", "d", "f", "a");
Stream.iterate(0, i -> i + 1).limit(list.size()).forEach(i -> {
    System.out.println(String.valueOf(i) + list.get(i));
});
```

## collect：averagingLong 求平均值

```java
Double average = list.stream().collect(Collectors.averagingLong(Student::getAge));
```
      
## collect：collectingAndThen 两步结束，先如何，在如何

```java
// 求年龄平均值
String average = list.stream().collect(Collectors.collectingAndThen(Collectors.averagingInt(Student::getAge), a->"哈哈，平均年龄"+a));
```

## collect：counting 求个数

```java
Long num = list.stream().collect(Collectors.counting());
```

## collect: groupingBy(Function)

接下来所有的都是用下面的新List数据测试使用

```java
public static List<Student> list = Arrays.asList(
        new Student("九天", "男", 5000, 18, "天秤座"),
        new Student("十夜", "男", 4000, 16, "双鱼座"),
        new Student("十一郎", "男", 3000, 24, "水瓶座"),
        new Student("十二郎", "男", 3000, 24, "水瓶座")
);
```

```java
Map<Integer,List<Student>> result = list.stream().collect(Collectors.groupingBy(Student::getAge));
for (Integer age:result.keySet()){
    System.out.println(result.get(age));
}
```

结果：

```
[Student(name=十夜, sex=男, salary=4000, age=16, star=双鱼座)]
[Student(name=九天, sex=男, salary=5000, age=18, star=天秤座)]
[Student(name=十一郎, sex=男, salary=3000, age=24, star=水瓶座), Student(name=十二郎, sex=男, salary=3000, age=24, star=水瓶座)]
```

## collect：groupingBy(Function,Collector)

```java
// 先分组，在计算每组的个数
Map<Integer,Long> num = list.stream().collect(Collectors.groupingBy(Student::getAge,Collectors.counting()));
System.out.println(num);
```

结果：

```
{16=1, 18=1, 24=2}
```

## collect：groupingBy(Function, Supplier, Collector)

```java
// 先分组，在计算每组的个数,然后排序
Map<Integer,Long> num = list.stream().collect(Collectors.groupingBy(Student::getAge, TreeMap::new,Collectors.counting()));
System.out.println(num);
```

## collect：groupingByConcurrent

同上，不过这个Concurrent是并发的，也有3个方法，和上面非并发一个效果

```java
groupingByConcurrent(Function)

groupingByConcurrent(Function, Collector)

groupingByConcurrent(Function, Supplier, Collector)
```

## collect：joining()

```java
// 名字拼接
String result = list.stream().map(Student::getName).collect(Collectors.joining());
System.out.println(result);
```

结果：

```
九天十夜十一郎十二郎
```

## collect：joining(str)

```java
// 名字拼接,用逗号隔开
String result = list.stream().map(Student::getName).collect(Collectors.joining(","));
System.out.println(result);
```

结果：

```
九天,十夜,十一郎,十二郎
```

## collect：joining(str, prefix, suffix)

```java
// 名字拼接,包含前缀、后缀
String result = list.stream().map(Student::getName).collect(Collectors.joining(",","hello","world"));
System.out.println(result);
```

结果：

```
hello九天,十夜,十一郎,十二郎world
```

## collect：summarizingDouble

```java
// 求年龄的最大值、最小值、平均值、综合以及人数
DoubleSummaryStatistics result = list.stream().collect(Collectors.summarizingDouble(Student::getAge));
System.out.println(result);
```

结果：

```
DoubleSummaryStatistics{count=4, sum=82.000000, min=16.000000, average=20.500000, max=24.000000}
```

# Date

## JDK7 Date 缺点

1、所有的日期类都是可变的，因此他们都不是线程安全的，这是Java日期类最大的问题之一。

2、Java的日期/时间类的定义并不一致，在java.util和java.sql的包中都有日期类，此外用于格式化和解析的类在java.text包中定义。

3、java.util.Date同时包含日期和时间，而java.sql.Date仅包含日期，将其纳入java.sql包并不合理。另外这两个类都有相同的名字，这本身就是一个非常糟糕的设计。

对于时间、时间戳、格式化以及解析，并没有一些明确定义的类。

对于格式化和解析的需求，我们有java.text.DateFormat抽象类，但通常情况下，SimpleDateFormat类被用于此类需求

4、日期类并不提供国际化，没有时区支持，因此Java引入了java.util.Calendar和java.util.TimeZone类，但他们同样存在上述所有的问题

## JDK8 Date 优势

1、不变性：新的日期/时间API中，所有的类都是不可变的，这对多线程环境有好处。

2、关注点分离：新的API将人可读的日期时间和机器时间（unix timestamp）明确分离，它为日期（Date）、时间（Time）、日期时间（DateTime）、时间戳（unix timestamp）以及时区定义了不同的类。

3、清晰：在所有的类中，方法都被明确定义用以完成相同的行为。举个例子，要拿到当前实例我们可以使用now()方法，在所有的类中都定义了format()和parse()方法，而不是像以前那样专门有一个独立的类。为了更好的处理问题，所有的类都使用了工厂模式和策略模式，一旦你使用了其中某个类的方法，与其他类协同工作并不困难。

4、实用操作：所有新的日期/时间API类都实现了一系列方法用以完成通用的任务，如：加、减、格式化、解析、从日期/时间中提取单独部分，等等。

5、可扩展性：新的日期/时间API是工作在ISO-8601日历系统上的，但我们也可以将其应用在非IOS的日历上。

## JDK8 Date新增字段

Java.time 包中的是类是不可变且线程安全的。

新的时间及日期API位于java.time中，java8 time包下关键字段解读。

| 属性	含义 |
|:---|:---|
| Instant	        | 代表的是时间戳 |
| LocalDate	        | 代表日期，比如2020-01-14 |
| LocalTime	        | 代表时刻，比如12:59:59 |
| LocalDateTime	    | 代表具体时间 2020-01-12 12:22:26 |
| ZonedDateTime	    | 代表一个包含时区的完整的日期时间，偏移量是以UTC/  格林威治时间为基准的 |
| Period	        | 代表时间段 |
| ZoneOffset	    | 代表时区偏移量，比如：+8:00 |
| Clock	            | 代表时钟，比如获取目前美国纽约的时间 |

## 获取当前时间

```java
Instant instant = Instant.now(); //获取当前时间戳

LocalDate localDate = LocalDate.now();  //获取当前日期

LocalTime localTime = LocalTime.now();  //获取当前时刻

LocalDateTime localDateTime = LocalDateTime.now();  //获取当前具体时间

ZonedDateTime zonedDateTime = ZonedDateTime.now();   //获取带有时区的时间
```

## 字符串转换

```java
//jdk8：
String str = "2019-01-11";
DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
LocalDate localDate = LocalDate.parse(str, formatter);

//jdk7:
SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd");
try {
    Date date = simpleDateFormat.parse(str); 
} catch (ParseException e){ 
    e.printStackTrace();
}
```

## Date转换LocalDate

```java
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

public class Test {

    public static void main(String[] args) {
        Date date = new Date();
        Instant instant = date.toInstant();
        ZoneId zoneId = ZoneId.systemDefault();

        // atZone()方法返回在指定时区从此Instant生成的ZonedDateTime。
        LocalDate localDate = instant.atZone(zoneId).toLocalDate();
        System.out.println("Date = " + date);
        System.out.println("LocalDate = " + localDate);
    }
}
```

## LocalDate转Date

```java
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;

public class Test {

    public static void main(String[] args) {
        ZoneId zoneId = ZoneId.systemDefault();
        LocalDate localDate = LocalDate.now();
        ZonedDateTime zdt = localDate.atStartOfDay(zoneId);

        Date date = Date.from(zdt.toInstant());

        System.out.println("LocalDate = " + localDate);
        System.out.println("Date = " + date);

    }
}
```

## 时间戳转 LocalDateTime

```java
long timestamp = System.currentTimeMillis();

Instant instant = Instant.ofEpochMilli(timestamp);

LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
```

## LocalDateTime 转时间戳

```java
LocalDateTime dateTime = LocalDateTime.now();

dateTime.toInstant(ZoneOffset.ofHours(8)).toEpochMilli();

dateTime.toInstant(ZoneOffset.of("+08:00")).toEpochMilli();

dateTime.atZone(ZoneId.systemDefault()).toInstant().toEpochMilli();
```

## LocalDate 方法总结

```
getYear()                         int        获取当前日期的年份
getMonth()                        Month      获取当前日期的月份对象
getMonthValue()                   int        获取当前日期是第几月
getDayOfWeek()                    DayOfWeek  表示该对象表示的日期是星期几
getDayOfMonth()                   int        表示该对象表示的日期是这个月第几天
getDayOfYear()                    int        表示该对象表示的日期是今年第几天
withYear(int year)                LocalDate  修改当前对象的年份
withMonth(int month)              LocalDate  修改当前对象的月份
withDayOfMonth(intdayOfMonth)     LocalDate  修改当前对象在当月的日期
isLeapYear()                      boolean    是否是闰年
lengthOfMonth()                   int        这个月有多少天
lengthOfYear()                    int        该对象表示的年份有多少天（365或者366）
plusYears(longyearsToAdd)         LocalDate  当前对象增加指定的年份数
plusMonths(longmonthsToAdd)       LocalDate  当前对象增加指定的月份数
plusWeeks(longweeksToAdd)         LocalDate  当前对象增加指定的周数
plusDays(longdaysToAdd)           LocalDate  当前对象增加指定的天数
minusYears(longyearsToSubtract)   LocalDate  当前对象减去指定的年数
minusMonths(longmonthsToSubtract) LocalDate  当前对象减去注定的月数
minusWeeks(longweeksToSubtract)   LocalDate  当前对象减去指定的周数
minusDays(longdaysToSubtract)     LocalDate  当前对象减去指定的天数
compareTo(ChronoLocalDateother)   int        比较当前对象和other对象在时间上的大小，返回值如果
    为正，则当前对象时间较晚，
isBefore(ChronoLocalDateother)    boolean    比较当前对象日期是否在other对象日期之前
isAfter(ChronoLocalDateother)     boolean    比较当前对象日期是否在other对象日期之后
isEqual(ChronoLocalDateother)     boolean    比较两个日期对象是否相等
```

# 参考资料

https://my.oschina.net/mdxlcj/blog/1622718

* any list
{:toc}