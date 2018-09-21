---
layout: post
title:  Java IO-06-异常处理
date:  2018-09-21 17:36:38 +0800
categories: [Java]
tags: [java, io, java-base, sf]
published: true
excerpt: java io 入门系列-06-异常处理
---

# 异常处理

## 错误实例

```java
InputStream input = new FileInputStream("c:\\data\\input-text.txt");

int data = input.read();

while(data != -1) {

    //do something with data...  

    doSomethingWithData(data);

    data = input.read();

}

input.close();
```

## 基本正确例子

```java
InputStream input = null;
try{
    input = new FileInputStream("c:\\data\\input-text.txt");
    int data = input.read();
    while(data != -1) {
        //do something with data...
        doSomethingWithData(data);
        data = input.read();
    }
} catch(IOException e){
    //do something with e... log, perhaps rethrow etc.
} finally {
    if(input != null) {
        try{
            if(input != null)
                input.close();
        } catch(IOException e){
            //do something, or ignore.
        }  
    }
}
```

# TRW

```java
try(InputStream input = new FileInputStream("c:\\data\\input-text.txt");){
    input = new FileInputStream("c:\\data\\input-text.txt");
    int data = input.read();
    while(data != -1) {
        //do something with data...
        doSomethingWithData(data);
        data = input.read();
    }
} catch(IOException e){
    //do something with e... log, perhaps rethrow etc.
} 
```

# 参考资料

http://ifeve.com/java-io-exception/

* any list
{:toc}