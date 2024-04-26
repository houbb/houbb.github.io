---
layout: post
title: java 变更日志-01-java1.1 核心变化
date:  2017-06-28 23:15:43 +0800
categories: [Java]
tags: [jdk, java]
published: true
---


# java1.1 核心变化

Java 1.1 版本是 Java 语言发展早期的一个重要里程碑，它在 1997 年发布，带来了许多核心变化和改进，这些变化对 Java 的普及和应用产生了深远的影响。

以下是 Java 1.1 版本的一些核心变化：

1. **Inner Classes**：Java 1.1 引入了内部类的概念，允许在一个类中定义另一个类，这增强了代码的封装性和复用性。

2. **JAR Files**：Java 1.1 支持了 JAR（Java Archive）文件格式，这是一种打包多个类文件和相关资源文件的方式，便于分发和部署。

3. **RMI (Remote Method Invocation)**：Java 1.1 引入了 RMI 机制，允许应用程序调用运行在不同 JVM 上的对象的方法，这为分布式计算提供了基础。

4. **JDBC (Java Database Connectivity)**：Java 1.1 提供了 JDBC API，使得 Java 程序能够访问各种关系型数据库管理系统。

5. **Collections Framework**：虽然 Java 1.1 并没有完整的集合框架，但后续版本基于此概念发展出了强大的集合框架，为操作复杂数据集合提供了支持。

6. **Event Model**：Java 1.1 引入了基于接口的事件处理模型，为图形用户界面编程和事件驱动编程提供了基础。

7. **Internationalization and Localization**：Java 1.1 开始支持国际化和本地化，使得 Java 应用可以适应不同语言和地区的需求。

8. **JavaBeans**：Java 1.1 引入了 JavaBeans 组件模型，这是一种特殊的 Java 类，遵循特定的编写规则，能够被可视化开发工具所使用。

9. **Security**：Java 1.1 增强了安全机制，提供了一套安全管理器和安全策略，增强了对运行时安全的控制。

10. **Performance Improvements**：Java 1.1 进行了性能上的改进，包括即时编译器的优化，提高了 Java 程序的执行效率。

11. **Standard Edition (SE), Enterprise Edition (EE), and Micro Edition (ME)**：Java 1.1 时期，Java 被明确划分为三个不同的平台，即标准版、企业版和微型版，以适应不同规模和需求的应用开发。

这些变化为 Java 语言的后续发展奠定了坚实的基础，也为 Java 成为跨平台、分布式、面向对象的程序设计语言的领导者起到了关键作用。随着 Java 1.1 的发布，Java 开始广泛应用于企业级应用和互联网编程中。


# 1. 详细介绍 java1.1 Inner Classes，并包含使用例子

# 详细介绍 java1.1 内部类 (Inner Classes)

内部类是 Java 1.1 引入的一个重要特性，它允许在一个类的内部定义另一个类。内部类可以访问外部类的成员，包括私有成员，这使得内部类非常适合用于实现与外部类对象紧密相关的行为。

### 内部类的类型

1. **成员内部类**：定义在外部类内部，但方法体外的类。
2. **局部内部类**：定义在外部类的方法体内部的类。
3. **匿名内部类**：没有名字的内部类，常用于继承其他类或实现接口。
4. **静态内部类**：定义在外部类内部，但被 `static` 关键字修饰的类。

### 使用内部类的例子

#### 成员内部类

```java
public class OuterClass {
    private String outerField = "外部类的属性";

    // 成员内部类
    class InnerClass {
        public void display() {
            System.out.println("访问外部类的属性: " + outerField);
        }
    }

    public static void main(String[] args) {
        OuterClass outer = new OuterClass();
        OuterClass.InnerClass inner = outer.new InnerClass();
        inner.display();
    }
}
```

在这个例子中，`InnerClass` 是 `OuterClass` 的成员内部类，它可以直接访问 `OuterClass` 的私有属性 `outerField`。

#### 局部内部类

```java
public class OuterClassWithLocal {
    public void outerMethod() {
        // 定义局部内部类
        class LocalInnerClass {
            public void show() {
                System.out.println("这是一个局部内部类");
            }
        }

        // 创建局部内部类的实例并调用其方法
        LocalInnerClass localInstance = new LocalInnerClass();
        localInstance.show();
    }

    public static void main(String[] args) {
        OuterClassWithLocal outer = new OuterClassWithLocal();
        outer.outerMethod();
    }
}
```

在这个例子中，`LocalInnerClass` 是 `outerMethod` 方法内部定义的局部内部类，它只能在 `outerMethod` 方法的作用域内使用。

#### 匿名内部类

```java
public class AnonymousInnerClassExample {
    public static void main(String[] args) {
        // 使用匿名内部类实现 Runnable 接口
        Thread thread = new Thread(new Runnable() {
            @Override
            public void run() {
                System.out.println("线程运行中，使用匿名内部类实现 Runnable");
            }
        });
        thread.start();
    }
}
```

在这个例子中，创建了 `Thread` 对象时，我们没有显式定义一个类去实现 `Runnable` 接口，而是直接提供了一个匿名内部类对象作为 `Runnable` 的实现。

#### 静态内部类

