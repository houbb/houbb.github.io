---
layout: post
title:  Junit5-13-Test Interface And Default Method
date:  2018-06-25 17:54:15 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# 测试接口和默认方法

JUnit Jupiter允许在接口默认方法上声明@Test、@RepeatedTest、@ParameterizedTest、@TestFactory、@TestTemplate、@BeforeEach和@AfterEach。
如果测试接口或测试类被@TestInstance(Lifecycle.PER_CLASS)注释，
则@BeforeAll和@AfterAll可以在测试接口中的静态方法上声明，也可以在接口默认方法上声明。

这里有一些例子。

## 定义接口

- TestLifecycleLogger.java

```java
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInfo;
import org.junit.jupiter.api.TestInstance;

import java.util.logging.Logger;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public interface TestLifecycleLogger {

    static final Logger LOG = Logger.getLogger(TestLifecycleLogger.class.getName());

    @BeforeAll
    default void beforeAllTests() {
        LOG.info("Before all tests");
    }

    @AfterAll
    default void afterAllTests() {
        LOG.info("After all tests");
    }

    @BeforeEach
    default void beforeEachTest(TestInfo testInfo) {
        LOG.info(() -> String.format("About to execute [%s]",
                testInfo.getDisplayName()));
    }

    @AfterEach
    default void afterEachTest(TestInfo testInfo) {
        LOG.info(() -> String.format("Finished executing [%s]",
                testInfo.getDisplayName()));
    }
}
```

- TestInterfaceDynamicTestsDemo.java

```java
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;

import java.util.Arrays;
import java.util.Collection;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.DynamicTest.dynamicTest;

public interface TestInterfaceDynamicTestsDemo {

    @TestFactory
    default Collection<DynamicTest> dynamicTestsFromCollection() {
        return Arrays.asList(
                dynamicTest("1st dynamic test in test interface", () -> assertTrue(true)),
                dynamicTest("2nd dynamic test in test interface", () -> assertEquals(4, 2 * 2))
        );
    }
}
```

可以在测试接口上声明 `@ExtendWith` 和 `@Tag`，以便实现该接口的类自动继承其标记和扩展。
查看测试执行前后对 TimingExtension 源代码的回调。


- TimeExecutionLogger.java

```java
@Tag("timed")
@ExtendWith(TimingExtension.class)
interface TimeExecutionLogger {
}
```

- TimingExtension.java

```java
import java.lang.reflect.Method;
import java.util.logging.Logger;

import org.junit.jupiter.api.extension.AfterTestExecutionCallback;
import org.junit.jupiter.api.extension.BeforeTestExecutionCallback;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.ExtensionContext.Namespace;
import org.junit.jupiter.api.extension.ExtensionContext.Store;

public class TimingExtension implements BeforeTestExecutionCallback, AfterTestExecutionCallback {

    private static final Logger logger = Logger.getLogger(TimingExtension.class.getName());

    private static final String START_TIME = "start time";

    @Override
    public void beforeTestExecution(ExtensionContext context) throws Exception {
        getStore(context).put(START_TIME, System.currentTimeMillis());
    }

    @Override
    public void afterTestExecution(ExtensionContext context) throws Exception {
        Method testMethod = context.getRequiredTestMethod();
        long startTime = getStore(context).remove(START_TIME, long.class);
        long duration = System.currentTimeMillis() - startTime;

        logger.info(() -> String.format("Method [%s] took %s ms.", testMethod.getName(), duration));
    }

    private Store getStore(ExtensionContext context) {
        return context.getStore(Namespace.create(getClass(), context.getRequiredTestMethod()));
    }
}
```

## 测试案例

- TestInterfaceDemo.java

```java
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TestInterfaceDemo implements TestLifecycleLogger,
        TimeExecutionLogger, TestInterfaceDynamicTestsDemo {

    @Test
    void isEqualValue() {
        assertEquals(1, 1, "is always equal");
    }
}
```

日志如下：

```
Jun 25, 2018 6:18:43 PM com.github.houbb.jdk.junit5.interfaces.TestLifecycleLogger beforeAllTests
信息: Before all tests
Jun 25, 2018 6:18:43 PM com.github.houbb.jdk.junit5.interfaces.TestLifecycleLogger beforeEachTest
信息: About to execute [isEqualValue()]
Jun 25, 2018 6:18:43 PM com.github.houbb.jdk.junit5.interfaces.TimingExtension afterTestExecution
信息: Method [isEqualValue] took 4 ms.
Jun 25, 2018 6:18:43 PM com.github.houbb.jdk.junit5.interfaces.TestLifecycleLogger afterEachTest
信息: Finished executing [isEqualValue()]
Jun 25, 2018 6:18:43 PM com.github.houbb.jdk.junit5.interfaces.TestLifecycleLogger afterAllTests
信息: After all tests
```

# 接口契约

这个特性的另一个可能的应用是为接口契约编写测试。

例如，您可以为对象的实现方式编写测试。`Object.equals` 的或 `Comparable.compareTo` 的。

## 接口定义

- Testable.java

```java
public interface Testable<T> {

    T createValue();

}
```

- EqualsContract.java

```java
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

public interface EqualsContract<T> extends Testable<T> {

    T createNotEqualValue();

    @Test
    default void valueEqualsItself() {
        T value = createValue();
        assertEquals(value, value);
    }

    @Test
    default void valueDoesNotEqualNull() {
        T value = createValue();
        assertFalse(value.equals(null));
    }

    @Test
    default void valueDoesNotEqualDifferentValue() {
        T value = createValue();
        T differentValue = createNotEqualValue();
        assertNotEquals(value, differentValue);
        assertNotEquals(differentValue, value);
    }
}
```

- ComparableContract.java

```java
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public interface ComparableContract<T extends Comparable<T>> extends Testable<T> {

    T createSmallerValue();

    @Test
    default void returnsZeroWhenComparedToItself() {
        T value = createValue();
        assertEquals(0, value.compareTo(value));
    }

    @Test
    default void returnsPositiveNumberComparedToSmallerValue() {
        T value = createValue();
        T smallerValue = createSmallerValue();
        assertTrue(value.compareTo(smallerValue) > 0);
    }

    @Test
    default void returnsNegativeNumberComparedToSmallerValue() {
        T value = createValue();
        T smallerValue = createSmallerValue();
        assertTrue(smallerValue.compareTo(value) < 0);
    }
}
```

## 测试类

在您的测试类中，您可以实现这两个契约接口，从而继承相应的测试。当然，您必须实现抽象方法。

- StringTest.java

```java
public class StringTest
        implements ComparableContract<String>, EqualsContract<String>{
    @Override
    public String createValue() {
        return "foo";
    }

    @Override
    public String createSmallerValue() {
        return "bar"; // 'b' < 'f' in "foo"
    }

    @Override
    public String createNotEqualValue() {
        return "baz";
    }
}
```

* any list
{:toc}