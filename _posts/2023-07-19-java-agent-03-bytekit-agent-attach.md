---
layout: post
title: java agent-03-Java Instrumentation 结合 bytekit 实战笔记 agent attach
date:  2023-07-12 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# 拓展阅读

前面几篇文档，我们简单介绍了一下 java Instrumentation。

[java agent 介绍](https://houbb.github.io/2023/07/12/java-agent-01-intro)

[Java Instrumentation API](https://houbb.github.io/2023/07/12/java-agent-02-instrumentation-api)

本篇我们结合一下 [bytekit](https://houbb.github.io/2023/08/09/java-agent-02-bytekit) 进行实际的文件修改。


# 测试代码

## 整体目录

```
    │  │  └─com
    │  │      └─github
    │  │          └─houbb
    │  │              └─bytekit
    │  │                  └─learn
    │  │                      └─agentattach
    │  │                          │  AgentAttachMain.java
    │  │                          │  MyAttachMain.java
    │  │                          │  MyClassFileTransformer.java
    │  │                          │  package-info.java
    │  │                          │
    │  │                          └─interceptor
    │  │                                  SampleInterceptor.java
    │  │
    │  └─resources
    │      └─META-INF
    │              MANIFEST.MF
    │
    └─test
        └─java
            └─com.github.houbb.bytekit.learn.agentattach
                    Sample.java
                    TestMain.java
```

## MANIFEST.MF

```
Manifest-Version: 1.0
Agent-Class: com.github.houbb.bytekit.learn.agentattach.AgentAttachMain
Can-Redefine-Classes: true
Can-Retransform-Classes: true
```

### AgentAttachMain-核心入口

这里指定了核心入口 AgentAttachMain

- AgentAttachMain.java

动态 Attach 的 agent 与通过 JVM 启动 javaagent 参数指定的 agent jar 包的方式有所不同，动态 Attach 的 agent 会执行 agentmain 方法，而不是 premain 方法。

```java
package com.github.houbb.bytekit.learn.agentattach;

import java.lang.instrument.ClassFileTransformer;
import java.lang.instrument.Instrumentation;
import java.lang.instrument.UnmodifiableClassException;

public class AgentAttachMain {


    /**
     * 动态 Attach 的 agent 会执行 agentmain 方法，而不是 premain 方法。
     *
     * @param agentArgs
     * @param inst
     * @throws ClassNotFoundException
     * @throws UnmodifiableClassException
     */
    public static void agentmain(String agentArgs, Instrumentation inst) throws ClassNotFoundException, UnmodifiableClassException {
        System.out.println("agentmain called");

        Class classes[] = inst.getAllLoadedClasses();
        for (int i = 0; i < classes.length; i++) {
            String className = classes[i].getName();
            System.out.println(className);
            // 这里是正常的全称
            if (className.equals("com.github.houbb.bytekit.learn.agentattach.Sample")) {
                System.out.println("Reloading start: " + className);

                // 真实的替换
                final ClassFileTransformer transformer = new MyClassFileTransformer();
                inst.addTransformer(transformer, true);
                inst.retransformClasses(classes[i]);
                inst.removeTransformer(transformer);

                System.out.println("Reloading done: " + className);
                break;
            }
        }
    }

}
```

MyClassFileTransformer 和上一篇类似，这里不过使用 bytekit 时要区分一下 install 的方式，或者会卡主。

此处不再赘述。

## attach-main 

创建MyAttachMain类，实现attach到目标进程 （为了方便我还是放在agent项目中）

因为是跨进程通信，Attach 的发起端是一个独立的 java 程序，这个 java 程序会调用 VirtualMachine.attach 方法开始和目标 JVM 进行跨进程通信。

下面的PID通过jps查看对应的进程ID，如11901

jarPath 为当前 agent 的完整包路径。

```java
package com.github.houbb.bytekit.learn.agentattach;

import com.github.houbb.bytekit.tool.utils.AttachHelper;
import com.sun.tools.attach.VirtualMachine;

public class MyAttachMain {

    /**
     * 指定 pid 进行 attch
     *
     * @param args
     * @throws Exception
     */
    public static void main(String[] args) throws Exception {
        String pid = "15708";
        String jarPath = "D:\\github\\bytekit-learn\\bytekit-learn-agentattach\\target\\bytekit-learn-agentattach-1.0-SNAPSHOT.jar";
        AttachHelper.attach(jarPath, pid);

        // 通过 jps 查看
        VirtualMachine vm = VirtualMachine.attach(pid);
        try {
            vm.loadAgent(jarPath);
        } finally {
            vm.detach();
        }
    }

}
```

## 测试



### 启动测试类

为了演示 attach，我们提供一个一直循环的测试类：

```java
public class TestMain {

    public static void main(String[] args) throws InterruptedException {
        while (true) {
            Sample sample = new Sample();
            String result = sample.hello("123", false);
            System.out.println(result);

            TimeUnit.SECONDS.sleep(3);
        }
    }

}
```

首先启动测试类。通过 jps 获取对应的信息

```
14028 RemoteMavenServer36
15100 Launcher
15708 TestMain
```

### 编译 agent

通过 `mvn clean install` 编译我们的 agent 包，生成在路径：

```
D:\\github\\bytekit-learn\\bytekit-learn-agentattach\\target\\bytekit-learn-agentattach-1.0-SNAPSHOT.jar
```

### 修改 attach-main 并启动

直接把 MyAttachMain 的 pid + agent 路径修改为对应的。启动测试：

对应的日志如下，实现已经被替换了

```
com.github.houbb.bytekit.learn.agentattach.Sample
Reloading start: com.github.houbb.bytekit.learn.agentattach.Sample
start transform name=== com/github/houbb/bytekit/learn/agentattach/Sample
/*
 * Decompiled with CFR.
 */
package com.github.houbb.bytekit.learn.agentattach;

public class Sample {
    private int exceptionCount = 0;

    /*
     * WARNING - void declaration
     */
    public String hello(String string, boolean bl) {
        try {
            String string2;
            void str;
            void exception;
            try {
                String string3 = "(Ljava/lang/String;Z)Ljava/lang/String;";
                String string4 = "hello";
                Object[] objectArray = new Object[]{string, new Boolean(bl)};
                Class<Sample> clazz = Sample.class;
                Sample sample = this;
                System.out.println("atEnter, args[0]: " + objectArray[0]);
            }
            catch (RuntimeException runtimeException) {
                Class<Sample> clazz = Sample.class;
                RuntimeException runtimeException2 = runtimeException;
                System.out.println("exception handler: " + clazz);
                runtimeException2.printStackTrace();
            }
            if (exception != false) {
                ++this.exceptionCount;
                throw new RuntimeException("test exception, str: " + (String)str);
            }
            String string5 = string2 = "hello " + (String)str;
            System.out.println("atExit, returnObject: " + string5);
            return string2;
        }
        catch (RuntimeException runtimeException) {
            int n = this.exceptionCount;
            RuntimeException runtimeException3 = runtimeException;
            System.out.println("atExceptionExit, ex: " + runtimeException3.getMessage() + ", field exceptionCount: " + n);
            throw runtimeException;
        }
    }
}

end transform name=== com/github/houbb/bytekit/learn/agentattach/Sample
Reloading done: com.github.houbb.bytekit.learn.agentattach.Sample
atEnter, args[0]: 123
atExit, returnObject: hello 123
hello 123
atEnter, args[0]: 123
atExit, returnObject: hello 123
hello 123
atEnter, args[0]: 123
atExit, returnObject: hello 123
hello 123
atEnter, args[0]: 123
atExit, returnObject: hello 123
hello 123
```

# 拓展阅读

## VirtualMachine 类不存在

添加jdk tools.jar解决com.sun.tools.attach.VirtualMachine 类找不到的问题

发现配置了 java_home 及相关信息还是不行，可以手动在项目中引入。

idea 就是 libs 种添加依赖。

# 参考资料

https://blog.51cto.com/zhangxueliang/5667216

https://www.cnblogs.com/756623607-zhang/p/12575509.html

* any list
{:toc}