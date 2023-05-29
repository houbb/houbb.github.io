---
layout: post
title: Log4j2-22-logback 如何实现全局的日志脱敏
date:  2016-5-21 10:00:13 +0800
categories: [Log]
tags: [log, apache, log4j2]
published: true
---

# 实现原理

本文实现日志脱敏，是借鉴了logback中自带的PatternLayoutEncoder类，重写了其start方法，在此方法中使用了我们自己的MyLogbackPatternLayout类创建格式化输出对象，MyLogbackPatternLayout类的doLayout方法中实现了正则替换的处理逻辑，可结合代码加断点测试以便更好了解具体过程

# 代码实现

## 定义RegexReplacement

```java
package my.logback;

import java.util.regex.Pattern;

public class RegexReplacement {
    /**
     * 脱敏匹配正则
     */
    private Pattern regex;
    /**
     * 替换正则
     */
    private String replacement;
    /**
     * Perform the replacement.
     *
     * @param msg The String to match against.
     * @return the replacement String.
     */
    public String format(final String msg) {
        return regex.matcher(msg).replaceAll(replacement);
    }

    public Pattern getRegex() {
        return regex;
    }

    public void setRegex(String regex) {
        this.regex = Pattern.compile(regex);
    }

    public String getReplacement() {
        return replacement;
    }

    public void setReplacement(String replacement) {
        this.replacement = replacement;
    }
}
```

## 定义MyLogbackReplaces

```java
package my.logback;

import java.util.ArrayList;
import java.util.List;

public class MyLogbackReplaces {
    /**
     * 脱敏正则列表
     */
    private List<RegexReplacement> replace = new ArrayList<>();
    /**
     * 添加规则（因为replace类型是list，必须指定addReplace方法用以添加多个）
     *
     * @param replacement replacement
     */
    public void addReplace(RegexReplacement replacement) {
        replace.add(replacement);
    }

    public List<RegexReplacement> getReplace() {
        return replace;
    }

    public void setReplace(List<RegexReplacement> replace) {
        this.replace = replace;
    }
}
```

## 定义MyLogbackPatternLayout

```java
package my.logback;

import ch.qos.logback.classic.PatternLayout;
import ch.qos.logback.classic.spi.ILoggingEvent;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.status.StatusLogger;

public class MyLogbackPatternLayout extends PatternLayout {
    /**
     * logger
     */
    private static final Logger LOGGER = StatusLogger.getLogger();
    /**
     * 正则替换规则
     */
    private MyLogbackReplaces replaces;
    /**
     * 是否开启脱敏，默认关闭(false）
     */
    private Boolean sensitive;

    public MyLogbackPatternLayout(MyLogbackReplaces replaces, Boolean sensitive) {
        super();
        this.replaces = replaces;
        this.sensitive = sensitive;
    }

    /**
     * 格式化日志信息
     *
     * @param event ILoggingEvent
     * @return 日志信息
     */
    @Override
    public String doLayout(ILoggingEvent event) {
        // 占位符填充
        String msg = super.doLayout(event);
        // 脱敏处理
        return this.buildSensitiveMsg(msg);
    }

    /**
     * 根据配置对日志进行脱敏
     *
     * @param msg 消息
     * @return 脱敏后的日志信息
     */
    public String buildSensitiveMsg(String msg) {
        if (sensitive == null || !sensitive) {
            // 未开启脱敏
            return msg;
        }
        if (this.replaces == null || this.replaces.getReplace() == null || this.replaces.getReplace().isEmpty()) {
            LOGGER.error("日志脱敏开启，但未配置脱敏规则，请检查配置后重试");
            return msg;
        }

        String sensitiveMsg = msg;

        for (RegexReplacement replace : this.replaces.getReplace()) {
            // 遍历脱敏正则 & 替换敏感数据
            sensitiveMsg = replace.format(sensitiveMsg);
        }
        return sensitiveMsg;
    }
}
```

## 定义MyLogbackPatternLayoutEncoder