```java
public class OuterClassWithStaticInner {
    private String outerStaticField = "外部类的静态属性";

    // 静态内部类
    static class StaticInnerClass {
        public void display() {
            System.out.println("访问外部类的静态属性: " + outerStaticField);
        }
    }

    public static void main(String[] args) {
        StaticInnerClass inner = new StaticInnerClass();
        inner.display();
    }
}
```

在这个例子中，`StaticInnerClass` 是 `OuterClassWithStaticInner` 的静态内部类，它可以访问外部类的静态成员，但要注意，静态内部类不能直接访问外部类的非静态成员。

内部类提供了一种新的代码组织方式，使得代码更加模块化和封装，但同时也增加了语言的复杂性。正确使用内部类可以提高代码的可读性和可维护性。

# 2. 详细介绍 java1.1 JAR Files，并包含使用例子

Java 1.1 支持了 JAR（Java Archive）文件格式，这是一种打包多个类文件和相关资源文件的方式，便于分发和部署。


# 详细介绍 java1.1 JAR 文件

JAR（Java Archive）文件是 Java 1.1 版本引入的一种打包工具，它允许将多个 Java 类文件、相关的元数据和资源（如文本、图片等）打包到一个单一的文件中。这种格式类似于 ZIP 文件，它通常用于：

1. 分发和部署 Java 应用程序或库。
2. 作为应用程序的执行包，可以被 Java 虚拟机（JVM）直接执行。
3. 作为库供其他开发者使用。

### JAR 文件的特点

- **压缩**：JAR 文件通常被压缩，以减少文件大小，便于分发。
- **封装**：JAR 文件可以包含 Java 类文件、资源文件和清单文件（Manifest），后者可以指定应用程序的入口点（主类）。
- **可执行**：通过在清单文件中指定主类，JAR 文件可以被 JVM 直接执行。
- **重用**：JAR 文件可以作为库被其他 Java 应用程序引用。

### 使用 JAR 文件的例子

#### 创建 JAR 文件

假设我们有两个 Java 类文件 `MyClass1.java` 和 `MyClass2.java`，我们想要将它们打包成一个 JAR 文件。

1. 编译 Java 类文件：

```bash
javac MyClass1.java MyClass2.java
```

2. 创建一个清单文件 `manifest.txt`，指定主类：

```bash
Main-Class: MyClass1
Sealed: true
```

3. 使用 `jar` 命令创建 JAR 文件：

```bash
jar cvfm myapp.jar manifest.txt MyClass1.class MyClass2.class
```

这个命令会创建一个名为 `myapp.jar` 的 JAR 文件，包含 `MyClass1.class` 和 `MyClass2.class`，以及指定了 `Main-Class` 的清单文件。

#### 执行 JAR 文件

如果 JAR 文件包含一个清单文件，并且清单文件中指定了 `Main-Class` 属性，那么可以直接通过 `java` 命令执行这个 JAR 文件：

```bash
java -jar myapp.jar
```

这将执行 `myapp.jar` 中的 `MyClass1`（由清单文件指定为主类）。

#### 查看 JAR 文件内容

可以使用 `jar` 命令查看 JAR 文件的内容：

```bash
jar tf myapp.jar
```

这将列出 `myapp.jar` 文件中包含的所有文件。

#### 将 JAR 文件作为库使用

其他 Java 应用程序可以在编译时或运行时引用这个 JAR 文件：

- **编译时**：

```bash
javac -cp myapp.jar OtherClass.java
```

- **运行时**：

```bash
java -cp myapp.jar OtherClass
```

在这两个例子中，`-cp` 参数指定了类路径，`myapp.jar` 将作为库被包含进来。

JAR 文件是 Java 生态系统中的一个基础组件，它极大地方便了 Java 应用程序和库的分发与部署。

# 3. 详细介绍 java1.1 RMI (Remote Method Invocation) ，并包含使用例子

Java 1.1 引入了 RMI 机制，允许应用程序调用运行在不同 JVM 上的对象的方法，这为分布式计算提供了基础。

# 详细介绍 java1.1 RMI (Remote Method Invocation)

RMI（Remote Method Invocation）是 Java 1.1 版本引入的一个强大特性，它允许在一台 Java 虚拟机上运行的程序调用另一台 Java 虚拟机上的对象的方法，即使这些对象位于不同的主机上。RMI 使得分布式编程变得更加容易，因为它提供了一种机制来透明地通信和调用远程对象。

### RMI 的主要组件

1. **远程接口 (Remote Interface)**：定义了可以被非本地虚拟机调用的方法。
2. **服务器端 (Server)**：实现了远程接口的对象，它导出了远程对象并等待远程调用。
3. **客户端 (Client)**：调用远程对象方法的代码。
4. **远程对象 (Remote Object)**：实现了远程接口的服务器端对象的代理，由客户端持有并用来间接调用服务器上的方法。
5. **RMI 运行时**：提供了使 RMI 调用成为可能的框架和传输机制。

### RMI 的使用步骤

