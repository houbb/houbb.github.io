---
layout: post
title:  idempotent 幂等性防止重复提交
date:  2020-7-16 09:19:18 +0800
categories: [Design]
tags: [design, sh]
published: true
---

# 幂等性

[幂等性](https://houbb.github.io/2018/09/02/idempotency-patterns)

## 数据库操作的幂等性

在我们编程中常见幂等

- select 查询天然幂等

- delete 删除也是幂等,删除同一个多次效果一样

- update 直接更新某个值的,幂等

- update 更新累加操作的,非幂等

- insert 非幂等操作,每次新增一条

# 重复提交的原因

由于重复点击或者网络重发 eg:

点击提交按钮两次;

点击刷新按钮;

使用浏览器后退按钮重复之前的操作，导致重复提交表单;

使用浏览器历史记录重复提交表单;

浏览器重复的HTTP请求;

nginx重发等情况;

分布式RPC的try重发等;

## 分类

主要有 2 个部分：

（1）前端用户操作

（2）网络请求可能存在重试

## 解决思路

（1）前端

从页面的层面解决

（2）后端

幂等的处理

# 前端解决方案

## 按钮禁用

点击之后，按钮禁用。

比如常见的发送验证码，60S 等待。

## PRG 重定向

在提交后执行页面重定向，这就是所谓的Post-Redirect-Get (PRG)模式。

简言之，当用户提交了表单后，你去执行一个客户端的重定向，转到提交成功信息页面。

这能避免用户按F5导致的重复提交，而且也不会出现浏览器表单重复提交的警告，也能消除按浏览器前进和后退按导致的同样问题。

# HTTP 结合处理

## session 中添加标识

在服务器端，生成一个唯一的标识符，将它存入session，同时将它写入表单的隐藏字段中，然后将表单页面发给浏览器，用户录入信息后点击提交，在服务器端，获取表单中隐藏字段的值，与session中的唯一标识符比较，相等说明是首次提交，就处理本次请求，然后将session中的唯一标识符移除；不相等说明是重复提交，就不再处理。

## 其他 header 头信息

比如 cache-control 的处理。

比较复杂 不适合移动端APP的应用 这里不详解

# 纯后端的控制方式

## 数据库

insert使用唯一索引 

update 使用乐观锁 version版本法

这种在大数据量和高并发下效率依赖数据库硬件能力,可针对非核心业务

## 悲观锁

使用select ... for update ,这种和 synchronized

锁住先查再insert or update一样,但要避免死锁,效率也较差

针对单体 请求并发不大 可以推荐使用

## 本地锁

原理:

使用了 ConcurrentHashMap 并发容器 putIfAbsent 方法,和 ScheduledThreadPoolExecutor 定时任务,也可以使用guava cache的机制, gauva中有配有缓存的有效时间也是可以的key的生成 Content-MD5 Content-MD5 是指 Body 的 MD5 值，只有当 Body 非Form表单时才计算MD5，计算方式直接将参数和参数名称统一加密MD5。

MD5在一定范围类认为是唯一的（近似唯一） 当然在低并发的情况下足够了

当然本地锁只适用于单机部署的应用.

### 注解

```java
import java.lang.annotation.*;
 
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Resubmit {
 
    /**
     * 延时时间 在延时多久后可以再次提交
     *
     * @return Time unit is one second
     */
    int delaySeconds() default 20;
}
```

### 实例化锁

```java
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
 
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
 
/**
 * @author lijing
 * 重复提交锁
 */
@Slf4j
public final class ResubmitLock {
 
 
    private static final ConcurrentHashMapLOCK_CACHE = new ConcurrentHashMap<>(200);
    private static final ScheduledThreadPoolExecutor EXECUTOR = new ScheduledThreadPoolExecutor(5, new ThreadPoolExecutor.DiscardPolicy());
 
 
   // private static final CacheCACHES = CacheBuilder.newBuilder()
            // 最大缓存 100 个
   // .maximumSize(1000)
            // 设置写缓存后 5 秒钟过期
   // .expireAfterWrite(5, TimeUnit.SECONDS)
   // .build();
 
 
    private ResubmitLock() {
    }
 
    /**
     * 静态内部类 单例模式
     *
     * @return
     */
    private static class SingletonInstance {
        private static final ResubmitLock INSTANCE = new ResubmitLock();
    }
 
    public static ResubmitLock getInstance() {
        return SingletonInstance.INSTANCE;
    }
 
 
    public static String handleKey(String param) {
        return DigestUtils.md5Hex(param == null ? "" : param);
    }
 
    /**
     * 加锁 putIfAbsent 是原子操作保证线程安全
     *
     * @param key 对应的key
     * @param value
     * @return
     */
    public boolean lock(final String key, Object value) {
        return Objects.isNull(LOCK_CACHE.putIfAbsent(key, value));
    }
 
    /**
     * 延时释放锁 用以控制短时间内的重复提交
     *
     * @param lock 是否需要解锁
     * @param key 对应的key
     * @param delaySeconds 延时时间
     */
    public void unLock(final boolean lock, final String key, final int delaySeconds) {
        if (lock) {
            EXECUTOR.schedule(() -> {
                LOCK_CACHE.remove(key);
            }, delaySeconds, TimeUnit.SECONDS);
        }
    }
}
```

### AOP 切面

```java
import com.alibaba.fastjson.JSONObject;
import com.cn.xxx.common.annotation.Resubmit;
import com.cn.xxx.common.annotation.impl.ResubmitLock;
import com.cn.xxx.common.dto.RequestDTO;
import com.cn.xxx.common.dto.ResponseDTO;
import com.cn.xxx.common.enums.ResponseCode;
import lombok.extern.log4j.Log4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
 
import java.lang.reflect.Method;
 
/**
 * @ClassName RequestDataAspect
 * @Description 数据重复提交校验
 * @Date 2019/05/16 17:05
 **/
@Log4j
@Aspect
@Component
public class ResubmitDataAspect {
 
    private final static String DATA = "data";
    private final static Object PRESENT = new Object();
 
    @Around("@annotation(com.cn.xxx.common.annotation.Resubmit)")
    public Object handleResubmit(ProceedingJoinPoint joinPoint) throws Throwable {
        Method method = ((MethodSignature) joinPoint.getSignature()).getMethod();
        //获取注解信息
        Resubmit annotation = method.getAnnotation(Resubmit.class);
        int delaySeconds = annotation.delaySeconds();
        Object[] pointArgs = joinPoint.getArgs();
        String key = "";
        //获取第一个参数
        Object firstParam = pointArgs[0];
        if (firstParam instanceof RequestDTO) {
            //解析参数
            JSONObject requestDTO = JSONObject.parseObject(firstParam.toString());
            JSONObject data = JSONObject.parseObject(requestDTO.getString(DATA));
            if (data != null) {
                StringBuffer sb = new StringBuffer();
                data.forEach((k, v) -> {
                    sb.append(v);
                });
                //生成加密参数 使用了content_MD5的加密方式
                key = ResubmitLock.handleKey(sb.toString());
            }
        }
        //执行锁
        boolean lock = false;
        try {
            //设置解锁key
            lock = ResubmitLock.getInstance().lock(key, PRESENT);
            if (lock) {
                //放行
                return joinPoint.proceed();
            } else {
                //响应重复提交异常
                return new ResponseDTO<>(ResponseCode.REPEAT_SUBMIT_OPERATION_EXCEPTION);
            }
        } finally {
            //设置解锁key和解锁时间
            ResubmitLock.getInstance().unLock(lock, key, delaySeconds);
        }
    }
}
```

### 使用案例

```java
@ApiOperation(value = "保存我的帖子接口", notes = "保存我的帖子接口")
@PostMapping("/posts/save")
@Resubmit(delaySeconds = 10)
public ResponseDTOsaveBbsPosts(@RequestBody @Validated RequestDTOrequestDto) {
    return bbsPostsBizService.saveBbsPosts(requestDto);
}
```

以上就是本地锁的方式进行的幂等提交。使用了 Content-MD5 进行加密 只要参数不变,参数加密 密值不变,key存在就阻止提交

当然也可以使用 一些其他签名校验 在某一次提交时先 生成固定签名 提交到后端 根据后端解析统一的签名作为 每次提交的验证token 去缓存中处理即可.

当然，这个可以调整为基于 redis 实现分布式锁。

# 参考资料

[幂等性解决重复提交的方案](https://blog.csdn.net/weixin_45136579/article/details/106410497)

* any list
{:toc}