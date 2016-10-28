---
layout: post
title: Exception and Log
date:  2016-5-1 15:01:51 +0800
categories: [Java]
tags: [Exception,Log]
published: false
---

* any list
{:toc}

## Throwable

It's UML may like this.

![throwable]({{ site.url }}/static/app/img/2016-07-01-Throwable.png)

## Exception

- student class

```java
public class Student {
    private int score;

    public Student() {
    }
    public Student(int score) {
        this.score = score;
    }
    public Student(String score) {
        this.score = Integer.parseInt(score);
    }
}
```

- junit test

```java
@Test
public void testCreate() {
    try {
        Student student = new Student("a234");
        fail("Integer need!");
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

result

```java
java.lang.NumberFormatException: For input string: "a234"
	at java.lang.NumberFormatException.forInputString(NumberFormatException.java:65)
	...
Process finished with exit code 0
```

> Note

1. NumberFormatException, "a234" is not a number format.

2. We can use method to avoid exception, like this...

- change student class

```java
public class Student {
    private int score;

    public Student() {
    }
    public Student(int score) {
        this.score = score;
    }
    public Student(String score) {
        this.score = Integer.parseInt(score);
    }

    public Boolean isValid(String score) {
        try{
            Integer.parseInt(score);
            return true;
        }catch(Exception e) {
            return false;
        }
    }
}
```

- junit test

```java
@Test
public void testIsValid() {
    Student student = new Student();
    assertEquals(Boolean.TRUE, student.isValid("123"));
    assertEquals(Boolean.FALSE, student.isValid("adsf"));
}
```

result

```java

Process finished with exit code 0
```

### Exception UML

<uml>
    RuntimeException->Exception:
    Exception->Throwable:
    Error->Throwable:
    Note over Throwable: Error and Exception extends this.
</uml>


### Define exception

- exception extends from IllegalArgumentException

```java
public class StudentNameFormatException extends IllegalArgumentException{
}
```

- student

```java
public class Student {
    private String name;

    public Student(String name) {

        if(name.length() < 2) { //"name length can't less than 2."
            throw new StudentNameFormatException();
        }
        this.name = name;
    }
}
```

- junit test

```java
@Test
public void testException() {
    Student student = new Student("h");
}
```

result

```java
com.ryo.exception.StudentNameFormatException
	at com.ryo.exception.Student.<init>(Student.java:13)
	...

Process finished with exit code -1
```

### Message

- change exception class

```java
public class StudentNameFormatException extends IllegalArgumentException{
    public StudentNameFormatException(String s) {
        super(s);
    }
}
```

- student class

```java
public class Student {
    public static final String message = "Name's length must be more than 1!";
    private String name;

    public Student(String name) {

        if(name.length() < 2) { //"name length can't less than 2."
            throw new StudentNameFormatException(message);
        }
        this.name = name;
    }
}
```

- junit test

```java
@Test
public void testExceptionWithMessage() {
    try{
        Student student = new Student("h");
    } catch (StudentNameFormatException e) {
        assertEquals(Student.message, e.getMessage());
    }
}
```

result

```java

Process finished with exit code 0
```

### finally

In order to be easier, test finally base on class above.

- junit test

```java
@Test
public void testFinally() {
    try{
        Student student = new Student("h");
    } catch (StudentNameFormatException e) {
        System.out.println("catch");
    } finally {
        System.out.println("finally");
    }
}
```



result

```java
catch
finally

Process finished with exit code 0
```

> As you know, code in finally block will always be called.

<label class="label label-warning"><i class="fa fa-fw fa-warning"></i>Warning</label>

Do not use return statement in finally block and catch block, use it after try catch block;

- finally will finally called, so this result is 2.

```
public static int getReturnVal() {
    try {
        return 1;
    } finally {
        return 2;
    }
}
```

- return statement in try is before finally, so result is 1.

```
public static int demo() {
    int x = 1;
    try {
        return x;
    } finally {
        x = 2;
    }
}
```


## Log

> [log4j](http://logging.apache.org/log4j)


- add log in student class

```java
public class Student {
    public static final String message = "Name's length must be more than 1!";
    private String name;

    public Student(String name) {
        if(name.length() < 2) { //"name length can't less than 2."
            log(message);
            throw new StudentNameFormatException(message);
        }
        this.name = name;
    }

    private void log(String message) {
        Logger logger = Logger.getLogger(getClass().getName());
        logger.info(message);
    }
}
```

result

```java
五月 01, 2016 6:02:03 下午 com.ryo.exception.Student log
信息: Name's length must be more than 1!

Process finished with exit code 0
```

### Log and Level UML

<uml>
    ConsoleHandler->StreamHandler:
    FileHandler->StreamHandler:
    SocketHandler->StreamHandler:
    Handler->LogRecord: publishes
    StreamHandler->Handler:
    MemoryHandler->Handler:
    Logger->Handler:
    Logger->Level:
</uml>

### Log Test

- TestHandler class

```java
public class TestHandler extends Handler {
    private LogRecord logRecord;

    @Override
    public void publish(LogRecord record) {
        this.logRecord = record;
    }

    @Override
    public void flush() {

    }

    @Override
    public void close() throws SecurityException {

    }

    String getMessage() {
        return logRecord.getMessage();
    }
}
```

- junit test

```java
@Test
public void testExceptionWithMessage() {
    Logger logger = Logger.getLogger(Student.class.getName());
    Handler testHandler = new TestHandler();
    logger.addHandler(testHandler);

    try{
        Student student = new Student("h");
    } catch (StudentNameFormatException e) {
        assertEquals(Student.message, e.getMessage());
        assertEquals(true, isLogged(Student.message, (TestHandler) testHandler));
    }
}
```

What is isLogged() ? As following...

```java
private boolean isLogged(String message, TestHandler handler) {
    return message.equals(handler.getMessage());
}
```

result

```java
五月 01, 2016 9:55:01 下午 com.ryo.exception.Student log
信息: Name's length must be more than 1!

Process finished with exit code 0
```

> Refactoring

Test above can be better, because it test another method isLogged()...

Now, we change student class like this.

```java
public class Student {
    public static final String message = "Name's length must be more than 1!";
    private String name;
    final static Logger logger = Logger.getLogger(Student.class.getName());

    public Student(String name) {
        if(name.length() < 2) {
            Student.logger.info(Student.message);
            throw new StudentNameFormatException(message);
        }
        this.name = name;
    }
}
```

and change the test class

```java
@Test
public void testExceptionWithMessage() {
    Handler testHandler = new TestHandler();
    Student.logger.addHandler(testHandler);

    try{
        Student student = new Student("h");
    } catch (StudentNameFormatException e) {
        assertEquals(Student.message, e.getMessage());
        assertEquals(Student.message, ((TestHandler) testHandler).getMessage());
    }
}
```




