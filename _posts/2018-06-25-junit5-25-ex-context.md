---
layout: post
title:  Junit5-25-Ex Test Context
date:  2018-06-26 14:51:52 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# 测试上下文

@TestTemplate方法只能在注册至少一个TestTemplateInvocationContextProvider时执行。

每个这样的提供者都负责提供TestTemplateInvocationContext实例流。

每个上下文可以指定一个自定义显示名称和一个附加扩展列表，这些扩展只用于@TestTemplate方法的下一次调用。

## 实例

下面的示例展示了如何编写测试模板以及如何注册和实现TestTemplateInvocationContextProvider。

- MyTestTemplateInvocationContextProvider.java

```java
public class MyTestTemplateInvocationContextProvider implements TestTemplateInvocationContextProvider {
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

- testTemplate()

```java
@TestTemplate
@ExtendWith(MyTestTemplateInvocationContextProvider.class)
void testTemplate(String parameter) {
    assertEquals(3, parameter.length());
}
```

- 执行说明

在本例中，将调用两次测试模板。
调用的显示名称将是调用上下文指定的“foo”和“bar”。每个调用都注册一个自定义参数解析器，用于解析方法参数。
使用 `ConsoleLaunche` 时的输出如下:

```
└─ testTemplate(String) ✔
   ├─ foo ✔
   └─ bar ✔
```

TestTemplateInvocationContextProvider扩展API主要用于实现不同类型的测试，这些测试依赖于重复调用类似测试的方法，
尽管是在不同的上下文中—例如，使用不同的参数，以不同的方式准备测试类实例，或者多次不修改上下文。

* any list
{:toc}