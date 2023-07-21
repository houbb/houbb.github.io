---
layout: post
title:  Annotation-05-Spring aop pointcut 基础知识
date:  2018-07-02 21:19:54 +0800
categories: [Java]
tags: [java, annotation, spring, aop]
published: true
---

# pointcut 基础知识

## 格式

```
execution(modifiers-pattern? ret-type-pattern declaring-type-pattern? name-pattern(param-pattern)throws-pattern?) 

修饰符匹配（modifier-pattern?）
返回值匹配（ret-type-pattern）可以为*表示任何返回值,全路径的类名等
类路径匹配（declaring-type-pattern?）
方法名匹配（name-pattern）可以指定方法名 或者 *代表所有, set* 代表以set开头的所有方法
参数匹配（(param-pattern)）可以指定具体的参数类型，多个参数间用","隔开，各个参数也可以用"*"来表示匹配任意类型的参数，如(String)表示匹配一个String参数的方法；(*,String) 表示匹配有两个参数的方法，第一个参数可以是任意类型，而第二个参数是String类型；可以用(..)表示零个或多个任意参数
异常类型匹配（throws-pattern?）
其中后面跟着"?"的是可选项

1）execution(* *(..))  
//表示匹配所有方法  
2）execution(public * com. savage.service.UserService.*(..))  
//表示匹配com.savage.server.UserService中所有的公有方法  
3）execution(* com.savage.server..*.*(..))  
//表示匹配com.savage.server包及其子包下的所有方法 
```

# 瞅一眼标准的AspectJ Aop的pointcut的表达式

标准的AspectJ Aop的pointcut的表达式类型是很丰富的

见org.aspectj.weaver.tools.PointcutPrimitive

这个枚举类：

```java
package org.aspectj.weaver.tools;

import org.aspectj.util.TypeSafeEnum;

/**
 * An enumeration of the different kinds of pointcut primitives
 * supported by AspectJ.
 */
public final class PointcutPrimitive extends TypeSafeEnum {

	public static final PointcutPrimitive CALL = new PointcutPrimitive("call",1);
	public static final PointcutPrimitive EXECUTION = new PointcutPrimitive("execution",2);
	public static final PointcutPrimitive GET = new PointcutPrimitive("get",3);
	public static final PointcutPrimitive SET = new PointcutPrimitive("set",4);
	public static final PointcutPrimitive INITIALIZATION = new PointcutPrimitive("initialization",5);
	public static final PointcutPrimitive PRE_INITIALIZATION = new PointcutPrimitive("preinitialization",6);
	public static final PointcutPrimitive STATIC_INITIALIZATION = new PointcutPrimitive("staticinitialization",7);
	public static final PointcutPrimitive HANDLER = new PointcutPrimitive("handler",8);
	public static final PointcutPrimitive ADVICE_EXECUTION = new PointcutPrimitive("adviceexecution",9);
	public static final PointcutPrimitive WITHIN = new PointcutPrimitive("within",10);
	public static final PointcutPrimitive WITHIN_CODE = new PointcutPrimitive("withincode",11);
	public static final PointcutPrimitive CFLOW = new PointcutPrimitive("cflow",12);
	public static final PointcutPrimitive CFLOW_BELOW = new PointcutPrimitive("cflowbelow",13);
	public static final PointcutPrimitive IF = new PointcutPrimitive("if",14);
	public static final PointcutPrimitive THIS = new PointcutPrimitive("this",15);
	public static final PointcutPrimitive TARGET = new PointcutPrimitive("target",16);
	public static final PointcutPrimitive ARGS = new PointcutPrimitive("args",17);
	public static final PointcutPrimitive REFERENCE = new PointcutPrimitive("reference pointcut",18);
	public static final PointcutPrimitive AT_ANNOTATION = new PointcutPrimitive("@annotation",19);
	public static final PointcutPrimitive AT_THIS = new PointcutPrimitive("@this",20);
	public static final PointcutPrimitive AT_TARGET = new PointcutPrimitive("@target",21);
	public static final PointcutPrimitive AT_ARGS = new PointcutPrimitive("@args",22);
	public static final PointcutPrimitive AT_WITHIN = new PointcutPrimitive("@within",23);
	public static final PointcutPrimitive AT_WITHINCODE = new PointcutPrimitive("@withincode",24);

	private PointcutPrimitive(String name, int key) {
		super(name, key);
	}

}
```


