---
layout: post
title: privilege-17-基于自主访问控制（Discretionary Access Control, DAC）
date: 2024-08-04 21:01:55 +0800
categories: [Design]
tags: [design, privilege, sh]
published: true
---


# chat

## 详细介绍一下 基于自主访问控制（Discretionary Access Control, DAC）

自主访问控制（Discretionary Access Control, DAC）是一种访问控制策略，它允许资源的拥有者（如文件的创建者）控制对这些资源的访问权限。在DAC模型中，资源的拥有者可以定义谁可以访问资源以及访问的方式。DAC的核心思想是“自主性”，即用户可以决定和管理其拥有的资源的访问权限。

### DAC的特点

1. **自主性**：资源的拥有者有权决定谁可以访问其资源，并设置具体的访问权限。这种控制可以包括读、写、执行等权限。

2. **灵活性**：DAC允许资源的拥有者灵活地分配权限，并且可以根据需要随时更改这些权限。这种灵活性适用于需要高度个性化权限设置的环境。

3. **继承性**：在一些DAC实现中，权限可以被继承。例如，子文件可以继承父目录的权限设置。但这种继承关系通常是可配置的，允许资源拥有者进行修改。

### DAC的实施

DAC的实施通常依赖于操作系统或数据库管理系统的权限管理机制。例如：

- **文件系统权限**：在许多操作系统中，文件和目录的权限由文件的拥有者设置。比如在Unix/Linux系统中，文件的拥有者可以使用`chmod`命令设置文件的读、写、执行权限。

- **数据库权限**：在数据库系统中，数据库表的拥有者可以设置不同用户对这些表的访问权限。例如，MySQL和PostgreSQL允许数据库管理员为不同的用户和角色设置各种访问权限。

### DAC的优缺点

**优点**：

- **灵活性**：资源拥有者可以根据实际需要配置和调整权限，适应多变的业务需求。
- **简便性**：在小型系统或单用户系统中，DAC的实施比较简单直接。

**缺点**：

- **安全性问题**：DAC模型可能带来安全隐患，尤其是在大型系统中。由于权限控制依赖于用户的自主设置，用户可能无意中授予不必要的访问权限，导致数据泄露或滥用。
- **复杂性**：在多用户环境中，管理和维护权限可能变得复杂，尤其是当权限需要频繁调整时。

### 与其他访问控制模型的比较

- **强制访问控制（Mandatory Access Control, MAC）**：与DAC不同，MAC是由系统强制实施的，不允许用户自行修改权限。MAC通常用于需要高安全性的环境，比如军事或政府系统。
  
- **基于角色的访问控制（Role-Based Access Control, RBAC）**：RBAC基于用户的角色分配权限，而不是资源拥有者。这种方法适用于大型组织，有助于简化权限管理。

DAC因其灵活性和自主性在许多应用场景中得到广泛使用，但在需要严格安全控制的环境中，可能需要结合其他访问控制策略来增强安全性。

## 优缺点+适合使用的场景？ where who 

### DAC的优缺点及适用场景

#### 优点

1. **灵活性高**：资源拥有者可以根据具体需求设置和调整权限，这使得DAC适用于需要个性化权限管理的环境。

2. **易于实施**：在单用户系统或小型环境中，DAC的实施和管理相对简单直观。用户可以直接管理自己的资源，权限设置直观。

3. **用户控制**：用户对自己创建的资源有完全的控制权，这对于需要自主决定权限的应用场景非常适用。

#### 缺点

1. **安全风险**：由于权限控制依赖于用户的自主设置，可能导致不必要的权限暴露或滥用。用户可能无意中授予其他人访问权限，从而带来安全隐患。

2. **管理复杂性**：在大型环境中，尤其是多用户或多部门的系统中，权限管理可能变得复杂。随着权限设置的增多，管理和审计变得困难。

3. **缺乏强制性**：DAC没有强制实施的访问控制策略，可能不适用于对安全性要求极高的场景。例如，在需要强制实施权限管理的环境中，DAC可能不够严格。

#### 适用场景

1. **个人或小型环境**：DAC适用于个人计算机、小型工作组或小型企业环境，这些场景中，权限管理需求较简单，用户可以直接管理自己的资源。

2. **文件系统管理**：在操作系统中的文件系统（如Unix/Linux系统），DAC能够方便地管理文件和目录的权限，适合大多数文件管理需求。

3. **灵活的业务环境**：需要频繁调整权限或对权限进行个性化配置的业务环境，例如，文件共享和协作平台，DAC可以提供必要的灵活性。

4. **开发和测试环境**：在开发和测试环境中，DAC的灵活性有助于开发人员和测试人员快速调整权限，适应不断变化的需求。

