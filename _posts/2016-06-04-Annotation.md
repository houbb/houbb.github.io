---
layout: post
title: Annotation
date:  2016-06-04 22:36:10 +0800
categories: [Java]
tags: [Annotation]
published: true
---
* any list
{:toc}


Annotations, a form of metadata, provide data about a program that is not part of the program itself.

> [annotations doc](https://docs.oracle.com/javase/tutorial/java/annotations/index.html)


## Basics

- The Format of an Annotation

The at sign character <kbd>@</kbd> indicates to the compiler that what follows is an annotation. like the ```@override```

- Where Annotations Can Be Used

Annotations can be applied to declarations: declarations of classes, fields, methods, and other program elements.


## Declaring an Annotation Type

- You can define the annotation type as following

```java
public @interface AuthorInfo {
    String author() default "houbb";
    String date();
}
```

- And use it

```java
@AuthorInfo(date = "2016-06-04 22:58:46")
public void testAuthorInfo() {

}
```

<label class="label label-info">Note</label>

To make the information in @AuthorInfo appear in Javadoc-generated documentation, you must annotate the @AuthorInfo
definition with the **@Documented** annotation.


## Predefined Annotation Types

Annotations that apply to other annotations are called meta-annotations. There are several meta-annotation types defined in java.lang.annotation.

### @Retention

> @Retention annotation specifies how the marked annotation is stored:

- RetentionPolicy.SOURCE – The marked annotation is retained only in the source level and is ignored by the compiler.
- RetentionPolicy.CLASS – The marked annotation is retained by the compiler at compile time, but is ignored by the Java Virtual Machine (JVM).
- RetentionPolicy.RUNTIME – The marked annotation is retained by the JVM so it can be used by the runtime environment.

### @Target

> @Target annotation marks another annotation to restrict what kind of Java elements the annotation can be applied to.

- ElementType.ANNOTATION_TYPE can be applied to an annotation type.
- ElementType.CONSTRUCTOR can be applied to a constructor.
- ElementType.FIELD can be applied to a field or property.
- ElementType.LOCAL_VARIABLE can be applied to a local variable.
- ElementType.METHOD can be applied to a method-level annotation.
- ElementType.PACKAGE can be applied to a package declaration.
- ElementType.PARAMETER can be applied to the parameters of a method.
- ElementType.TYPE can be applied to any element of a class.


## Type Annotations and Pluggable Type Systems

Type annotations were created to support improved analysis of Java programs way of ensuring stronger type checking.

> [checker-framework](http://types.cs.washington.edu/checker-framework/)



