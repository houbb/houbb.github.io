---
layout: post
title:  Xml for CShape
date:  2017-05-19 21:45:44 +0800
categories: [C#]
tags: [xml, dotnet]
published: true
---


# XML

假设我们要解析形如 `manifest.xml` 的文件。

- manifest.xml

```xml
<manifest>
<templetes>
<table name="mdm.md_Bond">
	<map field="UID"  pos="2" />
	<map field="UniqueKey"  pos="3" />
	<map field="LastUpdatedTime" pos="4" />
</table>

<table name="hha.md_Bond">
	<map field="UID"  pos="3" />
</table>

</templetes>
</manifest>
```

- XmlService.cs

```c#
/// <summary>
/// 获取指定路径下，指定表明对应的数据
/// </summary>
/// <param name="filePath">文件路径</param>
/// <param name="tableName">对应表名</param>
/// <returns></returns>
public static Dictionary<string, int> GetFieldMapping(string filePath, string tableName)
{
    Dictionary<string, int> result = new Dictionary<string,int>();

    try 
    {
        XmlDocument xmlDoc = new XmlDocument();
        xmlDoc.Load(filePath);
        XmlNode manifest = xmlDoc.SelectSingleNode("manifest");
        XmlNode template = manifest.FirstChild;
        foreach (XmlElement table in template)
        {
            string name = table.GetAttribute("name");
            if (tableName.Equals(name))
            {
                foreach (XmlElement map in table)
                {
                    string field = map.GetAttribute("field");
                    string posStr = map.GetAttribute("pos");
                    int pos = int.Parse(posStr);
                    result.Add(field, pos);
                }
            }
        }    
    }
    catch (Exception ex)
    {
        //throw ex;
        return null;
    }
    
    return result;
}
```

- Main()

```c#
static void Main(string[] args)
{
    string path = @"E:\CODE\xml\manifest.xml";
    string tableName = "mdm.md_Bond";
    Dictionary<string, int> result = XmlService.GetFieldMapping(path, tableName);

    foreach(string key in result.Keys)
    {
        Console.WriteLine(key + " "+ result[key]);
    }

    Console.ReadKey();
}
```

结果

```
UID 2
UniqueKey 3
LastUpdatedTime 4
```








