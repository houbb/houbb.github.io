---
layout: post
title:  Junit5-16-Template
date:  2018-06-25 19:25:34 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# 测试模板

@TestTemplate方法不是常规的测试用例，而是测试用例的模板。

因此，根据注册提供程序返回的调用上下文的数量，将多次调用它。

因此，它必须与注册的 `TestTemplateInvocationContextProvider` 扩展一起使用。
测试模板方法的每次调用都表现为对相同生命周期回调和扩展的完全支持的常规@Test方法的执行。

请参阅为使用示例提供测试模板的调用上下文。

## 实例

- MyTestTemplateInvocationContextProvider.java

```java
import org.junit.jupiter.api.extension.Extension;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.ParameterContext;
import org.junit.jupiter.api.extension.ParameterResolver;
import org.junit.jupiter.api.extension.TestTemplateInvocationContext;
import org.junit.jupiter.api.extension.TestTemplateInvocationContextProvider;

import java.util.Collections;
import java.util.List;
import java.util.stream.Stream;

public class MyTestTemplateInvocationContextProvider
implements TestTemplateInvocationContextProvider {


    @Override
    public boolean supportsTestTemplate(ExtensionContext context) {
        return true;
    }

    @Override
    public Stream<TestTemplateInvocationContext> provideTestTemplateInvocationContexts(ExtensionContext context) {
        return Stream.of(invocationContext("foo"), invocationContext("bar"));
    }

    private TestTemplateInvocationContext invocationContext(String parameter) {
        return new TestTemplateInvocationContext() {
            @Override
            public String getDisplayName(int invocationIndex) {
                return parameter;
            }

            @Override
            public List<Extension> getAdditionalExtensions() {
                return Collections.singletonList(new ParameterResolver() {
                    @Override
                    public boolean supportsParameter(ParameterContext parameterContext,
                                                     ExtensionContext extensionContext) {
                        return parameterContext.getParameter().getType().equals(String.class);
                    }

                    @Override
                    public Object resolveParameter(ParameterContext parameterContext,
                                                   ExtensionContext extensionContext) {
                        return parameter;
                    }
                });
            }
        };
    }
}
```

- TemplateTest.java

```java
import org.junit.jupiter.api.TestTemplate;
import org.junit.jupiter.api.extension.ExtendWith;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class TemplateTest {

    @TestTemplate
    @ExtendWith(MyTestTemplateInvocationContextProvider.class)
    void testTemplate(String parameter) {
        assertEquals(3, parameter.length());
    }

}
```





* any list
{:toc}