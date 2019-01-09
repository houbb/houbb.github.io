---
layout: post
title: java 浅拷贝，深度拷贝与属性复制
date: 2019-01-09 23:13:13 +0800
categories: [Java]
tags: [java, sh]
published: true
excerpt: java 浅拷贝，深度拷贝与属性复制
---

# 问题

日常工作中，我们希望复制一个对象A的属性到对象B，且保证二者的变化不会互相影响。

直接赋值，肯定是无法满足的。

# 深度拷贝与浅拷贝

## 概念

### 浅复制（浅克隆）

被复制对象的所有变量都含有与原来的对象相同的值，而所有的对其他对象的引用仍然指向原来的对象。

换言之，浅复制仅仅复制所考虑的对象，而不复制它所引用的对象。

### 深复制（深克隆）

被复制对象的所有变量都含有与原来的对象相同的值，除去那些引用其他对象的变量。

那些引用其他对象的变量将指向被复制过的新对象，而不再是原有的那些被引用的对象。

换言之，深复制把要复制的对象所引用的对象都复制了一遍。

## java clone 方法

- clone()

clone方法将对象复制了一份并返回给调用者。一般而言，clone() 方法满足：

① 对任何的对象x，都有x.clone() !=x//克隆对象与原对象不是同一个对象

② 对任何的对象x，都有x.clone().getClass()==x.getClass()//克隆对象与原对象的类型一样

③ 如果对象x的equals()方法定义恰当，那么x.clone().equals(x)应该成立。

- Java中对象的克隆

① 为了获取对象的一份拷贝，我们可以利用Object类的clone()方法。

② 在派生类中覆盖基类的clone()方法，并声明为public。 

③ 在派生类的clone()方法中，调用super.clone()。 

④ 在派生类中实现Cloneable接口。

## 使用例子

```java
class Student implements Cloneable    
{    
    String name;    
    int age;    
    
    Student(String name,int age) {    
        this.name=name;    
        this.age=age;    
    }    

    public Object clone() {    
        Object o=null;    
        try {    
            o=(Student)super.clone();//Object 中的clone()识别出你要复制的是哪一个对象。    
        } catch(CloneNotSupportedException e) {    
             System.out.println(e.toString());    
        }    
        return o;    
    }    
}    
```

这种复制是一种浅复制。

必须将对象中其他涉及到的对象，也显示 clone 一遍。

这种方式比较麻烦，不是很建议使用。

# 序列化来实现深拷贝

## 概念

把对象写到流里的过程是串行化（Serilization）过程，但是在Java程序师圈子里又非常形象地称为“冷冻”或者“腌咸菜（picking）”过程；

而把对象从流中读出来的并行化（Deserialization）过程则叫做 “解冻”或者“回鲜(depicking)”过程。

应当指出的是，写在流里的是对象的一个拷贝，而原对象仍然存在于JVM里面，因此“腌成咸菜”的只是对象的一个拷贝，Java咸菜还可以回鲜。

在Java语言里深复制一个对象，常常可以先使对象实现Serializable接口，然后把对象（实际上只是对象的一个拷贝）写到一个流里（腌成咸菜），再从流里读出来（把咸菜回鲜），便可以重建对象。

## 代码

如下为深复制源代码。

```java
public Object deepClone() {    
//将对象写到流里    
ByteArrayOutoutStream bo=new ByteArrayOutputStream();    
ObjectOutputStream oo=new ObjectOutputStream(bo);    
oo.writeObject(this);    
//从流里读出来    
ByteArrayInputStream bi=new ByteArrayInputStream(bo.toByteArray());    
ObjectInputStream oi=new ObjectInputStream(bi);    
return(oi.readObject());    
}   
```

这种比较接近预期，但是要求所有的对象都要进行序列化。

有时候就会很麻烦。

# 使用三方工具

## apache 的 BeanUtils 方案

使用org.apache.commons.beanutils.BeanUtils进行对象深入复制时候，主要通过向BeanUtils框架注入新的类型转换器。

因为默认情况下，BeanUtils对复杂对象的复制是引用，例如：

```java
public static void beanUtilsTest() throws Exception {
    // 注册转化器
    BeanUtilsBean.getInstance().getConvertUtils().register(new ArbitrationConvert(), ArbitrationDO.class);
    Wrapper wrapper = new Wrapper();
    wrapper.setName("copy");
    wrapper.setNameDesc("copy complex object!");
    wrapper.setArbitration(newArbitrationDO());
    Wrapper dest = new Wrapper();
    // 对象复制
    BeanUtils.copyProperties(dest, wrapper);
    // 属性验证
    wrapper.getArbitration().setBizId("1");
    System.out.println(wrapper.getArbitration() == dest.getArbitration());
    System.out.println(wrapper.getArbitration().getBizId().equals(dest.getArbitration().getBizId()));
}
 
public class ArbitrationConvert implements Converter {
 
    @Override
    public <T> T convert(Class<T> type, Object value) {
        if (ArbitrationDO.class.equals(type)) {
            try {
                return type.cast(BeanUtils.cloneBean(value));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return null;
    }
}
```

