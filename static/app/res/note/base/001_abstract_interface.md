# abstract


- synchronized 二者会报错。

TAG:TODO

1) synchronized 锁的到底是什么



因为假设有这么一个方法，synchronized 的方法的同步锁对象是 this ，而包含这个抽象方法的接口或抽象类也许有多个子类，
那么那个 this 到底是指哪一个子类就无法确定。所以不可以。


public abstract synchronized void add();

- 不能 native / static 一起使用。

1) 因为native暗示这些方法是有实现体的，只不过这些实现体是非java的，
但是abstract却显然的指明这些方法无实现体。native与其它java标识符连用时，其意义同非Native Method并无差别。

2) static 

静态方法。

静态方法可以直接通过类名调用，任何的实例也都可以调用，因此静态方法中不能用this和super关键字，不能直接访问所属类的实例变量和实例方法(就是不带static的成员变量和成员成员方法)，只能访问所属类的静态成员变量和成员方法。因为实例成员与特定的对象关联！
因为static方法独立于任何实例，因此static方法必须被实现，而不能是抽象的abstract。


# interface 

所有的方法都是 public

编程的陋习：

将常量 定义在接口， 然后方便类中使用。 

完全可以 静态导入。(如果有必要的话)







1) 面向接口编程 和 面向 对象编程是不同的

TAG:TODO

何为面向对象？

1) 抽象

2) 封装
 
3) 继承
 
4) 多态
 
 
 

可以结合 java 集合 进行分析。


何为面向接口？

1) 是面向对象编程的精髓之一。

2) 

优缺点

1) 提高编程效率。



代码的复用性。

继承、组合、工具类。



2) 面向切面编程 (声明式编程)   AOP

AOP的实际例子。





# 何为程序


程序 = 算法 + 结构

抽象类与接口。

和自己的设计结合起来。


------------------------------------------------------------------------------------------------------------------------

24、abstract class 和 interface 有什么区别?
含有 abstract 修饰符的 class 即为抽象类,abstract 类不能创建的实例对象。含有 abstract 方法的类必须定义为abstract class,abstract class类中的方法不必是抽象的。abstract class

类中定义抽象方法必须在具体(Concrete)子类中实现,所以,不能有抽象构造方法或抽象静 态方法。如果的子类没有实现抽象父类中的所有抽象方法,那么子类也必须定义为 abstract 类型。
接口(interface)可以说成是抽象类的一种特例,接口中的所有方法都必须是抽象的。接口 中的方法定义默认为 public abstract 类型,接口中的成员变量类型默认为 public static final。

下面比较一下两者的语法区别:
1. 抽象类可以有构造方法,接口中不能有构造方法。
2. 抽象类中可以有普通成员变量,接口中没有普通成员变量
3. 抽象类中可以包含非抽象的普通方法,接口中的所有方法必须都是抽象的,不能有非抽象 的普通方法。
4. 抽象类中的抽象方法的访问类型可以是 public,protected 和(默认类型,虽然
eclipse 下不报错,但应该也不行),但接口中的抽象方法只能是 public 类型的,并且默认即
为 public abstract 类型。
5. 抽象类中可以包含静态方法,接口中不能包含静态方法
6. 抽象类和接口中都可以包含静态成员变量,抽象类中的静态成员变量的访问类型可以任 意,但接口中定义的变量只能是 public static final 类型,并且默认即为 public static final 类 型。
7. 一个类可以实现多个接口,但只能继承一个抽象类。 下面接着再说说两者在应用上的区别:

接口更多的是在系统架构设计方法发挥作用,主要用于定义模块之间的通信契约。而抽象类 在代码实现方面发挥作用,可以实现代码的重用,
例如,模板方法设计模式是抽象类的一个 典型应用,假设某个项目的所有 Servlet 类都要用相同的方式进行权限判断、记录访问日志 和处理异常,
那么就可以定义一个抽象的基类,让所有的 Servlet 都继承这个抽象基类,在 抽象基类的 service 方法中完成权限判断、记录访问日志和处理异常的代码,在各个子类中 只是完成各自的业务逻辑代码,伪代码如下:
public abstract classBaseServlet extends HttpServlet{
public final void service(HttpServletRequest request,HttpServletResponse response) throws IOExcetion,ServletException {
if(具有权限){ try{
记录访问日志
进行权限判断
}
} }
}

记录异常信息
doService(request,response); catch(Excetpion e) {
  protected abstract void doService(HttpServletRequest request,HttpServletResponse response) throws IOExcetion,ServletException;
//注意访问权限定义成 protected,显得既专业,又严谨,因为它是专门给子类用的 }
public class MyServlet1 extendsBaseServlet {
protected voiddoService(HttpServletRequest request, HttpServletResponse response) throwsIOExcetion,ServletException
{
    //本 Servlet 只处理的具体业务逻辑代码
}


父类方法中间的某段代码不确定,留给子类干,就用模板方法设计模式。

备注:这道题的思路是先从总体解释抽象类和接口的基本概念,然后再比较两者的语法细节, 最后再说两者的应用区别。
比较两者语法细节区别的条理是:先从一个类中的构造方法、普 通成员变量和方法(包括抽象方法),静态变量和方法,继承性等6个方面逐一去比较回答,
接着从第三者继承的角度的回答,特别是最后用了一个典型的例子来展现自己深厚的技术功底。







