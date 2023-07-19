---
layout: post
title: Aopalliance-03-原生 AspectJ 3 种织入方式及 spring-aop 原理分析
date:  2019-2-26 09:48:47 +0800
categories: [Java]
tags: [java, aop, sh]
published: true
---

# 前言

前两天看了一些关于spring aop以及AspectJ的文章，但是总是感觉非常的乱，有的说spring aop跟aspectj相互独立，有的说spring aop依赖于aspectj，有的甚至直接把两者混为一谈。

很多专门讲Aspectj的文章也只是搬运了AspectJ的语法，就那么一两点东西，讲来讲去也没有什么新意。

甚至很多甚至都是面向IDE编程(教你怎么安装插件，点击菜单)，对AspectJ的使用方式和工作原理都不去分析，离开了IDE的支持甚至连编译都不会了。

我认为咱们这些码农平时习惯用IDE并没有问题，但是不仅要做到会用IDE，而且要做到超越IDE，这样才能站到更高一点的视角看出工具的本来面目而不是受工具的局限。

# 为什么用AspectJ

为什么用AspectJ，我的理解是两个字”方便“。我们知道面向切面编程(Aspect Oriented Programming)有诸多好处，但是在使用AspectJ之前我们一般是怎么编写切面的呢？

我想一般来说应该是三种吧:静态代理，jdk动态代理，cglib动态代理。但是我们知道，静态代理的重用性太差，一个代理不能同时代理多种类；动态代理可以做到代理的重用，但是即使这样，他们调用起来还是比较麻烦，除了写切面代码以外，我们还需要将代理类耦合进被代理类的调用阶段，在创建被代理类的时候都要先创建代理类，再用代理类去创建被代理类，这就稍微有点麻烦了。

比如我们想在现有的某个项目里统一新加入一些切面，这时候就需要创建切面并且侵入原有代码，在创建对象的时候添加代理，还是挺麻烦的。

说到底，这种麻烦出现的本质原因是，代理模式并没有做到切面与业务代码的解耦。

虽然将切面的逻辑独立进了代理类，但是决定是否使用切面的权利仍然在业务代码中。这才导致了上面这种麻烦。

(当然，话不能说的这么绝对，如果有那种类似Spring的IoC容器，将类的创建都统一托管起来，我们只需要将切面用配置文件进行注册，容器会根据注册信息在创建bean的时候自动加上代理，这也是比较方便的。不过并不是所有框架都提供IoC机制的吧。。。)

既然代理模式这么麻烦，那么AspectJ又是通过什么方式来避免这个麻烦的呢？

我总结AspectJ提供了两套强大的机制：

第一套是切面语法。就是网上到处都是的那种所谓”AspectJ使用方法”，这套东西做到了将决定是否使用切面的权利还给了切面。在写切面的时候就可以决定哪些类的哪些方法会被代理，从而从逻辑上不需要侵入业务代码。由于这套语法实在是太有名，导致很多人都误以为AspectJ等于切面语法，其实不然。

第二套是织入工具。刚才讲到切面语法能够让切面从逻辑上与业务代码解耦，但是从操作上来讲，当JVM运行业务代码的时候，他甚至无从得知旁边还有个类想横插一刀。。。这个问题大概有两种解决思路，一种就是提供注册机制，通过额外的配置文件指明哪些类受到切面的影响，不过这还是需要干涉对象创建的过程；另外一种解决思路就是在编译期(或者类加载期)我们优先考虑一下切面代码，并将切面代码通过某种形式插入到业务代码中，这样业务代码不就知道自己被“切”了么？这种思路的一个实现就是aspectjweaver，就是这里的织入工具。

# AspectJ究竟怎么用

一提起AspectJ，其实我感觉绝大多数人都会联想到Spring。毕竟，大多数人都是通过spring才接触到了AspectJ。

可事实上Spring只是用到了AspectJ的冰山一角，局限于Spring恐怕是不能很好的理解AspectJ的，因此这一节我讲不涉及任何spring的东西，单看下AspectJ。

事实上AspectJ提供了两套对切面的描述方法，一种就是我们常见的基于java注解切面描述的方法，这种方法兼容java语法，写起来十分方便，不需要IDE的额外语法检测支持；

另外一种是基于aspect文件的切面描述方法，这种语法本身并不是java语法，因此写的时候需要IDE的插件支持才能进行语法检查。

# AspectJ相关jar包

