---
layout: post
title: 加密算法简介
date:  2018-11-9 18:55:36 +0800
categories: [Althgorim]
tags: [althgorim, croptograph, secret, sh]
published: true
---

# A Brief Notebook on Cryptography

这是我在布朗大学2016年春季数论课上写的一篇文章。它是由Jupyter笔记本编写并最初呈现的，并在此网站上进行了更改。 

[github](https://gist.github.com/davidlowryduda/c0e8d526a8e144997fac) 上有一个版本的笔记。

# Cryptography

回想一下加密的基本设置。我们有两个人，Anabel和Bartolo。 Anabel希望向Bartolo发送安全信息。我们的意思是什么？“安全？”我们的意思是，即使那个卑鄙的夏娃可以拦截和阅读传输的信息，夏娃也不会了解安娜贝尔想要发送给巴托洛的实际信息。

在20世纪70年代之前，Anabel向Bartolo发送安全信息的唯一途径是要求Anabel和Bartolo事先聚在一起，并就秘密通信方式达成一致。为了沟通，Anabel首先决定一条消息。原始消息有时称为明文。然后，她对消息进行加密，生成密文。

然后她发送密文。如果Eve得到了密文，她就不应该解码它（除非它是一个糟糕的加密方案）。

当Bartolo收到密文时，他可以解密它以恢复明文消息，因为他事先就加密方案达成了一致意见。


# 凯撒转移

第一个已知的密码学实例来自Julius Caesar。 

这不是一个很好的方法。 

为了加密消息，他将每个字母移过2，所以例如“A”变为“C”，“B”变为“D”，依此类推。

让我们看看出现了什么样的信息。

## Demo-1

```
alpha = "abcdefghijklmnopqrstuvwxyz".upper()
punct = ",.?:;'\n "
```

```python
from functools import partial

def shift(l, s=2):
    l = l.upper()
    return alpha[(alpha.index(l) + s) % 26]

def caesar_shift_encrypt(m, s=2):
    m = m.upper()
    c = "".join(map(partial(shift, s=s), m))
    return c

def caesar_shift_decrypt(c, s=-2):
    c = c.upper()
    m = "".join(map(partial(shift, s=s), c))
    return m
```

```python
print "Original Message: HI"
print "Ciphertext:", caesar_shift_encrypt("hi")
```

Original Message: HI
Ciphertext: JK

## Demo-2

```python
m = """To be, or not to be, that is the question:
Whether 'tis Nobler in the mind to suffer
The Slings and Arrows of outrageous Fortune,
Or to take Arms against a Sea of troubles,
And by opposing end them."""

m = "".join([l for l in m if not l in punct])

print "Original Message:"
print m

print
print "Ciphertext:"
tobe_ciphertext = caesar_shift_encrypt(m)
print tobe_ciphertext
```

Original Message:
TobeornottobethatisthequestionWhethertisNoblerinthemindtosuffer
TheSlingsandArrowsofoutrageousFortuneOrtotakeArmsagainstaSeaof
troublesAndbyopposingendthem

Ciphertext:
VQDGQTPQVVQDGVJCVKUVJGSWGUVKQPYJGVJGTVKUPQDNGTKPVJGOKPFVQUWHHGT
VJGUNKPIUCPFCTTQYUQHQWVTCIGQWUHQTVWPGQTVQVCMGCTOUCICKPUVCUGCQH
VTQWDNGUCPFDAQRRQUKPIGPFVJGO

```python
print "Decrypted first message:", caesar_shift_decrypt("JK")
```

Decrypted first message: HI

```python
print "Decrypted second message:"
print caesar_shift_decrypt(tobe_ciphertext)
```

Decrypted second message:
TOBEORNOTTOBETHATISTHEQUESTIONWHETHERTISNOBLERINTHEMINDTOSUFFER
THESLINGSANDARROWSOFOUTRAGEOUSFORTUNEORTOTAKEARMSAGAINSTASEAOF
TROUBLESANDBYOPPOSINGENDTHEM

这是一个很好的加密方案吗？ 

不，不是真的。 只有26种不同的东西可供尝试。 这可以非常快速和轻松地解密，即使完全是手工完成。

# 替换密码

略有不同的方案是为每个字母选择不同的字母。 

例如，可能“A”实际上意味着“G”而“B”实际上意味着“E”。 

我们将此称为替换密码，因为每个字母都替换为另一个字母。

```py
import random
permutation = list(alpha)
random.shuffle(permutation)

# Display the new alphabet
print alpha
subs = "".join(permutation)
print subs
```

ABCDEFGHIJKLMNOPQRSTUVWXYZ
EMJSLZKAYDGTWCHBXORVPNUQIF

```py
def subs_cipher_encrypt(m):
    m = "".join([l.upper() for l in m if not l in punct])
    return "".join([subs[alpha.find(l)] for l in m])

def subs_cipher_decrypt(c):
    c = "".join([l.upper() for l in c if not l in punct])
    return "".join([alpha[subs.find(l)] for l in c])
m1 = "this is a test"

print "Original message:", m1
c1 = subs_cipher_encrypt(m1)

print
print "Encrypted Message:", c1

print
print "Decrypted Message:", subs_cipher_decrypt(c1)
```

Original message: this is a test

Encrypted Message: VAYRYREVLRV

Decrypted Message: THISISATEST

```py
print "Original message:"
print m

print
c2 = subs_cipher_encrypt(m)
print "Encrypted Message:"
print c2

print
print "Decrypted Message:"
print subs_cipher_decrypt(c2)
```

Original message:
TobeornottobethatisthequestionWhethertisNoblerinthemindtosuffer
TheSlingsandArrowsofoutrageousFortuneOrtotakeArmsagainstaSeaof
troublesAndbyopposingendthem

Encrypted Message:
VHMLHOCHVVHMLVAEVYRVALXPLRVYHCUALVALOVYRCHMTLOYCVALWYCSVHRPZZLO
VALRTYCKRECSEOOHURHZHPVOEKLHPRZHOVPCLHOVHVEGLEOWREKEYCRVERLEHZ
VOHPMTLRECSMIHBBHRYCKLCSVALW

Decrypted Message:
TOBEORNOTTOBETHATISTHEQUESTIONWHETHERTISNOBLERINTHEMINDTOSUFFER
THESLINGSANDARROWSOFOUTRAGEOUSFORTUNEORTOTAKEARMSAGAINSTASEAOF
TROUBLESANDBYOPPOSINGENDTHEM

这是一个很好的加密方案吗？仍然没有。事实上，这些通常被用作报纸或拼图书中的谜题，因为给出了相当长的信息，使用诸如字母频率之类的东西很容易弄明白。

例如，在英语中，字母RSTLNEAO非常常见，并且比其他字母更常见。所以人们可能会开始猜测密文中最常见的字母就是其中之一。更有力的是，人们可能会试图看到哪些字母对（称为双字母）是常见的，并在密文中寻找那些字母，依此类推。

从这种思维过程来看，最终依赖于单个秘密字母表的加密方案（即使它不是我们的典型字母表）也会很快下降。那么......多字母密码怎么样？例如，如果每组5个字母使用不同的字母集，该怎么办？

这是一个很好的探索途径，有很多这样的加密方案我们不会在这个课程中讨论。但是关于密码学的课程（或关于密码学的书）肯定会涉及其中的一些。对于最终项目来说，这也可能是一种合理的探索途径。

# 德国的谜团

一种非常着名的多字母加密方案是在第二次世界大战之前和期间使用的德国谜。到目前为止，这是迄今为止使用最复杂的密码系统，并且它是如何被破坏的故事是漫长而棘手的。打破Enigma的初步成功来自于波兰数学家的工作，他们对德国人越过边境感到害怕（并且理所当然）。到1937年，他们已经建立了复制品，并了解了Enigma系统的许多细节。但是在1938年，德国人转向了一个更加安全和复杂的密码系统。在德国入侵波兰和第二次世界大战开始前几周，波兰数学家将他们的工作和笔记发送给法国和英国的数学家，他们开展了这项工作。

打破Enigma的第二个重大进展主要发生在英国布莱切利公园，这是一个致力于打破Enigma的通信中心。这是最近通过电影“模仿游戏”推广的阿兰·图灵的悲惨故事。这也是现代计算机的起源故事，因为Alan Turing开发了机电计算机以帮助打破Enigma。

Enigma通过使用一系列齿轮或转子来工作，其位置决定了替代密码。在每封信之后，通过机械过程改变了职位。
一台Enigma机器是一台非常令人印象深刻的机器而且“用于帮助打破它们的”计算机“也非常令人印象深刻。

下面，我实现了一个Enigma，默认设置为4个转子。我不希望人们理解实施。有趣的是输出消息看起来毫无意义。请注意，我保留了原始邮件的间距和标点符号，以便于比较。真的，你不会这样做。

用于演示的明文来自维基百科关于Enigma的文章。

```py
from random import shuffle,randint,choice  
from copy import copy  
num_alphabet = range(26)   
    
def en_shift(l, n):                         # Rotate cogs and arrays
    return l[n:] + l[:n]  
      
    
class Cog:                                  # Each cog has a substitution cipher  
    def __init__(self):  
        self.shuf = copy(num_alphabet)  
        shuffle(self.shuf)                  # Create the individual substition cipher
        return                              # Really, these were not random
    
    def subs_in(self,i):                    # Perform a substition
        return self.shuf[i] 
    
    def subs_out(self,i):                   # Perform a reverse substition
        return self.shuf.index(i)
    
    def rotate(self):                       # Rotate the cog by 1.
        self.shuf = en_shift(self.shuf, 1)
        
    def setcog(self,a):                     # Set up a particular substitution
        self.shuf = a  

        
class Enigma:  
    def __init__(self, numcogs,readability=True):  
        self.readability = readability  
        self.numcogs = numcogs  
        self.cogs = []  
        self.oCogs = []                     # "Original Cog positions"  
          
        for i in range(0,self.numcogs):     # Create the cogs
            self.cogs.append(Cog())
            self.oCogs.append(self.cogs[i].shuf)  
            
        refabet = copy(num_alphabet) 
        self.reflector = copy(num_alphabet)  
        while len(refabet) > 0:             # Pair letters in the reflector
            a = choice(refabet)  
            refabet.remove(a)  
            
            b = choice(refabet)  
            refabet.remove(b)  
            
            self.reflector[a] = b  
            self.reflector[b] = a
            
  
    def print_setup(self): # Print out substituion setup.
        print "Enigma Setup:\nCogs: ",self.numcogs,"\nCog arrangement:"  
        for i in range(0,self.numcogs):  
            print self.cogs[i].shuf  
        print "Reflector arrangement:\n",self.reflector,"\n"  
          
    def reset(self):  
        for i in range(0,self.numcogs):  
            self.cogs[i].setcog(self.oCogs[i])  
              
    def encode(self,text):  
        t = 0     # Ticker counter  
        ciphertext=""  
        for l in text.lower():  
            num = ord(l) % 97  
            # Handle special characters for readability
            if (num>25 or num<0):  
                if (self.readability):
                    ciphertext += l   
                else:  
                    pass  
            
            else:
                # Pass through cogs, reflect, then return through cogs
                t += 1  
                for i in range(self.numcogs): 
                    num = self.cogs[i].subs_in(num)  
                      
                num = self.reflector[num]  
                  
                for i in range(self.numcogs):  
                    num = self.cogs[self.numcogs-i-1].subs_out(num)  
                ciphertext += "" + chr(97+num)
                  
                # Rotate cogs
                for i in range(self.numcogs):
                    if ( t % ((i*6)+1) == 0 ):
                        self.cogs[i].rotate()  
        return ciphertext.upper()  
  
plaintext="""When placed in an Enigma, each rotor can be set to one of 26 possible positions. 
When inserted, it can be turned by hand using the grooved finger-wheel, which protrudes from 
the internal Enigma cover when closed. So that the operator can know the rotor's position, 
each had an alphabet tyre (or letter ring) attached to the outside of the rotor disk, with 
26 characters (typically letters); one of these could be seen through the window, thus indicating 
the rotational position of the rotor. In early models, the alphabet ring was fixed to the rotor 
disk. A later improvement was the ability to adjust the alphabet ring relative to the rotor disk. 
The position of the ring was known as the Ringstellung ("ring setting"), and was a part of the 
initial setting prior to an operating session. In modern terms it was a part of the 
initialization vector."""

# Remove newlines for encryption
pt = "".join([l.upper() for l in plaintext if not l == "\n"])
# pt = "".join([l.upper() for l in plaintext if not l in punct])
  
x=enigma(4)  
#x.print_setup()  
  
print "Original Message:"
print pt

print
ciphertext = x.encode(pt)  
print "Encrypted Message"
print ciphertext

print
# Decryption and encryption are symmetric, so to decode we reset and re-encrypt.
x.reset()  
decipheredtext = x.encode(ciphertext)  
print "Decrypted Message:"
print decipheredtext
```

原始信息：

WHEN PLACED IN AN ENIGMA, EACH ROTOR CAN BE SET TO ONE OF 26 POSSIBLE POSITIONS. 
WHEN INSERTED, IT CAN BE TURNED BY HAND USING THE GROOVED FINGER-WHEEL, WHICH 
PROTRUDES FROM THE INTERNAL ENIGMA COVER WHEN CLOSED. SO THAT THE OPERATOR CAN 
KNOW THE ROTOR'S POSITION, EACH HAD AN ALPHABET TYRE (OR LETTER RING) ATTACHED 
TO THE OUTSIDE OF THE ROTOR DISK, WITH 26 CHARACTERS (TYPICALLY LETTERS); ONE 
OF THESE COULD BE SEEN THROUGH THE WINDOW, THUS INDICATING THE ROTATIONAL 
POSITION OF THE ROTOR. IN EARLY MODELS, THE ALPHABET RING WAS FIXED TO THE 
ROTOR DISK. A LATER IMPROVEMENT WAS THE ABILITY TO ADJUST THE ALPHABET RING 
RELATIVE TO THE ROTOR DISK. THE POSITION OF THE RING WAS KNOWN AS THE 
RINGSTELLUNG ("RING SETTING"), AND WAS A PART OF THE INITIAL SETTING PRIOR TO 
AN OPERATING SESSION. IN MODERN TERMS IT WAS A PART OF THE INITIALIZATION VECTOR.

加密信息：

RYQY LWMVIH OH EK GGWFBO, PDZN FNALL ZEP AP IUD JM FEV UG 26 HGRKODYT XWOLIYTSA.
 TJQK KBCNVMHG, VS YBB XI BYZTVU XP BGWP IFNIY UQZ IQUPTKJ QXPVYE-EAOVT, PYMNN
 RXFIOWYVK LWNN OJL JXZBTRVP YMQCXX STJQF KXNZ LXSWDC. LK KGRH ZKT RDZUMCWA GKY
 LYKC LLV ZNFAD'Z BAXLDFTH, QSHA NBY RZ SXEXDAMP FXUS (WC RWHZOX ARWP) VKYNDJQP
 WL OLW ICBALPI RV ISD GXSDQ ZKMJ, OHNN 26 IBGUHNYIQE (GDBNTEBWP QGECUNA); QPG
 SQ JYUQX NDBWB NM AAUF RUNKYDL OLD LMPZQV, ZMKP SQZFDEHKCI KLJ AKPZLRAZZX 
QXPJEXLV HS AFG IIMGK. NT PVAYP RFOKYV, XUY CHZAQEXG DUSS CKN YENSR FX PLS CYMZK
 YHTB. J RLZLB DNIDWNWAIOO HOK PGM HVXXHIJ VV SCTNIC QGM TFKPQYPQ XFQU PSAECHTX
 RA QUW CUNRV JCUW. LCP GFKZLLXW LN YWF OAQM CMF YVTQH EI JAU LZTXEYDGDFLQ 
("CDBS TQHUEIR"), BLN QIG O UHJJ DV DQY KQGVFKI EBEFRCT WEZWG LJ WC NIAUKIYQJ
 EHZLZLS. TY XPZSBL IPGWN ZS IUY E YQMD BW NVF QYWSDMTRSNSHYO GJGNUL.

解密信息：

WHEN PLACED IN AN ENIGMA, EACH ROTOR CAN BE SET TO ONE OF 26 POSSIBLE POSITIONS.
 WHEN INSERTED, IT CAN BE TURNED BY HAND USING THE GROOVED FINGER-WHEEL, WHICH
 PROTRUDES FROM THE INTERNAL ENIGMA COVER WHEN CLOSED. SO THAT THE OPERATOR 
CAN KNOW THE ROTOR'S POSITION, EACH HAD AN ALPHABET TYRE (OR LETTER RING)
 ATTACHED TO THE OUTSIDE OF THE ROTOR DISK, WITH 26 CHARACTERS (TYPICALLY 
LETTERS); ONE OF THESE COULD BE SEEN THROUGH THE WINDOW, THUS INDICATING THE
 ROTATIONAL POSITION OF THE ROTOR. IN EARLY MODELS, THE ALPHABET RING WAS FIXED
 TO THE ROTOR DISK. A LATER IMPROVEMENT WAS THE ABILITY TO ADJUST THE ALPHABET
 RING RELATIVE TO THE ROTOR DISK. THE POSITION OF THE RING WAS KNOWN AS THE 
RINGSTELLUNG ("RING SETTING"), AND WAS A PART OF THE INITIAL SETTING PRIOR TO 
AN OPERATING SESSION. IN MODERN TERMS IT WAS A PART OF THE INITIALIZATION VECTOR.

计算机的出现带来了密码学方法的范式转变。在计算机之前，维护安全性的方法之一是提出隐藏密钥和隐藏密码系统，并且仅仅通过不让任何人知道它实际上如何工作的任何事情来保持安全。这通过默默无闻具有短暂的可爱名称安全性。由于计算机对密码系统的攻击类型数量要多得多，因此需要一种不同的安全性和安全性模型。

值得注意的是，通过默默无闻的安全性总是很糟糕并不明显，只要它真的非常隐蔽。这与有关当前事件和密码学的一些问题有关。

# 公钥加密

新型号的设置略有不同。我们应该想到安娜贝尔和巴托洛坐在教室的两侧，尽管教室中间有很多人可能正在聆听，但他们还是试图安全地沟通。

特别是，安娜贝尔有一些她想要告诉巴托洛的事情。

Bartolo不是保密密码系统，而是告诉每个人（在我们的比喻中，他对整个教室大喊大叫）公钥K，并解释如何使用它向他发送信息。 Anabel使用此密钥加密她的消息。然后她将此消息发送给Bartolo。

如果系统设计良好，即使他们都知道密码系统是如何工作的，也没有人能够理解密文。这就是系统被称为公钥的原因。

Bartolo收到这条消息并且（只使用他知道的东西）他解密了这条消息。

我们将在这里学习一个这样的密码系统：RSA，以Rivest，Shamir和Addleman命名 - 第一个主要的公钥密码系统。

## RSA

Bartolo取两个素数，如p = 12553和q = 13007。他注意到了他们的产品

m=pq=163276871

并计算 φ(m),

φ(m)=(p−1)(q−1)=163251312.

最后，他选择了一些相对于φ（m）的整数k，就像说的那样
K = 79921。

然后他分发的公钥是
（M，K）=（163276871,79921）。
为了使用此密钥向Bartolo发送消息，Anabel必须将其消息转换为数字。她可能会使用标识A = 11，B = 12，C = 13，......并连接她的数字。例如，要发送单词CAB，她会发送131112.假设Anabel想要发送消息

数字理论是科学的女王

然后她需要将其转换为数字。

```py
conversion_dict = dict()
alpha = "abcdefghijklmnopqrstuvwxyz".upper()
curnum = 11
for l in alpha:
    conversion_dict[l] = curnum
    curnum += 1
print "Original Message:"
msg = "NUMBERTHEORYISTHEQUEENOFTHESCIENCES"
print msg
print

def letters_to_numbers(m):
    return "".join([str(conversion_dict[l]) for l in m.upper()])

print "Numerical Message:"
msg_num = letters_to_numbers(msg)
print msg_num
```

原始信息:

NUMBERTHEORYISTHEQUEENOFTHESCIENCES

数字信息:

2431231215283018152528351929301815273115152425163018152913191524131529

她想要加密并发送给Bartolo。为了使其易于管理，她将消息剪切成8位数字，

24312312,15283018,15252835,19293018,15273115,15242516,30181529,13191524,131529。
为了发送她的信息，她取出一个8位数的块并将其提升到k模数m的幂。也就是说，为了传输第一个块，她计算

24312312^79921≡13851252(mod 163276871).

```py
# Secret information
p = 12553
q = 13007
phi = (p-1)*(q-1) # varphi(pq)

# Public information
m = p*q # 163276871
k = 79921

print pow(24312312, k, m)
```

13851252

她发了这个号码
13851252

到Bartolo（也许是通过喊叫。即使每个人都能听到，他们也无法解密）。 Bartolo如何解密这条消息？

他计算φ（m）=（p-1）（q-1）（他可以做，因为他分别知道p和q），然后找到一个解决方案

uk=1+φ(m)v.

这可以通过欧几里德算法快速完成。

```py
def extended_euclidean(a,b):
    if b == 0:
        return (1,0,a)
    else :
        x, y, gcd = extended_euclidean(b, a % b) # Aside: Python has no tail recursion
        return y, x - y * (a // b),gcd           # But it does have meaningful stack traces
    
# This version comes from Exercise 6.3 in the book, but without recursion
def extended_euclidean2(a,b):
    x = 1
    g = a
    v = 0
    w = b
    while w != 0:
        q = g // w
        t = g - q*w
        s = x - q*v
        x,g = v,w
        v,w = s,t
    y = (g - a*x) / b
    return (x,y,g)
 
def modular_inverse(a,m) :
    x,y,gcd = extended_euclidean(a,m)
    if gcd == 1 :
        return x % m
    else :
        return None
print "k, p, q:", k, p, q
print
u = modular_inverse(k,(p-1)*(q-1))
print u
```

k, p, q: 79921 12553 13007

145604785

特别是，Bartolo计算他的u = 145604785。为了收回这条消息，他拿出了Anabel发给他的号码13851252并将其提升到你的权力。他计算
13851252^u = ≡24312312(mod pq)，

我们可以看到必须是真实的

13851252^u≡（24312312^k)^u≡24312312^(1+φ（PQ）v)≡24312312（mod pq）。

