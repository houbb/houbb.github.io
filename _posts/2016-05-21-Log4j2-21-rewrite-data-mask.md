---
layout: post
title: Log4j2-21-log4j2 通过实现 Rewrite 实现日志的脱敏
date:  2016-5-21 10:00:13 +0800
categories: [Log]
tags: [log, apache, log4j2]
published: true
---

# Rewrite 的简单例子

## RewritePolicy

简单粗暴的例子，实际应该根据实际进行替换。

```java
package com.ryo.appender;

import org.apache.logging.log4j.core.LogEvent;
import org.apache.logging.log4j.core.appender.rewrite.RewritePolicy;
import org.apache.logging.log4j.core.config.Node;
import org.apache.logging.log4j.core.config.plugins.Plugin;
import org.apache.logging.log4j.core.config.plugins.PluginFactory;
import org.apache.logging.log4j.core.impl.MutableLogEvent;
import org.apache.logging.log4j.message.Message;
import org.apache.logging.log4j.message.SimpleMessage;

/**
 * https://www.cnblogs.com/leonlipfsj/p/14691848.html
 * https://blog.csdn.net/LNF568611/article/details/113083401
 * https://blog.csdn.net/qq_19983129/article/details/129854932
 * https://it.cha138.com/jingpin/show-55489.html
 * https://www.dianjilingqu.com/597663.html
 */
@Plugin(name = "MyRewritePolicy", category = Node.CATEGORY, elementType = "rewritePolicy", printObject = true)
public class MyRewritePolicy implements RewritePolicy {

    @Override
    public LogEvent rewrite(LogEvent source) {
        MutableLogEvent log4jLogEvent = (MutableLogEvent) source;

        Message message = log4jLogEvent.getMessage();

        if(message instanceof MutableLogEvent) {
            MutableLogEvent mutableLogEvent = (MutableLogEvent) message;
            // mutableLogEvent.getFormat() 这里返回的竟然是 null，而不是 format 格式...
            String rawMessage = message.getFormattedMessage();

            // 所有基于参数，看起来只在 param 中有意义。
//            Object[] objects = mutableLogEvent.getParameters();
//            if(objects != null
//                && objects.length > 0) {
//                for(int i = 0; i < objects.length; i++) {
//                    Object param = objects[i];
//
//                    String paramValue = param.toString();
//                    if("13077779999".equals(paramValue)) {
//                        objects[i] = "130****9999";
//                    }
//                }
//            }
//            ParameterizedMessage m = new ParameterizedMessage(mutableLogEvent.getFormat(), objects,
//                    mutableLogEvent.getThrowable());

            String mewMessage = "脱敏后：130****9999";
            log4jLogEvent.setMessage(new SimpleMessage(mewMessage));
            return log4jLogEvent;
        }

        // 直接返回原始的。
        return source;
    }

    // 指定对应的 factory
    @PluginFactory
    public static MyRewritePolicy createPolicy() {
        return new MyRewritePolicy();
    }

}
```

## log4j2.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN">
    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
        </Console>
        <Rewrite name="rewrite">
            <AppenderRef ref="Console"/>
            <MyRewritePolicy/>
        </Rewrite>
    </Appenders>
    <Loggers>
        <Root level="DEBUG">
            <AppenderRef ref="Console"/>
            <AppenderRef ref="rewrite" />
        </Root>
    </Loggers>
</Configuration>
```

## 测试

```java
package com.ryo.appender;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.junit.Test;

/**
 * Created by houbinbin on 2017/2/16.
 */
public class MyAppendRewriteTest {

  private Logger logger = LogManager.getLogger();


