---
layout: post
title:  PowerMock
date:  2017-10-27 14:53:34 +0800
categories: [Test]
tags: [test, mock]
published: true
---



# PowerMock

[PowerMock](https://github.com/powermock/powermock)  is a framework that extends other mock libraries such as EasyMock with more powerful capabilities. 

# Quick Start

给一个简单的使用范例。

- Project Struct

```
├─pom.xml
│
├─src
│  ├─main
│  │  └─java
│  │      └─com
│  │          └─ryo
│  │              ├─domain
│  │              │      User.java
│  │              │
│  │              └─service
│  │                  │  UserService.java
│  │                  │
│  │                  └─impl
│  │                          UserServiceImpl.java
│  │
│  └─test
│      └─java
│          └─com
│              └─ryo
│                  └─service
│                      └─impl
│                              UserServiceImplTest.java
```

- pom.xml

用于常用 jar 的引入。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.ryo</groupId>
    <artifactId>powermock</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <junit.version>4.12</junit.version>
        <mockito.version>1.10.19</mockito.version>
        <powermock.version>1.6.4</powermock.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>${junit.version}</version>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.mockito</groupId>
            <artifactId>mockito-all</artifactId>
            <version>${mockito.version}</version>
        </dependency>

        <dependency>
            <groupId>org.powermock</groupId>
            <artifactId>powermock-module-junit4</artifactId>
            <version>${powermock.version}</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.powermock</groupId>
            <artifactId>powermock-api-mockito</artifactId>
            <version>${powermock.version}</version>
            <scope>test</scope>
            <exclusions>
                <exclusion>
                    <groupId>org.mockito</groupId>
                    <artifactId>mockito-core</artifactId>
                </exclusion>
                <exclusion>
                    <groupId>org.hamcrest</groupId>
                    <artifactId>hamcrest-core</artifactId>
                </exclusion>
                <exclusion>
                    <groupId>junit</groupId>
                    <artifactId>junit</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
    </dependencies>

</project>
```

- User.java

简单定义

```java
public class User {
    private String username;

    public String getUsername(){
        return username;
    }

    public void setUsername(String username){
        this.username = username;
    }

    @Override public String toString(){
        return "User{" +
            "username='" + username + '\'' +
            '}';
    }
}
```

- UserService.java & UserServiceImpl.java

```java
public interface UserService {
    User getUser(Long id);
}
```

```java
public class UserServiceImpl {

    public boolean checkId(Long id) {
        return privateMethod();
    }

    private boolean privateMethod() {
        System.out.println("call private method.");
        return true;
    }

}
```

- UserServiceImplTest.java

```java
@RunWith(PowerMockRunner.class)
@PrepareForTest(UserServiceImpl.class)
public class UserServiceImplTest {
    @Mock
    private UserService userService;

    @Before
    public void init() {
        MockitoAnnotations.initMocks(this);

        mockGetUser();
    }

    /**
     * 对获取的信息进行Mock
     */
    private void mockGetUser() {
        User user = new User();
        user.setUsername("powermock");
        Mockito.when(userService.getUser(Mockito.anyLong()))
            .thenReturn(user);
    }

    @Test
    public void testGetUser() {
        User user = userService.getUser(1L);
        System.out.println(user);
    }

    @Test
    public void testCheckId() {
        final Long id = 1L;
        UserServiceImpl userService = new UserServiceImpl();
        userService.checkId(id);
    }



    @Test
    public void testPrivateMock() throws Exception{
        final Long id = 1L;
        UserServiceImpl userService = PowerMockito.mock(UserServiceImpl.class);

        PowerMockito.when(userService.checkId(id)).thenCallRealMethod();
        PowerMockito.when(userService, "privateMethod").thenReturn(false);
    }
}
```



* any list
{:toc}












 