1. **定义远程接口**：远程接口必须继承 `java.rmi.Remote` 接口并至少提供一个远程方法。
2. **实现远程对象**：创建一个实现了远程接口的类，并实现其中的远程方法。
3. **创建并导出远程对象**：在服务器端创建实现类的实例，并使用 `java.rmi.server.UnicastRemoteObject` 将该实例导出为远程对象。
4. **启动 RMI registry**：RMI 注册表是一个简单的远程对象注册服务，客户端可以通过它查找远程对象的存根。
5. **编写客户端代码**：客户端代码使用 RMI 注册表查找远程对象的存根，并调用远程方法。

### 使用 RMI 的例子

#### 定义远程接口

```java
import java.rmi.Remote;
import java.rmi.RemoteException;

public interface Hello extends Remote {
    String sayHello(String message) throws RemoteException;
}
```

#### 实现远程对象

```java
import java.rmi.RemoteServer;
import java.rmi.server.UnicastRemoteObject;

public class HelloImpl extends UnicastRemoteObject implements Hello {
    protected HelloImpl() throws RemoteException {
        super();
    }

    @Override
    public String sayHello(String message) throws RemoteException {
        return "Hello, " + message + "!";
    }
}
```

#### 启动服务器并导出远程对象

```java
import java.rmi.Naming;
import java.rmi.RemoteException;

public class HelloServer {
    public static void main(String[] args) {
        try {
            // 创建并导出远程对象
            Hello hello = new HelloImpl();
            java.rmi.registry.LocateRegistry.createRegistry(1099); // 创建 RMI 注册表
            Naming.rebind("rmi://localhost/HelloService", hello); // 绑定远程对象到注册表
            System.out.println("HelloServer ready...");
        } catch (Exception e) {
            System.err.println("Server exception: " + e.toString());
            e.printStackTrace();
        }
    }
}
```

#### 编写客户端代码

```java
import java.rmi.Naming;

public class HelloClient {
    public static void main(String[] args) {
        try {
            // 从注册表中查找远程对象
            Hello hello = (Hello) Naming.lookup("rmi://localhost/HelloService");
            // 调用远程方法
            String response = hello.sayHello("World");
            System.out.println("Response: " + response);
        } catch (Exception e) {
            System.err.println("Client exception: " + e.toString());
            e.printStackTrace();
        }
    }
}
```

在这个例子中，服务器创建了一个实现了 `Hello` 接口的 `HelloImpl` 对象，并将其导出为远程对象，绑定到 RMI 注册表。客户端使用 `Naming.lookup` 方法查找远程对象，并调用其 `sayHello` 方法。

RMI 是 Java 进行分布式应用开发的重要技术之一，它极大地简化了网络编程的复杂性。

然而，使用 RMI 时还需要考虑安全性、网络延迟、对象激活和去激活等高级主题。

## java 的 rmi 设计如何？为什么现在却主流用的是 rpc 呢？

Java 的 RMI（Remote Method Invocation）设计是一种允许在一个 Java 虚拟机中运行的对象调用另一个 Java 虚拟机中对象的方法的机制。RMI 是 Java 早期提供的远程通信解决方案，它使用 Java 序列化机制在客户端和服务器之间传递对象。

RMI 的设计具有以下特点：

1. **语言特定**：RMI 是专为 Java 语言设计的，因此它与 Java 语言的集成度很高，易于使用。
2. **自动处理网络通信**：RMI 抽象了底层的网络通信细节，使得开发者可以像调用本地方法一样调用远程方法。
3. **分布式垃圾回收**：RMI 运行时自动处理对象的分布式垃圾回收，减少了内存泄漏的风险。
4. **传输序列化对象**：RMI 使用 Java 对象序列化机制在 JVM 之间传输对象，这对于一些简单的分布式应用来说是方便的。

然而，尽管 RMI 在 Java 社区中曾经广泛使用，但现在主流使用的是 RPC（Remote Procedure Call）框架，原因包括：

1. **语言无关性**：RPC 框架通常支持跨语言调用，这使得它们在多语言环境中更为灵活和通用。
2. **性能**：RMI 的序列化和传输机制可能不如某些 RPC 框架高效，特别是当涉及到大量数据传输时。
3. **扩展性**：许多 RPC 框架提供了更好的扩展性和容错性，特别是在分布式系统和服务导向架构中。
4. **生态系统和工具**：RPC 框架通常拥有更丰富的生态系统和工具支持，如服务发现、负载均衡、监控和追踪等。
5. **协议支持**：RPC 框架支持多种通信协议，如 HTTP、gRPC 等，这些协议在现代网络环境中更为普遍和高效。

随着分布式系统的复杂性增加，以及对跨语言、跨平台能力的需求，RPC 框架逐渐取代了 RMI 成为了主流的远程服务调用解决方案。此外，RPC 框架如 gRPC、Dubbo 等提供了更先进的特性，如基于 HTTP/2 的多路复用、流控制、服务发现和断路器等，这些特性在构建现代云原生应用时非常重要。

总的来说，虽然 RMI 在 Java 特定的场景下仍有一定的应用，但 RPC 框架因其更广泛的适用性、更高的性能和更先进的特性而成为了更主流的选择。

# 4. 详细介绍 java1.1 JDBC (Java Database Connectivity) ，并包含使用例子

Java 1.1 提供了 JDBC API，使得 Java 程序能够访问各种关系型数据库管理系统。

# 详细介绍 java1.1 JDBC (Java Database Connectivity)