  @Test
  public void testRewrite() {
    logger.info("my phone: {}", "13077779999");
  }

}
```

日志：

```
my phone: 13077779999
脱敏后：130****9999
```

# 第一种方案：全局方式

针对log4j2的日志脱敏实现方案,重写rewrite方法，对敏感数据进行脱敏操作

需要在log4j2.xml 引入此插件，插件名称为DataMaskingRewritePolicy。

## 1、重写rewrite方法

```java
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.google.common.base.Objects;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.core.LogEvent;
import org.apache.logging.log4j.core.appender.rewrite.RewritePolicy;
import org.apache.logging.log4j.core.config.plugins.Plugin;
import org.apache.logging.log4j.core.config.plugins.PluginFactory;
import org.apache.logging.log4j.core.impl.Log4jLogEvent;
import org.apache.logging.log4j.message.Message;
import org.apache.logging.log4j.message.ParameterizedMessage;
import org.apache.logging.log4j.message.SimpleMessage;
import org.springframework.util.CollectionUtils;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
 
/**
 * 
 *  针对log4j2的日志脱敏实现方案,重写rewrite方法，调整日志内容
 * 
 * 需要在log4j2.xml 引入此插件，插件名称为DataMaskingRewritePolicy
 *
 */
@Plugin(name = "DataMaskingRewritePolicy", category = "Core", elementType = "rewritePolicy", printObject = true)
public class DataMaskingRewritePolicy implements RewritePolicy {
 
	/*
	 * 脱敏符号
	 */
	private static final String ASTERISK = "****";
 
	/*
	 * 引号
	 */
	private static final String QUOTATION_MARK = "\"";
 
	// 使用静态内部类创建对象，节省空间
	private static class StaticDataMaskingRewritePolicy {
		private static final DataMaskingRewritePolicy dataMaskingRewritePolicy = new DataMaskingRewritePolicy();
	}
 
	// 需要加密的字段配置数组
	private static final String[] encryptionKeyArrays = { "password", "expireYear", "expireMonth",
			"cvv" };
	// 将数组转换为集合，方便查找
	private static final List<String> encryptionKeys = new ArrayList<>();
 
	public DataMaskingRewritePolicy() {
		if (CollectionUtils.isEmpty(encryptionKeys)) {
			encryptionKeys.addAll(Arrays.asList(encryptionKeyArrays));
		}
	}
 
	/**
	 * 日志修改方法，可以对日志进行过滤，修改
	 *
	 * @param logEvent
	 * @return
	 */
	@Override
	public LogEvent rewrite(LogEvent logEvent) {
		if (!(logEvent instanceof Log4jLogEvent)) {
			return logEvent;
		}
 
		Log4jLogEvent log4jLogEvent = (Log4jLogEvent) logEvent;
 
		Message message = log4jLogEvent.getMessage();
		if ((message instanceof ParameterizedMessage)) {
			ParameterizedMessage parameterizedMessage = (ParameterizedMessage) message;
 
			Object[] params = parameterizedMessage.getParameters();
			if (params == null || params.length <= 0) {
				return logEvent;
			}
			Object[] newParams = new Object[params.length];
			for (int i = 0; i < params.length; i++) {
				try {
					if(params[i] instanceof JSONObject){
						JSONObject jsonObject = (JSONObject) params[i];
						// 处理json格式的日志
						newParams[i] = encryptionJson(jsonObject, encryptionKeys);
					} else{
						newParams[i] = params[i];
					}
			
				} catch (Exception e) {
					newParams[i] = params[i];
				}
			}
 
			ParameterizedMessage m = new ParameterizedMessage(parameterizedMessage.getFormat(), newParams,
					parameterizedMessage.getThrowable());
			Log4jLogEvent.Builder builder = log4jLogEvent.asBuilder().setMessage(m);
			return builder.build();
		} else if (message instanceof SimpleMessage) {
			
			SimpleMessage newMessage = decryptionSimpleMessage((SimpleMessage) message);
			Log4jLogEvent.Builder builder = log4jLogEvent.asBuilder().setMessage(newMessage);
			return builder.build();
		} else {
 
			return logEvent;
		}
 
	}
 
	/**
	 * 单例模式创建(静态内部类模式)
	 *
	 * @return
	 */
	@PluginFactory
	public static DataMaskingRewritePolicy createPolicy() {
		return StaticDataMaskingRewritePolicy.dataMaskingRewritePolicy;
	}
 
