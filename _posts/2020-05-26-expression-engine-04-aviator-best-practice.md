---
layout: post
title:  java 表达式引擎概览-04-google 表达式引擎最佳实践
date:  2020-5-26 15:11:16 +0800
categories: [Engine]
tags: [engine, expression-engine]
published: true
---

# 最佳实践

https://www.yuque.com/boyan-avfmj/aviatorscript/ou23gy


# 建议最少加上这2个

```java
static {
    // 默认方法执行 60S?
    AviatorEvaluator.getInstance().useLRUExpressionCache(20000);
    AviatorEvaluator.setOption(Options.EVAL_TIMEOUT_MS, 10000);
}
```

# 使用编译缓存模式

5.x 官方原话：

```
默认的编译方法如 compile(script) 、 compileScript(path 以及 execute(script, env) 都不会缓存编译的结果，每次都将重新编译表达式，生成一些匿名类，然后返回编译结果 Expression 实例， execute 方法会继续调用 Expression#execute(env) 执行。

这种模式下有两个问题：
1. 每次都重新编译，如果你的脚本没有变化，这个开销是浪费的，非常影响性能。
2. 编译每次都产生新的匿名类，这些类会占用 JVM 方法区(Perm 或者 metaspace），内存逐步占满，并最终触发  full gc。

因此，通常更推荐启用编译缓存模式， compile 、 compileScript 以及 execute 方法都有相应的重载方法，允许传入一个 boolean cached 参数，表示是否启用缓存，建议设置为 true：
```

对应的代码

```java
public final class AviatorEvaluatorInstance {
  public Expression compile(final String expression, final boolean cached)
  public Expression compile(final String cacheKey, final String expression, final boolean cached)
  public Expression compileScript(final String path, final boolean cached) throws IOException
  public Object execute(final String expression, final Map<String, Object> env,
      final boolean cached)      
}
```

## LRU 缓存
 
默认使用的缓存是 ConcurrentHashMap ，没有自动淘汰机制，5.0 开始引入了 LRU 缓存，可指定缓存的表达式个数，比如设置为最大 1 万个缓存结果：

```java
AviatorEvaluator.getInstance().useLRUExpressionCache(10000);
```

但是性能会比默认缓存略差。

## 缓存管理

AviatorEvaluatorInstance 有一系列用于管理缓存的方法：
● 获取当前缓存大小，缓存的编译结果数量 getExpressionCacheSize() 
● 获取脚本对应的编译缓存结果 getCachedExpression(script) 或者根据 cacheKey 获取 getCachedExpressionByKey(cacheKey) ，如果没有缓存过，返回 null。
● 失效缓存 invalidateCache(script) 或者 invalidateCacheByKey(cacheKey) 。
● 清空缓存 clearExpressionCache() 。

当然，你也可以自行管理编译结果，使用你喜欢的缓存系统，根据需求来定制。

## 匿名类的卸载

对于 JDK7（目前兼容的最老 JDK 版本），默认情况下会为每一个 AviatorEvaluatorInstance 使用一个 ClassLoader 来定义并生成匿名类，这种情况下，类的卸载只会发生在所有类的引用都不存在的情况下，需要默认 ClassLoader 也被垃圾回收，因此仅调用 invalidateCache 是不够的，还需要调用 resetClassLoader() 才可以让某个脚本的编译结果被回收。

对于 JDK8 及以上版本， AviatorScript 会使用跟 Java Lambda 一样的生成机制来生成匿名类，这些类可以被正常 GC 回收，只需要对应的编译结果没有引用就可以，因此调用 invalidateCache 使得缓存失效即可。

在 IBM J9 或者其他 JDK 上，默认启用的是 classloader 模式，建议同 JDK7 。如果你强制设置了 aviator.preferClassloaderDefiner 环境变量为 true，也就是启用 classloader 定义模式，建议也是和 JDK7 一致。

## 默认缓存模式