# SpringAop的十一种AOP表达式

SpringAop只支持标准的AspectJ Aop的pointcut的表达式类型其中的10种，外加Spring Aop自己扩充的一种一共是11(10+1)种类型的表达式，分别如下。

1.execution：一般用于指定方法的执行，用的最多。
2.within：指定某些类型的全部方法执行，也可用来指定一个包。
3.this：Spring Aop是基于动态代理的，生成的bean也是一个代理对象，this就是这个代理对象，当这个对象可以转换为指定的类型时，对应的切入点就是它了，Spring Aop将生效。
target：当被代理的对象可以转换为指定的类型时，对应的切入点就是它了，Spring Aop将生效。
4.reference pointcut：(经常使用)表示引用其他命名切入点，只有@ApectJ风格支持，Schema风格不支持
5.args：当执行的方法的参数是指定类型时生效。
6.@args：当执行的方法参数类型上拥有指定的注解时生效。
7.@within：与@target类似，看官方文档和网上的说法都是@within只需要目标对象的类或者
8.父类上有指定的注解，则@within会生效，而@target则是必须是目标对象的类上有指定的注解。而根据笔者的测试这两者都是只要目标类或父类上有指定的注解即可。
9.@annotation：当执行的方法上拥有指定的注解时生效。
10.@target：当代理的目标对象上拥有指定的注解时生效。
11.bean：当调用的方法是指定的bean的方法时生效。(Spring AOP自己扩展支持的)

注意：Pointcut定义时，还可以使用 `&&、||、!` 这三个运算。进行逻辑运算。可以把各种条件组合起来使用

# 演示使用

## 1、execution：

execution是使用的最多的一种Pointcut表达式，用于切方法。

```java
//表示匹配所有方法  
1）execution(* *(..))  
//表示匹配com.lasse.UserService中所有的公有方法  
2）execution(public * com.lasse.UserService.*(..))  
//表示匹配com.fsx.run包及其子包下的所有方法
3）execution(* com.lasse..*.*(..))
```

当我们的切面很多的时候，我们可以把所有的切面放到单独的一个类去，进行统一管理，比如下面：

```java
//集中管理所有的切入点表达式
public class Pointcuts {
 
@Pointcut("execution(* *Message(..))")
public void logMessage(){}
 
}
```

引用方式

```java
@Before("com.lasse.Pointcuts.logMessage()")
public void before(JoinPoint joinPoint) {
	System.out.println("do something");
}
```

## 2、within：

within是用来指定类型的，指定类型中的所有方法将被拦截。

不拦截其子类，所以切接口没用。

```java
//此处只能写实现类
@Pointcut("within(com.lasse.service.impl.AServiceImpl)")
public void pointCut() {
}

//匹配包以及子包内的所有类
@Pointcut("within(com.lasse.service..*)")
public void pointCut() {
}
```

## 3、this：

Spring Aop是基于代理的，this就表示代理对象。

this类型的Pointcut表达式的语法是this(type)，当生成的代理对象可以转换为type指定的类型时则表示匹配。

基于JDK接口的代理和基于CGLIB的代理生成的代理对象是不一样的。

```java
// 拦截到AService所有的子类的所有外部调用方法
@Pointcut("this(com.lasse.service.AService*)")
public void pointCut() {
}
```

## 4、target：

Spring Aop是基于代理的，target则表示被代理的目标对象。

当被代理的目标对象可以被转换为指定的类型时则表示匹配。

注意：和上面不一样，这里是target，因此如果要切入，只能写实现类了

```java
@Pointcut("target(com.lasse.service.impl.AServiceImpl)")
public void pointCut() {
}
```

## 5、args：

args用来匹配方法参数的。

- 1、"args()"匹配任何不带参数的方法。

- 2、"args(java.lang.String)"匹配任何只带一个参数，而且这个参数的类型是String的方法。

- 3、"args(…)"带任意参数的方法。

- 4、"args(java.lang.String,…)"匹配带任意个参数，但是第一个参数的类型是String的方法。

- 5、"args(…,java.lang.String)"匹配带任意个参数，但是最后一个参数的类型是String的方法。

