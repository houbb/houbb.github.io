---
layout: post
title: test-01-test case generate 单元测试用例代码生成
date:  2016-4-26 12:53:12 +0800
categories: [Test]
tags: [junit, test, generate]
published: true
---

# 拓展阅读

> [junit5 系列](https://houbb.github.io/2018/06/24/junit5-01-hello)

> [基于 junit5 实现 junitperf 源码分析](https://houbb.github.io/2021/07/23/junit-performance-junit5)

[Auto generate mock data for java test.(便于 Java 测试自动生成对象信息)](https://github.com/houbb/data-factory)

[Junit performance rely on junit5 and jdk8+.(java 性能测试框架。性能测试。压测。测试报告生成。)](https://github.com/houbb/junitperf)


# 产品小工具

## 说明

直接可以用户使用的工具，不涉及枯燥的技术细节。

## gen-jmockit-idea-plugin 

[gen-jmockit-idea-plugin](https://github.com/houbb/gen-jmockit-idea-plugin) 自动生成 jmockit junit 的单元测试用例。

## gen-test-plugin

[gen-test-plugin](https://github.com/houbb/gen-test-plugin) 自动生成 junit 测试案例的 maven 插件

# JUnitGenerator

这个[插件](http://plugins.jetbrains.com/plugin/3064)允许在右键单击“Generate...”菜单时，针对一个Java类生成JUnit测试。

可以使用提供的Velocity模板自定义单元测试的输出代码，以根据源类格式化代码。

如果在已经存在的地方创建单元测试，用户将被提示选择覆盖或合并操作。

合并操作允许用户有选择地创建目标文件内容。

![JUnitGenerator](https://raw.githubusercontent.com/houbb/resource/master/img/junit/2016-08-30-junit.png)

- set the output path

```
${SOURCEPATH}/../../test/java/${PACKAGE}/${FILENAME}
```

- set the junit4 template

```java
########################################################################################
##
## Available variables:
##         $entryList.methodList - List of method composites
##         $entryList.privateMethodList - List of private method composites
##         $entryList.fieldList - ArrayList of class scope field names
##         $entryList.className - class name
##         $entryList.packageName - package name
##         $today - Todays date in MM/dd/yyyy format
##
##            MethodComposite variables:
##                $method.name - Method Name
##                $method.signature - Full method signature in String form
##                $method.reflectionCode - list of strings representing commented out reflection code to access method (Private Methods)
##                $method.paramNames - List of Strings representing the method's parameters' names
##                $method.paramClasses - List of Strings representing the method's parameters' classes
##
## You can configure the output class name using "testClass" variable below.
## Here are some examples:
## Test${entry.ClassName} - will produce TestSomeClass
## ${entry.className}Test - will produce SomeClassTest
##
########################################################################################
##
#macro (cap $strIn)$strIn.valueOf($strIn.charAt(0)).toUpperCase()$strIn.substring(1)#end
## Iterate through the list and generate testcase for every entry.
#foreach ($entry in $entryList)
#set( $testClass="${entry.className}Test")
##
package $entry.packageName;

import org.junit.Test;
import org.junit.Before;
import org.junit.After;

/**
* ${entry.className} Tester.
*
* @author houbinbin
* @since $today
* @version 1.0
*/
public class $testClass {

    @Before
    public void before() throws Exception {
    }

    @After
    public void after() throws Exception {
    }

    #foreach($method in $entry.methodList)
/**
    *
    * Method: $method.signature
    *
    */
    @Test
    public void ${method.name}Test() throws Exception {
    }

    #end

    #foreach($method in $entry.privateMethodList)
/**
    *
    * Method: $method.signature
    *
    */
    @Test
    public void ${method.name}Test() throws Exception {
    #foreach($string in $method.reflectionCode)
    $string
    #end
}

#end
}
#end
```

- test template with Mockito

```java
########################################################################################
##
## Available variables:
##         $entryList.methodList - List of method composites
##         $entryList.privateMethodList - List of private method composites
##         $entryList.fieldList - ArrayList of class scope field names
##         $entryList.className - class name
##         $entryList.packageName - package name
##         $today - Todays date in MM/dd/yyyy format
##
##            MethodComposite variables:
##                $method.name - Method Name
##                $method.signature - Full method signature in String form
##                $method.reflectionCode - list of strings representing commented out reflection code to access method (Private Methods)
##                $method.paramNames - List of Strings representing the method's parameters' names
##                $method.paramClasses - List of Strings representing the method's parameters' classes
##
## You can configure the output class name using "testClass" variable below.
## Here are some examples:
## Test${entry.ClassName} - will produce TestSomeClass
## ${entry.className}Test - will produce SomeClassTest
##
########################################################################################
##
#macro (cap $strIn)$strIn.valueOf($strIn.charAt(0)).toUpperCase()$strIn.substring(1)#end
#macro (uncap $strIn)$strIn.valueOf($strIn.charAt(0)).toLowerCase()$strIn.substring(1)#end
## Iterate through the list and generate testcase for every entry.
#foreach ($entry in $entryList)
#set( $testClass="${entry.className}Test")
##
package $entry.packageName;

import org.junit.Test;
import org.junit.Before;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;

/**
* ${entry.className} Tester.
*
* @author houbinbin
* @since $today
* @version 1.0
*/
public class $testClass {

    @InjectMocks
    private ${entry.className} #uncap(${entry.className});

    @Before
    public void init() {
     MockitoAnnotations.initMocks(this);
    }

    #foreach($method in $entry.methodList)
/**
    *
    * Method: $method.signature
    *
    */
    @Test
    public void ${method.name}Test() throws Exception {
    }

    #end

    #foreach($method in $entry.privateMethodList)
/**
    *
    * Method: $method.signature
    *
    */
    @Test
    public void ${method.name}Test() throws Exception {
    #foreach($string in $method.reflectionCode)
    $string
    #end
}

#end
}
#end
```

# chat 

## java 想自动生成测试用例，用哪些开源工具？

在Java中，有许多开源工具可用于自动生成测试用例。以下是一些常用的工具：

1. **JUnit**:
   - JUnit是Java中最常见的测试框架之一，用于编写和运行单元测试。虽然它本身不是专门用于生成测试用例的工具，但可以与其他工具结合使用，例如参数化测试，以自动生成更多测试用例。

2. **TestNG**:
   - TestNG是另一个流行的测试框架，支持更多的灵活性和功能，包括参数化测试和数据提供者，可以用于生成多个测试用例。

3. **Pitest**:
   - Pitest是一个开源的Mutation Testing工具，它可以通过对源代码进行变异来评估测试用例的质量。它不仅可以帮助您发现代码中的漏洞，还可以生成测试用例来覆盖这些变异。

4. **EvoSuite**:
   - EvoSuite是专门用于生成单元测试用例的工具。它使用遗传算法和符号执行等技术，自动创建具有高覆盖率的测试用例。

5. **QuickCheck** (例如，Java的QuickTheories或其他实现)：
   - QuickCheck是一种基于属性的测试框架，它可以生成大量的随机输入以测试代码的属性。QuickTheories是Java中的一个QuickCheck实现，可用于生成各种测试用例。

6. **Mockito**:
   - Mockito是一个用于编写单元测试中模拟对象的框架。虽然它主要用于模拟，但也可以用于生成一些测试用例。

请注意，以上列举的工具可能需要根据您的具体需求进行适当的组合和调整。选择适合您项目需求的工具，并根据实际情况进行合理的配置和集成。

## EvoSuite

理解了您的需求，如果您想要编写一个方法来自动生成测试用例，可以考虑使用一些测试自动生成工具，其中一个流行的工具是 EvoSuite。

EvoSuite 是一个基于遗传算法的测试用例生成器，它可以自动创建具有高覆盖率的测试用例。

以下是一个简单的示例，演示如何使用 EvoSuite 自动生成测试用例。

首先，确保 EvoSuite 已经添加到您的项目的依赖中。

```java
import your.package.UserProcessor;
import your.package.UserService;
import org.evosuite.runtime.EvoRunner;
import org.evosuite.runtime.EvoRunnerParameters;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(EvoRunner.class)
@EvoRunnerParameters(useVFS = true, separateClassLoader = true)
public class EvoSuiteGeneratedTest {

    @Test
    public void test() {
        UserService userService = new UserService(); // You may need to provide a real implementation or a mock
        UserProcessor userProcessor = new UserProcessor(userService);

        // EvoSuite will automatically generate test cases
        userProcessor.processUser(1);
    }
}
```

在这个示例中，我们使用了 EvoSuite 的注解 `@RunWith` 和 `@EvoRunnerParameters` 来配置 EvoSuite 的运行参数。

在测试方法中，我们创建了 `UserService` 和 `UserProcessor` 的实例，并调用了 `processUser` 方法。EvoSuite将自动尝试生成测试用例，以确保代码路径的覆盖率。

请注意，EvoSuite 需要与您的项目一起使用，因此您可能需要根据项目的实际情况配置 EvoSuite 的依赖和运行参数。

此外，由于 EvoSuite 的生成是基于遗传算法的，生成的测试用例可能不总是最优或最简洁的，因此需要人工审查和调整。

确保查阅 EvoSuite 的文档以获取更多详细信息和配置选项：[EvoSuite Documentation](https://www.evosuite.org/documentation/)。

## 类似的开源工具

除了 EvoSuite，还有一些其他类似的开源工具，可以帮助自动生成测试用例。以下是其中一些：

1. **Randoop**:
   - Randoop是一个生成随机测试用例的工具，可以用于 Java。它会在代码中执行随机操作，生成大量的测试用例，以尽可能覆盖代码路径。

4. **JCrasher**:
   - JCrasher是一个用于生成随机测试用例的工具，它会在程序中找到方法调用并尝试生成有效的测试输入。

5. **Tcases**:
   - Tcases 是一个用于生成测试用例的工具，它基于测试用例规范来生成输入。它可以用于 Java 以及其他一些编程语言。

请注意，这些工具的适用性和效果可能因项目和代码的特定性而异。在选择工具时，建议根据项目需求和测试目标进行评估，并可能需要尝试多个工具以找到最适合您项目的工具。

## 对比一下上面的工具，包含  EvoSuite。给出详细的对比表格

以下是 EvoSuite、Randoop、SymPy、Pex、JCrasher 和 Tcases 这几个工具的一些主要对比方面。

请注意，每个工具都有其独特的优势和限制，选择工具时需要根据具体项目需求和上下文进行评估。

| **特性 / 工具**   | **EvoSuite**  | **Randoop** | **SymPy** | **Pex** | **JCrasher** | **Tcases** |
|------------------|-------------|-----------|---------|--------|--------------|------------|
| **类型**          | 遗传算法生成测试用例 | 随机测试用例生成 | 符号执行生成测试输入 | 符号执行生成测试输入 | 随机测试用例生成 | 基于规范生成测试用例 |
| **语言支持**       | Java        | Java      | Java    | .NET   | Java         | 多种编程语言，包括 Java |
| **生成方式**       | 遗传算法，优化代码覆盖率 | 随机操作，最大化代码覆盖 | 符号执行，生成路径输入 | 动态符号执行，生成输入 | 随机测试输入，最大化代码覆盖 | 基于规范生成输入 |
| **自动化程度**      | 高度自动化，遗传算法进行优化 | 高度自动化，随机操作 | 高度自动化，符号执行 | 高度自动化，动态符号执行 | 高度自动化，随机操作 | 部分自动化，需要定义规范 |
| **代码覆盖率**      | 高（遗传算法优化） | 中等（随机操作） | 高（符号执行） | 高（动态符号执行） | 中等（随机操作） | 中等（基于规范） |
| **维护**          | 活跃开发，社区支持 | 不活跃，有限社区支持 | 活跃开发，有限社区支持 | 不活跃，Microsoft 维护 | 不活跃，有限社区支持 | 不活跃，有限社区支持 |
| **适用场景**       | 复杂项目，追求高代码覆盖率 | 快速测试，简单项目 | 复杂项目，路径条件测试 | .NET 项目，动态测试 | 快速测试，简单项目 | 基于规范的测试用例生成 |
| **文档和支持**      | 良好的文档和社区支持 | 有限文档，社区支持 | 有限文档，有限社区支持 | 有文档，Microsoft 支持 | 有限文档，有限社区支持 | 有文档，有限社区支持 |

这个对比表格提供了一些主要方面的比较，但在实际选择时，您可能还需要考虑其他因素，例如工具的易用性、集成性、性能等。

建议在选择之前详细查阅每个工具的文档和相关资料，以便更好地了解其特性和局限性。

## 如果通过模板结合解析java 源码，是不是也能生成最基本的测试用例？

是的，通过使用模板和解析Java源码的方式，您可以生成最基本的测试用例。

这通常涉及使用模板引擎（如FreeMarker、Velocity等）来创建测试用例的基本结构，然后通过解析Java源码，填充模板中的占位符和变量。

以下是一个简化的示例，说明这个过程：

1. **创建测试用例模板**：
   创建一个包含测试方法结构的模板，其中可能包括输入参数、预期输出等信息。使用模板引擎语法标记占位符。

```java
public class MyTestClass {

    @Test
    public void testMethodName() {
        // Placeholder for input parameters
        // Invoke the method to be tested
        // Assert the expected output
    }
}
```

2. **解析Java源码**：
   使用Java编译器API（如Java Compiler Tree API或其他解析工具）来分析源代码。您可以使用工具来遍历类、方法、字段等，并提取必要的信息，例如方法的参数、返回类型等。

3. **使用模板引擎填充模板**：
   将解析得到的信息填充到测试用例模板中的相应位置。替换模板中的占位符，使其反映源码的结构和信息。

4. **保存生成的测试用例**：
   将填充后的测试用例保存为Java源文件，以便后续编译和执行。

请注意，这样的自动生成测试用例的方法通常适用于生成基本的单元测试，涉及到方法调用和输出断言。对于更复杂的测试场景，可能需要更智能的生成策略，考虑到不同情况下的输入组合、异常处理等方面。

此外，要确保生成的测试用例是有效的，可能需要对生成的代码进行一些静态分析和质量控制，以确保生成的测试用例能够正确覆盖源代码的各个路径。


# 小结

不要把实现细节暴露给客户。

可以改成一开始自己设计的 gen-test 测试用例 maven 生成插件，以及对应的 idea 插件。

* any list
{:toc}