---
layout: post
title: Log4j2-17-拓展 log4j
date:  2016-5-21 10:00:13 +0800
categories: [Log]
tags: [log, apache, log4j2]
published: true
---


# 拓展 Log4j

Log4j 2提供了许多操作和扩展的方法。本节概述了Log4j 2实现直接支持的各种方式。

# LoggerContextFactory

LoggerContextFactory将Log4j API绑定到它的实现。

Log4j LogManager通过使用java.util.ServiceLoader来定位org.apache.logging.log4j.spi.Provider的所有实例来定位LoggerContextFactory。

每个实现都必须提供一个类来扩展apache.logging.log4j.spi。提供者和应该有一个无参数的构造函数，该构造函数将优先级、与之兼容的API版本以及实现org.apache.logging.log4j.spi.LoggerContextFactory的类委托给提供者的构造函数。

Log4j将比较当前的API版本，如果它是兼容的，实现将被添加到提供者列表中。

org.apache.logging.log4j.log中的API版本。只有在API中添加了实现需要知道的特性时，才会更改LogManager。

如果找到了多个有效实现，则使用Priority的值来标识具有最高优先级的工厂。

最后，实现org.apache.logging.log4j.spi.LoggerContextFactory 的类将被实例化并绑定到LogManager。

在Log4j 2中，这由Log4jContextFactory提供。

1) 应用程序可以更改LoggerContextFactory，它将被创建到日志记录实现的绑定。

实现一个新的LoggerContextFactory。

实现一个扩展org.apache.logging.spi.Provider的类。使用一个无参数的构造函数调用超类的构造函数，该构造函数使用Priority、API版本、LoggerContextFactory类以及可选的ThreadContextMap实现类。

创建一个META-INF/services/org.apache.logging.spi。提供程序文件，该文件包含实现org.apache.logging.spi.Provider的类的名称。

2) 设置系统属性log4j2。loggerContextFactory到要使用的loggerContextFactory类的名称。

3) 在属性文件 `log4j2.LogManager.properties` 设置属性 `log4j.loggerContextFactory`，用来确定 LoggerContextFactory 类的名称。属性文件必须在类路径上。

# ContextSelector

上下文选择器由Log4j LoggerContext工厂调用。

它们执行定位或创建LoggerContext的实际工作，LoggerContext是logger及其配置的锚。

ContextSelectors可以自由地实现他们想要管理LoggerContexts的任何机制。默认的Log4jContextFactory检查是否存在一个名为“Log4jContextSelector”的系统属性。

如果找到，该属性应该包含实现要使用的ContextSelector的类的名称。

Log4j提供了五个contextselector:

1) BasicContextSelector

使用一个存储在ThreadLocal中的LoggerContext或者一个普通的LoggerContext。

2) ClassLoaderContextSelector

将LoggerContexts与创建getLogger调用调用者的ClassLoader关联起来。这是默认的ContextSelector。

3) JndiContextSelector

通过查询JNDI来定位LoggerContext。从Log4j 2.17.0开始，JNDI操作需要log4j2。

enableJndiContextSelector=true设置为系统属性或相应的环境变量，以使此查找发挥作用。

参见enableJndiContextSelector系统属性。

4) AsyncLoggerContextSelector

创建一个LoggerContext，确保所有的记录器都是AsyncLoggers。

5) BundleContextSelector

将LoggerContexts与创建getLogger调用方的bundle的ClassLoader关联起来。这在OSGi环境中是默认启用的。

# ConfigurationFactory

修改日志的配置方式通常是人们最感兴趣的领域之一。

这样做的主要方法是通过实现或扩展ConfigurationFactory。Log4j提供了两种添加新configurationfactory的方法。

第一种方法是定义名为“log4j”的系统属性。configurationFactory”到应该首先搜索配置的类的名称。第二种方法是将ConfigurationFactory定义为一个插件。

然后按顺序处理所有configurationfactory。调用每个工厂的getSupportedTypes方法来确定它支持的文件扩展名。如果配置文件位于指定的文件扩展名之一中，则将控制传递给该ConfigurationFactory，以加载配置并创建configuration对象。

