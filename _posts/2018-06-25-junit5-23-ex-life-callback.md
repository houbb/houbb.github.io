---
layout: post
title:  Junit5-23-Ex Test Lifecycle Callbacks
date:  2018-06-26 14:44:46 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# 测试声明周期回调

## 接口

下面的接口定义了在测试执行生命周期的各个点上扩展测试的api。请参阅下面的小节，了解示例和Javadoc中的每个接口

参见 [org.junit.jupiter.api.extension](https://junit.org/junit5/docs/current/api/org/junit/jupiter/api/extension/package-summary.html)

- 实现多个扩展api

扩展开发人员可以选择在一个扩展中实现任意数量的这些接口。

有关具体示例，请参阅 [SpringExtension](https://github.com/spring-projects/spring-framework/tree/master/spring-test/src/main/java/org/springframework/test/context/junit/jupiter/SpringExtension.java) 的源代码。


# 开始和结束的回调

BeforeTestExecutionCallback和AfterTestExecutionCallback定义了扩展的api，希望添加在测试方法执行之前和之后立即执行的行为。

因此，这些回调非常适合于计时、跟踪和类似的用例。如果您需要实现围绕@BeforeEach和@AfterEach方法调用的回调，那么应该实现BeforeEachCallback和AfterEachCallback。

下面的示例展示了如何使用这些回调来计算和记录测试方法的执行时间。TimingExtension既实现了BeforeTestExecutionCallback，又实现了AfterTestExecutionCallback，以便时间和记录测试执行。

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

由于TimingExtensionTests类通过@ExtendWith注册了TimingExtension，它的测试将在执行时应用这个计时。

- TimingExtensionTests.java

使用上述定义的类作为拓展

```java
@ExtendWith(TimingExtension.class)
class TimingExtensionTests {

    @Test
    void sleep20ms() throws Exception {
        Thread.sleep(20);
    }

    @Test
    void sleep50ms() throws Exception {
        Thread.sleep(50);
    }

}
```

日志输出如下：

```
INFO: Method [sleep20ms] took 24 ms.
INFO: Method [sleep50ms] took 53 ms.
```



* any list
{:toc}