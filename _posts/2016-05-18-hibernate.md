---
layout: post
title: Hibernate
date:  2016-05-18 23:56:52 +0800
categories: [redhat]
tags: [hibernate]
---

* any list
{:toc}

# Hibernate
Hibernate ORM enables developers to more easily write applications whose data outlives the application process.
As an Object/Relational Mapping (ORM) framework, Hibernate is concerned with data persistence as it applies to relational databases (via JDBC).

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

![database]({{ site.url }}/static/app/img/2016-05-19-idea-mysql.png)

# Hello world

![database]({{ site.url }}/static/app/img/2016-05-19-hibernate-form.png)


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