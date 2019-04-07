---
layout: post
title: JUnit-java 单元测试
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [junit, test]
published: true
---

# JUnit

[JUnit](http://junit.org/junit4/) is a simple framework to write repeatable tests.
It is an instance of the xUnit architecture for unit testing frameworks.

> What to test?

| Need           |   Desc        |
| :------------ |:----------    |
| Right |   结果是否正确          |
| B     |   边界条件是否满足       |
| I     |   能反向关联吗           |
| C     |   有其他手段交叉检查吗    |
| E     |   是否可以强制异常发生    |
| P     |   性能问题              |




# Simple Demo

- We create a test class for student;

```java
public class StudentTest extends TestCase {
    public void testCreate() {
        Student student =  new Student("Mike");
    }
}
```

- Student class

```java
public class Student {
    private String name;

    public Student(String name) {
        this.name = name;
    }

    public String getName() {
        return "ryo";
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

when we run StudentTest.

![success](https://raw.githubusercontent.com/houbb/resource/master/img/2016-04-27-success-junit.png)

then, we change the test code.

```java
public class StudentTest extends TestCase {
    public void testCreate() {
        Student student =  new Student("Mike");
        String name = student.getName();

        assertEquals("Mike", name);
    }
}
```
result

![failed](https://raw.githubusercontent.com/houbb/resource/master/img/2016-04-27-failed-junit.png)

# Usage

- Add jars in IDEA

```
File --> Project Structure  [crtl+alt+shift+s] --> Libraries --> "+"---> "Attach Files or Directories"
```
- setUp()

Now we add a new class Course.

```java
public class Course {
    private String name;
    private int num;

    public Course(String name, int num) {
        this.name = name;
        this.num = num;
    }

    public String getName() {
        return name;
    }

    public int getNum() {
        return num;
    }
}
```

test class like this...

```java
public class CourseTest extends TestCase {
    public void testCreateNum() {
        Course course = new Course("Math", 1);
        assertEquals(1, course.getNum());
    }

    public void testCreateName() {
        Course course = new Course("Math", 1);
        assertEquals("Helo", course.getName());
    }
}
```

You may find

```java
Course course = new Course("Math", 1);
```

we have write it twice, can it be easier?

Now, we can use ```setUp()``` to help us to do it easier; things in ```setUp()``` will be called **before** each test method.

```java
public class CourseTest extends TestCase {
    private Course course;
    public void setUp() {
        course = new Course("Math", 1);
    }

    public void testCreateNum() {
        assertEquals(1, course.getNum());
    }

    public void testCreateName() {
        assertEquals("Helo", course.getName());
    }
}
```

- tearDown()

 Also, ```tearDown()``` will be called **after** each test method.

- @Before

 Method annotated with @Before executed before every test; also, @After after...

- @BeforeClass

 Just run one time, and is unique.



# JUnitGenerator

This [plugin](http://plugins.jetbrains.com/plugin/3064) generates JUnit tests from right click 'Generate...' menu while focused on a java class.
The unit test output code can be customized using a provided velocity template to format the code based on the origin class.
If a unit test is created where one already exists, the user is prompted for overwrite or merge operation.
The merge operation allows the user to selectively create the target file content.

![JUnitGenerator](https://raw.githubusercontent.com/houbb/resource/master/img/junit/2016-08-30-junit.png)

- set the output path

```
${SOURCEPATH}/../../test/java/${PACKAGE}/${FILENAME}
```

- set the junit4 template

```
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

```
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

# Mockito

[Mockito](http://site.mockito.org/) is a mocking framework that tastes really good. It lets you write beautiful tests with a clean & simple API.
Mockito doesn’t give you hangover because the tests are very readable and they produce clean verification errors.

If you want to test classA as following, you need create class BCD at first.

<uml>
  classA->classB:
  classB->classC:
  classB->classD:
</uml>

When you use mock, things will be like

<uml>
  classA->classBMock:
</uml>


> Hello World

- maven jar

```xml
<dependency>
  <groupId>org.mockito</groupId>
  <artifactId>mockito-all</artifactId>
  <version>1.8.4</version>
</dependency>
```

- hello world

```java
@Test
public void testMock() {
  List<String> mockedList = mock(List.class);

  // stubbing appears before the actual execution
  when(mockedList.get(0)).thenReturn("hello");

  String result = mockedList.get(0);

  //verify has called get(0)
  verify(mockedList).get(0);

  assertEquals("hello", result);
}
```

- Mock demo

```java
public class UserServiceTest {
  @InjectMocks
  private UserService userService;

  @Mock
  private UserDao userDao;

  @Before
  public void init(){
      MockitoAnnotations.initMocks(this);

      //mock the method
      User user = new User();
      Mockito.when(this.UserDao.selectUser(Mockito.anyString()))
          .thenReturn(user);
  }

  @Test
  public void testGetUser() {

  }
}
```

# PowerMock

> https://github.com/jayway/powermock


* any list
{:toc}