AspectJ其实是eclipse基金会的一个项目，官网就在eclipse官网里。

官网里提供了一个aspectJ.jar的下载链接，但其实这个链接只是一个安装包，把安装包里的东西解压后就是一个文档+脚本+jar包的程序包，其中比较重要的是如下部分：

```
:~/aspectj1.8$ tree bin/ lib/
bin/
├── aj
├── aj5
├── ajbrowser
├── ajc
└── ajdoc
lib/
├── aspectjrt.jar
├── aspectjtools.jar
├── aspectjweaver.jar
└── org.aspectj.matcher.jar
```

当然，这些jar包并不总是需要从官网下载，很多情况下在maven等中心库中直接找会更方便。

这当中重点的文件是四个jar包中的前三个，bin文件夹中的脚本其实都是调用这些jar包的命令。

aspectjrt.jar包主要是提供运行时的一些注解，静态方法等等东西，通常我们要使用aspectJ的时候都要使用这个包。
aspectjtools.jar包主要是提供赫赫有名的ajc编译器，可以在编译期将将java文件或者class文件或者aspect文件定义的切面织入到业务代码中。通常这个东西会被封装进各种IDE插件或者自动化插件中。
aspectjweaverjar包主要是提供了一个java agent用于在类加载期间织入切面(Load time weaving)。并且提供了对切面语法的相关处理等基础方法，供ajc使用或者供第三方开发使用。这个包一般我们不需要显式引用，除非需要使用LTW。

上面的说明其实也就指出了aspectJ的几种标准的使用方法(参考文档)：

编译时织入，利用ajc编译器替代javac编译器，直接将源文件(java或者aspect文件)编译成class文件并将切面织入进代码。
编译后织入，利用ajc编译器向javac编译期编译后的class文件或jar文件织入切面代码。
加载时织入，不使用ajc编译器，利用aspectjweaver.jar工具，使用java agent代理在类加载期将切面织入进代码。


# 基于aspectj文件的AspectJ

这种说法比较蛋疼，其实我想说明的是这种不兼容javac的一种切面表示形式。

比如当前我们有一个业务类App.java:

```java
public class App {
    public void say() {
        System.out.println("App say");
    }
    public static void main(String[] args) {
        App app = new App();
        app.say();
    }
}
```

我们希望对在say函数里加一个切面,那就创建一个 AjAspectj.aj 的文件:

```java
public aspect AjAspect {
    pointcut say():
            execution(* App.say(..));
    before(): say() {
        System.out.println("AjAspect before say");
    }
    after(): say() {
        System.out.println("AjAspect after say");
    }
}
```

这样我们就能实现切面的功能。可这个aj文件的语法虽然跟java很类似，但是毕竟还是不能用javac来编译，如果我们要用这个的话就必须使用ajc编译器。

使用的方法大概有这几种:

1. 调用命令直接编译(直接使用ajc命令或者调用java -jar aspectjtools.jar)

2. 使用IDE集成的ajc编译器编译

3. 使用自动化构建工具的插件编译

其实2,3两点的本质都是使用aspectjtools.jar，最简单的调用方法如下:

```sh
#!/usr/bin/env bash
ASPECTJ_TOOLS=/home/myths/.m2/repository/org/aspectj/aspectjtools/1.8.9/aspectjtools-1.8.9.jar
ASPECTJ_RT=/home/myths/.m2/repository/org/aspectj/aspectjrt/1.8.9/aspectjrt-1.8.9.jar
java -jar $ASPECTJ_TOOLS -cp $ASPECTJ_RT -sourceroots .
```

调用aspectjtools.jar包，指定aspectjrt的classpath，以及需要编译的路径，这样就会生成AjAspectj.aj以及App.java对应的class文件。

我们反编译一下看看：

AjAspectj.class:

```java
import java.io.PrintStream;
import org.aspectj.lang.NoAspectBoundException;
public class AjAspect
{
  private static Throwable ajc$initFailureCause;
  public static final AjAspect ajc$perSingletonInstance;
  
  public static AjAspect aspectOf()
  {
    if (ajc$perSingletonInstance == null) {
      throw new NoAspectBoundException("AjAspect", ajc$initFailureCause);
    }
    return ajc$perSingletonInstance;
  }
  
  public static boolean hasAspect()
  {
    return ajc$perSingletonInstance != null;
  }
  
  private static void ajc$postClinit()
  {
    ajc$perSingletonInstance = new AjAspect();
  }
  
  static
  {
    try
    {
      
    }
    catch (Throwable localThrowable)
    {
      ajc$initFailureCause = localThrowable;
    }
  }
  
  public void ajc$before$AjAspect$1$682722c()
  {
    System.out.println("AjAspect before say");
  }
  
  public void ajc$after$AjAspect$2$682722c()
  {
    System.out.println("AjAspect after say");
  }
}
```

