---
layout: post
title: test-04-junit generate 单元测试代码生成
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [junit, test, generate]
published: true
---


# 产品小工具

## 说明

直接可以用户使用的工具，不涉及枯燥的技术细节。

## gen-jmockit-idea-plugin 

[gen-jmockit-idea-plugin](https://github.com/houbb/gen-jmockit-idea-plugin) 自动生成 jmockit junit 的单元测试用例。

## gen-test-plugin

[gen-test-plugin](https://github.com/houbb/gen-test-plugin) 自动生成 junit 测试案例的 maven 插件

# JUnitGenerator

这个[插件](http://plugins.jetbrains.com/plugin/3064)允许在右键单击“Generate...”菜单时，针对一个Java类生成JUnit测试。

可以使用提供的Velocity模板自定义单元测试的输出代码，以根据源类格式化代码。

如果在已经存在的地方创建单元测试，用户将被提示选择覆盖或合并操作。

合并操作允许用户有选择地创建目标文件内容。

![JUnitGenerator](https://raw.githubusercontent.com/houbb/resource/master/img/junit/2016-08-30-junit.png)

- set the output path

```
${SOURCEPATH}/../../test/java/${PACKAGE}/${FILENAME}
```

- set the junit4 template

```java
########################################################################################
##
## Available variables:
##         $entryList.methodList - List of method composites
##         $entryList.privateMethodList - List of private method composites
##         $entryList.fieldList - ArrayList of class scope field names
##         $entryList.className - class name
##         $entryList.packageName - package name
##         $today - Todays date in MM/dd/yyyy format
##
##            MethodComposite variables:
##                $method.name - Method Name
##                $method.signature - Full method signature in String form
##                $method.reflectionCode - list of strings representing commented out reflection code to access method (Private Methods)
##                $method.paramNames - List of Strings representing the method's parameters' names
##                $method.paramClasses - List of Strings representing the method's parameters' classes
##
## You can configure the output class name using "testClass" variable below.
## Here are some examples:
## Test${entry.ClassName} - will produce TestSomeClass
## ${entry.className}Test - will produce SomeClassTest
##
########################################################################################
##
#macro (cap $strIn)$strIn.valueOf($strIn.charAt(0)).toUpperCase()$strIn.substring(1)#end
## Iterate through the list and generate testcase for every entry.
#foreach ($entry in $entryList)
#set( $testClass="${entry.className}Test")
##
package $entry.packageName;

import org.junit.Test;
import org.junit.Before;
import org.junit.After;

/**
* ${entry.className} Tester.
*
* @author houbinbin
* @since $today
* @version 1.0
*/
public class $testClass {

    @Before
    public void before() throws Exception {
    }

    @After
    public void after() throws Exception {
    }

    #foreach($method in $entry.methodList)
/**
    *
    * Method: $method.signature
    *
    */
    @Test
    public void ${method.name}Test() throws Exception {
    }

    #end

    #foreach($method in $entry.privateMethodList)
/**
    *
    * Method: $method.signature
    *
    */
    @Test
    public void ${method.name}Test() throws Exception {
    #foreach($string in $method.reflectionCode)
    $string
    #end
}

#end
}
#end
```

- test template with Mockito

```java
########################################################################################
##
## Available variables:
##         $entryList.methodList - List of method composites
##         $entryList.privateMethodList - List of private method composites
##         $entryList.fieldList - ArrayList of class scope field names
##         $entryList.className - class name
##         $entryList.packageName - package name
##         $today - Todays date in MM/dd/yyyy format
##
##            MethodComposite variables:
##                $method.name - Method Name
##                $method.signature - Full method signature in String form
##                $method.reflectionCode - list of strings representing commented out reflection code to access method (Private Methods)
##                $method.paramNames - List of Strings representing the method's parameters' names
##                $method.paramClasses - List of Strings representing the method's parameters' classes
##
## You can configure the output class name using "testClass" variable below.
## Here are some examples:
## Test${entry.ClassName} - will produce TestSomeClass
## ${entry.className}Test - will produce SomeClassTest
##
########################################################################################
##
#macro (cap $strIn)$strIn.valueOf($strIn.charAt(0)).toUpperCase()$strIn.substring(1)#end
#macro (uncap $strIn)$strIn.valueOf($strIn.charAt(0)).toLowerCase()$strIn.substring(1)#end
## Iterate through the list and generate testcase for every entry.
#foreach ($entry in $entryList)
#set( $testClass="${entry.className}Test")
##
package $entry.packageName;

import org.junit.Test;
import org.junit.Before;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;

/**
* ${entry.className} Tester.
*
* @author houbinbin
* @since $today
* @version 1.0
*/
public class $testClass {

    @InjectMocks
    private ${entry.className} #uncap(${entry.className});

    @Before
    public void init() {
     MockitoAnnotations.initMocks(this);
    }

    #foreach($method in $entry.methodList)
/**
    *
    * Method: $method.signature
    *
    */
    @Test
    public void ${method.name}Test() throws Exception {
    }

    #end

    #foreach($method in $entry.privateMethodList)
/**
    *
    * Method: $method.signature
    *
    */
    @Test
    public void ${method.name}Test() throws Exception {
    #foreach($string in $method.reflectionCode)
    $string
    #end
}

#end
}
#end
```
# 小结

不要把这个面向客户。可以改成一开始自己设计的 gen-test 测试用例 maven 生成插件，以及对应的 idea 插件。

* any list
{:toc}