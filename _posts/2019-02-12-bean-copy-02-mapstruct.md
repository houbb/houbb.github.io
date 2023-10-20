---
layout: post
title: java 对象属性复制(BeanCopy)-02-MapStruct 拷贝工具库
date:  2019-02-12 21:31:37 +0800
categories: [Java]
tags: [java, best-practise, sh]
published: true
---

# mapstruct

MapStruct是一款非常实用Java工具，主要用于解决对象之间的拷贝问题，比如PO/DTO/VO/QueryParam之间的转换问题。

区别于BeanUtils这种通过反射，它通过编译器编译生成常规方法，将可以很大程度上提升效率。

> [官方文档](https://mapstruct.org/documentation/stable/reference/pdf/mapstruct-reference-guide.pdf)

# 为什么会引入 MapStruct 这类工具

## JavaBean 问题引入

在开发的时候经常会有业务代码之间有很多的 JavaBean 之间的相互转化，比如PO/DTO/VO/QueryParam之间的转换问题。

之前我们的做法是：

org.apache.commons.beanutils.PropertyUtils.copyProperties
org.apache.commons.beanutils.BeanUtils.copyProperties
org.springframework.beans.BeanUtils.copyProperties
net.sf.cglib.beans.BeanCopier

## 纯get/set

辅助IDE插件拷贝对象时可以自动set所有方法字段 （这种方式可能有些开发人员不清楚）

不仅看上去冗余添加新的字段时依然需要手动

开发效率比较低

## MapStruct 带来的改变


# MapStruct 入门例子

这里展示最基本的PO转VO的例子，使用的是IDEA + Lombok + MapStruct

## maven 引入

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>mapstruct-learn</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>

        <org.mapstruct.version>1.4.0.Beta3</org.mapstruct.version>
        <org.projectlombok.version>1.18.12</org.projectlombok.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
            <version>${org.mapstruct.version}</version>
        </dependency>

        <!-- lombok dependencies should not end up on classpath -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>${org.projectlombok.version}</version>
            <scope>provided</scope>
        </dependency>

        <!-- fastjson -->
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson</artifactId>
            <version>1.2.71</version>
        </dependency>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.12</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <version>3.8.1</version>
                    <configuration>
                        <source>1.8</source>
                        <target>1.8</target>
                        <!-- See https://maven.apache.org/plugins/maven-compiler-plugin/compile-mojo.html -->
                        <!-- Classpath elements to supply as annotation processor path. If specified, the compiler   -->
                        <!-- will detect annotation processors only in those classpath elements. If omitted, the     -->
                        <!-- default classpath is used to detect annotation processors. The detection itself depends -->
                        <!-- on the configuration of annotationProcessors.                                           -->
                        <!--                                                                                         -->
                        <!-- According to this documentation, the provided dependency processor is not considered!   -->
                        <annotationProcessorPaths>
                            <path>
                                <groupId>org.mapstruct</groupId>
                                <artifactId>mapstruct-processor</artifactId>
                                <version>${org.mapstruct.version}</version>
                            </path>
                            <path>
                                <groupId>org.projectlombok</groupId>
                                <artifactId>lombok</artifactId>
                                <version>${org.projectlombok.version}</version>
                            </path>
                        </annotationProcessorPaths>
                    </configuration>
                </plugin>
            </plugins>
        </pluginManagement>
    </build>

</project>
```

## 测试代码

定义测试对象

- User.java

```java
package org.example.mapstruct.learn.entity;

import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Accessors(chain = true)
public class User {

    private Long id;
    private String username;
    private String password; // 密码
    private Integer sex;  // 性别
    private LocalDate birthday; // 生日
    private LocalDateTime createTime; // 创建时间
    private String config; // 其他扩展信息，以JSON格式存储

}
```

- UserVo.java

```java
package org.example.mapstruct.learn.vo;

import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDate;
import java.util.List;

@Data
@Accessors(chain = true)
public class UserVo {

    private Long id;
    private String username;
    private String password;
    private Integer gender;
    private LocalDate birthday;
    private String createTime;
    private List<UserConfig> config;
    @Data
    public static class UserConfig {
        private String field1;
        private Integer field2;
    }

}
```

## 转换类

```java
package org.example.mapstruct.learn.converter;

import com.alibaba.fastjson.JSON;
import org.example.mapstruct.learn.entity.User;
import org.example.mapstruct.learn.vo.UserVo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper
public interface UserConverter {

    UserConverter INSTANCE = Mappers.getMapper(UserConverter.class);

    @Mapping(target = "gender", source = "sex")
    @Mapping(target = "createTime", dateFormat = "yyyy-MM-dd HH:mm:ss")
    UserVo do2vo(User var1);

    @Mapping(target = "sex", source = "gender")
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "createTime", dateFormat = "yyyy-MM-dd HH:mm:ss")
    User vo2Do(UserVo var1);

    List<UserVo> do2voList(List<User> userList);

    default List<UserVo.UserConfig> strConfigToListUserConfig(String config) {
        return JSON.parseArray(config, UserVo.UserConfig.class);
    }

    default String listUserConfigToStrConfig(List<UserVo.UserConfig> list) {
        return JSON.toJSONString(list);
    }

}
```

注意：这里需要执行一下编译，会生成对应的转换实现类。

## 测试代码

```java
package org.example.mapstruct.learn.converter;