```java
@Pointcut("args()")
public void pointCut() {
}
```

## 6、@target：

@target 匹配当被代理的目标对象对应的类型及其父类型上拥有指定的注解时。

```java
//能够切入类上（非方法上）标准了@MyAnno注解的所有外部调用方法
    @Pointcut("@target(com.lasse.anno.MyAnno)")
    public void pointCut() {
    }
```

## 7、@args：

`@args` 匹配被调用的方法上含有参数，且对应的参数类型上拥有指定的注解的情况。

例如：

```java
// 匹配**方法参数类型上**拥有MyAnno注解的方法调用。
//如我们有一个方法add(MyParam param)接收一个MyParam类型的参数，而MyParam这个类是拥有注解MyAnno的，则它可以被Pointcut表达式匹配上
    @Pointcut("@args(com.lasse.anno.MyAnno)")
    public void pointCut() {
    }
```

## 8、@within：

`@within` 用于匹配被代理的目标对象对应的类型或其父类型拥有指定的注解的情况，但只有在调用拥有指定注解的类上的方法时才匹配。

`@within(com.github.houbb.anno.MyAnno)` 匹配被调用的方法声明的类上拥有MyAnno注解的情况。

比如有一个ClassA上使用了注解MyAnno标注，并且定义了一个方法a()，那么在调用ClassA.a()方法时将匹配该Pointcut；如果有一个ClassB上没有MyAnno注解，但是它继承自ClassA，同时它上面定义了一个方法b()，那么在调用ClassB().b()方法时不会匹配该Pointcut，但是在调用ClassB().a()时将匹配该方法调用，因为a()是定义在父类型ClassA上的，且ClassA上使用了MyAnno注解。

但是如果子类ClassB覆写了父类ClassA的a()方法，则调用ClassB.a()方法时也不匹配该Pointcut。

## 9、@annotation：

使用得也比较多

`@annotation` 用于匹配方法上拥有指定注解的情况。

```java
// 可以匹配所有方法上标有此注解的方法
@Pointcut("@annotation(com.lasse.anno.MyAnno)")
public void pointCut() {
}

//或者:非常方便的获取到方法上面的注解
@Before("@annotation(myAnno)")
public void doBefore(JoinPoint joinPoint, MyAnno myAnno) {
    System.out.println(myAnno); //@com.lasse.anno.MyAnno()
    System.out.println("AOP Before Advice...");
}
```

## 10、reference pointcut：

切入点引用（使用得非常多）

```java
@Aspect
public class HelloAspect {
    @Pointcut("execution(* com.lasse.service.*.*(..)) ")
    public void point() {
    }
    // 这个就是一个`reference pointcut`  甚至还可以这样 @Before("point1() && point2()")
    @Before("point()")  
    public void before() {
        System.out.println("this is from HelloAspect#before...");
    }
}
```

## 11、bean：

这是Spring增加的一种方法，spring独有

bean用于匹配当调用的是指定的Spring的某个bean的方法时。

1、"bean(abc)"匹配Spring Bean容器中id或name为abc的bean的方法调用。

2、"bean(user*)"匹配所有id或name为以user开头的bean的方法调用。

```java
// 这个就能切入到AServiceImpl类的所有的外部调用的方法里
@Pointcut("bean(AServiceImpl)")
public void pointCut() {
}
```

# 四、类型匹配语法

1、`*`：匹配任何数量字符；

2、`…`：匹配任何数量字符的重复，如在类型模式中匹配任何数量子包；而在方法参数模式中匹配任何数量参数。

3、`+`：匹配指定类型的子类型；仅能作为后缀放在类型模式后边。

# 五、表达式的组合

表达式的组合其实就是对应的表达式的逻辑运算，与、或、非。可以通过它们把多个表达式组合在一起。

1、"bean(userService) && args()" 匹配id或name为userService的bean的所有无参方法。

2、"bean(userService) || @annotation(MyAnnotation)" 匹配id或name为userService的bean的方法调用，或者是方法上使用了MyAnnotation注解的方法调用。

3、"bean(userService) && !args()" 匹配id或name为userService的bean的所有有参方法调用。

# 参考资料

[Spring AOP中定义切点PointCut详解](https://www.cnblogs.com/mihutao/p/17062449.html)

* any list
{:toc}