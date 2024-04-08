---
layout: post
title:  QLExpress-07-API
date:  2018-06-10 12:17:25 +0800
categories: [Engine]
tags: [qlexpress, engine, rule-engine]
published: true
---

# 功能扩展API列表

QLExpress主要通过子类实现Operator.java提供的以下方法来最简单的操作符定义，然后可以被通过addFunction或者addOperator的方式注入到ExpressRunner中。

```java
public abstract Object executeInner(Object[] list) throws Exception;
```

# function 相关 API

```java
//通过name获取function的定义
OperatorBase getFunciton(String name);

//通过自定义的Operator来实现类似：fun(a,b,c)
void addFunction(String name, OperatorBase op);
//fun(a,b,c) 绑定 object.function(a,b,c)对象方法
void addFunctionOfServiceMethod(String name, Object aServiceObject,
			String aFunctionName, Class<?>[] aParameterClassTypes,
			String errorInfo);
//fun(a,b,c) 绑定 Class.function(a,b,c)类方法
void addFunctionOfClassMethod(String name, String aClassName,
			String aFunctionName, Class<?>[] aParameterClassTypes,
			String errorInfo);
//给Class增加或者替换method，同时 支持a.fun(b) ，fun(a,b) 两种方法调用
//比如扩展String.class的isBlank方法:“abc”.isBlank()和isBlank("abc")都可以调用
void addFunctionAndClassMethod(String name,Class<?>bindingClass, OperatorBase op);
```

# Operator 相关 API

提到脚本语言的操作符，优先级、运算的目数、覆盖原始的操作符(+,-,*,/等等)都是需要考虑的问题，QLExpress统统帮你搞定了。

```java
//添加操作符号,可以设置优先级
void addOperator(String name,Operator op);
void addOperator(String name,String aRefOpername,Operator op);
	
//替换操作符处理
OperatorBase replaceOperator(String name,OperatorBase op);
    
//添加操作符和关键字的别名，比如 if..then..else -> 如果。。那么。。否则。。
void addOperatorWithAlias(String keyWordName, String realKeyWordName, String errorInfo);
```

# 宏定义相关 API

QLExpress的宏定义比较简单，就是简单的用一个变量替换一段文本，和传统的函数替换有所区别。

```java
//比如addMacro("天猫卖家","userDO.userTag &1024 ==1024")
void addMacro(String macroName,String express) 
```

# java class 的相关 API

QLExpress可以通过给java类增加或者改写一些method和field，比如 链式调用："list.join("1").join("2")"，比如中文属性："list.长度"。

```java
//添加类的属性字段
void addClassField(String field,Class<?>bindingClass,Class<?>returnType,Operator op);

//添加类的方法
void addClassMethod(String name,Class<?>bindingClass,OperatorBase op);
```

> 注意

这些类的字段和方法是执行器通过解析语法执行的，而不是通过字节码增强等技术，所以只在脚本运行期间生效，不会对jvm整体的运行产生任何影响，所以是绝对安全的。

# 语法树解析变量、函数的 API

这些接口主要是对一个脚本内容的静态分析，可以作为上下文创建的依据，也可以用于系统的业务处理。 

比如：计算 “a+fun1(a)+fun2(a+b)+c.getName()” 包含的变量:a,b,c 包含的函数:fun1,fun2

```java
//获取一个表达式需要的外部变量名称列表
String[] getOutVarNames(String express);

String[] getOutFunctionNames(String express);
```

# 语法解析校验 API

脚本语法是否正确，可以通过ExpressRunner编译指令集的接口来完成。

```java
String expressString = "for(i=0;i<10;i++){sum=i+1}return sum;";
InstructionSet instructionSet = expressRunner.parseInstructionSet(expressString);
//如果调用过程不出现异常，指令集instructionSet就是可以被加载运行（execute）了！
```

# 指令集缓存相关的 API

因为QLExpress对文本到指令集做了一个本地HashMap缓存，通常情况下一个设计合理的应用脚本数量应该是有限的，缓存是安全稳定的，但是也提供了一些接口进行管理。

```java
//优先从本地指令集缓存获取指令集，没有的话生成并且缓存在本地
InstructionSet getInstructionSetFromLocalCache(String expressString);

//清除缓存
void clearExpressCache();
```

# 增强上下文参数 Context 相关的 API

## 与 spring 框架的无缝集成

上下文参数 IExpressContext context 非常有用，它允许put任何变量，然后在脚本中识别出来。

在实际中我们很希望能够无缝的集成到spring框架中，可以仿照下面的例子使用一个子类。

```java
public class QLExpressContext extends HashMap<String, Object> implements
		IExpressContext<String, Object> {

	private ApplicationContext context;

	//构造函数，传入context和 ApplicationContext
	public QLExpressContext(Map<String, Object> map,
                            ApplicationContext aContext) {
		super(map);
		this.context = aContext;
	}

	/**
	 * 抽象方法：根据名称从属性列表中提取属性值
	 */
	public Object get(Object name) {
		Object result = null;
		result = super.get(name);
		try {
			if (result == null && this.context != null
					&& this.context.containsBean((String) name)) {
				// 如果在Spring容器中包含bean，则返回String的Bean
				result = this.context.getBean((String) name);
			}
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
		return result;
	}

	public Object put(String name, Object object) {
		return super.put(name, object);
	}

}
```

## 自定义函数操作符获取原始的 context 控制上下文

自定义的Operator需要直接继承OperatorBase，获取到parent即可，可以用于在运行一组脚本的时候，直接编辑上下文信息，业务逻辑处理上也非常有用。

```java
public class ContextMessagePutTest {
    
    class OperatorContextPut extends OperatorBase {
        
        public OperatorContextPut(String aName) {
            this.name = aName;
        }
    
        @Override
        public OperateData executeInner(InstructionSetContext parent, ArraySwap list) throws Exception {
            String key = list.get(0).toString();
            Object value = list.get(1);
            parent.put(key,value);
            return null;
        }
    }
    
    @Test
    public void test() throws Exception{
        ExpressRunner runner = new ExpressRunner();
        OperatorBase op = new OperatorContextPut("contextPut");
        runner.addFunction("contextPut",op);
        String exp = "contextPut('success','false');contextPut('error','错误信息');contextPut('warning','提醒信息')";
        IExpressContext<String, Object> context = new DefaultContext<String, Object>();
        context.put("success","true");
        Object result = runner.execute(exp,context,null,false,true);
        System.out.println(result);
        System.out.println(context);
    }
}
```

* any list
{:toc}