在最后一步中，我们使用欧拉定理来看

24312312^(φ（PQ）v)≡1（mod pq）。

```py
# Checking this power explicitly.
print pow(13851252, 145604785, m)
```

24312312

现在，Bartolo需要为Anabel发送的每个8位数块执行此过程。请注意，工作非常简单，因为他只计算整数u一次。每隔一次，他只需为每个密文c计算cu（modm），这对于重复平方来说非常快。

我们将在下面以自动方式逐步完成此操作。

首先，我们将消息拆分为8位数块。

```py
# Break into chunks of 8 digits in length.
def chunk8(message_number):
    cp = str(message_number)
    ret_list = []
    while len(cp) > 7:
        ret_list.append(cp[:8])
        cp = cp[8:]
    if cp:
        ret_list.append(cp)
    return ret_list

msg_list = chunk8(msg_num)
print msg_list
```

结果：

```
['24312312', '15283018', '15252835', '19293018', '15273115', 
'15242516', '30181529', '13191524', '131529']
```


这是Anabel想要发送Bartolo的消息的数字表示。所以她加密每个块。这在下面完成

```py
# Compute ciphertexts separately on each 8-digit chunk.
def encrypt_chunks(chunked_list):
    ret_list = []
    for chunk in chunked_list:
        #print chunk
        #print int(chunk)
        ret_list.append(pow(int(chunk), k, m))
    return ret_list

cipher_list = encrypt_chunks(msg_list)
print cipher_list
```