import org.example.mapstruct.learn.entity.User;
import org.example.mapstruct.learn.vo.UserVo;
import org.junit.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class ConveterTest {

    @Test
    public void do2VoTest() {
        User user = new User()
                .setId(1L)
                .setUsername("zhangsan")
                .setSex(1)
                .setPassword("abc123")
                .setCreateTime(LocalDateTime.now())
                .setBirthday(LocalDate.of(1999, 9, 27))
                .setConfig("[{\"field1\":\"Test Field1\",\"field2\":500}]");

        UserVo userVo = UserConverter.INSTANCE.do2vo(user);

        // asset
        assertNotNull(userVo);
        assertEquals(userVo.getId(), user.getId());

        // print
        System.out.println(user);
        System.out.println(userVo);
//        User(id=1, username=zhangsan, password=abc123, sex=1, birthday=1999-09-27, createTime=2020-08-17T14:54:01.528, config=[{"field1":"Test Field1","field2":500}])
//        UserVo(id=1, username=zhangsan, password=abc123, gender=1, birthday=1999-09-27, createTime=2020-08-17 14:54:01, config=[UserVo.UserConfig(field1=Test Field1, field2=500)])
    }

    @Test
    public void vo2DoTest() {
        UserVo.UserConfig userConfig = new UserVo.UserConfig();
        userConfig.setField1("Test Field1");
        userConfig.setField2(500);

        UserVo userVo = new UserVo()
                .setId(1L)
                .setUsername("zhangsan")
                .setGender(2)
                .setCreateTime("2020-01-18 15:32:54")
                .setBirthday(LocalDate.of(1999, 9, 27))
                .setConfig(Collections.singletonList(userConfig));
        User user = UserConverter.INSTANCE.vo2Do(userVo);

        // asset
        assertNotNull(userVo);
        assertEquals(userVo.getId(), user.getId());

        // print
        System.out.println(user);
        System.out.println(userVo);
    }

}
```

测试效果

```
User(id=1, username=zhangsan, password=abc123, sex=1, birthday=1999-09-27, createTime=2023-10-20T14:18:29.150, config=[{"field1":"Test Field1","field2":500}])
UserVo(id=1, username=zhangsan, password=abc123, gender=1, birthday=1999-09-27, createTime=2023-10-20 14:18:29, config=[UserVo.UserConfig(field1=Test Field1, field2=500)])
User(id=1, username=zhangsan, password=null, sex=2, birthday=1999-09-27, createTime=2020-01-18T15:32:54, config=[{"field1":"Test Field1","field2":500}])
UserVo(id=1, username=zhangsan, password=null, gender=2, birthday=1999-09-27, createTime=2020-01-18 15:32:54, config=[UserVo.UserConfig(field1=Test Field1, field2=500)])
```

# 原理

## 编译后的类

对应的类信息如下：

```java
//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

package org.example.mapstruct.learn.converter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import org.example.mapstruct.learn.entity.User;
import org.example.mapstruct.learn.vo.UserVo;

public class UserConverterImpl implements UserConverter {
    public UserConverterImpl() {
    }

