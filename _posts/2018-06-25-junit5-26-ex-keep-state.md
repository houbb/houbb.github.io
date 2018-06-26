---
layout: post
title:  Junit5-26-Ex Keeping State in Extensions
date:  2018-06-26 15:32:41 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# 在 Extensions 中保存状态

通常，一个扩展只实例化一次。
因此，问题变得相关了:如何将状态从一个扩展调用保存到下一个扩展?ExtensionContext API为此目的提供了一个存储。
扩展可以将值放入存储中以便以后检索。

请参阅 TimingExtension，了解如何使用带有方法级范围的存储。
重要的是要记住，在测试执行期间存储在 ExtensionContext 中的值在周围的 ExtensionContext 中不可用。
由于可嵌套扩展上下文，内部上下文的范围也可能是有限的。有关通过存储存储存储和检索值的可用方法的详细信息，请参阅相应的JavaDoc。

## 使用带有方法级范围的存储

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

> [Store](https://junit.org/junit5/docs/current/api/org/junit/jupiter/api/extension/ExtensionContext.Store.html) API

## ExtensionContext.Store.CloseableResource

扩展上下文存储绑定到其扩展上下文生命周期。

当扩展上下文生命周期结束时，它关闭关联的存储。通过调用close()方法通知属于CloseableResource实例的所有存储值。

* any list
{:toc}