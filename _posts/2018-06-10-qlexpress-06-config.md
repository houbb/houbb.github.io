---
layout: post
title:  QLExpress-06-Config
date:  2018-06-10 12:02:46 +0800
categories: [Engine]
tags: [qlexpress, engine, rule-engine]
published: true
---

# isPrecise

高精度计算在会计财务中非常重要，java的float、double、int、long存在很多隐式转换，
做四则运算和比较的时候其实存在非常多的安全隐患。 所以类似汇金的系统中，会有很多 `BigDecimal` 转换代码。

而使用QLExpress，你只要关注数学公式本身 

```
订单总价 = 单价 * 数量 + 首重价格 + （ 总重量 - 首重） * 续重单价 
```

然后设置这个属性即可，所有的中间运算过程都会保证**不丢失精度**。

备注：但是最后的数字格式好像无法指定？

## 测试案例

- 设置精度

```java
/**
 * 测试精度设置
 * @throws Exception if any
 */
@Test
public void testPercise() throws Exception {
    ExpressRunner runner = new ExpressRunner(true, false);
    IExpressContext<String,Object> expressContext = new DefaultContext<>();
    String expression ="12.3/3";
    Object result = runner.execute(expression, expressContext, null, false, false);
    System.out.println(result);
}
```

结果

```
4.1000000000
```

- 不设置精度

```java
/**
 * 测试非精度
 * @throws Exception if any
 */
@Test
public void testNoPercise() throws Exception {
    ExpressRunner runner = new ExpressRunner(false, false);
    IExpressContext<String,Object> expressContext = new DefaultContext<>();
    String expression ="12.3/3";
    Object result = runner.execute(expression, expressContext, null, false, false);
    System.out.println(result);
}
```

```
4.1000000000000005
```



# isShortCircuit

在很多业务决策系统中，往往需要对布尔条件表达式进行分析输出，普通的java运算一般会通过**逻辑短路来减少性能的消耗**。

例如规则公式： 

```
star>10000 and shoptype in('tmall','juhuasuan') and price between (100,900)
```

假设第一个条件 star>10000 不满足就停止运算。
但业务系统却还是希望把后面的逻辑都能够运算一遍，并且输出中间过程，保证更快更好的做出决策。

## 测试案例

- ShortcutTest.java

```java
import com.ql.util.express.DefaultContext;
import com.ql.util.express.ExpressRunner;
import com.ql.util.express.IExpressContext;

import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

/**
 * <p> 短路运算符测试 </p>
 *
 * <pre> Created: 2018/6/9 下午5:27  </pre>
 * <pre> Project: tech-validation  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class ShortcutTest {

    private ExpressRunner runner = new ExpressRunner();

    private void initial() throws Exception{
        runner.addOperatorWithAlias("小于","<","$1 小于 $2 不满足期望");
        runner.addOperatorWithAlias("大于",">","$1 大于 $2 不满足期望");
    }

    private boolean calculateLogicTest(String expression, IExpressContext<String, Object> expressContext, List<String> errorInfo) throws Exception {
        return (Boolean)runner.execute(expression, expressContext, errorInfo, true, false);
    }

    /**
     * 测试非短路逻辑,并且输出出错信息
     * @throws Exception if any
     */
    @Test
    public void testShortCircuit() throws Exception {
        runner.setShortCircuit(true);
        IExpressContext<String,Object> expressContext = new DefaultContext<>();
        expressContext.put("违规天数", 100);
        expressContext.put("虚假交易扣分", 11);
        expressContext.put("VIP", false);
        List<String> errorInfo = new ArrayList<>();
        initial();
        String expression ="2 小于 1 and (违规天数 小于 90 or 虚假交易扣分 小于 12)";
        boolean result = calculateLogicTest(expression, expressContext, errorInfo);
        showErrorInfo(result, errorInfo);
    }

    /**
     * 测试非短路逻辑,并且输出出错信息
     * @throws Exception if any
     */
    @Test
    public void testNoShortCircuit() throws Exception {
        runner.setShortCircuit(false);
        IExpressContext<String,Object> expressContext = new DefaultContext<>();
        expressContext.put("违规天数", 100);
        expressContext.put("虚假交易扣分", 11);
        expressContext.put("VIP", false);
        List<String> errorInfo = new ArrayList<>();
        initial();
        String expression ="2 小于 1 and (违规天数 小于 90 or 虚假交易扣分 小于 12)";
        boolean result = calculateLogicTest(expression, expressContext, errorInfo);
        showErrorInfo(result, errorInfo);
    }

    /**
     * 展现错误信息
     * @param result 结果
     * @param errorList 错误列表
     */
    private void showErrorInfo(boolean result, List<String> errorList) {
        if(result){
            System.out.println("result is success!");
        }else{
            System.out.println("result is fail!");
            for(String error : errorList){
                System.out.println(error);
            }
        }
    }
}
```

1. testShortCircuit() 测试结果:

```
result is fail!
 2  小于  1  不满足期望
```

2. testNoShortCircuit() 测试结果:

```
result is fail!
 2  小于  1  不满足期望
 违规天数:100  小于  90  不满足期望
```


* any list
{:toc}