大多数配置都扩展了BaseConfiguration类。该类期望子类将处理配置文件并创建Node对象的层次结构。

每个Node都相当简单，因为它由节点的名称、与节点关联的名称/值对、节点的PluginType和它的所有子节点的列表组成。

然后将BaseConfiguration传递给Node树，并从中实例化配置对象。

```java
@Plugin(name = "XMLConfigurationFactory", category = "ConfigurationFactory")
@Order(5)
public class XMLConfigurationFactory extends ConfigurationFactory {
 
    /**
     * Valid file extensions for XML files.
     */
    public static final String[] SUFFIXES = new String[] {".xml", "*"};
 
    /**
     * Returns the Configuration.
     * @param loggerContext The logger context.
     * @param source The InputSource.
     * @return The Configuration.
     */
    @Override
    public Configuration getConfiguration(final LoggerContext loggerContext, final ConfigurationSource source) {
        return new XmlConfiguration(loggerContext, source);
    }
 
    /**
     * Returns the file suffixes for XML files.
     * @return An array of File extensions.
     */
    public String[] getSupportedTypes() {
        return SUFFIXES;
    }
}
```

# LoggerConfig

LoggerConfig对象是应用程序创建的记录器绑定到配置的地方。

Log4j实现要求所有LoggerConfigs都基于LoggerConfig类，因此希望进行更改的应用程序必须通过扩展LoggerConfig类来实现。

要声明新的LoggerConfig，请将其声明为一个“Core”类型的插件，并提供应用程序应该在配置中指定的元素名称。

LoggerConfig还应该定义一个PluginFactory来创建LoggerConfig的一个实例。

下面的示例展示了根LoggerConfig如何简单地扩展通用LoggerConfig。

```java
@Plugin(name = "root", category = "Core", printObject = true)
public static class RootLogger extends LoggerConfig {
 
    @PluginFactory
    public static LoggerConfig createLogger(@PluginAttribute(value = "additivity", defaultBooleanValue = true) boolean additivity,
                                            @PluginAttribute(value = "level", defaultStringValue = "ERROR") Level level,
                                            @PluginElement("AppenderRef") AppenderRef[] refs,
                                            @PluginElement("Filters") Filter filter) {
        List<AppenderRef> appenderRefs = Arrays.asList(refs);
        return new LoggerConfig(LogManager.ROOT_LOGGER_NAME, appenderRefs, filter, level, additivity);
    }
}
```

# LogEventFactory

LogEventFactory用于生成logevent。应用程序可以通过将系统属性Log4jLogEventFactory的值设置为自定义LogEventFactory类的名称来替换标准LogEventFactory。

注意:当log4j配置为所有日志记录器都是异步时，日志事件将在一个循环缓冲区中预分配，并且不会使用LogEventFactory。

# MessageFactory

MessageFactory用于生成Message对象。应用程序可以通过设置系统属性log4j2的值来替换标准的ParameterizedMessageFactory(或无垃圾模式下的ReusableMessageFactory)。

messageFactory转换为自定义messageFactory类的名称。

Logger.entry()和Logger.exit()方法的流消息有一个单独的FlowMessageFactory。

应用程序可以通过设置系统属性log4j2的值来替换DefaultFlowMessageFactory。将flowMessageFactory更改为自定义flowMessageFactory类的名称。

# 查找 LookUps

查找是执行参数替换的方法。在配置初始化期间，创建了一个“Interpolator”，用于定位所有查找并注册它们，以便在需要解析变量时使用。插值器将变量名的“前缀”部分匹配到已注册的Lookup，并将控制权传递给它以解析变量。

Lookup必须使用类型为“Lookup”的Plugin注释来声明。Plugin注释中指定的名称将用于匹配前缀。不像其他插件，查找不使用PluginFactory。

相反，它们需要提供一个不接受参数的构造函数。下面的示例显示了一个Lookup，它将返回System Property的值。

所提供的查找记录如下

