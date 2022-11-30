---
layout: post
title:  mybatis plus 如何实现复杂的 and (xxx OR xxx) 的实现？
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, middleware, orm, mybatis, sql, sh]
published: true
---

# 业务场景

一般的简单语句，平时都是使用 mybatis-plus 实现的。

不过业务上遇到了一个稍微复杂点的语句：

每个用户，都可以拥有多个角色，对应 privilgeList；每篇文章，都可执行哪些指定的角色可以查看。

文章表：learn_content，通过 privilge 字段存储，多个之间逗号隔开。没有采用一对多表的设计。


# 实现

## mybatis-plus 版本

不同版本的语法可能不同，但是原理是一样的。

当前测试版本较低为：2.3.3

## MP 的 andNew

看了下 MP 对应的 andNew 的语法。

```java
public Wrapper<T> andNew(boolean condition, String sqlAnd, Object... params) {
    if (condition) {
        ((SqlPlus)this.sql.AND_NEW()).WHERE(this.formatSql(sqlAnd, params));
    }
    return this;
}
```

formatSql 为：

```java
protected String formatSqlIfNeed(boolean need, String sqlStr, Object... params) {
    if (need && !StringUtils.isEmpty(sqlStr)) {
        if (ArrayUtils.isNotEmpty(params)) {
            for(int i = 0; i < params.length; ++i) {
                String genParamName = "MPGENVAL" + this.paramNameSeq.incrementAndGet();
                sqlStr = sqlStr.replace(String.format("{%s}", i), String.format("#{%s.paramNameValuePairs.%s}", this.getParamAlias(), genParamName));
                this.paramNameValuePairs.put(genParamName, params[i]);
            }
        }
        return sqlStr;
    } else {
        return null;
    }
}
```

知道之后，我们按照入参要求，拼接对应的实现即可。

## java 实现

动态拼接一个 `and (privilege_list like '%?%' OR privilege_list like '%?%')` 格式的 SQL。

```java
@Override
public Wrapper<LearnContent> selectWithAuth (Wrapper<LearnContent> entityWrapper) {
    // 获取用户的权限
    List<String> privilegeList = this.getPrivilegeList();

    //构造权限的查询条件，用or连接，满足其中任何一个即可。
    StringBuilder sqlBuilder = new StringBuilder();
    Object[] params = new Object[privilegeList.size()];

    for (int i = 0; i < privilegeList.size(); i++) {
        if (i == 0) {
            sqlBuilder.append(String.format(" privilege_list like %s ", "'%" + privilegeList.get(i) + "%'"));
        } else {
            sqlBuilder.append(String.format(" OR privilege_list like %s ", "'%" + privilegeList.get(i) + "%'"));
        }
        params[i] = privilegeList.get(i);
    }
    entityWrapper.andNew(sqlBuilder.toString(), params);


    return entityWrapper;
}
```

# 参考资料


* any list
{:toc}