---
layout: post
title: privilege-12-以角色为基础的访问控制（英语：Role-based access control，RBAC）
date: 2024-08-04 21:01:55 +0800
categories: [Design]
tags: [design, privilege, sh]
published: true
---

# RBAC

以角色为基础的访问控制（英语：Role-based access control，RBAC），是资讯安全领域中，一种较新且广为使用的访问控制机制，其不同于强制访问控制以及自由选定访问控制直接赋予使用者权限，而是将权限赋予角色。

1996年，莱威·桑度（Ravi Sandhu）等人在前人的理论基础上，提出以角色为基础的访问控制模型，故该模型又被称为RBAC96。

之后，美国国家标准局重新定义了以角色为基础的访问控制模型，并将之纳为一种标准，称之为NIST RBAC。

以角色为基础的访问控制模型是一套较强制访问控制以及自由选定访问控制更为中性且更具灵活性的访问控制技术。

# chat

## 详细介绍一下 以角色为基础的访问控制（英语：Role-based access control，RBAC） 是什么？what

角色为基础的访问控制（Role-based Access Control，RBAC）是一种访问控制方法，通过将权限与角色关联，而不是直接与用户关联，从而简化权限管理。

RBAC 是许多企业系统中常用的访问控制模型，特别适用于大规模和复杂的系统。

以下是 RBAC 的详细介绍：

### 核心概念

1. **用户（User）**：系统中的实际操作人员，如员工、客户等。
2. **角色（Role）**：一组权限的集合，通常代表某种职能或职位，如管理员、编辑、查看者等。
3. **权限（Permission）**：对系统资源的访问权利，如读取、写入、删除等操作。
4. **会话（Session）**：用户在某一时间段内激活的一组角色。

### 工作原理

1. **角色分配**：管理员为用户分配一个或多个角色。
2. **权限分配**：每个角色被授予特定的权限，这些权限定义了该角色可以执行的操作。
3. **权限继承**：角色可以继承其他角色的权限，以实现权限的层次化管理。
4. **角色激活**：用户登录后，可以激活其所拥有的角色，从而获得相应的权限。

### 优点

1. **简化管理**：通过角色来管理权限，减少了直接给用户分配权限的复杂度。
2. **安全性增强**：可以通过角色的设计和分配，严格控制对系统资源的访问。
3. **灵活性和可扩展性**：角色和权限的分离使得系统能够灵活地适应组织结构和业务需求的变化。
4. **审计和合规**：容易追踪和管理用户的权限，便于进行安全审计和满足合规要求。

### 实施步骤

1. **角色定义**：根据组织的业务需求，定义各个角色及其职责。
2. **权限分配**：为每个角色分配相应的权限。
3. **用户角色分配**：将用户分配到适当的角色。
4. **角色维护**：根据业务变化和需求，调整角色及其权限。

### 使用场景

1. **企业内部系统**：如ERP、CRM系统，通过RBAC管理员工对系统功能和数据的访问。
2. **云计算平台**：云服务提供商通常使用RBAC来控制用户对资源的访问。
3. **应用程序**：大多数现代应用程序都实现了RBAC来管理用户权限。

### RBAC 的变体

1. **基于属性的访问控制（Attribute-Based Access Control, ABAC）**：不仅考虑角色，还考虑用户的属性、环境条件等。
2. **基于任务的访问控制（Task-Based Access Control, TBAC）**：根据任务和工作流程分配权限。
3. **细粒度RBAC**：通过更精细的角色和权限划分，实现更严格的访问控制。

通过RBAC，可以有效地管理和控制用户对系统资源的访问，确保系统的安全性和合规性。

在实际应用中，RBAC通常结合其他安全措施，如审计日志、双重身份验证等，以进一步增强系统的安全性。

## 优缺点+适合使用的场景？when where who 

### RBAC 的优点

1. **简化管理**：
   - 通过角色分配权限，减少直接给每个用户分配权限的复杂性。
   - 更容易管理大量用户和权限，特别是在大规模企业中。