```java
@Plugin(name = "sys", category = "Lookup")
public class SystemPropertiesLookup implements StrLookup {
 
    /**
     * Lookup the value for the key.
     * @param key  the key to be looked up, may be null
     * @return The value for the key.
     */
    public String lookup(String key) {
        return System.getProperty(key);
    }
 
    /**
     * Lookup the value for the key using the data in the LogEvent.
     * @param event The current LogEvent.
     * @param key  the key to be looked up, may be null
     * @return The value associated with the key.
     */
    public String lookup(LogEvent event, String key) {
        return System.getProperty(key);
    }
}
```

# 过滤器 Filters

正如预期的那样，过滤器用于在日志事件通过日志系统时拒绝或接受日志事件。

过滤器是使用类型为“Core”的Plugin注释和类型为“Filter”的elementType来声明的。

Plugin注释上的name属性用于指定用户应该用来启用Filter的元素的名称。

将printObject属性的值指定为“true”，表示对toString的调用将在处理配置时格式化过滤器的参数。

过滤器还必须指定一个PluginFactory方法，该方法将被调用来创建过滤器。

下面的示例显示了一个Filter，用于根据日志级别拒绝LogEvents。

注意典型的模式，其中所有筛选方法都解析为单个筛选方法。

```java
@Plugin(name = "ThresholdFilter", category = "Core", elementType = "filter", printObject = true)
public final class ThresholdFilter extends AbstractFilter {
 
    private final Level level;
 
    private ThresholdFilter(Level level, Result onMatch, Result onMismatch) {
        super(onMatch, onMismatch);
        this.level = level;
    }
 
    public Result filter(Logger logger, Level level, Marker marker, String msg, Object[] params) {
        return filter(level);
    }
 
    public Result filter(Logger logger, Level level, Marker marker, Object msg, Throwable t) {
        return filter(level);
    }
 
    public Result filter(Logger logger, Level level, Marker marker, Message msg, Throwable t) {
        return filter(level);
    }
 
    @Override
    public Result filter(LogEvent event) {
        return filter(event.getLevel());
    }
 
    private Result filter(Level level) {
        return level.isAtLeastAsSpecificAs(this.level) ? onMatch : onMismatch;
    }
 
    @Override
    public String toString() {
        return level.toString();
    }
 
    /**
     * Create a ThresholdFilter.
     * @param loggerLevel The log Level.
     * @param match The action to take on a match.
     * @param mismatch The action to take on a mismatch.
     * @return The created ThresholdFilter.
     */
    @PluginFactory
    public static ThresholdFilter createFilter(@PluginAttribute(value = "level", defaultStringValue = "ERROR") Level level,
                                               @PluginAttribute(value = "onMatch", defaultStringValue = "NEUTRAL") Result onMatch,
                                               @PluginAttribute(value = "onMismatch", defaultStringValue = "DENY") Result onMismatch) {
        return new ThresholdFilter(level, onMatch, onMismatch);
    }
}
```

# Appenders-输出源

向appender传递一个事件，(通常)调用Layout来格式化事件，然后以所需的任何方式“发布”事件。

Appenders被声明为插件，类型为Core，元素类型为appender。

Plugin注释上的name属性指定了用户必须在其配置中提供的元素的名称，以便使用Appender。如果toString方法呈现传递给Appender的属性值，Appender应该将printObject指定为"true"。

appender还必须声明一个PluginFactory方法来创建appender。

下面的例子展示了一个名为“Stub”的Appender，它可以用作初始模板。

大多数appender使用manager。管理器实际上“拥有”资源，例如OutputStream或套接字。当重新配置发生时，将创建一个新的Appender。

但是，如果之前的Manager中没有任何重要的更改，则新的Appender将简单地引用它，而不是创建一个新的。

这确保了在重新配置时事件不会丢失，而不需要在重新配置时暂停日志记录。

