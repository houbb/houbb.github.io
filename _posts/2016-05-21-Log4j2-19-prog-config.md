---
layout: post
title: Log4j2-19-编程式配置 Programmatic Configuration
date:  2016-5-21 10:00:13 +0800
categories: [Log]
tags: [log, apache, log4j2]
published: true
---

# 可编程配置

Log4j 2为应用程序提供了几种创建自己的编程配置的方法:

- 指定一个自定义的ConfigurationFactory，用程序化配置启动Log4j

- 启动Log4j后，使用配置器替换配置

- 使用配置文件和程序化配置的组合初始化Log4j

- 初始化后修改当前配置

# ConfigurationBuilder API

从2.4版本开始，Log4j提供了一个ConfigurationBuilder和一组组件构建器，允许相当容易地创建配置。实际的配置对象，如LoggerConfig或Appender可能是笨拙的;它们需要很多关于Log4j内部的知识，如果你只想创建一个配置，这使得它们很难使用。

新的ConfigurationBuilder API(在org.apache.logging.log4j.core.config.builder中)。api包)允许用户通过构造组件定义在代码中创建配置。不需要直接使用实际的配置对象。组件定义被添加到ConfigurationBuilder中，一旦收集了所有定义，就会构建所有实际的配置对象(如logger和Appenders)。

ConfigurationBuilder为可以配置的基本组件提供了方便的方法，如logger, Appenders, Filter, Properties等。然而，Log4j 2的插件机制意味着用户可以创建任意数量的自定义组件。作为权衡，ConfigurationBuilder API只提供了有限数量的“强类型”方便方法，如newLogger()、newLayout()等。如果要配置的组件没有方便的方法，可以使用通用的builder.newComponent()方法。

例如，构建器不知道哪些子组件可以配置在特定的组件上，比如RollingFileAppender和RoutingAppender。要在RollingFileAppender上指定触发策略，可以使用builder.newComponent()。

使用ConfigurationBuilder API的示例在下面几节中。

# 理解ConfigurationFactory

在初始化期间，Log4j 2将搜索可用的ConfigurationFactories，然后选择一个来使用。

选中的ConfigurationFactory创建Log4j将使用的配置。下面是Log4j如何找到可用的ConfigurationFactories:

一个名为log4j2的系统属性。可以用要使用的configurationFactory的名称来设置configurationFactory。

可以使用ConfigurationFactory的实例来调用ConfigurationFactory(ConfigurationFactory)。在对Log4j进行任何其他调用之前，必须调用该函数。

可以将ConfigurationFactory实现添加到classpath中，并在“ConfigurationFactory”类别中配置为插件。当发现多个可应用的ConfigurationFactories时，Order注解可用于指定相对优先级。

ConfigurationFactories具有“受支持类型”的概念，它基本上映射到ConfigurationFactory可以处理的配置文件的文件扩展名。如果指定了配置文件位置，则不使用支持类型不包括“*”或匹配的文件扩展名的ConfigurationFactories。

# 使用带有自定义ConfigurationFactory的ConfigurationBuilder初始化Log4j

一种以编程方式配置Log4j 2的方法是创建一个自定义的ConfigurationFactory，它使用ConfigurationBuilder创建一个配置。

下面的例子重写了getConfiguration()方法，返回一个由ConfigurationBuilder创建的配置。

这将导致在创建LoggerContext时，配置自动连接到Log4j。

在下面的示例中，因为它指定了支持的类型“*”，所以它将覆盖提供的任何配置文件。

```java
@Plugin(name = "CustomConfigurationFactory", category = ConfigurationFactory.CATEGORY)
@Order(50)
public class CustomConfigurationFactory extends ConfigurationFactory {

    static Configuration createConfiguration(final String name, ConfigurationBuilder<BuiltConfiguration> builder) {
        builder.setConfigurationName(name);
        builder.setStatusLevel(Level.ERROR);
        builder.add(builder.newFilter("ThresholdFilter", Filter.Result.ACCEPT, Filter.Result.NEUTRAL).
            addAttribute("level", Level.DEBUG));
        AppenderComponentBuilder appenderBuilder = builder.newAppender("Stdout", "CONSOLE").
            addAttribute("target", ConsoleAppender.Target.SYSTEM_OUT);
        appenderBuilder.add(builder.newLayout("PatternLayout").
            addAttribute("pattern", "%d [%t] %-5level: %msg%n%throwable"));
        appenderBuilder.add(builder.newFilter("MarkerFilter", Filter.Result.DENY,
            Filter.Result.NEUTRAL).addAttribute("marker", "FLOW"));
        builder.add(appenderBuilder);
        builder.add(builder.newLogger("org.apache.logging.log4j", Level.DEBUG).
            add(builder.newAppenderRef("Stdout")).
            addAttribute("additivity", false));
        builder.add(builder.newRootLogger(Level.ERROR).add(builder.newAppenderRef("Stdout")));
        return builder.build();
    }

    @Override
    public Configuration getConfiguration(final LoggerContext loggerContext, final ConfigurationSource source) {
        return getConfiguration(loggerContext, source.toString(), null);
    }

    @Override
    public Configuration getConfiguration(final LoggerContext loggerContext, final String name, final URI configLocation) {
        ConfigurationBuilder<BuiltConfiguration> builder = newConfigurationBuilder();
        return createConfiguration(name, builder);
    }

    @Override
    protected String[] getSupportedTypes() {
        return new String[] {"*"};
    }
}
```

