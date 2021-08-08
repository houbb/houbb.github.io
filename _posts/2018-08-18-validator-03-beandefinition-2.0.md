---
layout: post
title:  Validator-03-beanvalidation 2.0 文档整理
date:  2018-08-18 14:40:08 +0800
categories: [Java]
tags: [java, sf]
published: true
---

# 说明

本系列为官方文档的翻译，主要是为了系统学习 Bean-Definition 的设计。

https://beanvalidation.org/1.0/spec/

https://beanvalidation.org/2.0/spec

# 2.0 中的新功能

Bean Validation 2.0 的主要贡献是利用 Java 8 的新语言特性和 API 添加来进行验证。

使用 Bean Validation 2.0 需要 Java 8 或更高版本。

这些变化包括：

支持通过注释参数化类型的类型参数来验证容器元素，例如List<@Positive Integer> positiveNumbers（参见容器元素约束）；这还包括：

更灵活的集合类型级联验证；例如现在可以验证映射的值和键： Map<@Valid CustomerType, @Valid Customer> customersByType

支持 java.util.Optional

支持 JavaFX 声明的属性类型

通过插入附加值提取器来支持自定义容器类型（请参阅值提取器定义）

支持@Past 和@Future 的新日期/时间数据类型（请参阅内置约束定义）；对用于验证的当前时间和时区进行细粒度控制（请参阅时间约束验证器的实现）

新的内置约束：@Email、@NotEmpty、@NotBlank、@Positive、@PositiveOrZero、@Negative、@NegativeOrZero、@PastOrPresent 和 @FutureOrPresent（参见内置约束定义）

所有内置约束现在都标记为可重复

使用反射检索参数名称（请参阅命名参数）

ConstraintValidator#initialize() 是默认方法（请参阅约束验证实现）

Bean Validation XML 描述符的命名空间已更改为 http://xmlns.jcp.org/xml/ns/validation/configuration for META-INF/validation.xml 和 http://xmlns.jcp.org/xml/ns /validation/mapping 用于约束映射文件（请参阅 XML 配置：META-INF/validation.xml）

# 约束定义

约束由约束注释和约束验证实现列表的组合定义。 

在组合的情况下，约束注释应用于类型、字段、方法、构造函数、参数、容器元素或其他约束注释。

除非另有说明，否则 Jakarta Bean Validation API 的默认包名称是 javax.validation。

## 约束注解

JavaBean 上的约束通过一个或多个注释来表达。 

如果注释的保留策略包含 RUNTIME 并且注释本身使用 javax.validation.Constraint 进行注释，则该注释被视为约束定义

```java
@Documented
@Target({ ANNOTATION_TYPE })
@Retention(RUNTIME)
public @interface Constraint {

    Class<? extends ConstraintValidator<?, ?>>[] validatedBy();
}
```

如果一个约束至少有一个约束验证器针对所注释的元素，即针对由约束注释的（返回的）元素（bean、字段、getter、方法/构造函数返回值或方法/构造函数参数）。

如果一个约束具有一个针对方法或构造函数的参数数组的约束验证器（以验证多个方法/构造函数参数的一致性），则称该约束为交叉参数。 

Jakarta Bean Validation 约束大部分时间是通用约束或交叉参数约束。在极少数情况下，约束可以同时存在。

通用约束注释可以针对以下任何 ElementType：

FIELD: 约束属性的字段  

METHOD: 受约束的 getter 和受约束的方法返回值的方法

CONSTRUCTOR 用于受约束的构造函数返回值

PARAMETER 用于受约束的方法和构造函数参数

TYPE: 受限 bean 的 TYPE

ANNOTATION_TYPE 用于构成其他约束的约束

TYPE_USE 用于容器元素约束

跨参数约束注释可以针对以下任何 ElementType：

METHOD

CONSTRUCTOR

ANNOTATION_TYPE 用于构成其他交叉参数约束的交叉参数约束

既可以是通用约束注释目标又可以是跨参数约束注释目标的并集的约束注释。

虽然不禁止其他 ElementType，但提供者不必识别和处理对此类类型施加的约束。

由于给定的约束定义适用于一个或多个特定的 Java 类型，约束注释的 JavaDoc 应该清楚地说明支持哪些类型。将约束注释应用于不兼容的类型将引发 UnexpectedTypeException。