```java
package my.logback;

import ch.qos.logback.classic.encoder.PatternLayoutEncoder;

public class MyLogbackPatternLayoutEncoder extends PatternLayoutEncoder {
    /**
     * 正则替换规则
     */
    private MyLogbackReplaces replaces;
    /**
     * 是否开启脱敏，默认关闭(false）
     */
    private Boolean sensitive = false;

    /**
     * 使用自定义TbspLogbackPatternLayout格式化输出
     */
    @Override
    public void start() {
        MyLogbackPatternLayout patternLayout = new MyLogbackPatternLayout(replaces, sensitive);
        patternLayout.setContext(context);
        patternLayout.setPattern(this.getPattern());
        patternLayout.setOutputPatternAsHeader(outputPatternAsHeader);
        patternLayout.start();
        this.layout = patternLayout;
        started = true;
    }

    public boolean isSensitive() {
        return sensitive;
    }

    public void setSensitive(boolean sensitive) {
        this.sensitive = sensitive;
    }

    public MyLogbackReplaces getReplaces() {
        return replaces;
    }

    public void setReplaces(MyLogbackReplaces replaces) {
        this.replaces = replaces;
    }
}
```

## 配置文件

logback.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!--please pay attention that: file name should not be logback.xml，
name it logback-spring.xml to use it in springboot framework-->
<configuration>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <!-- 指定为自己写的PatternLayoutEncoder -->
        <encoder class="my.logback.MyLogbackPatternLayoutEncoder">
            <pattern>%d{HH:mm:ss.SSS} %-5level %logger{80} --- %msg%n</pattern>
            <!-- 日志字符集（默认ISO-8859-1） -->
            <charset>UTF-8</charset>
            <!-- 开启脱敏（默认false） -->
            <sensitive>true</sensitive>
            <!-- 脱敏规则列表 -->
            <replaces>
                <!-- 脱敏规则 -->
                <replace>
                    <!-- 11位的手机号：保留前3后4 -->
                    <regex>
                        <![CDATA[
				(mobile|手机号)(=|=\[|\":\"|:|：|='|':')(1)([3-9]{2})(\d{4})(\d{4})(\]|\"|'|)
							]]>
                    </regex>
                    <replacement>$1$2$3$4****$6$7</replacement>
                </replace>
                <replace>
                    <!-- 固定电话： XXXX-XXXXXXXX或XXX-XXXXXXXX，保留区号+前2后2 -->
                    <regex>
                        <![CDATA[
				(tel|座机)(=|=\[|\":\"|:|：|='|':')([\d]{3,4}-)(\d{2})(\d{4})(\d{2})(\]|\"|'|)
							]]>
                    </regex>
                    <replacement>$1$2$3$4****$6$7</replacement>
                </replace>

                <replace>
                    <!-- 地址：汉字+字母+数字+下划线+中划线，留前3个汉字 -->
                    <regex>
                        <![CDATA[
				(地址|住址|address)(=|=\[|\":\"|:|：|='|':')([\u4e00-\u9fa5]{3})(\w|[\u4e00-\u9fa5]|-)*(\]|\"|'|)
							]]>
                    </regex>
                    <replacement>$1$2$3****$5</replacement>
                </replace>


                <replace>
                    <!-- 19位的卡号，保留后4 -->
                    <regex>
                        <![CDATA[
				(cardNo|卡号)(=|=\[|\":\"|:|：|='|':')(\d{15})(\d{4})(\]|\"|'|)
							]]>
                    </regex>
                    <replacement>$1$2***************$4$5</replacement>
                </replace>

                <replace>
                    <!-- 姓名,2-4汉字，留前1-->
                    <regex>
                        <![CDATA[
				(name|姓名)(=|=\[|\":\"|:|：|='|':')([\u4e00-\u9fa5]{1})([\u4e00-\u9fa5]{1,3})(\]|\"|'|)
							]]>
                    </regex>
                    <replacement>$1$2$3**$5</replacement>
                </replace>

                <replace>
                    <!--  密码 6位数字，全* -->
                    <regex>
                        <![CDATA[
					(password|密码|验证码)(=|=\[|\":\"|:|：|='|':')(\d{6})(\]|\"|'|)
							]]>
                    </regex>
                    <replacement>$1$2******$4</replacement>
                </replace>

                <replace>
                    <!-- 身份证，18位（结尾为数字或X、x），保留前1后1 -->
                    <regex>
                        <![CDATA[
							(身份证号|idCard)(=|=\[|\":\"|:|：|='|':')(\d{1})(\d{16})([\d|X|x]{1})(\]|\"|)
							]]>
                    </regex>
                    <replacement>$1$2$3****************$5$6</replacement>
                </replace>

                <replace>
                    <!-- 邮箱，保留@前的前1后1 -->
                    <regex>
                        <![CDATA[
							(\w{1})(\w*)(\w{1})@(\w+).com
							]]>
                    </regex>
                    <replacement>$1****$3@$4.com</replacement>
                </replace>
            </replaces>

        </encoder>
    </appender>

    <root level="info">
        <appender-ref ref="STDOUT"/>
    </root>

</configuration>
```

## 测试

```java
class Job {
    /**
     * jobName
     */
    private String jobName;
    /**
     * salary
     */
    private int salary;
    /**
     * company
     */
    private String company;
    /**
     * address
     */
    private String address;
    /**
     * tel
     */
    private String tel;
    /**
     * position
     */
    private List<String> position;

	// getter, setter, toString等省略
}

class User {
    /**
     * name
     */
    private String name;
    /**
     * idCard
     */
    private String idCard;
    /**
     * cardNo
     */
    private String cardNo;
    /**
     * mobile
     */
    private String mobile;
    /**
     * tel
     */
    private String tel;
    /**
     * password
     */
    private String password;
    /**
     * email
     */
    private String email;
    /**
     * address
     */
    private String address;
    /**
     * birth
     */
    private Date birth;
    /**
     * job
     */
    private Job job;
	// getter, setter, toString等省略
}

public class LogSensitiveTest {
    private static final Logger logger = LoggerFactory.getLogger(LogSensitiveTest.class);

    @Test
    public void test0() {
        // 等号
        logger.infoMessage("mobile={}", "13511114444");
        // 等号+[
        logger.infoMessage("mobile=[{}]", "13511114444");
        // 英文单引号+等号
        logger.infoMessage("mobile='{}'", "13511114444");
        // 中文冒号
        logger.infoMessage("mobile：{}", "13511114444");
        // 英文冒号
        logger.infoMessage("mobile:{}", "13511114444");
        // 英文双引号+英文冒号
        logger.infoMessage("\"mobile\":\"{}\"", "13511114444");
        // 英文单引号+英文冒号
        logger.infoMessage("'mobile':'{}'", "13511114444");
    }

    /**
     * 基本输出
     */
    @Test
    public void test1() {
        // 11位手机号
        logger.infoMessage("mobile={}", "13511114444");
        logger.infoMessage("mobile={},手机号：{}", "13511112222", "13511113333");
        logger.infoMessage("手机号：{}", "13511115555");
        // 固定电话（带区号-）
        logger.infoMessage("tel：{},座机={}", "0791-83376222", "021-88331234");
        logger.infoMessage("tel：{}", "0791-83376222");
        logger.infoMessage("座机={}", "021-88331234");

        // 地址
        logger.infoMessage("address：{}", "浙江省杭州市滨江区光明大道8888号");
        logger.infoMessage("地址：{}", "上海市浦东区北京东路1-10号");

        // 19位卡号
        logger.infoMessage("cardNo：{}", "6227002020000101222");

        // 姓名
        logger.infoMessage("name={}, 姓名=[{}]，name={}，姓名：{}", "张三", "上官婉儿", "李云龙", "楚云飞");

        // 密码
        logger.infoMessage("password：{}，密码={}", "123456", "456789");

        logger.infoMessage("password：{}", "123456");
        logger.infoMessage("密码={}", "123456");

        // 身份证号码
        logger.infoMessage("idCard：{}，身份证号={}", "360123202111111122", "360123202111111122");
        logger.infoMessage("身份证号={}", "360123202111111122");

        // 邮箱
        logger.infoMessage("邮箱:{}", "zhangs12345@google.com");
        logger.infoMessage("email={}", "zhangs12345@google.com");
    }

    /**
     * toString/json输出
     */
    @Test
    public void test2() {
        User user = new User();
        user.setCardNo("6227002020000101222");
        user.setTel("0571-11112222");
        user.setBirth(new Date());

        user.setAddress("浙江省西湖区西湖路288号钱江乐园2-101室");
        user.setEmail("zhangs12345@google.com");
        user.setPassword("123456");
        user.setMobile("15911116789");
        user.setName("张三");
        user.setIdCard("360123202111111122");

        Job job = new Job();
        job.setAddress("浙江省杭州市滨江区某公司");
        job.setTel("0571-12345678");
        job.setJobName("操作员");
        job.setSalary(2000);
        job.setCompany("某某有限公司");
        job.setPosition(Arrays.asList("需求", "开发", "测试", "上线"));

        user.setJob(job);

        logger.infoMessage("用户信息：{}", user);
        logger.infoMessage("用户信息：{}", JSONUtil.toJsonStr(user));
    }
}
```

test0 输出：

```
18:19:38.012 INFO  log.test.LogSensitiveTest --- mobile=135****4444
18:19:38.016 INFO  log.test.LogSensitiveTest --- mobile=[135****4444]
18:19:38.017 INFO  log.test.LogSensitiveTest --- mobile='135****4444'
18:19:38.018 INFO  log.test.LogSensitiveTest --- mobile：135****4444
18:19:38.018 INFO  log.test.LogSensitiveTest --- mobile:135****4444
18:19:38.018 INFO  log.test.LogSensitiveTest --- "mobile":"135****4444"
18:19:38.019 INFO  log.test.LogSensitiveTest --- 'mobile':'135****4444'
```

test1 输出：

```
18:23:23.115 INFO  log.test.LogSensitiveTest --- mobile=135****4444
18:23:23.115 INFO  log.test.LogSensitiveTest --- mobile=135****2222,手机号：135****3333
18:23:23.115 INFO  log.test.LogSensitiveTest --- 手机号：135****5555
18:23:23.115 INFO  log.test.LogSensitiveTest --- tel：0791-83****22,座机=021-88****34
18:23:23.115 INFO  log.test.LogSensitiveTest --- tel：0791-83****22
18:23:23.115 INFO  log.test.LogSensitiveTest --- 座机=021-88****34
18:23:23.115 INFO  log.test.LogSensitiveTest --- address：浙江省****
18:23:23.115 INFO  log.test.LogSensitiveTest --- 地址：上海市****
18:23:23.115 INFO  log.test.LogSensitiveTest --- cardNo：***************1222
18:23:23.115 INFO  log.test.LogSensitiveTest --- name=张**, 姓名=[上**]，name=李**，姓名：楚**
18:23:23.115 INFO  log.test.LogSensitiveTest --- password：******，密码=******
18:23:23.115 INFO  log.test.LogSensitiveTest --- password：******
18:23:23.115 INFO  log.test.LogSensitiveTest --- 密码=******
18:23:23.115 INFO  log.test.LogSensitiveTest --- idCard：3****************2，身份证号=3****************2
18:23:23.115 INFO  log.test.LogSensitiveTest --- 身份证号=3****************2
18:23:23.115 INFO  log.test.LogSensitiveTest --- 邮箱:z****5@google.com
18:23:23.115 INFO  log.test.LogSensitiveTest --- email=z****5@google.com
```

test2输出：

```
18:24:55.460 INFO  log.test.LogSensitiveTest --- 用户信息：User{name='张**', idCard='3****************2', cardNo='***************1222', mobile='159****6789', tel='0571-11****22', password='******', email='z****5@google.com', address='浙江省****', birth=Fri May 27 18:24:55 GMT+08:00 2022, job=Job{jobName='操作员', salary=2000, company='某某有限公司', address='浙江省****', tel='0571-12****78', position=[需求, 开发, 测试, 上线]}}
18:24:55.533 INFO  log.test.LogSensitiveTest --- 用户信息：{"address":"浙江省****","idCard":"3****************2","mobile":"159****6789","birth":1653647095451,"cardNo":"***************1222","password":"******","name":"张**","tel":"0571-11****22","job":{"jobName":"操作员","address":"浙江省****","salary":2000,"company":"某某有限公司","tel":"0571-12****78","position":["需求","开发","测试","上线"]},"email":"z****5@google.com"}
```

# 参考资料

https://blog.csdn.net/blue_driver/article/details/125007794

* any list
{:toc}