	private SimpleMessage decryptionSimpleMessage(SimpleMessage simpleMessage) {
		String messsage = simpleMessage.toString();
		String newMessage = messsage;
 
		if (!StringUtils.isEmpty(messsage)) {
 
			boolean isContain = encryptionKeys.stream().anyMatch(key -> StringUtils.contains(messsage, key));
 
			// 包含敏感词
			if (isContain) {
 
				for (String key : encryptionKeyArrays) {
					int keyLength = key.length();
					// 敏感词
					String targetStr = new String("<" + key + ">");
					StringBuffer targetSb = new StringBuffer(targetStr);
					int startIndex = newMessage.indexOf(targetStr);
 
					/*
					 * 如<password>123456</password>替换为 <password>****</password>
					 */
					if (startIndex > -1 && newMessage.indexOf(targetSb.append(ASTERISK).append("</").append(key).append(">").toString()) == -1) {
						int endIndex = newMessage.indexOf(targetStr);
						if (endIndex > -1) {
							newMessage = newMessage.substring(0, startIndex + keyLength + 2) + ASTERISK
									+ newMessage.substring(endIndex, newMessage.length());
						}
					}
 
					/*
					 * 如password:123456替换为password:****
					 */
					 targetStr = key + ":";
					if (newMessage.indexOf(targetStr) > -1 && newMessage.indexOf(targetStr + ASTERISK) == -1) {
 
						startIndex = newMessage.indexOf(targetStr) + keyLength + 1;
						String endMessage = newMessage.substring(startIndex, newMessage.length());
						int endIndex = endMessage.indexOf(",");
						if (endIndex > -1) {
							newMessage = newMessage.substring(0, startIndex) + ASTERISK
									+ endMessage.substring(endIndex, endMessage.length());
						} else if (endMessage.indexOf(",") == -1 && endMessage.indexOf("=") == -1) {
							newMessage = newMessage.substring(0, startIndex) + ASTERISK;
						}
					}
 
					/*
					 * 如password=123456替换为password=****
					 */
					if (newMessage.indexOf(key + "=") > -1 && newMessage.indexOf(key + "=" + ASTERISK) == -1) {
 
						startIndex = newMessage.indexOf(key + "=") + keyLength + 1;
						String endMessage = newMessage.substring(startIndex, newMessage.length());
						int endIndex = endMessage.indexOf(",");
						if (endIndex > -1) {
							newMessage = newMessage.substring(0, startIndex) + ASTERISK
									+ endMessage.substring(endIndex, endMessage.length());
						} else if (endMessage.indexOf(",") == -1 && endMessage.indexOf("=") == -1) {
							newMessage = newMessage.substring(0, startIndex) + ASTERISK;
						}
					}
 
					/*
					 * 如"password":"123456" 替换为"password":"****"
					 */
					String qmKey = QUOTATION_MARK + key + QUOTATION_MARK + ":";
					if (newMessage.indexOf(qmKey) > -1 && newMessage.indexOf(qmKey + ASTERISK) == -1) {
 
						startIndex = newMessage.indexOf(qmKey) + keyLength + 3;
						String endMessage = newMessage.substring(startIndex, newMessage.length());
						int endIndex = endMessage.indexOf(",");
						if (endIndex > -1) {
							newMessage = newMessage.substring(0, startIndex) + QUOTATION_MARK + ASTERISK
									+ QUOTATION_MARK + endMessage.substring(endIndex, endMessage.length());
						} else if (endMessage.indexOf(",") == -1 && endMessage.indexOf("=") == -1) {
							newMessage = newMessage.substring(0, startIndex) + QUOTATION_MARK + ASTERISK
									+ QUOTATION_MARK;
						}
					}
 
				}
				return new SimpleMessage(newMessage);
			}
 
		}
 
		return simpleMessage;
 
	}
 
