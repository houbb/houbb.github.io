---
layout: post
title:  Guava Cache
date:  2018-09-10 07:44:19 +0800
categories: [Cache]
tags: [cache, guava, middleware, google, in-memory cache, sh]
published: true
excerpt: Guava Cache 入门学习。
---

# 适用性

缓存在很多场景下都是相当有用的。例如，计算或检索一个值的代价很高，并且对同样的输入需要不止一次获取值的时候，就应当考虑使用缓存。

Guava Cache与ConcurrentMap很相似，但也不完全一样。

最基本的区别是ConcurrentMap会一直保存所有添加的元素，直到显式地移除。相对地，Guava Cache为了限制内存占用，通常都设定为自动回收元素。在某些场景下，尽管LoadingCache 不回收元素，它也是很有用的，因为它会自动加载缓存。

## 使用场景

1. 你愿意消耗一些内存空间来提升速度。

2. 你预料到某些键会被查询一次以上。

3. 缓存中存放的数据总量不会超出内存容量。

（Guava Cache是单个应用运行时的本地缓存。它不把数据存放到文件或外部服务器。如果这不符合你的需求，请尝试[Memcached](https://houbb.github.io/2018/09/06/cache-memcached)这类工具）

如果你的场景符合上述的每一条，Guava Cache就适合你。

如同范例代码展示的一样，Cache实例通过CacheBuilder生成器模式获取，但是自定义你的缓存才是最有趣的部分。

注：如果你不需要Cache中的特性，使用ConcurrentHashMap有更好的内存效率——但Cache的大多数特性都很难基于旧有的ConcurrentMap复制，甚至根本不可能做到。

# 快速开始

## maven jar 引入

```xml
<dependencies>
    <dependency>
        <groupId>com.google.guava</groupId>
        <artifactId>guava</artifactId>
        <version>26.0-jre</version>
    </dependency>
</dependencies>
```

## 代码

- User.java

```java
public class User implements Serializable {

    private Long id;

    private String name;

    public User() {
    }

    public User(Long id, String name) {
        this.id = id;
        this.name = name;
    }
    //Getter Setter 
    //toString()
}
```

- GuavaHello.java

```java
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;

import com.github.houbb.cache.guava.hello.model.User;

import java.util.concurrent.ExecutionException;

public class GuavaHello {

    private LoadingCache<Long, User> loadingCache;

    /**
     * 初始化
     */
    public void initCache() {
        //指定一个如果数据不存在获取数据的方法
        CacheLoader<Long, User> cacheLoader = new CacheLoader<Long, User>() {
            @Override
            public User load(Long key) throws Exception {
                User tempUser = new User();
                tempUser.setId(key);
                tempUser.setName("其他人");

                if(1 == key) {
                    tempUser.setName("小明同学");
                }
                return tempUser;
            }
        };

        //缓存数量为1，为了展示缓存删除效果
        loadingCache = CacheBuilder.newBuilder().maximumSize(1).build(cacheLoader);
    }

    /**
     * 获取数据，如果不存在返回null
     * @param key
     * @return
     */
    public User getIfPresent(Long key) {
        return loadingCache.getIfPresent(key);
    }

    /**
     * 获取数据，如果数据不存在则通过cacheLoader获取数据，缓存并返回
     * @param key
     * @return
     */
    public User get(Long key) {
        try {
            return loadingCache.get(key);
        } catch (ExecutionException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 直接向缓存put数据
     * @param key
     * @param value
     */
    public void put(Long key, User value) {
        loadingCache.put(key, value);
    }

    /**
     * 刷新
     * 刷新表示为键加载新值，这个过程可以是异步的。
     * 在刷新操作进行时，缓存仍然可以向其他线程返回旧值，而不像回收操作，读缓存的线程必须等待新值加载完成。
     * @param key
     */
    public void refresh(Long key) {
        loadingCache.refresh(key);
    }

    /**
     * 删除一个 key
     * @param key
     */
    public void remove(Long key) {
        loadingCache.invalidate(key);
    }

}
```

- 测试代码

```java
@Test
public void putTest() {
    GuavaHello guavaHello = new GuavaHello();
    guavaHello.initCache();
    final long oneKey = 1L;
    System.out.println("1. 查询 1L");
    System.out.println(guavaHello.getIfPresent(oneKey));
    System.out.println(guavaHello.get(oneKey));
    System.out.println("2. 存储 1L");
    guavaHello.put(1L, new User(1L, String.valueOf(1)));
    System.out.println(guavaHello.getIfPresent(oneKey));
    System.out.println(guavaHello.get(oneKey));
    System.out.println("3. 清空 1L");
    guavaHello.remove(oneKey);
    System.out.println(guavaHello.getIfPresent(oneKey));
    System.out.println(guavaHello.get(oneKey));
}
```

日志信息

```
1. 查询 1L
null
User{id=1, name='小明同学'}
2. 存储 1L
User{id=1, name='1'}
User{id=1, name='1'}
3. 清空 1L
null
User{id=1, name='小明同学'}
```

# 参考资料

https://github.com/google/guava/wiki/CachesExplained

http://ifeve.com/google-guava-cachesexplained/

* any list
{:toc}