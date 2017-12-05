---
layout: post
title:  Hadoop
date:  2017-11-12 11:47:35 +0800
categories: [Apache]
tags: [apache, big data]
published: true
---


# Hadoop


The Apache™ [Hadoop®](http://hadoop.apache.org/) project develops open-source software for reliable, scalable, distributed computing.


The project includes these modules:

- Hadoop Common: The common utilities that support the other Hadoop modules.

- Hadoop Distributed File System (HDFS™): A distributed file system that provides high-throughput access to application data.

- Hadoop YARN: A framework for job scheduling and cluster resource management.

- Hadoop MapReduce: A YARN-based system for parallel processing of large data sets.


# Hello World

简单的 Java 示例 - 单词次数统计。

[完整代码地址](https://github.com/houbb/hadoop-learn)

## 项目结构

```
├── pom.xml
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── ryo
    │   │           └── hadoop
    │   │               └── learn
    │   │                   └── helloWorld
    │   │                       ├── MapClass.java
    │   │                       ├── ReduceClass.java
    │   │                       └── WordCount.java
    │   └── resources
    │       └── Input.txt
    └── test
        └── java
```

## 文件内容

- pom.xml

引入 jar 

```xml
<dependency>
    <groupId>org.apache.hadoop</groupId>
    <artifactId>hadoop-core</artifactId>
    <version>1.2.1</version>
</dependency>
```

- MapClass.java

```java
package com.ryo.hadoop.learn.helloWorld;

import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

import java.io.IOException;
import java.util.StringTokenizer;

/**
 * Map Class which extends MaReduce.Mapper class
 * Map is passed a single line at a time, it splits the line based on space
 * and generated the token which are output by map with value as one to be consumed
 * by reduce class
 * @author Raman
 */
public class MapClass extends Mapper<LongWritable, Text, Text, IntWritable>{
	 
	private final static IntWritable one = new IntWritable(1);
    private Text word = new Text();
    
    /**
     * map function of Mapper parent class takes a line of text at a time
     * splits to tokens and passes to the context as word along with value as one
     */
	@Override
	protected void map(LongWritable key, Text value,
			Context context)
			throws IOException, InterruptedException {
		
		String line = value.toString();
		StringTokenizer st = new StringTokenizer(line," ");
		
		while(st.hasMoreTokens()){
			word.set(st.nextToken());
			context.write(word,one);
		}
		
	}
}
```

- ReduceClass.java

```java
package com.ryo.hadoop.learn.helloWorld;

import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;

import java.io.IOException;
import java.util.Iterator;

/**
 * Reduce class which is executed after the map class and takes
 * key(word) and corresponding values, sums all the values and write the
 * word along with the corresponding total occurances in the output
 * 
 * @author Raman
 */
public class ReduceClass extends Reducer<Text, IntWritable, Text, IntWritable>{

	/**
	 * Method which performs the reduce operation and sums 
	 * all the occurrences of the word before passing it to be stored in output
	 */
	@Override
	protected void reduce(Text key, Iterable<IntWritable> values,
			Context context)
			throws IOException, InterruptedException {
	
		int sum = 0;
		Iterator<IntWritable> valuesIt = values.iterator();
		
		while(valuesIt.hasNext()){
			sum = sum + valuesIt.next().get();
		}
		
		context.write(key, new IntWritable(sum));
	}	
}
```

- WordCount.java

```java
package com.ryo.hadoop.learn.helloWorld;

import org.apache.hadoop.conf.Configured;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;
import org.apache.hadoop.util.Tool;
import org.apache.hadoop.util.ToolRunner;

/**
 * The entry point for the WordCount example,
 * which setup the Hadoop job with Map and Reduce Class
 *
 * @author Raman
 * @author houbinbin
 */
public class WordCount extends Configured implements Tool {

    /**
     * Main function which calls the run method and passes the args using ToolRunner
     *
     * @param args Two arguments input and output file paths
     * @throws Exception
     */
    public static void main(String[] args) throws Exception {
        int exitCode = ToolRunner.run(new WordCount(), args);
        System.exit(exitCode);
    }

    /**
     * Run method which schedules the Hadoop Job
     *
     * @param args Arguments passed in main function
     */
    public int run(String[] args) throws Exception {
        //Initialize the Hadoop job and set the jar as well as the name of the Job
        Job job = new Job();
        job.setJarByClass(WordCount.class);
        job.setJobName("WordCounter");

        //Add input and output file paths to job based on the arguments passed
        final String projectPath = getPath();
        final String inputPath = projectPath + "/src/main/resources/Input.txt";
        final String outputPath = projectPath + "/output";

        FileInputFormat.addInputPath(job, new Path(inputPath));
        FileOutputFormat.setOutputPath(job, new Path(outputPath));

        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(IntWritable.class);
        job.setOutputFormatClass(TextOutputFormat.class);

        //Set the MapClass and ReduceClass in the job
        job.setMapperClass(MapClass.class);
        job.setReducerClass(ReduceClass.class);

        //Wait for the job to complete and print if the job was successful or not
        int returnValue = job.waitForCompletion(true) ? 0 : 1;

        if (job.isSuccessful()) {
            System.out.println("Job was successful");
        } else if (!job.isSuccessful()) {
            System.out.println("Job was not successful");
        }

        return returnValue;
    }


    /**
     * 获取项目路径
     * @return ~/hadoop-learn
     */
    private static String getPath() {
        return System.getProperty("user.dir");
    }

}
```

- Input.txt

本次统计的输入。内容如下:

```
This is the example text file for word count example also knows as hello world example of the Hadoop ecosystem.
This example is written for the examples article of java code geek
The quick brown fox jumps over the lazy dog.
The above line is one of the most famous lines which contains all the english language alphabets.
```

## 运行测试

运行 `WordCount.java` 中的 `main()`。日志如下：
 
```
十一月 12, 2017 3:07:35 下午 org.apache.hadoop.util.NativeCodeLoader <clinit>
警告: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
......
十一月 12, 2017 3:07:36 下午 org.apache.hadoop.mapred.Counters log
信息:     Bytes Written=351
Job was successful

Process finished with exit code 0
``` 


## 测试结果

根目录 **output** 有以下文件：

```
├── ._SUCCESS.crc
├── .part-r-00000.crc
├── _SUCCESS
└── part-r-00000
```

- part-r-00000

记录了本次的统计结果。内容如下：

```
Hadoop	1
The	2
This	2
above	1
all	1
alphabets.	1
also	1
article	1
as	1
brown	1
code	1
contains	1
count	1
dog.	1
ecosystem.	1
english	1
example	4
examples	1
famous	1
file	1
for	2
fox	1
geek	1
hello	1
is	3
java	1
jumps	1
knows	1
language	1
lazy	1
line	1
lines	1
most	1
of	3
one	1
over	1
quick	1
text	1
the	6
which	1
word	1
world	1
written	1
```

# Single Node Cluster

为了简单起见。本文首先从单个结点部署开始。

> [SingleCluster.html](http://hadoop.apache.org/docs/r2.9.0/hadoop-project-dist/hadoop-common/SingleCluster.html)

## Prepare

一、Supported Platforms


本测试环境为 Mac。(Linux)


二、Required Software

- JDK

[Jdk 版本](https://wiki.apache.org/hadoop/HadoopJavaVersions)

```
houbinbindeMacBook-Pro:~ houbinbin$ java -version
java version "1.8.0_91"
Java(TM) SE Runtime Environment (build 1.8.0_91-b14)
Java HotSpot(TM) 64-Bit Server VM (build 25.91-b14, mixed mode)
```

- ssh

```
houbinbindeMacBook-Pro:~ houbinbin$ ssh -V
OpenSSH_7.4p1, LibreSSL 2.5.0
```


如果没安装，必须首先安装。此处不再赘述。


## Download

[http://hadoop.apache.org/releases.html](http://hadoop.apache.org/releases.html)


本文学习使用 [2.8.2](http://www.apache.org/dyn/closer.cgi/hadoop/common/hadoop-2.8.2/hadoop-2.8.2-src.tar.gz) 版本。




## 配置



[直接安装服务](https://www.cnblogs.com/micrari/p/5716851.html)

[详细配置说明](http://blog.csdn.net/xbwer/article/details/35614679)

[常规安装系列](http://qingshou117.iteye.com/blog/2265312)





# Book

《Hadoop 权威指南》












* any list
{:toc}