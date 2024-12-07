---
layout: post
title: LDAP 登录方式简介
date: 2021-08-02 21:01:55 +0800
categories: [System-Design]
tags: [System-Design, login, sh]
published: true
---

# 什么是LDAP？

（一）在介绍什么是LDAP之前，我们先来复习一个东西：“什么是目录服务？”

1. 目录服务是一个特殊的数据库，用来保存描述性的、基于属性的详细信息，支持过滤功能。

2. 是动态的，灵活的，易扩展的。

如：人员组织管理，电话簿，地址簿。

（二）了解完目录服务后，我们再来看看LDAP的介绍：

LDAP（Light Directory Access Portocol），它是基于X.500标准的轻量级目录访问协议。

目录是一个为查询、浏览和搜索而优化的数据库，它成树状结构组织数据，类似文件目录一样。

目录数据库和关系数据库不同，它有优异的读性能，但写性能差，并且没有事务处理、回滚等复杂功能，不适于存储修改频繁的数据。所以目录天生是用来查询的，就好象它的名字一样。

LDAP目录服务是由目录数据库和一套访问协议组成的系统。

（三）为什么要使用

LDAP是开放的Internet标准，支持跨平台的Internet协议，在业界中得到广泛认可的，并且市场上或者开源社区上的大多产品都加入了对LDAP的支持，因此对于这类系统，不需单独定制，只需要通过LDAP做简单的配置就可以与服务器做认证交互。“简单粗暴”，可以大大降低重复开发和对接的成本。

我们拿开源系统（YAPI）做案例，只需做一下简单的几步配置就可以达到LDAP的单点登录认证了：

```json
{
"ldapLogin": {
      "enable": true,
      "server": "ldap://l-ldapt1.ops.dev.cn0.qunar.com",
      "baseDn": "CN=Admin,CN=Users,DC=test,DC=com",
      "bindPassword": "password123",
      "searchDn": "OU=UserContainer,DC=test,DC=com",
      "searchStandard": "mail"
   }
}
```

## 应用场景

LDAP 的主要应用场景

1.网络服务：DNS服务

2.统一认证服务：

3.Linux PAM (ssh, login, cvs. . . )

4.Apache访问控制

5.各种服务登录(ftpd, php based, perl based, python based. . . )

6.个人信息类，如地址簿

7.服务器信息，如帐号管理、邮件服务等

