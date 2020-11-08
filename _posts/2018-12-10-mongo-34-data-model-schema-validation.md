---
layout: post
title: Mongo Data Model Schema Validation-34 Mongo 数据模型 Schema Validation
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, mongo, sh]
published: true
---

# Schema Validation

3.2 版中的新版本。

mongodb 提供了在更新和插入过程中执行架构验证的功能。

# 指定验证规则

验证规则基于每个集合。

若要在创建新集合时指定验证规则, 请将 db.createCollection() 与 `validator` 选项一起使用。

若要将文档验证添加到现有集合中, 请将 collMod 命令与 `validator` 选项一起使用。

mongodb 还提供了以下相关选项:

验证级选项, 该选项确定 mongodb 在更新期间如何严格地将验证规则应用于现有文档, 以及
"验证操作" 选项, 该选项确定 mongodb 是否应错误和拒绝违反验证规则的文档, 或警告日志中的冲突, 但允许无效文档。

# json 架构

3.6 版中的新版本。

从3.6 版开始, mongodb 支持 json 架构验证。若要指定 json 架构验证, 请在验证器表达式中使用 $jsonSchema 运算符。

> 注意

json 架构是执行架构验证的推荐方法。


比如下面这个例子：

```
("students", {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: [ "name", "year", "major", "gpa", "address.city", "address.street" ],
         properties: {
            name: {
               bsonType: "string",
               description: "must be a string and is required"
            },
            gender: {
               bsonType: "string",
               description: "must be a string and is not required"
            },
            year: {
               bsonType: "int",
               minimum: 2017,
               maximum: 3017,
               exclusiveMaximum: false,
               description: "must be an integer in [ 2017, 3017 ] and is required"
            },
            major: {
               enum: [ "Math", "English", "Computer Science", "History", null ],
               description: "can only be one of the enum values and is required"
            },
            gpa: {
               bsonType: [ "double" ],
               minimum: 0,
               description: "must be a double and is required"
            },
            "address.city" : {
               bsonType: "string",
               description: "must be a string and is required"
            },
            "address.street" : {
               bsonType: "string",
               description: "must be a string and is required"
            }
         }
      }
   }
})
```

# 查询表达式

除了 json 架构验证外, mongodb 还支持使用查询运算符使用查询筛选器表达式进行验证。

但 $near、$nearSphere、$text 和 $where 除外。

例如, 下面的示例使用查询表达式指定验证器规则:

```
db.createCollection( "contacts",
   { validator: { $or:
      [
         { phone: { $type: "string" } },
         { email: { $regex: /@mongodb\.com$/ } },
         { status: { $in: [ "Unknown", "Incomplete" ] } }
      ]
   }
} )
```

# 行为

验证发生在更新和插入过程中。向集合中添加验证时, 在修改之前, 不会对现有文档进行验证检查。

## 现有文件

"验证级别" 选项确定 mongodb 应用验证规则的操作:

1、如果验证级别是严格的 (默认值), mongodb 将验证规则应用于所有插入和更新。

2、如果验证级别为中等, mongodb 将验证规则应用于插入和更新已满足验证条件的现有文档。

使用中等级别, 不会检查对不符合验证条件的现有文档的更新是否有效。

例如, 使用以下文档创建联系人集合:

```
db.contacts.insert([
   { "_id": 1, "name": "Anne", "phone": "+1 555 123 456", "city": "London", "status": "Complete" },
   { "_id": 2, "name": "Ivan", "city": "Vancouver" }
])
```

发出以下命令以将验证程序添加到联系人集合:

```
db.runCommand( {
   collMod: "contacts",
   validator: { $jsonSchema: {
      bsonType: "object",
      required: [ "phone", "name" ],
      properties: {
         phone: {
            bsonType: "string",
            description: "must be a string and is required"
         },
         name: {
            bsonType: "string",
            description: "must be a string and is required"
         }
      }
   } },
   validationLevel: "moderate"
} )
```

联系人集合现在具有具有中等验证级别的验证程序:

如果您尝试使用 _id 1 更新文档, mongodb 将应用验证规则, 因为现有文档符合条件。

相反, mongodb 不会将验证规则应用于 _id 为2的文档的更新, 因为它不符合验证规则。

若要完全禁用验证, 可以将 "验证级别" 设置为 "关闭"。

## 接受或拒绝无效文档

"验证操作" 选项确定 mongodb 如何处理违反验证规则的文档:

1. 如果验证操作是错误的 (默认值), mongodb 将拒绝任何违反验证标准的插入或更新。

2. 如果验证操作受到警告, mongodb 将记录任何冲突, 但允许继续插入或更新。

3. 例如, 使用以下 json 架构验证程序创建一个接触式2集合:

```
db.createCollection( "contacts2", {
   validator: { $jsonSchema: {
      bsonType: "object",
      required: [ "phone" ],
      properties: {
         phone: {
            bsonType: "string",
            description: "must be a string and is required"
         },
         email: {
            bsonType : "string",
            pattern : "@mongodb\.com$",
            description: "must be a string and match the regular expression pattern"
         },
         status: {
            enum: [ "Unknown", "Incomplete" ],
            description: "can only be one of the enum values"
         }
      }
   } },
   validationAction: "warn"
} )
```

使用警告验证操作, mongodb 记录任何冲突, 但允许插入或更新继续进行。

例如, 下面的插入操作违反了验证规则:

```
db.contacts2.insert( { name: "Amanda", status: "Updated" } )
```

但是, 由于验证操作仅发出警告, mongodb 只记录验证冲突消息, 并允许操作继续:

```
2017-12-01T12:31:23.738-0500 W STORAGE  [conn1] Document would fail validation collection: example.contacts2 doc: { _id: ObjectId('5a2191ebacbbfc2bdc4dcffc'), name: "Amanda", status: "Updated" }
```

# 限制

不能为管理、本地和配置数据库中的集合指定验证程序。

不能为系统指定验证程序。

# 绕过文档验证

用户可以使用绕过文档验证选项绕过文档验证。有关支持绕过文档验证选项的命令列表, 请参阅文档验证。

对于已启用访问控制的部署, 若要绕过文档验证, 经过身份验证的用户必须绕过文档验证操作。

内置角色 dbadmin 和还原提供此操作。

# 参考资料

https://docs.mongodb.com/manual/core/map-reduce/

* any list
{:toc}