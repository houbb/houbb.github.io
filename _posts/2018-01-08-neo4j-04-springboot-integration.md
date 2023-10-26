---
layout: post
title:  Neo4j-04-图数据库 neo4j spring-data-neo4j 整合 springboot
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, neo4j]
published: true
---


# spring data 整合

> [官方文档](https://spring.io/projects/spring-data-neo4j)

# 代码案例1

## pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>springboot-neo4j-learn</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.3.0.RELEASE</version>
    </parent>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-neo4j</artifactId>
            <version>2.2.2.RELEASE</version>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
            <exclusions>
                <exclusion>
                    <groupId>org.junit.vintage</groupId>
                    <artifactId>junit-vintage-engine</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

</project>
```

## 配置文件

- application.properties

```
spring.data.neo4j.uri=bolt://localhost:7687
spring.data.neo4j.username=neo4j
spring.data.neo4j.password=12345678
```

## 实体定义

- Person.java

```java
package com.github.houbb.springboot.neo4j.learn.entity;

import lombok.Data;
import org.neo4j.ogm.annotation.*;

/**
 * 创作一个对应 Person 实体对象 -> 对应我们 Neo4j数据库中的 Node 对象
 */
@Data
@NodeEntity("Person")
public class Person {

    @Id
    @GeneratedValue
    private Long id;

    @Property
    @Index(unique = true)
    private String name;

    public Person() {
    }

    public Person(String name) {
        this.name = name;
    }
}
```

- PersonRelationship.java

```java
package com.github.houbb.springboot.neo4j.learn.entity;

import lombok.Data;
import org.neo4j.ogm.annotation.*;

import java.io.Serializable;

@Data
@RelationshipEntity(type = "徒弟")
public class PersonRelation implements Serializable {

    @Id
    @GeneratedValue
    private Long id;

    @StartNode
    private Person parent;

    @EndNode
    private Person child;

    @Property
    private String relation;

    public PersonRelation(Person parent, Person child) {
        this.parent = parent;
        this.child = child;
        this.relation = "徒弟";
    }

}
```

## DAL

- PersonRepository.java

```java
package com.github.houbb.springboot.neo4j.learn.dal;

import com.github.houbb.springboot.neo4j.learn.entity.Person;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonRepository extends Neo4jRepository<Person,Long> {
}
```

- PersonRelationRepository.java

```java
package com.github.houbb.springboot.neo4j.learn.dal;

import com.github.houbb.springboot.neo4j.learn.entity.PersonRelation;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonRelationRepository extends Neo4jRepository<PersonRelation,Long> {
}
```

## 测试代码

```java
package com.github.houbb.springboot.neo4j.learn.dal;

import com.github.houbb.springboot.neo4j.learn.Application;
import com.github.houbb.springboot.neo4j.learn.entity.Person;
import com.github.houbb.springboot.neo4j.learn.entity.PersonRelation;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = Application.class)
public class SpringbootNeo4jApplicationTests {

    @Autowired
    private PersonRepository personRepository;

    @Autowired
    private PersonRelationRepository personRelationRepository;

    @Test
    public void savePersonTest() {
        Person person = new Person();
        person.setName("老马啸西风");

        personRepository.save(person);
    }

