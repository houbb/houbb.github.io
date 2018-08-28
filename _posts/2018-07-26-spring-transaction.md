---
layout: post
title:  Spring Transaction
date:  2018-07-26 11:07:50 +0800
categories: [Spring]
tags: [spring, java, database, transaction, sf]
published: true
---

# Spring 事务介绍

## 优势

全面的事务支持是使用Spring框架的最引人注目的原因之一。

Spring 框架为事务管理提供了一致的抽象，提供了以下好处:

1. 跨不同事务API(如Java事务API (JTA)、JDBC、Hibernate和Java持久性API (JPA)的一致编程模型。

2. 支持声明式事务管理。

编程事务管理的API比复杂的事务API(如JTA)更简单。

出色地集成了Spring的数据访问抽象。

下面几节将描述Spring框架的事务增值和技术。(本章还讨论了最佳实践、应用服务器集成和常见问题的解决方案。)

Spring框架的事务支持模型的优点描述了为什么要使用Spring框架的事务抽象而不是EJB容器管理事务(CMT)，或者选择通过私有API(如Hibernate)来驱动本地事务。

了解Spring框架事务抽象概括了核心类，并描述了如何从各种来源配置和获取数据源实例。

将资源与事务同步描述了应用程序代码如何确保资源被正确地创建、重用和清理。

声明性事务管理描述对声明性事务管理的支持。

程序化事务管理包含对程序化(即显式编码)事务管理的支持。

事务绑定事件描述如何在事务中使用应用程序事件。

# @Transactional

## 使用的位置

标注在类前：标示类中所有方法都进行事务处理

标注在接口、实现类的方法前：标示方法进行事务处理

## 事务传播行为

| 事务传播行为	                                           |   说明 |
|:---|:---|
| @Transactional(propagation=Propagation.REQUIRED)	     | 如果有事务， 那么加入事务， 没有的话新建一个(默认情况)|
| @Transactional(propagation=Propagation.NOT_SUPPORTED)	 | 容器不为这个方法开启事务|
| @Transactional(propagation=Propagation.REQUIRES_NEW)	 | 不管是否存在事务，都创建一个新的事务，原来的挂起，新的执行完毕，继续执行老的事务|
| @Transactional(propagation=Propagation.MANDATORY)	     | 必须在一个已有的事务中执行，否则抛出异常|
| @Transactional(propagation=Propagation.NEVER)	         | 必须在一个没有的事务中执行，否则抛出异常(与Propagation.MANDATORY相反)|
| @Transactional(propagation=Propagation.SUPPORTS)	     | 如果其他bean调用这个方法，在其他bean中声明事务，那就用事务。如果其他bean没有声明事务，那就不用事务 |

## 事务超时设置

```
@Transactional(timeout=30) //默认是30秒
```

## 事务隔离级别

| 事务隔离级别	| 说明 |
|:---|:---|
| @Transactional(isolation = Isolation.READ_UNCOMMITTED)	           | 读取未提交数据(会出现脏读， 不可重复读)，基本不使用 |
| @Transactional(isolation = Isolation.READ_COMMITTED)(SQLSERVER默认)	|  读取已提交数据(会出现不可重复读和幻读) |
| @Transactional(isolation = Isolation.REPEATABLE_READ)	               | 可重复读(会出现幻读) |
| @Transactional(isolation = Isolation.SERIALIZABLE)	               | 串行化 |

- 脏读

一个事务读取到另一事务未提交的更新数据

- 不可重复读

在同一事务中，多次读取同一数据返回的结果有所不同。

换句话说，后续读取可以读到另一事务已提交的更新数据。

相反，”可重复读”在同一事务中多次读取数据时，能够保证所读数据一样，也就是后续读取不能读到另一事务已提交的更新数据

- 幻读

一个事务读到另一个事务已提交的insert数据


# @Transactional 的工作原理

## 自动提交

默认情况下，数据库处于自动提交模式。(oracle 应该是默认不提交)

每一条语句处于一个单独的事务中，在这条语句执行完毕时，如果执行成功则隐式的提交事务，如果执行失败则隐式的回滚事务。

事务管理，是一组相关的操作处于一个事务之中，因此必须关闭数据库的自动提交模式。

这点，Spring 会在 `org/springframework/jdbc/datasource/DataSourceTransactionManager.java` 中将底层连接的自动提交特性设置为 false。

## spring 事务回滚规则

pring事务管理器回滚一个事务的推荐方法是在当前事务的上下文内抛出异常。

Spring事务管理器会捕捉任何未处理的异常，然后依据规则决定是否回滚抛出异常的事务。

默认配置下，Spring只有在抛出的异常为运行时unchecked异常时才回滚该事务，也就是抛出的异常为RuntimeException的子类(Errors也会导致事务回滚)。而抛出checked异常则不会导致事务回滚。

Spring也支持明确的配置在抛出哪些异常时回滚事务，包括checked异常。也可以明确定义哪些异常抛出时不回滚事务。

还可以编程性的通过 `setRollbackOnly()` 方法来指示一个事务必须回滚，在调用完 `setRollbackOnly()` 后你所能执行的唯一操作就是回滚。

ps: 必须回滚一般适合应用于数据库测试。

# @Transactional 的注意事项

## aop 增强哪些方法

由于Spring事务管理是基于接口代理或动态字节码技术，通过AOP实施事务增强的。

（1）对于基于接口动态代理的AOP事务增强来说，由于接口的方法是public的，这就要求实现类的实现方法必须是public的（不能是protected，private等），同时不能使用static的修饰符。所以，可以实施接口动态代理的方法只能是使用“public”或“public final”修饰符的方法，其它方法不可能被动态代理，相应的也就不能实施AOP增强，也即不能进行Spring事务增强。

（2）基于CGLib字节码动态代理的方案是通过扩展被增强类，动态创建子类的方式进行AOP增强植入的。

**由于使用final,static,private修饰符的方法都不能被子类覆盖，相应的，这些方法将不能被实施的AOP增强。**

所以，必须特别注意这些修饰符的使用，@Transactional 注解只被应用到 public 可见度的方法上。 

如果你在 protected、private 或者 package-visible 的方法上使用 @Transactional 注解，它也不会报错，但是这个被注解的方法将不会展示已配置的事务设置。

## 默认回滚的异常

用 spring 事务管理器，由spring来负责数据库的打开，提交，回滚。

默认遇到运行期异常(throw new RuntimeException(“注释”);)会回滚，即遇到不受检查（unchecked）的异常时回滚；而遇到需要捕获的异常(throw new Exception(“注释”);)不会回滚，即遇到受检查的异常（就是非运行时抛出的异常，编译器会检查到的异常叫受检查异常或说受检查异常）时，需我们指定方式来让事务回滚 要想所有异常都回滚，要加上 `@Transactional( rollbackFor={Exception。class，其它异常})` 。

如果让unchecked异常不回滚： `@Transactional(notRollbackFor=RunTimeException.class)` 如下:

- rollbackFor

```
@Transactional(rollbackFor=Exception.class) //指定回滚，遇到异常Exception时回滚
public void methodName() {
    throw new Exception("注释");
}
```

- noRollbackFor

```
@Transactional(noRollbackFor=Exception.class)//指定不回滚，遇到运行期异常(throw new RuntimeException("注释");)会回滚
public ItimDaoImpl getItemDaoImpl() {
    throw new RuntimeException("注释");
}
```

## 注解本身

仅仅 @Transactional 注解的出现不足于开启事务行为，它仅仅是一种元数据，能够被可以识别 @Transactional 注解和上述的配置适当的具有事务行为的beans所使用。

其实，根本上是元素的出现开启了事务行为。

## 用在具体的类或者方法上

Spring团队的建议是你在具体的类（或类的方法）上使用 @Transactional 注解，而不要使用在类所要实现的任何接口上。

你当然可以在接口上使用 @Transactional 注解，但是这将只能当你设置了基于接口的代理时它才生效。

因为注解是不能继承的，这就意味着如果你正在使用基于类的代理时，那么事务的设置将不能被基于类的代理所识别，而且对象也将不会被事务代理所包装（将被确认为严重的）。

因此，请接受Spring团队的建议并且在具体的类或方法上使用 @Transactional 注解。

## 事务的简单性

@Transactional 注解标识的方法，处理过程尽量的简单。

尤其是带锁的事务方法，能不放在事务里面的最好不要放在事务里面。可以将常规的数据库查询操作放在事务前面进行，而事务内进行增、删、改、加锁查询等操作。

@Transactional 注解标注的方法中不要出现网络调用、比较耗时的处理程序。

因为，事务中数据库连接是不会释放的，如果每个事务的处理时间都非常长，那么宝贵的数据库连接资源将很快被耗尽。

## 默认事务管理器

@Transactional 注解的默认事务管理器 bean 是 “transactionManager”。

如果声明为其他名称的事务管理器，需要在方法上添加 `@Transational("managerName")`。

# spring 自我调用问题

Spring事务使用AOP代理后的方法调用执行流程，如图所示：

![spring-transaction](https://raw.githubusercontent.com/houbb/resource/master/img/spring/2018-08-28-spring-transaction.png)

从图中可以看出，调用事务时首先调用的是AOP代理对象而不是目标对象，
首先执行事务切面，事务切面内部通过 TransactionInterceptor 环绕增强进行事务的增强。

即进入目标方法之前开启事务，退出目标方法时提交/回滚事务。

## 问题

```java
public interface TargetService {  

    void a();  

    void b();  

}  

@Service 
public class TargetServiceImpl implements TargetService {  

    public void a() {  
        this.b();  
    }  

    @Transactional(propagation = Propagation.REQUIRES_NEW)  
    public void b() {
        //执行数据库操作
    }  

}
```

此处的 this 指向目标对象，因此调用 this.b() 将不会执行 b 事务切面，即不会执行事务增强。

因此 b 方法的事务定义 `@Transactional(propagation = Propagation.REQUIRES_NEW)` 将不会实施，即结果是 b 和 a 方法的事务是方法的事务定义是一样的。

## 解决方法

### 外部调用

最好在被代理类的外部调用其方法

### 自注入（Self Injection, from Spring 4.3）

```java
@Controller
class XService {
    @Autowired
    private YService yService;
    @Autowired
    private XService xService;
    public void doOutside(){
        xService.doInside();//从this换成了xService
    }
    @Transactional
    private void doInside(){
        //do sql statement
    }
}

@Controller
class Test {
    @Autowired
    private XService xService;
    public void test(){
        xService.doOutside();
    }
}
```

由于 xService 变量是被 Spring 注入的，因此实际上指向 `XService$$Cglib` 对象，xService.doInside() 因此也能正确的指向增强后的方法。

### 定义 BeanPostProcessor 需要使用的标识接口

通过 BeanPostProcessor 在目标对象中注入代理对象：

```java
public interface BeanSelfAware {
    public abstract void setSelf(Object obj);
}
```

### 定义自己的 BeanPostProcessor(InjectBeanSelfProcessor)

```java
public class InjectBeanSelfProcessor
    implements BeanPostProcessor, ApplicationContextAware
{
    ApplicationContext context;
    
    private static Log log = LogFactory.getLog(com/netease/lottery/base/common/BeanSelf/InjectBeanSelfProcessor);
    public InjectBeanSelfProcessor()
    {
    }
    public void setApplicationContext(ApplicationContext context)
        throws BeansException
    {
        this.context = context;
    }
    public Object postProcessAfterInitialization(Object bean, String beanName)
        throws BeansException
    {
        if(bean instanceof BeanSelfAware)
        {//如果Bean实现了BeanSelfAware标识接口，就将代理对象注入
            BeanSelfAware myBean = (BeanSelfAware)bean;
            Class cls = bean.getClass();
            if(!AopUtils.isAopProxy(bean))
            {
                Class c = bean.getClass();
                Service serviceAnnotation = (Service)c.getAnnotation(org/springframework/stereotype/Service);
                if(serviceAnnotation != null)
                    try
                    {
                        bean = context.getBean(beanName);
                        if(AopUtils.isAopProxy(bean));
                    }
                    catch(BeanCurrentlyInCreationException beancurrentlyincreationexception) { }
                    catch(Exception ex)
                    {
                        log.fatal((new StringBuilder()).append("No Proxy Bean for service ").append(bean.getClass()).append(" ").append(ex.getMessage()).toString(), ex);
                    }
            }
            myBean.setSelf(bean);
            return myBean;
        } else
        {
            return bean;
        }
    }
    public Object postProcessBeforeInitialization(Object bean, String beanName)
        throws BeansException
    {
        return bean;
    }
}
```

### 目标类实现

```java
public interface TargetService 
{  
    public void a();  
    public void b();  
}  

@Service 
public class TargetServiceImpl implements TargetService, BeanSelfAware
{  
    private TargetService self;  

    public void setSelf(Object proxyBean) 
    { //通过InjectBeanSelfProcessor注入自己（目标对象）的AOP代理对象  
        this.self = (TargetService) proxyBean;  
    }  
    public void a() 
    {  
        self.b();  
    }  
    @Transactional(propagation = Propagation.REQUIRES_NEW)  
    public void b() 
    {
    //执行数据库操作
    }  
}
```

postProcessAfterInitialization 根据目标对象是否实现 BeanSelfAware 标识接口，
通过 setSelf(bean) 将代理对象（bean）注入到目标对象中，从而可以完成目标对象内部的自我调用。

# 编程式事务

## 应用场景

- 构建耗时

结构体的构建非常消耗时间，应可以将构建和事务分开。

- 异常必须捕获

比如 rpc 调用，想让你给一个调用是否成功的结果。这个时候你就需要去捕获异常，当然再拆分成另外一个服务也可以。(你不嫌麻烦的话)

如果异常被捕获，则 spring 的声明式事务就无法生效。则可以使用编程式事务。

## 说明

根据 PlatformTransactionManager、TransactionDefinition 和 TransactionStatus三个接口，可以通过编程的方式来进行事务管理。

TransactionDefinition 实例用于定义一个事务，PlatformTransactionManager 实例用语执行事务管理操作，TransactionStatus实例用于跟踪事务的状态。

## 使用方式

```java
@Autowired
private DataSourceTransactionManager dataSourceTransactionManager;

public void serviceTx() {
    //数据构建

    //开启新事物
    DefaultTransactionDefinition transDefinition = new DefaultTransactionDefinition();
    transDefinition.setPropagationBehavior(DefaultTransactionDefinition.PROPAGATION_REQUIRED);
    TransactionStatus transStatus = dataSourceTransactionManager.getTransaction(transDefinition);
    try {
        boolean result = this.insert(order);
        if (!result) {
            LOGGER.error("数据创建失败:{}", "XXX");
            dataSourceTransactionManager.rollback(transStatus);
            throw new RuntimeException();
        }
        dataSourceTransactionManager.commit(transStatus);
    } catch (Exception e) {
        dataSourceTransactionManager.rollback(transStatus);
    }

    //其他返回等
}
```

## 另一种编程式事务管理

以上这种事务管理方式容易理解，但事务管理代码散落在业务代码中，破坏了原有代码的条理性，且每个事务方法中都包含了启动事务、提交/回滚事务的功能，
基于此，Spring提供了简化的模版回调模式（TransactionTemplate）。 　　

- 配置

TransactionTemplate bean 配置：

```xml
<bean id="transactionTemplate"  class="org.springframework.transaction.support.TransactionTemplate">
    <property name="transactionManager" ref="transactionManager"/>
</bean>
```

- TransactionTemplate

TransactionTemplate 的 execute() 方法有一个 TransactionCallback 类型的参数，该接口中定义了一个doInTransaction()方法，可通过匿名内部累的方式实现TransactionCallBack接口，将业务代码写在doInTransaction()方法中，业务代码中不需要显示调用任何事物管理API，除了异常回滚外，也可以在业务代码的任意位置通过transactionStatus.setRollbackOnly();

执行回滚操作。UserService服务代码变更为：

```java
public class UserService {

    @Resource
    UserDAO userDAO;

    @Resource
    TransactionTemplate transactionTemplate;

    public void addUser(final User user) {

        transactionTemplate.execute(new TransactionCallback() {

            public Object doInTransaction(TransactionStatus transactionStatus) {

                userDAO.insert(user);

                // transactionStatus.setRollbackOnly();
                Integer i = null;

                if (i.equals(0)) {
                    
                }
                return null;
            }
        });
    }
}
```

# 统一指定 vs 手动指定

ps: 使用注解的方式虽然比较优雅，但是在诸如在涉及到数据库之前，需要消耗大量时间去构建一个数据库对象，则建议使用编程式事务。

获取将这个 service 拆分成两部分：数据的构建(没有事务)+数据的持久化（开启事务）。

## 统一指定

可以统一指定所有的 insert/udpate/delete 操作开启事务，select 开启只读事务。

- 优点

开发时只需要按照一定命名(约定好的)规范，新手甚至不需要知道 spring 事务的存在，就可以完成编程。

- 缺点

灵活性就会丧失。

## 手动指定

在具体的使用上，添加对应的指定注解。

- 优点

相对灵活。

- 缺点

需要使用者对 spring 事务有一定的理解。

你可能会说开发不都知道？

但是很多人不清楚 `@Transactional` 的异常回滚，甚至查询的时候经常忘记添加 `@Transactional(readOnly = true)` 都很常见。

# 只读事务

## 问题

Spring 当中的 `@Transactional(readOnly = true)` 意义？

## 回答

如果你一次执行单条查询语句，则没有必要启用事务支持，数据库默认支持SQL执行期间的读一致性； 

如果你一次执行多条查询语句，例如统计查询，报表查询，在这种场景下，多条查询SQL必须保证整体的读一致性，否则，在前条SQL查询之后，后条SQL查询之前，数据被其他用户改变，则该次整体的统计查询将会出现读数据不一致的状态，此时，应该启用事务支持
`read-only="true"` 表示该事务为只读事务，比如上面说的多条查询的这种情况可以使用只读事务，

由于只读事务不存在数据的修改，因此数据库将**会为只读事务提供一些优化手段**

例如Oracle对于只读事务，不启动回滚段，不记录回滚log。

（1）在JDBC中，指定只读事务的办法为： `connection.setReadOnly(true);`

（2）在Hibernate中，指定只读事务的办法为： `session.setFlushMode(FlushMode.NEVER); `

此时，Hibernate也会为只读事务提供Session方面的一些优化手段

（3）在Spring的Hibernate封装中，指定只读事务的办法为： 

bean配置文件中，prop属性增加 `read-Only`

或者用注解方式 `@Transactional(readOnly=true)`

Spring中设置只读事务是利用上面两种方式（根据实际情况）

在将事务设置成只读后，相当于将数据库设置成只读数据库，此时若要进行写的操作，会出现错误。


# 参考资料

- spring 事务

[spring transaction](https://docs.spring.io/spring/docs/5.0.7.RELEASE/spring-framework-reference/data-access.html#transaction)

http://tech.lede.com/2017/02/06/rd/server/SpringTransactional/

- 编程式事务

https://www.jianshu.com/p/62491d95815e

https://www.ibm.com/developerworks/cn/education/opensource/os-cn-spring-trans/index.html

http://jinnianshilongnian.iteye.com/blog/1441271

https://juejin.im/entry/59b49220f265da06456d4725

- 只读事务

https://blog.csdn.net/yulin_ganbo/article/details/78566835

https://my.oschina.net/uniquejava/blog/80954

https://www.zhihu.com/question/39074428

- spring 事务自我调用问题

http://jinnianshilongnian.iteye.com/blog/1487235

https://segmentfault.com/a/1190000011440783

https://blog.csdn.net/clementad/article/details/47339519

* any list
{:toc}