- App.class:

```java
import java.io.PrintStream;
public class App
{
  public void say()
  {
    try
    {
      AjAspect.aspectOf().ajc$before$AjAspect$1$682722c();System.out.println("App say");
    }
    catch (Throwable localThrowable)
    {
      AjAspect.aspectOf().ajc$after$AjAspect$2$682722c();throw localThrowable;
    }
    AjAspect.aspectOf().ajc$after$AjAspect$2$682722c();
  }
  
  public static void main(String[] args)
  {
    App app = new App();
    app.say();
  }
}
```

调用App.class，发现切面成功生效：

```
$ java -cp ~/.m2/repository/org/aspectj/aspectjrt/1.8.9/aspectjrt-1.8.9.jar:.  App
AjAspect before say
App say
AjAspect after say
```

我们发现aj文件的确被编译成了一个单例类，并且生成了一些切面方法，这些方法被织入进了App类中的say方法体中，可以说是非常的暴力了。(这里顺便吐槽一波IntelliJ自带的反编译器真的很烂，还是jd-gui好用)。

不过，虽然事实上这种基于aj文件的切面描述方法比基于java注解的切面描述方法用起来要灵活的多，但是由于他无法摆脱ajc的支持，而且本身不兼容java语法导致难以统一编码规范，加上需要较多额外的学习成本，因此事实上很多项目还是不怎么用这种方式，更多的还是采用了兼容java语法的用注解定义切面的方式。

# 基于java注解的AspectJ

下面我们主要还是着力考虑下基于java注解的切面使用方法。

## 准备

先建一个普通的项目看看，老样子，从maven的maven-archetype-quickstart开始，pom.xml，pom文件里我们一般只需要加上aspetjrt的依赖即可。:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.mythsman.test</groupId>
    <artifactId>aspect-test</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>jar</packaging>
    <name>work</name>
    <url>http://maven.apache.org</url>
    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.aspectj</groupId>
            <artifactId>aspectjrt</artifactId>
            <version>1.8.9</version>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.7.0</version>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                </configuration>
        </plugins>
    </build>
</project>
```


## 代码

创建App.java文件:

```java
package com.mythsman.test;
public class App {
    public void say() {
        System.out.println("App say");
    }
    public static void main(String[] args) {
        App app = new App();
        app.say();
    }
}
```

创建切面类AnnoAspect.java:

```java
package com.mythsman.test;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
@Aspect
public class AnnoAspect {
    @Pointcut("execution(* com.mythsman.test.App.say(..))")
    public void jointPoint() {
    }
    @Before("jointPoint()")
    public void before() {
        System.out.println("AnnoAspect before say");
    }
    @After("jointPoint()")
    public void after() {
        System.out.println("AnnoAspect after say");
    }
}
```

当前项目结构应该是这样的：

```
.
├── pom.xml
├── src
│   └── main
│       ├── java
│       │   └── com
│       │       └── mythsman
│       │           └── test
│       │               └── App.java
│       │               ├── AnnoAspect.java
```

其实就是创建了一个对App类进行切面的AnnoAspect类，这个类需要加上 `@Aspect` 注解用以声明这是一个切面，以及其他相关切面语法。接下来我们就来尝试下三种不同的编译方式。

## 编译时织入

编译时织入其实就是使用ajc来进行编译，暂时不使用自动化构建工具，我们先在项目根目录下手动写一个编译脚本compile.sh:

```sh
#!/usr/bin/env bash
ASPECTJ_WEAVER=/home/myths/.m2/repository/org/aspectj/aspectjweaver/1.8.13/aspectjweaver-1.8.13.jar
ASPECTJ_RT=/home/myths/.m2/repository/org/aspectj/aspectjrt/1.8.9/aspectjrt-1.8.9.jar
ASPECTJ_TOOLS=/home/myths/.m2/repository/org/aspectj/aspectjtools/1.8.9/aspectjtools-1.8.9.jar
java -jar $ASPECTJ_TOOLS -cp $ASPECTJ_RT -source 1.5 -sourceroots src/main/java/ -d target/classes
```

调用aspectjtools.jar，在-cp里指明aspectjrt.jar的路径，-source 1.5指明支持java1.5以后的注解，-sourceroots指明编译的文件夹，-d指明输出路径。

这样就会生成AnnoAspect.class和App.class两个文件。

- AnnoAspect.class:

```java
package com.mythsman.test;
import java.io.PrintStream;
import org.aspectj.lang.NoAspectBoundException;
import org.aspectj.lang.annotation.After;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
@Aspect
public class AnnoAspect
{
  public static AnnoAspect aspectOf()
  {
    if (ajc$perSingletonInstance == null) {
      throw new NoAspectBoundException("com.mythsman.test.AnnoAspect", ajc$initFailureCause);
    }
    return ajc$perSingletonInstance;
  }
  