	/**
	 * 处理日志，递归获取值
	 *
	 */
	private Object encryptionJson(Object object, List<String> encryptionKeys) {
		String jsonString = JSON.toJSONString(object);
		if (object instanceof JSONObject) {
			JSONObject json = JSON.parseObject(jsonString);
			boolean isContain = encryptionKeys.stream().anyMatch(key -> StringUtils.contains(jsonString, key));
			if (isContain) {
				// 判断当前字符串中有没有key值
				Set<String> keys = json.keySet();
				keys.forEach(key -> {
					boolean result = encryptionKeys.stream().anyMatch(ekey -> Objects.equal(ekey, key));
					if (result) {
						String value = json.getString(key);
						// 加密
						json.put(key, ASTERISK);
					} else {
						json.put(key, encryptionJson(json.get(key), encryptionKeys));
					}
				});
			}
			return json;
		} else if (object instanceof JSONArray) {
			JSONArray jsonArray = JSON.parseArray(jsonString);
			for (int i = 0; i < jsonArray.size(); i++) {
				JSONObject jsonObject = jsonArray.getJSONObject(i);
				// 转换
				jsonArray.set(i, encryptionJson(jsonObject, encryptionKeys));
			}
			return jsonArray;
		}
		return object;
	}
}
```

## 2、修改log4j2.xml配置，增加Rewrite重新日志配置

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
    <properties>
        <!--设置日志文件存储路径为tomcat/logs/${APP_NAME}-->
        <Property name="LOG_FILE_PATH">${sys:catalina.home}/logs/${APP_NAME}</Property>
        <!--设置日志输出格式-->
        <Property name="PATTERN_FORMAT">[%t][%d{yyyyMMdd HH:mm:ss}][%-5p][%c{3}:%L] - %m%n</Property>
        <Property name="LOG_LEVEL">info</Property>
    </properties>
 
    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
        
        	 <PatternLayout pattern="[Shop][%t][%d{yyyyMMdd HH:mm:ss}][%-5p][%c{3}:%L] - %m%n"/>
        </Console>
        
        <!-- 配置重写日志 -->
        <Rewrite name="rewrite">
            <DataMaskingRewritePolicy/>
            <AppenderRef ref="Console"/>
            <!-- 将catalina日志重写 -->
            <!-- <AppenderRef ref="Catalina"/> -->
        </Rewrite>
 
    </Appenders>
 
    <Loggers>
    	<logger name="org.springframework" level="${LOG_LEVEL}">
    		<AppenderRef ref="Console" />
    	</logger>
		<logger name="org.test" level="${LOG_LEVEL}">
    		<AppenderRef ref="rewrite" />
    	</logger>
    
        <Root level="info">
            <!-- <AppenderRef ref="Console" /> -->
            <!-- <AppenderRef ref="RollingInfoFile" /> -->
        </Root>
    </Loggers>
    
</configuration>
```

## 3、单元测试

```java
	@org.junit.Test
	public void testLog4j2JSONString(){
		
		 Runtime r = Runtime.getRuntime();
	        r.gc();//计算内存前先垃圾回收一次
	        long start = System.currentTimeMillis();//开始Time
	        long startMem = r.totalMemory(); // 开始Memory
 
		for (int i = 0; i < 1; i++) {
			logger.info("\"password\":\"123456\",\"expireYear\":\"2025\",\"expireMonth\":\"10\",\"cvv\":\"844\"");
		}
		
		//输出
        long endMem =r.freeMemory(); // 末尾Memory
        long end = System.currentTimeMillis();//末尾Time
        System.out.println("用时消耗: "+String.valueOf(end - start)+"ms");
        System.out.println("内存消耗: "+String.valueOf((startMem- endMem)/1024)+"KB");
	}
```

# 二、第二种方案：自定义脱敏工具类

## 工具类