输出结果：

```
[13851252, 14944940, 158577269, 117640431, 139757098, 25099917, 
88562046, 6640362, 10543199]
```


这是加密的消息。计算完之后，Anabel将此消息发送给Bartolo。

为了解密这个消息，Bartolo使用了他的知识，这来自于他计算φ（pq）的能力，并解密了消息的每个部分。这看起来如下。

```py
# Decipher the ciphertexts all in the same way
def decrypt_chunks(chunked_list):
    ret_list = []
    for chunk in chunked_list:
        ret_list.append(pow(int(chunk), u, m))
    return ret_list

decipher_list = decrypt_chunks(cipher_list)
print decipher_list
```

输出结果：

```py
[24312312, 15283018, 15252835, 19293018, 15273115, 15242516, 
30181529, 13191524, 131529]
```

最后，Bartolo将这些数字连接在一起并将它们翻译成字母。他会得到正确的信息吗？

```py
alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

# Collect deciphered texts into a single list, and translate back into letters.
def chunks_to_letters(chunked_list):
    s = "".join([str(chunk) for chunk in chunked_list])
    ret_str = ""
    while s:
        ret_str += alpha[int(s[:2])-11].upper()
        s = s[2:]
    return ret_str

print chunks_to_letters(decipher_list)
```

结果：

