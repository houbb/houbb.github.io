---
layout: post
title:  XStream java 实现 xml 与对象 pojo 之间的转换
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

# XStream

[XStream](http://x-stream.github.io/) 是一个简单的库，用于将对象序列化为 XML，并可以反序列化回来。

> 特点

- 使用简单。提供了一个高级门面，简化了常见用例的操作。

- 无需映射。大多数对象可以在不需要指定映射的情况下进行序列化。

- 性能优越。速度和低内存占用是设计的关键部分，使其适用于大型对象图或具有高消息吞吐量的系统。

- 清晰的 XML。不会重复保存可以通过反射获得的信息。这样可以生成更易于人类阅读和比 Java 原生序列化更紧凑的 XML。

- 不需要修改对象。可以序列化内部字段，包括私有和 final 字段。支持非公共和内部类。类不需要具有默认构造函数。

- 完整的对象图支持。对象模型中遇到的重复引用将会被保留。支持循环引用。

- 与其他 XML API 整合。通过实现接口，XStream 可以直接序列化/反序列化任何树结构（不仅限于 XML）。

- 可自定义的转换策略。可以注册策略以自定义特定类型在 XML 中的表示方式。

- 安全框架。对于未解组合的输入，可以进行细粒度控制以防止安全问题。

- 错误消息。当由于格式不正确的 XML 导致异常时，会提供详细的诊断信息，以帮助定位和修复问题。

- 可选的输出格式。模块化设计允许其他输出格式。XStream 当前支持 JSON 支持和形变。

- 典型用途

# Hello World

(这个官方的例子稍微有些不够简洁，但是也很容易理解。效果显著)

使用之前，引入Jar

```xml
<dependency>
    <groupId>com.thoughtworks.xstream</groupId>
    <artifactId>xstream</artifactId>
    <version>1.4.9</version>
</dependency>
```

## Obj2Xml

- toXmlTest()

```java
@Test
public void toXmlTest() {
     XStream xstream = new XStream(new StaxDriver());
     xstream.alias("person", Person.class);
     xstream.alias("phoneNum", PhoneNum.class);

     Person joe = new Person();
     joe.setFirstname("hello");
     joe.setLastname("world");
     joe.setPhone(new PhoneNum(123, "1234-456"));
     joe.setFax(new PhoneNum(123, "9999-999"));

     String xml = xstream.toXML(joe);
     System.out.println(xml);
}
```



其中实体类如下(下一个列子也是用此实体类)：

- Person.java

```java
@Data
public class Person {

    private String firstname;

    private String lastname;

    private PhoneNum phone;

    private PhoneNum fax;

}
```

- PhoneNum.java

```java
@Data
public class PhoneNum {
    private int code;
    private String number;

    public PhoneNum(int code, String number) {
        this.code = code;
        this.number = number;
    }
}
```

为了简单，此处不适用日志。直接打印。结果如下:

```xml
<?xml version="1.0" ?><person><firstname>hello</firstname><lastname>world</lastname><phone><code>123</code><number>1234-456</number></phone><fax><code>123</code><number>9999-999</number></fax></person>
```

## Xml2Obj

既然可以将对象转成XML，反之肯定也可以。如下：

- toObjectTest()

```java
@Test
public void toObjectTest() {
     final String xml = "<?xml version=\"1.0\" ?><person><firstname>hello</firstname><lastname>world</lastname><phone><code>123</code><number>1234-456</number></phone><fax><code>123</code><number>9999-999</number></fax></person>";
     XStream xstream = new XStream(new StaxDriver());
     xstream.alias("person", Person.class);
     xstream.alias("phoneNum", PhoneNum.class);
     Person newJoe = (Person)xstream.fromXML(xml);
     System.out.println(newJoe.getFirstname());  
}
```

打印结果:

```
hello
```

# Alias

有时候我们为了更便于阅读或者简化会为一样东西提供一个别名。我们来看一个简单的例子。

假设我们要生成如图的xml文件：

```xml
<blog author="ryo">
  <entry>
    <title>first</title>
    <description>My first blog entry.</description>
  </entry>
  <entry>
    <title>tutorial</title>
    <description>
        Today we have developed a nice alias tutorial. Tell your friends! NOW!
    </description>
  </entry>
</blog>
```

首先，我们会建立对应实体类。

- Blog.java

```java
@Data
public class Blog {
    private Author writer;
    private List<Entry> entries = new LinkedList<>();
}
```

- Author.java

```java
@Data
public class Author {

    private String name;

    public Author(String name) {
        this.name = name;
    }
}
```

- Entry.java

```java
@Data
public class Entry {

    private String title;

    private String description;

    public Entry(String title, String description) {
        this.title = title;
        this.description = description;
    }
}
```

然后，我们写一个简单的测试。

- initTest()

```java
@Test
public void initTest() {
    Author author = new Author("ryo");
    Blog teamBlog = new Blog();
    teamBlog.setWriter(author);

    List<Entry> entries = new LinkedList<>();
    entries.add(new Entry("first","My first blog entry."));
    entries.add(new Entry("tutorial",
            "Today we have developed a nice alias tutorial. Tell your friends! NOW!"));
    teamBlog.setEntries(entries);

    XStream xstream = new XStream();
    System.out.println(xstream.toXML(teamBlog));
}
```

打印结果:

```xml
<com.ryo.convert.test.domain.Blog>
  <writer>
    <name>ryo</name>
  </writer>
  <entries class="linked-list">
    <com.ryo.convert.test.domain.Entry>
      <title>first</title>
      <description>My first blog entry.</description>
    </com.ryo.convert.test.domain.Entry>
    <com.ryo.convert.test.domain.Entry>
      <title>tutorial</title>
      <description>Today we have developed a nice alias tutorial. Tell your friends! NOW!</description>
    </com.ryo.convert.test.domain.Entry>
  </entries>
</com.ryo.convert.test.domain.Blog>
```

一、Class Alias

我们将XStream调用时简单修改如下：(这个在一开始的例子中其实已经使用过了)

```java
XStream xstream = new XStream();
xstream.alias("blog", Blog.class);
xstream.alias("entry", Entry.class);
```

输出结果如下：

```xml
<blog>
  <writer>
    <name>ryo</name>
  </writer>
  <entries class="linked-list">
    <entry>
      <title>first</title>
      <description>My first blog entry.</description>
    </entry>
    <entry>
      <title>tutorial</title>
      <description>Today we have developed a nice alias tutorial. Tell your friends! NOW!</description>
    </entry>
  </entries>
</blog>
```

- Field Alias

上面的输出看起来简洁了很多，但是我们想把 `writer` 改为 `author` 怎么做呢？接着看。

只需要添加一句话:

```java
xstream.aliasField("author", Blog.class, "writer");
```

结果：

```xml
<blog>
  <author>
    <name>ryo</name>
  </author>
  <entries class="linked-list">
    <entry>
      <title>first</title>
      <description>My first blog entry.</description>
    </entry>
    <entry>
      <title>tutorial</title>
      <description>Today we have developed a nice alias tutorial. Tell your friends! NOW!</description>
    </entry>
  </entries>
</blog>
```

三、Implicit collection

如果我们有一个集合，但是我们不想把根节点显示出来。比如本例子，不想显示 `entries` 节点。

```java
xstream.addImplicitCollection(Blog.class, "entries");
```

结果如下：

```xml
<blog>
  <author>
    <name>ryo</name>
  </author>
  <entry>
    <title>first</title>
    <description>My first blog entry.</description>
  </entry>
  <entry>
    <title>tutorial</title>
    <description>Today we have developed a nice alias tutorial. Tell your friends! NOW!</description>
  </entry>
</blog>
```

四、Attribute Alias

我们离最后的目标还差一点。如何将 `author` 属性变为 XML 的属性呢。

- AttributeAliasTest()

```java
XStream xstream = new XStream();
xstream.alias("blog", Blog.class);
xstream.alias("entry", Entry.class);
xstream.addImplicitCollection(Blog.class, "entries");

xstream.useAttributeFor(Blog.class, "writer");
xstream.aliasField("author", Blog.class, "writer");
xstream.registerConverter(new AuthorConverter());

System.out.println(xstream.toXML(teamBlog));
```

- AuthorConverter.java

我们必须告诉 XStream 如何将字段属性转换为 XML 的 tag 属性。
 
```java
public class AuthorConverter implements SingleValueConverter {

    @Override
    public String toString(Object obj) {
        return ((Author) obj).getName();
    }

    @Override
    public Object fromString(String name) {
        return new Author(name);
    }

    @Override
    public boolean canConvert(Class type) {
        return type.equals(Author.class);
    }

}
```

输出结果如下：

```xml
<blog author="ryo">
  <entry>
    <title>first</title>
    <description>My first blog entry.</description>
  </entry>
  <entry>
    <title>tutorial</title>
    <description>Today we have developed a nice alias tutorial. Tell your friends! NOW!</description>
  </entry>
</blog>
```

大功告成！

五、Package Alias

我们再看一个可能会用到的技能——为包名起一个别名。

```java
XStream xstream = new XStream();
xstream.aliasPackage("my.company", "com.ryo.convert.test.domain");
System.out.println(xstream.toXML(teamBlog));
```

结果如下：

```xml
<my.company.Blog>
  <writer>
    <name>ryo</name>
  </writer>
  <entries class="linked-list">
    <my.company.Entry>
      <title>first</title>
      <description>My first blog entry.</description>
    </my.company.Entry>
    <my.company.Entry>
      <title>tutorial</title>
      <description>Today we have developed a nice alias tutorial. Tell your friends! NOW!</description>
    </my.company.Entry>
  </entries>
</my.company.Blog>
```


# Annotation

使用注解可以使得编程更加方便。

一、创始之初

- Author.java

```java
@Data
public class Author {

    private String name;

    public Author(String name) {
        this.name = name;
    }
}
```

直接输出XML

```java
@Test
public void initTest() {
    Author author = new Author("ryo");
    XStream xStream = new XStream();
    String xml = xStream.toXML(author);
    System.out.println(xml);
}
```

输出结果如下：

```xml
<com.ryo.convert.test.domain.Author>
  <name>ryo</name>
</com.ryo.convert.test.domain.Author>
```

二、别名

- Author.java

```java
@Data
@XStreamAlias("author")
public class Author {

    @XStreamAlias("writer")
    private String name;

    public Author(String name) {
        this.name = name;
    }
}
```

- 执行注解

```java
@Test
public void aliasTest() {
    Author author = new Author("ryo");
    XStream xStream = new XStream();
    xStream.processAnnotations(Author.class);
    String xml = xStream.toXML(author);
    System.out.println(xml);
}
```


执行注解的方式，除却 

```java
xStream.processAnnotations(Author.class);
```

还可以使用

```java
xstream.autodetectAnnotations(true);
```

结果如下：

```xml
<author>
  <writer>ryo</writer>
</author>
```

三、Implicit Collection

- Author.java

```java
@Data
@XStreamAlias("author")
public class Author {

    @XStreamAlias("writer")
    private String name;

    @XStreamImplicit(itemFieldName = "hobby")
    private List<String> hobby;

    public Author(String name) {
        this.name = name;
    }
}
```

- 测试

```java
@Test
public void collectionImplicitTest() {
    Author author = new Author("ryo");
    List<String> hobby = Arrays.asList("fly", "swim");
    author.setHobby(hobby);

    XStream xStream = new XStream();
    xStream.processAnnotations(Author.class);
    String xml = xStream.toXML(author);
    System.out.println(xml);
}
```

结果

```xml
<author>
  <writer>ryo</writer>
  <hobby>fly</hobby>
  <hobby>swim</hobby>
</author>
```

四、定义转换

- Author.java

```java
@Data
@XStreamAlias("author")
public class Author {

    @XStreamAlias("writer")
    private String name;

    @XStreamImplicit(itemFieldName = "hobby")
    private List<String> hobby;
    
    @XStreamConverter(value=BooleanConverter.class, booleans={false}, strings={"yes", "no"})
    private boolean isImportant;
    
    @XStreamConverter(SimpleCalendarConveter.class)
    private Calendar created = new GregorianCalendar();

    public Author(String name) {
        this.name = name;
    }
}
```

其中 `SimpleCalendarConveter.java` 如下：

```java
public class SimpleCalendarConveter implements Converter {

    @Override
    public void marshal(Object o, HierarchicalStreamWriter hierarchicalStreamWriter, MarshallingContext marshallingContext) {
        Calendar calendar = (Calendar) o;
        hierarchicalStreamWriter.setValue(String.valueOf(calendar.getTime().getTime()));
    }

    @Override
    public Object unmarshal(HierarchicalStreamReader hierarchicalStreamReader, UnmarshallingContext unmarshallingContext) {
        GregorianCalendar calendar = new GregorianCalendar();
        calendar.setTime(new Date(Long.parseLong(hierarchicalStreamReader.getValue())));
        return calendar;
    }

    @Override
    public boolean canConvert(Class aClass) {
        return aClass.equals(GregorianCalendar.class);
    }
}
```

执行结果如下：

```xml
<author>
  <writer>ryo</writer>
  <hobby>fly</hobby>
  <hobby>swim</hobby>
  <isImportant>no</isImportant>
  <created>1497968044970</created>
</author>
```

四、 Attributes

通过注解 `@XStreamAsAttribute` 即可。如下：

- Author.java

```java
@Data
@XStreamAlias("author")
public class Author {

    @XStreamAlias("writer")
    @XStreamAsAttribute
    private String name;

    @XStreamImplicit(itemFieldName = "hobby")
    private List<String> hobby;

    public Author(String name) {
        this.name = name;
    }
}
```

测试结果:

```xml
<author writer="ryo">
  <hobby>fly</hobby>
  <hobby>swim</hobby>
</author>
```


五、Omitting Fields

可以通过 `@XStreamOmitField` 不序列化某个字段。

- Author.java

```java
@Data
@XStreamAlias("author")
public class Author {

    @XStreamAlias("writer")
    @XStreamOmitField
    private String name;

    @XStreamImplicit(itemFieldName = "hobby")
    private List<String> hobby;

    public Author(String name) {
        this.name = name;
    }
}
```

结果如下：

```xml
<author>
  <hobby>fly</hobby>
  <hobby>swim</hobby>
</author>
```

# Converter

一、 Simple Converter

```java
@Test
public void simpleConverterTest() {
    Person person = new Person();
    person.setName("ryo");

    XStream xStream = new XStream();
    xStream.processAnnotations(Person.class);
    String xml = xStream.toXML(person);
    System.out.println(xml);
}
```

其中 `Person.java` 内容如下：

```java
@Data
@XStreamAlias("Person")
public class Person {

    private String name;

}
```

输出结果如下：

```
<Person>
  <name>ryo</name>
</Person>
```


二、String representation


```java
@Test
public void withToStrConverterTest() {
    Person person = new Person();
    person.setName("ryo");

    XStream xStream = new XStream(new DomDriver());
    xStream.registerConverter(new PersonToStrConverter());
    xStream.alias("person", Person.class);
    System.out.println(xStream.toXML(person));
}
```

其中 `PersonToStrConverter` 内容为：

```java
public class PersonToStrConverter extends AbstractSingleValueConverter {

    @Override
    public boolean canConvert(Class aClass) {
        return aClass.equals(Person.class);
    }

    @Override
    public Object fromString(String s) {
        Person person = new Person();
        person.setName(s);
        return person;
    }
}
```

输出结果为:

```xml
<person>Person(name=ryo)</person>
```

三、DateConverter

```java
@Test
public void dateConverterTest() {
    // grabs the current date from the virtual machine
    Calendar calendar = new GregorianCalendar();

    // creates the xstream
    XStream xStream = new XStream(new DomDriver());

    // brazilian portuguese locale
    xStream.registerConverter(new DateConverter(new Locale("pt", "br")));

    // prints the result
    System.out.println(xStream.toXML(calendar));

}
```

其中 `DateConverter.java`

```java
public class DateConverter implements Converter {

    private Locale locale;

    public DateConverter(Locale locale) {
        super();
        this.locale = locale;
    }

    @Override
    public boolean canConvert(Class clazz) {
        return Calendar.class.isAssignableFrom(clazz);
    }

    @Override
    public void marshal(Object value, HierarchicalStreamWriter writer,
                        MarshallingContext context) {
        Calendar calendar = (Calendar) value;
        Date date = calendar.getTime();
        DateFormat formatter = DateFormat.getDateInstance(DateFormat.FULL,
                this.locale);
        writer.setValue(formatter.format(date));
    }

    @Override
    public Object unmarshal(HierarchicalStreamReader reader,
                            UnmarshallingContext context) {
        GregorianCalendar calendar = new GregorianCalendar();
        DateFormat formatter = DateFormat.getDateInstance(DateFormat.FULL,
                this.locale);
        try {
            calendar.setTime(formatter.parse(reader.getValue()));
        } catch (ParseException e) {
            throw new ConversionException(e.getMessage(), e);
        }
        return calendar;
    }

}
```

打印结果:

```xml
<gregorian-calendar>Domingo, 25 de Junho de 2017</gregorian-calendar>
```

对于xml转为对象:

```java
@Test
public void dateConverter2ObjTest() {
    // grabs the current date from the virtual machine
    Calendar calendar = new GregorianCalendar();

    // creates the xstream
    XStream xStream = new XStream(new DomDriver());

    // brazilian portuguese locale
    xStream.registerConverter(new DateConverter(new Locale("pt", "br")));


    // loads the calendar from the string
    Calendar loaded = (Calendar) xStream
            .fromXML("<gregorian-calendar>Sexta-feira, 10 de Fevereiro de 2006</gregorian-calendar>");
    // prints using the system defined locale
    System.out.println(DateFormat.getDateInstance(DateFormat.SHORT).format(
            loaded.getTime()));
}
```

输出结果如下：

```
06-2-10
```

四、Complex Converter

```java
public class BirthdayConverter implements Converter {

    @Override
    public void marshal(Object o, HierarchicalStreamWriter hierarchicalStreamWriter, MarshallingContext marshallingContext) {
        Birthday birthday = (Birthday)o;
        if (birthday.getGender() != '\0') {
            hierarchicalStreamWriter.addAttribute("gender", Character.toString(birthday.getGender()));
        }
        if (birthday.getPerson() != null) {
            hierarchicalStreamWriter.startNode("person");
            marshallingContext.convertAnother(birthday.getPerson());
            hierarchicalStreamWriter.endNode();
        }
        if (birthday.getDate() != null) {
            hierarchicalStreamWriter.startNode("birth");
            marshallingContext.convertAnother(birthday.getDate());
            hierarchicalStreamWriter.endNode();
        }
    }

    @Override
    public Object unmarshal(HierarchicalStreamReader hierarchicalStreamReader, UnmarshallingContext unmarshallingContext) {
        Birthday birthday = new Birthday();
        String gender = hierarchicalStreamReader.getAttribute("gender");
        if (gender != null) {
            if (gender.length() > 0) {
                if (gender.charAt(0) == 'f') {
                    birthday.setGenderFemale();
                } else if (gender.charAt(0) == 'm') {
                    birthday.setGenderMale();
                } else {
                    throw new ConversionException("Invalid gender value: " + gender);
                }
            } else {
                throw new ConversionException("Empty string is invalid gender value");
            }
        }
        while (hierarchicalStreamReader.hasMoreChildren()) {
            hierarchicalStreamReader.moveDown();
            if ("person".equals(hierarchicalStreamReader.getNodeName())) {
                Person person = (Person)unmarshallingContext.convertAnother(birthday, Person.class);
                birthday.setPerson(person);
            } else if ("birth".equals(hierarchicalStreamReader.getNodeName())) {
                Calendar date = (Calendar)unmarshallingContext.convertAnother(birthday, Calendar.class);
                birthday.setDate(date);
            }
            hierarchicalStreamReader.moveUp();
        }
        return birthday;
    }

    @Override
    public boolean canConvert(Class aClass) {
        return Birthday.class.equals(aClass);
    }
}
```

其中 `Birthday.java`

```java
@Data
public class Birthday {

    private Person person;

    private Calendar date;

    private char gender;

    public void setGenderMale() {
        this.gender = 'm';
    }

    public void setGenderFemale() {
        this.gender = 'f';
    }
}
```


# Object Streams 

XStream provides alternative implementations of `java.io.ObjectInputStream` and `java.io.ObjectOutputStream`, 
allowing streams of objects to be serialized or deserialized from XML.

This is useful when processing large sets of objects, as only one needs to be in memory at a time.

Obviously you should use also a **stream-based** XML parser reading the XML. A DOM-based XML parser will process the complete 
XML and build the object model before XStream is able to to handle the first element.


> [Object Streams BLOG](http://forestqqqq.iteye.com/blog/1996095)

## ObjectOutputStream

- ObjectOutputStreamTest()

```java
/**
 * 对象输出流
 *
 * @throws IOException
 * @since 1.7
 */
@Test
public void ObjectOutputStreamTest() throws IOException {
    XStream xstream = new XStream();

    try (ObjectOutputStream oos = xstream.createObjectOutputStream(System.out, "root")) {
        oos.writeObject(new Person("张三"));
        oos.writeObject(new Person("李四"));
        oos.writeObject(1);
        oos.writeObject(2);
        oos.writeObject(3d);
        oos.writeObject(4d);
        oos.writeObject('c');
        oos.writeObject("这是一堆字符串！");
    }
}
```

- Person.java

```java
@Data
public class Person {

    private String name;

    public Person() {
    }

    public Person(String name) {
        this.name = name;
    }
}
```

输出结果为:

```xml
<root>
    <com.ryo.convert.test.converter.domain.Person>
        <name>张三</name>
    </com.ryo.convert.test.converter.domain.Person>
    <com.ryo.convert.test.converter.domain.Person>
        <name>李四</name>
    </com.ryo.convert.test.converter.domain.Person>
    <int>1</int>
    <int>2</int>
    <double>3.0</double>
    <double>4.0</double>
    <char>c</char>
    <string>这是一堆字符串！</string>
</root>
```

## ObjectInputStream

- ObjectInputStreamTest()

```java
/**
 * 文件输入流
 */
@Test
public void ObjectInputStreamTest() throws IOException, ClassNotFoundException {
    XStream xstream = new XStream();
    final String filePath = "D:\\CODE\\converter\\converter-test\\src\\test\\resources\\test.xml";
    FileReader reader2 = new FileReader(new File(filePath));
    ObjectInputStream ois = xstream.createObjectInputStream(reader2);

    Person p1 = (Person)ois.readObject();
    System.out.println("p1="+p1);

    Person p2 = (Person)ois.readObject();
    System.out.println("p2="+p2);

    int i1 = (Integer)ois.readObject();
    System.out.println("i1="+i1);

    int i2 = (Integer)ois.readObject();
    System.out.println("i2="+i2);

    double d1 = (Double)ois.readObject();
    System.out.println("d1="+d1);

    double d2 = (Double)ois.readObject();
    System.out.println("d2="+d2);

    char ch = (Character)ois.readObject();
    System.out.println("ch="+ch);

    String str = (String)ois.readObject();
    System.out.println("str="+str);

    System.out.println("******异常捕获******");
    //发生异常
    try {
        ois.readObject();
    } catch (EOFException e) {
        System.out.println("因为已经没有数据了，再次读取时，就会发生EOFException异常");
    }
}
```

其中，filePath对应的 `test.xml` 内容为：

```xml
<root>
    <com.ryo.convert.test.converter.domain.Person>
        <name>张三</name>
    </com.ryo.convert.test.converter.domain.Person>
    <com.ryo.convert.test.converter.domain.Person>
        <name>李四</name>
    </com.ryo.convert.test.converter.domain.Person>
    <int>1</int>
    <int>2</int>
    <double>3.0</double>
    <double>4.0</double>
    <char>c</char>
    <string>这是一堆字符串！</string>
</root>
```

输出结果为：

```
p1=Person(name=张三)
p2=Person(name=李四)
i1=1
i2=2
d1=3.0
d2=4.0
ch=c
str=这是一堆字符串！
******异常捕获******
因为已经没有数据了，再次读取时，就会发生EOFException异常
```


# Persist API

## Adding elements

- addElemTest()

```java
@Test
public void addElemTest() {
    final String dirPath = "D:\\CODE\\converter\\converter-test\\src\\test\\resources\\persist\\";
    // prepares the file strategy to directory /tmp
    PersistenceStrategy strategy = new FilePersistenceStrategy(new File(dirPath));
    // creates the list:
    List list = new XmlArrayList(strategy);

    // adds four authors
    list.add(new Person("joe walnes"));
    list.add(new Person("joerg schaible"));
    list.add(new Person("mauro talevi"));
    list.add(new Person("guilherme silveira"));

    // adding an extra author
    Person mistake = new Person("mama");
    list.add(mistake);
}
```

运行完程序之后，可以在对应文件夹下看到如下文件：

```
2017/07/22  14:42               120 int@0.xml
2017/07/22  14:42               124 int@1.xml
2017/07/22  14:42               122 int@2.xml
2017/07/22  14:42               128 int@3.xml
2017/07/22  14:42               114 int@4.xml
```

## Local Converter

此处暂时跳过。

# JSON

## Jettison driver

```java
@Test
public void JettisonTest() {
    Person person = new Person("ryo");

    XStream xstream = new XStream(new JettisonMappedXmlDriver());
    xstream.setMode(XStream.NO_REFERENCES);
    xstream.alias("person", Person.class);

    System.out.println(xstream.toXML(person));
}
```

此处测试时需要引入对应jar。个人觉得没有必要，json可以使用很成熟的三方jar。

暂时跳过。



* any list
{:toc}