---
layout: post
title:  Mybatis.NET
date:  2017-04-08 16:03:49 +0800
categories: [ORM]
tags: [mybatis, dotnet]
header-img: "static/app/res/img/kon-bg.jpeg"
published: true
---


# Mybatis.NET

[MyBatis](https://www.codeproject.com/articles/894127/mybatis-net) is a data mapping tool. 

It maps columns of a database query including stored procedure to properties of a business object. 

One definition of mapper is “an object that sets up communication between two independent objects. 

A Data Mapper is a "layer of mappers that moves data between objects and a database while keeping them independent of each other and the mapper itself.



# Why？

.NET platform already provides a capable library for accessing databases, whether through SQL statements or stored procedures but several things are still hard to do well when using ADO.NET, including:

- Separating SQL code from programming code

- Passing input parameters to the library classes and extracting the output

- Separating data access classes from business logic classes

- Caching often-used data until it changes

- Managing transactions and threading


iBATIS DataMapper solves these problems -- and many more -- by using XML documents to create a mapping between a plain-old object and a SQL statement or a stored procedure. 

The "plain-old object" can be a IDictionary or property object.



# Hello World


> [c# mybatis net +mysql 的一个初步摸索](http://blog.csdn.net/zzzxxbird/article/details/49388517)


本文使用 Mysql 进行测试。如果是 SQL server 请直接参考本文最后的一系列文章。你可以在[这里](https://github.com/houbb/mybatisNet.git)查看完整代码。


先来看一下项目文件结构

```
.
├── ./mybatisNet
│   ├── ./mybatisNet/Program.cs
│   ├── ./mybatisNet/Properties
│   │   └── ./mybatisNet/Properties/AssemblyInfo.cs
│   ├── ./mybatisNet/Providers.config
│   ├── ./mybatisNet/SqlMap.config
│   ├── ./mybatisNet/app.config
│   ├── ./mybatisNet/bin
│   │   └── ./mybatisNet/bin/Debug
│   │       └── ./mybatisNet/bin/Debug/mappers
│   ├── ./mybatisNet/domain
│   │   └── ./mybatisNet/domain/Mybatis.cs
│   ├── ./mybatisNet/mappers
│   │   └── ./mybatisNet/mappers/Mybatis.xml
│   ├── ./mybatisNet/mybatisNet.csproj
│   ├── ./mybatisNet/obj
│   │   └── ./mybatisNet/obj/x86
│   │       └── ./mybatisNet/obj/x86/Debug
│   ├── ./mybatisNet/packages.config
│   └── ./mybatisNet/service
│       └── ./mybatisNet/service/MybatisService.cs
├── ./mybatisNet.sln
├── ./mybatisNet.userprefs
└── ./packages
    ├── ./packages/MyBatis.NET.1.6.4
    │   ├── ./packages/MyBatis.NET.1.6.4/MyBatis.NET.1.6.4.nupkg
    │   └── ./packages/MyBatis.NET.1.6.4/lib
    │       ├── ./packages/MyBatis.NET.1.6.4/lib/IBatisNet.Common.dll
    │       ├── ./packages/MyBatis.NET.1.6.4/lib/IBatisNet.Common.pdb
    │       ├── ./packages/MyBatis.NET.1.6.4/lib/IBatisNet.Common.xml
    │       ├── ./packages/MyBatis.NET.1.6.4/lib/IBatisNet.DataMapper.dll
    │       ├── ./packages/MyBatis.NET.1.6.4/lib/IBatisNet.DataMapper.pdb
    │       └── ./packages/MyBatis.NET.1.6.4/lib/IBatisNet.DataMapper.xml
    └── ./packages/MySql.Data.6.9.9
        ├── ./packages/MySql.Data.6.9.9/CHANGES
        ├── ./packages/MySql.Data.6.9.9/MySql.Data.6.9.9.nupkg
        ├── ./packages/MySql.Data.6.9.9/Readme.txt
        ├── ./packages/MySql.Data.6.9.9/content
        │   ├── ./packages/MySql.Data.6.9.9/content/app.config.transform
        │   └── ./packages/MySql.Data.6.9.9/content/web.config.transform
        └── ./packages/MySql.Data.6.9.9/lib
            ├── ./packages/MySql.Data.6.9.9/lib/net40
            │   └── ./packages/MySql.Data.6.9.9/lib/net40/MySql.Data.dll
            └── ./packages/MySql.Data.6.9.9/lib/net45
                └── ./packages/MySql.Data.6.9.9/lib/net45/MySql.Data.dll
```

零、准备一张表用来测试。

- mybatis

```sql
CREATE TABLE `mybatis` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(64) NOT NULL COMMENT '名称',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB COMMENT='mybatis测试表';
```

一、引入对应的 DLL

1、 引入 `Mybatis.NET`

直接NUGET搜索【mybatis】安装即可。当前版本信息为 **1.6.4**.


2、 引入 `System.Data` 和 `Mysql.Data`

二、指定配置文件

<label class="label label-info">Attention</label>

在c#中  要将 `provider.config`、`sqlmap.config`  的属性设置为始终上传和内容，将`xxx.xml`设置为 始终上传和嵌入的资源。

换言之，比如保证编译后的文件里包含这些文件。

MONO里，文件上右键->【生成操作】->【EmbeddedResource】; 文件上右键->【快捷属性】->【复制到输出目录】.


1、 First thing you need for the datamapper work is data map definition file (SqlMap.config).

- `SqlMap.config`


```xml
<?xml version="1.0" encoding="utf-8"?>
<sqlMapConfig xmlns="http://ibatis.apache.org/dataMapper"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <!--properties节点通常用于引入在外部定义一些键值对配置文件，以方便在后面统一调用，这样修改的时候，只修改就可以了。
  　它的引入方式有3种：
	resource: 通过相对路径来确定文件的位置。
	url：　　 通过绝对路径来确定文件位置。
	embedded: 通过嵌入资源方式来确定文件位置。-->
  <!--<properties resource="../../../Files/properties.config"/>-->
  <!--Settings节点里，可以配置以下5个信息：
  useStatementNamespaces：默认flase,是否使用全局完整命名空间。
  cacheModelsEnabled :默认true,是否启用缓存。
  validateSqlMap:默认false,使用启用SqlMapConfig.xsd来验证映射XML文件。
  useReflectionOptimizer:默认true,是否使用反射机制访问C#中对象的属性。
  useEmbedStatementParams 是否使用嵌入的方式声明可变参数-->
  <settings>
    <setting useStatementNamespaces="false" />
    <setting cacheModelsEnabled="true" />
  </settings>

  <!--db provider配置文件路径-->
  <providers resource="Providers.config"/>


  <database>
    <provider name="MySql" />
    <dataSource name="MySql" connectionString="Host=127.0.0.1;UserName=root;Password=123456;Database=blog;Port=3306;CharSet=utf8;Allow Zero Datetime=true"/>
  </database>

  <!--SqlMaps节点，用于配置映射信息。通常在映射信息写在外部，在这个节点引入。-->
  <sqlMaps>
		<sqlMap resource="mappers/Mybatis.xml"/>
  </sqlMaps>
	
</sqlMapConfig>
```

- Providers.config

```xml
<?xml version="1.0" encoding="utf-8"?>
<providers xmlns="http://ibatis.apache.org/providers" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <clear/>

	<provider name="MySql"
     description="MySQL, MySQL provider V6.9.9.0"
     enabled="true"
     assemblyName="MySql.Data, Version=6.9.9.0, Culture=neutral, PublicKeyToken=c5687fc88969c44d"
     connectionClass="MySql.Data.MySqlClient.MySqlConnection"
     commandClass="MySql.Data.MySqlClient.MySqlCommand"
     parameterClass="MySql.Data.MySqlClient.MySqlParameter"
     parameterDbTypeClass="MySql.Data.MySqlClient.MySqlDbType"
     parameterDbTypeProperty="MySqlDbType"
     dataAdapterClass="MySql.Data.MySqlClient.MySqlDataAdapter"
     commandBuilderClass="MySql.Data.MySqlClient.MySqlCommandBuilder"
     usePositionalParameters="false"
     useParameterPrefixInSql="true"
     useParameterPrefixInParameter="true"
     parameterPrefix="@"
     allowMARS="false" />
</providers>
```

- Mybatis.xml & Mybatis.cs

```xml
<?xml version="1.0" encoding="utf-8" ?>
<sqlMap namespace="mybatisNet.mappers"
    xmlns="http://ibatis.apache.org/mapping"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <resultMaps>
    <resultMap id="BaseResultMap" class="mybatisNet.doamin.Mybatis">
<!--      <result property="id" column="id" dbType="BIGINT"/>-->
		<id property="id" column="id" dbType="BIGINT" />
      <result property="name" column="name" dbType="VARCHAR"/>
    </resultMap>
  </resultMaps>

  <statements>

	<select id="QueryMybatis" resultMap="BaseResultMap" parameterClass="System.Int32">
		SELECT id, name
			FROM `mybatis` 
			WHERE (id = #value#)
	</select>	

    <insert id="InsertMybatis" parameterClass="mybatisNet.doamin.Mybatis">
      INSERT INTO `mybatis` (id, name) VALUES (
		  #id#, #name#
		);
    </insert>

	<delete id="DeleteMybatis" parameterClass="mybatisNet.doamin.Mybatis">
      DELETE FROM `mybatis`
      WHERE
      (id = #id#)
    </delete>

	<update id="UpdateMybatis" parameterClass="mybatisNet.doamin.Mybatis">
      UPDATE `mybatis` 
	  SET
      name = #name#
      WHERE
      (id = #id#)
    </update>	
		
  </statements>
</sqlMap>
```

```c#
using System;
namespace mybatisNet.doamin
{
	[Serializable]
	public class Mybatis
	{
		/// <summary>
		/// The identifier.
		/// </summary>
		private int id;

		/// <summary>
		/// The name.
		/// </summary>
		private string name;		


		public int Id
		{
			get
			{
				return id;
			}

			set
			{
				id = value;
			}
		}

		public string Name
		{
			get
			{
				return name;
			}

			set
			{
				name = value;
			}
		}

		public override string ToString()
		{
			return string.Format("[Mybatis: id={0}, name={1}]", id, name);
		}
	}
}
```

- MybatisService.cs

```c#
using System;
using IBatisNet.DataMapper;
using IBatisNet.DataMapper.Configuration;
using mybatisNet.doamin;

namespace mybatisNet
{
	public class MybatisService
	{
		/// <summary>
		/// Inserts the mybatis.
		/// </summary>
		/// <param name="mybatis">Mybatis.</param>
		public void InsertMybatis(Mybatis mybatis)
		{
			ISqlMapper mapper = EntityMapper;

			try
			{
				mapper.Insert("InsertMybatis", mybatis);
			}
			catch (Exception ex)
			{ 
				Console.WriteLine("ex when InsertMybatis:{0}", ex);
			}
		}


		/// <summary>
		/// Queries the mybatis.
		/// </summary>
		/// <returns>The mybatis.</returns>
		/// <param name="id">Identifier.</param>
		public Mybatis QueryMybatis(int id)
		{ 
			ISqlMapper mapper = EntityMapper;

			try
			{
				Mybatis result = mapper.QueryForObject<Mybatis>("QueryMybatis", id);
				return result;
			}
			catch (Exception ex)
			{
				Console.WriteLine("ex:{0}", ex);
				return null;
			}
		}

		/// <summary>
		/// Updates the mybatis.
		/// </summary>
		/// <returns>The mybatis.</returns>
		/// <param name="mybatis">Mybatis.</param>
		public int UpdateMybatis(Mybatis mybatis)
		{
			ISqlMapper mapper = EntityMapper;

			try
			{
				int result = mapper.Update("UpdateMybatis", mybatis);
				return result;
			}
			catch (Exception ex)
			{
				Console.WriteLine("ex:{0}", ex);
				return 0;
			}
		}

		public int DeleteMybatis(Mybatis mybatis)
		{
			ISqlMapper mapper = EntityMapper;

			try
			{
				int result = mapper.Delete("DeleteMybatis", mybatis);
				return result;
			}
			catch (Exception ex)
			{
				Console.WriteLine("ex:{0}", ex);
				return 0;
			}
		}



		/// <summary>
		/// Gets the entity mapper.
		/// </summary>
		/// <value>The entity mapper.</value>
		public static ISqlMapper EntityMapper
		{
			get
			{
				try
				{
					ISqlMapper mapper = Mapper.Instance();
					return mapper;
				}
				catch (Exception ex)
				{
					Console.WriteLine("ex:{0}", ex);
					//throw ex;
					return null;
				}
			}
		}
	}
}
```


- Simple Test code

这里偷懒了。没有写对应的单元测试。都是简单的调用。

```c#
using System;
using IBatisNet.DataMapper;
using IBatisNet.DataMapper.Configuration;
using mybatisNet.doamin;

namespace mybatisNet
{
	class MainClass
	{
		public static void Main(string[] args)
		{
			MybatisService service = new MybatisService();

			//Mybatis mybatis = new Mybatis();
			//mybatis.Id = 3;
			//mybatis.Name = "hello mybatis .net update";

			//service.InsertMybatis(mybatis);
			//service.Q

			//service.UpdateMybatis(mybatis);
			//service.DeleteMybatis(mybatis);



			Console.WriteLine("result: {0}", service.QueryMybatis(1));
		}
	}
}
```

最后：

比较而言，C# 版本的 mybatis 已经停止更新了。文档也不是很全。

如果你知道 java 版本的，肯定不会去手写这里的 model,mapper。C# 可以借助[codesmithtools](http://www.codesmithtools.com/)，Mac上安装不了，此刻跳过。



# Download & BLOG

> [Download MyBatis.NET 1.6.2](http://webscripts.softpedia.com/script/Database-Tools/MyBatis-NET-74189.html)

> [MyBatisNet的安装使用](http://blog.csdn.net/anyqu/article/details/40427527) 

> [Mybatis.NET](https://www.codeproject.com/articles/894127/mybatis-net)

> [Mybatis.NET 入门系列3](http://blog.csdn.net/wulex/article/details/52232153)

> [Mybatis.NET CRUD](http://zhoufoxcn.blog.51cto.com/792419/459684/)

> [Mybatis.NET 环境配置](http://www.cnblogs.com/chenkai/archive/2011/03/21/1990596.html)





* any list
{:toc}













 
 