```
NUMBERTHEORYISTHEQUEENOFTHESCIENCES
```

是! Bartolo成功解密了这条消息，并认为Anabel认为数论是科学的女王。这是高斯的一句话，高斯是着名的数学家，他在这门课程中一次又一次地出现。

## 为什么这种算范是安全的

让我们停下来想想为什么这是安全的。

如果有人在途中收到邮件怎么办？假设夏娃正在窃听并听到Anabel的第一个大块，13851252。她怎么解密呢？

夏娃知道她想要解决

x^k≡13851252(mod pq)
 
或者是

x^79921≡13851252(mod 163276871).

她怎么能这样做？我们可以这样做，因为我们知道根据φ（163276871）将其提高到特定的功率。但是Eve不知道φ（163276871）是什么，因为她不能因子163276871.事实上，知道φ（163276871）和163276871因子一样难。

但是如果夏娃能够以某种方式找到79921根，模数为163276871，或者如果夏娃可以考虑​​163276871，那么她将能够解密该消息。这些都是非常难的问题！正是这些问题使该方法具有安全性。

更一般地，可以使用素数p和q，每个素数长约200个数字，并且相当大的k。然后得到的m将是大约400个数字，这比我们知道如何有效地分解要大得多。选择稍大k的原因是出于安全原因，超出了该段的范围。这里的相关想法是，由于这是一个公知的加密方案，许多人多年来通过使其更加安全地抵御已知的每一个聪明的攻击而加强了它。这是公钥加密的另一个有时被忽视的好处：因为这种方法并不是秘密，所以每个人都可以为其安全做出贡献 - 事实上，任何希望获得这种安全性的人都有兴趣。这与通过晦涩的安全完全相反。

代码的开放性，公开性，私密性或秘密性在当前事件中也是非常热门的。最近，大众汽车在其汽车排放软件中作弊，并报告了虚假产出，导致了大量丑闻。他们的软件是专有和秘密的，多年来人们都没有注意到故意的错误。一些人认为，这意味着更多的软件，尤其是服务于公众或具有强大管辖权的软件，应该可以公开查看以供分析。

另一个相关的当前案例是，美国大多数投票机的代码都是专有和秘密的。希望他们不是作弊！

另一方面，许多人说，公司必须至少在一段时间内拥有秘密软件才能恢复开发软件所需的费用。这类似于制药公司多年来拥有新药专利的方式。这样，一种新的成功药物为其发展付出了代价，因为该公司可以收取高于其他市场价格的费用。

此外，许多人说打开一些代码会打开恶意用户的攻击，否则他们将无法看到代码。当然，这听起来很像是通过默默无闻来寻求安全。

这是一个非常相关且重要的话题，未来几年的形态可能会产生长期影响。

# 参考资料

[A Brief Notebook on Cryptography](http://davidlowryduda.com/a-brief-notebook-on-cryptography/)

* any list
{:toc}