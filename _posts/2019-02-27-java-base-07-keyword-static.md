---
layout: post
title: java base-07-keyword static
date:  2019-2-27 09:48:47 +0800
categories: [Java]
tags: [static, java-base]
published: true
---


## import static

It's not a good way to extends static members from super class. like this code in struts2.
 
```java
 public class ActionSupport {
     public static String SUCCESS = "success";
     public static String ERROR = "error";
 }
```
 
 <label class="label label-warning">common</label>
 
 
```java
 public class StaticAction extends ActionSupport {
     public static void main(String[] args) {
         System.out.println(SUCCESS);
     }
 }
```
 
 <label class="label label-success">elegant</label>
 
 
```java
 import static com.ryo.dao.ActionSupport.*;
 
 public class StaticImport {
     public static void main(String[] args) {
         System.out.println(SUCCESS);
     }
 }
```


* any list
{:toc}