2. **增强安全性**：
   - 通过角色设计和权限分配，可以严格控制对系统资源的访问。
   - 减少了由于误配置权限带来的安全风险。

3. **灵活性和可扩展性**：
   - 可以根据业务需求灵活定义和调整角色及其权限。
   - 适用于各种规模的组织和不同的业务环境。

4. **便于审计和合规**：
   - 角色和权限的清晰定义使得权限管理和跟踪更加直观。
   - 有助于满足法规和合规要求，如SOX（萨班斯-奥克斯利法案）。

5. **提高生产力**：
   - 用户通过角色获得所需的权限，可以更快地开始工作。
   - 减少了管理员手动分配和调整权限的工作量。

### RBAC 的缺点

1. **角色设计复杂性**：
   - 定义和维护合适的角色和权限可能需要较多时间和精力，特别是在复杂的组织中。
   - 角色的设计不合理可能导致权限过于宽泛或过于细致，从而影响安全性或管理效率。

2. **灵活性不足**：
   - 对于需要动态调整权限的场景，RBAC 可能不够灵活。
   - 在处理临时性和细粒度的权限需求时，RBAC 的灵活性可能不如 ABAC 等其他模型。

3. **继承关系的复杂性**：
   - 角色的继承关系可能会变得复杂，导致难以管理和理解。
   - 需要谨慎设计和管理继承关系，以避免权限冲突或遗漏。

4. **初始实施成本**：
   - 初次实施 RBAC 可能需要较高的时间和资源投入，包括角色定义、权限分配和系统配置。

### 适合使用的场景

1. **大中型企业**：
   - 适用于需要管理大量用户和复杂权限的企业，如跨国公司和大型组织。
   - 在这些场景中，RBAC 可以简化权限管理，提高效率和安全性。

2. **固定权限需求**：
   - 适用于权限需求相对固定、变化不频繁的系统和应用。
   - 如企业内部的ERP、CRM系统，这些系统通常有较稳定的业务流程和权限需求。

3. **合规要求高的行业**：
   - 如金融、医疗和政府机构等，对安全性和合规性有严格要求的行业。
   - RBAC 可以帮助这些行业实现严格的访问控制和审计跟踪，满足法规要求。

4. **云计算平台**：
   - 云服务提供商（如AWS、Azure、GCP）通常使用RBAC来控制用户对资源的访问。
   - RBAC 可以帮助云平台提供细粒度的访问控制，确保资源安全。

5. **协作应用**：
   - 适用于需要多个角色协作的应用，如项目管理工具、内容管理系统等。
   - 通过RBAC，可以为不同角色分配不同的权限，确保协作高效且安全。

通过 RBAC，可以有效地管理和控制用户对系统资源的访问，确保系统的安全性和合规性。

然而，在选择和实施 RBAC 时，需要根据具体的业务需求和场景，合理设计角色和权限，以充分发挥其优势并避免潜在的缺点。


## 实现的话，整体的方案要如何设计？

实现角色为基础的访问控制（RBAC）方案时，整体设计需要考虑系统的需求、角色和权限的管理，以及用户的操作流程。以下是设计和实施 RBAC 的整体方案步骤：

### 1. **需求分析**

- **识别资源**：确定需要保护的资源和操作（如文件、数据库、应用功能）。
- **定义业务流程**：了解系统的业务流程和用户如何与系统交互。
- **确定安全需求**：定义安全要求和合规性标准，如数据保护和访问审计。

### 2. **角色和权限定义**

- **角色定义**：
  - 确定组织中需要的角色，根据业务需求和组织结构设计角色。
  - 每个角色应代表一个特定的职责或职位，如管理员、经理、普通用户等。
- **权限定义**：
  - 列出每个角色所需的操作权限，如读取、写入、删除等。
  - 权限应细化到具体的操作和资源，以确保访问控制的精确性。

### 3. **设计角色层次和权限模型**

- **角色层次结构**：
  - 设计角色的层次结构（如管理员 > 经理 > 员工），以便角色可以继承其他角色的权限。
  - 确保层次结构的设计符合实际业务需求，并避免权限冲突。
