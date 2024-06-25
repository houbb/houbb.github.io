---
layout: post
title: database Jdbc-04-oracle jdbc 链接信息
date:  2018-10-07 14:51:25 +0800
categories: [Database]
tags: [database, jdbc, sql, sh]
published: true
---

# 如何连接到 oracle

### 详情
如何从我的Streaming和/或LiveView应用程序连接到Oracle数据库？

### 解决方案
首先，确定您的Oracle数据库的正确URL。URL应为以下格式之一：
```
jdbc:oracle:thin:@<dbhost>:<dbport>:<sid>
jdbc:oracle:thin:@<dbhost>:<dbport>/<sn>
```
其中：
- `dbhost` = 数据库主机名
- `dbport` = 数据库监听端口（默认是1521）
- `sid` = 数据库的服务ID
- `sn` = 数据库的服务名称别名

要查看可用于连接请求的服务名称别名，使用SYS账户登录并执行以下查询：
```
select con_id, name from v$services;
```

要快速启动一个用于简单测试的Oracle数据库，可以使用Docker：
```
docker pull store/oracle/database-enterprise:12.2.0.1
docker run -d -it --name oracle12 -p 1521:1521 -p 5500:5500 store/oracle/database-enterprise:12.2.0.1
```
这将启动一个本地的Oracle 12.2.0.1数据库，SID为`ORCLCDB`，服务名称别名为`orclpdb1.localdomain`。对于这个数据库，您可以使用以下任一连接URL：
```
jdbc:oracle:thin:@localhost:1521:ORCLCDB
jdbc:oracle:thin:@localhost:1521/orclpdb1.localdomain
```

接下来，将兼容的ojdbc驱动程序安装到您的Maven库中。要确定适合您的Oracle数据库版本的正确驱动程序，请参考Oracle的指导。通常，最好下载与您的Oracle数据库版本和运行Streaming应用程序的JDK版本兼容的最新驱动程序。例如：
```
mvn install:install-file -Dfile=ojdbc8-19.3.0.0.jar -DgroupId=com.oracle.ojdbc -DartifactId=ojdbc8 -Dversion=19.3.0.0 -Dpackaging=jar
```
然后在您的项目的`pom.xml`中添加驱动程序作为依赖项：
```xml
<dependency>
    <groupId>com.oracle.ojdbc</groupId>
    <artifactId>ojdbc8</artifactId>
    <version>19.3.0.0</version>
</dependency>
```

最后，创建一个JDBC HOCON配置：
```hocon
configuration = {
  JDBCDataSourceGroup = {
    jdbcDataSources = {
      "oracle12" = {
          driverClassName = "oracle.jdbc.driver.OracleDriver"
          serverURL = "jdbc:oracle:thin:@localhost:1521/orclpdb1.localdomain"
          userName = "SYS AS SYSDBA"
          password = "Oradoc_db1"
      }
    }
  }
}
```

现在，您已配置为连接到Oracle JDBC数据源。



# oracle 的 3 种方式

使用jdbc连接oracle时url有三种格式

## 格式一: Oracle JDBC Thin using an SID:

```
jdbc:oracle:thin:@host:port:SID
```

Example: jdbc:oracle:thin:@localhost:1521:orcl

这种格式是最简单也是用得最多的

你的oracle的sid可以通过一下指令获得：

```
sqlplus / as sysdba
select value from v$parameter where name=‘instance_name’;
```

```java
import java.sql.*;

public class TestOrclConnect {

	public static void main(String[] args) {
		ResultSet rs = null;
		Statement stmt = null;
		Connection conn = null;
		try {
			Class.forName("oracle.jdbc.driver.OracleDriver");
			String dbURL = "jdbc:oracle:thin:@localhost:1521:orcl";
			conn = DriverManager.getConnection(dbURL, "admin2", "123");
			System.out.println("连接成功");
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
		} finally {
			try {
				if (rs != null) {
					rs.close();
					rs = null;
				}
				if (stmt != null) {
					stmt.close();
					stmt = null;
				}
				if (conn != null) {
					conn.close();
					conn = null;
				}
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
	}
}
```


