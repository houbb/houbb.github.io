---
layout: post
title: 更加简单的表格设计
date:  2017-2-23 11:21:30 +0800
categories: [Project]
tags: [project]
published: true
---




# Why

> 为什么设计这个注解？

本来前端构建一下的事情，为什么要绕这么大弯子呢？

主要我一直想设计一个通用的列表 Controller(提供数据及页面跳转)，结合 gridTemplate.ftl(提供页面结构)，直接成为一个列表页面。而不是重复去写这些代码。
 
现在设想只是初期，本篇正是对于这种构想的初步实践。

而且，个人认为，作为前端展示，每一列对应的中文标签完全可以由后端提供，完成前后端解耦。

当然也可以退一步，设计成前端可以自由选择的。可以自己指定，也可以使用后台提供的。

- 从前端来看

如果你曾经写过前面的列表(table)展示。因为不同的列，中文的label显示是不同的。不同实体之间也不尽相同。

所以每次都要重写构建表头(tHead)。这很繁琐。

- 从后端来看

假设有一张角色表。DDL如下：

```sql
DROP TABLE IF EXISTS `role`;
CREATE TABLE role (
  id          BIGINT(20) PRIMARY KEY AUTO_INCREMENT NOT NULL
  COMMENT '主键,自增',
  name        VARCHAR(64)                           NOT NULL
  COMMENT '角色名称',
  code        VARCHAR(64)                           NOT NULL
  COMMENT '角色代码',
  description VARCHAR(128)                          NULL DEFAULT ''
  COMMENT '角色说明',
  `created_time` timestamp NULL,
  `updated_time` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX `name`(`name`),
  UNIQUE INDEX `code_UNIQUE`(`code`)
)
  COMMENT '角色表';
```

对应实体类(model)。为了简洁，将所有的注释，Getter、Setter、toString() 等移除。

```java
public class Role {

    private Long id;

    private String name;

    private String code;

    private String description;

    private Date createdTime;

    private Date updatedTime;
}
```

- 后端与前端的衔接

当前端指定要显示哪些列后，会将对应的实体(model)对应的字段传过来。因为数据库的原因，我们没有一个地方去保存字段对应的显示名称。

当前端告诉后端需要显示的列后(比如显示所有列)，真的有必要前端再重新构建一遍表头吗？
 
# How

> 每一列对应的中文标签应该放在哪里呢？

最初的实体源于建表语句。所以中文标签可以追溯到DDL。这样，比如使用 mybatis, 代码自动生成时可以自己指定生成插件。直接生成在Java代码里。【见后续】

如下：

代码中的 ```@Label``` 就是我们接下来需要讲解的重点。

```java
public class Role {
    @Label("主键,自增")
    private Long id;

    @Label("角色名称")
    private String name;

    @Label("角色代码")
    private String code;

    @Label("角色说明")
    private String description;

    private Date createdTime;

    private Date updatedTime;
}
```

# @Label

> 定义及简单解释

注解定义如下：

```java
/**
 * 用于保存数据库的显示LABEL
 * 规定:
 * 1) 数据库录入时注释需要符合以下规范:
 * Label:COMMENT
 * 标签和注释用【:】分开
 * 2) 没有注释的字段
 * Label 默认为字段名称
 * COMMENT 不设置
 * 3) 注释是否规范 直接根据 【:】 然后设置。
 *
 * 备注:
 * 1) 字段LABEL在利用 mybatis 生成MODEL时自动生成对应 信息。
 * 后期如果修改数据库内容，需保证model备注相应更新。
 * 同样的，如果想修改标签/备注内容，只需要直接修改@Label 的内容即可。
 * Created by houbinbin on 2017/2/13.
 * @version 1.7
 */
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
public @interface Label {

  /**
   * 数据库字段的显示标签
   * @return 默认返回空字符串
   */
  String value() default "";

  /**
   * 数据库字段的注释说明
   * @return 默认返回空字符串
   */
  String comment() default "";
}
```

解释如下：

感觉自己有些啰嗦，但总比冷冰冰的别人看不懂的好。就在废话下去：

- 这个标签只是个人设计，可以根据这种设计自己拓展修改。并规定自己的DDL注释方式也可(解析方式肯定也要对应修改)。

- 多数情况下DDL注释什么的是不规范的。可以手动直接添加注解，甚至生成注解后手动修改也可。


> 如何解析

可以根据自己需求，自行构建。

```java
  /**
   * 解析 Role 字段上@Label 标签。如果不存在@Label 标签，默认返回字段名称。
   * @return 返回 字段标签列表
   */
  public static List<String> getFieldLabels() {
    List<String> labelList = new LinkedList<>();
    Field[] fields = Role.class.getDeclaredFields();

    for(Field field : fields) {
      Label label = field.getAnnotation(Label.class);

      if(label != null) {
        labelList.add(label.value());
      } else {
        labelList.add(field.getName());
      }
    }

    return labelList;
  }
```

