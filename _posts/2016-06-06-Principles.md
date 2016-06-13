---
layout: post
title: Principles of OOD
date:  2016-6-6 16:19:50 +0800
categories: [Java]
tags: [design]
published: false
---
* any list
{:toc}

> [PrinciplesOfObjectOrientedDesign](http://c2.com/cgi/wiki?PrinciplesOfObjectOrientedDesign)


There are five principles of class design (aka SOLID):

## SRP

> The SingleResponsibilityPrinciple

- Each responsibility should be a separate class, because each responsibility is an axis of change.
- A class should have one, and only one, reason to change.
- If a change to the business rules causes a class to change, then a change to the database schema, GUI, report format, 
or any other segment of the system should not force that class to change.



## OCP

> The OpenClosedPrinciple

A class should be open for extension, but closed for modification.

In other words, you should never need to change existing code or classes: All new functionality can be added by adding new subclasses or methods, or by reusing existing code through delegation.

This prevents you from introducing new bugs in existing code. If you never change it, you can't break it. It also prevents you from fixing existing bugs in existing code, if taken to the extreme.


## LSP

> The LiskovSubstitutionPrinciple

What is wanted here is something like the following substitution property: If for each object o1 of type S there is an object o2 of type T such that for all programs P defined in terms of T, the behavior of P is unchanged when o1 is substituted for o2 then S is a subtype of T." 

<footer>BarbaraLiskov, Data Abstraction and Hierarchy, SIGPLAN Notices, 23,5 (May, 1988).</footer>



## ISP

> The InterfaceSegregationPrinciple

The dependency of one class to another one should depend on the smallest possible interface.


## DIP

> The DependencyInversionPrinciple

- A. High level modules should not depend upon low level modules. Both should depend upon abstractions.
- B. Abstractions should not depend upon details. Details should depend upon abstractions.

## Law Of Demeter

Only talk to your immediate friends.

- Your method can call other methods in its class directly
- Your method can call methods on its own fields directly (but not on the fields' fields)
- When your method takes parameters, your method can call methods on those parameters directly.
- When your method creates local objects, that method can call methods on the local objects.

<label class="label label-warning">Warn</label>

- One should not call methods on a global object (but it can be passed as a parameter ?)
- One should not have a chain of messages a.getB().getC().doSomething() in some class other than a's class.