## 格式二: Oracle JDBC Thin using a ServiceName:

```
jdbc:oracle:thin:@//host:port/service_name
```

Example:jdbc:oracle:thin:@//localhost:1521/orcl.city.com

注意这里的格式，@后面有//, port后面:换成了/,这种格式是Oracle 推荐的格式，**因为对于集群来说，每个节点的SID 是不一样的，但是 SERVICE_NAME 确可以包含所有节点。**

你的oracle的service_name可以通过以下方式获得：

```sql
sqlplus / as sysdba
select value from v$parameter where name=‘service_names’;
```

```java
import java.sql.*;

public class TestOrclConnect {

	public static void main(String[] args) {
		ResultSet rs = null;
		Statement stmt = null;
		Connection conn = null;
		try {
			Class.forName("oracle.jdbc.driver.OracleDriver");
			String dbURL = "jdbc:oracle:thin:@//localhost:1521/orcl.city.com";
			conn = DriverManager.getConnection(dbURL, "admin2", "123");
			System.out.println("连接成功");
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
		} finally {
			try {
				if (rs != null) {
					rs.close();
					rs = null;
				}
				if (stmt != null) {
					stmt.close();
					stmt = null;
				}
				if (conn != null) {
					conn.close();
					conn = null;
				}
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
	}
}
```

## 格式三：Oracle JDBC Thin using a TNSName:

```
jdbc:oracle:thin:@TNSName
```

Example: jdbc:oracle:thin:@TNS_ALIAS_NAME

我在谷歌上找了一些资源，要实现这种连接方式首先要建立tnsnames.ora文件，然后通过System.setProperty指明这个文件路径。

再通过上面URL中的@符号指定文件中的要使用到的资源。

这种格式我现在水平几乎没见过，对于我来说用得到这种的情况并不多吧。

当然既然是通过配置文件来读取指定资源肯定也可以直接将资源拿出来放在URL中，直接放在URL中的URL模版是下面这样的（tnsnames.ora这个文件中放的就是@符号后面的那一段代码，当然用文件的好处就是可以配置多个，便于管理）：

```
jdbc:oracle:thin:@(DESCRIPTION=(ADDRESS_LIST=(ADDRESS=(PROTOCOL= TCP)(HOST=hostA)(PORT= 1522))(ADDRESS=(PROTOCOL=TCP)(HOST=your host)(PORT=1521)))(SOURCE_ROUTE=yes)(CONNECT_DATA=(SERVICE_NAME=your service_name)))
```

jdbc连接代码如下：

```java
import java.sql.*;

public class TestOrclConnect {

	public static void main(String[] args) {
		ResultSet rs = null;
		Statement stmt = null;
		Connection conn = null;
		try {
			Class.forName("oracle.jdbc.driver.OracleDriver");
			 String dbURL =
			"jdbc:oracle:thin:@(DESCRIPTION=(ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=1521)))"
			+ "(CONNECT_DATA=(SERVICE_NAME=orcl.city.com)))";
			conn = DriverManager.getConnection(dbURL, "admin2", "123");
			System.out.println("连接成功");
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		} catch (SQLException e) {
			e.printStackTrace();
		} finally {
			try {
				if (rs != null) {
					rs.close();
					rs = null;
				}
				if (stmt != null) {
					stmt.close();
					stmt = null;
				}
				if (conn != null) {
					conn.close();
					conn = null;
				}
			} catch (SQLException e) {
				e.printStackTrace();
			}
		}
	}
}
```

# chat

## Oracle jdbc url 详细介绍

Oracle JDBC URL 是用来连接Oracle数据库的字符串，它指定了如何通过Java程序与Oracle数据库建立连接。

Oracle JDBC URL的格式相对复杂，并且有多种写法。

以下是一些详细的介绍和示例：

