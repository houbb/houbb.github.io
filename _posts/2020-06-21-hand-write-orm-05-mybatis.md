---
layout: post
title:  手写 Hibernate ORM 框架 05-mybatis 原理
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, middleware, orm, mybatis, sql, sh]
published: true
---

# 什么是 MyBatis ？

MyBatis 是一款优秀的持久层框架，它支持定制化 SQL、存储过程以及高级映射。

MyBatis 避免了几乎所有的 JDBC 代码和手动设置参数以及获取结果集。

MyBatis 可以使用简单的 XML 或注解来配置和映射原生信息，将接口和 Java 的 POJOs(Plain Old Java Objects,普通的 Java对象)映射成数据库中的记录。（这是官网解释）

# MyBatis 运行原理

![MyBatis 运行原理](https://segmentfault.com/img/remote/1460000015117931?w=400&h=343)

当框架启动时，通过configuration解析config.xml配置文件和mapper.xml映射文件，映射文件可以使用xml方式或者注解方式，然后由configuration获得sqlsessionfactory对象，再由sqlsessionfactory获得sqlsession数据库访问会话对象，通过会话对象获得对应DAO层的mapper对象，通过调用mapper对象相应方法，框架就会自动执行SQL语句从而获得结果。

讲完了，6不6，可以，牛逼，就这么简单。

此时心中是否有千万只草泥马奔涌而出，别急，对于上述，我会在下面针对重点进行一一讲解。

# xml解析&配置解析

这里请大家自行百度解决，网上也有比较多的解析库，对于大家来说应该是没有什么问题，我们这边主要抓住框架运行的总体过程。

对于细节大家可以课后慢慢研究。

## mybatis启动（编程式）

```java
String resource = "org/mybatis/example/mybatis-config.xml";
InputStream inputStream = Resources.getResourceAsStream(resource);
SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
```

我们再来看下这个build操作在底层做了什么

```java
public SqlSessionFactory build(InputStream inputStream, String environment, Properties properties) {
    SqlSessionFactory var5;
    try {
        XMLConfigBuilder parser = new XMLConfigBuilder(inputStream, environment, properties);
        var5 = this.build(parser.parse());
    } catch (Exception var14) {
        throw ExceptionFactory.wrapException("Error building SqlSession.", var14);
    } finally {
        ErrorContext.instance().reset();

        try {
            inputStream.close();
        } catch (IOException var13) {
            ;
        }
    }
    return var5;
}

public SqlSessionFactory build(Configuration config) {
    return new DefaultSqlSessionFactory(config);
}
```

我们可以很明显的看到mybatis通过XMLConfigBuilder初始化并且解析了我们的配置文件，最后得到一个Configuration类型的对象传给另外一个build操作，这个build操作最后直接new了一个DefaultSqlSessionFactory对象并且返回。


# 何为Mapper对象？

通过上面的叙述我们已经知道我们与mybatis交互主要是通过配置文件或者配置对象，但是我们最终的目的是要操作数据库的，所以mybatis为我们提供了sqlSession这个对象来进行所有的操作，也就是说我们真正通过mybatis操作数据库只要对接sqlSession这个对象就可以了。

那么问题来了，我们怎么样通过 sqlSession 来了操作数据库的呢？

## 如何获取 sqlSession？

```java
public SqlSession openSession() {
    return this.openSessionFromDataSource(this.configuration.getDefaultExecutorType(), (TransactionIsolationLevel)null, false);
}
    
private SqlSession openSessionFromDataSource(ExecutorType execType, TransactionIsolationLevel level, boolean autoCommit) {
    Transaction tx = null;

    DefaultSqlSession var8;
    try {
        Environment environment = this.configuration.getEnvironment();
        TransactionFactory transactionFactory = this.getTransactionFactoryFromEnvironment(environment);
        tx = transactionFactory.newTransaction(environment.getDataSource(), level, autoCommit);
        Executor executor = this.configuration.newExecutor(tx, execType);
        var8 = new DefaultSqlSession(this.configuration, executor, autoCommit);
    } catch (Exception var12) {
        this.closeTransaction(tx);
        throw ExceptionFactory.wrapException("Error opening session.  Cause: " + var12, var12);
    } finally {
        ErrorContext.instance().reset();
    }
    
    return var8;
}
```

由上面代码我们可知我们可以通过SqlSessionFactory的openSession去获取我们的sqlSession，也就是默认得到一个DefaultSqlSession对象。

## 问题2：Mapper对象怎么来的？

平时我们使用如下代码获得一个Mapper对象。

```java
public <T> T getMapper(Class<T> type) {
    return this.configuration.getMapper(type, this);
}
```

通过调用DefaultSqlSession的getMapper方法并且传入一个类型对象获取，底层呢调用的是配置对象configuration的getMapper方法，configuration对象是我们在加载DefaultSqlSessionFactory时传入的。

然后我们再来看下这个配置对象的getMapper，传入的是类型对象（补充一点这个类型对象就是我们平时写的DAO层接口，里面是一些数据库操作的接口方法。），和自身也就是DefaultSqlSession。

```java
public <T> T getMapper(Class<T> type, SqlSession sqlSession) {
    return this.mapperRegistry.getMapper(type, sqlSession);
}
```

我们看到这个configuration的getMapper方法里调用的是mapperRegistry的getMapper方法，参数依然是类型对象和sqlSession。

这里呢，我们要先来看下这个MapperRegistry即所谓Mapper注册器是什么。

```java
public class MapperRegistry {
    private final Configuration config;
    private final Map<Class<?>, MapperProxyFactory<?>> knownMappers = new HashMap();

    public MapperRegistry(Configuration config) {
        this.config = config;
    }
    //....
}
```

从这里我们可以知道其实啊这个MapperRegistry就是保持了一个Configuration对象和一个HashMap，而这个HashMap的key是类型对象，value呢是MapperProxyFactory。

我们这里先不管MapperProxyFactory是什么东西，我们现在只需要知道MapperRegistry是这么一个东西就可以了。

这里有人会问MapperRegistry对象是怎么来的，这里呢是在初始化Configuration对象时初始化了这个MapperRegistry对象的，代码大家可以去看，为了避免混乱，保持贴出来的代码是一条线走下来的，这里就不贴出来了。

接下来我们继续看下这个MapperRegistry的getMapper方法。

```java
public <T> T getMapper(Class<T> type, SqlSession sqlSession) {
    MapperProxyFactory<T> mapperProxyFactory = (MapperProxyFactory)this.knownMappers.get(type);
    if (mapperProxyFactory == null) {
        throw new BindingException("Type " + type + " is not known to the MapperRegistry.");
    } else {
        try {
            return mapperProxyFactory.newInstance(sqlSession);
        } catch (Exception var5) {
            throw new BindingException("Error getting mapper instance. Cause: " + var5, var5);
        }
    }
}
```

这里我们可以看到从knownMappers中获取key为类型对象的MapperProxyFactory对象。

然后调用MapperProxyFactory对象的newInstance方法返回，newInstance方法传入sqlSession对象。

到这里我们可能看不出什么端倪，那我们就继续往下看这个newInstance方法做的什么事情吧。

```java
public class MapperProxyFactory<T> {
    private final Class<T> mapperInterface;
    private final Map<Method, MapperMethod> methodCache = new ConcurrentHashMap();

    public MapperProxyFactory(Class<T> mapperInterface) {
        this.mapperInterface = mapperInterface;
    }

    public Class<T> getMapperInterface() {
        return this.mapperInterface;
    }

    public Map<Method, MapperMethod> getMethodCache() {
        return this.methodCache;
    }

    protected T newInstance(MapperProxy<T> mapperProxy) {
        return Proxy.newProxyInstance(this.mapperInterface.getClassLoader(), new Class[]{this.mapperInterface}, mapperProxy);
    }

    public T newInstance(SqlSession sqlSession) {
        MapperProxy<T> mapperProxy = new MapperProxy(sqlSession, this.mapperInterface, this.methodCache);
        return this.newInstance(mapperProxy);
    }
}
```

这里我们可以看到MapperProxyFactory直接new了一个MapperProxy对象，然后调用另外一重载的newInstance方法传入MapperProxy对象。

这里我们可以看出一些东西了，通过调用Proxy.newProxyInstance动态代理了我们的mapperProxy对象！

这里的mapperInterface即我们的dao层（持久层）接口的类型对象。

所以总结下就是我们**通过sqlSesssion.getMapper(clazz)得到的Mapper对象是一个mapperProxy的代理类**！

所以也就引出下面的问题。

## 问题3：为什么我调用mapper对象方法就能发出sql操作数据库？

通过上面的讲解，我们知道了这个mapper对象其实是一个一个mapperProxy的代理类！

所以呢这个mapperProxy必然实现了InvocationHandler接口。

```java
public class MapperProxy<T> implements InvocationHandler, Serializable {
    private static final long serialVersionUID = -6424540398559729838L;
    private final SqlSession sqlSession;
    private final Class<T> mapperInterface;
    private final Map<Method, MapperMethod> methodCache;

    public MapperProxy(SqlSession sqlSession, Class<T> mapperInterface, Map<Method, MapperMethod> methodCache) {
        this.sqlSession = sqlSession;
        this.mapperInterface = mapperInterface;
        this.methodCache = methodCache;
    }
    //....
}
```

所以当我们调用我们的持久层接口的方法时必然就会调用到这个MapperProxy对象的invoke方法，所以接下来我们进入这个方法看看具体mybatis为我们做了什么。

```java
public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
    if (Object.class.equals(method.getDeclaringClass())) {
        try {
            return method.invoke(this, args);
        } catch (Throwable var5) {
            throw ExceptionUtil.unwrapThrowable(var5);
        }
    } else {
        MapperMethod mapperMethod = this.cachedMapperMethod(method);
        return mapperMethod.execute(this.sqlSession, args);
    }
}

private MapperMethod cachedMapperMethod(Method method) {
    MapperMethod mapperMethod = (MapperMethod)this.methodCache.get(method);
    if (mapperMethod == null) {
        mapperMethod = new MapperMethod(this.mapperInterface, method, this.sqlSession.getConfiguration());
        this.methodCache.put(method, mapperMethod);
    }

    return mapperMethod;
}
```

从代码中我们可以看到前面做了一个判断，这个判断主要是防止我们调用像toString方法或者equals方法时也能正常调用。

然后我们可以看到它调用cachedMapperMethod返回MapperMethod对象，接着就执行这个MapperMethod对象的execute方法。

这个cachedMapperMethod方法主要是能缓存我们使用过的一些mapperMethod对象，方便下次使用。

这个MapperMethod对象主要是获取方法对应的sql命令和执行相应SQL操作等的处理，具体细节同学们可以抽空研究。

```java
public class MapperMethod {
    private final MapperMethod.SqlCommand command;
    private final MapperMethod.MethodSignature method;

    public MapperMethod(Class<?> mapperInterface, Method method, Configuration config) {
        this.command = new MapperMethod.SqlCommand(config, mapperInterface, method);
        this.method = new MapperMethod.MethodSignature(config, mapperInterface, method);
    }
    ....
}
```

说到这个mapperMethod对象的execute方法，我们看下代码具体做了什么事情吧。

```java
public Object execute(SqlSession sqlSession, Object[] args) {
    Object param;
    Object result;
    switch(this.command.getType()) {
    case INSERT:
        param = this.method.convertArgsToSqlCommandParam(args);
        result = this.rowCountResult(sqlSession.insert(this.command.getName(), param));
        break;
    case UPDATE:
        param = this.method.convertArgsToSqlCommandParam(args);
        result = this.rowCountResult(sqlSession.update(this.command.getName(), param));
        break;
    case DELETE:
        param = this.method.convertArgsToSqlCommandParam(args);
        result = this.rowCountResult(sqlSession.delete(this.command.getName(), param));
        break;
    case SELECT:
        if (this.method.returnsVoid() && this.method.hasResultHandler()) {
            this.executeWithResultHandler(sqlSession, args);
            result = null;
        } else if (this.method.returnsMany()) {
            result = this.executeForMany(sqlSession, args);
        } else if (this.method.returnsMap()) {
            result = this.executeForMap(sqlSession, args);
        } else if (this.method.returnsCursor()) {
            result = this.executeForCursor(sqlSession, args);
        } else {
            param = this.method.convertArgsToSqlCommandParam(args);
            result = sqlSession.selectOne(this.command.getName(), param);
        }
        break;
    case FLUSH:
        result = sqlSession.flushStatements();
        break;
    default:
        throw new BindingException("Unknown execution method for: " + this.command.getName());
    }

    if (result == null && this.method.getReturnType().isPrimitive() && !this.method.returnsVoid()) {
        throw new BindingException("Mapper method '" + this.command.getName() + " attempted to return null from a method with a primitive return type (" + this.method.getReturnType() + ").");
    } else {
        return result;
    }
}
```

我们可以清晰的看到这里针对数据库的增删改查做了对应的操作，这里我们可以看下查询操作。

我们可以看到这里针对方法的不同返回值作了不同的处理，我们看下其中一种情况。

```java
param = this.method.convertArgsToSqlCommandParam(args);
result = sqlSession.selectOne(this.command.getName(), param);
```

这里我们可以看到它将方法参数类型转换成数据库层面上的参数类型，最后调用sqlSession对象的selectOne方法执行。

所以我们看到最后还是回到sqlSession对象上来，也就是前面所说的sqlSession是mybatis提供的与数据库交互的唯一对象。

接下来我们看下这个selectOne方法做了什么事，这里我们看的是defaultSqlSession的selectOne方法。

```java
public <T> T selectOne(String statement, Object parameter) {
    List<T> list = this.selectList(statement, parameter);
    if (list.size() == 1) {
        return list.get(0);
    } else if (list.size() > 1) {
        throw new TooManyResultsException("Expected one result (or null) to be returned by selectOne(), but found: " + list.size());
    } else {
        return null;
    }
}
```

我们看到它调用selectList方法，通过去返回值的第一个值作为结果返回。

那么我们来看下这个selectList方法。

```java
public <E> List<E> selectList(String statement, Object parameter) {
    return this.selectList(statement, parameter, RowBounds.DEFAULT);
}

public <E> List<E> selectList(String statement, Object parameter, RowBounds rowBounds) {
    List var5;
    try {
        MappedStatement ms = this.configuration.getMappedStatement(statement);
        var5 = this.executor.query(ms, this.wrapCollection(parameter), rowBounds, Executor.NO_RESULT_HANDLER);
    } catch (Exception var9) {
        throw ExceptionFactory.wrapException("Error querying database.  Cause: " + var9, var9);
    } finally {
        ErrorContext.instance().reset();
    }

    return var5;
}
```

我们可以看到这里调用了executor的query方法，我们再进入到query里看看。

这里我们看的是BaseExecutor的query方法。

```java
public <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler) throws SQLException {
    BoundSql boundSql = ms.getBoundSql(parameter);
    CacheKey key = this.createCacheKey(ms, parameter, rowBounds, boundSql);
    return this.query(ms, parameter, rowBounds, resultHandler, key, boundSql);
}

public <E> List<E> query(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql) throws SQLException {
    ErrorContext.instance().resource(ms.getResource()).activity("executing a query").object(ms.getId());
    if (this.closed) {
        throw new ExecutorException("Executor was closed.");
    } else {
        if (this.queryStack == 0 && ms.isFlushCacheRequired()) {
            this.clearLocalCache();
        }

        List list;
        try {
            ++this.queryStack;
            list = resultHandler == null ? (List)this.localCache.getObject(key) : null;
            if (list != null) {
                this.handleLocallyCachedOutputParameters(ms, key, parameter, boundSql);
            } else {
                list = this.queryFromDatabase(ms, parameter, rowBounds, resultHandler, key, boundSql);
            }
        } finally {
            --this.queryStack;
        }

        if (this.queryStack == 0) {
            Iterator i$ = this.deferredLoads.iterator();

            while(i$.hasNext()) {
                BaseExecutor.DeferredLoad deferredLoad = (BaseExecutor.DeferredLoad)i$.next();
                deferredLoad.load();
            }

            this.deferredLoads.clear();
            if (this.configuration.getLocalCacheScope() == LocalCacheScope.STATEMENT) {
                this.clearLocalCache();
            }
        }

        return list;
    }
}
```

这里我们抓住这样的一句话

```java
list = this.queryFromDatabase(ms, parameter, rowBounds, resultHandler, key, boundSql);
```

进入这个方法

```java
private <E> List<E> queryFromDatabase(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, CacheKey key, BoundSql boundSql) throws SQLException {
    this.localCache.putObject(key, ExecutionPlaceholder.EXECUTION_PLACEHOLDER);

    List list;
    try {
        list = this.doQuery(ms, parameter, rowBounds, resultHandler, boundSql);
    } finally {
        this.localCache.removeObject(key);
    }

    this.localCache.putObject(key, list);
    if (ms.getStatementType() == StatementType.CALLABLE) {
        this.localOutputParameterCache.putObject(key, parameter);
    }

    return list;
}
```

我们看到有个一个方法doQuery，进入方法看看做了什么。

点进去后我们发现是抽象方法，我们选择simpleExecutor子类查看实现。

```java
public <E> List<E> doQuery(MappedStatement ms, Object parameter, RowBounds rowBounds, ResultHandler resultHandler, BoundSql boundSql) throws SQLException {
    Statement stmt = null;

    List var9;
    try {
        Configuration configuration = ms.getConfiguration();
        StatementHandler handler = configuration.newStatementHandler(this.wrapper, ms, parameter, rowBounds, resultHandler, boundSql);
        stmt = this.prepareStatement(handler, ms.getStatementLog());
        var9 = handler.query(stmt, resultHandler);
    } finally {
        this.closeStatement(stmt);
    }

    return var9;
}

private Statement prepareStatement(StatementHandler handler, Log statementLog) throws SQLException {
    Connection connection = this.getConnection(statementLog);
    Statement stmt = handler.prepare(connection, this.transaction.getTimeout());
    handler.parameterize(stmt);
    return stmt;
}
```

我们可以看到通过configuration对象的newStatementHandler方法构建了一个StatementHandler，然后在调用prepareStatement方法中获取连接对象，通过StatementHandler得到Statement对象。

另外我们注意到在获取了Statement对象后调用了parameterize方法。

继续跟踪下去（自行跟踪哈）我们可以发现会调用到ParameterHandler对象的setParameters去处理我们的参数。

所以这里的prepareStatement方法主要使用了StatementHandler和ParameterHandler对象帮助我们处理语句集和参数的处理。

最后还调用了StatementHandler的query方法，我们继续跟踪下去。

这里我们进入到PreparedStatementHandler这个handler查看代码。

```java
public <E> List<E> query(Statement statement, ResultHandler resultHandler) throws SQLException {
    c ps = (PreparedStatement)statement;
    ps.execute();
    return this.resultSetHandler.handleResultSets(ps);
}
```

看到这里，我们终于找到了操作数据库的地方了，就是ps.execute()这句代码。底层我们可以发现就是我们平时写的JDBC！然后将这个执行后的PreparedStatement交给resultSetHandler处理结果集，最后返回我们需要的结果集。

以上，我们将mybatis的总体运行思路跟大家讲解了一遍，很多地方没有讲到细节上，因为本篇主要目的就是带大家熟悉mybatis总体流程的，细节大家可以私底下结合mybatis的执行流程去梳理和理解。

# 参考资料

[mybatis 原理概括](https://segmentfault.com/a/1190000015117926)

* any list
{:toc}