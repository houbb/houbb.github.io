---
layout: post
title:  Reflection-05-method 方法
date:  2018-07-01 17:07:11 +0800
categories: [Java]
tags: [java, reflect]
published: true
---

# Java反射——方法

使用Java反射，你可以检查类的方法并在运行时调用它们。这是通过Java类java.lang.reflect.Method做的。本将会比较详细的讲述Java的Method对象。下面是涵盖的主题列表：

Obtaining Method Objects （获取Method对象）

Method Parameters and Return Types （Method的参数和返回值类型）

Instantiating Objects using Constructor Object （使用构造函数对象实例化对象）

# 获取Method对象

从Class对象中获取Method对象。这里有个例子：

```java
Class aClass = ...//obtain class object
Method[] methods = aClass.getMethods();
```

数组 methods 将存储类中声明的每个public方法的Method实例。

如果你知道你要访问的方法的准确的参数类型，你可以这样获取方法而不是所有的方法。

这个例子返回一个方法名叫doSomething的public的方法，在给定的类中指定了接受一个String类型的参数： 

## 获取更加确切的方法

```java
Class  aClass = ...//obtain class object
Method method = aClass.getMethod("doSomething", new Class[]{String.class});
```

如果没有和给定参数相匹配的的方法，会抛出NoSuchMethodException异常。

## 获取无参数的方法

如果你尝试去访问的方法没有参数，传入null作为参数，像这样：

```java
Class  aClass = ...//obtain class object
Method method = aClass.getMethod("doSomething", null);
```

# 方法的入参和出参

## 入参

你可以像这样读取一个给定的方法所接收的参数：

```java
Method method = ... // obtain method - see above
Class[] parameterTypes = method.getParameterTypes();
```
     

## 出参  

你可以像这样访问一个方法的返回值类型：

```java
Method method = ... // obtain method - see above
Class returnType = method.getReturnType();
```

# 调用方法

你可以像这样调用一个方法：

```java
//get method that takes a String as argument
Method method = MyObject.class.getMethod("doSomething", String.class);
Object returnValue = method.invoke(null, "parameter-value1");
```

参数null是你想要调用方法的对象。如果是静态方法，你需要提供null作为参数而不是一个对象的实例。

在这个例子里，如果doSomething(String.class)不是静态的，你需要提供validMyObject作为实例而不是null。

方法 `Method.invoke(Object target, Object … parameters)`接受不定个数的参数，但是你必须提供与你所调用的方法对应的每个参数。

在这里，这个方法接受一个String类型的参数，所以必须提供一个String类型的参数。
     
     
# 获取 Getter & Setter 方法

## 根据名称

使用Java反射你可以检查类的方法并在运行时调用它们。这个可以用来检测一个给定类所包含的Getter和Setter方法。你不能明确的获取Getter和Setter，所以你不得不通过扫描类里面的所有方法，然后检查每个方法是不是Getter方法或者Setter方法。

首先，让我们建立一些描述Getter和Setter特征的规则：

- Getter

一个getter方法的方法名易“get”开头，不接受参数，返回一个值。

- Setter

一个setter方法的方法名以“set”开头，接受一个参数。

setter方法既可以返回值也可以不返回值。

一些setter方法返回void，一些返回传入的值，其他的为了是使用方法链返回调用该setter的对象。

因此，你不应该对一个setter方法的返回值类型做假设。

这里是找出一个类的getter方法和setter方法的代码示例：

```java
public static boolean isGetter(Method method){
  if(!method.getName().startsWith("get"))      return false;
  if(method.getParameterTypes().length != 0)   return false;  
  if(void.class.equals(method.getReturnType()) return false;
  return true;
}

public static boolean isSetter(Method method){
  if(!method.getName().startsWith("set")) return false;
  if(method.getParameterTypes().length != 1) return false;
  return true;
}
```


ps: 缺陷，比如 boolean 值得 get 方法，一般是 isXXX

## 根据类修饰符号

PropertyDescriptor 类信息。
 
```java
public static void main(String[] args) throws Exception {  
  Class clazz = Class.forName("TaskProvidePropsList");//这里的类名是全名。。有包的话要加上包名  
  Object obj = clazz.newInstance();  
  Field[] fields = clazz.getDeclaredFields();  
  //写数据  
  for(Field f : fields) {  
   PropertyDescriptor pd = new PropertyDescriptor(f.getName(), clazz);  
   Method wM = pd.getWriteMethod();//获得写方法  
   wM.invoke(obj, 2);//因为知道是int类型的属性，所以传个int过去就是了。。实际情况中需要判断下他的参数类型  
  }  
  //读数据  
  for(Field f : fields) {  
   PropertyDescriptor pd = new PropertyDescriptor(f.getName(), clazz);  
   Method rM = pd.getReadMethod();//获得读方法  
   Integer num = (Integer) rM.invoke(obj);//因为知道是int类型的属性,所以转换成integer就是了。。也可以不转换直接打印  
   System.out.println(num);  
  }  
 }  
}
```

# 私有方法

为了访问私有方法，你需要调用Class.getDeclaredMethod(String name, Class[] parameterTypes)方法或者Class.getDeclaredMethods()方法。

Class.getMethod(String name, Class[ ] parameterTypes)方法和Class.getMethods()只会返回共有的方法，所以它们不会工作。

下面是一个简单的代码示例，通过Java反射访问一个类的私有方法：

```java
public class PrivateObject {

  private String privateString = null;

  public PrivateObject(String privateString) {
    this.privateString = privateString;
  }

  private String getPrivateString(){
    return this.privateString;
  }
}

PrivateObject privateObject = new PrivateObject("The Private Value");

Method privateStringMethod = PrivateObject.class.getDeclaredMethod("getPrivateString", null);

privateStringMethod.setAccessible(true);

String returnValue = (String)privateStringMethod.invoke(privateObject, null);
    
System.out.println("returnValue = " + returnValue);
```

这段代码示例将会打印出文本“returnValue = The Private Value”，是在代码示例最开始创建的PrivateObject实例调用getPrivateString()方法时的返回值。

注意这里使用的方法PrivateObject.class.getDeclaredMethod("privateString")。是这个方法调用返回的私有方法。

这个方法只会返回在给定的类里面声明的方法，而不是在任何超类里声明的方法。

仅仅针对反射，通过调用 `Method.setAccessible(true)` 方法，关闭了对特定的Method实例的访问检查。

现在你可以访问它了，尽管它是private，或者protected，或者package scope，即使调用者不在这个范围内。你仍然不能通过一般的代码访问这些方法。编译器不允许这样干。

# 参考资料

http://tutorials.jenkov.com/java-reflection/index.html

https://www.cnblogs.com/jason123/p/7092008.html