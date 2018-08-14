---
layout: post
title: Entity Framework
date:  2017-03-20 19:46:30 +0800
categories: [ORM]
tags: [orm, sql, .net]
header-img: "static/app/res/img/kon-bg.jpeg"
published: true
---


# Entity Framework

[Entity Framework](http://www.entityframeworktutorial.net/what-is-entityframework.aspx) is an Object/Relational Mapping (ORM) framework that enables developers 
to work with relational data as domain-specific objects, eliminating the need for most of the data access plumbing code that developers usually need to write.

> [msdn](https://msdn.microsoft.com/zh-cn/library/gg696172(v=vs.103).aspx)


# Note

> [ef base zh_CN](http://www.cnblogs.com/xuf22/articles/5513283.html)

> [ef detail zh_CH](http://blog.csdn.net/csh624366188/article/details/7065036)

一、Struct

![ef-struct](https://raw.githubusercontent.com/houbb/resource/master/img/dotnet/2017-03-20-dotnet-ef-struct.png)


EDM （实体数据模型）：EDM包括三个模型，概念模型、 映射和存储模型。

概念模型 ︰ 概念模型包含模型类和它们之间的关系。独立于数据库表的设计。

存储模型 ︰ 存储模型是数据库设计模型，包括表、 视图、 存储的过程和他们的关系和键。

映射 ︰ 映射包含有关如何将概念模型映射到存储模型的信息。

LINQ to Entities ︰ LINQ to Entities 是一种用于编写针对对象模型的查询的查询语言。它返回在概念模型中定义的实体。

Entity SQL: Entity SQL 是另一种炉类似于L2E的言语，但相给L2E要复杂的多，所以开发人员不得不单独学习它。

Object Services(对象服务)：是数据库的访问入口，负责数据具体化，从客户端实体数据到数据库记录以及从数据库记录和实体数据的转换。

Entity Client Data Provider：主要职责是将L2E或Entity Sql转换成数据库可以识别的Sql查询语句，它使用Ado.net通信向数据库发送数据可获取数据。

ADO.Net Data Provider：使用标准的Ado.net与数据库通信


二、DBContext

EDM生成SchoolDBEntities类，该类从System.Data.Entity.DbContext类继承。

EntityFramework4.1中Context类从ObjectContext类继承。DbContext类与ObjectContext类似，

它对ObjcetContext类进行包装更利于开发的三种模式：CodeFirst、Model First、Database First.

`DbContext`是EntityFramework很重要的部分，连接域模型与数据库的桥梁，是与数据库通信的主要类


![DbContext](https://raw.githubusercontent.com/houbb/resource/master/img/dotnet/2017-03-20-dotnet-ef-dbcontext.png)

DbContext主要负责以下活动：

EntitySet: DbContext包含了所有映射到表的entities

Querying：将Linq-To-Entities转译为Sql并发送到数据库

Change Tracking：从数据库获取entities后保留并跟踪实体数据变化

Persisting Data：根据entity状态执行Insert、update、delete命令

Caching：DbContext的默认第一级缓存，在上下文中的生命周期中存储entity

Manage Relationship：DbContext在DbFirst模式中使用CSDL、MSL、SSDL管理对象关系，Code first中使用fluent api 管理关系

Object Materialization：DbContext将物理表转成entity实例对象



- DbContext实例化


```c#
using (var ctx = new SchoolDBEntities())
{
//Can perform CRUD operation using ctx here..
}
```


- 将DbContext转为ObjectContext

```c#
using (var ctx = newSchoolDBEntities())
{
var objectContext = (ctx as System.Data.Entity.Infrastructure.IObjectContextAdapter).ObjectContext;
//use objectContext here..
}
```


三、Entity类型

POCO Entity (Plain Old CLR Object)：

不依赖于任何Framework的类的类（also known as persistence-ignorant objects），为Entity Data Model生成CRUD命令服务。

- Dynamic Proxy (POCO Proxy):

Dynamic Proxy是运行时POCO类的代理类，类似POCO类的包装。Dynamic Proxy允许延迟加载（Lazy loading），自动跟踪更改。POCO Entity必需满足以下几点才能转为POCO Proxy：

1. 必需声明为public 类

2. 不可以是sealed类

3. 不可以是抽象类

4. 导航属性必需是**public virtual**(Entity包含两种属性，标量属性Scalar properties：Entity本身的字段值，Navigation properties：其它entity的引用如班级-学生)

5. 集合属性必需是 `ICollection<T>`

6. ProxyCreationEnabled 选项必需是true

```c#
public class Student
{

    public Student()
    {
        this.Courses = new HashSet<Course>();
    }

    public int StudentID { get; set; }

    public string StudentName { get; set; }

    public Nullable<int> StandardId { get; set; }

    public virtual Standard Standard { get; set; }

    public virtual StudentAddress StudentAddress { get; set; }

    public virtual ICollection<Course> Courses { get; set; }
}
```


四、Entity Lifecycle

在我们做CRUD操作时，要先了解EntityFramework如何管理实体状态。每个实体的生命周期内都会在DbContext上下文中保存一个状态，分别是

Added Deleted Modified Unchanged Detached


![Lifecycle](https://raw.githubusercontent.com/houbb/resource/master/img/dotnet/2017-03-20-dotnet-ef-db-status.png)


五、Code First、DBFirst、Model First

(鉴于索引需要添加，实际选择DBFirst)

CodeFirst 领域设计时先定义实体类，用实体类生成数据库

DbFirst 从数据库生成实体类

Model First 使用Visual Studio实体设计器，设计ER，同时生成Entity类和DB



# LINQ

三种查询方式

- LINQ to Entities

- Entity SQL

- Native SQL

一、LINQ to Entities

> LINQ to Entities

```c#
//Querying with LINQ to Entities 
using (var context = newSchoolDBEntities())
{

var L2EQuery = context.Students.where(s => s.StudentName == "Bill");

var student = L2EQuery.FirstOrDefault<Student>();

}
```

> LINQ Query syntax

```c#
using (var context = new SchoolDBEntities())

{

var L2EQuery = from st in context.Students

where st.StudentName == "Bill" select st;

var student = L2EQuery.FirstOrDefault<Student>();
}
```

二、Entity SQL

1、Querying with Object Services and Entity SQL

```c#
//Querying with Object Services and Entity SQL

string sqlString = "SELECT VALUE st FROM SchoolDBEntities.Students " +

"AS st WHERE st.StudentName == 'Bill'";

var objctx = (ctx as IObjectContextAdapter).ObjectContext;

ObjectQuery<Student> student = objctx.CreateQuery<Student>(sqlString);

Student newStudent = student.First<Student>();
```

2、使用EntityDataReader


```c#
using (var con = newEntityConnection("name=SchoolDBEntities"))
{
    con.Open();
    EntityCommand cmd = con.CreateCommand();
    cmd.CommandText = "SELECT VALUE st FROM SchoolDBEntities.Students as st where st.StudentName='Bill'";
    Dictionary<int, string> dict = newDictionary<int, string>();
    using (EntityDataReader rdr = cmd.ExecuteReader(CommandBehavior.SequentialAccess | CommandBehavior.CloseConnection))
    {
        while (rdr.Read())
        {
            int a = rdr.GetInt32(0);
            var b = rdr.GetString(1);
            dict.Add(a, b);
        }
    }   
}
```

三、Native SQL

```c#
using (var ctx = newSchoolDBEntities())
{
    var studentName = ctx.Students.SqlQuery("Select studentid, studentname, standardId from Student where studentname='Bill'").FirstOrDefault<Student>();
}
```


# 跟踪变更与持久化场景

一、跟踪变更

在连接状态下持久化与脱机状态下持久化

- 连机状态下持久化，在同一个DbContext中不需要销毁Entity，直接写入数据库

- 脱机状态持久化指读取和保存Entity在两个不同的DbContext中，Context2不知道Entity的更新状态，所以必需通知Context2当前的Entity做了何种更新。

Context只在DbSet上跟踪添加和删除


> 正确的添加和删除

```c#
using (var context = new SchoolDBEntities())
{
    var studentList = context.Students.ToList<Student>();
    
    //Perform create operation
    
    context.Students.Add(newStudent() { StudentName = "New Student" });
    
    //Perform Update operation
    
    Student studentToUpdate = studentList.Where(s => s.StudentName == "student1").FirstOrDefault<Student>();
    
    studentToUpdate.StudentName = "Edited student1";
    
    //Perform delete operation
    
    context.Students.Remove(studentList.ElementAt<Student>(0));
    
    //Execute Insert, Update & Delete queries in the database
    
    context.SaveChanges();
}
```

> 错误的方式

以下代码在List中添加和删除不起作用，只有更新有效。

```c#
using (var context = new SchoolDBEntities())

{
    var studentList = context.Students.ToList<Student>();
    
    //Add student in list
    studentList.Add(new Student() { StudentName = "New Student" });
    
    //Perform update operationStudent 
    studentToUpdate = studentList.Where(s => s.StudentName == "Student1").FirstOrDefault<Student>();
    studentToUpdate.StudentName = "Edited student1";
    
    //Delete student from list
    if (studentList.Count > 0) 
    {
        studentList.Remove(studentList.ElementAt<Student>(0));
    }
    
    //SaveChanges() will only do update operation, not add and delete
    context.SaveChanges();
}
```


二、持久化场景

脱机实体管理要先附加到Context

```c#
//disconnected entity graph
Student disconnectedStudent = newStudent() { StudentName = "New Student" };
disconnectedStudent.StudentAddress = newStudentAddress() { Address1 = "Address", City = "City1" };

using (var ctx = newSchoolDBEntities())
{
    //attach disconnected Student entity graph to new context instance - ctx
    ctx.Students.Attach(disconnectedStudent);
    
    // get DbEntityEntry instance to check the EntityState of specified entity
    var studentEntry = ctx.Entry(disconnectedStudent);
    var addressEntry = ctx.Entry(disconnectedStudent.StudentAddress);
    Console.WriteLine("Student EntityState: {0}",studentEntry.State);
    Console.WriteLine("StudentAddress EntityState: {0}",addressEntry.State);
}
```




添加多个关系实体时与添加单个实体一样，更新关系实体时需要跟踪每个实体的状态。



# 加载

贪婪加载、惰性加载与定向加载

- 贪婪加载：使用Include()，自动加载关联实体

```c#
using (var context = new SchoolDBEntities())
{
    var res = (from s in context.Students.Include("Standard")
    where s.StudentName == "Student1"
    select s).FirstOrDefault<Student>();
}
```

- **惰性加载**：延迟加载对象关联的实体，用到时再加载，EF默认为LazyLoading

(这种一般比较推荐)

```c#
using (var ctx = newSchoolDBEntities())
{
    //Loading students only
    IList<Student> studList = ctx.Students.ToList<Student>();
    Student std = studList[0];
    
    //Loads Student address for particular Student only (seperate SQL query)
    StudentAddress add = std.StudentAddress;
}
```

- 定向加载：Reference()、Collection() 方法

```c#
using (var context = new SchoolDBEntities())
{
    //Loading students only
    IList<Student> studList = context.Students.ToList<Student>();
    Student std = studList.Where(s => s.StudentID == 1).FirstOrDefault<Student>();

    //Loads Standard for particular Student only (seperate SQL query)
    context.Entry(std).Reference(s => s.Standard).Load();

    //Loads Courses for particular Student only (seperate SQL query)
    context.Entry(std).Collection(s => s.Courses).Load();
}
```


# Execute SQL

一、返回实体

```c#
using (var ctx = newSchoolDBEntities())
{
    //列名必需要Entity属性匹配
    var studentList = ctx.Students.SqlQuery("Select * from Student").ToList<Student>();
}
```

二、返回非实体类型

```c#
using (var ctx = newSchoolDBEntities())
{
    //Get student name of string type
    string studentName = ctx.Database.SqlQuery<string>("Select studentname
    from Student where studentid=1").FirstOrDefault<string>();
}
```


三、执行SQL命令

```c#
using (var ctx = new SchoolDBEntities())
{
    //Update command
    int noOfRowUpdated = ctx.Database.ExecuteSqlCommand("Update student
    set studentname ='changed student by command' where studentid=1");
    
    //Insert command
    int noOfRowInserted = ctx.Database.ExecuteSqlCommand("insert into student(studentname)
    values('New Student')");
    
    //Delete command
    int noOfRowDeleted = ctx.Database.ExecuteSqlCommand("delete from student
    where studentid=1");
}
```


# Tips

> [LINQ](http://www.cnblogs.com/liulun/archive/2013/02/26/2909985.html)

> [ORM](http://www.cnblogs.com/zenghongliang/articles/1667063.html)

* any list
{:toc}



