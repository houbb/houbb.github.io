---
layout: post
title:  Junit5-08-Condition Test Execution
date:  2018-06-25 13:35:32 +0800
categories: [Test]
tags: [test, sh]
published: true
---

# 按条件执行测试用例

JUnit Jupiter中的ExecutionCondition扩展API允许开发人员以编程方式启用或禁用容器或测试。
这种情况最简单的例子是内置的DisabledCondition，它支持 `@Disabled` 注释(参见禁用测试)。
除了@Disabled之外，JUnit Jupiter还支持 `org.junit.jupiter.api.condition` 中的其他几个基于注解的条件。
允许开发人员以声明的方式启用或禁用容器和测试的条件包。

## Composed Annotations

注意，以下部分列出的任何条件注释也可以用作元注释，以便创建自定义组合注释。
例如，@EnabledOnOs演示中的@TestOnMac注释显示了如何将@Test和@EnabledOnOs结合在一个单独的、可重用的注释中。

以下部分列出的每个条件注释只能在给定的测试接口、测试类或测试方法上声明一次。
如果在给定的元素上直接呈现、间接呈现或多次元呈现一个条件注释，那么只使用JUnit发现的第一个此类注释;任何附加声明都将被静默地忽略。
但是，请注意，每个条件注释可以与`org.junit.jupiter.api.condition` 中的其他条件注释结合使用条件包。


# 操作系统条件

- OperateSysCondition.java

操作系统条件

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.DisabledOnOs;
import org.junit.jupiter.api.condition.EnabledOnOs;

import static org.junit.jupiter.api.condition.OS.LINUX;
import static org.junit.jupiter.api.condition.OS.MAC;
import static org.junit.jupiter.api.condition.OS.WINDOWS;

