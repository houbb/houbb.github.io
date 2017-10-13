---
layout: post
title:  Javassist
date:  2017-9-29 16:52:45 +0800
categories: [Java]
tags: [java]
published: true
---

# Javassist

[Javassist](http://jboss-javassist.github.io/javassist/) (Java Programming Assistant) makes Java bytecode manipulation simple. 
It is a class library for editing bytecodes in Java; it enables Java programs to define a new class at runtime and to 
modify a class file when the JVM loads it. 

> [tutorial](http://jboss-javassist.github.io/javassist/tutorial/tutorial.html) 


# Hello World

- Import jar

```xml
<dependency>
    <groupId>javassist</groupId>
    <artifactId>javassist</artifactId>
    <version>3.12.1.GA</version>
</dependency>
```

## Hello World

- Util.java

```java
/**
 * 当工具类添加此注解。将其 constructor 默认 private{};
 * Created by bbhou on 2017/9/29.
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Inherited
public @interface Util {
}
```

- UtilInterceptor.java


```java
/**
 * Util 注解解释器
 * Created by bbhou on 2017/9/29.
 */
@Util
public class UtilInterceptor {

    /**
     * 对类进行增强
     * 1. 添加私有构造器
     */
    public static void enhance() {
        try {
            ClassPool classPool = ClassPool.getDefault();
            CtClass ctClass = classPool.getCtClass(UtilInterceptor.class.getName());
            Util util = (Util) ctClass.getAnnotation(Util.class);
            if (util != null) {
                System.out.println("========================== 开始增强 ==========================");
                CtConstructor constructor = ctClass.getDeclaredConstructor(null);
                constructor.setModifiers(Modifier.PRIVATE);
                byte[] bytes = ctClass.toBytecode();

                //1. 为方便此处路径写死，实际编写可动态获取
                final String targetPath = "D:\\CODE\\paradise\\paradise-core\\target\\classes\\com\\ryo\\paradise\\core\\interceptor\\UtilInterceptor.class";
                FileOutputStream fileOutputStream = new FileOutputStream(new File(targetPath));
                fileOutputStream.write(bytes);
                fileOutputStream.flush();
                fileOutputStream.close();
                System.out.println("========================== 结束增强 ==========================");
            }
        } catch (NotFoundException e) {
            e.printStackTrace();
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (CannotCompileException e) {
            e.printStackTrace();
        }
    }
}
```

- SimpleTest.java

```java
public class SimpleTest {

    public static void main(String[] args) {
        //运行之后 class 内容会被修改
        UtilInterceptor.enhance();

        //第二次运行此处会报错
        //Exception in thread "main" java.lang.IllegalAccessError: tried to access method com.ryo.paradise.core.interceptor.UtilInterceptor.<init>()V from class SimpleTest
        //at SimpleTest.main(SimpleTest.java:13)
        new UtilInterceptor();
    }

}
```

# Thinking 

使用这种修饰方式，比较适合**运行时**的增强。(spring 实现原理)

但是如果想实现**编译时**的修改，就需要借助 JCTree。(Java 编译原理)


* any list
{:toc}












 