1. **使用SID连接**：
   - 格式：`jdbc:oracle:thin:@host:port:SID`
   - 示例：`jdbc:oracle:thin:@localhost:1521:orcl`
   - 这里的`SID`是Oracle实例的系统标识符，可以通过SQL*Plus工具查询`v$parameter`视图获得。

2. **使用服务名（Service Name）连接**：
   - 格式：`jdbc:oracle:thin:@//host:port/service_name`
   - 示例：`jdbc:oracle:thin:@//localhost:1521/orcl_service`
   - 服务名是在Oracle网络配置文件`tnsnames.ora`中定义的名称，通常用于区分同一主机上的多个Oracle实例。

3. **使用描述（Description）连接**：
   - 格式：`jdbc:oracle:thin:@(DESCRIPTION=(ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST=host)(PORT=port)))(CONNECT_DATA=(SERVICE_NAME=service_name)))`
   - 示例：
     ```plaintext
     jdbc:oracle:thin:@(DESCRIPTION=(ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.16.91)(PORT=1521)))(CONNECT_DATA=(SERVICE_NAME=orcl)))
     ```
   - 这种格式提供了更详细的连接描述，包括协议、主机、端口和服务名。

4. **使用tnsnames.ora文件**：
   - 如果使用`tnsnames.ora`配置文件，可以在JDBC URL中通过`@`符号指定文件中的资源。首先需要建立`tnsnames.ora`文件，并在其中定义连接描述，然后在JDBC URL中引用。

5. **Oracle JDBC连接类型的不同**：
   - Oracle JDBC提供了三种连接类型：`thin`、`oci`和`kprb`。其中`thin`是最常见的，它是一个轻量级的纯Java驱动程序。

6. **示例代码**：
   - 下面是一个使用JDBC连接Oracle数据库的Java示例代码：
     ```java
     import java.sql.*;
     public class TestOrclConnect {
       public static void main(String[] args) {
         try {
           Class.forName("oracle.jdbc.driver.OracleDriver");
           String dbURL = "jdbc:oracle:thin:@localhost:1521:orcl";
           Connection conn = DriverManager.getConnection(dbURL, "admin2", "123");
           System.out.println("连接成功");
         } catch (ClassNotFoundException | SQLException e) {
           e.printStackTrace();
         }
       }
     }
     ```

请注意，连接字符串的确切格式可能根据Oracle数据库的版本和配置有所不同。

在实际应用中，应根据具体的环境和需求选择合适的连接方式和参数。

## 详细介绍下 thin 的链接方式

Oracle JDBC Thin 是Oracle提供的一种轻量级的纯Java驱动程序，它允许Java应用程序通过网络连接到Oracle数据库。

以下是Thin连接方式的详细介绍：

### 基本格式
Thin连接的基本格式如下：
```
jdbc:oracle:thin:[username/password]@[host]:[port]:[SID or service_name]
```
- **username/password**：数据库的用户名和密码。
- **host**：Oracle数据库服务器的主机名或IP地址。
- **port**：Oracle数据库实例监听的端口号，默认为1521。
- **SID**：Oracle实例的系统标识符（System Identifier），用于标识特定的Oracle数据库实例。
- **service_name**：在`tnsnames.ora`文件中定义的服务名，用于连接到特定的Oracle数据库服务。

### 连接示例
以下是几种使用Thin驱动连接到Oracle数据库的示例：

1. **使用SID**：
   ```plaintext
   jdbc:oracle:thin:username/password@hostname:port:SID
   ```
   例如：
   ```plaintext
   jdbc:oracle:thin:scott/tiger@localhost:1521:orcl
   ```

2. **使用服务名**：
   ```plaintext
   jdbc:oracle:thin:username/password@hostname:port/service_name
   ```
   例如：
   ```plaintext
   jdbc:oracle:thin:scott/tiger@localhost:1521/orcl_service
   ```

3. **省略用户名和密码**：
   如果应用程序已经通过其他方式（如JDBC属性）提供了用户名和密码，可以在URL中省略它们：
   ```plaintext
   jdbc:oracle:thin:@hostname:port:SID
   ```

### 配置文件

