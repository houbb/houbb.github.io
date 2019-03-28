---
layout: post
title: Spring 路由最佳实践
date:  2019-3-28 09:47:51 +0800
categories: [Java]
tags: [java, spring, bese-practise, sh]
published: true
---

# Spring 最佳路由方式

不同的业务，需要走不同的实现。

除了 if/else，我们还有其他的方式吗？

## 接口的定义

- 验证接口

```java
interface IValid() {
    void valid(ValidReq req);
}
```

### 不同的实现

- 验证金额

```java
@Service
class ValidNum implements IValid() {
    @Override
    void valid(ValidReq req) {
        //num....
    }
}
```

- 验证金额

```java
@Service
class ValidAmount implements IValid() {
    @Override
    void valid(ValidReq req) {
        //amount....
    }
}
```

## 需求

根据不同的业务，执行不同的验证方式（多个组合）。

比如业务 simple，只需要验证数量。

业务 complex，需要验证数量和金额。

- 拓展性

后续可能会继续新增校验方式，会有不同的业务。

## 基本版本

最基本的版本，直接来一个 if/else 判断即可。

简单明了。

```java
@Service
public class BaseValidService implments ValidService {

    @Autowired
    private ValidAmount validAmount;

    @Autowired
    private ValidNum validNum;

    public void doValid(final String bizType, final ValidReq req) {
        if("simple".equals(bizType)) {
            validNum.valid(req);
        } else if("complex".equals(bizType)) {
            validNum.valid(req);
            validAmount.valid(req);
        }
    }
}
```

### 思考

- 优点

if/else 的方式，非常的简单粗暴。也是非常容易想到的。

但是缺点也比较明显。

- 缺点

if/else 的拓展性比较差。

比如提出下面的需求：

（1）新增了很多校验方式，要求不同的业务验证还是不同

（2）业务有很多种

（3）要求如果一个验证遇到内部异常，try-catch 掉，继续执行其他验证。尽可能的验证规则。

（4）不同验证的执行有一定的顺序优先级

## 责任链模式

单独针对（3），可以使用责任链模式。

先不考虑业务的不同验证方式，主要是演示下 `@PostConstruct` 的使用。

```java
@Service
public class ValidChainService implments ValidService {

    private List<IValid> validList;

    @Autowired
    private ValidAmount validAmount;

    @Autowired
    private ValidNum validNum;

    @PostConstruct
    public void init() {
        validList.add(validNum);
        validList.add(validAmount);
    }

    public void doValid(final String bizType, final ValidReq req) {
        for(IValid valid : validList) {
            try {
                valid.valid(req);
            } catch(Exception ex) {
                // 继续一下个验证
            }
        }
    }
}
```

当然这里不够灵活，因为不同的业务还没有版本区分需要哪些实现。

## 责任链模式+spring 

针对上面提到的几个问题，我们经过思考。

针对（1），容易想到利用 spring 容器管理接口的实现。动态发现实现，而不是手动设置处理。

针对（2），不同的业务在变化，不同的业务需要的业务验证也不同，可以利用注解维护这种灵活的关系。

针对（3），比较容易想到责任链模式。统一处理方法的执行，而不是每一个方法 try-catch。

针对（4），可以利用注解属性，指定不同实现的优先级别。类似于 Spring 的各种 Filter。

### 编码

- 注解

```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Inherited
public @interface Valid {

    /**
     * 需要执行当前验证的业务类型
     * @return 对应的业务类型数组
     */
    String[] bizTypes();

    /**
     * 执行的优先级
     * 1. 根据 order 对所有需要执行的先后顺序进行排序。从小到大。
     * 2. 从1开始
     * 注意：获取的时候利用了 TreeMap 排序，所以必须保证 order 的唯一性，否则会出现覆盖。
     * @return 整数
     */
    int order();

}
```

- 使用注解

在我们定义的方法实现类中使用上面的注解

表示 ValidNum 在 ValidAmount 前面执行。

业务 simple，只需要验证数量。业务 complex，需要验证数量和金额。

```java
@Service
@Valid(bizType={"complex", "simple"}, order=1)
class ValidNum implements IValid {
    //XXX
}
```

```java
@Service
@Valid(bizType={"complex"}, order=2)
class ValidAmount implements IValid {
    //XXX
}
```

- 不同实现的类发现

这个方法时简化后的实现，去掉了很多校验和对应的日志等信息。

```java
public class ValidServiceContainer {
    // 可以自动注入 IValid 的所有子类
    @Autowired
    private List<IValid> validList;

    public List<IValid> getValidList(String bizType) {
        List<IValid> resultList = new ArrayList<>();
        //paramCheck
        for(IValid valid : validList) {
             final Class serviceClass = valid.getClass();
             final Valid valid = (Valid) serviceClass.getAnnotation(Valid.class);
             if(null == valid) {
                 continue;
             }

             String[] bizTypes = valid.bizTypes();
             if(ArrayUtils.contains(bizTypes, bizType)) {
                 int order = valid.order();
                 // 可以根据 order+valid 构建新的对象，然后排序。
                 // 此处不再演示
                 resultList.add(valid);
             }
         }
         return resultList;
    }
}
```

- 责任链执行

这里针对原来的责任链模式，调整下对应的 validList 即可。

```java
@Service
public class ValidChainService implments ValidService {

    @Autowired
    private ValidServiceContainer validServiceContainer;

    public void doValid(final String bizType, final ValidReq req) {
        final List<IValid> validList = validServiceContainer.getValidList(bizType);
        for(IValid valid : validList) {
            try {
                valid.valid(req);
            } catch(Exception ex) {
                // 继续一下个验证
            }
        }
    }
}
```

### 性能的思考

到这里我们已经基本实现了需求，但是等等。

这个方法性能好吗？

不同的业务和验证列表的关系我们都得到了，但是每一笔交易都需要进行这种反射处理一遍吗？

显然是不需要得，我们可以将业务和验证的列表关系预先处理好，后面直接获取即可。

## 优化注解版本

主要针对 container 进行优化

```java
public class ValidServiceContainer {

    //所有的业务类型
    private static List<String> BIZ_TYPE = Arrays.asList("simple", "complex");

    private static Map<String, List<IValid>> map = new HashMap();

    // 可以自动注入 IValid 的所有子类
    @Autowired
    private List<IValid> validList;

    @PostConstruct
    public void init() {
        for(String bizType : BIZ_TYPE) {
            List<IValid> resultList = new ArrayList<>();
            //paramCheck
            for(IValid valid : validList) {
                final Class serviceClass = valid.getClass();
                final Valid valid = (Valid) serviceClass.getAnnotation(Valid.class);
                if(null == valid) {
                    continue;
                }

                String[] bizTypes = valid.bizTypes();
                if(ArrayUtils.contains(bizTypes, bizType)) {
                    int order = valid.order();
                    // 可以根据 order+valid 构建新的对象，然后排序。
                    // 此处不再演示
                    resultList.add(valid);
                }
            }

            map.put(bizType, resultList);
        }
    }

    public List<IValid> getValidList(String bizType) {
        return map.get(bizType);
    }
}
```

# 总结

偷懒最好的方式就是一次把事情做完。

一般都会有更好的方式去处理。

# 拓展阅读

[TreeMap 排序方式](https://houbb.github.io/2019/03/28/data-struct-treemap)



* any list
{:toc}