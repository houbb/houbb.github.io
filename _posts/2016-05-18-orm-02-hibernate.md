---
layout: post
title: ORM-02-Hibernate 对象关系映射（ORM）框架
date:  2016-05-21 18:35:52 +0800
categories: [ORM]
tags: [orm, sql]
published: true
---


# 拓展阅读

> [The jdbc pool for java.(java 手写 jdbc 数据库连接池实现)](https://github.com/houbb/jdbc-pool)

> [The simple mybatis.（手写简易版 mybatis）](https://github.com/houbb/mybatis)

# Hibernate

Hibernate ORM 允许开发者更轻松地编写那些数据在应用程序进程结束后仍然存在的应用程序。

作为一个对象关系映射（ORM）框架，Hibernate 关注的是与关系数据库（通过 JDBC）相关的数据持久化。

> [hibernate](http://hibernate.org/orm/)

# Install MySql

- [mysql download](http://www.mysql.com/downloads/)

- install the package and run mysql server.

enter

```
$ /usr/local/mysql/bin/mysql -u root -p

```

and you can input your password. In mysql command, here are some useful  sql;

```
mysql> status

/usr/local/mysql/bin/mysql  Ver 14.14 Distrib 5.6.30, for osx10.11 (x86_64) using  EditLine wrapper

Connection id:		55
Current database:	hibernate
Current user:		root@localhost
SSL:			Not in use
Current pager:		stdout
Using outfile:		''
Using delimiter:	;
Server version:		5.6.30 MySQL Community Server (GPL)
Protocol version:	10
Connection:		Localhost via UNIX socket
Server characterset:	latin1
Db     characterset:	latin1
Client characterset:	utf8
Conn.  characterset:	utf8
UNIX socket:		/tmp/mysql.sock
Uptime:			23 hours 45 min 33 sec

Threads: 1  Questions: 148  Slow queries: 0  Opens: 68  Flush tables: 1  Open tables: 61  Queries per second avg: 0.001
```

```
mysql> SHOW DATABASES;

mysql> CREATE DATABASE MYSQLDATA;

mysql> USE MYSQLDATA;

mysql> SHOW TABLES;

mysql> DESC TABLEDATA;
```

# Idea database

```
View->Tools->DataBase

+ -> Data Source->MySQL
```

![database](https://raw.githubusercontent.com/houbb/resource/master/img/2016-05-19-idea-mysql.png)

# Hello world

![database](https://raw.githubusercontent.com/houbb/resource/master/img/2016-05-19-hibernate-form.png)


> File list

- <a href="{{ site.url }}/static/download/hibernate/pom.xml">pom.xml</a>

- <a href="{{ site.url }}/static/download/hibernate/hibernate.cfg.xml">hibernate.cfg.xml</a>

- <a href="{{ site.url }}/static/download/hibernate/Event.hbm.xml">Event.hbm.xml</a>

> Class


- Event.java


```java
/**
 * Created by houbinbin on 16/5/18.
 */
public class Event {
    private Long id;
    private String title;
    private Date date;

    public Event() {
    }

    public Long getId() {
        return id;
    }

    private void setId(Long id) {
        this.id = id;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    @Override
    public String toString() {
        return "Event{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", date=" + date +
                '}';
    }
}
```

- HibernateUtil.java

```java
public class HibernateUtil {
    private static SessionFactory sessionFactory;
    private HibernateUtil() {}

    public static SessionFactory getSessionFactory() {
        if(sessionFactory == null) {
            sessionFactory = new Configuration().configure().buildSessionFactory();
        }

        return sessionFactory;
    }
}
```

- EventService.java

```java
public class HibernateUtil {
    private static SessionFactory sessionFactory;
    private HibernateUtil() {}

    public static SessionFactory getSessionFactory() {
        if(sessionFactory == null) {
            sessionFactory = new Configuration().configure().buildSessionFactory();
        }

        return sessionFactory;
    }
}
```

- EventTest.java is today's lead.

```java
public class EventTest extends TestCase {
    private EventService eventService;

    @Before
    public void setUp() {
        eventService = new EventService();
    }

    @Test
    public void testCreate() {
        eventService.createAndStoreEvent("create Event", new Date());
    }

    @Test
    public void testQuery() {
        List<Event> events = eventService.listEvents();
        for (Event event : events) {
            System.out.println(event);
        }
    }

    @After
    public void tearDown() {
        HibernateUtil.getSessionFactory().close();
    }
}
```

run testCreate()

```sql
INFO: HHH000400: Using dialect: org.hibernate.dialect.MySQLDialect
Hibernate: insert into EVENT (EVENT_DATE, title) values (?, ?)
```

run testQuery()

```sql
Hibernate: select event0_.EVENT_ID as EVENT_ID1_0_, event0_.EVENT_DATE as EVENT_DA2_0_, event0_.title as title3_0_ from EVENT event0_
五月 20, 2016 12:05:45 上午 org.hibernate.engine.jdbc.connections.internal.DriverManagerConnectionProviderImpl stop
INFO: HHH10001008: Cleaning up connection pool [jdbc:mysql://localhost/hibernate]
Event{id=1, title='My Event', date=2016-05-19 21:48:56.0}
Event{id=2, title='Test Event', date=2016-05-19 22:58:43.0}
Event{id=3, title='create Event', date=2016-05-19 23:32:49.0}
Event{id=4, title='create Event', date=2016-05-20 00:04:40.0}

Process finished with exit code 0
```

# Annotation

Now, let's use **annotation** way to achieve code above.

- Student.java

```java
/**
 * Created by houbinbin on 16/5/20.
 */
@Entity
public class Student {
    private Long id;
    private String name;
    private int score;


    @Id
    @GeneratedValue
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    //getter and setter...

    //default constructor and with members' constructor

    //toString()

}

```

- StudentService.java

```java
public class StudentService extends BaseService<Student> {
    public String getEntityName() {
        return "Student";
    }
}
```

- BaseService.java

```java
/**
 * Created by houbinbin on 16/5/20.
 */
public abstract class BaseService<T> {
    /**
     * get current entity's name;
     * @return
     */
    public abstract String getEntityName();

    /**
     * save the entity.
     * @param entity
     * @return
     */
    public Serializable save(T entity) {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();

        Serializable result = session.save(entity);
        session.getTransaction().commit();

        return result;
    }

    /**
     * list all data of entity;
     * @return
     */
    public List<T> list() {
        Session session = HibernateUtil.getSessionFactory().getCurrentSession();
        session.beginTransaction();

        List<T> result = session.createQuery("FROM " + getEntityName()).list();
        session.getTransaction().commit();
        return result;
    }

    /**
     * show the list
     * - you need write the correct toString() of entity;
     */
    public void show() {
        List<T> result = list();

        for(T entity : result) {
            System.out.println(entity);
        }
    }
}
```

- StudentTest.java

```java
public class StudentTest extends TestCase {
    private StudentService studentService;

    @Before
    public void setUp() {
        studentService = new StudentService();
    }

    @Test
    public void testCreate() {
        Student student = new Student("xiaoming", 70);

        studentService.save(student);
    }

    @Test
    public void testShow() {
        studentService.show();
    }

    @After
    public void tearDown() {
        HibernateUtil.getSessionFactory().close();
    }
}
```

# Mapping

- @Table

The identifier uniquely identifies each row in that table. By default the name of the table is assumed to be the
same as the name of the entity. To explicitly give the name of the table or to specify other information about the table,
we would use the javax.persistence.Table annotation.

```java
@Entity
@Table(name="t_simple")
public class Simple {
    private int id;

    @Id
    @GeneratedValue
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
}
```

the created table named t_simple.

- @Basic

Strictly speaking, a basic type is denoted with the javax.persistence.Basic annotation.
Generally speaking the @Basic annotation can be ignored. Both of the following examples are ultimately the same.

so, the code above is the same as...

```java
@Entity
@Table(name="t_simple")
public class Simple {
    private int id;

    @Id
    @GeneratedValue
    @Basic
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
}
```

- @Column

For basic type attributes, the implicit naming rule is that the column name is the same as the attribute name.
If that implicit naming rule does not meet your requirements, you can explicitly tell Hibernate (and other providers) the column name to use.

```java
@Entity
public class Simple {
    private int id;

    @Id
    @GeneratedValue
    @Column(name="t_id")
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }
}
```

the created table column will be "t_id".

- @Enumerated

> ORDINAL - stored according to the enum value's ordinal position within the enum class, as indicated by java.lang.Enum#ordinal

> STRING - stored according to the enum value's name, as indicated by java.lang.Enum#name

```java
@Entity
public class Simple {
    private int id;
    private Gender gender;

    @Id
    @GeneratedValue
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    @Enumerated(STRING)
    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }

    public static enum Gender {
        MALE, FEMALE
    }
}
```

result is MALE;

change into

```java
@Enumerated
public Gender getGender() {
    return gender;
}
```

result is 0;

# Spring

When hibernate meets spring, things will be interesting...What I want to say, is hibernate's model define.

- hbm.xml

```xml
<bean id="mySessionFactory" class="org.springframework.orm.hibernate5.LocalSessionFactoryBean">
    <property name="mappingResources">
        <list>
            <value>user.hbm.xml</value>
        </list>
    </property>
</bean>
```

- class

```xml
<property name="annotatedClasses">
    <list>
        <value>com.ryo.model.User</value>
    </list>
</property>
```

- auto scan

```xml
<property name="packagesToScan">
    <list>
        <value>com.ryo.model.*</value>
    </list>
</property>
```

<label class="label label-warning">Notice</label>

> packagesToScan specify **packages** to search for autodetection of your entity classes in the classpath.

So, the <kbd>*</kbd> in ```com.ryo.model.*``` is stand for package name. If your model classes are like this...

```xml
/com/ryo/model/
    - User.java
```

You need write ```com.ryo.*```

Or, you can write like this...

```xml
<list>
    <value>com.ryo.model</value>
</list>
```


* any list
{:toc}