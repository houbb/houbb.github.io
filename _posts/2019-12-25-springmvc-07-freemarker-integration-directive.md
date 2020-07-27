---
layout: post
title: Spring Web MVC-07-springmvc 整合 freemarker 并且实现继承 @block @override @extends
date:  2019-12-25 16:57:12 +0800
categories: [Spring]
tags: [spring mvc]
published: false
---

# 继承的目的

父模板页面定义好布局,子模板可以重定义布局中的部分内容

使模板可以实现类似"类"的继承关系,并不限继承层次

# 继承概榄

## 父类

- base.ftl

```html
<html>  
    <head>  
        <@block name="head">base_head_content</@block>  
    </head>  
    <body>  
        <@block name="body">base_body_content</@block>  
    </body>  
</html>  
```

## 子类

- child.ftl

```html
<@override name="body">  
    <div class='content'>  
        Powered By rapid-framework  
    </div>  
</@override>  
<@extends name="base.ftl"/>  
```

## 结果

```html
<html>  
    <head>  
        base_head_content  
    </head>  
    <body>  
        <div class='content'>  
            Powered By rapid-framework  
        </div>  
    </body>  
</html>  
```

可以看到，body部分被重定义了，而head部分则还是显示父模板的内容。

# 指令说明

@block : 定义块，可以被子模板用@override指令覆盖显示

@override :  覆盖@block指令显示的内容

@extends : 继承其它模板，必须放在模板的最后面（注：该指令完全等价于#include指令，只是为了提供统一的语义，即extends比include更好理解）

# 使用说明
 
要使用如上三个自定义指令，必须在freeemarker的Configuration中注册。

## 注解的注册方式

```java
@Configuration
public class FreemarkerConfiguration {

    @Autowired
    freemarker.template.Configuration configuration;

    @PostConstruct
    public void setSharedVariable(){
        configuration.setSharedVariable("block", new BlockDirective());
        configuration.setSharedVariable("override", new OverrideDirective());
        configuration.setSharedVariable("extends", new ExtendsDirective());
    }

}
```

## xml 的注册方式

```xml
<!-- 注册freemarker配置类 -->
<bean id="freeMarkerConfigurer" class="org.springframework.web.servlet.view.freemarker.FreeMarkerConfigurer">
    <!-- ftl模版文件路径  -->
    <property name="templateLoaderPath" value="/WEB-INF/view/"/>
    <!-- 页面编码 -->
    <property name="defaultEncoding" value="utf-8" />
    <property name="freemarkerSettings">
        <props>
            <!-- 模版缓存刷新时间，不写单位默认为秒 -->
            <prop key="template_update_delay">0</prop>
            <!-- 时区 和 时间格式化 -->
            <prop key="locale">zh_CN</prop>
            <prop key="datetime_format">yyyy-MM-dd</prop>
            <prop key="date_format">yyyy-MM-dd</prop>
            <!-- 数字使用.来分隔 -->
            <prop key="number_format">#.##</prop>
        </props>
    </property>
    <property name="freemarkerVariables">
        <map>
            <!--下面四个是在下面定义的-->
            <entry key="extends" value-ref="extendsDirective"/>
            <entry key="override" value-ref="overrideDirective"/>
            <entry key="block" value-ref="blockDirective"/>
            <entry key="super" value-ref="superDirective"/>
        </map>
    </property>
</bean>

<!-- freemaker  Directive-->
<bean id="blockDirective" class="cn.org.rapid_framework.freemarker.directive.BlockDirective"/>
<bean id="extendsDirective" class="cn.org.rapid_framework.freemarker.directive.ExtendsDirective"/>
<bean id="overrideDirective" class="cn.org.rapid_framework.freemarker.directive.OverrideDirective"/>
<bean id="superDirective" class="cn.org.rapid_framework.freemarker.directive.SuperDirective"/>
```

## 访问效果

直接访问，内容如下：

```
base_head_content
Powered By rapid-framework
```

# 参考资料

[扩展freemarker,实现模板的继承](https://www.iteye.com/blog/badqiu-553583)

[Freemarker组件继承与重写](https://www.jianshu.com/p/7f3eafd2ee6d)

[rapid-framework.googlecode.com](http://rapid-framework.googlecode.com/svn/trunk/rapid-framework/src/rapid_framework_common/cn/org/rapid_framework/freemarker/directive/)

* any list
{:toc}