    @Test
    public void savePersonRelationTest() {
        Person personTang = new Person("唐僧");
        Person personSun = new Person("孙悟空");
        Person personZhu = new Person("猪八戒");
        Person personSha = new Person("沙僧");

        // 都是唐僧的徒弟
        PersonRelation pr1 = new PersonRelation(personTang, personSun);
        PersonRelation pr2 = new PersonRelation(personTang, personZhu);
        PersonRelation pr3 = new PersonRelation(personTang, personSha);

        personRelationRepository.save(pr1);
        personRelationRepository.save(pr2);
        personRelationRepository.save(pr3);
    }

}
```

## 效果

<svg xmlns="http://www.w3.org/2000/svg" width="415.16534423828125" height="449.58197021484375" viewBox="-196.1868438720703 -227.38206481933594 415.16534423828125 449.58197021484375"><title>Neo4j Graph Visualization</title><desc>Created using Neo4j (http://www.neo4j.com/)</desc><g class="layer relationships"><g class="relationship" transform="translate(-120.33442666390933 97.72984180724553) rotate(250.88222345399186)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 57.02798584413253 0.5 L 57.02798584413253 -0.5 L 25 -0.5 Z M 79.02798584413253 0.5 L 111.05597168826506 0.5 L 111.05597168826506 3.5 L 118.05597168826506 0 L 111.05597168826506 -3.5 L 111.05597168826506 -0.5 L 79.02798584413253 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="68.02798584413253" y="3" transform="rotate(180 68.02798584413253 0)" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">徒弟</text></g><g class="relationship" transform="translate(-120.33442666390933 97.72984180724553) rotate(401.7008360253038)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 57.255960623030546 0.5 L 57.255960623030546 -0.5 L 25 -0.5 Z M 79.25596062303055 0.5 L 111.51192124606109 0.5 L 111.51192124606109 3.5 L 118.51192124606109 0 L 111.51192124606109 -3.5 L 111.51192124606109 -0.5 L 79.25596062303055 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="68.25596062303055" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">徒弟</text></g><g class="relationship" transform="translate(-120.33442666390933 97.72984180724553) rotate(338.4534049295047)"><path class="b-outline" fill="#A5ABB6" stroke="none" d="M 25 0.5 L 57.66339804012141 0.5 L 57.66339804012141 -0.5 L 25 -0.5 Z M 79.66339804012141 0.5 L 112.32679608024281 0.5 L 112.32679608024281 3.5 L 119.32679608024281 0 L 112.32679608024281 -3.5 L 112.32679608024281 -0.5 L 79.66339804012141 -0.5 Z"/><text text-anchor="middle" pointer-events="none" font-size="8px" fill="#000000" x="68.66339804012141" y="3" font-family="Helvetica Neue, Helvetica, Arial, sans-serif">徒弟</text></g></g><g class="layer nodes"><g class="node" aria-label="graph-node0" transform="translate(-13.184339678187674,193.19989155421027)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#D9C8AE" stroke="#c0a378" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 猪八戒</text></g><g class="node" aria-label="graph-node1" transform="translate(13.906698576865297,44.72470657603753)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#D9C8AE" stroke="#c0a378" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 沙僧</text></g><g class="node" aria-label="graph-node13" transform="translate(189.9785123242185,-71.94503949318725)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#D9C8AE" stroke="#c0a378" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 老马啸…</text></g><g class="node" aria-label="graph-node14" transform="translate(-0.7417340407978604,-198.38204754692615)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#D9C8AE" stroke="#c0a378" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 老马啸…</text></g><g class="node" aria-label="graph-node15" transform="translate(-167.18683993035023,-37.436213128098046)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#D9C8AE" stroke="#c0a378" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 孙悟空</text></g><g class="node" aria-label="graph-node16" transform="translate(-120.33442666390933,97.72984180724553)"><circle class="b-outline" cx="0" cy="0" r="25" fill="#D9C8AE" stroke="#c0a378" stroke-width="2px"/><text class="caption" text-anchor="middle" pointer-events="none" x="0" y="5" font-size="10px" fill="#2A2C34" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"> 唐僧</text></g></g></svg>

## @Index 唯一索引无效

仅供参考，我正在使用 Neo4j 服务器版本：3.3.6（社区）和 Spring Boot 2。

但是如果我自己在 Neo4j 浏览器中创建约束，它就可以工作。

```sql
CREATE CONSTRAINT ON (user:User) ASSERT user.userName IS UNIQUE
```

Run Code Online (Sandbox Code Playgroud)

有没有办法强制 Spring Data Neo4J 创建独特的属性，而无需自己在数据库中创建它们？

如果您希望应用程序代码创建约束，则需要配置自动索引管理器。

您可以在文档中找到最合适的选项： 

https://docs.spring.io/spring-data/neo4j/docs/current/reference/html/#reference :indexing:creation

关于这个主题的注释：想想像 Hibernate 的 DDL 支持一样的自动索引创建。

它是开发时的好帮手。

您不应该在生产环境中使用assertandupdate而只能使用validate.

# 代码案例2-JPA

## 整体目录

```
├─java
│  ├─com
│  │  └─github
│  │      └─houbb
│  │          └─springboot
│  │              └─neo4j
│  │                  └─learn
│  │                      │  Application.java
│  │                      │  package-info.java
│  │                      │
│  │                      ├─controller
│  │                      │      UserController.java
│  └─org
│      └─example
│              Main.java
│
└─resources
        application.properties
```

## pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>springboot-neo4j-learn</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.3.0.RELEASE</version>
    </parent>

    <dependencies>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-neo4j</artifactId>
            <version>2.2.2.RELEASE</version>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
            <exclusions>
                <exclusion>
                    <groupId>org.junit.vintage</groupId>
                    <artifactId>junit-vintage-engine</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

</project>
```

## 配置文件

- application.properties

```
spring.data.neo4j.uri=bolt://localhost:7687
spring.data.neo4j.username=neo4j
spring.data.neo4j.password=12345678
```

## 实体定义

- UserNode.java

```java
package com.github.houbb.springboot.neo4j.learn.entity;

import lombok.Data;
import org.neo4j.ogm.annotation.Id;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Property;

//表示节点类型
@NodeEntity(label="User")
@Data
public class UserNode {

    @Id
    private Long nodeId;

    @Property
    private String userId;

    @Property
    private String name;

    @Property
    private int age;

}
```

- UserRelation.java

