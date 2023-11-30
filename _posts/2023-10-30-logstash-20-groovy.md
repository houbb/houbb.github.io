---
layout: post
title: logstash 日志加工处理-20-groovy 动态脚本语言
date: 2023-10-30 21:01:55 +0800
categories: [Log]
tags: [log, sh]
published: true
---


# Q: 谈一谈 groovy

Groovy 是一种基于 Java 平台的编程语言，它结合了静态类型语言和动态类型语言的特点。

Groovy 的设计目标是提供一种简洁、易读、易写的语法，同时与 Java 语言保持高度兼容性，使得开发人员能够更轻松地利用现有的 Java 代码和库。

以下是一些 Groovy 的主要特点：

1. **动态类型：** Groovy 是一种动态类型语言，这意味着你可以在运行时进行类型转换，而无需在编译时指定变量的类型。这使得代码更加灵活，减少了样板代码的编写。

2. **闭包支持：** Groovy 支持闭包，这是一种可以作为参数传递的代码块。这使得编写更具表达力和灵活性的代码变得更加容易。

3. **语法糖：** Groovy 提供了许多语法糖，使得代码更加简洁、易读。例如，列表和映射的定义、字符串插值等都得到了简化。

4. **DSL（领域特定语言）支持：** Groovy 的语法特性使其非常适合编写领域特定语言，这使得在特定领域内的代码更加直观和易于编写。

5. **运行在 Java 虚拟机上：** Groovy 代码可以与 Java 代码无缝集成，直接在 Java 虚拟机上运行。这使得在现有 Java 项目中引入 Groovy 成为可能，并且可以充分利用 Java 生态系统的丰富资源。

6. **测试支持：** Groovy 提供了强大的测试支持，包括对单元测试和集成测试的内建支持。这有助于保证代码的质量和稳定性。

7. **脚本语言特性：** Groovy 可以像脚本语言一样被运行，无需编译。这对于快速开发和脚本编写非常有用。

8. **Metaprogramming 支持：** Groovy 具有强大的元编程能力，允许在运行时动态修改和扩展类，以及通过元编程实现 AOP（面向切面编程）等高级特性。

总的来说，Groovy 是一种功能强大、灵活且易于学习的编程语言，特别适用于那些需要在 Java 平台上编写动态、简洁和易读代码的场景。

由于其与 Java 的高度集成性，它被广泛应用于构建各种类型的应用程序，包括脚本、Web 开发、测试脚本等。

# Q: java 中如何执行 groovy 脚本？

在 Java 中执行 Groovy 脚本通常涉及使用 Groovy 编译器和运行时库。

以下是一个简单的示例，演示如何在 Java 中执行 Groovy 脚本：

首先，确保你的项目中包含了 Groovy 库的依赖。如果使用 Maven，可以在 `pom.xml` 文件中添加以下依赖：

```xml
<dependency>
    <groupId>org.codehaus.groovy</groupId>
    <artifactId>groovy-all</artifactId>
    <version>2.5.14</version> <!-- 使用适合你项目的版本 -->
</dependency>
```

如果使用 Gradle，可以在 `build.gradle` 文件中添加：

```groovy
implementation 'org.codehaus.groovy:groovy-all:2.5.14' // 使用适合你项目的版本
```

接下来，可以使用以下 Java 代码执行 Groovy 脚本：

