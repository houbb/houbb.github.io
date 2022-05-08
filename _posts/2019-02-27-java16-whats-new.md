---
layout: post
title: JDK16 新特性详解，2021-03-17 正式发布
date:  2019-2-27 15:48:49 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# Record（最终版）

这个功能之前在 jdk14（预览版）、jdk15（预览版）已经描述过了，自我感觉没有找到它的用处... 在接口提供数据展示的时候倒可以用一用，如：

活动实体表（正常线上会有很多字段的，简写了）：

```java
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Activity {
    private int id;
    private String name;
    private int age;
}
```

# java.time 根据时段获取时间 

应用程序现在可以表示一天中的时段，例如 “上午” 或 “晚上”，而不仅仅是 am /pm。下面的示例演示了如何翻译一天中的时间段：

```java
public static void main(String[] args) {
    test2();
}

static void test2(){
    String date1 = DateTimeFormatter.ofPattern("a").format(LocalTime.now());
    String date2 = DateTimeFormatter.ofPattern("B").format(LocalTime.now());
    String date3 = DateTimeFormatter.ofPattern("k").format(LocalTime.now());
    System.out.println(date1);
    System.out.println(date2);
    System.out.println(date3);
}
```

输出：

```
下午
晚上
19
```

# Stream 新增 toList 方法

之前我们都这样写，如刚刚第一条 record 时：

```java
List<SelectVO> selectVOList = list.stream().map(e-> new SelectVO(String.valueOf(e.getId()),e.getName())).collect(Collectors.toList());
```

现在直接这样：

```java
List<SelectVO> selectVOList = list.stream().map(e-> new SelectVO(String.valueOf(e.getId()),e.getName())).toList();
```

# 密封类（第二预览版）

密封的类和接口限制了其他类或接口可以扩展或实现它们

```java
public sealed interface Shape{
    final class Planet implements Shape {}
    final class Star   implements Shape {}
    final class Comet  implements Shape {}
}
```

```java
public abstract sealed class Test{
    final class A extends Test {}
    final class B extends Test {}
    final class C extends Test {}
}
```

# 模式匹配 instanceof（最终版）

之前写：

```java
if (obj instanceof String) {
    String s = (String) obj;
    ...
}
```

之后写：

```java
if (obj instanceof String s) {
    // 直接使用s，少一行代码
    ...
}   
```

# 打包工具

提供jpackage用于打包独立Java应用程序的工具。

将jpackage tool被引入作为JDK 14的孵化工具通过JEP343它在JDK 15仍然是一个孵化工具，以便有时间额外的反馈。

它已在JDK16中从孵化升级为可用于生产的功能。

由于此过渡，jpackage模块的名称已从更改jdk.incubator.jpackage为jdk.jpackage。

# 其他

其他的优化功能跟日常开发没有关系，就不记录了。

# 参考资料

https://my.oschina.net/mdxlcj/blog/5055983

* any list
{:toc}