  public static boolean hasAspect()
  {
    return ajc$perSingletonInstance != null;
  }
  
  static
  {
    try
    {
      ajc$postClinit();
    }
    catch (Throwable localThrowable)
    {
      ajc$initFailureCause = localThrowable;
    }
  }
  
  @Before("jointPoint()")
  public void before()
  {
    System.out.println("AnnoAspect before say");
  }
  
  @After("jointPoint()")
  public void after()
  {
    System.out.println("AnnoAspect after say");
  }
}
```

- App.class

```java
package com.mythsman.test;
import java.io.PrintStream;
public class App
{
  public void say()
  {
    try
    {
      AnnoAspect.aspectOf().before();System.out.println("App say");
    }
    catch (Throwable localThrowable)
    {
      AnnoAspect.aspectOf().after();throw localThrowable;
    }
    AnnoAspect.aspectOf().after();
  }
  
  public static void main(String[] args)
  {
    App app = new App();
    app.say();
  }
}
```

我们发现ajc对AnnoAspect的处理方法与跟AjAspect的处理方法类似，都是将类声明成单例，并且识别AspectJ语法，将相关函数织入到App中。

运行(在项目根目录执行):

```
$ java -cp ~/.m2/repository/org/aspectj/aspectjrt/1.8.9/aspectjrt-1.8.9.jar:src/main/java/ com.mythsman.test.App 
AnnoAspect before say
App say
AnnoAspect after say
```

## 编译后织入

编译后织入其实就是在javac编译完成后，用ajc再去处理class文件得到新的、织入过切面的class文件。

仍然是上面的项目，我们先用javac编译一下:

```sh
$ javac -cp ~/.m2/repository/org/aspectj/aspectjrt/1.8.9/aspectjrt-1.8.9.jar  -d target/classes src/main/java/com/mythsman/test/*.java
```

编译成功后生成了AnnoAspect.class以及App.class。

显然，这两个class文件反编译后还是源文件的样子，并没有什么用，因此这时候执行App的main函数发现切面并没有生效。因此我们仍然需要用ajc来处理:

```sh
!/usr/bin/env bash
ASPECTJ_WEAVER=/home/myths/.m2/repository/org/aspectj/aspectjweaver/1.8.13/aspectjweaver-1.8.13.jar
ASPECTJ_RT=/home/myths/.m2/repository/org/aspectj/aspectjrt/1.8.9/aspectjrt-1.8.9.jar
ASPECTJ_TOOLS=/home/myths/.m2/repository/org/aspectj/aspectjtools/1.8.9/aspectjtools-1.8.9.jar
java -jar $ASPECTJ_TOOLS -cp $ASPECTJ_RT -source 1.5 -inpath target/classes -d target/classes
```

这样就把target/classes中原来的class文件替换成了织入后的class文件。反编译之后发现与采用编译期织入方法的结果基本相同。

### maven自动化构建

显然，自己写脚本还是比较麻烦的，如果用如maven这样的自动化构建工具的话就会方便很多，codehaus提供了一个ajc的编译插件aspectj-maven-plugin，我们只需要在build/plugins标签下加上这个插件的配置即可:

```xml
<plugin>
    <groupId>org.codehaus.mojo</groupId>
    <artifactId>aspectj-maven-plugin</artifactId>
    <version>1.10</version>
    <configuration>
        <source>1.8</source>
        <target>1.8</target>
        <complianceLevel>1.8</complianceLevel>
    </configuration>
    <executions>
        <execution>
            <goals>
                <goal>compile</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

这个插件会绑定到编译期，采用的应该是编译后织入的方式，在maven-compiler-plugin处理完之后再工作的。

不要以为这个插件多厉害，说白了他其实就是对aspectjtools.jar的一个mojo封装而已，去看他的依赖树就会很清楚。


## 加载时织入(LTW)

前两种织入方法都依赖于ajc的编译工具，LTW却通过java agent机制在内存中操作类文件，可以不需要ajc的支持做到动态织入。

不过，这里有一个挺有意思的问题，我们知道编译期一定会编译AnnoAspect类，那么这时候通过切面语法我们就可以找到他要处理的App类，这大概就是编译阶段织入的大概流程。

但是如果在类加载期处理的话，当类加载到App类的时候，我们并不知道这个类需要被AnnoAspect处理。因此为了实现LTW，我们肯定要有个配置文件，来告诉类加载器，某某某切面需要优先考虑，他们很可能会影响其他的类。

为了实现LTW，我们需要在资源目录下配置 `META-INF/aop.xml` 文件，来告知类加载器我们当前注册的切面。

在上面的项目中，我们其实只需要创建 `src/main/resources/META-INF/aop.xml` ：

```xml
<aspectj>
    <aspects>
        <aspect name="com.mythsman.test.AnnoAspect"/>
    </aspects>
</aspectj>
```

这样，我们就可以先使用javac编译源文件，再使用java agent在运行时织入:

```sh
#!/usr/bin/env bash
ASPECTJ_WEAVER=/home/myths/.m2/repository/org/aspectj/aspectjweaver/1.8.13/aspectjweaver-1.8.13.jar
ASPECTJ_RT=/home/myths/.m2/repository/org/aspectj/aspectjrt/1.8.9/aspectjrt-1.8.9.jar
ASPECTJ_TOOLS=/home/myths/.m2/repository/org/aspectj/aspectjtools/1.8.9/aspectjtools-1.8.9.jar
java -javaagent:$ASPECTJ_WEAVER -cp $ASPECTJ_RT:target/classes/ com.mythsman.test.App
```

运行结果:

```
AnnoAspect before say
App say
AnnoAspect after say
```

当然，如果可以使用ajc的话，我们也可以通过-outxml参数来自动生成xml文件。

# 如何判断是织入还是代理

这个问题很有意思，也是非常容易被搞混的，尤其是在讨论spring aop的时候。

我们知道spring里有很多基于动态代理的设计，而我们知道动态代理也可以被用作面向切面的编程，但是spring aop本身却支持aspectj的切面语法，而且spring-aop这个包也引用了aspectj，我们知道aspectj是通过织入的方式来实现aop的。

那么spring aop究竟是通过织入还是代理来实现aop的呢？

**没错就是动态代理**

## spring aop 原理

其实spring aop还是通过动态代理来实现aop的，即使不去看他的源码，我们也可以通过简单的实验来得到这个结论。

根据aspectj的使用方式，我们知道，如果要向代码中织入切面，那么我们要么采用ajc编译，要么使用aspectjweaver的agent代理。

但是spring既没有依赖任何aspectjtools的相关jar包，虽然依赖了aspectjweaver这个包，但是并没有添加agent代理。

当然，也存在一种可能就是spring利用aspectjweaver这个包自己实现了动态织入，但是从可复用的角度讲，spring真的会自己重新造轮子？

如果真的重新造了那为啥不脱离aspectj彻底重新造，而是用一半造一半呢？

而且，我们知道用织入和用动态代理有一个很大的区别，如果**使用织入的话，那么调业务对象的getClass()方法获得的类名就是这个类本身实现的类名**；

但是如果**使用动态代理的话，调用getClass()方法获得的类名就是动态代理类的类名了**。

做一个简单的实验我们就可以发现，如果我们使用spring aop来对某一个service进行切面处理，那么调用getClass()方法获得的结果就是：

```
com.xxx.test.Myservice$$EnhancerBySpringCGLIB$$3afc9148
```

显然，虽然spring aop采用了aspectj语法来定义切面，但是在实现切面逻辑的时候还是采用CGLIB来进行动态代理的方法。

## 强行织入？

当然，如果我们想，我们也可以强行采用织入的方式，不过我们就不能将切面类注册为spring的bean，并且采用ajc插件编译或者java agent在类加载时织入。

# 参考资料

[原生 AspectJ 用法分析以及 spring-aop 原理分析](https://toutiao.io/posts/os3asg/preview)

* any list
{:toc}