```java
 
 
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
 
import org.apache.commons.lang3.StringUtils;
import org.springframework.util.CollectionUtils;
 
/**
 * String数据脱敏处理
 *
 */
public class StringMaskUtil {
 
	/*
	 * 脱敏符号
	 */
	private static final String ASTERISK = "****";
 
	
	// 需要脱敏的字段配置数组
	private static final String[] encryptionKeyArrays = { "password", "expireYear", "expireMonth","cvv","number"};
 
	/*
	 * 引号
	 */
	private static final String QUOTATION_MARK = "\"";
 
 
	// 将数组转换为集合，方便查找
	private static final List<String> encryptionKeys = new ArrayList<>();
	
	// 使用静态内部类创建对象，节省空间
	private static class  StaticStringMaskUtil {
		private static final StringMaskUtil stringMaskUtil = new StringMaskUtil();
	}
	
	public StringMaskUtil() {
		if (CollectionUtils.isEmpty(encryptionKeys)) {
			encryptionKeys.addAll(Arrays.asList(encryptionKeyArrays));
		}
	}
	
	public static StringMaskUtil instance(){
		return StaticStringMaskUtil.stringMaskUtil;
	}
	
	/**
	 * 支持的格式
	 * 
	 * 1、<key>value</key>
	 * 2、key=value,key1=value1
	 * 3、key:value,key1:value1
	 * 4、"key":"value","key1":"value1"
	 * 
	 * @param messsage
	 * @return
	 */
	public String mask(String messsage){
		
		String newMessage = messsage;
		if (!StringUtils.isEmpty(messsage)) {
 
			boolean isContain = encryptionKeys.stream().anyMatch(key -> StringUtils.contains(messsage, key));
 
			// 包含敏感词
			if (isContain) {
 
				for (String key : encryptionKeys) {
					int keyLength = key.length();
					// 敏感词
					String targetStr = new String("<" + key + ">");
					StringBuffer targetSb = new StringBuffer(targetStr);
					int startIndex = newMessage.indexOf(targetStr);
 
					/*
					 * 如<password>123456</password>替换为 <password>****</password>
					 */
					if (startIndex > -1 && newMessage.indexOf(targetSb.append(ASTERISK).append("</").append(key).append(">").toString()) == -1) {
						int endIndex = newMessage.indexOf("</" + key + ">");
						if (endIndex > -1) {
							newMessage = newMessage.substring(0, startIndex + keyLength + 2) + ASTERISK
									+ newMessage.substring(endIndex, newMessage.length());
						}
					}
 
					/*
					 * 如,password:123456替换为password:****
					 */
					 targetStr =","+ key + ":";
					if (newMessage.indexOf(targetStr) > -1 && newMessage.indexOf(targetStr + ASTERISK) == -1) {
 
						startIndex = newMessage.indexOf(targetStr) + keyLength + 2;
						String endMessage = newMessage.substring(startIndex, newMessage.length());
						int endIndex = endMessage.indexOf(",");
						if (endIndex > -1) {
							newMessage = newMessage.substring(0, startIndex) + ASTERISK
									+ endMessage.substring(endIndex, endMessage.length());
						} else if (endMessage.indexOf(",") == -1 && endMessage.indexOf("=") == -1) {
							newMessage = newMessage.substring(0, startIndex) + ASTERISK;
						}
					}else if(newMessage.startsWith(key + ":")){
						startIndex = keyLength + 1;
						String endMessage = newMessage.substring(startIndex, newMessage.length());
						int endIndex = endMessage.indexOf(",");
						if (endIndex > -1) {
							newMessage = newMessage.substring(0, startIndex) + ASTERISK
									+ endMessage.substring(endIndex, endMessage.length());
						} else if (endMessage.indexOf(",") == -1 && endMessage.indexOf("=") == -1) {
							newMessage = newMessage.substring(0, startIndex) + ASTERISK;
						}
					}
 
					/*
					 * 如,password=123456替换为password=****
					 */
					 targetStr =","+ key + "=";
					if (newMessage.indexOf(targetStr) > -1 && newMessage.indexOf(key + "=" + ASTERISK) == -1) {
 
						startIndex = newMessage.indexOf(targetStr) + keyLength + 2;
						String endMessage = newMessage.substring(startIndex, newMessage.length());
						int endIndex = endMessage.indexOf(",");
						if (endIndex > -1) {
							newMessage = newMessage.substring(0, startIndex) + ASTERISK
									+ endMessage.substring(endIndex, endMessage.length());
						} else if (endMessage.indexOf(",") == -1 && endMessage.indexOf("=") == -1) {
							newMessage = newMessage.substring(0, startIndex) + ASTERISK;
						}
					}else if(newMessage.startsWith(key + "=")){
						startIndex = keyLength + 1;
						String endMessage = newMessage.substring(startIndex, newMessage.length());
						int endIndex = endMessage.indexOf(",");
						if (endIndex > -1) {
							newMessage = newMessage.substring(0, startIndex) + ASTERISK
									+ endMessage.substring(endIndex, endMessage.length());
						} else if (endMessage.indexOf(",") == -1 && endMessage.indexOf("=") == -1) {
							newMessage = newMessage.substring(0, startIndex) + ASTERISK;
						}
					}
 
					/*
					 * 如"password":"123456" 替换为"password":"****"
					 */
					String qmKey = QUOTATION_MARK + key + QUOTATION_MARK + ":";
					if (newMessage.indexOf(qmKey) > -1 && newMessage.indexOf(qmKey + ASTERISK) == -1) {
 
						startIndex = newMessage.indexOf(qmKey) + keyLength + 3;
						String endMessage = newMessage.substring(startIndex, newMessage.length());
						int endIndex = endMessage.indexOf(",");
						if (endIndex > -1) {
							newMessage = newMessage.substring(0, startIndex) + QUOTATION_MARK + ASTERISK
									+ QUOTATION_MARK + endMessage.substring(endIndex, endMessage.length());
						} else if (endMessage.indexOf(",") == -1 && endMessage.indexOf("=") == -1) {
							newMessage = newMessage.substring(0, startIndex) + QUOTATION_MARK + ASTERISK
									+ QUOTATION_MARK;
						}
					}
 
				}
			}
 
		}
		return newMessage;
	}
}
```

