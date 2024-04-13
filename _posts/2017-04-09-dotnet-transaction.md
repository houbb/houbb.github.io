---
layout: post
title:  Dotnet Transaction
date:  2017-04-09 21:44:46 +0800
categories: [C#]
tags: [cshape, cshape, lang, .net, dotnet]
published: true
---


# Transaction

如果要将多项任务绑定在一起，使其作为**单个工作单元**来执行，可以使用 ADO.NET 中的[事务](https://msdn.microsoft.com/zh-cn/library/2k2hy99x(v=vs.100).aspx)。

一、确定事务类型

事务如果是单阶段事务，并且由数据库直接处理，则属于本地事务。 事务如果由事务监视程序进行协调并使用故障保护机制（例如两阶段提交）解决事务，则属于分布式事务。

二、实例

以下代码示例演示对 Microsoft SQL Server 使用 ADO.NET 的事务逻辑。

```c#
using (SqlConnection connection = new SqlConnection(connectionString))
{
    connection.Open();

    // Start a local transaction.
    SqlTransaction sqlTran = connection.BeginTransaction();

    // Enlist a command in the current transaction.
    SqlCommand command = connection.CreateCommand();
    command.Transaction = sqlTran;

    try
    {
        // Execute two separate commands.
        command.CommandText =
          "INSERT INTO Production.ScrapReason(Name) VALUES('Wrong size')";
        command.ExecuteNonQuery();
        command.CommandText =
          "INSERT INTO Production.ScrapReason(Name) VALUES('Wrong color')";
        command.ExecuteNonQuery();

        // Commit the transaction.
        sqlTran.Commit();
        Console.WriteLine("Both records were written to database.");
    }
    catch (Exception ex)
    {
        // Handle the exception if the transaction fails to commit.
        Console.WriteLine(ex.Message);

        try
        {
            // Attempt to roll back the transaction.
            sqlTran.Rollback();
        }
        catch (Exception exRollback)
        {
            // Throws an InvalidOperationException if the connection 
            // is closed or the transaction has already been rolled 
            // back on the server.
            Console.WriteLine(exRollback.Message);
        }
    }
}
```


# Distributed Transactions

分布式事务是影响多个资源的事务。 要提交分布式事务，所有参与者都必须保证对数据的任何更改是永久的。 即使发生系统崩溃或其他不可预见的事件，更改也必须是永久的。 
即使只有一个参与者无法保证这一点，整个事务也将失败，在事务范围内对数据的任何更改均将回滚。


（暂时跳过）


# System.Transactions Integration with SQL Server 


一、使用 TransactionScope

TransactionScope 类通过隐式在分布式事务中登记连接，使代码块事务化。 必须在 TransactionScope 块的结尾调用 `Complete()`，然后再离开该代码块。 
离开代码块将调用 `Dispose()`。 如果引发的异常造成代码离开范围，将认为事务已中止。

我们建议您使用 using 块，以确保在退出 using 代码块时，在 TransactionScope 对象上调用 Dispose。
 
如果无法提交或回滚挂起的事务，可能会对性能造成严重影响，因为 TransactionScope 的默认超时为一分钟。
 
如果不使用 using 语句，必须在 Try 代码块中执行所有工作，并在 Finally 代码块中显式调用 Dispose 方法。

如果在 TransactionScope 中发生异常，事务将标记为不一致并被弃用。 在 TransactionScope 断开后，事务将回滚。
 
如果未发生任何异常，参与的事务将提交。

<label class="label label-info">WARN</label>

- 默认情况下，TransactionScope 类将创建一个 `IsolationLevel` 为 Serializable 的事务。 根据应用程序的不同，可能需要考虑降低隔离级别，以避免应用程序中出现大量的争用。



二、实例代码

使用 System.Transactions 要求具有 System.Transactions.dll 的引用。


下面的函数演示如何针对包装在 TransactionScope 块中的两个不同 SQL Server 实例（由两个不同的 SqlConnection 对象表示）创建可提升事务。 
该代码使用 using 语句创建 TransactionScope 代码块并打开第一个连接，该连接自动在 TransactionScope 中登记。 
事务最初作为轻型事务登记，而不是作为完全分布式事务。 仅当第一个连接中的命令没有引发异常时，才会在 TransactionScope 中登记第二个连接。 
打开第二个连接后，事务将自动提升为完全分布式事务。 将会调用 Complete 方法，仅当未引发异常时，该方法才会提交事务。 
如果在 TransactionScope 代码块中的任意位置引发了异常，将不会调用 Complete，当在 TransactionScope 的 using 代码块结尾处执行 dispose 后，将回滚分布式事务。


```c#
// This function takes arguments for the 2 connection strings and commands in order
// to create a transaction involving two SQL Servers. It returns a value > 0 if the
// transaction committed, 0 if the transaction rolled back. To test this code, you can 
// connect to two different databases on the same server by altering the connection string,
// or to another RDBMS such as Oracle by altering the code in the connection2 code block.
static public int CreateTransactionScope(
    string connectString1, string connectString2,
    string commandText1, string commandText2)
{
    // Initialize the return value to zero and create a StringWriter to display results.
    int returnValue = 0;
    System.IO.StringWriter writer = new System.IO.StringWriter();

    // Create the TransactionScope in which to execute the commands, guaranteeing
    // that both commands will commit or roll back as a single unit of work.
    using (TransactionScope scope = new TransactionScope())
    {
        using (SqlConnection connection1 = new SqlConnection(connectString1))
        {
            try
            {
                // Opening the connection automatically enlists it in the 
                // TransactionScope as a lightweight transaction.
                connection1.Open();

                // Create the SqlCommand object and execute the first command.
                SqlCommand command1 = new SqlCommand(commandText1, connection1);
                returnValue = command1.ExecuteNonQuery();
                writer.WriteLine("Rows to be affected by command1: {0}", returnValue);

                // if you get here, this means that command1 succeeded. By nesting
                // the using block for connection2 inside that of connection1, you
                // conserve server and network resources by opening connection2 
                // only when there is a chance that the transaction can commit.   
                using (SqlConnection connection2 = new SqlConnection(connectString2))
                    try
                    {
                        // The transaction is promoted to a full distributed
                        // transaction when connection2 is opened.
                        connection2.Open();

                        // Execute the second command in the second database.
                        returnValue = 0;
                        SqlCommand command2 = new SqlCommand(commandText2, connection2);
                        returnValue = command2.ExecuteNonQuery();
                        writer.WriteLine("Rows to be affected by command2: {0}", returnValue);
                    }
                    catch (Exception ex)
                    {
                        // Display information that command2 failed.
                        writer.WriteLine("returnValue for command2: {0}", returnValue);
                        writer.WriteLine("Exception Message2: {0}", ex.Message);
                    }
            }
            catch (Exception ex)
            {
                // Display information that command1 failed.
                writer.WriteLine("returnValue for command1: {0}", returnValue);
                writer.WriteLine("Exception Message1: {0}", ex.Message);
            }
        }

        // If an exception has been thrown, Complete will not 
        // be called and the transaction is rolled back.
        scope.Complete();
    }

    // The returnValue is greater than 0 if the transaction committed.
    if (returnValue > 0)
    {
        writer.WriteLine("Transaction was committed.");
    }
    else
    {
        // You could write additional business logic here, notify the caller by
        // throwing a TransactionAbortedException, or log the failure.
        writer.WriteLine("Transaction rolled back.");
    }

    // Display messages.
    Console.WriteLine(writer.ToString());

    return returnValue;
}
```












  * any list
  {:toc}
