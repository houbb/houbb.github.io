---
layout: post
title: 函数式编程-03-让 java 更加函数式
date:  2020-6-5 17:42:59 +0800
categories: [Pattern]
tags: [pattern, functional-programming, sh]
published: true
---



# 3.1 使标准控制结构具有函数式风格

控制结构是命令式编程的主要组成部分。命令式的 Java 程序员都不会相信无须使用 if···else switch .. ·case for, while do 循环即可编写程序。这些结构是命令式编程的本质。但在接下来的章节中，你将学习如何编写绝对没有控制结构的函数式程序。在本节中，你不会那么激进一一我们只关注以更加函数式的风格来使用传统的控制结构。

纯函数式的方法除了返回 1 个值以外不能做任何其他事情。它们不能改变外围作用域里的对象或引用。方法返回的值只能取决于它的参数，尽管方法可以读取外围作用域里的数据。在这种情况下，数据被认为是隐式参数

在命令式编程中，控制结构定义了作用域，它们一般在作用域内工作，也就意味着它们具有作用。这个作用可能仅在控件结构的作用域内可见，也可能在外围作用域内可见。控制结构还可以访问外围作用域来取值。


清单 3. 展示了电子邮件地址验证的基本示例。


# 从邮箱验证说起

验证邮箱的合法性，是一个非常常见的需求。

如果邮件格式合法，就发送对应的验证邮件；如果非法，则提示错误信息。

我们一般的实现方式如下：

```java
import java.util.regex.Pattern;

/**
 * @author 老马啸西风
 * @since 1.0.0
 */
public class EmailValid {

    private final Pattern pattern = Pattern.compile("^[0-9a-z]+\\w*@([0-9a-z]+\\.)+[0-9a-z]+$");

    public void testEmail(String email) {
        if(pattern.matcher(email).matches()) {
            sendVerifyEmail(email);
        } else {
            logError(email + " is not valid!");
        }
    }

    private void sendVerifyEmail(String email) {
        System.out.println("Send email to: " + email);
    }

    private void logError(String errorMsg) {
        System.err.println("Error msg logged: " + errorMsg);
    }

}
```

# 3.2 抽象控制结构

上面的方法在函数式编程中是不应该看到的，因为混淆了数据的处理与作用。

## 使用函数验证合法性

我把首先使用函数进行合法性校验，并且添加一个 Result 类来处理计算的结果。

```java
import java.util.function.Function;
import java.util.regex.Pattern;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class EmailValidFunctional {

    private static Pattern pattern = Pattern.compile("^[0-9a-z]+\\w*@([0-9a-z]+\\.)+[0-9a-z]+$");

    private static Function<String, Result> emailValidator = s-> {
        if(s == null || s.length() == 0) {
            return new Result.Fail("Email can't be empty!");
        } else if(pattern.matcher(s).matches()) {
            return new Result.Success();
        } else {
            return new Result.Fail("Email is invalid!");
        }
    };

    public void testEmail(String email) {
        Result result = emailValidator.apply(email);
        if(result instanceof Result.Success) {
            sendVerifyEmail(email);
        } else {
            String msg = ((Result.Fail)result).getMsg();
            logError(msg);
        }
    }

}
```

emailValidator 的作用就是验证邮件的合法性，更加便于测试。

我们添加了一些判断，让错误提示更加自然易懂。

其中 Result 类的定义如下：

```java
/**
 * @author binbin.hou
 * @since 1.0.0
 */
public interface Result {

    public class Success implements Result {}

    public class Fail implements Result {
        private final String msg;

        public Fail(String msg) {
            this.msg = msg;
        }

        public String getMsg() {
            return msg;
        }
    }
}
```

## 如何移除 instanceof

instanceof 这个让我们的代码非常不优雅，那有没有方法移除呢？

我们调整一下 result 的实现。

其实最简单的思路就是子类重载，让不同的子类有不同的实现就行。

我们调整一下 Result 实现类：

```java
import java.util.function.Consumer;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public interface Result<T> {

    public void bind(Consumer<T> success, Consumer<T> fail);

    static <T> Result<T> success(T value) {
        return new Success<>(value);
    }
    static <T> Result<T> fail(T value) {
        return new Fail<>(value);
    }

    public class Success<T> implements Result<T> {
        private final T msg;

        public Success(T msg) {
            this.msg = msg;
        }

        @Override
        public void bind(Consumer<T> success, Consumer<T> fail) {
            success.accept(msg);
        }
    }

    public class Fail<T> implements Result<T> {
        private final T msg;

        public Fail(T msg) {
            this.msg = msg;
        }

        public T getMsg() {
            return msg;
        }

        @Override
        public void bind(Consumer<T> success, Consumer<T> fail) {
            fail.accept(msg);
        }
    }
}
```

bind 就可以指定对应的实现策略，我们成功的时候回调 success，失败回调 fail 即可。

