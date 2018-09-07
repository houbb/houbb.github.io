---
layout: post
title:  Redis Spring
date:  2018-09-07 07:44:19 +0800
categories: [Cache]
tags: [cache, spring, redis, sh]
published: true
excerpt: Redis Spring 框架整合，自定义缓存。
---

# Spring 

使用 spring 中的缓存。

## 例子

- User.java

用于测试的实体。

```java
public class User {

    private Long id;
    
    private String name;

    //Getter & Setter
    //toString()
}
```

- UserService.java

用户服务类接口。

```java
public interface UserService {

  /**
   * 获取用户
   * @param id 标识
   * @return 用户
   */
  User getUser(Long id);

  /**
   * 删除用户
   * @param id 标识
   */
  void deleteUser(Long id);

  /**
   * 更新用户
   * @param user 用户
   * @return 用户
   */
  User updateUser(User user);

  /**
   * 清除缓存
   */
  void clearCache();

}
```

- UserServiceImpl.java

```java
@Service
public class UserServiceImpl implements UserService {

    /**
     * Cacheable triggers cache population
     */
    @Override
    @Cacheable(value = "user", key = "'user_id_' + #id")
    public User getUser(Long id) {
        System.out.println("get user: " + id);

        User user = new User();
        user.setId(id);
        return user;
    }

    @Override
    @CacheEvict(value = "user", key = "'user_id_'+#id")
    public void deleteUser(Long id) {
        System.out.println("delete user: " + id);
    }

    /**
     * updated without interfering with the method execution
     * - 将返回的结果,放入缓存
     */
    @Override
    @CachePut(value = "user", key = "'user_id_'+#user.getId()")
    public User updateUser(User user) {
        System.out.println("update user: " + user);
        user.setName("cachePut update");
        return user;
    }

    @Override
    @CacheEvict(value = "user", allEntries = true)
    public void clearCache() {
        System.out.println("clear all user cache");
    }
}
```

- applicationContext-cache.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xmlns:cache="http://www.springframework.org/schema/cache"
       xmlns:p="http://www.springframework.org/schema/p"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
		http://www.springframework.org/schema/beans/spring-beans-4.0.xsd
		http://www.springframework.org/schema/context
		http://www.springframework.org/schema/context/spring-context-4.0.xsd http://www.springframework.org/schema/cache http://www.springframework.org/schema/cache/spring-cache.xsd">

    <!-- Activates annotation-based bean configuration -->
    <context:annotation-config/>

    <!-- Scans for application @Components to deploy -->
    <context:component-scan base-package="com.github.houbb.redis.learn.spring.cache"/>

    <cache:annotation-driven/>

    <!-- spring自己的缓存管理器，这里定义了缓存位置名称 ，即注解中的value -->
    <bean id="cacheManager" class="org.springframework.cache.support.SimpleCacheManager">
        <property name="caches">
            <bean class="org.springframework.cache.concurrent.ConcurrentMapCacheFactoryBean"
                  p:name="user"/>
        </property>
    </bean>

</beans>
```

## 测试

- 读取

```java
@ContextConfiguration(locations = {"classpath:applicationContext-cache.xml"})
@SpringJUnitConfig
public class UserServiceTest {

    @Autowired
    private UserService userService;

    /**
     *
     * Method: getUser(Long id)
     *
     */
    @Test
    public void getUserTest() throws Exception {
        User user1 = userService.getUser(1L);
        User user2 =userService.getUser(1L);

        System.out.println(user1);
        System.out.println(user2);
    }
}
```

日志

```
...
get user: 1
User{id=1, name='null'}
User{id=1, name='null'}
```

可见，第二次查询时走的实际上是缓存。

# 自己实现

## 思路

- 定义注解

模仿 spring 注解。

- 定义拦截器

基于上述注解的对应实现。

## 源码

[手动实现基于 redis 的缓存](https://github.com/houbb/redis-learn/tree/master/redis-learn-integration/redis-define-cache/src/main/java/com/github/houbb/redis/learn/define/cache)


# 参考资料

[spring cache data](https://spring.io/guides/gs/caching/)

* any list
{:toc}