- **权限分配**：
  - 将权限分配到角色，而不是直接分配到用户。
  - 确保每个角色拥有执行其职责所需的所有权限。

### 4. **系统实现**

- **用户管理**：
  - 实现用户的注册、身份验证和角色分配功能。
  - 提供用户接口以查看和管理自己的角色和权限。
- **角色管理**：
  - 实现角色的创建、编辑和删除功能。
  - 提供角色的管理界面，以便管理员能够轻松地维护角色和权限。
- **权限管理**：
  - 实现权限的创建、编辑和分配功能。
  - 确保系统能够根据角色的权限控制对资源的访问。

### 5. **权限控制机制**

- **访问控制列表（ACL）**：
  - 实现基于角色的访问控制列表，以定义哪些角色可以访问哪些资源以及可以执行哪些操作。
- **访问决策**：
  - 在用户尝试访问系统资源时，系统应根据用户的角色和权限做出访问决策。
  - 确保访问控制决策的高效性和准确性。

### 6. **审计和监控**

- **审计日志**：
  - 实现访问控制和权限变更的审计日志，以跟踪系统的使用和权限管理活动。
  - 确保审计日志记录详细、可查询，并符合合规要求。
- **监控**：
  - 实时监控用户的访问活动，以检测和响应异常行为。
  - 设置警报和通知机制，以便及时处理潜在的安全问题。

### 7. **测试和验证**

- **功能测试**：
  - 验证系统的角色和权限管理功能是否按预期工作。
  - 测试各种角色和权限组合，以确保访问控制的准确性。
- **安全测试**：
  - 进行安全测试和渗透测试，以识别和修复潜在的安全漏洞。
  - 确保系统能够抵御未经授权的访问和攻击。

### 8. **维护和更新**

- **角色和权限的定期审查**：
  - 定期审查和更新角色和权限，以适应组织的变化和新的业务需求。
  - 及时调整角色和权限，以保持系统的安全性和有效性。
- **用户培训**：
  - 为用户提供关于角色和权限管理的培训，以提高其对系统的理解和使用效率。

### 9. **文档和支持**

- **文档**：
  - 编写详细的文档，包括角色和权限定义、系统实现细节和操作指南。
  - 提供操作手册和用户指南，以帮助管理员和用户理解和使用系统。
- **支持**：
  - 提供技术支持和帮助服务，以解决用户在使用过程中遇到的问题。

通过以上步骤，您可以设计和实现一个有效的 RBAC 方案，以确保系统的安全性、灵活性和易管理性。

在实施过程中，根据实际情况进行调整和优化，以满足组织和业务的特定需求。

## 会设计哪些表？表之间的关系是什么？给出 msyql 的建表语句

在实现角色为基础的访问控制（RBAC）时，通常需要设计几个关键的表来存储用户、角色、权限以及它们之间的关系。以下是一个典型的 RBAC 数据库模型及其 MySQL 建表语句：

### 1. **用户表（Users）**

存储系统中的用户信息。

