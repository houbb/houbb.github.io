---
layout: post
title:  Mybatis.NET
date:  2017-04-09 21:44:46 +0800
categories: [C#]
tags: [cshape, cshape, lang, .net, dotnet]
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


# 动态SQL

也就是说，此时的mybatisNet(V1.6.4.0) 和 以前的 Java版本 ibatis 保持一致。==

> [IBatis.net动态SQL语句](http://www.cnblogs.com/kissdodog/archive/2013/11/21/3436587.html)

# 打印SQL的LOG

> [mybatisNet with log4net](http://www.cnblogs.com/Dunk/p/3714689.html)

# Download & BLOG

> [Download MyBatis.NET 1.6.2](http://webscripts.softpedia.com/script/Database-Tools/MyBatis-NET-74189.html)

> [MyBatisNet的安装使用](http://blog.csdn.net/anyqu/article/details/40427527) 

> [Mybatis.NET](https://www.codeproject.com/articles/894127/mybatis-net)

> [Mybatis.NET 入门系列3](http://blog.csdn.net/wulex/article/details/52232153)

> [Mybatis.NET CRUD](http://zhoufoxcn.blog.51cto.com/792419/459684/)

> [Mybatis.NET 环境配置](http://www.cnblogs.com/chenkai/archive/2011/03/21/1990596.html)





# 神奇的BUG

情景说明：

当涉及到2张表时：且二者的字段不完全相同。

```xml
<sqlMaps>
    <sqlMap resource="mappers/Mybatis.xml"/>
    <sqlMap resource="mappers/MethodInfo.xml"/>
</sqlMaps>
```

当后者查询时，而且查询的是自己的表。就会莫名其妙的出现第一张的字段。(name 这个字段在 mybatis这张表中)报错如下：


（初步猜测，会将所有的 statement 执行一遍。）但是这个问题又是不可能出现的，因为这么多人用。不知道我什么地方配置出错了。

```
ex:System.IndexOutOfRangeException: Could not find specified column in results: name
  at MySql.Data.MySqlClient.ResultSet.GetOrdinal (System.String name) [0x0002f] in <0a135c8e4d604d948724bf6960583b7f>:0 
  at MySql.Data.MySqlClient.MySqlDataReader.GetOrdinal (System.String name) [0x00020] in <0a135c8e4d604d948724bf6960583b7f>:0 
  at IBatisNet.DataMapper.Commands.DataReaderDecorator.System.Data.IDataRecord.GetOrdinal (System.String name) [0x00000] in <ed90c8d30e2d4724a3bee124edf80dbd>:0 
  at IBatisNet.DataMapper.TypeHandlers.StringTypeHandler.GetValueByName (IBatisNet.DataMapper.Configuration.ResultMapping.ResultProperty mapping, System.Data.IDataReader dataReader) [0x00007] in <ed90c8d30e2d4724a3bee124edf80dbd>:0 
  at IBatisNet.DataMapper.Configuration.ResultMapping.ResultProperty.GetDataBaseValue (System.Data.IDataReader dataReader) [0x00015] in <ed90c8d30e2d4724a3bee124edf80dbd>:0 
  at IBatisNet.DataMapper.MappedStatements.PropertyStrategy.DefaultStrategy.Get (IBatisNet.DataMapper.Scope.RequestScope request, IBatisNet.DataMapper.Configuration.ResultMapping.IResultMap resultMap, IBatisNet.DataMapper.Configuration.ResultMapping.ResultProperty mapping, System.Object& target, System.Data.IDataReader reader) [0x0008a] in <ed90c8d30e2d4724a3bee124edf80dbd>:0 
  at IBatisNet.DataMapper.MappedStatements.PropertyStrategy.DefaultStrategy.Set (IBatisNet.DataMapper.Scope.RequestScope request, IBatisNet.DataMapper.Configuration.ResultMapping.IResultMap resultMap, IBatisNet.DataMapper.Configuration.ResultMapping.ResultProperty mapping, System.Object& target, System.Data.IDataReader reader, System.Object keys) [0x00000] in <ed90c8d30e2d4724a3bee124edf80dbd>:0 
  at IBatisNet.DataMapper.MappedStatements.ResultStrategy.ResultMapStrategy.Process (IBatisNet.DataMapper.Scope.RequestScope request, System.Data.IDataReader& reader, System.Object resultObject) [0x0008f] in <ed90c8d30e2d4724a3bee124edf80dbd>:0 
  at IBatisNet.DataMapper.MappedStatements.ResultStrategy.MapStrategy.Process (IBatisNet.DataMapper.Scope.RequestScope request, System.Data.IDataReader& reader, System.Object resultObject) [0x0002a] in <ed90c8d30e2d4724a3bee124edf80dbd>:0 
  at IBatisNet.DataMapper.MappedStatements.MappedStatement.RunQueryForObject[T] (IBatisNet.DataMapper.Scope.RequestScope request, IBatisNet.DataMapper.ISqlMapSession session, System.Object parameterObject, T resultObject) [0x00013] in <ed90c8d30e2d4724a3bee124edf80dbd>:0 
result: 

Press any key to continue...
```


原因如下：

这里的 `resultMap.id` 也请务必保持唯一。

```xml
<resultMaps>
    <resultMap id="BaseResultMapMybatis" class="mybatisNet.doamin.Mybatis">
		<id property="id" column="id" dbType="BIGINT" />
      <result property="name" column="name" dbType="VARCHAR"/>
    </resultMap>
</resultMaps>
```



- 执行

```c#
Console.WriteLine("result: {0}", new MethodInfoDao().QueryMethodInfo(1));
```

- 查询方法如下

```c#
public MethodInfo QueryMethodInfo(int id)
{
    try
    {
        ISqlMapper mapper = Mapper.Instance();
        MethodInfo result = mapper.QueryForObject<MethodInfo>("QueryMethodInfo", id);
        return result;
    }
    catch (Exception ex)
    {
        Console.WriteLine("ex:{0}", ex);
        return null;
    }
}
```

- MethodInfo.xml

```xml
<?xml version="1.0" encoding="utf-8" ?>
<sqlMap namespace="mybatisNet.mappers"
    xmlns="http://ibatis.apache.org/mapping"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <resultMaps>
    <resultMap id="BaseResultMap" class="mybatisNet.doman.MethodInfo">
	  <result property="Id" column="id" dbType="BIGINT"/>
      <result property="MethodName" column="methodName" dbType="VARCHAR"/>
    </resultMap>
  </resultMaps>

  <statements>

	<select id="QueryMethodInfo" resultMap="BaseResultMap" parameterClass="System.Int32">
		SELECT id, methodName
			FROM `methodInfo` 
			WHERE (id = #value#)
	</select>	
		
  </statements>
</sqlMap>
```

猜想的验证

- 配置 log4net for mybatisNet

修改 app.config

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>

  <configSections>
    <sectionGroup name="iBATIS">
      <section name="logging" type="IBatisNet.Common.Logging.ConfigurationSectionHandler, IBatisNet.Common" />
    </sectionGroup>
    <section name="log4net" type="log4net.Config.Log4NetConfigurationSectionHandler, log4net" />
  </configSections>
	
  <!--日志输出到命令行 上面的节点是三种方式都要的--> 
  <iBATIS>
    <logging>
      <logFactoryAdapter type="IBatisNet.Common.Logging.Impl.ConsoleOutLoggerFA, IBatisNet.Common">
        <arg key="showLogName" value="true" />
        <arg key="showDataTime" value="true" />
        <arg key="level" value="ALL" />
        <arg key="dateTimeFormat" value="yyyy/MM/dd HH:mm:ss:SSS" />
      </logFactoryAdapter>
    </logging>
  </iBATIS>
	
</configuration>
```


日志如下：

```
2017/04/12 22:33:38:SSS [DEBUG] IBatisNet.Common.Utilities.ConfigWatcherHandler - Adding file [SqlMap.config] to list of watched files.
2017/04/12 22:33:39:SSS [DEBUG] IBatisNet.Common.Utilities.ConfigWatcherHandler - Adding file [Mybatis.xml] to list of watched files.
2017/04/12 22:33:39:SSS [DEBUG] IBatisNet.DataMapper.Configuration.Statements.PreparedStatementFactory - Statement Id: [QueryMybatis] Prepared SQL: [SELECT id, name    FROM `mybatis`     WHERE (id =  @param0 )]
2017/04/12 22:33:39:SSS [DEBUG] IBatisNet.DataMapper.Configuration.Statements.PreparedStatementFactory - Statement Id: [InsertMybatis] Prepared SQL: [INSERT INTO `mybatis` (id, name) VALUES (      @param0 ,  @param1    );]
2017/04/12 22:33:39:SSS [DEBUG] IBatisNet.DataMapper.Configuration.Statements.PreparedStatementFactory - Statement Id: [UpdateMybatis] Prepared SQL: [UPDATE `mybatis`     SET       name =  @param0        WHERE       (id =  @param1 )]
2017/04/12 22:33:39:SSS [DEBUG] IBatisNet.DataMapper.Configuration.Statements.PreparedStatementFactory - Statement Id: [DeleteMybatis] Prepared SQL: [DELETE FROM `mybatis`       WHERE       (id =  @param0 )]
2017/04/12 22:33:39:SSS [DEBUG] IBatisNet.Common.Utilities.ConfigWatcherHandler - Adding file [MethodInfo.xml] to list of watched files.
2017/04/12 22:33:39:SSS [DEBUG] IBatisNet.DataMapper.Configuration.Statements.PreparedStatementFactory - Statement Id: [QueryMethodInfo] Prepared SQL: [SELECT id, methodName    FROM `methodInfo`     WHERE (id =  @param0 )]

2017/04/12 22:33:39:SSS [DEBUG] IBatisNet.DataMapper.Commands.DefaultPreparedCommand - Statement Id: [QueryMethodInfo] PreparedStatement : [SELECT id, methodName    FROM `methodInfo`     WHERE (id =  @param0 )]
2017/04/12 22:33:39:SSS [DEBUG] IBatisNet.DataMapper.Commands.DefaultPreparedCommand - Statement Id: [QueryMethodInfo] Parameters: [@param0=[value,1]]
2017/04/12 22:33:39:SSS [DEBUG] IBatisNet.DataMapper.Commands.DefaultPreparedCommand - Statement Id: [QueryMethodInfo] Types: [@param0=[Int32, System.Int32]]
2017/04/12 22:33:39:SSS [DEBUG] IBatisNet.DataMapper.SqlMapSession - Open Connection "21023919" to "MySQL, MySQL provider V6.9.9.0".
2017/04/12 22:33:39:SSS [DEBUG] IBatisNet.DataMapper.SqlMapSession - Close Connection "21023919" to "MySQL, MySQL provider V6.9.9.0".

ex:System.IndexOutOfRangeException: Could not find specified column in results: name
  at MySql.Data.MySqlClient.ResultSet.GetOrdinal (System.String name) [0x0002f] in <0a135c8e4d604d948724bf6960583b7f>:0 
  at MySql.Data.MySqlClient.MySqlDataReader.GetOrdinal (System.String name) [0x00020] in <0a135c8e4d604d948724bf6960583b7f>:0 
  at IBatisNet.DataMapper.Commands.DataReaderDecorator.System.Data.IDataRecord.GetOrdinal (System.String name) [0x00000] in <ed90c8d30e2d4724a3bee124edf80dbd>:0 
  at IBatisNet.DataMapper.TypeHandlers.StringTypeHandler.GetValueByName (IBatisNet.DataMapper.Configuration.ResultMapping.ResultProperty mapping, System.Data.IDataReader dataReader) [0x00007] in <ed90c8d30e2d4724a3bee124edf80dbd>:0 
  at IBatisNet.DataMapper.Configuration.ResultMapping.ResultProperty.GetDataBaseValue (System.Data.IDataReader dataReader) [0x00015] in <ed90c8d30e2d4724a3bee124edf80dbd>:0 
  at IBatisNet.DataMapper.MappedStatements.PropertyStrategy.DefaultStrategy.Get (IBatisNet.DataMapper.Scope.RequestScope request, IBatisNet.DataMapper.Configuration.ResultMapping.IResultMap resultMap, IBatisNet.DataMapper.Configuration.ResultMapping.ResultProperty mapping, System.Object& target, System.Data.IDataReader reader) [0x0008a] in <ed90c8d30e2d4724a3bee124edf80dbd>:0 
  at IBatisNet.DataMapper.MappedStatements.PropertyStrategy.DefaultStrategy.Set (IBatisNet.DataMapper.Scope.RequestScope request, IBatisNet.DataMapper.Configuration.ResultMapping.IResultMap resultMap, IBatisNet.DataMapper.Configuration.ResultMapping.ResultProperty mapping, System.Object& target, System.Data.IDataReader reader, System.Object keys) [0x00000] in <ed90c8d30e2d4724a3bee124edf80dbd>:0 
  at IBatisNet.DataMapper.MappedStatements.ResultStrategy.ResultMapStrategy.Process (IBatisNet.DataMapper.Scope.RequestScope request, System.Data.IDataReader& reader, System.Object resultObject) [0x0008f] in <ed90c8d30e2d4724a3bee124edf80dbd>:0 
  at IBatisNet.DataMapper.MappedStatements.ResultStrategy.MapStrategy.Process (IBatisNet.DataMapper.Scope.RequestScope request, System.Data.IDataReader& reader, System.Object resultObject) [0x0002a] in <ed90c8d30e2d4724a3bee124edf80dbd>:0 
  at IBatisNet.DataMapper.MappedStatements.MappedStatement.RunQueryForObject[T] (IBatisNet.DataMapper.Scope.RequestScope request, IBatisNet.DataMapper.ISqlMapSession session, System.Object parameterObject, T resultObject) [0x00013] in <ed90c8d30e2d4724a3bee124edf80dbd>:0 
result: 
```


本来我应该执行的只有一句 `[SELECT id, methodName    FROM methodInfo  WHERE (id =  @param0 )]`， 可是前面另一张表的各种SQL也被预打印了一遍？？？

如果只是将查询改成这样
 
```c#
public MethodInfo QueryMethodInfo(int id)
{
 try
 {
     ISqlMapper mapper = Mapper.Instance();
     //MethodInfo result = mapper.QueryForObject<MethodInfo>("QueryMethodInfo", id);
     //return result;
     return null;
 }
 catch (Exception ex)
 {
     Console.WriteLine("ex:{0}", ex);
     return null;
 }
}
```

LOG如下，且不会报错。

```
2017/04/12 22:33:38:SSS [DEBUG] IBatisNet.Common.Utilities.ConfigWatcherHandler - Adding file [SqlMap.config] to list of watched files.
2017/04/12 22:33:39:SSS [DEBUG] IBatisNet.Common.Utilities.ConfigWatcherHandler - Adding file [Mybatis.xml] to list of watched files.
2017/04/12 22:33:39:SSS [DEBUG] IBatisNet.DataMapper.Configuration.Statements.PreparedStatementFactory - Statement Id: [QueryMybatis] Prepared SQL: [SELECT id, name    FROM `mybatis`     WHERE (id =  @param0 )]
2017/04/12 22:33:39:SSS [DEBUG] IBatisNet.DataMapper.Configuration.Statements.PreparedStatementFactory - Statement Id: [InsertMybatis] Prepared SQL: [INSERT INTO `mybatis` (id, name) VALUES (      @param0 ,  @param1    );]
2017/04/12 22:33:39:SSS [DEBUG] IBatisNet.DataMapper.Configuration.Statements.PreparedStatementFactory - Statement Id: [UpdateMybatis] Prepared SQL: [UPDATE `mybatis`     SET       name =  @param0        WHERE       (id =  @param1 )]
2017/04/12 22:33:39:SSS [DEBUG] IBatisNet.DataMapper.Configuration.Statements.PreparedStatementFactory - Statement Id: [DeleteMybatis] Prepared SQL: [DELETE FROM `mybatis`       WHERE       (id =  @param0 )]
2017/04/12 22:33:39:SSS [DEBUG] IBatisNet.Common.Utilities.ConfigWatcherHandler - Adding file [MethodInfo.xml] to list of watched files.
2017/04/12 22:33:39:SSS [DEBUG] IBatisNet.DataMapper.Configuration.Statements.PreparedStatementFactory - Statement Id: [QueryMethodInfo] Prepared SQL: [SELECT id, methodName    FROM `methodInfo`     WHERE (id =  @param0 )]
```





* any list
{:toc}













 
 







