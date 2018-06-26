---
layout: post
title:  Junit5-24-Ex Exception Handle
date:  2018-06-26 14:51:52 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# TestExecutionExceptionHandler

TestExecutionExceptionHandler 为希望处理测试执行期间抛出的异常的扩展定义了API。

下面的示例显示了一个扩展，该扩展将包含IOException的所有实例，但将重新抛出任何其他类型的异常。


## 实例

- IgnoreIOExceptionExtension.java

```java
public class IgnoreIOExceptionExtension implements TestExecutionExceptionHandler {

    @Override
    public void handleTestExecutionException(ExtensionContext context, Throwable throwable)
            throws Throwable {

        if (throwable instanceof IOException) {
            return;
        }
        throw throwable;
    }
}
```

* any list
{:toc}