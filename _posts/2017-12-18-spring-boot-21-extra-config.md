---
layout: post
title:  Spring Boot-21-Externalized Configuration 外部化配置
date:  2017-12-19 14:43:25 +0800
categories: [Spring]
tags: [spring, web, springboot]
published: true
---

# 外部化配置

Spring Boot使您可以外部化配置，以便可以在不同环境中使用相同的应用程序代码。 

您可以使用各种外部配置源，包括Java属性文件，YAML文件，环境变量和命令行参数。

可以使用 `@Value` 批注将属性值直接注入到您的bean中，可以通过Spring的Environment抽象访问，也可以通过@ConfigurationProperties绑定到结构化对象。

Spring Boot使用一个非常特殊的PropertySource顺序，该顺序旨在允许合理地覆盖值。 

## 属性的书序

按以下顺序考虑属性（较低项的值覆盖较早项的值）：

1. 默认属性（通过设置SpringApplication.setDefaultProperties指定）。

2. @Configuration类上的@PropertySource批注。请注意，在刷新应用程序上下文之前，不会将此类属性源添加到环境中。现在配置某些属性（如logging。*和spring.main。*）为时已晚，这些属性在刷新开始之前就已读取。

3. 配置数据（例如application.properties文件）

4. 一个RandomValuePropertySource，仅具有 `random.*` 属性。

5. 操作系统环境变量。

6. Java系统属性（System.getProperties（））。

7. 来自 `Java:comp/env` 的JNDI属性。

8. ServletContext的初始化参数。

9. ServletConfig的初始化参数。

10. 来自SPRING_APPLICATION_JSON的属性（嵌入在环境变量或系统属性中的内联JSON）。

11. 命令行参数。

12. 测试中的properties属性。在@SpringBootTest和测试注释上可用，用于测试应用程序的特定部分。

13. 测试上的@TestPropertySource批注。

14. devtools处于活动状态时，`$HOME/.config/spring-boot` 目录中的Devtools全局设置属性。

## 配置数据文件

配置数据文件按以下顺序考虑：

1. 打包在jar中的应用程序属性（application.properties和YAML变体）。

2. 打包在jar中的特定于配置文件的应用程序属性（application-{profile}.properties和YAML变体）。

3. 打包的jar之外的应用程序属性（application.properties和YAML变体）。

4. 打包的jar之外的特定于配置文件的应用程序属性（application-{profile}.properties和YAML变体）。

为了提供一个具体的示例，假设您开发一个使用name属性的@Component，如以下示例所示：

```java
import org.springframework.stereotype.*;
import org.springframework.beans.factory.annotation.*;

@Component
public class MyBean {

    @Value("${name}")
    private String name;

    // ...

}
```

在您的应用程序类路径上（例如，在jar内），您可以拥有一个application.properties文件，该文件为名称提供合理的默认属性值。 

在新环境中运行时，可以在jar外部提供一个覆盖该名称的application.properties文件。 

对于一次性测试，可以使用特定的命令行开关启动（例如，`java -jar app.jar --name="Spring"`）。

# 访问命令行属性

默认情况下，SpringApplication将所有命令行选项参数（即以 `--` 开头的参数，例如 `--server.port = 9000`）转换为属性，并将其添加到Spring Environment中。 

如前所述，命令行属性始终优先于基于文件的属性源。

如果您不希望将命令行属性添加到环境中，则可以使用SpringApplication.setAddCommandLineProperties（false）禁用它们。

# JSON应用程序属性

环境变量和系统属性通常具有一些限制，这意味着无法使用某些属性名称。 

为了解决这个问题，Spring Boot允许您将属性块编码为单个JSON结构。

当您的应用程序启动时，任何spring.application.json或SPRING_APPLICATION_JSON属性都将被解析并添加到环境中。

例如，可以在命令行中将SPRING_APPLICATION_JSON属性作为环境变量提供给 unix shell：

```
$ SPRING_APPLICATION_JSON='{"acme":{"name":"test"}}' java -jar myapp.jar
```

在前面的示例中，您最终在Spring Environment中获得了acme.name = test。

也可以提供相同的JSON作为系统属性：

```
$  java -Dspring.application.json='{"acme":{"name":"test"}}' -jar myapp.jar
```

或者，您可以使用命令行参数来提供JSON：

```
$ java -jar myapp.jar --spring.application.json='{"acme":{"name":"test"}}'
```

如果要部署到传统的Application Server，则还可以使用名为 `java:comp/env/spring.application.json` 的JNDI变量。

尽管JSON中的空值将添加到结果属性源中，但PropertySourcesPropertyResolver将空属性视为缺失值。 

这意味着JSON无法使用空值覆盖低阶属性源中的属性。

# 外部应用程序属性

当您的应用程序启动时，Spring Boot将从以下位置自动查找并加载application.properties和application.yaml文件：

1. 类路径根

2. classpath/config包

3. 当前目录

4. 当前目录中的 /config 子目录

5. /config 子目录的直接子目录

该列表按优先级排序（较低项目的值覆盖较早的项目）。 

来自加载文件的文档作为PropertySources添加到Spring Environment。

如果您不喜欢application作为配置文件名，则可以通过指定spring.config.name环境属性来切换到另一个文件名。 

您还可以通过使用spring.config.location环境属性（这是目录位置或文件路径的逗号分隔列表）来引用显式位置。 