JDBC (Java Database Connectivity) 是 Java 1.1 版本引入的一个非常重要的特性，它提供了一种标准的方法，允许 Java 程序连接到数据库并执行 SQL 语句。JDBC 为开发者提供了一个统一的数据库操作接口，使得开发者可以使用纯 Java 代码来实现跨数据库平台的操作。

### JDBC 的主要组件

1. **JDBC Driver**：用于 Java 程序与数据库之间的通信。
2. **Driver Manager**：负责管理 JDBC 驱动程序，并为应用程序建立与数据库的连接。
3. **Connection**：代表了与数据库的连接。
4. **Statement**：用于执行 SQL 语句和获取结果。
5. **ResultSet**：包含了 Statement 对象执行 SQL 查询语句后返回的数据。
6. **PreparedStatement**：是 Statement 的子接口，允许使用预编译的 SQL 语句。

### JDBC 使用步骤

1. **加载 JDBC 驱动**：通过调用 `Class.forName()` 方法加载数据库的 JDBC 驱动。
2. **建立数据库连接**：使用 `DriverManager.getConnection()` 方法建立到数据库的连接。
3. **创建 Statement 或 PreparedStatement**：用于执行 SQL 语句。
4. **执行 SQL 语句**：可以通过 `executeQuery()` 或 `executeUpdate()` 方法执行 SQL 查询或更新操作。
5. **处理结果**：如果是查询，可以通过 `ResultSet` 对象获取结果集。
6. **清理环境**：关闭 ResultSet、Statement 以及数据库连接。

### 使用 JDBC 的例子

假设我们有一个名为 `mydb` 的 MySQL 数据库，其中有一个名为 `users` 的表，我们想要查询所有用户的信息。

#### 加载 JDBC 驱动并连接数据库

```java
import java.sql.*;

public class JDBCExample {
    public static void main(String[] args) {
        try {
            // 加载 JDBC 驱动
            Class.forName("com.mysql.jdbc.Driver");
            // 建立与数据库的连接
            Connection conn = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/mydb", "username", "password");
            
            // 创建 Statement 对象
            Statement stmt = conn.createStatement();
            // 执行查询
            ResultSet rs = stmt.executeQuery("SELECT * FROM users");

            // 处理查询结果
            while(rs.next()) {
                // 获取并打印用户信息
                String userId = rs.getString("user_id");
                String userName = rs.getString("user_name");
                System.out.println("ID: " + userId + ", Name: " + userName);
            }
            
            // 清理环境
            rs.close();
            stmt.close();
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

在这个例子中，我们首先加载了 MySQL 的 JDBC 驱动，然后通过 `DriverManager.getConnection()` 方法建立了到数据库的连接。接着，我们创建了一个 `Statement` 对象并执行了一个查询，通过 `ResultSet` 对象获取并打印了查询结果。最后，我们关闭了 `ResultSet`、`Statement` 和数据库连接。

JDBC 为 Java 程序提供了一个强大的数据库操作接口，使得开发者可以方便地实现数据库编程。然而，JDBC 操作通常涉及大量的样板代码，因此在实际开发中，开发者经常使用如 JPA (Java Persistence API)、Hibernate 或 MyBatis 等 ORM (Object-Relational Mapping) 框架来简化数据库操作。

# 5. 详细介绍 java1.1 Collections Framework ，并包含使用例子

虽然 Java 1.1 并没有完整的集合框架，但后续版本基于此概念发展出了强大的集合框架，为操作复杂数据集合提供了支持。

# 详细介绍 java1.1 Collections Framework

Java 1.1 版本并没有完整的 Collections Framework，但是它引入了早期的一些集合类，如 `Vector`、`Stack` 和 `Hashtable` 等。这些类在 `java.util` 包中，为存储和处理对象集合提供了基本的支持。真正的 Collections Framework 是在 Java 1.2 版本中引入的，它提供了一组接口和类，用于代表和操作各种类型的集合。

尽管 Java 1.1 没有完整的 Collections Framework，我们仍可以讨论 Java 1.2 引入的 Collections Framework 的概念，并提供一个使用例子。

### Collections Framework 的主要组件

1. **接口**：如 `List`、`Set`、`Map` 等，定义了集合的行为。
2. **类**：如 `ArrayList`、`LinkedList`、`HashSet`、`HashMap` 等，实现了接口并提供具体的集合实现。
3. **辅助类**：如 `Collections` 和 `Arrays` 类，提供了一系列静态方法来操作或返回集合。

### Collections Framework 的使用步骤

1. **选择接口**：根据需要选择一个集合接口，如 `List`（有序集合）或 `Set`（无序集合）。
2. **选择实现**：选择一个接口的具体实现类，如 `ArrayList` 或 `HashSet`。
3. **创建集合对象**：实例化所选实现类的实例。
4. **操作集合**：使用集合的方法添加、删除或遍历集合中的元素。

### 使用 Collections Framework 的例子

假设我们想要创建一个字符串的集合，并执行一些基本操作。

#### 使用 List 接口和 ArrayList 实现

```java
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class CollectionsExample {
    public static void main(String[] args) {
        // 创建一个 List 接口的实例，使用 ArrayList 作为其实现
        List<String> list = new ArrayList<>();

        // 向 List 添加元素
        list.add("Java");
        list.add("Python");
        list.add("C++");

        // 访问元素
        String firstElement = list.get(0); // 获取第一个元素
        System.out.println("First element: " + firstElement);

        // 遍历 List
        System.out.println("Iterating through list:");
        for (String language : list) {
            System.out.println(language);
        }

        // 使用迭代器遍历 List
        Iterator<String> iterator = list.iterator();
        while (iterator.hasNext()) {
            String language = iterator.next();
            System.out.println(language);
        }

        // 从 List 中删除元素
        list.remove("C++");

        // 检查 List 是否包含某个元素
        boolean containsPython = list.contains("Python");
        System.out.println("Does list contain 'Python'? " + containsPython);
    }
}
```

在这个例子中，我们创建了一个 `ArrayList` 的实例，它是 `List` 接口的一个具体实现。我们向 `ArrayList` 中添加了一些字符串元素，并展示了如何访问、遍历、删除元素以及检查元素是否存在。

# 6. 详细介绍 java1.1 Event Model ，并包含使用例子

Java 1.1 引入了基于接口的事件处理模型，为图形用户界面编程和事件驱动编程提供了基础。

Java 1.1 引入的事件模型是为了支持 GUI（图形用户界面）编程，特别是 AWT（Abstract Window Toolkit）组件的事件处理。事件模型基于观察者设计模式，其中组件（如按钮、文本框等）生成事件，而事件监听器（或称为事件处理器）负责响应这些事件。

### Java 1.1 Event Model 的核心组件：

1. **事件（Event）**：
   - 表示某种用户活动，如点击按钮、输入文本等。
   - 每种事件都有对应的事件类，如 ActionEvent、MouseEvent 等。

2. **事件源（Event Source）**：
   - 生成事件的对象，如按钮或文本框。
   - 通过添加事件监听器来注册对特定事件的兴趣。

3. **事件监听器（Event Listener）**：
   - 实现特定事件处理接口的对象。
   - 通过注册到事件源以接收和处理事件。

### 使用例子：

以下是一个简单的 Java 1.1 AWT 程序，展示如何使用事件模型处理按钮点击事件：

```java
import java.awt.*;
import java.awt.event.*;