可以发现，使用org.apache.commons.beanutils.BeanUtils复制引用时，主和源的引用为同一个，即改变了主的引用属性会影响到源的引用，所以这是一种浅拷贝。

## apache的PropertyUtils方案

PropertyUtils的copyProperties()方法几乎与BeanUtils.copyProperties()相同，主要的区别在于后者提供类型转换功能，即发现两个JavaBean的同名属性为不同类型时，在支持的数据类型范围内进行转换，PropertyUtils不支持这个功能，所以说BeanUtils使用更普遍一点，犯错的风险更低一点。

而且它仍然属于浅拷贝。

Apache提供了 `SerializationUtils.clone(T)`，T对象需要实现 Serializable 接口，他属于深克隆。

##  spring 的 BeanUtils 方案

Spring中的BeanUtils，其中实现的方式很简单，就是对两个对象中相同名字的属性进行简单get/set，仅检查属性的可访问性。

```java
public static void copyProperties(Object source, Object target) throws BeansException {
        copyProperties(source, target, (Class)null, (String[])null);
    }
 
    public static void copyProperties(Object source, Object target, Class<?> editable) throws BeansException {
        copyProperties(source, target, editable, (String[])null);
    }
 
    public static void copyProperties(Object source, Object target, String... ignoreProperties) throws BeansException {
        copyProperties(source, target, (Class)null, ignoreProperties);
    }
 
    private static void copyProperties(Object source, Object target, Class<?> editable, String... ignoreProperties) throws BeansException {
        Assert.notNull(source, "Source must not be null");
        Assert.notNull(target, "Target must not be null");
        Class actualEditable = target.getClass();
        if(editable != null) {
            if(!editable.isInstance(target)) {
                throw new IllegalArgumentException("Target class [" + target.getClass().getName() + "] not assignable to Editable class [" + editable.getName() + "]");
            }
 
            actualEditable = editable;
        }
 
        PropertyDescriptor[] targetPds = getPropertyDescriptors(actualEditable);
        List ignoreList = ignoreProperties != null?Arrays.asList(ignoreProperties):null;
        PropertyDescriptor[] var7 = targetPds;
        int var8 = targetPds.length;
 
        for(int var9 = 0; var9 < var8; ++var9) {
            PropertyDescriptor targetPd = var7[var9];
            Method writeMethod = targetPd.getWriteMethod();
            if(writeMethod != null && (ignoreList == null || !ignoreList.contains(targetPd.getName()))) {
                PropertyDescriptor sourcePd = getPropertyDescriptor(source.getClass(), targetPd.getName());
                if(sourcePd != null) {
                    Method readMethod = sourcePd.getReadMethod();
                    if(readMethod != null && ClassUtils.isAssignable(writeMethod.getParameterTypes()[0], readMethod.getReturnType())) {
                        try {
                            if(!Modifier.isPublic(readMethod.getDeclaringClass().getModifiers())) {
                                readMethod.setAccessible(true);
                            }
 
                            Object ex = readMethod.invoke(source, new Object[0]);
                            if(!Modifier.isPublic(writeMethod.getDeclaringClass().getModifiers())) {
                                writeMethod.setAccessible(true);
                            }
 
                            writeMethod.invoke(target, new Object[]{ex});
                        } catch (Throwable var15) {
                            throw new FatalBeanException("Could not copy property \'" + targetPd.getName() + "\' from source to target", var15);
                        }
                    }
                }
            }
        }
}
```

可以看到, 成员变量赋值是基于目标对象的成员列表, 并且会跳过ignore的以及在源对象中不存在的, 所以这个方法是安全的, 不会因为两个对象之间的结构差异导致错误, 但是必须保证同名的两个成员变量类型相同。

## BeanCopier

性能比较好

## dozer

Dozer（http://dozer.sourceforge.net/）能够实现深拷贝。

Dozer是基于反射来实现对象拷贝，反射调用set/get 或者是直接对成员变量赋值。 

该方式通过invoke执行赋值，实现时一般会采用beanutil, Javassist等开源库。

## 利用 json

利用 json 序列化+反序列化，也可以实现深度复制。

## 综上推荐使用：

1. BeanUtils（简单，易用）

2. BeanCopier（加入缓存后和手工set的性能接近）

3. Dozer（深拷贝）

4. fastjson（特定场景下使用）

# 参考资料

[java对象克隆以及深拷贝和浅拷贝](https://www.cnblogs.com/xuanxufeng/p/6558330.html)

[谈谈 Java 开发中的对象拷贝](http://www.importnew.com/26306.html)

[JAVA深复制(深克隆)与浅复制(浅克隆)](https://www.cnblogs.com/yxnchinahlj/archive/2010/09/20/1831615.html)

[任意JAVA对象的深度拷贝](https://napp.iteye.com/blog/549463)

* any list
{:toc}