定义 ConstraintValidators 列表时应该小心。如果 ConstraintValidator 列表导致歧义，则类型解析算法（请参阅 ConstraintValidator 解析算法）可能会导致异常。

对于给定的约束，最多必须存在一个支持交叉参数验证的 ConstraintValidator。否则会引发 ConstraintDefinitionException。 JavaDoc 应该清楚地说明约束是否是泛型和/或交叉参数约束。

如果约束定义无效，则在验证时或在请求元数据时引发 ConstraintDefinitionException。无效的约束定义原因有多种，但包括丢失或非法的消息或组元素（请参阅约束定义属性）。

> Jakarta Bean Validation 定义了在继承层次结构中应用约束注释的规则，在继承（接口和超类）和继承层次结构中的方法约束中进行了描述。 因此，不建议在约束注释类型中指定元注释 java.lang.annotation.Inherited，因为它与 Jakarta Bean 验证的上下文无关，并且会与提议的规则冲突。

## 约束定义属性

约束定义可能具有在将约束应用于 JavaBean 时指定的属性。 属性被映射为注释元素。 

注释元素名称 message、groups、validationAppliesTo 和 payload 被视为保留名称； 不允许以 valid 开头的注释元素； 约束可以使用任何其他元素名称作为其属性。

### message

每个约束注释都必须定义一个 String 类型的消息元素。

```java
String message() default "{com.acme.constraint.MyConstraint.message}";
```

消息元素值用于创建错误消息。 有关详细说明，请参阅消息插值。 建议将消息值默认为资源包键以启用国际化。

 还建议使用以下约定：资源包键应该是连接到 .message 的约束注释的完全限定类名，如前面的程序清单所示。

内置 Jakarta Bean 验证约束遵循此约定。

### groups

每个约束注释都必须定义一个组元素，该元素指定与约束声明相关联的处理组。 

groups 参数的类型是 Class<?>[]。

```java
Class<?>[] groups() default {};
```

默认值必须是一个空数组。

如果在对元素声明约束时未指定组，则认为默认组已声明。

有关更多信息，请参阅组。

组通常用于控制评估约束的顺序，或执行 JavaBean 部分状态的验证。

### payload 有效载荷

约束注释必须定义一个负载元素，该元素指定与约束声明相关联的负载。 

有效载荷参数的类型是 Payload[]。

```java
Class<? extends Payload>[] payload() default {};
```

默认值必须是一个空数组。

每个可附加的有效载荷都扩展了有效载荷。

验证客户端通常使用有效负载将某些元数据信息与给定的约束声明相关联。 

将有效负载描述为接口扩展而不是基于字符串的方法可以提供一种更简单且类型更安全的方法。 

有效载荷通常是不可携带的。 

一个例外是 Unwrapping.Skip 和 Unwrapping.Unwrap 有效载荷类型，它们由本规范定义（参见容器的隐式解包）。

使用有效载荷将严重性与约束相关联中显示的有效载荷的一个用例是将严重性与约束相关联。 

表示框架可以利用这种严重性来调整约束失败的显示方式。

```java
package com.acme.severity;

public class Severity {
    public static class Info implements Payload {};
    public static class Error implements Payload {};
}

public class Address {
    @NotNull(message="would be nice if we had one", payload=Severity.Info.class)
    public String getZipCode() { [...] }

    @NotNull(message="the city is mandatory", payload=Severity.Error.class)
    String getCity() { [...] }
}
```

可以通过 ConstraintDescriptor 从错误报告中检索有效载荷信息

### validationAppliesTo

在约束声明时使用validationAppliesTo 来阐明约束的目标（即带注释的元素、方法返回值或方法参数）。

元素validationAppliesTo 必须只存在于通用和交叉参数的约束中，在这种情况下它是强制性的。 如果违反这些规则，则会引发 ConstraintDefinitionException。

validationAppliesTo 参数的类型是 ConstraintTarget。 默认值必须是 ConstraintTarget.IMPLICIT。

```java
ConstraintTarget validationAppliesTo() default ConstraintTarget.IMPLICIT;
```

## 约束特定参数

约束注释定义可以定义附加元素来参数化约束。 

例如，验证字符串长度的约束可以使用名为 length 的注释元素在声明约束时指定最大长度。