```sql
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Email VARCHAR(100) UNIQUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. **角色表（Roles）**

定义系统中的角色。

```sql
CREATE TABLE Roles (
    RoleID INT AUTO_INCREMENT PRIMARY KEY,
    RoleName VARCHAR(50) NOT NULL UNIQUE,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. **权限表（Permissions）**

定义系统中的权限。

```sql
CREATE TABLE Permissions (
    PermissionID INT AUTO_INCREMENT PRIMARY KEY,
    PermissionName VARCHAR(50) NOT NULL UNIQUE,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4. **用户角色表（UserRoles）**

存储用户与角色的关联。

```sql
CREATE TABLE UserRoles (
    UserID INT,
    RoleID INT,
    PRIMARY KEY (UserID, RoleID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID) ON DELETE CASCADE
);
```

### 5. **角色权限表（RolePermissions）**

存储角色与权限的关联。

```sql
CREATE TABLE RolePermissions (
    RoleID INT,
    PermissionID INT,
    PRIMARY KEY (RoleID, PermissionID),
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID) ON DELETE CASCADE,
    FOREIGN KEY (PermissionID) REFERENCES Permissions(PermissionID) ON DELETE CASCADE
);
```

### 表之间的关系

1. **Users** 和 **UserRoles**：
   - **Users** 表存储用户信息，**UserRoles** 表用于存储用户与角色的关系。
   - 通过 **UserRoles** 表的 `UserID` 列和 **Users** 表的 `UserID` 列建立外键关系。

2. **Roles** 和 **UserRoles**：
   - **Roles** 表定义了角色，**UserRoles** 表存储角色分配给用户的记录。
   - 通过 **UserRoles** 表的 `RoleID` 列和 **Roles** 表的 `RoleID` 列建立外键关系。

3. **Roles** 和 **RolePermissions**：
   - **Roles** 表定义了角色，**RolePermissions** 表存储角色与权限的关系。
   - 通过 **RolePermissions** 表的 `RoleID` 列和 **Roles** 表的 `RoleID` 列建立外键关系。

4. **Permissions** 和 **RolePermissions**：
   - **Permissions** 表定义了权限，**RolePermissions** 表存储权限分配给角色的记录。
   - 通过 **RolePermissions** 表的 `PermissionID` 列和 **Permissions** 表的 `PermissionID` 列建立外键关系。

### 总结

- **Users** 表用于存储用户的基本信息。
- **Roles** 表用于存储系统中定义的角色。
- **Permissions** 表用于存储系统中定义的权限。
- **UserRoles** 表用于管理用户与角色之间的多对多关系。
- **RolePermissions** 表用于管理角色与权限之间的多对多关系。

这种设计确保了系统能够灵活地管理用户、角色和权限，并且能够根据业务需求进行扩展和调整。

## 具体代码要如何实现？以 java 为例

在 Java 中实现角色为基础的访问控制（RBAC）方案通常涉及到几个方面的工作，包括数据库表设计、实体类创建、数据访问层的实现、以及业务逻辑和服务层的设计。以下是一个基本的实现示例，使用了 Spring Boot 和 JPA（Java Persistence API）来完成这项工作。

### 1. **数据库表设计**

假设我们已经按照之前的 MySQL 表设计创建了数据库表。

### 2. **实体类定义**

使用 JPA 实体类来映射数据库表。

#### `User.java`

```java
import javax.persistence.*;
import java.util.Set;

@Entity
@Table(name = "Users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String passwordHash;

    @Column
    private String email;

    @OneToMany(mappedBy = "user")
    private Set<UserRole> userRoles;

    // Getters and setters
}
```

#### `Role.java`

```java
import javax.persistence.*;
import java.util.Set;

@Entity
@Table(name = "Roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer roleId;

    @Column(nullable = false, unique = true)
    private String roleName;

    @Column
    private String description;

    @OneToMany(mappedBy = "role")
    private Set<UserRole> userRoles;

    @OneToMany(mappedBy = "role")
    private Set<RolePermission> rolePermissions;

    // Getters and setters
}
```

#### `Permission.java`

```java
import javax.persistence.*;
import java.util.Set;

@Entity
@Table(name = "Permissions")
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer permissionId;

    @Column(nullable = false, unique = true)
    private String permissionName;

    @Column
    private String description;

    @OneToMany(mappedBy = "permission")
    private Set<RolePermission> rolePermissions;

    // Getters and setters
}
```

#### `UserRole.java`

```java
import javax.persistence.*;

@Entity
@Table(name = "UserRoles")
public class UserRole {

    @Id
    @ManyToOne
    @JoinColumn(name = "UserID")
    private User user;

    @Id
    @ManyToOne
    @JoinColumn(name = "RoleID")
    private Role role;

    // Getters and setters
}
```

#### `RolePermission.java`

```java
import javax.persistence.*;

@Entity
@Table(name = "RolePermissions")
public class RolePermission {

    @Id
    @ManyToOne
    @JoinColumn(name = "RoleID")
    private Role role;

    @Id
    @ManyToOne
    @JoinColumn(name = "PermissionID")
    private Permission permission;

