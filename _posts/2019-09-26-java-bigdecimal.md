---
layout: post
title: Java BigDecimal 深入学习
date:  2019-9-26 22:35:36 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# BigDecimal 遇到的坑

## 现象

```java
public static void main(String[] args) {
        BigDecimal one = new BigDecimal("60");
        BigDecimal two = new BigDecimal("60.00");

        System.out.println(one.equals(two));    
        System.out.println(one.doubleValue() == two.doubleValue());
        System.out.println(one.setScale(2).equals(two.setScale(2)));
}
```

有一次编写了使用 equals() 进行两个金额值的比较，但是很不幸。

`one.equals(two)` 结果是 false。

解决方案可以是后面的两种方式。

个人比较倾向于第一种，直接获取对应的 double value。




# equals 源码

```java
    /**
     * Compares this {@code BigDecimal} with the specified
     * {@code Object} for equality.  Unlike {@link
     * #compareTo(BigDecimal) compareTo}, this method considers two
     * {@code BigDecimal} objects equal only if they are equal in
     * value and scale (thus 2.0 is not equal to 2.00 when compared by
     * this method).
     *
     * @param  x {@code Object} to which this {@code BigDecimal} is
     *         to be compared.
     * @return {@code true} if and only if the specified {@code Object} is a
     *         {@code BigDecimal} whose value and scale are equal to this
     *         {@code BigDecimal}'s.
     * @see    #compareTo(java.math.BigDecimal)
     * @see    #hashCode
     */
    @Override
    public boolean equals(Object x) {
        if (!(x instanceof BigDecimal))
            return false;
        BigDecimal xDec = (BigDecimal) x;
        if (x == this)
            return true;
        if (scale != xDec.scale)
            return false;
        long s = this.intCompact;
        long xs = xDec.intCompact;
        if (s != INFLATED) {
            if (xs == INFLATED)
                xs = compactValFor(xDec.intVal);
            return xs == s;
        } else if (xs != INFLATED)
            return xs == compactValFor(this.intVal);

        return this.inflated().equals(xDec.inflated());
    }
```

可以发现，如果二者的精度不同，也是直接会返回 false 的。



# compareTo 源码

```java
    /**
     * Compares this {@code BigDecimal} with the specified
     * {@code BigDecimal}.  Two {@code BigDecimal} objects that are
     * equal in value but have a different scale (like 2.0 and 2.00)
     * are considered equal by this method.  This method is provided
     * in preference to individual methods for each of the six boolean
     * comparison operators ({@literal <}, ==,
     * {@literal >}, {@literal >=}, !=, {@literal <=}).  The
     * suggested idiom for performing these comparisons is:
     * {@code (x.compareTo(y)} &lt;<i>op</i>&gt; {@code 0)}, where
     * &lt;<i>op</i>&gt; is one of the six comparison operators.
     *
     * @param  val {@code BigDecimal} to which this {@code BigDecimal} is
     *         to be compared.
     * @return -1, 0, or 1 as this {@code BigDecimal} is numerically
     *          less than, equal to, or greater than {@code val}.
     */
    public int compareTo(BigDecimal val) {
        // Quick path for equal scale and non-inflated case.
        if (scale == val.scale) {
            long xs = intCompact;
            long ys = val.intCompact;
            if (xs != INFLATED && ys != INFLATED)
                return xs != ys ? ((xs > ys) ? 1 : -1) : 0;
        }
        int xsign = this.signum();
        int ysign = val.signum();
        if (xsign != ysign)
            return (xsign > ysign) ? 1 : -1;
        if (xsign == 0)
            return 0;
        int cmp = compareMagnitude(val);
        return (xsign > 0) ? cmp : -cmp;
    }
```

# doubleValue()

## 源码

```java
    /**
     * Converts this {@code BigDecimal} to a {@code double}.
     * This conversion is similar to the
     * <i>narrowing primitive conversion</i> from {@code double} to
     * {@code float} as defined in section 5.1.3 of
     * <cite>The Java&trade; Language Specification</cite>:
     * if this {@code BigDecimal} has too great a
     * magnitude represent as a {@code double}, it will be
     * converted to {@link Double#NEGATIVE_INFINITY} or {@link
     * Double#POSITIVE_INFINITY} as appropriate.  Note that even when
     * the return value is finite, this conversion can lose
     * information about the precision of the {@code BigDecimal}
     * value.
     *
     * @return this {@code BigDecimal} converted to a {@code double}.
     */
    public double doubleValue(){
        if(intCompact != INFLATED) {
            if (scale == 0) {
                return (double)intCompact;
            } else {
                /*
                 * If both intCompact and the scale can be exactly
                 * represented as double values, perform a single
                 * double multiply or divide to compute the (properly
                 * rounded) result.
                 */
                if (Math.abs(intCompact) < 1L<<52 ) {
                    // Don't have too guard against
                    // Math.abs(MIN_VALUE) because of outer check
                    // against INFLATED.
                    if (scale > 0 && scale < double10pow.length) {
                        return (double)intCompact / double10pow[scale];
                    } else if (scale < 0 && scale > -double10pow.length) {
                        return (double)intCompact * double10pow[-scale];
                    }
                }
            }
        }
        // Somewhat inefficient, but guaranteed to work.
        return Double.parseDouble(this.toString());
    }
```


# 个人收获

使用一样东西之前，不能想当然的认为，最好是熟练的知道其中的原理。

不然，你会跳进神坑之中。

# 参考资料


* any list
{:toc}