## 自定义脱敏工具类单元测试

```java
	@org.junit.Test
	public void testLog4jString(){
		
		Runtime r = Runtime.getRuntime();
        r.gc();//计算内存前先垃圾回收一次
        long start = System.currentTimeMillis();//开始Time
        long startMem = r.totalMemory(); // 开始Memory
		
		for (int i = 0; i < 1; i++) {
			System.out.println(StringMaskUtil.instance().mask("oldpassword=123456,expireYear=2022,expireMonth=12,cvv=844"));
			System.out.println(StringMaskUtil.instance().mask("password:123456,aaexpireYear:2022,expireMonth:12,cvv:844"));
			System.out.println(StringMaskUtil.instance().mask("password=123456,expireYear=2022,expireMonth=12,cvv=844"));
			System.out.println(StringMaskUtil.instance().mask("\"oldpassword\":\"123456\",\"expireYear\":\"2025\",\"expireMonth\":\"10\",\"cvv\":\"844\""));
			System.out.println(StringMaskUtil.instance().mask("<password>123456</password><expireYear>123456</expireYear><expireMonth>123456</expireMonth><cvv>123456</cvv>"));
		}
		//输出
        long endMem =r.freeMemory(); // 末尾Memory
        long end = System.currentTimeMillis();//末尾Time
        System.out.println("用时消耗: "+String.valueOf(end - start)+"ms");
        System.out.println("内存消耗: "+String.valueOf((startMem- endMem)/1024)+"KB");
	}
```

# 参考资料

https://www.cnblogs.com/leonlipfsj/p/14691848.html
https://blog.csdn.net/LNF568611/article/details/113083401
https://blog.csdn.net/qq_19983129/article/details/129854932
https://it.cha138.com/jingpin/show-55489.html
https://www.dianjilingqu.com/597663.html

* any list
{:toc}
