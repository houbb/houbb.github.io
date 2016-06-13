---
layout: post
title: Exceptions
date:  2016-6-6 16:19:50 +0800
categories: [Util]
tags: [exception]
published: true
---

* any list
{:toc}

<uml>
    exception->reason: find
    reason->solve: think
</uml>


## spring


> HibernateException

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


> TransactionSystemException

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



