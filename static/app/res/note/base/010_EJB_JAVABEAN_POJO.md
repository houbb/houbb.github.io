1、POJO

POJO（Plain Old Java Object）这种叫法是 Martin Fowler、Rebecca Parsons和Josh MacKenzie在2000年的一次演讲的时候提出来的。
按照Martin Fowler的解释是“Plain Old Java Object”，从字面上翻译为“纯洁老式的java对象”，但大家都使用“简单java对象”来称呼它。

 

POJO的内在含义是指那些:

有一些private的参数作为对象的属性，然后针对每一个参数定义get和set方法访问的接口。

没有从任何类继承、也没有实现任何接口，更没有被其它框架侵入的java对象。

```java
public class User {  
  
    private String name;  
    private int age;  
  
    public String getName() {  
        return name;  
    }  
  
    public void setName(String name) {  
        this.name = name;  
    }  
  
    public int getAge() {  
        return age;  
    }  
  
    public void setAge(int age) {  
        this.age = age;  
    }  
  
} 
```

2、JavaBean

JavaBean 是一种JAVA语言写成的可重用组件。JavaBean符合一定规范编写的Java类，不是一种技术，而是一种规范。
大家针对这种规范，总结了很多开发技巧、工具函数。符合这种规范的类，可以被其它的程序员或者框架使用。
它的方法命名，构造及行为必须符合特定的约定：

1、所有属性为private。

2、这个类必须有一个公共的缺省构造函数。即是提供无参数的构造器。

3、这个类的属性使用getter和setter来访问，其他方法遵从标准命名规范。

4、这个类应是可序列化的。实现serializable接口。 

因为这些要求主要是靠约定而不是靠实现接口，所以许多开发者把JavaBean看作遵从特定命名约定的POJO。

```java
public class UserInfo implements java.io.Serializable{  
      
    //实现serializable接口。  
    private static final long serialVersionUID = 1L;  
      
    private String name;  
    private int age;  
      
    //无参构造器  
    public UserInfo() {  
          
    }  
  
    public String getName() {  
        return name;  
    }  
  
    public void setName(String name) {  
        this.name = name;  
    }  
  
    public int getAge() {  
        return age;  
    }  
  
    public void setAge(int age) {  
        this.age = age;  
    }  
  
    //javabean当中可以有其它的方法  
    public void userInfoPrint(){  
        System.out.println("");  
    }  
}  
```

两者有什么区别？

POJO其实是比javabean更纯净的简单类或接口。POJO严格地遵守简单对象的概念，而一些JavaBean中往往会封装一些简单逻辑。

pojo的格式是用于数据的临时传递，它只能装载数据， 作为数据存储的载体，而不具有业务逻辑处理的能力。

而javabean虽然数据的获取与pojo一样，但是javabean当中可以有其它的方法。

 

3、DAO

DAO（data access objects）
DAO是数据访问对象，DAO一般有接口和该接口的实现类，接口用于规范实现类。实现类一般用于操作数据库，如对数据库进行修改、添加、删除等操作，一般直接调用公共类DAO。 


什么是DTO（data transfer object）、什么是VO（value object）、什么是PO（persistent object）？
我们通过DAO将POJO持久化为PO，用PO组装出来VO、DTO。

总结下，我认为一个对象究竟是什么O要看具体环境，在不同的层、不同的应用场合，对象的身份也不一样，而且对象身份的转化也是很自然的。就像你对老婆来说就是老公，对父母来说就是子女。设计这些概念的初衷不是为了唬人而是为了更好的理解和处理各种逻辑，让大家能更好的去用面向对象的方式处理问题。

比如：我们一张表有100个字段，那么对应的PO就有100个属性。但是我们界面上只要显示10个字段，客户端用WEBservice来获取数据，没有必要把整个PO对象传递到客户端，这时我们就可以用只有这10个属性的DTO来传递结果到客户端，这样也不会暴露服务端表结构.到达客户端以后，如果用这个对象来对应界面显示，那此时它的身份就转为VO。

什么是BO（business object）？

BO: POJO在业务层的体现，对于业务操作来说，更多的是从业务上来包装对象，如一个User的BO，可能包括name, age, sex, privilege, group等，这些属性在数据库中可能会在多张表中，因为每一张表对应一个PO，而我们的BO需要这些PO组合起来(或说重新拼装)才能成为业务上的一个完整对象。

4、EJB

EJB(Enterprise JavaBean): 我认为它是一组"功能"JavaBean的集合。
上面说了JavaBean是实现了一种规范的Java对象。这里说EJB是一组JavaBean，的意思是这一组JavaBean组合起来实现了某个企业组的业务逻辑。
这里的一组JavaBean不是乱组合的，它们要满足能实现某项业务功能的搭配。找个比方，对于一身穿着来说，包括一顶帽子，一件衣服，一条裤子，两只鞋。
这穿着就是EJB，其它的就是一个JavaBean

SSH与EJB区别

EJB是一种javabean的组合规范，SSH是3个框架jar包的组合。

EJB本身是JavaEE的规范由容器厂商负责实现，也就是使用EJB，需要使用JavaEE服务器。
而用SSH，直接用Web服务器， SSH中要解决的目标和EJB是一致的。EJB是大型的，SSH是轻量级的。