```java
package com.github.houbb.springboot.neo4j.learn.entity;

import lombok.Data;
import org.neo4j.ogm.annotation.EndNode;
import org.neo4j.ogm.annotation.Id;
import org.neo4j.ogm.annotation.RelationshipEntity;
import org.neo4j.ogm.annotation.StartNode;

//表示关系类型
@RelationshipEntity(type="UserRelation")
@Data
public class UserRelation {

    @Id
    private Long id;

    @StartNode
    private UserNode startNode;

    @EndNode
    private UserNode endNode;

}
```

## DAL

- UserRepository.java

```java
package com.github.houbb.springboot.neo4j.learn.dal;

import com.github.houbb.springboot.neo4j.learn.entity.UserNode;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface UserRepository extends Neo4jRepository<UserNode,Long> {


    /**
     * 查询所有节点
     * @return
     */
    @Query("MATCH (n:User) RETURN n ")
    List<UserNode> getUserNodeList();

    /**
     * 创建节点
     * @param userId
     * @param name
     * @param age
     * @return
     */
    @Query("create (n:User{userId:$userId,age:$age,name:$name}) RETURN n ")
    List<UserNode> addUserNodeList(@Param("userId") String userId,@Param("name") String name, @Param("age")int age);

}
```

- UserRelationRepository.java

```java
package com.github.houbb.springboot.neo4j.learn.dal;

import com.github.houbb.springboot.neo4j.learn.entity.UserRelation;
import org.springframework.data.neo4j.annotation.Query;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public interface UserRelationRepository extends Neo4jRepository<UserRelation,Long> {

    /**
     * 通过id 查询关系
     * @param firstUserId
     * @param secondUserId
     * @return
     */
    @Query("match p=(n:User)<-[r:FRIEND]->(n1:User) where n.userId=$firstUserId and n1.userId=$secondUserId return p")
    List<UserRelation> findUserRelationByEachId(@Param("firstUserId") String firstUserId, @Param("secondUserId") String secondUserId);

    /**
     * 添加关系
     * @param firstUserId
     * @param secondUserId
     * @return
     */
    @Query("match (fu:User),(su:User) where fu.userId=$firstUserId and su.userId=$secondUserId create p=(fu)-[r:FRIEND]->(su) return p")
    List<UserRelation> addUserRelation(@Param("firstUserId") String firstUserId, @Param("secondUserId") String secondUserId);

}
```

## service

- UserService.java

```java
package com.github.houbb.springboot.neo4j.learn.service;

import com.github.houbb.springboot.neo4j.learn.dal.UserRelationRepository;
import com.github.houbb.springboot.neo4j.learn.dal.UserRepository;
import com.github.houbb.springboot.neo4j.learn.entity.UserNode;
import com.github.houbb.springboot.neo4j.learn.entity.UserRelation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRelationRepository userRelationRepository;

    public void addUserNode(UserNode userNode) {
        userRepository.addUserNodeList(userNode.getUserId(),userNode.getName(), userNode.getAge());
    }

    public void addRelationship(String firstId,String secondId){
        userRelationRepository.addUserRelation(firstId,secondId);
    }

    public List<UserRelation> findUserRelationByEachId(String firstId, String secondId){
        return userRelationRepository.findUserRelationByEachId(firstId, secondId);
    }
}
```

## controller

```java
package com.github.houbb.springboot.neo4j.learn.controller;

import com.github.houbb.springboot.neo4j.learn.entity.UserNode;
import com.github.houbb.springboot.neo4j.learn.entity.UserRelation;
import com.github.houbb.springboot.neo4j.learn.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * http://localhost:8080/saveUser
     * @return
     */
    @RequestMapping("/saveUser")
    public String saveUserNode() {

        UserNode node = new UserNode();
        node.setNodeId(1L);
        node.setUserId("2");
        node.setName("赵六");
        node.setAge(26);

        userService.addUserNode(node);

        UserNode node2 = new UserNode();
        node2.setNodeId(2L);
        node2.setUserId("1");
        node2.setName("王五");
        node2.setAge(27);

        userService.addUserNode(node2);
        return "success";
    }

    /**
     * http://localhost:8080/addship
     * @return
     */
    @RequestMapping("/addship")
    public String saveShip(){
        userService.addRelationship("1","2");
        return "success";
    }

    /**
     * http://localhost:8080/findShip
     * @return
     */
    @RequestMapping("/findShip")
    @ResponseBody
    public List<UserRelation> findShip(){
        return userService.findUserRelationByEachId("1","2");
    }

}
```

## 测试

```
http://localhost:8080/saveUser
http://localhost:8080/addship
```

图数据库中，可以得到 【王五】=》【赵六】这样一个关系。

# 参考资料

[Springboot 集成 Neo4j 完整版教程](https://blog.csdn.net/Coder_ljw/article/details/131347272)

https://blog.csdn.net/Coder_ljw/article/details/131347272

https://www.baidu.com/link?url=f0vwPTijY6BJO4Eb1IOqeJJR5rm_a_yXnKfrnewr3i9Pjn9zMlfpeSKUH4yZ_LUI&wd=&eqid=d901bc89000179ce000000056539d611

* any list
{:toc}