直接打印内容如下:

```
[主键,自增, 角色名称, 角色代码, 角色说明, createdTime, updatedTime]
```

# With mybatis-generator 

mybatis-generator 如果你不知道如何使用，可查看[Mybatis-Generator](https://houbb.github.io/2016/08/25/Mybatis-Generator)。
 
- LabelPlugin.java

备注：

1) ```com.ryo.mybatis.demo.label.annotation.Label``` 请自行替换为对应的路径

2) 数据库注释如果不是按照【Label:COMMENT】写法，请自行修改。

```java
/**
 * Created by houbinbin on 16/7/28.
 * - 供 mybatis.generator 与 @Label 结合使用
 * @see com.ryo.mybatis.demo.label.annotation.Label
 */
public class LabelPlugin extends PluginAdapter {
    private FullyQualifiedJavaType dataAnnotation = new FullyQualifiedJavaType("com.ryo.mybatis.demo.label.annotation.Label");

    public LabelPlugin() {
    }

    public boolean modelFieldGenerated(Field field,
                                       TopLevelClass topLevelClass, IntrospectedColumn introspectedColumn,
                                       IntrospectedTable introspectedTable,
                                       ModelClassType modelClassType) {
        this.addLabelAnnotation(field, topLevelClass, introspectedColumn);
        return true;
    }

    /**
     * 添加@Label注解
     * @see com.ryo.mybatis.demo.label.annotation.Label
     * @param field
     * @param topLevelClass
     * @param introspectedColumn 数据库列信息
     */
    protected void addLabelAnnotation(Field field, TopLevelClass topLevelClass, IntrospectedColumn introspectedColumn) {
        topLevelClass.addImportedType(this.dataAnnotation);
        String annotation = buildLabelAnnotation(introspectedColumn);
        if(StringUtil.isNotEmpty(annotation)) {
            field.addAnnotation(annotation);
        }
    }

    private String buildLabelAnnotation(IntrospectedColumn introspectedColumn){
        String remark = introspectedColumn.getRemarks();    //取得注释
        if(StringUtil.isEmpty(remark)) {
            return StringUtil.EMPTY;
        }

        String[] remarks = remark.split(":");
        if(remarks.length == 1) {
            return String.format("@Label(\"%s\")", remarks[0]);
        } else if(remarks.length == 2) {
            return String.format("@Label(value = \"%s\"), comment = \"%s\"", remarks[0], remarks[1]);
        }
        throw new IllegalArgumentException("数据库注释描述有误introspectedColumn: "+introspectedColumn);
    }

    @Override
    public boolean validate(List<String> warnings) {
        return true;
    }
}
```

- generatorConfig.xml

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE generatorConfiguration PUBLIC
        "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
        "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">

<generatorConfiguration>

    <context id="MySQLTables" targetRuntime="MyBatis3">
    <!--<context id="sqlContext" targetRuntime="MyBatis3Simple" defaultModelType="flat">-->

        <property name="beginningDelimiter" value="`"/>
        <property name="endingDelimiter" value="`"/>

        <!--label plugin-->
        <plugin type="com.ryo.mybatis.demo.label.plugin.LabelPlugin"/>

        <commentGenerator>
            <!-- 是否取消注释 -->
            <property name="suppressAllComments" value="true"/>
            <!--取消时间注释-->
            <property name="suppressDate" value="true"/>
        </commentGenerator>

        <!--jdbc driver-->
        <jdbcConnection driverClass="com.mysql.jdbc.Driver"
                        connectionURL="jdbc:mysql://localhost:3306/mybatis"
                        userId="root" password="123456"/>

        <!--Xxx.java-->
        <javaModelGenerator targetPackage="com.ryo.mybatis.demo.label.domain" targetProject="src/main/java">
            <property name="enableSubPackages" value="true"/>
            <property name="trimStrings" value="true"/>
        </javaModelGenerator>

        <!--XxxMapper.xml-->
        <sqlMapGenerator targetPackage="mapper" targetProject="src/main/resources">
            <property name="enableSubPackages" value="true"/>
        </sqlMapGenerator>

        <!--XxxMapper.java-->
        <javaClientGenerator type="XMLMAPPER" targetPackage="com.ryo.mybatis.demo.label.mapper" targetProject="src/main/java">
            <property name="enableSubPackages" value="true"/>
        </javaClientGenerator>

        <table tableName="role" enableCountByExample="false"
               enableUpdateByExample="false" enableDeleteByExample="false"
               enableSelectByExample="false" selectByExampleQueryId="false">
            <!--<property name="useActualColumnNames" value="true" />-->
        </table>

    </context>
</generatorConfiguration>
```

* any list
{:toc}