    // Getters and setters
}
```

### 3. **数据访问层**

使用 Spring Data JPA 提供的 `Repository` 接口来操作数据库。

#### `UserRepository.java`

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {
    User findByUsername(String username);
}
```

#### `RoleRepository.java`

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Integer> {
}
```

#### `PermissionRepository.java`

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository extends JpaRepository<Permission, Integer> {
}
```

#### `UserRoleRepository.java`

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRoleRepository extends JpaRepository<UserRole, Integer> {
}
```

#### `RolePermissionRepository.java`

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Integer> {
}
```

### 4. **服务层**

实现业务逻辑和访问控制的服务。

#### `UserService.java`

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    // Other user-related methods
}
```

#### `RoleService.java`

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    public Role getRoleById(Integer roleId) {
        return roleRepository.findById(roleId).orElse(null);
    }

    public Role saveRole(Role role) {
        return roleRepository.save(role);
    }

    // Other role-related methods
}
```

#### `PermissionService.java`

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PermissionService {

    @Autowired
    private PermissionRepository permissionRepository;

    public Permission getPermissionById(Integer permissionId) {
        return permissionRepository.findById(permissionId).orElse(null);
    }

    public Permission savePermission(Permission permission) {
        return permissionRepository.save(permission);
    }

    // Other permission-related methods
}
```

#### `UserRoleService.java`

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserRoleService {

    @Autowired
    private UserRoleRepository userRoleRepository;

    public UserRole saveUserRole(UserRole userRole) {
        return userRoleRepository.save(userRole);
    }

    // Other user-role related methods
}
```

#### `RolePermissionService.java`

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RolePermissionService {

    @Autowired
    private RolePermissionRepository rolePermissionRepository;

    public RolePermission saveRolePermission(RolePermission rolePermission) {
        return rolePermissionRepository.save(rolePermission);
    }

    // Other role-permission related methods
}
```

### 5. **控制器层**

定义 REST API 或其他接口来操作用户、角色和权限。

#### `UserController.java`

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{username}")
    public User getUserByUsername(@PathVariable String username) {
        return userService.getUserByUsername(username);
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    // Other user-related endpoints
}
```

#### `RoleController.java`

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/roles")
public class RoleController {

    @Autowired
    private RoleService roleService;

    @GetMapping("/{id}")
    public Role getRoleById(@PathVariable Integer id) {
        return roleService.getRoleById(id);
    }

    @PostMapping
    public Role createRole(@RequestBody Role role) {
        return roleService.saveRole(role);
    }

    // Other role-related endpoints
}
```

#### `PermissionController.java`

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/permissions")
public class PermissionController {

    @Autowired
    private PermissionService permissionService;

    @GetMapping("/{id}")
    public Permission getPermissionById(@PathVariable Integer id) {
        return permissionService.getPermissionById(id);
    }

    @PostMapping
    public Permission createPermission(@RequestBody Permission permission) {
        return permissionService.savePermission(permission);
    }

    // Other permission-related endpoints
}
```

### 总结

- **实体类**：定义了数据库表的结构和关系。
- **数据访问层**：使用 Spring Data JPA 的 `Repository` 接口来简化数据库操作。
- **服务层**：包含业务逻辑和对数据访问层的调用。
- **控制器层**：提供 REST API 以供前端或其他系统调用。

这个基本的实现可以根据需要进行扩展和调整。例如，您可以添加更复杂的业务逻辑、权限检查、异常处理等。


# 参考资料

[wiki](https://zh.wikipedia.org/wiki/%E4%BB%A5%E8%A7%92%E8%89%B2%E7%82%BA%E5%9F%BA%E7%A4%8E%E7%9A%84%E5%AD%98%E5%8F%96%E6%8E%A7%E5%88%B6)

[RBAC权限管理](https://blog.csdn.net/PainsOnline/article/details/7183613)

## 成熟框架

[shiro](https://shiro.apache.org/)

[spring-security](https://spring.io/projects/spring-security)

* any list
{:toc}