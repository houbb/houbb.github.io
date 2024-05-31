---
layout: post
title:  Xml for CShape
date:  2017-06-21 13:59:45 +0800
categories: [Config]
tags: [xml, config]
published: true
---

# 拓展阅读

[config 配置方式概览-8 种配置文件介绍对比 xml/json/proeprties/ini/yaml/TOML/hcl/hocon](https://houbb.github.io/2017/06/21/config-00-overivew)

[config HCL（HashiCorp Configuration Language） 配置文件介绍](https://houbb.github.io/2017/06/21/config-hcl-01-intro)

[config HCL（HashiCorp Configuration Language） 官方文档翻译](https://houbb.github.io/2017/06/21/config-hcl-02-doc)

[config HOCON（Human-Optimized Config Object Notation）配置文件介绍](https://houbb.github.io/2017/06/21/config-hocon-01-intro)

[config ini 配置文件介绍](https://houbb.github.io/2017/06/21/config-ini-01-intro)

[config properties 配置文件介绍](https://houbb.github.io/2017/06/21/config-properties-01-intro)

[toml-01-toml 配置文件介绍](https://houbb.github.io/2017/06/21/config-toml-01-overview)

[XStream java 实现 xml 与对象 pojo 之间的转换](https://houbb.github.io/2017/06/21/config-xml-XStream-intro)

[java 实现 xml 与对象 pojo 之间的转换的几种方式 dom4j/xstream/jackson](https://houbb.github.io/2017/06/21/config-xml-to-pojo)

[YAML-01-yml 配置文件介绍](https://houbb.github.io/2017/06/21/config-yaml-01-intro)

[YAML-02-yml 配置文件 java 整合使用 yamlbeans + snakeyaml + jackson-dataformat-yaml](https://houbb.github.io/2017/06/21/config-yaml-02-java-integration)

[YAML-03-yml 配置文件介绍官方文档翻译](https://houbb.github.io/2017/06/21/config-yaml-03-doc)

[json 专题系列](https://houbb.github.io/2018/07/20/json-00-overview)

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

* any list
{:toc}