```java
import groovy.lang.GroovyClassLoader;
import groovy.lang.GroovyObject;

import java.io.File;

public class GroovyScriptExecutor {

    public static void main(String[] args) {
        try {
            // 创建 GroovyClassLoader
            GroovyClassLoader loader = new GroovyClassLoader();

            // 加载 Groovy 脚本文件
            Class<?> groovyClass = loader.parseClass(new File("path/to/YourScript.groovy"));

            // 创建脚本对象实例
            GroovyObject groovyObject = (GroovyObject) groovyClass.newInstance();

            // 调用脚本中的方法
            Object result = groovyObject.invokeMethod("yourScriptMethod", "parameter");

            // 打印脚本执行结果
            System.out.println("Script result: " + result);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

请替换上述代码中的 "path/to/YourScript.groovy" 和 "yourScriptMethod" 分别为你的 Groovy 脚本文件的路径和脚本中的方法名。

这个例子中使用了 `GroovyClassLoader` 来加载 Groovy 类，然后创建 Groovy 对象实例，并通过 `invokeMethod` 方法调用脚本中的方法。

注意，这里的类和方法名需要与你的 Groovy 脚本中的实际定义一致。

确保你的 Java 项目中包含了 Groovy 相关的依赖，并根据实际情况修改文件路径和方法名，你就可以在 Java 中成功执行 Groovy 脚本了。

# Q: 如果不是  Groovy 脚本文件，而是脚本字符串。给一个入门例子

如果你有一个 Groovy 脚本的字符串，而不是一个独立的 Groovy 脚本文件，你可以使用 GroovyShell 来执行该脚本字符串。以下是一个简单的入门例子：

```java
import groovy.lang.Binding;
import groovy.lang.GroovyShell;

public class GroovyScriptStringExecutor {