Thin驱动可以使用`tnsnames.ora`配置文件来简化连接字符串。

`tnsnames.ora`文件通常位于Oracle客户端的`$ORACLE_HOME/network/admin`目录下，或者用户的`~/.oraquickstart/tnsnames.ora`文件中。

在`tnsnames.ora`中定义服务名，然后在JDBC URL中引用它。

### 示例配置文件（tnsnames.ora）
```plaintext
ORCL =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = localhost)(PORT = 1521))
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = orcl)
    )
  )
```
然后，JDBC URL可以简化为：
```
jdbc:oracle:thin:@ORCL
```

### 驱动程序加载
在使用Thin驱动连接数据库之前，需要加载`oracle.jdbc.driver.OracleDriver`类。这通常在Java代码中通过`Class.forName()`方法实现：
```java
Class.forName("oracle.jdbc.driver.OracleDriver");
```

### 连接代码示例
以下是一个简单的Java代码示例，演示如何使用Thin驱动连接到Oracle数据库：
```java
import java.sql.*;

public class OracleThinConnectionExample {
    public static void main(String[] args) {
        String url = "jdbc:oracle:thin:scott/tiger@localhost:1521:orcl";
        try (Connection conn = DriverManager.getConnection(url)) {
            if (conn != null) {
                System.out.println("Connection to Oracle DB has been established.");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

请注意，上述示例中的用户名、密码、主机名、端口和SID需要根据实际的Oracle数据库环境进行替换。

此外，确保Oracle JDBC驱动程序的JAR文件已经添加到应用程序的类路径中。


## 详细介绍下 oracle 的sid service name 

Oracle数据库中的SID（System Identifier）和服务名（Service Name）是用于标识和连接到特定数据库实例的两个关键概念。下面详细介绍这两个概念：

### SID（System Identifier）
- **定义**：SID是Oracle数据库实例的唯一标识符。每个Oracle数据库实例都有一个与之对应的SID，用于区分同一服务器上的多个数据库实例。
- **用途**：在Oracle数据库中，SID主要用于：
  - 标识数据库实例，以便在操作系统级别区分不同的Oracle进程。
  - 在网络配置中，通过`tnsnames.ora`文件定义连接到特定实例的网络服务。
  - 在JDBC URL中指定要连接的数据库实例。

- **获取SID**：可以通过以下SQL查询获取当前数据库实例的SID：
  ```sql
  SELECT value FROM v$parameter WHERE name = 'instance_name';
  ```

### 服务名（Service Name）
- **定义**：服务名是在Oracle网络配置文件`tnsnames.ora`中定义的，用于标识和访问Oracle数据库服务的逻辑名称。服务名可以代表一个数据库实例或一个数据库服务，它允许客户端通过一个易于记忆的名称连接到数据库。
- **用途**：服务名主要用于：
  - 在客户端应用程序中通过JDBC URL连接到数据库时使用。
  - 在`tnsnames.ora`文件中定义网络连接的配置，简化连接字符串。
  - 允许在同一服务器上运行多个Oracle实例时，通过服务名区分不同的数据库服务。

- **配置服务名**：服务名在`tnsnames.ora`文件中定义，该文件通常位于Oracle客户端的`$ORACLE_HOME/network/admin`目录下。以下是一个`tnsnames.ora`文件中定义服务名的示例：
  ```plaintext
  ORCL_SERVICE =
    (DESCRIPTION =
      (ADDRESS = (PROTOCOL = TCP)(HOST = localhost)(PORT = 1521))
      (CONNECT_DATA =
        (SERVER = DEDICATED)
        (SERVICE_NAME = orcl)
      )
    )
  ```

### 区别和联系
- **区别**：
  - SID是数据库实例的唯一标识符，通常由Oracle在实例创建时自动生成。
  - 服务名是逻辑名称，用于在网络配置中标识和访问数据库服务，可以由数据库管理员自定义。

- **联系**：
  - 服务名通常与SID关联，但在`tnsnames.ora`文件中定义时，它们可以指向同一个数据库实例。
  - 在JDBC URL中，可以使用SID或服务名来指定要连接的数据库实例。

### 示例
假设有一个Oracle数据库实例的SID为`orcl`，可以在`tnsnames.ora`文件中定义一个对应的服务名`ORCL_SERVICE`，然后在JDBC URL中使用这个服务名来连接到数据库：
```plaintext
JDBC URL: jdbc:oracle:thin:@//localhost:1521/ORCL_SERVICE
```

了解SID和服务名的概念和用法对于配置和管理Oracle数据库的网络连接非常重要。通过合理使用这些概念，可以提高数据库连接的灵活性和可管理性。

## 哪一个对应的是数据库名称呢？

在Oracle数据库中，没有一个直接对应于"数据库名称"的概念，如在某些其他数据库系统中那样。相反，Oracle使用以下几个关键概念来标识和访问数据库：

1. **SID（System Identifier）**：这是Oracle实例的唯一标识符，用于区分同一服务器上的多个Oracle实例。虽然SID代表了一个特定的数据库实例，但它并不直接表示数据库的名称。

2. **服务名（Service Name）**：服务名是在`tnsnames.ora`文件中定义的，用于标识和访问Oracle数据库服务的逻辑名称。服务名可以代表一个数据库实例或一个数据库服务，但它并不是数据库的名称，而是用于网络连接的标识符。

3. **数据库名（Database Name）**：在Oracle术语中，数据库名通常指的是实例名（Instance Name），这是Oracle数据库实例的名称。在某些上下文中，人们可能会使用"数据库名"来指代服务名或SID，但这不是官方的Oracle术语。

4. **PDB（Pluggable Database）**：从Oracle 12c开始，Oracle引入了多租户架构，允许在一个容器数据库（CDB）中创建多个可插拔数据库（PDB）。每个PDB都有自己的数据库名，这可以被视为数据库的名称。

5. **表空间（Tablespace）**：在Oracle数据库中，表空间是数据库存储结构的一部分，用于存储数据库对象，如表、索引等。虽然表空间名不是数据库的名称，但它是数据库结构的一个重要组成部分。

在实际使用中，如果你需要引用一个特定的Oracle数据库，你可能会使用服务名或SID来指定要连接的数据库实例。例如，在JDBC URL中，你可能会使用服务名来建立与特定Oracle数据库的连接。然而，这并不直接表示数据库的名称，而是用于标识和访问数据库实例的一种方式。

如果你需要在应用程序中使用数据库名称，你可能需要根据你的具体需求和上下文来定义和使用这个名称，例如，你可以在应用程序逻辑中使用一个变量或配置项来表示你想要连接的数据库实例。

## 对应 MySQL中数据库名的是哪一个属性

在Oracle数据库中，对应于MySQL中的"数据库名"的概念，最接近的是**服务名（Service Name）**。在Oracle数据库中，服务名是在`tnsnames.ora`文件中定义的，用于标识和访问Oracle数据库服务的逻辑名称。这与MySQL中的数据库名类似，都是用来标识一个特定的数据库实例或服务。

### MySQL中的数据库名
在MySQL中，数据库名是一个简单的标识符，用于区分不同的数据库。当你创建一个新的数据库时，你会给它一个名称，这个名称在整个MySQL服务器中是唯一的。

### Oracle中的服务名
在Oracle中，服务名通常用来：
- 作为客户端应用程序连接到数据库时的逻辑名称。
- 在`tnsnames.ora`配置文件中定义，允许客户端通过一个易于记忆的名称连接到数据库。

例如，如果你有一个Oracle数据库实例，你可能会在`tnsnames.ora`文件中定义如下服务名：
```plaintext
MYORACLEDB =
  (DESCRIPTION =
    (ADDRESS = (PROTOCOL = TCP)(HOST = myhost.example.com)(PORT = 1521))
    (CONNECT_DATA =
      (SERVER = DEDICATED)
      (SERVICE_NAME = MYORACLEDB)
    )
  )