从2.7版本开始，ConfigurationFactory.getConfiguration()方法需要一个额外的LoggerContext参数。

# 使用配置器中的ConfigurationBuilder重新配置Log4j

自定义ConfigurationFactory的另一种选择是使用配置器进行配置。

一旦构造了配置对象，就可以将其传递给其中一个配置器。初始化方法来设置Log4j配置。

以这种方式使用配置器允许应用程序控制Log4j何时初始化。

但是，如果在调用 configuration.initialize() 之前尝试记录日志，那么这些日志事件将使用默认配置。

```java
ConfigurationBuilder<BuiltConfiguration> builder = ConfigurationBuilderFactory.newConfigurationBuilder();
builder.setStatusLevel(Level.ERROR);
builder.setConfigurationName("BuilderTest");
builder.add(builder.newFilter("ThresholdFilter", Filter.Result.ACCEPT, Filter.Result.NEUTRAL)
    .addAttribute("level", Level.DEBUG));
AppenderComponentBuilder appenderBuilder = builder.newAppender("Stdout", "CONSOLE").addAttribute("target",
    ConsoleAppender.Target.SYSTEM_OUT);
appenderBuilder.add(builder.newLayout("PatternLayout")
    .addAttribute("pattern", "%d [%t] %-5level: %msg%n%throwable"));
appenderBuilder.add(builder.newFilter("MarkerFilter", Filter.Result.DENY, Filter.Result.NEUTRAL)
    .addAttribute("marker", "FLOW"));
builder.add(appenderBuilder);
builder.add(builder.newLogger("org.apache.logging.log4j", Level.DEBUG)
    .add(builder.newAppenderRef("Stdout")).addAttribute("additivity", false));
builder.add(builder.newRootLogger(Level.ERROR).add(builder.newAppenderRef("Stdout")));
ctx = Configurator.initialize(builder.build());
```

这个例子展示了如何创建一个包含RollingFileAppender的配置:

```java
ConfigurationBuilder< BuiltConfiguration > builder = ConfigurationBuilderFactory.newConfigurationBuilder();

builder.setStatusLevel( Level.ERROR);
builder.setConfigurationName("RollingBuilder");
// create a console appender
AppenderComponentBuilder appenderBuilder = builder.newAppender("Stdout", "CONSOLE").addAttribute("target",
    ConsoleAppender.Target.SYSTEM_OUT);
appenderBuilder.add(builder.newLayout("PatternLayout")
    .addAttribute("pattern", "%d [%t] %-5level: %msg%n%throwable"));
builder.add( appenderBuilder );
// create a rolling file appender
LayoutComponentBuilder layoutBuilder = builder.newLayout("PatternLayout")
    .addAttribute("pattern", "%d [%t] %-5level: %msg%n");
ComponentBuilder triggeringPolicy = builder.newComponent("Policies")
    .addComponent(builder.newComponent("CronTriggeringPolicy").addAttribute("schedule", "0 0 0 * * ?"))
    .addComponent(builder.newComponent("SizeBasedTriggeringPolicy").addAttribute("size", "100M"));
appenderBuilder = builder.newAppender("rolling", "RollingFile")
    .addAttribute("fileName", "target/rolling.log")
    .addAttribute("filePattern", "target/archive/rolling-%d{MM-dd-yy}.log.gz")
    .add(layoutBuilder)
    .addComponent(triggeringPolicy);
builder.add(appenderBuilder);

// create the new logger
builder.add( builder.newLogger( "TestLogger", Level.DEBUG )
    .add( builder.newAppenderRef( "rolling" ) )
    .addAttribute( "additivity", false ) );

builder.add( builder.newRootLogger( Level.DEBUG )
    .add( builder.newAppenderRef( "rolling" ) ) );
LoggerContext ctx = Configurator.initialize(builder.build());
```

# 通过组合配置文件和程序配置来初始化Log4j

有时您希望使用配置文件进行配置，但要进行一些额外的程序化配置。

一种可能的用例是，您希望允许使用XML进行灵活的配置，但同时确保有一些配置元素始终存在，不能删除。

实现这一点的最简单方法是扩展其中一个标准配置类(XMLConfiguration、JSONConfiguration)，然后为扩展的类创建一个新的ConfigurationFactory。

标准配置完成后，可以将自定义配置添加到标准配置中。

下面的示例展示了如何扩展XMLConfiguration，以手动将Appender和LoggerConfig添加到配置中。

