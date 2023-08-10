---
layout: post
title: database tool-04-Configuration
date:  2023-08-10 +0800
categories: [Database]
tags: [database, migrate, sh]
published: true
---

# 配置

Flyway 有许多不同的参数可以设置来配置其行为。 

这些参数可以通过多种不同的方式设置，具体取决于您使用 Flyway 的方式。


## Usage

### Command Line

如果使用命令行，则可以通过命令行参数（例如 ./flyway -url=jdbc:h2:mem:flyway info）、配置文件或环境变量（例如 FLYWAY_URL=jdbc:h2:mem:flyway ）。


### Api

如果使用 api，可以通过调用 Flyway.configure() 返回的配置对象上的方法来设置配置参数（例如 Flyway.configure().url("jdbc:h2:mem:flyway").load()）， 

配置文件或环境变量（如果在配置对象上调用 .envVars() 方法）。

### Maven

如果使用 maven，则可以在 maven 配置、配置文件或环境变量中的配置 xml 块上设置配置参数（例如 FLYWAY_URL=jdbc:h2:mem:flyway）。

### Gradle

如果使用 gradle，可以在插件配置块、配置文件或环境变量中设置配置参数（例如 FLYWAY_URL=jdbc:h2:mem:flyway）。


# 验证-Authentication

为了登录数据库，典型的方法是在 Flyway 配置文件中设置用户名和密码。 

然而，这有一些担忧：

- 这些属性以纯文本形式存储 - 任何人都可以看到您的凭据

- 您使用的每个配置文件中都必须提供您的凭据

- 您可能无权访问这些凭据，其他人需要安全地配置它们


Flyway 配备了额外的身份验证机制来解决这些问题。

## 环境变量

通过将您的用户名和密码分别存储在环境变量 FLYWAY_USER 和 FLYWAY_PASSWORD 中，它们可以配置一次并在多个 Flyway 配置中使用。 

它们也可以由具有相关访问权限的人设置，因此它们最终不会泄露给任何未经授权的各方。

# Configuration Files

## Loading

默认情况下，Flyway 将从以下位置加载配置文件：

- 安装目录 /conf/flyway.conf

- 用户主页 /flyway.conf

- 工作目录 /flyway.conf

此外，您可以使用 configFiles 配置参数让 Flyway 加载其他配置。

## Structure

结构如下：

```properties
# Settings are simple key-value pairs
flyway.key=value
# Single line comment start with a hash

# Long properties can be split over multiple lines by ending each line with a backslash
flyway.locations=filesystem:my/really/long/path/folder1,\
filesystem:my/really/long/path/folder2,\
filesystem:my/really/long/path/folder3

# These are some example settings
flyway.url=jdbc:mydb://mydatabaseurl
flyway.schemas=schema1,schema2
flyway.placeholders.keyABC=valueXYZ
```

### 环境变量替换

配置文件中的环境变量被替换：

```
flyway.placeholders.abc=${ABC}
```

如果未设置环境变量，则假定为空值。

# Environment Variables

Flyway命令行工具、Maven插件和Gradle插件支持通过环境变量加载配置。 

这也可以通过调用配置上的 envVars() 方法来使用 Flyway API。

# Parameters

此处不做展开：

> [Parameters](https://documentation.red-gate.com/fd/parameters-184127474.html)


# Placeholders Configuration

## SQL 迁移占位符

除了常规的 SQL 语法之外，Flyway 还支持使用可配置的前缀和后缀进行占位符替换。 

默认情况下，它会查找 Ant 风格的占位符，例如 ${myplaceholder}。 这对于抽象环境之间的差异非常有用。

更改占位符的值将导致在下次迁移时重新应用可重复迁移。

占位符还作为数据库连接的附加属性提供，因此数据库保留的占位符（例如 SQL Server 的 serverName）将由连接使用。

版本化迁移、可重复迁移和 SQL 回调支持占位符。

## 如何配置

占位符可以通过多种不同的方式进行配置。

- Via environment variables. FLYWAY_PLACEHOLDERS_MYPLACEHOLDER=value

- Via configuration parameters. flyway.placeholders.myplaceholder=value

- Via the api. .placeholders(Map.of("myplaceholder", "value"))

## 默认占位符

Flyway 还提供默认占位符，其值会自动填充：

```
${flyway:defaultSchema} = The default schema for Flyway
${flyway:user} = The user Flyway will use to connect to the database
${flyway:database} = The name of the database from the connection url
${flyway:timestamp} = The time that Flyway parsed the script, formatted as 'yyyy-MM-dd HH:mm:ss'
${flyway:filename} = The filename of the current script
${flyway:workingDirectory} = The user working directory as defined by the 'user.dir' System Property
${flyway:table} = The name of the Flyway schema history table
```

### Example

一个支持的语法例子：

```sql
/* Single line comment */
CREATE TABLE test_user (
  name VARCHAR(25) NOT NULL,
  PRIMARY KEY(name)
);

/*
Multi-line
comment
*/

-- Default placeholders
GRANT SELECT ON SCHEMA ${flyway:defaultSchema} TO ${flyway:user};

-- User defined placeholder
INSERT INTO ${tableName} (name) VALUES ('Mr. T');
```

# Script Migration Placeholders

与 SQL 占位符非常相似，Flyway 支持脚本迁移中的占位符替换。 

占位符可以通过您选择的脚本语言中的环境变量来读取，并且默认情况下以 `FP__` 为前缀，以 `__` 为后缀。 

访问包含冒号 (`:`) 的占位符时，必须将冒号替换为下划线 (`_`)。

### Example

Powershell:

```
echo $env:FP__flyway_filename__
```

Bash:

```
echo $FP__flyway_filename__
```

# Script Config Files

可以在每个脚本的基础上配置 SQL 迁移。

这是通过在迁移所在的同一文件夹中创建脚本配置文件来实现的。 

脚本配置文件名必须与迁移文件名匹配，并添加.conf后缀。 

脚本配置文件不需要在主配置或命令行中显式列出。

例如，迁移文件 `sql/V2__my_script.sql` 将具有脚本配置文件 `sql/V2__my_script.sql.conf`。

脚本配置文件具有配置 Flyway 的其他方式的选项子集（例如，flyway.conf）。 

## Structure

```
# Settings are simple key-value pairs
key=value
```

# Secrets Management

组织经常遇到的一个问题是在哪里存储以及如何访问敏感数据，例如连接数据库的凭据或其 Flyway 许可证密钥。

Flyway 支持以下秘密管理解决方案，使您能够成功处理敏感数据：

# SSL support

在生产环境中非常需要维护与数据库的安全连接，即使数据库配置尚未强制执行。 

Flyway 可以轻松配置为在需要时使用 SSL 建立安全连接，前提是相关数据库和 JDBC 驱动程序也支持 SSL。 

尽管不同数据库的详细信息有所不同，但配置它们的过程如下：

## 获取数据库证书的副本

对于本地数据库，建立可信连接所需的证书已随数据库一起安装，并且应从相关管理员处获取。 

对于云服务，提供商将发布相关证书 - 例如 Azure 和 Amazon RDS。


# 参考资料

https://documentation.red-gate.com/fd/configuration-184127448.html

* any list
{:toc}d