public class EventExample {
    private Frame frame;
    private Button button;

    public EventExample() {
        // 创建一个窗口和按钮
        frame = new Frame("Event Example");
        button = new Button("Click Me");

        // 设置按钮的位置和大小
        button.setBounds(100, 100, 80, 30);

        // 添加按钮点击事件的监听器
        button.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // 当按钮被点击时，显示消息框
                showMessage("Button Clicked!");
            }
        });

        // 添加按钮到窗口
        frame.add(button);

        // 设置窗口大小和可见性
        frame.setSize(300, 200);
        frame.setLayout(null); // 使用 null 布局
        frame.setVisible(true);
    }

    // 显示消息框的方法
    private void showMessage(String message) {
        Dialog dialog = new Dialog(frame, "Message", true);
        Label label = new Label(message);
        dialog.add(label);
        dialog.setSize(200, 100);
        dialog.setVisible(true);
    }

    public static void main(String[] args) {
        new EventExample();
    }
}
```

在上述例子中：

- 创建了一个窗口 `Frame` 和一个按钮 `Button`。
- 使用 `addActionListener` 方法为按钮注册一个 `ActionListener`，当按钮被点击时，会调用 `actionPerformed` 方法。
- 在 `actionPerformed` 方法中，调用 `showMessage` 方法显示一个消息框。

这个例子展示了如何使用 Java 1.1 的事件模型来处理按钮点击事件。当用户点击按钮时，会弹出一个消息框显示 "Button Clicked!"。

# 7. 详细介绍 java1.1 Internationalization and Localization ，并包含使用例子

Java 1.1 开始支持国际化和本地化，使得 Java 应用可以适应不同语言和地区的需求。

Java 1.1 引入了国际化（Internationalization，简称 i18n）和本地化（Localization，简称 l10n）的支持，这使得开发者可以轻松地创建支持多种语言和地区的应用程序。国际化主要关注如何设计应用程序以支持多种语言和文化，而本地化则关注如何为特定的语言和地区适配这些应用程序。

### 国际化（Internationalization）：

国际化是一种设计策略，目的是使应用程序能够轻松地适应不同的语言和文化。在 Java 中，国际化通常通过资源束（Resource Bundle）来实现，其中包含了应用程序的文本、图像、格式等资源的不同语言版本。

### 本地化（Localization）：

本地化是适应特定地区或文化的过程，它使用国际化设计的应用程序，为特定的语言和地区提供相应的资源束。

### 使用例子：

以下是一个简单的 Java 1.1 程序，展示如何使用国际化和本地化来支持英文和法文两种语言：

```java
import java.util.*;
import java.awt.*;
import java.awt.event.*;

public class I18nExample {
    private Frame frame;
    private Button button;
    private ResourceBundle bundle;

