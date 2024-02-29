---
layout: post
title: Mybatis-08-mybatis selectKey 赋值未生效，为什么？
date:  2016-07-27 10:40:05 16:09:17 +0800
categories: [SQL]
tags: [mybatis, database]
published: true
---

# Statement配置如下：

```xml
 <insert id="insertStatemnet" parameterType="User">
       insert into user ( user_name )  
       values  (#{user#userName})
  	 <selectKey resultType="long" order="AFTER"
             keyProperty="id">
      	SELECT LAST_INSERT_ID() 
  	</selectKey>
  </insert>
```

# Dao 层代码如下

```java
public interface UserMapper{
   int insert(@Param(user) User user);
}
```

```java
class User{
     long id;
     String userName;

     ...getter/setter
}


User user = userMapper.insert(user);

user.getId() 获取的结果等于0
```

使用Mybatis Insert User表，使用selectKey获取LAST_INSERT_ID() ,赋值给user的id属性，发现id属性值未被set进去，user.getId() 获取的结果等于0，会话的LAST_INSERT_ID() 已经到远远超过0了，返回0明显是不对的。

关于LAST_INSERT_ID() 可以参考 [LAST_INSERT_ID](https://blog.csdn.net/wt_better/article/details/121876696?csdn_share_tail=%7B%22type%22:%22blog%22,%22rType%22:%22article%22,%22rId%22:%22121876696%22,%22source%22:%22wt_better%22%7D) 文章。

# 开始探究为什么？

属性值获取到的是0，要么是SELECT LAST_INSERT_ID() sql未执行，使用了id long类型的默认值0，要么是执行了但获取到的值是0，或者是Mybatis set对象id属性值的时候没set进去。

Mybatis使用SelectKeyGenerator处理selectKey标签，从这里开始入手

```java
private void processGeneratedKeys(Executor executor, MappedStatement ms, Object parameter) {
    try {
      if (parameter != null && keyStatement != null && keyStatement.getKeyProperties() != null) {
        String[] keyProperties = keyStatement.getKeyProperties();
        final Configuration configuration = ms.getConfiguration();
        final MetaObject metaParam = configuration.newMetaObject(parameter);
        if (keyProperties != null) {
          Executor keyExecutor = configuration.newExecutor(executor.getTransaction(), ExecutorType.SIMPLE);
          List<Object> values = keyExecutor.query(keyStatement, parameter, RowBounds.DEFAULT, Executor.NO_RESULT_HANDLER);
          if (values.size() == 0) {
            throw new ExecutorException("SelectKey returned no data.");            
          } else if (values.size() > 1) {
            throw new ExecutorException("SelectKey returned more than one value.");
          } else {
            MetaObject metaResult = configuration.newMetaObject(values.get(0));
            ...
            setValue(metaParam, keyProperties[0], values.get(0));
            ....
          }
        }
      }
    } catch (ExecutorException e) {
      throw e;
    } catch (Exception e) {
      throw new ExecutorException("Error selecting key or setting result to parameter object. Cause: " + e, e);
    }
  }
```

验证发现keyExecutor.query获取到的values是[100]，说明SELECT LAST_INSERT_ID() 查询没问题，那问题必然出现在下面的setValue方法里面。

继续跟进setValue，setValue最终走的是ObjectWrapper的实现类MapWrapper#set，

```java
class MapWrapper{
	  @Override
	  public void set(PropertyTokenizer prop, Object value) {
	    if (prop.getIndex() != null) {
	      Object collection = resolveCollection(prop, map);
	      setCollectionValue(prop, collection, value);
	    } else {
	      map.put(prop.getName(), value);
	    }
	  }
}
```

该方法set只是在map里面put了一个kv，理论上Mybatis要对字段赋值的话，应该反射调用对象Filed的set方法。

于此同时看到ObjectWrapper有一个实现类BeanWrapper，其中的set方法是反射set字段值，刚好和我们预期的想法一致。

```java
class BeanWrapper{
  @Override
  public void set(PropertyTokenizer prop, Object value) {
    if (prop.getIndex() != null) {
      Object collection = resolveCollection(prop, object);
      setCollectionValue(prop, collection, value);
    } else {
      setBeanProperty(prop, object, value);
    }
  }
}
```

此估计就是决策ObjectWrapper的时候出现问题导致的属性值为set进去，下面是获取ObjectWrapper实现的代码片段：

```java
private MetaObject(Object object, ObjectFactory objectFactory, ObjectWrapperFactory objectWrapperFactory, ReflectorFactory reflectorFactory) {
    this.originalObject = object;
    this.objectFactory = objectFactory;
    this.objectWrapperFactory = objectWrapperFactory;
    this.reflectorFactory = reflectorFactory;

    if (object instanceof ObjectWrapper) {
      this.objectWrapper = (ObjectWrapper) object;
    } else if (objectWrapperFactory.hasWrapperFor(object)) {
      this.objectWrapper = objectWrapperFactory.getWrapperFor(this, object);
    } else if (object instanceof Map) {
      this.objectWrapper = new MapWrapper(this, (Map) object);
    } else if (object instanceof Collection) {
      this.objectWrapper = new CollectionWrapper(this, (Collection) object);
    } else {
      this.objectWrapper = new BeanWrapper(this, object);
    }
  }
```

理论上要走到else逻辑的，实际object类型是MapperMethod.ParamMap类型，走到了Map分支。

MapperMethod.ParamMap类型是在MapperMethod执行过程中转换java对象参数到sql命令行参数生成的，具体参考ParamNameResolver#getNamedParams

```java
 public Object getNamedParams(Object[] args) {
    final int paramCount = names.size();
    if (args == null || paramCount == 0) {
      return null;
    } else if (!hasParamAnnotation && paramCount == 1) {
      return args[names.firstKey()];
    } else {
      final Map<String, Object> param = new ParamMap<Object>();
      int i = 0;
      for (Map.Entry<Integer, String> entry : names.entrySet()) {
        param.put(entry.getValue(), args[entry.getKey()]);
        // add generic param names (param1, param2, ...)
        final String genericParamName = GENERIC_NAME_PREFIX + String.valueOf(i + 1);
        // ensure not to overwrite parameter named with @Param
        if (!names.containsValue(genericParamName)) {
          param.put(genericParamName, args[entry.getKey()]);
        }
        i++;
      }
      return param;
    }
  }
```

因为Mapper方法参数里面标注了@Param注解，导致生成的是MapperMethod.ParamMap。

回过头来理下，因为Mapper方法参数里面标注了@Param注解，导致生成的sql参数类型是MapperMethod.ParamMap，继而导致获取MetaObject的时候ObjectWrapper被错误决策成MapWrapper，导致setValue属性值未set进去。

实际上还是使用不规范导致的问题，去掉方法上的@Param注解即可正常运行，

# 参考资料

https://blog.csdn.net/wt_better/article/details/128851775

https://blog.csdn.net/m0_46205920/article/details/122103024

[Mybatis selectKey 采坑笔记](https://blog.csdn.net/song19890528/article/details/80680313)

* any list
{:toc}