# 应用多个相同类型的约束

对具有不同属性的同一目标多次声明相同的约束通常很有用。一个常见的例子是@Pattern 约束，它验证其目标是否与指定的正则表达式匹配。其他约束也有这个要求。相同的约束类型可以属于不同的组，并根据目标组具有特定的错误消息。

为了支持这一要求，Jakarta Bean Validation 提供程序以特殊方式处理其值元素具有约束注释数组的返回类型的常规注释（注释未由@Constraint 注释）。值数组中的每个元素都由 Jakarta Bean 验证实现作为常规约束注释进行处理。这意味着 value 元素中指定的每个约束都应用于目标。注释必须具有保留 RUNTIME 并且可以应用于类型、字段、属性、可执行参数、可执行返回值、可执行交叉参数或其他注释。建议使用与初始约束相同的一组目标。

约束设计者注意：每个约束注释都应该与其对应的多值注释相结合。该规范建议（但不强制）定义名为 List 的内部注释。每个约束注释类型都应该使用 java.lang.annotation.Repeatable 进行元注释，引用相应的 List 注释。这将约束注释类型标记为可重复，并允许用户多次指定约束，而无需显式使用 List 注释。所有内置注释都遵循此模式。

ps: 一个注解可以被重复使用多次。比如 `@Pattern` 满足多个不同的表达式，有时候是很有必要的。

# 约束组合

此规范允许您组合约束以创建更高级别的约束。

约束组合在以下几个方面很有用：

避免重复并促进更多原始约束的重用。

将原始约束作为元数据 API 中组合约束的一部分公开并增强工具意识。

组合是通过使用组合约束注释注释约束注释来完成的。

```java
@Pattern(regexp = "[0-9]*")
@Size(min = 5, max = 5)
@Constraint(validatedBy = FrenchZipCodeValidator.class)
@Documented
@Target({ METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER, TYPE_USE })
@Retention(RUNTIME)
public @interface FrenchZipCode {

    String message() default "Wrong zip code";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    @Target({ METHOD, FIELD, ANNOTATION_TYPE, CONSTRUCTOR, PARAMETER, TYPE_USE })
    @Retention(RUNTIME)
    @Documented
    @interface List {
        FrenchZipCode[] value();
    }
}
```

# 约束验证实现

约束验证实现对给定类型的给定约束注释执行验证。 

实现类由修饰约束定义的@Constraint 注释的validatedBy 元素指定。 

约束验证实现实现了 ConstraintValidator 接口。

清单 3.6：ConstraintValidator 接口

```java
public interface ConstraintValidator<A extends Annotation, T> {

    default void initialize(A constraintAnnotation) {
    }

    boolean isValid(T value, ConstraintValidatorContext context);
}
```

# 约束验证器工厂

约束验证实现实例由 ConstraintValidatorFactory 创建。

ConstraintValidator 实例的生命周期完全依赖于 Jakarta Bean Validation 提供程序并由 ConstraintValidatorFactory 方法控制。 

因此，ConstraintValidatorFactory 实现（例如依赖注入框架）必须将这些实例视为属于依赖范围。 

Jakarta Bean Validation 提供者必须释放检索到的每个实例。 

已创建 ConstraintValidator 实例的 ConstraintValidatorFactory 实例必须是释放它的实例。 

换句话说，将 ConstraintValidator 的实例传递给尚未创建它的 ConstraintValidatorFactory 是一个错误。

```java
public interface ConstraintValidatorFactory {

    <T extends ConstraintValidator<?, ?>> T getInstance(Class<T> key);

    void releaseInstance(ConstraintValidator<?, ?> instance);
}
```

# 值提取器定义

容器元素约束的验证（参见容器元素约束）以及通用容器类型的级联验证（参见图形验证）需要访问存储在容器中的值。 

存储在容器中的值的检索是通过 ValueExtractor 接口的实现来处理的：

```java
public interface ValueExtractor<T> {

    void extractValues(T originalValue, ValueReceiver receiver);

    interface ValueReceiver {

        void value(String nodeName, Object object);

        void iterableValue(String nodeName, Object object);

        void indexedValue(String nodeName, int i, Object object);

        void keyedValue(String nodeName, Object key, Object object);
    }
}
```

* any list
{:toc}