    public I18nExample() {
        // 加载默认的资源束（英文）
        bundle = ResourceBundle.getBundle("Messages", Locale.getDefault());

        // 创建窗口和按钮
        frame = new Frame(bundle.getString("window.title"));
        button = new Button(bundle.getString("button.label"));

        // 设置按钮的位置和大小
        button.setBounds(100, 100, 80, 30);

        // 添加按钮点击事件的监听器
        button.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // 显示消息
                showMessage(bundle.getString("button.message"));
            }
        });

        // 添加按钮到窗口
        frame.add(button);

        // 设置窗口大小和可见性
        frame.setSize(300, 200);
        frame.setLayout(null);
        frame.setVisible(true);
    }

    // 显示消息的方法
    private void showMessage(String message) {
        Dialog dialog = new Dialog(frame, bundle.getString("dialog.title"), true);
        Label label = new Label(message);
        dialog.add(label);
        dialog.setSize(200, 100);
        dialog.setVisible(true);
    }

    public static void main(String[] args) {
        // 设置默认的语言环境为法语
        Locale.setDefault(Locale.FRENCH);
        new I18nExample();
    }
}
```

在上述例子中：

- 使用 `ResourceBundle.getBundle()` 方法加载资源束，资源束的基名为 "Messages"。
- 使用 `Locale.setDefault()` 方法设置默认的语言环境为法语（Locale.FRENCH）。
- 从资源束中获取窗口标题、按钮标签和对话框标题等文本，并设置到相应的组件中。

为了使上述代码工作，您需要创建两个不同的资源束文件：

- **Messages.properties**（默认的英文资源束）：
  ```
  window.title=I18n Example
  button.label=Click Me
  button.message=Button Clicked!
  dialog.title=Message
  ```

- **Messages_fr.properties**（法语资源束）：
  ```
  window.title=Exemple I18n
  button.label=Cliquez-moi
  button.message=Bouton cliqué!
  dialog.title=Message
  ```

这样，当程序运行时，根据默认的语言环境（在这个例子中是法语），它会加载相应的资源束，并显示相应的文本。

如果您想切换到英文，只需更改 `Locale.setDefault(Locale.FRENCH)` 为 `Locale.setDefault(Locale.ENGLISH)` 即可。

# 8. 详细介绍 java1.1 JavaBeans ，并包含使用例子

JavaBeans 是 Java 1.1 版本引入的一个非常重要的特性，它是一组通过遵循特定编写规则创建的 Java 类，旨在实现组件化编程。

JavaBeans 组件可以被可视化开发工具所识别和操作，从而简化了图形用户界面（GUI）的开发。

### JavaBeans 的主要特点

1. **可序列化**：JavaBeans 必须实现 `java.io.Serializable` 接口，以确保它们可以在不同上下文或跨网络进行传递。

2. **无副作用**：JavaBeans 的 getter 和 setter 方法不应触发除了获取或设置属性值之外的任何其他行为。

3. **可构造性**：JavaBeans 应该有无参数的构造函数，以便于实例化。

4. **属性访问**：JavaBeans 通过标准的命名约定提供属性访问方法，即 `getXxx()`、`setXxx(value)` 用于访问和修改私有属性。

5. **可选的事件处理**：JavaBeans 可以注册事件监听器，响应特定事件。

### 使用 JavaBeans 的例子

假设我们想要创建一个简单的 `Person` JavaBean，它包含 `name` 和 `age` 属性，并且可以响应属性值变化的事件。

#### 定义 JavaBean 类

```java
import java.beans.PropertyChangeListener;
import java.beans.PropertyChangeSupport;

public class Person {
    private String name;
    private int age;
    private final PropertyChangeSupport propertyChangeSupport;

    public Person() {
        propertyChangeSupport = new PropertyChangeSupport(this);
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        String oldName = this.name;
        this.name = name;
        propertyChangeSupport.firePropertyChange("name", oldName, name);
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        int oldAge = this.age;
        this.age = age;
        propertyChangeSupport.firePropertyChange("age", oldAge, age);
    }

    public void addPropertyChangeListener(PropertyChangeListener listener) {
        propertyChangeSupport.addPropertyChangeListener(listener);
    }

    public void removePropertyChangeListener(PropertyChangeListener listener) {
        propertyChangeSupport.removePropertyChangeListener(listener);
    }
}
```

在这个例子中，`Person` 类有 `name` 和 `age` 两个属性，以及相应的 getter 和 setter 方法。每个 setter 方法在设置新值之前都会记录旧值，并在完成后触发一个属性变更事件。`PropertyChangeSupport` 类用于管理事件监听器和事件触发。

#### 使用 JavaBean

```java
import java.beans.PropertyChangeEvent;
import java.beans.PropertyChangeListener;