#### 不适用场景

1. **高度安全环境**：在需要严格控制和监控访问权限的环境（如军事或政府机构）中，DAC可能不够安全，强制访问控制（MAC）或基于角色的访问控制（RBAC）可能更合适。

2. **大型企业**：在大型企业或组织中，权限管理需求复杂，DAC的灵活性可能导致管理困难。在这种情况下，RBAC可以提供更好的权限管理结构和简化的权限分配。

总体而言，DAC在灵活性和易用性方面具有优势，但在需要高安全性和复杂权限管理的场景中，可能需要结合其他访问控制机制来增强安全性。

## 实现的话，整体的方案要如何设计？ how

实现自主访问控制（DAC）时，整体方案的设计需要考虑多个方面，以确保系统的灵活性、易用性和安全性。下面是一个典型的DAC实现方案设计的步骤和考虑因素：

### 1. **需求分析**

- **确定资源类型**：明确需要进行权限控制的资源类型，比如文件、数据库记录、应用程序功能等。
- **定义权限级别**：定义资源访问的权限级别，如读取、写入、执行、删除等。
- **用户角色和需求**：了解用户角色及其对资源的访问需求。这有助于确定不同角色的权限配置。

### 2. **系统设计**

- **权限模型**：设计权限模型，包括资源、用户、权限及其关系。例如：
  - **资源**：文件、目录、数据库表、应用程序功能等。
  - **用户**：系统中的各个用户。
  - **权限**：访问控制权限，如读、写、执行等。
  - **关系**：用户与资源之间的权限关系。

- **权限管理**：设计权限管理机制，包括：
  - **权限分配**：定义如何将权限分配给用户，通常由资源的拥有者进行。
  - **权限继承**：确定是否支持权限继承。例如，子目录是否继承父目录的权限。
  - **权限修改**：允许用户或管理员修改权限设置的机制。

### 3. **实现机制**

- **权限存储**：设计权限存储机制，可以使用数据库、配置文件或内存数据结构。确保权限信息的持久化和一致性。
  
- **访问控制逻辑**：实现访问控制逻辑，检查用户对资源的访问请求，并验证其是否具有相应的权限。这通常包括：
  - **权限检查**：在用户尝试访问资源时，检查其是否具有所需权限。
  - **权限验证**：根据权限设置验证用户的请求。

- **用户界面**：设计用户界面，允许资源拥有者管理权限。界面应易于使用，并允许用户轻松地分配、修改和撤销权限。

### 4. **安全和审计**

- **安全性**：确保权限管理系统的安全性，防止未经授权的权限修改或访问。包括：
  - **身份验证**：验证用户身份，确保只有授权用户可以修改权限。
  - **数据加密**：加密存储的权限数据，防止数据泄露。

- **审计和日志**：实现审计和日志记录功能，记录权限变更、访问请求等活动。这有助于：
  - **监控**：监控系统的使用情况和权限变更。
  - **审计**：追踪和审计权限变更历史，确保合规性。

### 5. **测试和部署**

- **测试**：进行全面测试，确保权限管理系统按预期工作，包括：
  - **功能测试**：验证权限分配、修改、撤销等功能是否正常。
  - **安全测试**：检查系统的安全性，确保权限管理不被绕过或攻击。

- **部署**：将系统部署到生产环境中，并进行初始配置。确保系统的稳定性和性能。

### 6. **维护和更新**

- **维护**：定期维护系统，修复漏洞和改进功能。
- **更新**：根据用户反馈和业务需求更新权限模型和管理机制。

### 总结

实现DAC的整体方案设计涉及从需求分析、系统设计、实现机制到安全和审计等多个方面。

确保系统的灵活性和安全性，同时提供直观的用户界面以方便权限管理。

通过全面测试和维护，可以确保DAC系统的有效性和可靠性。

## 给出对应的建表语句，表之间的关系。以 mysql 为例  how

在MySQL中实现自主访问控制（DAC）系统，通常需要设计多个表来管理资源、用户、权限和权限分配。以下是一个基本的建表语句示例以及表之间的关系设计：

### 表设计

