---
layout: post
title: YAML-01-yaml 配置文件入门介绍
date:  2017-06-21 13:59:45 +0800
categories: [Config]
tags: [yaml, config]
published: true
---

# 拓展阅读

[config 配置方式概览-8 种配置文件介绍对比 xml/json/proeprties/ini/yaml/TOML/hcl/hocon](https://houbb.github.io/2017/06/21/config-00-overivew)

[config HCL（HashiCorp Configuration Language） 配置文件介绍](https://houbb.github.io/2017/06/21/config-hcl-01-intro)

[config HCL（HashiCorp Configuration Language） 官方文档翻译](https://houbb.github.io/2017/06/21/config-hcl-02-doc)

[config HOCON（Human-Optimized Config Object Notation）配置文件介绍](https://houbb.github.io/2017/06/21/config-hocon-01-intro)

[config ini 配置文件介绍](https://houbb.github.io/2017/06/21/config-ini-01-intro)

[config properties 配置文件介绍](https://houbb.github.io/2017/06/21/config-properties-01-intro)

[toml-01-toml 配置文件介绍](https://houbb.github.io/2017/06/21/config-toml-01-overview)

[XStream java 实现 xml 与对象 pojo 之间的转换](https://houbb.github.io/2017/06/21/config-xml-XStream-intro)

[java 实现 xml 与对象 pojo 之间的转换的几种方式 dom4j/xstream/jackson](https://houbb.github.io/2017/06/21/config-xml-to-pojo)

[YAML-01-yml 配置文件介绍](https://houbb.github.io/2017/06/21/config-yaml-01-intro)

[YAML-02-yml 配置文件 java 整合使用 yamlbeans + snakeyaml + jackson-dataformat-yaml](https://houbb.github.io/2017/06/21/config-yaml-02-java-integration)

[YAML-03-yml 配置文件介绍官方文档翻译](https://houbb.github.io/2017/06/21/config-yaml-03-doc)

[json 专题系列](https://houbb.github.io/2018/07/20/json-00-overview)

# 拓展阅读

[toml-01-toml 配置文件介绍](https://houbb.github.io/2016/10/26/config-toml-01-overview)

[YAML-01-yml 配置文件介绍](https://houbb.github.io/2016/10/26/config-yam-01-intro)

[YAML-02-yml 配置文件 java 整合使用 yamlbeans + snakeyaml + jackson-dataformat-yaml](https://houbb.github.io/2016/10/26/config-yaml-02-java-integration)

# yaml 配置是什么？

YAML（YAML Ain't Markup Language）是一种用于配置文件的数据序列化格式，它被设计为易于人类阅读和编写，同时也易于机器解析。

YAML的语法简洁、直观，支持复杂的数据结构，使其成为配置文件和数据交换格式的理想选择。

### YAML配置文件的特点：

1. **易于阅读和编写**：YAML使用空格缩进来表示层次结构，语法简单，易于理解。

2. **支持数据结构**：YAML支持多种数据结构，包括标量（字符串、整数、浮点数、布尔值）、列表（数组）、字典（映射）等。

3. **扩展性**：YAML允许添加自定义标签，以支持特定的数据类型或结构。

4. **多文档支持**：一个YAML文件可以包含多个文档，每个文档可以有独立的顶级节点。

5. **注释**：YAML支持以`#`开始的单行注释。

6. **无歧义映射**：YAML的键值对结构允许无歧义地映射到编程语言中的字典或对象。

7. **文件扩展名**：YAML文件通常以`.yaml`或`.yml`为扩展名。

### YAML配置文件的语法元素：

- **标量**：基本的数据类型，如字符串、整数、浮点数、布尔值。
- **列表**：有序的数据集合，使用短横线`-`加上空格开始每个列表项。
- **字典**：键值对的集合，使用缩进来表示嵌套的字典结构。
- **注释**：以`#`开始的单行注释，可以出现在文件的任何位置。

### YAML配置文件示例：

```yaml
# 这是 YAML 配置文件的示例

# 标量
name: John Doe
age: 30
isEmployee: true

# 列表
fruits:
  - apple
  - banana
  - cherry

# 嵌套字典
address:
  street: 123 Main St
  city: Anytown
  country: USA

# 多文档分隔符
---
# 第二个文档
secondDocument:
  title: "Second Document"
  content: "This is the content of the second document."
```

### 使用场景：

YAML通常用于配置应用程序和系统，特别是在以下场景中：

- **应用程序配置**：用于定义应用程序的配置选项。
- **部署配置**：在容器化技术（如Docker和Kubernetes）中，YAML常用于定义服务部署的配置。
- **数据交换**：由于其可读性，YAML也用于不同系统或应用程序之间的数据交换格式。

### 工具和库支持：

YAML被多种编程语言的库支持，包括但不限于：

- **Python**：`PyYAML`
- **Ruby**：`psych`
- **JavaScript**：`js-yaml`
- **Java**：`Jackson`（通过`yaml`模块）、`snakeyaml`
- **Go**：`go-yaml`

这些库提供了解析和操作YAML配置文件的功能，使得在不同编程环境中使用YAML变得容易。

总的来说，YAML是一种非常流行的配置文件格式，它以易读性和易用性著称，特别适合需要人类参与编辑的配置文件。它的结构化特性也使其成为复杂配置数据的理想选择。

# yaml 的优缺点

YAML（YAML Ain't Markup Language）的设计初衷是创造一种更人性化、易于阅读和编写的数据序列化格式。

以下是YAML设计的动机以及它的一些优缺点：

### 设计动机：

1. **易读性**：YAML的设计考虑到了人类的阅读习惯，使用缩进和简洁的语法，使得配置文件易于阅读和理解。

2. **简洁性**：YAML避免了复杂的标记语言结构，如XML的尖括号，使得配置文件更加简洁。

3. **支持结构化数据**：YAML支持列表、字典、标量等数据结构，可以清晰地表达层次化和关系化的数据。

4. **跨语言**：YAML旨在成为跨语言的数据交换格式，因此它被设计得语言无关，易于各种编程语言解析和生成。

5. **配置友好**：YAML特别适合用于配置文件，因为它允许注释，并且可以很好地表示配置选项和它们的文档。

6. **扩展性**：YAML允许通过标签来扩展数据类型，这使得YAML可以适应特定的应用场景。

### 优点：

1. **可读性强**：YAML的缩进和简洁语法使得配置文件非常易于人类阅读。

2. **易于编写**：YAML的语法直观，易于学习和编写。

3. **结构化**：YAML支持复杂的数据结构，适合表示配置选项的层次关系。

4. **支持注释**：YAML允许在配置文件中添加注释，有助于文档化配置项。

5. **跨平台和语言**：YAML文件可以在多种操作系统和编程语言中使用。

6. **广泛的库支持**：多种编程语言提供了解析和生成YAML的库。

### 缺点：

1. **解析复杂性**：相比于一些更简单的格式，如INI或JSON，YAML的解析可能更复杂，因为它需要处理缩进和不同的数据类型。

2. **缩进敏感**：YAML严格依赖缩进来定义层次结构，这可能导致一些细微的错误，如不一致的缩进。

3. **性能问题**：对于非常大的文件，YAML的解析可能比其他格式慢，因为它需要更多的计算来处理缩进和结构。

4. **安全性问题**：YAML的扩展性可能导致安全问题，如执行不安全的代码，如果不正确地解析。

5. **版本兼容性**：YAML的不同版本（如1.1和1.2）在某些特性上存在差异，可能导致兼容性问题。

6. **错误信息**：相比于JSON等格式，YAML的错误信息可能不够明确，使得调试配置文件更加困难。

# 如何使用？

YAML（YAML Ain't Markup Language）由于其简洁和易于阅读的特性，被广泛用于各种配置文件中。以下是一些常见的YAML配置使用例子：

### 1. 应用程序配置

```yaml
# application.yml: 应用程序配置文件

server:
  port: 8080
  address: 127.0.0.1

logging:
  level: INFO
  file: application.log

database:
  type: postgresql
  host: localhost
  port: 5432
  username: user
  password: pass
  dbname: appdb
```

### 2. Docker 容器配置

```yaml
# docker-compose.yml: Docker容器编排配置文件

version: '3'
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html
  db:
    image: postgres:latest
    environment:
      POSTGRES_DB: dbname
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
```

### 3. Kubernetes 部署配置

```yaml
# deployment.yml: Kubernetes部署配置文件

apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
      - name: webapp
        image: webapp:latest
        ports:
        - containerPort: 80
```

### 4. CI/CD 配置

```yaml
# .gitlab-ci.yml: GitLab CI/CD配置文件

stages:
  - build
  - test
  - deploy

build_job:
  stage: build
  script:
    - echo "Building the application"
    - make build

test_job:
  stage: test
  script:
    - echo "Running tests"
    - make test

deploy_job:
  stage: deploy
  script:
    - echo "Deploying the application"
    - make deploy
  only:
    - master
```

### 5. 版本控制配置

```yaml
# .gitmodules: Git子模块配置文件

[submodule "lib"]
  path = lib
  url = https://github.com/user/lib.git

[submodule "vendor"]
  path = vendor
  url = https://github.com/user/vendor.git
```

### 6. 项目文档配置

```yaml
# docs/config.yml: 项目文档配置文件

outputDir: ./build/docs
theme: default
title: My Project Documentation
plugins:
  - search
  - markdown
entries:
  - file: index.md
    title: Home
  - glob:
      pattern: src/**/*.md
      ignore: src/ignores/**/*.md
```

### 7. 环境变量配置

```yaml
# env.yml: 环境变量配置文件

development:
  database: dev_db
  username: dev_user
  password: dev_pass

test:
  database: test_db
  username: test_user
  password: test_pass

production:
  database: prod_db
  username: prod_user
  password: prod_pass
```

### 8. 配置多语言支持

```yaml
# i18n.yml: 国际化多语言配置文件

en:
  greeting: "Hello"
  farewell: "Goodbye"

fr:
  greeting: "Bonjour"
  farewell: "Au revoir"
```

### 9. 配置管理工具配置

```yaml
# config.yml: 配置管理工具配置文件

settings:
  theme: dark
  language: en

profiles:
  desktop:
    resolution: 1920x1080
  mobile:
    resolution: 480x800
```

# java 如何解析处理 yaml 文件？

以下是几种流行的Java库及其使用方法的简要介绍：

### SnakeYAML

SnakeYAML是一个流行的Java库，用于解析和生成YAML文件。它提供了灵活的API，允许你轻松地读取和写入YAML数据。

**添加依赖**（以Maven为例）:
```xml
<dependency>
    <groupId>org.yaml</groupId>
    <artifactId>snakeyaml</artifactId>
    <version>1.29</version> <!-- 请使用最新版本 -->
</dependency>
```

**读取YAML文件**:
```java
try (InputStream inputStream = new FileInputStream("example.yaml")) {
    Yaml yaml = new Yaml();
    Map<String, Object> data = yaml.load(inputStream);
    // 处理YAML数据
    System.out.println(data);
} catch (IOException e) {
    e.printStackTrace();
}
```

**写入YAML文件**:
```java
try (Writer writer = new FileWriter("output.yaml")) {
    Yaml yaml = new Yaml();
    Map<String, Object> data = createData(); // 假设这是你要写入的数据
    yaml.dump(data, writer);
} catch (IOException e) {
    e.printStackTrace();
}
```

### Jackson Dataformat YAML

Jackson Dataformat YAML是另一个流行的库，它为Jackson提供了额外的YAML支持。

如果你已经在使用Jackson来处理JSON，那么这个库可以无缝集成。

**添加依赖**（以Maven为例）:
```xml
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-yaml</artifactId>
    <version>2.13.0</version> <!-- 请使用最新版本 -->
</dependency>
```

**读取YAML文件**:
```java
ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
try {
    Map<String, Object> data = mapper.readValue(new File("example.yaml"), Map.class);
    // 处理YAML数据
    System.out.println(data);
} catch (IOException e) {
    e.printStackTrace();
}
```

**写入YAML文件**:
```java
try {
    Map<String, Object> data = createData(); // 假设这是你要写入的数据
    mapper.writeValue(new File("output.yaml"), data);
} catch (IOException e) {
    e.printStackTrace();
}
```

### YAMLBeans
YAMLBeans是一个简单易用的库，它允许你将Java对象和YAML格式之间进行转换。

**添加依赖**（以Maven为例）:
```xml
<dependency>
    <groupId>com.esotericsoftware</groupId>
    <artifactId>yamlbeans</artifactId>
    <version>2.1.0</version> <!-- 请使用最新版本 -->
</dependency>
```

**读取YAML文件**:
```java
try (YamlReader reader = new YamlReader(new FileReader("example.yaml"))) {
    Object data = reader.read();
    // 处理YAML数据
    System.out.println(data);
} catch (IOException e) {
    e.printStackTrace();
}
```

**写入YAML文件**:
```java
try (YamlWriter writer = new YamlWriter(new FileWriter("output.yaml"))) {
    Map<String, Object> data = createData(); // 假设这是你要写入的数据
    writer.write(data);
} catch (IOException e) {
    e.printStackTrace();
}
```



* any list
{:toc}