public class JavaBeanExample {
    public static void main(String[] args) {
        Person person = new Person();
        person.addPropertyChangeListener(new PropertyChangeListener() {
            @Override
            public void propertyChange(PropertyChangeEvent evt) {
                if (evt.getPropertyName().equals("name")) {
                    System.out.println("Name changed to: " + evt.getNewValue());
                } else if (evt.getPropertyName().equals("age")) {
                    System.out.println("Age changed to: " + evt.getNewValue());
                }
            }
        });

        // 修改属性值，触发事件
        person.setName("John Doe");
        person.setAge(30);
    }
}
```

在这个例子中，我们创建了一个 `Person` 对象，并添加了一个 `PropertyChangeListener` 来监听属性变化。当 `setName` 或 `setAge` 方法被调用时，会触发一个属性变更事件，我们的监听器将响应这些事件，并在控制台打印出相应的消息。

JavaBeans 为 Java 程序提供了一种创建和管理组件的标准方式，特别是在 GUI 应用程序中，JavaBeans 使得开发者能够以声明式的方式使用组件，并且可以被各种可视化开发工具所集成和操作。

# 9. 详细介绍 java1.1 Security ，并包含使用例子

Java 1.1 引入了一套完整的安全模型，以确保 Java 应用程序在运行时的安全性。

这个安全模型包括多个方面，如安全管理器（SecurityManager）、权限（Permissions）、策略（Policy）和加密（Cryptography）等。

以下是 Java 1.1 安全模型的一些关键组成部分：

### 安全管理器 (SecurityManager)

安全管理器是 Java 安全架构的核心，它通过监控 Java 应用程序的所有敏感操作来提供安全性。当安装了安全管理器时，所有的安全相关操作都需要得到它的许可。

### 权限 (Permissions)

权限是安全管理器用来确定是否允许执行某个操作的对象。Java 定义了多种权限，如 `FilePermission`、`SocketPermission` 等，每种权限都与特定的安全域相关联。

### 策略 (Policy)

策略是定义哪些主体（通常是用户或代码源）应该被授予哪些权限的规则集合。策略文件通常包含在 Java 安装目录的 `lib/security` 子目录中。

### 加密 (Cryptography)

Java 1.1 提供了一套加密工具，允许开发者实现数据的加密和解密，以保护数据的安全性。

### 使用安全管理器的例子

假设我们想要限制应用程序对文件系统的访问，以防止未授权的文件读写操作。

#### 安装安全管理器

```java
import java.io.File;
import java.security.Permission;

public class SecurityExample {

    public static void main(String[] args) {
        // 安装安全管理器
        System.setSecurityManager(new SecurityManager() {
            @Override
            public void checkPermission(Permission perm) {
                // 检查权限，如果权限不允许，则抛出安全异常
                if (!perm.getName().startsWith("java.io.FilePermission") ||
                    !perm.getActions().contains("read")) {
                    super.checkPermission(perm);
                }
            }
        });

        // 尝试读取一个文件
        File file = new File("example.txt");
        try {
            // 只有当权限允许时，以下代码才能执行
            System.out.println("File content: " + new String(file.getBytes()));
        } catch (SecurityException e) {
            System.out.println("Access to the file is not allowed.");
        }
    }
}
```

在这个例子中，我们创建了一个自定义的安全管理器，并重写了 `checkPermission` 方法来限制对文件的访问。只有当文件权限以 "java.io.FilePermission" 开始，并且包含 "read" 动作时，才允许访问。否则，将抛出 `SecurityException`。

#### 使用加密

Java 1.1 提供了 `java.security` 包，其中包含了加密和哈希相关的类。以下是使用加密的一个简单例子：

```java
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

public class EncryptionExample {

    public static void main(String[] args) throws Exception {
        // 创建密钥生成器
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(128); // 使用128位密钥
        SecretKey secretKey = keyGen.generateKey();

        // 创建密码器
        Cipher cipher = Cipher.getInstance("AES");

        // 加密数据
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);
        String originalText = "Hello, World!";
        byte[] encryptedText = cipher.doFinal(originalText.getBytes());

        // 解密数据
        cipher.init(Cipher.DECRYPT_MODE, secretKey);
        byte[] decryptedText = cipher.doFinal(encryptedText);

        System.out.println("Original Text: " + originalText);
        System.out.println("Encrypted Text: " + new String(encryptedText));
        System.out.println("Decrypted Text: " + new String(decryptedText));
    }
}
```

在这个例子中，我们首先使用 `KeyGenerator` 生成一个密钥，然后使用 `Cipher` 对象对一段文本进行加密和解密。`Cipher` 对象的 `doFinal` 方法用于执行加密和解密操作。

Java 1.1 的安全性机制为 Java 应用程序提供了必要的保护，以防止恶意操作和未授权的访问。随着 Java 的发展，安全性模型也不断得到增强和改进。


# 10. 详细介绍 java1.1 Performance Improvements ，并包含使用例子

Java 1.1 进行了性能上的改进，包括即时编译器的优化，提高了 Java 程序的执行效率。

Java 1.1 版本在性能方面进行了一些改进，尽管它并不是一个重大的性能版本，但确实引入了一些对性能有积极影响的特性。以下是 Java 1.1 中一些可能影响性能的改进点：

1. **即时编译器（JIT Compiler）**：Java 1.1 继续优化了即时编译器，提高了代码执行的效率。即时编译器在运行时将字节码编译为本地机器码，这通常会比直接执行字节码更快。

2. **垃圾收集器（Garbage Collector）**：Java 1.1 对垃圾收集器进行了改进，使其更高效，尤其是在处理大量内存时。

3. **更好的多线程支持**：虽然 Java 1.0 已经引入了多线程，但 Java 1.1 在此基础上进行了改进，提供了更好的多线程性能。

4. **标准化的 API**：Java 1.1 引入了许多标准化的 API，如集合框架和 JDBC，这些 API 被优化以提高性能。

5. **更好的异常处理**：改进的异常处理机制减少了因异常处理不当而造成的性能损失。

### 使用即时编译器的例子

虽然 Java 1.1 的即时编译器改进并不直接体现在代码中，但我们可以通过编写一个简单程序来展示 JIT 编译器的效果。以下是一个计算大质数的示例，它展示了 Java 程序运行时性能的提升。

```java
public class PrimeCalculator {
    public static void main(String[] args) {
        int number = 10000000; // 一个较大的数
        boolean isPrime = isPrime(number);

        System.out.println("The number " + number + " is " +
            (isPrime ? "a prime." : "not a prime."));
    }