    public UserVo do2vo(User var1) {
        if (var1 == null) {
            return null;
        } else {
            UserVo userVo = new UserVo();
            userVo.setGender(var1.getSex());
            if (var1.getCreateTime() != null) {
                userVo.setCreateTime(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").format(var1.getCreateTime()));
            }

            userVo.setId(var1.getId());
            userVo.setUsername(var1.getUsername());
            userVo.setPassword(var1.getPassword());
            userVo.setBirthday(var1.getBirthday());
            userVo.setConfig(this.strConfigToListUserConfig(var1.getConfig()));
            return userVo;
        }
    }

    public User vo2Do(UserVo var1) {
        if (var1 == null) {
            return null;
        } else {
            User user = new User();
            user.setSex(var1.getGender());
            if (var1.getCreateTime() != null) {
                user.setCreateTime(LocalDateTime.parse(var1.getCreateTime(), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            }

            user.setId(var1.getId());
            user.setUsername(var1.getUsername());
            user.setBirthday(var1.getBirthday());
            user.setConfig(this.listUserConfigToStrConfig(var1.getConfig()));
            return user;
        }
    }

    public List<UserVo> do2voList(List<User> userList) {
        if (userList == null) {
            return null;
        } else {
            List<UserVo> list = new ArrayList(userList.size());
            Iterator var3 = userList.iterator();

            while(var3.hasNext()) {
                User user = (User)var3.next();
                list.add(this.do2vo(user));
            }

            return list;
        }
    }
}
```

# 这里面用了什么机制？

这和Lombok实现机制一致。核心之处就是对于注解的解析上。

JDK5引入了注解的同时，也提供了两种解析方式。运行时解析运行时能够解析的注解，必须将@Retention设置为RUNTIME, 比如@Retention(RetentionPolicy.RUNTIME)，这样就可以通过反射拿到该注解。

java.lang,reflect反射包中提供了一个接口AnnotatedElement，该接口定义了获取注解信息的几个方法，Class、Constructor、Field、Method、Package等都实现了该接口，对反射熟悉的朋友应该都会很熟悉这种解析方式。

## 编译时解析

编译时解析有两种机制，分别简单描述下：

1）Annotation Processing Tool

apt自JDK5产生，JDK7已标记为过期，不推荐使用，JDK8中已彻底删除，自JDK6开始，可以使用Pluggable Annotation Processing API来替换它，apt被替换主要有2点原因：

api都在com.sun.mirror非标准包下没有集成到javac中，需要额外运行

2）Pluggable Annotation Processing API

JSR 269: Pluggable Annotation Processing API在新窗口打开自JDK6加入，作为apt的替代方案，它解决了apt的两个问题，javac在执行的时候会调用实现了该API的程序，这样我们就可以对编译器做一些增强，这时javac执行的过程如下：

![javac](https://pdai.tech/images/develop/package/dev-package-lombok-2.png)

Lombok本质上就是一个实现了“JSR 269 API”的程序。

在使用javac的过程中，它产生作用的具体流程如下：

1. javac对源代码进行分析，生成了一棵抽象语法树（AST）

2. 运行过程中调用实现了“JSR 269 API”的Lombok程序

3. 此时Lombok就对第一步骤得到的AST进行处理，找到@Data注解所在类对应的语法树（AST），然后修改该语法树（AST），增加getter和setter方法定义的相应树节点

4. javac使用修改后的抽象语法树（AST）生成字节码文件，即给class增加新的节点（代码块）

![lombok](https://pdai.tech/images/develop/package/dev-package-lombok-3.png)

从上面的Lombok执行的流程图中可以看出，在Javac 解析成AST抽象语法树之后, Lombok 根据自己编写的注解处理器，动态地修改 AST，增加新的节点（即Lombok自定义注解所需要生成的代码），最终通过分析生成JVM可执行的字节码Class文件。

使用Annotation Processing自定义注解是在编译阶段进行修改，而JDK的反射技术是在运行时动态修改，两者相比，反射虽然更加灵活一些但是带来的性能损耗更加大。

# MapStruct 更多例子

## 自定义属性的转化

### JDK 8以上版本

一般常用的类型字段转换 MapStruct都能替我们完成，但是有一些是我们自定义的对象类型，MapStruct就不能进行字段转换，这就需要我们编写对应的类型转换方法，笔者使用的是JDK8，支持接口中的默认方法，可以直接在转换器中添加自定义类型转换方法。

上述例子中User对象的config属性是一个JSON字符串，UserVo对象中是List类型的，这需要实现JSON字符串与对象的互转。

```java
default List<UserConfig> strConfigToListUserConfig(String config) {
  return JSON.parseArray(config, UserConfig.class);
}

default String listUserConfigToStrConfig(List<UserConfig> list) {
  return JSON.toJSONString(list);
}
```

### JDK 8 以下版本

如果是 JDK8以下的，不支持默认方法，可以另外定义一个 转换器，然后再当前转换器的 @Mapper 中通过 uses = XXX.class 进行引用。

定义好方法之后，MapStruct当匹配到合适类型的字段时，会调用我们自定义的转换方法进行转换。

## 转为多个对象

比如上面例子中User可以转为UserQueryParam, 业务功能上比如通过UserQueryParam里面的参数进行查找用户的。

```java
@Data
@Accessors(chain = true)
public class UserQueryParam {
    private Long id;
    private String username;
}
```

添加转换方法

```java
UserQueryParam vo2QueryParam(User var1);
```

## Spring 中使用MapStruct

除了UserConverter.INSTANCE这种方式还可以注入Spring容器中使用。

### componentModel

当添加componentModel="spring"时，它会在实现类上自动添加@Component注解，这样就能被Spring记性component scan，从而加载到springContext中，进而被@Autowird注入使用。

（其它还有jsr330和cdi标准，基本上使用componentModel="spring"就够了）。

```java
@Mapper(componentModel="spring")
public interface UserConverter {
}
```

### 引入和测试

```java
@Slf4j
@RunWith(SpringRunner.class)
@SpringBootTest
public class UserConverterTest {

  @Resource
  private UserConverter userConverter;

  // test methods

}
```

## 多个对象转一个对象

比如上述例子中User购买了东西，需要邮寄到他的地址Address，这时需要展示UserWithAddress的信息：

- Address

```java
@Data
public class Address {
    private String street;
    private Integer zipCode;
    private Integer houseNo;
    private String description;
}
```

- UserWithAddressVo

```java
@Data
public class UserWithAddressVo {

    private String username;
    private Integer sex;
    private String street;
    private Integer zipCode;
    private Integer houseNumber;
    private String description;
}
```

- converter方法

```java
@Mapping(source = "person.description", target = "description")
@Mapping(source = "address.houseNo", target = "houseNumber")
UserWithAddressVo userAndAddress2Vo(User user, Address address);
```

注意：在多对一转换时， 遵循以下几个原则

1. 当多个对象中， 有其中一个为 null， 则会直接返回 null

2. 如一对一转换一样， 属性通过名字来自动匹配。 因此， 名称和类型相同的不需要进行特殊处理

3. 当多个原对象中，有相同名字的属性时，需要通过 @Mapping 注解来具体的指定， 以免出现歧义（不指定会报错）。 

如上面的 description属性也可以直接从传入的参数来赋值。

```java
@Mapping(source = "person.description", target = "description")
@Mapping(source = "hn", target = "houseNumber")
UserWithAddressVo userAndAddressHn2Vo(User user, Integer hn);
```

# 与其它属性拷贝框架性能到底相差多少？

property少，写起来也不麻烦，就直接用传统的getter/setter，性能最好

property多，转换不频繁，那就省点事吧，使用org.apache.commons.beanutils.BeanUtils.copyProperties

property多，转换很频繁，为性能考虑，使用net.sf.cglib.beans.BeanCopier.BeanCopier，性能近乎getter/setter。但是BeanCopier的创建时消耗较大，所以不要频繁创建该实体，最好的处理方式是静态化或者缓存起来。


# 和MapStruct类似框架的对比？

## Dozer

Dozer 是一个映射框架，它使用递归将数据从一个对象复制到另一个对象。

框架不仅能够在 bean 之间复制属性，还能够在不同类型之间自动转换。

更多关于 Dozer 的内容可以在官方文档中找到： http://dozer.sourceforge.net/documentation/gettingstarted.html ，或者你也可以阅读这篇文章：https://www.baeldung.com/dozer 。

## Orika

Orika 是一个 bean 到 bean 的映射框架，它递归地将数据从一个对象复制到另一个对象。

Orika 的工作原理与 Dozer 相似。

两者之间的主要区别是 Orika 使用字节码生成。这允许以最小的开销生成更快的映射器。

更多关于 Orika 的内容可以在官方文档中找到：https://orika-mapper.github.io/orika-docs/，或者你也可以阅读这篇文章：https://www.baeldung.com/orika-mapping。

## ModelMapper

ModelMapper 是一个旨在简化对象映射的框架，它根据约定确定对象之间的映射方式。它提供了类型安全的和重构安全的 API。

更多关于 ModelMapper 的内容可以在官方文档中找到：http://modelmapper.org/ 。

## JMapper

JMapper 是一个映射框架，旨在提供易于使用的、高性能的 Java bean 之间的映射。该框架旨在使用注释和关系映射应用 DRY 原则。

该框架允许不同的配置方式:基于注释、XML 或基于 api。更多关于 JMapper 的内容可以在官方文档中找到：https://github.com/jmapper-framework/jmapper-core/wiki。

# 性能对比

对于性能测试，我们可以使用 Java Microbenchmark Harness，关于如何使用它的更多信息可以在 这篇文章：https://www.baeldung.com/java-microbenchmark-harness 中找到。

测试结果（某一种）

![对比测试](https://pdai.tech/images/develop/package/package-mapstrcut-11.png)

# 参考资料

https://mapstruct.org/documentation/stable/reference/pdf/mapstruct-reference-guide.pdf

* any list
{:toc}