以下示例显示如何指定其他文件名：

```
$ java -jar myproject.jar --spring.config.name=myproject
```

下面的示例演示如何指定两个位置：

```
$ java -jar myproject.jar --spring.config.location=optional:classpath:/default.properties,optional:classpath:/override.properties
```

spring.config.name和spring.config.location很早就用于确定必须加载的文件。 

必须将它们定义为环境属性（通常是OS环境变量，系统属性或命令行参数）。

如果spring.config.location包含目录（而不是文件），则它们应以/结尾（在运行时，它们将被附加spring.config.name生成的名称，然后再加载）。 

spring.config.location中指定的文件按原样使用。 

无论是直接指定还是包含在目录中，配置文件都必须在名称中包含文件扩展名。 

开箱即用的典型扩展名是.properties，.yaml和.yml。

如果指定了多个位置，则后面的位置可以覆盖前面的位置。

使用spring.config.location配置的位置将替换默认位置。 

例如，如果spring.config.location配置为值 `optional:classpath:/custom-config/,optional:file:./custom-config/`，则考虑的完整位置集为：

1. optional:classpath:custom-config/

2. optional:file:./custom-config/

如果您喜欢添加其他位置，而不是替换它们，则可以使用spring.config.additional-location。从其他位置加载的属性可以覆盖默认位置的属性。 

例如，如果spring.config.additional-location配置为值 `optional:classpath:/custom-config/,optional:file:./custom-config/` 则所考虑的位置的完整集合为：

1. optional:classpath:/

2. optional:classpath:/config/

3. optional:file:./

4. optional:file:./config/

5. optional:file:./config/*/

6. optional:classpath:custom-config/

7. optional:file:./custom-config/

通过此搜索顺序，您可以在一个配置文件中指定默认值，然后在另一个配置文件中有选择地覆盖这些值。

您可以在默认位置之一的application.properties（或使用spring.config.name选择的其他任何基本名称）中为应用程序提供默认值。

然后，可以在运行时使用自定义位置之一中的其他文件覆盖这些默认值。

如果使用环境变量而不是系统属性，则**大多数操作系统不允许使用句点分隔的键名，但是可以使用下划线代替**（例如，使用SPRING_CONFIG_NAME代替spring.config.name）。 有关详细信息，请参见从环境变量绑定。

如果您的应用程序在servlet容器或应用程序服务器中运行，则可以使用JNDI属性（在 `java:comp/env` 中）或servlet上下文初始化参数来代替环境变量或系统属性，或者与之一起使用。

## 可选位置

默认情况下，当指定的配置数据位置不存在时，Spring Boot将抛出ConfigDataLocationNotFoundException并且您的应用程序将不会启动。

如果您想指定位置，但是不介意它并不总是存在，则可以使用 `optional:` 前缀。 

您可以将此前缀与spring.config.location和spring.config.additional-location属性以及spring.config.import声明一起使用。

例如，spring.config.import值 `optional:file:./myconfig.properties` 允许您的应用程序启动，即使缺少myconfig.properties文件。

如果要忽略所有ConfigDataLocationNotFoundExceptions并始终继续启动应用程序，则可以使用 spring.config.on-not-found 属性。 

使用SpringApplication.setDefaultProperties（…）或系统/环境变量将值设置为忽略。

## 通配符位置

如果配置文件位置的最后一个路径段包含 `*` 字符，则将其视为通配符位置。加载配置时，通配符会展开，以便也检查直接子目录。当存在多个配置属性源时，通配符位置在诸如Kubernetes之类的环境中特别有用。

例如，如果您具有一些Redis配置和某些MySQL配置，则可能需要将这两个配置分开，同时要求这两个配置都存在于application.properties文件中。这可能会导致两个单独的application.properties文件安装在不同的位置，例如/config/redis/application.properties和/config/mysql/application.properties。

在这种情况下，通配符位置为 `config/*/` 将导致两个文件都被处理。

默认情况下，Spring Boot在默认搜索位置包含 `config/*/`。这意味着将搜索jar之外 /config 目录的所有子目录。

您可以自己使用spring.config.location和spring.config.additional-location属性使用通配符位置。

通配符位置必须仅包含一个`*`，并以 `*/` 结尾（对于目录的搜索位置）或 `*/<filename>`（对于文件的搜索位置）。 

带通配符的位置根据文件名的绝对路径按字母顺序排序。

通配符位置仅适用于外部目录。 您不能在 `classpath:` 位置中使用通配符。

## profile 专用文件

除了应用程序属性文件之外，Spring Boot还将尝试使用命名约定 `application-{profile}` 来加载特定于配置文件的文件。 

例如，如果您的应用程序激活了名为prod的配置文件并使用YAML文件，则将同时考虑application.yml和application-prod.yml。

特定于配置文件的属性是从与标准application.properties相同的位置加载的，特定于配置文件的文件始终会覆盖非特定文件。 

如果指定了多个配置文件，则采用后赢策略。 

例如，如果配置文件prod，live由spring.profiles.active属性指定，那么application-prod.properties中的值可以被application-live.properties中的值覆盖。

如果没有设置任何活动配置文件，则环境具有一组默认配置文件（默认为[默认]）。

换句话说，如果未显式激活任何概要文件，那么将考虑application-default的属性。

属性文件仅被加载一次。 如果您已经直接导入了特定于配置文件的属性文件，则不会再次导入。

ps: 这个在没有配置中心的情况下，用于区分不同环境的配置还是很方便的。

## 导入其他数据

应用程序属性可以使用spring.config.import属性从其他位置导入更多配置数据。 

导入时将对其进行处理，并将其视为在声明该导入的文件正下方插入的其他文档。

例如，您的类路径application.properties文件中可能包含以下内容：

```
spring.application.name=myapp
spring.config.import=optional:file:./dev.properties
```

这将触发在当前目录中导入dev.properties文件（如果存在）。 

来自导入的dev.properties的值将优先于触发导入的文件。 

在上面的示例中，dev.properties可以将spring.application.name重新定义为其他值。 

不论声明多少次，导入都只会导入一次。

在 properties/yaml 文件中的**单个文档中定义导入的顺序无关紧要。**

例如，以下两个示例产生相同的结果：

```
spring.config.import=my.properties
my.property=value
```

与

```
my.property=value
spring.config.import=my.properties
```

在以上两个示例中，my.properties文件中的值将优先于触发其导入的文件。

可以在单个spring.config.import键下指定多个位置。 

位置将按照定义的顺序进行处理，以后的导入将优先。

Spring Boot包含可插入的API，该API允许支持各种不同的位置地址。 默认情况下，您可以导入Java属性，YAML和“配置树”。

第三方jar可以提供对其他技术的支持（不需要文件位于本地）。 例如，您可以想象配置数据来自外部存储，例如Consul，Apache ZooKeeper或Netflix Archaius。

如果要支持自己的位置，请参阅org.springframework.boot.context.config包中的ConfigDataLocationResolver和ConfigDataLoader类。

## 导入无扩展名文件

某些云平台无法将文件扩展名添加到已装入卷的文件中。

要导入这些无扩展名的文件，您需要给Spring Boot一个提示，以便它知道如何加载它们。 

您可以通过在方括号中添加扩展提示来做到这一点。

例如，假设您有一个希望导入为yaml的 `/etc/config/myconfig` 文件。 

您可以使用以下命令从application.properties导入它：

```
spring.config.import=file:/etc/config/myconfig[.yaml]
```

## 使用配置树

在云平台上运行应用程序（例如Kubernetes）时，您通常需要读取平台提供的配置值。为此目的使用环境变量并不罕见，但是这样做可能会有弊端，尤其是在该值应该保密的情况下。

作为环境变量的替代方法，许多云平台现在允许您将配置映射到装入的数据卷中。

例如，Kubernetes可以批量安装ConfigMap和Secrets。

可以使用两种常见的卷安装模式：

1. 单个文件包含完整的属性集（通常写为YAML）。

2. 多个文件被写入目录树，文件名成为“键”，内容成为“值”。

对于第一种情况，您可以如上所述使用spring.config.import直接导入YAML或Properties文件。对于第二种情况，您需要使用configtree：前缀，以便Spring Boot知道它需要将所有文件公开为属性。

例如，假设Kubernetes已安装以下卷：

```
etc/
  config/
    myapp/
      username
      password