1. **用户表 (`users`)**

   存储系统中的用户信息。

   ```sql
   CREATE TABLE users (
       user_id INT AUTO_INCREMENT PRIMARY KEY,
       username VARCHAR(50) NOT NULL UNIQUE,
       password_hash VARCHAR(255) NOT NULL,  -- 存储加密后的密码
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **资源表 (`resources`)**

   存储系统中的资源信息，例如文件、目录、数据库表等。

   ```sql
   CREATE TABLE resources (
       resource_id INT AUTO_INCREMENT PRIMARY KEY,
       resource_name VARCHAR(255) NOT NULL,
       resource_type VARCHAR(50) NOT NULL,  -- 资源类型，如文件、目录、功能等
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. **权限表 (`permissions`)**

   存储所有可用的权限类型，例如读、写、执行等。

   ```sql
   CREATE TABLE permissions (
       permission_id INT AUTO_INCREMENT PRIMARY KEY,
       permission_name VARCHAR(50) NOT NULL UNIQUE
   );
   ```

4. **用户权限表 (`user_permissions`)**

   存储用户对资源的权限分配情况。表中记录了每个用户对每个资源的权限。

   ```sql
   CREATE TABLE user_permissions (
       user_id INT,
       resource_id INT,
       permission_id INT,
       PRIMARY KEY (user_id, resource_id, permission_id),
       FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
       FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE CASCADE,
       FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
   );
   ```

### 表之间的关系

- **`users` 和 `user_permissions`**：一个用户可以对多个资源具有不同的权限。因此，`users` 表和 `user_permissions` 表之间是一对多关系（一个用户对多个资源有权限）。

- **`resources` 和 `user_permissions`**：一个资源可以被多个用户访问，因此，`resources` 表和 `user_permissions` 表之间也是一对多关系（一个资源对多个用户开放权限）。

- **`permissions` 和 `user_permissions`**：每个权限类型可以分配给多个用户和资源，因此，`permissions` 表和 `user_permissions` 表之间是一对多关系（一个权限类型被多个用户和资源使用）。

### 示例数据插入

下面是一些示例数据插入语句，展示如何填充这些表：

```sql
-- 插入用户
INSERT INTO users (username, password_hash) VALUES ('alice', 'hashed_password_1');
INSERT INTO users (username, password_hash) VALUES ('bob', 'hashed_password_2');

-- 插入资源
INSERT INTO resources (resource_name, resource_type) VALUES ('file1.txt', 'file');
INSERT INTO resources (resource_name, resource_type) VALUES ('report.pdf', 'file');

-- 插入权限
INSERT INTO permissions (permission_name) VALUES ('read');
INSERT INTO permissions (permission_name) VALUES ('write');

-- 分配权限给用户
INSERT INTO user_permissions (user_id, resource_id, permission_id) VALUES (1, 1, 1); -- Alice can read file1.txt
INSERT INTO user_permissions (user_id, resource_id, permission_id) VALUES (2, 2, 2); -- Bob can write report.pdf
```

### 总结

这些表和关系设计可以帮助实现一个基本的DAC系统。在实际应用中，可能需要根据具体需求对表结构和字段进行调整，并考虑额外的功能，如权限继承、权限组等。

## 具体代码如何实现？ 以 java 为例   how

在Java中实现自主访问控制（DAC）系统，你可以使用JDBC（Java Database Connectivity）来与MySQL数据库进行交互。以下是一个基本的Java代码示例，展示如何连接到MySQL数据库、执行SQL语句并管理DAC相关的数据。

### 1. **数据库连接**

首先，需要添加MySQL JDBC驱动到你的项目中。假设你使用的是Maven构建工具，可以在`pom.xml`中添加以下依赖：

```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
</dependency>
```

然后，可以使用以下代码进行数据库连接：

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {
    private static final String URL = "jdbc:mysql://localhost:3306/your_database";
    private static final String USER = "your_username";
    private static final String PASSWORD = "your_password";

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
```

### 2. **实现基本的DAC操作**

#### 插入用户

```java
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class UserDAO {

    public void addUser(String username, String passwordHash) {
        String sql = "INSERT INTO users (username, password_hash) VALUES (?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, username);
            pstmt.setString(2, passwordHash);
            pstmt.executeUpdate();
            
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

#### 插入资源

```java
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class ResourceDAO {

    public void addResource(String resourceName, String resourceType) {
        String sql = "INSERT INTO resources (resource_name, resource_type) VALUES (?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, resourceName);
            pstmt.setString(2, resourceType);
            pstmt.executeUpdate();
            
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

#### 插入权限

```java
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class PermissionDAO {

    public void addPermission(String permissionName) {
        String sql = "INSERT INTO permissions (permission_name) VALUES (?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setString(1, permissionName);
            pstmt.executeUpdate();
            
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

#### 分配用户权限

```java
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class UserPermissionDAO {

    public void assignPermission(int userId, int resourceId, int permissionId) {
        String sql = "INSERT INTO user_permissions (user_id, resource_id, permission_id) VALUES (?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, userId);
            pstmt.setInt(2, resourceId);
            pstmt.setInt(3, permissionId);
            pstmt.executeUpdate();
            
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

#### 检查用户权限

```java
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class PermissionCheckDAO {

    public boolean hasPermission(int userId, int resourceId, String permissionName) {
        String sql = "SELECT 1 FROM user_permissions up " +
                     "JOIN permissions p ON up.permission_id = p.permission_id " +
                     "WHERE up.user_id = ? AND up.resource_id = ? AND p.permission_name = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            
            pstmt.setInt(1, userId);
            pstmt.setInt(2, resourceId);
            pstmt.setString(3, permissionName);

            try (ResultSet rs = pstmt.executeQuery()) {
                return rs.next();
            }
            
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
```

### 3. **使用示例**

```java
public class Main {
    public static void main(String[] args) {
        UserDAO userDAO = new UserDAO();
        ResourceDAO resourceDAO = new ResourceDAO();
        PermissionDAO permissionDAO = new PermissionDAO();
        UserPermissionDAO userPermissionDAO = new UserPermissionDAO();
        PermissionCheckDAO permissionCheckDAO = new PermissionCheckDAO();

        // 添加用户
        userDAO.addUser("alice", "hashed_password_1");
        userDAO.addUser("bob", "hashed_password_2");

        // 添加资源
        resourceDAO.addResource("file1.txt", "file");
        resourceDAO.addResource("report.pdf", "file");

        // 添加权限
        permissionDAO.addPermission("read");
        permissionDAO.addPermission("write");

        // 分配权限
        userPermissionDAO.assignPermission(1, 1, 1); // Alice can read file1.txt
        userPermissionDAO.assignPermission(2, 2, 2); // Bob can write report.pdf

        // 检查权限
        boolean canRead = permissionCheckDAO.hasPermission(1, 1, "read");
        System.out.println("Alice can read file1.txt: " + canRead);

        boolean canWrite = permissionCheckDAO.hasPermission(2, 2, "write");
        System.out.println("Bob can write report.pdf: " + canWrite);
    }
}
```

### 总结

上述代码展示了如何使用Java和JDBC进行基本的DAC操作，包括创建用户、资源、权限，并分配和检查权限。

根据实际需求，你可以扩展这些类和方法，增加更多的功能和复杂性。

## 简单总结一下基于强制访问控制（Mandatory Access Control, MAC）

**强制访问控制（Mandatory Access Control, MAC）**是一种访问控制模型，强调由系统强制实施的权限控制。与自主访问控制（DAC）不同，MAC不允许用户自行设置或更改权限。以下是MAC的简要总结：

### 核心概念

1. **系统强制性**：权限控制由系统根据预设的策略强制实施，用户无法自行修改。这确保了权限的一致性和系统的整体安全性。

2. **标签和分类**：MAC常用标签和分类机制来管理访问权限。资源和用户都被赋予安全标签，系统根据这些标签决定访问权限。标签通常包括安全级别和类别，如机密、秘密、公开等。

3. **策略驱动**：访问控制策略由系统管理员或安全策略制定者定义，确保所有用户和资源遵守一致的安全规则。常见的策略包括强制访问控制（如Bell-LaPadula模型和Biba模型）和基于标签的访问控制（如中国墙模型）。

### 特点

- **严格控制**：MAC提供更严格的访问控制，减少了由于用户错误或恶意行为导致的安全问题。
- **一致性**：系统通过统一的策略进行权限管理，确保所有用户和资源按照既定的安全规则进行访问。
- **复杂性**：由于其强制性和系统级管理，MAC在设计和实现上可能比DAC更复杂，配置和管理也更为复杂。

### 适用场景

- **高安全需求环境**：如军事、政府机构、金融机构等，需要严格保护敏感信息和资源。
- **需要遵循严格合规性要求的系统**：如健康信息系统、重要基础设施等，符合严格的法规和标准。

### 示例

- **Bell-LaPadula模型**：侧重于保护信息的机密性，遵循“没有读取上级（no read up）”和“没有写入下级（no write down）”规则。
- **Biba模型**：侧重于信息的完整性，遵循“没有读取下级（no read down）”和“没有写入上级（no write up）”规则。
- **中国墙模型**：旨在防止利益冲突，通过对用户和资源进行分类，确保用户不能同时访问可能导致利益冲突的资源。

### 总结

强制访问控制（MAC）通过系统强制实施的安全策略和标签机制，提供了更高的安全性和一致性，适用于高安全需求和严格合规性要求的环境。

虽然MAC可能在实施和管理上更复杂，但其严格的控制机制对于保护敏感信息和资源至关重要。

* any list
{:toc}