    public static void main(String[] args) {
        try {
            // 定义 Groovy 脚本字符串
            String groovyScript = "def greet(name) { 'Hello, ' + name + '!' }";

            // 创建绑定对象
            Binding binding = new Binding();

            // 创建 GroovyShell，并传入绑定对象
            GroovyShell shell = new GroovyShell(binding);

            // 执行 Groovy 脚本字符串
            Object result = shell.evaluate(groovyScript);

            // 调用脚本中的方法
            Object greeting = binding.getVariable("greet");
            Object finalResult = ((Closure<?>) greeting).call("John");

            // 打印脚本执行结果
            System.out.println("Script result: " + finalResult);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

在这个例子中，我们首先定义了一个 Groovy 脚本字符串，其中包含一个名为 "greet" 的方法。

然后，我们创建了一个绑定对象，该对象将在脚本执行期间保持变量的状态。

接着，我们使用 GroovyShell 来执行 Groovy 脚本字符串，并通过 `evaluate` 方法获取脚本的执行结果。

最后，我们从绑定对象中获取并调用脚本中的方法。

请注意，这里的脚本字符串中的方法名和调用方式需要与实际情况一致。

这只是一个简单的入门例子，你可以根据实际需求扩展和修改。

# Q: 给一下 logstash 的 ruby 插件例子

Logstash 的 Ruby 插件可以用于对事件数据进行处理和转换。

以下是一个简单的 Logstash Ruby 插件的示例，其中使用 Ruby 代码处理事件数据：

1. **创建 Ruby 插件文件：**

创建一个名为 `my_ruby_filter.rb` 的 Ruby 插件文件。

该文件将包含处理事件数据的 Ruby 代码。

```ruby
# my_ruby_filter.rb

# 导入 Logstash 事件库
require "logstash/filters/base"
require "logstash/namespace"

class LogStash::Filters::MyRubyFilter < LogStash::Filters::Base
  config_name "my_ruby_filter"

  # 配置插件参数
  config :field, :string, default: "message"

  public
  def register
    # 在这里执行初始化操作
  end

  public
  def filter(event)
    # 处理事件数据的逻辑
    if event.get(@field)
      # 获取消息字段的值
      message_value = event.get(@field)

      # 在消息后面添加 "Processed: "
      processed_message = "Processed: #{message_value}"

      # 更新事件数据
      event.set(@field, processed_message)
    end

    # 过滤器处理完成后，将事件传递给下一个处理阶段
    filter_matched(event)
  end
end
```

2. **使用 Ruby 插件配置 Logstash：**

在 Logstash 配置文件中引入并配置你的 Ruby 插件。

以下是一个示例配置：

```conf
# logstash.conf

input {
  stdin {}
}

filter {
  my_ruby_filter {
    field => "message"
  }
}

output {
  stdout {
    codec => rubydebug
  }
}
```

在这个配置中，我们使用 `stdin` 插件从标准输入读取数据，然后使用 `my_ruby_filter` 过滤器对消息字段进行处理。

最后，通过 `stdout` 插件将处理后的事件数据输出到控制台。

3. **运行 Logstash：**

运行 Logstash 并指定配置文件：

```bash
bin/logstash -f logstash.conf
```

4. **测试：**

在 Logstash 运行后，你可以在控制台中输入一些消息，然后查看输出，检查是否按照预期进行了处理。

这只是一个简单的例子，你可以根据实际需求扩展和修改 Ruby 插件的代码。

有关 Logstash Ruby 插件更详细的信息，可以查阅 Logstash 官方文档。

# Q: ruby 插件有哪些配置项？

Logstash Ruby 插件的配置项通常由插件的开发者定义，因此具体的配置项可能因插件而异。然而，有一些常见的配置项模式可以在 Ruby 插件中找到。以下是一些常见的配置项：

1. **config_name：** 用于指定插件的名称，以便在 Logstash 配置文件中引用。例如：

    ```ruby
    config_name "my_ruby_filter"
    ```

2. **milestone：** 用于指定插件的里程碑版本。这通常是一个整数。例如：

    ```ruby
    milestone 1
    ```

3. **logger：** 用于访问 Logstash 日志记录功能。插件可以使用 `logger` 对象记录消息。例如：

    ```ruby
    @logger.info("My message")
    ```

4. **validate：** 用于执行配置项验证的逻辑。可以检查配置项的正确性，并在不满足条件时引发异常。例如：

    ```ruby
    public
    def validate
      if @my_config_option.nil?
        raise LogStash::ConfigurationError, "The 'my_config_option' option is required."
      end
    end
    ```

5. **public方法：** 通常，插件会定义一些公共方法，供 Logstash 调用。这些方法负责处理事件数据。例如：

    ```ruby
    public
    def filter(event)
      # 处理事件数据的逻辑
      # ...
    end
    ```

6. **initialize方法：** 在插件对象创建时执行的初始化逻辑。例如：

    ```ruby
    public
    def initialize(params)
      super(params)
      # 执行初始化逻辑
      # ...
    end
    ```

7. **@instance_variables：** 插件可以定义一些实例变量，用于存储配置项的值。例如：

    ```ruby
    @field = "message"
    ```

8. **filter_matched方法：** 在 `filter` 方法中调用，用于指示事件已被成功处理。例如：

    ```ruby
    filter_matched(event)
    ```

请注意，以上只是一些常见的配置项和方法模式。具体的配置项和方法取决于插件的实际实现。

在使用特定插件时，最好查阅该插件的文档或源代码，以获取详细的配置项信息。

# Q: 设计

## 需求

我想用 java 实现一个基于 groovy 脚本的插件。

入参是 `Map<String,Object>` 上下文信息 context，和一个 groovy 脚本文件路径。

需要对 context 按照 groovy 的逻辑加工处理，如何实现？

## 思路

你可以使用 GroovyShell 类来在 Java 中执行 Groovy 脚本。

以下是一个简单的示例，演示如何在 Java 中实现一个基于 Groovy 脚本的插件，该插件接受一个 `Map<String, Object>` 上下文信息和一个 Groovy 脚本文件路径，然后按照 Groovy 的逻辑对上下文进行处理。

## 实现

首先，确保你的项目中包含了 Groovy 库的依赖。

### maven 

如果使用 Maven，可以在 `pom.xml` 文件中添加以下依赖：

```xml
<dependency>
    <groupId>org.codehaus.groovy</groupId>
    <artifactId>groovy-all</artifactId>
    <version>3.0.9</version> <!-- 使用适合你项目的版本 -->
</dependency>
```

### java 

然后，可以使用以下 Java 代码实现插件：

```java
package com.github.houbb.logstash4j.plugins.filter;

import com.github.houbb.heaven.util.common.ArgUtil;
import com.github.houbb.log.integration.core.Log;
import com.github.houbb.log.integration.core.LogFactory;
import com.github.houbb.logstash4j.plugins.api.filter.AbstractLogstashFilter;
import com.github.houbb.logstash4j.plugins.api.support.LogstashEventDataContext;
import com.github.houbb.logstash4j.plugins.filter.config.FilterGroovyConfigEnum;
import groovy.lang.Binding;
import groovy.lang.GroovyShell;

import java.io.File;
import java.io.IOException;

/**
 * 正则匹配模式
 *
 * @since 0.7.0
 */
public class Groovy extends AbstractLogstashFilter {

    private static final Log log = LogFactory.getLog(Groovy.class);

    /**
     *     MATCH("match", "匹配模式", null),
     *     TARGET("target", "目标字段名", "@grok"),
     *     BREAK_ON_MATCH("breakOnMatch", "当设置为 `true` 时，如果成功匹配了一个模式，就会停止继续匹配其他模式。", true),
     *     TAG_ON_FAILURE("grokTagOnFailure", "失败时的标签", "_grokParseFailure"),
     *     FIELD_APPEND("grokFieldAppend", "grok 是否添加解析后的字段到 eventMap 中", true),
     *
     * @param context 上下文
     */
    @Override
    public void doProcess(LogstashEventDataContext context) {
        String scriptPath = (String) getConfigVal(FilterGroovyConfigEnum.SCRIPT_PATH);
        String target = (String) getConfigVal(FilterGroovyConfigEnum.TARGET);
        ArgUtil.notEmpty(scriptPath, "scriptPath");
        ArgUtil.notEmpty(target, "target");

        try {
            Object result = processWithGroovyScript(context, scriptPath);
            context.addEvent(target, result);
        } catch (Exception e) {
            log.error("groovy meet ex", e);

            String tagOnFailure = (String) getConfigVal(FilterGroovyConfigEnum.TAG_ON_FAILURE);
            context.addTag(tagOnFailure);
        }
    }

    private static Object processWithGroovyScript(LogstashEventDataContext context, String scriptFilePath) throws IOException {
        // 创建绑定对象，并将上下文信息传递给 Groovy 脚本
        Binding binding = new Binding();
        // 将示例上下文传递给 Groovy 脚本
        binding.setVariable("context", context.getEventMap());
        GroovyShell shell = new GroovyShell(binding);

        // 加载 Groovy 脚本文件
        return shell.evaluate(new File(scriptFilePath));
    }

}
```

在这个例子中，`processWithGroovyScript` 方法接受一个 `Map<String, Object>` 的上下文信息和 Groovy 脚本文件的路径。

它使用 GroovyShell 来执行脚本，并将上下文信息传递给脚本。

脚本可以通过使用绑定对象中的变量来访问上下文信息。

在脚本执行后，你可以处理脚本的执行结果，如果有需要的话。

### groovy 脚本

```groovy
// MyGroovyScript.groovy
def processContext(context) {
    println "Received context: $context"

    // 在这里执行你的逻辑，可以使用传入的上下文
    // 例如，访问上下文中的变量：
    def value = context.get("name")
    println "Value from context: $value"
}

// 你可以在这里执行其他操作
// 从 Java 代码传入的上下文变量
processContext(context)
println "Groovy script initialized"
return "ok";
```

## 测试效果

- yaml

```yaml
---
inputs:
  - Csv: {
    path: 'stringlist.csv'
  }

filters:
  - Groovy:
      scriptPath: 'greet.groovy'

outputs:
  - StdOut: {
  }
```

效果如下：

```
Received context: [name:user,1, id:1, message:[1, user,1, 10], age:10]
Value from context: user,1
Groovy script initialized
Stdout: {@groovy=ok, name=user,1, id=1, message=[1, user,1, 10], age=10}

Received context: [name:user,1, id:2, message:[2, user,1, 201], age:201]
Value from context: user,1
Groovy script initialized
Stdout: {@groovy=ok, name=user,1, id=2, message=[2, user,1, 201], age=201}
```

# 参考资料

chat

* any list
{:toc}