```

用户名文件的内容将是一个配置值，而密码的内容将是一个秘密。

要导入这些属性，可以将以下内容添加到application.properties或application.yaml文件中：

```
spring.config.import=optional:configtree:/etc/config/
```

然后，您可以按照通常的方式从环境访问或注入myapp.username和myapp.password属性。

可以将配置树值绑定到字符串String和 byte[] 类型，具体取决于所需的内容。

如果要从同一父文件夹导入多个配置树，则可以使用通配符快捷方式。 

任何以 `/*/` 结尾的configtree：位置都将所有直接子级导入为配置树。

例如，给定以下卷：

```
etc/
  config/
    dbconfig/
      db/
        username
        password
    mqconfig/
      mq/
        username
        password
```

您可以使用 `configtree:/etc/config/*/` 作为导入位置：

```
spring.config.import=optional:configtree:/etc/config/*/
```

这将添加db.username，db.password，mq.username和mq.password属性。

使用通配符加载的目录按字母顺序排序。 

如果需要其他订单，则应将每个位置列为单独的导入。

## 配置占位符

使用application.properties和application.yml中的值时，它们会通过现有的环境进行过滤，因此您可以参考以前定义的值（例如，从“系统”属性中）。 

标准的 `${name}` 属性-占位符语法可以在值中的任何位置使用。

例如，以下文件会将app.description设置为“MyApp is a Spring Boot application”：

```
app.name=MyApp
app.description=${app.name} is a Spring Boot application
```

您还可以使用此技术来创建现有Spring Boot属性的“简短”变体。 有关详细信息，请参见使用“简短”命令行参数方法。

## 处理多文档文件

Spring Boot允许您将单个物理文件拆分为多个逻辑文档，每个逻辑文档都独立添加。 

从上到下按顺序处理文档。 

以后的文档可以覆盖以前的文档中定义的属性。

对于application.yml文件，使用标准的YAML多文档语法。 

三个连续的连字符代表一个文档的末尾，以及下一个文档的开始。

例如，以下文件具有两个逻辑文档：

```
spring.application.name: MyApp
---
spring.config.activate.on-cloud-platform: kubernetes
spring.application.name: MyCloudApp
```

对于application.properties文件，特殊的 `#---` 注释用于标记文档拆分：

```
spring.application.name=MyApp
#---
spring.config.activate.on-cloud-platform=kubernetes
spring.application.name=MyCloudApp
```

属性文件分隔符不得包含任何前导空格，并且必须恰好具有三个连字符。 

分隔符之前和之后的行不得为注释。

多文档属性文件通常与激活属性（例如spring.config.activate.on-profile）结合使用。

## 激活属性

有时只有在满足特定条件时才激活给定的属性。 例如，您可能具有仅在特定配置文件处于活动状态时才相关的属性。

您可以使用 `spring.config.activate.*` 有条件地激活属性文档。

可以使用以下激活属性：

| 属性 | 描述 |
|:---|:---|
| on-profile | 必须匹配才能使文档处于活动状态的配置文件表达式。 |
| on-cloud-platform | 为使文档处于活动状态必须检测到的CloudPlatform。|

例如，以下内容指定仅当在Kubernetes上运行时并且仅当“prod”或“ staging”配置文件处于活动状态时，第二个文档才处于活动状态：

```
myprop=always-set
#---
spring.config.activate.on-cloud-platform=kubernetes
spring.config.activate.on-profile=prod | staging
myotherprop=sometimes-set
```

# 加密属性

Spring Boot不提供对加密属性值的任何内置支持，但是，它确实提供了修改Spring环境中包含的值所必需的挂钩点。 

EnvironmentPostProcessor界面允许您在应用程序启动之前操纵环境。 

有关详细信息，请参见在启动前自定义环境或ApplicationContext。

如果您正在寻找一种安全的方式来存储凭据和密码，则Spring Cloud Vault项目提供了将外部配置存储在HashiCorp Vault中的支持。

# 使用YAML

YAML是JSON的超集，因此是一种用于指定层次结构配置数据的便捷格式。 

只要在类路径上具有SnakeYAML库，SpringApplication类就会自动支持YAML作为属性的替代方法。

## 将YAML映射到属性

YAML文档需要从其层次结构格式转换为可以与Spring Environment一起使用的平面结构。 

例如，考虑以下YAML文档：

```yml
environments:
  dev:
    url: https://dev.example.com
    name: Developer Setup
  prod:
    url: https://another.example.com
    name: My Cool App
```

等价于

```
environments.dev.url=https://dev.example.com
environments.dev.name=Developer Setup
environments.prod.url=https://another.example.com
environments.prod.name=My Cool App
```

同样，YAML列表也需要进行展平。 它们用 [index] 解引用器表示为属性键。 

例如，考虑以下YAML：

```yml
my:
 servers:
 - dev.example.com
 - another.example.com
```

等价于

```
my.servers[0]=dev.example.com
my.servers[1]=another.example.com
```

可以使用Spring Boot的Binder类将使用[index]表示法的属性绑定到Java List或Set对象。 

## 直接加载YAML

Spring Framework提供了两个方便的类，可用于加载YAML文档。 

YamlPropertiesFactoryBean将YAML作为属性加载，而YamlMapFactoryBean将YAML作为地图加载。

如果要将YAML作为Spring PropertySource加载，也可以使用YamlPropertySourceLoader类。

## YAML的缺点

无法使用@PropertySource批注加载YAML文件。 

因此，在需要以这种方式加载值的情况下，需要使用属性文件。

在特定于配置文件的YAML文件中使用多文档YAML语法可能会导致意外行为。 

例如，考虑文件中的以下配置：

- application-dev.yml

```yml
server.port: 8000
---
spring.config.activate.on-profile: "!test"
mypassword: "secret"
```

如果使用参数 `--spring.profiles.active = dev` 运行该应用程序，则可能希望将mypassword设置为“secret”，但事实并非如此。

嵌套文档将被过滤，因为主文件名为application-dev.yml。 它已经被认为是特定于配置文件的，并且嵌套文档将被忽略。

我们建议您不要混用特定于配置文件的YAML文件和多个YAML文档。 坚持只使用其中之一。

# 配置随机值

RandomValuePropertySource可用于注入随机值（例如，输入到机密或测试用例中）。 

它可以产生整数，longs，uuid或字符串，如以下示例所示：

```
my.secret=${random.value}
my.number=${random.int}
my.bignumber=${random.long}
my.uuid=${random.uuid}
my.number-less-than-ten=${random.int(10)}
my.number-in-range=${random.int[1024,65536]}
```

`random.int*` 语法为OPEN值（，max）CLOSE，其中OPEN，CLOSE是任何字符，而value，max是整数。 

如果提供了max，则value是最小值，而max是最大值（不包括）。

# 类型安全的配置属性

使用 `@Value("${property}")` 批注来注入配置属性有时会很麻烦，尤其是当您使用多个属性或数据本质上是分层的时。 

Spring Boot提供了一种使用属性的替代方法，该方法使强类型的Bean可以管理和验证应用程序的配置。

## JavaBean properties binding

可以绑定一个声明标准JavaBean属性的bean，如以下示例所示：

```java

import java.net.InetAddress;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("acme")
public class AcmeProperties {

    private boolean enabled;

    private InetAddress remoteAddress;

    private final Security security = new Security();

    public boolean isEnabled() { ... }

    public void setEnabled(boolean enabled) { ... }

    public InetAddress getRemoteAddress() { ... }

    public void setRemoteAddress(InetAddress remoteAddress) { ... }

    public Security getSecurity() { ... }

    public static class Security {

        private String username;

        private String password;

        private List<String> roles = new ArrayList<>(Collections.singleton("USER"));

        public String getUsername() { ... }

        public void setUsername(String username) { ... }

        public String getPassword() { ... }

        public void setPassword(String password) { ... }

        public List<String> getRoles() { ... }

        public void setRoles(List<String> roles) { ... }

    }
}
```

前面的POJO定义了以下属性：

acme.enabled，默认值为false。

acme.remote-address，其类型可以从String强制转换。

acme.security.username，带有嵌套的“ security”对象，其名称由属性名称确定。 特别是，返回类型根本不使用，可能是SecurityProperties。

acme.security.password。

acme.security.roles，带有默认为USER的String集合。

映射到Spring Boot中可用的 `@ConfigurationProperties` 类的属性（通过属性文件，YAML文件，环境变量等进行配置）是公共API，但是该类本身的访问器（获取器/设置器）不能直接使用。 。

这种安排依赖于默认的空构造函数，并且getter和setter通常是强制性的，因为绑定是通过标准Java Beans属性描述符进行的，就像在Spring MVC中一样。在以下情况下，可以忽略二传手：

只要将地图初始化，它们就需要使用吸气剂，但不一定需要使用setter，因为它们可以被活页夹改变。

可以通过索引（通常使用YAML）或使用单个逗号分隔的值（属性）来访问集合和数组。在后一种情况下，必须使用二传手。我们建议始终为此类类型添加设置器。如果初始化集合，请确保它不是不可变的（如上例所示）。

如果初始化了嵌套的POJO属性（如前面示例中的Security字段），则不需要setter。如果希望活页夹通过使用其默认构造函数动态创建实例，则需要一个setter。

有些人使用Lombok项目自动添加获取器和设置器。确保Lombok不会为这种类型生成任何特定的构造函数，因为容器会自动使用它来实例化该对象。

最后，仅考虑标准Java Bean属性，不支持对静态属性的绑定。

## 构造函数绑定

上一节中的示例可以以不变的方式重写，如下例所示：

```java
import java.net.InetAddress;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConstructorBinding
@ConfigurationProperties("acme")
public class AcmeProperties {

    private final boolean enabled;

    private final InetAddress remoteAddress;

    private final Security security;

    public AcmeProperties(boolean enabled, InetAddress remoteAddress, Security security) {
        this.enabled = enabled;
        this.remoteAddress = remoteAddress;
        this.security = security;
    }

    public boolean isEnabled() { ... }

    public InetAddress getRemoteAddress() { ... }

    public Security getSecurity() { ... }

    public static class Security {

        private final String username;

        private final String password;

        private final List<String> roles;

        public Security(String username, String password,
                @DefaultValue("USER") List<String> roles) {
            this.username = username;
            this.password = password;
            this.roles = roles;
        }

        public String getUsername() { ... }

        public String getPassword() { ... }

        public List<String> getRoles() { ... }

    }

}
```

在此设置中，`@ConstructorBinding` 批注用于指示应使用构造函数绑定。 这意味着绑定器将期望找到带有您希望绑定的参数的构造函数。

@ConstructorBinding 类的嵌套成员（例如上例中的Security）也将通过其构造函数进行绑定。

可以使用@DefaultValue指定默认值，并且将应用相同的转换服务将String值强制为缺少属性的目标类型。 

默认情况下，如果没有属性绑定到“安全性”，则AcmeProperties实例将包含一个用于安全性的空值。 

如果希望即使没有绑定任何安全性都返回Security的非空实例，则可以使用空的@DefaultValue注释来这样做：

```java
import java.net.InetAddress;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConstructorBinding
@ConfigurationProperties("acme")
public class AcmeProperties {

    private final boolean enabled;

    private final InetAddress remoteAddress;

    private final Security security;

    public AcmeProperties(boolean enabled, InetAddress remoteAddress, @DefaultValue Security security) {
        this.enabled = enabled;
        this.remoteAddress = remoteAddress;
        this.security = security;
    }
}
```

要使用构造函数绑定，必须使用@EnableConfigurationProperties或配置属性扫描来启用该类。 

您不能对通过常规Spring机制创建的bean使用构造函数绑定（例如@Component bean，通过@Bean方法创建的bean或使用@Import加载的bean）

如果您的类具有多个构造函数，则还可以直接在应绑定的构造函数上使用@ConstructorBinding。

不建议将java.util.Optional与@ConfigurationProperties一起使用，因为它主要旨在用作返回类型。因此，它不太适合配置属性注入。 为了与其他类型的属性保持一致，如果确实声明了Optional属性并且没有任何值，则将绑定null而不是空的Optional。

## 启用@ConfigurationProperties注释的类型

Spring Boot提供了绑定@ConfigurationProperties类型并将其注册为Bean的基础架构。 

您可以逐类启用配置属性，也可以启用与组件扫描类似的方式进行配置属性扫描。

有时，用@ConfigurationProperties注释的类可能不适用于扫描，例如，如果您正在开发自己的自动配置，或者想要有条件地启用它们。 

在这些情况下，请使用@EnableConfigurationProperties批注指定要处理的类型列表。 

可以在任何@Configuration类上完成此操作，如以下示例所示：

```java
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(AcmeProperties.class)
public class MyConfiguration {
}
```

要使用配置属性扫描，请将@ConfigurationPropertiesScan批注添加到您的应用程序。 

通常，它被添加到以@SpringBootApplication注释的主应用程序类中，但可以将其添加到任何@Configuration类中。 

默认情况下，将从声明注释的类的包中进行扫描。 

如果要定义要扫描的特定程序包，可以按照以下示例所示进行操作：

```java
@SpringBootApplication
@ConfigurationPropertiesScan({ "com.example.app", "org.acme.another" })
public class MyApplication {
}
```

使用配置属性扫描或通过@EnableConfigurationProperties注册@ConfigurationProperties Bean时，该Bean具有常规名称：`<prefix>-<fqn>`，其中`<prefix>`是@ConfigurationProperties批注和`<fqn>`中指定的环境键前缀。 

是Bean的完全限定名称。 如果注释不提供任何前缀，则仅使用Bean的完全限定名称。

上例中的bean名称是acme-com.example.AcmeProperties。

我们建议@ConfigurationProperties仅处理环境，尤其不要从上下文中注入其他bean。 

对于极端情况，可以使用setter注入，也可以使用框架提供的任何 `*Aware` 接口（例如，需要访问Environment的EnvironmentAware）。 

如果仍然想使用构造函数注入其他bean，则必须使用@Component注释配置属性bean，并使用基于JavaBean的属性绑定。

## 使用@ConfigurationProperties注释的类型

这种配置样式与SpringApplication外部YAML配置特别有效，如以下示例所示：

```yml
acme:
    remote-address: 192.168.1.1
    security:
        username: admin
        roles:
          - USER
          - ADMIN
```

要使用@ConfigurationProperties Bean，可以像使用其他任何Bean一样注入它们，如以下示例所示：

```java
@Service
public class MyService {

    private final AcmeProperties properties;

    @Autowired
    public MyService(AcmeProperties properties) {
        this.properties = properties;
    }

    //...

    @PostConstruct
    public void openConnection() {
        Server server = new Server(this.properties.getRemoteAddress());
        // ...
    }

}
```

## 第三方配置

除了使用@ConfigurationProperties注释类外，还可以在公共@Bean方法上使用它。 

当您要将属性绑定到控件之外的第三方组件时，这样做特别有用。

要从Environment属性配置Bean，请将@ConfigurationProperties添加到其Bean注册中，如以下示例所示：

```java
@ConfigurationProperties(prefix = "another")
@Bean
public AnotherComponent anotherComponent() {
    ...
}
```

用另一个前缀定义的任何JavaBean属性都以类似于前面的AcmeProperties示例的方式映射到该AnotherComponent bean。

## 宽松绑定

Spring Boot使用一些宽松的规则将Environment属性绑定到@ConfigurationProperties bean，因此环境属性名称和bean属性名称之间不需要完全匹配。

有用的常见示例包括破折号分隔的环境属性（例如，上下文路径绑定到contextPath）和大写的环境属性（例如PORT绑定到端口）。

例如，考虑以下@ConfigurationProperties类：


```java
@ConfigurationProperties(prefix="acme.my-project.person")
public class OwnerProperties {

    private String firstName;

    public String getFirstName() {
        return this.firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

}
```

下面的属性都可以被使用：

```
acme.my-project.person.first-name

acme.myProject.person.firstName

acme.my_project.person.first_name

ACME_MYPROJECT_PERSON_FIRSTNAME
```

## 绑定 Maps

绑定到Map属性时，如果键包含小写字母数字字符或-以外的任何其他字符，则需要使用方括号表示法，以便保留原始值。 

如果键没有被 `[]` 包围，则所有非字母数字或-的字符都将被删除。 

例如，考虑将以下属性绑定到Map：

```
acme.map.[/key1]=value1
acme.map.[/key2]=value2
acme.map./key3=value3
```

则绑定到 map 中对应的 key 为 `/key1`、`/key2` 和 `key3`（/被删除了，因为没有被 [] 包围）。

## 从环境变量绑定

大多数操作系统对可用于环境变量的名称施加严格的规则。

例如，Linux shell变量只能包含字母（a到z或A到Z），数字（0到9）或下划线字符（_）。按照约定，Unix shell变量也将以大写字母命名。

Spring Boot的宽松绑定规则尽可能地与这些命名限制兼容。

要将规范形式的属性名称转换为环境变量名称，可以遵循以下规则：

1. 用下划线（`_`）替换点（`.`）。

2. 删除所有破折号（`-`）。

3. 转换为大写。

例如，配置属性spring.main.log-startup-info将是一个名为SPRING_MAIN_LOGSTARTUPINFO的环境变量。

绑定到对象列表时也可以使用环境变量。要绑定到列表，元素编号应在变量名称中用下划线括起来。

例如，配置属性my.acme[0].other将使用名为MY_ACME_0_OTHER的环境变量。

## 合并复杂类型

如果在多个位置配置了列表，则通过替换整个列表来进行覆盖。

例如，假设MyPojo对象的名称和描述属性默认为空。 

下面的示例从AcmeProperties公开MyPojo对象的列表：

```java
@ConfigurationProperties("acme")
public class AcmeProperties {

    private final List<MyPojo> list = new ArrayList<>();

    public List<MyPojo> getList() {
        return this.list;
    }

}
```

考虑如下配置：

```
acme.list[0].name=my name
acme.list[0].description=my description
#---
spring.config.activate.on-profile=dev
acme.list[0].name=my another name
```

如果开发人员配置文件未处于活动状态，则AcmeProperties.list包含一个MyPojo条目，如先前所定义。 

但是，如果启用了开发配置文件，则列表仍仅包含一个条目（名称为我的另一个名称，并且描述为null）。 

此配置不会将第二个MyPojo实例添加到列表中，并且不会合并项目。

在多个配置文件中指定列表时，将使用优先级最高的列表（并且仅使用那个列表）。 

考虑以下示例：

```
acme.list[0].name=my name
acme.list[0].description=my description
acme.list[1].name=another name
acme.list[1].description=another description
#---
spring.config.activate.on-profile=dev
acme.list[0].name=my another name
```

在前面的示例中，如果dev概要文件处于活动状态，则AcmeProperties.list包含一个MyPojo条目（其名称为my的另一个名称，以及对null的描述）。 

对于YAML，可以使用逗号分隔的列表和YAML列表来完全覆盖列表的内容。

对于地图属性，可以绑定从多个来源绘制的属性值。

 但是，对于多个源中的同一属性，将使用优先级最高的属性。 

下面的示例从AcmeProperties公开 `Map<String，MyPojo>`：

```java
@ConfigurationProperties("acme")
public class AcmeProperties {

    private final Map<String, MyPojo> map = new HashMap<>();

    public Map<String, MyPojo> getMap() {
        return this.map;
    }

}
```

考虑如下配置：

```
acme.map.key1.name=my name 1
acme.map.key1.description=my description 1
#---
spring.config.activate.on-profile=dev
acme.map.key1.name=dev name 1
acme.map.key2.name=dev name 2
acme.map.key2.description=dev description 2
```

如果开发人员配置文件处于非活动状态，则AcmeProperties.map包含一个键为key1的条目（名称为我的名字1，描述为我的描述1）。

但是，如果启用了开发配置文件，则map包含两个条目，其中键为key1（名称为dev name 1，描述我的描述为1）和key2（名称为dev name 2，描述dev的描述为2） 。

## 属性转换

当Spring Boot绑定到@ConfigurationProperties bean时，它尝试将外部应用程序属性强制为正确的类型。 

如果需要自定义类型转换，则可以提供一个ConversionService bean（具有一个名为conversionService的bean）或自定义属性编辑器（通过CustomEditorConfigurer bean）或自定义Converters（具有定义为@ConfigurationPropertiesBinding的bean定义）。

由于在应用程序生命周期中非常早就请求了此bean，因此请确保限制您的ConversionService使用的依赖项。 

通常，您需要的任何依赖项可能在创建时未完全初始化。 

如果配置键强制不需要自定义的转换服务，而仅依赖于@ConfigurationPropertiesBinding限定的自定义转换器，则可能要重命名自定义的转换服务。

### 转换时间

Spring Boot为表达持续时间提供了专门的支持。 

如果公开java.time.Duration属性，则应用程序属性中的以下格式可用：

常规的长表示形式（使用毫秒作为默认单位，除非已指定@DurationUnit）

java.time.Duration使用的标准ISO-8601格式

值和单位相结合的更易读的格式（例如10s表示10秒）

考虑以下示例：

```java
@ConfigurationProperties("app.system")
public class AppSystemProperties {

    @DurationUnit(ChronoUnit.SECONDS)
    private Duration sessionTimeout = Duration.ofSeconds(30);

    private Duration readTimeout = Duration.ofMillis(1000);

    public Duration getSessionTimeout() {
        return this.sessionTimeout;
    }

    public void setSessionTimeout(Duration sessionTimeout) {
        this.sessionTimeout = sessionTimeout;
    }

    public Duration getReadTimeout() {
        return this.readTimeout;
    }

    public void setReadTimeout(Duration readTimeout) {
        this.readTimeout = readTimeout;
    }

}
```

要指定30秒的会话超时，则30，PT30S和30s都是等效的。 可以使用以下任意形式指定500ms的读取超时：500，PT0.5S和500ms。

您也可以使用任何受支持的单位。 

这些是：

ns for nanoseconds

us for microseconds

ms for milliseconds

s for seconds

m for minutes

h for hours

d for days

默认单位是毫秒，可以使用@DurationUnit覆盖，如上面的示例所示。

如果您更喜欢使用构造函数绑定，则可以公开相同的属性，如以下示例所示：

```java
@ConfigurationProperties("app.system")
@ConstructorBinding
public class AppSystemProperties {

    private final Duration sessionTimeout;

    private final Duration readTimeout;

    public AppSystemProperties(@DurationUnit(ChronoUnit.SECONDS) @DefaultValue("30s") Duration sessionTimeout,
            @DefaultValue("1000ms") Duration readTimeout) {
        this.sessionTimeout = sessionTimeout;
        this.readTimeout = readTimeout;
    }

    public Duration getSessionTimeout() {
        return this.sessionTimeout;
    }

    public Duration getReadTimeout() {
        return this.readTimeout;
    }

}
```

### 转换 Period

除了持续时间，Spring Boot还可以使用java.time.Period类型。 

可以在应用程序属性中使用以下格式：

常规的int表示形式（使用天作为默认单位，除非已指定@PeriodUnit）

java.time.Period使用的标准ISO-8601格式

值和单位对耦合的更简单格式（例如1y3d表示1年3天）

简单格式支持以下单位：

y for years

m for months

w for weeks

d for days

### 转换数据大小

Spring Framework具有DataSize值类型，以字节为单位表示大小。 

如果公开DataSize属性，则应用程序属性中的以下格式可用：

常规的长表示形式（除非已指定@DataSizeUnit，否则使用字节作为默认单位）

值和单位耦合在一起的更易读的格式（例如10MB表示10兆字节）

考虑以下示例：

```java
@ConfigurationProperties("app.io")
public class AppIoProperties {

    @DataSizeUnit(DataUnit.MEGABYTES)
    private DataSize bufferSize = DataSize.ofMegabytes(2);

    private DataSize sizeThreshold = DataSize.ofBytes(512);

    public DataSize getBufferSize() {
        return this.bufferSize;
    }

    public void setBufferSize(DataSize bufferSize) {
        this.bufferSize = bufferSize;
    }

    public DataSize getSizeThreshold() {
        return this.sizeThreshold;
    }

    public void setSizeThreshold(DataSize sizeThreshold) {
        this.sizeThreshold = sizeThreshold;
    }

}
```

若要指定10 MB的缓冲区大小，则10和10MB是等效的。 

256个字节的大小阈值可以指定为256或256B。

您也可以使用任何受支持的单位。 

这些是：

B for bytes

KB for kilobytes

MB for megabytes

GB for gigabytes

TB for terabytes

默认单位是字节，可以使用@DataSizeUnit覆盖，如上面的示例所示。

如果您更喜欢使用构造函数绑定，则可以公开相同的属性，如以下示例所示：

```java
@ConfigurationProperties("app.io")
@ConstructorBinding
public class AppIoProperties {

    private final DataSize bufferSize;

    private final DataSize sizeThreshold;

    public AppIoProperties(@DataSizeUnit(DataUnit.MEGABYTES) @DefaultValue("2MB") DataSize bufferSize,
            @DefaultValue("512B") DataSize sizeThreshold) {
        this.bufferSize = bufferSize;
        this.sizeThreshold = sizeThreshold;
    }

    public DataSize getBufferSize() {
        return this.bufferSize;
    }

    public DataSize getSizeThreshold() {
        return this.sizeThreshold;
    }

}
```

## @ConfigurationProperties验证

每当使用Spring的@Validated注释对@ConfigurationProperties类进行注释时，Spring Boot就会尝试对其进行验证。 

您可以直接在配置类上使用JSR-303 javax.validation约束注释。 

为此，请确保在类路径上有兼容的JSR-303实现，然后将约束注释添加到字段中，如以下示例所示：

```java
@ConfigurationProperties(prefix="acme")
@Validated
public class AcmeProperties {

    @NotNull
    private InetAddress remoteAddress;

    // ... getters and setters

}
```

为了确保始终为嵌套属性触发验证，即使未找到任何属性，也必须使用@Valid注释关联的字段。 以下示例基于前面的AcmeProperties示例：

```java
@ConfigurationProperties(prefix="acme")
@Validated
public class AcmeProperties {

    @NotNull
    private InetAddress remoteAddress;

    @Valid
    private final Security security = new Security();

    // ... getters and setters

    public static class Security {

        @NotEmpty
        public String username;

        // ... getters and setters

    }

}
```

您还可以通过创建一个名为configurationPropertiesValidator的bean定义来添加自定义Spring Validator。 

@Bean方法应声明为静态。 

配置属性验证器是在应用程序生命周期的早期创建的，并且将@Bean方法声明为static可以使创建该Bean而不必实例化@Configuration类。 

这样做避免了由早期实例化引起的任何问题。

## @ConfigurationProperties与@Value

@Value 批注是核心容器功能，它没有提供与类型安全的配置属性相同的功能。 

如果确实要使用@Value，我们建议您使用规范形式引用属性名称（kebab-case仅使用小写字母）。 

这将允许Spring Boot使用与轻松绑定@ConfigurationProperties时相同的逻辑。 

例如，`@Value("{demo.item-price}")` 将从application.properties文件中选取demo.item-price和demo.itemPrice表格，并从系统环境中选取DEMO_ITEMPRICE。

如果改用 `@Value("{demo.itemPrice}")`，则将不考虑demo.item-price和DEMO_ITEMPRICE。

如果您为自己的组件定义了一组配置键，我们建议您将它们组合在以@ConfigurationProperties注释的POJO中。 

这样做将为您提供结构化的，类型安全的对象，您可以将其注入到自己的bean中。

尽管您可以在@Value中编写SpEL表达式，但不会从应用程序属性文件中处理此类表达式。

# 小结

希望本文对你有帮助，如果有其他想法的话，也可以评论区和大家分享哦。

各位极客的点赞收藏转发，是老马持续写作的最大动力！

我是老马，期待与你的下次重逢。

# 参考资料

https://docs.spring.io/spring-boot/docs/2.4.1/maven-plugin/reference/htmlsingle/#help

* any list
{:toc}