![应用场景](https://pic3.zhimg.com/80/v2-c0534510766d7346dd3dda48ed8284fa_1440w.jpg)

作为一般的公司来说，LDAP 很多时候被用来权限认证，软件和内部系统的用户管理和认证。

设想下，你有一个软件公司，公司里面有超过上千的员工，你们公司可能会用到各种软件，比如说 JIRA，Wiki，代码库，考勤系统等等。

LDAP 就充当了授权的这个角色，你可用在 LDAP 中对用户进行授权，分组，这样你的用户就会具有不通过软件平台的访问权限了。

现在公司的流动性也非常强，每天都会有入职的也会有离职的，对每一个人都要进行授权，撤销权限，跨域管理等等与用户有关的操作，在大一点的公司这个简直就是灾难。

LDAP 能够很好的解决这个问题。


## LDAP的主要产品
   
细心的朋友应该会主要到，LDAP的中文全称是：轻量级目录访问协议，说到底LDAP仅仅是一个访问协议，那么我们的数据究竟存储在哪里呢？
   
来，我们一起看下下面的表格：

| 厂商 | 产品 | 介绍 |
|:---|:---|:---|
| SUN | SUNONE Directory Server | 基于文本数据库的存储，速度快 |
| IBM | IBM Directory Server | 基于DB2 的的数据库，速度一般。 |
| Novell | Novell Directory Server | 基于文本数据库的存储，速度快, 不常用到。 |
| Microsoft | Microsoft Active Directory | 基于WINDOWS系统用户，对大数据量处理速度一般，但维护容易，生态圈大，管理相对简单。 |
| Opensource | Opensource | OpenLDAP 开源的项目，速度很快，但是非主 流应用。 |

# LDAP的基本模型
  
每一个系统、协议都会有属于自己的模型，LDAP也不例外，在了解LDAP的基本模型之前我们需要先了解几个LDAP的目录树概念：
 
 （一）目录树概念
  
1. 目录树：在一个目录服务系统中，整个目录信息集可以表示为一个目录信息树，树中的每个节点是一个条目。
  
2. 条目：每个条目就是一条记录，每个条目有自己的唯一可区别的名称（DN）。
  
3. 对象类：与某个实体类型对应的一组属性，对象类是可以继承的，这样父类的必须属性也会被继承下来。
  
4. 属性：描述条目的某个方面的信息，一个属性由一个属性类型和一个或多个属性值组成，属性有必须属性和非必须属性。
  
（二）DC、UID、OU、CN、SN、DN、RDN

| 关键字 | 英文全称 | 含义 |
|:---|:---|:---|
| dc | Domain Component | 域名的部分，其格式是将完整的域名分成几部分，如域名为example.com变成dc=example,dc=com（一条记录的所属位置） |
| uid | User Id |	用户ID songtao.xu（一条记录的ID） |
| ou | Organization Unit | 组织单位，组织单位可以包含其他各种对象（包括其他组织单元），如“oa组”（一条记录的所属组织） |
| cn | Common Name | 公共名称，如“Thomas Johansson”（一条记录的名称） |
| sn | Surname | 姓，如“许” |
| dn | Distinguished Name | “uid=songtao.xu,ou=oa组,dc=example,dc=com”，一条记录的位置（唯一） |
| rdn | Relative dn | 相对辨别名，类似于文件系统中的相对路径，它是与目录树结构无关的部分，如“uid=tom”或“cn= Thomas Johansson” |

# LDAP java 实现

java 的实现也比较简单，比如验证登录。

```java
public void login(String username, String password) {
    log.info("开始执行 {} 登录", username);

    try {
        Hashtable env = new Hashtable();
        String ldapUrl = "ldap://xxx.xxx.xx.xx:xxx";
        env.put(Context.INITIAL_CONTEXT_FACTORY,"com.sun.jndi.ldap.LdapCtxFactory");
        env.put(Context.PROVIDER_URL, ldapUrl);
        env.put(Context.SECURITY_AUTHENTICATION, "simple");
        env.put(Context.SECURITY_PRINCIPAL, username);
        env.put(Context.SECURITY_CREDENTIALS, password);

        // 初始化上下文（拥有验证功能）
        InitialDirContext dc = new InitialDirContext(env);
        log.info("登陆成功 {}", username);
    } catch (javax.naming.AuthenticationException e) {
        log.error("{} 登录验证失败", username);
    } catch (Exception e) {
        log.error("{} 登录验证异常", username);
    }
}
```

## 查询功能

```java
public String JNDILookup() {
    // 连接LDAP库
    Hashtable env = new Hashtable<>();
    String url = "ldap://xx.xx.xx.xx:389/";
    String searchBase = "OU=xx,DC=xx,DC=xx,DC=com,DC=cn";
    String user = "xxx";
    String password = "xxx";
    env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory"); //LDAP工厂
    env.put(Context.SECURITY_AUTHENTICATION, "simple"); //LDAP访问安全级别
    env.put(Context.PROVIDER_URL, url);
    env.put(Context.SECURITY_PRINCIPAL, user);
    env.put(Context.SECURITY_CREDENTIALS, password);
    env.put("java.naming.ldap.attributes.binary", "objectSid objectGUID");
    LdapContext ctx = null;
    try {
      ctx = new InitialLdapContext(env, null);

      // 根据条件查询
      String cn = "xxx";
      String filter = "(&(objectClass=top)(objectClass=organizationalPerson)(cn=" + cn + "))";
      //String filter = "(&(objectClass=top)(objectClass=organizationalPerson))";
      SearchControls searchControls = new SearchControls();
      String[] attrNames = {"cn", "mail"};
      searchControls.setSearchScope(SearchControls.SUBTREE_SCOPE);
      //设置将被返回的Attribute
      searchControls.setReturningAttributes(attrNames);
      NamingEnumeration<SearchResult> search = ldapCtx.search(searchBase, filter.toString(), searchControls);
      while (search.hasMore()) {
        SearchResult result = search.next();
        NamingEnumeration<? extends Attribute> attrs = result.getAttributes().getAll();
        while (attrs.hasMore()) {
          Attribute attr = attrs.next();
          System.out.println(attr.getID() + "=====" + attr.get());
        }
        System.out.println("===========");
      }
    } catch (NamingException e) {
      e.printStackTrace();
    } finally {
      if (ctx != null) {
        try {
          ctx.close();
        } catch (NamingException e) {
        }
      }

    }
    return "返回信息";
  }
```

## LdapQueryBuilder类封装使用

Spring Data 提供了基于 LDAP 协议访问的 API，需要注意的是，在开发的时候需要将 LDAP 认为是一个数据库，只是与普通数据库不同的是，LDAP 使用的是 LDAP 的协议。

否则，在用户分组查询，等基于 Spring Data LDAP 的编程过程中，你可能会感到非常困惑。

在application.yml中写入LDAP相关的配置信息，通过@Value注解赋值

```java
@Configuration
public class LdapConfig {

  @Autowired
  private GlobalSettings globalSettings;

  @Bean
  @Primary
  public LdapContextSource ldapContextSource() {
    LdapContextSource ldapContextSource = new LdapContextSource();
    ldapContextSource.setUrl(globalSettings.getLdapUrl());
    ldapContextSource.setBase(globalSettings.getLdapBase());
    ldapContextSource.setUserDn(globalSettings.getLdapUser());
    ldapContextSource.setPassword(globalSettings.getLdapPass());
    return ldapContextSource;
  }

  @Bean
  @Primary
  // LdapTemplate：连接LDAP库
  public LdapTemplate ldapTemplate() {
    LdapTemplate ldapTemplate = new LdapTemplate();
    ldapTemplate.setContextSource(ldapContextSource());
    return ldapTemplate;
  }
}
```

通过浏览器输入ldap中某一个用户的登录信息后获取其他信息，首先注入ldapTemplate

```java
public HashMap<Object, Object> login(String userid, String password) {
    HashMap<Object, Object> hashMap = new HashMap<>();
    try {
      // 查询的用户条件
      ContainerCriteria containerCriteria = LdapQueryBuilder.query()
              .base(LdapUtils.emptyLdapName())
              .where("objectClass").is("person")
              .and("sAMAccountName").is(userid);
      LdapName ldapName = ldapTemplate.authenticate(containerCriteria, password, (ctx, ldapEntryIdentification) -> ldapEntryIdentification.getRelativeName());
      // 查询ldap中字段
      final String[] ATTRS = {"sAMAccountName", "mail", "name"};
      User lookupedUser = ldapTemplate.lookup(ldapName, ATTRS, new AbstractContextMapper<User>() {
        @Override
        protected User doMapFromContext(DirContextOperations ctx) {
          User user = new User();
          user.setUsername(ctx.getStringAttribute(ATTRS[0]));
          user.setEmail(ctx.getStringAttribute(ATTRS[1]));
          user.setName(ctx.getStringAttribute(ATTRS[2]));
          return user;
        }
      });
      hashMap.put("isSuccess",true);
      hashMap.put("info",lookupedUser.toString());
      return  hashMap;
    } 
}
```

# openldp

https://www.openldap.org/



# chat

## 如何联动？

将用户的账户维护与 **LDAP（轻量目录访问协议，Lightweight Directory Access Protocol）** 集成，可以实现用户信息的集中管理、身份验证、用户同步等功能。LDAP 是一种广泛使用的目录服务协议，用于组织和管理企业中的用户、组及资源信息。

要将用户账户维护与 LDAP 打通，以下是常见的实现步骤：

### 1. **理解 LDAP 的工作原理**
   LDAP 是一个基于目录服务的协议，通常用于存储用户信息、组织结构、权限等。LDAP 目录可以存储用户数据（如用户名、密码、邮箱、电话等），并提供快速的搜索与认证功能。

   LDAP 目录通常具有以下几个组成部分：
   - **条目（Entries）**：每个用户、组或其他对象是一个 LDAP 条目。
   - **属性（Attributes）**：每个条目具有多个属性，例如 `uid`（用户名）、`cn`（常用名称）、`mail`（电子邮件）等。
   - **DN（Distinguished Name）**：条目的唯一标识符，类似于文件系统中的路径。

   示例 LDAP 路径（DN）：
   ```
   uid=john.doe,ou=users,dc=example,dc=com
   ```

### 2. **LDAP 账户与本地账户的映射**
   你需要设计一个机制，来同步和管理 **本地数据库** 中的用户账户与 LDAP 中的账户。

   例如：
   - 在本地数据库（如 MySQL）中存储用户信息。
   - 在 LDAP 中存储用户的认证信息和其他用户数据。

   **账户同步：**
   - 用户在 **SSO 系统** 中注册时，可以将信息同步到 LDAP。
   - 用户登录时，系统可以查询 LDAP 来验证用户身份。
   - 如果系统中的用户信息发生变化，可以将变更同步到 LDAP。

### 3. **LDAP 身份验证**
   通过 **LDAP 进行身份验证**，用户登录时，SSO 系统可以向 LDAP 服务器发送验证请求，确认用户名和密码是否正确。

   LDAP 身份验证的基本流程：
   1. 用户输入用户名和密码。
   2. 系统将用户名转换为 LDAP 查询的 DN（例如 `uid=john.doe,ou=users,dc=example,dc=com`）。
   3. 系统将用户名和密码发送到 LDAP 服务器进行验证。
   4. 如果密码验证成功，则用户可以登录。
   
   在此过程中，你可以通过 **LDAP 客户端库** 来与 LDAP 服务器通信。常见的 LDAP 客户端库有：
   - Java: **JNDI** (Java Naming and Directory Interface)
   - Python: **ldap3** 或 **python-ldap**
   - Node.js: **ldapjs**

### 4. **集成步骤**

#### 4.1 配置 LDAP 服务器
   需要设置好 LDAP 服务器，配置用户数据存储的位置、结构以及可访问的权限。常见的 LDAP 服务器有：
   - **OpenLDAP**
   - **Microsoft Active Directory**
   - **FreeIPA**

   确保配置好适当的组织单位（OU）和属性，如 `uid`, `cn`, `mail`, `userPassword` 等。

#### 4.2 用户身份验证
   在用户登录时，系统会向 LDAP 服务器发送认证请求，检查用户的凭据。身份验证可以通过如下方式实现：

   - **绑定 (Bind)**：使用特定用户的 DN 和密码进行绑定，以验证用户身份。
   - **认证请求**：客户端（如 Web 应用）向 LDAP 服务器发送认证请求，LDAP 服务器进行匹配和验证。

   示例的绑定过程：
   - 用户输入用户名 `john.doe` 和密码 `password123`。
   - 系统将 `john.doe` 转换为 DN，如 `uid=john.doe,ou=users,dc=example,dc=com`。
   - 系统将 DN 和密码一起发送到 LDAP 服务器进行验证。

   如果验证成功，则允许用户登录。

#### 4.3 用户信息同步
   系统需要实现本地用户数据和 LDAP 用户数据的同步。通常，有两种方式：
   - **单向同步**：只从 LDAP 获取用户信息，不将本地用户数据同步到 LDAP。
   - **双向同步**：双向同步本地数据库与 LDAP 数据。当用户在 LDAP 或本地系统中更新信息时，系统会将更新同步到另一个系统。

   同步操作可以通过定时任务、事件触发器等方式进行。

   **同步的字段可以包括**：
   - 用户名（`uid`）
   - 姓名（`cn`）
   - 电子邮件（`mail`）
   - 电话号码（`telephoneNumber`）
   - 组信息（`memberOf`）

#### 4.4 安全性与加密
   确保 LDAP 与 SSO 系统之间的通信是安全的，通常使用以下方式：
   - **LDAPS**（LDAP over SSL/TLS）：加密的 LDAP 连接，防止密码和敏感信息在传输过程中被截取。
   - **STARTTLS**：在非加密的 LDAP 连接上启动 TLS 加密。
   - **加密密码**：使用安全的密码存储方案（如哈希和盐值）来存储密码。

#### 4.5 失败重试与错误处理
   在与 LDAP 交互时，需要处理常见的错误和重试机制：
   - **LDAP 认证失败**：用户输入错误的用户名或密码。
   - **LDAP 服务不可用**：LDAP 服务器故障或网络中断。
   - **身份验证超时**：超时设置。

#### 4.6 日志与审计
   记录 LDAP 身份验证请求和结果，以便进行审计和问题排查。通常包括：
   - 认证失败的用户。
   - LDAP 服务的连接和通信日志。
   - 用户信息同步的日志。

### 5. **示例：Java 实现 LDAP 身份验证**
假设您在使用 Java，以下是使用 **JNDI** 来验证用户的简单示例代码：

```java
import javax.naming.*;
import javax.naming.directory.*;
import java.util.Hashtable;

public class LDAPAuth {
    public boolean authenticate(String username, String password) {
        String ldapUrl = "ldap://localhost:389";  // LDAP 服务器地址
        String baseDn = "ou=users,dc=example,dc=com";  // 基本 DN
        String usernameDn = "uid=" + username + "," + baseDn;  // 完整的 DN

        Hashtable<String, String> env = new Hashtable<>();
        env.put(Context.INITIAL_CONTEXT_FACTORY, "com.sun.jndi.ldap.LdapCtxFactory");
        env.put(Context.PROVIDER_URL, ldapUrl);
        env.put(Context.SECURITY_PRINCIPAL, usernameDn);  // 用户 DN
        env.put(Context.SECURITY_CREDENTIALS, password);  // 用户密码
        env.put(Context.SECURITY_AUTHENTICATION, "simple");  // 认证方式

        try {
            // 连接到 LDAP 服务器
            DirContext ctx = new InitialDirContext(env);
            // 如果连接成功，返回 true，表示认证通过
            return true;
        } catch (AuthenticationException e) {
            // 认证失败
            return false;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
```

### 总结：
将 **SSO 系统** 与 **LDAP** 打通，主要包括以下关键步骤：
1. **配置和连接** LDAP 服务器。
2. **使用 LDAP 进行用户身份验证**，通过用户名和密码向 LDAP 服务器发起验证请求。
3. **同步用户信息**（如用户名、电子邮件、电话等），确保本地系统与 LDAP 中的数据一致。
4. 通过 **加密** 和 **安全协议** 确保数据传输的安全性。
5. **日志记录和错误处理**，确保系统的稳定性和可审计性。

这种集成方式可以帮助企业实现更安全、更集中化的用户管理。

## 一般公司 LADP 用的都是什么服务？

在企业环境中，常用的 **LDAP 服务** 主要有以下几种：

### 1. **Microsoft Active Directory (AD)**
   - **简介**：Microsoft 的 Active Directory 是最常见的企业目录服务，广泛应用于 Windows 网络环境中。它不仅提供 LDAP 服务，还支持 Kerberos 身份验证、组策略管理等。
   - **用途**：用于身份验证、用户和计算机管理、访问控制等，通常结合其他 Microsoft 服务（如 Exchange 和 SharePoint）使用。
   - **特点**：
     - 集成 Windows 环境。
     - 提供丰富的身份管理和授权控制。
     - 支持群组管理、组织单位（OU）等。
   - **协议**：支持 LDAP、Kerberos、DNS 和其他协议。

### 2. **OpenLDAP**
   - **简介**：OpenLDAP 是一个开源的 LDAP 服务器软件，提供了灵活的 LDAP 服务，适用于需要自定义 LDAP 目录服务的企业或组织。
   - **用途**：用于存储用户、设备和其他资源的信息，广泛用于跨平台环境中。
   - **特点**：
     - 开源免费，支持 Linux、Unix 和 Windows 等平台。
     - 高度可定制，支持多种扩展。
     - 常用于中小型企业或者没有 Microsoft 环境的公司。
   - **协议**：纯 LDAP 协议，支持 SSL/TLS。

### 3. **FreeIPA**
   - **简介**：FreeIPA 是一个基于 Linux 的集成身份管理系统，类似于 Active Directory，但通常用于 Linux 和 Unix 环境。它提供了 LDAP 服务、Kerberos 认证、DNS、NTP 等服务。
   - **用途**：广泛用于 Linux 服务器环境，尤其是在没有 Microsoft Active Directory 的场景下。
   - **特点**：
     - 集成 Kerberos、DNS 和 LDAP，提供全面的身份和访问管理。
     - 面向 Linux 环境，适合管理大规模 Linux 系统。
     - 支持多种认证方法，包括基于证书的认证。
   - **协议**：支持 LDAP 和 Kerberos。

### 4. **Red Hat Directory Server**
   - **简介**：这是 Red Hat 提供的企业级 LDAP 服务器，基于 389 Directory Server，支持大规模的目录服务。
   - **用途**：适用于需要高可用性和高性能的企业环境，通常用于身份管理和访问控制。
   - **特点**：
     - 商业支持，适合企业级应用。
     - 支持灵活的扩展、备份和恢复。
     - 高性能，支持大规模部署。
   - **协议**：支持 LDAP 和 LDAPS。

### 5. **389 Directory Server**
   - **简介**：389 Directory Server 是一个开源的 LDAP 服务器，曾由 Red Hat 开发并维护，后来转为社区支持。
   - **用途**：提供目录服务、用户身份管理和访问控制，广泛用于 Linux 和 Unix 系统。
   - **特点**：
     - 高度可扩展，适合大规模部署。
     - 提供高效的索引和搜索功能。
     - 支持多种认证协议。
   - **协议**：支持 LDAP 和 LDAPS。

### 6. **Apache Directory Server**
   - **简介**：Apache Directory Server 是一个开源的 LDAP 服务器，基于 Java 实现，提供目录服务和其他功能。
   - **用途**：可以用于身份验证、地址簿服务、权限管理等，特别适用于 Java 环境中的应用。
   - **特点**：
     - 开源且轻量，适合中小型企业。
     - 支持 LDAP 和 Kerberos。
     - 提供对 Java 的原生支持。
   - **协议**：支持 LDAP 和 LDAPS。

### 7. **Oracle Internet Directory (OID)**
   - **简介**：Oracle Internet Directory 是 Oracle 提供的企业级目录服务，通常用于身份管理和访问控制。
   - **用途**：主要用于与 Oracle 系列产品集成，提供 LDAP 目录服务。
   - **特点**：
     - 高可用性、可扩展性强。
     - 深度集成到 Oracle 的其他产品中。
     - 提供企业级的身份和访问管理功能。
   - **协议**：支持 LDAP 和 LDAPS。

### 总结
- **Active Directory** 是最常见的企业目录服务，尤其适用于 Windows 环境。
- **OpenLDAP** 和 **FreeIPA** 是广泛使用的开源目录服务，分别适用于 Linux 和跨平台环境。
- **389 Directory Server** 和 **Red Hat Directory Server** 提供高可用性和大规模部署支持。
- **Apache Directory Server** 是轻量级的开源 LDAP 服务，适用于小型环境。
- **Oracle Internet Directory** 是针对 Oracle 系列产品的 LDAP 服务。

这些服务能够为企业提供高度可扩展、灵活且安全的身份验证和目录管理解决方案。选择哪种服务通常取决于公司使用的技术栈、所需的规模以及预算。



# 参考资料

[LDAP概念和原理介绍](https://www.cnblogs.com/wilburxu/p/9174353.html)

[LDAP入门使用](https://blog.csdn.net/caoyujiao520/article/details/82762097)

[完整版的OpenLDAP搭建全过程](https://www.cnblogs.com/lemon-le/p/6266921.html)

https://www.zhihu.com/question/21594237

* any list
{:toc}