```
在这个例子中，`MYORACLEDB`就是服务名，它代表了Oracle数据库的一个特定实例。

### JDBC URL中的使用
在连接到Oracle数据库时，你可以在JDBC URL中使用服务名来指定要连接的数据库服务，例如：
```plaintext
jdbc:oracle:thin:user/password@MYORACLEDB
```
这里的`MYORACLEDB`就是服务名，它在JDBC URL中的作用类似于MySQL中的数据库名。

### 注意
虽然服务名在功能上类似于MySQL中的数据库名，但Oracle数据库的架构和连接机制与MySQL有很大的不同。

Oracle数据库可以支持多租户架构（CDB和PDB），以及复杂的网络配置和连接池等高级特性。

因此，在实际使用中，需要根据Oracle数据库的具体配置和需求来确定如何标识和访问数据库。

## 如果用 Druid 链接 Oracle ，给出链接的配置信息和具体例子

Druid是一个JDBC连接池，它能够提供强大的监控和扩展功能，以帮助开发者更方便地管理数据库连接。在使用Druid连接池连接Oracle数据库时，你需要配置连接池的相关参数，并将Oracle JDBC驱动的依赖添加到项目中。

### 配置信息
Druid连接池的配置通常包括以下基本参数：

- `driverClassName`：指定JDBC驱动的完整类名，对于Oracle，这通常是`"oracle.jdbc.driver.OracleDriver"`或`"oracle.jdbc.OracleDriver"`。
- `url`：JDBC连接URL，遵循Oracle JDBC URL的格式。
- `username`：数据库用户名。
- `password`：数据库密码。

### 配置示例
以下是一个Druid连接池配置的示例，使用XML格式：

```xml
<bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource">
    <!-- 驱动类名 -->
    <property name="driverClassName" value="oracle.jdbc.OracleDriver" />
    <!-- JDBC URL -->
    <property name="url" value="jdbc:oracle:thin:scott/tiger@localhost:1521/orcl_service" />
    <!-- 数据库用户名 -->
    <property name="username" value="scott" />
    <!-- 数据库密码 -->
    <property name="password" value="tiger" />
    <!-- 连接池其他配置 -->
    <!-- ... -->