```java
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.regex.Pattern;

/**
 * @author binbin.hou
 * @since 1.0.0
 */
public class EmailValidFunctional {

    private static Pattern pattern = Pattern.compile("^[0-9a-z]+\\w*@([0-9a-z]+\\.)+[0-9a-z]+$");

    private static Function<String, Result<String>> emailValidator = s-> {
        if(s == null || s.length() == 0) {
            return Result.fail("Email can't be empty!");
        } else if(pattern.matcher(s).matches()) {
            return Result.success(s);
        } else {
            return Result.fail("Email is invalid!");
        }
    };

    public void testEmail(String email) {
        Result<String> result = emailValidator.apply(email);
        result.bind(success, fail);
    }

    private Consumer<String> success = s -> System.out.println("Send email to: " + s);

    private Consumer<String> fail = s -> System.err.println("Error msg logged: " + s);

}
```

### 测试

```java
public static void main(String[] args) {
    EmailValidFunctional functional = new EmailValidFunctional();
    functional.testEmail("123@qq.com");
    functional.testEmail("");
}
```

对应的日志信息如下：

```
Send email to: 123@qq.com
Error msg logged: Email can't be empty!
```


# 3.3 抽象迭代

## 原始的写法

以前的迭代，无论式基于 index 下标的遍历，还是如下的 for 循环：

```java
for(String email : emails) {
    //...
}
```

迭代是一个非常常见的操作，那么对应的操作可以被抽象吗？

## 抽象映射

我们循环处理一个整数列表，并且将其乘以固定的比例。

```java
public List<Double> rate(List<Integer> nums) {
    List<Double> doubles = new ArrayList<>();
    for(Integer integer : nums) {
        doubles.add(integer*1.2);
    }
    return doubles;
}
```

我们可以将这个循环抽象如下：

```java
public static <T, R> List<R> map(List<T> list, Function<T, R> function) {
    List<R> results = new ArrayList<>();
    for (T t : list) {
        R r = function.apply(t);
        results.add(r);
    }
    return results;
}
```

这样就可以有一个对映射处理的统一方法。

## 列表创建

jdk 有一些内置的列表创建方法，但是并不一致。

我们可以加一些内置的工具方法：

```java
/**
 * 空列表
 * @param <T> 泛型
 * @return 空列表
 * @since 0.1.128
 */
public static <T> List<T> list() {
    return Collections.emptyList();
}
/**
 * 空列表
 * @param t 实体
 * @param <T> 泛型
 * @return 空列表
 * @since 0.1.128
 */
public static <T> List<T> list(T t) {
    return Collections.singletonList(t);
}
/**
 * 列表
 * @param ts 数组
 * @param <T> 泛型
 * @return 空列表
 * @since 0.1.128
 */
public static <T> List<T> list(T... ts) {
    return new ArrayList<>(Arrays.asList(ts));
}
```

## head 和 tail

有时候我们需要获取第一个或者最后一个元素。

可以添如下的工具类方法：

```java
/**
 * 复制列表
 * @param list 列表
 * @param <T> 泛型
 * @return 空列表
 * @since 0.1.128
 */
public static <T> List<T> copy(List<T> list) {
    return new ArrayList<>(list);
}
/**
 * 获取第一个元素
 * @param list 列表
 * @param <T> 泛型
 * @return 空列表
 * @since 0.1.128
 */
public static <T> T head(List<T> list) {
    if(CollectionUtil.isEmpty(list)) {
        return null;
    }
    return list.get(0);
}
/**
 * 获取最后一个元素
 * @param list 列表
 * @param <T> 泛型
 * @return 空列表
 * @since 0.1.128
 */
public static <T> T tail(List<T> list) {
    if(CollectionUtil.isEmpty(list)) {
        return null;
    }
    return list.get(list.size()-1);
}
```

## 添加元素

有时候我们需要添加一个元素到列表中，可以定义方法如下：

```java
/**
 * 添加元素到列表
 * @param list 列表
 * @param t 元素
 * @param <T> 泛型
 * @return 空列表
 * @since 0.1.128
 */
public static <T> List<T> append(List<T> list, T t) {
    if(list == null) {
        list = new ArrayList<>();
    }
    list.add(t);
    return list;
}
```

## 化简和折叠

列表折叠（fold）通过使用一个特定操作来将列表转换为单值。结果可以是任何类型，不必与列表的元素类型相同。

折叠的结果类型若是与列表元素相同，则是一种称为化简（reduce）的特殊情况。对整型列表的元素进行求和是化简的一种简单情况。

你可以在从左到右或从右到左这两个方向上折叠列表，视所用的操作而定如果操作可交换，则两种折叠方式是等价的。

如果操作不可交换 则两种折叠方式会给出不同的结果。

折叠操作需要一个起始值，即操作的中性元素或单位元 (identity element) 元素作为累加器（ accumulator ）的起始值。

当计算完成时， 累加器内即包含结果。

另一方面，只要列表不为空，也可以在没有起始元素 情况下执行化筒，因为第一个（或最后 1 个) 元素将作为起始元素。


## 列表反转

列表反转的实现如下：

```java
/**
 * 反转列表
 * @param list 列表
 * @param t 元素
 * @param <T> 泛型
 * @return 空列表
 * @since 0.1.128
 */
public static <T> List<T> reverse(List<T> list, T t) {
    if(CollectionUtil.isEmpty(list)) {
        return list;
    }
    List<T> results = new ArrayList<>(list.size());
    for(int i = list.size()-1; i >= 0; i--) {
        results.add(list.get(i));
    }
    list.add(t);
    return results;
}
```

# 参考资料

《java 函数式编程》

* any list
{:toc}