/**
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class OperateSysCondition {

    @Test
    @EnabledOnOs(MAC)
    void onlyOnMacOs() {
        // ...
    }

    @TestOnMac
    void testOnMac() {
        // ...
    }

    @Test
    @EnabledOnOs({ LINUX, MAC })
    void onLinuxOrMac() {
        // ...
    }

    @Test
    @DisabledOnOs(WINDOWS)
    void notOnWindows() {
        // ...
    }
}
```

- @TestOnMac.java

其中 `@TestOnMac` 这个注解，使我们根据已经有的注解，组合而成的新注解：

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledOnOs;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import static org.junit.jupiter.api.condition.OS.MAC;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Test
@EnabledOnOs(MAC)
public @interface TestOnMac {
}
```

# Java 运行环境条件

- JRECondition.java

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.DisabledOnJre;
import org.junit.jupiter.api.condition.DisabledOnOs;
import org.junit.jupiter.api.condition.EnabledOnJre;
import org.junit.jupiter.api.condition.EnabledOnOs;

import static org.junit.jupiter.api.condition.JRE.JAVA_10;
import static org.junit.jupiter.api.condition.JRE.JAVA_8;
import static org.junit.jupiter.api.condition.JRE.JAVA_9;
import static org.junit.jupiter.api.condition.OS.LINUX;
import static org.junit.jupiter.api.condition.OS.MAC;
import static org.junit.jupiter.api.condition.OS.WINDOWS;

public class JRECondition {

    @Test
    @EnabledOnJre(JAVA_8)
    void onlyOnJava8() {
        // ...
    }

    @Test
    @EnabledOnJre({ JAVA_9, JAVA_10 })
    void onJava9Or10() {
        // ...
    }

    @Test
    @DisabledOnJre(JAVA_9)
    void notOnJava9() {
        // ...
    }
}
```

# 系统属性条件

通过 `@EnabledIfSystemProperty` 和 `@DisabledIfSystemProperty` 注释，
可以根据命名的JVM系统属性的值启用或禁用容器或测试。通过matches属性提供的值将被解释为正则表达式。

- SystemPropertyCondition.java

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.DisabledIfSystemProperty;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;

public class SystemPropertyCondition {

    @Test
    @EnabledIfSystemProperty(named = "os.arch", matches = ".*64.*")
    void onlyOn64BitArchitectures() {
        // ...
    }

    @Test
    @DisabledIfSystemProperty(named = "ci-server", matches = "true")
    void notOnCiServer() {
        // ...
    }
}
```

# 环境变量条件

容器或测试可以根据底层操作系统中命名的环境变量的值通过 `@EnabledIfEnvironmentVariable`和 `@DisabledIfEnvironmentVariable` 注解来启用或禁用。
通过matches属性提供的值将被解释为正则表达式。

- EnvVarCondition.java

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.DisabledIfEnvironmentVariable;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

public class EnvVarCondition {

    @Test
    @EnabledIfEnvironmentVariable(named = "ENV", matches = "staging-server")
    void onlyOnStagingServer() {
        // ...
    }

    @Test
    @DisabledIfEnvironmentVariable(named = "ENV", matches = ".*development.*")
    void notOnDeveloperWorkstation() {
        // ...
    }
}
```


# 脚本依赖条件

JUnit Jupiter提供了根据对通过 `@EnabledIf` 或 `@DisabledIf` 注释配置的脚本的评估来启用或禁用容器或测试的能力。

脚本可以用JavaScript、Groovy或任何其他脚本语言编写，这些脚本语言都支持 [JSR 223](https://www.jcp.org/en/jsr/detail?id=223) 定义的Java脚本API。

## 注意

- 警告

这两个注解目前属于**实验性功能**，谨慎使用。

- 提示

1. 如果脚本的逻辑仅依赖于当前的操作系统、当前的Java运行时环境版本、特定的JVM系统属性或特定的环境变量，则应该考虑使用专门用于此目的的内置注释之一。

2. 如果您发现自己多次使用基于脚本的条件，请考虑编写一个专用的执行条件扩展，以便以更快、类型安全、更可维护的方式实现条件。

## 代码

```java
@Test // Static JavaScript expression.
@EnabledIf("2 * 3 == 6")
void willBeExecuted() {
    // ...
}

@RepeatedTest(10) // Dynamic JavaScript expression.
@DisabledIf("Math.random() < 0.314159")
void mightNotBeExecuted() {
    // ...
}

@Test // Regular expression testing bound system property.
@DisabledIf("/32/.test(systemProperty.get('os.arch'))")
void disabledOn32BitArchitectures() {
    assertFalse(System.getProperty("os.arch").contains("32"));
}

@Test
@EnabledIf("'CI' == systemEnvironment.get('ENV')")
void onlyOnCiServer() {
    assertTrue("CI".equals(System.getenv("ENV")));
}

@Test // Multi-line script, custom engine name and custom reason.
@EnabledIf(value = {
                "load('nashorn:mozilla_compat.js')",
                "importPackage(java.time)",
                "",
                "var today = LocalDate.now()",
                "var tomorrow = today.plusDays(1)",
                "tomorrow.isAfter(today)"
            },
            engine = "nashorn",
            reason = "Self-fulfilling: {result}")
void theDayAfterTomorrow() {
    LocalDate today = LocalDate.now();
    LocalDate tomorrow = today.plusDays(1);
    assertTrue(tomorrow.isAfter(today));
}
```

## 脚本绑定

下面的名称绑定到每个脚本上下文，因此可以在脚本中使用。访问器通过一个简单的 `String get(String name)` 方法提供对类似地图的结构的访问。

| 序号| 名称 | 类型 | 描述 |
|:---|:---|:---|:---|
| 1 | systemEnvironment | accessor | 操作系统环境变量访问器 |
| 2 | systemProperty | accessor | JVM系统属性访问器 |
| 3 | junitConfigurationParameter | accessor | 配置参数取值 |
| 4 | junitDisplayName | String | 测试或者容器的展示名称 |
| 5 | junitTags | Set<String> | 测试或者容器的所有标签信息 |
| 6 | junitUniqueId | String | 测试或者容器的唯一标识 |



* any list
{:toc}