    // 一个简单的质数检查方法
    public static boolean isPrime(int n) {
        if (n <= 1) {
            return false;
        }
        for (int i = 2; i <= Math.sqrt(n); i++) {
            if (n % i == 0) {
                return false;
            }
        }
        return true;
    }
}
```

在这个例子中，`isPrime` 方法通过一个循环来检查一个数是否为质数。当程序运行时，JIT 编译器会将热点代码（经常执行的代码）编译为本地机器码，从而提高程序的运行速度。

### 垃圾收集器的改进

垃圾收集器的改进通常不通过特定的示例展示，因为它们的工作是自动的，不需要开发者干预。但是，开发者可以通过选择合适的垃圾收集器和调整 JVM 参数来优化性能。

例如，如果你的应用程序需要更快的响应时间，你可以选择 CMS（Concurrent Mark Sweep）收集器，它通过并发标记和清除来减少停顿时间。

```bash
java -XX:+UseConcMarkSweepGC -jar your-application.jar
```

这条命令指示 JVM 使用 CMS 垃圾收集器来运行你的应用程序。

请注意，虽然 Java 1.1 引入了一些性能改进，但现代 Java 版本（如 Java 8、11 或更高版本）在性能方面有更显著的提升，包括更先进的 JIT 编译器、更高效的垃圾收集器和更优化的并发库。

# 11. 详细介绍 java1.1 Standard Edition (SE), Enterprise Edition (EE), and Micro Edition (ME) ，并包含使用例子

Java SE（Standard Edition）是面向个人计算机和服务器的经典 Java 平台。

它包含了运行 Java 应用程序的核心 API，如集合框架、数据库连接、网络编程等。

**使用例子**：
```java
import java.util.Vector;

public class SimpleJavaApp {
    public static void main(String[] args) {
        Vector<String> names = new Vector<>();
        names.add("Alice");
        names.add("Bob");
        System.out.println("Names: " + names);
    }
}
```
在这个例子中，我们使用了 Java 1.1 引入的 `Vector` 集合类来存储字符串。

### Enterprise Edition (EE)

Java EE（Enterprise Edition）是为大型企业级应用设计的 Java 平台，它包含了 SE 的所有功能，并增加了用于构建和部署多层 Web 应用程序的 API，如 EJB（Enterprise JavaBeans）、Servlets 和 JSP（JavaServer Pages）。

**使用例子**：
Java 1.1 时代并没有直接支持 Java EE 的特性，但是可以想象一个早期的 Servlet 示例（在 Java EE 规范出现之前）：
```java
import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;

public class SimpleServlet extends GenericServlet {
    public void service(ServletRequest request, ServletResponse response)
            throws ServletException, IOException {
        PrintWriter out = response.getWriter();
        response.setContentType("text/html");
        out.println("<html><body>");
        out.println("<h1>This is my simple servlet</h1>");
        out.println("</body></html>");
    }
}
```
这个例子展示了一个简单的 Servlet，它在请求时返回一个 HTML 页面。尽管 Servlet API 在 Java 1.1 之后才成为 Java EE 的一部分，但它可以代表早期企业级 Java Web 应用的形态。

### Micro Edition (ME)

Java ME（Micro Edition）是为嵌入式设备、移动设备和小型设备设计的 Java 平台。它包含了 Java 的核心功能，但去除了不适合资源受限设备的 SE 和 EE 特性。

**使用例子**：
Java 1.1 时代的技术也适用于早期的 Java ME 开发。以下是一个简单的 Java ME 应用程序示例，它在设备上显示一条消息：
```java
import javax.microedition.lcdui.*;
import javax.microedition.midlet.*;

public class SimpleMIDlet extends MIDlet {
    public void startApp() {
        Display display = Display.getDisplay(this);
        Form form = new Form("Simple MIDlet");
        form.append("Hello, Java ME!");
        display.setCurrent(form);
    }

    public void pauseApp() {}
    public void destroyApp(boolean unconditional) {}
}
```
在这个例子中，我们创建了一个 MIDlet，它在移动或嵌入式设备的屏幕上显示一条消息。Java ME 专为资源受限的环境设计，因此它对内存和处理能力的要求比 SE 和 EE 要低得多。

综上所述，虽然 Java 1.1 并没有直接区分 SE、EE 和 ME，但是它的技术是后续版本这三个平台发展的基础。随着 Java 技术的发展，这三个版本各自演化，以满足不同应用场景的需求。



# 总结一下 java1.1 变化



* any list
{:toc}