```java
@Plugin(name = "Stub", category = "Core", elementType = "appender", printObject = true)
public final class StubAppender extends AbstractOutputStreamAppender<StubManager> {
 
    private StubAppender(String name,
                         Layout<? extends Serializable> layout,
                         Filter filter,
                         boolean ignoreExceptions,
                         StubManager  manager) {
        super(name, layout, filter, ignoreExceptions, true, manager);
    }
 
    @PluginFactory
    public static StubAppender createAppender(@PluginAttribute("name") String name,
                                              @PluginAttribute("ignoreExceptions") boolean ignoreExceptions,
                                              @PluginElement("Layout") Layout layout,
                                              @PluginElement("Filters") Filter filter) {
 
        if (name == null) {
            LOGGER.error("No name provided for StubAppender");
            return null;
        }
 
        StubManager manager = StubManager.getStubManager(name);
        if (manager == null) {
            return null;
        }
        if (layout == null) {
            layout = PatternLayout.createDefaultLayout();
        }
        return new StubAppender(name, layout, filter, ignoreExceptions, manager);
    }
}
```

# 布局

布局将事件格式化为Appenders写入某个目的地的可打印文本。所有布局都必须实现布局接口。

将事件格式化为String的布局应该扩展AbstractStringLayout，后者负责将String转换为所需的字节数组。

每个布局都必须使用plugin注释将自己声明为插件。类型必须为“Core”，elementType必须为“layout”。

如果插件的toString方法将提供对象及其参数的表示，printObject应该设置为true。

插件的名称必须与用户用来在Appender配置中指定它作为元素的值匹配。

插件还必须提供一个静态方法，标注为PluginFactory，并且每个方法的参数都适当标注为PluginAttr或PluginElement。

```java
@Plugin(name = "SampleLayout", category = "Core", elementType = "layout", printObject = true)
public class SampleLayout extends AbstractStringLayout {
 
    protected SampleLayout(boolean locationInfo, boolean properties, boolean complete,
                           Charset charset) {
    }
 
    @PluginFactory
    public static SampleLayout createLayout(@PluginAttribute("locationInfo") boolean locationInfo,
                                            @PluginAttribute("properties") boolean properties,
                                            @PluginAttribute("complete") boolean complete,
                                            @PluginAttribute(value = "charset", defaultStringValue = "UTF-8") Charset charset) {
        return new SampleLayout(locationInfo, properties, complete, charset);
    }
}
```

# PatternConverters

PatternLayout使用PatternConverters将日志事件格式化为可打印的String。

每个转换器负责一种操作，但是转换器可以自由地以复杂的方式格式化事件。

例如，有几个转换器可以操作Throwables并以各种方式格式化它们。

PatternConverter必须首先使用标准Plugin注释将自己声明为Plugin，但必须在type属性上指定“Converter”的值。

此外，Converter还必须指定ConverterKeys属性来定义可以在模式中指定的令牌(前面有'%'字符)，以标识Converter。

与大多数其他插件不同，转换器不使用PluginFactory。相反，每个Converter都需要提供一个静态newInstance方法，该方法接受string数组作为唯一的参数。

String数组是在可以跟在转换器键后面的花括号内指定的值。

下面展示了一个Converter插件的框架。

```java
@Plugin(name = "query", category = "Converter")
@ConverterKeys({"q", "query"})
public final class QueryConverter extends LogEventPatternConverter {
 
    public QueryConverter(String[] options) {
    }
 
    public static QueryConverter newInstance(final String[] options) {
      return new QueryConverter(options);
    }
}
```

# Plugin Builders

一些插件有很多可选的配置选项。

当一个插件有很多选项时，使用构造器类比使用工厂方法更容易维护(参见项目2:Joshua Bloch在Effective Java中面对许多构造器参数时考虑使用构造器)。

与带注释的工厂方法相比，使用带注释的构建器类还有其他一些优点:

- 如果属性名与字段名匹配，则不需要指定属性名。

- 默认值可以在代码中指定，而不是通过注释(也允许运行时计算的默认值，这在注释中是不允许的)。

- 添加新的可选参数不需要重构现有的可编程配置。

- 使用构建器编写单元测试比使用带有可选参数的工厂方法更容易。

- 默认值是通过代码指定的，而不是依赖于反射和注入，因此它们以编程方式工作，就像在配置文件中一样。

下面是一个来自ListAppender的插件工厂的例子:

```java
@PluginFactory
public static ListAppender createAppender(
        @PluginAttribute("name") @Required(message = "No name provided for ListAppender") final String name,
        @PluginAttribute("entryPerNewLine") final boolean newLine,
        @PluginAttribute("raw") final boolean raw,
        @PluginElement("Layout") final Layout<? extends Serializable> layout,
        @PluginElement("Filter") final Filter filter) {
    return new ListAppender(name, filter, layout, newLine, raw);
}
```

下面是同一个工厂使用的构建器模式:

```java
@PluginBuilderFactory
public static Builder newBuilder() {
    return new Builder();
}
 
public static class Builder implements org.apache.logging.log4j.core.util.Builder<ListAppender> {
 
    @PluginBuilderAttribute
    @Required(message = "No name provided for ListAppender")
    private String name;
 
    @PluginBuilderAttribute
    private boolean entryPerNewLine;
 
    @PluginBuilderAttribute
    private boolean raw;
 
    @PluginElement("Layout")
    private Layout<? extends Serializable> layout;
 
    @PluginElement("Filter")
    private Filter filter;
 
    public Builder setName(final String name) {
        this.name = name;
        return this;
    }
 
    public Builder setEntryPerNewLine(final boolean entryPerNewLine) {
        this.entryPerNewLine = entryPerNewLine;
        return this;
    }
 
    public Builder setRaw(final boolean raw) {
        this.raw = raw;
        return this;
    }
 
    public Builder setLayout(final Layout<? extends Serializable> layout) {
        this.layout = layout;
        return this;
    }
 
    public Builder setFilter(final Filter filter) {
        this.filter = filter;
        return this;
    }
 
    @Override
    public ListAppender build() {
        return new ListAppender(name, filter, layout, entryPerNewLine, raw);
    }
}
```

注释的唯一区别是使用 `@PluginBuilderAttribute` 而不是 `@PluginAttribute`，这样就可以使用默认值和反射，而不是在注释中指定它们。

这两种注释都可以在构建器中使用，但是前者更适合字段注入，而后者更适合参数注入。

否则，相同的注释(`@PluginConfiguration`， `@PluginElement`， `@PluginNode` 和 `@PluginValue`)都支持字段。

请注意，工厂方法仍然需要提供构建器，并且该工厂方法应该使用@PluginBuilderFactory注释。

当配置解析后构建插件时，如果可用，将使用插件构建器，否则将使用插件工厂方法作为备用方法。

如果一个插件既不包含工厂，那么它就不能从配置文件中使用(当然它仍然可以通过编程方式使用)。

下面是一个使用插件工厂和插件构建器编程的例子:

```java
ListAppender list1 = ListAppender.createAppender("List1", true, false, null, null);
ListAppender list2 = ListAppender.newBuilder().setName("List1").setEntryPerNewLine(true).build();
```

# 自定义ContextDataProvider

ContextDataProvider(在Log4j 2.13.2中引入)是一个接口，应用程序和库可以使用它向LogEvent的上下文数据中注入额外的键值对。

Log4j的ThreadContextDataInjector使用java.util.ServiceLoader来定位和加载ContextDataProvider实例。

Log4j本身使用 `org.apache.logging.log4j.core.impl.ThreadContextDataProvider` 将ThreadContextData添加到LogEvent中。

自定义实现应该实现 `org.apache.logging.log4j.core.util`。

通过在名为 `META-INF/services/org.apache.logging.log4j.core.util.ContextDataProvider` 的文件中定义实现类，并将其声明为服务。

# 自定义ThreadContextMap实现

可以通过设置系统属性log4j2来安装一个基于stringmap的无垃圾的上下文映射。garbagefreeThreadContextMap为true。(使用ThreadLocals必须启用Log4j。)

任何自定义的ThreadContextMap实现都可以通过设置系统属性log4j2来安装。将threadContextMap映射为实现threadContextMap接口的类的完全限定类名。

通过实现ReadOnlyThreadContextMap接口，应用程序可以通过ThreadContext::getThreadContextMap方法访问自定义的ThreadContextMap实现。

# Custom_Plugins

请参阅手册的插件部分。

# 参考资料

https://logging.apache.org/log4j/2.x/manual/extending.html

* any list
{:toc}
