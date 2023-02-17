---
layout: post
title: java 多线程测试工具-GroboUtils
date:  2019-1-23 13:44:33 +0800
categories: [Test]
tags: [test, util, sh]
published: true
---

# GroboUtils

[GroboUtils](http://groboutils.sourceforge.net/) 旨在扩展Java的测试可能性。 

它包含许多子项目，它们通过Java实验测试的不同方面。

GroboUtils中包含的流行工具包括多线程测试，分层单元测试和代码覆盖工具。

此工具集在MIT许可下发布。

# 快速开始

Junit本身是不支持普通的多线程测试的，这是因为Junit的底层实现上，是用System.exit退出用例执行的。

JVM都终止了，在测试线程启动的其他线程自然也无法执行。

## maven jar 引入

```xml
<dependency>
     <groupId>net.sourceforge.groboutils</groupId>
     <artifactId>groboutils-core</artifactId>
      <version>5</version>
</dependency>
```

## 测试代码

```java
@Test  
public void testThreadJunit() throws Throwable {   
    //Runner数组，相当于并发多少个。 
    TestRunnable[] trs = new TestRunnable [10];  
    for(int i=0;i<10;i++){  
        trs[i]=new ThreadA();  
    }  

    // 用于执行多线程测试用例的Runner，将前面定义的单个Runner组成的数组传入 
    MultiThreadedTestRunner mttr = new MultiThreadedTestRunner(trs);  
    
    // 开发并发执行数组里定义的内容 
    mttr.runTestRunnables();  
    
    
}  

private class ThreadA extends TestRunnable {  
    @Override  
    public void runTest() throws Throwable {  
        // 测试内容
        myCommMethod2();  
    }  
}  

public void myCommMethod2() throws Exception {  
    System.out.println("===" + Thread.currentThread().getId() + "begin to execute myCommMethod2"); 
} 
```

# 参考资料

http://groboutils.sourceforge.net/

https://blog.csdn.net/sanniao/article/details/52640725

* any list
{:toc}