</bean>
```

### 具体例子
假设你有一个Oracle数据库实例，服务名为`orcl_service`，运行在`localhost`上的1521端口，用户名为`scott`，密码为`tiger`。以下是如何使用Druid连接池连接到这个Oracle数据库的示例：

1. **添加Druid依赖**：首先，确保你的项目中添加了Druid的依赖。如果你使用Maven，可以在`pom.xml`文件中添加如下依赖：

```xml
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>1.2.8</version> <!-- 使用最新的Druid版本 -->
</dependency>
<dependency>
    <groupId>com.oracle</groupId>
    <artifactId>ojdbc8</artifactId>
    <version>12.2.0.1</version> <!-- 使用Oracle JDBC驱动的最新版本 -->
</dependency>
```

2. **配置Druid连接池**：在Spring框架中配置Druid连接池，如上文所示的XML配置示例。

3. **使用连接池**：配置完成后，你的应用程序就可以通过Druid连接池来管理对Oracle数据库的连接了。

请注意，Druid连接池提供了许多高级配置选项，例如最大连接数、最小空闲连接数、连接超时时间等，可以根据你的应用需求进行配置。

此外，Druid还提供了监控功能，可以帮助你监控数据库连接的使用情况。






# 参考资料 

[url-string-format-for-connecting-to-oracle-database-with-jdbc](https://stackoverflow.com/questions/1054105/url-string-format-for-connecting-to-oracle-database-with-jdbc)

https://docs.oracle.com/en/database/oracle/oracle-database/21/jjdbc/data-sources-and-URLs.html#GUID-088B1600-C6C2-4F19-A020-2DAF8FE1F1C3

https://support.tibco.com/s/article/How-to-connect-to-an-Oracle-database-over-JDBC

[JDBC连接ORACLE的三种URL格式](https://blog.csdn.net/u012062455/article/details/52442838)

* any list
{:toc}