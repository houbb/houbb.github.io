---
layout: post
title: Exceptions Collection
date:  2016-06-21 21:33:46 +0800
categories: [Util]
tags: [exception]
published: false
---

* any list
{:toc}

<uml>
    exception->reason: find
    reason->solve: think
</uml>


# spring


## HibernateException

<label class="label label-danger">Error</label>

```
org.hibernate.HibernateException: Could not obtain transaction-synchronized Session for current thread
```

<label class="label label-info">Why</label>

- [reason](http://www.yihaomen.com/article/java/466.htm)


<label class="label label-success">Solve</label>

- add this into spring config file.

```xml
<bean id="transactionManager"
      class="org.springframework.orm.hibernate5.HibernateTransactionManager">
    <property name="sessionFactory" ref="sessionFactory"/>
</bean>
<tx:annotation-driven transaction-manager="transactionManager"/>
```

- use ```@Transactional``` on the service.

```java
@Service("messageService")
public class MessageServiceImpl implements MessageService {
    @Resource
    private MessageDAO messageDAO;

    @Transactional
    public void save(Message message) {
        messageDAO.save(message);
    }
}
```


## TransactionSystemException

<label class="label label-danger">Error</label>

```
org.springframework.transaction.TransactionSystemException: Could not commit Hibernate transaction;
nested exception is org.hibernate.TransactionException: Transaction not successfully started
```

<label class="label label-info">Why</label>

- All transaction should depend on spring.

<label class="label label-success">Solve</label>

- change dao like this...

```java
@Repository("messageDAO")
public class MessageDAOImpl implements MessageDAO {
    @Resource
    private SessionFactory sessionFactory;

    public void save(Message message) {
        Session session = sessionFactory.getCurrentSession();
        //session.beginTransaction();

        session.save(message);

        //session.getTransaction().commit();
    }
}
```

> org.springframework.web.servlet.PageNotFound noHandlerFound

<label class="label label-danger">Error</label>

```
No mapping found for HTTP request with URI [/views/index.jsp] in DispatcherServlet with name 'springmvc'
```

<label class="label label-success">Solve</label>

- change the web.xml

```xml
<servlet-mapping>
    <servlet-name>springmvc</servlet-name>
    <url-pattern>/*</url-pattern>
</servlet-mapping>
```

into

```xml
<servlet-mapping>
    <servlet-name>springmvc</servlet-name>
    <url-pattern>/</url-pattern>
</servlet-mapping>
```

# Java

## getResource

It's no to use ```ClassLoader.getResource()```, you can use ```class.getResource()``` directly.

- file tree, the *build* package is compile after the *src*.

```
|--project
    |--src
        |--javaapplication
            |--Test.java
            |--file1.txt
        |--file2.txt
    |--build
        |--javaapplication
            |--Test.class
            |--file3.txt
        |--file4.txt
```

- get file3.txt

```java
File file3 = new File(Test.class.getResource("file3.txt").getFile());
File file3 = new File(Test.class.getResource("/javaapplication/file3.txt").getFile());
File file3 = new File(Test.class.getClassLoader().getResource("javaapplication/file3.txt").getFile());
```

- get file4.txt

```java
File file4 = new File(Test.class.getResource("/file4.txt").getFile());
File file4 = new File(Test.class.getClassLoader().getResource("file4.txt").getFile());
```

- The *getResourceAsStream()* is just like

```java
new FileInputStream(Test.class.getResource(filePath).getFile());
```

<label class="label label-danger">Error</label>

But following code above, I always got ```NullPointer``` error in **Idea maven project**.

<label class="label label-info">Why</label>

**getResource()** is depend on the files after compile, but there is no files in *src* package after compile except *.class* files.

<label class="label label-success">Solve</label>

So, we need put properties files in **resources** package.

```
|--project
    |--src
        |--java
            |--Test.java
        |--resources
            |--file3.txt
    |--target
        |--classes
            |--Test.class
            |--file3.txt
```

and read them like this, use <kbd>/</kbd> location to the root path.

```
Test.class.getResourceAsStream("/file3.txt");
```