从 5.2.2 开始，提供默认缓存模式，通过设置 AviatorEvaluatorInstance#setCachedExpressionByDefault(boolean) 来决定是否开启，开启默认缓存模式后，调用 compile(script) 、 compileScript(path) 和 execute(script, [env]) 方法的时候，将默认启用编译缓存，带 cached 参数的重载版本仍然将优先尊重  cached 参数。
通过下列代码开启：

```java
AviatorEvaluator.getInstance().setCachedExpressionByDefault(true);
```

## 高精度计算模式

对于货币计算，或者科学数值计算等场景，需要极高的精度，这种情况下你可以通过设置下列两个选项：

● Options.ALWAYS_PARSE_FLOATING_POINT_NUMBER_INTO_DECIMAL 强制将所有浮点数（包括科学计数法）都解析为 decimal 类型。
● Options.ALWAYS_PARSE_INTEGRAL_NUMBER_INTO_DECIMAL 将所有整数解析为 decimal 类型。

来强制将脚本中出现的字面量数字都解析为 decimal 类型参与高精度运算，但是从外部传入的变量需要用户自行保证。

设定运算精度可以通过 Options.MATH_CONTEXT 选项，默认是 MathContext.DECIMAL128 。

## 安全沙箱模式（安全需知）

默认情况下， AviatorScript 会启用所有的语言特性。对于将 AviatorScript 作为一个语言沙箱来使用的场景，用户编写的脚本可能是千奇百怪的，有各种各样的安全隐患（比如写一个死循环），这种场景建议：

● 关闭模块系统，也就是 Feature.Module ，避免用户加载外部模块。
● 关闭 new 语法特性，避免用户任意创建对象，也就是禁用 Feature.NewInstance ，对于需要创建特定对象的场景，建议提供有限的自定义函数。
● 最小化语言特性集合，仅提供你想提供的语言特性。
● 关闭反射调用机制，默认不打开，但是在 Scripting API 模式下会打开，可以通过下列方法关闭

```java
    final ScriptEngineManager sem = new ScriptEngineManager();
    ScriptEngine engine = sem.getEngineByName("AviatorScript");
    AviatorEvaluatorInstance instance = ((AviatorScriptEngine) engine).getEngine();
    instance.setFunctionMissing(null);
```


● 设置最大循环次数上限，避免死循环出现，也就是设置 Options.MAX_LOOP_COUNT 。
● 设置允许用户在 new 语句或者静态变量（方法）访问的时候使用的 Class 白名单，通过 Options.ALLOWED_CLASS_SET 选项（5.2.2 新增），比如禁止调用  System.exit(0) 这样的危险操作。

禁用和启用单个选项可以通过 AviatorEvaluatorInstance 的 enableFeature(feature) 和 disableFeature(feature) 方法。

最后，任何情况下都应该尽量避免将执行脚本的接口开放到不安全的环境，比如公网等，如果确实需要开放，也应该遵循上述安全建议，并且接口加上必要的鉴权机制。

更多选项参见完整选项列表。

## 性能建议

● 优先使用执行优先模式（默认模式）。
● 使用编译结果缓存模式，复用编译结果，传入不同变量执行。
● 外部变量传入，优先使用编译结果的 Expression#newEnv(..args) 方法创建外部 env，将会启用符号化，降低变量访问开销。
● 生产环境切勿打开执行跟踪模式。
● 调用 Java 方法，优先使用自定义函数，其次是导入方法，最后是基于 FunctionMissing 的反射模式。


# 完整配置项

https://www.yuque.com/boyan-avfmj/aviatorscript/yr1oau#YElIP

## 求值超时设置：EVAL_TIMEOUT_MS

**这个配置非常重要，避免死循环**。

从 5.4.2 版本开始，支持执行的超时设置，当超过设定时间时，将抛出 com.googlecode.aviator.exception.com.googlecode.aviator.exception.TimeoutException异常，例如以下代码将设置超时为 100 毫秒：

```java
AviatorEvaluator.setOption(Options.EVAL_TIMEOUT_MS, 100);
AviatorEvaluator.execute("while(true) { }");
```







# 参考资料

https://www.yuque.com/boyan-avfmj/aviatorscript/guhmrc

* any list
{:toc}