```java
@Plugin(name = "MyXMLConfigurationFactory", category = "ConfigurationFactory")
@Order(10)
public class MyXMLConfigurationFactory extends ConfigurationFactory {
 
    /**
     * Valid file extensions for XML files.
     */
    public static final String[] SUFFIXES = new String[] {".xml", "*"};
 
    /**
     * Return the Configuration.
     * @param source The InputSource.
     * @return The Configuration.
     */
    public Configuration getConfiguration(InputSource source) {
        return new MyXMLConfiguration(source, configFile);
    }
 
    /**
     * Returns the file suffixes for XML files.
     * @return An array of File extensions.
     */
    public String[] getSupportedTypes() {
        return SUFFIXES;
    }
}
 
public class MyXMLConfiguration extends XMLConfiguration {
    public MyXMLConfiguration(final ConfigurationFactory.ConfigurationSource configSource) {
      super(configSource);
    }
 
    @Override
    protected void doConfigure() {
        super.doConfigure();
        final LoggerContext context = (LoggerContext) LogManager.getContext(false);
        final Configuration config = context.getConfiguration();
        final Layout layout = PatternLayout.createDefaultLayout(config);
        final Appender appender = FileAppender.createAppender("target/test.log", "false", "false", "File", "true",
              "false", "false", "4000", layout, null, "false", null, config);
        appender.start();
        addAppender(appender);
        LoggerConfig loggerConfig = LoggerConfig.createLogger("false", "info", "org.apache.logging.log4j",
              "true", refs, null, config, null );
        loggerConfig.addAppender(appender, null, null);
        addLogger("org.apache.logging.log4j", loggerConfig);
    }
}
```

# 在初始化后以编程方式修改当前配置

应用程序有时需要自定义日志记录，而不是实际配置。Log4j允许这样做，尽管它有一些限制:

1. 如果配置文件被更改，配置将被重新加载，手动更改将丢失。

2. 对正在运行的配置进行修改，需要同步调用的所有方法(addAppender和addLogger)。

因此，推荐的自定义配置方法是扩展一个标准配置类，覆盖setup方法，首先执行super.setup()，然后在注册使用之前将自定义Appenders、Filters和LoggerConfigs添加到配置中。

下面的示例将添加一个Appender和一个使用该Appender的新的LoggerConfig到当前配置中。

```java
final LoggerContext ctx = (LoggerContext) LogManager.getContext(false);
        final Configuration config = ctx.getConfiguration();
        final Layout layout = PatternLayout.createDefaultLayout(config);
        Appender appender = FileAppender.createAppender("target/test.log", "false", "false", "File", "true",
            "false", "false", "4000", layout, null, "false", null, config);
        appender.start();
        config.addAppender(appender);
        AppenderRef ref = AppenderRef.createAppenderRef("File", null, null);
        AppenderRef[] refs = new AppenderRef[] {ref};
        LoggerConfig loggerConfig = LoggerConfig.createLogger("false", "info", "org.apache.logging.log4j",
            "true", refs, null, config, null );
        loggerConfig.addAppender(appender, null, null);
        config.addLogger("org.apache.logging.log4j", loggerConfig);
        ctx.updateLoggers();
}
```

# 以编程方式向写入器和输出流添加日志事件

Log4j 2.5提供了将日志事件附加到写入器和输出流的功能。

例如，它为那些内部使用Log4j但仍然希望支持JDBC api CommonDataSource.setLogWriter(PrintWriter)、java.sql.DriverManager.setLogWriter(PrintWriter)和java.sql.DriverManager.setLogStream(PrintStream)的JDBC驱动程序实现提供了简单的集成。

给定任何Writer，比如PrintWriter，你可以通过创建WriterAppender并更新Log4j配置来告诉Log4j将事件附加到该Writer:

```java
void addAppender(final Writer writer, final String writerName) {
    final LoggerContext context = LoggerContext.getContext(false);
    final Configuration config = context.getConfiguration();
    final PatternLayout layout = PatternLayout.createDefaultLayout(config);
    final Appender appender = WriterAppender.createAppender(layout, null, writer, writerName, false, true);
    appender.start();
    config.addAppender(appender);
    updateLoggers(appender, config);
}
 
private void updateLoggers(final Appender appender, final Configuration config) {
    final Level level = null;
    final Filter filter = null;
    for (final LoggerConfig loggerConfig : config.getLoggers().values()) {
        loggerConfig.addAppender(appender, level, filter);
    }
    config.getRootLogger().addAppender(appender, level, filter);
}
```

你可以用OutputStream实现相同的效果，比如PrintStream:

```java
void addAppender(final OutputStream outputStream, final String outputStreamName) {
    final LoggerContext context = LoggerContext.getContext(false);
    final Configuration config = context.getConfiguration();
    final PatternLayout layout = PatternLayout.createDefaultLayout(config);
    final Appender appender = OutputStreamAppender.createAppender(layout, null, outputStream, outputStreamName, false, true);
    appender.start();
    config.addAppender(appender);
    updateLoggers(appender, config);
}
```

区别在于使用的是OutputStreamAppender而不是WriterAppender。

# 参考资料

https://logging.apache.org/log4j/2.x/manual/customconfig.html

* any list
{:toc}
