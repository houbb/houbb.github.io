---
layout: post
title: spring 如何动态注入 Bean，根据开关动态指定
date:  2023-08-02 +0800
categories: [Spring]
tags: [spring, sh]
published: true
---

# 业务背景

写了基于 aop 切面的统一组件，因为有些切面的涉及点比较多，有些客户端的写法不够规范。

比如 final，或者用户自定义注解增强之后无法获取。

1）希望用户可以动态指定 aop 等注入类信息

2）希望根据条件，比如是否存在 class 动态配置

# 动态注册bean的两种api

Spring中的bean定义都保存在 BeanDefinitionRegistry 接口中，单例的bean的实例都保存在 SingletonBeanRegistry 接口中。

因此动态注册bean也分为了两种方式：

使用BeanDefinitionRegistry接口的 `void registerBeanDefinition(String beanName, BeanDefinition beanDefinition) throws BeanDefinitionStoreException` 方法

使用SingletonBeanRegistry接口的 `void registerSingleton(String beanName, Object singletonObject)` 方法

两者区别在于使用前者时，Spring容器会根据BeanDefinition实例化bean实例，而使用后者时，bean实例就是传递给registerSingleton方法的对象。

这里DefaultListableBeanFactory接口同时实现了这两个接口，在实践中通常会使用这个接口。

## 注意

我们可以在任何获得了BeanDefinitionRegistry或者SingletonBeanRegistry实例的地方进行动态注册。

但是如果bean不是在BeanFactoryPostProcessor中被注册，那么该bean则无法被BeanPostProcessor处理，即无法对其应用aop、Bean Validation等功能（因为IOC中绑定AOP发生在BeanPostProcessor的Spring生命周期方法里）。

## 在 BeanFactoryPostProcessor 中进行动态注册

```java
public class PersonBeanFactoryPostProcessor implements BeanFactoryPostProcessor {
    
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        DefaultListableBeanFactory defaultListableBeanFactory
                = (DefaultListableBeanFactory) beanFactory;

        //注册Bean定义，容器根据定义返回bean
        log.info("register personManager1>>>>>>>>>>>>>>>>");
        BeanDefinitionBuilder beanDefinitionBuilder =
                BeanDefinitionBuilder.genericBeanDefinition(PersonManager.class);
        beanDefinitionBuilder.addPropertyReference("personDao", "personDao");
        BeanDefinition personManagerBeanDefinition = beanDefinitionBuilder.getRawBeanDefinition();
        defaultListableBeanFactory.registerBeanDefinition("personManager1", personManagerBeanDefinition);

        //注册bean实例
        log.info("register personManager2>>>>>>>>>>>>>>>>");
        PersonDao personDao = beanFactory.getBean(PersonDao.class);
        PersonManager personManager = new PersonManager();
        personManager.setPersonDao(personDao);
        beanFactory.registerSingleton("personManager2", personManager);

    }

}
```

## 在普通bean中注册

```java
@RestController
@Slf4j
public class PersonManagerRegisterController {

    /**
     * The Application context.
     */
    @Autowired
    GenericApplicationContext applicationContext;

    /**
     * The Bean factory.
     */
    @Autowired
    ConfigurableBeanFactory beanFactory;

    /**
     * 动态注册bean，此处注册的bean没有AOP的支持
     */
    @GetMapping("/registerPersonManager")
    public void registerPersonManager() {
        PersonDao personDao = applicationContext.getBean(PersonDao.class);
        PersonManager personManager = new PersonManager();
        personManager.setPersonDao(personDao);
        beanFactory.registerSingleton("personManager3", personManager);
    }
```

# 小结

对于通用的组件，最好添加对应的开关，便于用户灵活配置。

# 参考资料

https://www.cnblogs.com/powerwu/articles/15802508.html

[spring之动态注册bean](https://blog.csdn.net/weixin_41979002/article/details/119449490)

[Spring实战系列（四）-动态注入接口Bean](https://dandelioncloud.cn/article/details/1528525384295661569)

https://segmentfault.com/a/1190000041997048

https://www.lmlphp.com/user/16876/article/item/579236/

[spring能做到动态注入吗?](https://www.zhihu.com/question/49587758/answer/2868532061?utm_id=0)

* any list
{:toc}