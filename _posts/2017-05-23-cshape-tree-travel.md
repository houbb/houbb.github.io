---
layout: post
title:  Tree
date:  2017-5-17 15:14:03 +0800
categories: [C#]
tags: [tree, dotnet]
published: true
---

# 前言

有些东西很有用，但是时间久了就容易忘记。

比如树的遍历，此处写一篇文章，记录**多叉树的遍历**。并于日后查阅和补充学习。

# Tree

一、首先，定义一个树的节点。

- TaskNode.cs

```c#
/// <summary>
/// 树的节点
/// </summary>
class TaskNode
{
    /// <summary>
    /// 存放子节点
    /// </summary>
    private List<TaskNode> children = new List<TaskNode>();

    /// <summary>
    /// 节点名称
    /// </summary>
    public string Name
    {
        get;
        set;
    }

    /// <summary>
    /// bat文件路径
    /// </summary>
    public string BatPath
    {
        get;
        set;
    }

    /// <summary>
    /// 子节点
    /// </summary>
    public List<TaskNode> Children
    {
        get
        {
            return this.children;
        }
    }

    #region methods
    /// <summary>
    /// 添加节点
    /// </summary>
    /// <param name="childNode"></param>
    /// <returns></returns>
    public List<TaskNode> AddChild(TaskNode childNode)
    {
        this.children.Add(childNode);
        return this.children;
    }
    #endregion
}
```

二、其次，构建一颗树。

- BuildTaskNode()

```c#
/// <summary>
/// 构建任务节点
/// </summary>
/// <returns></returns>
private static TaskNode BuildTaskNode()
{ 
    TaskNode root = new TaskNode();
    root.BatPath = "";
    root.Name = "root"; //root node

    TaskNode bondEventNode = new TaskNode();
    bondEventNode.BatPath = "bondEventNode.bat";
    bondEventNode.Name = "bondEventNode";

    TaskNode bondCashflowNode = new TaskNode();
    bondCashflowNode.BatPath = "bondCashflowNode.bat";
    bondCashflowNode.Name = "bondCashflowNode";

    TaskNode bondNode = new TaskNode();
    bondNode.BatPath = "bondNode.bat";
    bondNode.Name = "bondNode";

    TaskNode fundNode = new TaskNode();
    fundNode.BatPath = "fundNode.bat";
    fundNode.Name = "fundNode";

    TaskNode stockNode = new TaskNode();
    stockNode.BatPath = "stockNode.bat";
    stockNode.Name = "stockNode";

    TaskNode companyNode = new TaskNode();
    companyNode.BatPath = "companyNode.bat";
    companyNode.Name = "companyNode";

    TaskNode regionNode = new TaskNode();
    regionNode.BatPath = "regionNode.bat";
    regionNode.Name = "regionNode";

    //bond children
    bondNode.AddChild(bondEventNode);
    bondNode.AddChild(bondCashflowNode);

    //company children
    companyNode.AddChild(bondNode);
    companyNode.AddChild(fundNode);
    companyNode.AddChild(stockNode);

    //root children
    root.AddChild(companyNode);
    root.AddChild(regionNode);
    
    return root;
}
```

这棵树的 JSON 如下：

```json
{
    "Name":"root",
    "BatPath":"",
    "Children":[
        {
            "Name":"companyNode",
            "BatPath":"companyNode.bat",
            "Children":[
                {
                    "Name":"bondNode",
                    "BatPath":"bondNode.bat",
                    "Children":[
                        {
                            "Name":"bondEventNode",
                            "BatPath":"bondEventNode.bat",
                            "Children":[

                            ]
                        },
                        {
                            "Name":"bondCashflowNode",
                            "BatPath":"bondCashflowNode.bat",
                            "Children":[

                            ]
                        }
                    ]
                },
                {
                    "Name":"fundNode",
                    "BatPath":"fundNode.bat",
                    "Children":[

                    ]
                },
                {
                    "Name":"stockNode",
                    "BatPath":"stockNode.bat",
                    "Children":[

                    ]
                }
            ]
        },
        {
            "Name":"regionNode",
            "BatPath":"regionNode.bat",
            "Children":[

            ]
        }
    ]
}
```

三、我们要来遍历这棵树

1、递归深度遍历

优缺点就不废话了，这不是算法课。这个写起来最简单。

```c#
/// <summary>
/// 深度遍历-递归
/// </summary>
/// <param name="node"></param>
private static void RecursionTraverse(TaskNode node)
{ 
    if(node == null)
    {
        return;
    }

    //do sth useful
    Console.WriteLine(node.Name+", "+node.BatPath);

    for (int i = 0; i < node.Children.Count; i++)
    {
        TaskNode child = node.Children[i];
        RecursionTraverse(child);
    }
}
```

2、非递归层次遍历

```c#
/// <summary>
/// 层次遍历
/// </summary>
private static void LevelTraverse(TaskNode root)
{ 
    Queue<TaskNode> nodeQueue = new Queue<TaskNode>();
    nodeQueue.Enqueue(root);

    while (nodeQueue.Count > 0)
    {
        TaskNode node = nodeQueue.Dequeue();
        
        //do sth useful
        Console.WriteLine(node.Name + ", " + node.BatPath);

        for (int i = 0; i < node.Children.Count; i++)
        {
            TaskNode child = node.Children[i];
            nodeQueue.Enqueue(child);
        }
    }
}
```





