---
layout: post
title:  Neo4j-04-图数据库 neo4j ogm 面向对象操作图数据库
date:  2018-1-8 14:18:33 +0800
categories: [SQL]
tags: [nosql, orm, neo4j]
published: true
---


# Neo4j-OGM - 一个针对Neo4j的对象图映射库。

Neo4j-OGM是一个针对Neo4j数据库优化的快速对象图映射库，专为使用Cypher的基于服务器的安装环境进行了优化。

它旨在简化与Neo4j图数据库的开发，类似于JPA，它使用简单的POJO领域对象上的注解。

请查看当前支持的版本和我们推荐使用的组合：[推荐版本](https://github.com/neo4j/neo4j-ogm/wiki/Versions)。

# 入门

## maven 

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.example</groupId>
        <artifactId>neo4j-learn</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <artifactId>neo4j-ogm</artifactId>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.neo4j</groupId>
            <artifactId>neo4j-ogm-core</artifactId>
            <version>3.2.11</version>
        </dependency>

        <dependency> <!-- If you're using the Bolt driver -->
            <groupId>org.neo4j</groupId>
            <artifactId>neo4j-ogm-bolt-driver</artifactId>
            <version>3.2.11</version>
        </dependency>

        <dependency>
            <groupId>org.neo4j.driver</groupId>
            <artifactId>neo4j-java-driver</artifactId>
            <version>4.0.1</version> <!-- 替换为最新版本号 -->
        </dependency>

    </dependencies>

</project>
```

## 测试版本

当前对应的 neo4j server 版本为 5.12.0


## 入门测试

### model

- Actor.java

```java
package com.github.houbb.neo4j.learn.ogm.model;

import org.neo4j.ogm.annotation.GeneratedValue;
import org.neo4j.ogm.annotation.Id;
import org.neo4j.ogm.annotation.NodeEntity;
import org.neo4j.ogm.annotation.Relationship;

import java.util.HashSet;
import java.util.Set;

@NodeEntity
public class Actor {

    @Id
    @GeneratedValue
    private Long id;
    private String name;

    @Relationship(type = "ACTS_IN")
    private Set<Movie> movies = new HashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Set<Movie> getMovies() {
        return movies;
    }

    public void setMovies(Set<Movie> movies) {
        this.movies = movies;
    }

    public Actor() {
    }

    public Actor(String name) {
        this.name = name;
    }

    public void actsIn(Movie movie) {
        movies.add(movie);

        movie.getActorList().add(this);
    }

}
```

- Movie.java

```java
package com.github.houbb.neo4j.learn.ogm.model;

import org.neo4j.ogm.annotation.GeneratedValue;
import org.neo4j.ogm.annotation.Id;
import org.neo4j.ogm.annotation.NodeEntity;

import java.util.ArrayList;
import java.util.List;

@NodeEntity
public class Movie {

    @Id
    @GeneratedValue
    private Long id;
    private String title;
    private int released;

    private List<Actor> actorList = new ArrayList<>();

    public List<Actor> getActorList() {
        return actorList;
    }

    public void setActorList(List<Actor> actorList) {
        this.actorList = actorList;
    }

    public Movie() {
    }

    public Movie(String title, int year) {
        this.title = title;
        this.released = year;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public int getReleased() {
        return released;
    }

    public void setReleased(int released) {
        this.released = released;
    }

    @Override
    public String toString() {
        return "Movie{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", released=" + released +
                ", actorList=" + actorList +
                '}';
    }

}
```

## 入门测试

```java
package com.github.houbb.neo4j.learn.ogm;

import com.github.houbb.neo4j.learn.ogm.model.Actor;
import com.github.houbb.neo4j.learn.ogm.model.Movie;
import org.neo4j.ogm.config.Configuration;
import org.neo4j.ogm.session.Session;
import org.neo4j.ogm.session.SessionFactory;

public class OgmMain {

    public static void main(String[] args) {
        // 配置Neo4j OGM
        Configuration configuration = new Configuration.Builder()
                .uri("bolt://localhost:7687")
                .credentials("neo4j", "12345678")
                .build();

        // 创建SessionFactory
        SessionFactory sessionFactory = new SessionFactory(configuration, "com.github.houbb.neo4j.learn.ogm.model");
        Session session = sessionFactory.openSession();

        Movie movie = new Movie("The Matrix", 1999);

        Actor keanu = new Actor("Keanu Reeves");
        keanu.actsIn(movie);

        Actor carrie = new Actor("Carrie-Ann Moss");
        carrie.actsIn(movie);

        //Persist the movie. This persists the actors as well.
        session.save(movie);

        //Load a movie
        Movie matrix = session.load(Movie.class, movie.getId());
        System.out.println(matrix);
        for(Actor actor : matrix.getActorList()) {
            System.out.println("Actor: " + actor.getName());
        }
    }

}
```

这种是直接面向对象的写法。

# chat

## Q1-neo4j ogm 这个包做什么的？

Neo4j OGM（Object-Graph Mapping）是一个对象-图映射库，它允许Java应用程序开发者使用面向对象的方式来操作Neo4j图数据库。

它提供了一种简单的方法，将Java领域模型（POJOs，Plain Old Java Objects）映射到Neo4j图数据库中的节点和关系。

具体来说，Neo4j OGM 提供了以下主要功能：

1. **实体映射**：你可以将Java对象映射到Neo4j节点。Neo4j OGM支持节点的属性、标签、关系等的映射。

2. **关系映射**：你可以定义Java对象之间的关系，Neo4j OGM会将这些关系映射到Neo4j数据库中的关系。

3. **查询支持**：Neo4j OGM 提供了面向对象的查询语言，你可以使用类似SQL的查询语法来检索数据，而无需直接使用Cypher查询语句。

4. **事务管理**：Neo4j OGM 支持事务管理，你可以在Java中以编程方式管理Neo4j事务。

5. **对象生命周期管理**：Neo4j OGM 允许你操作对象的生命周期，包括保存、更新、删除等操作。

使用Neo4j OGM，你可以将Neo4j数据库看作是一个对象数据库，而不是关系数据库，从而更容易地将图数据库集成到Java应用程序中。

Neo4j OGM 提供了方便的API和注解，使得开发者能够以更直观的方式来操作图数据库。





# 参考资料



* any list
{:toc}